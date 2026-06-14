/**
 * CONFIRM DIALOG - P2-10
 * Reusable confirmation dialog for critical actions
 * 
 * ✨ PHASE 4 - SESSION 15: SOUND INTEGRATION
 * - Pattern: playClick (cancel, backdrop), playSuccess (confirm for info/warning), playError (confirm for danger)
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';
import { useSoundContext } from './SoundProvider';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const { playClick, playSuccess, playError } = useSoundContext();
  
  const handleConfirm = () => {
    if (variant === 'danger') {
      playError();
    } else {
      playSuccess();
    }
    onConfirm();
  };
  
  const handleCancel = () => {
    playClick();
    onCancel();
  };
  
  const dialogThemes = {
    danger: {
      icon: '🚨',
      iconBg: 'bg-[var(--coconut-shell)]/10',
      iconColor: 'text-[var(--coconut-shell)]',
      headerBg: 'from-[var(--coconut-shell)] to-[var(--coconut-shell)]',
      confirmBg: 'bg-[var(--coconut-shell)] hover:bg-[var(--coconut-shell)]/90'
    },
    warning: {
      icon: '⚠️',
      iconBg: 'bg-[var(--coconut-husk)]/10',
      iconColor: 'text-[var(--coconut-husk)]',
      headerBg: 'from-[var(--coconut-husk)] to-[var(--coconut-shell)]',
      confirmBg: 'bg-[var(--coconut-husk)] hover:bg-[var(--coconut-husk)]/90'
    },
    info: {
      icon: 'ℹ️',
      iconBg: 'bg-[var(--coconut-cream)]',
      iconColor: 'text-[var(--coconut-husk)]',
      headerBg: 'from-[var(--coconut-husk)] to-[var(--coconut-husk)]',
      confirmBg: 'bg-[var(--coconut-husk)] hover:bg-[var(--coconut-husk)]/90'
    }
  };

  const styles = dialogThemes[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${styles.headerBg} px-6 py-4`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${styles.iconBg} rounded-lg flex items-center justify-center`}>
                  <span className="text-xl">{styles.icon}</span>
                </div>
                <h2 className="text-xl font-medium text-white">{title}</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-slate-700 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                {cancelText}
              </button>

              <button
                onClick={handleConfirm}
                className={`px-4 py-2 ${styles.confirmBg} text-white rounded-lg transition-colors`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * Usage examples:
 * 
 * // Warning for unsaved changes
 * <ConfirmDialog
 *   isOpen={showWarning}
 *   variant="warning"
 *   title="Unsaved Changes"
 *   message="You have unsaved changes. Are you sure you want to close without saving?"
 *   confirmText="Discard Changes"
 *   cancelText="Keep Editing"
 *   onConfirm={handleDiscard}
 *   onCancel={handleCancel}
 * />
 * 
 * // Danger for deletion
 * <ConfirmDialog
 *   isOpen={showDeleteConfirm}
 *   variant="danger"
 *   title="Delete Project"
 *   message="This action cannot be undone. Are you sure you want to delete this project?"
 *   confirmText="Delete Forever"
 *   cancelText="Cancel"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowDeleteConfirm(false)}
 * />
 * 
 * // Info for general confirmation
 * <ConfirmDialog
 *   isOpen={showInfo}
 *   variant="info"
 *   title="Generate Image"
 *   message="This will consume 100 credits. Do you want to proceed?"
 *   confirmText="Generate"
 *   cancelText="Cancel"
 *   onConfirm={handleGenerate}
 *   onCancel={() => setShowInfo(false)}
 * />
 */