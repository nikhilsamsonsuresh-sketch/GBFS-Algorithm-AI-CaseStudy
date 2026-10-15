import React, { useState } from 'react';
import { PuzzleState, SolvabilityCheck } from '../types';
import {
  validatePuzzleState,
  checkSolvability,
  DEFAULT_GOAL_STATE,
  DEFAULT_INITIAL_STATE
} from '../utils/puzzleEngine';
import { X, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { MiniPuzzleBoard } from './MiniPuzzleBoard';

interface CustomStateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialState: PuzzleState;
  goalState: PuzzleState;
  onApply: (newInitial: PuzzleState, newGoal: PuzzleState) => void;
}

export const CustomStateModal: React.FC<CustomStateModalProps> = ({
  isOpen,
  onClose,
  initialState,
  goalState,
  onApply
}) => {
  const [initialInput, setInitialInput] = useState<number[]>([...initialState]);
  const [goalInput, setGoalInput] = useState<number[]>([...goalState]);
  const [activeTab, setActiveTab] = useState<'initial' | 'goal'>('initial');
  const [rawTextInput, setRawTextInput] = useState<string>(initialState.join(' '));

  if (!isOpen) return null;

  const initialValidation = validatePuzzleState(initialInput);
  const goalValidation = validatePuzzleState(goalInput);

  let solvability: SolvabilityCheck | null = null;
  if (initialValidation.valid && goalValidation.valid) {
    solvability = checkSolvability(initialInput as PuzzleState, goalInput as PuzzleState);
  }

  const handleTileChange = (type: 'initial' | 'goal', index: number, valStr: string) => {
    const val = parseInt(valStr, 10);
    if (type === 'initial') {
      const copy = [...initialInput];
      copy[index] = isNaN(val) ? 0 : val;
      setInitialInput(copy);
      setRawTextInput(copy.join(' '));
    } else {
      const copy = [...goalInput];
      copy[index] = isNaN(val) ? 0 : val;
      setGoalInput(copy);
    }
  };

  const handleRawTextSubmit = () => {
    const parts = rawTextInput.trim().split(/[\s,]+/).map(Number);
    if (activeTab === 'initial') {
      if (parts.length === 9) setInitialInput(parts);
    } else {
      if (parts.length === 9) setGoalInput(parts);
    }
  };

  const handleApply = () => {
    if (initialValidation.valid && goalValidation.valid) {
      onApply(initialInput as PuzzleState, goalInput as PuzzleState);
      onClose();
    }
  };

  const handleResetDefaults = () => {
    setInitialInput([...DEFAULT_INITIAL_STATE]);
    setGoalInput([...DEFAULT_GOAL_STATE]);
    setRawTextInput(DEFAULT_INITIAL_STATE.join(' '));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5D7DB] rounded-xl shadow-2xl max-w-xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden text-[#292329]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5D7DB]">
          <div>
            <h3 className="text-base font-serif font-bold text-[#520018]">
              Custom Puzzle Configuration
            </h3>
            <p className="text-xs text-[#71666B] font-mono">
              Enter numbers 0 to 8 without duplicates (0 denotes the blank space)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#71666B] hover:text-[#800020] hover:bg-[#F0DDE1]/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-5">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E5D7DB] pb-2">
            <button
              onClick={() => {
                setActiveTab('initial');
                setRawTextInput(initialInput.join(' '));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'initial'
                  ? 'bg-[#800020] text-white shadow-xs'
                  : 'text-[#71666B] hover:bg-[#F0DDE1]/40 hover:text-[#800020]'
              }`}
            >
              Initial State Configuration
            </button>
            <button
              onClick={() => {
                setActiveTab('goal');
                setRawTextInput(goalInput.join(' '));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'goal'
                  ? 'bg-[#800020] text-white shadow-xs'
                  : 'text-[#71666B] hover:bg-[#F0DDE1]/40 hover:text-[#800020]'
              }`}
            >
              Goal State Configuration
            </button>
          </div>

          {/* 3x3 Grid Inputs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="grid grid-cols-3 gap-2 p-3 bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl">
              {(activeTab === 'initial' ? initialInput : goalInput).map((val, idx) => (
                <input
                  key={idx}
                  type="number"
                  min={0}
                  max={8}
                  value={val}
                  onChange={(e) => handleTileChange(activeTab, idx, e.target.value)}
                  className="w-12 h-12 text-center text-lg font-bold font-serif bg-white border border-[#E5D7DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020]/30 focus:border-[#800020] text-[#800020] shadow-2xs"
                />
              ))}
            </div>

            <div className="space-y-2 text-center">
              <span className="text-xs font-mono text-[#71666B] block font-semibold">Board Preview</span>
              <MiniPuzzleBoard
                state={(activeTab === 'initial' ? initialInput : goalInput) as PuzzleState}
                size="md"
              />
            </div>
          </div>

          {/* Quick Raw Text Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#71666B] block">
              Quick Space-Separated Input (e.g. 1 2 3 4 5 6 7 8 0):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={rawTextInput}
                onChange={(e) => setRawTextInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-[#E5D7DB] rounded-lg text-[#292329] focus:outline-none focus:ring-1 focus:ring-[#800020]"
              />
              <button
                onClick={handleRawTextSubmit}
                className="px-3 py-1.5 bg-white hover:bg-[#F0DDE1]/60 text-[#800020] text-xs font-mono font-semibold rounded-lg transition-colors cursor-pointer border border-[#E5D7DB]"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Solvability and Validation Status */}
          <div className="p-3.5 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[#71666B]">Validation:</span>
              {initialValidation.valid && goalValidation.valid ? (
                <span className="text-emerald-800 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Valid Permutation</span>
                </span>
              ) : (
                <span className="text-rose-800 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>{initialValidation.error || goalValidation.error}</span>
                </span>
              )}
            </div>

            {solvability && (
              <div className="flex items-center justify-between pt-2 border-t border-[#E5D7DB]">
                <span className="text-[#71666B]">Solvability:</span>
                <span className={`font-semibold ${
                  solvability.isSolvable ? 'text-emerald-800' : 'text-rose-800'
                }`}>
                  {solvability.isSolvable ? '✓ Mathematically Solvable' : '✗ Unsolvable (Mismatched Parity)'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#E5D7DB] flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1 text-xs text-[#71666B] hover:text-[#800020] transition-colors cursor-pointer font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-[#F0DDE1]/60 text-[#71666B] hover:text-[#800020] text-xs font-medium rounded-lg transition-colors cursor-pointer border border-[#E5D7DB]"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!initialValidation.valid || !goalValidation.valid}
              className="px-4 py-2 bg-[#800020] hover:bg-[#520018] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs active:scale-98"
            >
              Apply to Puzzle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
