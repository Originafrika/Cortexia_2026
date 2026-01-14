/**
 * ERROR BOUNDARY - React error boundary for graceful error handling
 * 
 * Features:
 * - Global error catching
 * - Feature-specific boundaries
 * - Fallback UI
 * - Error recovery
 * - Error reporting
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';

// ============================================
// TYPES
// ============================================

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'global' | 'feature' | 'component';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================
// ERROR BOUNDARY COMPONENT
// ============================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call error handler
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Report to error tracking service (Sentry, etc.)
    this.reportError(error, errorInfo);
  }

  reportError(error: Error, errorInfo: ErrorInfo): void {
    // This will be integrated with Sentry or other services
    // For now, we'll use a custom error reporter
    if (typeof window !== 'undefined' && (window as any).__ERROR_REPORTER__) {
      (window as any).__ERROR_REPORTER__.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.state.errorInfo!,
          this.resetError
        );
      }

      // Default fallback based on level
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.resetError}
          showDetails={this.props.showDetails}
          level={this.props.level || 'component'}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================
// DEFAULT FALLBACK UI
// ============================================

interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  showDetails?: boolean;
  level: 'global' | 'feature' | 'component';
}

function DefaultErrorFallback({
  error,
  errorInfo,
  onReset,
  showDetails = false,
  level,
}: DefaultErrorFallbackProps) {
  const isGlobal = level === 'global';
  const isFeature = level === 'feature';

  return (
    <div
      className={`
        flex items-center justify-center
        ${isGlobal ? 'min-h-screen bg-gray-950' : 'min-h-[400px] bg-gray-900 rounded-xl border border-gray-800'}
        p-8
      `}
    >
      <div className="max-w-md w-full space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-white">
            {isGlobal
              ? 'Something went wrong'
              : isFeature
              ? 'Feature unavailable'
              : 'Component error'}
          </h2>
          <p className="text-gray-400">
            {isGlobal
              ? 'We encountered an unexpected error. Please try refreshing the page.'
              : isFeature
              ? 'This feature is temporarily unavailable. We\'re working on fixing it.'
              : 'This component failed to load. You can try again or continue using the app.'}
          </p>
        </div>

        {/* Error message */}
        {showDetails && (
          <div className="bg-gray-800 rounded-lg p-4 space-y-2">
            <p className="text-sm font-mono text-red-400">{error.message}</p>
            {errorInfo?.componentStack && (
              <details className="text-xs text-gray-500 mt-2">
                <summary className="cursor-pointer hover:text-gray-400">
                  Component Stack
                </summary>
                <pre className="mt-2 overflow-auto max-h-32">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
          {isGlobal && (
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          )}
        </div>

        {/* Support link */}
        {isGlobal && (
          <p className="text-center text-sm text-gray-500">
            If the problem persists,{' '}
            <a href="/support" className="text-primary-400 hover:underline">
              contact support
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// HOOK FOR ERROR BOUNDARIES
// ============================================

/**
 * Hook to trigger error boundary from within a component
 */
export function useErrorHandler() {
  const [, setError] = React.useState();

  return React.useCallback(
    (error: Error) => {
      setError(() => {
        throw error;
      });
    },
    [setError]
  );
}

// ============================================
// SPECIFIC ERROR BOUNDARIES
// ============================================

/**
 * Global error boundary for entire app
 */
export function GlobalErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="global"
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // Log to error tracking service
        console.error('Global error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Feature error boundary for major features
 */
export function FeatureErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="feature"
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        console.error('Feature error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Component error boundary for individual components
 */
export function ComponentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="component"
      showDetails={false}
      onError={(error, errorInfo) => {
        console.error('Component error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}