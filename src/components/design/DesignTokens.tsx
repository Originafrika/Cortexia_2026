// Design Tokens - Off-Moon Design System

export const DesignTokens = {
  // ==================== COLORS ====================
  colors: {
    void: "#000000",
    surface: {
      base: "#0A0A0A",
      elevated: "#141414",
      hover: "#1A1A1A"
    },
    accent: {
      primary: "#6366F1",
      glow: "#8B5CF6",
      gradient: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
    },
    text: {
      primary: "#FFFFFF",
      secondary: "rgba(255, 255, 255, 0.7)",
      tertiary: "rgba(255, 255, 255, 0.4)",
      disabled: "rgba(255, 255, 255, 0.2)"
    },
    border: {
      subtle: "rgba(255, 255, 255, 0.05)",
      default: "rgba(255, 255, 255, 0.1)",
      strong: "rgba(255, 255, 255, 0.2)",
      accent: "rgba(99, 102, 241, 0.3)"
    },
    status: {
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6"
    }
  },
  
  // ==================== TYPOGRAPHY ====================
  typography: {
    fontFamily: {
      display: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace"
    },
    fontSize: {
      xs: "0.75rem",    // 12px
      sm: "0.875rem",   // 14px
      base: "1rem",     // 16px
      lg: "1.125rem",   // 18px
      xl: "1.25rem",    // 20px
      "2xl": "1.5rem",  // 24px
      "3xl": "1.875rem",// 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem"     // 48px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  
  // ==================== SPACING (BENTO GRID) ====================
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
    "3xl": "64px",
    "4xl": "96px"
  },
  
  // ==================== BORDER RADIUS (PROXIMITY = ARRONDI) ====================
  radius: {
    tight: "4px",     // Very close elements (tags, pills)
    normal: "8px",    // Standard elements (inputs, buttons)
    loose: "12px",    // Cards, containers
    bubble: "20px",   // Large sections, floating elements
    full: "9999px"    // Pills, circular elements
  },
  
  // ==================== SHADOWS & ELEVATIONS ====================
  shadow: {
    sm: "0 2px 8px rgba(0, 0, 0, 0.4)",
    md: "0 4px 16px rgba(0, 0, 0, 0.5)",
    lg: "0 8px 32px rgba(0, 0, 0, 0.6)",
    xl: "0 12px 48px rgba(0, 0, 0, 0.7)",
    glow: "0 0 40px rgba(99, 102, 241, 0.3)",
    glowStrong: "0 0 60px rgba(99, 102, 241, 0.5)"
  },
  
  // ==================== ANIMATIONS ====================
  animation: {
    duration: {
      instant: "150ms",
      fast: "200ms",
      smooth: "300ms",
      elegant: "500ms",
      slow: "800ms"
    },
    easing: {
      fluid: "cubic-bezier(0.4, 0, 0.2, 1)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      smooth: "cubic-bezier(0.4, 0, 0.6, 1)",
      snappy: "cubic-bezier(0.4, 0, 0, 1)"
    }
  },
  
  // ==================== BACKDROP BLUR ====================
  blur: {
    sm: "blur(8px)",
    md: "blur(12px)",
    lg: "blur(16px)",
    xl: "blur(24px)"
  },
  
  // ==================== BREAKPOINTS ====================
  breakpoints: {
    mobile: "640px",
    tablet: "768px",
    desktop: "1024px",
    wide: "1280px",
    ultrawide: "1536px"
  }
};

// ==================== CSS VARIABLES ====================

export function injectDesignTokens() {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Colors
  root.style.setProperty('--color-void', DesignTokens.colors.void);
  root.style.setProperty('--color-surface', DesignTokens.colors.surface.base);
  root.style.setProperty('--color-surface-elevated', DesignTokens.colors.surface.elevated);
  root.style.setProperty('--color-accent', DesignTokens.colors.accent.primary);
  root.style.setProperty('--color-accent-glow', DesignTokens.colors.accent.glow);
  
  // Spacing
  Object.entries(DesignTokens.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });
  
  // Radius
  Object.entries(DesignTokens.radius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });
  
  // Shadows
  Object.entries(DesignTokens.shadow).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });
}

// ==================== UTILITY CLASSES ====================

export const UtilityClasses = {
  // Glass morphism effect
  glassmorphism: "bg-black/40 backdrop-blur-lg border border-white/10",
  
  // Glow effect on hover
  glowHover: "hover:shadow-glow transition-shadow duration-300",
  
  // Smooth transitions
  smoothTransition: "transition-all duration-300 ease-fluid",
  
  // Gradient backgrounds
  gradientAccent: "bg-gradient-to-br from-accent to-accent-glow",
  
  // Text gradients
  textGradient: "bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent",
  
  // Interactive states
  interactive: "hover:bg-white/5 active:bg-white/10 transition-colors duration-200",
  
  // Focus states
  focusRing: "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
};
