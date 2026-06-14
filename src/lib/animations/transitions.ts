/**
 * COCONUT V14 - PHASE 4 JOUR 3
 * Page Transitions & Animation Utilities
 * 
 * Bibliothèque de transitions fluides pour navigation et composants
 * Basé sur le BDS (Beauty Design System) - Art 6: Musique (Rythme Visuel)
 */

import { Transition, Variant } from 'motion/react';

// ============================================
// TIMING PRESETS (BDS: Arithmétique - Rythme)
// ============================================

/**
 * Timings harmonieux basés sur la suite de Fibonacci
 * pour créer un rythme visuel naturel
 */
export const TIMING = {
  instant: 0.15,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
  slowest: 1.2,
} as const;

/**
 * Easing functions premium pour des transitions fluides
 * BDS: Géométrie - Courbes harmonieuses
 */
export const EASING = {
  // Ease standard
  default: [0.4, 0, 0.2, 1],
  
  // Ease pour entrées
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  
  // Ease premium (plus naturelles)
  smooth: [0.25, 0.46, 0.45, 0.94],
  bounce: [0.68, -0.55, 0.265, 1.55],
  elastic: [0.87, 0, 0.13, 1],
  
  // Ease pour micro-interactions
  snappy: [0.2, 0, 0, 1],
  gentle: [0.25, 0.1, 0.25, 1],
} as const;

// ============================================
// PAGE TRANSITIONS
// ============================================

/**
 * Transition fade simple et élégante
 * Usage: Navigation entre pages
 */
export const fadeTransition: Transition = {
  duration: TIMING.normal,
  ease: EASING.default,
};

export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Transition slide avec direction
 * Usage: Navigation avec sens (suivant/précédent)
 */
export const slideTransition: Transition = {
  duration: TIMING.normal,
  ease: EASING.smooth,
};

export const slideVariants = {
  // Slide depuis la droite (suivant)
  slideInRight: {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  },
  
  // Slide depuis la gauche (précédent)
  slideInLeft: {
    initial: { x: -50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 50, opacity: 0 },
  },
  
  // Slide depuis le bas (modal, drawer)
  slideInUp: {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 100, opacity: 0 },
  },
  
  // Slide depuis le haut (notification)
  slideInDown: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 },
  },
};

/**
 * Transition scale (zoom)
 * Usage: Modals, popups, cartes
 */
export const scaleTransition: Transition = {
  duration: TIMING.fast,
  ease: EASING.bounce,
};

export const scaleVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};

/**
 * Transition scale + fade (premium)
 * Usage: Éléments premium qui méritent de l'emphase
 */
export const scaleUpVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      duration: TIMING.normal,
      ease: EASING.smooth,
    },
  },
  exit: { 
    scale: 0.95, 
    opacity: 0,
    transition: {
      duration: TIMING.fast,
      ease: EASING.default,
    },
  },
};

/**
 * Transition collapse (hauteur)
 * Usage: Accordéons, sections expandables
 */
export const collapseVariants = {
  collapsed: { 
    height: 0, 
    opacity: 0,
    transition: {
      duration: TIMING.normal,
      ease: EASING.default,
    },
  },
  expanded: { 
    height: 'auto', 
    opacity: 1,
    transition: {
      duration: TIMING.normal,
      ease: EASING.default,
    },
  },
};

// ============================================
// ENTRANCE ANIMATIONS (Stagger)
// ============================================

/**
 * Container pour animations stagger
 * Usage: Listes, grilles d'éléments
 */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * Item dans un stagger container
 * Usage: Cartes de projets, items de liste
 */
export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: TIMING.normal,
      ease: EASING.smooth,
    },
  },
};

/**
 * Stagger avec fade + slide
 * Pour des entrées plus dramatiques
 */
export const staggerFadeSlide = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  },
  item: {
    initial: { opacity: 0, x: -20, y: 10 },
    animate: { 
      opacity: 1, 
      x: 0, 
      y: 0,
      transition: {
        duration: TIMING.slow,
        ease: EASING.smooth,
      },
    },
  },
};

// ============================================
// LOADING ANIMATIONS
// ============================================

/**
 * Spinner rotation infinie
 * Usage: Loading indicators
 */
export const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Pulse animation
 * Usage: Loading states, focus attention
 */
export const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: EASING.gentle,
    },
  },
};

/**
 * Skeleton loading shimmer
 * Usage: Content placeholders
 */
export const shimmerVariants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: EASING.gentle,
    },
  },
};

/**
 * Dots loading (3 dots qui pulsent)
 * Usage: "Analysing...", "Generating..."
 */
export const dotsContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      repeat: Infinity,
      repeatType: 'loop' as const,
    },
  },
};

export const dotVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      ease: EASING.easeInOut,
    },
  },
};

// ============================================
// SUCCESS / ERROR ANIMATIONS
// ============================================

/**
 * Success checkmark animation
 * Usage: Formulaire validé, tâche complétée
 */
export const successVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: { 
    scale: 1, 
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
    },
  },
};

/**
 * Success bounce
 * Usage: Notification de succès
 */
export const successBounce = {
  scale: [1, 1.2, 1],
  transition: {
    duration: TIMING.slow,
    times: [0, 0.5, 1],
    ease: EASING.bounce,
  },
};

/**
 * Error shake animation
 * Usage: Erreur de validation, échec
 */
export const errorShake = {
  x: [0, -10, 10, -10, 10, 0],
  transition: {
    duration: TIMING.slow,
    ease: EASING.default,
  },
};

/**
 * Error pulse (plus subtil)
 * Usage: Input invalide
 */
export const errorPulse = {
  scale: [1, 1.02, 1],
  transition: {
    duration: TIMING.normal,
    repeat: 2,
  },
};

// ============================================
// MODAL / OVERLAY ANIMATIONS
// ============================================

/**
 * Modal backdrop fade
 * Usage: Background overlay des modals
 */
export const backdropVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: TIMING.fast,
    },
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: TIMING.fast,
    },
  },
};

/**
 * Modal content (scale + fade)
 * Usage: Contenu de modal
 */
export const modalContentVariants = {
  initial: { 
    scale: 0.95, 
    opacity: 0,
    y: 20,
  },
  animate: { 
    scale: 1, 
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.normal,
      ease: EASING.smooth,
      delay: 0.05, // Légèrement après le backdrop
    },
  },
  exit: { 
    scale: 0.95, 
    opacity: 0,
    y: 20,
    transition: {
      duration: TIMING.fast,
      ease: EASING.default,
    },
  },
};

// ============================================
// DRAWER ANIMATIONS
// ============================================

/**
 * Drawer slide from side
 * Usage: Side panels, navigation drawers
 */
export const drawerVariants = {
  // Drawer from right
  right: {
    initial: { x: '100%' },
    animate: { 
      x: 0,
      transition: {
        duration: TIMING.normal,
        ease: EASING.smooth,
      },
    },
    exit: { 
      x: '100%',
      transition: {
        duration: TIMING.normal,
        ease: EASING.smooth,
      },
    },
  },
  
  // Drawer from left
  left: {
    initial: { x: '-100%' },
    animate: { 
      x: 0,
      transition: {
        duration: TIMING.normal,
        ease: EASING.smooth,
      },
    },
    exit: { 
      x: '-100%',
      transition: {
        duration: TIMING.normal,
        ease: EASING.smooth,
      },
    },
  },
  
  // Drawer from bottom
  bottom: {
    initial: { y: '100%' },
    animate: { 
      y: 0,
      transition: {
        duration: TIMING.normal,
        ease: EASING.smooth,
      },
    },
    exit: { 
      y: '100%',
      transition: {
        duration: TIMING.normal,
        ease: EASING.smooth,
      },
    },
  },
};

// ============================================
// ACCESSIBILITY: Respect prefers-reduced-motion
// ============================================

/**
 * Détecte si l'utilisateur préfère des animations réduites
 * BDS: Astronomie - Vision systémique (penser accessibilité)
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Transition adaptative qui respecte prefers-reduced-motion
 * Usage: Envelopper toutes les animations avec ceci
 */
export const getAccessibleTransition = (transition: Transition): Transition => {
  if (prefersReducedMotion()) {
    return { duration: 0.01 }; // Presque instantané
  }
  return transition;
};

/**
 * Variants adaptatifs
 * Retourne des variants simplifiés si prefers-reduced-motion
 */
export const getAccessibleVariants = (variants: any) => {
  if (prefersReducedMotion()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return variants;
};

// ============================================
// TOAST NOTIFICATIONS
// ============================================

/**
 * Toast notification slide from top
 * Usage: Notification toasts
 */
export const toastVariants = {
  initial: { 
    opacity: 0, 
    y: -50,
    scale: 0.95,
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: TIMING.normal,
      ease: EASING.smooth,
    },
  },
  exit: { 
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: TIMING.fast,
      ease: EASING.default,
    },
  },
};

// ============================================
// DROPDOWN ANIMATIONS
// ============================================

/**
 * Dropdown menu slide + fade
 * Usage: Select dropdowns, context menus
 */
export const dropdownVariants = {
  initial: { 
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  animate: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: TIMING.fast,
      ease: EASING.smooth,
    },
  },
  exit: { 
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: TIMING.fast,
      ease: EASING.default,
    },
  },
};