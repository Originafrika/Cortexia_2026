/**
 * KEYBOARD SHORTCUTS HOOK
 * Phase 6 - Accessibilité Complète
 * 
 * Gère les raccourcis clavier globaux pour l'application.
 * 
 * Usage:
 * useKeyboardShortcuts({
 *   'Escape': () => closeModal(),
 *   'ctrl+k': () => openCommandPalette(),
 *   'ctrl+n': () => createNew(),
 * });
 */

import { useEffect } from 'react';

type ShortcutHandler = (event: KeyboardEvent) => void;
type ShortcutMap = Record<string, ShortcutHandler>;

interface KeyboardShortcutsOptions {
  shortcuts: ShortcutMap;
  enabled?: boolean;
  preventDefault?: boolean;
}

function normalizeKey(event: KeyboardEvent): string {
  const parts: string[] = [];
  
  if (event.ctrlKey || event.metaKey) parts.push('ctrl');
  if (event.shiftKey) parts.push('shift');
  if (event.altKey) parts.push('alt');
  
  const key = event.key.toLowerCase();
  if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
    parts.push(key);
  }
  
  return parts.join('+');
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
  preventDefault = true,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Except for Escape key - always allow it
        if (event.key !== 'Escape') return;
      }

      const normalizedKey = normalizeKey(event);
      const handler = shortcuts[normalizedKey];

      if (handler) {
        if (preventDefault) {
          event.preventDefault();
        }
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled, preventDefault]);
}

/**
 * Common keyboard shortcuts helper
 */
export const COMMON_SHORTCUTS = {
  ESCAPE: 'escape',
  ENTER: 'enter',
  SPACE: ' ',
  ARROW_UP: 'arrowup',
  ARROW_DOWN: 'arrowdown',
  ARROW_LEFT: 'arrowleft',
  ARROW_RIGHT: 'arrowright',
  TAB: 'tab',
  
  // With modifiers
  CTRL_K: 'ctrl+k',
  CTRL_N: 'ctrl+n',
  CTRL_S: 'ctrl+s',
  CTRL_ENTER: 'ctrl+enter',
  SHIFT_ENTER: 'shift+enter',
} as const;
