/**
 * 📋 ENTERPRISE SELECT COMPONENT
 * Clean dropdown select following Figma/Notion patterns
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'base' | 'lg';
  fullWidth?: boolean;
}

const sizeStyles = {
  sm: 'h-8 text-sm px-3',
  base: 'h-10 text-base px-4',
  lg: 'h-12 text-lg px-4',
};

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  helperText,
  error = false,
  disabled = false,
  size = 'base',
  fullWidth = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  
  // Close on outside click
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
  
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };
  
  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      
      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between gap-2
          bg-white border rounded-md
          transition-all duration-150 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
          ${fullWidth ? 'w-full' : 'min-w-[200px]'}
          ${sizeStyles[size]}
          ${error 
            ? 'border-red-300 focus-visible:ring-red-500' 
            : 'border-gray-300 focus-visible:ring-gray-900 hover:border-gray-400'
          }
        `}
      >
        <span className={`flex items-center gap-2 flex-1 text-left ${!selectedOption ? 'text-gray-400' : 'text-gray-900'}`}>
          {selectedOption?.icon && <span className="inline-flex">{selectedOption.icon}</span>}
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => !option.disabled && handleSelect(option.value)}
                disabled={option.disabled}
                className={`
                  w-full flex items-center justify-between gap-2 px-3 py-2
                  text-sm text-left
                  transition-colors duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${option.value === value
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <span className="flex items-center gap-2 flex-1">
                  {option.icon && <span className="inline-flex">{option.icon}</span>}
                  {option.label}
                </span>
                {option.value === value && (
                  <Check className="w-4 h-4 text-gray-900" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Helper Text */}
      {helperText && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}
