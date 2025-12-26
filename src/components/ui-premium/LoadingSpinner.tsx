/**
 * LOADING SPINNER - Coconut Design System
 * 
 * Features:
 * - Multiple variants (spinner, dots, pulse, bars)
 * - Multiple sizes
 * - Color variants
 * - Custom text
 * - Fullscreen overlay option
 */

import { motion } from 'motion/react';

// ============================================
// TYPES
// ============================================

export type SpinnerVariant = 'spinner' | 'dots' | 'pulse' | 'bars' | 'orbit';
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'primary' | 'success' | 'warning' | 'error' | 'white';

export interface LoadingSpinnerProps {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  color?: SpinnerColor;
  text?: string;
  fullscreen?: boolean;
  className?: string;
}

// ============================================
// STYLES
// ============================================

const sizeStyles: Record<SpinnerSize, { container: string; element: string; text: string }> = {
  sm: {
    container: 'gap-2',
    element: 'w-4 h-4',
    text: 'text-xs',
  },
  md: {
    container: 'gap-3',
    element: 'w-8 h-8',
    text: 'text-sm',
  },
  lg: {
    container: 'gap-4',
    element: 'w-12 h-12',
    text: 'text-base',
  },
  xl: {
    container: 'gap-6',
    element: 'w-16 h-16',
    text: 'text-lg',
  },
};

const colorStyles: Record<SpinnerColor, string> = {
  primary: 'text-indigo-500',
  success: 'text-green-500',
  warning: 'text-amber-500',
  error: 'text-red-500',
  white: 'text-white',
};

// ============================================
// SPINNER VARIANTS
// ============================================

function SpinnerIcon({ size, color }: { size: SpinnerSize; color: SpinnerColor }) {
  return (
    <motion.div
      className={`${sizeStyles[size].element} ${colorStyles[color]} relative`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
}

function DotsIcon({ size, color }: { size: SpinnerSize; color: SpinnerColor }) {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${dotSize} ${colorStyles[color]} bg-current rounded-full`}
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

function PulseIcon({ size, color }: { size: SpinnerSize; color: SpinnerColor }) {
  return (
    <motion.div
      className={`${sizeStyles[size].element} ${colorStyles[color]} bg-current rounded-full`}
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
}

function BarsIcon({ size, color }: { size: SpinnerSize; color: SpinnerColor }) {
  const barWidth = size === 'sm' ? 'w-0.5' : size === 'md' ? 'w-1' : size === 'lg' ? 'w-1.5' : 'w-2';
  const barHeight = size === 'sm' ? 'h-4' : size === 'md' ? 'h-8' : size === 'lg' ? 'h-12' : 'h-16';

  return (
    <div className="flex items-end gap-1">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={`${barWidth} ${barHeight} ${colorStyles[color]} bg-current rounded-full`}
          animate={{ scaleY: [0.3, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

function OrbitIcon({ size, color }: { size: SpinnerSize; color: SpinnerColor }) {
  const orbitSize = sizeStyles[size].element;
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className={`${orbitSize} relative`}>
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <div className={`${dotSize} ${colorStyles[color]} bg-current rounded-full absolute top-0 left-1/2 -translate-x-1/2`} />
      </motion.div>
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      >
        <div className={`${dotSize} ${colorStyles[color]} bg-current rounded-full absolute bottom-0 left-1/2 -translate-x-1/2 opacity-60`} />
      </motion.div>
    </div>
  );
}

// ============================================
// COMPONENT
// ============================================

export function LoadingSpinner({
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  text,
  fullscreen = false,
  className = '',
}: LoadingSpinnerProps) {
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsIcon size={size} color={color} />;
      case 'pulse':
        return <PulseIcon size={size} color={color} />;
      case 'bars':
        return <BarsIcon size={size} color={color} />;
      case 'orbit':
        return <OrbitIcon size={size} color={color} />;
      default:
        return <SpinnerIcon size={size} color={color} />;
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center ${sizeStyles[size].container} ${className}`}>
      {renderSpinner()}
      {text && (
        <motion.p
          className={`${sizeStyles[size].text} ${colorStyles[color]} font-medium`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center"
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

// ============================================
// SKELETON LOADER
// ============================================

export interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export function Skeleton({
  width = 'w-full',
  height = 'h-4',
  className = '',
  variant = 'rectangular',
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  };

  return (
    <motion.div
      className={`${width} ${height} ${variantStyles[variant]} bg-gray-700 relative overflow-hidden ${className}`}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
}
