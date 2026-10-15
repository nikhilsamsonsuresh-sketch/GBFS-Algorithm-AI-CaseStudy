import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PuzzleState,
  SolverResult,
  Difficulty,
  SearchNode,
  HeuristicType,
  AlgorithmType,
  StepRecord,
  AnimationSubPhase,
  NeighborInfo
} from './types';
import {
  DEFAULT_GOAL_STATE,
  DEFAULT_INITIAL_STATE,
  PRESET_PUZZLES,
  checkSolvability,
  validatePuzzleState,
  generateRandomSolvablePuzzle,
  calculateHeuristic,
  getHeuristicInfo,
  stateToString
} from './utils/puzzleEngine';
import { solveWithGBFS } from './utils/gbfsSolver';
import { Header, NavPage } from './components/Header';
import { HomePage } from './components/HomePage';
import { Footer } from './components/Footer';
import { PuzzleBoard } from './components/PuzzleBoard';
import { MiniPuzzleBoard } from './components/MiniPuzzleBoard';
import { SolverVisualizationSection } from './components/SolverVisualizationSection';
import { PuzzleDifficultySection } from './components/PuzzleDifficultySection';
import { AlgorithmSelectionSection } from './components/AlgorithmSelectionSection';
import { InteractiveControlsSection } from './components/InteractiveControlsSection';
import { SearchProcessSection } from './components/SearchProcessSection';
import { SolutionSummarySection } from './components/SolutionSummarySection';
import { AlgorithmComparisonPage } from './components/AlgorithmComparisonPage';
import { AlgorithmInformationPage, AlgoInfoId } from './components/AlgorithmInformationPage';
import { CustomStateModal } from './components/CustomStateModal';
import { ManhattanBreakdownModal } from './components/ManhattanBreakdownModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Shuffle,
  ChevronDown,
  ChevronUp,
  Clock,
  GitBranch,
  Sliders,
  ChevronRight,
  FastForward,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type SearchExecutionStatus = 'ready' | 'running' | 'paused' | 'completed' | 'failed';

export default function App() {
  // Navigation State
  const [activePage, setActivePage] = useState<NavPage>('solver');
  const [selectedInfoAlgo, setSelectedInfoAlgo] = useState<AlgoInfoId>('GBFS');

  // Puzzle State Configurations
  const [initialState, setInitialState] = useState<PuzzleState>([...DEFAULT_INITIAL_STATE]);
  const [goalState, setGoalState] = useState<PuzzleState>([...DEFAULT_GOAL_STATE]);
  const [currentState, setCurrentState] = useState<PuzzleState>([...DEFAULT_INITIAL_STATE]);
  const [movedTile, setMovedTile] = useState<number | null>(null);
  const [lastMoveDirection, setLastMoveDirection] = useState<string | null>(null);
  const [highlightedCandidateTile, setHighlightedCandidateTile] = useState<number | null>(null);

  // Search Engine Parameters
  const [heuristicType, setHeuristicType] = useState<HeuristicType>('MANHATTAN');
  const [algorithmType, setAlgorithmType] = useState<AlgorithmType>('GBFS');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('MEDIUM');
  const [inputTab, setInputTab] = useState<'preset' | 'custom'>('preset');
  const [depthLimit, setDepthLimit] = useState<number>(10);
  const [editableInitial, setEditableInitial] = useState<number[]>([...DEFAULT_INITIAL_STATE]);
  const [editableGoal, setEditableGoal] = useState<number[]>([...DEFAULT_GOAL_STATE]);
  const [solverResult, setSolverResult] = useState<SolverResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [animationPhase, setAnimationPhase] = useState<AnimationSubPhase>('EXPAND');
  const [searchStatus, setSearchStatus] = useState<SearchExecutionStatus>('ready');
  const [speed, setSpeed] = useState<number>(800); // ms per full step

  // Keep editable initial & goal in sync when external states change
  useEffect(() => {
    setEditableInitial([...initialState]);
  }, [initialState]);

  useEffect(() => {
    setEditableGoal([...goalState]);
  }, [goalState]);

  // Collapsible sections state in Search Process
  const [isFrontierOpen, setIsFrontierOpen] = useState<boolean>(true);
  const [isExploredOpen, setIsExploredOpen] = useState<boolean>(false);
  const [frontierFilter, setFrontierFilter] = useState<string>('');

  // Modals
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState<boolean>(false);
  const [isManhattanModalOpen, setIsManhattanModalOpen] = useState<boolean>(false);

  // Explored history tracker for live display
  const [exploredNodesHistory, setExploredNodesHistory] = useState<SearchNode[]>([]);

  // Ref to hold the active playback timer
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Solvability check
  const solvability = checkSolvability(initialState, goalState);
  const heuristicMeta = getHeuristicInfo(heuristicType);

  // Execute solver safely
  const executeSearchAlgorithm = useCallback((): SolverResult => {
    try {
      const result = solveWithGBFS(initialState, goalState, heuristicType, algorithmType);
      setSolverResult(result);
      return result;
    } catch (err) {
      console.error('Search Execution Error:', err);
      const fallbackResult: SolverResult = {
        success: false,
        solutionPath: [],
        steps: [],
        stats: {
          algorithm: algorithmType === 'ASTAR' ? 'A* Search' : 'Greedy Best-First Search (GBFS)',
          algorithmType,
          evaluationFunction: algorithmType === 'ASTAR' ? 'f(n) = g(n) + h(n)' : 'f(n) = h(n)',
          heuristic: heuristicMeta.name,
          initialState,
          goalState,
          exploredCount: 0,
          generatedCount: 0,
          frontierCount: 0,
          solutionDepth: 0,
          maxDepthReached: 0,
          solutionMoves: 0,
          pathCost: null,
          executionTimeMs: 0,
          finalHeuristic: calculateHeuristic(initialState, goalState, heuristicType),
          isSolved: false,
          approxMemoryBytes: 0,
          browserHeapMb: null
        },
        message: 'Search execution encountered an error.'
      };
      setSolverResult(fallbackResult);
      setSearchStatus('failed');
      return fallbackResult;
    }
  }, [initialState, goalState, heuristicType, algorithmType, heuristicMeta]);

  // Clear running timer safely
  const clearActiveTimer = useCallback(() => {
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  }, []);

  // Reset to initial configuration
  const handleReset = useCallback(() => {
    clearActiveTimer();
    setSearchStatus('ready');
    setCurrentState([...initialState]);
    setMovedTile(null);
    setLastMoveDirection(null);
    setHighlightedCandidateTile(null);
    setCurrentStepIndex(0);
    setAnimationPhase('EXPAND');
    setExploredNodesHistory([]);
  }, [clearActiveTimer, initialState]);

  // Heuristic change
  const handleHeuristicChange = (newType: HeuristicType) => {
    clearActiveTimer();
    setHeuristicType(newType);
    setSearchStatus('ready');
    setSolverResult(null);
    setCurrentStepIndex(0);
    setAnimationPhase('EXPAND');
    setHighlightedCandidateTile(null);
    setExploredNodesHistory([]);
  };

  // Algorithm change
  const handleAlgorithmChange = (newAlgo: AlgorithmType) => {
    clearActiveTimer();
    setAlgorithmType(newAlgo);
    setSearchStatus('ready');
    setSolverResult(null);
    setCurrentStepIndex(0);
    setAnimationPhase('EXPAND');
    setHighlightedCandidateTile(null);
    setExploredNodesHistory([]);
  };

  // Select Preset Puzzle
  const handleSelectPreset = (presetIndex: number) => {
    clearActiveTimer();
    const preset = PRESET_PUZZLES[presetIndex];
    if (preset) {
      const newInit = [...preset.initial] as PuzzleState;
      const newGoal = [...DEFAULT_GOAL_STATE] as PuzzleState;
      setInitialState(newInit);
      setGoalState(newGoal);
      setCurrentState(newInit);
      setMovedTile(null);
      setLastMoveDirection(null);
      setHighlightedCandidateTile(null);
      setSolverResult(null);
      setCurrentStepIndex(0);
      setAnimationPhase('EXPAND');
      setExploredNodesHistory([]);
      setSearchStatus('ready');
    }
  };

  // Randomize Puzzle
  const handleRandomize = (diff: 'EASY' | 'MEDIUM' | 'HARD') => {
    clearActiveTimer();
    const randomBoard = generateRandomSolvablePuzzle(diff, goalState);
    setInitialState(randomBoard);
    setCurrentState(randomBoard);
    setMovedTile(null);
    setLastMoveDirection(null);
    setHighlightedCandidateTile(null);
    setSolverResult(null);
    setCurrentStepIndex(0);
    setAnimationPhase('EXPAND');
    setExploredNodesHistory([]);
    setSearchStatus('ready');
  };

  // Apply Custom Board
  const handleApplyCustom = (newInitial: PuzzleState, newGoal: PuzzleState) => {
    clearActiveTimer();
    setInitialState([...newInitial]);
    setGoalState([...newGoal]);
    setCurrentState([...newInitial]);
    setMovedTile(null);
    setLastMoveDirection(null);
    setHighlightedCandidateTile(null);
    setSolverResult(null);
    setCurrentStepIndex(0);
    setAnimationPhase('EXPAND');
    setExploredNodesHistory([]);
    setSearchStatus('ready');
  };

  // Inline Custom State Handlers
  const handleEditableTileChange = (type: 'initial' | 'goal', index: number, valStr: string) => {
    const val = parseInt(valStr, 10);
    if (type === 'initial') {
      const copy = [...editableInitial];
      copy[index] = isNaN(val) ? 0 : val;
      setEditableInitial(copy);
    } else {
      const copy = [...editableGoal];
      copy[index] = isNaN(val) ? 0 : val;
      setEditableGoal(copy);
    }
  };

  const handleApplyInlineCustom = () => {
    const initValid = validatePuzzleState(editableInitial);
    const goalValid = validatePuzzleState(editableGoal);
    if (initValid.valid && goalValid.valid) {
      handleApplyCustom(editableInitial as PuzzleState, editableGoal as PuzzleState);
    }
  };

  const handleResetInlineDefaults = () => {
    setEditableInitial([...DEFAULT_INITIAL_STATE]);
    setEditableGoal([...DEFAULT_GOAL_STATE]);
    handleApplyCustom([...DEFAULT_INITIAL_STATE], [...DEFAULT_GOAL_STATE]);
  };

  // Manual tile slide click on board
  const handleBoardTileClick = (nextState: PuzzleState) => {
    if (searchStatus === 'running') return;
    setCurrentState(nextState);
    setSolverResult(null);
    setCurrentStepIndex(0);
    setAnimationPhase('EXPAND');
    setHighlightedCandidateTile(null);
    setExploredNodesHistory([]);
    setSearchStatus('ready');
  };

  // Helper to determine the chosen candidate node for the active step
  const getChosenCandidate = useCallback((step: StepRecord, nextStep?: StepRecord | null): NeighborInfo | null => {
    if (!step.generatedNeighbors || step.generatedNeighbors.length === 0) return null;
    
    // If the next step in search history is available, match by node ID or state
    if (nextStep && nextStep.selectedNode) {
      const match = step.generatedNeighbors.find(n => n.node.id === nextStep.selectedNode.id || stateToString(n.state) === stateToString(nextStep.selectedNode.state));
      if (match) return match;
    }

    // Otherwise, pick the unclosed candidate with minimum heuristic value h(n)
    const validCandidates = step.generatedNeighbors.filter(n => !n.isAlreadyClosed);
    if (validCandidates.length === 0) return step.generatedNeighbors[0];

    return validCandidates.reduce((best, curr) => (curr.h < best.h ? curr : best), validCandidates[0]);
  }, []);

  // Solve & Run Continuous GBFS
  const handleSolve = () => {
    if (!solvability.isSolvable) return;
    clearActiveTimer();

    let res = solverResult;
    if (!res) {
      res = executeSearchAlgorithm();
    }
    if (!res) return;

    if (res.steps.length === 0) {
      setSearchStatus('completed');
      return;
    }

    setSearchStatus('running');
    if (currentStepIndex === 0) {
      setCurrentStepIndex(1);
      setAnimationPhase('EXPAND');
      const firstStep = res.steps[0];
      if (firstStep && firstStep.selectedNode) {
        setCurrentState(firstStep.selectedNode.state);
        setMovedTile(firstStep.selectedNode.movedTile);
        setLastMoveDirection(firstStep.selectedNode.move);
      }
    }
  };

  // Pause
  const handlePause = () => {
    clearActiveTimer();
    setSearchStatus('paused');
  };

  // Resume
  const handleResume = () => {
    if (!solverResult || solverResult.steps.length === 0) {
      handleSolve();
      return;
    }
    setSearchStatus('running');
  };

  // Micro Frame Stepper (Next Sub-Frame: EXPAND -> EVALUATE -> SELECT -> SLIDE -> Next Step)
  const handleNextFrame = () => {
    if (searchStatus === 'running' || !solvability.isSolvable) return;

    let res = solverResult;
    if (!res) {
      res = executeSearchAlgorithm();
    }
    if (!res || res.steps.length === 0) return;

    // If at step 0, initialize at step 1 EXPAND
    if (currentStepIndex === 0) {
      setCurrentStepIndex(1);
      setAnimationPhase('EXPAND');
      const firstStep = res.steps[0];
      if (firstStep && firstStep.selectedNode) {
        setCurrentState(firstStep.selectedNode.state);
        setMovedTile(firstStep.selectedNode.movedTile);
        setLastMoveDirection(firstStep.selectedNode.move);
      }
      setSearchStatus('paused');
      return;
    }

    const currentStep = res.steps[currentStepIndex - 1];
    const nextStep = currentStepIndex < res.steps.length ? res.steps[currentStepIndex] : null;

    if (animationPhase === 'EXPAND') {
      setAnimationPhase('EVALUATE');
      setHighlightedCandidateTile(null);
      setSearchStatus('paused');
    } else if (animationPhase === 'EVALUATE') {
      setAnimationPhase('SELECT');
      if (currentStep) {
        const candidate = getChosenCandidate(currentStep, nextStep);
        setHighlightedCandidateTile(candidate ? candidate.movedTile : null);
      }
      setSearchStatus('paused');
    } else if (animationPhase === 'SELECT') {
      setAnimationPhase('SLIDE');
      setHighlightedCandidateTile(null);
      if (currentStep) {
        const candidate = getChosenCandidate(currentStep, nextStep);
        if (candidate) {
          setCurrentState(candidate.state);
          setMovedTile(candidate.movedTile);
          setLastMoveDirection(candidate.direction);
        } else if (nextStep && nextStep.selectedNode) {
          setCurrentState(nextStep.selectedNode.state);
          setMovedTile(nextStep.selectedNode.movedTile);
          setLastMoveDirection(nextStep.selectedNode.move);
        }
      }
      setSearchStatus('paused');
    } else if (animationPhase === 'SLIDE') {
      if (currentStepIndex < res.steps.length) {
        const nextIdx = currentStepIndex + 1;
        const step = res.steps[nextIdx - 1];
        if (step && step.selectedNode) {
          setCurrentState(step.selectedNode.state);
          setMovedTile(step.selectedNode.movedTile);
          setLastMoveDirection(step.selectedNode.move);
          setExploredNodesHistory(prev => {
            if (!prev.some(n => n.id === step.selectedNode.id)) {
              return [...prev, step.selectedNode];
            }
            return prev;
          });
        }
        setCurrentStepIndex(nextIdx);
        setAnimationPhase('EXPAND');
        setHighlightedCandidateTile(null);
        setSearchStatus('paused');
      } else {
        setSearchStatus('completed');
      }
    }
  };

  // Micro Frame Stepper (Previous Sub-Frame)
  const handlePrevFrame = () => {
    if (searchStatus === 'running' || currentStepIndex <= 0) return;

    const res = solverResult;
    if (!res) return;

    const currentStep = res.steps[currentStepIndex - 1];
    const nextStep = currentStepIndex < res.steps.length ? res.steps[currentStepIndex] : null;

    if (animationPhase === 'SLIDE') {
      // Revert board to node state before slide
      if (currentStep && currentStep.selectedNode) {
        setCurrentState(currentStep.selectedNode.state);
        setMovedTile(currentStep.selectedNode.movedTile);
        setLastMoveDirection(currentStep.selectedNode.move);
      }
      const candidate = currentStep ? getChosenCandidate(currentStep, nextStep) : null;
      setHighlightedCandidateTile(candidate ? candidate.movedTile : null);
      setAnimationPhase('SELECT');
      setSearchStatus('paused');
    } else if (animationPhase === 'SELECT') {
      setHighlightedCandidateTile(null);
      setAnimationPhase('EVALUATE');
      setSearchStatus('paused');
    } else if (animationPhase === 'EVALUATE') {
      setHighlightedCandidateTile(null);
      setAnimationPhase('EXPAND');
      setSearchStatus('paused');
    } else if (animationPhase === 'EXPAND') {
      if (currentStepIndex > 1) {
        const prevIdx = currentStepIndex - 1;
        const prevStep = res.steps[prevIdx - 1];
        if (prevStep && prevStep.selectedNode) {
          setCurrentState(prevStep.selectedNode.state);
          setMovedTile(prevStep.selectedNode.movedTile);
          setLastMoveDirection(prevStep.selectedNode.move);
        }
        setCurrentStepIndex(prevIdx);
        setAnimationPhase('SLIDE');
        setHighlightedCandidateTile(null);
        setSearchStatus('paused');
      } else {
        setCurrentStepIndex(0);
        setCurrentState([...initialState]);
        setMovedTile(null);
        setLastMoveDirection(null);
        setHighlightedCandidateTile(null);
        setAnimationPhase('EXPAND');
        setSearchStatus('ready');
      }
    }
  };

  // Step Forward (Full Step)
  const handleNextStep = () => {
    if (searchStatus === 'running' || !solvability.isSolvable) return;

    let res = solverResult;
    if (!res) {
      res = executeSearchAlgorithm();
    }
    if (!res || res.steps.length === 0) return;

    if (currentStepIndex < res.steps.length) {
      const nextIdx = currentStepIndex + 1;
      const step = res.steps[nextIdx - 1];
      if (step && step.selectedNode) {
        setCurrentState(step.selectedNode.state);
        setMovedTile(step.selectedNode.movedTile);
        setLastMoveDirection(step.selectedNode.move);
        setHighlightedCandidateTile(null);
        setExploredNodesHistory(prev => {
          if (!prev.some(n => n.id === step.selectedNode.id)) {
            return [...prev, step.selectedNode];
          }
          return prev;
        });
      }
      setCurrentStepIndex(nextIdx);
      setAnimationPhase('EXPAND');

      if (nextIdx >= res.steps.length) {
        setSearchStatus('completed');
      } else {
        setSearchStatus('paused');
      }
    }
  };

  // Step Backward (Full Step)
  const handlePrevStep = () => {
    if (searchStatus === 'running' || currentStepIndex <= 0) return;

    const res = solverResult;
    if (!res) return;

    const prevIdx = currentStepIndex - 1;
    setCurrentStepIndex(prevIdx);
    setHighlightedCandidateTile(null);

    if (prevIdx === 0) {
      setCurrentState([...initialState]);
      setMovedTile(null);
      setLastMoveDirection(null);
      setAnimationPhase('EXPAND');
      setExploredNodesHistory([]);
      setSearchStatus('ready');
    } else {
      const step = res.steps[prevIdx - 1];
      if (step && step.selectedNode) {
        setCurrentState(step.selectedNode.state);
        setMovedTile(step.selectedNode.movedTile);
        setLastMoveDirection(step.selectedNode.move);
      }
      setAnimationPhase('EXPAND');
      setSearchStatus('paused');
    }
  };

  // Jump to specific Phase within active step
  const handleJumpToPhase = (targetPhase: AnimationSubPhase) => {
    if (searchStatus === 'running') {
      clearActiveTimer();
      setSearchStatus('paused');
    }

    if (!solverResult || currentStepIndex === 0) return;

    const currentStep = solverResult.steps[currentStepIndex - 1];
    const nextStep = currentStepIndex < solverResult.steps.length ? solverResult.steps[currentStepIndex] : null;

    setAnimationPhase(targetPhase);

    if (targetPhase === 'EXPAND' || targetPhase === 'EVALUATE') {
      if (currentStep && currentStep.selectedNode) {
        setCurrentState(currentStep.selectedNode.state);
        setMovedTile(currentStep.selectedNode.movedTile);
        setLastMoveDirection(currentStep.selectedNode.move);
      }
      setHighlightedCandidateTile(null);
    } else if (targetPhase === 'SELECT') {
      if (currentStep && currentStep.selectedNode) {
        setCurrentState(currentStep.selectedNode.state);
        setMovedTile(currentStep.selectedNode.movedTile);
        setLastMoveDirection(currentStep.selectedNode.move);
      }
      const candidate = currentStep ? getChosenCandidate(currentStep, nextStep) : null;
      setHighlightedCandidateTile(candidate ? candidate.movedTile : null);
    } else if (targetPhase === 'SLIDE') {
      setHighlightedCandidateTile(null);
      if (currentStep) {
        const candidate = getChosenCandidate(currentStep, nextStep);
        if (candidate) {
          setCurrentState(candidate.state);
          setMovedTile(candidate.movedTile);
          setLastMoveDirection(candidate.direction);
        } else if (nextStep && nextStep.selectedNode) {
          setCurrentState(nextStep.selectedNode.state);
          setMovedTile(nextStep.selectedNode.movedTile);
          setLastMoveDirection(nextStep.selectedNode.move);
        }
      }
    }
  };

  // Automatic Frame-by-Frame Playback Engine
  useEffect(() => {
    if (searchStatus !== 'running') {
      clearActiveTimer();
      return;
    }

    if (!solverResult || solverResult.steps.length === 0) {
      return;
    }

    // Allocate sub-frame delay based on total speed setting (minimum 100ms per sub-phase)
    const phaseDuration = Math.max(100, Math.round(speed / 4));

    if (currentStepIndex === 0) {
      setCurrentStepIndex(1);
      setAnimationPhase('EXPAND');
      return;
    }

    const currentStep = solverResult.steps[currentStepIndex - 1];
    const nextStep = currentStepIndex < solverResult.steps.length ? solverResult.steps[currentStepIndex] : null;

    if (!currentStep) {
      setSearchStatus('completed');
      clearActiveTimer();
      return;
    }

    playbackTimerRef.current = setTimeout(() => {
      if (animationPhase === 'EXPAND') {
        // Frame 1 -> Frame 2: Evaluate Successors
        setAnimationPhase('EVALUATE');
        setHighlightedCandidateTile(null);
      } else if (animationPhase === 'EVALUATE') {
        // Frame 2 -> Frame 3: Select Candidate with Minimum h(n)
        setAnimationPhase('SELECT');
        const candidate = getChosenCandidate(currentStep, nextStep);
        setHighlightedCandidateTile(candidate ? candidate.movedTile : null);
      } else if (animationPhase === 'SELECT') {
        // Frame 3 -> Frame 4: Smoothly Slide Tile into blank space
        setAnimationPhase('SLIDE');
        setHighlightedCandidateTile(null);
        const candidate = getChosenCandidate(currentStep, nextStep);
        if (candidate) {
          setCurrentState(candidate.state);
          setMovedTile(candidate.movedTile);
          setLastMoveDirection(candidate.direction);
        } else if (nextStep && nextStep.selectedNode) {
          setCurrentState(nextStep.selectedNode.state);
          setMovedTile(nextStep.selectedNode.movedTile);
          setLastMoveDirection(nextStep.selectedNode.move);
        }
      } else if (animationPhase === 'SLIDE') {
        // Frame 4 -> Advance to Next Step at Frame 1: EXPAND
        if (currentStepIndex < solverResult.steps.length) {
          const nextIdx = currentStepIndex + 1;
          const nextStepRecord = solverResult.steps[nextIdx - 1];
          if (nextStepRecord && nextStepRecord.selectedNode) {
            setCurrentState(nextStepRecord.selectedNode.state);
            setMovedTile(nextStepRecord.selectedNode.movedTile);
            setLastMoveDirection(nextStepRecord.selectedNode.move);
            setExploredNodesHistory(prev => {
              if (!prev.some(n => n.id === nextStepRecord.selectedNode.id)) {
                return [...prev, nextStepRecord.selectedNode];
              }
              return prev;
            });
          }
          setCurrentStepIndex(nextIdx);
          setAnimationPhase('EXPAND');
          setHighlightedCandidateTile(null);
        } else {
          setSearchStatus('completed');
          clearActiveTimer();
        }
      }
    }, phaseDuration);

    return () => clearActiveTimer();
  }, [
    searchStatus,
    currentStepIndex,
    animationPhase,
    solverResult,
    speed,
    clearActiveTimer,
    getChosenCandidate
  ]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearActiveTimer();
  }, [clearActiveTimer]);

  // Active step data
  const totalSteps = solverResult?.steps.length ?? 0;
  const currentStep: StepRecord | null =
    solverResult && currentStepIndex > 0 && solverResult.steps.length >= currentStepIndex
      ? solverResult.steps[currentStepIndex - 1]
      : null;

  // Next step data (for highlighting the specific successor node chosen)
  const nextStepRecord: StepRecord | null =
    solverResult && currentStepIndex > 0 && solverResult.steps.length > currentStepIndex
      ? solverResult.steps[currentStepIndex]
      : null;

  // Active Frontier queue
  const currentFrontier: SearchNode[] = currentStep
    ? currentStep.frontierSnapshot
    : solverResult && currentStepIndex === 0 && solverResult.steps.length > 0
    ? solverResult.steps[0].frontierSnapshot
    : [];

  // Active Explored set
  const currentExplored: SearchNode[] = currentStep
    ? currentStep.exploredSnapshot
    : exploredNodesHistory;

  const currentH = calculateHeuristic(currentState, goalState, heuristicType);
  const isSolved = stateToString(currentState) === stateToString(goalState);

  // Filtered Frontier
  const filteredFrontier = currentFrontier.filter(n => {
    if (!frontierFilter.trim()) return true;
    const term = frontierFilter.toLowerCase();
    return (
      n.nodeLabel.toLowerCase().includes(term) ||
      n.state.join(',').includes(term) ||
      String(n.h).includes(term)
    );
  });

  // Active chosen successor node for Section 4
  const activeChosenCandidate = currentStep ? getChosenCandidate(currentStep, nextStepRecord) : null;

  // Unified page and section navigator
  const handleNavigate = (page: NavPage, sectionId?: string, algoId?: AlgoInfoId) => {
    let targetPage: NavPage = page;
    if (
      page === 'input' ||
      page === 'selection' ||
      page === 'controls' ||
      page === 'visualization' ||
      page === 'search-process' ||
      page === 'summary'
    ) {
      targetPage = 'solver';
    } else if (page === 'about') {
      targetPage = 'algorithm';
    }

    setActivePage(targetPage);

    if (algoId) {
      setSelectedInfoAlgo(algoId);
    }

    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 70);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F5] flex flex-col text-[#292329] selection:bg-[#800020] selection:text-white">
      {/* Navigation Bar */}
      <Header
        activePage={activePage}
        onNavigate={handleNavigate}
        solvability={solvability}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
        onOpenDocModal={() => setIsDocModalOpen(true)}
        onOpenManhattanModal={() => setIsManhattanModalOpen(true)}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        {/* VIEW: HOME LANDING PAGE */}
        {activePage === 'home' && (
          <ErrorBoundary fallbackTitle="Home View Error" onReset={handleReset}>
            <HomePage
              onNavigate={(page) => handleNavigate(page)}
              onOpenManhattanModal={() => setIsManhattanModalOpen(true)}
            />
          </ErrorBoundary>
        )}

        {/* VIEW: COMPARISON PAGE */}
        {activePage === 'comparison' && (
          <ErrorBoundary fallbackTitle="Comparison View Error" onReset={handleReset}>
            <AlgorithmComparisonPage
              initialState={initialState}
              goalState={goalState}
              selectedHeuristic={heuristicType}
              selectedAlgorithm={algorithmType}
              onNavigateToSolver={(algo) => {
                setAlgorithmType(algo);
                handleNavigate('solver');
              }}
            />
          </ErrorBoundary>
        )}

        {/* VIEW: ALGORITHM INFORMATION PAGE */}
        {activePage === 'algorithm' && (
          <ErrorBoundary fallbackTitle="Algorithm Information Error" onReset={handleReset}>
            <AlgorithmInformationPage
              selectedAlgo={selectedInfoAlgo}
              onSelectAlgo={(algo) => setSelectedInfoAlgo(algo)}
              onNavigateToSolver={(algo) => {
                setAlgorithmType(algo);
                handleNavigate('solver');
              }}
            />
          </ErrorBoundary>
        )}

        {/* ============================================================ */}
        {/* VIEW: SOLVER WORKSPACE (FOCUSED EXECUTION & CONTROLS FIRST) */}
        {/* ============================================================ */}
        {activePage === 'solver' && (
          <ErrorBoundary fallbackTitle="Solver Workspace Error" onReset={handleReset}>
            <div className="space-y-6 sm:space-y-8">
              {/* PAGE HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E5D7DB]">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#520018] tracking-tight">
                    8-Puzzle Solver
                  </h1>
                  <p className="text-sm font-sans text-[#71666B] mt-1">
                    Greedy Best-First Search (GBFS) • Evaluation: <code className="font-mono text-[#800020] font-bold">f(n) = h(n)</code>
                  </p>
                </div>

                {/* Quick Action Badges */}
                <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                  <span className="px-3 py-1 bg-white border border-[#E5D7DB] rounded-lg text-[#71666B]">
                    Course: <strong className="text-[#292329]">AI Assignment</strong>
                  </span>
                  <button
                    onClick={() => setIsCustomModalOpen(true)}
                    className="px-3 py-1 bg-white hover:bg-[#F0DDE1]/60 border border-[#E5D7DB] hover:border-[#800020] rounded-lg text-[#800020] font-semibold transition-colors cursor-pointer"
                  >
                    Custom Puzzle ⚙
                  </button>
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* 1. PUZZLE VISUALIZATION / EXECUTION (PROMINENT DISPLAY) */}
              {/* ------------------------------------------------------------ */}
              <SolverVisualizationSection
                initialState={initialState}
                goalState={goalState}
                currentState={currentState}
                movedTile={movedTile}
                highlightedCandidateTile={highlightedCandidateTile}
                lastMoveDirection={lastMoveDirection}
                currentStepIndex={currentStepIndex}
                totalSteps={totalSteps}
                currentStep={currentStep}
                activeChosenCandidate={activeChosenCandidate}
                animationPhase={animationPhase}
                searchStatus={searchStatus}
                heuristicType={heuristicType}
                algorithmType={algorithmType}
                speed={speed}
                currentH={currentH}
                solutionPath={solverResult?.solutionPath}
                onTileClick={handleBoardTileClick}
                onJumpToPhase={(phase) => setAnimationPhase(phase)}
              />

              {/* ------------------------------------------------------------ */}
              {/* 2. EXECUTION CONTROLS (IMMEDIATELY DIRECTLY BELOW EXECUTION) */}
              {/* No scrolling required after clicking Start / Run */}
              {/* ------------------------------------------------------------ */}
              <InteractiveControlsSection
                initialState={initialState}
                goalState={goalState}
                currentState={currentState}
                solverResult={solverResult}
                currentStepIndex={currentStepIndex}
                totalSteps={totalSteps}
                isRunning={searchStatus === 'running'}
                isPaused={searchStatus === 'paused'}
                isCompleted={searchStatus === 'completed'}
                speed={speed}
                solvability={solvability}
                heuristicType={heuristicType}
                algorithmType={algorithmType}
                activeExecutionTimeMs={solverResult?.stats?.executionTimeMs ?? 0}
                onRun={handleSolve}
                onPause={handlePause}
                onResume={handleResume}
                onNextStep={handleNextStep}
                onPrevStep={handlePrevStep}
                onReset={handleReset}
                onSpeedChange={(newSpeed) => setSpeed(newSpeed)}
              />

              {/* ------------------------------------------------------------ */}
              {/* 3. PUZZLE INPUT (CUSTOM GRID & RANDOM SOLVABLE) */}
              {/* ------------------------------------------------------------ */}
              <PuzzleDifficultySection
                initialState={initialState}
                goalState={goalState}
                selectedDifficulty={selectedDifficulty}
                inputTab={inputTab}
                editableInitial={editableInitial}
                editableGoal={editableGoal}
                solvability={solvability}
                onSelectDifficulty={(diff) => setSelectedDifficulty(diff)}
                onRandomize={handleRandomize}
                onSelectPreset={handleSelectPreset}
                onSetInputTab={(tab) => setInputTab(tab)}
                onEditableTileChange={handleEditableTileChange}
                onApplyInlineCustom={handleApplyInlineCustom}
                onResetInlineDefaults={handleResetInlineDefaults}
                onOpenCustomModal={() => setIsCustomModalOpen(true)}
              />

              {/* ------------------------------------------------------------ */}
              {/* 4. ALGORITHM SELECTION */}
              {/* ------------------------------------------------------------ */}
              <AlgorithmSelectionSection
                algorithmType={algorithmType}
                heuristicType={heuristicType}
                currentH={currentH}
                depthLimit={depthLimit}
                onAlgorithmChange={handleAlgorithmChange}
                onHeuristicChange={handleHeuristicChange}
                onDepthLimitChange={(lim) => setDepthLimit(lim)}
                onOpenManhattanModal={() => setIsManhattanModalOpen(true)}
              />

              {/* ------------------------------------------------------------ */}
              {/* 5. SEARCH PROCESS VISUALIZATION (FRONTIER & EXPLORED) */}
              {/* ------------------------------------------------------------ */}
              <SearchProcessSection
                currentStep={currentStep}
                solverResult={solverResult}
                currentFrontier={currentFrontier}
                currentExplored={currentExplored}
                algorithmType={algorithmType}
                heuristicType={heuristicType}
                onSelectNodeState={(state, tile, moveDir) => {
                  setCurrentState(state);
                  setMovedTile(tile);
                  setLastMoveDirection(moveDir);
                }}
              />

              {/* ------------------------------------------------------------ */}
              {/* 6. SOLUTION SUMMARY */}
              {/* ------------------------------------------------------------ */}
              <section className="bg-white border border-[#E5D7DB] rounded-xl p-5 sm:p-6 shadow-xs space-y-6 scroll-mt-20" id="section-solution-summary">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5D7DB]">
                  <h2 className="text-base font-serif font-bold text-[#292329]">
                    Solution Summary
                  </h2>
                  {solverResult && (
                    <span className={`text-xs font-mono font-medium px-2.5 py-0.5 rounded-full ${
                      isSolved
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-[#F8F5F5] text-[#71666B] border border-[#E5D7DB]'
                    }`}>
                      {isSolved ? '✓ Solution Found' : 'Search Finished'}
                    </span>
                  )}
                </div>

                <SolutionSummarySection
                  initialState={initialState}
                  goalState={goalState}
                  solverResult={solverResult}
                  heuristicType={heuristicType}
                  algorithmType={algorithmType}
                  onRunSolver={handleSolve}
                  onViewSolutionPath={() => {}}
                  onViewSearchProcess={() => {}}
                />
              </section>
            </div>
          </ErrorBoundary>
        )}
      </main>

      {/* Persistent Academic Footer */}
      <Footer
        onNavigate={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Custom Configuration Modal */}
      <CustomStateModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        initialState={initialState}
        goalState={goalState}
        onApply={handleApplyCustom}
      />

      {/* Manhattan Breakdown Modal */}
      <ManhattanBreakdownModal
        isOpen={isManhattanModalOpen}
        onClose={() => setIsManhattanModalOpen(false)}
        state={currentState}
        goalState={goalState}
      />
    </div>
  );
}
