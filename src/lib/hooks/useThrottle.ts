/**
 * THROTTLE HOOK
 * Phase 9 - Performance & Optimizations
 * 
 * Hook pour throttle une valeur ou une fonction.
 * Utile pour scroll events, mouse move, animations, etc.
 * 
 * Différence avec debounce:
 * - Debounce: Attend que l'utilisateur arrête d'agir
 * - Throttle: Limite la fréquence d'exécution (ex: max 1x par 100ms)
 * 
 * Usage:
 * const throttledValue = useThrottle(value, 100);
 * const throttledFn = useThrottledCallback(fn, 100);
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Throttle a value
 * 
 * @param value - Value to throttle
 * @param limit - Time limit in milliseconds (default: 100)
 * @returns Throttled value
 * 
 * @example
 * const [scrollY, setScrollY] = useState(0);
 * const throttledScrollY = useThrottle(scrollY, 100);
 * 
 * useEffect(() => {
 *   const handleScroll = () => setScrollY(window.scrollY);
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, []);
 */
export function useThrottle<T>(value: T, limit: number = 100): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * Throttle a callback function
 * 
 * @param callback - Function to throttle
 * @param limit - Time limit in milliseconds (default: 100)
 * @returns Throttled callback
 * 
 * @example
 * const handleScroll = useThrottledCallback(() => {
 *   console.log('Scrolled!');
 * }, 100);
 * 
 * useEffect(() => {
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, [handleScroll]);
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number = 100
): (...args: Parameters<T>) => void {
  const lastRan = useRef(Date.now());
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
      const now = Date.now();
      const timeSinceLastRan = now - lastRan.current;

      if (timeSinceLastRan >= limit) {
        // Execute immediately if enough time has passed
        callbackRef.current(...args);
        lastRan.current = now;
      } else {
        // Schedule execution
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
          lastRan.current = Date.now();
        }, limit - timeSinceLastRan);
      }
    },
    [limit]
  );
}

/**
 * Throttle with leading and trailing edge control
 * 
 * @param callback - Function to throttle
 * @param limit - Time limit in milliseconds
 * @param options - Control leading/trailing execution
 * 
 * @example
 * const handleClick = useThrottledCallbackAdvanced(
 *   () => console.log('Clicked'),
 *   1000,
 *   { leading: true, trailing: false }
 * );
 */
export function useThrottledCallbackAdvanced<T extends (...args: any[]) => any>(
  callback: T,
  limit: number = 100,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => void {
  const { leading = true, trailing = true } = options;
  
  const lastRan = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastArgs = useRef<Parameters<T>>();
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
      const now = Date.now();
      const timeSinceLastRan = now - lastRan.current;

      lastArgs.current = args;

      if (timeSinceLastRan >= limit) {
        if (leading) {
          callbackRef.current(...args);
        }
        lastRan.current = now;

        if (trailing) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            if (lastArgs.current) {
              callbackRef.current(...lastArgs.current);
            }
          }, limit);
        }
      } else {
        if (trailing) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            if (lastArgs.current) {
              callbackRef.current(...lastArgs.current);
              lastRan.current = Date.now();
            }
          }, limit - timeSinceLastRan);
        }
      }
    },
    [limit, leading, trailing]
  );
}
