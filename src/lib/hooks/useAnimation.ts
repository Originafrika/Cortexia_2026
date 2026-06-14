/**
 * COCONUT V14 - PHASE 4 JOUR 3
 * useAnimation Hook
 * 
 * Hook pour contrôler facilement les animations avec motion/react
 * BDS: Logique du Système (Cohérence Cognitive)
 */

import { useAnimationControls, useInView, AnimationControls } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../animations/transitions';

// ============================================
// USE ANIMATION CONTROLS
// ============================================

/**
 * Hook pour contrôler manuellement les animations
 * Wrapper autour de useAnimationControls avec helpers
 */
export function useAnimation() {
  const controls = useAnimationControls();
  const reducedMotion = prefersReducedMotion();
  
  const animate = async (animation: string | object) => {
    if (reducedMotion) {
      // Skip animation si prefers-reduced-motion
      return;
    }
    return await controls.start(animation);
  };
  
  const stop = () => {
    controls.stop();
  };
  
  const set = (animation: string | object) => {
    controls.set(animation);
  };
  
  return {
    controls,
    animate,
    stop,
    set,
    isReducedMotion: reducedMotion,
  };
}

// ============================================
// USE SCROLL ANIMATION
// ============================================

interface UseScrollAnimationOptions {
  threshold?: number;
  once?: boolean;
  margin?: string;
}

/**
 * Hook pour animer les éléments quand ils entrent dans le viewport
 * 
 * @example
 * const { ref, isInView } = useScrollAnimation({ once: true });
 * return <motion.div ref={ref} animate={isInView ? "visible" : "hidden"} />
 */
export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0.3,
    once = true,
    margin = '0px',
  } = options;
  
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
    margin,
  });
  
  return {
    ref,
    isInView,
    controls: isInView ? 'visible' : 'hidden',
  };
}

// ============================================
// USE STAGGER ANIMATION
// ============================================

interface UseStaggerAnimationOptions {
  staggerDelay?: number;
  delayChildren?: number;
}

/**
 * Hook pour créer des animations stagger facilement
 * 
 * @example
 * const { containerVariants, itemVariants } = useStaggerAnimation();
 * return (
 *   <motion.div variants={containerVariants} initial="initial" animate="animate">
 *     {items.map(item => (
 *       <motion.div key={item.id} variants={itemVariants}>{item.content}</motion.div>
 *     ))}
 *   </motion.div>
 * );
 */
export function useStaggerAnimation(options: UseStaggerAnimationOptions = {}) {
  const {
    staggerDelay = 0.05,
    delayChildren = 0.1,
  } = options;
  
  const reducedMotion = prefersReducedMotion();
  
  if (reducedMotion) {
    return {
      containerVariants: {
        initial: {},
        animate: {},
      },
      itemVariants: {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
      },
    };
  }
  
  return {
    containerVariants: {
      initial: {},
      animate: {
        transition: {
          staggerChildren: staggerDelay,
          delayChildren,
        },
      },
    },
    itemVariants: {
      initial: { opacity: 0, y: 20 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      },
    },
  };
}

// ============================================
// USE HOVER ANIMATION
// ============================================

interface UseHoverAnimationOptions {
  scale?: number;
  y?: number;
  duration?: number;
}

/**
 * Hook pour créer facilement des effets hover
 * 
 * @example
 * const hoverProps = useHoverAnimation({ scale: 1.05, y: -4 });
 * return <motion.div {...hoverProps}>Hover me</motion.div>
 */
export function useHoverAnimation(options: UseHoverAnimationOptions = {}) {
  const {
    scale = 1.02,
    y = -4,
    duration = 0.2,
  } = options;
  
  const reducedMotion = prefersReducedMotion();
  
  if (reducedMotion) {
    return {};
  }
  
  return {
    whileHover: {
      scale,
      y,
      transition: { duration },
    },
    whileTap: {
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  };
}

// ============================================
// USE LOADING ANIMATION
// ============================================

/**
 * Hook pour créer des animations de loading
 * Retourne l'état de loading et les variants appropriés
 */
export function useLoadingAnimation() {
  const [isLoading, setIsLoading] = useState(false);
  const controls = useAnimationControls();
  
  useEffect(() => {
    if (isLoading) {
      controls.start({
        rotate: 360,
        transition: {
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        },
      });
    } else {
      controls.stop();
    }
  }, [isLoading, controls]);
  
  return {
    isLoading,
    setIsLoading,
    loadingControls: controls,
    spinnerVariants: {
      animate: {
        rotate: 360,
        transition: {
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        },
      },
    },
  };
}

// ============================================
// USE SEQUENCE ANIMATION
// ============================================

/**
 * Hook pour créer des séquences d'animations
 * Utile pour orchestrer plusieurs animations
 */
export function useSequenceAnimation() {
  const controls = useAnimationControls();
  const reducedMotion = prefersReducedMotion();
  
  const playSequence = async (sequence: Array<any>) => {
    if (reducedMotion) return;
    
    for (const animation of sequence) {
      await controls.start(animation);
    }
  };
  
  return {
    controls,
    playSequence,
  };
}

// ============================================
// USE GESTURE ANIMATION
// ============================================

interface UseGestureAnimationOptions {
  onDragEnd?: (info: any) => void;
  snapBack?: boolean;
}

/**
 * Hook pour gérer les animations de gestures (drag, etc.)
 */
export function useGestureAnimation(options: UseGestureAnimationOptions = {}) {
  const {
    onDragEnd,
    snapBack = true,
  } = options;
  
  const reducedMotion = prefersReducedMotion();
  
  const [isDragging, setIsDragging] = useState(false);
  
  if (reducedMotion) {
    return {
      isDragging: false,
      dragProps: {},
    };
  }
  
  return {
    isDragging,
    dragProps: {
      drag: true,
      dragSnapToOrigin: snapBack,
      dragElastic: 0.2,
      onDragStart: () => setIsDragging(true),
      onDragEnd: (event: any, info: any) => {
        setIsDragging(false);
        onDragEnd?.(info);
      },
      whileDrag: {
        scale: 1.05,
        cursor: 'grabbing',
      },
    },
  };
}

// ============================================
// USE MOUNT ANIMATION
// ============================================

/**
 * Hook pour animer l'apparition d'un composant au mount
 * Alternative simplifiée à initial/animate
 */
export function useMountAnimation(animationType: 'fade' | 'scale' | 'slide' = 'fade') {
  const controls = useAnimationControls();
  const reducedMotion = prefersReducedMotion();
  
  useEffect(() => {
    if (reducedMotion) return;
    
    const animations = {
      fade: {
        opacity: [0, 1],
        transition: { duration: 0.3 },
      },
      scale: {
        scale: [0.9, 1],
        opacity: [0, 1],
        transition: { duration: 0.3 },
      },
      slide: {
        y: [20, 0],
        opacity: [0, 1],
        transition: { duration: 0.3 },
      },
    };
    
    controls.start(animations[animationType]);
  }, [animationType, controls, reducedMotion]);
  
  return controls;
}

// ============================================
// USE PROGRESS ANIMATION
// ============================================

/**
 * Hook pour animer des barres de progression
 */
export function useProgressAnimation(targetProgress: number, duration: number = 0.5) {
  const controls = useAnimationControls();
  const [currentProgress, setCurrentProgress] = useState(0);
  
  useEffect(() => {
    if (prefersReducedMotion()) {
      setCurrentProgress(targetProgress);
      return;
    }
    
    controls.start({
      scaleX: targetProgress / 100,
      transition: {
        duration,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    });
    
    setCurrentProgress(targetProgress);
  }, [targetProgress, duration, controls]);
  
  return {
    controls,
    currentProgress,
    progressVariants: {
      initial: { scaleX: 0, originX: 0 },
      animate: {
        scaleX: targetProgress / 100,
        transition: { duration },
      },
    },
  };
}

// ============================================
// USE NOTIFICATION ANIMATION
// ============================================

type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Hook pour animer des notifications
 */
export function useNotificationAnimation(type: NotificationType = 'info') {
  const controls = useAnimationControls();
  
  const show = async () => {
    if (prefersReducedMotion()) return;
    
    await controls.start({
      y: [100, 0],
      opacity: [0, 1],
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
      },
    });
  };
  
  const hide = async () => {
    if (prefersReducedMotion()) return;
    
    await controls.start({
      y: [0, 100],
      opacity: [1, 0],
      transition: {
        duration: 0.3,
      },
    });
  };
  
  const shake = async () => {
    if (prefersReducedMotion()) return;
    
    await controls.start({
      x: [0, -8, 8, -8, 8, 0],
      transition: {
        duration: 0.5,
      },
    });
  };
  
  const pulse = async () => {
    if (prefersReducedMotion()) return;
    
    await controls.start({
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.3,
      },
    });
  };
  
  return {
    controls,
    show,
    hide,
    shake,
    pulse,
    notificationVariants: {
      initial: { y: 100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 100, opacity: 0 },
    },
  };
}

// ============================================
// USE COUNTER ANIMATION
// ============================================

/**
 * Hook pour animer les compteurs de nombres
 */
export function useCounterAnimation(targetValue: number, duration: number = 1) {
  const [count, setCount] = useState(0);
  const controls = useAnimationControls();
  
  useEffect(() => {
    if (prefersReducedMotion()) {
      setCount(targetValue);
      return;
    }
    
    const startTime = Date.now();
    const startValue = count;
    const difference = targetValue - startValue;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const current = Math.floor(startValue + difference * eased);
      setCount(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
      }
    };
    
    requestAnimationFrame(animate);
  }, [targetValue, duration]);
  
  return {
    count,
    controls,
  };
}
