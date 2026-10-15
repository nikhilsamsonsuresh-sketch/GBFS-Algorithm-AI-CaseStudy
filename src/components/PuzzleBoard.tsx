import React from 'react';
import { motion } from 'motion/react';
import { PuzzleState, AnimationSubPhase } from '../types';
import { calculateManhattanDistance, slideTile, DEFAULT_GOAL_STATE } from '../utils/puzzleEngine';

interface PuzzleBoardProps {
  state: PuzzleState;
  goalState?: PuzzleState;
  movedTile?: number | null;
  highlightedCandidateTile?: number | null;
  lastMoveDirection?: string | null;
  onTileClick?: (nextState: PuzzleState) => void;
  interactive?: boolean;
  onOpenManhattanModal?: () => void;
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'blue' | 'emerald' | 'amber' | 'purple' | 'slate';
  speedMs?: number;
  animationPhase?: AnimationSubPhase;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  state,
  goalState = DEFAULT_GOAL_STATE,
  movedTile = null,
  highlightedCandidateTile = null,
  lastMoveDirection = null,
  onTileClick,
  interactive = true,
  onOpenManhattanModal,
  title = '',
  subtitle,
  badge,
  badgeColor = 'blue',
  speedMs = 800,
  animationPhase = 'EXPAND'
}) => {
  const currentH = calculateManhattanDistance(state, goalState);

  // Goal mapping to identify tiles currently in target position
  const goalMap: { [tile: number]: number } = {};
  goalState.forEach((val, idx) => {
    goalMap[val] = idx;
  });

  // Calculate spring physics parameters dynamically based on selected playback speed
  const springStiffness = speedMs <= 300 ? 550 : speedMs <= 700 ? 380 : 240;
  const springDamping = speedMs <= 300 ? 32 : speedMs <= 700 ? 28 : 24;

  const handleTilePress = (tileIndex: number) => {
    if (!interactive || !onTileClick) return;
    const res = slideTile(state, tileIndex);
    if (res.moved) {
      onTileClick(res.nextState);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Optional Board Title & Badge */}
      {title && (
        <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-[#E5D7DB]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#292329] text-sm">{title}</span>
            {badge && (
              <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                badgeColor === 'emerald'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-[#F0DDE1] text-[#800020] border-[#E5D7DB]'
              }`}>
                {badge}
              </span>
            )}
          </div>
          {onOpenManhattanModal && (
            <button
              onClick={onOpenManhattanModal}
              className="text-[11px] font-mono text-[#71666B] hover:text-[#800020] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>h(n) = {currentH}</span>
            </button>
          )}
        </div>
      )}

      {/* 3x3 Puzzle Grid */}
      <div className="w-full max-w-[280px] sm:max-w-[300px] aspect-square bg-[#F8F5F5] p-2.5 rounded-xl border border-[#E5D7DB] shadow-inner flex items-center justify-center">
        <div className="grid grid-cols-3 gap-2 w-full h-full relative">
          {state.map((tile, idx) => {
            const isBlank = tile === 0;
            const isMoved = movedTile === tile && !isBlank;
            const isCandidate = highlightedCandidateTile === tile && !isBlank && !isMoved;
            const isAtGoal = !isBlank && goalMap[tile] === idx;
            const currRow = Math.floor(idx / 3);
            const currCol = idx % 3;

            if (isBlank) {
              return (
                <motion.div
                  key="tile-0"
                  id={`tile-blank-${idx}`}
                  layout="position"
                  transition={{
                    type: 'spring',
                    stiffness: springStiffness,
                    damping: springDamping,
                    mass: 0.8
                  }}
                  className={`relative rounded-lg flex flex-col items-center justify-center select-none transition-colors border-2 border-dashed ${
                    animationPhase === 'SELECT' || animationPhase === 'SLIDE'
                      ? 'bg-[#F0DDE1]/60 border-[#800020]/60 text-[#800020]'
                      : 'bg-[#F8F5F5] border-[#E5D7DB] text-[#71666B]/60'
                  }`}
                >
                  <span className="font-mono text-xs">_</span>
                  <span className="text-[9px] font-mono opacity-60">[{currRow},{currCol}]</span>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={`tile-${tile}`}
                id={`puzzle-tile-${tile}`}
                layout="position"
                transition={{
                  type: 'spring',
                  stiffness: springStiffness,
                  damping: springDamping,
                  mass: 0.8
                }}
                onClick={() => handleTilePress(idx)}
                className={`group relative rounded-lg flex flex-col items-center justify-center transition-all select-none border ${
                  interactive ? 'cursor-pointer hover:border-[#800020]/60 hover:bg-[#F0DDE1]/30 active:scale-95' : 'cursor-default'
                } ${
                  isMoved
                    ? 'bg-[#800020] text-white border-[#520018] shadow-md ring-2 ring-[#800020]/30 z-10'
                    : isCandidate
                    ? 'bg-[#F0DDE1] text-[#800020] border-[#800020] ring-2 ring-[#800020]/20 shadow-xs z-10'
                    : 'bg-white text-[#800020] border-[#E5D7DB] hover:border-[#800020]/40 shadow-xs'
                }`}
              >
                {/* Number */}
                <span className={`text-2xl sm:text-3xl font-serif font-bold leading-none ${
                  isMoved ? 'text-white' : 'text-[#800020]'
                }`}>
                  {tile}
                </span>

                {/* Sub-label coordinates */}
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-[9px] font-mono ${
                    isMoved ? 'text-white/80' : isCandidate ? 'text-[#800020]/80' : 'text-[#71666B]'
                  }`}>
                    [{currRow},{currCol}]
                  </span>
                  {isAtGoal && !isMoved && !isCandidate && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" title="At goal position" />
                  )}
                </div>

                {/* Move direction indicator badge */}
                {isMoved && lastMoveDirection && (
                  <span className="absolute -top-1.5 -right-1 text-[8px] font-bold font-mono uppercase bg-[#520018] text-white border border-[#800020] px-1.5 py-0.5 rounded shadow-xs">
                    {lastMoveDirection}
                  </span>
                )}

                {/* Candidate slide badge during evaluation/selection */}
                {isCandidate && (
                  <span className="absolute -top-1.5 -right-1 text-[8px] font-bold font-mono uppercase bg-[#800020] text-white px-1 py-0.5 rounded shadow-xs">
                    Target
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Subtitle / Interaction Tip */}
      {subtitle && (
        <p className="text-[11px] text-[#71666B] font-sans text-center mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
};
