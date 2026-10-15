import React from 'react';
import { motion } from 'motion/react';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  GitBranch
} from 'lucide-react';
import {
  PuzzleState,
  StepRecord,
  AnimationSubPhase,
  HeuristicType,
  AlgorithmType,
  NeighborInfo,
  SearchNode
} from '../types';
import { calculateHeuristic } from '../utils/puzzleEngine';
import { PuzzleBoard } from './PuzzleBoard';
import { MiniPuzzleBoard } from './MiniPuzzleBoard';

export interface SolverVisualizationSectionProps {
  initialState: PuzzleState;
  goalState: PuzzleState;
  currentState: PuzzleState;
  movedTile: number | null;
  highlightedCandidateTile: number | null;
  lastMoveDirection: string | null;
  currentStepIndex: number;
  totalSteps: number;
  currentStep: StepRecord | null;
  activeChosenCandidate: NeighborInfo | null;
  animationPhase: AnimationSubPhase;
  searchStatus: 'ready' | 'running' | 'paused' | 'completed' | 'failed';
  heuristicType: HeuristicType;
  algorithmType: AlgorithmType;
  speed: number;
  currentH: number;
  solutionPath?: SearchNode[];
  onTileClick: (nextState: PuzzleState) => void;
  onJumpToPhase: (phase: AnimationSubPhase) => void;
}

export const SolverVisualizationSection: React.FC<SolverVisualizationSectionProps> = ({
  initialState,
  goalState,
  currentState,
  movedTile,
  highlightedCandidateTile,
  lastMoveDirection,
  currentStepIndex,
  totalSteps,
  currentStep,
  activeChosenCandidate,
  animationPhase,
  searchStatus,
  heuristicType,
  algorithmType,
  speed,
  currentH,
  solutionPath,
  onTileClick,
  onJumpToPhase
}) => {
  return (
    <section
      className="bg-white border border-[#E5D7DB] rounded-xl p-5 sm:p-6 shadow-xs space-y-5 scroll-mt-20"
      id="section-visualization"
      aria-label="GBFS Animation and Visualization"
    >
      {/* 1. SECTION HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5D7DB]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 bg-[#F0DDE1] text-[#800020] text-[11px] font-bold font-mono tracking-wider uppercase border border-[#E5D7DB] rounded">
            Live Display
          </span>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#292329]">
            1. Puzzle Visualization &amp; Animation
          </h2>
          <span
            className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
              searchStatus === 'running'
                ? 'bg-[#F0DDE1] text-[#800020] border-[#800020] animate-pulse font-bold'
                : searchStatus === 'completed'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                : 'bg-[#F8F5F5] text-[#71666B] border-[#E5D7DB]'
            }`}
          >
            {searchStatus === 'running'
              ? '● Animating Search Process'
              : searchStatus === 'completed'
              ? '✓ Goal State Reached'
              : 'Interactive Step Mode'}
          </span>
        </div>

        <span className="text-xs font-mono text-[#71666B]">
          Step {currentStepIndex > 0 ? currentStepIndex : 0} of {totalSteps}
        </span>
      </div>

      {/* 2. 4-PHASE GBFS ANIMATION PIPELINE BANNER */}
      <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl p-4 space-y-3" id="gbfs-phase-pipeline">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#71666B] uppercase text-[10px] font-bold">Search Phase:</span>
            <span className="font-bold text-[#800020] bg-white px-2.5 py-0.5 rounded border border-[#E5D7DB] shadow-2xs">
              {animationPhase === 'EXPAND' && 'Phase 1/4: Expanding Node from Priority Queue'}
              {animationPhase === 'EVALUATE' && 'Phase 2/4: Generating & Evaluating Successors'}
              {animationPhase === 'SELECT' && 'Phase 3/4: Greedy Selection (Lowest h(n))'}
              {animationPhase === 'SLIDE' && 'Phase 4/4: Sliding Tile & Updating State'}
            </span>
          </div>

          <div className="text-[#71666B] text-[11px]">
            {animationPhase === 'EXPAND' && `Extracting node ${currentStep?.selectedNode.nodeLabel || 'N0'} with min h(n) = ${currentStep?.selectedNode.h ?? currentH}`}
            {animationPhase === 'EVALUATE' && `Inspecting ${currentStep?.generatedNeighbors.length || 0} valid branch moves and calculating h(n)`}
            {animationPhase === 'SELECT' && (activeChosenCandidate ? `Choosing Tile ${activeChosenCandidate.movedTile} (${activeChosenCandidate.direction}) with min h(n) = ${activeChosenCandidate.h}` : 'Selecting best candidate')}
            {animationPhase === 'SLIDE' && `Physical tile sliding into blank position`}
          </div>
        </div>

        {/* Interactive Phase Stepper Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {[
            {
              phase: 'EXPAND' as AnimationSubPhase,
              number: '1',
              label: 'Expand Node',
              desc: 'Extract min h(n) from OPEN',
              icon: Layers
            },
            {
              phase: 'EVALUATE' as AnimationSubPhase,
              number: '2',
              label: 'Evaluate Successors',
              desc: 'Compute h(n) for all moves',
              icon: Sparkles
            },
            {
              phase: 'SELECT' as AnimationSubPhase,
              number: '3',
              label: 'Select Minimum h',
              desc: 'Greedy candidate selection',
              icon: CheckCircle2
            },
            {
              phase: 'SLIDE' as AnimationSubPhase,
              number: '4',
              label: 'Slide Tile',
              desc: 'Smooth physics transition',
              icon: ArrowRight
            }
          ].map(p => {
            const isActive = animationPhase === p.phase;
            return (
              <button
                key={p.phase}
                onClick={() => onJumpToPhase(p.phase)}
                disabled={totalSteps === 0}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 relative ${
                  isActive
                    ? 'bg-[#800020] text-white border-[#520018] shadow-sm ring-2 ring-[#800020]/30'
                    : 'bg-white text-[#292329] border-[#E5D7DB] hover:bg-[#F0DDE1]/40'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#F8F5F5] text-[#71666B]'
                  }`}>
                    Step {p.number}
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
                <span className="text-xs font-semibold leading-tight mt-0.5">
                  {p.label}
                </span>
                <span className={`text-[10px] font-sans ${
                  isActive ? 'text-white/80' : 'text-[#71666B]'
                }`}>
                  {p.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. THREE BOARDS IN A ROW: INITIAL | CURRENT (ANIMATED FOCUS) | GOAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Initial State */}
        <div className="flex flex-col items-center p-4 bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl space-y-2">
          <span className="text-xs font-mono text-[#71666B] font-semibold">Initial State</span>
          <PuzzleBoard
            state={initialState}
            goalState={goalState}
            interactive={false}
            title=""
          />
          <span className="text-[11px] font-mono text-[#71666B]">
            h(n) = {calculateHeuristic(initialState, goalState, heuristicType)}
          </span>
        </div>

        {/* Current State (Smooth Visual Focus) */}
        <div className="flex flex-col items-center p-5 bg-white border-2 border-[#800020] rounded-xl space-y-3 shadow-sm relative">
          <div className="flex items-center justify-between w-full text-xs font-mono">
            <span className="font-bold text-[#800020] uppercase">
              {currentStep ? currentStep.selectedNode.nodeLabel : 'Current State'}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="bg-[#800020] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                Step {currentStepIndex > 0 ? currentStepIndex : 0}
              </span>
              <span className="bg-[#F0DDE1] text-[#800020] px-2 py-0.5 rounded text-[10px] font-semibold border border-[#E5D7DB]">
                {animationPhase}
              </span>
            </div>
          </div>

          <PuzzleBoard
            state={currentState}
            goalState={goalState}
            movedTile={movedTile}
            highlightedCandidateTile={highlightedCandidateTile}
            lastMoveDirection={lastMoveDirection}
            onTileClick={onTileClick}
            interactive={searchStatus !== 'running'}
            speedMs={speed}
            animationPhase={animationPhase}
            title=""
          />

          <div className="flex items-center justify-between w-full text-xs font-mono bg-[#F8F5F5] px-3 py-1.5 rounded-lg border border-[#E5D7DB] text-[#292329]">
            <span>Heuristic: <strong className="text-[#800020] font-bold">h(n) = {currentH}</strong></span>
            <span>Path Cost: <strong className="text-[#292329]">g(n) = {currentStep ? currentStep.selectedNode.depth : 0}</strong></span>
          </div>
        </div>

        {/* Goal State */}
        <div className="flex flex-col items-center p-4 bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl space-y-2">
          <span className="text-xs font-mono text-emerald-700 font-semibold">Goal State</span>
          <PuzzleBoard
            state={goalState}
            goalState={goalState}
            interactive={false}
            title=""
          />
          <span className="text-[11px] font-mono text-emerald-700 font-semibold">
            h(n) = 0 (Solved)
          </span>
        </div>
      </div>

      {/* 4. HEURISTIC EVALUATION SUMMARY BAR */}
      <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
          <div>
            <span className="text-[#71666B] block text-[10px] uppercase">Algorithm</span>
            <strong className="text-[#292329]">{algorithmType}</strong>
          </div>

          <div>
            <span className="text-[#71666B] block text-[10px] uppercase">Heuristic Function</span>
            <strong className="text-[#292329]">{heuristicType === 'MANHATTAN' ? 'Manhattan (h₂)' : 'Misplaced (h₁)'}</strong>
          </div>

          <div>
            <span className="text-[#71666B] block text-[10px] uppercase">Evaluation Function</span>
            <strong className="text-[#800020] font-bold">{algorithmType === 'ASTAR' ? 'f(n) = g(n) + h(n)' : 'f(n) = h(n)'}</strong>
          </div>

          <div>
            <span className="text-[#71666B] block text-[10px] uppercase">Current Node Value</span>
            <strong className="text-[#800020] font-bold">f(n) = {currentH}</strong>
          </div>
        </div>
      </div>

      {/* 5. GENERATED SUCCESSORS & DECISION VISUALIZATION */}
      {currentStep && currentStep.generatedNeighbors && currentStep.generatedNeighbors.length > 0 && (
        <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl p-5 space-y-4" id="generated-successors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#E5D7DB] gap-2">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#800020]" />
              <span className="font-semibold text-[#292329] text-xs font-mono">
                Generated Successor Branches from Node {currentStep.selectedNode.nodeLabel} ({currentStep.generatedNeighbors.length} candidate moves)
              </span>
            </div>
            <span className="text-xs font-mono text-[#292329] bg-white px-2 py-0.5 rounded border border-[#E5D7DB]">
              GBFS Strategy: Greedily expands minimum <code className="font-bold text-[#800020]">h(n)</code>
            </span>
          </div>

          {/* Successor Candidate Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {currentStep.generatedNeighbors.map((succ, sIdx) => {
              const isChosenCandidate =
                activeChosenCandidate &&
                (activeChosenCandidate.node.id === succ.node.id ||
                  (succ.movedTile === activeChosenCandidate.movedTile &&
                    succ.direction === activeChosenCandidate.direction));
              const isSelectedPhase = animationPhase === 'SELECT' || animationPhase === 'SLIDE';
              const isHighlightCandidate = isChosenCandidate && isSelectedPhase;

              return (
                <motion.div
                  key={succ.node.id || sIdx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                    isHighlightCandidate
                      ? 'bg-white border-2 border-[#800020] ring-2 ring-[#800020]/20 shadow-sm'
                      : succ.isAlreadyClosed
                      ? 'bg-white/60 border-[#E5D7DB] opacity-60'
                      : 'bg-white border-[#E5D7DB] hover:border-[#800020]/40 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full text-[10px] font-mono text-[#292329] font-semibold">
                    <span>Move: {succ.direction}</span>
                    <span className="bg-[#F8F5F5] border border-[#E5D7DB] px-1.5 py-0.2 rounded text-[#71666B]">Tile {succ.movedTile}</span>
                  </div>

                  <MiniPuzzleBoard
                    state={succ.state}
                    size="sm"
                    highlightTile={succ.movedTile}
                  />

                  {/* Heuristic Value Badge */}
                  <div
                    className={`w-full text-center py-1 rounded border text-xs font-mono transition-colors ${
                      isHighlightCandidate
                        ? 'bg-[#800020] text-white border-[#520018] font-bold'
                        : animationPhase === 'EVALUATE'
                        ? 'bg-[#F0DDE1] text-[#800020] border-[#E5D7DB] font-semibold'
                        : 'bg-[#F8F5F5] text-[#292329] border-[#E5D7DB]'
                    }`}
                  >
                    <span>h(n) = {succ.h}</span>
                  </div>

                  {/* Decision Tag */}
                  {isHighlightCandidate ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded w-full text-center flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Selected Min h(n)</span>
                    </span>
                  ) : succ.isAlreadyClosed ? (
                    <span className="text-[10px] font-mono text-[#71666B] bg-[#F8F5F5] border border-[#E5D7DB] px-2 py-0.5 rounded w-full text-center">
                      In Closed Set
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[#800020] bg-[#F0DDE1]/60 border border-[#E5D7DB] px-2 py-0.5 rounded w-full text-center">
                      Queued in OPEN
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* GBFS Academic Explanation Box */}
          {activeChosenCandidate && (
            <div className="p-3 bg-white border border-[#E5D7DB] rounded-lg text-xs font-sans text-[#292329] flex items-start gap-2 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#800020] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#520018] font-semibold">GBFS Selection Reasoning: </strong>
                Node generated by sliding Tile <strong className="font-mono text-[#800020]">{activeChosenCandidate.movedTile}</strong> ({activeChosenCandidate.direction}) produces the minimal heuristic estimate <strong className="font-mono text-[#800020]">h(n) = {activeChosenCandidate.h}</strong>. GBFS places all candidate branches into the priority queue and expands this lowest heuristic branch next.
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. FINAL SOLUTION PATH (PROMINENT DISPLAY) */}
      {solutionPath && solutionPath.length > 0 && (
        <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl p-5 space-y-4" id="final-solution-path">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5D7DB]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-[#292329] text-xs font-mono">
                Final Solution Path ({solutionPath.length - 1} moves to reach Goal State)
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-semibold">
              ✓ Solved
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1">
            {solutionPath.map((stepNode, idx) => (
              <div key={stepNode.id || idx} className="flex items-center gap-3 shrink-0">
                <div className="flex flex-col items-center gap-1.5 p-2 bg-white rounded-lg border border-[#E5D7DB] shadow-2xs">
                  <div className="text-[10px] font-mono text-[#71666B] font-semibold">
                    {idx === 0 ? 'Initial' : `Step ${idx}`}
                  </div>
                  <MiniPuzzleBoard
                    state={stepNode.state}
                    size="sm"
                    highlightTile={stepNode.movedTile}
                  />
                  <div className="text-[10px] font-mono text-center">
                    {stepNode.move && stepNode.move !== 'START' ? (
                      <span className="text-[#800020] font-bold">{stepNode.move} (Tile {stepNode.movedTile})</span>
                    ) : (
                      <span className="text-[#71666B]">Start</span>
                    )}
                    <span className="block text-[#71666B] text-[9px]">h(n)={stepNode.h}</span>
                  </div>
                </div>
                {idx < solutionPath.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-[#71666B] shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
