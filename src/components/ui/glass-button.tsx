/**
 * COCONUT V14 - GLASS BUTTON COMPONENT
 * Phase 4 - Jour 2: Liquid glass components
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  glow?: boolean;
}

export function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  glow = false,
  className = '',
  disabled,
  ...props
}: GlassButtonProps) {
  // Variant styles
  const variantStyles = {
    primary: `
      bg-gradient-to-br from-primary-500 to-primary-700
      text-white
      border border-primary-400/30
      shadow-lg shadow-primary-500/20
      hover:shadow-xl hover:shadow-primary-500/30
      hover:from-primary-600 hover:to-primary-800
      active:scale-[0.98]
    `,
    secondary: `
      bg-gradient-to-br from-secondary-500 to-secondary-700
      text-white
      border border-secondary-400/30
      shadow-lg shadow-secondary-500/20
      hover:shadow-xl hover:shadow-secondary-500/30
      hover:from-secondary-600 hover:to-secondary-800
      active:scale-[0.98]
    `,
    accent: `
      bg-gradient-to-br from-accent-500 to-accent-700
      text-white
      border border-accent-400/30
      shadow-lg shadow-accent-500/20
      hover:shadow-xl hover:shadow-accent-500/30
      hover:from-accent-600 hover:to-accent-800
      active:scale-[0.98]
    `,
    ghost: `
      bg-white/10
      backdrop-blur-md
      text-slate-900
      border border-white/20
      hover:bg-white/20
      hover:border-white/30
      active:scale-[0.98]
    `,
    outline: `
      bg-transparent
      backdrop-blur-sm
      text-slate-900
      border-2 border-primary-500
      hover:bg-primary-50
      hover:border-primary-600
      active:scale-[0.98]
    `,
    destructive: `
      bg-gradient-to-br from-error-500 to-error-700
      text-white
      border border-error-400/30
      shadow-lg shadow-error-500/20
      hover:shadow-xl hover:shadow-error-500/30
      hover:from-error-600 hover:to-error-800
      active:scale-[0.98]
    `
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
    xl: 'px-8 py-4 text-xl gap-3'
  };

  // Icon size
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  // Glow effect
  const glowEffect = glow ? 'animate-pulse' : '';

  // Disabled state
  const disabledStyles = disabled || loading
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : '';

  // Width
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${glowEffect}
        ${disabledStyles}
        ${widthStyle}
        inline-flex items-center justify-center
        rounded-xl
        font-medium
        transition-all duration-300
        outline-none
        focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className={iconSizes[size]}>{icon}</span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className={iconSizes[size]}>{icon}</span>
      )}
    </button>
  );
}
