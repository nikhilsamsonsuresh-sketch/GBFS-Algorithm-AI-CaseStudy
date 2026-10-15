export type PuzzleState = [
  number, number, number,
  number, number, number,
  number, number, number
];

export type MoveDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'START';

export type HeuristicType = 'MANHATTAN' | 'MISPLACED';

export type AlgorithmType = 'GBFS' | 'ASTAR' | 'BFS' | 'DFS' | 'DLS' | 'IDDLS';

export type AnimationSubPhase = 'EXPAND' | 'EVALUATE' | 'SELECT' | 'SLIDE';

export interface SearchNode {
  id: string;
  nodeLabel: string; // e.g., 'N0', 'N1', 'N2'
  state: PuzzleState;
  h: number; // Heuristic evaluation value
  g: number; // Path cost from initial state (depth)
  f: number; // Evaluation function value (GBFS: f=h, A*: f=g+h)
  parent: SearchNode | null;
  parentLabel: string | null; // e.g., 'N0', null for root
  move: MoveDirection;
  movedTile: number | null;
  depth: number;
  stepGenerated: number;
  orderExplored?: number;
}

export interface NeighborInfo {
  direction: MoveDirection;
  state: PuzzleState;
  movedTile: number;
  h: number;
  g: number;
  f: number;
  isAlreadyClosed: boolean;
  isAlreadyOpen: boolean;
  node: SearchNode;
}

export interface DecisionCandidate {
  id: string;
  nodeLabel: string;
  h: number;
  g: number;
  f: number;
  depth: number;
  isSelected: boolean;
  reason: string;
}

export interface StepRecord {
  stepIndex: number;
  selectedNode: SearchNode;
  generatedNeighbors: NeighborInfo[];
  addedToFrontier: SearchNode[];
  frontierSnapshot: SearchNode[]; // sorted by f(n) / h(n)
  exploredSnapshot: SearchNode[]; // nodes explored up to this step
  exploredCount: number;
  generatedCount: number;
  frontierCount: number;
  status: 'SEARCHING' | 'GOAL_FOUND' | 'NO_SOLUTION' | 'MAX_LIMIT';
  explanation: string;
  timelineEntry: {
    step: number;
    title: string;
    details: string[];
  };
  gbfsDecision?: {
    selectedNodeLabel: string;
    candidates: DecisionCandidate[];
    reason: string;
  };
}

export interface SearchStats {
  algorithm: string;
  algorithmType: AlgorithmType;
  evaluationFunction: string;
  heuristic: string;
  initialState: PuzzleState;
  goalState: PuzzleState;
  exploredCount: number;
  generatedCount: number;
  frontierCount: number;
  solutionDepth: number;
  maxDepthReached: number;
  solutionMoves: number;
  pathCost: number | null;
  executionTimeMs: number;
  finalHeuristic: number;
  isSolved: boolean;
  approxMemoryBytes?: number;
  browserHeapMb?: number | null;
}

export interface SolverResult {
  success: boolean;
  solutionPath: SearchNode[];
  steps: StepRecord[];
  stats: SearchStats;
  message: string;
}

export interface TileDistanceDetail {
  tile: number;
  currentPos: { row: number; col: number; index: number };
  goalPos: { row: number; col: number; index: number };
  manhattanDist: number;
}

export interface SolvabilityCheck {
  isSolvable: boolean;
  initialInversions: number;
  goalInversions: number;
  reason: string;
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'CUSTOM';
