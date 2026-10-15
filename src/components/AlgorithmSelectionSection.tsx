import React from 'react';
import { AlgorithmType, HeuristicType } from '../types';

export interface AlgorithmSelectionSectionProps {
  algorithmType: AlgorithmType;
  heuristicType: HeuristicType;
  currentH: number;
  depthLimit: number;
  onAlgorithmChange: (algo: AlgorithmType) => void;
  onHeuristicChange: (heuristic: HeuristicType) => void;
  onDepthLimitChange: (limit: number) => void;
  onOpenManhattanModal: () => void;
}

export const AlgorithmSelectionSection: React.FC<AlgorithmSelectionSectionProps> = ({
  algorithmType,
  heuristicType,
  currentH,
  depthLimit,
  onAlgorithmChange,
  onHeuristicChange,
  onDepthLimitChange,
  onOpenManhattanModal
}) => {
  const isHeuristicAlgorithm = algorithmType === 'GBFS' || algorithmType === 'ASTAR';

  return (
    <section
      className="bg-white border border-[#E5D7DB] rounded-xl p-5 sm:p-6 shadow-xs space-y-6 scroll-mt-20"
      id="section-algorithm-selection"
      aria-label="Algorithm Selection"
    >
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5D7DB] gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#292329]">
            Algorithm Selection
          </h2>
          <span className="text-xs font-mono font-bold text-[#800020] bg-[#F0DDE1] px-2.5 py-0.5 rounded-full border border-[#E5D7DB]">
            Assigned: GBFS
          </span>
        </div>
        <p className="text-xs font-mono text-[#71666B]">
          Core AI Algorithm: Greedy Best-First Search with Heuristics
        </p>
      </div>

      {/* 2. ALGORITHM & HEURISTIC CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Algorithm Dropdown */}
        <div className="space-y-2">
          <label htmlFor="algorithm-select" className="text-xs font-mono text-[#292329] font-bold block uppercase tracking-wider">
            Search Algorithm:
          </label>
          <select
            id="algorithm-select"
            value={algorithmType}
            onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmType)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5D7DB] rounded-lg text-[#292329] focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] cursor-pointer font-sans"
          >
            <option value="GBFS">Greedy Best-First Search (GBFS) [Assigned Algorithm]</option>
            <option value="ASTAR">A* Search (Optimal: f = g + h)</option>
            <option value="BFS">Breadth-First Search (BFS)</option>
            <option value="DFS">Depth-First Search (DFS)</option>
            <option value="DLS">Depth-Limited Search (DLS)</option>
            <option value="IDDLS">Iterative Deepening Search (IDDLS)</option>
          </select>

          {/* Algorithm Strategy Description */}
          <div className="text-xs text-[#292329] font-sans p-3 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg">
            {algorithmType === 'GBFS' && (
              <span>
                <strong className="text-[#520018] font-semibold">Greedy Best-First: </strong>
                Evaluates nodes using <code className="font-mono font-bold text-[#800020]">f(n) = h(n)</code>. Always expands the node with lowest estimated distance to goal. Fast, but not guaranteed optimal.
              </span>
            )}
            {algorithmType === 'ASTAR' && (
              <span>
                <strong className="text-[#520018] font-semibold">A* Search: </strong>
                Combines actual path cost and heuristic estimate via <code className="font-mono font-bold text-[#800020]">f(n) = g(n) + h(n)</code>. Guarantees the shortest optimal path.
              </span>
            )}
            {algorithmType === 'BFS' && (
              <span>
                <strong className="text-[#520018] font-semibold">Breadth-First Search: </strong>
                Explores nodes level by level using FIFO queue. Guarantees shortest path in unweighted graphs, but requires exponential memory.
              </span>
            )}
            {algorithmType === 'DFS' && (
              <span>
                <strong className="text-[#520018] font-semibold">Depth-First Search: </strong>
                Explores deep paths first using LIFO stack. Low memory footprint, but may get trapped in cycles or deep branches.
              </span>
            )}
            {algorithmType === 'DLS' && (
              <span>
                <strong className="text-[#520018] font-semibold">Depth-Limited Search: </strong>
                DFS constrained to a fixed maximum depth cutoff to prevent infinite loops.
              </span>
            )}
            {algorithmType === 'IDDLS' && (
              <span>
                <strong className="text-[#520018] font-semibold">Iterative Deepening: </strong>
                Iteratively runs DLS from depth 0 upward. Combines DFS's low memory with BFS's completeness.
              </span>
            )}
          </div>
        </div>

        {/* Heuristic Function / Depth Limit Selector */}
        <div className="space-y-2">
          {isHeuristicAlgorithm ? (
            <>
              <div className="flex items-center justify-between">
                <label htmlFor="heuristic-select" className="text-xs font-mono text-[#292329] font-bold block uppercase tracking-wider">
                  Heuristic Function:
                </label>
                <button
                  onClick={onOpenManhattanModal}
                  className="text-[11px] font-mono text-[#800020] hover:underline cursor-pointer font-semibold"
                >
                  Inspect Breakdown →
                </button>
              </div>

              <select
                id="heuristic-select"
                value={heuristicType}
                onChange={(e) => onHeuristicChange(e.target.value as HeuristicType)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5D7DB] rounded-lg text-[#292329] focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] cursor-pointer font-sans"
              >
                <option value="MANHATTAN">Manhattan Distance (h₂ = Σ |Δr| + |Δc|) [Admissible &amp; Dominant]</option>
                <option value="MISPLACED">Misplaced Tiles (h₁ = Count of Misplaced Tiles)</option>
              </select>

              <div className="flex items-center justify-between text-xs font-mono p-3 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg">
                <span className="text-[#71666B]">Current Board Heuristic:</span>
                <span className="text-[#800020] font-bold font-mono">
                  h(n) = {currentH}
                </span>
              </div>
            </>
          ) : algorithmType === 'DLS' ? (
            <>
              <div className="flex items-center justify-between">
                <label htmlFor="depth-limit-input" className="text-xs font-mono text-[#292329] font-bold block uppercase tracking-wider">
                  Depth Limit (Cutoff):
                </label>
                <span className="text-xs font-mono font-bold text-[#800020]">Limit = {depthLimit}</span>
              </div>

              <input
                id="depth-limit-input"
                type="range"
                min={1}
                max={30}
                value={depthLimit}
                onChange={(e) => onDepthLimitChange(parseInt(e.target.value, 10))}
                className="w-full accent-[#800020] cursor-pointer"
              />

              <div className="text-xs text-[#292329] font-sans p-3 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg">
                Depth-Limited Search will abort expansion beyond depth <strong className="font-mono text-[#520018]">{depthLimit}</strong>.
              </div>
            </>
          ) : (
            <div className="p-4 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg text-xs font-mono text-[#292329] space-y-1">
              <span className="font-bold text-[#520018] uppercase block">Uninformed Search:</span>
              <p className="font-sans text-[#71666B]">
                {algorithmType} operates without heuristic estimates (<code className="font-mono">h(n) = 0</code>). Node expansion is guided purely by structural queue ordering.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
