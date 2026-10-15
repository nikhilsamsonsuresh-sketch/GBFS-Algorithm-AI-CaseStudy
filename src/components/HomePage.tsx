import React from 'react';
import { ArrowRight, BookOpen, Play } from 'lucide-react';
import { MiniPuzzleBoard } from './MiniPuzzleBoard';
import { DEFAULT_INITIAL_STATE, DEFAULT_GOAL_STATE } from '../utils/puzzleEngine';

interface HomePageProps {
  onNavigate: (page: 'home' | 'solver' | 'controls' | 'visualization' | 'search-process' | 'summary' | 'comparison' | 'algorithm' | 'about') => void;
  onOpenManhattanModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 space-y-10">
      {/* Header Section */}
      <section className="text-center space-y-4">
        <span className="inline-block px-3.5 py-1 bg-[#F0DDE1] text-[#800020] border border-[#E5D7DB] text-xs font-mono font-bold rounded-full uppercase tracking-wider">
          Artificial Intelligence
        </span>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#520018] font-bold tracking-tight">
          8-Puzzle Problem Solver
        </h1>

        <p className="text-lg sm:text-xl font-medium text-[#800020] font-sans">
          Greedy Best-First Search (GBFS)
        </p>

        <p className="text-[#71666B] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed pt-2">
          An interactive academic demonstration and visual state-space exploration tool for solving the classic 3×3 8-Puzzle problem using heuristic search.
        </p>
      </section>

      {/* Academic Credentials Card */}
      <section className="bg-white border border-[#E5D7DB] rounded-xl p-6 sm:p-8 shadow-xs">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#71666B] mb-4 pb-2 border-b border-[#E5D7DB]">
          Academic Credentials
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-xs text-[#71666B] font-mono">Student Name</span>
            <p className="text-base sm:text-lg font-semibold text-[#292329]">
              Nikhil Samson Sureshkumar
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#71666B] font-mono">Registration Number</span>
            <p className="text-base sm:text-lg font-mono font-bold text-[#800020]">
              24BDS0410
            </p>
          </div>
        </div>
      </section>

      {/* Problem Introduction */}
      <section className="bg-white border border-[#E5D7DB] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-lg font-serif font-bold text-[#292329]">
          Introduction to the 8-Puzzle Problem
        </h2>

        <div className="text-[#292329] text-sm sm:text-base space-y-4 leading-relaxed">
          <p>
            The 8-Puzzle is a classic problem in Artificial Intelligence consisting of a 3×3 board with 8 numbered tiles and one empty position. The objective is to rearrange the tiles from an initial scrambled configuration to match a specified goal configuration by sliding adjacent tiles into the empty space.
          </p>

          <p>
            In this project, the puzzle is solved using <strong className="text-[#520018]">Greedy Best-First Search (GBFS)</strong>, an informed heuristic search algorithm. GBFS evaluates nodes based strictly on their estimated distance to the goal:
          </p>

          <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg p-4 font-mono text-xs sm:text-sm text-[#292329] flex items-center justify-between">
            <span className="text-[#71666B]">Evaluation Function:</span>
            <strong className="text-[#800020] text-sm sm:text-base font-bold">f(n) = h(n)</strong>
          </div>

          <p>
            Heuristic functions supported include <strong className="text-[#292329]">Manhattan Distance</strong> (the sum of horizontal and vertical distances of each tile from its target position) and <strong className="text-[#292329]">Misplaced Tiles</strong> (the count of tiles not in their goal position). The blank space is not counted in either heuristic calculation.
          </p>
        </div>

        {/* Puzzle Board Preview */}
        <div className="pt-4 border-t border-[#E5D7DB] flex flex-col sm:flex-row items-center justify-center gap-8 text-center">
          <div className="space-y-2">
            <span className="text-xs font-mono text-[#71666B] block font-semibold">Initial State</span>
            <MiniPuzzleBoard state={DEFAULT_INITIAL_STATE} size="md" />
          </div>

          <div className="text-[#71666B] font-mono text-xl">→</div>

          <div className="space-y-2">
            <span className="text-xs font-mono text-[#71666B] block font-semibold">Goal State</span>
            <MiniPuzzleBoard state={DEFAULT_GOAL_STATE} size="md" />
          </div>
        </div>
      </section>

      {/* Primary Actions */}
      <section className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <button
          onClick={() => onNavigate('solver')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#800020] hover:bg-[#520018] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-xs active:scale-98"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Open Solver Workspace</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>

        <button
          onClick={() => onNavigate('algorithm')}
          className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-[#F0DDE1]/60 text-[#800020] text-sm font-semibold rounded-lg border border-[#E5D7DB] hover:border-[#800020] transition-colors cursor-pointer shadow-2xs active:scale-98"
        >
          <BookOpen className="w-4 h-4 text-[#800020]" />
          <span>Algorithm Information</span>
        </button>
      </section>
    </div>
  );
};
