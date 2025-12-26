import { useState, useCallback, useRef } from 'react';

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface UseHistoryReturn<T> {
  state: T;
  setState: (newState: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

const MAX_HISTORY_SIZE = 50;

export function useHistory<T>(initialState: T): UseHistoryReturn<T> {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const isUndoingRef = useRef(false);
  const isRedoingRef = useRef(false);

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    // Don't record history during undo/redo
    if (isUndoingRef.current || isRedoingRef.current) {
      return;
    }

    setHistory(prev => {
      const nextState = typeof newState === 'function'
        ? (newState as (prev: T) => T)(prev.present)
        : newState;

      // Don't add to history if state hasn't changed
      if (JSON.stringify(nextState) === JSON.stringify(prev.present)) {
        return prev;
      }

      // Limit history size
      const newPast = [...prev.past, prev.present];
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift();
      }

      return {
        past: newPast,
        present: nextState,
        future: [], // Clear future when making a new change
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;

      isUndoingRef.current = true;

      const newPresent = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);

      setTimeout(() => {
        isUndoingRef.current = false;
      }, 0);

      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;

      isRedoingRef.current = true;

      const newPresent = prev.future[0];
      const newFuture = prev.future.slice(1);

      setTimeout(() => {
        isRedoingRef.current = false;
      }, 0);

      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  const clear = useCallback(() => {
    setHistory(prev => ({
      past: [],
      present: prev.present,
      future: [],
    }));
  }, []);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    clear,
  };
}
