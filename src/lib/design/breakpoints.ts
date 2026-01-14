/**
 * RESPONSIVE BREAKPOINTS SYSTEM
 * Phase 8 - Responsivité Complète
 * 
 * Système centralisé de breakpoints pour Coconut V14
 * Aligné sur Tailwind CSS defaults
 * 
 * Usage:
 * import { breakpoints, mediaQueries } from '@/lib/design/breakpoints';
 */

// ============================================
// BREAKPOINT VALUES (px)
// ============================================

/**
 * Breakpoints alignés sur Tailwind CSS
 */
export const breakpoints = {
  xs: 0,       // Extra small (mobile portrait)
  sm: 640,     // Small (mobile landscape)
  md: 768,     // Medium (tablet)
  lg: 1024,    // Large (desktop)
  xl: 1280,    // Extra large (large desktop)
  '2xl': 1536, // 2X large (ultra-wide)
} as const;

/**
 * Breakpoint names
 */
export type Breakpoint = keyof typeof breakpoints;

// ============================================
// MEDIA QUERIES (CSS)
// ============================================

/**
 * Media queries for CSS-in-JS
 */
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs}px)`,
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
  
  // Max-width variants
  maxSm: `(max-width: ${breakpoints.sm - 1}px)`,
  maxMd: `(max-width: ${breakpoints.md - 1}px)`,
  maxLg: `(max-width: ${breakpoints.lg - 1}px)`,
  maxXl: `(max-width: ${breakpoints.xl - 1}px)`,
  max2xl: `(max-width: ${breakpoints['2xl'] - 1}px)`,
  
  // Range variants
  smToMd: `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`,
  mdToLg: `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  lgToXl: `(min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`,
  
  // Device-specific
  mobile: `(max-width: ${breakpoints.md - 1}px)`,
  tablet: `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  desktop: `(min-width: ${breakpoints.lg}px)`,
  
  // Orientation
  landscape: '(orientation: landscape)',
  portrait: '(orientation: portrait)',
  
  // Touch device
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)',
  
  // Reduced motion
  reducedMotion: '(prefers-reduced-motion: reduce)',
  
  // Dark mode
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
} as const;

// ============================================
// DEVICE CATEGORIES
// ============================================

export const deviceCategories = {
  mobile: {
    min: 0,
    max: breakpoints.md - 1,
    label: 'Mobile',
  },
  tablet: {
    min: breakpoints.md,
    max: breakpoints.lg - 1,
    label: 'Tablet',
  },
  desktop: {
    min: breakpoints.lg,
    max: Infinity,
    label: 'Desktop',
  },
} as const;

export type DeviceCategory = keyof typeof deviceCategories;

// ============================================
// RESPONSIVE SPACING
// ============================================

/**
 * Spacing scale adaptatif selon viewport
 * Format: [mobile, tablet, desktop]
 */
export const responsiveSpacing = {
  // Container padding
  containerPadding: {
    mobile: '1rem',     // 16px
    tablet: '1.5rem',   // 24px
    desktop: '2rem',    // 32px
  },
  
  // Section spacing
  sectionGap: {
    mobile: '1.5rem',   // 24px
    tablet: '2rem',     // 32px
    desktop: '3rem',    // 48px
  },
  
  // Card padding
  cardPadding: {
    mobile: '1rem',     // 16px
    tablet: '1.25rem',  // 20px
    desktop: '1.5rem',  // 24px
  },
  
  // Grid gap
  gridGap: {
    mobile: '1rem',     // 16px
    tablet: '1.25rem',  // 20px
    desktop: '1.5rem',  // 24px
  },
} as const;

// ============================================
// RESPONSIVE GRID COLUMNS
// ============================================

/**
 * Grid columns selon viewport
 */
export const responsiveColumns = {
  stats: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  },
  gallery: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
  cards: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
  features: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  },
} as const;

// ============================================
// TOUCH TARGETS
// ============================================

/**
 * Minimum touch target sizes (WCAG AA)
 */
export const touchTargets = {
  minimum: 44,      // 44px minimum (WCAG AA)
  comfortable: 48,  // 48px comfortable
  large: 56,        // 56px large buttons
} as const;

// ============================================
// RESPONSIVE FONT SIZES
// ============================================

/**
 * Font sizes adaptatifs (déjà gérés par globals.css mais référence ici)
 */
export const responsiveFontSizes = {
  h1: {
    mobile: '2rem',      // 32px
    tablet: '2.5rem',    // 40px
    desktop: '3rem',     // 48px
  },
  h2: {
    mobile: '1.5rem',    // 24px
    tablet: '1.875rem',  // 30px
    desktop: '2.25rem',  // 36px
  },
  h3: {
    mobile: '1.25rem',   // 20px
    tablet: '1.5rem',    // 24px
    desktop: '1.875rem', // 30px
  },
  body: {
    mobile: '1rem',      // 16px
    tablet: '1rem',      // 16px
    desktop: '1.125rem', // 18px
  },
  small: {
    mobile: '0.875rem',  // 14px
    tablet: '0.875rem',  // 14px
    desktop: '1rem',     // 16px
  },
} as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get current breakpoint from window width
 */
export function getCurrentBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

/**
 * Get device category from window width
 */
export function getDeviceCategory(width: number): DeviceCategory {
  if (width < breakpoints.md) return 'mobile';
  if (width < breakpoints.lg) return 'tablet';
  return 'desktop';
}

/**
 * Check if width is mobile
 */
export function isMobile(width: number): boolean {
  return width < breakpoints.md;
}

/**
 * Check if width is tablet
 */
export function isTablet(width: number): boolean {
  return width >= breakpoints.md && width < breakpoints.lg;
}

/**
 * Check if width is desktop
 */
export function isDesktop(width: number): boolean {
  return width >= breakpoints.lg;
}

/**
 * Get responsive value based on current width
 */
export function getResponsiveValue<T>(
  width: number,
  values: { mobile: T; tablet: T; desktop: T }
): T {
  if (width < breakpoints.md) return values.mobile;
  if (width < breakpoints.lg) return values.tablet;
  return values.desktop;
}

/**
 * Get Tailwind responsive classes
 */
export function getResponsiveClasses(
  baseClass: string,
  mobile?: string,
  tablet?: string,
  desktop?: string
): string {
  const classes = [baseClass];
  if (mobile) classes.push(mobile);
  if (tablet) classes.push(`md:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);
  return classes.join(' ');
}
