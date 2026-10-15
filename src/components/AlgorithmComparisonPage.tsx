import React, { useState } from 'react';
import {
  BarChart2,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { PuzzleState, HeuristicType, AlgorithmType } from '../types';
import { MiniPuzzleBoard } from './MiniPuzzleBoard';
import { runAllAlgorithmsComparison, AlgorithmBenchmarkResult } from '../utils/searchAlgorithms';

interface AlgorithmComparisonPageProps {
  initialState: PuzzleState;
  goalState: PuzzleState;
  selectedHeuristic: HeuristicType;
  selectedAlgorithm: AlgorithmType;
  onNavigateToSolver: (algo: AlgorithmType) => void;
}

export const AlgorithmComparisonPage: React.FC<AlgorithmComparisonPageProps> = ({
  initialState,
  goalState,
  selectedHeuristic,
  onNavigateToSolver
}) => {
  const [benchmarkResults, setBenchmarkResults] = useState<AlgorithmBenchmarkResult[] | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [dlsLimit, setDlsLimit] = useState<number>(10);

  const handleRunComparison = () => {
    setIsRunning(true);
    setBenchmarkResults(null);

    setTimeout(() => {
      const results = runAllAlgorithmsComparison(initialState, goalState, selectedHeuristic, dlsLimit);
      setBenchmarkResults(results);
      setIsRunning(false);
    }, 50);
  };

  const handleReset = () => {
    setBenchmarkResults(null);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div id="section-algorithm-comparison" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 scroll-mt-20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="w-4 h-4 text-[#800020]" />
            <span className="text-xs font-mono text-[#71666B] uppercase tracking-wider font-semibold">
              Benchmarking &amp; Empirical Analysis
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#520018]">
            Algorithm Comparison
          </h1>
          <p className="text-[#71666B] text-sm mt-1">
            Empirical benchmark comparing search algorithms on the current 8-Puzzle configuration.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunComparison}
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#800020] hover:bg-[#520018] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs active:scale-98"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isRunning ? 'Running Benchmark...' : 'Run Comparison Benchmark'}</span>
          </button>

          {benchmarkResults && (
            <button
              onClick={handleReset}
              className="p-2 text-[#71666B] hover:text-[#800020] hover:bg-[#F0DDE1]/60 rounded-lg transition-colors cursor-pointer border border-[#E5D7DB]"
              title="Reset comparison"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* State Preview & Parameters Row */}
      <div className="bg-white border border-[#E5D7DB] rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] font-mono text-[#71666B] block font-semibold">Initial State</span>
            </div>
            <MiniPuzzleBoard state={initialState} size="sm" />
          </div>

          <div className="text-[#71666B] font-mono text-lg">→</div>

          <div className="flex items-center gap-3">
            <MiniPuzzleBoard state={goalState} size="sm" />
            <div>
              <span className="text-[11px] font-mono text-[#71666B] block font-semibold">Goal State</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-[#F8F5F5] border border-[#E5D7DB] px-3 py-1.5 rounded-lg">
            <span className="text-[#71666B] block text-[10px] uppercase font-semibold">Active Heuristic</span>
            <span className="font-semibold text-[#800020]">{selectedHeuristic}</span>
          </div>

          <div className="bg-[#F8F5F5] border border-[#E5D7DB] px-3 py-1.5 rounded-lg flex items-center gap-2">
            <div>
              <span className="text-[#71666B] block text-[10px] uppercase font-semibold">DLS Limit</span>
              <span className="font-semibold text-[#292329]">{dlsLimit}</span>
            </div>
            <input
              type="range"
              min={4}
              max={20}
              value={dlsLimit}
              onChange={(e) => setDlsLimit(Number(e.target.value))}
              className="w-16 h-1 bg-[#E5D7DB] rounded-lg appearance-none cursor-pointer accent-[#800020]"
            />
          </div>
        </div>
      </div>

      {/* Main Results Table */}
      <div id="section-comparison-results" className="bg-white border border-[#E5D7DB] rounded-xl p-5 sm:p-6 shadow-xs space-y-4 scroll-mt-20">
        <h2 className="text-sm font-serif font-bold text-[#292329] pb-2 border-b border-[#E5D7DB]">
          Performance Benchmark Table
        </h2>

        {!benchmarkResults && !isRunning && (
          <div className="text-center py-12 text-[#71666B] space-y-3">
            <p className="text-sm">
              Click <strong className="text-[#800020]">Run Comparison Benchmark</strong> above to execute all search algorithms on the current board.
            </p>
          </div>
        )}

        {isRunning && (
          <div className="text-center py-12 text-[#71666B] space-y-2">
            <div className="inline-block w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-sm font-mono">Executing state-space search algorithms...</p>
          </div>
        )}

        {benchmarkResults && !isRunning && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#F8F5F5] text-[#292329] border-b border-[#E5D7DB]">
                <tr>
                  <th className="p-3 font-semibold">Algorithm</th>
                  <th className="p-3 font-semibold">Type</th>
                  <th className="p-3 font-semibold">Solution</th>
                  <th className="p-3 font-semibold text-right">Nodes Expanded</th>
                  <th className="p-3 font-semibold text-right">Moves</th>
                  <th className="p-3 font-semibold text-right">Time (ms)</th>
                  <th className="p-3 font-semibold text-right">Memory (approx)</th>
                  <th className="p-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D7DB]">
                {benchmarkResults.map((result) => {
                  const isGBFS = result.id === 'GBFS';
                  const isAstar = result.id === 'ASTAR';

                  const memoryStr = result.approxMemoryBytes > 1024 * 1024
                    ? `${(result.approxMemoryBytes / (1024 * 1024)).toFixed(2)} MB`
                    : `${(result.approxMemoryBytes / 1024).toFixed(1)} KB`;

                  return (
                    <tr
                      key={result.id}
                      className={`hover:bg-[#F8F5F5] transition-colors ${
                        isGBFS ? 'bg-[#F0DDE1]/40 font-medium' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#292329]">{result.name}</span>
                          {isGBFS && (
                            <span className="bg-[#F0DDE1] text-[#800020] border border-[#E5D7DB] text-[9px] px-1.5 py-0.2 rounded font-bold">
                              Assigned
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#71666B] block">{result.evaluationFunction}</span>
                      </td>

                      <td className="p-3 text-[#71666B]">{result.type}</td>

                      <td className="p-3">
                        {result.solutionFound ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Found</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded text-[11px]">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Cutoff / Limit</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right font-semibold text-[#800020]">
                        {result.nodesExpanded.toLocaleString()}
                      </td>

                      <td className="p-3 text-right text-[#292329]">
                        {result.moves !== null ? result.moves : '—'}
                      </td>

                      <td className="p-3 text-right text-[#292329]">
                        {result.executionTimeMs.toFixed(2)}
                      </td>

                      <td className="p-3 text-right text-[#71666B]">
                        {memoryStr}
                      </td>

                      <td className="p-3 text-center">
                        {(isGBFS || isAstar) && (
                          <button
                            onClick={() => onNavigateToSolver(isGBFS ? 'GBFS' : 'ASTAR')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] bg-white hover:bg-[#F0DDE1]/60 text-[#800020] rounded transition-colors cursor-pointer border border-[#E5D7DB] hover:border-[#800020] font-medium"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Theoretical Analysis & Properties Comparison Matrix */}
      <div className="bg-white border border-[#E5D7DB] rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
        <h2 className="text-sm font-serif font-bold text-[#292329] pb-2 border-b border-[#E5D7DB]">
          Comparative Analysis &amp; Theoretical Properties
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#292329] leading-relaxed font-sans">
          <div className="space-y-3 p-4 bg-[#F8F5F5] rounded-xl border border-[#E5D7DB]">
            <h3 className="font-semibold text-[#520018] font-serif text-sm">
              GBFS vs. A* Search Trade-offs
            </h3>
            <p>
              <strong>Greedy Best-First Search (GBFS)</strong> uses <code className="font-mono text-[#800020] font-bold">f(n) = h(n)</code>, focusing purely on minimizing the estimated remaining distance to the goal. Because it completely ignores the accumulated path cost <code className="font-mono">g(n)</code>, it aggressively rushes down promising paths. This typically results in significantly fewer node expansions and faster execution, but the discovered solution path is <strong>not guaranteed to be optimal</strong>.
            </p>
            <p>
              In contrast, <strong>A* Search</strong> optimizes <code className="font-mono text-[#800020] font-bold">f(n) = g(n) + h(n)</code>. By accounting for the cost already incurred, A* balances exploration and exploitation, ensuring the <strong>optimal shortest solution path</strong> when using an admissible heuristic like Manhattan distance.
            </p>
          </div>

          <div className="space-y-3 p-4 bg-[#F8F5F5] rounded-xl border border-[#E5D7DB]">
            <h3 className="font-semibold text-[#520018] font-serif text-sm">
              GBFS vs. Uninformed Searches
            </h3>
            <p>
              Uninformed algorithms (<strong>BFS, DFS, DLS, IDDLS</strong>) explore the state space without domain knowledge (<code className="font-mono">h(n) = 0</code>). While BFS guarantees the shortest path, its memory footprint grows exponentially with depth (<code className="font-mono">O(b^d)</code>), quickly exhausting available browser memory for deeper configurations.
            </p>
            <p>
              GBFS incorporates heuristic guidance (<code className="font-mono">h(n)</code>), effectively pruning vast subtrees that move away from the goal state. This allows GBFS to solve complex configurations in milliseconds that would cause uninformed BFS or DFS to exceed node limits.
            </p>
          </div>
        </div>

        {/* Algorithm Properties Matrix Table */}
        <div className="overflow-x-auto border border-[#E5D7DB] rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F8F5F5] text-[#292329] border-b border-[#E5D7DB]">
              <tr>
                <th className="p-3 font-semibold">Algorithm</th>
                <th className="p-3 font-semibold">Evaluation Function</th>
                <th className="p-3 font-semibold">Complete?</th>
                <th className="p-3 font-semibold">Optimal?</th>
                <th className="p-3 font-semibold">Time Complexity</th>
                <th className="p-3 font-semibold">Space Complexity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5D7DB]">
              <tr className="bg-[#F0DDE1]/40 font-medium">
                <td className="p-3 font-bold text-[#800020]">GBFS (Assigned)</td>
                <td className="p-3 font-semibold text-[#800020]">f(n) = h(n)</td>
                <td className="p-3 text-emerald-800 font-semibold">Yes (Graph Search)</td>
                <td className="p-3 text-amber-800 font-semibold">No (Greedy bias)</td>
                <td className="p-3 text-[#292329]">O(b^m) worst; low in practice</td>
                <td className="p-3 text-[#292329]">O(b^m) (stores OPEN &amp; CLOSED)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#292329]">A* Search</td>
                <td className="p-3 font-semibold text-[#800020]">f(n) = g(n) + h(n)</td>
                <td className="p-3 text-emerald-800 font-semibold">Yes</td>
                <td className="p-3 text-emerald-800 font-semibold">Yes (Admissible h)</td>
                <td className="p-3 text-[#292329]">O(b^d)</td>
                <td className="p-3 text-[#292329]">O(b^d)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#292329]">BFS</td>
                <td className="p-3 text-[#71666B]">f(n) = g(n) (FIFO)</td>
                <td className="p-3 text-emerald-800 font-semibold">Yes</td>
                <td className="p-3 text-emerald-800 font-semibold">Yes (Unit cost)</td>
                <td className="p-3 text-[#292329]">O(b^d)</td>
                <td className="p-3 text-[#292329]">O(b^d) (Exponential)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#292329]">DFS</td>
                <td className="p-3 text-[#71666B]">f(n) = -g(n) (LIFO)</td>
                <td className="p-3 text-rose-800 font-semibold">No (Cycles/Loops)</td>
                <td className="p-3 text-rose-800 font-semibold">No</td>
                <td className="p-3 text-[#292329]">O(b^m)</td>
                <td className="p-3 text-emerald-800 font-semibold">O(b·m) (Linear)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#292329]">DLS</td>
                <td className="p-3 text-[#71666B]">f(n) = -g(n) (limit L)</td>
                <td className="p-3 text-amber-800 font-semibold">If L ≥ d</td>
                <td className="p-3 text-rose-800 font-semibold">No</td>
                <td className="p-3 text-[#292329]">O(b^L)</td>
                <td className="p-3 text-emerald-800 font-semibold">O(b·L)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#292329]">IDDLS</td>
                <td className="p-3 text-[#71666B]">Iterative L = 0,1,2...</td>
                <td className="p-3 text-emerald-800 font-semibold">Yes</td>
                <td className="p-3 text-emerald-800 font-semibold">Yes (Unit cost)</td>
                <td className="p-3 text-[#292329]">O(b^d)</td>
                <td className="p-3 text-emerald-800 font-semibold">O(b·d)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
