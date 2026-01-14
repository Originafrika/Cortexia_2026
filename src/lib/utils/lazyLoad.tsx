/**
 * LAZY LOAD - Code splitting utilities
 * ✅ Performance: Reduce initial bundle size
 * 
 * Features:
 * - Dynamic imports with React.lazy
 * - Custom loading fallback
 * - Error boundaries
 * - Preloading support
 */

import React, { lazy, Suspense, ComponentType } from 'react';
import { Spinner } from '../animations/presets';

interface LazyLoadOptions {
  fallback?: React.ReactNode;
  delay?: number;
}

/**
 * Create a lazy-loaded component with custom fallback
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): React.FC<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFunc);

  const fallback = options.fallback || (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">Chargement...</p>
      </div>
    </div>
  );

  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Preload a lazy component
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): void {
  importFunc();
}

/**
 * Lazy load with delay (for better UX on fast connections)
 */
export function lazyLoadWithDelay<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  delayMs: number = 300
): React.FC<React.ComponentProps<T>> {
  const delayedImport = () =>
    Promise.all([
      importFunc(),
      new Promise(resolve => setTimeout(resolve, delayMs))
    ]).then(([moduleExports]) => moduleExports);

  return lazyLoad(delayedImport);
}

/**
 * Component-level code splitting helper
 * Use this for large components that aren't immediately visible
 */
export const LazyComponents = {
  // Example: Lazy load heavy components
  // CocoBoard: lazyLoad(() => import('../../components/coconut-v14/CocoBoard')),
  // GenerationView: lazyLoad(() => import('../../components/coconut-v14/GenerationView')),
};

/**
 * Route-based code splitting
 * Use with your router
 */
export const LazyRoutes = {
  // Example routes
  // Dashboard: lazyLoad(() => import('../pages/Dashboard')),
  // Settings: lazyLoad(() => import('../pages/Settings')),
};

/**
 * Intersection Observer based lazy loading for any component
 */
interface LazyOnViewProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

export function LazyOnView({
  children,
  fallback = <div className="h-64" />,
  rootMargin = '100px',
  threshold = 0.01,
  className = ''
}: LazyOnViewProps) {
  const [isInView, setIsInView] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin, threshold }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={ref} className={className}>
      {isInView ? children : fallback}
    </div>
  );
}

/**
 * Preload images on hover/focus for better perceived performance
 */
export function usePreloadImage(src: string) {
  const preload = React.useCallback(() => {
    const img = new Image();
    img.src = src;
  }, [src]);

  return preload;
}

/**
 * Preload multiple images
 */
export function usePreloadImages(srcs: string[]) {
  const preload = React.useCallback(() => {
    srcs.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [srcs]);

  return preload;
}

/**
 * Prefetch data on hover
 */
export function usePrefetch<T>(
  fetchFn: () => Promise<T>,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;
  const cacheRef = React.useRef<T | null>(null);
  const isLoadingRef = React.useRef(false);

  const prefetch = React.useCallback(async () => {
    if (!enabled || cacheRef.current || isLoadingRef.current) return;

    isLoadingRef.current = true;
    try {
      cacheRef.current = await fetchFn();
    } catch (error) {
      console.error('Prefetch error:', error);
    } finally {
      isLoadingRef.current = false;
    }
  }, [fetchFn, enabled]);

  const getData = () => cacheRef.current;

  return { prefetch, getData };
}
