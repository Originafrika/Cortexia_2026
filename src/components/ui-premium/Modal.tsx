/**
 * PREMIUM MODAL - Coconut Design System
 * 
 * Features:
 * - Backdrop with blur
 * - Center positioning
 * - Header/Footer slots
 * - Close button
 * - Outside click to close (optional)
 * - Escape to close
 * - Size variants
 * - Smooth animations
 * - Glassmorphism
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

// ============================================
// STYLES
// ============================================

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl w-full mx-4',
};

// ============================================
// COMPONENT
// ============================================

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOutsideClick = true,
  showCloseButton = true,
  className = '',
}: ModalProps) {
  // Lock body scroll when modal is open
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

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-modal p-4" style={{ zIndex: 9999 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className={`
                w-full ${sizeStyles[size]}
                bg-gray-900/95 backdrop-blur-xl
                border border-gray-700
                rounded-2xl shadow-2xl
                overflow-hidden
                ${className}
              `}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-700/50">
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
                        p-2 rounded-lg
                        text-gray-400 hover:text-white
                        hover:bg-gray-800
                        transition-colors duration-150
                      "
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="px-6 py-4 border-t border-gray-700/50 bg-gray-800/30">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================
// MODAL HEADER (for custom headers)
// ============================================

export function ModalHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}

// ============================================
// MODAL FOOTER (for custom footers)
// ============================================

export function ModalFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}
