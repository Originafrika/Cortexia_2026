/**
 * CONTEXTUAL TOOLTIP - Smart help tooltips
 * 
 * Features:
 * - Contextual help tooltips
 * - Auto-positioning
 * - Keyboard shortcuts display
 * - Dismissible
 * - First-time hints
 */

import { useState, useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X, Zap, Info } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface ContextualTooltipProps {
  id: string; // Unique ID for tooltip (to track if dismissed)
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'auto';
  showOnce?: boolean; // Only show once per user
  delay?: number; // Delay before showing (ms)
  children: ReactNode;
  icon?: 'help' | 'info' | 'tip';
}

// ============================================
// LOCAL STORAGE KEY
// ============================================

const DISMISSED_TOOLTIPS_KEY = 'cortexia_dismissed_tooltips';

function getDismissedTooltips(): Set<string> {
  if (typeof localStorage === 'undefined') return new Set();
  
  try {
    const stored = localStorage.getItem(DISMISSED_TOOLTIPS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function markTooltipDismissed(id: string): void {
  if (typeof localStorage === 'undefined') return;
  
  try {
    const dismissed = getDismissedTooltips();
    dismissed.add(id);
    localStorage.setItem(DISMISSED_TOOLTIPS_KEY, JSON.stringify([...dismissed]));
  } catch (e) {
    console.warn('Failed to save dismissed tooltip:', e);
  }
}

// ============================================
// COMPONENT
// ============================================

export function ContextualTooltip({
  id,
  content,
  placement = 'top',
  trigger = 'hover',
  showOnce = false,
  delay = 0,
  children,
  icon = 'help',
}: ContextualTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [wasDismissed, setWasDismissed] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Check if tooltip was dismissed
  useEffect(() => {
    if (showOnce) {
      const dismissed = getDismissedTooltips();
      setWasDismissed(dismissed.has(id));
    }
  }, [id, showOnce]);

  // Calculate position
  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const pos = calculatePosition(triggerRect, tooltipRect, placement);
    setPosition(pos);
  }, [isVisible, placement]);

  // Auto show (if trigger is auto)
  useEffect(() => {
    if (trigger === 'auto' && !wasDismissed) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [trigger, delay, wasDismissed]);

  // Handle hover
  const handleMouseEnter = () => {
    if (trigger === 'hover' && !wasDismissed) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsVisible(false);
    }
  };

  // Handle click
  const handleClick = () => {
    if (trigger === 'click' && !wasDismissed) {
      setIsVisible(!isVisible);
    }
  };

  // Handle dismiss
  const handleDismiss = () => {
    setIsVisible(false);
    if (showOnce) {
      markTooltipDismissed(id);
      setWasDismissed(true);
    }
  };

  // If dismissed and showOnce, don't render tooltip trigger
  if (wasDismissed && showOnce) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible &&
        createPortal(
          <AnimatePresence>
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[9999] pointer-events-auto"
              style={{
                top: position.top,
                left: position.left,
              }}
              onMouseEnter={() => trigger === 'hover' && setIsVisible(true)}
              onMouseLeave={() => trigger === 'hover' && setIsVisible(false)}
            >
              <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-xs overflow-hidden">
                {/* Header with icon */}
                <div className="flex items-start gap-3 p-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {icon === 'help' && <HelpCircle className="w-5 h-5 text-primary-400" />}
                    {icon === 'info' && <Info className="w-5 h-5 text-blue-400" />}
                    {icon === 'tip' && <Zap className="w-5 h-5 text-yellow-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-300">{content}</div>
                  </div>
                  {(trigger === 'click' || showOnce) && (
                    <button
                      onClick={handleDismiss}
                      className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Dismiss button for auto tooltips */}
                {trigger === 'auto' && showOnce && (
                  <div className="px-3 pb-3 pt-0">
                    <button
                      onClick={handleDismiss}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      Got it, don&apos;t show again
                    </button>
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div
                className={`
                  absolute w-2 h-2 bg-gray-900 border border-gray-700 rotate-45
                  ${getArrowClass(placement)}
                `}
              />
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

// ============================================
// PRESET TOOLTIPS
// ============================================

export function HelpTooltip({
  content,
  placement = 'top',
}: {
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}) {
  return (
    <ContextualTooltip
      id={`help-${Math.random()}`}
      content={content}
      placement={placement}
      trigger="hover"
      icon="help"
    >
      <button className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
        <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
      </button>
    </ContextualTooltip>
  );
}

export function FirstTimeHint({
  id,
  content,
  children,
}: {
  id: string;
  content: ReactNode;
  children: ReactNode;
}) {
  return (
    <ContextualTooltip
      id={id}
      content={content}
      placement="bottom"
      trigger="auto"
      showOnce={true}
      delay={1000}
      icon="tip"
    >
      {children}
    </ContextualTooltip>
  );
}

// ============================================
// KEYBOARD SHORTCUT TOOLTIP
// ============================================

export function KeyboardShortcutTooltip({
  shortcut,
  description,
  children,
}: {
  shortcut: string;
  description: string;
  children: ReactNode;
}) {
  const content = (
    <div>
      <p className="mb-2">{description}</p>
      <div className="flex items-center gap-1">
        {shortcut.split('+').map((key, i) => (
          <span key={i}>
            <kbd className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded">
              {key}
            </kbd>
            {i < shortcut.split('+').length - 1 && <span className="mx-1">+</span>}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <ContextualTooltip
      id={`shortcut-${shortcut}`}
      content={content}
      placement="bottom"
      trigger="hover"
      icon="info"
    >
      {children}
    </ContextualTooltip>
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function calculatePosition(
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  placement: 'top' | 'bottom' | 'left' | 'right'
): { top: number; left: number } {
  const offset = 12;
  const arrowSize = 8;

  switch (placement) {
    case 'top':
      return {
        top: triggerRect.top - tooltipRect.height - offset - arrowSize,
        left: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
      };
    case 'bottom':
      return {
        top: triggerRect.bottom + offset + arrowSize,
        left: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
      };
    case 'left':
      return {
        top: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
        left: triggerRect.left - tooltipRect.width - offset - arrowSize,
      };
    case 'right':
      return {
        top: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
        left: triggerRect.right + offset + arrowSize,
      };
  }
}

function getArrowClass(placement: 'top' | 'bottom' | 'left' | 'right'): string {
  switch (placement) {
    case 'top':
      return 'bottom-[-5px] left-1/2 -translate-x-1/2 border-b-0 border-r-0';
    case 'bottom':
      return 'top-[-5px] left-1/2 -translate-x-1/2 border-t-0 border-l-0';
    case 'left':
      return 'right-[-5px] top-1/2 -translate-y-1/2 border-l-0 border-b-0';
    case 'right':
      return 'left-[-5px] top-1/2 -translate-y-1/2 border-r-0 border-t-0';
  }
}

// ============================================
// RESET HELPER
// ============================================

/**
 * Reset all dismissed tooltips (for testing/debugging)
 */
export function resetAllTooltips(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(DISMISSED_TOOLTIPS_KEY);
  }
}
