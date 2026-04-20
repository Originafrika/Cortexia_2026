/**
 * TOOLTIP - Advanced tooltip system
 * ✅ BDS Compliant: Rhétorique (Communication contextuelle)
 * 
 * Features:
 * - Smart positioning (auto-adjust to viewport)
 * - Multiple triggers (hover, click, focus)
 * - Keyboard accessible (Escape to close)
 * - Delay customization
 * - Arrow indicator
 * - Rich content support
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
type TooltipTrigger = 'hover' | 'click' | 'focus';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: TooltipPosition;
  trigger?: TooltipTrigger;
  delayShow?: number;
  delayHide?: number;
  disabled?: boolean;
  maxWidth?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  trigger = 'hover',
  delayShow = 200,
  delayHide = 0,
  disabled = false,
  maxWidth = 320,
  className = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const [actualPosition, setActualPosition] = useState<TooltipPosition>(position);
  
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate tooltip position
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 8;
    const arrowSize = 6;

    let top = 0;
    let left = 0;
    let finalPosition = position;

    // Calculate initial position
    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - padding - arrowSize;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        
        // Check if tooltip fits above
        if (top < 0) {
          finalPosition = 'bottom';
          top = triggerRect.bottom + padding + arrowSize;
        }
        break;

      case 'bottom':
        top = triggerRect.bottom + padding + arrowSize;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        
        // Check if tooltip fits below
        if (top + tooltipRect.height > window.innerHeight) {
          finalPosition = 'top';
          top = triggerRect.top - tooltipRect.height - padding - arrowSize;
        }
        break;

      case 'left':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - padding - arrowSize;
        
        // Check if tooltip fits on left
        if (left < 0) {
          finalPosition = 'right';
          left = triggerRect.right + padding + arrowSize;
        }
        break;

      case 'right':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + padding + arrowSize;
        
        // Check if tooltip fits on right
        if (left + tooltipRect.width > window.innerWidth) {
          finalPosition = 'left';
          left = triggerRect.left - tooltipRect.width - padding - arrowSize;
        }
        break;
    }

    // Adjust horizontal position to stay in viewport
    if (left < padding) {
      left = padding;
    } else if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }

    // Adjust vertical position to stay in viewport
    if (top < padding) {
      top = padding;
    } else if (top + tooltipRect.height > window.innerHeight - padding) {
      top = window.innerHeight - tooltipRect.height - padding;
    }

    setTooltipPosition({ top, left });
    setActualPosition(finalPosition);
  };

  // Show/hide handlers
  const handleShow = () => {
    if (disabled) return;
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayShow);
  };

  const handleHide = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, delayHide);
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsVisible(prev => !prev);
  };

  // Update position when visible
  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      
      // Recalculate on scroll/resize
      window.addEventListener('scroll', calculatePosition, true);
      window.addEventListener('resize', calculatePosition);
      
      return () => {
        window.removeEventListener('scroll', calculatePosition, true);
        window.removeEventListener('resize', calculatePosition);
      };
    }
  }, [isVisible]);

  // Escape key to close
  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isVisible]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Clone children with event handlers
  const triggerElement = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: trigger === 'hover' ? handleShow : children.props.onMouseEnter,
    onMouseLeave: trigger === 'hover' ? handleHide : children.props.onMouseLeave,
    onClick: trigger === 'click' ? handleToggle : children.props.onClick,
    onFocus: trigger === 'focus' ? handleShow : children.props.onFocus,
    onBlur: trigger === 'focus' ? handleHide : children.props.onBlur,
    'aria-describedby': isVisible ? 'tooltip' : undefined
  });

  const getArrowStyles = (): React.CSSProperties => {
    const arrowSize = 6;
    
    switch (actualPosition) {
      case 'top':
        return {
          bottom: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderTop: `${arrowSize}px solid rgba(30, 41, 59, 0.95)`
        };
      case 'bottom':
        return {
          top: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid rgba(30, 41, 59, 0.95)`
        };
      case 'left':
        return {
          right: -arrowSize,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderLeft: `${arrowSize}px solid rgba(30, 41, 59, 0.95)`
        };
      case 'right':
        return {
          left: -arrowSize,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid rgba(30, 41, 59, 0.95)`
        };
    }
  };

  return (
    <>
      {triggerElement}
      
      {isVisible && createPortal(
        <AnimatePresence>
          <motion.div
            ref={tooltipRef}
            id="tooltip"
            role="tooltip"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`fixed z-[9999] ${className}`}
            style={{
              top: tooltipPosition?.top ?? 0,
              left: tooltipPosition?.left ?? 0,
              maxWidth
            }}
            onMouseEnter={trigger === 'hover' ? handleShow : undefined}
            onMouseLeave={trigger === 'hover' ? handleHide : undefined}
          >
            <div className="relative bg-slate-800/95 backdrop-blur-xl text-white text-sm px-3 py-2 rounded-lg shadow-2xl border border-slate-700">
              {content}
              
              {/* Arrow */}
              <div
                className="absolute w-0 h-0"
                style={getArrowStyles()}
              />
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

/**
 * Simplified info tooltip
 */
interface InfoTooltipProps {
  text: string;
  className?: string;
}

export function InfoTooltip({ text, className = '' }: InfoTooltipProps) {
  return (
    <Tooltip content={text} position="top">
      <button
        type="button"
        className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs transition-colors ${className}`}
        aria-label="Information"
      >
        i
      </button>
    </Tooltip>
  );
}

/**
 * Rich tooltip with title
 */
interface RichTooltipProps extends Omit<TooltipProps, 'content'> {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function RichTooltip({ title, description, icon, ...props }: RichTooltipProps) {
  return (
    <Tooltip
      {...props}
      content={
        <div className="space-y-2 max-w-xs">
          <div className="flex items-center gap-2">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div className="font-semibold">{title}</div>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed">
            {description}
          </div>
        </div>
      }
    >
      {props.children}
    </Tooltip>
  );
}
