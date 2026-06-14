/**
 * ERROR FALLBACK COMPONENT
 * Phase 10 - Error Handling & Resilience
 * 
 * Composant d'affichage d'erreur élégant avec actions de récupération.
 * 
 * Usage:
 * <ErrorFallback error={error} onRetry={handleRetry} onReset={handleReset} />
 */

import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, Home, ArrowLeft, Mail } from 'lucide-react';
import { AppError, ErrorSeverity, getRecoverySuggestion } from '../../lib/utils/error-handler';
import tokens from '../../lib/styles/tokens'; // Default import

interface ErrorFallbackProps {
  error: AppError | Error;
  onRetry?: () => void;
  onReset?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
  variant?: 'page' | 'inline' | 'compact';
  className?: string;
}

export function ErrorFallback({
  error,
  onRetry,
  onReset,
  onGoBack,
  onGoHome,
  showDetails = false,
  variant = 'inline',
  className = '',
}: ErrorFallbackProps) {
  const appError = error instanceof AppError ? error : new AppError({
    userMessage: 'Une erreur inattendue s\'est produite.',
    technicalMessage: error.message,
  });

  const suggestion = getRecoverySuggestion(appError);
  const isRetryable = appError.retryable;

  // Page variant (full page error)
  if (variant === 'page') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-husk)] ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`max-w-lg w-full ${tokens.glass.cardInteractive} ${tokens.radius.lg} p-8 text-center`}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="mb-6"
          >
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${getSeverityColor(appError.severity)}`}>
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl mb-3 text-white">
            {getSeverityTitle(appError.severity)}
          </h1>

          {/* Message */}
          <p className="text-lg text-white/80 mb-6">
            {appError.userMessage}
          </p>

          {/* Suggestion */}
          {suggestion && (
            <p className="text-sm text-white/60 mb-8">
              {suggestion}
            </p>
          )}

          {/* Details (development only) */}
          {showDetails && appError.technicalMessage && (
            <details className="mb-6 text-left">
              <summary className="text-sm text-white/60 cursor-pointer hover:text-white/80">
                Détails techniques
              </summary>
              <pre className="mt-2 p-4 bg-black/20 rounded-lg text-xs text-white/70 overflow-auto">
                {appError.technicalMessage}
                {appError.stack && `\n\n${appError.stack}`}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {isRetryable && onRetry && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetry}
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

            {onGoBack && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onGoBack}
                className="w-full px-6 py-3 bg-white/10 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour
              </motion.button>
            )}
          </div>

          {/* Support */}
          {appError.severity >= ErrorSeverity.HIGH && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-white/60 mb-2">
                Le problème persiste ?
              </p>
              <a
                href="mailto:support@cortexia.app"
                className="text-sm text-[var(--coconut-cream)] hover:underline flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Contacter le support
              </a>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Compact variant (minimal error display)
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-3 p-3 ${tokens.glass.card} ${tokens.radius.md} border border-red-500/20 ${className}`}
      >
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
        <p className="text-sm text-white/80 flex-1">{appError.userMessage}</p>
        {isRetryable && onRetry && (
          <button
            onClick={onRetry}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Réessayer"
          >
            <RefreshCw className="w-4 h-4 text-white/60" />
          </button>
        )}
      </motion.div>
    );
  }

  // Inline variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${tokens.glass.cardInteractive} ${tokens.radius.lg} p-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${getSeverityColor(appError.severity)} flex-shrink-0`}>
          <AlertCircle className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg text-white mb-2">
            {getSeverityTitle(appError.severity)}
          </h3>
          <p className="text-white/80 mb-3">
            {appError.userMessage}
          </p>

          {suggestion && (
            <p className="text-sm text-white/60 mb-4">
              {suggestion}
            </p>
          )}

          {/* Details */}
          {showDetails && appError.technicalMessage && (
            <details className="mb-4">
              <summary className="text-sm text-white/60 cursor-pointer hover:text-white/80">
                Détails techniques
              </summary>
              <pre className="mt-2 p-3 bg-black/20 rounded-lg text-xs text-white/70 overflow-auto max-h-40">
                {appError.technicalMessage}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {isRetryable && onRetry && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRetry}
                className="px-4 py-2 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-husk)] text-white rounded-lg flex items-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </motion.button>
            )}

            {onReset && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onReset}
                className="px-4 py-2 bg-white/10 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-white/20"
              >
                Réinitialiser
              </motion.button>
            )}

            {onGoBack && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGoBack}
                className="px-4 py-2 bg-white/10 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// HELPERS
// ============================================

function getSeverityColor(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      return 'bg-red-600';
    case ErrorSeverity.HIGH:
      return 'bg-red-500';
    case ErrorSeverity.MEDIUM:
      return 'bg-orange-500';
    case ErrorSeverity.LOW:
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
}

function getSeverityTitle(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      return 'Erreur critique';
    case ErrorSeverity.HIGH:
      return 'Erreur';
    case ErrorSeverity.MEDIUM:
      return 'Attention';
    case ErrorSeverity.LOW:
      return 'Information';
    default:
      return 'Erreur';
  }
}