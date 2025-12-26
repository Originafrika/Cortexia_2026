// UI constants to avoid magic numbers

export const UI_CONSTANTS = {
  // Layout
  CONTAINER_MAX_WIDTH: "max-w-6xl",
  SECTION_SPACING: "space-y-8 sm:space-y-10 lg:space-y-12", // ✅ FIX #7: Responsive spacing
  CARD_SPACING: "gap-3 sm:gap-4", // ✅ FIX #12: Responsive gap
  
  // Limits
  TRENDING_TEMPLATES_LIMIT: 4,
  SKELETON_ITEMS_COUNT: 8,
  
  // Timing
  TEMPLATE_LOADING_DELAY: 300, // ms
  
  // Z-index layers
  Z_INDEX: {
    header: 10,
    modal: 50,
    tooltip: 60,
    dropdown: 40
  },
  
  // Responsive breakpoints (matches Tailwind)
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }
} as const;

// Common card styles to avoid duplication
export const CARD_STYLES = {
  base: "group relative p-6 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10 transition-all text-left overflow-hidden",
  hover: "hover:border-[#6366f1]/50 hover:scale-[1.01]", // ✅ FIX #4: Reduced scale to avoid overlap
  active: "active:scale-95",
  gradient: "absolute inset-0 bg-gradient-to-br from-[#6366f1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity will-change-opacity"
} as const;

export function getCardClassName(includeHover = true): string {
  return `${CARD_STYLES.base} ${includeHover ? CARD_STYLES.hover : ''} ${CARD_STYLES.active}`;
}