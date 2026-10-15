import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Clock,
  Keyboard
} from 'lucide-react';
import {
  SolverResult,
  PuzzleState,
  SolvabilityCheck,
  HeuristicType,
  AlgorithmType
} from '../types';
import { calculateManhattanDistance, DEFAULT_GOAL_STATE } from '../utils/puzzleEngine';

export interface InteractiveControlsSectionProps {
  initialState: PuzzleState;
  goalState?: PuzzleState;
  currentState: PuzzleState;
  solverResult: SolverResult | null;
  currentStepIndex: number;
  totalSteps: number;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  speed: number;
  solvability: SolvabilityCheck;
  heuristicType: HeuristicType;
  algorithmType: AlgorithmType;
  activeExecutionTimeMs?: number;
  onRun: () => void;
  onPause: () => void;
  onResume: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onReset: () => void;
  onSpeedChange: (speedMs: number) => void;
}

export const InteractiveControlsSection: React.FC<InteractiveControlsSectionProps> = ({
  initialState,
  goalState = DEFAULT_GOAL_STATE,
  currentState,
  solverResult,
  currentStepIndex,
  totalSteps,
  isRunning,
  isPaused,
  isCompleted,
  speed,
  solvability,
  algorithmType,
  activeExecutionTimeMs = 0,
  onRun,
  onPause,
  onResume,
  onNextStep,
  onPrevStep,
  onReset,
  onSpeedChange
}) => {
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const liveHeuristic = calculateManhattanDistance(currentState, goalState);
  const currentStep = solverResult?.steps && currentStepIndex > 0
    ? solverResult.steps[currentStepIndex - 1]
    : null;

  // Compute canonical status
  let searchStatus: 'READY' | 'RUNNING' | 'PAUSED' | 'SOLUTION_FOUND' | 'NO_SOLUTION' = 'READY';
  if (isRunning) {
    searchStatus = 'RUNNING';
  } else if (isPaused) {
    searchStatus = 'PAUSED';
  } else if (isCompleted) {
    searchStatus = solverResult?.success ? 'SOLUTION_FOUND' : 'NO_SOLUTION';
  } else if (currentStepIndex > 0) {
    searchStatus = 'PAUSED';
  }

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement;
      if (isInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) {
          onPause();
        } else if (isPaused) {
          onResume();
        } else {
          onRun();
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (!isRunning) {
          onNextStep();
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (!isRunning) {
          onPrevStep();
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        onReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isRunning,
    isPaused,
    onPause,
    onResume,
    onRun,
    onNextStep,
    onPrevStep,
    onReset
  ]);

  const isGoalReached = searchStatus === 'SOLUTION_FOUND';
  const isRunDisabled = isRunning || isPaused || isGoalReached || !solvability.isSolvable;
  const isPauseDisabled = !isRunning;
  const isResumeDisabled = !isPaused || isRunning || isGoalReached;
  const isNextDisabled = isRunning || isGoalReached || !solvability.isSolvable;
  const isPrevDisabled = currentStepIndex <= 0 || isRunning;

  return (
    <section
      className="bg-white border border-[#E5D7DB] rounded-xl p-5 sm:p-6 shadow-xs space-y-5 scroll-mt-20"
      id="section-interactive-controls"
      aria-label="Execution Controls"
    >
      {/* 1. HEADER & INTRODUCTORY DESCRIPTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5D7DB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#F0DDE1] text-[#800020] text-[11px] font-bold font-mono tracking-wider uppercase border border-[#E5D7DB] rounded">
              Controls
            </span>
            <h2 className="text-xl font-serif font-bold text-[#292329]">
              Execution Controls
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#71666B] font-sans mt-1 leading-relaxed max-w-3xl">
            Directly control the search execution immediately below the visualization. Start, pause, resume, step forward/backward, and adjust animation speed.
          </p>
        </div>

        {/* Algorithm Formulation Tag */}
        <div className="flex items-center gap-2 font-mono text-xs self-start sm:self-auto">
          <span className="px-2.5 py-1 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg text-[#71666B]">
            Algorithm: <strong className="text-[#292329]">{algorithmType}</strong>
          </span>
          <span className="px-2.5 py-1 bg-[#F0DDE1] border border-[#E5D7DB] rounded-lg text-[#800020] font-semibold">
            {algorithmType === 'ASTAR' ? 'f(n) = g(n) + h(n)' : 'f(n) = h(n)'}
          </span>
        </div>
      </div>

      {/* 2. STATUS INDICATOR BAR & STEP PROGRESS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl p-3.5">
        {/* Status Indicator */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#71666B] uppercase font-semibold">
            Status:
          </span>
          {searchStatus === 'READY' && (
            <span
              id="status-indicator-ready"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-[#292329] border border-[#E5D7DB] rounded-md font-mono text-xs font-semibold shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#71666B]" />
              ● READY
            </span>
          )}
          {searchStatus === 'RUNNING' && (
            <span
              id="status-indicator-running"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#800020] text-white border border-[#520018] rounded-md font-mono text-xs font-semibold shadow-2xs animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              ▶ RUNNING
            </span>
          )}
          {searchStatus === 'PAUSED' && (
            <span
              id="status-indicator-paused"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0DDE1] text-[#800020] border border-[#800020] rounded-md font-mono text-xs font-semibold shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#800020]" />
              ⏸ PAUSED
            </span>
          )}
          {searchStatus === 'SOLUTION_FOUND' && (
            <span
              id="status-indicator-completed"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-md font-mono text-xs font-semibold shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              ✓ GOAL REACHED
            </span>
          )}
          {searchStatus === 'NO_SOLUTION' && (
            <span
              id="status-indicator-failed"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-800 border border-rose-300 rounded-md font-mono text-xs font-semibold shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              ✗ TERMINATED
            </span>
          )}
        </div>

        {/* Current Step Tracker */}
        <div className="flex items-center sm:justify-center gap-2 font-mono text-xs text-[#292329]">
          <span className="text-[#71666B]">Progress:</span>
          <span
            id="current-step-display"
            className="px-2.5 py-0.5 bg-white border border-[#E5D7DB] rounded font-bold text-[#800020] text-sm shadow-2xs"
          >
            {totalSteps > 0 ? `${currentStepIndex} / ${totalSteps}` : `Step ${currentStepIndex}`}
          </span>
        </div>

        {/* Active Heuristic & Timer */}
        <div className="flex items-center sm:justify-end gap-3 font-mono text-xs text-[#292329]">
          <span>
            h(n) = <strong className="text-[#800020] font-bold">{currentStep ? currentStep.selectedNode.h : liveHeuristic}</strong>
          </span>
          {activeExecutionTimeMs > 0 && (
            <span className="flex items-center gap-1 text-[#71666B] bg-white px-2 py-0.5 border border-[#E5D7DB] rounded">
              <Clock className="w-3 h-3 text-[#71666B]" />
              {activeExecutionTimeMs.toFixed(1)}ms
            </span>
          )}
        </div>
      </div>

      {/* 3. PRIMARY CONTROL BUTTONS (ROW 1 & ROW 2) */}
      <div className="space-y-3">
        {/* Row 1: [ Run ] [ Pause ] [ Resume ] */}
        <div className="grid grid-cols-3 gap-3">
          {/* 1. RUN */}
          <button
            onClick={onRun}
            disabled={isRunDisabled}
            id="btn-run-search"
            className={`py-3 px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
              !isRunDisabled
                ? 'bg-[#800020] hover:bg-[#520018] text-white active:scale-98 shadow-sm'
                : 'bg-[#F8F5F5] text-[#71666B]/50 border border-[#E5D7DB] cursor-not-allowed opacity-60'
            }`}
            title="Start or restart the GBFS automatic search from step 0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run</span>
          </button>

          {/* 2. PAUSE */}
          <button
            onClick={onPause}
            disabled={isPauseDisabled}
            id="btn-pause-search"
            className={`py-3 px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
              !isPauseDisabled
                ? 'bg-[#A52A3A] hover:bg-[#800020] text-white active:scale-98 shadow-sm'
                : 'bg-[#F8F5F5] text-[#71666B]/50 border border-[#E5D7DB] cursor-not-allowed opacity-60'
            }`}
            title="Pause the active search animation at current step"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>Pause</span>
          </button>

          {/* 3. RESUME */}
          <button
            onClick={onResume}
            disabled={isResumeDisabled}
            id="btn-resume-search"
            className={`py-3 px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
              !isResumeDisabled
                ? 'bg-[#800020] hover:bg-[#520018] text-white active:scale-98 shadow-sm'
                : 'bg-[#F8F5F5] text-[#71666B]/50 border border-[#E5D7DB] cursor-not-allowed opacity-60'
            }`}
            title="Resume search animation from where it was paused"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume</span>
          </button>
        </div>

        {/* Row 2: [ Previous ] [ Next Step ] [ Reset ] */}
        <div className="grid grid-cols-3 gap-3">
          {/* 4. PREVIOUS STEP */}
          <button
            onClick={onPrevStep}
            disabled={isPrevDisabled}
            id="btn-prev-step"
            className={`py-3 px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
              !isPrevDisabled
                ? 'bg-white hover:bg-[#F0DDE1]/60 text-[#800020] border border-[#E5D7DB] hover:border-[#800020] active:scale-98'
                : 'bg-[#F8F5F5] text-[#71666B]/50 border border-[#E5D7DB] cursor-not-allowed opacity-60'
            }`}
            title="Return to the previous recorded search step"
          >
            <SkipBack className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* 5. NEXT STEP */}
          <button
            onClick={onNextStep}
            disabled={isNextDisabled}
            id="btn-next-step"
            className={`py-3 px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
              !isNextDisabled
                ? 'bg-white hover:bg-[#F0DDE1]/60 text-[#800020] border border-[#800020] active:scale-98 font-bold'
                : 'bg-[#F8F5F5] text-[#71666B]/50 border border-[#E5D7DB] cursor-not-allowed opacity-60'
            }`}
            title="Advance exactly one recorded search step"
          >
            <SkipForward className="w-4 h-4" />
            <span>Next Step</span>
          </button>

          {/* 6. RESET */}
          <button
            onClick={onReset}
            id="btn-reset-search"
            className="py-3 px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-white hover:bg-[#F0DDE1]/60 text-[#800020] border border-[#E5D7DB] hover:border-[#800020] transition-all cursor-pointer shadow-xs active:scale-98"
            title="Stop search and restore the original puzzle"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 4. ANIMATION SPEED CONTROLS */}
      <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl p-3.5 space-y-2.5" id="speed-control-panel">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-[#292329] uppercase tracking-wider">
            Animation Speed:
          </span>
          <span className="text-[#71666B]">
            Delay: <strong className="text-[#800020] font-semibold">{speed} ms</strong> per step
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Slow', ms: 1200 },
            { label: 'Normal', ms: 700 },
            { label: 'Fast', ms: 250 }
          ].map((s) => {
            const isSelected = speed === s.ms;
            return (
              <button
                key={s.label}
                onClick={() => onSpeedChange(s.ms)}
                className={`py-2 px-3 text-center rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#800020] text-white border-[#520018] font-bold shadow-xs'
                    : 'bg-white hover:bg-[#F0DDE1]/40 text-[#292329] border-[#E5D7DB]'
                }`}
              >
                {s.label} ({s.ms}ms)
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. LIVE SEARCH METRICS PREVIEW & SUMMARY SNAPSHOT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-3 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg space-y-1">
          <span className="text-[11px] text-[#71666B] uppercase block font-semibold">Active Node</span>
          <div className="flex items-center justify-between">
            <span className="text-[#292329] font-bold text-sm">
              {currentStep ? currentStep.selectedNode.nodeLabel : 'N0 (Initial)'}
            </span>
            <span className="text-[11px] text-[#71666B]">
              Depth g(n) = {currentStep ? currentStep.selectedNode.depth : 0}
            </span>
          </div>
        </div>

        <div className="p-3 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg space-y-1">
          <span className="text-[11px] text-[#71666B] uppercase block font-semibold">Evaluation Function</span>
          <div className="flex items-center justify-between">
            <span className="text-[#800020] font-bold text-sm">
              f(n) = {currentStep ? currentStep.selectedNode.f : liveHeuristic}
            </span>
            <span className="text-[11px] text-[#71666B]">
              h(n) = {currentStep ? currentStep.selectedNode.h : liveHeuristic}
            </span>
          </div>
        </div>

        <div className="p-3 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg space-y-1">
          <span className="text-[11px] text-[#71666B] uppercase block font-semibold">Frontier / Explored</span>
          <div className="flex items-center justify-between">
            <span className="text-[#292329] font-bold text-sm">
              {currentStep ? currentStep.frontierSnapshot.length : 0} OPEN
            </span>
            <span className="text-[#71666B] text-xs">
              {currentStep ? currentStep.exploredSnapshot.length : 0} CLOSED
            </span>
          </div>
        </div>
      </div>

      {/* 6. KEYBOARD SHORTCUTS REFERENCE */}
      <div className="border border-[#E5D7DB] rounded-lg p-3 bg-[#F8F5F5]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#292329]">
            <Keyboard className="w-3.5 h-3.5 text-[#800020]" />
            <span>Keyboard Shortcuts</span>
          </div>
          <button
            onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
            className="text-[11px] font-mono text-[#800020] hover:underline cursor-pointer"
          >
            {showKeyboardHelp ? 'Hide Shortcuts' : 'Show Shortcuts'}
          </button>
        </div>

        {showKeyboardHelp && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
            <div className="bg-white p-2 border border-[#E5D7DB] rounded flex items-center justify-between">
              <span className="text-[#71666B] text-[11px]">Run / Pause / Resume:</span>
              <kbd className="px-2 py-0.5 bg-[#F8F5F5] border border-[#E5D7DB] rounded font-bold text-[10px] text-[#292329]">
                Space
              </kbd>
            </div>
            <div className="bg-white p-2 border border-[#E5D7DB] rounded flex items-center justify-between">
              <span className="text-[#71666B] text-[11px]">Next Step:</span>
              <kbd className="px-2 py-0.5 bg-[#F8F5F5] border border-[#E5D7DB] rounded font-bold text-[10px] text-[#292329]">
                → Arrow
              </kbd>
            </div>
            <div className="bg-white p-2 border border-[#E5D7DB] rounded flex items-center justify-between">
              <span className="text-[#71666B] text-[11px]">Previous Step:</span>
              <kbd className="px-2 py-0.5 bg-[#F8F5F5] border border-[#E5D7DB] rounded font-bold text-[10px] text-[#292329]">
                ← Arrow
              </kbd>
            </div>
            <div className="bg-white p-2 border border-[#E5D7DB] rounded flex items-center justify-between">
              <span className="text-[#71666B] text-[11px]">Reset:</span>
              <kbd className="px-2 py-0.5 bg-[#F8F5F5] border border-[#E5D7DB] rounded font-bold text-[10px] text-[#292329]">
                R Key
              </kbd>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
