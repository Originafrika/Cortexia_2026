/**
 * UNSAVED CHANGES WARNING - P2-10
 * Hook to warn before closing modal/page with unsaved changes
 */

import { useEffect, useState, useCallback } from 'react';

interface UseUnsavedChangesWarningOptions {
  when: boolean; // Enable warning when true (e.g., isDirty)
  message?: string;
  onBeforeUnload?: () => void;
}

export function useUnsavedChangesWarning({
  when,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  onBeforeUnload
}: UseUnsavedChangesWarningOptions) {
  const [showWarning, setShowWarning] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Browser beforeunload event
  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message; // Required for Chrome
      
      if (onBeforeUnload) {
        onBeforeUnload();
      }

      return message; // Required for some browsers
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [when, message, onBeforeUnload]);

  // Request confirmation before action
  const confirmNavigation = useCallback((action: () => void): boolean => {
    if (!when) {
      action();
      return true;
    }

    setPendingAction(() => action);
    setShowWarning(true);
    return false;
  }, [when]);

  // User confirms navigation
  const handleConfirm = useCallback(() => {
    if (pendingAction) {
      pendingAction();
    }
    setShowWarning(false);
    setPendingAction(null);
  }, [pendingAction]);

  // User cancels navigation
  const handleCancel = useCallback(() => {
    setShowWarning(false);
    setPendingAction(null);
  }, []);

  return {
    showWarning,
    confirmNavigation,
    handleConfirm,
    handleCancel
  };
}

/**
 * Usage example:
 * 
 * function MyModal({ isOpen, onClose }) {
 *   const [isDirty, setIsDirty] = useState(false);
 *   
 *   const { showWarning, confirmNavigation, handleConfirm, handleCancel } = useUnsavedChangesWarning({
 *     when: isDirty,
 *     message: 'You have unsaved changes in this CocoBoard.'
 *   });
 * 
 *   const handleModalClose = () => {
 *     confirmNavigation(() => {
 *       onClose();
 *     });
 *   };
 * 
 *   return (
 *     <>
 *       <Modal isOpen={isOpen} onClose={handleModalClose}>
 *         ...
 *       </Modal>
 * 
 *       <ConfirmDialog
 *         isOpen={showWarning}
 *         title="Unsaved Changes"
 *         message="You have unsaved changes. Are you sure you want to close?"
 *         onConfirm={handleConfirm}
 *         onCancel={handleCancel}
 *       />
 *     </>
 *   );
 * }
 */
