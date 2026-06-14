/**
 * PREMIUM CARD - Coconut Design System
 * 
 * Features:
 * - Glassmorphism design
 * - Hover effects
 * - Click handlers
 * - Header/Footer slots
 * - Padding variants
 * - Elevation variants
 */

import { HTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

// ============================================
// TYPES
// ============================================

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardElevation = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  elevation?: CardElevation;
  glass?: boolean;
  hover?: boolean;
  interactive?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

// ============================================
// STYLES
// ============================================

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const elevationStyles: Record<CardElevation, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

// ============================================
// COMPONENT
// ============================================

export function Card({
  padding = 'md',
  elevation = 'md',
  glass = true,
  hover = false,
  interactive = false,
  header,
  footer,
  className = '',
  children,
  ...props
}: CardProps) {
  const baseStyles = `
    rounded-xl border
    transition-all duration-200
    ${glass ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700/50' : 'bg-gray-800 border-gray-700'}
    ${elevationStyles[elevation]}
    ${hover ? 'hover:border-gray-600 hover:shadow-xl' : ''}
    ${interactive ? 'cursor-pointer active:scale-[0.99]' : ''}
  `;

  const Component = interactive ? motion.div : 'div';

  return (
    <Component
      className={`${baseStyles} ${className}`}
      whileHover={interactive ? { y: -2 } : {}}
      {...props}
    >
      {/* Header */}
      {header && (
        <div className="px-6 py-4 border-b border-gray-700/50">
          {header}
        </div>
      )}

      {/* Content */}
      <div className={paddingStyles[padding]}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-gray-700/50">
          {footer}
        </div>
      )}
    </Component>
  );
}

// ============================================
// CARD VARIANTS
// ============================================

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`font-semibold text-white ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-gray-400 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardFooter({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      {children}
    </div>
  );
}
