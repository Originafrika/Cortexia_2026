/**
 * COCONUT V14 - GLASS TEXTAREA COMPONENT
 * Phase 4 - Jour 2: Liquid glass textarea
 */

import React, { forwardRef } from 'react';

export interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'glass' | 'solid' | 'outline';
  resize?: boolean;
  showCount?: boolean;
  maxCount?: number;
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  variant = 'glass',
  resize = true,
  showCount = false,
  maxCount,
  className = '',
  value,
  onChange,
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

  // Resize
  const resizeStyle = resize ? 'resize-y' : 'resize-none';

  // Character count
  const currentCount = typeof value === 'string' ? value.length : 0;
  const isOverLimit = maxCount && currentCount > maxCount;

  return (
    <div className={`${widthStyle} ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-slate-900 mb-1.5">
          {label}
        </label>
      )}

      {/* Textarea */}
      <textarea
        ref={ref}
        className={`
          ${variantStyles[variant]}
          ${errorStyles}
          ${resizeStyle}
          w-full
          px-4
          py-2.5
          rounded-xl
          text-slate-900
          placeholder:text-slate-400
          outline-none
          transition-all duration-300
          shadow-sm
          hover:shadow-md
          min-h-[100px]
        `.trim().replace(/\s+/g, ' ')}
        value={value}
        onChange={onChange}
        {...props}
      />

      {/* Character count */}
      {showCount && (
        <div className={`mt-1.5 text-sm text-right ${isOverLimit ? 'text-error-600' : 'text-slate-500'}`}>
          {currentCount}{maxCount ? `/${maxCount}` : ''}
        </div>
      )}

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

GlassTextarea.displayName = 'GlassTextarea';
