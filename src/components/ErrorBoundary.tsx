import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#F8F5F5] border-2 border-[#800020] rounded-xl p-6 sm:p-8 my-4 shadow-sm text-[#292329]">
          <div className="flex items-center gap-2.5 text-[#800020] mb-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <span className="font-mono font-bold text-xs uppercase tracking-widest bg-[#F0DDE1] px-2.5 py-1 border border-[#E5D7DB] rounded">
              Search Status: Execution Error
            </span>
          </div>

          <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#520018]">
            {this.props.fallbackTitle || 'Something went wrong while executing GBFS'}
          </h3>

          <p className="text-xs sm:text-sm font-sans text-[#71666B] mt-2 max-w-2xl leading-relaxed">
            A runtime issue occurred during state evaluation or rendering. The application state has been safely isolated so the rest of the workspace remains fully intact.
          </p>

          {this.state.error && (
            <div className="mt-4 p-3 bg-white border border-[#E5D7DB] rounded text-xs font-mono text-[#800020] overflow-x-auto">
              {this.state.error.toString()}
            </div>
          )}

          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#800020] hover:bg-[#520018] text-white font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset &amp; Try Again</span>
            </button>

            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F0DDE1]/60 text-[#800020] font-mono text-xs font-bold border border-[#E5D7DB] hover:border-[#800020] rounded-lg transition-colors cursor-pointer shadow-2xs active:scale-98"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
