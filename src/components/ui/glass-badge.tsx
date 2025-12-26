/**
 * COCONUT V14 - GLASS BADGE COMPONENT
 * Phase 4 - Jour 2: Premium badge component
 */

import React from 'react';

export interface GlassBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  glow?: boolean;
  icon?: React.ReactNode;
}

export function GlassBadge({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  rounded = false,
  glow = false,
  icon
}: GlassBadgeProps) {
  // Variant styles
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-primary-100 text-primary-700 border-primary-200',
    secondary: 'bg-secondary-100 text-secondary-700 border-secondary-200',
    success: 'bg-success-100 text-success-700 border-success-200',
    warning: 'bg-warning-100 text-warning-700 border-warning-200',
    error: 'bg-error-100 text-error-700 border-error-200',
    outline: 'bg-transparent text-slate-700 border-slate-300'
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2'
  };

  // Icon sizes
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  // Rounded
  const roundedStyle = rounded ? 'rounded-full' : 'rounded-lg';

  // Glow
  const glowStyle = glow ? 'shadow-lg' : '';

  return (
    <span
      className={`
        inline-flex items-center
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${roundedStyle}
        ${glowStyle}
        border
        font-medium
        backdrop-blur-sm
        transition-all duration-300
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {icon && <span className={iconSizes[size]}>{icon}</span>}
      {children}
    </span>
  );
}
