// Undo/Redo Hook - Time travel for your edits

import { useState, useCallback, useRef } from 'react';

export interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialState: T, maxHistory = 50) {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: []
  });
  
  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;
  
  const set = useCallback((newPresent: T) => {
    setState(currentState => {
      // Add current present to past
      const newPast = [...currentState.past, currentState.present];
      
      // Limit history size
      if (newPast.length > maxHistory) {
        newPast.shift();
      }
      
      return {
        past: newPast,
        present: newPresent,
        future: [] // Clear future when new action is performed
      };
    });
  }, [maxHistory]);
  
  const undo = useCallback(() => {
    setState(currentState => {
      if (currentState.past.length === 0) return currentState;
      
      const newPast = currentState.past.slice(0, -1);
      const newPresent = currentState.past[currentState.past.length - 1];
      const newFuture = [currentState.present, ...currentState.future];
      
      return {
        past: newPast,
        present: newPresent,
        future: newFuture
      };
    });
  }, []);
  
  const redo = useCallback(() => {
    setState(currentState => {
      if (currentState.future.length === 0) return currentState;
      
      const newPresent = currentState.future[0];
      const newFuture = currentState.future.slice(1);
      const newPast = [...currentState.past, currentState.present];
      
      return {
        past: newPast,
        present: newPresent,
        future: newFuture
      };
    });
  }, []);
  
  const reset = useCallback((newPresent: T) => {
    setState({
      past: [],
      present: newPresent,
      future: []
    });
  }, []);
  
  const clear = useCallback(() => {
    setState(currentState => ({
      past: [],
      present: currentState.present,
      future: []
    }));
  }, []);
  
  return {
    state: state.present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    clear,
    historySize: state.past.length
  };
}
