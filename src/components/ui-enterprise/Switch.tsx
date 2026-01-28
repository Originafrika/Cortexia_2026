/**
 * 🏢 ENTERPRISE SWITCH COMPONENT
 * Toggle switch - Clean & minimal
 * BDS: Grammaire (Art 1) + Logique (Art 2)
 */

import React from 'react';
import { motion } from 'motion/react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  className?: string;
}

const sizeStyles = {
  sm: {
    container: 'w-8 h-5',
    thumb: 'w-3 h-3',
    translate: 'translate-x-3',
  },
  md: {
    container: 'w-11 h-6',
    thumb: 'w-4 h-4',
    translate: 'translate-x-5',
  },
  lg: {
    container: 'w-14 h-7',
    thumb: 'w-5 h-5',
    translate: 'translate-x-7',
  },
};

export function Switch({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  className = '',
}: SwitchProps) {
  const styles = sizeStyles[size];

  const switchElement = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        ${styles.container}
        relative inline-flex items-center rounded-full
        transition-colors duration-200 ease-in-out
        ${checked 
          ? 'bg-blue-500' 
          : 'bg-gray-700'
        }
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:bg-opacity-90'
        }
        ${!label && !description ? className : ''}
      `}
    >
      <motion.span
        layout
        className={`
          ${styles.thumb}
          inline-block rounded-full bg-white shadow-lg
          transform transition-transform duration-200
          ${checked ? styles.translate : 'translate-x-1'}
        `}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );

  if (!label && !description) {
    return switchElement;
  }

  return (
    <label className={`flex items-start gap-3 cursor-pointer ${className}`}>
      {switchElement}
      <div className="flex-1">
        {label && (
          <div className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-white'}`}>
            {label}
          </div>
        )}
        {description && (
          <div className="text-xs text-gray-400 mt-0.5">
            {description}
          </div>
        )}
      </div>
    </label>
  );
}

// Checkbox variant
export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  indeterminate?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  indeterminate = false,
  className = '',
}: CheckboxProps) {
  const checkboxElement = (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        w-5 h-5 rounded border-2 flex items-center justify-center
        transition-all duration-200
        ${checked || indeterminate
          ? 'bg-blue-500 border-blue-500' 
          : 'bg-transparent border-gray-700 hover:border-gray-600'
        }
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer'
        }
        ${!label && !description ? className : ''}
      `}
    >
      {(checked || indeterminate) && (
        <motion.svg
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-3 h-3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          {indeterminate ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          )}
        </motion.svg>
      )}
    </button>
  );

  if (!label && !description) {
    return checkboxElement;
  }

  return (
    <label className={`flex items-start gap-3 cursor-pointer ${className}`}>
      {checkboxElement}
      <div className="flex-1">
        {label && (
          <div className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-white'}`}>
            {label}
          </div>
        )}
        {description && (
          <div className="text-xs text-gray-400 mt-0.5">
            {description}
          </div>
        )}
      </div>
    </label>
  );
}

// Radio variant
export interface RadioProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

export function Radio({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  className = '',
}: RadioProps) {
  const radioElement = (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(true)}
      className={`
        w-5 h-5 rounded-full border-2 flex items-center justify-center
        transition-all duration-200
        ${checked
          ? 'border-blue-500' 
          : 'border-gray-700 hover:border-gray-600'
        }
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer'
        }
        ${!label && !description ? className : ''}
      `}
    >
      {checked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-2.5 h-2.5 rounded-full bg-blue-500"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  );

  if (!label && !description) {
    return radioElement;
  }

  return (
    <label className={`flex items-start gap-3 cursor-pointer ${className}`}>
      {radioElement}
      <div className="flex-1">
        {label && (
          <div className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-white'}`}>
            {label}
          </div>
        )}
        {description && (
          <div className="text-xs text-gray-400 mt-0.5">
            {description}
          </div>
        )}
      </div>
    </label>
  );
}
