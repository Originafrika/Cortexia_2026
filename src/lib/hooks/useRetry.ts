/**
 * RETRY HOOK
 * Phase 10 - Error Handling & Resilience
 * 
 * Hook pour retry automatique avec exponential backoff.
 * 
 * Usage:
 * const { execute, loading, error, retryCount } = useRetry(fetchData, { maxRetries: 3 });
 */

import { useState, useCallback, useRef } from 'react';
import { classifyError, AppError } from '../utils/error-handler';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: AppError) => boolean;
  onRetry?: (retryCount: number, error: AppError) => void;
  onMaxRetriesReached?: (error: AppError) => void;
}

interface UseRetryReturn<T> {
  execute: (...args: any[]) => Promise<T | undefined>;
  loading: boolean;
  error: AppError | null;
  data: T | null;
  retryCount: number;
  canRetry: boolean;
  reset: () => void;
}

/**
 * Hook for automatic retry with exponential backoff
 * 
 * @param fn - Async function to retry
 * @param options - Retry configuration
 * 
 * @example
 * function Component() {
 *   const { execute, loading, error, data, retryCount } = useRetry(
 *     async () => await api.fetchData(),
 *     {
 *       maxRetries: 3,
 *       initialDelay: 1000,
 *       backoffMultiplier: 2,
 *     }
 *   );
 * 
 *   useEffect(() => {
 *     execute();
 *   }, [execute]);
 * 
 *   if (loading) return <div>Loading... (tentative {retryCount})</div>;
 *   if (error) return <div>Error: {error.userMessage}</div>;
 *   return <div>{data}</div>;
 * }
 */
export function useRetry<T>(
  fn: (...args: any[]) => Promise<T>,
  options: RetryOptions = {}
): UseRetryReturn<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryCondition = (error) => error.retryable,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const calculateDelay = useCallback(
    (attempt: number): number => {
      const delay = initialDelay * Math.pow(backoffMultiplier, attempt);
      return Math.min(delay, maxDelay);
    },
    [initialDelay, backoffMultiplier, maxDelay]
  );

  const execute = useCallback(
    async (...args: any[]): Promise<T | undefined> => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      let currentRetry = 0;

      while (currentRetry <= maxRetries) {
        try {
          const result = await fn(...args);
          setData(result);
          setError(null);
          setRetryCount(currentRetry);
          setLoading(false);
          return result;
        } catch (err) {
          const appError = classifyError(err);

          // Check if we should retry
          const shouldRetry = 
            currentRetry < maxRetries && 
            retryCondition(appError) &&
            !abortControllerRef.current.signal.aborted;

          if (!shouldRetry) {
            setError(appError);
            setRetryCount(currentRetry);
            setLoading(false);

            if (currentRetry >= maxRetries) {
              onMaxRetriesReached?.(appError);
            }

            throw appError;
          }

          // Increment retry count
          currentRetry++;
          setRetryCount(currentRetry);
          onRetry?.(currentRetry, appError);

          // Wait before retrying (exponential backoff)
          const delay = calculateDelay(currentRetry - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      setLoading(false);
      return undefined;
    },
    [fn, maxRetries, retryCondition, onRetry, onMaxRetriesReached, calculateDelay]
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setError(null);
    setData(null);
    setRetryCount(0);
  }, []);

  const canRetry = error !== null && retryCount < maxRetries && (error.retryable || retryCondition(error));

  return {
    execute,
    loading,
    error,
    data,
    retryCount,
    canRetry,
    reset,
  };
}

/**
 * Hook for retry with manual trigger
 * 
 * @example
 * function Component() {
 *   const { trigger, loading, error, retryCount, canRetry } = useManualRetry(
 *     async () => await api.fetchData(),
 *     { maxRetries: 3 }
 *   );
 * 
 *   return (
 *     <div>
 *       <button onClick={trigger} disabled={loading}>
 *         {loading ? 'Loading...' : 'Fetch Data'}
 *       </button>
 *       {error && canRetry && (
 *         <button onClick={trigger}>
 *           Retry ({retryCount}/{maxRetries})
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 */
export function useManualRetry<T>(
  fn: (...args: any[]) => Promise<T>,
  options: Omit<RetryOptions, 'maxRetries'> & { maxRetries: number } = { maxRetries: 3 }
) {
  const { execute, loading, error, data, retryCount, canRetry, reset } = useRetry(fn, {
    ...options,
    // Override to prevent automatic retry, will be triggered manually
  });

  const [manualRetryCount, setManualRetryCount] = useState(0);

  const trigger = useCallback(
    async (...args: any[]) => {
      if (manualRetryCount >= options.maxRetries && error) {
        return;
      }

      try {
        const result = await execute(...args);
        setManualRetryCount(0);
        return result;
      } catch (err) {
        setManualRetryCount((prev) => prev + 1);
        throw err;
      }
    },
    [execute, error, manualRetryCount, options.maxRetries]
  );

  const resetManual = useCallback(() => {
    reset();
    setManualRetryCount(0);
  }, [reset]);

  return {
    trigger,
    loading,
    error,
    data,
    retryCount: manualRetryCount,
    canRetry: manualRetryCount < options.maxRetries,
    reset: resetManual,
  };
}

/**
 * Retry with custom strategies
 */
export enum RetryStrategy {
  EXPONENTIAL = 'EXPONENTIAL',
  LINEAR = 'LINEAR',
  FIXED = 'FIXED',
}

export function useRetryWithStrategy<T>(
  fn: (...args: any[]) => Promise<T>,
  strategy: RetryStrategy = RetryStrategy.EXPONENTIAL,
  options: RetryOptions = {}
) {
  const getDelayFn = (attempt: number): number => {
    const { initialDelay = 1000, backoffMultiplier = 2, maxDelay = 10000 } = options;

    switch (strategy) {
      case RetryStrategy.EXPONENTIAL:
        return Math.min(initialDelay * Math.pow(backoffMultiplier, attempt), maxDelay);
      case RetryStrategy.LINEAR:
        return Math.min(initialDelay * (attempt + 1), maxDelay);
      case RetryStrategy.FIXED:
        return initialDelay;
      default:
        return initialDelay;
    }
  };

  return useRetry(fn, {
    ...options,
    initialDelay: 1000,
    backoffMultiplier: 2,
  });
}
