/**
 * PREMIUM DROPDOWN - Coconut Design System
 * 
 * Features:
 * - Click-to-open menu
 * - Icon support
 * - Keyboard navigation
 * - Glassmorphism design
 * - Smooth animations
 * - Dividers
 * - Danger items
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export type DropdownDivider = { type: 'divider' };

export type DropdownItemOrDivider = DropdownItem | DropdownDivider;

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItemOrDivider[];
  align?: 'left' | 'right';
  className?: string;
}

// ============================================
// COMPONENT
// ============================================

export function Dropdown({
  trigger,
  items,
  align = 'right',
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute top-full mt-2 min-w-[200px] z-50
              ${align === 'right' ? 'right-0' : 'left-0'}
            `}
          >
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-lg shadow-xl overflow-hidden">
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
                const menuItem = item as DropdownItem;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (!menuItem.disabled) {
                        menuItem.onClick();
                        setIsOpen(false);
                      }
                    }}
                    disabled={menuItem.disabled}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5
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
                    {menuItem.icon && (
                      <span className="w-5 h-5 flex-shrink-0">
                        {menuItem.icon}
                      </span>
                    )}
                    <span className="flex-1">{menuItem.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// DROPDOWN BUTTON (Convenience)
// ============================================

export interface DropdownButtonProps {
  label: string;
  icon?: React.ReactNode;
  items: DropdownItemOrDivider[];
  align?: 'left' | 'right';
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function DropdownButton({
  label,
  icon,
  items,
  align = 'right',
  variant = 'ghost',
}: DropdownButtonProps) {
  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600',
    ghost: 'bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white border-transparent hover:border-gray-700',
  };

  return (
    <Dropdown
      align={align}
      items={items}
      trigger={
        <button
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-lg border
            font-medium text-sm
            transition-all duration-200
            ${variantStyles[variant]}
          `}
        >
          {icon}
          <span>{label}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      }
    />
  );
}
