import React, { useState, useEffect } from 'react';
import { SearchNode, PuzzleState } from '../types';
import { MiniPuzzleBoard } from './MiniPuzzleBoard';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Download,
  Copy,
  Check,
  Award,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SolutionPathViewProps {
  solutionPath: SearchNode[];
  onSelectState: (state: PuzzleState, movedTile: number | null, direction: string | null) => void;
  goalState: PuzzleState;
}

export const SolutionPathView: React.FC<SolutionPathViewProps> = ({
  solutionPath,
  onSelectState,
  goalState
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // Reset to start of solution when path changes
    setActiveStep(0);
    setIsPlaying(false);
    if (solutionPath.length > 0) {
      // Trigger confetti on goal discovery
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [solutionPath]);

  // Solution playback loop
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= solutionPath.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          const node = solutionPath[next];
          onSelectState(node.state, node.movedTile, node.move);
          return next;
        });
      }, 600);
    }
    return () => clearInterval(timer);
  }, [isPlaying, solutionPath, onSelectState]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setIsPlaying(false);
    const node = solutionPath[index];
    onSelectState(node.state, node.movedTile, node.move);
  };

  const handleNext = () => {
    if (activeStep < solutionPath.length - 1) {
      const next = activeStep + 1;
      setActiveStep(next);
      const node = solutionPath[next];
      onSelectState(node.state, node.movedTile, node.move);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      const prev = activeStep - 1;
      setActiveStep(prev);
      const node = solutionPath[prev];
      onSelectState(node.state, node.movedTile, node.move);
    }
  };

  const handleRestart = () => {
    setActiveStep(0);
    setIsPlaying(false);
    const node = solutionPath[0];
    onSelectState(node.state, node.movedTile, node.move);
  };

  const copySolutionText = () => {
    const textLines = [
      '==============================================',
      '8-PUZZLE SOLUTION PATH: GREEDY BEST-FIRST SEARCH',
      'Evaluation Function: f(n) = h(n) [Manhattan Distance]',
      `Total Moves: ${solutionPath.length - 1}`,
      '==============================================\n'
    ];

    solutionPath.forEach((node, idx) => {
      const isInitial = idx === 0;
      const isGoal = idx === solutionPath.length - 1;
      const stepTitle = isInitial
        ? 'Step 0: Initial State'
        : isGoal
        ? `Step ${idx}: Move Blank ${node.move} (Tile ${node.movedTile} slid) -> GOAL STATE REACHED`
        : `Step ${idx}: Move Blank ${node.move} (Tile ${node.movedTile} slid) | h(n)=${node.h}`;

      textLines.push(stepTitle);
      textLines.push(`[ ${node.state[0]} ${node.state[1]} ${node.state[2]} ]`);
      textLines.push(`[ ${node.state[3]} ${node.state[4]} ${node.state[5]} ]`);
      textLines.push(`[ ${node.state[6]} ${node.state[7]} ${node.state[8]} ]\n`);
    });

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadSolutionJSON = () => {
    const data = {
      algorithm: 'Greedy Best-First Search',
      heuristic: 'Manhattan Distance',
      totalMoves: solutionPath.length - 1,
      path: solutionPath.map((n, i) => ({
        step: i,
        action: n.move,
        movedTile: n.movedTile,
        h: n.h,
        state: n.state
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `8puzzle-gbfs-solution-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (solutionPath.length === 0) {
    return null;
  }

  const currentNode = solutionPath[activeStep];

  return (
    <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-5 sm:p-6 flex flex-col gap-5 shadow-sm">
      {/* Header & Solution Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#1A1A1A]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2D5A27] text-white flex items-center justify-center border border-[#1A1A1A]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif italic font-bold text-[#1A1A1A] text-lg sm:text-xl">
                Solution Path Found
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold uppercase bg-[#2D5A27] text-white border border-[#1A1A1A]">
                {solutionPath.length - 1} Moves
              </span>
            </div>
            <p className="text-xs text-[#1A1A1A]/70 mt-0.5 font-sans">
              Sequence of optimal states selected by Greedy Best-First Search
            </p>
          </div>
        </div>

        {/* Export & Copy Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={copySolutionText}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E5E2D9] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] border border-[#1A1A1A] uppercase font-bold text-[11px] tracking-wider transition-colors cursor-pointer"
            title="Copy formatted solution text to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#2D5A27]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Steps'}</span>
          </button>

          <button
            onClick={downloadSolutionJSON}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E5E2D9] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] border border-[#1A1A1A] uppercase font-bold text-[11px] tracking-wider transition-colors cursor-pointer"
            title="Download solution report as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#E5E2D9] p-3 border border-[#1A1A1A]">
        <div className="flex items-center gap-2 flex-wrap">
          {isPlaying ? (
            <button
              onClick={() => setIsPlaying(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D95D39] hover:bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-widest border border-[#1A1A1A] transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={() => setIsPlaying(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A1A1A] hover:bg-[#D95D39] text-white font-bold text-xs uppercase tracking-widest border border-[#1A1A1A] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Play</span>
            </button>
          )}

          <button
            onClick={handlePrev}
            disabled={activeStep === 0 || isPlaying}
            className="p-2 bg-[#F9F7F2] border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Previous Move in Solution"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <span className="px-3 text-xs font-mono font-bold text-[#1A1A1A] select-none">
            Step {activeStep} / {solutionPath.length - 1}
          </span>

          <button
            onClick={handleNext}
            disabled={activeStep >= solutionPath.length - 1 || isPlaying}
            className="p-2 bg-[#F9F7F2] border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Next Move in Solution"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleRestart}
            className="p-2 bg-[#F9F7F2] border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer"
            title="Restart Solution from Step 0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Current solution action description */}
        <div className="text-xs font-mono text-[#1A1A1A] text-center sm:text-right">
          {activeStep === 0 ? (
            <span className="font-bold uppercase tracking-wider">Initial Starting State</span>
          ) : activeStep === solutionPath.length - 1 ? (
            <span className="font-bold text-[#2D5A27] flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>Final Goal State Reached!</span>
            </span>
          ) : (
            <span>
              Move Blank <strong className="uppercase text-[#D95D39] font-bold">{currentNode.move}</strong> (Tile {currentNode.movedTile} shifted)
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Path Timeline */}
      <div className="overflow-x-auto pb-3 pt-1 scrollbar-thin">
        <div className="flex items-center gap-2 min-w-max">
          {solutionPath.map((node, idx) => {
            const isSelected = activeStep === idx;
            const isInitial = idx === 0;
            const isGoal = idx === solutionPath.length - 1;

            return (
              <React.Fragment key={idx}>
                <div
                  onClick={() => handleStepClick(idx)}
                  className={`cursor-pointer p-2 border transition-all flex flex-col items-center select-none ${
                    isSelected
                      ? 'bg-[#F9F7F2] border-2 border-[#D95D39] shadow-md scale-105'
                      : 'bg-[#E5E2D9] border border-[#1A1A1A] hover:bg-[#F9F7F2]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full text-[9px] font-mono text-[#1A1A1A]/70 mb-1 px-0.5">
                    <span>#{idx}</span>
                    {isInitial ? (
                      <span className="text-[#1A1A1A] font-bold">INIT</span>
                    ) : isGoal ? (
                      <span className="text-[#2D5A27] font-bold">GOAL</span>
                    ) : (
                      <span className="font-bold uppercase">{node.move}</span>
                    )}
                  </div>

                  <MiniPuzzleBoard
                    state={node.state}
                    size="sm"
                    highlightTile={node.movedTile}
                  />

                  <div className="mt-2">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border ${
                      isSelected
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : isGoal
                        ? 'bg-[#2D5A27] text-white border-[#1A1A1A]'
                        : 'bg-[#F9F7F2] text-[#1A1A1A] border-[#1A1A1A]/40'
                    }`}>
                      h={node.h}
                    </span>
                  </div>
                </div>

                {idx < solutionPath.length - 1 && (
                  <div className="flex flex-col items-center text-[#1A1A1A]/40 px-0.5">
                    <ArrowRight className="w-4 h-4 text-[#D95D39]" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
