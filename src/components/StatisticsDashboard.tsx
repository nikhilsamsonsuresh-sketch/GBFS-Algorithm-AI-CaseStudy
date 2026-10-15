import React from 'react';
import { SearchStats, PuzzleState } from '../types';
import { MiniPuzzleBoard } from './MiniPuzzleBoard';
import {
  Activity,
  Layers,
  Clock,
  Navigation,
  Compass,
  Zap,
  Target,
  Sparkles,
  BarChart3
} from 'lucide-react';

interface StatisticsDashboardProps {
  stats: SearchStats | null;
  currentExploredCount: number;
  currentFrontierCount: number;
  currentH: number;
  initialState: PuzzleState;
  goalState: PuzzleState;
}

export const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({
  stats,
  currentExploredCount,
  currentFrontierCount,
  currentH,
  initialState,
  goalState
}) => {
  const isSolved = stats?.isSolved || false;

  return (
    <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-5 sm:p-6 flex flex-col gap-5 shadow-sm">
      {/* Header with Algorithm Identification */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/20">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#D95D39]" />
          <h3 className="font-serif italic font-bold text-[#1A1A1A] text-lg sm:text-xl">
            Search Metrics & Execution Log
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <span className="px-2.5 py-1 bg-[#E5E2D9] border border-[#1A1A1A] text-[#1A1A1A] uppercase font-bold">
            Method: <strong>Greedy Best-First Search</strong>
          </span>
          <span className="px-2.5 py-1 bg-[#E5E2D9] border border-[#1A1A1A] text-[#1A1A1A] uppercase font-bold">
            Eval: <strong>f(n) = h(n)</strong>
          </span>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Explored States */}
        <div className="bg-[#E5E2D9] p-3 border border-[#1A1A1A] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#1A1A1A]/70 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Explored (Closed)</span>
            <Activity className="w-3.5 h-3.5 text-[#D95D39]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#1A1A1A]">
            {stats ? stats.exploredCount : currentExploredCount}
          </div>
          <span className="text-[10px] font-mono text-[#1A1A1A]/60 mt-1">States expanded</span>
        </div>

        {/* Generated States */}
        <div className="bg-[#E5E2D9] p-3 border border-[#1A1A1A] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#1A1A1A]/70 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Generated</span>
            <Zap className="w-3.5 h-3.5 text-[#C48B28]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#1A1A1A]">
            {stats ? stats.generatedCount : currentExploredCount + currentFrontierCount}
          </div>
          <span className="text-[10px] font-mono text-[#1A1A1A]/60 mt-1">Nodes created</span>
        </div>

        {/* Frontier Size */}
        <div className="bg-[#E5E2D9] p-3 border border-[#1A1A1A] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#1A1A1A]/70 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Frontier (Open)</span>
            <Layers className="w-3.5 h-3.5 text-[#1A1A1A]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#1A1A1A]">
            {stats ? stats.frontierCount : currentFrontierCount}
          </div>
          <span className="text-[10px] font-mono text-[#1A1A1A]/60 mt-1">Queue size</span>
        </div>

        {/* Solution Depth / Moves */}
        <div className="bg-[#E5E2D9] p-3 border border-[#1A1A1A] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#1A1A1A]/70 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Solution Moves</span>
            <Navigation className="w-3.5 h-3.5 text-[#2D5A27]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#2D5A27]">
            {isSolved ? stats?.solutionMoves : '-'}
          </div>
          <span className="text-[10px] font-mono text-[#1A1A1A]/60 mt-1">Optimal moves</span>
        </div>

        {/* Execution Time */}
        <div className="bg-[#E5E2D9] p-3 border border-[#1A1A1A] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#1A1A1A]/70 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Runtime</span>
            <Clock className="w-3.5 h-3.5 text-[#1A1A1A]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#1A1A1A]">
            {stats ? `${stats.executionTimeMs} ms` : '-'}
          </div>
          <span className="text-[10px] font-mono text-[#1A1A1A]/60 mt-1">Search time</span>
        </div>

        {/* Current / Final Heuristic */}
        <div className="bg-[#E5E2D9] p-3 border border-[#1A1A1A] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#1A1A1A]/70 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Heuristic h(n)</span>
            <Target className="w-3.5 h-3.5 text-[#D95D39]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#D95D39]">
            {isSolved ? 0 : currentH}
          </div>
          <span className="text-[10px] font-mono text-[#1A1A1A]/60 mt-1">Manhattan dist</span>
        </div>
      </div>

      {/* Initial State vs Goal State Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Initial Configuration */}
        <div className="bg-[#E5E2D9] p-4 border border-[#1A1A1A] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#D95D39]" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#1A1A1A]">Initial State</span>
            </div>
            <p className="text-[11px] text-[#1A1A1A]/70 mt-1 font-sans">
              Starting layout of the 8-Puzzle problem
            </p>
            <div className="mt-2 text-xs font-mono text-[#1A1A1A]/80">
              Vector: <span className="font-bold">[{initialState.join(', ')}]</span>
            </div>
          </div>
          <MiniPuzzleBoard state={initialState} size="md" />
        </div>

        {/* Goal Configuration */}
        <div className="bg-[#E5E2D9] p-4 border border-[#1A1A1A] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2D5A27]" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#1A1A1A]">Target Goal State</span>
            </div>
            <p className="text-[11px] text-[#1A1A1A]/70 mt-1 font-sans">
              Standard canonical objective layout
            </p>
            <div className="mt-2 text-xs font-mono text-[#1A1A1A]/80">
              Vector: <span className="font-bold">[{goalState.join(', ')}]</span>
            </div>
          </div>
          <MiniPuzzleBoard state={goalState} size="md" />
        </div>
      </div>
    </div>
  );
};
