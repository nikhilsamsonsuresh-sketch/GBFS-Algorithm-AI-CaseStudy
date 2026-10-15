import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Sliders,
  Play,
  Layers,
  Activity,
  GitBranch,
  BarChart2,
  FileText
} from 'lucide-react';
import { SolvabilityCheck } from '../types';
import { AlgoInfoId } from './AlgorithmInformationPage';

export type NavPage =
  | 'home'
  | 'solver'
  | 'input'
  | 'selection'
  | 'controls'
  | 'visualization'
  | 'search-process'
  | 'summary'
  | 'comparison'
  | 'algorithm'
  | 'about';

export interface HeaderProps {
  activePage: NavPage;
  onNavigate: (page: NavPage, sectionId?: string, algoId?: AlgoInfoId) => void;
  solvability: SolvabilityCheck;
  onOpenCustomModal?: () => void;
  onOpenDocModal?: () => void;
  onOpenManhattanModal?: () => void;
  onReset: () => void;
}

const SOLVER_ITEMS = [
  {
    label: 'Puzzle Input',
    desc: 'Preset difficulties & custom grid editing',
    sectionId: 'section-puzzle-input',
    icon: Sliders
  },
  {
    label: 'Puzzle Visualization / Execution',
    desc: 'Animated 3×3 puzzle board & live state',
    sectionId: 'section-visualization',
    icon: Play
  },
  {
    label: 'Algorithm Selection',
    desc: 'GBFS, A*, heuristics & depth limit',
    sectionId: 'section-algorithm-selection',
    icon: Layers
  },
  {
    label: 'Execution Controls',
    desc: 'Start, Pause, Resume, Step, Speed & Reset',
    sectionId: 'section-interactive-controls',
    icon: Activity
  },
  {
    label: 'Search Process',
    desc: 'Frontier priority queue & explored set',
    sectionId: 'section-search-process',
    icon: GitBranch
  },
  {
    label: 'Solution Summary',
    desc: 'Metrics: moves, nodes, time & memory',
    sectionId: 'section-solution-summary',
    icon: CheckCircle2
  }
];

const COMPARISON_ITEMS = [
  {
    label: 'Algorithm Comparison',
    desc: 'Benchmarking overview & parameters',
    sectionId: 'section-algorithm-comparison',
    icon: BarChart2
  },
  {
    label: 'Comparison Results',
    desc: 'Empirical table of runtime & node statistics',
    sectionId: 'section-comparison-results',
    icon: FileText
  }
];

const ALGORITHM_ITEMS: Array<{
  id: AlgoInfoId;
  name: string;
  fullName: string;
  isAssigned?: boolean;
}> = [
  {
    id: 'GBFS',
    name: 'GBFS',
    fullName: 'Greedy Best-First Search (Assigned)',
    isAssigned: true
  },
  {
    id: 'ASTAR',
    name: 'A*',
    fullName: 'A* Search (Optimal f = g + h)'
  },
  {
    id: 'BFS',
    name: 'BFS',
    fullName: 'Breadth-First Search (Level-by-level)'
  },
  {
    id: 'DFS',
    name: 'DFS',
    fullName: 'Depth-First Search (Deep branch)'
  },
  {
    id: 'DLS',
    name: 'DLS',
    fullName: 'Depth-Limited Search (Cutoff)'
  },
  {
    id: 'IDDLS',
    name: 'IDDLS',
    fullName: 'Iterative Deepening Search'
  }
];

type DropdownKey = 'solver' | 'comparison' | 'algorithm' | null;

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  solvability,
  onReset
}) => {
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedDropdown, setMobileExpandedDropdown] = useState<DropdownKey>(null);

  const headerRef = useRef<HTMLElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Hover handlers for desktop navigation
  const handleMouseEnter = (key: DropdownKey) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setOpenDropdown(key);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const handleDropdownToggle = (key: DropdownKey) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const handleNavHome = () => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
    onNavigate('home');
  };

  const handleSelectSolverSection = (sectionId: string) => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
    onNavigate('solver', sectionId);
  };

  const handleSelectComparisonSection = (sectionId: string) => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
    onNavigate('comparison', sectionId);
  };

  const handleSelectAlgorithm = (algoId: AlgoInfoId) => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
    onNavigate('algorithm', 'section-algo-details', algoId);
  };

  const isHome = activePage === 'home';
  const isSolver = ['solver', 'input', 'selection', 'controls', 'visualization', 'search-process', 'summary'].includes(activePage);
  const isComparison = activePage === 'comparison';
  const isAlgorithm = ['algorithm', 'about'].includes(activePage);

  return (
    <header
      ref={headerRef}
      className="bg-white/95 backdrop-blur-md border-b border-[#E5D7DB] sticky top-0 z-40 shadow-xs"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <div
            onClick={handleNavHome}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#800020] text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs">
              8P
            </div>
            <div>
              <span className="font-serif font-bold text-[#520018] text-base tracking-tight block">
                8-Puzzle Solver
              </span>
              <span className="text-[11px] font-mono text-[#71666B] hidden sm:block">
                Greedy Best-First Search
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links with Dropdowns */}
          <nav className="hidden md:flex items-center gap-2">
            {/* 1. Home */}
            <button
              onClick={handleNavHome}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none ${
                isHome
                  ? 'bg-[#800020] text-white font-semibold shadow-xs'
                  : 'text-[#292329] hover:text-[#800020] hover:bg-[#F0DDE1]/50'
              }`}
            >
              Home
            </button>

            {/* 2. Solver Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('solver')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => handleDropdownToggle('solver')}
                aria-expanded={openDropdown === 'solver'}
                aria-haspopup="true"
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none ${
                  isSolver
                    ? 'bg-[#800020] text-white font-semibold shadow-xs'
                    : openDropdown === 'solver'
                    ? 'bg-[#F0DDE1] text-[#800020]'
                    : 'text-[#292329] hover:text-[#800020] hover:bg-[#F0DDE1]/50'
                }`}
              >
                <span>Solver</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    openDropdown === 'solver' ? 'rotate-180 text-current' : 'text-[#71666B]'
                  }`}
                />
              </button>

              {openDropdown === 'solver' && (
                <div
                  className="absolute left-0 mt-1.5 w-72 bg-white border border-[#E5D7DB] rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  role="menu"
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#71666B] border-b border-[#E5D7DB] mb-1">
                    Solver Sections
                  </div>
                  {SOLVER_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.sectionId}
                        onClick={() => handleSelectSolverSection(item.sectionId)}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-[#292329] hover:text-[#800020] hover:bg-[#F8F5F5] transition-colors flex items-start gap-2.5 group cursor-pointer"
                        role="menuitem"
                      >
                        <div className="mt-0.5 p-1 rounded bg-[#F8F5F5] text-[#71666B] group-hover:bg-[#F0DDE1] group-hover:text-[#800020] transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-[#292329] group-hover:text-[#800020] leading-tight">
                            {item.label}
                          </div>
                          <div className="text-[11px] text-[#71666B] font-sans truncate mt-0.5">
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Comparison Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('comparison')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => handleDropdownToggle('comparison')}
                aria-expanded={openDropdown === 'comparison'}
                aria-haspopup="true"
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none ${
                  isComparison
                    ? 'bg-[#800020] text-white font-semibold shadow-xs'
                    : openDropdown === 'comparison'
                    ? 'bg-[#F0DDE1] text-[#800020]'
                    : 'text-[#292329] hover:text-[#800020] hover:bg-[#F0DDE1]/50'
                }`}
              >
                <span>Comparison</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    openDropdown === 'comparison' ? 'rotate-180 text-current' : 'text-[#71666B]'
                  }`}
                />
              </button>

              {openDropdown === 'comparison' && (
                <div
                  className="absolute left-0 mt-1.5 w-68 bg-white border border-[#E5D7DB] rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  role="menu"
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#71666B] border-b border-[#E5D7DB] mb-1">
                    Comparison Views
                  </div>
                  {COMPARISON_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.sectionId}
                        onClick={() => handleSelectComparisonSection(item.sectionId)}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-[#292329] hover:text-[#800020] hover:bg-[#F8F5F5] transition-colors flex items-start gap-2.5 group cursor-pointer"
                        role="menuitem"
                      >
                        <div className="mt-0.5 p-1 rounded bg-[#F8F5F5] text-[#71666B] group-hover:bg-[#F0DDE1] group-hover:text-[#800020] transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-[#292329] group-hover:text-[#800020] leading-tight">
                            {item.label}
                          </div>
                          <div className="text-[11px] text-[#71666B] font-sans truncate mt-0.5">
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Algorithm Information Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('algorithm')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => handleDropdownToggle('algorithm')}
                aria-expanded={openDropdown === 'algorithm'}
                aria-haspopup="true"
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none ${
                  isAlgorithm
                    ? 'bg-[#800020] text-white font-semibold shadow-xs'
                    : openDropdown === 'algorithm'
                    ? 'bg-[#F0DDE1] text-[#800020]'
                    : 'text-[#292329] hover:text-[#800020] hover:bg-[#F0DDE1]/50'
                }`}
              >
                <span>Algorithm Information</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    openDropdown === 'algorithm' ? 'rotate-180 text-current' : 'text-[#71666B]'
                  }`}
                />
              </button>

              {openDropdown === 'algorithm' && (
                <div
                  className="absolute left-0 mt-1.5 w-72 bg-white border border-[#E5D7DB] rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  role="menu"
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#71666B] border-b border-[#E5D7DB] mb-1 flex items-center justify-between">
                    <span>Algorithms</span>
                    <span className="text-[9px] bg-[#F8F5F5] px-1.5 py-0.2 rounded text-[#71666B]">6 Implemented</span>
                  </div>
                  {ALGORITHM_ITEMS.map((item) => {
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectAlgorithm(item.id)}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-[#292329] hover:text-[#800020] hover:bg-[#F8F5F5] transition-colors flex items-center justify-between group cursor-pointer"
                        role="menuitem"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#800020] w-11">
                            {item.name}
                          </span>
                          <span className="text-xs text-[#292329] font-sans truncate">
                            {item.fullName}
                          </span>
                        </div>
                        {item.isAssigned && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#F0DDE1] text-[#800020] border border-[#E5D7DB] shrink-0">
                            Assigned
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Solvability Status Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
                solvability.isSolvable
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              {solvability.isSolvable ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span>{solvability.isSolvable ? 'Solvable' : 'Unsolvable'}</span>
            </div>

            {/* Quick Reset Button */}
            <button
              onClick={onReset}
              className="p-1.5 text-[#71666B] hover:text-[#800020] hover:bg-[#F0DDE1]/60 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-[#E5D7DB]"
              title="Reset Puzzle State"
              aria-label="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-[#71666B] hover:text-[#800020] hover:bg-[#F0DDE1]/60 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown & Accordion Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#E5D7DB] flex flex-col gap-1.5 max-h-[80vh] overflow-y-auto">
            {/* Mobile Home */}
            <button
              onClick={handleNavHome}
              className={`px-3 py-2 rounded-lg text-left text-sm font-medium ${
                isHome ? 'bg-[#800020] text-white font-semibold' : 'text-[#292329] hover:bg-[#F8F5F5]'
              }`}
            >
              Home
            </button>

            {/* Mobile Solver Group */}
            <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl overflow-hidden">
              <button
                onClick={() =>
                  setMobileExpandedDropdown((prev) => (prev === 'solver' ? null : 'solver'))
                }
                className={`w-full px-3 py-2.5 text-left text-sm font-medium flex items-center justify-between transition-colors ${
                  isSolver ? 'text-[#800020] font-semibold' : 'text-[#292329]'
                }`}
              >
                <span>Solver</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#71666B] transition-transform duration-200 ${
                    mobileExpandedDropdown === 'solver' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {mobileExpandedDropdown === 'solver' && (
                <div className="bg-white border-t border-[#E5D7DB] p-1.5 space-y-0.5">
                  {SOLVER_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.sectionId}
                        onClick={() => handleSelectSolverSection(item.sectionId)}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#292329] hover:text-[#800020] hover:bg-[#F8F5F5] flex items-center gap-2.5"
                      >
                        <Icon className="w-3.5 h-3.5 text-[#71666B]" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Comparison Group */}
            <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl overflow-hidden">
              <button
                onClick={() =>
                  setMobileExpandedDropdown((prev) => (prev === 'comparison' ? null : 'comparison'))
                }
                className={`w-full px-3 py-2.5 text-left text-sm font-medium flex items-center justify-between transition-colors ${
                  isComparison ? 'text-[#800020] font-semibold' : 'text-[#292329]'
                }`}
              >
                <span>Comparison</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#71666B] transition-transform duration-200 ${
                    mobileExpandedDropdown === 'comparison' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {mobileExpandedDropdown === 'comparison' && (
                <div className="bg-white border-t border-[#E5D7DB] p-1.5 space-y-0.5">
                  {COMPARISON_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.sectionId}
                        onClick={() => handleSelectComparisonSection(item.sectionId)}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#292329] hover:text-[#800020] hover:bg-[#F8F5F5] flex items-center gap-2.5"
                      >
                        <Icon className="w-3.5 h-3.5 text-[#71666B]" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Algorithm Information Group */}
            <div className="bg-[#F8F5F5] border border-[#E5D7DB] rounded-xl overflow-hidden">
              <button
                onClick={() =>
                  setMobileExpandedDropdown((prev) => (prev === 'algorithm' ? null : 'algorithm'))
                }
                className={`w-full px-3 py-2.5 text-left text-sm font-medium flex items-center justify-between transition-colors ${
                  isAlgorithm ? 'text-[#800020] font-semibold' : 'text-[#292329]'
                }`}
              >
                <span>Algorithm Information</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#71666B] transition-transform duration-200 ${
                    mobileExpandedDropdown === 'algorithm' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {mobileExpandedDropdown === 'algorithm' && (
                <div className="bg-white border-t border-[#E5D7DB] p-1.5 space-y-0.5">
                  {ALGORITHM_ITEMS.map((item) => {
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectAlgorithm(item.id)}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#292329] hover:text-[#800020] hover:bg-[#F8F5F5] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#800020] w-12">{item.name}</span>
                          <span className="text-[#71666B] truncate">{item.fullName}</span>
                        </div>
                        {item.isAssigned && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#F0DDE1] text-[#800020] border border-[#E5D7DB]">
                            Assigned
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
