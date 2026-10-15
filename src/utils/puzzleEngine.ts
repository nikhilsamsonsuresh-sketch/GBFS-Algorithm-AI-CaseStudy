import { PuzzleState, MoveDirection, TileDistanceDetail, SolvabilityCheck, HeuristicType } from '../types';

export const DEFAULT_GOAL_STATE: PuzzleState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
export const DEFAULT_INITIAL_STATE: PuzzleState = [1, 2, 3, 4, 0, 5, 7, 8, 6];

export const PRESET_PUZZLES: { name: string; difficulty: string; initial: PuzzleState; description: string }[] = [
  {
    name: 'Simple (2 Moves)',
    difficulty: 'Easy',
    initial: [1, 2, 3, 4, 0, 6, 7, 5, 8],
    description: 'Minimal distance to goal. Perfect for observing the initial steps.'
  },
  {
    name: 'Standard Easy (4-6 Moves)',
    difficulty: 'Easy',
    initial: [1, 2, 3, 4, 0, 5, 7, 8, 6],
    description: 'Requires sliding 5 and 6 into their canonical spots.'
  },
  {
    name: 'Classic Medium (8-12 Moves)',
    difficulty: 'Medium',
    initial: [1, 2, 3, 0, 4, 6, 7, 5, 8],
    description: 'Balanced search space exploring multiple alternative branches.'
  },
  {
    name: 'Spiral Shuffle (14-18 Moves)',
    difficulty: 'Medium',
    initial: [2, 8, 3, 1, 6, 4, 7, 0, 5],
    description: 'Deep branch exploration showcasing priority queue sorting.'
  },
  {
    name: 'Greedy Heuristic Challenge',
    difficulty: 'Hard',
    initial: [2, 8, 1, 0, 4, 3, 7, 6, 5],
    description: 'Illustrates how pure Greedy Best-First Search aggressively pursues low Manhattan distance.'
  },
  {
    name: 'Complex Scramble',
    difficulty: 'Hard',
    initial: [8, 6, 7, 2, 5, 4, 3, 0, 1],
    description: 'Challenging search space demonstrating visited state filtering and frontier maintenance.'
  }
];

export function stateToString(state: PuzzleState): string {
  return state.join(',');
}

export function parseStateString(str: string): PuzzleState | null {
  const parts = str.trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 9) return null;
  const validation = validatePuzzleState(parts);
  if (!validation.valid) return null;
  return parts as PuzzleState;
}

export function validatePuzzleState(arr: number[]): { valid: boolean; error?: string } {
  if (arr.length !== 9) {
    return { valid: false, error: 'Puzzle must contain exactly 9 tiles.' };
  }
  const seen = new Set<number>();
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    if (isNaN(val) || val < 0 || val > 8) {
      return { valid: false, error: `Invalid tile "${val}". Values must be numbers from 0 to 8.` };
    }
    if (seen.has(val)) {
      return { valid: false, error: `Duplicate tile "${val === 0 ? 'Blank (0)' : val}". Each number 0-8 must appear exactly once.` };
    }
    seen.add(val);
  }
  if (!seen.has(0)) {
    return { valid: false, error: 'A blank tile (0 or _) is required.' };
  }
  return { valid: true };
}

/**
 * Counts the number of inversions in the state.
 * An inversion is any pair (i, j) such that i < j and state[i] > state[j] (ignoring blank 0).
 */
export function countInversions(state: PuzzleState): number {
  let inversions = 0;
  const flat = state.filter(x => x !== 0);
  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      if (flat[i] > flat[j]) {
        inversions++;
      }
    }
  }
  return inversions;
}

/**
 * Checks solvability of a 3x3 sliding puzzle from initial state to goal state.
 * For an odd grid dimension (3x3), a configuration is solvable if and only if
 * the number of inversions in the initial state has the same parity (even/odd)
 * as the number of inversions in the goal state.
 */
export function checkSolvability(
  initial: PuzzleState,
  goal: PuzzleState = DEFAULT_GOAL_STATE
): SolvabilityCheck {
  const initialInversions = countInversions(initial);
  const goalInversions = countInversions(goal);

  const initialParity = initialInversions % 2;
  const goalParity = goalInversions % 2;
  const isSolvable = initialParity === goalParity;

  let reason = '';
  if (isSolvable) {
    reason = `Solvable: Initial state has ${initialInversions} inversions (${initialParity === 0 ? 'even' : 'odd'}), matching goal state parity of ${goalInversions} inversions (${goalParity === 0 ? 'even' : 'odd'}).`;
  } else {
    reason = `Unsolvable: Initial state has ${initialInversions} inversions (${initialParity === 0 ? 'even' : 'odd'}), which has opposite parity to the goal state (${goalInversions} inversions, ${goalParity === 0 ? 'even' : 'odd'}). In 3x3 sliding puzzles, tile slides preserve inversion parity.`;
  }

  return {
    isSolvable,
    initialInversions,
    goalInversions,
    reason
  };
}

/**
 * Calculates Manhattan Distance:
 * h(n) = sum_{tile=1..8} (|row_current - row_goal| + |col_current - col_goal|)
 */
export function calculateManhattanDistance(
  state: PuzzleState,
  goal: PuzzleState = DEFAULT_GOAL_STATE
): number {
  let totalDistance = 0;

  // Map goal tile positions
  const goalPosMap: { [tile: number]: { r: number; c: number } } = {};
  for (let i = 0; i < 9; i++) {
    const tile = goal[i];
    goalPosMap[tile] = { r: Math.floor(i / 3), c: i % 3 };
  }

  for (let i = 0; i < 9; i++) {
    const tile = state[i];
    if (tile !== 0) { // Blank is not counted in standard Manhattan Distance
      const currR = Math.floor(i / 3);
      const currC = i % 3;
      const target = goalPosMap[tile];
      if (target) {
        totalDistance += Math.abs(currR - target.r) + Math.abs(currC - target.c);
      }
    }
  }

  return totalDistance;
}

/**
 * Calculates Misplaced Tiles:
 * h(n) = count_{tile=1..8} (state[i] != goal[i])
 * Counts how many numbered tiles (excluding blank 0) are not in their goal position.
 */
export function calculateMisplacedTiles(
  state: PuzzleState,
  goal: PuzzleState = DEFAULT_GOAL_STATE
): number {
  let misplaced = 0;
  for (let i = 0; i < 9; i++) {
    const tile = state[i];
    if (tile !== 0 && tile !== goal[i]) {
      misplaced++;
    }
  }
  return misplaced;
}

/**
 * Calculates heuristic value based on selected heuristic type
 */
export function calculateHeuristic(
  state: PuzzleState,
  goal: PuzzleState = DEFAULT_GOAL_STATE,
  heuristicType: HeuristicType = 'MANHATTAN'
): number {
  if (heuristicType === 'MISPLACED') {
    return calculateMisplacedTiles(state, goal);
  }
  return calculateManhattanDistance(state, goal);
}

/**
 * Returns user-friendly name and formula for the heuristic
 */
export function getHeuristicInfo(heuristicType: HeuristicType = 'MANHATTAN'): {
  name: string;
  shortName: string;
  symbol: string;
  formula: string;
  description: string;
} {
  if (heuristicType === 'MISPLACED') {
    return {
      name: 'Misplaced Tiles',
      shortName: 'Misplaced',
      symbol: 'h₁(n)',
      formula: 'h(n) = Σ [tile_i ≠ goal_i]',
      description: 'Counts the number of tiles that are not currently in their target goal position.'
    };
  }
  return {
    name: 'Manhattan Distance',
    shortName: 'Manhattan',
    symbol: 'h₂(n)',
    formula: 'h(n) = Σ (|r_curr - r_goal| + |c_curr - c_goal|)',
    description: 'Sum of vertical and horizontal grid displacements for each tile to its target location.'
  };
}

/**
 * Returns detailed per-tile Manhattan distances for educational breakdown
 */
export function getTileDistanceBreakdown(
  state: PuzzleState,
  goal: PuzzleState = DEFAULT_GOAL_STATE
): TileDistanceDetail[] {
  const goalPosMap: { [tile: number]: { r: number; c: number; index: number } } = {};
  for (let i = 0; i < 9; i++) {
    const tile = goal[i];
    goalPosMap[tile] = { r: Math.floor(i / 3), c: i % 3, index: i };
  }

  const details: TileDistanceDetail[] = [];
  for (let i = 0; i < 9; i++) {
    const tile = state[i];
    if (tile !== 0) {
      const currR = Math.floor(i / 3);
      const currC = i % 3;
      const target = goalPosMap[tile];
      const dist = target ? Math.abs(currR - target.r) + Math.abs(currC - target.c) : 0;
      details.push({
        tile,
        currentPos: { row: currR, col: currC, index: i },
        goalPos: { row: target.r, col: target.c, index: target.index },
        manhattanDist: dist
      });
    }
  }

  return details.sort((a, b) => a.tile - b.tile);
}

/**
 * Returns all valid moves from the current state (moving blank tile UP, DOWN, LEFT, RIGHT)
 */
export function getPossibleMoves(
  state: PuzzleState
): { direction: MoveDirection; nextState: PuzzleState; movedTile: number }[] {
  const blankIndex = state.indexOf(0);
  const row = Math.floor(blankIndex / 3);
  const col = blankIndex % 3;
  const moves: { direction: MoveDirection; nextState: PuzzleState; movedTile: number }[] = [];

  // Moving blank UP means tile above moves DOWN into blank
  if (row > 0) {
    const targetIndex = blankIndex - 3;
    const nextState = [...state] as PuzzleState;
    nextState[blankIndex] = nextState[targetIndex];
    nextState[targetIndex] = 0;
    moves.push({
      direction: 'UP',
      nextState,
      movedTile: state[targetIndex]
    });
  }

  // Moving blank DOWN means tile below moves UP into blank
  if (row < 2) {
    const targetIndex = blankIndex + 3;
    const nextState = [...state] as PuzzleState;
    nextState[blankIndex] = nextState[targetIndex];
    nextState[targetIndex] = 0;
    moves.push({
      direction: 'DOWN',
      nextState,
      movedTile: state[targetIndex]
    });
  }

  // Moving blank LEFT means tile to left moves RIGHT into blank
  if (col > 0) {
    const targetIndex = blankIndex - 1;
    const nextState = [...state] as PuzzleState;
    nextState[blankIndex] = nextState[targetIndex];
    nextState[targetIndex] = 0;
    moves.push({
      direction: 'LEFT',
      nextState,
      movedTile: state[targetIndex]
    });
  }

  // Moving blank RIGHT means tile to right moves LEFT into blank
  if (col < 2) {
    const targetIndex = blankIndex + 1;
    const nextState = [...state] as PuzzleState;
    nextState[blankIndex] = nextState[targetIndex];
    nextState[targetIndex] = 0;
    moves.push({
      direction: 'RIGHT',
      nextState,
      movedTile: state[targetIndex]
    });
  }

  return moves;
}

/**
 * Slide a specific tile into adjacent blank if possible (for manual clicking)
 */
export function slideTile(state: PuzzleState, tileIndex: number): { nextState: PuzzleState; moved: boolean } {
  const blankIndex = state.indexOf(0);
  const tileRow = Math.floor(tileIndex / 3);
  const tileCol = tileIndex % 3;
  const blankRow = Math.floor(blankIndex / 3);
  const blankCol = blankIndex % 3;

  const isAdjacent = (Math.abs(tileRow - blankRow) + Math.abs(tileCol - blankCol)) === 1;
  if (!isAdjacent) {
    return { nextState: state, moved: false };
  }

  const nextState = [...state] as PuzzleState;
  nextState[blankIndex] = state[tileIndex];
  nextState[tileIndex] = 0;
  return { nextState, moved: true };
}

/**
 * Generates a random solvable puzzle configuration with controlled difficulty
 * by performing backward random walks from the goal.
 */
export function generateRandomSolvablePuzzle(
  difficulty: 'EASY' | 'MEDIUM' | 'HARD',
  goal: PuzzleState = DEFAULT_GOAL_STATE
): PuzzleState {
  const stepRanges = {
    EASY: { min: 4, max: 8 },
    MEDIUM: { min: 10, max: 18 },
    HARD: { min: 25, max: 40 }
  };

  const { min, max } = stepRanges[difficulty];
  const totalSteps = Math.floor(Math.random() * (max - min + 1)) + min;

  let current = [...goal] as PuzzleState;
  let lastBlank = -1;

  for (let step = 0; step < totalSteps; step++) {
    const moves = getPossibleMoves(current);
    // filter out immediate reverse move if possible
    const viableMoves = moves.filter(m => m.nextState.indexOf(0) !== lastBlank);
    const chosen = (viableMoves.length > 0 ? viableMoves : moves)[
      Math.floor(Math.random() * (viableMoves.length > 0 ? viableMoves.length : moves.length))
    ];
    lastBlank = current.indexOf(0);
    current = chosen.nextState;
  }

  // Ensure initial != goal
  if (stateToString(current) === stateToString(goal)) {
    const moves = getPossibleMoves(current);
    current = moves[0].nextState;
  }

  return current;
}
