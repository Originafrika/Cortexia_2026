/**
 * 🏢 ENTERPRISE PROGRESS COMPONENT
 * Progress bars and indicators - Clean & minimal
 * BDS: Arithmétique (Art 4) + Musique (Art 6)
 */

import React from 'react';
import { motion } from 'motion/react';

export interface ProgressProps {
  value: number; // 0-100
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const variantColors = {
  default: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function Progress({
  value,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  className = '',
}: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">{label || 'Progress'}</span>
          <span className="text-sm font-medium text-white">{Math.round(clampedValue)}%</span>
        </div>
      )}
      
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <motion.div
          className={`h-full ${variantColors[variant]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={animated ? { duration: 0.5, ease: 'easeOut' } : { duration: 0 }}
        />
      </div>
    </div>
  );
}

// Circular Progress
export interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showLabel = true,
  className = '',
}: CircularProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  const strokeColors = {
    default: 'stroke-blue-500',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    error: 'stroke-red-500',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-gray-800"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={strokeColors[variant]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-semibold text-white">
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Indeterminate Progress (loading spinner)
export function IndeterminateProgress({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${sizeStyles[size]} ${className}`}>
      <motion.div
        className="h-full w-1/3 bg-blue-500 rounded-full"
        animate={{
          x: ['-100%', '400%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

// Step Progress
export interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  steps?: { label: string; description?: string }[];
  className?: string;
}

export function StepProgress({
  currentStep,
  totalSteps,
  steps,
  className = '',
}: StepProgressProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const stepData = steps?.[index];

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    font-semibold text-sm transition-colors
                    ${isCompleted 
                      ? 'bg-blue-500 text-white' 
                      : isCurrent
                        ? 'bg-blue-500 text-white ring-4 ring-blue-500/20'
                        : 'bg-gray-800 text-gray-500'
                    }
                  `}
                >
                  {stepNumber}
                </div>
                {stepData && (
                  <div className="text-center">
                    <div className={`text-sm font-medium ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                      {stepData.label}
                    </div>
                    {stepData.description && (
                      <div className="text-xs text-gray-500 mt-1">
                        {stepData.description}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {index < totalSteps - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-gray-800">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
