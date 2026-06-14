/**
 * COCONUT V14 - PHASE 4 JOUR 5
 * Premium Skeleton Loader Component
 * 
 * Features:
 * - Multiple variants
 * - Shimmer animation
 * - Customizable shapes
 * - Composition patterns
 */

import React from 'react';
import { motion } from 'motion/react';

// ============================================
// TYPES
// ============================================

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
  animate?: boolean;
}

export interface SkeletonGroupProps {
  children: React.ReactNode;
  className?: string;
}

// ============================================
// SKELETON
// ============================================

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  animate = true
}: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl'
  };

  const shimmerAnimation = animate ? {
    backgroundPosition: ['200% 0', '-200% 0']
  } : {};

  return (
    <motion.div
      className={`
        bg-gradient-to-r from-white/10 via-white/20 to-white/10
        bg-[length:200%_100%]
        ${variantStyles[variant]}
        ${className}
      `}
      style={{
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'circular' ? width : undefined)
      }}
      animate={shimmerAnimation}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  );
}

// ============================================
// SKELETON GROUP (for spacing)
// ============================================

export function SkeletonGroup({ children, className = '' }: SkeletonGroupProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {children}
    </div>
  );
}

// ============================================
// PRESET PATTERNS
// ============================================

export function SkeletonCard() {
  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
      <Skeleton variant="circular" width={64} height={64} />
      <SkeletonGroup>
        <Skeleton width="60%" />
        <Skeleton width="40%" />
        <Skeleton width="80%" />
      </SkeletonGroup>
    </div>
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <Skeleton variant="circular" width={size} height={size} />
  );
}

export function SkeletonButton({ width = 120 }: { width?: number }) {
  return (
    <Skeleton variant="rounded" width={width} height={40} />
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        <Skeleton width="30%" height={40} />
        <Skeleton width="40%" height={40} />
        <Skeleton width="30%" height={40} />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton width="30%" height={32} />
          <Skeleton width="40%" height={32} />
          <Skeleton width="30%" height={32} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <SkeletonGroup>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </SkeletonGroup>
  );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <SkeletonAvatar size={48} />
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" />
            <Skeleton width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
