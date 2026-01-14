/**
 * ANIMATION PRESETS - BDS 7 Arts: Musique (Rythme Visuel)
 * 
 * Centralized animation presets for consistent motion design
 * All animations follow the BDS rhythm principles
 * 
 * ✅ GPU-accelerated (transform, opacity)
 * ✅ Consistent timing functions
 * ✅ Accessibility-aware (respects prefers-reduced-motion)
 */

import { Variants, Transition } from 'motion/react';

// ========================================
// TIMING CONSTANTS (BDS Arithmétique)
// ========================================

export const DURATIONS = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  smooth: 0.4,
  slow: 0.6,
  slower: 0.8
} as const;

export const EASINGS = {
  // Natural ease (recommended for most UI)
  ease: [0.4, 0.0, 0.2, 1],
  
  // Entrances (slightly bouncy)
  easeOut: [0.0, 0.0, 0.2, 1],
  
  // Exits (quick start)
  easeIn: [0.4, 0.0, 1, 1],
  
  // Smooth both ways
  easeInOut: [0.4, 0.0, 0.2, 1],
  
  // Spring-like (for interactive elements)
  spring: { type: 'spring', stiffness: 300, damping: 25 }
} as const;

// ========================================
// FADE ANIMATIONS
// ========================================

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

// ========================================
// SCALE ANIMATIONS
// ========================================

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
};

export const scaleInBounce: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  },
  exit: { opacity: 0, scale: 0.9 }
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  },
  exit: { opacity: 0, scale: 0 }
};

// ========================================
// SLIDE ANIMATIONS
// ========================================

export const slideInFromBottom: Variants = {
  initial: { y: '100%', opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: '100%', opacity: 0 }
};

export const slideInFromTop: Variants = {
  initial: { y: '-100%', opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: '-100%', opacity: 0 }
};

export const slideInFromLeft: Variants = {
  initial: { x: '-100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 }
};

export const slideInFromRight: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 0 }
};

// ========================================
// ROTATION ANIMATIONS
// ========================================

export const rotateIn: Variants = {
  initial: { opacity: 0, rotate: -10 },
  animate: { opacity: 1, rotate: 0 },
  exit: { opacity: 0, rotate: 10 }
};

export const flipIn: Variants = {
  initial: { opacity: 0, rotateY: 90 },
  animate: { opacity: 1, rotateY: 0 },
  exit: { opacity: 0, rotateY: -90 }
};

// ========================================
// STAGGER ANIMATIONS (for lists/grids)
// ========================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

// ========================================
// MODAL/OVERLAY ANIMATIONS
// ========================================

export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  exit: { opacity: 0, scale: 0.95, y: 20 }
};

export const drawerFromBottom: Variants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' }
};

// ========================================
// ATTENTION ANIMATIONS (for notifications)
// ========================================

export const pulse = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 0.6,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

export const shake = {
  x: [0, -10, 10, -10, 10, 0],
  transition: {
    duration: 0.5,
    ease: 'easeInOut'
  }
};

export const bounce = {
  y: [0, -10, 0],
  transition: {
    duration: 0.6,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

// ========================================
// LOADING ANIMATIONS
// ========================================

export const spin = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear'
  }
};

export const spinSlow = {
  rotate: 360,
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'linear'
  }
};

export const spinReverse = {
  rotate: -360,
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear'
  }
};

// ========================================
// INTERACTION ANIMATIONS (for buttons)
// ========================================

export const hoverScale = {
  scale: 1.05,
  transition: { duration: DURATIONS.fast }
};

export const hoverLift = {
  y: -2,
  transition: { duration: DURATIONS.fast }
};

export const tapScale = {
  scale: 0.95,
  transition: { duration: DURATIONS.instant }
};

// ========================================
// LIQUID GLASS EFFECT (BDS Premium)
// ========================================

export const liquidGlassShimmer = {
  backgroundPosition: ['0% 0%', '100% 100%'],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'linear'
  }
};

export const glassBlur = {
  backdropFilter: ['blur(0px)', 'blur(20px)', 'blur(0px)'],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

// ========================================
// TRANSITION PRESETS
// ========================================

export const transitions: Record<string, Transition> = {
  instant: { duration: DURATIONS.instant, ease: EASINGS.ease },
  fast: { duration: DURATIONS.fast, ease: EASINGS.ease },
  normal: { duration: DURATIONS.normal, ease: EASINGS.ease },
  smooth: { duration: DURATIONS.smooth, ease: EASINGS.ease },
  slow: { duration: DURATIONS.slow, ease: EASINGS.ease },
  spring: EASINGS.spring
};

// ========================================
// UTILITY FUNCTION: Create custom variants
// ========================================

export function createFadeVariant(
  direction?: 'up' | 'down' | 'left' | 'right',
  distance: number = 20
): Variants {
  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
  const value = direction === 'down' || direction === 'right' ? distance : -distance;
  
  return {
    initial: { opacity: 0, [axis]: value },
    animate: { opacity: 1, [axis]: 0 },
    exit: { opacity: 0, [axis]: -value }
  };
}

export function createScaleVariant(
  initialScale: number = 0.9,
  exitScale: number = 0.9
): Variants {
  return {
    initial: { opacity: 0, scale: initialScale },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: exitScale }
  };
}

// ========================================
// ACCESSIBILITY: Respect prefers-reduced-motion
// ========================================

export function getAccessibleVariant(variant: Variants): Variants {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Return simple fade for reduced motion
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    };
  }
  return variant;
}
