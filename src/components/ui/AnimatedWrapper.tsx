/**
 * ANIMATED WRAPPER - Simplified animation component
 * 
 * Easy-to-use wrapper that applies BDS-compliant animations
 * to any children component
 */

import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import * as presets from '../../lib/animations/presets';

type AnimationPreset = 
  | 'fadeIn'
  | 'fadeInUp'
  | 'fadeInDown'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'scaleIn'
  | 'scaleInBounce'
  | 'popIn'
  | 'slideInFromBottom'
  | 'slideInFromTop'
  | 'slideInFromLeft'
  | 'slideInFromRight'
  | 'rotateIn'
  | 'flipIn';

interface AnimatedWrapperProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: React.ReactNode;
  animation?: AnimationPreset;
  delay?: number;
  duration?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'span' | 'li';
}

export function AnimatedWrapper({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = presets.DURATIONS.normal,
  className = '',
  as = 'div',
  ...props
}: AnimatedWrapperProps) {
  const MotionComponent = motion[as] as typeof motion.div;
  
  const variants = presets.getAccessibleVariant(presets[animation]);

  return (
    <MotionComponent
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration,
        delay,
        ease: presets.EASINGS.ease
      }}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}

/**
 * Animated list container with stagger effect
 */
interface AnimatedListProps extends HTMLMotionProps<'ul'> {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function AnimatedList({
  children,
  staggerDelay = 0.1,
  className = '',
  ...props
}: AnimatedListProps) {
  return (
    <motion.ul
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1
          }
        }
      }}
      initial="initial"
      animate="animate"
      className={className}
      {...props}
    >
      {children}
    </motion.ul>
  );
}

/**
 * Animated list item (use inside AnimatedList)
 */
interface AnimatedListItemProps extends HTMLMotionProps<'li'> {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedListItem({
  children,
  className = '',
  ...props
}: AnimatedListItemProps) {
  return (
    <motion.li
      variants={presets.staggerItem}
      className={className}
      {...props}
    >
      {children}
    </motion.li>
  );
}

/**
 * Animated button with hover/tap effects
 */
interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'whileHover' | 'whileTap'> {
  children: React.ReactNode;
  hoverEffect?: 'scale' | 'lift' | 'none';
  tapEffect?: boolean;
  className?: string;
}

export function AnimatedButton({
  children,
  hoverEffect = 'scale',
  tapEffect = true,
  className = '',
  disabled,
  ...props
}: AnimatedButtonProps) {
  const hoverAnimation = disabled 
    ? undefined 
    : hoverEffect === 'scale' 
    ? presets.hoverScale 
    : hoverEffect === 'lift' 
    ? presets.hoverLift 
    : undefined;

  const tapAnimation = disabled || !tapEffect ? undefined : presets.tapScale;

  return (
    <motion.button
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      className={className}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * Animated card with entrance animation
 */
interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedCard({
  children,
  delay = 0,
  className = '',
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{
        duration: presets.DURATIONS.smooth,
        delay,
        ease: presets.EASINGS.ease
      }}
      whileHover={{ y: -4, transition: { duration: presets.DURATIONS.fast } }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Loading spinner with rotation
 */
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <motion.div
      animate={presets.spin}
      className={`${sizeClasses[size]} border-purple-200 border-t-purple-600 rounded-full ${className}`}
      role="status"
      aria-label="Chargement"
    />
  );
}

/**
 * Pulsing indicator (for notifications)
 */
interface PulseIndicatorProps {
  className?: string;
  color?: 'purple' | 'orange' | 'green' | 'red';
}

export function PulseIndicator({ className = '', color = 'purple' }: PulseIndicatorProps) {
  const colorClasses = {
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    red: 'bg-red-500'
  };

  return (
    <motion.div
      animate={presets.pulse}
      className={`w-3 h-3 rounded-full ${colorClasses[color]} ${className}`}
    />
  );
}
