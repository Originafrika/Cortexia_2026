/**
 * PREMIUM BUTTON - Coconut Design System
 * 
 * Features:
 * - Multiple variants (primary, secondary, ghost, danger)
 * - Multiple sizes (sm, md, lg)
 * - Icon support (left, right, icon-only)
 * - Loading state
 * - Disabled state
 * - Glassmorphism option
 * - Premium animations
 */

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { Loader2 } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
  glass?: boolean;
  fullWidth?: boolean;
}

// ============================================
// STYLES
// ============================================

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700
    text-white border-indigo-500
    shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40
  `,
  secondary: `
    bg-gray-700 hover:bg-gray-600 active:bg-gray-800
    text-white border-gray-600
    shadow-md
  `,
  ghost: `
    bg-transparent hover:bg-gray-800 active:bg-gray-700
    text-gray-300 hover:text-white border-transparent hover:border-gray-700
  `,
  danger: `
    bg-red-600 hover:bg-red-500 active:bg-red-700
    text-white border-red-500
    shadow-lg shadow-red-500/20 hover:shadow-red-500/40
  `,
  success: `
    bg-green-600 hover:bg-green-500 active:bg-green-700
    text-white border-green-500
    shadow-lg shadow-green-500/20 hover:shadow-green-500/40
  `,
};

const sizeStyles: Record<ButtonSize, { button: string; icon: string }> = {
  sm: {
    button: 'px-3 py-1.5 text-sm',
    icon: 'w-4 h-4',
  },
  md: {
    button: 'px-4 py-2 text-base',
    icon: 'w-5 h-5',
  },
  lg: {
    button: 'px-6 py-3 text-lg',
    icon: 'w-6 h-6',
  },
};

// ============================================
// COMPONENT
// ============================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      glass = false,
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-lg border
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900
      disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
      ${fullWidth ? 'w-full' : ''}
      ${iconOnly ? 'p-2' : sizeStyles[size].button}
      ${glass ? 'backdrop-blur-xl bg-opacity-70' : ''}
    `;

    return (
      <motion.button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        {...props}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <Loader2 className={`${sizeStyles[size].icon} animate-spin`} />
        )}

        {/* Left Icon */}
        {!isLoading && leftIcon && (
          <span className={sizeStyles[size].icon}>{leftIcon}</span>
        )}

        {/* Content */}
        {!iconOnly && children}

        {/* Right Icon */}
        {!isLoading && rightIcon && (
          <span className={sizeStyles[size].icon}>{rightIcon}</span>
        )}

        {/* Icon Only */}
        {iconOnly && !isLoading && children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// ============================================
// ICON BUTTON (Convenience)
// ============================================

export const IconButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'iconOnly'>>(
  (props, ref) => {
    return <Button ref={ref} iconOnly {...props} />;
  }
);

IconButton.displayName = 'IconButton';
