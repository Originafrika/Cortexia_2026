/**
 * 🎨 ENTERPRISE DESIGN SYSTEM
 * Coconut V14 - Professional Grade Design Tokens
 * 
 * Inspired by: Figma, Notion, Linear
 * Philosophy: Clean, Minimal, Efficient, Scalable
 * 
 * BDS 7 Arts Integration:
 * - Grammaire: Cohérence des tokens
 * - Logique: Hiérarchie claire
 * - Rhétorique: Communication visuelle
 * - Arithmétique: Rythme harmonique
 * - Géométrie: Proportions parfaites
 * - Musique: Motion orchestré
 * - Astronomie: Vision systémique
 */

// ============================================
// 1. COLOR PALETTE - GRAY-BASED PROFESSIONAL
// ============================================

export const colors = {
  // Grays - Primary palette
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Brand - Coconut accent (minimal usage)
  coconut: {
    50: '#FFF9F0',
    100: '#FFF3E0',
    200: '#FFE4C4',
    300: '#FFD4A8',
    400: '#FFB88C',
    500: '#FF9D70',  // Primary brand color
    600: '#E8885A',
    700: '#C4714A',
    800: '#A05A3A',
    900: '#7C432A',
  },
  
  // Semantic colors
  success: {
    50: '#F0FDF4',
    500: '#22C55E',
    600: '#16A34A',
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
  },
  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
  },
  info: {
    50: '#EFF6FF',
    500: '#3B82F6',
    600: '#2563EB',
  },
  
  // UI States
  background: '#FFFFFF',
  surface: '#FAFAFA',
  border: '#E5E5E5',
  text: {
    primary: '#171717',
    secondary: '#525252',
    tertiary: '#A3A3A3',
    inverse: '#FFFFFF',
  },
} as const;

// ============================================
// 2. TYPOGRAPHY - SYSTEM FONT STACK
// ============================================

export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
} as const;

// ============================================
// 3. SPACING - 4PX GRID SYSTEM
// ============================================

export const spacing = {
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
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const;

// ============================================
// 4. SHADOWS - SUBTLE ELEVATION
// ============================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

// ============================================
// 5. BORDERS - MINIMAL & FUNCTIONAL
// ============================================

export const borders = {
  width: {
    none: '0',
    thin: '1px',
    medium: '2px',
    thick: '4px',
  },
  radius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.375rem', // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },
  color: colors.border,
} as const;

// ============================================
// 6. LAYOUT DIMENSIONS
// ============================================

export const layout = {
  sidebar: {
    width: '240px',
    widthCollapsed: '64px',
  },
  topbar: {
    height: '64px',
  },
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// ============================================
// 7. MOTION - SMOOTH & PURPOSEFUL
// ============================================

export const motion = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  
  transition: {
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================
// 8. Z-INDEX SCALE
// ============================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 10000,
} as const;

// ============================================
// 9. COMPONENT-SPECIFIC TOKENS
// ============================================

export const components = {
  button: {
    height: {
      sm: '32px',
      base: '40px',
      lg: '48px',
    },
    padding: {
      sm: '0 12px',
      base: '0 16px',
      lg: '0 24px',
    },
  },
  
  input: {
    height: {
      sm: '32px',
      base: '40px',
      lg: '48px',
    },
    padding: {
      sm: '0 12px',
      base: '0 16px',
      lg: '0 24px',
    },
  },
  
  card: {
    padding: {
      sm: '16px',
      base: '24px',
      lg: '32px',
    },
  },
  
  badge: {
    height: '20px',
    padding: '0 8px',
    fontSize: '0.75rem',
  },
} as const;

// ============================================
// 10. UTILITY CLASSES REFERENCE
// ============================================

export const utilities = {
  // Focus ring
  focusRing: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-coconut-500 focus-visible:ring-offset-2',
  
  // Hover transitions
  hoverTransition: 'transition-all duration-150 ease-in-out',
  
  // Card hover
  cardHover: 'hover:shadow-md hover:border-gray-300',
  
  // Text truncate
  truncate: 'truncate overflow-hidden text-ellipsis whitespace-nowrap',
  
  // Disabled state
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
} as const;

// ============================================
// EXPORTS
// ============================================

export const enterpriseDesignSystem = {
  colors,
  typography,
  spacing,
  shadows,
  borders,
  layout,
  motion,
  zIndex,
  components,
  utilities,
} as const;

export default enterpriseDesignSystem;
