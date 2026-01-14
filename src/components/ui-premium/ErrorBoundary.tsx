/**
 * ERROR BOUNDARY - COCONUT V14
 * Catches React errors and displays fallback UI
 * 
 * 🛡️ PHASE 10: ENHANCED ERROR HANDLING
 * - AppError integration
 * - Retry logic
 * - Better logging
 * - Coconut Warm design
 */

import React, { Component, ReactNode } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/glass-card';
import { GlassButton } from '../ui/glass-button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { classifyError, AppError, handleError } from '../../lib/utils/error-handler';
import tokens from '../../lib/styles/tokens'; // Default import

interface Props {
  children: ReactNode;
  fallback?: (error: AppError, reset: () => void) => ReactNode;
  onError?: (error: AppError, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
  maxRetries?: number;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: AppError | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const appError = classifyError(error);
    return { hasError: true, error: appError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = classifyError(error);
    
    // Log to console
    console.error('[ErrorBoundary]', appError.toJSON(), errorInfo);
    
    // Call onError callback
    this.props.onError?.(appError, errorInfo);
    
    // Handle error (toast, logging, etc.)
    handleError(error, {
      silent: false,
      logToConsole: true,
      context: { componentStack: errorInfo.componentStack },
    });
  }

  reset = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    // Check if we can retry
    if (retryCount < maxRetries) {
      this.setState({ 
        hasError: false, 
        error: null,
        retryCount: retryCount + 1,
      });
      this.props.onReset?.();
    }
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
          retryCount={this.state.retryCount}
          maxRetries={this.props.maxRetries || 3}
          showDetails={this.props.showDetails}
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
  error: AppError;
  onReset: () => void;
  onGoHome?: () => void;
  retryCount?: number;
  maxRetries?: number;
  showDetails?: boolean;
}

function DefaultErrorFallback({ 
  error, 
  onReset, 
  onGoHome,
  retryCount = 0,
  maxRetries = 3,
  showDetails = false,
}: ErrorFallbackProps) {
  const canRetry = error.retryable && retryCount < maxRetries;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-husk)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard className={`max-w-lg w-full p-8 text-center ${tokens.glass.cardInteractive}`}>
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center"
            >
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </motion.div>
          </div>

          {/* Title */}
          <h1 className="text-3xl text-white mb-3">
            Une erreur s'est produite
          </h1>

          {/* Message */}
          <p className="text-lg text-white/80 mb-6">
            {error.userMessage}
          </p>

          {/* Retry count */}
          {retryCount > 0 && (
            <p className="text-sm text-white/60 mb-4">
              Tentatives : {retryCount}/{maxRetries}
            </p>
          )}

          {/* Error Details (in dev or showDetails) */}
          {(showDetails || process.env.NODE_ENV === 'development') && (
            <details className="mb-6 text-left">
              <summary className="text-sm text-white/60 cursor-pointer hover:text-white/80 mb-2">
                Détails techniques
              </summary>
              <div className="p-4 rounded-lg bg-black/30 border border-red-500/20">
                <p className="text-sm font-mono text-red-300 break-all mb-2">
                  {error.technicalMessage}
                </p>
                {error.stack && (
                  <pre className="text-xs text-white/50 overflow-auto max-h-40">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {canRetry && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReset}
                className="w-full px-6 py-3 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-husk)] text-white rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
              >
                <RefreshCw className="w-5 h-5" />
                Réessayer
              </motion.button>
            )}

            {onGoHome && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onGoHome}
                className="w-full px-6 py-3 bg-white/10 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
              >
                <Home className="w-5 h-5" />
                Retour à l'accueil
              </motion.button>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default ErrorBoundary;