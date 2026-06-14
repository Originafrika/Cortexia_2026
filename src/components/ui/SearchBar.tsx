/**
 * SEARCH BAR - Advanced search with filters
 * ✅ BDS Compliant: Rhétorique (Guide l'attention)
 * 
 * Features:
 * - Real-time search
 * - Debounced input
 * - Filter chips
 * - Keyboard shortcuts (Cmd/Ctrl+K)
 * - Clear button
 * - Mobile responsive
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';

export interface SearchFilter {
  id: string;
  label: string;
  value: any;
  icon?: React.ReactNode;
}

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onFilterChange?: (filters: SearchFilter[]) => void;
  availableFilters?: SearchFilter[];
  activeFilters?: SearchFilter[];
  debounceMs?: number;
  showFilterButton?: boolean;
  className?: string;
  shortcutEnabled?: boolean;
}

export function SearchBar({
  placeholder = 'Rechercher...',
  value,
  onChange,
  onFilterChange,
  availableFilters = [],
  activeFilters = [],
  debounceMs = 300,
  showFilterButton = true,
  className = '',
  shortcutEnabled = true
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced onChange
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localValue, debounceMs, onChange]);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    if (!shortcutEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Escape to clear/blur
      if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur();
        if (localValue) {
          handleClear();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutEnabled, isFocused, localValue]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  };

  const handleFilterToggle = (filter: SearchFilter) => {
    if (!onFilterChange) return;

    const isActive = activeFilters.some(f => f.id === filter.id);
    const newFilters = isActive
      ? activeFilters.filter(f => f.id !== filter.id)
      : [...activeFilters, filter];

    onFilterChange(newFilters);
  };

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div
          className={`
            relative flex items-center gap-3 px-4 py-3 rounded-xl
            bg-white/50 backdrop-blur-xl border-2 transition-all duration-200
            ${isFocused 
              ? 'border-purple-400 shadow-lg shadow-purple-500/20' 
              : 'border-slate-200 hover:border-slate-300'
            }
          `}
        >
          {/* Search Icon */}
          <Search className={`w-5 h-5 flex-shrink-0 transition-colors ${
            isFocused ? 'text-purple-600' : 'text-slate-400'
          }`} />

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 text-sm sm:text-base"
          />

          {/* Clear Button */}
          <AnimatePresence>
            {localValue && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="p-1 rounded-lg hover:bg-slate-200 transition-colors"
                aria-label="Effacer la recherche"
              >
                <X className="w-4 h-4 text-slate-500" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Filter Button */}
          {showFilterButton && availableFilters.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                p-2 rounded-lg transition-colors relative
                ${showFilters || hasActiveFilters
                  ? 'bg-purple-100 text-purple-600'
                  : 'hover:bg-slate-100 text-slate-500'
                }
              `}
              aria-label="Filtres"
            >
              <SlidersHorizontal className="w-4 h-4" />
              
              {/* Active filters badge */}
              {hasActiveFilters && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center"
                >
                  <span className="text-xs text-white font-medium">
                    {activeFilters.length}
                  </span>
                </motion.div>
              )}
            </button>
          )}

          {/* Keyboard Shortcut Hint */}
          {shortcutEnabled && !isFocused && !localValue && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md text-xs text-slate-500">
              <kbd className="font-mono">⌘K</kbd>
            </div>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <AnimatePresence>
        {showFilters && availableFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {availableFilters.map((filter) => {
                const isActive = activeFilters.some(f => f.id === filter.id);
                
                return (
                  <motion.button
                    key={filter.id}
                    onClick={() => handleFilterToggle(filter)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                      transition-colors font-medium
                      ${isActive
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300'
                      }
                    `}
                  >
                    {filter.icon && <span className="w-4 h-4">{filter.icon}</span>}
                    {filter.label}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-xs text-slate-500">Filtres actifs:</span>
            {activeFilters.map((filter) => (
              <motion.div
                key={filter.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium"
              >
                {filter.icon && <span className="w-3 h-3">{filter.icon}</span>}
                {filter.label}
                <button
                  onClick={() => handleFilterToggle(filter)}
                  className="ml-1 hover:bg-purple-200 rounded p-0.5 transition-colors"
                  aria-label={`Retirer le filtre ${filter.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
            
            {activeFilters.length > 1 && (
              <button
                onClick={() => onFilterChange?.([])}
                className="text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Tout effacer
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Simplified search without filters
 */
interface SimpleSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SimpleSearch({
  placeholder = 'Rechercher...',
  value,
  onChange,
  className = ''
}: SimpleSearchProps) {
  return (
    <SearchBar
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      showFilterButton={false}
      className={className}
    />
  );
}
