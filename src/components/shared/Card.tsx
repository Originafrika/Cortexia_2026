import { motion } from 'motion/react';
import { forwardRef } from 'react';

// ============================================
// BEAUTY DESIGN SYSTEM — CARD COMPONENT
// Géométrie : Proportions sacrées
// Musique : Motion shimmer
// Grammaire : Cohérence visuelle
// ============================================

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'coconut' | 'purple' | 'blue';
  hoverable?: boolean;
  shimmer?: boolean;
  glowColor?: string;
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      hoverable = true,
      shimmer = false,
      glowColor,
      className = '',
      ...props
    },
    ref
  ) => {
    // ✅ BDS: Variant styles (Grammaire)
    const variantStyles = {
      default: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
      },
      glass: {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(40px)',
      },
      gradient: {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
      },
      coconut: {
        background: 'linear-gradient(135deg, rgba(245,235,224,0.08) 0%, rgba(227,213,202,0.06) 100%)',
        border: '1px solid rgba(245,235,224,0.15)',
      },
      purple: {
        background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(139,92,246,0.06) 100%)',
        border: '1px solid rgba(168,85,247,0.15)',
      },
      blue: {
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(37,99,235,0.06) 100%)',
        border: '1px solid rgba(59,130,246,0.15)',
      },
    };

    const currentVariant = variantStyles[variant];

    return (
      <motion.div
        ref={ref}
        className={`
          relative overflow-hidden rounded-2xl
          transition-all duration-300
          ${hoverable ? 'cursor-pointer' : ''}
          ${className}
        `}
        style={{
          background: currentVariant.background,
          border: currentVariant.border,
          backdropFilter: currentVariant.backdropFilter,
        }}
        whileHover={
          hoverable
            ? {
                scale: 1.02,
                background: variant === 'default' ? 'rgba(255,255,255,0.05)' : currentVariant.background,
              }
            : {}
        }
        whileTap={hoverable ? { scale: 0.98 } : {}}
        {...props}
      >
        {/* Glow effect on hover */}
        {hoverable && glowColor && (
          <div
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`,
            }}
          />
        )}

        {/* Shimmer effect on hover */}
        {shimmer && hoverable && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
        )}

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
