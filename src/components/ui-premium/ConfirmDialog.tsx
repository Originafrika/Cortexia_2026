/**
 * CONFIRM DIALOG - COCONUT V14
 * Confirmation dialog for destructive actions
 */

import React, { ReactNode, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from '../coconut-v14/SoundProvider'; // 🔊 PHASE 2A: Import sound
import { GlassCard } from '../ui/glass-card';
import { GlassButton } from '../ui/glass-button';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  icon?: ReactNode;
}

const variantStyles = {
  danger: {
    icon: XCircle,
    color: 'text-[var(--coconut-shell)]',
    bg: 'bg-[var(--coconut-shell)]/20',
    border: 'border-[var(--coconut-shell)]/30',
    buttonVariant: 'danger' as const,
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-[var(--coconut-husk)]',
    bg: 'bg-[var(--coconut-husk)]/20',
    border: 'border-[var(--coconut-husk)]/30',
    buttonVariant: 'primary' as const,
  },
  info: {
    icon: Info,
    color: 'text-[var(--coconut-husk)]',
    bg: 'bg-[var(--coconut-husk)]/20',
    border: 'border-[var(--coconut-husk)]/30',
    buttonVariant: 'primary' as const,
  },
  success: {
    icon: CheckCircle,
    color: 'text-[var(--coconut-palm)]',
    bg: 'bg-[var(--coconut-palm)]/20',
    border: 'border-[var(--coconut-palm)]/30',
    buttonVariant: 'primary' as const,
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'danger',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon,
}: ConfirmDialogProps) {
  // 🔊 PHASE 2A: Sound context
  const { playClick, playWhoosh } = useSoundContext();
  
  const config = variantStyles[variant];
  const Icon = icon || config.icon;

  const handleConfirm = () => {
    if (variant === 'danger') {
      playWhoosh(); // 🔊 Sound for destructive action
    } else {
      playClick(); // 🔊 Sound for normal confirm
    }
    onConfirm();
    onClose();
  };
  
  const handleCancel = () => {
    playClick(); // 🔊 Sound for cancel
    onClose();
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
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto"
            >
              <GlassCard className="max-w-md w-full p-6">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-full ${config.bg} border ${config.border} flex items-center justify-center`}>
                    <Icon className={`w-8 h-8 ${config.color}`} />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-white text-center mb-3">
                  {title}
                </h2>

                {/* Message */}
                <p className="text-gray-400 text-center mb-6">
                  {message}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <GlassButton
                    onClick={handleCancel}
                    variant="ghost"
                    fullWidth
                  >
                    {cancelText}
                  </GlassButton>

                  <GlassButton
                    onClick={handleConfirm}
                    variant={config.buttonVariant}
                    fullWidth
                  >
                    {confirmText}
                  </GlassButton>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;

// ============================================
// HOOK FOR CONFIRM DIALOG MANAGER
// ============================================

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  icon?: ReactNode;
  onConfirm: () => void | Promise<void>;
}

export interface UseConfirmDialogReturn {
  open: (options: ConfirmDialogOptions) => void;
  close: () => void;
  isOpen: boolean;
  ConfirmDialog: React.ComponentType;
}

export function useConfirmDialog(): UseConfirmDialogReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);

  const open = useCallback((opts: ConfirmDialogOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Clear options after animation completes
    setTimeout(() => setOptions(null), 300);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (options?.onConfirm) {
      await options.onConfirm();
    }
    close();
  }, [options, close]);

  const ConfirmDialogComponent = useCallback(() => {
    if (!options) return null;

    return (
      <ConfirmDialog
        isOpen={isOpen}
        onClose={close}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        variant={options.variant}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        icon={options.icon}
      />
    );
  }, [isOpen, options, close, handleConfirm]);

  return {
    open,
    close,
    isOpen,
    ConfirmDialog: ConfirmDialogComponent,
  };
}