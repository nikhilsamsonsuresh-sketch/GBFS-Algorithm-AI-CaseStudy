import React from 'react';
import { PuzzleState } from '../types';
import { getTileDistanceBreakdown, calculateManhattanDistance, DEFAULT_GOAL_STATE } from '../utils/puzzleEngine';
import { X, Calculator, Info } from 'lucide-react';

interface ManhattanBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: PuzzleState;
  goalState?: PuzzleState;
}

export const ManhattanBreakdownModal: React.FC<ManhattanBreakdownModalProps> = ({
  isOpen,
  onClose,
  state,
  goalState = DEFAULT_GOAL_STATE
}) => {
  if (!isOpen) return null;

  const breakdown = getTileDistanceBreakdown(state, goalState);
  const totalH = calculateManhattanDistance(state, goalState);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5D7DB] rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden text-[#292329]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5D7DB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F0DDE1] border border-[#E5D7DB] text-[#800020] flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#520018]">
                Manhattan Distance Breakdown
              </h3>
              <p className="text-xs text-[#71666B] font-mono">
                h(n) = Σ (|Δrow| + |Δcol|)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#71666B] hover:text-[#800020] hover:bg-[#F0DDE1]/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-4 space-y-4">
          <div className="p-3.5 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg text-xs text-[#292329] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#800020] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              For every numbered tile (1 to 8, excluding the blank space), the distance is calculated as the sum of horizontal and vertical steps to its target position on the goal board.
            </p>
          </div>

          <div className="border border-[#E5D7DB] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#F8F5F5] border-b border-[#E5D7DB] text-[#292329]">
                <tr>
                  <th className="p-2.5 font-semibold">Tile</th>
                  <th className="p-2.5 font-semibold">Current [r, c]</th>
                  <th className="p-2.5 font-semibold">Goal [r, c]</th>
                  <th className="p-2.5 font-semibold">|Δrow| + |Δcol|</th>
                  <th className="p-2.5 font-semibold text-right">Distance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D7DB]">
                {breakdown.map((item) => (
                  <tr key={item.tile} className="hover:bg-[#F8F5F5]">
                    <td className="p-2.5 font-bold text-[#800020]">Tile {item.tile}</td>
                    <td className="p-2.5 text-[#292329]">[{item.currentPos.row}, {item.currentPos.col}]</td>
                    <td className="p-2.5 text-[#292329]">[{item.goalPos.row}, {item.goalPos.col}]</td>
                    <td className="p-2.5 text-[#71666B]">|{item.currentPos.row}-{item.goalPos.row}| + |{item.currentPos.col}-{item.goalPos.col}|</td>
                    <td className="p-2.5 text-right font-bold text-[#800020]">{item.manhattanDist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[#F0DDE1]/60 border border-[#E5D7DB] rounded-lg text-xs font-mono">
            <span className="font-semibold text-[#800020]">Total Manhattan Heuristic Value:</span>
            <span className="text-base font-bold text-[#520018]">h(n) = {totalH}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E5D7DB] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#F0DDE1]/60 text-[#800020] text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-[#E5D7DB] hover:border-[#800020]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
