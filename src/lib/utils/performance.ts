/**
 * PERFORMANCE UTILITIES
 * Phase 9 - Performance & Optimizations
 * 
 * Collection d'utilitaires pour optimiser les performances.
 * 
 * Features:
 * - Memoization helpers
 * - Performance measurements
 * - Bundle size helpers
 * - Render optimization
 */

/**
 * Measure execution time of a function
 */
export function measurePerformance<T>(
  fn: () => T,
  label: string = 'Function'
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`[Performance] ${label} took ${(end - start).toFixed(2)}ms`);
  return result;
}

/**
 * Measure execution time of an async function
 */
export async function measurePerformanceAsync<T>(
  fn: () => Promise<T>,
  label: string = 'Async Function'
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`[Performance] ${label} took ${(end - start).toFixed(2)}ms`);
  return result;
}

/**
 * Deep equality check for memoization
 * More accurate than shallow comparison but slower
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
}

/**
 * Shallow equality check for memoization
 * Fast but only checks first level
 */
export function shallowEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (a[key] !== b[key]) return false;
  }
  
  return true;
}

/**
 * Create a memoized function with custom equality check
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  equalityFn: (a: any, b: any) => boolean = shallowEqual
): T {
  let lastArgs: any[] | undefined;
  let lastResult: ReturnType<T> | undefined;

  return ((...args: Parameters<T>) => {
    if (lastArgs && equalityFn(args, lastArgs)) {
      return lastResult;
    }

    lastArgs = args;
    lastResult = fn(...args);
    return lastResult;
  }) as T;
}

/**
 * Preload an image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preload multiple images
 */
export async function preloadImages(sources: string[]): Promise<void> {
  await Promise.all(sources.map(preloadImage));
}

/**
 * Lazy load a component
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(factory);
  
  return (props: React.ComponentProps<T>) => (
    <React.Suspense fallback={fallback || <div>Loading...</div>}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
}

/**
 * Check if code is running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if code is running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Log only in development
 */
export function devLog(...args: any[]): void {
  if (isDevelopment()) {
    console.log(...args);
  }
}

/**
 * Request idle callback helper (with fallback)
 */
export function requestIdleCallbackPolyfill(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  // Fallback to setTimeout
  return setTimeout(() => {
    const start = Date.now();
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, 1) as unknown as number;
}

/**
 * Cancel idle callback helper (with fallback)
 */
export function cancelIdleCallbackPolyfill(id: number): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Run a function during idle time
 */
export function runOnIdle(callback: () => void, timeout: number = 2000): void {
  requestIdleCallbackPolyfill(
    () => callback(),
    { timeout }
  );
}

/**
 * Chunk an array for processing
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Process array in chunks with delay
 */
export async function processInChunks<T, R>(
  array: T[],
  processor: (item: T) => R | Promise<R>,
  chunkSize: number = 10,
  delayMs: number = 0
): Promise<R[]> {
  const chunks = chunk(array, chunkSize);
  const results: R[] = [];

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);
    
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Get memory usage (if available)
 */
export function getMemoryUsage(): {
  used: number;
  total: number;
  limit: number;
} | null {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    };
  }
  return null;
}

/**
 * Log memory usage
 */
export function logMemoryUsage(): void {
  const memory = getMemoryUsage();
  if (memory) {
    console.log('[Memory]', {
      used: `${(memory.used / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.total / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.limit / 1024 / 1024).toFixed(2)} MB`,
      percentage: `${((memory.used / memory.limit) * 100).toFixed(2)}%`,
    });
  }
}

/**
 * React import helper
 * (Needed for lazyLoad function above)
 */
import * as React from 'react';
