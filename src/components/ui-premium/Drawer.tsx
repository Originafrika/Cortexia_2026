/**
 * DRAWER - Coconut Design System
 * 
 * Features:
 * - Slide-in panel from any side
 * - Glassmorphism design
 * - Header/Footer slots
 * - Close button
 * - Outside click to close (optional)
 * - Escape to close
 * - Size variants
 * - Smooth animations
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  side?: DrawerSide;
  size?: DrawerSize;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

// ============================================
// STYLES
// ============================================

const sizeStyles: Record<DrawerSide, Record<DrawerSize, string>> = {
  left: {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-[32rem]',
    xl: 'w-[48rem]',
    full: 'w-full',
  },
  right: {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-[32rem]',
    xl: 'w-[48rem]',
    full: 'w-full',
  },
  top: {
    sm: 'h-80',
    md: 'h-96',
    lg: 'h-[32rem]',
    xl: 'h-[48rem]',
    full: 'h-full',
  },
  bottom: {
    sm: 'h-80',
    md: 'h-96',
    lg: 'h-[32rem]',
    xl: 'h-[48rem]',
    full: 'h-full',
  },
};

const sideStyles: Record<DrawerSide, string> = {
  left: 'left-0 top-0 h-full',
  right: 'right-0 top-0 h-full',
  top: 'top-0 left-0 w-full',
  bottom: 'bottom-0 left-0 w-full',
};

const animationVariants: Record<DrawerSide, { initial: any; animate: any; exit: any }> = {
  left: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
  },
  right: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
  },
  top: {
    initial: { y: '-100%' },
    animate: { y: 0 },
    exit: { y: '-100%' },
  },
  bottom: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
  },
};

// ============================================
// COMPONENT
// ============================================

export function Drawer({
  isOpen,
  onClose,
  side = 'right',
  size = 'md',
  title,
  description,
  children,
  footer,
  closeOnOutsideClick = true,
  showCloseButton = true,
  className = '',
}: DrawerProps) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const isHorizontal = side === 'left' || side === 'right';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnOutsideClick ? onClose : undefined}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal-backdrop"
            style={{ zIndex: 9998 }}
          />

          {/* Drawer */}
          <motion.div
            initial={animationVariants[side].initial}
            animate={animationVariants[side].animate}
            exit={animationVariants[side].exit}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`
              fixed ${sideStyles[side]} ${sizeStyles[side][size]}
              bg-gray-900/95 backdrop-blur-xl
              border-gray-700
              ${isHorizontal ? 'border-r' : 'border-b'}
              shadow-2xl
              z-modal
              flex flex-col
              ${className}
            `}
            style={{ zIndex: 9999 }}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between px-6 py-4 border-b border-gray-700/50 flex-shrink-0">
                <div className="flex-1">
                  {title && (
                    <h2 className="text-xl font-semibold text-white">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-gray-400">
                      {description}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="
                      ml-4 p-2 rounded-lg
                      text-gray-400 hover:text-white
                      hover:bg-gray-800
                      transition-colors duration-150
                    "
                    aria-label="Close drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-gray-700/50 bg-gray-800/30 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
