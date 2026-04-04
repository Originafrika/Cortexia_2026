/**
 * COCONUT V14 - PHASE 4 JOUR 4
 * Notification Provider
 * 
 * Provider global pour le système de notifications
 * Intègre Toast, Alert, Confirm avec animations et sons
 */

import React, { createContext, useContext } from 'react';
import { useNotifications, UseNotificationsReturn } from '../../lib/hooks/useNotifications';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 2A: Import sound
import { ToastContainer } from '../ui-premium/Toast';
import { ConfirmDialog } from '../ui-premium/ConfirmDialog';
import { AnimatePresence } from 'motion/react';
import { motion } from 'motion/react';
import { toastVariants } from '../../lib/animations/transitions';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

// ============================================
// CONTEXT
// ============================================

const NotificationContext = createContext<UseNotificationsReturn | null>(null);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
}

// ============================================
// PROVIDER
// ============================================

interface NotificationProviderProps {
  children: React.ReactNode;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export function NotificationProvider({ 
  children, 
  position = 'top-right' 
}: NotificationProviderProps) {
  const notifications = useNotifications();
  const soundContext = useSoundContext(); // 🔊 PHASE 2A: Get sound context
  
  return (
    <NotificationContext.Provider value={notifications}>
      {children}
      
      {/* Toast Notifications */}
      <NotificationToasts 
        notifications={notifications.notifications}
        onDismiss={notifications.dismissNotification}
        position={position}
      />
      
      {/* Confirm Dialog */}
      {notifications.confirmState.isOpen && notifications.confirmState.options && (
        <ConfirmDialog
          isOpen={notifications.confirmState.isOpen}
          onClose={() => notifications.handleConfirmClose(false)}
          onConfirm={() => notifications.handleConfirmClose(true)}
          title={notifications.confirmState.options.title}
          message={notifications.confirmState.options.message}
          variant={notifications.confirmState.options.variant}
          confirmText={notifications.confirmState.options.confirmText}
          cancelText={notifications.confirmState.options.cancelText}
        />
      )}
    </NotificationContext.Provider>
  );
}

// ============================================
// TOAST RENDERER
// ============================================

interface NotificationToastsProps {
  notifications: any[];
  onDismiss: (id: string) => void;
  position: string;
}

const positionStyles: Record<string, string> = {
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
};

const notificationStyles = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-[var(--coconut-palm)]/30',
    borderColor: 'border-[var(--coconut-palm)]/50',
    iconColor: 'text-[var(--coconut-palm)]',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-[var(--coconut-shell)]/30',
    borderColor: 'border-[var(--coconut-shell)]/50',
    iconColor: 'text-[var(--coconut-shell)]',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-[var(--coconut-husk)]/30',
    borderColor: 'border-[var(--coconut-husk)]/50',
    iconColor: 'text-[var(--coconut-husk)]',
  },
  info: {
    icon: Info,
    bgColor: 'bg-[var(--coconut-cream)]',
    borderColor: 'border-[var(--coconut-husk)]/50',
    iconColor: 'text-[var(--coconut-husk)]',
  },
};

function NotificationToasts({ notifications, onDismiss, position }: NotificationToastsProps) {
  // 🔊 PHASE 2A: Sound context
  const { playClick } = useSoundContext();
  
  return (
    <div className={`fixed ${positionStyles[position]} z-[10000] space-y-3 pointer-events-none`}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => {
          const config = notificationStyles[notification.type];
          const Icon = config.icon;
          
          return (
            <motion.div
              key={notification.id}
              variants={toastVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              className="pointer-events-auto"
            >
              <div className={`
                w-full max-w-sm p-4 rounded-xl border backdrop-blur-xl shadow-2xl
                ${config.bgColor} ${config.borderColor}
              `}>
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 ${config.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-semibold text-white">
                      {notification.title}
                    </h4>
                    
                    {notification.message && (
                      <p className="text-sm text-gray-300">
                        {notification.message}
                      </p>
                    )}
                    
                    {notification.action && (
                      <button
                        onClick={() => {
                          playClick(); // 🔊 Sound feedback
                          notification.action.onClick();
                          onDismiss(notification.id);
                        }}
                        className="text-sm font-medium text-white underline hover:no-underline mt-2"
                      >
                        {notification.action.label}
                      </button>
                    )}
                  </div>
                  
                  {/* Close Button */}
                  <button
                    onClick={() => {
                      playClick(); // 🔊 Sound feedback
                      onDismiss(notification.id);
                    }}
                    className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Progress bar */}
                {notification.duration > 0 && (
                  <motion.div
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: notification.duration / 1000, ease: 'linear' }}
                    className={`mt-3 h-1 rounded-full origin-left ${config.iconColor}`}
                    style={{ backgroundColor: 'currentColor', opacity: 0.3 }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// CONVENIENCE HOOK
// ============================================

/**
 * Hook simplifié pour utiliser les notifications
 * @example
 * const { success, error, confirm } = useNotify();
 * 
 * success('Operation completed!');
 * error('Something went wrong');
 * 
 * const confirmed = await confirm({
 *   title: 'Delete item?',
 *   message: 'This action cannot be undone',
 *   variant: 'danger'
 * });
 */
export function useNotify() {
  const context = useNotificationContext();
  
  return {
    success: context.success,
    error: context.error,
    warning: context.warning,
    info: context.info,
    quickSuccess: context.quickSuccess,
    quickError: context.quickError,
    quickWarning: context.quickWarning,
    quickInfo: context.quickInfo,
    confirm: context.confirm,
    dismiss: context.dismissNotification,
    clearAll: context.clearAllNotifications,
  };
}

export default NotificationProvider;