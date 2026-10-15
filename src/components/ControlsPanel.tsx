import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sparkles,
  Shuffle,
  Bookmark,
  Gauge,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Difficulty, SolvabilityCheck, HeuristicType } from '../types';
import { PRESET_PUZZLES, getHeuristicInfo } from '../utils/puzzleEngine';

interface ControlsPanelProps {
  isRunning: boolean;
  isPaused: boolean;
  hasSolution: boolean;
  currentStepIndex: number;
  totalSteps: number;
  difficulty: Difficulty;
  speed: number;
  solvability: SolvabilityCheck;
  heuristicType?: HeuristicType;
  onHeuristicChange?: (newType: HeuristicType) => void;
  onSolve: () => void;
  onAutoPlay: () => void;
  onPause: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onReset: () => void;
  onRandomize: (diff: Difficulty) => void;
  onSelectPreset: (presetIndex: number) => void;
  onUseDefault: () => void;
  onSpeedChange: (speed: number) => void;
  onDifficultyChange: (diff: Difficulty) => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  isRunning,
  isPaused,
  hasSolution,
  currentStepIndex,
  totalSteps,
  difficulty,
  speed,
  solvability,
  heuristicType = 'MANHATTAN',
  onHeuristicChange,
  onSolve,
  onAutoPlay,
  onPause,
  onNextStep,
  onPrevStep,
  onReset,
  onRandomize,
  onSelectPreset,
  onUseDefault,
  onSpeedChange,
  onDifficultyChange
}) => {
  return (
    <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-5 sm:p-6 flex flex-col gap-5 shadow-sm">
      {/* Primary Execution Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-[#1A1A1A]/20">
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Main Solve / Auto Play / Pause button */}
          {!isRunning && currentStepIndex === 0 ? (
            <button
              onClick={onSolve}
              disabled={!solvability.isSolvable}
              id="btn-solve-gbfs"
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer border border-[#1A1A1A] ${
                solvability.isSolvable
                  ? 'bg-[#1A1A1A] text-white hover:bg-[#D95D39]'
                  : 'bg-[#E5E2D9] text-[#1A1A1A]/40 cursor-not-allowed border-[#1A1A1A]/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Solve with GBFS</span>
            </button>
          ) : isRunning ? (
            <button
              onClick={onPause}
              id="btn-pause-gbfs"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 font-bold text-xs uppercase tracking-widest bg-[#D95D39] hover:bg-[#1A1A1A] text-white border border-[#1A1A1A] transition-colors cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={onAutoPlay}
              disabled={currentStepIndex >= totalSteps}
              id="btn-resume-gbfs"
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer border border-[#1A1A1A] ${
                currentStepIndex < totalSteps
                  ? 'bg-[#1A1A1A] hover:bg-[#D95D39] text-white'
                  : 'bg-[#E5E2D9] text-[#1A1A1A]/40 cursor-not-allowed border-[#1A1A1A]/30'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Auto Play</span>
            </button>
          )}

          {/* Step-by-Step Navigation */}
          <div className="flex items-center bg-[#E5E2D9] border border-[#1A1A1A] p-1">
            <button
              onClick={onPrevStep}
              disabled={currentStepIndex <= 0 || isRunning}
              id="btn-prev-step"
              className="p-1.5 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white disabled:text-[#1A1A1A]/30 disabled:hover:bg-transparent disabled:hover:text-[#1A1A1A]/30 transition-colors cursor-pointer"
              title="Previous Step"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <span className="px-3 text-xs font-mono font-bold text-[#1A1A1A] select-none whitespace-nowrap">
              {totalSteps > 0 ? `${currentStepIndex} / ${totalSteps}` : 'Step 0'}
            </span>

            <button
              onClick={onNextStep}
              disabled={(totalSteps > 0 && currentStepIndex >= totalSteps) || isRunning || !solvability.isSolvable}
              id="btn-next-step"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-mono uppercase tracking-wider bg-[#F9F7F2] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] border border-[#1A1A1A] disabled:opacity-30 disabled:hover:bg-[#F9F7F2] disabled:hover:text-[#1A1A1A] transition-colors cursor-pointer"
              title="Perform exactly 1 GBFS Iteration"
            >
              <span>Next</span>
              <SkipForward className="w-3 h-3" />
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={onReset}
            id="btn-reset-puzzle"
            className="p-2 bg-[#E5E2D9] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] border border-[#1A1A1A] transition-colors cursor-pointer"
            title="Reset Search and Board to Initial"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Adjustment Slider */}
        <div className="flex items-center gap-2 bg-[#E5E2D9] px-3 py-1.5 border border-[#1A1A1A]">
          <Gauge className="w-3.5 h-3.5 text-[#1A1A1A]/70" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 whitespace-nowrap">Speed:</span>
          <div className="flex items-center gap-1">
            {[
              { label: '0.5x', val: 1200 },
              { label: '1x', val: 500 },
              { label: '2x', val: 200 },
              { label: '5x', val: 50 }
            ].map(s => (
              <button
                key={s.label}
                onClick={() => onSpeedChange(s.val)}
                className={`px-2 py-0.5 text-xs font-mono font-bold transition-colors cursor-pointer border ${
                  speed === s.val
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-[#F9F7F2] text-[#1A1A1A] border-[#1A1A1A]/30 hover:border-[#1A1A1A]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preset & Puzzle Generator Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Heuristic Function Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/70 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#D95D39]" />
            <span>Heuristic f(n)=h(n)</span>
          </label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onHeuristicChange && onHeuristicChange('MANHATTAN')}
              className={`flex-1 py-1.5 px-2 text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                heuristicType === 'MANHATTAN'
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-[#E5E2D9] text-[#1A1A1A] border-[#1A1A1A]/40 hover:bg-[#F9F7F2]'
              }`}
            >
              Manhattan (h₂)
            </button>
            <button
              onClick={() => onHeuristicChange && onHeuristicChange('MISPLACED')}
              className={`flex-1 py-1.5 px-2 text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                heuristicType === 'MISPLACED'
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-[#E5E2D9] text-[#1A1A1A] border-[#1A1A1A]/40 hover:bg-[#F9F7F2]'
              }`}
            >
              Misplaced (h₁)
            </button>
          </div>
        </div>

        {/* Solvable Random Generator */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/70 flex items-center gap-1.5">
            <Shuffle className="w-3 h-3 text-[#D95D39]" />
            <span>Generate Solvable</span>
          </label>
          <div className="flex items-center gap-1">
            {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => {
                  onDifficultyChange(d);
                  onRandomize(d);
                }}
                className={`flex-1 py-1.5 px-2 text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  difficulty === d
                    ? 'bg-[#D95D39] text-white border-[#1A1A1A]'
                    : 'bg-[#E5E2D9] text-[#1A1A1A] border-[#1A1A1A]/40 hover:bg-[#F9F7F2]'
                }`}
              >
                {d.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Academic Presets Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/70 flex items-center gap-1.5">
            <Bookmark className="w-3 h-3 text-[#D95D39]" />
            <span>Benchmark Presets</span>
          </label>
          <select
            onChange={(e) => {
              const idx = parseInt(e.target.value, 10);
              if (!isNaN(idx)) onSelectPreset(idx);
            }}
            defaultValue=""
            className="w-full py-1.5 px-2.5 text-xs font-mono font-bold bg-[#E5E2D9] border border-[#1A1A1A] text-[#1A1A1A] focus:outline-hidden cursor-pointer"
          >
            <option value="" disabled>Select a Preset Case...</option>
            {PRESET_PUZZLES.map((preset, idx) => (
              <option key={idx} value={idx}>
                {preset.name} ({preset.difficulty})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Reset to Default */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/70 flex items-center gap-1.5">
            <RotateCcw className="w-3 h-3 text-[#D95D39]" />
            <span>Standard Setup</span>
          </label>
          <button
            onClick={onUseDefault}
            className="w-full py-1.5 px-3 text-xs font-mono font-bold uppercase tracking-wider bg-[#E5E2D9] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] border border-[#1A1A1A] transition-colors cursor-pointer text-center"
          >
            Reset Default Goal & Puzzle
          </button>
        </div>
      </div>

      {/* Solvability & Parity Verification Info Box */}
      <div className={`p-3 border text-xs flex items-start gap-2.5 ${
        solvability.isSolvable
          ? 'bg-[#E5E2D9] border-[#1A1A1A] text-[#1A1A1A]'
          : 'bg-[#D95D39] border-[#1A1A1A] text-white'
      }`}>
        {solvability.isSolvable ? (
          <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5 animate-pulse" />
        )}
        <div className="flex-1">
          <div className="font-bold uppercase tracking-wider text-[11px] mb-0.5">
            {solvability.isSolvable ? 'Configuration Verified Solvable' : 'Unsolvable State Detected'}
          </div>
          <p className={`text-[11px] leading-relaxed ${solvability.isSolvable ? 'text-[#1A1A1A]/80 font-mono' : 'text-white font-mono'}`}>
            {solvability.reason}
          </p>
        </div>
      </div>
    </div>
  );
};
