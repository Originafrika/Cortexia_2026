/**
 * INTERSECTION OBSERVER HOOK
 * Phase 9 - Performance & Optimizations
 * 
 * Hook pour détecter quand un élément entre dans le viewport.
 * Parfait pour lazy loading d'images, infinite scroll, animations on scroll.
 * 
 * Usage:
 * const [ref, isVisible] = useIntersectionObserver();
 * const { ref, isIntersecting, entry } = useIntersectionObserverAdvanced();
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

/**
 * Simple intersection observer hook
 * 
 * @param options - IntersectionObserver options
 * @returns [ref, isVisible]
 * 
 * @example
 * function LazyImage({ src }) {
 *   const [ref, isVisible] = useIntersectionObserver({
 *     threshold: 0.1,
 *     freezeOnceVisible: true
 *   });
 * 
 *   return (
 *     <div ref={ref}>
 *       {isVisible ? <img src={src} /> : <div className="placeholder" />}
 *     </div>
 *   );
 * }
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefCallback<Element>, boolean] {
  const { threshold = 0, root = null, rootMargin = '0px', freezeOnceVisible = false } = options;
  
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: Element | null) => {
      if (!node) {
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
        return;
      }

      if (freezeOnceVisible && isVisible) {
        return;
      }

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting);
        },
        { threshold, root, rootMargin }
      );

      observerRef.current.observe(node);
    },
    [threshold, root, rootMargin, freezeOnceVisible, isVisible]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [ref, isVisible];
}

/**
 * Advanced intersection observer hook with full control
 * 
 * @param options - IntersectionObserver options
 * @returns { ref, isIntersecting, entry }
 * 
 * @example
 * function AnimatedSection() {
 *   const { ref, isIntersecting, entry } = useIntersectionObserverAdvanced({
 *     threshold: 0.5,
 *     rootMargin: '-100px'
 *   });
 * 
 *   return (
 *     <motion.div
 *       ref={ref}
 *       initial={{ opacity: 0 }}
 *       animate={{ opacity: isIntersecting ? 1 : 0 }}
 *     >
 *       Content
 *     </motion.div>
 *   );
 * }
 */
export function useIntersectionObserverAdvanced(
  options: UseIntersectionObserverOptions = {}
): {
  ref: React.RefCallback<Element>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
} {
  const { threshold = 0, root = null, rootMargin = '0px', freezeOnceVisible = false } = options;
  
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: Element | null) => {
      if (!node) {
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
        return;
      }

      if (freezeOnceVisible && isIntersecting) {
        return;
      }

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        ([observerEntry]) => {
          setEntry(observerEntry);
          setIsIntersecting(observerEntry.isIntersecting);
        },
        { threshold, root, rootMargin }
      );

      observerRef.current.observe(node);
    },
    [threshold, root, rootMargin, freezeOnceVisible, isIntersecting]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { ref, isIntersecting, entry };
}

/**
 * Hook for lazy loading images
 * 
 * @param options - Options
 * @returns { ref, isLoaded, shouldLoad }
 * 
 * @example
 * function LazyImage({ src, alt }) {
 *   const { ref, shouldLoad } = useLazyLoad({ rootMargin: '200px' });
 * 
 *   return (
 *     <div ref={ref}>
 *       {shouldLoad && <img src={src} alt={alt} />}
 *     </div>
 *   );
 * }
 */
export function useLazyLoad(options: UseIntersectionObserverOptions = {}) {
  const { rootMargin = '200px', threshold = 0.01, ...restOptions } = options;
  
  const [ref, isVisible] = useIntersectionObserver({
    rootMargin,
    threshold,
    freezeOnceVisible: true,
    ...restOptions,
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const shouldLoad = isVisible || isLoaded;

  useEffect(() => {
    if (isVisible && !isLoaded) {
      setIsLoaded(true);
    }
  }, [isVisible, isLoaded]);

  return { ref, isLoaded, shouldLoad };
}

/**
 * Hook for infinite scroll
 * 
 * @param callback - Callback when sentinel is visible
 * @param options - Options
 * 
 * @example
 * function InfiniteList() {
 *   const [items, setItems] = useState([...]);
 *   const [loading, setLoading] = useState(false);
 * 
 *   const loadMore = async () => {
 *     setLoading(true);
 *     const newItems = await fetchMore();
 *     setItems([...items, ...newItems]);
 *     setLoading(false);
 *   };
 * 
 *   const sentinelRef = useInfiniteScroll(loadMore, {
 *     rootMargin: '400px',
 *     enabled: !loading
 *   });
 * 
 *   return (
 *     <div>
 *       {items.map(item => <Item key={item.id} {...item} />)}
 *       <div ref={sentinelRef} />
 *     </div>
 *   );
 * }
 */
export function useInfiniteScroll(
  callback: () => void,
  options: UseIntersectionObserverOptions & { enabled?: boolean } = {}
): React.RefCallback<Element> {
  const { enabled = true, ...observerOptions } = options;
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '400px',
    ...observerOptions,
  });

  useEffect(() => {
    if (isVisible && enabled) {
      callbackRef.current();
    }
  }, [isVisible, enabled]);

  return ref;
}
