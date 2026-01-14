/**
 * DEBOUNCE HOOK
 * Phase 9 - Performance & Optimizations
 * 
 * Hook pour debounce une valeur ou une fonction.
 * Utile pour search inputs, window resize, etc.
 * 
 * Usage:
 * const debouncedValue = useDebounce(value, 500);
 * const debouncedFn = useDebouncedCallback(fn, 500);
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Debounce a value
 * 
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds (default: 500)
 * @returns Debounced value
 * 
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 500);
 * 
 * useEffect(() => {
 *   // API call with debounced search
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timeout to update debounced value
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout on value change or unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounce a callback function
 * 
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds (default: 500)
 * @returns Debounced callback
 * 
 * @example
 * const handleSearch = useDebouncedCallback((query: string) => {
 *   fetchResults(query);
 * }, 500);
 * 
 * <input onChange={(e) => handleSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

/**
 * Debounce with immediate execution option
 * 
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @param immediate - Execute immediately on first call (default: false)
 * 
 * @example
 * const handleClick = useDebouncedCallback(
 *   () => console.log('Clicked'),
 *   500,
 *   true // Execute immediately on first click
 * );
 */
export function useDebouncedCallbackImmediate<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const callNow = immediate && !timeoutRef.current;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = undefined;
        if (!immediate) {
          callbackRef.current(...args);
        }
      }, delay);

      if (callNow) {
        callbackRef.current(...args);
      }
    },
    [delay, immediate]
  );
}
