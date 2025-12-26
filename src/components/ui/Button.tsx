// Button Component - Unified button styles across app
// Fixes: 3 different button patterns, inconsistent sizes, missing states

import { motion, MotionProps } from "motion/react";
import { Loader2 } from "lucide-react";
import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/constants/design-system";

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  motionProps?: MotionProps;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white hover:from-[#5558e3] hover:to-[#7c4fe0] shadow-lg shadow-[#6366f1]/20',
  secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10',
  ghost: 'bg-transparent text-white hover:bg-white/10',
  outline: 'bg-transparent text-white border border-white/20 hover:bg-white/5',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2 text-base min-h-[44px]', // 44px = Apple touch target
  lg: 'px-6 py-3 text-lg min-h-[48px]'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className,
  motionProps,
  children,
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'rounded-xl font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  
  const classes = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && 'w-full',
    className
  );

  const content = (
    <>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </>
  );

  if (motionProps) {
    return (
      <motion.button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        whileTap={{ scale: 0.95 }}
        {...motionProps}
        {...props}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
});

Button.displayName = 'Button';
