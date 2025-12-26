/**
 * THEME CONTEXT - BDS Géométrie (Couleurs) + Musique (Transitions)
 * Purple (Create) ↔ Indigo (Coconut) theme interpolation
 * 7 Arts: Géométrie (proportions couleur), Musique (transitions fluides)
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ThemeMode = 'purple' | 'indigo';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  colors: ThemeColors;
}

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  glow: string;
  border: string;
  bg: string;
}

// BDS: Géométrie - Theme color palettes (harmonious ratios)
const THEME_COLORS: Record<ThemeMode, ThemeColors> = {
  purple: {
    primary: 'rgb(168, 85, 247)', // purple-500
    primaryLight: 'rgb(216, 180, 254)', // purple-300
    primaryDark: 'rgb(126, 34, 206)', // purple-700
    accent: 'rgb(236, 72, 153)', // pink-500
    glow: 'rgba(168, 85, 247, 0.5)',
    border: 'rgba(168, 85, 247, 0.3)',
    bg: 'rgba(168, 85, 247, 0.1)',
  },
  indigo: {
    primary: 'rgb(99, 102, 241)', // indigo-500
    primaryLight: 'rgb(165, 180, 252)', // indigo-300
    primaryDark: 'rgb(67, 56, 202)', // indigo-700
    accent: 'rgb(139, 92, 246)', // violet-500
    glow: 'rgba(99, 102, 241, 0.5)',
    border: 'rgba(99, 102, 241, 0.3)',
    bg: 'rgba(99, 102, 241, 0.1)',
  },
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

export function ThemeProvider({ children, defaultTheme = 'purple' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);

  // BDS: Musique - Smooth theme transition
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    
    // BDS: Géométrie - Apply CSS variables for smooth interpolation
    const colors = THEME_COLORS[newTheme];
    const root = document.documentElement;
    
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-primary-light', colors.primaryLight);
    root.style.setProperty('--theme-primary-dark', colors.primaryDark);
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-glow', colors.glow);
    root.style.setProperty('--theme-border', colors.border);
    root.style.setProperty('--theme-bg', colors.bg);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'purple' ? 'indigo' : 'purple');
  }, [theme, setTheme]);

  const value: ThemeContextValue = {
    theme,
    setTheme,
    toggleTheme,
    colors: THEME_COLORS[theme],
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
