/**
 * LOADING SKELETON COMPONENT
 * Beauty Design System - Fallback pour composants async
 * 
 * Usage:
 * <Suspense fallback={<LoadingSkeleton variant="workflow" />}>
 *   <Component />
 * </Suspense>
 */

import React from 'react';
import { motion } from 'motion/react';
import { tokens, TRANSITIONS } from '@/lib/design/tokens';

// ============================================
// TYPES
// ============================================

export interface LoadingSkeletonProps {
  variant?: 'default' | 'workflow' | 'card' | 'list';
  lines?: number;
  className?: string;
}

// ============================================
// SKELETON VARIANTS
// ============================================

function DefaultSkeleton({ lines = 3 }: { lines: number }) {
  return (
    <div className="space-y-4 p-6">
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
          className={`h-4 bg-white/20 ${tokens.radius.md}`}
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

function WorkflowSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      {/* Animated center circle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={TRANSITIONS.rotate}
        className={`w-24 h-24 ${tokens.radius.full} border-4 border-transparent border-t-[#f97316] border-r-[#f97316]/50 mb-6`}
      />
      
      {/* Progress bar */}
      <div className="w-full max-w-md mb-6">
        <motion.div
          className={`h-2 bg-white/10 ${tokens.radius.full} overflow-hidden`}
        >
          <motion.div
            className={`h-full ${tokens.gradients.coconutWarm}`}
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ width: '50%' }}
          />
        </motion.div>
      </div>
      
      {/* Text lines */}
      <DefaultSkeleton lines={2} />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className={`bg-white/5 border border-white/10 ${tokens.radius.lg} p-6 space-y-4`}>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`h-6 w-3/4 bg-white/20 ${tokens.radius.md}`}
      />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        className={`h-4 w-full bg-white/20 ${tokens.radius.md}`}
      />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        className={`h-4 w-5/6 bg-white/20 ${tokens.radius.md}`}
      />
    </div>
  );
}

function ListSkeleton({ lines = 5 }: { lines: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`flex items-center gap-4 p-4 bg-white/5 border border-white/10 ${tokens.radius.md}`}
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            className={`w-10 h-10 bg-white/20 ${tokens.radius.md} flex-shrink-0`}
          />
          <div className="flex-1 space-y-2">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 + 0.1 }}
              className={`h-4 w-3/4 bg-white/20 ${tokens.radius.sm}`}
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 + 0.2 }}
              className={`h-3 w-1/2 bg-white/20 ${tokens.radius.sm}`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function LoadingSkeleton({
  variant = 'default',
  lines = 3,
  className = '',
}: LoadingSkeletonProps) {
  return (
    <div className={className} role="status" aria-live="polite" aria-label="Chargement en cours">
      {variant === 'workflow' && <WorkflowSkeleton />}
      {variant === 'card' && <CardSkeleton />}
      {variant === 'list' && <ListSkeleton lines={lines} />}
      {variant === 'default' && <DefaultSkeleton lines={lines} />}
      
      <span className="sr-only">Chargement en cours...</span>
    </div>
  );
}