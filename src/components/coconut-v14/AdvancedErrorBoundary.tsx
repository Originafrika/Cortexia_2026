/**
 * ADVANCED ERROR BOUNDARY
 * Graceful error handling with recovery options
 * 
 * ✨ PHASE 4 - SESSION 15: SOUND INTEGRATION
 * - Pattern: playClick (action buttons)
 * NOTE: Class components cannot use hooks directly, so we'll create wrapper functions
 */

import React, { Component, ReactNode } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  context?: string;
  playClick?: () => void; // Passed from parent
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
}

export class AdvancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error caught by boundary:', {
      context: this.props.context,
      error,
      errorInfo,
      componentStack: errorInfo.componentStack
    });

    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Log to error tracking service (Sentry, LogRocket, etc.)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // TODO: Integrate with error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    
    const errorLog = {
      timestamp: new Date().toISOString(),
      context: this.props.context || 'Unknown',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store in localStorage for debugging
    try {
      const logs = JSON.parse(localStorage.getItem('coconut_error_logs') || '[]');
      logs.push(errorLog);
      // Keep last 10 errors
      if (logs.length > 10) logs.shift();
      localStorage.setItem('coconut_error_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  handleReset = () => {
    this.props.playClick?.();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    this.props.playClick?.();
    window.location.reload();
  };

  handleGoHome = () => {
    this.props.playClick?.();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, errorCount } = this.state;
      const isRecurring = errorCount > 2;

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--coconut-shell)]/5 to-[var(--coconut-husk)]/5 p-6"
        >
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-husk)] p-8 text-white">
              <div className="flex items-center gap-4">
                <AlertTriangle className="w-12 h-12" />
                <div>
                  <h1 className="text-3xl font-bold">Oups ! Une erreur est survenue</h1>
                  <p className="text-white/80 mt-2">
                    {this.props.context 
                      ? `Erreur dans : ${this.props.context}`
                      : 'Une erreur inattendue s\'est produite'}
                  </p>
                </div>
              </div>
            </div>

            {/* Error Details */}
            <div className="p-8">
              {isRecurring && (
                <div className="mb-6 p-4 bg-[var(--coconut-husk)]/10 border border-[var(--coconut-husk)]/30 rounded-lg">
                  <p className="text-[var(--coconut-husk)] font-medium flex items-center gap-2">
                    <Bug className="w-5 h-5" />
                    Erreur récurrente détectée ({errorCount} fois)
                  </p>
                  <p className="text-[var(--coconut-husk)] text-sm mt-1">
                    Cette erreur se répète. Nous vous recommandons de recharger la page complètement.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Message d'erreur :</h3>
                  <p className="text-[var(--coconut-shell)] bg-[var(--coconut-shell)]/10 p-3 rounded-lg font-mono text-sm">
                    {error?.message || 'Erreur inconnue'}
                  </p>
                </div>

                {error?.stack && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-gray-700 font-medium hover:text-gray-900">
                      Détails techniques (pour développeurs)
                    </summary>
                    <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-xs overflow-auto max-h-64 text-gray-600 font-mono">
                      {error.stack}
                    </pre>
                  </details>
                )}

                {errorInfo?.componentStack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-gray-700 font-medium hover:text-gray-900">
                      Component Stack
                    </summary>
                    <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-xs overflow-auto max-h-64 text-gray-600 font-mono">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                {!isRecurring && (
                  <button
                    onClick={this.handleReset}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--coconut-cream)] to-[var(--coconut-milk)] text-[var(--coconut-shell)] rounded-lg hover:from-[var(--coconut-cream)] hover:to-[var(--coconut-milk)] transition-all shadow-lg hover:shadow-xl"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Réessayer
                  </button>
                )}

                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--coconut-husk)] to-[var(--coconut-shell)] text-white rounded-lg hover:from-[var(--coconut-shell)] hover:to-[var(--coconut-shell)] transition-all shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="w-5 h-5" />
                  Recharger la page
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                >
                  <Home className="w-5 h-5" />
                  Retour accueil
                </button>
              </div>

              {/* Help Text */}
              <div className="mt-6 p-4 bg-[var(--coconut-cream)] rounded-lg">
                <p className="text-[var(--coconut-shell)] text-sm">
                  <strong>Que faire ?</strong>
                </p>
                <ul className="mt-2 text-[var(--coconut-husk)] text-sm space-y-1 ml-4 list-disc">
                  <li>Si c'est la première fois : cliquez sur "Réessayer"</li>
                  <li>Si l'erreur persiste : rechargez la page complètement</li>
                  <li>Si le problème continue : videz le cache de votre navigateur</li>
                  <li>En dernier recours : contactez le support avec les détails techniques ci-dessus</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  context?: string
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <AdvancedErrorBoundary context={context}>
        <Component {...props} />
      </AdvancedErrorBoundary>
    );
  };
}