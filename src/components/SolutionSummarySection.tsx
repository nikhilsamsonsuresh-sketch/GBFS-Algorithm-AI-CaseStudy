import React, { useState } from 'react';
import { SolverResult, PuzzleState, HeuristicType, AlgorithmType } from '../types';
import { MiniPuzzleBoard } from './MiniPuzzleBoard';
import { DEFAULT_INITIAL_STATE, DEFAULT_GOAL_STATE } from '../utils/puzzleEngine';
import {
  CheckCircle2,
  XCircle,
  Play,
  Copy,
  Check
} from 'lucide-react';

interface SolutionSummarySectionProps {
  initialState?: PuzzleState;
  goalState?: PuzzleState;
  solverResult: SolverResult | null;
  heuristicType: HeuristicType;
  algorithmType: AlgorithmType;
  onRunSolver: () => void;
  onViewSolutionPath: () => void;
  onViewSearchProcess: () => void;
}

export const SolutionSummarySection: React.FC<SolutionSummarySectionProps> = ({
  initialState = DEFAULT_INITIAL_STATE,
  goalState = DEFAULT_GOAL_STATE,
  solverResult,
  heuristicType,
  onRunSolver
}) => {
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const stats = solverResult?.stats;
  const isSolved = solverResult?.success ?? false;
  const hasResult = solverResult !== null;

  const solutionMoves = isSolved && stats ? stats.solutionMoves : null;
  const pathCost = isSolved && stats ? stats.pathCost ?? stats.solutionMoves : null;
  const nodesGenerated = stats ? stats.generatedCount : 0;
  const nodesExpanded = stats ? stats.exploredCount : 0;
  const maxDepth = stats ? stats.maxDepthReached : 0;
  const executionTime = stats ? `${stats.executionTimeMs.toFixed(2)} ms` : '0.00 ms';

  const approxSearchMemoryStr = stats?.approxMemoryBytes
    ? stats.approxMemoryBytes > 1024 * 1024
      ? `${(stats.approxMemoryBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(stats.approxMemoryBytes / 1024).toFixed(2)} KB`
    : '0 KB';

  const handleCopyReport = () => {
    if (!stats) return;
    const reportText = `8-Puzzle Solution Report (${stats.algorithm})\nStatus: ${isSolved ? 'Solution Found' : 'Search Terminated'}\nMoves: ${solutionMoves ?? 'N/A'}\nNodes Generated: ${nodesGenerated}\nNodes Expanded: ${nodesExpanded}\nMax Depth: ${maxDepth}\nExecution Time: ${executionTime}\nPath Cost: ${pathCost ?? 'N/A'}\nMemory: ${approxSearchMemoryStr}`;
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  if (!hasResult) {
    return (
      <div className="bg-[#F8F5F5] border border-dashed border-[#E5D7DB] rounded-xl p-8 text-center space-y-3">
        <p className="text-sm text-[#71666B] font-sans">
          No active search result. Run the solver above to generate the solution summary and path metrics.
        </p>
        <button
          onClick={onRunSolver}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#800020] hover:bg-[#520018] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs active:scale-98"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Execute Solver</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Result Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-[#F8F5F5] border-[#E5D7DB]">
        <div className="flex items-center gap-3">
          {isSolved ? (
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-300 text-rose-700 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-[#292329] text-base">
              {isSolved ? 'Solution Found' : 'Search Terminated'}
            </h3>
            <p className="text-xs text-[#71666B] font-mono">
              {stats?.algorithm} • {heuristicType} heuristic • {executionTime}
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyReport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#800020] hover:text-[#520018] bg-white hover:bg-[#F0DDE1]/60 border border-[#E5D7DB] hover:border-[#800020] rounded-lg transition-colors cursor-pointer self-start sm:self-auto font-medium"
        >
          {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedReport ? 'Copied' : 'Copy Summary'}</span>
        </button>
      </div>

      {/* Two-Column Academic Metrics Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Column 1: Search Performance Metrics */}
        <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl p-5 space-y-3">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#71666B] pb-1 border-b border-[#E5D7DB]">
            Search Statistics
          </h4>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between py-1 border-b border-[#E5D7DB]/80">
              <span className="text-[#71666B]">Total Moves:</span>
              <strong className="text-[#292329]">{solutionMoves !== null ? solutionMoves : 'N/A'}</strong>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#E5D7DB]/80">
              <span className="text-[#71666B]">Nodes Generated:</span>
              <strong className="text-[#292329]">{nodesGenerated}</strong>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#E5D7DB]/80">
              <span className="text-[#71666B]">Nodes Expanded:</span>
              <strong className="text-[#800020] font-bold">{nodesExpanded}</strong>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#71666B]">Maximum Depth Reached:</span>
              <strong className="text-[#292329]">{maxDepth}</strong>
            </div>
          </div>
        </div>

        {/* Column 2: Computational & Cost Metrics */}
        <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl p-5 space-y-3">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#71666B] pb-1 border-b border-[#E5D7DB]">
            Computational Cost
          </h4>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between py-1 border-b border-[#E5D7DB]/80">
              <span className="text-[#71666B]">Execution Time:</span>
              <strong className="text-[#292329]">{executionTime}</strong>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#E5D7DB]/80">
              <span className="text-[#71666B]">Path Cost g(goal):</span>
              <strong className="text-[#292329]">{pathCost !== null ? pathCost : 'N/A'}</strong>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#E5D7DB]/80">
              <span className="text-[#71666B]">Approximate Memory:</span>
              <strong className="text-[#292329]">{approxSearchMemoryStr}</strong>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#71666B]">Evaluation Formula:</span>
              <strong className="text-[#800020] font-bold">{stats?.evaluationFunction}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Solution Path Sequence Visualizer */}
      {isSolved && solverResult?.solutionPath && solverResult.solutionPath.length > 0 && (
        <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5D7DB]">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#71666B]">
              Solution Move Path Sequence ({solverResult.solutionPath.length} states)
            </h4>
            <span className="text-xs font-mono text-emerald-800 font-semibold">
              Cost: {solverResult.solutionPath.length - 1} moves
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1">
            {solverResult.solutionPath.map((stepNode, idx) => (
              <div key={idx} className="flex items-center gap-3 shrink-0">
                <div className="flex flex-col items-center gap-1.5 p-2 bg-white rounded-lg border border-[#E5D7DB] shadow-2xs">
                  <MiniPuzzleBoard
                    state={stepNode.state}
                    size="sm"
                    highlightTile={stepNode.movedTile}
                  />
                  <div className="text-[10px] font-mono text-[#71666B] text-center">
                    <span className="font-semibold text-[#292329]">
                      {idx === 0 ? 'Start' : `Move #${idx}`}
                    </span>
                    {stepNode.move && stepNode.move !== 'START' && (
                      <span className="block text-[9px] text-[#800020] font-bold">{stepNode.move}</span>
                    )}
                  </div>
                </div>
                {idx < solverResult.solutionPath.length - 1 && (
                  <span className="text-[#71666B] text-sm font-mono">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
