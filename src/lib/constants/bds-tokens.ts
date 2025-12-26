/**
 * Beauty Design System (BDS) Tokens
 * 
 * Complete token system for Coconut V7
 * Reference: Blueprint Section 2 (Tokens — The Aesthetic DNA)
 * 
 * @module bds-tokens
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

/**
 * BDS Color Palette
 * All colors from the Beauty Design System specification
 */
export const BDS_COLORS = {
  // Atmospheric Colors (A-Colors) — Cinematic, soft, moody
  A1: '#D1D5DB', // Mist Grey
  A2: '#1F2937', // Deep Charcoal
  A3: '#1E3A8A', // Dusk Blue
  A4: '#D97706', // Warm Sand
  A5: '#4C1D95', // Midnight Violet
  
  // Emotional Colors (E-Colors) — Chroma tied to emotion
  E1: '#3B82F6', // Serenity Blue
  E2: '#EF4444', // Passion Red
  E3: '#F59E0B', // Wisdom Gold
  E4: '#000000', // Mystery Black
  E5: '#14B8A6', // Trust Teal
  
  // Contrast Colors (X-Colors) — For highlights & focal points only
  X1: '#FFFFFF', // Pure White
  X2: '#8B5CF6', // Neon Electric (Primary brand color)
  X3: '#10B981', // Jade Punch
  
  // Application-specific colors (derived from BDS)
  background: {
    primary: '#0A0A0F',   // Main app background
    secondary: '#13131A', // Card backgrounds
    tertiary: '#1A1A24',  // Elevated surfaces
  },
  
  border: {
    default: '#2A2A38',   // Default borders
    focus: '#8B5CF6',     // Focus state
    hover: '#3A3A48',     // Hover state
  },
  
  text: {
    primary: '#FFFFFF',   // Primary text
    secondary: '#9CA3AF', // Secondary text
    tertiary: '#6B7280',  // Tertiary text
    disabled: '#4B5563',  // Disabled text
  },
  
  // Status colors (for node states)
  status: {
    placeholder: '#6B7280',  // Not yet generated
    queued: '#6366F1',       // In queue
    generating: '#3B82F6',   // Currently generating
    validating: '#F59E0B',   // Awaiting validation
    done: '#10B981',         // Successfully completed
    approved: '#059669',     // User approved
    failed: '#EF4444',       // Generation failed
    paused: '#9CA3AF',       // Paused
  },
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

/**
 * BDS Spacing Scale
 * Spacing = breathing room
 * Reference: Blueprint Section 2.3
 */
export const BDS_SPACING = {
  XS: 4,   // Extra small
  S: 8,    // Small
  M: 16,   // Medium
  L: 24,   // Large
  XL: 32,  // Extra large
  XXL: 48, // Double extra large
} as const;

// ============================================================================
// MOTION TOKENS
// ============================================================================

/**
 * BDS Motion System
 * Motion expresses emotion through timing, spacing, and easing
 * Reference: Blueprint Section 3 (Motion System)
 */
export const BDS_MOTION = {
  // Easing curves (cubic-bezier values)
  M1: [0.25, 0.46, 0.45, 0.94],      // Ease-Out Cubic (impact, lift)
  M2: [0.42, 0, 0.58, 1],             // Ease-In-Out Quint (luxury smooth)
  M3: [0.68, -0.55, 0.265, 1.55],     // Overshoot 1.2 (playfulness)
  M4: [0.175, 0.885, 0.32, 1.275],    // Elastic Soft (organic, human)
  M5: [0, 0, 0.2, 1],                 // Decelerate Fade (calm serenity)
  
  // Timing durations (milliseconds)
  T1: 80,    // Snappy (hover feedback)
  T2: 120,   // Standard (click response)
  T3: 240,   // Smooth (view transitions)
  T4: 420,   // Cinematic (modal animations)
  T5: 1200,  // Dramatic (onboarding sequences)
} as const;

/**
 * Animation presets for common use cases
 */
export const ANIMATION_PRESETS = {
  // Button interactions
  buttonHover: {
    transition: {
      duration: BDS_MOTION.T2 / 1000,
      ease: BDS_MOTION.M1,
    },
  },
  
  buttonPress: {
    transition: {
      duration: BDS_MOTION.T1 / 1000,
      ease: BDS_MOTION.M3,
    },
  },
  
  // Modal animations
  modalOpen: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: {
      duration: BDS_MOTION.T4 / 1000,
      ease: BDS_MOTION.M2,
    },
  },
  
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -40 },
    transition: {
      duration: BDS_MOTION.T3 / 1000,
      ease: BDS_MOTION.M1,
    },
  },
  
  // Card entrance (stagger)
  cardStagger: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 20, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: BDS_MOTION.T3 / 1000,
          ease: BDS_MOTION.M1,
        },
      },
    },
  },
  
  // Panel slide
  panelSlide: {
    hidden: { x: 360, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: BDS_MOTION.T3 / 1000,
        ease: BDS_MOTION.M1,
      },
    },
  },
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

/**
 * BDS Typography System
 * Reference: Blueprint Section 2.2
 */
export const BDS_TYPOGRAPHY = {
  // Font families
  fontSans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontMono: 'JetBrains Mono, "Fira Code", "Courier New", monospace',
  
  // Font weights
  weightNormal: 400,
  weightMedium: 500,
  weightSemibold: 600,
  weightBold: 700,
  
  // Font sizes (rem units for accessibility)
  // Note: Blueprint specifies NOT to use these unless explicitly changing typography
  // These are defaults set in globals.css
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
  
  // Line heights
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================================================
// SHADOW & DEPTH TOKENS
// ============================================================================

/**
 * BDS Shadow System
 * To build cinematic depth
 * Reference: Blueprint Section 2.4
 */
export const BDS_SHADOWS = {
  D1: '0 1px 3px rgba(0, 0, 0, 0.1)',              // Soft Glow
  D2: '0 4px 12px rgba(0, 0, 0, 0.2)',             // Sharp Drop
  D3: '0 8px 24px rgba(0, 0, 0, 0.15)',            // Ambient Fog
  D4: '0 0 40px rgba(139, 92, 246, 0.4)',          // Spotlight Halo
  D5: '0 20px 60px rgba(0, 0, 0, 0.3)',            // Parallax Depth (motion only)
  
  // Interactive shadows
  cardRest: '0 1px 3px rgba(0, 0, 0, 0.1)',
  cardHover: '0 8px 16px rgba(139, 92, 246, 0.2)',
  cardSelected: '0 0 24px rgba(139, 92, 246, 0.5), inset 0 0 40px rgba(139, 92, 246, 0.15)',
  
  // Focus rings
  focusRing: '0 0 0 4px rgba(139, 92, 246, 0.3)',
  focusRingError: '0 0 0 4px rgba(239, 68, 68, 0.15)',
  focusRingSuccess: '0 0 0 4px rgba(16, 185, 129, 0.15)',
} as const;

// ============================================================================
// LAYOUT TOKENS
// ============================================================================

/**
 * Layout dimensions for Coconut V7
 * Reference: Blueprint Section 3.1 (Layout System)
 */
export const BDS_LAYOUT = {
  // Sidebar widths
  sidebarLeft: {
    expanded: 280,
    collapsed: 64,
  },
  
  sidebarRight: {
    width: 360,
  },
  
  // Top bar
  topBar: {
    height: 64,
  },
  
  // Bottom panel
  bottomPanel: {
    hidden: 0,
    compact: 200,
    expanded: 400,
    min: 150,
    max: 500,
  },
  
  // Grid columns (responsive)
  gridColumns: {
    desktop: 3,    // 1920×1080
    laptop: 2,     // 1440×900
    tablet: 2,     // 1024×768
    mobile: 1,     // 768×1024
  },
  
  // Breakpoints (pixels)
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    laptop: 1440,
    desktop: 1920,
  },
  
  // Card dimensions
  card: {
    minWidth: 280,
    maxWidth: 400,
    aspectRatio: '16 / 9',
  },
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * TypeScript types for BDS tokens
 * Ensures type safety when using tokens
 */
export type BDSColor = keyof typeof BDS_COLORS;
export type BDSSpacing = keyof typeof BDS_SPACING;
export type BDSMotionCurve = 'M1' | 'M2' | 'M3' | 'M4' | 'M5';
export type BDSMotionTiming = 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
export type BDSShadow = keyof typeof BDS_SHADOWS;

/**
 * Helper type for status colors
 */
export type NodeStatus = keyof typeof BDS_COLORS.status;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color value by status
 */
export function getStatusColor(status: NodeStatus): string {
  return BDS_COLORS.status[status];
}

/**
 * Get motion timing in seconds (for Framer Motion)
 */
export function getMotionDuration(timing: BDSMotionTiming): number {
  return BDS_MOTION[timing] / 1000;
}

/**
 * Get motion easing array (for Framer Motion)
 */
export function getMotionEasing(curve: BDSMotionCurve): number[] {
  return BDS_MOTION[curve];
}

/**
 * Convert spacing token to pixels
 */
export function getSpacing(size: BDSSpacing): number {
  return BDS_SPACING[size];
}
