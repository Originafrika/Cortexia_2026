import { motion } from 'motion/react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { forwardRef } from 'react';
import { useReducedMotion } from '../../lib/useReducedMotion'; // ✅ A11y: Reduced motion support

// ============================================
// BEAUTY DESIGN SYSTEM — BUTTON COMPONENT
// Grammaire : Cohérence visuelle
// Musique : Motion fluide
// Rhétorique : Communication claire
// ============================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'coconut' | 'purple' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'right',
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    // ✅ BDS: Size variants (Géométrie)
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    // ✅ BDS: Variant styles (Grammaire)
    const variantStyles = {
      primary: {
        background: 'linear-gradient(135deg, rgba(245,235,224,0.95) 0%, rgba(227,213,202,0.9) 100%)',
        boxShadow: '0 20px 60px rgba(245,235,224,0.3)',
        color: '#1A1A1A',
        hoverScale: 1.05,
        hoverShadow: '0 25px 80px rgba(245,235,224,0.4)',
      },
      secondary: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#FFFFFF',
        hoverScale: 1.02,
        hoverBackground: 'rgba(255,255,255,0.1)',
      },
      ghost: {
        background: 'transparent',
        color: '#FFFFFF',
        hoverScale: 1.02,
        hoverBackground: 'rgba(255,255,255,0.05)',
      },
      coconut: {
        background: 'linear-gradient(135deg, rgba(245,235,224,0.95) 0%, rgba(227,213,202,0.9) 100%)',
        boxShadow: '0 20px 60px rgba(245,235,224,0.3)',
        color: '#1A1A1A',
        hoverScale: 1.05,
        hoverShadow: '0 25px 80px rgba(245,235,224,0.4)',
      },
      purple: {
        background: 'linear-gradient(135deg, rgba(168,85,247,0.9) 0%, rgba(139,92,246,0.85) 100%)',
        boxShadow: '0 20px 60px rgba(168,85,247,0.35)',
        color: '#FFFFFF',
        hoverScale: 1.05,
        hoverShadow: '0 25px 80px rgba(168,85,247,0.45)',
      },
      blue: {
        background: 'linear-gradient(135deg, rgba(59,130,246,0.9) 0%, rgba(37,99,235,0.85) 100%)',
        boxShadow: '0 20px 60px rgba(59,130,246,0.35)',
        color: '#FFFFFF',
        hoverScale: 1.05,
        hoverShadow: '0 25px 80px rgba(59,130,246,0.45)',
      },
    };

    const currentVariant = variantStyles[variant];
    const isDisabled = disabled || loading;
    const shouldReduceMotion = useReducedMotion();

    return (
      <motion.button
        ref={ref}
        className={`
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          rounded-2xl font-semibold
          inline-flex items-center justify-center gap-3
          transition-all duration-300
          focus:outline-none focus:ring-4 focus:ring-white/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        style={{
          background: currentVariant.background,
          boxShadow: currentVariant.boxShadow,
          color: currentVariant.color,
          border: currentVariant.border,
        }}
        whileHover={
          !isDisabled && !shouldReduceMotion
            ? {
                scale: currentVariant.hoverScale,
                boxShadow: currentVariant.hoverShadow,
                background: currentVariant.hoverBackground,
              }
            : {}
        }
        whileTap={!isDisabled && !shouldReduceMotion ? { scale: 0.98 } : {}}
        disabled={isDisabled}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
          </motion.div>
        )}

        {/* Left icon */}
        {!loading && icon && iconPosition === 'left' && icon}

        {/* Children */}
        {!loading && children}

        {/* Right icon (default: arrow) */}
        {!loading && icon && iconPosition === 'right' && icon}
        {!loading && !icon && iconPosition === 'right' && variant === 'primary' && (
          <ArrowRight size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';