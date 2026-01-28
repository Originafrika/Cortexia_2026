/**
 * ⌨️ ENTERPRISE INPUT COMPONENT
 * Clean, functional input fields
 */

import React from 'react';

export type InputSize = 'sm' | 'base' | 'lg';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
  error?: boolean;
  helperText?: string;
  label?: string;
  icon?: React.ReactNode;
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-sm',
  base: 'h-10 px-4 text-base',
  lg: 'h-12 px-4 text-lg',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      inputSize = 'base',
      error = false,
      helperText,
      label,
      icon,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`
              w-full
              bg-white
              border rounded-md
              font-sans
              transition-all duration-150 ease-in-out
              focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
              ${sizeStyles[inputSize]}
              ${icon ? 'pl-10' : ''}
              ${error 
                ? 'border-red-300 focus-visible:ring-red-500' 
                : 'border-gray-300 focus-visible:ring-gray-900 hover:border-gray-400'
              }
              ${className}
            `}
            {...props}
          />
        </div>
        
        {helperText && (
          <p className={`mt-1.5 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
