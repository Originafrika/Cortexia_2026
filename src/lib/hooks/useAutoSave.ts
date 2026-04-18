/**
 * useAutoSave Hook - P0-06
 * Auto-saves data every 30 seconds + localStorage backup
 */

import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveOptions<T> {
  data: T;
  isDirty: boolean;
  onSave: (data: T) => Promise<void>;
  interval?: number; // milliseconds
  localStorageKey?: string;
  onError?: (error: Error) => void;
}

export function useAutoSave<T>({
  data,
  isDirty,
  onSave,
  interval = 30000, // 30 seconds
  localStorageKey,
  onError
}: UseAutoSaveOptions<T>) {
  const lastSaveRef = useRef<number>(Date.now());
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save to localStorage immediately when data changes
  useEffect(() => {
    if (localStorageKey && data) {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(data));
        console.log(`💾 [AutoSave] Backed up to localStorage: ${localStorageKey}`);
      } catch (err) {
        console.error('❌ [AutoSave] localStorage backup failed:', err);
      }
    }
  }, [data, localStorageKey]);

  // Auto-save to backend periodically if dirty
  useEffect(() => {
    if (!isDirty) return;

    const performAutoSave = async () => {
      try {
        console.log(`⏰ [AutoSave] Saving to backend...`);
        await onSave(data);
        lastSaveRef.current = Date.now();
        toast.success('✅ Auto-saved', {
          duration: 2000,
          position: 'bottom-left'
        });
      } catch (error) {
        console.error('❌ [AutoSave] Backend save failed:', error);
        if (onError) {
          onError(error as Error);
        }
        toast.error('❌ Auto-save failed', {
          description: 'Your work is backed up locally',
          duration: 3000
        });
      }
    };

    // Set up auto-save timer
    autoSaveTimerRef.current = setInterval(performAutoSave, interval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [data, isDirty, interval, onSave, onError]);

  // Warn before unload if unsaved changes
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  // Load from localStorage on mount
  const loadFromLocalStorage = useCallback(() => {
    if (!localStorageKey) return null;

    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved) {
        console.log(`📂 [AutoSave] Restored from localStorage: ${localStorageKey}`);
        return JSON.parse(saved) as T;
      }
    } catch (err) {
      console.error('❌ [AutoSave] localStorage restore failed:', err);
    }
    return null;
  }, [localStorageKey]);

  // Clear localStorage backup
  const clearLocalStorage = useCallback(() => {
    if (!localStorageKey) return;

    try {
      localStorage.removeItem(localStorageKey);
      console.log(`🗑️ [AutoSave] Cleared localStorage: ${localStorageKey}`);
    } catch (err) {
      console.error('❌ [AutoSave] localStorage clear failed:', err);
    }
  }, [localStorageKey]);

  return {
    lastSaved: lastSaveRef.current,
    loadFromLocalStorage,
    clearLocalStorage
  };
}
