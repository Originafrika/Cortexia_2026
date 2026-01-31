// This file was replaced by performance.tsx which contains the React-aware
// implementation. Keep a minimal stub to avoid accidental imports of the
// old implementation while the codebase transitions.

export {}; 

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
