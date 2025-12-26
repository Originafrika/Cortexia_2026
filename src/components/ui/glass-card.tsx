/**
 * COCONUT V14 - ENHANCED GLASS CARD COMPONENT
 * Phase 4 - Jour 5: Premium Components Enhancement
 * 
 * Enhanced with:
 * - Advanced hover animations
 * - Tilt effects
 * - Glow animations
 * - ARIA accessibility
 * - Performance optimizations
 */

import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { glassCardVariants, glowPulse } from '../../lib/animations/micro-interactions';

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'medium' | 'dark' | 'colored';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  glowColor?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  onClick?: () => void;
  hover?: boolean;
  tilt?: boolean;
  animated?: boolean;
  role?: string;
  'aria-label'?: string;
}

export function GlassCard({
  children,
  className = '',
  variant = 'light',
  blur = 'md',
  glow = false,
  glowColor = 'primary',
  onClick,
  hover = false,
  tilt = false,
  animated = true,
  role,
  'aria-label': ariaLabel
}: GlassCardProps) {
  // Tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-100, 100], [5, -5]), {
    stiffness: 300,
    damping: 30
  });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-5, 5]), {
    stiffness: 300,
    damping: 30
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    if (!tilt) return;
    x.set(0);
    y.set(0);
  };

  // Variant styles
  const variantStyles = {
    light: 'bg-white/70 border-white/20',
    medium: 'bg-white/50 border-white/20',
    dark: 'bg-white/30 border-white/20',
    colored: 'bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border-white/30'
  };

  // Blur styles
  const blurStyles = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  };

  // Glow styles
  const glowStyles = glow ? {
    primary: 'shadow-[0_0_40px_-10px] shadow-primary-500/50',
    secondary: 'shadow-[0_0_40px_-10px] shadow-secondary-500/50',
    accent: 'shadow-[0_0_40px_-10px] shadow-accent-500/50',
    success: 'shadow-[0_0_40px_-10px] shadow-success-500/50',
    warning: 'shadow-[0_0_40px_-10px] shadow-warning-500/50',
    error: 'shadow-[0_0_40px_-10px] shadow-error-500/50'
  } : {};

  // Hover styles
  const hoverStyles = hover ? 'transition-all duration-300 hover:scale-[1.02] hover:shadow-xl' : '';

  // Click styles
  const clickStyles = onClick ? 'cursor-pointer' : '';

  const Component = animated ? motion.div : 'div';
  const motionProps = animated ? {
    variants: glassCardVariants,
    initial: "initial",
    whileHover: hover || onClick ? "hover" : undefined,
    whileTap: onClick ? "tap" : undefined,
    style: tilt ? {
      rotateX,
      rotateY,
      transformStyle: 'preserve-3d' as const
    } : undefined,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave
  } : {};

  return (
    <Component
      className={`
        ${variantStyles[variant]}
        ${blurStyles[blur]}
        ${glow ? glowStyles[glowColor] : ''}
        ${hoverStyles}
        ${clickStyles}
        border
        rounded-2xl
        shadow-lg
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      onClick={onClick}
      role={role}
      aria-label={ariaLabel}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      {...motionProps}
    >
      {children}
    </Component>
  );
}