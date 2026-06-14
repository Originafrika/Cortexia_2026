/**
 * TOAST - Coconut Design System V14
 * Phase 4 Jour 4 - Enhanced with Motion Animations
 * 
 * Features:
 * - Non-blocking notifications
 * - Multiple variants (success, error, warning, info)
 * - Auto-dismiss with progress bar
 * - Action buttons
 * - Stack management
 * - Position options
 * - Sound feedback (optional)
 * - Enhanced animations from Phase 4 Jour 3
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import React, { useEffect } from 'react';
import { Button } from './Button';
import { toastVariants, successBounce } from '../../lib/animations/transitions';
import { successPulse, errorShake } from '../../lib/animations/micro-interactions';

// ============================================
// TYPES
// ============================================

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'default';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  id: string;
  variant?: ToastVariant;
  title: string;
  message?: string;
  action?: ToastAction;
  duration?: number; // ms, 0 = no auto-dismiss
  onClose: () => void;
}

export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: ToastPosition;
  onDismiss: (id: string) => void;
}

// ============================================
// CONFIG
// ============================================

const variantConfig: Record<ToastVariant, {
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  iconColor: string;
}> = {
  success: {
    icon: <CheckCircle className="w-5 h-5" />,
    bgColor: 'bg-green-900/30',
    borderColor: 'border-green-700/50',
    iconColor: 'text-green-400',
  },
  error: {
    icon: <AlertCircle className="w-5 h-5" />,
    bgColor: 'bg-red-900/30',
    borderColor: 'border-red-700/50',
    iconColor: 'text-red-400',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    bgColor: 'bg-amber-900/30',
    borderColor: 'border-amber-700/50',
    iconColor: 'text-amber-400',
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    bgColor: 'bg-blue-900/30',
    borderColor: 'border-blue-700/50',
    iconColor: 'text-blue-400',
  },
  default: {
    icon: <Info className="w-5 h-5" />,
    bgColor: 'bg-gray-800/50',
    borderColor: 'border-gray-700/50',
    iconColor: 'text-gray-400',
  },
};

const positionStyles: Record<ToastPosition, string> = {
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
};

// ============================================
// SINGLE TOAST
// ============================================

export function Toast({
  id,
  variant = 'default',
  title,
  message,
  action,
  duration = 5000,
  onClose,
}: ToastProps) {
  const config = variantConfig[variant];

  // Auto-dismiss
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`
        w-full max-w-sm p-4 rounded-xl border backdrop-blur-xl shadow-2xl
        ${config.bgColor} ${config.borderColor}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Title */}
          <h4 className="font-semibold text-white">
            {title}
          </h4>

          {/* Message */}
          {message && (
            <p className="text-sm text-gray-300">
              {message}
            </p>
          )}

          {/* Action */}
          {action && (
            <div className="pt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="
            flex-shrink-0 p-1 rounded-lg
            text-gray-400 hover:text-white
            hover:bg-gray-800/50
            transition-colors duration-150
          "
          aria-label="Close toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={`mt-3 h-1 rounded-full origin-left ${config.iconColor}`}
          style={{ backgroundColor: 'currentColor', opacity: 0.3 }}
        />
      )}
    </motion.div>
  );
}

// ============================================
// TOAST CONTAINER
// ============================================

export function ToastContainer({
  toasts,
  position = 'top-right',
  onDismiss,
}: ToastContainerProps) {
  return (
    <div className={`fixed ${positionStyles[position]} z-[10000] space-y-3 pointer-events-none`}>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={() => onDismiss(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// TOAST MANAGER HOOK
// ============================================

export interface ToastManagerReturn {
  toasts: ToastProps[];
  showToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
  ToastContainer: React.ComponentType<{ position?: ToastPosition }>;
}

let toastIdCounter = 0;

export function useToast(): ToastManagerReturn {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  function showToast(toast: Omit<ToastProps, 'id' | 'onClose'>): string {
    const id = `toast-${++toastIdCounter}`;
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: () => dismissToast(id),
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

  function clearToasts() {
    setToasts([]);
  }

  function Container({ position = 'top-right' }: { position?: ToastPosition }) {
    return <ToastContainer toasts={toasts} position={position} onDismiss={dismissToast} />;
  }

  return {
    toasts,
    showToast,
    dismissToast,
    clearToasts,
    ToastContainer: Container,
  };
}

// ============================================
// CONVENIENCE METHODS
// ============================================

export function createToastHelpers(manager: ToastManagerReturn) {
  return {
    success: (title: string, message?: string) =>
      manager.showToast({ variant: 'success', title, message }),
    error: (title: string, message?: string) =>
      manager.showToast({ variant: 'error', title, message }),
    warning: (title: string, message?: string) =>
      manager.showToast({ variant: 'warning', title, message }),
    info: (title: string, message?: string) =>
      manager.showToast({ variant: 'info', title, message }),
  };
}