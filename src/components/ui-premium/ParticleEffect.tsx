/**
 * PARTICLE EFFECT - Coconut Design System
 * 
 * Features:
 * - Sparkle particles for generation
 * - Confetti for success
 * - Magic dust trails
 * - Customizable colors and count
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// ============================================
// TYPES
// ============================================

export type ParticleType = 'sparkles' | 'confetti' | 'magic' | 'success';

export interface ParticleEffectProps {
  type?: ParticleType;
  count?: number;
  duration?: number;
  colors?: string[];
  trigger?: boolean;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  velocity: { x: number; y: number };
}

// ============================================
// PARTICLE GENERATOR
// ============================================

function generateParticles(type: ParticleType, count: number, colors: string[]): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const particle: Particle = {
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      scale: Math.random() * 0.5 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
      },
    };

    // Type-specific adjustments
    if (type === 'confetti') {
      particle.velocity.y = Math.random() * 2 + 1; // Fall down
    } else if (type === 'success') {
      particle.y = 50; // Center
      particle.velocity.y = -Math.random() * 3; // Rise up
    }

    particles.push(particle);
  }

  return particles;
}

// ============================================
// SPARKLE PARTICLE
// ============================================

function SparkleParticle({ particle, duration }: { particle: Particle; duration: number }) {
  return (
    <motion.div
      key={particle.id}
      className="absolute"
      initial={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        scale: 0,
        rotate: particle.rotation,
        opacity: 1,
      }}
      animate={{
        scale: [0, particle.scale, 0],
        rotate: particle.rotation + 180,
        opacity: [0, 1, 0],
        left: `${particle.x + particle.velocity.x * 50}%`,
        top: `${particle.y + particle.velocity.y * 50}%`,
      }}
      transition={{
        duration: duration / 1000,
        ease: 'easeOut',
      }}
      style={{ color: particle.color }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 0L7 5L12 6L7 7L6 12L5 7L0 6L5 5L6 0Z" />
      </svg>
    </motion.div>
  );
}

// ============================================
// CONFETTI PARTICLE
// ============================================

function ConfettiParticle({ particle, duration }: { particle: Particle; duration: number }) {
  return (
    <motion.div
      key={particle.id}
      className="absolute w-2 h-3 rounded-sm"
      initial={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        rotate: particle.rotation,
        opacity: 1,
      }}
      animate={{
        left: `${particle.x + particle.velocity.x * 30}%`,
        top: `${particle.y + particle.velocity.y * 100}%`,
        rotate: particle.rotation + 720,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: duration / 1000,
        ease: 'easeIn',
      }}
      style={{ backgroundColor: particle.color }}
    />
  );
}

// ============================================
// MAGIC PARTICLE
// ============================================

function MagicParticle({ particle, duration }: { particle: Particle; duration: number }) {
  return (
    <motion.div
      key={particle.id}
      className="absolute w-1 h-1 rounded-full"
      initial={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        scale: 0,
        opacity: 1,
      }}
      animate={{
        scale: [0, particle.scale * 2, 0],
        opacity: [0, 1, 0],
        left: `${particle.x + particle.velocity.x * 80}%`,
        top: `${particle.y + particle.velocity.y * 80}%`,
      }}
      transition={{
        duration: duration / 1000,
        ease: 'easeOut',
      }}
      style={{
        backgroundColor: particle.color,
        boxShadow: `0 0 8px ${particle.color}`,
      }}
    />
  );
}

// ============================================
// COMPONENT
// ============================================

export function ParticleEffect({
  type = 'sparkles',
  count = 20,
  duration = 2000,
  colors = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981'],
  trigger = false,
  className = '',
}: ParticleEffectProps) {
  const [particles, setParticles] = React.useState<Particle[]>([]);
  const [isActive, setIsActive] = React.useState(false);

  useEffect(() => {
    if (trigger) {
      setIsActive(true);
      setParticles(generateParticles(type, count, colors));

      const timer = setTimeout(() => {
        setIsActive(false);
        setParticles([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, type, count, colors, duration]);

  const renderParticle = (particle: Particle) => {
    switch (type) {
      case 'confetti':
        return <ConfettiParticle key={particle.id} particle={particle} duration={duration} />;
      case 'magic':
        return <MagicParticle key={particle.id} particle={particle} duration={duration} />;
      default:
        return <SparkleParticle key={particle.id} particle={particle} duration={duration} />;
    }
  };

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <AnimatePresence>
        {isActive && particles.map((particle) => renderParticle(particle))}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// MAGIC TRAIL (for cursor)
// ============================================

export function MagicTrail({ enabled = false }: { enabled?: boolean }) {
  const [trail, setTrail] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
  const trailIdRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    function handleMouseMove(e: MouseEvent) {
      const id = trailIdRef.current++;
      setTrail((prev) => [...prev.slice(-20), { id, x: e.clientX, y: e.clientY }]);

      setTimeout(() => {
        setTrail((prev) => prev.filter((p) => p.id !== id));
      }, 1000);
    }

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enabled]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {trail.map((point, index) => (
        <motion.div
          key={point.id}
          className="absolute w-2 h-2 rounded-full bg-indigo-500"
          initial={{ scale: 1, opacity: 0.8, x: point.x, y: point.y }}
          animate={{ scale: 0, opacity: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            boxShadow: '0 0 8px rgba(99, 102, 241, 0.6)',
          }}
        />
      ))}
    </div>
  );
}

// Fix React import
import React from 'react';
