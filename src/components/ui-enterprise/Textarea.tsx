/**
 * 📝 ENTERPRISE TEXTAREA COMPONENT
 * Clean multiline input field
 */

import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error = false,
      resize = 'vertical',
      className = '',
      ...props
    },
    ref
  ) => {
    const resizeClass = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    }[resize];
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={`
            w-full
            px-4 py-3
            bg-white
            border rounded-md
            font-sans text-base
            transition-all duration-150 ease-in-out
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
            ${resizeClass}
            ${error 
              ? 'border-red-300 focus-visible:ring-red-500' 
              : 'border-gray-300 focus-visible:ring-gray-900 hover:border-gray-400'
            }
            ${className}
          `}
          {...props}
        />
        
        {helperText && (
          <p className={`mt-1.5 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
