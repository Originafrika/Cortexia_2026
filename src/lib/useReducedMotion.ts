import { useState, useEffect } from 'react';

// ============================================
// BEAUTY DESIGN SYSTEM — ACCESSIBILITY
// prefers-reduced-motion support
// ============================================

/**
 * Hook to detect if user prefers reduced motion
 * Returns true if user has enabled reduced motion in OS settings
 * 
 * Usage:
 * const prefersReducedMotion = useReducedMotion();
 * 
 * <motion.div
 *   animate={prefersReducedMotion ? {} : { scale: 1.2 }}
 * />
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if matchMedia is available (SSR safety)
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Utility function to conditionally apply animations
 * 
 * Usage:
 * const shouldAnimate = useShouldAnimate();
 * 
 * <motion.div
 *   animate={shouldAnimate({ scale: 1.2 })}
 * />
 */
export function useShouldAnimate() {
  const prefersReducedMotion = useReducedMotion();
  
  return <T extends object>(animation: T): T | {} => {
    return prefersReducedMotion ? {} : animation;
  };
}
