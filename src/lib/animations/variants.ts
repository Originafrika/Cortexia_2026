/**
 * COCONUT V14 - PHASE 4 JOUR 3
 * Motion Variants Library
 * 
 * Collection de variants Motion réutilisables pour composants
 * BDS: Musique (Rythme expérientiel) + Rhétorique (Communication impactante)
 */

import { Variants } from 'motion/react';
import { TIMING, EASING } from './transitions';

// ============================================
// BUTTON VARIANTS
// ============================================

/**
 * Hover effect pour boutons
 * Légère élévation + scale
 */
export const buttonHoverVariants: Variants = {
  rest: { 
    scale: 1,
    y: 0,
  },
  hover: { 
    scale: 1.02,
    y: -2,
    transition: {
      duration: TIMING.fast,
      ease: EASING.snappy,
    },
  },
  tap: { 
    scale: 0.98,
    y: 0,
    transition: {
      duration: TIMING.instant,
      ease: EASING.snappy,
    },
  },
};

/**
 * Bouton avec glow pulsant
 * Pour CTAs importants
 */
export const buttonGlowVariants: Variants = {
  idle: {
    boxShadow: '0 0 0 0 rgba(168, 85, 247, 0)',
  },
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(168, 85, 247, 0.4)',
      '0 0 20px 10px rgba(168, 85, 247, 0)',
      '0 0 0 0 rgba(168, 85, 247, 0)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: EASING.gentle,
    },
  },
};

// ============================================
// CARD VARIANTS
// ============================================

/**
 * Hover effect pour cartes
 * Élévation + légère rotation
 */
export const cardHoverVariants: Variants = {
  rest: { 
    y: 0,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  hover: { 
    y: -8,
    boxShadow: '0 20px 25px -5px rgba(168, 85, 247, 0.3)',
    transition: {
      duration: TIMING.normal,
      ease: EASING.smooth,
    },
  },
};

/**
 * Card avec reveal animation
 * Pour grilles de projets
 */
export const cardRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: TIMING.slow,
      ease: EASING.smooth,
    },
  },
};

/**
 * Card flip (3D)
 * Pour révéler du contenu au dos
 */
export const cardFlipVariants: Variants = {
  front: {
    rotateY: 0,
    transition: {
      duration: TIMING.slow,
      ease: EASING.smooth,
    },
  },
  back: {
    rotateY: 180,
    transition: {
      duration: TIMING.slow,
      ease: EASING.smooth,
    },
  },
};

// ============================================
// IMAGE VARIANTS
// ============================================

/**
 * Image zoom on hover
 * Pour galeries, thumbnails
 */
export const imageZoomVariants: Variants = {
  rest: { 
    scale: 1,
  },
  hover: { 
    scale: 1.1,
    transition: {
      duration: TIMING.slow,
      ease: EASING.smooth,
    },
  },
};

/**
 * Image reveal with overlay fade
 * Pour résultats de génération
 */
export const imageRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: TIMING.slow,
      ease: EASING.smooth,
    },
  },
};

// ============================================
// INPUT / FORM VARIANTS
// ============================================

/**
 * Input focus animation
 * Scale subtil + glow
 */
export const inputFocusVariants: Variants = {
  blur: {
    scale: 1,
    boxShadow: '0 0 0 0 rgba(168, 85, 247, 0)',
  },
  focus: {
    scale: 1.01,
    boxShadow: '0 0 0 3px rgba(168, 85, 247, 0.2)',
    transition: {
      duration: TIMING.fast,
      ease: EASING.smooth,
    },
  },
};

/**
 * Label float animation
 * Pour inputs avec labels flottants
 */
export const labelFloatVariants: Variants = {
  float: {
    y: -24,
    scale: 0.85,
    transition: {
      duration: TIMING.fast,
      ease: EASING.smooth,
    },
  },
  rest: {
    y: 0,
    scale: 1,
    transition: {
      duration: TIMING.fast,
      ease: EASING.smooth,
    },
  },
};

// ============================================
// BADGE / TAG VARIANTS
// ============================================

/**
 * Badge entrance
 * Pop-in avec bounce
 */
export const badgeEntranceVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

/**
 * Badge pulse (notification)
 * Pour attirer l'attention
 */
export const badgePulseVariants: Variants = {
  idle: {
    scale: 1,
  },
  pulse: {
    scale: [1, 1.15, 1],
    transition: {
      duration: TIMING.slow,
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
};

// ============================================
// ICON VARIANTS
// ============================================

/**
 * Icon spin (loading)
 * Rotation continue
 */
export const iconSpinVariants: Variants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Icon bounce (interaction feedback)
 * Pour boutons like, favorite, etc.
 */
export const iconBounceVariants: Variants = {
  rest: {
    scale: 1,
  },
  active: {
    scale: [1, 1.3, 1],
    transition: {
      duration: TIMING.normal,
      ease: EASING.bounce,
    },
  },
};

/**
 * Icon wiggle (attention)
 * Pour notifications importantes
 */
export const iconWiggleVariants: Variants = {
  wiggle: {
    rotate: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: TIMING.slow,
      ease: EASING.default,
    },
  },
};

// ============================================
// NOTIFICATION / TOAST VARIANTS
// ============================================

/**
 * Toast slide in from top
 * Pour notifications système
 */
export const toastVariants: Variants = {
  hidden: {
    y: -100,
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    y: -100,
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: TIMING.normal,
      ease: EASING.default,
    },
  },
};

/**
 * Toast slide in from side
 * Pour messages système moins urgents
 */
export const toastSideVariants: Variants = {
  hidden: {
    x: 400,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 25,
    },
  },
  exit: {
    x: 400,
    opacity: 0,
    transition: {
      duration: TIMING.normal,
      ease: EASING.default,
    },
  },
};

// ============================================
// PROGRESS / LOADING VARIANTS
// ============================================

/**
 * Progress bar fill animation
 * Smooth progression
 */
export const progressFillVariants: Variants = {
  initial: {
    scaleX: 0,
    originX: 0,
  },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: {
      duration: TIMING.normal,
      ease: EASING.smooth,
    },
  }),
};

/**
 * Skeleton shimmer effect
 * Pour placeholders de contenu
 */
export const skeletonShimmerVariants: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ============================================
// MENU / DROPDOWN VARIANTS
// ============================================

/**
 * Dropdown menu reveal
 * Fade + slide from top
 */
export const dropdownVariants: Variants = {
  closed: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: TIMING.fast,
    },
  },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: TIMING.fast,
      ease: EASING.smooth,
    },
  },
};

/**
 * Menu items stagger
 * Pour listes de menu
 */
export const menuItemsVariants: Variants = {
  closed: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
  open: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const menuItemVariants: Variants = {
  closed: {
    opacity: 0,
    x: -10,
  },
  open: {
    opacity: 1,
    x: 0,
    transition: {
      duration: TIMING.normal,
      ease: EASING.smooth,
    },
  },
};

// ============================================
// TAB / NAVIGATION VARIANTS
// ============================================

/**
 * Tab switch animation
 * Slide + fade
 */
export const tabContentVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: TIMING.normal,
      ease: EASING.smooth,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -20 : 20,
    opacity: 0,
    transition: {
      duration: TIMING.normal,
      ease: EASING.smooth,
    },
  }),
};

/**
 * Active tab indicator
 * Underline qui slide
 */
export const tabIndicatorVariants: Variants = {
  animate: {
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

// ============================================
// SCROLL REVEAL VARIANTS
// ============================================

/**
 * Fade in on scroll
 * Pour sections de page
 */
export const scrollFadeVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.slow,
      ease: EASING.smooth,
    },
  },
};

/**
 * Slide in on scroll (from side)
 * Pour éléments qui entrent latéralement
 */
export const scrollSlideVariants: Variants = {
  hiddenLeft: {
    opacity: 0,
    x: -50,
  },
  hiddenRight: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: TIMING.slow,
      ease: EASING.smooth,
    },
  },
};

// ============================================
// SPECIAL EFFECTS
// ============================================

/**
 * Glow pulse effect
 * Pour éléments premium
 */
export const glowPulseVariants: Variants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(168, 85, 247, 0.3)',
      '0 0 40px rgba(168, 85, 247, 0.6)',
      '0 0 20px rgba(168, 85, 247, 0.3)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: EASING.gentle,
    },
  },
};

/**
 * Floating animation
 * Pour éléments décoratifs
 */
export const floatingVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: EASING.gentle,
    },
  },
};

/**
 * Particle effect (scale + opacity)
 * Pour célébrations, confetti
 */
export const particleVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 1,
  },
  animate: {
    scale: [0, 1, 1.5],
    opacity: [1, 1, 0],
    transition: {
      duration: TIMING.slower,
      ease: EASING.easeOut,
    },
  },
};

// ============================================
// COCONUT V14 SPECIFIC
// ============================================

/**
 * CocoBoard card entrance
 * Pour cartes d'assets, specs, références
 */
export const cocoBoardCardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: TIMING.normal,
      delay: index * 0.1,
      ease: EASING.smooth,
    },
  }),
};

/**
 * Generation progress animation
 * Pour barre de progression CocoBoard
 */
export const generationProgressVariants: Variants = {
  analyzing: {
    width: '30%',
    backgroundColor: '#F59E0B',
    transition: {
      duration: TIMING.slow,
      ease: EASING.smooth,
    },
  },
  prompting: {
    width: '60%',
    backgroundColor: '#3B82F6',
    transition: {
      duration: TIMING.slow,
      ease: EASING.smooth,
    },
  },
  generating: {
    width: '90%',
    backgroundColor: '#8B5CF6',
    transition: {
      duration: TIMING.slow,
      ease: EASING.smooth,
    },
  },
  complete: {
    width: '100%',
    backgroundColor: '#10B981',
    transition: {
      duration: TIMING.normal,
      ease: EASING.smooth,
    },
  },
};

/**
 * Result reveal (génération terminée)
 * Celebration animation
 */
export const resultRevealVariants: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    rotateY: -90,
  },
  visible: {
    scale: 1,
    opacity: 1,
    rotateY: 0,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 15,
      delay: 0.2,
    },
  },
};
