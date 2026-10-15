import React from 'react';
import {
  User,
  GraduationCap,
  BookOpen,
  Layers,
  Code2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Calculator,
  Compass
} from 'lucide-react';
import { MiniPuzzleBoard } from './MiniPuzzleBoard';
import { DEFAULT_GOAL_STATE, DEFAULT_INITIAL_STATE } from '../utils/puzzleEngine';

interface AboutSectionProps {
  onNavigate: (page: 'home' | 'solver' | 'visualization' | 'algorithm') => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#E5E2D9] border-2 border-[#1A1A1A] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-white bg-[#1A1A1A] px-2.5 py-1">
              Course Assignment
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D95D39] font-bold">
              Artificial Intelligence
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif italic font-bold text-[#1A1A1A]">
            Project & Student Information
          </h2>
          <p className="text-xs sm:text-sm text-[#1A1A1A]/80 font-sans max-w-xl">
            Artificial Intelligence university project demonstrating state-space search, heuristic evaluation, and priority queue exploration for the 8-Puzzle problem.
          </p>
        </div>

        <div className="flex sm:flex-col gap-2 shrink-0">
          <button
            onClick={() => onNavigate('solver')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#D95D39] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors border border-[#1A1A1A] cursor-pointer shadow-xs"
          >
            <span>Launch Solver</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('algorithm')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F9F7F2] hover:bg-[#E5E2D9] text-[#1A1A1A] text-xs font-mono font-bold uppercase tracking-wider transition-colors border border-[#1A1A1A] cursor-pointer"
          >
            <span>View Algorithm</span>
          </button>
        </div>
      </div>

      {/* Student Details Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Profile Card */}
        <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-3 pb-3 border-b border-[#1A1A1A]/20">
            <div className="w-10 h-10 bg-[#1A1A1A] text-white flex items-center justify-center border border-[#1A1A1A]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#1A1A1A]/60 block">
                Author & Submitter
              </span>
              <h3 className="text-lg font-serif italic font-bold text-[#1A1A1A]">
                Student Credentials
              </h3>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-[#E5E2D9] border border-[#1A1A1A]">
              <span className="text-[10px] text-[#1A1A1A]/60 block uppercase font-sans font-bold">
                Student Name:
              </span>
              <span className="text-base font-bold text-[#1A1A1A]">
                Nikhil Samson Sureshkumar
              </span>
            </div>

            <div className="p-3 bg-[#E5E2D9] border border-[#1A1A1A]">
              <span className="text-[10px] text-[#1A1A1A]/60 block uppercase font-sans font-bold">
                Registration Number:
              </span>
              <span className="text-base font-bold text-[#D95D39]">
                24BDS0410
              </span>
            </div>

            <div className="p-3 bg-[#E5E2D9] border border-[#1A1A1A]">
              <span className="text-[10px] text-[#1A1A1A]/60 block uppercase font-sans font-bold">
                Subject & Course:
              </span>
              <span className="text-sm font-bold text-[#1A1A1A]">
                Artificial Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Project Technical Scope Card */}
        <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-3 pb-3 border-b border-[#1A1A1A]/20">
            <div className="w-10 h-10 bg-[#D95D39] text-white flex items-center justify-center border border-[#1A1A1A]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#1A1A1A]/60 block">
                Assignment Details
              </span>
              <h3 className="text-lg font-serif italic font-bold text-[#1A1A1A]">
                Project Specifications
              </h3>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-[#E5E2D9] border border-[#1A1A1A]">
              <span className="text-[10px] text-[#1A1A1A]/60 block uppercase font-sans font-bold">
                Assignment Title:
              </span>
              <span className="text-sm font-bold text-[#1A1A1A]">
                8-Puzzle Problem using Greedy Best-First Search
              </span>
            </div>

            <div className="p-3 bg-[#E5E2D9] border border-[#1A1A1A]">
              <span className="text-[10px] text-[#1A1A1A]/60 block uppercase font-sans font-bold">
                Algorithm Implemented:
              </span>
              <span className="text-sm font-bold text-[#D95D39]">
                Greedy Best-First Search (GBFS)
              </span>
            </div>

            <div className="p-3 bg-[#E5E2D9] border border-[#1A1A1A]">
              <span className="text-[10px] text-[#1A1A1A]/60 block uppercase font-sans font-bold">
                Evaluation Function:
              </span>
              <span className="text-sm font-bold text-[#1A1A1A]">
                f(n) = h(n) [Manhattan Distance Heuristic]
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Formulation & Methodology */}
      <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1A1A1A]/20">
          <BookOpen className="w-5 h-5 text-[#D95D39]" />
          <h3 className="font-serif italic font-bold text-xl sm:text-2xl text-[#1A1A1A]">
            Artificial Intelligence Problem Formulation
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#E5E2D9] border border-[#1A1A1A] space-y-1.5">
            <span className="font-mono font-bold uppercase tracking-wider text-[#1A1A1A] block">
              1. State Space Representation
            </span>
            <p className="font-sans text-[#1A1A1A]/80 leading-relaxed">
              A 3×3 matrix permutation containing integers 0 through 8, where 0 represents the empty grid cell into which adjacent tiles can slide. Total state permutations: 9! = 362,880.
            </p>
          </div>

          <div className="p-4 bg-[#E5E2D9] border border-[#1A1A1A] space-y-1.5">
            <span className="font-mono font-bold uppercase tracking-wider text-[#1A1A1A] block">
              2. Successor Function (Operators)
            </span>
            <p className="font-sans text-[#1A1A1A]/80 leading-relaxed">
              Legal moves are defined by sliding an adjacent tile into the blank position: <code className="font-mono font-bold">UP</code>, <code className="font-mono font-bold">DOWN</code>, <code className="font-mono font-bold">LEFT</code>, and <code className="font-mono font-bold">RIGHT</code>.
            </p>
          </div>

          <div className="p-4 bg-[#E5E2D9] border border-[#1A1A1A] space-y-1.5">
            <span className="font-mono font-bold uppercase tracking-wider text-[#1A1A1A] block">
              3. Goal State Test
            </span>
            <p className="font-sans text-[#1A1A1A]/80 leading-relaxed">
              A state is determined to be the goal when the tile vector matches the canonical arrangement: <code className="font-mono font-bold">[1, 2, 3, 4, 5, 6, 7, 8, 0]</code>.
            </p>
          </div>

          <div className="p-4 bg-[#E5E2D9] border border-[#1A1A1A] space-y-1.5">
            <span className="font-mono font-bold uppercase tracking-wider text-[#1A1A1A] block">
              4. Greedy Best-First Evaluation
            </span>
            <p className="font-sans text-[#1A1A1A]/80 leading-relaxed">
              Nodes are ordered in a Min-Priority Queue by their estimated Manhattan Distance <code className="font-mono font-bold text-[#D95D39]">f(n) = h(n)</code> to expand the node looking most promising.
            </p>
          </div>
        </div>

        {/* Visual Benchmark Comparison */}
        <div className="pt-4 border-t border-[#1A1A1A]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <span className="text-[10px] font-mono font-bold uppercase block text-[#1A1A1A]/60 mb-1">Standard Initial</span>
              <MiniPuzzleBoard state={DEFAULT_INITIAL_STATE} size="md" />
            </div>
            <ArrowRight className="w-5 h-5 text-[#D95D39] shrink-0" />
            <div className="text-center">
              <span className="text-[10px] font-mono font-bold uppercase block text-[#1A1A1A]/60 mb-1">Canonical Goal</span>
              <MiniPuzzleBoard state={DEFAULT_GOAL_STATE} size="md" />
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <span className="text-xs font-mono text-[#1A1A1A]/70">
              Explore the full interactive solution path:
            </span>
            <button
              onClick={() => onNavigate('solver')}
              className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#D95D39] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors border border-[#1A1A1A] cursor-pointer shadow-xs"
            >
              Open Interactive Solver →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
