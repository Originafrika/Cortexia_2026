/**
 * CUSTOM SELECT - BDS Beauty Design System
 * Select dropdown avec glassmorphism et animations fluides
 * 7 Arts: Géométrie (glassmorphism), Musique (animations), Grammaire (cohérence)
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  id: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CustomSelect({
  id,
  value,
  options,
  onChange,
  label,
  placeholder = 'Sélectionner...',
  size = 'md',
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // BDS: Logique - Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // BDS: Arithmétique - Size variants
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label htmlFor={id} className="text-gray-400 mb-1.5 block">
          {label}
        </label>
      )}

      {/* BDS: Géométrie - Glassmorphism button */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`
          w-full flex items-center justify-between gap-2
          bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl
          text-white transition-all duration-400
          focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
          ${sizeClasses[size]}
          ${isOpen ? 'border-purple-500/50 ring-2 ring-purple-500/20' : ''}
        `}
      >
        <span className="flex items-center gap-1.5">
          {selectedOption?.icon && (
            <span className="text-base" aria-hidden="true">{selectedOption.icon}</span>
          )}
          <span>{selectedOption?.label || placeholder}</span>
        </span>
        <ChevronDown 
          className={`${iconSizes[size]} text-gray-400 transition-transform duration-400 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* BDS: Musique - Animated dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute z-50 w-full mt-2 overflow-hidden"
          >
            {/* BDS: Géométrie - Glassmorphism dropdown */}
            <div className="backdrop-blur-xl bg-black/90 border border-white/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
              <ul role="listbox" className="py-1 max-h-64 overflow-y-auto">
                {options.map((option) => {
                  const isSelected = option.value === value;
                  const isDisabled = option.disabled;

                  return (
                    <li key={option.value} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isDisabled) {
                            onChange(option.value);
                            setIsOpen(false);
                          }
                        }}
                        disabled={isDisabled}
                        className={`
                          w-full flex items-center justify-between gap-2 px-3 py-2
                          transition-all duration-200
                          ${isSelected 
                            ? 'bg-purple-500/20 text-white' 
                            : isDisabled
                              ? 'text-gray-600 cursor-not-allowed'
                              : 'text-gray-300 hover:bg-white/10 hover:text-white'
                          }
                        `}
                      >
                        <span className="flex items-center gap-1.5">
                          {option.icon && (
                            <span className="text-base" aria-hidden="true">{option.icon}</span>
                          )}
                          <span>{option.label}</span>
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-purple-400" aria-hidden="true" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
