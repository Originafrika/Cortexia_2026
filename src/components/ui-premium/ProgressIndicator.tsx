/**
 * COCONUT V14 - PHASE 4 JOUR 5
 * Premium Progress Indicator Component
 * 
 * Features:
 * - Multiple variants (linear, circular, ring)
 * - Animated transitions
 * - Color themes
 * - Labels and values
 * - Indeterminate state
 */

import React from 'react';
import { motion } from 'motion/react';

// ============================================
// TYPES
// ============================================

export interface ProgressIndicatorProps {
  value?: number; // 0-100, undefined = indeterminate
  variant?: 'linear' | 'circular' | 'ring';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  label?: string;
  className?: string;
  thickness?: number;
}

// ============================================
// LINEAR PROGRESS
// ============================================

export function LinearProgress({
  value,
  size = 'md',
  color = 'primary',
  showValue = false,
  label,
  className = ''
}: ProgressIndicatorProps) {
  const isIndeterminate = value === undefined;
  
  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  };

  const colorStyles = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500'
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-gray-300">{label}</span>}
          {showValue && !isIndeterminate && (
            <span className="text-sm font-medium text-white">{value}%</span>
          )}
        </div>
      )}
      
      <div className={`w-full ${sizeStyles[size]} bg-white/10 rounded-full overflow-hidden`}>
        {isIndeterminate ? (
          <motion.div
            className={`h-full ${colorStyles[color]} rounded-full`}
            animate={{
              x: ['-100%', '200%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{ width: '50%' }}
          />
        ) : (
          <motion.div
            className={`h-full ${colorStyles[color]} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// CIRCULAR PROGRESS
// ============================================

export function CircularProgress({
  value,
  size = 'md',
  color = 'primary',
  showValue = true,
  thickness = 4,
  className = ''
}: ProgressIndicatorProps) {
  const isIndeterminate = value === undefined;
  
  const sizeValues = {
    sm: 40,
    md: 60,
    lg: 80,
    xl: 120
  };

  const colorStyles = {
    primary: '#8B5CF6',
    secondary: '#EC4899',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  };

  const diameter = sizeValues[size];
  const radius = (diameter - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = isIndeterminate ? 0 : ((100 - (value || 0)) / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={diameter}
        height={diameter}
        className={isIndeterminate ? 'animate-spin' : ''}
      >
        {/* Background Circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={thickness}
        />
        
        {/* Progress Circle */}
        <motion.circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={colorStyles[color]}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          transform={`rotate(-90 ${diameter / 2} ${diameter / 2})`}
        />
      </svg>
      
      {showValue && !isIndeterminate && (
        <span
          className="absolute inset-0 flex items-center justify-center font-semibold text-white"
          style={{ fontSize: diameter / 4 }}
        >
          {value}%
        </span>
      )}
    </div>
  );
}

// ============================================
// RING PROGRESS
// ============================================

export function RingProgress({
  value = 0,
  size = 'md',
  color = 'primary',
  showValue = true,
  thickness = 8,
  label,
  className = ''
}: ProgressIndicatorProps) {
  const sizeValues = {
    sm: 80,
    md: 120,
    lg: 160,
    xl: 200
  };

  const colorStyles = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
    error: 'from-error-500 to-error-600'
  };

  const diameter = sizeValues[size];
  const radius = (diameter - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - value) / 100) * circumference;

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg width={diameter} height={diameter}>
        {/* Background Ring */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={thickness}
        />
        
        {/* Gradient Definition */}
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className={`text-${color}-500`} stopColor="currentColor" />
            <stop offset="100%" className={`text-${color}-600`} stopColor="currentColor" />
          </linearGradient>
        </defs>
        
        {/* Progress Ring */}
        <motion.circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${color})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 1, ease: 'easeOut' }}
          transform={`rotate(-90 ${diameter / 2} ${diameter / 2})`}
          filter="drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <motion.span
            className="font-bold text-white"
            style={{ fontSize: diameter / 5 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {value}%
          </motion.span>
        )}
        
        {label && (
          <span className="text-sm text-gray-400 mt-1">{label}</span>
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT (Auto-select variant)
// ============================================

export function ProgressIndicator(props: ProgressIndicatorProps) {
  const { variant = 'linear' } = props;
  
  switch (variant) {
    case 'circular':
      return <CircularProgress {...props} />;
    case 'ring':
      return <RingProgress {...props} />;
    case 'linear':
    default:
      return <LinearProgress {...props} />;
  }
}

export default ProgressIndicator;
