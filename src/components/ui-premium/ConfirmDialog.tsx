/**
 * CONFIRM DIALOG - COCONUT V14
 * Confirmation dialog for destructive actions
 */

import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

const variantConfig = {
  danger: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    buttonVariant: 'danger' as const,
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    buttonVariant: 'primary' as const,
  },
  info: {
    icon: Info,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    buttonVariant: 'primary' as const,
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
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
  const config = variantConfig[variant];
  const Icon = icon || config.icon;

  const handleConfirm = () => {
    onConfirm();
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
                    onClick={onClose}
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
