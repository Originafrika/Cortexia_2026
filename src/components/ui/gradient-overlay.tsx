/**
 * COCONUT V14 - GRADIENT OVERLAY COMPONENT
 * Phase 4 - Jour 2: Premium gradient backgrounds
 */

import React from 'react';

export interface GradientOverlayProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'cosmic' | 'rainbow' | 'sunset' | 'ocean';
  opacity?: number;
  blur?: boolean;
  animated?: boolean;
  position?: 'fixed' | 'absolute' | 'relative';
  zIndex?: number;
}

export function GradientOverlay({
  children,
  className = '',
  variant = 'primary',
  opacity = 0.1,
  blur = false,
  animated = false,
  position = 'absolute',
  zIndex = 0
}: GradientOverlayProps) {
  // Gradient variants
  const gradients = {
    primary: 'from-primary-500 via-primary-600 to-primary-700',
    secondary: 'from-secondary-500 via-secondary-600 to-secondary-700',
    accent: 'from-accent-500 via-accent-600 to-accent-700',
    cosmic: 'from-primary-600 via-secondary-600 to-accent-600',
    rainbow: 'from-primary-500 via-secondary-500 to-accent-500',
    sunset: 'from-warning-400 via-accent-500 to-secondary-600',
    ocean: 'from-primary-400 via-primary-600 to-secondary-700'
  };

  // Animation
  const animationStyles = animated
    ? 'bg-[length:200%_200%] animate-[gradient-shift_8s_ease_infinite]'
    : '';

  // Blur
  const blurStyles = blur ? 'backdrop-blur-3xl' : '';

  // Position
  const positionStyles = {
    fixed: 'fixed inset-0',
    absolute: 'absolute inset-0',
    relative: 'relative'
  };

  return (
    <div
      className={`
        ${positionStyles[position]}
        bg-gradient-to-br
        ${gradients[variant]}
        ${animationStyles}
        ${blurStyles}
        pointer-events-none
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={{ 
        opacity,
        zIndex
      }}
    >
      {children}
    </div>
  );
}

/**
 * Animated blob gradient for premium effects
 */
export interface AnimatedBlobProps {
  className?: string;
  color?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: { x: string; y: string };
  delay?: number;
}

export function AnimatedBlob({
  className = '',
  color = 'primary',
  size = 'md',
  position = { x: '0%', y: '0%' },
  delay = 0
}: AnimatedBlobProps) {
  // Color variants
  const colors = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    accent: 'bg-accent-500'
  };

  // Sizes
  const sizes = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
    xl: 'w-96 h-96'
  };

  return (
    <div
      className={`
        ${colors[color]}
        ${sizes[size]}
        rounded-full
        filter blur-3xl
        opacity-30
        absolute
        animate-blob
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={{
        left: position.x,
        top: position.y,
        animationDelay: `${delay}ms`
      }}
    />
  );
}

/**
 * Mesh gradient background
 */
export interface MeshGradientProps {
  className?: string;
  colors?: string[];
}

export function MeshGradient({
  className = '',
  colors = [
    'from-primary-500/20',
    'via-secondary-500/20',
    'to-accent-500/20'
  ]
}: MeshGradientProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Base gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.join(' ')}`} />
      
      {/* Animated blobs */}
      <AnimatedBlob color="primary" size="xl" position={{ x: '10%', y: '10%' }} delay={0} />
      <AnimatedBlob color="secondary" size="lg" position={{ x: '70%', y: '20%' }} delay={2000} />
      <AnimatedBlob color="accent" size="md" position={{ x: '30%', y: '70%' }} delay={4000} />
      <AnimatedBlob color="primary" size="lg" position={{ x: '80%', y: '60%' }} delay={6000} />
    </div>
  );
}
