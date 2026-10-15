import React from 'react';
import { StepRecord, SearchNode } from '../types';
import { MiniPuzzleBoard } from './MiniPuzzleBoard';
import {
  ArrowRight,
  ListOrdered,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingDown,
  Info
} from 'lucide-react';

interface StepExecutionViewProps {
  step: StepRecord | null;
  totalExplored: number;
  totalFrontier: number;
  onSelectNodePreview?: (node: SearchNode) => void;
  onOpenManhattanModal: () => void;
}

export const StepExecutionView: React.FC<StepExecutionViewProps> = ({
  step,
  onSelectNodePreview,
  onOpenManhattanModal
}) => {
  if (!step) {
    return (
      <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 bg-[#E5E2D9] border border-[#1A1A1A] text-[#1A1A1A] flex items-center justify-center mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h4 className="text-xl font-serif italic font-bold text-[#1A1A1A]">Search Ready to Start</h4>
        <p className="text-xs text-[#1A1A1A]/70 max-w-md mt-1 font-sans">
          Click <strong>Solve with GBFS</strong> or <strong>Next Step</strong> to observe how Greedy Best-First Search selects nodes with the minimum Manhattan Distance $h(n)$ at each iteration.
        </p>
      </div>
    );
  }

  const { selectedNode, generatedNeighbors, frontierSnapshot, status, explanation } = step;

  return (
    <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-5 sm:p-6 flex flex-col gap-6 shadow-sm">
      {/* Top Banner: Step Explanation & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#1A1A1A]/20">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider bg-[#1A1A1A] text-white border border-[#1A1A1A]">
              Iteration #{step.stepIndex}
            </span>
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 border ${
              status === 'GOAL_FOUND'
                ? 'bg-[#2D5A27] text-white border-[#1A1A1A]'
                : 'bg-[#E5E2D9] text-[#1A1A1A] border-[#1A1A1A]'
            }`}>
              {status === 'GOAL_FOUND' ? 'Goal State Reached!' : 'Expanding Node from Frontier'}
            </span>
          </div>
          <p className="text-xs text-[#1A1A1A]/80 mt-2 flex items-start gap-1.5 leading-relaxed font-mono">
            <Info className="w-3.5 h-3.5 text-[#D95D39] shrink-0 mt-0.5" />
            <span>{explanation}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenManhattanModal}
            className="text-xs text-[#1A1A1A] hover:text-white hover:bg-[#D95D39] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer bg-[#E5E2D9] border border-[#1A1A1A] px-3 py-1 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Formula</span>
          </button>
        </div>
      </div>

      {/* Grid: 1. Current Selected Node  -->  2. Neighbors Generated */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Current Node Selected from OPEN */}
        <div className="lg:col-span-4 bg-[#E5E2D9] p-4 border border-[#1A1A1A] flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingDown className="w-4 h-4 text-[#D95D39]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
              1. Extracted Node (Min h)
            </span>
          </div>

          <MiniPuzzleBoard
            state={selectedNode.state}
            size="lg"
            highlightTile={selectedNode.movedTile}
            badge={`h(n) = ${selectedNode.h}`}
            badgeColor="terracotta"
          />

          <div className="mt-3 w-full bg-[#F9F7F2] p-3 border border-[#1A1A1A] text-left text-xs font-mono space-y-1.5">
            <div className="flex justify-between text-[#1A1A1A]">
              <span className="opacity-70">Manhattan h(n):</span>
              <strong className="text-[#D95D39] font-bold">{selectedNode.h}</strong>
            </div>
            <div className="flex justify-between text-[#1A1A1A]">
              <span className="opacity-70">Search Depth (g):</span>
              <span>{selectedNode.depth}</span>
            </div>
            <div className="flex justify-between text-[#1A1A1A]">
              <span className="opacity-70">Evaluation f(n):</span>
              <span className="font-bold">{selectedNode.h}</span>
            </div>
            <div className="flex justify-between text-[#1A1A1A]">
              <span className="opacity-70">Action taken:</span>
              <span className="font-bold uppercase text-[#D95D39]">{selectedNode.move}</span>
            </div>
          </div>
        </div>

        {/* Transition Arrow for Desktop */}
        <div className="hidden lg:flex lg:col-span-1 items-center justify-center self-center text-[#1A1A1A]">
          <ArrowRight className="w-6 h-6 text-[#D95D39]" />
        </div>

        {/* Generated Neighbors */}
        <div className="lg:col-span-7 bg-[#E5E2D9] p-4 border border-[#1A1A1A] flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-[#1A1A1A]/20 pb-2">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#D95D39]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                2. Generated Neighbors ({generatedNeighbors.length})
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#1A1A1A]/70 uppercase">
              Valid sliding moves
            </span>
          </div>

          {generatedNeighbors.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#1A1A1A]/60 font-mono">
              {status === 'GOAL_FOUND' ? 'Goal reached! No further expansion required.' : 'No neighbors generated.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {generatedNeighbors.map((nbr, idx) => {
                const isAccepted = !nbr.isAlreadyClosed && !nbr.isAlreadyOpen;

                return (
                  <div
                    key={idx}
                    className={`p-2.5 border flex flex-col items-center text-center transition-all bg-[#F9F7F2] ${
                      isAccepted
                        ? 'border-[#1A1A1A] shadow-sm'
                        : 'border-[#1A1A1A]/30 opacity-60'
                    }`}
                  >
                    <div className="text-[9px] font-mono font-bold text-[#1A1A1A] uppercase mb-1">
                      Move {nbr.direction}
                    </div>

                    <MiniPuzzleBoard
                      state={nbr.state}
                      size="sm"
                      highlightTile={nbr.movedTile}
                    />

                    <div className="mt-2 w-full text-center">
                      <span className="text-[11px] font-mono font-bold text-[#1A1A1A] bg-[#E5E2D9] px-2 py-0.5 border border-[#1A1A1A]">
                        h = {nbr.h}
                      </span>
                    </div>

                    <div className="mt-2 text-[9px] font-mono uppercase font-bold flex items-center gap-1 justify-center">
                      {isAccepted ? (
                        <span className="inline-flex items-center gap-0.5 text-[#2D5A27]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Added OPEN</span>
                        </span>
                      ) : nbr.isAlreadyClosed ? (
                        <span className="inline-flex items-center gap-0.5 text-[#1A1A1A]/50">
                          <XCircle className="w-3 h-3 text-[#1A1A1A]/40" />
                          <span>In CLOSED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[#C48B28]">
                          <XCircle className="w-3 h-3 text-[#C48B28]" />
                          <span>In OPEN</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Updated Frontier (Priority Queue Sorted by h(n)) */}
      <div className="bg-[#E5E2D9] p-4 border border-[#1A1A1A]">
        <div className="flex items-center justify-between mb-3 border-b border-[#1A1A1A]/20 pb-2">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-[#D95D39]" />
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
              3. Frontier Priority Queue (OPEN) — Min h(n) First
            </h4>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-[#F9F7F2] text-[#1A1A1A] border border-[#1A1A1A]">
            {frontierSnapshot.length} Node{frontierSnapshot.length === 1 ? '' : 's'} Waiting
          </span>
        </div>

        {frontierSnapshot.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#1A1A1A]/60 font-mono">
            Frontier is empty.
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {frontierSnapshot.slice(0, 12).map((fNode, idx) => (
              <div
                key={fNode.id}
                onClick={() => onSelectNodePreview && onSelectNodePreview(fNode)}
                className={`shrink-0 bg-[#F9F7F2] p-2.5 border transition-all flex flex-col items-center text-center cursor-pointer hover:border-[#D95D39] ${
                  idx === 0 ? 'border-2 border-[#D95D39] shadow-md' : 'border border-[#1A1A1A]'
                }`}
              >
                <div className="flex items-center justify-between w-full text-[9px] font-mono text-[#1A1A1A]/60 mb-1">
                  <span>#{idx + 1}</span>
                  {idx === 0 && <span className="font-bold text-[#D95D39] tracking-wider">NEXT</span>}
                </div>

                <MiniPuzzleBoard
                  state={fNode.state}
                  size="sm"
                  highlightTile={fNode.movedTile}
                />

                <div className="mt-2">
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 border ${
                    idx === 0
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-[#E5E2D9] text-[#1A1A1A] border-[#1A1A1A]'
                  }`}>
                    h = {fNode.h}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-[#1A1A1A]/60 mt-1">Depth: {fNode.depth}</span>
              </div>
            ))}
            {frontierSnapshot.length > 12 && (
              <div className="shrink-0 flex items-center justify-center p-4 text-xs font-mono text-[#1A1A1A]/60 bg-[#F9F7F2] border border-dashed border-[#1A1A1A]/40">
                + {frontierSnapshot.length - 12} more
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
