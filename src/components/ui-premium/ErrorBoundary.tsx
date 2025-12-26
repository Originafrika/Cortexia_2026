/**
 * ERROR BOUNDARY - COCONUT V14
 * Catches React errors and displays fallback UI
 */

import React, { Component, ReactNode } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/glass-card';
import { GlassButton } from '../ui/glass-button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          onReset={this.reset}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================
// DEFAULT ERROR FALLBACK
// ============================================

interface ErrorFallbackProps {
  error: Error;
  onReset: () => void;
  onGoHome?: () => void;
}

function DefaultErrorFallback({ error, onReset, onGoHome }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard className="max-w-lg w-full p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-3">
            Something went wrong
          </h1>

          {/* Message */}
          <p className="text-gray-400 mb-6">
            We encountered an unexpected error. Don't worry, your data is safe.
          </p>

          {/* Error Details (in dev) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 rounded-lg bg-black/30 border border-red-500/20 text-left">
              <p className="text-sm font-mono text-red-300 break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <GlassButton
              onClick={onReset}
              variant="primary"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </GlassButton>

            {onGoHome && (
              <GlassButton
                onClick={onGoHome}
                variant="ghost"
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </GlassButton>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default ErrorBoundary;
