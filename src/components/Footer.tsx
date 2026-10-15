import React from 'react';
import { NavPage } from './Header';

interface FooterProps {
  onNavigate: (page: NavPage) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-[#E5D7DB] mt-auto py-8 text-[#71666B]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#E5D7DB]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-serif font-bold text-[#520018] text-sm">
                8-Puzzle Problem Solver
              </span>
              <span className="text-[10px] font-mono bg-[#F0DDE1] text-[#800020] px-2 py-0.5 rounded-full border border-[#E5D7DB] font-bold">
                GBFS
              </span>
            </div>
            <p className="text-xs text-[#71666B] max-w-md leading-relaxed">
              Academic implementation and step-by-step state-space search visualization using Greedy Best-First Search with the Manhattan Distance heuristic function.
            </p>
          </div>

          <div className="text-xs font-mono space-y-1">
            <div className="text-[#71666B]">
              Student: <span className="font-semibold text-[#292329]">Nikhil Samson Sureshkumar</span>
            </div>
            <div className="text-[#71666B]">
              Reg. No: <span className="font-mono font-bold text-[#800020]">24BDS0410</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs">
          <div className="flex items-center gap-4 text-[#71666B]">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-[#800020] transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('solver')}
              className="hover:text-[#800020] transition-colors cursor-pointer"
            >
              Solver
            </button>
            <button
              onClick={() => onNavigate('comparison')}
              className="hover:text-[#800020] transition-colors cursor-pointer"
            >
              Comparison
            </button>
            <button
              onClick={() => onNavigate('algorithm')}
              className="hover:text-[#800020] transition-colors cursor-pointer"
            >
              Algorithm Information
            </button>
          </div>

          <p className="text-[#71666B] text-[11px] font-mono">
            Course: Artificial Intelligence
          </p>
        </div>
      </div>
    </footer>
  );
};
