/**
 * COCONUT V14 - PHASE 4 JOUR 5
 * Premium Animated Select Component
 * 
 * ✅ OPTIMIZED: Full Responsive + BDS Compliance + Smart Positioning
 * Features:
 * - Smooth animations
 * - Search/filter options
 * - Multi-select support
 * - Custom rendering
 * - Keyboard navigation
 * - ARIA compliant
 * - Mobile-first responsive design
 * - Coconut color palette
 * - Smart dropdown positioning (auto top/bottom)
 * - Fixed positioning to prevent z-index issues
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown, ChevronUp, X, Search } from 'lucide-react';
import { Z_INDEX } from '../../lib/constants/z-index';

// ============================================
// ANIMATION VARIANTS
// ============================================

const dropdownVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: -10
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.15
    }
  }
};

const listItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (custom: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: custom * 0.02,
      duration: 0.2
    }
  })
};

// ============================================
// TYPES
// ============================================

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface PremiumSelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  label?: string;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  error?: string;
  fullWidth?: boolean;
  className?: string;
}

// ============================================
// COMPONENT
// ============================================

export function PremiumSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  multiple = false,
  searchable = false,
  disabled = false,
  error,
  fullWidth = false,
  className = ''
}: PremiumSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // HELPERS
  // ============================================

  const selectedValues = multiple 
    ? (Array.isArray(value) ? value : [])
    : (value ? [value] : []);

  const selectedOptions = options.filter(opt => selectedValues.includes(opt.value));

  const filteredOptions = searchable && searchQuery
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // ============================================
  // HANDLERS
  // ============================================

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValue = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      onChange(selectedValues.filter(v => v !== optionValue));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex].value);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => Math.min(filteredOptions.length - 1, prev + 1));
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(0, prev - 1));
        break;
    }
  };

  // ============================================
  // EFFECTS
  // ============================================

  // Calculate dropdown position (fixed positioning)
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        const rect = buttonRef.current!.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 256; // max-h-64 = 16rem = 256px
        
        // Determine if dropdown should open upward or downward
        const shouldOpenUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
        setDropdownPosition(shouldOpenUpward ? 'top' : 'bottom');
        
        // Calculate position
        const style: React.CSSProperties = {
          position: 'fixed',
          width: rect.width,
          left: rect.left,
          zIndex: Z_INDEX.dropdown,
        };
        
        if (shouldOpenUpward) {
          // Open upward
          style.bottom = window.innerHeight - rect.top + 8; // 8px gap
          style.maxHeight = Math.min(spaceAbove - 16, dropdownHeight);
        } else {
          // Open downward
          style.top = rect.bottom + 8; // 8px gap
          style.maxHeight = Math.min(spaceBelow - 16, dropdownHeight);
        }
        
        setDropdownStyle(style);
      };
      
      updatePosition();
      
      // Update on scroll/resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Reset focused index when search changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [searchQuery]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div 
      ref={containerRef}
      className={`relative ${fullWidth ? 'w-full' : 'w-full sm:w-64'} ${className}`}
    >
      {/* Label */}
      {label && (
        <label className="block mb-2 text-sm sm:text-base font-medium text-[var(--coconut-shell)]">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl
          bg-white/70 backdrop-blur-md border
          ${error ? 'border-[var(--coconut-shell)]/50' : 'border-[var(--coconut-husk)]/20'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/90 hover:border-[var(--coconut-husk)]/30 cursor-pointer'}
          transition-all duration-200
          flex items-center justify-between gap-2
          focus:outline-none focus:ring-2 focus:ring-[var(--coconut-palm)]/50
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex-1 flex items-center gap-1.5 sm:gap-2 flex-wrap min-h-[24px]">
          {selectedOptions.length > 0 ? (
            multiple ? (
              selectedOptions.map(opt => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-lg
                             bg-[var(--coconut-palm)]/10 border border-[var(--coconut-palm)]/30 text-[var(--coconut-shell)] text-xs sm:text-sm font-medium"
                >
                  {opt.icon && <span className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0">{opt.icon}</span>}
                  <span className="truncate max-w-[120px]">{opt.label}</span>
                  <button
                    onClick={(e) => handleRemove(opt.value, e)}
                    className="hover:text-[var(--coconut-shell)] text-[var(--coconut-husk)] transition-colors flex-shrink-0"
                    aria-label={`Remove ${opt.label}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="flex items-center gap-2 text-[var(--coconut-shell)] font-medium text-sm sm:text-base truncate">
                {selectedOptions[0].icon && (
                  <span className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0">{selectedOptions[0].icon}</span>
                )}
                <span className="truncate">{selectedOptions[0].label}</span>
              </span>
            )
          ) : (
            <span className="text-[var(--coconut-husk)] text-sm sm:text-base">{placeholder}</span>
          )}
        </div>
        
        <ChevronDown
          className={`w-4 h-4 sm:w-5 sm:h-5 text-[var(--coconut-husk)] transition-transform duration-200 flex-shrink-0
                     ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1.5 text-xs sm:text-sm text-[var(--coconut-shell)]">{error}</p>
      )}

      {/* Dropdown - Fixed Positioning with Smart Top/Bottom Detection */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={dropdownStyle}
            className="rounded-xl bg-white/95 backdrop-blur-xl border border-[var(--coconut-husk)]/20 shadow-2xl overflow-hidden"
          >
            {/* Search */}
            {searchable && (
              <div className="p-2 sm:p-3 border-b border-[var(--coconut-husk)]/10">
                <div className="relative">
                  <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--coconut-husk)]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 rounded-lg
                               bg-white/70 border border-[var(--coconut-husk)]/20
                               text-[var(--coconut-shell)] placeholder-[var(--coconut-husk)] text-sm sm:text-base
                               focus:outline-none focus:ring-2 focus:ring-[var(--coconut-palm)]/50 focus:border-[var(--coconut-palm)]/30"
                  />
                </div>
              </div>
            )}

            {/* Options List - RESPONSIVE with Auto Scroll */}
            <div
              className="overflow-y-auto overflow-x-hidden"
              style={{ maxHeight: 'inherit' }}
              role="listbox"
              aria-multiselectable={multiple}
            >
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-[var(--coconut-husk)] text-sm sm:text-base">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = selectedValues.includes(option.value);
                  const isFocused = index === focusedIndex;
                  
                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      variants={listItemVariants}
                      custom={index}
                      onClick={() => !option.disabled && handleSelect(option.value)}
                      disabled={option.disabled}
                      className={`
                        w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3
                        transition-colors text-left
                        ${option.disabled 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-[var(--coconut-cream)] cursor-pointer active:bg-[var(--coconut-milk)]'
                        }
                        ${isFocused ? 'bg-[var(--coconut-milk)]' : ''}
                        ${isSelected ? 'bg-[var(--coconut-palm)]/10' : ''}
                      `}
                      role="option"
                      aria-selected={isSelected}
                    >
                      {/* Icon */}
                      {option.icon && (
                        <span className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--coconut-husk)] flex-shrink-0">
                          {option.icon}
                        </span>
                      )}
                      
                      {/* Label */}
                      <span className="flex-1 text-[var(--coconut-shell)] text-sm sm:text-base font-medium truncate">
                        {option.label}
                      </span>
                      
                      {/* Check Mark */}
                      {isSelected && (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--coconut-palm)] flex-shrink-0" />
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PremiumSelect;