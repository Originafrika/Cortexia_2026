/**
 * PREMIUM ANIMATIONS SYSTEM
 * Phase 7 - Animations Micro-Interactions
 * 
 * Système complet d'animations premium pour Coconut V14
 * Inspiré par Apple, Vercel, Linear
 * 
 * Usage:
 * import { animations, variants, easings } from '@/lib/design/animations';
 */

import { Variants, Transition } from 'motion/react';

// ============================================
// PREMIUM EASING CURVES
// ============================================

/**
 * Courbes d'accélération premium
 * Basées sur les standards Apple & Material Design
 */
export const easings = {
  // Apple-like
  appleEase: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  appleEaseIn: [0.42, 0, 1, 1] as [number, number, number, number],
  appleEaseOut: [0, 0, 0.58, 1] as [number, number, number, number],
  appleEaseInOut: [0.42, 0, 0.58, 1] as [number, number, number, number],
  
  // Material Design
  standard: [0.4, 0, 0.2, 1] as [number, number, number, number],
  decelerate: [0, 0, 0.2, 1] as [number, number, number, number],
  accelerate: [0.4, 0, 1, 1] as [number, number, number, number],
  
  // Custom Premium
  smooth: [0.22, 1, 0.36, 1] as [number, number, number, number],
  bounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
  elastic: [0.5, 1.25, 0.75, 1.25] as [number, number, number, number],
  snappy: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
} as const;

// ============================================
// TIMING PRESETS
// ============================================

export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  medium: 0.4,
  slow: 0.5,
  slower: 0.7,
  slowest: 1,
} as const;

// ============================================
// SPRING PRESETS
// ============================================

export const springs = {
  // Soft & smooth
  soft: { type: 'spring' as const, stiffness: 200, damping: 20 },
  medium: { type: 'spring' as const, stiffness: 300, damping: 25 },
  stiff: { type: 'spring' as const, stiffness: 400, damping: 30 },
  
  // Bouncy
  bouncy: { type: 'spring' as const, stiffness: 500, damping: 15 },
  veryBouncy: { type: 'spring' as const, stiffness: 700, damping: 10 },
  
  // Quick
  quick: { type: 'spring' as const, stiffness: 600, damping: 35 },
  snappy: { type: 'spring' as const, stiffness: 800, damping: 40 },
} as const;

// ============================================
// MOTION VARIANTS (Ready-to-use)
// ============================================

/**
 * Fade animations
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Fade + Slide from bottom
 */
export const fadeSlideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

/**
 * Fade + Slide from top
 */
export const fadeSlideDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

/**
 * Scale + Fade (modal/popup)
 */
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

/**
 * Scale from center (button press)
 */
export const scalePressVariants: Variants = {
  initial: { scale: 1 },
  pressed: { scale: 0.95 },
};

/**
 * Hover lift (cards, buttons)
 */
export const hoverLiftVariants: Variants = {
  initial: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.02 },
};

/**
 * Hover glow (premium effect)
 */
export const hoverGlowVariants: Variants = {
  initial: { boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
  hover: { boxShadow: '0 8px 32px rgba(139,115,85,0.3)' },
};

/**
 * Shake animation (error)
 */
export const shakeVariants: Variants = {
  initial: { x: 0 },
  shake: {
    x: [0, -10, 10, -10, 10, -5, 5, 0],
    transition: { duration: 0.5 },
  },
};

/**
 * Pulse animation (loading, attention)
 */
export const pulseVariants: Variants = {
  initial: { scale: 1, opacity: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Rotate animation (loading spinner)
 */
export const rotateVariants: Variants = {
  rotate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Stagger container (list items)
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/**
 * Stagger item (child of stagger container)
 */
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.smooth,
    },
  },
};

/**
 * Slide from left (drawer, sidebar)
 */
export const slideLeftVariants: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0 },
  exit: { x: '-100%' },
};

/**
 * Slide from right
 */
export const slideRightVariants: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
  exit: { x: '100%' },
};

/**
 * Backdrop fade (modal backdrop)
 */
export const backdropVariants: Variants = {
  hidden: { opacity: 0, backdropFilter: 'blur(0px)' },
  visible: { opacity: 1, backdropFilter: 'blur(8px)' },
  exit: { opacity: 0, backdropFilter: 'blur(0px)' },
};

// ============================================
// TRANSITION PRESETS
// ============================================

export const transitions = {
  // Basic
  fast: { duration: durations.fast, ease: easings.smooth },
  normal: { duration: durations.normal, ease: easings.smooth },
  slow: { duration: durations.slow, ease: easings.smooth },
  
  // Apple-like
  apple: { duration: durations.normal, ease: easings.appleEase },
  appleSnappy: { duration: durations.fast, ease: easings.snappy },
  
  // Bounce
  bounce: { duration: durations.medium, ease: easings.bounce },
  
  // Spring
  spring: springs.medium,
  springBouncy: springs.bouncy,
  springSnappy: springs.snappy,
} as const;

// ============================================
// COMBINED ANIMATIONS (Ready-to-use components)
// ============================================

/**
 * Button animations
 */
export const buttonAnimations = {
  whileHover: { scale: 1.02, y: -2 },
  whileTap: { scale: 0.98 },
  transition: transitions.appleSnappy,
};

/**
 * Card animations
 */
export const cardAnimations = {
  whileHover: { 
    y: -4, 
    scale: 1.01,
    boxShadow: '0 8px 32px rgba(139,115,85,0.2)',
  },
  transition: transitions.apple,
};

/**
 * Icon button animations
 */
export const iconButtonAnimations = {
  whileHover: { scale: 1.1, rotate: 5 },
  whileTap: { scale: 0.9, rotate: -5 },
  transition: transitions.springSnappy,
};

/**
 * Input focus animation
 */
export const inputFocusAnimations = {
  whileFocus: { scale: 1.01 },
  transition: transitions.fast,
};

/**
 * Modal entrance
 */
export const modalEntranceTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

/**
 * Page transition
 */
export const pageTransition: Transition = {
  duration: 0.3,
  ease: easings.appleEase,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get stagger delay for index
 */
export function getStaggerDelay(index: number, baseDelay = 0.1): number {
  return index * baseDelay;
}

/**
 * Create custom stagger container
 */
export function createStaggerContainer(staggerDelay = 0.1, delayChildren = 0): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };
}

/**
 * Create fade slide variant with custom values
 */
export function createFadeSlide(y = 20, duration = 0.4): Variants {
  return {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: easings.smooth },
    },
    exit: { opacity: 0, y },
  };
}

/**
 * Respect prefers-reduced-motion
 */
export function getReducedMotionVariants(variants: Variants): Variants {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return variants;
}

// ============================================
// ANIMATION PRESETS COLLECTION
// ============================================

export const animations = {
  // Variants
  fade: fadeVariants,
  fadeSlideUp: fadeSlideUpVariants,
  fadeSlideDown: fadeSlideDownVariants,
  scale: scaleVariants,
  scalePress: scalePressVariants,
  hoverLift: hoverLiftVariants,
  hoverGlow: hoverGlowVariants,
  shake: shakeVariants,
  pulse: pulseVariants,
  rotate: rotateVariants,
  staggerContainer: staggerContainerVariants,
  staggerItem: staggerItemVariants,
  slideLeft: slideLeftVariants,
  slideRight: slideRightVariants,
  backdrop: backdropVariants,
  
  // Transitions
  transitions,
  
  // Combined
  button: buttonAnimations,
  card: cardAnimations,
  iconButton: iconButtonAnimations,
  inputFocus: inputFocusAnimations,
  
  // Utilities
  getStaggerDelay,
  createStaggerContainer,
  createFadeSlide,
  getReducedMotionVariants,
} as const;

// ============================================
// TYPE EXPORTS
// ============================================

export type EasingName = keyof typeof easings;
export type DurationName = keyof typeof durations;
export type SpringName = keyof typeof springs;
export type TransitionName = keyof typeof transitions;
