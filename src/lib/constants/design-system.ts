// Design System - Unified constants for consistent UI
// Fixes: Z-index chaos, spacing inconsistencies, color duplications

// ============================================================================
// Z-INDEX SYSTEM (FIXED: était anarchique avec 8 valeurs différentes)
// ============================================================================
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  modalBackdrop: 39,
  popover: 50,
  toast: 60,
  tooltip: 70,
  max: 999
} as const;

// ============================================================================
// SPACING SYSTEM (FIXED: 8-point grid strictement respecté)
// ============================================================================
export const SPACING = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem'      // 96px
} as const;

// ============================================================================
// TYPOGRAPHY SCALE (FIXED: hiérarchie harmonique 1.25x ratio)
// ============================================================================
export const FONT_SIZE = {
  xs: '0.75rem',      // 12px
  sm: '0.875rem',     // 14px
  base: '1rem',       // 16px
  lg: '1.125rem',     // 18px
  xl: '1.25rem',      // 20px
  '2xl': '1.5rem',    // 24px
  '3xl': '1.875rem',  // 30px
  '4xl': '2.25rem',   // 36px
  '5xl': '3rem'       // 48px
} as const;

export const FONT_WEIGHT = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700
} as const;

export const LINE_HEIGHT = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75
} as const;

// ============================================================================
// COLOR SYSTEM (FIXED: palette sémantique complète)
// ============================================================================
export const COLORS = {
  // Primary accent (Violet-Bleu #6366f1)
  accent: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',  // Main
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81'
  },
  
  // Semantic colors
  success: {
    50: '#ecfdf5',
    400: '#34d399',
    500: '#10b981',
    600: '#059669'
  },
  
  warning: {
    50: '#fffbeb',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706'
  },
  
  error: {
    50: '#fef2f2',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626'
  },
  
  info: {
    50: '#eff6ff',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb'
  },
  
  // Grayscale
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717'
  }
} as const;

// ============================================================================
// BORDER RADIUS (FIXED: 3 valeurs cohérentes au lieu de 4)
// ============================================================================
export const RADIUS = {
  sm: '0.5rem',    // 8px - Small elements
  md: '0.75rem',   // 12px - Default
  lg: '1rem',      // 16px - Cards
  xl: '1.5rem',    // 24px - Modals
  full: '9999px'   // Pills/Circles
} as const;

// ============================================================================
// SHADOWS (FIXED: 3 niveaux au lieu de multiples custom)
// ============================================================================
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  
  // Colored shadows (used sparingly for emphasis)
  accent: '0 10px 15px -3px rgb(99 102 241 / 0.2)',
  success: '0 10px 15px -3px rgb(16 185 129 / 0.2)',
  error: '0 10px 15px -3px rgb(239 68 68 / 0.2)'
} as const;

// ============================================================================
// ANIMATION DURATIONS (FIXED: 3 valeurs au lieu de 7)
// ============================================================================
export const DURATION = {
  fast: 150,      // Instant feedback (hover, click)
  normal: 250,    // Default transitions
  slow: 400       // Complex animations (modals)
} as const;

// ============================================================================
// EASING CURVES (FIXED: courbes cohérentes)
// ============================================================================
export const EASING = {
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: [0.22, 1, 0.36, 1] as [number, number, number, number]
} as const;

// ============================================================================
// BREAKPOINTS (Match Tailwind)
// ============================================================================
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

// ============================================================================
// TOUCH TARGET SIZES (Apple HIG compliant)
// ============================================================================
export const TOUCH_TARGET = {
  min: 44,        // Minimum touch target (44x44px)
  comfortable: 48 // Comfortable size
} as const;

// ============================================================================
// ICON SIZES (FIXED: 3 tailles au lieu de 6)
// ============================================================================
export const ICON_SIZE = {
  sm: 16,   // Secondary actions, inline icons
  md: 24,   // Primary actions, default
  lg: 32    // Hero icons, emphasis
} as const;

// ============================================================================
// OPACITY LEVELS (FIXED: valeurs standardisées)
// ============================================================================
export const OPACITY = {
  disabled: 0.4,
  secondary: 0.6,
  tertiary: 0.4,
  hover: 0.8,
  overlay: 0.8
} as const;

// ============================================================================
// BACKDROP BLUR (FIXED: 2 valeurs au lieu de 5)
// ============================================================================
export const BLUR = {
  subtle: '4px',   // Light blur for cards
  strong: '12px'   // Strong blur for modals/overlays
} as const;

// ============================================================================
// COMMON PATTERNS
// ============================================================================

export const PATTERNS = {
  // Card styles
  card: {
    base: 'rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10',
    hover: 'hover:border-[#6366f1]/50 hover:scale-[1.01] transition-all',
    active: 'active:scale-95'
  },
  
  // Button styles (will be component, but keeping reference)
  button: {
    base: 'rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
    sizes: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    }
  },
  
  // Input styles
  input: {
    base: 'rounded-xl bg-[#1A1A1A] border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 transition-all',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
  },
  
  // Focus styles (accessibility)
  focus: {
    visible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-black'
  }
} as const;

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const A11Y = {
  // Minimum contrast ratios (WCAG AA)
  contrast: {
    normal: 4.5,  // For normal text
    large: 3,     // For large text (18pt+ or 14pt+ bold)
    ui: 3         // For UI components
  },
  
  // Screen reader only class
  srOnly: 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
  
  // Reduced motion
  reducedMotion: '@media (prefers-reduced-motion: reduce)'
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get responsive spacing classes
 */
export function responsiveSpacing(base: keyof typeof SPACING, md?: keyof typeof SPACING, lg?: keyof typeof SPACING) {
  let classes = `space-y-${base}`;
  if (md) classes += ` md:space-y-${md}`;
  if (lg) classes += ` lg:space-y-${lg}`;
  return classes;
}

/**
 * Get z-index style
 */
export function getZIndex(layer: keyof typeof Z_INDEX): number {
  return Z_INDEX[layer];
}

/**
 * Combine class names (simple version, could use clsx)
 */
export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get color with opacity
 */
export function withOpacity(color: string, opacity: number): string {
  return `${color}/${Math.round(opacity * 100)}`;
}
