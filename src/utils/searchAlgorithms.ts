import { PuzzleState, HeuristicType } from '../types';
import {
  calculateHeuristic,
  getPossibleMoves,
  stateToString,
  checkSolvability,
  DEFAULT_GOAL_STATE
} from './puzzleEngine';

export interface AlgorithmBenchmarkResult {
  id: 'BFS' | 'DFS' | 'DLS' | 'IDDLS' | 'GBFS' | 'ASTAR';
  name: string;
  shortName: string;
  type: 'Uninformed' | 'Informed';
  evaluationFunction: string;
  heuristicUsed?: string;
  isImplemented: boolean;
  solutionFound: boolean;
  nodesExpanded: number;
  nodesGenerated: number;
  moves: number | null;
  maxDepthReached: number;
  executionTimeMs: number;
  approxMemoryStr: string;
  approxMemoryBytes: number;
  isAssigned: boolean;
  statusNote: string;
}

interface InternalSearchNode {
  state: PuzzleState;
  parent: InternalSearchNode | null;
  depth: number;
  g: number;
  h: number;
  f: number;
}

function calculateMemoryBytes(nodesGenerated: number, exploredCount: number): { bytes: number; formatted: string } {
  const bytes = (nodesGenerated * 280) + (exploredCount * 80);
  const formatted = bytes > 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    : `${(bytes / 1024).toFixed(2)} KB`;
  return { bytes, formatted };
}

/**
 * 1. Breadth-First Search (BFS)
 * Uninformed Graph Search: FIFO Queue
 */
export function runBFS(
  initialState: PuzzleState,
  goalState: PuzzleState = DEFAULT_GOAL_STATE,
  maxNodes: number = 25000
): AlgorithmBenchmarkResult {
  const startTime = performance.now();
  const goalStr = stateToString(goalState);
  const initStr = stateToString(initialState);

  if (initStr === goalStr) {
    const execTime = Math.max(0.01, performance.now() - startTime);
    const mem = calculateMemoryBytes(1, 1);
    return {
      id: 'BFS',
      name: 'Breadth-First Search',
      shortName: 'BFS',
      type: 'Uninformed',
      evaluationFunction: 'f(n) = Depth Level (FIFO)',
      isImplemented: true,
      solutionFound: true,
      nodesExpanded: 1,
      nodesGenerated: 1,
      moves: 0,
      maxDepthReached: 0,
      executionTimeMs: execTime,
      approxMemoryStr: mem.formatted,
      approxMemoryBytes: mem.bytes,
      isAssigned: false,
      statusNote: 'Initial state matches goal state.'
    };
  }

  const queue: InternalSearchNode[] = [
    { state: initialState, parent: null, depth: 0, g: 0, h: 0, f: 0 }
  ];
  const visited = new Set<string>([initStr]);
  let nodesExpanded = 0;
  let nodesGenerated = 1;
  let maxDepthReached = 0;
  let solutionNode: InternalSearchNode | null = null;

  while (queue.length > 0 && nodesExpanded < maxNodes) {
    const current = queue.shift()!;
    nodesExpanded++;
    maxDepthReached = Math.max(maxDepthReached, current.depth);

    const moves = getPossibleMoves(current.state);
    for (const move of moves) {
      const neighborKey = stateToString(move.nextState);
      if (!visited.has(neighborKey)) {
        nodesGenerated++;
        visited.add(neighborKey);

        const childNode: InternalSearchNode = {
          state: move.nextState,
          parent: current,
          depth: current.depth + 1,
          g: current.depth + 1,
          h: 0,
          f: current.depth + 1
        };

        maxDepthReached = Math.max(maxDepthReached, childNode.depth);

        if (neighborKey === goalStr) {
          solutionNode = childNode;
          break;
        }

        queue.push(childNode);
      }
    }

    if (solutionNode) break;
  }

  const endTime = performance.now();
  const execTime = Math.max(0.01, Math.round((endTime - startTime) * 100) / 100);
  const mem = calculateMemoryBytes(nodesGenerated, nodesExpanded);

  return {
    id: 'BFS',
    name: 'Breadth-First Search',
    shortName: 'BFS',
    type: 'Uninformed',
    evaluationFunction: 'f(n) = Depth Level (FIFO)',
    isImplemented: true,
    solutionFound: solutionNode !== null,
    nodesExpanded,
    nodesGenerated,
    moves: solutionNode ? solutionNode.depth : null,
    maxDepthReached,
    executionTimeMs: execTime,
    approxMemoryStr: mem.formatted,
    approxMemoryBytes: mem.bytes,
    isAssigned: false,
    statusNote: solutionNode
      ? 'Optimal shortest path found.'
      : nodesExpanded >= maxNodes
      ? 'Node expansion threshold reached.'
      : 'Frontier exhausted.'
  };
}

/**
 * 2. Depth-First Search (DFS)
 * Uninformed Graph Search: LIFO Stack with depth bound
 */
export function runDFS(
  initialState: PuzzleState,
  goalState: PuzzleState = DEFAULT_GOAL_STATE,
  maxDepthLimit: number = 30,
  maxNodes: number = 30000
): AlgorithmBenchmarkResult {
  const startTime = performance.now();
  const goalStr = stateToString(goalState);
  const initStr = stateToString(initialState);

  if (initStr === goalStr) {
    const execTime = Math.max(0.01, performance.now() - startTime);
    const mem = calculateMemoryBytes(1, 1);
    return {
      id: 'DFS',
      name: 'Depth-First Search',
      shortName: 'DFS',
      type: 'Uninformed',
      evaluationFunction: 'f(n) = Deepest Branch (LIFO)',
      isImplemented: true,
      solutionFound: true,
      nodesExpanded: 1,
      nodesGenerated: 1,
      moves: 0,
      maxDepthReached: 0,
      executionTimeMs: execTime,
      approxMemoryStr: mem.formatted,
      approxMemoryBytes: mem.bytes,
      isAssigned: false,
      statusNote: 'Initial state matches goal state.'
    };
  }

  const stack: InternalSearchNode[] = [
    { state: initialState, parent: null, depth: 0, g: 0, h: 0, f: 0 }
  ];
  const visitedOnPath = new Map<string, number>();
  visitedOnPath.set(initStr, 0);

  let nodesExpanded = 0;
  let nodesGenerated = 1;
  let maxDepthReached = 0;
  let solutionNode: InternalSearchNode | null = null;

  while (stack.length > 0 && nodesExpanded < maxNodes) {
    const current = stack.pop()!;
    const currStr = stateToString(current.state);

    if (currStr === goalStr) {
      solutionNode = current;
      break;
    }

    nodesExpanded++;
    maxDepthReached = Math.max(maxDepthReached, current.depth);

    if (current.depth < maxDepthLimit) {
      const moves = getPossibleMoves(current.state);
      for (const move of moves) {
        const neighborKey = stateToString(move.nextState);
        const prevDepth = visitedOnPath.get(neighborKey);

        if (prevDepth === undefined || current.depth + 1 < prevDepth) {
          visitedOnPath.set(neighborKey, current.depth + 1);
          nodesGenerated++;

          const childNode: InternalSearchNode = {
            state: move.nextState,
            parent: current,
            depth: current.depth + 1,
            g: current.depth + 1,
            h: 0,
            f: current.depth + 1
          };

          stack.push(childNode);
        }
      }
    }
  }

  const endTime = performance.now();
  const execTime = Math.max(0.01, Math.round((endTime - startTime) * 100) / 100);
  const mem = calculateMemoryBytes(nodesGenerated, nodesExpanded);

  return {
    id: 'DFS',
    name: 'Depth-First Search',
    shortName: 'DFS',
    type: 'Uninformed',
    evaluationFunction: 'f(n) = Deepest Branch (LIFO)',
    isImplemented: true,
    solutionFound: solutionNode !== null,
    nodesExpanded,
    nodesGenerated,
    moves: solutionNode ? solutionNode.depth : null,
    maxDepthReached,
    executionTimeMs: execTime,
    approxMemoryStr: mem.formatted,
    approxMemoryBytes: mem.bytes,
    isAssigned: false,
    statusNote: solutionNode
      ? 'Path found (non-optimal, DFS explores deep paths).'
      : `Depth cutoff ${maxDepthLimit} or max node limit reached.`
  };
}

/**
 * 3. Depth-Limited Search (DLS)
 * Uninformed Search: DFS bounded by strict depth limit L
 */
export function runDLS(
  initialState: PuzzleState,
  goalState: PuzzleState = DEFAULT_GOAL_STATE,
  depthLimit: number = 10,
  maxNodes: number = 20000
): AlgorithmBenchmarkResult {
  const startTime = performance.now();
  const goalStr = stateToString(goalState);
  const initStr = stateToString(initialState);

  if (initStr === goalStr) {
    const execTime = Math.max(0.01, performance.now() - startTime);
    const mem = calculateMemoryBytes(1, 1);
    return {
      id: 'DLS',
      name: `Depth-Limited Search (Limit: ${depthLimit})`,
      shortName: 'DLS',
      type: 'Uninformed',
      evaluationFunction: `f(n) = LIFO (Cutoff L=${depthLimit})`,
      isImplemented: true,
      solutionFound: true,
      nodesExpanded: 1,
      nodesGenerated: 1,
      moves: 0,
      maxDepthReached: 0,
      executionTimeMs: execTime,
      approxMemoryStr: mem.formatted,
      approxMemoryBytes: mem.bytes,
      isAssigned: false,
      statusNote: 'Initial state matches goal state.'
    };
  }

  const stack: InternalSearchNode[] = [
    { state: initialState, parent: null, depth: 0, g: 0, h: 0, f: 0 }
  ];
  const visitedDepth = new Map<string, number>();
  visitedDepth.set(initStr, 0);

  let nodesExpanded = 0;
  let nodesGenerated = 1;
  let maxDepthReached = 0;
  let solutionNode: InternalSearchNode | null = null;

  while (stack.length > 0 && nodesExpanded < maxNodes) {
    const current = stack.pop()!;
    const currStr = stateToString(current.state);

    if (currStr === goalStr) {
      solutionNode = current;
      break;
    }

    nodesExpanded++;
    maxDepthReached = Math.max(maxDepthReached, current.depth);

    if (current.depth < depthLimit) {
      const moves = getPossibleMoves(current.state);
      for (const move of moves) {
        const neighborKey = stateToString(move.nextState);
        const recordedDepth = visitedDepth.get(neighborKey);

        if (recordedDepth === undefined || current.depth + 1 < recordedDepth) {
          visitedDepth.set(neighborKey, current.depth + 1);
          nodesGenerated++;

          const childNode: InternalSearchNode = {
            state: move.nextState,
            parent: current,
            depth: current.depth + 1,
            g: current.depth + 1,
            h: 0,
            f: current.depth + 1
          };

          stack.push(childNode);
        }
      }
    }
  }

  const endTime = performance.now();
  const execTime = Math.max(0.01, Math.round((endTime - startTime) * 100) / 100);
  const mem = calculateMemoryBytes(nodesGenerated, nodesExpanded);

  return {
    id: 'DLS',
    name: `Depth-Limited Search (L=${depthLimit})`,
    shortName: 'DLS',
    type: 'Uninformed',
    evaluationFunction: `f(n) = LIFO (Cutoff L=${depthLimit})`,
    isImplemented: true,
    solutionFound: solutionNode !== null,
    nodesExpanded,
    nodesGenerated,
    moves: solutionNode ? solutionNode.depth : null,
    maxDepthReached,
    executionTimeMs: execTime,
    approxMemoryStr: mem.formatted,
    approxMemoryBytes: mem.bytes,
    isAssigned: false,
    statusNote: solutionNode
      ? `Goal found within depth limit ${depthLimit}.`
      : `No solution within depth limit L=${depthLimit}.`
  };
}

/**
 * 4. Iterative Deepening Depth-Limited Search (IDDLS)
 * Uninformed Search: Successive DLS with depth limits 0, 1, 2, ...
 */
export function runIDDLS(
  initialState: PuzzleState,
  goalState: PuzzleState = DEFAULT_GOAL_STATE,
  maxAllowedDepth: number = 18
): AlgorithmBenchmarkResult {
  const startTime = performance.now();
  const goalStr = stateToString(goalState);
  const initStr = stateToString(initialState);

  if (initStr === goalStr) {
    const execTime = Math.max(0.01, performance.now() - startTime);
    const mem = calculateMemoryBytes(1, 1);
    return {
      id: 'IDDLS',
      name: 'Iterative Deepening Search',
      shortName: 'IDDLS',
      type: 'Uninformed',
      evaluationFunction: 'f(n) = Iterative Depth L=0,1,2...',
      isImplemented: true,
      solutionFound: true,
      nodesExpanded: 1,
      nodesGenerated: 1,
      moves: 0,
      maxDepthReached: 0,
      executionTimeMs: execTime,
      approxMemoryStr: mem.formatted,
      approxMemoryBytes: mem.bytes,
      isAssigned: false,
      statusNote: 'Initial state matches goal state.'
    };
  }

  let totalNodesExpanded = 0;
  let totalNodesGenerated = 1;
  let globalMaxDepth = 0;
  let solutionNode: InternalSearchNode | null = null;

  for (let limit = 0; limit <= maxAllowedDepth; limit++) {
    const stack: InternalSearchNode[] = [
      { state: initialState, parent: null, depth: 0, g: 0, h: 0, f: 0 }
    ];
    const visited = new Map<string, number>();
    visited.set(initStr, 0);

    while (stack.length > 0) {
      const current = stack.pop()!;
      const currStr = stateToString(current.state);

      if (currStr === goalStr) {
        solutionNode = current;
        break;
      }

      totalNodesExpanded++;
      globalMaxDepth = Math.max(globalMaxDepth, current.depth);

      if (current.depth < limit) {
        const moves = getPossibleMoves(current.state);
        for (const move of moves) {
          const neighborKey = stateToString(move.nextState);
          const recordedDepth = visited.get(neighborKey);

          if (recordedDepth === undefined || current.depth + 1 < recordedDepth) {
            visited.set(neighborKey, current.depth + 1);
            totalNodesGenerated++;

            const childNode: InternalSearchNode = {
              state: move.nextState,
              parent: current,
              depth: current.depth + 1,
              g: current.depth + 1,
              h: 0,
              f: current.depth + 1
            };

            stack.push(childNode);
          }
        }
      }
    }

    if (solutionNode) break;
  }

  const endTime = performance.now();
  const execTime = Math.max(0.01, Math.round((endTime - startTime) * 100) / 100);
  const mem = calculateMemoryBytes(totalNodesGenerated, totalNodesExpanded);

  return {
    id: 'IDDLS',
    name: 'Iterative Deepening Search',
    shortName: 'IDDLS',
    type: 'Uninformed',
    evaluationFunction: 'f(n) = Iterative Depth L=0,1,2...',
    isImplemented: true,
    solutionFound: solutionNode !== null,
    nodesExpanded: totalNodesExpanded,
    nodesGenerated: totalNodesGenerated,
    moves: solutionNode ? solutionNode.depth : null,
    maxDepthReached: globalMaxDepth,
    executionTimeMs: execTime,
    approxMemoryStr: mem.formatted,
    approxMemoryBytes: mem.bytes,
    isAssigned: false,
    statusNote: solutionNode
      ? 'Optimal shortest path found via iterative deepening.'
      : `Max depth ceiling ${maxAllowedDepth} reached without finding goal.`
  };
}

/**
 * 5. Greedy Best-First Search (GBFS)
 * Informed Search: f(n) = h(n)
 */
export function runGBFS(
  initialState: PuzzleState,
  goalState: PuzzleState = DEFAULT_GOAL_STATE,
  heuristicType: HeuristicType = 'MANHATTAN',
  maxNodes: number = 20000
): AlgorithmBenchmarkResult {
  const startTime = performance.now();
  const goalStr = stateToString(goalState);
  const initStr = stateToString(initialState);
  const heuristicName = heuristicType === 'MANHATTAN' ? 'Manhattan Distance' : 'Misplaced Tiles';

  if (initStr === goalStr) {
    const execTime = Math.max(0.01, performance.now() - startTime);
    const mem = calculateMemoryBytes(1, 1);
    return {
      id: 'GBFS',
      name: 'Greedy Best-First Search',
      shortName: 'GBFS',
      type: 'Informed',
      evaluationFunction: 'f(n) = h(n)',
      heuristicUsed: heuristicName,
      isImplemented: true,
      solutionFound: true,
      nodesExpanded: 1,
      nodesGenerated: 1,
      moves: 0,
      maxDepthReached: 0,
      executionTimeMs: execTime,
      approxMemoryStr: mem.formatted,
      approxMemoryBytes: mem.bytes,
      isAssigned: true,
      statusNote: 'Initial state matches goal state.'
    };
  }

  const initialH = calculateHeuristic(initialState, goalState, heuristicType);
  const frontier: InternalSearchNode[] = [
    { state: initialState, parent: null, depth: 0, g: 0, h: initialH, f: initialH }
  ];
  const closedSet = new Set<string>();
  const openSet = new Set<string>([initStr]);

  let nodesExpanded = 0;
  let nodesGenerated = 1;
  let maxDepthReached = 0;
  let solutionNode: InternalSearchNode | null = null;

  while (frontier.length > 0 && nodesExpanded < maxNodes) {
    frontier.sort((a, b) => (a.f !== b.f ? a.f - b.f : a.h !== b.h ? a.h - b.h : b.depth - a.depth));
    const current = frontier.shift()!;
    const currStr = stateToString(current.state);
    openSet.delete(currStr);

    if (currStr === goalStr) {
      solutionNode = current;
      break;
    }

    closedSet.add(currStr);
    nodesExpanded++;
    maxDepthReached = Math.max(maxDepthReached, current.depth);

    const moves = getPossibleMoves(current.state);
    for (const move of moves) {
      const neighborKey = stateToString(move.nextState);
      if (closedSet.has(neighborKey)) continue;

      const neighborH = calculateHeuristic(move.nextState, goalState, heuristicType);
      const neighborNode: InternalSearchNode = {
        state: move.nextState,
        parent: current,
        depth: current.depth + 1,
        g: current.depth + 1,
        h: neighborH,
        f: neighborH
      };

      if (!openSet.has(neighborKey)) {
        nodesGenerated++;
        openSet.add(neighborKey);
        frontier.push(neighborNode);
        maxDepthReached = Math.max(maxDepthReached, neighborNode.depth);
      }
    }
  }

  const endTime = performance.now();
  const execTime = Math.max(0.01, Math.round((endTime - startTime) * 100) / 100);
  const mem = calculateMemoryBytes(nodesGenerated, nodesExpanded);

  return {
    id: 'GBFS',
    name: 'Greedy Best-First Search',
    shortName: 'GBFS',
    type: 'Informed',
    evaluationFunction: 'f(n) = h(n)',
    heuristicUsed: heuristicName,
    isImplemented: true,
    solutionFound: solutionNode !== null,
    nodesExpanded,
    nodesGenerated,
    moves: solutionNode ? solutionNode.depth : null,
    maxDepthReached,
    executionTimeMs: execTime,
    approxMemoryStr: mem.formatted,
    approxMemoryBytes: mem.bytes,
    isAssigned: true,
    statusNote: solutionNode
      ? 'Goal found rapidly via pure heuristic guidance.'
      : 'Frontier exhausted without finding goal.'
  };
}

/**
 * 6. A* Search (ASTAR)
 * Informed Search: f(n) = g(n) + h(n)
 */
export function runAStar(
  initialState: PuzzleState,
  goalState: PuzzleState = DEFAULT_GOAL_STATE,
  heuristicType: HeuristicType = 'MANHATTAN',
  maxNodes: number = 20000
): AlgorithmBenchmarkResult {
  const startTime = performance.now();
  const goalStr = stateToString(goalState);
  const initStr = stateToString(initialState);
  const heuristicName = heuristicType === 'MANHATTAN' ? 'Manhattan Distance' : 'Misplaced Tiles';

  if (initStr === goalStr) {
    const execTime = Math.max(0.01, performance.now() - startTime);
    const mem = calculateMemoryBytes(1, 1);
    return {
      id: 'ASTAR',
      name: 'A* Search',
      shortName: 'A*',
      type: 'Informed',
      evaluationFunction: 'f(n) = g(n) + h(n)',
      heuristicUsed: heuristicName,
      isImplemented: true,
      solutionFound: true,
      nodesExpanded: 1,
      nodesGenerated: 1,
      moves: 0,
      maxDepthReached: 0,
      executionTimeMs: execTime,
      approxMemoryStr: mem.formatted,
      approxMemoryBytes: mem.bytes,
      isAssigned: false,
      statusNote: 'Initial state matches goal state.'
    };
  }

  const initialH = calculateHeuristic(initialState, goalState, heuristicType);
  const frontier: InternalSearchNode[] = [
    { state: initialState, parent: null, depth: 0, g: 0, h: initialH, f: 0 + initialH }
  ];
  const closedSet = new Set<string>();
  const gScores = new Map<string, number>();
  gScores.set(initStr, 0);

  let nodesExpanded = 0;
  let nodesGenerated = 1;
  let maxDepthReached = 0;
  let solutionNode: InternalSearchNode | null = null;

  while (frontier.length > 0 && nodesExpanded < maxNodes) {
    frontier.sort((a, b) => (a.f !== b.f ? a.f - b.f : a.h !== b.h ? a.h - b.h : b.depth - a.depth));
    const current = frontier.shift()!;
    const currStr = stateToString(current.state);

    if (currStr === goalStr) {
      solutionNode = current;
      break;
    }

    closedSet.add(currStr);
    nodesExpanded++;
    maxDepthReached = Math.max(maxDepthReached, current.depth);

    const moves = getPossibleMoves(current.state);
    for (const move of moves) {
      const neighborKey = stateToString(move.nextState);
      if (closedSet.has(neighborKey)) continue;

      const tentativeG = current.g + 1;
      const recordedG = gScores.get(neighborKey);

      if (recordedG === undefined || tentativeG < recordedG) {
        gScores.set(neighborKey, tentativeG);
        nodesGenerated++;

        const neighborH = calculateHeuristic(move.nextState, goalState, heuristicType);
        const neighborNode: InternalSearchNode = {
          state: move.nextState,
          parent: current,
          depth: current.depth + 1,
          g: tentativeG,
          h: neighborH,
          f: tentativeG + neighborH
        };

        frontier.push(neighborNode);
        maxDepthReached = Math.max(maxDepthReached, neighborNode.depth);
      }
    }
  }

  const endTime = performance.now();
  const execTime = Math.max(0.01, Math.round((endTime - startTime) * 100) / 100);
  const mem = calculateMemoryBytes(nodesGenerated, nodesExpanded);

  return {
    id: 'ASTAR',
    name: 'A* Search',
    shortName: 'A*',
    type: 'Informed',
    evaluationFunction: 'f(n) = g(n) + h(n)',
    heuristicUsed: heuristicName,
    isImplemented: true,
    solutionFound: solutionNode !== null,
    nodesExpanded,
    nodesGenerated,
    moves: solutionNode ? solutionNode.depth : null,
    maxDepthReached,
    executionTimeMs: execTime,
    approxMemoryStr: mem.formatted,
    approxMemoryBytes: mem.bytes,
    isAssigned: false,
    statusNote: solutionNode
      ? 'Admissible optimal path guaranteed.'
      : 'Frontier exhausted without finding goal.'
  };
}

/**
 * Runs the full 6-algorithm benchmark comparison suite on the exact same puzzle instance.
 */
export function runAllAlgorithmsComparison(
  initialState: PuzzleState,
  goalState: PuzzleState = DEFAULT_GOAL_STATE,
  heuristicType: HeuristicType = 'MANHATTAN',
  dlsDepthLimit: number = 10
): AlgorithmBenchmarkResult[] {
  const solvability = checkSolvability(initialState, goalState);

  // If mathematically unsolvable, return failed results for all immediately
  if (!solvability.isSolvable) {
    const algorithms: AlgorithmBenchmarkResult[] = [
      {
        id: 'BFS',
        name: 'Breadth-First Search',
        shortName: 'BFS',
        type: 'Uninformed',
        evaluationFunction: 'f(n) = Depth Level (FIFO)',
        isImplemented: true,
        solutionFound: false,
        nodesExpanded: 0,
        nodesGenerated: 0,
        moves: null,
        maxDepthReached: 0,
        executionTimeMs: 0,
        approxMemoryStr: '0 KB',
        approxMemoryBytes: 0,
        isAssigned: false,
        statusNote: `Unsolvable: ${solvability.reason}`
      },
      {
        id: 'DFS',
        name: 'Depth-First Search',
        shortName: 'DFS',
        type: 'Uninformed',
        evaluationFunction: 'f(n) = Deepest Branch (LIFO)',
        isImplemented: true,
        solutionFound: false,
        nodesExpanded: 0,
        nodesGenerated: 0,
        moves: null,
        maxDepthReached: 0,
        executionTimeMs: 0,
        approxMemoryStr: '0 KB',
        approxMemoryBytes: 0,
        isAssigned: false,
        statusNote: `Unsolvable: ${solvability.reason}`
      },
      {
        id: 'DLS',
        name: `Depth-Limited Search (L=${dlsDepthLimit})`,
        shortName: 'DLS',
        type: 'Uninformed',
        evaluationFunction: `f(n) = LIFO (Cutoff L=${dlsDepthLimit})`,
        isImplemented: true,
        solutionFound: false,
        nodesExpanded: 0,
        nodesGenerated: 0,
        moves: null,
        maxDepthReached: 0,
        executionTimeMs: 0,
        approxMemoryStr: '0 KB',
        approxMemoryBytes: 0,
        isAssigned: false,
        statusNote: `Unsolvable: ${solvability.reason}`
      },
      {
        id: 'IDDLS',
        name: 'Iterative Deepening Search',
        shortName: 'IDDLS',
        type: 'Uninformed',
        evaluationFunction: 'f(n) = Iterative Depth L=0,1,2...',
        isImplemented: true,
        solutionFound: false,
        nodesExpanded: 0,
        nodesGenerated: 0,
        moves: null,
        maxDepthReached: 0,
        executionTimeMs: 0,
        approxMemoryStr: '0 KB',
        approxMemoryBytes: 0,
        isAssigned: false,
        statusNote: `Unsolvable: ${solvability.reason}`
      },
      {
        id: 'GBFS',
        name: 'Greedy Best-First Search',
        shortName: 'GBFS',
        type: 'Informed',
        evaluationFunction: 'f(n) = h(n)',
        heuristicUsed: heuristicType === 'MANHATTAN' ? 'Manhattan Distance' : 'Misplaced Tiles',
        isImplemented: true,
        solutionFound: false,
        nodesExpanded: 0,
        nodesGenerated: 0,
        moves: null,
        maxDepthReached: 0,
        executionTimeMs: 0,
        approxMemoryStr: '0 KB',
        approxMemoryBytes: 0,
        isAssigned: true,
        statusNote: `Unsolvable: ${solvability.reason}`
      },
      {
        id: 'ASTAR',
        name: 'A* Search',
        shortName: 'A*',
        type: 'Informed',
        evaluationFunction: 'f(n) = g(n) + h(n)',
        heuristicUsed: heuristicType === 'MANHATTAN' ? 'Manhattan Distance' : 'Misplaced Tiles',
        isImplemented: true,
        solutionFound: false,
        nodesExpanded: 0,
        nodesGenerated: 0,
        moves: null,
        maxDepthReached: 0,
        executionTimeMs: 0,
        approxMemoryStr: '0 KB',
        approxMemoryBytes: 0,
        isAssigned: false,
        statusNote: `Unsolvable: ${solvability.reason}`
      }
    ];
    return algorithms;
  }

  // Execute all 6 real algorithms in order
  const results: AlgorithmBenchmarkResult[] = [];

  // 1. BFS
  results.push(runBFS(initialState, goalState, 20000));

  // 2. DFS
  results.push(runDFS(initialState, goalState, 25, 20000));

  // 3. DLS
  results.push(runDLS(initialState, goalState, dlsDepthLimit, 15000));

  // 4. IDDLS
  results.push(runIDDLS(initialState, goalState, 15));

  // 5. GBFS (Assigned)
  results.push(runGBFS(initialState, goalState, heuristicType, 20000));

  // 6. A*
  results.push(runAStar(initialState, goalState, heuristicType, 20000));

  return results;
}
