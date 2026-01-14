/**
 * BREAKPOINT HOOK
 * Phase 8 - Responsivité Complète
 * 
 * Hook pour détecter le breakpoint actuel et la catégorie d'appareil.
 * 
 * Usage:
 * const { breakpoint, isMobile, isTablet, isDesktop } = useBreakpoint();
 * const width = useWindowWidth();
 */

import { useState, useEffect } from 'react';
import { 
  breakpoints, 
  getCurrentBreakpoint, 
  getDeviceCategory,
  type Breakpoint,
  type DeviceCategory 
} from '../design/breakpoints';

interface BreakpointState {
  breakpoint: Breakpoint;
  deviceCategory: DeviceCategory;
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;
}

/**
 * Get window width safely (SSR-compatible)
 */
function getWindowWidth(): number {
  if (typeof window === 'undefined') return 1024; // Default to desktop for SSR
  return window.innerWidth;
}

/**
 * Hook to get current breakpoint and device category
 */
export function useBreakpoint(): BreakpointState {
  const [width, setWidth] = useState(getWindowWidth);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Use ResizeObserver if available (more performant)
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(document.documentElement);

      return () => {
        resizeObserver.disconnect();
      };
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const breakpoint = getCurrentBreakpoint(width);
  const deviceCategory = getDeviceCategory(width);

  return {
    breakpoint,
    deviceCategory,
    width,
    isMobile: deviceCategory === 'mobile',
    isTablet: deviceCategory === 'tablet',
    isDesktop: deviceCategory === 'desktop',
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    is2xl: breakpoint === '2xl',
  };
}

/**
 * Hook to get window width only
 */
export function useWindowWidth(): number {
  const [width, setWidth] = useState(getWindowWidth);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Debounce resize event for performance
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  return width;
}

/**
 * Hook to get window dimensions (width + height)
 */
export function useWindowDimensions() {
  const [dimensions, setDimensions] = useState({
    width: getWindowWidth(),
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Debounce for performance
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  return dimensions;
}

/**
 * Hook to conditionally execute code based on breakpoint
 */
export function useBreakpointValue<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
  default: T;
}): T {
  const { breakpoint } = useBreakpoint();
  
  // Return value for current breakpoint, falling back to default
  return values[breakpoint] ?? values.default;
}
