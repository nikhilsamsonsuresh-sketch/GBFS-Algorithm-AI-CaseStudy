import React from 'react';
import {
  Shuffle,
  Edit3,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  Difficulty,
  PuzzleState,
  SolvabilityCheck
} from '../types';
import {
  validatePuzzleState,
  PRESET_PUZZLES
} from '../utils/puzzleEngine';

export interface PuzzleDifficultySectionProps {
  initialState: PuzzleState;
  goalState: PuzzleState;
  selectedDifficulty: Difficulty;
  inputTab: 'preset' | 'custom';
  editableInitial: number[];
  editableGoal: number[];
  solvability: SolvabilityCheck;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onRandomize: (difficulty: Difficulty) => void;
  onSelectPreset: (presetIndex: number) => void;
  onSetInputTab: (tab: 'preset' | 'custom') => void;
  onEditableTileChange: (type: 'initial' | 'goal', index: number, value: string) => void;
  onApplyInlineCustom: () => void;
  onResetInlineDefaults: () => void;
  onOpenCustomModal: () => void;
}

export const PuzzleDifficultySection: React.FC<PuzzleDifficultySectionProps> = ({
  selectedDifficulty,
  inputTab,
  editableInitial,
  editableGoal,
  solvability,
  onSelectDifficulty,
  onRandomize,
  onSelectPreset,
  onSetInputTab,
  onEditableTileChange,
  onApplyInlineCustom,
  onResetInlineDefaults,
  onOpenCustomModal
}) => {
  const initValid = validatePuzzleState(editableInitial);
  const goalValid = validatePuzzleState(editableGoal);
  const isValid = initValid.valid && goalValid.valid;

  return (
    <section
      className="bg-white border border-[#E5D7DB] rounded-xl p-5 sm:p-6 shadow-xs space-y-6 scroll-mt-20"
      id="section-puzzle-input"
      aria-label="Puzzle Difficulty and Input"
    >
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5D7DB] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#F0DDE1] text-[#800020] text-[11px] font-bold font-mono tracking-wider uppercase border border-[#E5D7DB] rounded">
              Configuration
            </span>
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#292329]">
              Puzzle Input &amp; Difficulty
            </h2>
          </div>
          <p className="text-xs font-sans text-[#71666B] mt-0.5">
            Two methods provided: custom 3×3 grid entry (Method 1) or guaranteed solvable random generation (Method 2).
          </p>
        </div>

        {/* Solvability Status Badge */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#71666B] font-semibold">Parity Check:</span>
          <span
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 border ${
              solvability.isSolvable
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            {solvability.isSolvable ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>✓ Solvable ({solvability.initialInversions} vs {solvability.goalInversions} inv)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>✗ Unsolvable ({solvability.initialInversions} vs {solvability.goalInversions} inv)</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* 2. METHOD 2: GENERATE RANDOM SOLVABLE PUZZLE & DIFFICULTY */}
      <div className="p-4 bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-mono text-[#292329] font-bold uppercase tracking-wider">
            Method 2: Generate Random Solvable Puzzle
          </span>
          <span className="text-[11px] font-mono text-emerald-700 font-semibold">
            ✓ Guaranteed Solvable (No Unsolvable States Generated)
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-[#71666B]">
              Difficulty:
            </span>
            {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(diff => {
              const isSelected = selectedDifficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => {
                    onSelectDifficulty(diff);
                    onRandomize(diff);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? diff === 'EASY'
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                        : diff === 'MEDIUM'
                        ? 'bg-[#800020] text-white border-[#520018] shadow-xs'
                        : 'bg-[#520018] text-white border-[#520018] shadow-xs'
                      : 'bg-white text-[#292329] border-[#E5D7DB] hover:bg-[#F0DDE1]/40'
                  }`}
                >
                  {diff === 'EASY' && 'Easy (2–6 moves)'}
                  {diff === 'MEDIUM' && 'Medium (6–14 moves)'}
                  {diff === 'HARD' && 'Hard (14–26 moves)'}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onRandomize(selectedDifficulty)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-mono font-bold bg-[#800020] hover:bg-[#520018] text-white rounded-lg shadow-xs transition-colors cursor-pointer active:scale-98"
          >
            <Shuffle className="w-4 h-4" />
            <span>Generate Random Puzzle</span>
          </button>
        </div>
      </div>

      {/* 3. INPUT METHOD TABS: METHOD 1 (CUSTOM 3x3) vs PRESET SCENARIOS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E5D7DB] pb-2 text-xs font-mono">
          <button
            onClick={() => onSetInputTab('custom')}
            className={`px-4 py-1.5 rounded-t-lg font-semibold transition-colors cursor-pointer border-b-2 ${
              inputTab === 'custom'
                ? 'border-[#800020] text-[#800020] bg-white'
                : 'border-transparent text-[#71666B] hover:text-[#292329]'
            }`}
          >
            Method 1: Enter Initial &amp; Goal States (3×3 Grid)
          </button>
          <button
            onClick={() => onSetInputTab('preset')}
            className={`px-4 py-1.5 rounded-t-lg font-semibold transition-colors cursor-pointer border-b-2 ${
              inputTab === 'preset'
                ? 'border-[#800020] text-[#800020] bg-white'
                : 'border-transparent text-[#71666B] hover:text-[#292329]'
            }`}
          >
            Preset Benchmark Puzzles
          </button>
        </div>

        {/* TAB 1: PRESET PUZZLES */}
        {inputTab === 'preset' && (
          <div className="space-y-4">
            {/* Quick Dropdown Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8F5F5] p-3 rounded-lg border border-[#E5D7DB] text-xs font-mono">
              <label htmlFor="preset-select" className="text-[#292329] font-semibold">
                Select Preset Scenario:
              </label>
              <select
                id="preset-select"
                onChange={(e) => onSelectPreset(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 bg-white border border-[#E5D7DB] rounded-lg text-[#292329] focus:outline-none focus:ring-2 focus:ring-[#800020]/30 font-sans cursor-pointer text-xs"
              >
                <option value="">-- Choose a Preset Puzzle --</option>
                {PRESET_PUZZLES.map((preset, idx) => (
                  <option key={preset.name} value={idx}>
                    {preset.name} ({preset.difficulty}) - {preset.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Presets Grid Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRESET_PUZZLES.map((preset, idx) => (
                <button
                  key={preset.name}
                  onClick={() => onSelectPreset(idx)}
                  className="p-3 text-left rounded-lg border border-[#E5D7DB] hover:border-[#800020] hover:bg-[#F0DDE1]/20 transition-all cursor-pointer group bg-white shadow-2xs"
                >
                  <span className="text-xs font-mono font-semibold text-[#292329] group-hover:text-[#800020] block">
                    {preset.name}
                  </span>
                  <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-[#71666B]">
                    <span className="truncate pr-1">{preset.description.split('.')[0]}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-semibold ${
                        preset.difficulty.toLowerCase() === 'easy'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : preset.difficulty.toLowerCase() === 'medium'
                          ? 'bg-amber-50 text-amber-800 border border-amber-300'
                          : 'bg-rose-50 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {preset.difficulty}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOM PUZZLE INPUT (3x3 GRIDS) */}
        {inputTab === 'custom' && (
          <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E5D7DB]">
              <span className="text-xs font-mono text-[#292329] font-semibold">
                Directly edit the 3×3 grid tiles (use digits 1–8 and 0 for the blank tile):
              </span>
              <button
                onClick={onOpenCustomModal}
                className="text-xs font-mono text-[#800020] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Open Full Custom Editor ⚙</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Initial State Editable Grid */}
              <div className="bg-white p-4 rounded-xl border border-[#E5D7DB] space-y-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#292329]">Initial State (3×3 Grid)</span>
                  <span className={`text-[11px] font-semibold ${initValid.valid ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {initValid.valid ? '✓ Valid (0-8 distinct)' : initValid.error}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 w-48 mx-auto p-2 bg-[#F8F5F5] rounded-xl border border-[#E5D7DB]">
                  {editableInitial.map((tile, idx) => (
                    <input
                      key={`init-${idx}`}
                      type="number"
                      min={0}
                      max={8}
                      value={tile === 0 ? '' : tile}
                      placeholder="0"
                      onChange={(e) => onEditableTileChange('initial', idx, e.target.value)}
                      className={`w-12 h-12 text-center font-mono font-bold text-base rounded-lg border transition-all ${
                        tile === 0
                          ? 'bg-[#F8F5F5] border-dashed border-[#E5D7DB] text-[#71666B] placeholder:text-[#71666B]/60'
                          : 'bg-white border-[#E5D7DB] text-[#800020] shadow-2xs focus:border-[#800020] focus:ring-1 focus:ring-[#800020]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] font-sans text-[#71666B] text-center">
                  Format: [ 2 ][ 8 ][ 3 ][ 1 ][ 6 ][ 4 ][ 7 ][ 0 ][ 5 ]
                </p>
              </div>

              {/* Goal State Editable Grid */}
              <div className="bg-white p-4 rounded-xl border border-[#E5D7DB] space-y-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-emerald-800">Goal State (3×3 Grid)</span>
                  <span className={`text-[11px] font-semibold ${goalValid.valid ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {goalValid.valid ? '✓ Valid (0-8 distinct)' : goalValid.error}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 w-48 mx-auto p-2 bg-[#F8F5F5] rounded-xl border border-[#E5D7DB]">
                  {editableGoal.map((tile, idx) => (
                    <input
                      key={`goal-${idx}`}
                      type="number"
                      min={0}
                      max={8}
                      value={tile === 0 ? '' : tile}
                      placeholder="0"
                      onChange={(e) => onEditableTileChange('goal', idx, e.target.value)}
                      className={`w-12 h-12 text-center font-mono font-bold text-base rounded-lg border transition-all ${
                        tile === 0
                          ? 'bg-[#F8F5F5] border-dashed border-[#E5D7DB] text-[#71666B] placeholder:text-[#71666B]/60'
                          : 'bg-white border-[#E5D7DB] text-emerald-700 shadow-2xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] font-sans text-[#71666B] text-center">
                  Default Goal: [ 1 ][ 2 ][ 3 ][ 8 ][ 0 ][ 4 ][ 7 ][ 6 ][ 5 ]
                </p>
              </div>
            </div>

            {/* Validation Checklist (Method 1 Requirements) */}
            <div className="bg-white p-3.5 rounded-lg border border-[#E5D7DB] text-xs font-mono space-y-1.5">
              <span className="font-bold text-[#71666B] uppercase text-[10px] block">
                Validation Criteria (Both Initial &amp; Goal States):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-[#292329]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>9 positions</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#292329]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Numbers 1–8</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#292329]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>One blank (0/_)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#292329]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>No duplicates</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {solvability.isSolvable ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Solvable parity</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span className="text-rose-700 font-semibold">Unsolvable parity</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons for Custom Input */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={onResetInlineDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#800020] bg-white hover:bg-[#F0DDE1]/60 border border-[#E5D7DB] hover:border-[#800020] rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={onApplyInlineCustom}
                disabled={!isValid}
                className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-mono font-bold rounded-lg transition-all shadow-xs cursor-pointer ${
                  isValid
                    ? 'bg-[#800020] hover:bg-[#520018] text-white active:scale-98'
                    : 'bg-[#F8F5F5] text-[#71666B]/50 border border-[#E5D7DB] cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply Custom Configuration</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
