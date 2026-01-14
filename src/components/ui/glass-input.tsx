/**
 * COCONUT V14 - GLASS INPUT COMPONENT
 * Phase 4 - Jour 2: Liquid glass components
 * ✅ OPTIMIZED: Full Responsive + BDS Compliance
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
  // Variant styles - BDS compliant
  const variantStyles = {
    glass: `
      bg-white/70
      backdrop-blur-md
      border border-[var(--coconut-husk)]/20
      focus:bg-white/90
      focus:border-[var(--coconut-palm)]
      focus:ring-2 focus:ring-[var(--coconut-palm)]/20
    `,
    solid: `
      bg-white
      border border-[var(--coconut-husk)]/30
      focus:border-[var(--coconut-palm)]
      focus:ring-2 focus:ring-[var(--coconut-palm)]/20
    `,
    outline: `
      bg-transparent
      border-2 border-[var(--coconut-husk)]/40
      focus:border-[var(--coconut-palm)]
      focus:ring-2 focus:ring-[var(--coconut-palm)]/20
    `
  };

  // Error state - BDS compliant
  const errorStyles = error
    ? 'border-[var(--coconut-shell)] focus:border-[var(--coconut-shell)] focus:ring-[var(--coconut-shell)]/20'
    : '';

  // Width
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthStyle} ${className}`}>
      {/* Label - Responsive */}
      {label && (
        <label className="block text-sm sm:text-base font-medium text-[var(--coconut-shell)] mb-1.5">
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon - Responsive */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-[var(--coconut-husk)] pointer-events-none">
            {icon}
          </div>
        )}

        {/* Input - Responsive */}
        <input
          ref={ref}
          className={`
            ${variantStyles[variant]}
            ${errorStyles}
            ${icon && iconPosition === 'left' ? 'pl-9 sm:pl-10' : 'pl-3 sm:pl-4'}
            ${icon && iconPosition === 'right' ? 'pr-9 sm:pr-10' : 'pr-3 sm:pr-4'}
            w-full
            py-2 sm:py-2.5
            rounded-xl
            text-[var(--coconut-shell)]
            placeholder:text-[var(--coconut-husk)]
            text-sm sm:text-base
            outline-none
            transition-all duration-300
            shadow-sm
            hover:shadow-md
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        />

        {/* Right icon - Responsive */}
        {icon && iconPosition === 'right' && (
          <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-[var(--coconut-husk)] pointer-events-none">
            {icon}
          </div>
        )}
      </div>

      {/* Error message - BDS compliant */}
      {error && (
        <p className="mt-1.5 text-xs sm:text-sm text-[var(--coconut-shell)] flex items-center gap-1">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Helper text - BDS compliant */}
      {helperText && !error && (
        <p className="mt-1.5 text-xs sm:text-sm text-[var(--coconut-husk)]">
          {helperText}
        </p>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';