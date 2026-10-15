import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  Calculator,
  Compass,
  Copy,
  Check,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface EducationalSectionProps {
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const EducationalSection: React.FC<EducationalSectionProps> = ({
  isOpenModal = false,
  onCloseModal
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'concept' | 'pseudocode' | 'heuristic' | 'solvability'>('concept');

  const pseudocodeString = `GBFS(initial, goal):

    OPEN = priority queue ordered by h(n)
    CLOSED = empty set

    Insert initial state into OPEN

    while OPEN is not empty:

        current = node with minimum h(n)

        if current == goal:
            return solution path

        add current to CLOSED

        generate all valid neighboring states

        for each neighbor:

            if neighbor is not in CLOSED
               and neighbor is not already in OPEN:

                calculate h(neighbor)
                store parent of neighbor
                insert neighbor into OPEN

    return failure`;

  const copyPseudocode = () => {
    navigator.clipboard.writeText(pseudocodeString);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const content = (
    <div className="flex flex-col gap-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E5D7DB] pb-3 overflow-x-auto">
        {[
          { id: 'concept', label: '1. What is GBFS?', icon: Compass },
          { id: 'pseudocode', label: '2. GBFS Pseudocode', icon: Code2 },
          { id: 'heuristic', label: '3. Manhattan Distance & f(n)', icon: Calculator },
          { id: 'solvability', label: '4. Solvability & Inversions', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer rounded-lg border ${
                isActive
                  ? 'bg-[#800020] text-white border-[#520018] shadow-xs'
                  : 'bg-white text-[#292329] border-[#E5D7DB] hover:bg-[#F0DDE1]/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: GBFS Concept & Execution Flow */}
      {activeTab === 'concept' && (
        <div className="space-y-4 text-xs sm:text-sm text-[#292329] leading-relaxed">
          <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl p-4">
            <h4 className="font-serif font-bold text-[#520018] text-base mb-1">
              What is Greedy Best-First Search?
            </h4>
            <p className="text-[#292329] leading-relaxed font-sans">
              <strong>Greedy Best-First Search (GBFS)</strong> is an informed heuristic search algorithm that explores a state-space by expanding the node that appears to be closest to the goal according to the evaluation function <strong>f(n) = h(n)</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 border border-[#E5D7DB] rounded-xl space-y-2 shadow-2xs">
              <h5 className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-widest font-mono text-[#800020]">
                <Layers className="w-4 h-4" />
                <span>How GBFS Solves 8-Puzzle</span>
              </h5>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#292329] font-sans">
                <li><strong>Start</strong> with the initial puzzle configuration.</li>
                <li><strong>Calculate heuristic:</strong> Compute Manhattan Distance <code className="bg-[#F8F5F5] px-1 py-0.5 border border-[#E5D7DB] font-mono text-[#800020]">h(start)</code>.</li>
                <li><strong>Extract minimum:</strong> Pop node with lowest <code className="bg-[#F8F5F5] px-1 py-0.5 border border-[#E5D7DB] font-mono text-[#800020]">h(n)</code> from the frontier.</li>
                <li><strong>Check Goal:</strong> If current state equals goal state, return reconstructed path.</li>
                <li><strong>Expand Neighbors:</strong> Slide blank tile Up, Down, Left, or Right.</li>
                <li><strong>Filter:</strong> Ignore states visited (<code className="font-mono">CLOSED</code>) or queued (<code className="font-mono">OPEN</code>).</li>
                <li><strong>Enqueue:</strong> Calculate <code className="font-mono text-[#800020]">h(neighbor)</code> and insert into priority queue.</li>
                <li><strong>Repeat</strong> until target goal reached.</li>
              </ol>
            </div>

            <div className="bg-white p-4 border border-[#E5D7DB] rounded-xl space-y-2 shadow-2xs">
              <h5 className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-widest font-mono text-[#800020]">
                <AlertCircle className="w-4 h-4" />
                <span>GBFS vs A* Comparison</span>
              </h5>
              <div className="space-y-2 text-xs font-sans">
                <div className="p-3 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg">
                  <strong className="text-[#520018] font-bold block mb-0.5 uppercase tracking-wider font-mono">Greedy Best-First (This App):</strong>
                  <code className="font-mono font-bold text-[#800020]">f(n) = h(n)</code>
                  <p className="text-[#71666B] mt-1">
                    Evaluates nodes purely on estimated remaining distance to goal. Highly swift in simple spaces, but not guaranteed to discover the shortest path.
                  </p>
                </div>
                <div className="p-3 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg">
                  <strong className="text-[#520018] font-bold block mb-0.5 uppercase tracking-wider font-mono">A* Search:</strong>
                  <code className="font-mono font-bold text-[#292329]">f(n) = g(n) + h(n)</code>
                  <p className="text-[#71666B] mt-1">
                    Combines accumulated path cost <code className="font-mono">g(n)</code> with estimated remaining cost <code className="font-mono">h(n)</code> to guarantee optimal path length.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: GBFS Pseudocode */}
      {activeTab === 'pseudocode' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#292329] font-mono">
              Greedy Best-First Search Algorithm Specification
            </span>
            <button
              onClick={copyPseudocode}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-white hover:bg-[#F0DDE1]/60 text-[#800020] border border-[#E5D7DB] rounded transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Pseudocode'}</span>
            </button>
          </div>

          <div className="relative bg-[#520018] text-white p-4 sm:p-5 font-mono text-xs overflow-x-auto border border-[#E5D7DB] rounded-xl leading-relaxed shadow-xs">
            <pre>{pseudocodeString}</pre>
          </div>

          <div className="p-3 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg text-xs text-[#292329]">
            <strong className="font-mono uppercase tracking-wider text-[#520018]">Key Data Structures:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5 font-mono">
              <li><code className="text-[#800020] font-bold">OPEN</code>: Min-Priority Queue sorted by heuristic value <code className="font-bold">h(n)</code>.</li>
              <li><code className="text-[#292329] font-bold">CLOSED</code>: Set of explored state keys to prevent cycles and duplicate expansions.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Manhattan Distance */}
      {activeTab === 'heuristic' && (
        <div className="space-y-4 text-xs sm:text-sm text-[#292329] leading-relaxed">
          <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl p-4">
            <h4 className="font-serif font-bold text-[#520018] text-base mb-1">
              Manhattan Distance Heuristic: h(n)
            </h4>
            <div className="font-mono bg-white p-3 border border-[#E5D7DB] text-[#800020] font-bold text-xs sm:text-sm my-2 text-center rounded-lg shadow-2xs">
              h(n) = ∑ (|currentRow - goalRow| + |currentCol - goalCol|) for tiles 1..8
            </div>
            <p className="text-[#71666B] text-xs font-sans">
              Manhattan Distance (also known as L₁ norm or Taxicab geometry) calculates the sum of vertical and horizontal moves each numbered tile is away from its final slot in the goal board.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3.5 border border-[#E5D7DB] rounded-xl shadow-2xs">
              <strong className="text-[#520018] font-serif font-bold text-sm block mb-1">1. Admissible</strong>
              <p className="text-[#71666B] font-sans">
                It never overestimates the true cost to reach the goal, because every tile must move at least its Manhattan distance.
              </p>
            </div>
            <div className="bg-white p-3.5 border border-[#E5D7DB] rounded-xl shadow-2xs">
              <strong className="text-[#520018] font-serif font-bold text-sm block mb-1">2. Blank Tile Ignored</strong>
              <p className="text-[#71666B] font-sans">
                The blank tile (0) is omitted from the distance calculation because only physical sliding tiles count toward displacement.
              </p>
            </div>
            <div className="bg-white p-3.5 border border-[#E5D7DB] rounded-xl shadow-2xs">
              <strong className="text-[#520018] font-serif font-bold text-sm block mb-1">3. Monotonic / Consistent</strong>
              <p className="text-[#71666B] font-sans">
                Moving a single tile changes the total Manhattan distance by at most ±1 step per valid sliding move.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Solvability & Inversion Parity */}
      {activeTab === 'solvability' && (
        <div className="space-y-4 text-xs sm:text-sm text-[#292329] leading-relaxed">
          <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl p-4">
            <h4 className="font-serif font-bold text-[#520018] text-base mb-1">
              The 8-Puzzle Solvability Theorem
            </h4>
            <p className="text-[#71666B] text-xs leading-relaxed font-sans">
              Not every permutation of the 9 tiles (362,880 possible arrangements) can reach the goal state. Exactly half (181,440) are solvable, and the other half are completely unreachable.
            </p>
          </div>

          <div className="bg-white p-4 border border-[#E5D7DB] rounded-xl space-y-2 text-xs shadow-2xs">
            <strong className="text-[#520018] font-serif font-bold text-sm block">
              Inversion Count Rule for 3×3 Grids:
            </strong>
            <p className="text-[#71666B] font-sans">
              An <strong>inversion</strong> occurs whenever a tile with a greater number appears before a tile with a smaller number in the linear array sequence (ignoring the blank tile 0).
            </p>
            <div className="p-3 bg-[#F8F5F5] border border-[#E5D7DB] rounded-lg font-mono text-[#800020] font-bold">
              Solvable ⇔ (Initial Inversions mod 2) == (Goal Inversions mod 2)
            </div>
            <p className="text-[#71666B] font-sans">
              For the standard goal <code className="font-mono font-bold">[1, 2, 3, 4, 5, 6, 7, 8, 0]</code>, the number of inversions is 0 (even). Therefore, any initial state is solvable if and only if its inversion count is <strong>even</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (isOpenModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white border border-[#E5D7DB] rounded-xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden text-[#292329]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5D7DB]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#800020] text-white flex items-center justify-center rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-[#520018]">
                  GBFS Search Algorithm Guide
                </h3>
                <p className="text-xs text-[#71666B] font-sans">
                  Comprehensive Computer Science Search Algorithm Documentation
                </p>
              </div>
            </div>
            {onCloseModal && (
              <button
                onClick={onCloseModal}
                className="px-3 py-1.5 bg-white hover:bg-[#F0DDE1]/60 text-[#800020] border border-[#E5D7DB] text-xs font-mono font-semibold rounded-lg cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
          <div className="overflow-y-auto py-4 pr-1">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5D7DB] rounded-xl p-5 sm:p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E5D7DB]">
        <BookOpen className="w-5 h-5 text-[#800020]" />
        <h3 className="font-serif font-bold text-[#292329] text-lg sm:text-xl">
          Educational Concept &amp; Pseudocode
        </h3>
      </div>
      {content}
    </div>
  );
};
