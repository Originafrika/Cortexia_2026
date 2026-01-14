/**
 * RETRY LOGIC - P2-17
 * Exponential backoff retry for fetch requests
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  onRetry: () => {},
  shouldRetry: (error: Error) => {
    // Retry on network errors or 5xx server errors
    if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
      return true;
    }
    
    // Don't retry on client errors (4xx)
    if (error.message.includes('400') || error.message.includes('401') || error.message.includes('403')) {
      return false;
    }
    
    // Retry on server errors (5xx)
    if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
      return true;
    }
    
    return true; // Default: retry
  }
};

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1);
  return Math.min(delay, options.maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      console.log(`🔄 [Retry] Attempt ${attempt}/${opts.maxAttempts}`);
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry
      if (!opts.shouldRetry(lastError)) {
        console.log(`❌ [Retry] Error not retryable, failing immediately`);
        throw lastError;
      }

      // Check if we've exhausted attempts
      if (attempt >= opts.maxAttempts) {
        console.log(`❌ [Retry] Max attempts (${opts.maxAttempts}) reached`);
        throw lastError;
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, opts);
      console.log(`⏳ [Retry] Waiting ${delay}ms before attempt ${attempt + 1}...`);
      
      opts.onRetry(attempt, lastError);
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Retry a fetch request with exponential backoff
 */
export async function retryFetch(
  url: string,
  init?: RequestInit,
  options: RetryOptions = {}
): Promise<Response> {
  return retry(async () => {
    console.log(`📡 [RetryFetch] Fetching: ${url}`);
    
    const response = await fetch(url, init);

    // Check if response is ok
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      console.error(`❌ [RetryFetch] ${error.message}`);
      throw error;
    }

    console.log(`✅ [RetryFetch] Success: ${url}`);
    return response;
  }, options);
}

/**
 * Retry a fetch request and parse JSON
 */
export async function retryFetchJSON<T = any>(
  url: string,
  init?: RequestInit,
  options: RetryOptions = {}
): Promise<T> {
  const response = await retryFetch(url, init, options);
  return response.json();
}

/**
 * Usage examples:
 * 
 * // Basic retry
 * const data = await retry(() => fetchData(), { maxAttempts: 5 });
 * 
 * // Retry with custom options
 * const result = await retry(
 *   () => api.create({ data }),
 *   {
 *     maxAttempts: 3,
 *     initialDelay: 2000,
 *     onRetry: (attempt, error) => {
 *       toast.warning(`Retry ${attempt}/3`, { description: error.message });
 *     }
 *   }
 * );
 * 
 * // Retry fetch
 * const response = await retryFetch('/api/data', { method: 'POST' });
 * 
 * // Retry fetch with JSON parsing
 * const data = await retryFetchJSON<MyType>('/api/data', {
 *   method: 'POST',
 *   body: JSON.stringify({ foo: 'bar' })
 * });
 */
