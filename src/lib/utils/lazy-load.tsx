// /lib/utils/lazy-load.tsx
import { lazy, ComponentType } from 'react';

/**
 * Lazy load components with retry logic
 * Handles network failures gracefully
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries: number = 3
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: Error | undefined;

    for (let i = 0; i < retries; i++) {
      try {
        return await componentImport();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to load component (attempt ${i + 1}/${retries}):`, error);

        // Wait before retrying (exponential backoff)
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }

    throw lastError || new Error('Failed to load component');
  });
}

/**
 * Preload a lazy component
 * Useful for preloading components on hover or route prefetch
 */
export function preloadComponent<T extends ComponentType<any>>(
  LazyComponent: React.LazyExoticComponent<T>
): void {
  // TypeScript workaround: cast to access internal _ctor
  const component = LazyComponent as any;
  if (component._ctor && typeof component._ctor === 'function') {
    component._ctor();
  }
}
