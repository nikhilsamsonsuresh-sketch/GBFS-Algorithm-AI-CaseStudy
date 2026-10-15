import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { AlgorithmType, HeuristicType } from '../types';

export type AlgoInfoId = 'GBFS' | 'ASTAR' | 'BFS' | 'DFS' | 'DLS' | 'IDDLS';

interface AlgorithmDetail {
  id: AlgoInfoId;
  name: string;
  shortName: string;
  fullName: string;
  category: 'Informed Search' | 'Uninformed Search';
  evaluationFunction: string;
  isAssigned: boolean;
  isImplemented: boolean;
  description: string;
  workingPrinciple: string[];
  advantages: string[];
  limitations: string[];
  timeComplexity: string;
  spaceComplexity: string;
  timeNote: string;
  spaceNote: string;
  completeness: 'Yes' | 'No' | 'Conditional';
  completenessNote: string;
  optimality: 'Yes' | 'No' | 'Conditional';
  optimalityNote: string;
  supportedHeuristics?: string[];
}

const ALGORITHMS_DATA: Record<AlgoInfoId, AlgorithmDetail> = {
  GBFS: {
    id: 'GBFS',
    name: 'Greedy Best-First Search',
    shortName: 'GBFS',
    fullName: 'Greedy Best-First Search (GBFS)',
    category: 'Informed Search',
    evaluationFunction: 'f(n) = h(n)',
    isAssigned: true,
    isImplemented: true,
    description:
      'Greedy Best-First Search (GBFS) is an informed heuristic search algorithm that prioritizes the node estimated to be closest to the goal. It evaluates nodes purely based on heuristic value h(n), ignoring the accumulated path cost g(n).',
    workingPrinciple: [
      'Initialize the Priority Queue (Frontier / OPEN List) with the initial puzzle state.',
      'Compute the heuristic distance h(n) from the initial state to the target goal state.',
      'Extract the node with the minimum heuristic value h(n) from the frontier.',
      'Check if the extracted state matches the goal state; if so, terminate and reconstruct the solution path.',
      'Generate all valid successor states by sliding tiles into the blank position.',
      'For each successor, calculate h(n) and add unvisited nodes into the frontier queue.',
      'Place the expanded node into the Explored (CLOSED) set to prevent cycles.',
      'Repeat until the goal is discovered or the frontier is empty.'
    ],
    advantages: [
      'Aggressively guided toward the goal by heuristic information.',
      'Often requires significantly fewer node expansions than uninformed search.',
      'Extremely fast for easy and moderately complex puzzle configurations.',
      'Memory efficient when heuristic accurately points toward the goal.'
    ],
    limitations: [
      'Not guaranteed to find an optimal solution (shortest sequence of moves).',
      'Can be trapped by false paths or local minima in misleading heuristic surfaces.',
      'Susceptible to cycles unless an explored closed set is maintained.',
      'Performance relies heavily on the quality of the heuristic function.'
    ],
    timeComplexity: 'O(b^m) worst case',
    spaceComplexity: 'O(b^m) worst case',
    timeNote: 'b is branching factor (~3 for 8-puzzle), m is maximum search depth. Expands fewer nodes than BFS in practice.',
    spaceNote: 'Stores all generated nodes in the frontier and explored sets.',
    completeness: 'No',
    completenessNote: 'Incomplete in infinite-depth search trees without loop detection; complete in finite state spaces with graph search (visited set).',
    optimality: 'No',
    optimalityNote: 'Non-optimal because it ignores path cost g(n), preferring local heuristic promises.',
    supportedHeuristics: [
      'Manhattan Distance: h(n) = Σ |currRow - goalRow| + |currCol - goalCol|',
      'Misplaced Tiles: h(n) = count of tiles not in target position'
    ]
  },
  ASTAR: {
    id: 'ASTAR',
    name: 'A* Search',
    shortName: 'A*',
    fullName: 'A* Search Algorithm',
    category: 'Informed Search',
    evaluationFunction: 'f(n) = g(n) + h(n)',
    isAssigned: false,
    isImplemented: true,
    description:
      'A* combines the cost to reach the node g(n) with the estimated cost to reach the goal h(n). When used with an admissible heuristic (like Manhattan distance), A* is guaranteed to find an optimal solution with the minimum number of moves.',
    workingPrinciple: [
      'Add initial node to the open priority queue with f(n) = g(n) + h(n) where g(initial) = 0.',
      'Extract the node with the lowest combined f(n) value.',
      'If the node is the goal state, return the optimal solution path.',
      'Expand the node, generating successor states by sliding adjacent tiles.',
      'For each successor, calculate g(succ) = g(curr) + 1 and compute h(succ).',
      'Add or update successors in the open queue if a cheaper path is found.',
      'Mark current node as closed.'
    ],
    advantages: [
      'Guaranteed to find the optimal solution with admissible heuristics.',
      'Optimally efficient: expands fewer nodes than any other complete and optimal algorithm with the same heuristic.',
      'Balances path cost minimization with goal-directed heuristic guidance.'
    ],
    limitations: [
      'High space complexity: keeps all generated nodes in memory.',
      'Can run out of memory on hard puzzle instances with deep solution trees.',
      'Higher execution overhead per step than simple uninformed search.'
    ],
    timeComplexity: 'O(b^d)',
    spaceComplexity: 'O(b^d)',
    timeNote: 'd is the depth of the optimal solution.',
    spaceNote: 'Frontier grows exponentially with solution depth.',
    completeness: 'Yes',
    completenessNote: 'Complete if branching factor b is finite and step costs are positive.',
    optimality: 'Yes',
    optimalityNote: 'Optimal when h(n) is admissible (never overestimates true cost).'
  },
  BFS: {
    id: 'BFS',
    name: 'Breadth-First Search',
    shortName: 'BFS',
    fullName: 'Breadth-First Search (BFS)',
    category: 'Uninformed Search',
    evaluationFunction: 'f(n) = g(n) (FIFO Queue)',
    isAssigned: false,
    isImplemented: true,
    description:
      'Breadth-First Search explores the state space level by level using a First-In-First-Out (FIFO) queue. It systematically evaluates all nodes at depth d before moving to depth d+1.',
    workingPrinciple: [
      'Enqueue initial state into FIFO queue.',
      'Dequeue first node in queue.',
      'If node is goal, return solution path.',
      'Generate all successors and enqueue unvisited states.',
      'Mark visited states to avoid redundant cycles.',
      'Repeat level by level.'
    ],
    advantages: [
      'Guaranteed to be complete in finite state spaces.',
      'Finds the shallowest (optimal) solution when step costs are uniform.',
      'Simple, deterministic queue-based implementation.'
    ],
    limitations: [
      'Exponential memory consumption: stores all nodes at each tree level.',
      'Rapidly runs out of memory for puzzle depths beyond 8-10.',
      'Uninformed: blindly explores in all directions without goal awareness.'
    ],
    timeComplexity: 'O(b^d)',
    spaceComplexity: 'O(b^d)',
    timeNote: 'b ≈ 3, d is goal depth.',
    spaceNote: 'Severe memory bottleneck in practice.',
    completeness: 'Yes',
    completenessNote: 'Complete if b is finite.',
    optimality: 'Yes',
    optimalityNote: 'Optimal for uniform step costs.'
  },
  DFS: {
    id: 'DFS',
    name: 'Depth-First Search',
    shortName: 'DFS',
    fullName: 'Depth-First Search (DFS)',
    category: 'Uninformed Search',
    evaluationFunction: 'f(n) = -g(n) (LIFO Stack)',
    isAssigned: false,
    isImplemented: true,
    description:
      'Depth-First Search traverses deepest unexplored branches first using a Last-In-First-Out (LIFO) stack. It pursues a single branch down until no further moves can be made before backtracking.',
    workingPrinciple: [
      'Push initial state onto LIFO stack.',
      'Pop top node from stack.',
      'If node is goal, return solution path.',
      'Generate successors and push unvisited nodes onto stack.',
      'Repeat until goal found or all branches explored.'
    ],
    advantages: [
      'Linear space complexity: only stores the current path from root to leaf.',
      'Very low memory consumption compared to BFS.',
      'Can quickly stumble onto deep solutions in lucky branches.'
    ],
    limitations: [
      'Incomplete in infinite spaces or without strict cycle detection.',
      'Not optimal: usually finds excessively long and convoluted paths.',
      'Can get trapped in endless cycles or unpromising deep subtrees.'
    ],
    timeComplexity: 'O(b^m)',
    spaceComplexity: 'O(b·m)',
    timeNote: 'm is maximum tree depth.',
    spaceNote: 'Linear memory: huge advantage over BFS.',
    completeness: 'No',
    completenessNote: 'Incomplete in loopy graphs without visited-set pruning.',
    optimality: 'No',
    optimalityNote: 'Does not guarantee the shortest path.'
  },
  DLS: {
    id: 'DLS',
    name: 'Depth-Limited Search',
    shortName: 'DLS',
    fullName: 'Depth-Limited Search (DLS)',
    category: 'Uninformed Search',
    evaluationFunction: 'f(n) = -g(n) with cutoff at depth L',
    isAssigned: false,
    isImplemented: true,
    description:
      'Depth-Limited Search is a variant of DFS that imposes a fixed maximum depth limit L. Any branch that reaches depth L is pruned and aborted, preventing infinite recursion.',
    workingPrinciple: [
      'Set depth cutoff limit L.',
      'Perform DFS traversal.',
      'If a node reaches depth L, treat it as having no successors and backtrack.',
      'Return solution if found within depth L; otherwise signal cutoff.'
    ],
    advantages: [
      'Solves the infinite depth trap problem of standard DFS.',
      'Maintains linear space complexity O(b·L).',
      'Provides predictable execution boundaries.'
    ],
    limitations: [
      'Incomplete if goal depth d > depth limit L.',
      'Not optimal if limit L > true shortest solution depth d.',
      'Requires guessing a good limit value L ahead of time.'
    ],
    timeComplexity: 'O(b^L)',
    spaceComplexity: 'O(b·L)',
    timeNote: 'L is the depth limit.',
    spaceNote: 'Linear memory proportional to depth limit.',
    completeness: 'Conditional',
    completenessNote: 'Complete only if L ≥ d (goal depth).',
    optimality: 'No',
    optimalityNote: 'Non-optimal even if L ≥ d.'
  },
  IDDLS: {
    id: 'IDDLS',
    name: 'Iterative Deepening Search',
    shortName: 'IDDLS',
    fullName: 'Iterative Deepening Search (IDDLS)',
    category: 'Uninformed Search',
    evaluationFunction: 'Iterative DLS with limits L = 0, 1, 2, ...',
    isAssigned: false,
    isImplemented: true,
    description:
      'Iterative Deepening Depth-First Search repeatedly executes DLS with increasing depth limits (0, 1, 2, ...). It combines the optimality and completeness of BFS with the linear space efficiency of DFS.',
    workingPrinciple: [
      'For limit L = 0, 1, 2, ... up to maximum depth:',
      'Run Depth-Limited Search with depth cutoff L.',
      'If goal is found, return optimal solution.',
      'If cutoff occurred, increment limit L by 1 and repeat from scratch.',
      'Terminate if no cutoff occurred and goal was not found.'
    ],
    advantages: [
      'Complete and optimal for uniform step cost problems.',
      'Linear space complexity O(b·d) like DFS.',
      'Preferred uninformed search method for large search spaces with unknown depth.'
    ],
    limitations: [
      'Regenerates upper-level nodes multiple times on each iteration.',
      'Overhead is acceptable for high branching factor, but still uninformed.',
      'Significantly slower than informed heuristic algorithms like GBFS and A*.'
    ],
    timeComplexity: 'O(b^d)',
    spaceComplexity: 'O(b·d)',
    timeNote: 'Re-expansion overhead is only about (b/(b-1)) times single search.',
    spaceNote: 'Combines BFS optimality with DFS linear memory.',
    completeness: 'Yes',
    completenessNote: 'Complete if branching factor b is finite.',
    optimality: 'Yes',
    optimalityNote: 'Optimal for uniform step costs.'
  }
};

interface AlgorithmInformationPageProps {
  onNavigateToSolver?: (algo: AlgorithmType, heuristic?: HeuristicType) => void;
  selectedAlgo?: AlgoInfoId;
  onSelectAlgo?: (algo: AlgoInfoId) => void;
}

export const AlgorithmInformationPage: React.FC<AlgorithmInformationPageProps> = ({
  onNavigateToSolver,
  selectedAlgo: propSelectedAlgo,
  onSelectAlgo
}) => {
  const [internalAlgo, setInternalAlgo] = useState<AlgoInfoId>('GBFS');
  const selectedAlgo = propSelectedAlgo ?? internalAlgo;

  const handleSelectAlgo = (algo: AlgoInfoId) => {
    setInternalAlgo(algo);
    onSelectAlgo?.(algo);
  };

  const current = ALGORITHMS_DATA[selectedAlgo];

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-[#800020]" />
          <span className="text-xs font-mono text-[#71666B] uppercase tracking-wider font-semibold">
            Academic Reference
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#520018]">
          Search Algorithm Information
        </h1>
        <p className="text-[#71666B] text-sm mt-1">
          Comparative academic analysis of informed and uninformed state-space search algorithms.
        </p>
      </div>

      {/* Algorithm Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#E5D7DB]">
        {(Object.keys(ALGORITHMS_DATA) as AlgoInfoId[]).map((algoKey) => {
          const algo = ALGORITHMS_DATA[algoKey];
          const isSelected = selectedAlgo === algoKey;

          return (
            <button
              key={algoKey}
              onClick={() => handleSelectAlgo(algoKey)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#800020] text-white font-semibold shadow-xs'
                  : 'bg-white text-[#292329] hover:bg-[#F0DDE1]/40 hover:text-[#800020] border border-[#E5D7DB]'
              }`}
            >
              <span>{algo.shortName}</span>
              {algo.isAssigned && (
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#F0DDE1] text-[#800020] border border-[#E5D7DB]'
                }`}>
                  Assigned
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Algorithm Details */}
      <div
        id="section-algo-details"
        className="bg-white border border-[#E5D7DB] rounded-xl p-5 sm:p-8 shadow-xs space-y-6 scroll-mt-20"
      >
        {/* Title and Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5D7DB]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[#71666B]">{current.category}</span>
              {current.isAssigned && (
                <span className="text-[10px] font-mono font-bold bg-[#F0DDE1] text-[#800020] border border-[#E5D7DB] px-2 py-0.5 rounded-full">
                  Assigned Algorithm
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#292329]">
              {current.fullName}
            </h2>
          </div>

          <div className="bg-[#F8F5F5] border border-[#E5D7DB] px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-[#71666B] block text-[10px] uppercase font-semibold">Evaluation</span>
            <strong className="text-[#800020] font-bold">{current.evaluationFunction}</strong>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#71666B] mb-2">
            Description
          </h3>
          <p className="text-[#292329] text-sm sm:text-base leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Working Principle */}
        <div>
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#71666B] mb-2">
            Working Principle
          </h3>
          <ol className="list-decimal pl-5 space-y-1.5 text-sm text-[#292329] leading-relaxed">
            {current.workingPrinciple.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>

        {/* Advantages & Limitations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg p-4 space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Advantages</span>
            </h4>
            <ul className="list-disc pl-4 text-xs sm:text-sm text-[#292329] space-y-1">
              {current.advantages.map((adv, idx) => (
                <li key={idx}>{adv}</li>
              ))}
            </ul>
          </div>

          <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg p-4 space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Limitations</span>
            </h4>
            <ul className="list-disc pl-4 text-xs sm:text-sm text-[#292329] space-y-1">
              {current.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Complexity & Properties Table */}
        <div className="pt-2">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#71666B] mb-3">
            Algorithmic Properties &amp; Complexity
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-[#F8F5F5] border border-[#E5D7DB] p-3 rounded-lg">
              <span className="text-[#71666B] block text-[10px] uppercase font-semibold">Time Complexity</span>
              <strong className="text-[#292329] block mt-0.5">{current.timeComplexity}</strong>
            </div>

            <div className="bg-[#F8F5F5] border border-[#E5D7DB] p-3 rounded-lg">
              <span className="text-[#71666B] block text-[10px] uppercase font-semibold">Space Complexity</span>
              <strong className="text-[#292329] block mt-0.5">{current.spaceComplexity}</strong>
            </div>

            <div className="bg-[#F8F5F5] border border-[#E5D7DB] p-3 rounded-lg">
              <span className="text-[#71666B] block text-[10px] uppercase font-semibold">Completeness</span>
              <strong className="text-[#292329] block mt-0.5">{current.completeness}</strong>
            </div>

            <div className="bg-[#F8F5F5] border border-[#E5D7DB] p-3 rounded-lg">
              <span className="text-[#71666B] block text-[10px] uppercase font-semibold">Optimality</span>
              <strong className="text-[#292329] block mt-0.5">{current.optimality}</strong>
            </div>
          </div>
        </div>

        {/* CTA to Solver if implemented */}
        {current.isImplemented && onNavigateToSolver && (
          <div className="pt-4 border-t border-[#E5D7DB] flex justify-end">
            <button
              onClick={() => onNavigateToSolver(current.id === 'ASTAR' ? 'ASTAR' : 'GBFS')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#800020] hover:bg-[#520018] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs active:scale-98"
            >
              <span>Run {current.shortName} in Solver</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
