/**
 * COCONUT V14 - PHASE 4 JOUR 5
 * Animated Wrapper Components
 * 
 * Wrappers pour animations stagger
 */

import React from 'react';
import { motion } from 'motion/react';

// ============================================
// STAGGER CONTAINER
// ============================================

export interface AnimatedStaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function AnimatedStaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1
}: AnimatedStaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// STAGGER ITEM
// ============================================

export interface AnimatedStaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedStaggerItem({
  children,
  className = ''
}: AnimatedStaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.5,
            ease: 'easeOut',
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedStaggerContainer;
