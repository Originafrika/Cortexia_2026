/**
 * ERROR DIALOG - User-friendly error display with actions
 * ✅ BDS 7 Arts compliance
 * 
 * Features:
 * - Categorized error messages
 * - Actionable buttons
 * - Credit refund notifications
 * - Support contact with context
 * - Animated transitions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 3A: Import sound
import {
  AlertCircle,
  Wifi,
  Zap,
  AlertTriangle,
  XCircle,
  Upload,
  Lock,
  RefreshCw,
  X,
  Mail,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { FormattedError, ErrorCategory } from '../../lib/utils/error-handler';
import { getErrorColors } from '../../lib/utils/error-handler';

interface ErrorDialogProps {
  error: FormattedError;
  isOpen: boolean;
  onClose: () => void;
  onAction?: (action: 'retry' | 'cancel' | 'support' | 'buy-credits' | 'navigate', href?: string) => void;
}

// Icon mapping for error categories
const ERROR_ICONS: Record<ErrorCategory, React.ComponentType<{ className?: string }>> = {
  network: Wifi,
  credits: Zap,
  validation: AlertTriangle,
  api: XCircle,
  generation: AlertCircle,
  upload: Upload,
  auth: Lock,
  unknown: AlertCircle
};

export function ErrorDialog({ error, isOpen, onClose, onAction }: ErrorDialogProps) {
  // 🔊 PHASE 3A: Sound context
  const { playClick, playWhoosh } = useSoundContext();
  
  const [showTechnical, setShowTechnical] = useState(false);
  const colors = getErrorColors(error.category);
  const Icon = ERROR_ICONS[error.category];

  const handleAction = (action: 'retry' | 'cancel' | 'support' | 'buy-credits' | 'navigate', href?: string) => {
    playClick(); // 🔊 Sound feedback for all actions
    if (action === 'cancel') {
      onClose();
    } else if (onAction) {
      onAction(action, href);
    }
  };
  
  const handleClose = () => {
    playClick(); // 🔊 Sound feedback
    onClose();
  };
  
  const handleToggleTechnical = () => {
    playClick(); // 🔊 Sound feedback
    setShowTechnical(!showTechnical);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Header */}
              <div className={`${colors.bg} ${colors.border} border-b p-6`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {error.title}
                    </h3>
                    <p className="text-sm text-white/70">
                      {error.message}
                    </p>
                  </div>

                  <button
                    onClick={handleClose}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Credit Refund Notice */}
                {error.refundAmount && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--coconut-palm)]/10 border border-[var(--coconut-palm)]/20 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--coconut-palm)]/20 flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 text-[var(--coconut-palm)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--coconut-palm)]">
                          Crédits remboursés
                        </p>
                        <p className="text-xs text-[var(--coconut-palm)]/70">
                          {error.refundAmount} crédits ont été automatiquement remboursés
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Error ID */}
                {error.errorId && (
                  <div className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-lg">
                    <span className="text-xs text-white/50">ID d'erreur</span>
                    <code className="text-xs text-white/70 font-mono">{error.errorId}</code>
                  </div>
                )}

                {/* Technical Details (collapsible) */}
                {error.technicalDetails && (
                  <div>
                    <button
                      onClick={handleToggleTechnical}
                      className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors"
                    >
                      {showTechnical ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      <span>Détails techniques</span>
                    </button>
                    
                    <AnimatePresence>
                      {showTechnical && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <pre className="mt-2 p-3 bg-black/30 rounded-lg text-xs text-white/60 font-mono overflow-x-auto">
                            {error.technicalDetails}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6 pt-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  {error.actions.map((action, index) => {
                    const isPrimary = index === 0;
                    const isSupport = action.action === 'support';
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleAction(action.action, action.href)}
                        className={`
                          flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                          transition-all duration-200
                          ${isPrimary 
                            ? `${colors.bg} ${colors.border} border ${colors.text} hover:opacity-80`
                            : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                          }
                          ${isSupport ? 'flex-1' : 'flex-1 sm:flex-initial'}
                        `}
                      >
                        {isSupport && <Mail className="w-4 h-4" />}
                        {action.action === 'retry' && <RefreshCw className="w-4 h-4" />}
                        {action.action === 'buy-credits' && <Zap className="w-4 h-4" />}
                        <span className="text-sm font-medium">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to manage error dialog state
 */
export function useErrorDialog() {
  const [error, setError] = useState<FormattedError | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const showError = (formattedError: FormattedError) => {
    setError(formattedError);
    setIsOpen(true);
  };

  const hideError = () => {
    setIsOpen(false);
    setTimeout(() => setError(null), 300); // Wait for animation
  };

  return {
    error,
    isOpen,
    showError,
    hideError
  };
}