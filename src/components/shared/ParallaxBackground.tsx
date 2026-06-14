/**
 * PARALLAX BACKGROUND - BDS Musique (Motion) + Géométrie (Structure)
 * Animated gradient orbs avec parallax sur scroll
 * 7 Arts: Musique (mouvement orchestré), Géométrie (proportions harmonieuses)
 */

import { motion, useScroll, useTransform } from 'motion/react';
import { useTheme } from '../../lib/contexts/ThemeContext';

interface ParallaxBackgroundProps {
  variant?: 'purple' | 'indigo';
}

export function ParallaxBackground({ variant }: ParallaxBackgroundProps) {
  const { theme } = useTheme();
  const activeVariant = variant || theme;

  // BDS: Musique - Parallax on scroll
  const { scrollY } = useScroll();
  
  // BDS: Arithmétique - Different speeds for depth perception
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]); // Slower (background)
  const y2 = useTransform(scrollY, [0, 1000], [0, 200]); // Medium
  const y3 = useTransform(scrollY, [0, 1000], [0, 150]); // Faster (foreground)

  // BDS: Géométrie - Theme-specific colors
  const colors = {
    purple: {
      orb1: 'bg-purple-600/10',
      orb2: 'bg-pink-600/10',
      orb3: 'bg-orange-600/10',
    },
    indigo: {
      orb1: 'bg-indigo-600/10',
      orb2: 'bg-purple-600/10',
      orb3: 'bg-violet-600/10',
    },
  };

  const activeColors = colors[activeVariant];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* BDS: Musique - Orb 1 (slowest, background) */}
      <motion.div
        className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] ${activeColors.orb1} rounded-full blur-3xl animate-pulse`}
        style={{ 
          y: y1,
          animationDuration: '8s',
        }}
      />

      {/* BDS: Musique - Orb 2 (medium speed) */}
      <motion.div
        className={`absolute bottom-1/4 right-1/4 w-[500px] h-[500px] ${activeColors.orb2} rounded-full blur-3xl animate-pulse`}
        style={{ 
          y: y2,
          animationDelay: '2s',
          animationDuration: '10s',
        }}
      />

      {/* BDS: Musique - Orb 3 (fastest, foreground) */}
      <motion.div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] ${activeColors.orb3} rounded-full blur-3xl animate-pulse`}
        style={{ 
          y: y3,
          animationDelay: '4s',
          animationDuration: '12s',
        }}
      />

      {/* BDS: Géométrie - Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
}
