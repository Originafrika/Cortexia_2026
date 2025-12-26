/**
 * PREMIUM CONTEXT MENU - Coconut Design System
 * 
 * Features:
 * - Right-click trigger
 * - Keyboard shortcuts display
 * - Icon support
 * - Dividers
 * - Danger items
 * - Nested menus (submenu support)
 * - Glassmorphism design
 * - Smart positioning
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  submenu?: ContextMenuItem[];
}

export type ContextMenuDivider = { type: 'divider' };

export type ContextMenuItemOrDivider = ContextMenuItem | ContextMenuDivider;

export interface ContextMenuProps {
  items: ContextMenuItemOrDivider[];
  children: React.ReactNode;
  className?: string;
}

// ============================================
// COMPONENT
// ============================================

export function ContextMenu({ items, children, className = '' }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle right-click
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const x = e.clientX;
    const y = e.clientY;

    setPosition({ x, y });
    setIsOpen(true);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Adjust position to stay in viewport
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { x, y } = position;

      // Adjust horizontal position
      if (x + rect.width > viewportWidth) {
        x = viewportWidth - rect.width - 10;
      }

      // Adjust vertical position
      if (y + rect.height > viewportHeight) {
        y = viewportHeight - rect.height - 10;
      }

      if (x !== position.x || y !== position.y) {
        setPosition({ x, y });
      }
    }
  }, [isOpen, position]);

  return (
    <div ref={containerRef} onContextMenu={handleContextMenu} className={className}>
      {children}

      {/* Context Menu */}
      <AnimatePresence>
        {isOpen && (
          <ContextMenuContent
            ref={menuRef}
            items={items}
            position={position}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// CONTEXT MENU CONTENT
// ============================================

interface ContextMenuContentProps {
  items: ContextMenuItemOrDivider[];
  position: { x: number; y: number };
  onClose: () => void;
  level?: number;
}

const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  ({ items, position, onClose, level = 0 }, ref) => {
    const [hoveredSubmenu, setHoveredSubmenu] = useState<number | null>(null);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 9999 + level,
        }}
        className="min-w-[220px]"
      >
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
          {items.map((item, index) => {
            // Divider
            if ('type' in item && item.type === 'divider') {
              return (
                <div
                  key={`divider-${index}`}
                  className="my-1 border-t border-gray-700/50"
                />
              );
            }

            // Regular Item
            const menuItem = item as ContextMenuItem;
            const hasSubmenu = menuItem.submenu && menuItem.submenu.length > 0;

            return (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => hasSubmenu && setHoveredSubmenu(index)}
                onMouseLeave={() => hasSubmenu && setHoveredSubmenu(null)}
              >
                <button
                  onClick={() => {
                    if (!menuItem.disabled && !hasSubmenu) {
                      menuItem.onClick?.();
                      onClose();
                    }
                  }}
                  disabled={menuItem.disabled}
                  className={`
                    w-full flex items-center justify-between gap-3 px-4 py-2.5
                    text-sm font-medium text-left
                    transition-colors duration-150
                    ${menuItem.disabled
                      ? 'text-gray-600 cursor-not-allowed'
                      : menuItem.danger
                      ? 'text-red-400 hover:bg-red-900/30'
                      : 'text-gray-200 hover:bg-gray-800'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {menuItem.icon && (
                      <span className="w-5 h-5 flex-shrink-0">
                        {menuItem.icon}
                      </span>
                    )}
                    <span className="flex-1">{menuItem.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {menuItem.shortcut && (
                      <span className="text-xs text-gray-500 font-mono">
                        {menuItem.shortcut}
                      </span>
                    )}
                    {hasSubmenu && (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </button>

                {/* Submenu */}
                {hasSubmenu && hoveredSubmenu === index && (
                  <ContextMenuContent
                    items={menuItem.submenu!}
                    position={{
                      x: position.x + 220,
                      y: position.y + index * 40,
                    }}
                    onClose={onClose}
                    level={level + 1}
                  />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }
);

ContextMenuContent.displayName = 'ContextMenuContent';

// Fix React import
import React from 'react';
