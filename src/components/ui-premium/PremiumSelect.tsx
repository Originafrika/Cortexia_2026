/**
 * COCONUT V14 - PHASE 4 JOUR 5
 * Premium Animated Select Component
 * 
 * Features:
 * - Smooth animations
 * - Search/filter options
 * - Multi-select support
 * - Custom rendering
 * - Keyboard navigation
 * - ARIA compliant
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { dropdownVariants } from '../../lib/animations/transitions';
import { listItemVariants } from '../../lib/animations/stagger';

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
  const containerRef = useRef<HTMLDivElement>(null);
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
      className={`relative ${fullWidth ? 'w-full' : 'w-64'} ${className}`}
    >
      {/* Label */}
      {label && (
        <label className="block mb-2 text-sm font-medium text-white">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-xl
          bg-white/10 backdrop-blur-md border
          ${error ? 'border-red-500/50' : 'border-white/20'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/15 cursor-pointer'}
          transition-all duration-200
          flex items-center justify-between gap-2
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex-1 flex items-center gap-2 flex-wrap min-h-[24px]">
          {selectedOptions.length > 0 ? (
            multiple ? (
              selectedOptions.map(opt => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg
                             bg-primary-500/20 border border-primary-500/30 text-white text-sm"
                >
                  {opt.icon && <span className="w-4 h-4">{opt.icon}</span>}
                  {opt.label}
                  <button
                    onClick={(e) => handleRemove(opt.value, e)}
                    className="hover:text-red-400 transition-colors"
                    aria-label={`Remove ${opt.label}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="flex items-center gap-2 text-white">
                {selectedOptions[0].icon && (
                  <span className="w-5 h-5">{selectedOptions[0].icon}</span>
                )}
                {selectedOptions[0].label}
              </span>
            )
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200
                     ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute z-50 w-full mt-2 rounded-xl
                       bg-gray-900/95 backdrop-blur-xl border border-white/20
                       shadow-2xl overflow-hidden"
          >
            {/* Search */}
            {searchable && (
              <div className="p-3 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg
                               bg-white/10 border border-white/20
                               text-white placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div
              className="max-h-64 overflow-y-auto"
              role="listbox"
              aria-multiselectable={multiple}
            >
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
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
                        w-full px-4 py-3 flex items-center gap-3
                        transition-colors text-left
                        ${option.disabled 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-white/10 cursor-pointer'
                        }
                        ${isFocused ? 'bg-white/5' : ''}
                        ${isSelected ? 'bg-primary-500/10' : ''}
                      `}
                      role="option"
                      aria-selected={isSelected}
                    >
                      {/* Icon */}
                      {option.icon && (
                        <span className="w-5 h-5 text-gray-400">
                          {option.icon}
                        </span>
                      )}
                      
                      {/* Label */}
                      <span className="flex-1 text-white">
                        {option.label}
                      </span>
                      
                      {/* Check Mark */}
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary-400" />
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
