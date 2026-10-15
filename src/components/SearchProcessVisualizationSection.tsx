import React, { useState, useEffect, useRef } from 'react';
import {
  PuzzleState,
  SolverResult,
  HeuristicType,
  AlgorithmType,
  SearchNode
} from '../types';
import { MiniPuzzleBoard } from './MiniPuzzleBoard';
import {
  calculateHeuristic,
  getHeuristicInfo
} from '../utils/puzzleEngine';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
  Sliders,
  ChevronRight,
  ChevronDown,
  TrendingDown,
  Info,
  ListOrdered,
  Clock,
  HelpCircle,
  Hash,
  GitBranch,
  ArrowRight,
  Maximize2
} from 'lucide-react';

interface SearchProcessVisualizationSectionProps {
  initialState: PuzzleState;
  goalState: PuzzleState;
  solverResult: SolverResult | null;
  currentStepIndex: number; // 0-based index of steps
  onStepChange: (newStepIndex: number) => void;
  heuristicType: HeuristicType;
  onHeuristicChange: (newType: HeuristicType) => void;
  algorithmType?: AlgorithmType;
  onAlgorithmChange?: (newAlgo: AlgorithmType) => void;
  onRunSolver: () => void;
  onOpenCustomModal?: () => void;
  onOpenManhattanModal?: () => void;
  onSelectStatePreview?: (state: PuzzleState, movedTile: number | null, move: string | null) => void;
}

export const SearchProcessVisualizationSection: React.FC<SearchProcessVisualizationSectionProps> = ({
  initialState,
  goalState,
  solverResult,
  currentStepIndex,
  onStepChange,
  heuristicType,
  onHeuristicChange,
  algorithmType = 'GBFS',
  onAlgorithmChange,
  onRunSolver,
  onOpenCustomModal,
  onOpenManhattanModal,
  onSelectStatePreview
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [filterFrontier, setFilterFrontier] = useState<string>('');
  const [isFrontierCollapsed, setIsFrontierCollapsed] = useState<boolean>(false);
  const [isExploredCollapsed, setIsExploredCollapsed] = useState<boolean>(false);
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const steps = solverResult?.steps || [];
  const totalSteps = steps.length;
  const currentStep = totalSteps > 0 && currentStepIndex < totalSteps
    ? steps[currentStepIndex]
    : null;

  const heuristicMeta = getHeuristicInfo(heuristicType);

  // Playback timer effect
  useEffect(() => {
    if (isPlaying && totalSteps > 0) {
      const intervalMs = Math.max(120, 1000 / playbackSpeed);
      timerRef.current = setInterval(() => {
        if (currentStepIndex >= totalSteps - 1) {
          setIsPlaying(false);
        } else {
          onStepChange(currentStepIndex + 1);
        }
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, totalSteps, currentStepIndex, playbackSpeed, onStepChange]);

  const handlePlayPause = () => {
    if (!solverResult) {
      onRunSolver();
      setIsPlaying(true);
      return;
    }
    if (currentStepIndex >= totalSteps - 1) {
      onStepChange(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (totalSteps === 0) {
      onRunSolver();
    } else if (currentStepIndex < totalSteps - 1) {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    onStepChange(0);
  };

  // Node details for current step
  const currentNode: SearchNode | null = currentStep ? currentStep.selectedNode : null;
  const nodesGenerated = currentStep ? currentStep.generatedCount : (solverResult ? solverResult.stats.generatedCount : 1);
  const nodesExpanded = currentStep ? currentStep.exploredCount : (solverResult ? solverResult.stats.exploredCount : 0);
  const currentDepth = currentNode ? currentNode.depth : 0;
  const currentPathCost = currentNode ? currentNode.g : 0;
  const currentH = currentNode ? currentNode.h : calculateHeuristic(initialState, goalState, heuristicType);
  const currentF = currentNode ? currentNode.f : (algorithmType === 'ASTAR' ? currentPathCost + currentH : currentH);

  const frontierList = currentStep ? currentStep.frontierSnapshot : [];
  const exploredList = currentStep ? currentStep.exploredSnapshot : [];

  // Filter frontier if user types in search
  const displayedFrontier = filterFrontier.trim() === ''
    ? frontierList
    : frontierList.filter(n =>
        n.nodeLabel.toLowerCase().includes(filterFrontier.toLowerCase()) ||
        (n.parentLabel && n.parentLabel.toLowerCase().includes(filterFrontier.toLowerCase())) ||
        String(n.h).includes(filterFrontier)
      );

  return (
    <div id="search-process-visualization-section" className="flex flex-col gap-8 font-sans max-w-7xl mx-auto w-full">
      {/* 1. Academic Header & Scope Title */}
      <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A1A1A]/20 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-[#1A1A1A] text-white px-2.5 py-1 border border-[#1A1A1A]">
                Section 5
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#E5E2D9] text-[#D95D39] px-2.5 py-1 border border-[#1A1A1A]/40">
                Real-Time Search Trace
              </span>
            </div>
            <h2 className="font-serif italic font-bold text-2xl sm:text-3xl text-[#1A1A1A] tracking-tight">
              5. Search Process Visualization
            </h2>
          </div>

          {/* Quick Config & Action Pills */}
          <div className="flex items-center gap-2.5 flex-wrap text-xs font-mono">
            {/* Algorithm Selector */}
            <div className="flex items-center gap-1 bg-[#E5E2D9] p-1.5 border border-[#1A1A1A]">
              <span className="text-[10px] font-bold uppercase px-1.5 text-[#1A1A1A]/70">Algorithm:</span>
              <button
                onClick={() => onAlgorithmChange && onAlgorithmChange('GBFS')}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                  algorithmType === 'GBFS'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#1A1A1A] hover:bg-[#F9F7F2]'
                }`}
              >
                GBFS [f=h]
              </button>
              <button
                onClick={() => onAlgorithmChange && onAlgorithmChange('ASTAR')}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                  algorithmType === 'ASTAR'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#1A1A1A] hover:bg-[#F9F7F2]'
                }`}
              >
                A* [f=g+h]
              </button>
            </div>

            {/* Heuristic Toggle */}
            <div className="flex items-center gap-1 bg-[#E5E2D9] p-1.5 border border-[#1A1A1A]">
              <span className="text-[10px] font-bold uppercase px-1.5 text-[#1A1A1A]/70">Heuristic:</span>
              <button
                onClick={() => onHeuristicChange('MANHATTAN')}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                  heuristicType === 'MANHATTAN'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#1A1A1A] hover:bg-[#F9F7F2]'
                }`}
              >
                Manhattan (h₂)
              </button>
              <button
                onClick={() => onHeuristicChange('MISPLACED')}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                  heuristicType === 'MISPLACED'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#1A1A1A] hover:bg-[#F9F7F2]'
                }`}
              >
                Misplaced (h₁)
              </button>
            </div>

            {onOpenCustomModal && (
              <button
                onClick={onOpenCustomModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F9F7F2] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A] text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Configure State</span>
              </button>
            )}
          </div>
        </div>

        {/* Verbatim Academic Description */}
        <div className="p-4 bg-[#E5E2D9] border border-[#1A1A1A]/40 text-sm text-[#1A1A1A]/90 font-sans leading-relaxed">
          During the execution of the search algorithm, the application displays the internal search process in real time. This allows the user to understand how nodes are generated, expanded, added to the frontier, moved to the explored set, and selected for further expansion.
        </div>

        {/* Real-time Playback Toolbar */}
        <div className="p-4 bg-[#E5E2D9] border-2 border-[#1A1A1A] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Controls Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePlayPause}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-2 border-[#1A1A1A] transition-all cursor-pointer shadow-xs ${
                isPlaying
                  ? 'bg-[#D95D39] text-white hover:bg-[#C44D2B]'
                  : 'bg-[#1A1A1A] text-white hover:bg-[#333333]'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Search</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{totalSteps === 0 ? 'Start Live Search' : 'Auto Play'}</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrev}
              disabled={currentStepIndex <= 0 || totalSteps === 0}
              className="p-2.5 bg-[#F9F7F2] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A] text-[#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous Step"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              disabled={totalSteps > 0 && currentStepIndex >= totalSteps - 1}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#F9F7F2] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A] text-[#1A1A1A] text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next Step"
            >
              <span>Step Forward</span>
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 bg-[#F9F7F2] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A] text-[#1A1A1A] transition-colors cursor-pointer"
              title="Reset Search to Step 0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed Multiplier */}
            <div className="flex items-center gap-1 pl-3 border-l border-[#1A1A1A]/30">
              <span className="text-[10px] font-mono text-[#1A1A1A]/70 uppercase font-bold">Speed:</span>
              {[0.5, 1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-[#F9F7F2] text-[#1A1A1A] border-[#1A1A1A]/40 hover:bg-[#E5E2D9]'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Step Counter Slider */}
          <div className="flex items-center gap-3 flex-1 max-w-md bg-[#F9F7F2] p-2 border border-[#1A1A1A]/30">
            <span className="text-xs font-mono font-bold text-[#1A1A1A] shrink-0">
              Step {totalSteps > 0 ? currentStepIndex + 1 : 0} / {totalSteps || 0}
            </span>
            <input
              type="range"
              min="0"
              max={Math.max(0, totalSteps - 1)}
              value={totalSteps > 0 ? currentStepIndex : 0}
              onChange={(e) => {
                setIsPlaying(false);
                onStepChange(parseInt(e.target.value, 10));
              }}
              disabled={totalSteps === 0}
              className="w-full accent-[#D95D39] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 2. Structured Key Metrics: 4 Primary Cards + 4 Secondary Metrics */}
      <div className="space-y-4">
        {/* Primary 4-Card KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Nodes Generated */}
          <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A1A1A]/70">
                Nodes Generated
              </span>
              <GitBranch className="w-4 h-4 text-[#1A1A1A]/60" />
            </div>
            <div className="my-2">
              <span className="font-mono font-bold text-3xl text-[#1A1A1A]">
                {nodesGenerated}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#1A1A1A]/60">
              Total states created
            </span>
          </div>

          {/* Card 2: Nodes Expanded */}
          <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A1A1A]/70">
                Nodes Expanded
              </span>
              <Activity className="w-4 h-4 text-[#D95D39]" />
            </div>
            <div className="my-2">
              <span className="font-mono font-bold text-3xl text-[#D95D39]">
                {nodesExpanded}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#1A1A1A]/60">
              Moved to CLOSED set
            </span>
          </div>

          {/* Card 3: Search Depth */}
          <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A1A1A]/70">
                Search Depth g(n)
              </span>
              <Layers className="w-4 h-4 text-[#1A1A1A]/60" />
            </div>
            <div className="my-2">
              <span className="font-mono font-bold text-3xl text-[#1A1A1A]">
                {currentDepth}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#1A1A1A]/60">
              Path cost from root
            </span>
          </div>

          {/* Card 4: Current Heuristic h(n) */}
          <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A1A1A]/70">
                Heuristic h(n)
              </span>
              <Sparkles className="w-4 h-4 text-[#D95D39]" />
            </div>
            <div className="my-2">
              <span className="font-mono font-bold text-3xl text-[#D95D39]">
                {currentH}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#1A1A1A]/60">
              {heuristicMeta.symbol} distance to goal
            </span>
          </div>
        </div>

        {/* Secondary Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#E5E2D9] p-3.5 border-2 border-[#1A1A1A] text-xs font-mono">
          <div className="flex items-center justify-between px-2 border-r border-[#1A1A1A]/20">
            <span className="text-[#1A1A1A]/70">Frontier Size:</span>
            <strong className="text-sm font-bold text-[#1A1A1A]">{frontierList.length}</strong>
          </div>
          <div className="flex items-center justify-between px-2 border-r border-[#1A1A1A]/20">
            <span className="text-[#1A1A1A]/70">Explored Size:</span>
            <strong className="text-sm font-bold text-[#1A1A1A]">{exploredList.length}</strong>
          </div>
          <div className="flex items-center justify-between px-2 border-r border-[#1A1A1A]/20">
            <span className="text-[#1A1A1A]/70">Path Cost g(n):</span>
            <strong className="text-sm font-bold text-[#1A1A1A]">{currentPathCost}</strong>
          </div>
          <div className="flex items-center justify-between px-2">
            <span className="text-[#1A1A1A]/70">Evaluation f(n):</span>
            <strong className="text-sm font-bold text-[#D95D39]">{currentF}</strong>
          </div>
        </div>
      </div>

      {/* 3. Primary Focus: Current Node Being Expanded + Decision Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Current Node Being Expanded */}
        <div className="lg:col-span-5 bg-[#F9F7F2] border-2 border-[#1A1A1A] p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/20 pb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[#D95D39]" />
              <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">
                Current Node Being Expanded
              </h3>
            </div>
            {currentNode && (
              <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-[#1A1A1A] text-white border border-[#1A1A1A]">
                ID: {currentNode.nodeLabel}
              </span>
            )}
          </div>

          {currentNode ? (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
                {/* Board visualization */}
                <div className="flex flex-col items-center">
                  <MiniPuzzleBoard
                    state={currentNode.state}
                    size="lg"
                    highlightTile={currentNode.movedTile}
                    badge={`h(n) = ${currentNode.h}`}
                    badgeColor="terracotta"
                  />
                  <span className="text-[11px] font-mono uppercase text-[#1A1A1A]/70 mt-2 font-bold">
                    Action: {currentNode.move} {currentNode.movedTile !== null ? `(Tile ${currentNode.movedTile})` : ''}
                  </span>
                </div>

                {/* Node Metadata Matrix */}
                <div className="flex-1 w-full space-y-2 text-xs font-mono bg-[#E5E2D9] p-4 border border-[#1A1A1A]">
                  <div className="flex justify-between border-b border-[#1A1A1A]/20 pb-1.5">
                    <span className="text-[#1A1A1A]/70">Node Identifier:</span>
                    <strong className="text-[#1A1A1A] font-bold">{currentNode.nodeLabel}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#1A1A1A]/20 pb-1.5">
                    <span className="text-[#1A1A1A]/70">Parent Node:</span>
                    <strong className="text-[#D95D39] font-bold">
                      {currentNode.parentLabel ? currentNode.parentLabel : 'None (Root Node)'}
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-[#1A1A1A]/20 pb-1.5">
                    <span className="text-[#1A1A1A]/70">Search Depth:</span>
                    <span className="font-bold">{currentNode.depth}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1A1A1A]/20 pb-1.5">
                    <span className="text-[#1A1A1A]/70">Path Cost g(n):</span>
                    <span className="font-bold">{currentNode.g}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1A1A1A]/20 pb-1.5">
                    <span className="text-[#1A1A1A]/70">Heuristic h(n):</span>
                    <strong className="text-[#D95D39] font-bold">{currentNode.h} ({heuristicMeta.symbol})</strong>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span className="text-[#1A1A1A]/70">Evaluation f(n):</span>
                    <strong className="text-[#1A1A1A] font-bold bg-[#F9F7F2] px-2 py-0.5 border border-[#1A1A1A]">
                      {algorithmType === 'ASTAR' ? `g+h = ${currentNode.g + currentNode.h}` : `h = ${currentNode.h}`}
                    </strong>
                  </div>
                </div>
              </div>

              {currentStep && (
                <div className="p-3.5 bg-[#E5E2D9] border border-[#1A1A1A] text-xs font-mono text-[#1A1A1A] flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#D95D39] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{currentStep.explanation}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 text-center text-xs font-mono text-[#1A1A1A]/60 flex flex-col items-center justify-center bg-[#E5E2D9] border border-dashed border-[#1A1A1A]/30">
              <Layers className="w-10 h-10 text-[#1A1A1A]/30 mb-2" />
              <span>No node currently active. Click &quot;Start Live Search&quot; or &quot;Step Forward&quot; to begin.</span>
            </div>
          )}
        </div>

        {/* Right Column: GBFS Decision Visualization ("Why Did GBFS Choose This Node?") */}
        <div className="lg:col-span-7 bg-[#F9F7F2] border-2 border-[#1A1A1A] p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D95D39]" />
                <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">
                  Why Did {algorithmType === 'ASTAR' ? 'A*' : 'GBFS'} Choose {currentNode ? currentNode.nodeLabel : 'This Node'}?
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#E5E2D9] px-2.5 py-1 border border-[#1A1A1A]/40 font-bold">
                Min-Priority Queue
              </span>
            </div>

            <p className="text-xs text-[#1A1A1A]/85 font-mono mb-4 leading-relaxed">
              {algorithmType === 'ASTAR'
                ? 'A* evaluates all pending frontier nodes using f(n) = g(n) + h(n) and extracts the state with the minimum combined cost.'
                : 'Greedy Best-First Search strictly evaluates all candidate nodes in the OPEN priority queue using f(n) = h(n) and immediately pops the state with the lowest heuristic value.'}
            </p>

            {/* Comparison Table */}
            {currentStep?.gbfsDecision && currentStep.gbfsDecision.candidates.length > 0 ? (
              <div className="space-y-3">
                <div className="overflow-x-auto border border-[#1A1A1A]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#E5E2D9] text-[#1A1A1A] border-b border-[#1A1A1A]">
                      <tr>
                        <th className="p-2.5 border-r border-[#1A1A1A]">Candidate Node</th>
                        <th className="p-2.5 border-r border-[#1A1A1A]">Heuristic h(n)</th>
                        <th className="p-2.5 border-r border-[#1A1A1A]">Path Cost g(n)</th>
                        <th className="p-2.5 border-r border-[#1A1A1A]">Evaluation f(n)</th>
                        <th className="p-2.5">Decision Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A1A1A]/20 bg-[#F9F7F2]">
                      {currentStep.gbfsDecision.candidates.map((cand) => (
                        <tr
                          key={cand.id}
                          className={cand.isSelected ? 'bg-[#E5E2D9] font-bold' : 'hover:bg-[#E5E2D9]/40'}
                        >
                          <td className="p-2.5 border-r border-[#1A1A1A]/20 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-[#1A1A1A] text-white text-[10px]">
                              {cand.nodeLabel}
                            </span>
                            <span>Depth {cand.depth}</span>
                          </td>
                          <td className="p-2.5 border-r border-[#1A1A1A]/20 text-[#D95D39] font-bold">
                            {cand.h}
                          </td>
                          <td className="p-2.5 border-r border-[#1A1A1A]/20">
                            {cand.g}
                          </td>
                          <td className="p-2.5 border-r border-[#1A1A1A]/20 font-bold">
                            {cand.f}
                          </td>
                          <td className="p-2.5">
                            {cand.isSelected ? (
                              <span className="inline-flex items-center gap-1.5 text-[#2D5A27] font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>SELECTED (Lowest {algorithmType === 'ASTAR' ? 'f' : 'h'})</span>
                              </span>
                            ) : (
                              <span className="text-[#1A1A1A]/60">
                                Waiting in OPEN
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Rationale callout */}
                <div className="p-3.5 bg-[#E5E2D9] border-l-4 border-[#D95D39] text-xs font-mono space-y-1">
                  <strong className="text-[#1A1A1A] block">Decision Rationale:</strong>
                  <p className="text-[#1A1A1A]/90 leading-relaxed">{currentStep.gbfsDecision.reason}</p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs font-mono text-[#1A1A1A]/60 bg-[#E5E2D9] border border-dashed border-[#1A1A1A]/40">
                No comparison candidates available for this step.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Frontier (Open List) Collapsible Section */}
      <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-6 sm:p-8 shadow-sm flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/20 pb-4">
          <div
            onClick={() => setIsFrontierCollapsed(!isFrontierCollapsed)}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <ListOrdered className="w-5 h-5 text-[#D95D39]" />
            <h3 className="font-serif italic font-bold text-xl text-[#1A1A1A] group-hover:text-[#D95D39] transition-colors">
              Frontier (Open List Priority Queue)
            </h3>
            <span className="text-xs font-mono font-bold bg-[#E5E2D9] text-[#1A1A1A] px-2.5 py-1 border border-[#1A1A1A]">
              {frontierList.length} Nodes Waiting
            </span>
            <button className="p-1 text-[#1A1A1A]/70 hover:text-[#1A1A1A]">
              {isFrontierCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rotate-90" />}
            </button>
          </div>

          {/* Search Filter */}
          {!isFrontierCollapsed && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Filter by ID, Parent, or h..."
                value={filterFrontier}
                onChange={(e) => setFilterFrontier(e.target.value)}
                className="text-xs font-mono px-3 py-1.5 bg-[#E5E2D9] border border-[#1A1A1A] placeholder-[#1A1A1A]/50 focus:outline-hidden w-full sm:w-60"
              />
            </div>
          )}
        </div>

        {!isFrontierCollapsed && (
          <div className="space-y-3">
            <p className="text-xs text-[#1A1A1A]/80 font-mono leading-relaxed">
              The OPEN Priority Queue stores candidate states sorted in ascending order of heuristic value <strong>h(n)</strong>. The node with the lowest heuristic is extracted next.
            </p>

            {displayedFrontier.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-[#1A1A1A]/60 bg-[#E5E2D9] border border-dashed border-[#1A1A1A]/40">
                {frontierList.length === 0 ? 'Frontier is currently empty.' : 'No nodes match search filter.'}
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[420px] border border-[#1A1A1A] scrollbar-thin">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#E5E2D9] text-[#1A1A1A] border-b border-[#1A1A1A] sticky top-0 z-10">
                    <tr>
                      <th className="p-3 border-r border-[#1A1A1A]">Rank</th>
                      <th className="p-3 border-r border-[#1A1A1A]">Node ID</th>
                      <th className="p-3 border-r border-[#1A1A1A]">Puzzle State</th>
                      <th className="p-3 border-r border-[#1A1A1A]">Parent Node</th>
                      <th className="p-3 border-r border-[#1A1A1A]">Depth</th>
                      <th className="p-3 border-r border-[#1A1A1A]">Path Cost g(n)</th>
                      <th className="p-3 border-r border-[#1A1A1A]">Heuristic h(n)</th>
                      <th className="p-3 border-r border-[#1A1A1A]">Eval f(n)</th>
                      <th className="p-3">Priority Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]/20 bg-[#F9F7F2]">
                    {displayedFrontier.map((fNode, idx) => {
                      const isTopNext = idx === 0;
                      return (
                        <tr
                          key={fNode.id}
                          onClick={() => onSelectStatePreview && onSelectStatePreview(fNode.state, fNode.movedTile, fNode.move)}
                          className={`hover:bg-[#E5E2D9]/60 cursor-pointer transition-colors ${
                            isTopNext ? 'bg-[#E5E2D9]/80 font-bold' : ''
                          }`}
                        >
                          <td className="p-3 border-r border-[#1A1A1A]/20">
                            #{idx + 1}
                          </td>
                          <td className="p-3 border-r border-[#1A1A1A]/20">
                            <span className="px-2 py-0.5 bg-[#1A1A1A] text-white text-[10px] font-bold">
                              {fNode.nodeLabel}
                            </span>
                          </td>
                          <td className="p-3 border-r border-[#1A1A1A]/20 flex items-center gap-2">
                            <MiniPuzzleBoard
                              state={fNode.state}
                              size="sm"
                              highlightTile={fNode.movedTile}
                            />
                            <span className="text-[10px] text-[#1A1A1A]/70 hidden md:inline">
                              [{fNode.state.join(', ')}]
                            </span>
                          </td>
                          <td className="p-3 border-r border-[#1A1A1A]/20">
                            {fNode.parentLabel ? (
                              <span className="px-1.5 py-0.5 bg-[#E5E2D9] border border-[#1A1A1A]/40 text-[10px]">
                                {fNode.parentLabel}
                              </span>
                            ) : (
                              <span className="text-[#1A1A1A]/50">Root</span>
                            )}
                          </td>
                          <td className="p-3 border-r border-[#1A1A1A]/20">
                            {fNode.depth}
                          </td>
                          <td className="p-3 border-r border-[#1A1A1A]/20">
                            {fNode.g}
                          </td>
                          <td className="p-3 border-r border-[#1A1A1A]/20 text-[#D95D39] font-bold">
                            {fNode.h}
                          </td>
                          <td className="p-3 border-r border-[#1A1A1A]/20 font-bold">
                            {fNode.f}
                          </td>
                          <td className="p-3">
                            {isTopNext ? (
                              <span className="inline-flex items-center gap-1 bg-[#D95D39] text-white px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                Next Node Selected
                              </span>
                            ) : (
                              <span className="text-[#1A1A1A]/60 text-[10px]">
                                In Priority Queue
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Explored (Closed List) Collapsible Section */}
      <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-6 sm:p-8 shadow-sm flex flex-col space-y-4">
        <div
          onClick={() => setIsExploredCollapsed(!isExploredCollapsed)}
          className="flex items-center justify-between border-b border-[#1A1A1A]/20 pb-4 cursor-pointer select-none group"
        >
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-[#D95D39]" />
            <h3 className="font-serif italic font-bold text-xl text-[#1A1A1A] group-hover:text-[#D95D39] transition-colors">
              Explored (Closed List Set)
            </h3>
            <span className="text-xs font-mono font-bold bg-[#E5E2D9] text-[#1A1A1A] px-2.5 py-1 border border-[#1A1A1A]">
              {exploredList.length} States Visited
            </span>
          </div>
          <button className="p-1 text-[#1A1A1A]/70 hover:text-[#1A1A1A]">
            {isExploredCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rotate-90" />}
          </button>
        </div>

        {!isExploredCollapsed && (
          <div className="space-y-3">
            <p className="text-xs text-[#1A1A1A]/80 font-mono leading-relaxed">
              The CLOSED set contains all states that have already been extracted from the frontier and expanded. Any newly generated successor matching a state in this set is pruned to prevent redundant cycles.
            </p>

            {exploredList.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-[#1A1A1A]/60 bg-[#E5E2D9] border border-dashed border-[#1A1A1A]/40">
                No nodes explored yet. Run or step through search to populate CLOSED list.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[380px] border border-[#1A1A1A] scrollbar-thin">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#E5E2D9] text-[#1A1A1A] border-b border-[#1A1A1A] sticky top-0 z-10">
                    <tr>
                      <th className="p-3 border-r border-[#1A1A1A]">Expansion #</th>
                      <th className="p-3 border-r border-[#1A1A1A]">Node ID</th>
                      <th className="p-3 border-r border-[#1A1A1A]">Puzzle State</th>
                      <th className="p-3 border-r border-[#1A1A1A]">Parent Node</th>
                      <th className="p-3 border-r border-[#1A1A1A]">Depth</th>
                      <th className="p-3 border-r border-[#1A1A1A]">Path Cost g(n)</th>
                      <th className="p-3 border-r border-[#1A1A1A]">Heuristic h(n)</th>
                      <th className="p-3 border-r border-[#1A1A1A]">Eval f(n)</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]/20 bg-[#F9F7F2]">
                    {exploredList.map((eNode, idx) => (
                      <tr
                        key={eNode.id}
                        onClick={() => onSelectStatePreview && onSelectStatePreview(eNode.state, eNode.movedTile, eNode.move)}
                        className="hover:bg-[#E5E2D9]/60 cursor-pointer transition-colors"
                      >
                        <td className="p-3 border-r border-[#1A1A1A]/20 font-bold">
                          #{eNode.orderExplored || idx + 1}
                        </td>
                        <td className="p-3 border-r border-[#1A1A1A]/20">
                          <span className="px-2 py-0.5 bg-[#1A1A1A] text-white text-[10px] font-bold">
                            {eNode.nodeLabel}
                          </span>
                        </td>
                        <td className="p-3 border-r border-[#1A1A1A]/20 flex items-center gap-2">
                          <MiniPuzzleBoard
                            state={eNode.state}
                            size="sm"
                            highlightTile={eNode.movedTile}
                          />
                          <span className="text-[10px] text-[#1A1A1A]/70 hidden md:inline">
                            [{eNode.state.join(', ')}]
                          </span>
                        </td>
                        <td className="p-3 border-r border-[#1A1A1A]/20">
                          {eNode.parentLabel ? (
                            <span className="px-1.5 py-0.5 bg-[#E5E2D9] border border-[#1A1A1A]/40 text-[10px]">
                              {eNode.parentLabel}
                            </span>
                          ) : (
                            <span className="text-[#1A1A1A]/50">Initial State</span>
                          )}
                        </td>
                        <td className="p-3 border-r border-[#1A1A1A]/20">
                          {eNode.depth}
                        </td>
                        <td className="p-3 border-r border-[#1A1A1A]/20">
                          {eNode.g}
                        </td>
                        <td className="p-3 border-r border-[#1A1A1A]/20 text-[#D95D39]">
                          {eNode.h}
                        </td>
                        <td className="p-3 border-r border-[#1A1A1A]/20">
                          {eNode.f}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5 text-[#2D5A27] text-[10px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Expanded</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Search Process Timeline Log */}
      <div className="bg-[#F9F7F2] border-2 border-[#1A1A1A] p-6 sm:p-8 shadow-sm flex flex-col space-y-4">
        <div
          onClick={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
          className="flex items-center justify-between border-b border-[#1A1A1A]/20 pb-4 cursor-pointer select-none group"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#D95D39]" />
            <h3 className="font-serif italic font-bold text-xl text-[#1A1A1A] group-hover:text-[#D95D39] transition-colors">
              Search Process Timeline Log
            </h3>
            <span className="text-[10px] font-mono uppercase bg-[#E5E2D9] px-2.5 py-1 border border-[#1A1A1A] font-bold">
              {steps.length} Logged Steps
            </span>
          </div>
          <button className="p-1 text-[#1A1A1A]/70 hover:text-[#1A1A1A]">
            {isTimelineCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rotate-90" />}
          </button>
        </div>

        {!isTimelineCollapsed && (
          <div>
            {steps.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-[#1A1A1A]/60 bg-[#E5E2D9] border border-dashed border-[#1A1A1A]/40">
                No search trace recorded yet. Start the search to generate execution timeline.
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                {steps.map((st, sIdx) => {
                  const isCurrentStep = sIdx === currentStepIndex;
                  return (
                    <div
                      key={sIdx}
                      onClick={() => {
                        setIsPlaying(false);
                        onStepChange(sIdx);
                      }}
                      className={`p-4 border-2 transition-all cursor-pointer ${
                        isCurrentStep
                          ? 'bg-[#E5E2D9] border-[#D95D39] shadow-sm'
                          : 'bg-[#F9F7F2] border-[#1A1A1A]/30 hover:border-[#1A1A1A]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase ${
                            isCurrentStep ? 'bg-[#D95D39] text-white' : 'bg-[#1A1A1A] text-white'
                          }`}>
                            Step {st.stepIndex}
                          </span>
                          <strong className="text-xs sm:text-sm font-mono font-bold text-[#1A1A1A]">
                            {st.timelineEntry.title}
                          </strong>
                        </div>
                        {isCurrentStep && (
                          <span className="text-[10px] font-mono font-bold uppercase text-[#D95D39] tracking-wider">
                            ★ Active Snapshot
                          </span>
                        )}
                      </div>

                      <ul className="text-xs font-mono text-[#1A1A1A]/85 space-y-1.5 pl-2">
                        {st.timelineEntry.details.map((dt, dIdx) => (
                          <li key={dIdx} className="flex items-start gap-2">
                            <span className="text-[#D95D39] font-bold">›</span>
                            <span>{dt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

