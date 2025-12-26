/**
 * EMPTY STATE - COCONUT V14
 * Beautiful empty state component
 */

import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/glass-card';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  variant?: 'default' | 'compact';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  variant = 'default',
}: EmptyStateProps) {
  if (variant === 'compact') {
    return (
      <div className={`text-center py-8 ${className}`}>
        {icon && (
          <div className="flex justify-center mb-3 text-gray-500">
            {icon}
          </div>
        )}
        <p className="text-sm text-gray-400 mb-2">{title}</p>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <GlassCard className="p-12 text-center">
        {/* Icon */}
        {icon && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex justify-center mb-6"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
              {icon}
            </div>
          </motion.div>
        )}

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-xl font-bold text-white mb-3"
        >
          {title}
        </motion.h3>

        {/* Description */}
        {description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-gray-400 mb-6 max-w-md mx-auto"
          >
            {description}
          </motion.p>
        )}

        {/* Action */}
        {action && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {action}
          </motion.div>
        )}
      </GlassCard>
    </motion.div>
  );
}

export default EmptyState;
