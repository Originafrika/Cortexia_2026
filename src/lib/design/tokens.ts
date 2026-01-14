/**
 * BEAUTY DESIGN SYSTEM (BDS) - CENTRALIZED DESIGN TOKENS
 * Based on 7 Arts de Perfection Divine
 * 
 * Usage:
 * import { tokens, TRANSITIONS, SHADOWS } from '@/lib/design/tokens';
 * className={tokens.spacing.md}
 */

// ============================================
// SPACING SYSTEM (Géométrie Sacrée 4/8/16)
// ============================================
export const SPACING = {
  xs: '0.5rem',   // 8px
  sm: '1rem',     // 16px
  md: '1.5rem',   // 24px
  lg: '2rem',     // 32px
  xl: '3rem',     // 48px
  xxl: '4rem',    // 64px
} as const;

export const GAP = {
  tight: 'gap-2',   // 8px
  normal: 'gap-4',  // 16px
  loose: 'gap-6',   // 24px
  spacious: 'gap-8', // 32px
} as const;

// ============================================
// BORDER RADIUS (Cohérence)
// ============================================
export const RADIUS = {
  sm: 'rounded-lg',   // 8px - petits éléments (badges, inputs)
  md: 'rounded-xl',   // 12px - éléments moyens (buttons, cards)
  lg: 'rounded-2xl',  // 16px - grands containers (modals, sections)
  full: 'rounded-full', // cercles
} as const;

// ============================================
// SHADOWS (Depth)
// ============================================
export const SHADOWS = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  glow: 'shadow-[0_0_20px_rgba(139,115,85,0.4)]',
} as const;

// ============================================
// LIQUID GLASS SYSTEM (Premium)
// ============================================
export const GLASS = {
  // Glass levels (backdrop blur + opacity)
  subtle: 'bg-white/20 backdrop-blur-sm',       // 20% opacity, subtle blur
  medium: 'bg-white/40 backdrop-blur-md',       // 40% opacity, medium blur
  strong: 'bg-white/60 backdrop-blur-lg',       // 60% opacity, strong blur
  intense: 'bg-white/80 backdrop-blur-xl',      // 80% opacity, intense blur
  ultra: 'bg-white/90 backdrop-blur-[60px]',    // 90% opacity, ultra blur
  
  // Ambient glows (colored shadows for depth)
  glowShell: 'shadow-[0_8px_32px_rgba(120,53,15,0.15),0_0_0_1px_rgba(255,255,255,0.4)_inset]',
  glowHusk: 'shadow-[0_8px_32px_rgba(146,64,14,0.15),0_0_0_1px_rgba(255,255,255,0.4)_inset]',
  glowPalm: 'shadow-[0_8px_32px_rgba(22,163,74,0.15),0_0_0_1px_rgba(255,255,255,0.4)_inset]',
  glowCream: 'shadow-[0_8px_32px_rgba(255,247,237,0.25),0_0_0_1px_rgba(255,255,255,0.5)_inset]',
  glowWarm: 'shadow-[0_8px_32px_rgba(249,115,22,0.2),0_0_0_1px_rgba(255,255,255,0.4)_inset]',
  
  // Multi-layer depth (complex shadows for premium feel)
  depth1: 'shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.5)_inset]',
  depth2: 'shadow-[0_4px_16px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.5)_inset]',
  depth3: 'shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_0_1px_rgba(255,255,255,0.8)_inset]',
  depth4: 'shadow-[0_16px_48px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.6)_inset,0_1px_2px_rgba(255,255,255,0.9)_inset]',
  
  // Border glow (luminous borders)
  borderGlow: 'border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)]',
  borderGlowWarm: 'border border-[#f97316]/30 shadow-[0_0_20px_rgba(249,115,22,0.4)]',
  borderGlowPalm: 'border border-[var(--coconut-palm)]/30 shadow-[0_0_20px_rgba(22,163,74,0.3)]',
  
  // Combined presets (ready-to-use)
  cardSubtle: 'bg-white/40 backdrop-blur-md border border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.5)_inset]',
  cardMedium: 'bg-white/60 backdrop-blur-lg border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.5)_inset,0_0_1px_rgba(255,255,255,0.8)_inset]',
  cardStrong: 'bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(139,115,85,0.15),0_0_0_1px_rgba(255,255,255,0.4)_inset]',
  cardIntense: 'bg-white/80 backdrop-blur-[40px] border border-white/70 shadow-[0_16px_48px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.6)_inset,0_1px_2px_rgba(255,255,255,0.9)_inset]',
  cardUltra: 'bg-white/90 backdrop-blur-[60px] border border-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.18),0_0_0_1px_rgba(255,255,255,0.7)_inset,0_2px_4px_rgba(255,255,255,1)_inset]',
  
  // Modal/overlay glass
  modalBackdrop: 'backdrop-blur-md bg-black/20',
  modalBackdropStrong: 'backdrop-blur-lg bg-black/40',
  modalContainer: 'bg-white/90 backdrop-blur-[60px] border border-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.25)]',
} as const;

// ============================================
// Z-INDEX SCALE
// ============================================
export const Z_INDEX = {
  dropdown: 'z-[1000]',
  sticky: 'z-[1020]',
  fixed: 'z-[1030]',
  modalBackdrop: 'z-[1040]',
  modal: 'z-[1050]',
  popover: 'z-[1060]',
  tooltip: 'z-[1070]',
  notification: 'z-[10000]',
} as const;

// ============================================
// ANIMATION TRANSITIONS (Musique)
// ============================================
export const TRANSITIONS = {
  fast: {
    duration: 0.2,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
  medium: {
    duration: 0.3,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
  slow: {
    duration: 0.5,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },
  // Workflow specific animations
  rotate: {
    duration: 3,
    repeat: Infinity,
    ease: 'linear' as const,
  },
  pulse: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
  smooth: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
} as const;

// ============================================
// ICON SIZES (Cohérence)
// ============================================
export const ICON_SIZE = {
  xs: 'w-3 h-3',   // 12px
  sm: 'w-4 h-4',   // 16px - dans les boutons
  md: 'w-5 h-5',   // 20px - dans les titres
  lg: 'w-6 h-6',   // 24px - standalone
  xl: 'w-8 h-8',   // 32px - hero
  xxl: 'w-10 h-10', // 40px - decorative
} as const;

// ============================================
// COLORS (Coconut Theme)
// ============================================
export const COLORS = {
  // Surface
  surface: {
    base: 'bg-[var(--coconut-cream)]',
    elevated: 'bg-white/60',
    overlay: 'bg-white/80',
    glass: 'bg-white/50 backdrop-blur-xl',
  },
  
  // Text
  text: {
    primary: 'text-[var(--coconut-shell)]',
    secondary: 'text-[var(--coconut-husk)]',
    tertiary: 'text-[var(--coconut-husk)]/70',
    muted: 'text-[var(--coconut-husk)]/50',
  },
  
  // Border
  border: {
    base: 'border-white/40',
    subtle: 'border-white/20',
    focus: 'border-[var(--coconut-shell)]',
  },
  
  // Accent
  accent: {
    primary: 'bg-[var(--coconut-shell)]',
    secondary: 'bg-[var(--coconut-husk)]',
    success: 'bg-green-600',
    warning: 'bg-amber-600',
    error: 'bg-red-600',
  },
  
  // Workflow specific colors (Coconut V14)
  workflow: {
    coconutWarm: '#f97316',       // Orange primary for analysis phase
    coconutWarmLight: '#fb923c',   // Orange lighter
    coconutDark: '#1a0f0a',        // Dark background for modals
    coconutDarkAlt: '#2a1810',     // Dark background variant
    coconutDarkDeep: '#1f1209',    // Dark background deep
  },
} as const;

// ============================================
// GRADIENTS (Workflow specific)
// ============================================
export const GRADIENTS = {
  coconutWarm: 'bg-gradient-to-r from-[#f97316] to-[#fb923c]',
  coconutWarmSubtle: 'bg-gradient-to-r from-[#f97316]/20 to-[#fb923c]/20',
  coconutDark: 'bg-gradient-to-br from-[#1a0f0a] via-[#2a1810] to-[#1f1209]',
  coconutOrange: 'bg-gradient-to-br from-orange-500/20 to-amber-500/20',
  success: 'bg-gradient-to-r from-green-600 to-emerald-600',
  info: 'bg-gradient-to-r from-blue-600 to-indigo-600',
  warning: 'bg-gradient-to-r from-amber-600 to-orange-600',
  error: 'bg-gradient-to-r from-red-600 to-rose-600',
} as const;

// ============================================
// TEXT COLORS (Workflow specific)
// ============================================
export const TEXT_COLORS = {
  coconutWarm: 'text-[#f97316]',
  coconutWarmLight: 'text-[#fb923c]',
  white: 'text-white',
  whiteSubtle: 'text-white/70',
  whiteMuted: 'text-white/50',
  whiteGhost: 'text-white/30',
  orangeLight: 'text-orange-50',
  orangeSubtle: 'text-orange-200/80',
  orangeMuted: 'text-orange-300/60',
  success: 'text-green-400',
  info: 'text-blue-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
} as const;

// ============================================
// BG COLORS (Workflow specific)
// ============================================
export const BG_COLORS = {
  coconutWarmSubtle: 'bg-[#f97316]/20',
  coconutWarmHover: 'bg-[#f97316]/30',
  coconutDark: 'bg-[#1a0f0a]',
  orangeGhost: 'bg-orange-50/10',
  orangeSubtle: 'bg-orange-100/10',
  orangeVivid: 'bg-orange-500/20',
  orangeDark: 'bg-orange-950/40',
  orangeDarker: 'bg-orange-950/20',
  whiteGhost: 'bg-white/5',
  whiteSubtle: 'bg-white/10',
  glassWarm: 'bg-white/70 backdrop-blur-sm',
} as const;

// ============================================
// BORDER COLORS (Workflow specific)
// ============================================
export const BORDER_COLORS = {
  coconutWarm: 'border-[#f97316]/30',
  coconutWarmBright: 'border-[#f97316]/50',
  orange: 'border-orange-400/30',
  orangeSubtle: 'border-orange-200/20',
  orangeDark: 'border-orange-500/20',
  orangeDarker: 'border-orange-500/10',
  whiteGhost: 'border-white/10',
  whiteSubtle: 'border-white/20',
  success: 'border-green-500/20',
  info: 'border-blue-500/20',
} as const;

// ============================================
// FOCUS STATES (Accessibility)
// ============================================
export const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--coconut-shell)]';

// ============================================
// DISABLED STATES
// ============================================
export const DISABLED_STATE = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

// ============================================
// HOVER STATES (Subtil)
// ============================================
export const HOVER = {
  scale: 'hover:scale-[1.02] active:scale-[0.98]',
  lift: 'hover:scale-[1.03] hover:-translate-y-0.5',
  glow: 'hover:shadow-[0_0_20px_rgba(139,115,85,0.3)]',
} as const;

// ============================================
// BUTTON VARIANTS
// ============================================
export const BUTTON = {
  base: `${RADIUS.md} transition-all duration-300 ${FOCUS_RING} ${DISABLED_STATE}`,
  
  primary: `${COLORS.accent.primary} text-white hover:opacity-90`,
  
  secondary: `${COLORS.surface.glass} ${COLORS.text.primary} ${COLORS.border.base} border ${HOVER.scale}`,
  
  ghost: `${COLORS.surface.elevated} ${COLORS.text.primary} ${HOVER.scale}`,
} as const;

// ============================================
// LAYOUT CONSTRAINTS
// ============================================
export const LAYOUT = {
  maxWidth: 'max-w-7xl',      // 1280px
  containerPadding: 'px-4 sm:px-6 lg:px-8',
  sectionSpacing: 'space-y-6',
  gridCols: {
    single: 'grid grid-cols-1',
    double: 'grid grid-cols-1 lg:grid-cols-2',
    triple: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },
} as const;

// ============================================
// RESPONSIVE BREAKPOINTS
// ============================================
export const BREAKPOINTS = {
  sm: '640px',   // mobile
  md: '768px',   // tablet
  lg: '1024px',  // desktop
  xl: '1280px',  // large desktop
  '2xl': '1536px', // 4K
} as const;

// ============================================
// STAGGER ANIMATION HELPER
// ============================================
export const getStaggerDelay = (index: number, baseDelay = 0.1): number => {
  return index * baseDelay;
};

// ============================================
// COMBINED TOKEN OBJECT
// ============================================
export const tokens = {
  spacing: SPACING,
  gap: GAP,
  radius: RADIUS,
  shadows: SHADOWS,
  glass: GLASS,
  zIndex: Z_INDEX,
  transitions: TRANSITIONS,
  iconSize: ICON_SIZE,
  colors: COLORS,
  gradients: GRADIENTS,
  textColors: TEXT_COLORS,
  bgColors: BG_COLORS,
  borderColors: BORDER_COLORS,
  focus: FOCUS_RING,
  disabled: DISABLED_STATE,
  hover: HOVER,
  button: BUTTON,
  layout: LAYOUT,
  breakpoints: BREAKPOINTS,
} as const;

// ============================================
// TYPE EXPORTS
// ============================================
export type Spacing = keyof typeof SPACING;
export type Radius = keyof typeof RADIUS;
export type IconSize = keyof typeof ICON_SIZE;
export type TransitionType = keyof typeof TRANSITIONS;