/**
 * PREMIUM BADGE - Coconut Design System
 * 
 * Features:
 * - Multiple variants (default, success, warning, error, info)
 * - Multiple sizes (sm, md, lg)
 * - Icon support
 * - Dot indicator
 * - Removable (with onRemove callback)
 * - Glassmorphism option
 */

import { HTMLAttributes } from 'react';
import { X } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  dot?: boolean;
  onRemove?: () => void;
  glass?: boolean;
}

// ============================================
// STYLES
// ============================================

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-700 text-gray-200 border-gray-600',
  success: 'bg-green-900/30 text-green-400 border-green-700/30',
  warning: 'bg-amber-900/30 text-amber-400 border-amber-700/30',
  error: 'bg-red-900/30 text-red-400 border-red-700/30',
  info: 'bg-blue-900/30 text-blue-400 border-blue-700/30',
  purple: 'bg-purple-900/30 text-purple-400 border-purple-700/30',
};

const sizeStyles: Record<BadgeSize, { badge: string; icon: string; dot: string }> = {
  sm: {
    badge: 'px-2 py-0.5 text-xs',
    icon: 'w-3 h-3',
    dot: 'w-1.5 h-1.5',
  },
  md: {
    badge: 'px-2.5 py-1 text-sm',
    icon: 'w-4 h-4',
    dot: 'w-2 h-2',
  },
  lg: {
    badge: 'px-3 py-1.5 text-base',
    icon: 'w-5 h-5',
    dot: 'w-2.5 h-2.5',
  },
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-gray-400',
  success: 'bg-green-400',
  warning: 'bg-amber-400',
  error: 'bg-red-400',
  info: 'bg-blue-400',
  purple: 'bg-purple-400',
};

// ============================================
// COMPONENT
// ============================================

export function Badge({
  variant = 'default',
  size = 'md',
  icon,
  dot = false,
  onRemove,
  glass = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = `
    inline-flex items-center gap-1.5
    font-medium rounded-full border
    transition-all duration-200
    ${glass ? 'backdrop-blur-sm' : ''}
  `;

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size].badge} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Dot Indicator */}
      {dot && (
        <span className={`${sizeStyles[size].dot} ${dotColors[variant]} rounded-full`} />
      )}

      {/* Icon */}
      {icon && <span className={sizeStyles[size].icon}>{icon}</span>}

      {/* Content */}
      {children}

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:opacity-70 transition-opacity"
          aria-label="Remove"
        >
          <X className={sizeStyles[size].icon} />
        </button>
      )}
    </span>
  );
}

// ============================================
// STATUS BADGE (Convenience)
// ============================================

export type StatusBadgeType = 'placeholder' | 'ready' | 'generating' | 'generated' | 'validated' | 'error';

const statusConfig: Record<StatusBadgeType, { variant: BadgeVariant; label: string }> = {
  placeholder: { variant: 'default', label: 'Placeholder' },
  ready: { variant: 'warning', label: 'Ready' },
  generating: { variant: 'info', label: 'Generating' },
  generated: { variant: 'success', label: 'Generated' },
  validated: { variant: 'purple', label: 'Validated' },
  error: { variant: 'error', label: 'Error' },
};

export function StatusBadge({ status, ...props }: { status: StatusBadgeType } & Omit<BadgeProps, 'variant'>) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} dot {...props}>
      {config.label}
    </Badge>
  );
}
