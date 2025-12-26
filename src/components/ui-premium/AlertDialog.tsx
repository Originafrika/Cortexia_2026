/**
 * ALERT DIALOG - Coconut Design System
 * 
 * Features:
 * - Non-blocking alerts
 * - Success/Warning/Error/Info variants
 * - Auto-dismiss option
 * - Action buttons
 * - Icon support
 * - Stacked alerts (multiple at once)
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from './Button';

// ============================================
// TYPES
// ============================================

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface AlertDialogProps {
  id?: string;
  variant: AlertVariant;
  title: string;
  message: string;
  actions?: AlertAction[];
  onClose?: () => void;
  autoDismiss?: number; // milliseconds
  showCloseButton?: boolean;
}

export interface AlertDialogContainerProps {
  alerts: AlertDialogProps[];
  onDismiss: (id: string) => void;
}

// ============================================
// CONFIG
// ============================================

const variantConfig: Record<AlertVariant, {
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
}> = {
  success: {
    icon: <CheckCircle className="w-5 h-5" />,
    bgColor: 'bg-green-900/30',
    borderColor: 'border-green-700/50',
    iconColor: 'text-green-400',
    textColor: 'text-green-100',
  },
  error: {
    icon: <AlertCircle className="w-5 h-5" />,
    bgColor: 'bg-red-900/30',
    borderColor: 'border-red-700/50',
    iconColor: 'text-red-400',
    textColor: 'text-red-100',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    bgColor: 'bg-amber-900/30',
    borderColor: 'border-amber-700/50',
    iconColor: 'text-amber-400',
    textColor: 'text-amber-100',
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    bgColor: 'bg-blue-900/30',
    borderColor: 'border-blue-700/50',
    iconColor: 'text-blue-400',
    textColor: 'text-blue-100',
  },
};

// ============================================
// SINGLE ALERT
// ============================================

export function AlertDialog({
  id = 'alert',
  variant,
  title,
  message,
  actions = [],
  onClose,
  autoDismiss,
  showCloseButton = true,
}: AlertDialogProps) {
  const config = variantConfig[variant];

  // Auto-dismiss
  useEffect(() => {
    if (autoDismiss && onClose) {
      const timer = setTimeout(onClose, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`
        w-full max-w-md p-4 rounded-xl border
        backdrop-blur-xl shadow-2xl
        ${config.bgColor} ${config.borderColor}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title */}
          <h4 className={`font-semibold ${config.textColor}`}>
            {title}
          </h4>

          {/* Message */}
          <p className="text-sm text-gray-300">
            {message}
          </p>

          {/* Actions */}
          {actions.length > 0 && (
            <div className="flex items-center gap-2 pt-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant || 'ghost'}
                  onClick={() => {
                    action.onClick();
                    onClose?.();
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="
              flex-shrink-0 p-1 rounded-lg
              text-gray-400 hover:text-white
              hover:bg-gray-800/50
              transition-colors duration-150
            "
            aria-label="Close alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress bar for auto-dismiss */}
      {autoDismiss && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: autoDismiss / 1000, ease: 'linear' }}
          className={`mt-3 h-1 rounded-full origin-left ${config.iconColor}`}
          style={{ backgroundColor: 'currentColor', opacity: 0.3 }}
        />
      )}
    </motion.div>
  );
}

// ============================================
// ALERT CONTAINER (for stacking)
// ============================================

export function AlertDialogContainer({ alerts, onDismiss }: AlertDialogContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[10000] space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <div key={alert.id} className="pointer-events-auto">
            <AlertDialog
              {...alert}
              onClose={() => onDismiss(alert.id!)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// ALERT MANAGER HOOK
// ============================================

export interface AlertManagerReturn {
  alerts: AlertDialogProps[];
  showAlert: (alert: Omit<AlertDialogProps, 'id'>) => string;
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;
  AlertContainer: React.ComponentType;
}

let alertIdCounter = 0;

export function useAlertManager(): AlertManagerReturn {
  const [alerts, setAlerts] = React.useState<AlertDialogProps[]>([]);

  function showAlert(alert: Omit<AlertDialogProps, 'id'>): string {
    const id = `alert-${++alertIdCounter}`;
    const newAlert: AlertDialogProps = { ...alert, id };
    
    setAlerts((prev) => [...prev, newAlert]);
    
    return id;
  }

  function dismissAlert(id: string) {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }

  function clearAlerts() {
    setAlerts([]);
  }

  function AlertContainer() {
    return <AlertDialogContainer alerts={alerts} onDismiss={dismissAlert} />;
  }

  return {
    alerts,
    showAlert,
    dismissAlert,
    clearAlerts,
    AlertContainer,
  };
}

// Fix React import
import React from 'react';
