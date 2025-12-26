/**
 * COCONUT V14 - GLASS CONTAINER COMPONENT
 * Phase 4 - Jour 2: Liquid glass layout containers
 */

import React from 'react';

export interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'medium' | 'dark' | 'colored';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  shadow?: boolean;
  border?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centered?: boolean;
}

export function GlassContainer({
  children,
  className = '',
  variant = 'light',
  blur = 'md',
  padding = 'md',
  rounded = 'xl',
  shadow = true,
  border = true,
  maxWidth = 'full',
  centered = false
}: GlassContainerProps) {
  // Variant styles
  const variantStyles = {
    light: 'bg-white/70 border-white/20',
    medium: 'bg-white/50 border-white/20',
    dark: 'bg-white/30 border-white/20',
    colored: 'bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border-white/30'
  };

  // Blur styles
  const blurStyles = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  };

  // Padding styles
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  // Rounded styles
  const roundedStyles = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    '2xl': 'rounded-[2rem]',
    '3xl': 'rounded-[3rem]'
  };

  // Shadow styles
  const shadowStyles = shadow ? 'shadow-xl' : '';

  // Border styles
  const borderStyles = border ? 'border' : '';

  // Max width styles
  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'w-full'
  };

  // Centered
  const centeredStyles = centered ? 'mx-auto' : '';

  return (
    <div
      className={`
        ${variantStyles[variant]}
        ${blurStyles[blur]}
        ${paddingStyles[padding]}
        ${roundedStyles[rounded]}
        ${shadowStyles}
        ${borderStyles}
        ${maxWidthStyles[maxWidth]}
        ${centeredStyles}
        transition-all duration-300
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </div>
  );
}
