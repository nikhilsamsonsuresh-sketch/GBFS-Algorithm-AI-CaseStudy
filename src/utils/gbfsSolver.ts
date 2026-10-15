import {
  PuzzleState,
  SearchNode,
  StepRecord,
  SolverResult,
  NeighborInfo,
  SearchStats,
  HeuristicType,
  AlgorithmType,
  DecisionCandidate
} from '../types';
import {
  calculateHeuristic,
  getHeuristicInfo,
  getPossibleMoves,
  stateToString,
  checkSolvability,
  DEFAULT_GOAL_STATE
} from './puzzleEngine';

/**
 * Reconstructs the solution path from goal node back to initial node.
 */
export function reconstructPath(goalNode: SearchNode): SearchNode[] {
  const path: SearchNode[] = [];
  let curr: SearchNode | null = goalNode;
  while (curr !== null) {
    path.unshift(curr);
    curr = curr.parent;
  }
  return path;
}

function getMemoryMetrics(generatedCount: number, closedSize: number, stepCount: number) {
  let browserHeapMb: number | null = null;
  if (typeof window !== 'undefined' && (window.performance as any)?.memory?.usedJSHeapSize) {
    browserHeapMb = Math.round(((window.performance as any).memory.usedJSHeapSize / (1024 * 1024)) * 100) / 100;
  }
  const approxMemoryBytes = (generatedCount * 320) + (closedSize * 96) + (stepCount * 250);
  return { browserHeapMb, approxMemoryBytes };
}

/**
 * Executes Search (Greedy Best-First Search by default, or A* Search) for the 8-Puzzle Problem.
 *
 * Algorithm Specifications:
 * - GBFS: f(n) = h(n)
 * - A*: f(n) = g(n) + h(n)
 * - Heuristic: Manhattan Distance (h2) or Misplaced Tiles (h1)
 * - Priority Queue (OPEN): Ordered by lowest f(n) (then lowest h(n) / depth).
 * - Explored Set (CLOSED): Set of visited state keys.
 */
export function solveWithGBFS(
  initialState: PuzzleState,
  goalState: PuzzleState = DEFAULT_GOAL_STATE,
  heuristicType: HeuristicType = 'MANHATTAN',
  algorithmType: AlgorithmType = 'GBFS',
  maxIterations: number = 3000
): SolverResult {
  const startTime = performance.now();
  const solvability = checkSolvability(initialState, goalState);
  const heuristicMeta = getHeuristicInfo(heuristicType);
  
  let algoName = 'Greedy Best-First Search (GBFS)';
  let evalFormula = 'f(n) = h(n)';
  if (algorithmType === 'ASTAR') {
    algoName = 'A* Search';
    evalFormula = 'f(n) = g(n) + h(n)';
  } else if (algorithmType === 'BFS') {
    algoName = 'Breadth-First Search (BFS)';
    evalFormula = 'f(n) = g(n)';
  } else if (algorithmType === 'DFS') {
    algoName = 'Depth-First Search (DFS)';
    evalFormula = 'f(n) = -g(n)';
  } else if (algorithmType === 'DLS') {
    algoName = 'Depth-Limited Search (DLS)';
    evalFormula = 'f(n) = -g(n) (limit)';
  } else if (algorithmType === 'IDDLS') {
    algoName = 'Iterative Deepening Search (IDDLS)';
    evalFormula = 'f(n) = depth iteration';
  }

  if (!solvability.isSolvable) {
    const memory = getMemoryMetrics(0, 0, 0);
    const stats: SearchStats = {
      algorithm: algoName,
      algorithmType,
      evaluationFunction: evalFormula,
      heuristic: heuristicMeta.name,
      initialState,
      goalState,
      exploredCount: 0,
      generatedCount: 0,
      frontierCount: 0,
      solutionDepth: 0,
      maxDepthReached: 0,
      solutionMoves: 0,
      pathCost: null,
      executionTimeMs: 0,
      finalHeuristic: calculateHeuristic(initialState, goalState, heuristicType),
      isSolved: false,
      approxMemoryBytes: memory.approxMemoryBytes,
      browserHeapMb: memory.browserHeapMb
    };

    return {
      success: false,
      solutionPath: [],
      steps: [],
      stats,
      message: `Cannot solve: ${solvability.reason}`
    };
  }

  const initialH = calculateHeuristic(initialState, goalState, heuristicType);
  const initialG = 0;
  let initialF = initialH;
  if (algorithmType === 'ASTAR') {
    initialF = initialG + initialH;
  } else if (algorithmType === 'BFS') {
    initialF = initialG;
  } else if (algorithmType === 'DFS' || algorithmType === 'DLS') {
    initialF = -initialG;
  } else if (algorithmType === 'IDDLS') {
    initialF = initialG;
  }

  const initialNode: SearchNode = {
    id: `node-0-${stateToString(initialState)}`,
    nodeLabel: 'N0',
    state: initialState,
    h: initialH,
    g: initialG,
    f: initialF,
    parent: null,
    parentLabel: null,
    move: 'START',
    movedTile: null,
    depth: 0,
    stepGenerated: 0
  };

  // Immediate check if initial == goal
  if (stateToString(initialState) === stateToString(goalState)) {
    const endTime = performance.now();
    const execTime = Math.max(0.01, Math.round((endTime - startTime) * 100) / 100);
    const memory = getMemoryMetrics(1, 1, 1);
    const stats: SearchStats = {
      algorithm: algoName,
      algorithmType,
      evaluationFunction: evalFormula,
      heuristic: heuristicMeta.name,
      initialState,
      goalState,
      exploredCount: 1,
      generatedCount: 1,
      frontierCount: 0,
      solutionDepth: 0,
      maxDepthReached: 0,
      solutionMoves: 0,
      pathCost: 0,
      executionTimeMs: execTime,
      finalHeuristic: 0,
      isSolved: true,
      approxMemoryBytes: memory.approxMemoryBytes,
      browserHeapMb: memory.browserHeapMb
    };

    const initialStep: StepRecord = {
      stepIndex: 0,
      selectedNode: initialNode,
      generatedNeighbors: [],
      addedToFrontier: [],
      frontierSnapshot: [],
      exploredSnapshot: [initialNode],
      exploredCount: 1,
      generatedCount: 1,
      frontierCount: 0,
      status: 'GOAL_FOUND',
      explanation: `Initial state is already at the goal configuration! ${heuristicMeta.symbol} = 0.`,
      timelineEntry: {
        step: 0,
        title: 'Initial state is goal',
        details: [
          'Initial node N0 generated and evaluated',
          'N0 matches goal state configuration immediately',
          'Search completed with 0 moves'
        ]
      }
    };

    return {
      success: true,
      solutionPath: [initialNode],
      steps: [initialStep],
      stats,
      message: 'Goal state reached immediately!'
    };
  }

  // OPEN: Frontier priority queue ordered by f(n) / h(n)
  let frontier: SearchNode[] = [initialNode];
  // Map for fast membership test in OPEN
  const openSetKeys = new Map<string, SearchNode>();
  openSetKeys.set(stateToString(initialState), initialNode);

  // CLOSED: Explored set of states
  const closedSet = new Set<string>();
  const exploredNodesList: SearchNode[] = [];

  const steps: StepRecord[] = [];
  let generatedCounter = 1;
  let exploredOrder = 1;
  let maxDepthReached = 0;
  let goalNode: SearchNode | null = null;
  let status: 'SEARCHING' | 'GOAL_FOUND' | 'NO_SOLUTION' | 'MAX_LIMIT' = 'SEARCHING';
  let message = '';

  while (frontier.length > 0) {
    if (steps.length >= maxIterations) {
      status = 'MAX_LIMIT';
      message = `Search reached maximum safe iteration limit (${maxIterations} steps). GBFS greedy descent may have encountered a deep cycle/plateau.`;
      break;
    }

    // Capture candidates in Frontier before extraction for decision reasoning
    const decisionCandidates: DecisionCandidate[] = frontier.slice(0, 6).map((fn, idx) => ({
      id: fn.id,
      nodeLabel: fn.nodeLabel,
      h: fn.h,
      g: fn.g,
      f: fn.f,
      depth: fn.depth,
      isSelected: idx === 0,
      reason: idx === 0
        ? (algorithmType === 'ASTAR'
            ? `Lowest f(n) = g(n) + h(n) = ${fn.g} + ${fn.h} = ${fn.f}`
            : `Lowest ${heuristicMeta.symbol} = ${fn.h}`)
        : (algorithmType === 'ASTAR'
            ? `Higher f(n) = ${fn.f}`
            : `Higher ${heuristicMeta.symbol} = ${fn.h}`)
    }));

    // Decision: Select node with lowest f(n) (and lowest h(n))
    // Frontier is sorted so index 0 has the lowest evaluation value
    const currentNode = frontier.shift()!;
    const currentKey = stateToString(currentNode.state);
    openSetKeys.delete(currentKey);

    // Track max depth encountered among expanded nodes
    maxDepthReached = Math.max(maxDepthReached, currentNode.depth);

    // Mark as explored (CLOSED)
    currentNode.orderExplored = exploredOrder++;
    closedSet.add(currentKey);
    exploredNodesList.push(currentNode);

    // Check if goal reached
    if (currentKey === stateToString(goalState)) {
      goalNode = currentNode;
      status = 'GOAL_FOUND';

      const goalExplanation = `Goal reached! State matched goal configuration with ${heuristicMeta.symbol} = 0. Solution path depth is ${currentNode.depth} moves.`;

      steps.push({
        stepIndex: steps.length + 1,
        selectedNode: currentNode,
        generatedNeighbors: [],
        addedToFrontier: [],
        frontierSnapshot: [...frontier],
        exploredSnapshot: [...exploredNodesList],
        exploredCount: closedSet.size,
        generatedCount: generatedCounter,
        frontierCount: frontier.length,
        status: 'GOAL_FOUND',
        explanation: goalExplanation,
        timelineEntry: {
          step: steps.length + 1,
          title: `Goal State Found (${currentNode.nodeLabel})`,
          details: [
            `${currentNode.nodeLabel} selected from Frontier (h=0)`,
            'Goal test PASSED: all tiles in target positions',
            `Solution reconstructed with path cost g(n) = ${currentNode.g}`
          ]
        },
        gbfsDecision: {
          selectedNodeLabel: currentNode.nodeLabel,
          candidates: decisionCandidates,
          reason: `Node ${currentNode.nodeLabel} has h(n) = 0 and is the goal state.`
        }
      });
      break;
    }

    // Generate valid neighbor states
    const possibleMoves = getPossibleMoves(currentNode.state);
    const neighborInfos: NeighborInfo[] = [];
    const newFrontierNodes: SearchNode[] = [];

    for (const move of possibleMoves) {
      const neighborKey = stateToString(move.nextState);
      const isAlreadyClosed = closedSet.has(neighborKey);
      const isAlreadyOpen = openSetKeys.has(neighborKey);
      const neighborH = calculateHeuristic(move.nextState, goalState, heuristicType);
      const neighborG = currentNode.depth + 1;
      let neighborF = neighborH;
      if (algorithmType === 'ASTAR') {
        neighborF = neighborG + neighborH;
      } else if (algorithmType === 'BFS') {
        neighborF = neighborG;
      } else if (algorithmType === 'DFS' || algorithmType === 'DLS') {
        neighborF = -neighborG;
      } else if (algorithmType === 'IDDLS') {
        neighborF = neighborG;
      }

      // Track max depth reached across all generated candidate states
      maxDepthReached = Math.max(maxDepthReached, neighborG);

      const nodeIndex = generatedCounter++;
      const neighborNode: SearchNode = {
        id: `node-${nodeIndex}-${neighborKey}`,
        nodeLabel: `N${nodeIndex}`,
        state: move.nextState,
        h: neighborH,
        g: neighborG,
        f: neighborF,
        parent: currentNode,
        parentLabel: currentNode.nodeLabel,
        move: move.direction,
        movedTile: move.movedTile,
        depth: neighborG,
        stepGenerated: steps.length + 1
      };

      neighborInfos.push({
        direction: move.direction,
        state: move.nextState,
        movedTile: move.movedTile,
        h: neighborH,
        g: neighborG,
        f: neighborF,
        isAlreadyClosed,
        isAlreadyOpen,
        node: neighborNode
      });

      // Insert neighbor into OPEN if not in CLOSED and not in OPEN
      if (!isAlreadyClosed && !isAlreadyOpen) {
        newFrontierNodes.push(neighborNode);
        frontier.push(neighborNode);
        openSetKeys.set(neighborKey, neighborNode);
      }
    }

    // Sort Frontier by f(n) / h(n)
    frontier.sort((a, b) => {
      if (a.f !== b.f) {
        return a.f - b.f; // Lowest evaluation first
      }
      if (a.h !== b.h) {
        return a.h - b.h; // Lowest heuristic first
      }
      // Stable tie-breaker: prefer deeper nodes or earlier generation
      return a.depth !== b.depth ? b.depth - a.depth : a.stepGenerated - b.stepGenerated;
    });

    const stepNum = steps.length + 1;
    const stepExplanation = `Step ${stepNum}: Selected ${currentNode.nodeLabel} with min ${heuristicMeta.symbol} = ${currentNode.h} from Frontier. Generated ${possibleMoves.length} valid move(s). ${newFrontierNodes.length} new node(s) added to OPEN priority queue.`;

    const generatedNodeNames = newFrontierNodes.map(n => n.nodeLabel).join(', ');
    const timelineDetails = [
      `→ ${currentNode.nodeLabel} (h=${currentNode.h}, g=${currentNode.g}) selected for expansion`,
      `→ ${currentNode.nodeLabel} moved from Frontier to Explored (#${currentNode.orderExplored})`,
      `→ ${possibleMoves.length} potential moves inspected; ${newFrontierNodes.length} added to Frontier (${generatedNodeNames || 'none new'})`
    ];

    const decisionReason = algorithmType === 'ASTAR'
      ? `Node ${currentNode.nodeLabel} was selected because it has the lowest f(n) = g(n) + h(n) = ${currentNode.g} + ${currentNode.h} = ${currentNode.f}.`
      : `Node ${currentNode.nodeLabel} was selected because it has the lowest heuristic value ${heuristicMeta.symbol} = ${currentNode.h} among all nodes currently in the Frontier.`;

    steps.push({
      stepIndex: stepNum,
      selectedNode: currentNode,
      generatedNeighbors: neighborInfos,
      addedToFrontier: newFrontierNodes,
      frontierSnapshot: [...frontier],
      exploredSnapshot: [...exploredNodesList],
      exploredCount: closedSet.size,
      generatedCount: generatedCounter,
      frontierCount: frontier.length,
      status: 'SEARCHING',
      explanation: stepExplanation,
      timelineEntry: {
        step: stepNum,
        title: `Step ${stepNum}: Expand ${currentNode.nodeLabel}`,
        details: timelineDetails
      },
      gbfsDecision: {
        selectedNodeLabel: currentNode.nodeLabel,
        candidates: decisionCandidates,
        reason: decisionReason
      }
    });
  }

  const endTime = performance.now();
  const rawDuration = endTime - startTime;
  const executionTimeMs = rawDuration < 0.01 ? 0.05 : Math.round(rawDuration * 100) / 100;
  const memory = getMemoryMetrics(generatedCounter, closedSet.size, steps.length);

  if (goalNode) {
    const solutionPath = reconstructPath(goalNode);
    const moves = solutionPath.length - 1;
    const stats: SearchStats = {
      algorithm: algoName,
      algorithmType,
      evaluationFunction: evalFormula,
      heuristic: heuristicMeta.name,
      initialState,
      goalState,
      exploredCount: closedSet.size,
      generatedCount: generatedCounter,
      frontierCount: frontier.length,
      solutionDepth: goalNode.depth,
      maxDepthReached,
      solutionMoves: moves,
      pathCost: moves,
      executionTimeMs,
      finalHeuristic: 0,
      isSolved: true,
      approxMemoryBytes: memory.approxMemoryBytes,
      browserHeapMb: memory.browserHeapMb
    };

    return {
      success: true,
      solutionPath,
      steps,
      stats,
      message: `Success! Solved in ${moves} moves. Explored ${closedSet.size} states.`
    };
  }

  if (status === 'SEARCHING' && frontier.length === 0) {
    status = 'NO_SOLUTION';
    message = 'Frontier exhausted. No solution found within reachable states.';
  }

  const stats: SearchStats = {
    algorithm: algoName,
    algorithmType,
    evaluationFunction: evalFormula,
    heuristic: heuristicMeta.name,
    initialState,
    goalState,
    exploredCount: closedSet.size,
    generatedCount: generatedCounter,
    frontierCount: frontier.length,
    solutionDepth: 0,
    maxDepthReached,
    solutionMoves: 0,
    pathCost: null,
    executionTimeMs,
    finalHeuristic: frontier.length > 0 ? frontier[0].h : 999,
    isSolved: false,
    approxMemoryBytes: memory.approxMemoryBytes,
    browserHeapMb: memory.browserHeapMb
  };

  return {
    success: false,
    solutionPath: [],
    steps,
    stats,
    message
  };
}
