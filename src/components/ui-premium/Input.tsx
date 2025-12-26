/**
 * PREMIUM INPUT - Coconut Design System
 * 
 * Features:
 * - Glass morphism design
 * - Icon support (left, right)
 * - Error state
 * - Disabled state
 * - Size variants
 * - Label and helper text
 */

import { forwardRef, InputHTMLAttributes } from 'react';

// ============================================
// TYPES
// ============================================

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  label?: string;
  helperText?: string;
  glass?: boolean;
}

// ============================================
// STYLES
// ============================================

const sizeStyles: Record<InputSize, { input: string; icon: string }> = {
  sm: {
    input: 'px-3 py-1.5 text-sm',
    icon: 'w-4 h-4',
  },
  md: {
    input: 'px-4 py-2 text-base',
    icon: 'w-5 h-5',
  },
  lg: {
    input: 'px-5 py-3 text-lg',
    icon: 'w-6 h-6',
  },
};

// ============================================
// COMPONENT
// ============================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      inputSize = 'md',
      leftIcon,
      rightIcon,
      error,
      label,
      helperText,
      glass = true,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    const baseStyles = `
      w-full rounded-lg border
      font-medium text-white placeholder-gray-500
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
      disabled:opacity-50 disabled:cursor-not-allowed
      ${glass ? 'bg-gray-800/50 backdrop-blur-xl' : 'bg-gray-800'}
      ${hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-700 focus:border-indigo-500 focus:ring-indigo-500'
      }
      ${leftIcon ? 'pl-10' : ''}
      ${rightIcon ? 'pr-10' : ''}
    `;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 ${sizeStyles[inputSize].icon}`}>
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            className={`${baseStyles} ${sizeStyles[inputSize].input} ${className}`}
            disabled={disabled}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 ${sizeStyles[inputSize].icon}`}>
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error or Helper Text */}
        {(error || helperText) && (
          <p className={`mt-1.5 text-sm ${hasError ? 'text-red-400' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================
// TEXTAREA
// ============================================

export interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
  glass?: boolean;
  rows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      error,
      label,
      helperText,
      glass = true,
      rows = 4,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    const baseStyles = `
      w-full px-4 py-2 rounded-lg border
      font-medium text-white placeholder-gray-500
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
      disabled:opacity-50 disabled:cursor-not-allowed
      resize-vertical
      ${glass ? 'bg-gray-800/50 backdrop-blur-xl' : 'bg-gray-800'}
      ${hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-700 focus:border-indigo-500 focus:ring-indigo-500'
      }
    `;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          rows={rows}
          className={`${baseStyles} ${className}`}
          disabled={disabled}
          {...props}
        />

        {/* Error or Helper Text */}
        {(error || helperText) && (
          <p className={`mt-1.5 text-sm ${hasError ? 'text-red-400' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
