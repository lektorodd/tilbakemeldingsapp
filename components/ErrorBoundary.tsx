'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg shadow-lg border border-danger p-8 max-w-lg w-full text-center">
            <AlertTriangle size={48} className="mx-auto mb-4 text-danger" />
            <h1 className="text-2xl font-display font-bold text-text-primary mb-2">
              Something went wrong
            </h1>
            <p className="text-text-secondary mb-4">
              An unexpected error occurred. Your data is safe in local storage.
            </p>
            {this.state.error && (
              <details className="text-left mb-6 bg-danger-bg border border-danger rounded-lg p-3">
                <summary className="text-sm font-medium text-danger cursor-pointer">
                  Error details
                </summary>
                <pre className="mt-2 text-xs text-danger whitespace-pre-wrap break-words font-mono">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition"
              >
                <RefreshCw size={18} />
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-surface-alt text-text-secondary rounded-lg hover:bg-border transition"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
