/**
 * ERROR HANDLER HOOK
 * Phase 10 - Error Handling & Resilience
 * 
 * Hook pour gérer les erreurs de manière cohérente.
 * 
 * Usage:
 * const { error, handleError, clearError, retry } = useErrorHandler();
 */

import { useState, useCallback } from 'react';
import { handleError as handleErrorUtil, AppError, classifyError } from '../utils/error-handler';

interface UseErrorHandlerOptions {
  onError?: (error: AppError) => void;
  logToConsole?: boolean;
  silent?: boolean;
}

interface UseErrorHandlerReturn {
  error: AppError | null;
  hasError: boolean;
  handleError: (error: unknown, context?: Record<string, any>) => AppError;
  clearError: () => void;
  retry: (fn: () => Promise<any>) => Promise<void>;
}

/**
 * Hook to handle errors consistently
 * 
 * @example
 * function Component() {
 *   const { error, handleError, clearError, retry } = useErrorHandler();
 * 
 *   const fetchData = async () => {
 *     try {
 *       const data = await api.get('/data');
 *     } catch (err) {
 *       handleError(err, { component: 'Component', action: 'fetchData' });
 *     }
 *   };
 * 
 *   if (error) {
 *     return <ErrorDisplay error={error} onRetry={() => retry(fetchData)} />;
 *   }
 * 
 *   return <div>Content</div>;
 * }
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const [error, setError] = useState<AppError | null>(null);

  const handleError = useCallback(
    (err: unknown, context?: Record<string, any>): AppError => {
      const appError = handleErrorUtil(err, {
        silent: options.silent,
        logToConsole: options.logToConsole,
        context,
      });

      setError(appError);
      options.onError?.(appError);

      return appError;
    },
    [options]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(
    async (fn: () => Promise<any>): Promise<void> => {
      clearError();
      try {
        await fn();
      } catch (err) {
        handleError(err, { action: 'retry' });
      }
    },
    [handleError, clearError]
  );

  return {
    error,
    hasError: error !== null,
    handleError,
    clearError,
    retry,
  };
}

/**
 * Hook to wrap async functions with error handling
 * 
 * @example
 * function Component() {
 *   const { execute, loading, error, data } = useAsyncError(async () => {
 *     return await api.fetchData();
 *   });
 * 
 *   useEffect(() => {
 *     execute();
 *   }, [execute]);
 * 
 *   if (loading) return <Loading />;
 *   if (error) return <Error error={error} onRetry={execute} />;
 *   return <div>{data}</div>;
 * }
 */
export function useAsyncError<T>(
  asyncFn: () => Promise<T>,
  options: UseErrorHandlerOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const { error, handleError, clearError } = useErrorHandler(options);

  const execute = useCallback(async () => {
    setLoading(true);
    clearError();

    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, handleError, clearError]);

  return {
    execute,
    loading,
    error,
    data,
    clearError,
  };
}

/**
 * Hook for form error handling
 * 
 * @example
 * function Form() {
 *   const { fieldErrors, setFieldError, clearFieldError, hasFieldErrors } = useFormErrors();
 * 
 *   const validate = () => {
 *     if (!email) setFieldError('email', 'Email requis');
 *     if (!password) setFieldError('password', 'Mot de passe requis');
 *   };
 * 
 *   return (
 *     <form>
 *       <input name="email" />
 *       {fieldErrors.email && <span>{fieldErrors.email}</span>}
 *     </form>
 *   );
 * }
 */
export function useFormErrors() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  return {
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasFieldErrors,
  };
}

/**
 * Hook to handle errors in event handlers
 * 
 * @example
 * function Component() {
 *   const handleClick = useErrorHandler((e) => {
 *     // This code is automatically wrapped in try/catch
 *     throw new Error('Something went wrong');
 *   });
 * 
 *   return <button onClick={handleClick}>Click me</button>;
 * }
 */
export function useSafeCallback<T extends (...args: any[]) => any>(
  callback: T,
  options: UseErrorHandlerOptions = {}
): T {
  const { handleError } = useErrorHandler(options);

  return useCallback(
    ((...args: Parameters<T>) => {
      try {
        const result = callback(...args);
        
        // Handle async functions
        if (result instanceof Promise) {
          return result.catch((err) => {
            handleError(err, { callback: callback.name });
            throw err;
          });
        }
        
        return result;
      } catch (err) {
        handleError(err, { callback: callback.name });
        throw err;
      }
    }) as T,
    [callback, handleError]
  );
}
