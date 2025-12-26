/**
 * COCONUT V14 - PHASE 4 JOUR 5
 * Premium Stats Card Component
 * 
 * Features:
 * - Animated counters
 * - Trend indicators
 * - Sparkline charts
 * - Multiple variants
 * - Glass morphism
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { GlassCard } from '../ui/glass-card';

// ============================================
// TYPES
// ============================================

export interface StatsCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  unit?: string;
  prefix?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  animated?: boolean;
  sparklineData?: number[];
  variant?: 'default' | 'gradient' | 'glow';
  className?: string;
}

// ============================================
// ANIMATED COUNTER
// ============================================

function AnimatedCounter({ 
  value, 
  duration = 1 
}: { 
  value: number; 
  duration?: number; 
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      // Easing function (easeOutCubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{count}</>;
}

// ============================================
// SPARKLINE
// ============================================

function Sparkline({ data, color = '#8B5CF6' }: { data: number[]; color?: string }) {
  if (!data || data.length === 0) return null;

  const width = 100;
  const height = 30;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="opacity-50">
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  );
}

// ============================================
// STATS CARD
// ============================================

export function StatsCard({
  title,
  value,
  previousValue,
  unit = '',
  prefix = '',
  icon: Icon,
  iconColor = 'text-primary-400',
  trend,
  trendValue,
  animated = true,
  sparklineData,
  variant = 'default',
  className = ''
}: StatsCardProps) {
  // Calculate trend if not provided
  const calculatedTrend = trend || (
    previousValue !== undefined && typeof value === 'number'
      ? value > previousValue ? 'up' : value < previousValue ? 'down' : 'neutral'
      : undefined
  );

  const calculatedTrendValue = trendValue || (
    previousValue !== undefined && typeof value === 'number' && previousValue !== 0
      ? ((value - previousValue) / previousValue) * 100
      : undefined
  );

  const trendConfig = {
    up: {
      icon: TrendingUp,
      color: 'text-success-400',
      bgColor: 'bg-success-500/10'
    },
    down: {
      icon: TrendingDown,
      color: 'text-error-400',
      bgColor: 'bg-error-500/10'
    },
    neutral: {
      icon: Minus,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10'
    }
  };

  const TrendIcon = calculatedTrend ? trendConfig[calculatedTrend].icon : null;

  const variantStyles = {
    default: '',
    gradient: 'bg-gradient-to-br from-primary-500/10 to-secondary-500/10',
    glow: 'shadow-[0_0_30px_-10px] shadow-primary-500/30'
  };

  return (
    <GlassCard
      className={`p-6 ${variantStyles[variant]} ${className}`}
      hover
      animated
    >
      <div className="space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-400">{title}</p>
            <div className="flex items-baseline gap-1">
              <motion.h3
                className="text-3xl font-bold text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {prefix}
                {animated && typeof value === 'number' ? (
                  <AnimatedCounter value={value} />
                ) : (
                  value
                )}
                {unit && <span className="text-xl text-gray-400 ml-1">{unit}</span>}
              </motion.h3>
            </div>
          </div>

          {/* Icon */}
          {Icon && (
            <motion.div
              className={`p-3 rounded-xl bg-white/5 ${iconColor}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-6 h-6" />
            </motion.div>
          )}
        </div>

        {/* Trend & Sparkline */}
        <div className="flex items-center justify-between">
          
          {/* Trend Indicator */}
          {calculatedTrend && TrendIcon && (
            <motion.div
              className={`
                flex items-center gap-1 px-2 py-1 rounded-lg
                ${trendConfig[calculatedTrend].bgColor}
              `}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TrendIcon className={`w-4 h-4 ${trendConfig[calculatedTrend].color}`} />
              {calculatedTrendValue !== undefined && (
                <span className={`text-sm font-medium ${trendConfig[calculatedTrend].color}`}>
                  {calculatedTrendValue > 0 ? '+' : ''}{calculatedTrendValue.toFixed(1)}%
                </span>
              )}
            </motion.div>
          )}

          {/* Sparkline */}
          {sparklineData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Sparkline 
                data={sparklineData} 
                color={calculatedTrend === 'up' ? '#10B981' : calculatedTrend === 'down' ? '#EF4444' : '#8B5CF6'}
              />
            </motion.div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

export default StatsCard;
