/**
 * AnimatedGradientOrbs Component
 * Animated gradient background orbs for Coconut UI
 */

import { motion } from 'motion/react';

interface AnimatedGradientOrbsProps {
  variant?: 'hero' | 'page' | 'subtle';
}

export function AnimatedGradientOrbs({ variant = 'page' }: AnimatedGradientOrbsProps) {
  const variants = {
    hero: {
      orb1: { size: 500, top: -200, left: '20%', blur: 120 },
      orb2: { size: 600, top: -100, right: '20%', blur: 140 },
    },
    page: {
      orb1: { size: 400, top: -150, left: '15%', blur: 100 },
      orb2: { size: 450, top: -80, right: '15%', blur: 110 },
    },
    subtle: {
      orb1: { size: 300, top: -100, left: '10%', blur: 80 },
      orb2: { size: 350, top: -50, right: '10%', blur: 90 },
    },
  };

  const config = variants[variant];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Orb 1 - Indigo */}
      <motion.div
        className="absolute rounded-full mix-blend-multiply"
        style={{
          top: config.orb1.top,
          left: config.orb1.left,
          width: config.orb1.size,
          height: config.orb1.size,
          background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)',
          filter: `blur(${config.orb1.blur}px)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Orb 2 - Purple */}
      <motion.div
        className="absolute rounded-full mix-blend-multiply"
        style={{
          top: config.orb2.top,
          right: config.orb2.right,
          width: config.orb2.size,
          height: config.orb2.size,
          background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
          filter: `blur(${config.orb2.blur}px)`,
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
    </div>
  );
}
