/**
 * DESIGN TOKENS - COCONUT V14
 * Phase 10 - Error Handling & Resilience
 * 
 * Centralized design tokens for consistent styling.
 */

export const tokens = {
  // Glass effects
  glass: {
    card: 'bg-white/60 backdrop-blur-xl border border-white/40',
    cardStrong: 'bg-white/70 backdrop-blur-xl border border-white/60',
    cardInteractive: 'bg-white/60 backdrop-blur-xl border border-white/40 hover:bg-white/70 hover:border-white/60 transition-all duration-300',
    cardSubtle: 'bg-white/40 backdrop-blur-lg border border-white/30',
  },

  // Border radius
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },

  // Shadows
  shadow: {
    sm: 'shadow-md',
    md: 'shadow-lg',
    lg: 'shadow-xl',
    xl: 'shadow-2xl',
  },

  // Spacing
  spacing: {
    xs: 'p-2',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  },

  // Transitions
  transition: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-300',
    slow: 'transition-all duration-500',
  },

  // Typography
  text: {
    heading: 'text-[var(--coconut-shell)]',
    body: 'text-[var(--coconut-husk)]',
    muted: 'text-[var(--coconut-husk)]/60',
  },
};

export default tokens;
