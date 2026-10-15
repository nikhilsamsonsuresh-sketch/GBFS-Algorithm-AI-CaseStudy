import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers, CornerDownRight } from 'lucide-react';
import { PuzzleState, SearchNode, StepRecord, SolverResult, AlgorithmType, HeuristicType } from '../types';
import { MiniPuzzleBoard } from './MiniPuzzleBoard';

export interface SearchProcessSectionProps {
  currentStep: StepRecord | null;
  solverResult: SolverResult | null;
  currentFrontier: SearchNode[];
  currentExplored: SearchNode[];
  algorithmType?: AlgorithmType;
  heuristicType?: HeuristicType;
  onSelectNodeState: (state: PuzzleState, movedTile: number | null, moveDir: string | null) => void;
}

export const SearchProcessSection: React.FC<SearchProcessSectionProps> = ({
  currentStep,
  solverResult,
  currentFrontier,
  currentExplored,
  algorithmType = 'GBFS',
  heuristicType = 'MANHATTAN',
  onSelectNodeState
}) => {
  const [isFrontierOpen, setIsFrontierOpen] = useState<boolean>(true);
  const [isExploredOpen, setIsExploredOpen] = useState<boolean>(false);
  const [frontierFilter, setFrontierFilter] = useState<string>('');

  const activeNode = currentStep?.selectedNode;

  const filteredFrontier = currentFrontier.filter(node =>
    node.nodeLabel.toLowerCase().includes(frontierFilter.toLowerCase()) ||
    node.h.toString().includes(frontierFilter) ||
    node.depth.toString().includes(frontierFilter)
  );

  return (
    <section
      className="bg-white border border-[#E5D7DB] rounded-xl p-5 sm:p-6 shadow-xs space-y-6 scroll-mt-20"
      id="section-search-process"
      aria-label="Search Process and Open/Closed Lists"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#E5D7DB]">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#292329]">
            Search Process Visualization
          </h2>
          <p className="text-xs text-[#71666B] font-sans mt-0.5">
            Real-time tracking of current node expansion, priority queue (Frontier), and explored states.
          </p>
        </div>
        <span className="text-xs font-mono text-[#71666B] hidden sm:inline">
          {algorithmType === 'GBFS' ? 'Greedy Best-First: f(n) = h(n)' : algorithmType === 'ASTAR' ? 'A* Search: f(n) = g(n) + h(n)' : `${algorithmType} Search`}
        </span>
      </div>

      {/* Current Node Being Expanded Card */}
      {activeNode && (
        <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-[#E5D7DB]">
            <span className="font-bold text-[#292329] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#800020]" />
              <span>Current Node Being Expanded:</span>
              <strong className="text-[#800020] bg-white px-2 py-0.5 rounded border border-[#E5D7DB] text-sm">
                {activeNode.nodeLabel}
              </strong>
            </span>
            <span className="text-[#71666B]">
              Move: <strong className="text-[#292329]">{activeNode.move || 'START'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
            {/* Board Preview */}
            <div className="flex items-center gap-3">
              <MiniPuzzleBoard state={activeNode.state} size="sm" highlightTile={activeNode.movedTile} />
              <div className="text-xs font-mono text-[#292329] space-y-0.5">
                <div className="text-[#71666B] text-[10px] uppercase font-semibold">Parent Node:</div>
                <div className="font-semibold text-[#292329] flex items-center gap-1">
                  <CornerDownRight className="w-3 h-3 text-[#71666B]" />
                  <span>{activeNode.parentLabel || 'None (Initial State)'}</span>
                </div>
              </div>
            </div>

            {/* Depth & Path Cost */}
            <div className="text-xs font-mono bg-white p-2.5 rounded-lg border border-[#E5D7DB] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#71666B]">Search Depth:</span>
                <strong className="text-[#292329]">{activeNode.depth}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71666B]">Path Cost g(n):</span>
                <strong className="text-[#292329]">{activeNode.g}</strong>
              </div>
            </div>

            {/* Heuristic Value */}
            <div className="text-xs font-mono bg-white p-2.5 rounded-lg border border-[#E5D7DB] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#71666B]">Heuristic h(n):</span>
                <strong className="text-[#800020] text-sm">{activeNode.h}</strong>
              </div>
              <div className="text-[10px] text-[#71666B]">
                {heuristicType === 'MANHATTAN' ? 'Manhattan Distance' : 'Misplaced Tiles'}
              </div>
            </div>

            {/* Evaluation Function f(n) */}
            <div className="text-xs font-mono bg-[#F0DDE1]/60 p-2.5 rounded-lg border border-[#E5D7DB] space-y-1">
              <span className="text-[#800020] text-[10px] uppercase font-bold block">Evaluation Function:</span>
              {algorithmType === 'GBFS' ? (
                <div>
                  <div className="text-[#520018] font-bold text-sm">f(n) = h(n) = {activeNode.h}</div>
                  <div className="text-[10px] text-[#71666B]">GBFS: ignores path cost g(n)</div>
                </div>
              ) : algorithmType === 'ASTAR' ? (
                <div>
                  <div className="text-[#520018] font-bold text-sm">f(n) = g(n) + h(n) = {activeNode.f}</div>
                  <div className="text-[10px] text-[#71666B]">A*: {activeNode.g} + {activeNode.h}</div>
                </div>
              ) : (
                <div className="text-[#292329] font-semibold">{solverResult?.stats.evaluationFunction || 'Structural'}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compact Statistics Row: Generated | Expanded | Depth | Path Cost */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg">
          <span className="text-[10px] font-mono text-[#71666B] uppercase block font-semibold">Nodes Generated</span>
          <strong className="text-xl font-mono text-[#292329] block mt-0.5">
            {currentStep ? currentStep.generatedCount : (solverResult?.stats.generatedCount ?? 1)}
          </strong>
        </div>

        <div className="p-3 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg">
          <span className="text-[10px] font-mono text-[#71666B] uppercase block font-semibold">Nodes Expanded</span>
          <strong className="text-xl font-mono text-[#800020] block mt-0.5">
            {currentStep ? currentStep.exploredCount : (solverResult?.stats.exploredCount ?? 0)}
          </strong>
        </div>

        <div className="p-3 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg">
          <span className="text-[10px] font-mono text-[#71666B] uppercase block font-semibold">Current Depth</span>
          <strong className="text-xl font-mono text-[#292329] block mt-0.5">
            {currentStep ? currentStep.selectedNode.depth : 0}
          </strong>
        </div>

        <div className="p-3 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg">
          <span className="text-[10px] font-mono text-[#71666B] uppercase block font-semibold">Path Cost g(n)</span>
          <strong className="text-xl font-mono text-[#292329] block mt-0.5">
            {currentStep ? currentStep.selectedNode.g : 0}
          </strong>
        </div>
      </div>

      {/* Collapsible Frontier / Open List */}
      <div className="border border-[#E5D7DB] rounded-lg overflow-hidden bg-white shadow-2xs">
        <button
          onClick={() => setIsFrontierOpen(!isFrontierOpen)}
          className="w-full p-3 bg-[#F8F5F5] hover:bg-[#F0DDE1]/40 flex items-center justify-between text-left text-xs font-mono font-semibold text-[#292329] transition-colors cursor-pointer"
        >
          <span>Frontier / Open List ({currentFrontier.length} nodes)</span>
          {isFrontierOpen ? <ChevronUp className="w-4 h-4 text-[#71666B]" /> : <ChevronDown className="w-4 h-4 text-[#71666B]" />}
        </button>

        {isFrontierOpen && (
          <div className="p-4 space-y-3 bg-white border-t border-[#E5D7DB]">
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
              <span className="text-[#71666B]">Sorted by Priority. Index #1 expanded next.</span>
              <input
                type="text"
                placeholder="Filter nodes..."
                value={frontierFilter}
                onChange={(e) => setFrontierFilter(e.target.value)}
                className="px-2.5 py-1 bg-white border border-[#E5D7DB] rounded text-xs text-[#292329] placeholder:text-[#71666B]/60 focus:outline-none focus:ring-1 focus:ring-[#800020] w-36"
              />
            </div>

            {filteredFrontier.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-[#71666B] bg-[#F8F5F5] rounded">
                Frontier queue is currently empty.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-56 overflow-y-auto border border-[#E5D7DB] rounded">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#F8F5F5] border-b border-[#E5D7DB] text-[#292329] sticky top-0">
                    <tr>
                      <th className="p-2 font-semibold">Rank</th>
                      <th className="p-2 font-semibold">Node</th>
                      <th className="p-2 font-semibold">State</th>
                      <th className="p-2 font-semibold">Depth g(n)</th>
                      <th className="p-2 font-semibold">Heuristic h(n)</th>
                      <th className="p-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5D7DB]">
                    {filteredFrontier.map((fNode, idx) => (
                      <tr
                        key={fNode.id}
                        onClick={() => onSelectNodeState(fNode.state, fNode.movedTile, fNode.move)}
                        className={`hover:bg-[#F8F5F5] cursor-pointer ${idx === 0 ? 'bg-[#F0DDE1]/40' : ''}`}
                      >
                        <td className="p-2 text-[#71666B]">#{idx + 1}</td>
                        <td className="p-2 font-semibold text-[#292329]">{fNode.nodeLabel}</td>
                        <td className="p-2 flex items-center gap-2">
                          <MiniPuzzleBoard state={fNode.state} size="sm" highlightTile={fNode.movedTile} />
                        </td>
                        <td className="p-2 text-[#292329]">{fNode.depth}</td>
                        <td className="p-2 font-bold text-[#800020]">{fNode.h}</td>
                        <td className="p-2">
                          {idx === 0 ? (
                            <span className="text-[10px] bg-[#F0DDE1] text-[#800020] border border-[#E5D7DB] px-1.5 py-0.5 rounded font-bold">
                              Next
                            </span>
                          ) : (
                            <span className="text-[#71666B] text-[10px]">Queued</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collapsible Explored / Closed List */}
      <div className="border border-[#E5D7DB] rounded-lg overflow-hidden bg-white shadow-2xs">
        <button
          onClick={() => setIsExploredOpen(!isExploredOpen)}
          className="w-full p-3 bg-[#F8F5F5] hover:bg-[#F0DDE1]/40 flex items-center justify-between text-left text-xs font-mono font-semibold text-[#292329] transition-colors cursor-pointer"
        >
          <span>Explored / Closed List ({currentExplored.length} visited states)</span>
          {isExploredOpen ? <ChevronUp className="w-4 h-4 text-[#71666B]" /> : <ChevronDown className="w-4 h-4 text-[#71666B]" />}
        </button>

        {isExploredOpen && (
          <div className="p-4 bg-white border-t border-[#E5D7DB]">
            {currentExplored.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-[#71666B] bg-[#F8F5F5] rounded">
                No nodes expanded yet. Run solver to populate closed set.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-56 overflow-y-auto border border-[#E5D7DB] rounded">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#F8F5F5] border-b border-[#E5D7DB] text-[#292329] sticky top-0">
                    <tr>
                      <th className="p-2 font-semibold">Order</th>
                      <th className="p-2 font-semibold">Node</th>
                      <th className="p-2 font-semibold">State</th>
                      <th className="p-2 font-semibold">Move</th>
                      <th className="p-2 font-semibold">Depth g(n)</th>
                      <th className="p-2 font-semibold">Heuristic h(n)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5D7DB]">
                    {currentExplored.map((cNode, idx) => (
                      <tr
                        key={cNode.id}
                        onClick={() => onSelectNodeState(cNode.state, cNode.movedTile, cNode.move)}
                        className="hover:bg-[#F8F5F5] cursor-pointer"
                      >
                        <td className="p-2 text-[#71666B]">#{idx + 1}</td>
                        <td className="p-2 font-semibold text-[#292329]">{cNode.nodeLabel}</td>
                        <td className="p-2 flex items-center gap-2">
                          <MiniPuzzleBoard state={cNode.state} size="sm" highlightTile={cNode.movedTile} />
                        </td>
                        <td className="p-2 text-[#292329]">{cNode.move}</td>
                        <td className="p-2 text-[#292329]">{cNode.depth}</td>
                        <td className="p-2 font-bold text-[#800020]">{cNode.h}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
