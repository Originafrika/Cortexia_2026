/**
 * UI PROVIDER - Coconut Design System
 * 
 * Centralized provider for all UI managers:
 * - Toast notifications
 * - Confirm dialogs
 * - Alert dialogs
 * - Loading states
 * 
 * Usage:
 * Wrap your app with <UIProvider> and use hooks anywhere:
 * - useUI() to access all managers
 * - useToastContext() for toasts
 * - useConfirmContext() for confirmations
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useToast, ToastManagerReturn, ToastPosition } from './Toast';
import { useConfirmDialog, UseConfirmDialogReturn } from './ConfirmDialog';
import { useAlertManager, AlertManagerReturn } from './AlertDialog';

// ============================================
// TYPES
// ============================================

export interface UIContextValue {
  toast: ToastManagerReturn;
  confirm: UseConfirmDialogReturn;
  alert: AlertManagerReturn;
}

export interface UIProviderProps {
  children: ReactNode;
  toastPosition?: ToastPosition;
}

// ============================================
// CONTEXT
// ============================================

const UIContext = createContext<UIContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

export function UIProvider({ children, toastPosition = 'top-right' }: UIProviderProps) {
  const toast = useToast();
  const confirm = useConfirmDialog();
  const alert = useAlertManager();

  const value: UIContextValue = {
    toast,
    confirm,
    alert,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
      
      {/* Render all UI containers */}
      <toast.ToastContainer position={toastPosition} />
      <confirm.ConfirmDialog />
      <alert.AlertContainer />
    </UIContext.Provider>
  );
}

// ============================================
// HOOKS
// ============================================

export function useUI(): UIContextValue {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
}

export function useToastContext(): ToastManagerReturn {
  const { toast } = useUI();
  return toast;
}

export function useConfirmContext(): UseConfirmDialogReturn {
  const { confirm } = useUI();
  return confirm;
}

export function useAlertContext(): AlertManagerReturn {
  const { alert } = useUI();
  return alert;
}

// ============================================
// CONVENIENCE HOOKS
// ============================================

export function useNotifications() {
  const toast = useToastContext();

  return {
    success: (title: string, message?: string) =>
      toast.showToast({ variant: 'success', title, message }),
    
    error: (title: string, message?: string) =>
      toast.showToast({ variant: 'error', title, message }),
    
    warning: (title: string, message?: string) =>
      toast.showToast({ variant: 'warning', title, message }),
    
    info: (title: string, message?: string) =>
      toast.showToast({ variant: 'info', title, message }),
  };
}

export function useConfirm() {
  const { open } = useConfirmContext();

  return {
    danger: (title: string, message: string, onConfirm: () => void | Promise<void>) =>
      open({ variant: 'danger', title, message, onConfirm }),
    
    warning: (title: string, message: string, onConfirm: () => void | Promise<void>) =>
      open({ variant: 'warning', title, message, onConfirm }),
    
    info: (title: string, message: string, onConfirm: () => void | Promise<void>) =>
      open({ variant: 'info', title, message, onConfirm }),
  };
}
