/**
 * COCONUT V14 - GLASS INPUT COMPONENT
 * Phase 4 - Jour 2: Liquid glass components
 */

import React, { forwardRef } from 'react';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  variant?: 'glass' | 'solid' | 'outline';
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  variant = 'glass',
  className = '',
  ...props
}, ref) => {
  // Variant styles
  const variantStyles = {
    glass: `
      bg-white/70
      backdrop-blur-md
      border border-white/30
      focus:bg-white/80
      focus:border-primary-500
      focus:ring-2 focus:ring-primary-500/20
    `,
    solid: `
      bg-white
      border border-slate-200
      focus:border-primary-500
      focus:ring-2 focus:ring-primary-500/20
    `,
    outline: `
      bg-transparent
      border-2 border-slate-300
      focus:border-primary-500
      focus:ring-2 focus:ring-primary-500/20
    `
  };

  // Error state
  const errorStyles = error
    ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20'
    : '';

  // Width
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthStyle} ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-slate-900 mb-1.5">
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          className={`
            ${variantStyles[variant]}
            ${errorStyles}
            ${icon && iconPosition === 'left' ? 'pl-10' : 'pl-4'}
            ${icon && iconPosition === 'right' ? 'pr-10' : 'pr-4'}
            w-full
            py-2.5
            rounded-xl
            text-slate-900
            placeholder:text-slate-400
            outline-none
            transition-all duration-300
            shadow-sm
            hover:shadow-md
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        />

        {/* Right icon */}
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-sm text-error-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-slate-600">
          {helperText}
        </p>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';
