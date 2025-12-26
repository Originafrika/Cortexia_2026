/**
 * COCONUT V14 - UI/UX HELPERS
 * Reusable patterns for all fixes
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

// ============================================
// ERROR DISPLAY COMPONENT
// ============================================

interface ErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-red-500 mb-1">Error</h3>
            <p className="text-sm text-red-400">{error}</p>
          </div>
          <div className="flex gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-red-500 hover:text-red-400 transition-colors"
                aria-label="Retry"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-red-500 hover:text-red-400 transition-colors"
                aria-label="Dismiss error"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// OFFLINE BANNER
// ============================================

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white p-3 text-center shadow-lg"
    >
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm">
          You're offline. Some features may not work.
        </span>
      </div>
    </motion.div>
  );
}

// ============================================
// COPY TO CLIPBOARD BUTTON
// ============================================

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = 'Copy', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`text-xs text-[var(--coconut-husk)] hover:text-[var(--coconut-shell)] transition-colors ${className}`}
      aria-label={copied ? 'Copied!' : label}
    >
      {copied ? '✓ Copied!' : label}
    </button>
  );
}

// ============================================
// KEYBOARD SHORTCUT DISPLAY
// ============================================

interface KeyboardShortcutProps {
  keys: string[];
  description: string;
}

export function KeyboardShortcut({ keys, description }: KeyboardShortcutProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-[var(--coconut-husk)]">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="px-2 py-1 text-xs bg-white/50 backdrop-blur-xl border border-white/40 rounded shadow-sm"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

// ============================================
// UNDO/REDO HOOK
// ============================================

interface UseUndoRedoOptions<T> {
  maxHistory?: number;
}

export function useUndoRedo<T>(initialValue: T, options: UseUndoRedoOptions<T> = {}) {
  const { maxHistory = 50 } = options;
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [index, setIndex] = useState(0);

  const value = history[index];

  const setValue = (newValue: T) => {
    const newHistory = history.slice(0, index + 1);
    newHistory.push(newValue);
    
    // Limit history size
    if (newHistory.length > maxHistory) {
      newHistory.shift();
    } else {
      setIndex(index + 1);
    }
    
    setHistory(newHistory);
  };

  const undo = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const redo = () => {
    if (index < history.length - 1) {
      setIndex(index + 1);
    }
  };

  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, history]);

  return {
    value,
    setValue,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
    index
  };
}

// ============================================
// PROGRESS WITH PERCENTAGE
// ============================================

interface ProgressWithTextProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
}

export function ProgressWithText({ 
  value, 
  label = 'Progress', 
  showPercentage = true 
}: ProgressWithTextProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--coconut-husk)]">{label}</span>
        {showPercentage && (
          <span className="text-[var(--coconut-shell)]">
            {Math.round(value)}%
          </span>
        )}
      </div>
      <div className="relative h-2 bg-white/30 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-full"
        />
      </div>
    </div>
  );
}

// ============================================
// AUTO-SAVE INDICATOR
// ============================================

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  error?: string | null;
}

export function AutoSaveIndicator({ isSaving, lastSaved, error }: AutoSaveIndicatorProps) {
  const getStatus = () => {
    if (error) return { text: 'Failed to save', color: 'text-red-500' };
    if (isSaving) return { text: 'Saving...', color: 'text-amber-500' };
    if (lastSaved) {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
      if (seconds < 60) return { text: 'Saved just now', color: 'text-green-500' };
      return { text: `Saved ${seconds}s ago`, color: 'text-green-500' };
    }
    return { text: 'Not saved', color: 'text-gray-500' };
  };

  const status = getStatus();

  return (
    <div className={`flex items-center gap-2 text-xs ${status.color}`}>
      {isSaving && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"
        />
      )}
      <span>{status.text}</span>
    </div>
  );
}

// ============================================
// FOCUS TRAP (for modals)
// ============================================

export function useFocusTrap(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element on mount
    firstElement?.focus();

    element.addEventListener('keydown', handleKeyDown as any);
    return () => element.removeEventListener('keydown', handleKeyDown as any);
  }, [ref]);
}

// ============================================
// ONLINE/OFFLINE CACHE HOOK
// ============================================

interface UseCachedDataOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  cacheDuration?: number; // milliseconds
}

export function useCachedData<T>({ key, fetcher, cacheDuration = 5 * 60 * 1000 }: UseCachedDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline] = useState(navigator.onLine);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check cache first
        const cached = localStorage.getItem(key);
        const cachedTime = localStorage.getItem(`${key}_time`);

        if (cached && cachedTime) {
          const age = Date.now() - parseInt(cachedTime);
          if (age < cacheDuration || !isOnline) {
            setData(JSON.parse(cached));
            setIsLoading(false);
            if (!isOnline) return; // Use cache if offline
          }
        }

        // Fetch fresh data if online
        if (isOnline) {
          const freshData = await fetcher();
          setData(freshData);
          localStorage.setItem(key, JSON.stringify(freshData));
          localStorage.setItem(`${key}_time`, Date.now().toString());
        } else if (!cached) {
          throw new Error('No cached data available offline');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key, isOnline]);

  return { data, isLoading, error, isOnline };
}
