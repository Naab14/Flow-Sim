import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDark = localStorage.getItem('theme-mode') !== 'light';

      return (
        <div
          className={`min-h-screen flex items-center justify-center p-8 ${
            isDark ? 'bg-slate-900' : 'bg-slate-50'
          }`}
        >
          <div
            className={`max-w-lg w-full rounded-xl p-8 shadow-xl ${
              isDark
                ? 'bg-slate-800 border border-slate-700'
                : 'bg-white border border-slate-200'
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`p-3 rounded-full ${
                  isDark ? 'bg-red-900/30' : 'bg-red-100'
                }`}
              >
                <AlertTriangle
                  className="w-8 h-8 text-red-500"
                  strokeWidth={2}
                />
              </div>
              <div>
                <h1
                  className={`text-xl font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Something went wrong
                </h1>
                <p
                  className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  An unexpected error occurred
                </p>
              </div>
            </div>

            {this.state.error && (
              <div
                className={`mb-6 p-4 rounded-lg font-mono text-sm overflow-auto max-h-40 ${
                  isDark
                    ? 'bg-slate-900 text-red-400 border border-slate-700'
                    : 'bg-slate-100 text-red-600 border border-slate-200'
                }`}
              >
                <p className="font-bold mb-1">{this.state.error.name}</p>
                <p className="opacity-80">{this.state.error.message}</p>
              </div>
            )}

            <p
              className={`text-sm mb-6 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              The simulation encountered an error. You can try refreshing the
              page or returning to the home page. If the problem persists, try
              clearing your browser's local storage.
            </p>

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            {this.state.errorInfo && (
              <details
                className={`mt-6 text-xs ${
                  isDark ? 'text-slate-500' : 'text-slate-500'
                }`}
              >
                <summary className="cursor-pointer hover:text-slate-400 transition-colors">
                  Technical Details
                </summary>
                <pre
                  className={`mt-2 p-3 rounded overflow-auto max-h-32 ${
                    isDark ? 'bg-slate-900' : 'bg-slate-100'
                  }`}
                >
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
