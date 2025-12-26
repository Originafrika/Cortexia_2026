/**
 * COCONUT V14 - PHASE 4 JOUR 3
 * AnimatedTransition Component
 * 
 * Composant pour gérer les transitions de page et de contenu
 * BDS: Musique (Rythme Visuel & Sonore)
 */

import React from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { 
  fadeVariants,
  slideVariants,
  scaleUpVariants,
  TIMING,
  EASING,
  getAccessibleVariants,
} from '../../lib/animations/transitions';

// ============================================
// TYPES
// ============================================

type TransitionType = 
  | 'fade' 
  | 'slideLeft' 
  | 'slideRight' 
  | 'slideUp' 
  | 'slideDown'
  | 'scale'
  | 'scaleUp';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  customVariants?: Variants;
  duration?: number;
  mode?: 'sync' | 'wait' | 'popLayout';
  initial?: boolean;
  className?: string;
  id?: string | number; // Key pour AnimatePresence
}

// ============================================
// TRANSITION VARIANTS
// ============================================

const getTransitionVariants = (type: TransitionType): Variants => {
  switch (type) {
    case 'fade':
      return fadeVariants;
    
    case 'slideLeft':
      return slideVariants.slideInLeft;
    
    case 'slideRight':
      return slideVariants.slideInRight;
    
    case 'slideUp':
      return slideVariants.slideInUp;
    
    case 'slideDown':
      return slideVariants.slideInDown;
    
    case 'scale':
      return {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
      };
    
    case 'scaleUp':
      return scaleUpVariants;
    
    default:
      return fadeVariants;
  }
};

// ============================================
// COMPONENT PRINCIPAL
// ============================================

/**
 * AnimatedTransition - Gère les transitions fluides entre contenus
 * 
 * @example
 * // Transition de page simple
 * <AnimatedTransition type="fade" id={currentPage}>
 *   <PageContent />
 * </AnimatedTransition>
 * 
 * @example
 * // Transition avec slide
 * <AnimatedTransition type="slideRight" id={step}>
 *   <StepContent />
 * </AnimatedTransition>
 * 
 * @example
 * // Custom variants
 * <AnimatedTransition customVariants={myVariants} id={id}>
 *   <Content />
 * </AnimatedTransition>
 */
export function AnimatedTransition({
  children,
  type = 'fade',
  customVariants,
  duration,
  mode = 'wait',
  initial = true,
  className,
  id,
}: AnimatedTransitionProps) {
  // Récupérer les variants appropriés
  const baseVariants = customVariants || getTransitionVariants(type);
  const accessibleVariants = getAccessibleVariants(baseVariants);
  
  // Modifier duration si fourni
  const variants = duration ? {
    ...accessibleVariants,
    animate: {
      ...accessibleVariants.animate,
      transition: {
        ...(accessibleVariants.animate as any)?.transition,
        duration,
      },
    },
    exit: {
      ...accessibleVariants.exit,
      transition: {
        ...(accessibleVariants.exit as any)?.transition,
        duration,
      },
    },
  } : accessibleVariants;
  
  return (
    <AnimatePresence mode={mode} initial={initial}>
      <motion.div
        key={id}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// PAGE TRANSITION
// ============================================

interface PageTransitionProps {
  children: React.ReactNode;
  pageKey: string | number;
  direction?: 'forward' | 'back';
  className?: string;
}

/**
 * PageTransition - Transition optimisée pour navigation entre pages
 * Détecte automatiquement la direction (forward/back)
 */
export function PageTransition({
  children,
  pageKey,
  direction = 'forward',
  className,
}: PageTransitionProps) {
  const pageVariants: Variants = {
    initial: {
      opacity: 0,
      x: direction === 'forward' ? 50 : -50,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: TIMING.normal,
        ease: EASING.smooth,
      },
    },
    exit: {
      opacity: 0,
      x: direction === 'forward' ? -50 : 50,
      transition: {
        duration: TIMING.normal,
        ease: EASING.smooth,
      },
    },
  };
  
  const accessibleVariants = getAccessibleVariants(pageVariants);
  
  return (
    <AnimatePresence mode="wait" initial={true}>
      <motion.div
        key={pageKey}
        variants={accessibleVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// TAB TRANSITION
// ============================================

interface TabTransitionProps {
  children: React.ReactNode;
  activeTab: string | number;
  direction?: number; // 1 = right, -1 = left
  className?: string;
}

/**
 * TabTransition - Transition optimisée pour système de tabs
 */
export function TabTransition({
  children,
  activeTab,
  direction = 1,
  className,
}: TabTransitionProps) {
  const tabVariants: Variants = {
    enter: {
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: TIMING.normal,
        ease: EASING.smooth,
      },
    },
    exit: {
      x: direction > 0 ? -20 : 20,
      opacity: 0,
      transition: {
        duration: TIMING.normal,
        ease: EASING.smooth,
      },
    },
  };
  
  const accessibleVariants = getAccessibleVariants(tabVariants);
  
  return (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <motion.div
        key={activeTab}
        custom={direction}
        variants={accessibleVariants}
        initial="enter"
        animate="center"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// MODAL TRANSITION
// ============================================

interface ModalTransitionProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
  onClose?: () => void;
}

/**
 * ModalTransition - Transition pour modals avec backdrop
 */
export function ModalTransition({
  children,
  isOpen,
  className,
  onClose,
}: ModalTransitionProps) {
  const backdropVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };
  
  const modalVariants: Variants = {
    initial: {
      scale: 0.95,
      opacity: 0,
      y: 20,
    },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        duration: TIMING.normal,
        ease: EASING.smooth,
      },
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      y: 20,
      transition: {
        duration: TIMING.fast,
        ease: EASING.default,
      },
    },
  };
  
  const accessibleBackdrop = getAccessibleVariants(backdropVariants);
  const accessibleModal = getAccessibleVariants(modalVariants);
  
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={accessibleBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            variants={accessibleModal}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 ${className}`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================
// DRAWER TRANSITION
// ============================================

interface DrawerTransitionProps {
  children: React.ReactNode;
  isOpen: boolean;
  side?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
  onClose?: () => void;
}

/**
 * DrawerTransition - Transition pour drawers/side panels
 */
export function DrawerTransition({
  children,
  isOpen,
  side = 'right',
  className,
  onClose,
}: DrawerTransitionProps) {
  const backdropVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };
  
  const getDrawerVariants = (): Variants => {
    const positions = {
      left: { x: '-100%' },
      right: { x: '100%' },
      top: { y: '-100%' },
      bottom: { y: '100%' },
    };
    
    return {
      initial: positions[side],
      animate: {
        x: 0,
        y: 0,
        transition: {
          duration: TIMING.normal,
          ease: EASING.smooth,
        },
      },
      exit: {
        ...positions[side],
        transition: {
          duration: TIMING.normal,
          ease: EASING.smooth,
        },
      },
    };
  };
  
  const accessibleBackdrop = getAccessibleVariants(backdropVariants);
  const accessibleDrawer = getAccessibleVariants(getDrawerVariants());
  
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={accessibleBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Drawer Content */}
          <motion.div
            variants={accessibleDrawer}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`fixed z-50 ${className}`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================
// COLLAPSE TRANSITION
// ============================================

interface CollapseTransitionProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
}

/**
 * CollapseTransition - Transition pour accordéons et sections collapsibles
 */
export function CollapseTransition({
  children,
  isOpen,
  className,
}: CollapseTransitionProps) {
  const collapseVariants: Variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      overflow: 'hidden',
      transition: {
        duration: TIMING.normal,
        ease: EASING.default,
      },
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      overflow: 'visible',
      transition: {
        duration: TIMING.normal,
        ease: EASING.default,
      },
    },
  };
  
  const accessibleVariants = getAccessibleVariants(collapseVariants);
  
  return (
    <motion.div
      variants={accessibleVariants}
      initial={isOpen ? 'expanded' : 'collapsed'}
      animate={isOpen ? 'expanded' : 'collapsed'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// CROSS FADE TRANSITION
// ============================================

interface CrossFadeTransitionProps {
  children: React.ReactNode;
  contentKey: string | number;
  className?: string;
  duration?: number;
}

/**
 * CrossFadeTransition - Transition de type crossfade pour changements de contenu
 */
export function CrossFadeTransition({
  children,
  contentKey,
  className,
  duration = TIMING.normal,
}: CrossFadeTransitionProps) {
  const crossFadeVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration },
    },
    exit: {
      opacity: 0,
      transition: { duration },
    },
  };
  
  const accessibleVariants = getAccessibleVariants(crossFadeVariants);
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={contentKey}
        variants={accessibleVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// EXPORT
// ============================================

export default AnimatedTransition;
