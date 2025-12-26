/**
 * PROGRESS - Coconut Design System
 * 
 * Features:
 * - Linear and circular variants
 * - Animated progress
 * - Multiple colors
 * - Label support
 * - Gradient option
 */

import { motion } from 'motion/react';

// ============================================
// TYPES
// ============================================

export type ProgressVariant = 'linear' | 'circular';
export type ProgressColor = 'primary' | 'success' | 'warning' | 'error';
export type ProgressSize = 'sm' | 'md' | 'lg';

export interface ProgressProps {
  value: number; // 0-100
  variant?: ProgressVariant;
  color?: ProgressColor;
  size?: ProgressSize;
  showLabel?: boolean;
  label?: string;
  gradient?: boolean;
  className?: string;
}

// ============================================
// STYLES
// ============================================

const colorStyles: Record<ProgressColor, { bg: string; gradient: string }> = {
  primary: {
    bg: 'bg-indigo-500',
    gradient: 'from-indigo-500 to-purple-500',
  },
  success: {
    bg: 'bg-green-500',
    gradient: 'from-green-500 to-emerald-500',
  },
  warning: {
    bg: 'bg-amber-500',
    gradient: 'from-amber-500 to-orange-500',
  },
  error: {
    bg: 'bg-red-500',
    gradient: 'from-red-500 to-pink-500',
  },
};

const linearSizeStyles: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const circularSizeStyles: Record<ProgressSize, { size: number; stroke: number }> = {
  sm: { size: 48, stroke: 4 },
  md: { size: 64, stroke: 6 },
  lg: { size: 96, stroke: 8 },
};

// ============================================
// LINEAR PROGRESS
// ============================================

function LinearProgress({
  value,
  color,
  size,
  showLabel,
  label,
  gradient,
  className,
}: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">{label || 'Progress'}</span>
          <span className="text-gray-400 font-mono">{Math.round(clampedValue)}%</span>
        </div>
      )}

      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${linearSizeStyles[size!]}`}>
        <motion.div
          className={`h-full ${gradient ? `bg-gradient-to-r ${colorStyles[color!].gradient}` : colorStyles[color!].bg} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ============================================
// CIRCULAR PROGRESS
// ============================================

function CircularProgress({
  value,
  color,
  size,
  showLabel,
  gradient,
  className,
}: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const { size: circleSize, stroke: strokeWidth } = circularSizeStyles[size!];
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={circleSize} height={circleSize} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-800"
        />

        {/* Gradient Definition */}
        {gradient && (
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={`text-${color}-500`} style={{ stopColor: 'currentColor' }} />
              <stop offset="100%" className={`text-purple-500`} style={{ stopColor: 'currentColor' }} />
            </linearGradient>
          </defs>
        )}

        {/* Progress Circle */}
        <motion.circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          stroke={gradient ? `url(#gradient-${color})` : 'currentColor'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={gradient ? '' : `text-${color}-500`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>

      {/* Label */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-white">
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function Progress({
  value,
  variant = 'linear',
  color = 'primary',
  size = 'md',
  showLabel = false,
  label,
  gradient = false,
  className = '',
}: ProgressProps) {
  if (variant === 'circular') {
    return (
      <CircularProgress
        value={value}
        variant={variant}
        color={color}
        size={size}
        showLabel={showLabel}
        gradient={gradient}
        className={className}
      />
    );
  }

  return (
    <LinearProgress
      value={value}
      variant={variant}
      color={color}
      size={size}
      showLabel={showLabel}
      label={label}
      gradient={gradient}
      className={className}
    />
  );
}

// ============================================
// INDETERMINATE PROGRESS
// ============================================

export interface IndeterminateProgressProps {
  color?: ProgressColor;
  size?: ProgressSize;
  className?: string;
}

export function IndeterminateProgress({
  color = 'primary',
  size = 'md',
  className = '',
}: IndeterminateProgressProps) {
  return (
    <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${linearSizeStyles[size]} ${className}`}>
      <motion.div
        className={`h-full w-1/3 bg-gradient-to-r ${colorStyles[color].gradient} rounded-full`}
        animate={{
          x: ['-100%', '400%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
