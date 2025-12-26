/**
 * COCONUT V14 - PHASE 4 JOUR 3
 * Micro-Interactions Library
 * 
 * Petites animations qui améliorent le feedback utilisateur
 * BDS: Rhétorique du Message (Communication impactante)
 */

import { Variants, TargetAndTransition } from 'motion/react';
import { TIMING, EASING } from './transitions';

// ============================================
// HOVER INTERACTIONS
// ============================================

/**
 * Hover lift (élévation subtile)
 * Usage: Cartes, boutons, liens
 */
export const hoverLift: TargetAndTransition = {
  y: -4,
  transition: {
    duration: TIMING.fast,
    ease: EASING.snappy,
  },
};

/**
 * Hover scale up
 * Usage: Images, thumbnails, icônes
 */
export const hoverScaleUp: TargetAndTransition = {
  scale: 1.05,
  transition: {
    duration: TIMING.fast,
    ease: EASING.smooth,
  },
};

/**
 * Hover glow (shadow expansion)
 * Usage: Boutons premium, CTAs
 */
export const hoverGlow: TargetAndTransition = {
  boxShadow: '0 8px 30px rgba(168, 85, 247, 0.4)',
  transition: {
    duration: TIMING.normal,
    ease: EASING.smooth,
  },
};

/**
 * Hover brightness
 * Usage: Images, overlays
 */
export const hoverBrightness: TargetAndTransition = {
  filter: 'brightness(1.1)',
  transition: {
    duration: TIMING.fast,
  },
};

/**
 * Hover tilt (rotation 3D)
 * Usage: Cartes premium, images
 */
export const hoverTilt = (direction: 'left' | 'right' = 'right'): TargetAndTransition => ({
  rotateY: direction === 'right' ? 5 : -5,
  rotateX: -2,
  transition: {
    duration: TIMING.normal,
    ease: EASING.smooth,
  },
});

// ============================================
// CLICK / TAP INTERACTIONS
// ============================================

/**
 * Click scale down (press effect)
 * Usage: Tous les boutons, éléments cliquables
 */
export const clickScaleDown: TargetAndTransition = {
  scale: 0.95,
  transition: {
    duration: TIMING.instant,
    ease: EASING.snappy,
  },
};

/**
 * Click ripple effect
 * Animation de cercle qui s'expand depuis le point de click
 */
export const clickRippleVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0.8,
  },
  animate: {
    scale: 4,
    opacity: 0,
    transition: {
      duration: TIMING.slow,
      ease: EASING.easeOut,
    },
  },
};

/**
 * Click bounce (rebond)
 * Pour feedback positif
 */
export const clickBounce: TargetAndTransition = {
  scale: [1, 0.9, 1.1, 1],
  transition: {
    duration: TIMING.normal,
    times: [0, 0.3, 0.7, 1],
    ease: EASING.bounce,
  },
};

// ============================================
// FOCUS INTERACTIONS
// ============================================

/**
 * Focus ring expansion
 * Pour inputs, boutons (keyboard nav)
 */
export const focusRing: TargetAndTransition = {
  boxShadow: '0 0 0 3px rgba(168, 85, 247, 0.4)',
  transition: {
    duration: TIMING.fast,
    ease: EASING.smooth,
  },
};

/**
 * Focus glow
 * Alternative au ring, plus subtil
 */
export const focusGlow: TargetAndTransition = {
  filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))',
  transition: {
    duration: TIMING.fast,
  },
};

/**
 * Focus scale
 * Légère augmentation de taille
 */
export const focusScale: TargetAndTransition = {
  scale: 1.02,
  transition: {
    duration: TIMING.fast,
    ease: EASING.smooth,
  },
};

// ============================================
// DRAG INTERACTIONS
// ============================================

/**
 * Drag constraints presets
 * Pour drag & drop
 */
export const dragConstraints = {
  small: { top: -10, left: -10, right: 10, bottom: 10 },
  medium: { top: -50, left: -50, right: 50, bottom: 50 },
  large: { top: -100, left: -100, right: 100, bottom: 100 },
};

/**
 * Drag active state
 * Visual feedback pendant le drag
 */
export const dragActive: TargetAndTransition = {
  scale: 1.05,
  opacity: 0.8,
  cursor: 'grabbing',
  transition: {
    duration: TIMING.instant,
  },
};

/**
 * Drag elastic return
 * Retour élastique à la position initiale
 */
export const dragElasticReturn = {
  transition: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
  },
};

// ============================================
// TOGGLE / SWITCH INTERACTIONS
// ============================================

/**
 * Switch toggle animation
 * Pour toggles, switches
 */
export const switchToggleVariants: Variants = {
  off: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  on: {
    x: 20,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
};

/**
 * Checkbox check animation
 * Pour checkboxes
 */
export const checkboxCheckVariants: Variants = {
  unchecked: {
    pathLength: 0,
    opacity: 0,
  },
  checked: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
      opacity: { duration: 0.01 },
    },
  },
};

// ============================================
// NOTIFICATION FEEDBACK
// ============================================

/**
 * Success pulse
 * Feedback de succès
 */
export const successPulse: TargetAndTransition = {
  scale: [1, 1.1, 1],
  backgroundColor: ['#10B981', '#34D399', '#10B981'],
  transition: {
    duration: TIMING.slow,
    times: [0, 0.5, 1],
  },
};

/**
 * Error shake
 * Feedback d'erreur
 */
export const errorShake: TargetAndTransition = {
  x: [0, -8, 8, -8, 8, 0],
  transition: {
    duration: TIMING.slow,
  },
};

/**
 * Warning pulse
 * Feedback d'avertissement
 */
export const warningPulse: TargetAndTransition = {
  scale: [1, 1.05, 1],
  backgroundColor: ['#F59E0B', '#FBBF24', '#F59E0B'],
  transition: {
    duration: TIMING.normal,
    repeat: 2,
  },
};

// ============================================
// COPY / PASTE FEEDBACK
// ============================================

/**
 * Copy success animation
 * Quand on copie du texte
 */
export const copySuccessVariants: Variants = {
  idle: {
    scale: 1,
    opacity: 1,
  },
  copied: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.6, 1],
    transition: {
      duration: TIMING.normal,
    },
  },
};

/**
 * Paste flash
 * Quand on colle du contenu
 */
export const pasteFlash: TargetAndTransition = {
  backgroundColor: ['transparent', 'rgba(168, 85, 247, 0.2)', 'transparent'],
  transition: {
    duration: TIMING.slow,
    times: [0, 0.5, 1],
  },
};

// ============================================
// LOADING / WAITING STATES
// ============================================

/**
 * Loading dots (3 dots qui pulsent)
 * Container variant
 */
export const loadingDotsContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

/**
 * Individual dot animation
 */
export const loadingDot: Variants = {
  animate: {
    y: [0, -10, 0],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: EASING.easeInOut,
    },
  },
};

/**
 * Loading spinner rotation
 */
export const loadingSpinner: TargetAndTransition = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  },
};

/**
 * Loading pulse (background)
 */
export const loadingPulse: Variants = {
  animate: {
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: EASING.gentle,
    },
  },
};

// ============================================
// COUNT / NUMBER CHANGES
// ============================================

/**
 * Number increment bounce
 * Pour compteurs, likes, etc.
 */
export const numberIncrementBounce: TargetAndTransition = {
  scale: [1, 1.3, 1],
  color: ['#ffffff', '#10B981', '#ffffff'],
  transition: {
    duration: TIMING.normal,
    times: [0, 0.5, 1],
  },
};

/**
 * Number decrement shake
 * Pour compteurs en décrémentation
 */
export const numberDecrementShake: TargetAndTransition = {
  x: [0, -5, 5, 0],
  color: ['#ffffff', '#EF4444', '#ffffff'],
  transition: {
    duration: TIMING.normal,
  },
};

// ============================================
// BADGE / INDICATOR ANIMATIONS
// ============================================

/**
 * Badge pop-in
 * Pour nouveaux badges, notifications
 */
export const badgePopIn: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
    },
  },
};

/**
 * Badge attention pulse
 * Pour attirer l'attention
 */
export const badgeAttentionPulse: Variants = {
  animate: {
    scale: [1, 1.2, 1],
    boxShadow: [
      '0 0 0 0 rgba(239, 68, 68, 0.7)',
      '0 0 0 8px rgba(239, 68, 68, 0)',
      '0 0 0 0 rgba(239, 68, 68, 0)',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
    },
  },
};

// ============================================
// TOOLTIP / POPOVER INTERACTIONS
// ============================================

/**
 * Tooltip fade in
 * Apparition subtile
 */
export const tooltipFadeIn: Variants = {
  hidden: {
    opacity: 0,
    y: 5,
    scale: 0.95,
  },
  visible: {
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
 * Popover spring open
 * Ouverture dynamique
 */
export const popoverSpringOpen: Variants = {
  closed: {
    scale: 0,
    opacity: 0,
  },
  open: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
};

// ============================================
// SKELETON / PLACEHOLDER ANIMATIONS
// ============================================

/**
 * Skeleton shimmer
 * Pour loading placeholders
 */
export const skeletonShimmer: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Skeleton pulse
 * Alternative au shimmer
 */
export const skeletonPulse: Variants = {
  animate: {
    opacity: [0.4, 0.7, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: EASING.gentle,
    },
  },
};

// ============================================
// CONFETTI / CELEBRATION
// ============================================

/**
 * Confetti burst (single particle)
 * Pour célébrations
 */
export const confettiParticle = (index: number): Variants => ({
  initial: {
    y: 0,
    opacity: 1,
    scale: 1,
  },
  animate: {
    y: [0, -100 - Math.random() * 100],
    x: [(Math.random() - 0.5) * 200],
    rotate: [0, (Math.random() - 0.5) * 720],
    opacity: [1, 1, 0],
    scale: [1, 0.8],
    transition: {
      duration: 1.5 + Math.random() * 0.5,
      delay: index * 0.05,
      ease: [0.22, 1, 0.36, 1],
    },
  },
});

/**
 * Success celebration
 * Animation complète de célébration
 */
export const successCelebration: Variants = {
  initial: {
    scale: 0,
    rotate: -180,
  },
  animate: {
    scale: [0, 1.2, 1],
    rotate: [0, 10, 0],
    transition: {
      duration: TIMING.slow,
      times: [0, 0.6, 1],
      ease: EASING.bounce,
    },
  },
};

// ============================================
// COCONUT V14 SPECIFIC MICRO-INTERACTIONS
// ============================================

/**
 * Credit indicator pulse
 * Quand les crédits changent
 */
export const creditPulse: TargetAndTransition = {
  scale: [1, 1.15, 1],
  boxShadow: [
    '0 0 0 0 rgba(168, 85, 247, 0.4)',
    '0 0 20px 5px rgba(168, 85, 247, 0)',
    '0 0 0 0 rgba(168, 85, 247, 0)',
  ],
  transition: {
    duration: TIMING.slow,
  },
};

/**
 * Asset card reveal
 * Pour cartes d'assets dans CocoBoard
 */
export const assetCardReveal: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotateX: -45,
  },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: TIMING.slow,
      delay: index * 0.1,
      ease: EASING.smooth,
    },
  }),
};

/**
 * Prompt editor focus glow
 * Pour Monaco Editor
 */
export const promptEditorFocus: TargetAndTransition = {
  boxShadow: '0 0 0 3px rgba(168, 85, 247, 0.3), 0 0 30px rgba(168, 85, 247, 0.2)',
  transition: {
    duration: TIMING.normal,
    ease: EASING.smooth,
  },
};

/**
 * Generation complete sparkle
 * Quand la génération est terminée
 */
export const generationCompleteSparkle: Variants = {
  initial: {
    scale: 0,
    rotate: 0,
  },
  animate: {
    scale: [0, 1.5, 1],
    rotate: [0, 180, 360],
    transition: {
      duration: TIMING.slower,
      ease: EASING.bounce,
    },
  },
};

// ============================================
// GLASS CARD ANIMATIONS
// ============================================

/**
 * Glass card hover + tilt effect
 * Pour GlassCard component avec effet 3D
 */
export const glassCardVariants: Variants = {
  initial: {
    scale: 1,
    rotateY: 0,
    rotateX: 0,
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: TIMING.normal,
      ease: EASING.smooth,
    },
  },
  tilt: (direction: { x: number; y: number }) => ({
    rotateY: direction.x * 10,
    rotateX: -direction.y * 10,
    transition: {
      duration: TIMING.fast,
      ease: EASING.smooth,
    },
  }),
};