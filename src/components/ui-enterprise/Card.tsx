/**
 * 🃏 ENTERPRISE CARD COMPONENT
 * Clean card with subtle shadows and hover states
 */

import React from 'react';
import { motion } from 'motion/react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'base' | 'lg';
  hoverable?: boolean;
  interactive?: boolean;
}

const paddingStyles = {
  sm: 'p-4',
  base: 'p-6',
  lg: 'p-8',
};

export function Card({
  padding = 'base',
  hoverable = false,
  interactive = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const Component = interactive ? motion.div : 'div';
  
  const motionProps = interactive ? {
    whileHover: { y: -2 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.15 },
  } : {};
  
  return (
    <Component
      className={`
        bg-white rounded-lg border border-gray-200
        shadow-sm
        transition-all duration-150 ease-in-out
        ${paddingStyles[padding]}
        ${hoverable ? 'hover:shadow-md hover:border-gray-300' : ''}
        ${interactive ? 'cursor-pointer hover:shadow-md hover:border-gray-300' : ''}
        ${className}
      `}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-gray-500 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
}