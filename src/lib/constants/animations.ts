/**
 * COCONUT V14 - ANIMATION CONSTANTS
 * Centralized animation values for consistency
 * BDS 7 Arts Compliance
 */

// ============================================
// STAGGER DELAYS
// ============================================

export const STAGGER_DELAY = 0.05; // 50ms between items
export const STAGGER_DELAY_SLOW = 0.1; // 100ms for dramatic effect
export const STAGGER_DELAY_FAST = 0.03; // 30ms for rapid sequences

// ============================================
// BLUR VALUES (Glassmorphism)
// ============================================

export const BLUR_ULTRA = 80; // 80px - Ultra intense frosting
export const BLUR_HEAVY = 60; // 60px - Heavy frosting (DEFAULT)
export const BLUR_MEDIUM = 40; // 40px - Medium frosting
export const BLUR_LIGHT = 20; // 20px - Light frosting

// ============================================
// GRADIENT HALO OPACITY
// ============================================

export const HALO_OPACITY = 50; // 50% opacity for gradient halos
export const HALO_COLOR_OPACITY = 20; // 20% color opacity in gradients
export const HALO_BLUR = 'blur-xl'; // Default blur for halos

// ============================================
// SPRING PHYSICS
// ============================================

export const SPRING_BOUNCE = {
  SOFT: 0.2, // Subtle bounce
  MEDIUM: 0.3, // Standard bounce
  STRONG: 0.4, // Pronounced bounce
};

export const SPRING_DAMPING = {
  TIGHT: 10, // Quick settle
  STANDARD: 15, // Balanced
  LOOSE: 20, // Slow settle
};

// ============================================
// MOTION VARIANTS
// ============================================

export const FADE_IN_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const FADE_IN_DOWN = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const FADE_IN_LEFT = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const FADE_IN_RIGHT = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const SCALE_IN = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const SCALE_IN_LARGE = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

// ============================================
// TRANSITION CONFIGS
// ============================================

export const TRANSITION_BDS_M1 = {
  duration: 0.24,
  ease: [0.4, 0, 0.2, 1], // Ease-Out Cubic - impact
};

export const TRANSITION_BDS_M2 = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1], // Ease-In-Out Quint - luxury smooth
};

export const TRANSITION_BDS_M3 = {
  duration: 0.24,
  ease: [0.68, -0.55, 0.265, 1.55], // Overshoot 1.2 - playfulness
};

export const TRANSITION_BDS_M4 = {
  duration: 0.42,
  ease: [0.68, -0.6, 0.32, 1.6], // Elastic Soft - organic
};

export const TRANSITION_BDS_M5 = {
  duration: 1.2,
  ease: [0, 0, 0.2, 1], // Decelerate Fade - calm
};

export const TRANSITION_SPRING = {
  type: 'spring' as const,
  bounce: SPRING_BOUNCE.SOFT,
  duration: 0.6,
};

export const TRANSITION_SPRING_TIGHT = {
  type: 'spring' as const,
  damping: SPRING_DAMPING.TIGHT,
  stiffness: 100,
};

// ============================================
// HOVER EFFECTS
// ============================================

export const HOVER_LIFT_SMALL = {
  scale: 1.02,
  y: -2,
};

export const HOVER_LIFT_MEDIUM = {
  scale: 1.03,
  y: -4,
};

export const HOVER_LIFT_LARGE = {
  scale: 1.05,
  y: -8,
};

export const HOVER_SCALE_SMALL = {
  scale: 1.05,
};

export const HOVER_SCALE_LARGE = {
  scale: 1.1,
};

// ============================================
// TAP EFFECTS
// ============================================

export const TAP_SCALE = {
  scale: 0.95,
};

export const TAP_SCALE_STRONG = {
  scale: 0.9,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate staggered delay for list items
 * @param index - Item index
 * @param baseDelay - Base delay before stagger starts (default: 0)
 * @returns Delay in seconds
 */
export function getStaggerDelay(index: number, baseDelay = 0): number {
  return baseDelay + index * STAGGER_DELAY;
}

/**
 * Get blur class name for Tailwind
 * @param intensity - 'ultra' | 'heavy' | 'medium' | 'light'
 * @returns Tailwind class string
 */
export function getBlurClass(intensity: 'ultra' | 'heavy' | 'medium' | 'light' = 'heavy'): string {
  const blurMap = {
    ultra: `backdrop-blur-[${BLUR_ULTRA}px]`,
    heavy: `backdrop-blur-[${BLUR_HEAVY}px]`,
    medium: `backdrop-blur-[${BLUR_MEDIUM}px]`,
    light: `backdrop-blur-[${BLUR_LIGHT}px]`,
  };
  return blurMap[intensity];
}

/**
 * Get glass card classes
 * @param blur - Blur intensity
 * @returns Combined class string
 */
export function getGlassClasses(blur: 'ultra' | 'heavy' | 'medium' | 'light' = 'heavy'): string {
  return `bg-white/70 ${getBlurClass(blur)} border border-white/60 shadow-xl`;
}

/**
 * Get gradient halo classes
 * @param colorFrom - Tailwind color (e.g., 'purple-500')
 * @param colorTo - Tailwind color (e.g., 'purple-600')
 * @returns Class string
 */
export function getGradientHaloClasses(colorFrom: string, colorTo: string): string {
  return `absolute -inset-1 bg-gradient-to-br from-${colorFrom}/${HALO_COLOR_OPACITY} to-${colorTo}/${HALO_COLOR_OPACITY} rounded-2xl ${HALO_BLUR} opacity-${HALO_OPACITY}`;
}
