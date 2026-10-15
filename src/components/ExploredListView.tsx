import React, { useState } from 'react';
import { SearchNode, PuzzleState } from '../types';
import { MiniPuzzleBoard } from './MiniPuzzleBoard';
import { Activity, Search } from 'lucide-react';

interface ExploredListViewProps {
  exploredNodes: SearchNode[];
  onSelectNode: (state: PuzzleState, movedTile: number | null, direction: string | null) => void;
}

export const ExploredListView: React.FC<ExploredListViewProps> = ({
  exploredNodes,
  onSelectNode
}) => {
  const [filterText, setFilterText] = useState('');

  const filtered = exploredNodes.filter((n, idx) => {
    if (!filterText) return true;
    const orderMatch = (idx + 1).toString().includes(filterText);
    const hMatch = n.h.toString() === filterText;
    const stateMatch = n.state.join('').includes(filterText);
    return orderMatch || hMatch || stateMatch;
  });

  return (
    <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/20">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#D95D39]" />
          <h3 className="font-serif italic font-bold text-[#1A1A1A] text-lg sm:text-xl">
            Explored States (CLOSED Set)
          </h3>
          <span className="px-2 py-0.5 text-xs font-mono font-bold uppercase bg-[#E5E2D9] text-[#1A1A1A] border border-[#1A1A1A]">
            {exploredNodes.length} States
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#1A1A1A]/50 absolute left-3 top-2.5" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter by order # or h(n)..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#E5E2D9] border border-[#1A1A1A] focus:outline-hidden font-mono text-[#1A1A1A] placeholder-[#1A1A1A]/40"
          />
        </div>
      </div>

      {/* Explored Nodes Grid */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#1A1A1A]/60 font-mono">
          {exploredNodes.length === 0 ? 'No states explored yet. Start GBFS search to populate.' : 'No states match your search query.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
          {filtered.map((node, idx) => (
            <div
              key={node.id || idx}
              onClick={() => onSelectNode(node.state, node.movedTile, node.move)}
              className="bg-[#E5E2D9] hover:bg-[#F9F7F2] p-2.5 border border-[#1A1A1A] hover:border-[#D95D39] transition-all flex flex-col items-center text-center cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between w-full text-[9px] font-mono text-[#1A1A1A]/70 mb-1 px-1">
                <span className="font-bold text-[#1A1A1A]">#{node.orderExplored || idx + 1}</span>
                <span className="uppercase font-bold">{node.move}</span>
              </div>

              <MiniPuzzleBoard
                state={node.state}
                size="sm"
                highlightTile={node.movedTile}
              />

              <div className="mt-2 flex items-center justify-between w-full px-1">
                <span className="text-[10px] font-mono font-bold text-[#1A1A1A] bg-[#F9F7F2] px-1.5 py-0.5 border border-[#1A1A1A]">
                  h = {node.h}
                </span>
                <span className="text-[9px] text-[#1A1A1A]/60 font-mono">
                  d={node.depth}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
