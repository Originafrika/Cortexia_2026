/**
 * FOCUS TRAP HOOK
 * Phase 6 - Accessibilité Complète
 * 
 * Piège le focus à l'intérieur d'un élément (modal, dialog, etc.)
 * pour empêcher la navigation Tab de sortir du contexte.
 * 
 * Usage:
 * const trapRef = useFocusTrap(isOpen);
 * <div ref={trapRef}>...</div>
 */

import { useEffect, useRef } from 'react';

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(isActive: boolean) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (!isActive || !elementRef.current) return;

    const element = elementRef.current;
    const focusableElements = element.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus the first element when trap activates
    if (firstFocusable) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        firstFocusable.focus();
      }, 100);

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        // Shift + Tab: going backwards
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        }
        // Tab: going forwards
        else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      };

      element.addEventListener('keydown', handleTabKey);

      return () => {
        clearTimeout(timer);
        element.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [isActive]);

  return elementRef;
}
