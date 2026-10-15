import React, { useState, useEffect, useRef } from 'react';
import {
  PuzzleState,
  SolverResult,
  StepRecord,
  SearchNode,
  HeuristicType
} from '../types';
import { MiniPuzzleBoard } from './MiniPuzzleBoard';
import {
  calculateHeuristic,
  getHeuristicInfo,
  calculateManhattanDistance,
  calculateMisplacedTiles,
  checkSolvability,
  stateToString
} from '../utils/puzzleEngine';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sparkles,
  Award,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  Info,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
  ListOrdered,
  Gauge,
  Sliders,
  Copy,
  Check,
  Download,
  Eye,
  Route,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface PuzzleVisualizationSectionProps {
  initialState: PuzzleState;
  goalState: PuzzleState;
  solverResult: SolverResult | null;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  heuristicType: HeuristicType;
  onHeuristicChange: (newType: HeuristicType) => void;
  onRunSolver: () => void;
  onOpenCustomModal?: () => void;
  onSelectStatePreview?: (state: PuzzleState, movedTile: number | null, direction: string | null) => void;
}

export const PuzzleVisualizationSection: React.FC<PuzzleVisualizationSectionProps> = ({
  initialState,
  goalState,
  solverResult,
  currentStepIndex,
  onStepChange,
  heuristicType,
  onHeuristicChange,
  onRunSolver,
  onOpenCustomModal,
  onSelectStatePreview
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [viewMode, setViewMode] = useState<'search' | 'solution'>('search');
  const [solutionStepIndex, setSolutionStepIndex] = useState<number>(0);
  const [isSolutionPlaying, setIsSolutionPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const speedIntervals = {
    slow: 1100,
    normal: 550,
    fast: 200
  };

  const heuristicMeta = getHeuristicInfo(heuristicType);
  const solvability = checkSolvability(initialState, goalState);

  const steps = solverResult?.steps || [];
  const solutionPath = solverResult?.solutionPath || [];
  const totalSteps = steps.length;
  const currentStep: StepRecord | undefined = steps[currentStepIndex];

  // Confetti on goal reached
  useEffect(() => {
    if (solverResult?.success && solutionPath.length > 0) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // safe fallback
      }
    }
  }, [solverResult?.success, solutionPath.length]);

  // Search Playback Timer Loop
  useEffect(() => {
    let timer: any;
    if (isPlaying && totalSteps > 0) {
      timer = setInterval(() => {
        if (currentStepIndex >= totalSteps - 1) {
          setIsPlaying(false);
        } else {
          const next = currentStepIndex + 1;
          onStepChange(next);
          const node = steps[next]?.selectedNode;
          if (node && onSelectStatePreview) {
            onSelectStatePreview(node.state, node.movedTile, node.move);
          }
        }
      }, speedIntervals[playbackSpeed]);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps, currentStepIndex, playbackSpeed, steps, onStepChange, onSelectStatePreview]);

  // Solution Path Playback Loop
  useEffect(() => {
    let timer: any;
    if (isSolutionPlaying && solutionPath.length > 0) {
      timer = setInterval(() => {
        setSolutionStepIndex((prev) => {
          if (prev >= solutionPath.length - 1) {
            setIsSolutionPlaying(false);
            return prev;
          }
          const next = prev + 1;
          const node = solutionPath[next];
          if (node && onSelectStatePreview) {
            onSelectStatePreview(node.state, node.movedTile, node.move);
          }
          return next;
        });
      }, speedIntervals[playbackSpeed]);
    }
    return () => clearInterval(timer);
  }, [isSolutionPlaying, solutionPath, playbackSpeed, onSelectStatePreview]);

  // Playback handlers
  const handlePlayPause = () => {
    if (viewMode === 'search') {
      if (currentStepIndex >= totalSteps - 1) {
        onStepChange(0);
      }
      setIsPlaying(!isPlaying);
    } else {
      if (solutionStepIndex >= solutionPath.length - 1) {
        setSolutionStepIndex(0);
      }
      setIsSolutionPlaying(!isSolutionPlaying);
    }
  };

  const handleNext = () => {
    if (viewMode === 'search') {
      if (currentStepIndex < totalSteps - 1) {
        const next = currentStepIndex + 1;
        onStepChange(next);
        const node = steps[next]?.selectedNode;
        if (node && onSelectStatePreview) onSelectStatePreview(node.state, node.movedTile, node.move);
      }
    } else {
      if (solutionStepIndex < solutionPath.length - 1) {
        const next = solutionStepIndex + 1;
        setSolutionStepIndex(next);
        const node = solutionPath[next];
        if (node && onSelectStatePreview) onSelectStatePreview(node.state, node.movedTile, node.move);
      }
    }
  };

  const handlePrev = () => {
    if (viewMode === 'search') {
      if (currentStepIndex > 0) {
        const prev = currentStepIndex - 1;
        onStepChange(prev);
        const node = steps[prev]?.selectedNode;
        if (node && onSelectStatePreview) onSelectStatePreview(node.state, node.movedTile, node.move);
      }
    } else {
      if (solutionStepIndex > 0) {
        const prev = solutionStepIndex - 1;
        setSolutionStepIndex(prev);
        const node = solutionPath[prev];
        if (node && onSelectStatePreview) onSelectStatePreview(node.state, node.movedTile, node.move);
      }
    }
  };

  const handleRestart = () => {
    if (viewMode === 'search') {
      setIsPlaying(false);
      onStepChange(0);
      const node = steps[0]?.selectedNode;
      if (node && onSelectStatePreview) onSelectStatePreview(node.state, node.movedTile, node.move);
    } else {
      setIsSolutionPlaying(false);
      setSolutionStepIndex(0);
      const node = solutionPath[0];
      if (node && onSelectStatePreview) onSelectStatePreview(node.state, node.movedTile, node.move);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setIsSolutionPlaying(false);
    onStepChange(0);
    setSolutionStepIndex(0);
    if (onSelectStatePreview) onSelectStatePreview(initialState, null, null);
  };

  const copySolutionText = () => {
    if (!solutionPath.length) return;
    const lines = [
      '==============================================',
      '8-PUZZLE SOLUTION PATH (GREEDY BEST-FIRST SEARCH)',
      `Heuristic: ${heuristicMeta.name} | Evaluation: f(n) = h(n)`,
      `Total Path Length: ${solutionPath.length - 1} moves`,
      '==============================================\n'
    ];

    solutionPath.forEach((node, idx) => {
      const title = idx === 0
        ? 'Step 0: Initial State'
        : idx === solutionPath.length - 1
        ? `Step ${idx}: Move Blank ${node.move} (Tile ${node.movedTile} slid) -> GOAL STATE REACHED`
        : `Step ${idx}: Move Blank ${node.move} (Tile ${node.movedTile} slid) | h(n)=${node.h}`;
      lines.push(title);
      lines.push(`[ ${node.state[0]} ${node.state[1]} ${node.state[2]} ]`);
      lines.push(`[ ${node.state[3]} ${node.state[4]} ${node.state[5]} ]`);
      lines.push(`[ ${node.state[6]} ${node.state[7]} ${node.state[8]} ]\n`);
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadSolutionJSON = () => {
    if (!solutionPath.length) return;
    const data = {
      algorithm: 'Greedy Best-First Search (GBFS)',
      heuristic: heuristicMeta.name,
      evaluationFunction: 'f(n) = h(n)',
      totalMoves: solutionPath.length - 1,
      totalExploredStates: solverResult?.stats.exploredCount || 0,
      initialState,
      goalState,
      solutionPath: solutionPath.map((node, i) => ({
        step: i,
        action: node.move,
        movedTile: node.movedTile,
        heuristicValue: node.h,
        state: node.state
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `8puzzle-gbfs-visualization-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getMoveIcon = (dir: string) => {
    switch (dir) {
      case 'UP': return <ArrowUp className="w-3.5 h-3.5" />;
      case 'DOWN': return <ArrowDown className="w-3.5 h-3.5" />;
      case 'LEFT': return <ArrowLeft className="w-3.5 h-3.5" />;
      case 'RIGHT': return <ArrowRight className="w-3.5 h-3.5" />;
      default: return <Activity className="w-3.5 h-3.5" />;
    }
  };

  // Determine current active node based on view mode
  const activeNode: SearchNode | null = viewMode === 'search'
    ? (currentStep?.selectedNode || (solutionPath.length > 0 ? solutionPath[0] : null))
    : (solutionPath[solutionStepIndex] || null);

  const activeState: PuzzleState = activeNode ? activeNode.state : initialState;
  const activeHeuristic = activeNode
    ? activeNode.h
    : calculateHeuristic(initialState, goalState, heuristicType);

  // Successors of current step
  const successors = currentStep?.generatedNeighbors || [];
  // Find minimum h(n) among successors
  const validSuccessors = successors.filter(s => !s.isAlreadyClosed && !s.isAlreadyOpen);
  const minSuccessorH = validSuccessors.length > 0
    ? Math.min(...validSuccessors.map(s => s.h))
    : null;

  return (
    <section id="puzzle-visualization-section" className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* 1. Header & Academic Prompt Description */}
      <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-[#1A1A1A] text-white px-2 py-0.5">
                Core Module
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D95D39] bg-[#E5E2D9] px-2 py-0.5 border border-[#1A1A1A]/30">
                Interactive State Space
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#1A1A1A] mt-1">
              4. Puzzle Visualization
            </h2>
          </div>

          {/* Quick Solve / Re-run action */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRunSolver}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A1A1A] hover:bg-[#D95D39] text-white text-xs font-mono font-bold uppercase tracking-wider border border-[#1A1A1A] transition-colors cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Execute GBFS Solver</span>
            </button>

            {onOpenCustomModal && (
              <button
                onClick={onOpenCustomModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#E5E2D9] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] text-xs font-mono font-bold uppercase tracking-wider border border-[#1A1A1A] transition-colors cursor-pointer"
                title="Edit Initial or Goal state"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Configure Matrices</span>
              </button>
            )}
          </div>
        </div>

        {/* Required Academic Description Paragraph verbatim */}
        <p className="text-sm sm:text-base text-[#1A1A1A]/90 font-sans leading-relaxed bg-[#E5E2D9] p-4 border border-[#1A1A1A]">
          The Puzzle Visualization displays the initial state, goal state, current state, generated successor states, and the final solution path. The movement of the blank tile is animated so that the user can clearly understand how the search algorithm transforms the puzzle from the initial state to the goal state.
        </p>

        {/* Algorithm & Heuristic Parameters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* GBFS Algorithm */}
          <div className="p-3 bg-[#F9F7F2] border border-[#1A1A1A] flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-[#1A1A1A]/60">
              Search Algorithm
            </span>
            <strong className="text-xs font-mono font-bold text-[#1A1A1A] mt-1 block">
              Greedy Best-First Search (GBFS)
            </strong>
          </div>

          {/* Evaluation Function */}
          <div className="p-3 bg-[#F9F7F2] border border-[#1A1A1A] flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-[#1A1A1A]/60">
              Evaluation Function
            </span>
            <strong className="text-xs font-mono font-bold text-[#D95D39] mt-1 block">
              f(n) = h(n)
            </strong>
          </div>

          {/* Heuristic Toggle */}
          <div className="p-3 bg-[#F9F7F2] border border-[#1A1A1A] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[#1A1A1A]/60">
                Selected Heuristic
              </span>
              <span className="text-[10px] font-mono font-bold text-[#2D5A27]">
                {heuristicMeta.symbol}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onHeuristicChange('MANHATTAN')}
                className={`flex-1 py-1 px-2 text-[10px] font-mono font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                  heuristicType === 'MANHATTAN'
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-[#E5E2D9] text-[#1A1A1A] border-[#1A1A1A]/40 hover:bg-[#F9F7F2]'
                }`}
              >
                Manhattan (h₂)
              </button>
              <button
                onClick={() => onHeuristicChange('MISPLACED')}
                className={`flex-1 py-1 px-2 text-[10px] font-mono font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                  heuristicType === 'MISPLACED'
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-[#E5E2D9] text-[#1A1A1A] border-[#1A1A1A]/40 hover:bg-[#F9F7F2]'
                }`}
              >
                Misplaced (h₁)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Solvability Check Warning if unsolvable */}
      {!solvability.isSolvable && (
        <div className="p-4 bg-[#D95D39]/15 border-2 border-[#D95D39] text-xs text-[#1A1A1A] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#D95D39] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-mono font-bold text-sm text-[#D95D39] uppercase">
              No solution found — Inversion Parity Mismatch
            </strong>
            <p className="font-sans text-xs sm:text-sm">
              {solvability.reason}. In an 8-Puzzle, a state is solvable only if the permutation inversion count parity matches the goal state parity.
            </p>
          </div>
        </div>
      )}

      {/* 3. Initial State & Goal State Prominent Display Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Initial State Card */}
        <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1A1A1A]/20">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#1A1A1A]/60 block font-bold">
                Starting Matrix Configuration
              </span>
              <h3 className="text-lg font-serif italic font-bold text-[#1A1A1A]">
                Initial State (Step 0)
              </h3>
            </div>
            <span className="px-2 py-0.5 text-xs font-mono font-bold uppercase bg-[#E5E2D9] text-[#1A1A1A] border border-[#1A1A1A]">
              Step 0
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
            <div className="bg-[#1A1A1A] border-2 border-[#1A1A1A] p-2 shadow-md">
              <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
                {initialState.map((tile, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-center font-serif font-bold text-lg border border-[#1A1A1A] select-none ${
                      tile === 0
                        ? 'bg-[#D95D39] text-white'
                        : 'bg-[#F9F7F2] text-[#1A1A1A]'
                    }`}
                  >
                    {tile === 0 ? '_' : tile}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs font-mono space-y-2 text-center sm:text-left">
              <div>
                <span className="text-[10px] text-[#1A1A1A]/60 block uppercase font-bold">Initial Heuristic</span>
                <span className="text-base font-bold text-[#D95D39]">
                  {heuristicMeta.symbol} = {calculateHeuristic(initialState, goalState, heuristicType)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#1A1A1A]/60 block uppercase font-bold">Inversion Parity</span>
                <span className="text-xs font-bold text-[#1A1A1A]">
                  {solvability.initialInversions} inversions ({solvability.initialInversions % 2 === 0 ? 'Even' : 'Odd'})
                </span>
              </div>
              <div className="text-[10px] text-[#1A1A1A]/60">
                Matrix: [{initialState.slice(0, 3).join(',')}] [{initialState.slice(3, 6).join(',')}] [{initialState.slice(6, 9).join(',')}]
              </div>
            </div>
          </div>
        </div>

        {/* Goal State Card */}
        <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1A1A1A]/20">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#1A1A1A]/60 block font-bold">
                Target Configuration
              </span>
              <h3 className="text-lg font-serif italic font-bold text-[#1A1A1A]">
                Goal State (Target)
              </h3>
            </div>
            <span className="px-2 py-0.5 text-xs font-mono font-bold uppercase bg-[#2D5A27] text-white border border-[#1A1A1A]">
              Goal Target
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
            <div className="bg-[#1A1A1A] border-2 border-[#1A1A1A] p-2 shadow-md">
              <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
                {goalState.map((tile, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-center font-serif font-bold text-lg border border-[#1A1A1A] select-none ${
                      tile === 0
                        ? 'bg-[#2D5A27] text-white'
                        : 'bg-[#F9F7F2] text-[#1A1A1A]'
                    }`}
                  >
                    {tile === 0 ? '_' : tile}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs font-mono space-y-2 text-center sm:text-left">
              <div>
                <span className="text-[10px] text-[#1A1A1A]/60 block uppercase font-bold">Target Heuristic</span>
                <span className="text-base font-bold text-[#2D5A27]">
                  {heuristicMeta.symbol} = 0 (Goal)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#1A1A1A]/60 block uppercase font-bold">Goal Inversions</span>
                <span className="text-xs font-bold text-[#1A1A1A]">
                  {solvability.goalInversions} inversions ({solvability.goalInversions % 2 === 0 ? 'Even' : 'Odd'})
                </span>
              </div>
              <div className="text-[10px] text-[#1A1A1A]/60">
                Matrix: [{goalState.slice(0, 3).join(',')}] [{goalState.slice(3, 6).join(',')}] [{goalState.slice(6, 9).join(',')}]
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Search Mode vs Solution Path Switcher Tabs */}
      <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] bg-[#E5E2D9] p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('search')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
              viewMode === 'search'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-[#F9F7F2] text-[#1A1A1A] border-[#1A1A1A]/40 hover:bg-[#1A1A1A] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>1. Search Exploration Mode ({totalSteps} steps)</span>
            </span>
          </button>

          <button
            onClick={() => setViewMode('solution')}
            disabled={solutionPath.length === 0}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer border disabled:opacity-40 ${
              viewMode === 'solution'
                ? 'bg-[#2D5A27] text-white border-[#1A1A1A]'
                : 'bg-[#F9F7F2] text-[#1A1A1A] border-[#1A1A1A]/40 hover:bg-[#2D5A27] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5" />
              <span>2. Final Solution Path ({solutionPath.length > 0 ? solutionPath.length - 1 : 0} moves)</span>
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
          <span className="text-[10px] uppercase text-[#1A1A1A]/60 font-bold">Speed:</span>
          {(['slow', 'normal', 'fast'] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold border transition-colors cursor-pointer ${
                playbackSpeed === spd
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-[#F9F7F2] text-[#1A1A1A] border-[#1A1A1A]/30'
              }`}
            >
              {spd}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Master Playback & Animation Controls Toolbar */}
      <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePlayPause}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-white font-mono font-bold text-xs uppercase tracking-widest border border-[#1A1A1A] transition-all cursor-pointer shadow-xs ${
              (viewMode === 'search' ? isPlaying : isSolutionPlaying)
                ? 'bg-[#D95D39] hover:bg-[#1A1A1A]'
                : 'bg-[#1A1A1A] hover:bg-[#D95D39]'
            }`}
          >
            {(viewMode === 'search' ? isPlaying : isSolutionPlaying) ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Play Animation</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrev}
            disabled={viewMode === 'search' ? currentStepIndex === 0 : solutionStepIndex === 0}
            className="p-2.5 bg-[#E5E2D9] border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <div className="px-3 py-1.5 bg-[#E5E2D9] border border-[#1A1A1A] font-mono text-xs font-bold text-[#1A1A1A] select-none">
            {viewMode === 'search' ? (
              <span>Step {currentStepIndex + 1} / {totalSteps || 1}</span>
            ) : (
              <span>Move {solutionStepIndex} / {solutionPath.length > 0 ? solutionPath.length - 1 : 0}</span>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={viewMode === 'search' ? currentStepIndex >= totalSteps - 1 : solutionStepIndex >= solutionPath.length - 1}
            className="p-2.5 bg-[#E5E2D9] border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleRestart}
            className="p-2.5 bg-[#E5E2D9] border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer"
            title="Restart from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-2 bg-[#E5E2D9] border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
            title="Reset view to Step 0"
          >
            Reset
          </button>
        </div>

        {/* Speed Controls & Mode status */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex sm:hidden items-center gap-1">
            {(['slow', 'normal', 'fast'] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold border ${
                  playbackSpeed === spd
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-[#E5E2D9] text-[#1A1A1A] border-[#1A1A1A]/30'
                }`}
              >
                {spd}
              </button>
            ))}
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#1A1A1A]/60 block uppercase font-bold">Active Mode</span>
            <strong className="text-xs text-[#1A1A1A]">
              {viewMode === 'search' ? 'Exploration Steps' : 'Solution Trajectory'}
            </strong>
          </div>
        </div>
      </div>

      {/* 6. Current State & Blank Tile Movement Animation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dedicated Current State Card with Animated 3x3 Grid */}
        <div className="lg:col-span-6 bg-[#F9F7F2] border-2 border-[#1A1A1A] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1A1A1A]/20">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#1A1A1A]/60 block font-bold">
                  {viewMode === 'search' ? 'Expanded State in Priority Queue' : 'Trajectory Step'}
                </span>
                <h3 className="text-xl font-serif italic font-bold text-[#1A1A1A]">
                  Current State ({viewMode === 'search' ? `Step ${currentStepIndex + 1}` : `Move ${solutionStepIndex}`})
                </h3>
              </div>
              <span className={`px-2.5 py-1 text-xs font-mono font-bold uppercase border ${
                activeHeuristic === 0
                  ? 'bg-[#2D5A27] text-white border-[#1A1A1A]'
                  : 'bg-[#D95D39] text-white border-[#1A1A1A]'
              }`}>
                {activeHeuristic === 0 ? 'Goal Reached ✓' : `${heuristicMeta.symbol} = ${activeHeuristic}`}
              </span>
            </div>

            {/* Current State Animated 3x3 Board */}
            <div className="flex flex-col items-center justify-center my-4">
              <div className="bg-[#1A1A1A] border-2 border-[#1A1A1A] p-3 shadow-xl w-64 h-64">
                <div className="grid grid-cols-3 gap-2 w-full h-full">
                  {activeState.map((tile, idx) => {
                    const isBlank = tile === 0;
                    const isMovedTile = activeNode?.movedTile === tile && !isBlank;

                    return (
                      <motion.div
                        key={`tile-${tile}-${idx}`}
                        layout
                        initial={{ scale: 0.95, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        className={`flex flex-col items-center justify-center font-serif font-bold text-2xl select-none border-2 border-[#1A1A1A] transition-all relative ${
                          isBlank
                            ? 'bg-[#D95D39] text-white shadow-inner'
                            : isMovedTile
                            ? 'bg-[#E5E2D9] text-[#D95D39] ring-2 ring-[#D95D39]'
                            : 'bg-[#F9F7F2] text-[#1A1A1A]'
                        }`}
                      >
                        {isBlank ? (
                          <div className="flex flex-col items-center justify-center">
                            <span className="font-mono text-base font-bold">_</span>
                            <span className="text-[8px] font-mono uppercase tracking-widest text-white/80">Blank</span>
                          </div>
                        ) : (
                          <span>{tile}</span>
                        )}

                        {/* Coordinates tag */}
                        <span className="absolute bottom-0.5 right-1 text-[8px] font-mono font-normal opacity-40">
                          {Math.floor(idx / 3)},{idx % 3}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Blank Tile Move Description */}
              <div className="mt-4 p-3 bg-[#E5E2D9] border border-[#1A1A1A] w-full text-center text-xs font-mono">
                {activeNode?.move && activeNode.move !== 'START' ? (
                  <div className="flex items-center justify-center gap-2 text-[#1A1A1A]">
                    <span className="font-bold">Last Action:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1A1A1A] text-white uppercase font-bold text-[11px]">
                      {getMoveIcon(activeNode.move)}
                      <span>Move Blank {activeNode.move}</span>
                    </span>
                    <span className="text-[#1A1A1A]/80">
                      (Tile <strong>{activeNode.movedTile}</strong> slid into blank space)
                    </span>
                  </div>
                ) : (
                  <span className="font-bold text-[#1A1A1A]/80 uppercase">
                    Initial Configuration (No prior moves)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Heuristic Evaluation Breakdown for Current State */}
          <div className="pt-3 border-t border-[#1A1A1A]/20 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-[10px] text-[#1A1A1A]/60 uppercase font-bold block">Evaluation Function</span>
              <span className="font-bold text-[#1A1A1A]">f(n) = h(n) = {activeHeuristic}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#1A1A1A]/60 uppercase font-bold block">Tree Depth</span>
              <span className="font-bold text-[#1A1A1A]">g(n) = {activeNode?.depth || 0}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#1A1A1A]/60 uppercase font-bold block">Goal Match</span>
              <span className={`font-bold ${activeHeuristic === 0 ? 'text-[#2D5A27]' : 'text-[#D95D39]'}`}>
                {activeHeuristic === 0 ? '100% (Matched)' : `${9 - calculateMisplacedTiles(activeState, goalState)}/9 Tiles in place`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Generated Successor States & GBFS Decision */}
        <div className="lg:col-span-6 bg-[#F9F7F2] border-2 border-[#1A1A1A] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1A1A1A]/20">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#1A1A1A]/60 block font-bold">
                  Branching Expansion
                </span>
                <h3 className="text-xl font-serif italic font-bold text-[#1A1A1A]">
                  Generated Successor States ({successors.length})
                </h3>
              </div>
              <span className="px-2 py-0.5 text-xs font-mono font-bold uppercase bg-[#E5E2D9] text-[#1A1A1A] border border-[#1A1A1A]">
                {successors.length} Valid Moves
              </span>
            </div>

            {/* Successors Grid */}
            {successors.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-[#1A1A1A]/30 bg-[#E5E2D9]/50 text-center flex flex-col items-center justify-center my-6">
                <CheckCircle2 className="w-8 h-8 text-[#2D5A27] mb-2" />
                <strong className="font-serif italic font-bold text-base text-[#1A1A1A]">
                  {currentStep?.status === 'GOAL_FOUND' ? 'Goal State Reached!' : 'No Successors to Expand'}
                </strong>
                <p className="text-xs text-[#1A1A1A]/70 font-sans max-w-xs mt-1">
                  {currentStep?.explanation || 'Click "Execute GBFS Solver" or use Playback to step through the search tree.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                  {successors.map((succ, sIdx) => {
                    const isMinHeuristic = !succ.isAlreadyClosed && !succ.isAlreadyOpen && succ.h === minSuccessorH;
                    const isPruned = succ.isAlreadyClosed || succ.isAlreadyOpen;

                    return (
                      <div
                        key={sIdx}
                        className={`p-3 border-2 transition-all flex flex-col items-center text-center relative ${
                          isMinHeuristic
                            ? 'bg-[#E5E2D9] border-[#D95D39] shadow-md ring-2 ring-[#D95D39]/30'
                            : isPruned
                            ? 'bg-[#E5E2D9]/50 border-[#1A1A1A]/30 opacity-60'
                            : 'bg-[#F9F7F2] border-[#1A1A1A]'
                        }`}
                      >
                        {/* Header direction badge */}
                        <div className="flex items-center justify-between w-full text-[10px] font-mono font-bold mb-1.5 pb-1 border-b border-[#1A1A1A]/20">
                          <span className="flex items-center gap-1 uppercase text-[#1A1A1A]">
                            {getMoveIcon(succ.direction)}
                            <span>Move {succ.direction}</span>
                          </span>
                          <span className={`px-1.5 py-0.2 border ${
                            isMinHeuristic
                              ? 'bg-[#D95D39] text-white border-[#1A1A1A]'
                              : 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          }`}>
                            {heuristicMeta.symbol} = {succ.h}
                          </span>
                        </div>

                        {/* Mini Board */}
                        <MiniPuzzleBoard
                          state={succ.state}
                          size="sm"
                          highlightTile={succ.movedTile}
                        />

                        {/* Status tag */}
                        <div className="mt-2 w-full">
                          {succ.isAlreadyClosed ? (
                            <span className="text-[9px] font-mono font-bold uppercase text-[#1A1A1A]/60 bg-[#E5E2D9] px-1.5 py-0.5 border border-[#1A1A1A]/30 block truncate">
                              Pruned (CLOSED)
                            </span>
                          ) : succ.isAlreadyOpen ? (
                            <span className="text-[9px] font-mono font-bold uppercase text-[#1A1A1A]/70 bg-[#E5E2D9] px-1.5 py-0.5 border border-[#1A1A1A]/30 block truncate">
                              In Queue (OPEN)
                            </span>
                          ) : isMinHeuristic ? (
                            <span className="text-[9px] font-mono font-bold uppercase text-white bg-[#D95D39] px-1.5 py-0.5 border border-[#1A1A1A] block truncate">
                              ★ GBFS Selected (Min h)
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono font-bold uppercase text-[#1A1A1A] bg-[#E5E2D9] px-1.5 py-0.5 border border-[#1A1A1A]/30 block truncate">
                              Added to OPEN
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Clear Academic GBFS Decision Explanation Text */}
                <div className="p-3 bg-[#E5E2D9] border border-[#1A1A1A] text-xs font-mono space-y-1">
                  <div className="font-bold text-[#1A1A1A] uppercase flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-[#D95D39]" />
                    <span>GBFS Selection Decision Logic:</span>
                  </div>
                  <p className="text-[#1A1A1A]/90 font-sans text-xs leading-relaxed">
                    {validSuccessors.length > 0 ? (
                      <>
                        Greedy Best-First Search evaluates all unvisited candidates using <code>f(n) = h(n)</code>. Among valid successors, state with move <strong>{validSuccessors.find(s => s.h === minSuccessorH)?.direction}</strong> yields the lowest heuristic estimation <strong>h(n) = {minSuccessorH}</strong> and will be prioritized at the head of the OPEN Priority Queue.
                      </>
                    ) : (
                      'All generated candidate states are already in the explored set (CLOSED) or already in OPEN. Search continues with remaining queue states.'
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Explored & Frontier counters */}
          <div className="pt-3 border-t border-[#1A1A1A]/20 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-[10px] text-[#1A1A1A]/60 uppercase font-bold block">Frontier (OPEN)</span>
              <strong className="text-[#1A1A1A]">{currentStep?.frontierCount || 0} nodes</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#1A1A1A]/60 uppercase font-bold block">Explored (CLOSED)</span>
              <strong className="text-[#1A1A1A]">{currentStep?.exploredCount || 0} states</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#1A1A1A]/60 uppercase font-bold block">Step Status</span>
              <strong className="text-[#D95D39]">{currentStep?.status || 'IDLE'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Step-by-Step Search Progression Timeline Visualization */}
      <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-[#1A1A1A]/20">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-[#D95D39]" />
            <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">
              Step-by-Step Search Sequence (Click to jump to any step)
            </h3>
          </div>
          <span className="text-xs font-mono text-[#1A1A1A]/70">
            {steps.length} total expansion steps recorded
          </span>
        </div>

        {/* Scrollable Timeline */}
        <div className="overflow-x-auto pb-3 pt-1 scrollbar-thin">
          <div className="flex items-center gap-2 min-w-max">
            {steps.map((step, idx) => {
              const isSelected = currentStepIndex === idx && viewMode === 'search';
              const isGoal = step.status === 'GOAL_FOUND';
              const isInitial = idx === 0;

              return (
                <React.Fragment key={idx}>
                  <div
                    onClick={() => {
                      setViewMode('search');
                      onStepChange(idx);
                      if (onSelectStatePreview) {
                        onSelectStatePreview(step.selectedNode.state, step.selectedNode.movedTile, step.selectedNode.move);
                      }
                    }}
                    className={`cursor-pointer p-2 border transition-all flex flex-col items-center select-none ${
                      isSelected
                        ? 'bg-[#F9F7F2] border-2 border-[#D95D39] shadow-md scale-105'
                        : isGoal
                        ? 'bg-[#2D5A27]/10 border-2 border-[#2D5A27]'
                        : 'bg-[#E5E2D9] border border-[#1A1A1A] hover:bg-[#F9F7F2]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full text-[9px] font-mono text-[#1A1A1A]/70 mb-1 px-0.5">
                      <span>Step {step.stepIndex}</span>
                      {isInitial ? (
                        <span className="font-bold text-[#1A1A1A]">START</span>
                      ) : isGoal ? (
                        <span className="font-bold text-[#2D5A27]">GOAL ✓</span>
                      ) : (
                        <span className="font-bold uppercase text-[#D95D39]">{step.selectedNode.move}</span>
                      )}
                    </div>

                    <MiniPuzzleBoard
                      state={step.selectedNode.state}
                      size="sm"
                      highlightTile={step.selectedNode.movedTile}
                    />

                    <div className="mt-1.5">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border ${
                        isSelected
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          : isGoal
                          ? 'bg-[#2D5A27] text-white border-[#1A1A1A]'
                          : 'bg-[#F9F7F2] text-[#1A1A1A] border-[#1A1A1A]/40'
                      }`}>
                        {heuristicMeta.symbol}={step.selectedNode.h}
                      </span>
                    </div>
                  </div>

                  {idx < steps.length - 1 && (
                    <div className="flex flex-col items-center text-[#1A1A1A]/40 px-0.5">
                      <ArrowRight className="w-3.5 h-3.5 text-[#1A1A1A]/40" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* 8. Final Solution Path Section */}
      {solverResult?.success && solutionPath.length > 0 && (
        <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#1A1A1A]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2D5A27] text-white flex items-center justify-center border border-[#1A1A1A]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif italic font-bold text-xl text-[#1A1A1A]">
                    Final Solution Path
                  </h3>
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold uppercase bg-[#2D5A27] text-white border border-[#1A1A1A]">
                    {solutionPath.length - 1} Optimal Moves
                  </span>
                  <span className="px-2 py-0.5 text-xs font-mono font-bold uppercase bg-[#E5E2D9] text-[#2D5A27] border border-[#2D5A27]">
                    ✓ Goal State Reached
                  </span>
                </div>
                <p className="text-xs text-[#1A1A1A]/70 mt-0.5 font-sans">
                  The reconstructed direct path from Initial State to Goal State extracted from parent pointers.
                </p>
              </div>
            </div>

            {/* Copy & Export Actions */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                onClick={copySolutionText}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E5E2D9] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] border border-[#1A1A1A] uppercase font-bold text-[11px] tracking-wider transition-colors cursor-pointer"
                title="Copy formatted steps text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#2D5A27]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Steps'}</span>
              </button>

              <button
                onClick={downloadSolutionJSON}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E5E2D9] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] border border-[#1A1A1A] uppercase font-bold text-[11px] tracking-wider transition-colors cursor-pointer"
                title="Export Solution JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Solution Horizontal Visual Trajectory */}
          <div className="overflow-x-auto pb-3 pt-1 scrollbar-thin">
            <div className="flex items-center gap-2 min-w-max">
              {solutionPath.map((node, idx) => {
                const isSelected = viewMode === 'solution' && solutionStepIndex === idx;
                const isInitial = idx === 0;
                const isGoal = idx === solutionPath.length - 1;

                return (
                  <React.Fragment key={idx}>
                    <div
                      onClick={() => {
                        setViewMode('solution');
                        setSolutionStepIndex(idx);
                        if (onSelectStatePreview) {
                          onSelectStatePreview(node.state, node.movedTile, node.move);
                        }
                      }}
                      className={`cursor-pointer p-2 border transition-all flex flex-col items-center select-none ${
                        isSelected
                          ? 'bg-[#F9F7F2] border-2 border-[#2D5A27] shadow-md scale-105'
                          : isGoal
                          ? 'bg-[#2D5A27]/15 border-2 border-[#2D5A27]'
                          : 'bg-[#E5E2D9] border border-[#1A1A1A] hover:bg-[#F9F7F2]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full text-[9px] font-mono text-[#1A1A1A]/70 mb-1 px-0.5">
                        <span>Move #{idx}</span>
                        {isInitial ? (
                          <span className="font-bold text-[#1A1A1A]">START</span>
                        ) : isGoal ? (
                          <span className="font-bold text-[#2D5A27]">GOAL ✓</span>
                        ) : (
                          <span className="font-bold uppercase text-[#D95D39]">{node.move}</span>
                        )}
                      </div>

                      <MiniPuzzleBoard
                        state={node.state}
                        size="sm"
                        highlightTile={node.movedTile}
                      />

                      <div className="mt-1.5">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border ${
                          isSelected
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                            : isGoal
                            ? 'bg-[#2D5A27] text-white border-[#1A1A1A]'
                            : 'bg-[#F9F7F2] text-[#1A1A1A] border-[#1A1A1A]/40'
                        }`}>
                          {heuristicMeta.symbol}={node.h}
                        </span>
                      </div>
                    </div>

                    {idx < solutionPath.length - 1 && (
                      <div className="flex flex-col items-center text-[#1A1A1A]/40 px-0.5">
                        <ArrowRight className="w-3.5 h-3.5 text-[#2D5A27]" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
