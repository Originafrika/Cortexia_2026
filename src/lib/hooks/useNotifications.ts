/**
 * COCONUT V14 - PHASE 4 JOUR 4
 * Unified Notifications Hook
 * 
 * Hook centralisé pour tous types de notifications
 * Toast + Alert + Confirm + Sounds
 */

import { useState, useCallback } from 'react';
import { playNotificationSound } from '../utils/notification-sounds';

// ============================================
// TYPES
// ============================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  title: string;
  message?: string;
  duration?: number;
  sound?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ConfirmOptions {
  title: string;
  message: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  confirmText?: string;
  cancelText?: string;
  sound?: boolean;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: number;
}

// ============================================
// HOOK
// ============================================

let notificationId = 0;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================
  
  const showNotification = useCallback((type: NotificationType, options: NotificationOptions) => {
    const id = `notification-${++notificationId}`;
    
    const notification: Notification = {
      id,
      type,
      title: options.title,
      message: options.message,
      duration: options.duration ?? 5000,
      action: options.action,
      timestamp: Date.now(),
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Jouer un son si demandé
    if (options.sound !== false) {
      playNotificationSound(type);
    }
    
    // Auto-dismiss
    if (notification.duration > 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, notification.duration);
    }
    
    return id;
  }, []);
  
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // ============================================
  // CONVENIENCE METHODS
  // ============================================
  
  const success = useCallback((title: string, message?: string, options?: Partial<NotificationOptions>) => {
    return showNotification('success', { title, message, ...options });
  }, [showNotification]);
  
  const error = useCallback((title: string, message?: string, options?: Partial<NotificationOptions>) => {
    return showNotification('error', { title, message, ...options });
  }, [showNotification]);
  
  const warning = useCallback((title: string, message?: string, options?: Partial<NotificationOptions>) => {
    return showNotification('warning', { title, message, ...options });
  }, [showNotification]);
  
  const info = useCallback((title: string, message?: string, options?: Partial<NotificationOptions>) => {
    return showNotification('info', { title, message, ...options });
  }, [showNotification]);
  
  // ============================================
  // CONFIRM DIALOG
  // ============================================
  
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: null,
    resolve: null,
  });
  
  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve,
      });
      
      // Jouer un son si demandé
      if (options.sound !== false) {
        playNotificationSound('info');
      }
    });
  }, []);
  
  const handleConfirmClose = useCallback((confirmed: boolean) => {
    if (confirmState.resolve) {
      confirmState.resolve(confirmed);
    }
    
    // Jouer un son de feedback
    if (confirmed) {
      playNotificationSound('success');
    }
    
    setConfirmState({
      isOpen: false,
      options: null,
      resolve: null,
    });
  }, [confirmState.resolve]);
  
  // ============================================
  // QUICK ACTIONS
  // ============================================
  
  const quickSuccess = useCallback((title: string) => {
    success(title, undefined, { duration: 3000 });
  }, [success]);
  
  const quickError = useCallback((title: string) => {
    error(title, undefined, { duration: 5000 });
  }, [error]);
  
  const quickWarning = useCallback((title: string) => {
    warning(title, undefined, { duration: 4000 });
  }, [warning]);
  
  const quickInfo = useCallback((title: string) => {
    info(title, undefined, { duration: 3000 });
  }, [info]);
  
  // ============================================
  // RETURN
  // ============================================
  
  return {
    // Notifications state
    notifications,
    
    // Main methods
    showNotification,
    dismissNotification,
    clearAllNotifications,
    
    // Convenience methods
    success,
    error,
    warning,
    info,
    
    // Quick methods (shorter duration)
    quickSuccess,
    quickError,
    quickWarning,
    quickInfo,
    
    // Confirm dialog
    confirm,
    confirmState,
    handleConfirmClose,
  };
}

// ============================================
// TYPES EXPORTS
// ============================================

export type UseNotificationsReturn = ReturnType<typeof useNotifications>;
