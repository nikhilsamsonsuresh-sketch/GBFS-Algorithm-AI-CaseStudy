import React from 'react';
import { PuzzleState } from '../types';

interface MiniPuzzleBoardProps {
  state: PuzzleState;
  size?: 'sm' | 'md' | 'lg';
  highlightTile?: number | null;
  className?: string;
  badge?: string;
  badgeColor?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'slate' | 'indigo' | 'terracotta';
}

export const MiniPuzzleBoard: React.FC<MiniPuzzleBoardProps> = ({
  state,
  size = 'md',
  highlightTile = null,
  className = '',
  badge,
  badgeColor = 'blue'
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16 text-[10px] gap-1 p-1 rounded-md',
    md: 'w-24 h-24 text-xs gap-1 p-1.5 rounded-lg',
    lg: 'w-32 h-32 text-sm gap-1.5 p-2 rounded-xl'
  };

  const badgeColorClasses: Record<string, string> = {
    blue: 'bg-[#F0DDE1] text-[#800020] border-[#E5D7DB]',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    amber: 'bg-amber-50 text-amber-800 border-amber-300',
    rose: 'bg-rose-50 text-rose-800 border-rose-300',
    slate: 'bg-[#F8F5F5] text-[#71666B] border-[#E5D7DB]',
    terracotta: 'bg-[#F0DDE1] text-[#800020] border-[#E5D7DB]',
    indigo: 'bg-[#F0DDE1] text-[#800020] border-[#E5D7DB]',
    purple: 'bg-[#F0DDE1] text-[#800020] border-[#E5D7DB]'
  };

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <div className={`grid grid-cols-3 bg-[#F8F5F5] border border-[#E5D7DB] shadow-inner ${sizeClasses[size]}`}>
        {state.map((tile, idx) => {
          const isBlank = tile === 0;
          const isHighlighted = highlightTile === tile && !isBlank;

          return (
            <div
              key={idx}
              className={`flex items-center justify-center font-serif font-bold transition-all select-none rounded border ${
                isBlank
                  ? 'bg-[#F8F5F5] text-transparent border-dashed border-[#E5D7DB]'
                  : isHighlighted
                  ? 'bg-[#800020] text-white border-[#520018] shadow-xs'
                  : 'bg-white text-[#800020] border-[#E5D7DB] shadow-2xs'
              }`}
            >
              {isBlank ? '' : tile}
            </div>
          );
        })}
      </div>

      {badge && (
        <span className={`mt-1.5 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${badgeColorClasses[badgeColor] || badgeColorClasses.blue}`}>
          {badge}
        </span>
      )}
    </div>
  );
};
