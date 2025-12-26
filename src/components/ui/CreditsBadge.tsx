/**
 * COCONUT V14 - CREDITS BADGE COMPONENT
 * Reusable credits display badge
 * 
 * Features:
 * - Glass morphism design
 * - Multiple variants
 * - Animated interactions
 * - BDS compliant
 */

import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { useCredits } from '../../lib/contexts/CreditsContext';
import { HOVER_LIFT_SMALL, TAP_SCALE } from '../../lib/constants/animations';

// ============================================
// TYPES
// ============================================

interface CreditsBadgeProps {
  variant?: 'default' | 'compact' | 'detailed';
  showTotal?: boolean;
  onClick?: () => void;
  className?: string;
}

// ============================================
// COMPONENT
// ============================================

export function CreditsBadge({ 
  variant = 'default', 
  showTotal = false,
  onClick,
  className = ''
}: CreditsBadgeProps) {
  const { credits } = useCredits();
  const total = credits.free + credits.paid;
  
  // Compact variant - just the number
  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={onClick ? HOVER_LIFT_SMALL : undefined}
        whileTap={onClick ? TAP_SCALE : undefined}
        onClick={onClick}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 
          bg-white/50 backdrop-blur-xl rounded-lg 
          border border-white/40 shadow-lg
          ${onClick ? 'cursor-pointer hover:bg-white/70' : ''}
          transition-all duration-300
          ${className}
        `}
      >
        <Zap className="w-4 h-4 text-amber-600" />
        <span className="text-sm text-[var(--coconut-shell)]">{total}</span>
      </motion.div>
    );
  }
  
  // Detailed variant - full card
  if (variant === 'detailed') {
    return (
      <motion.div
        whileHover={onClick ? HOVER_LIFT_SMALL : undefined}
        whileTap={onClick ? TAP_SCALE : undefined}
        onClick={onClick}
        className={`relative ${className}`}
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl blur-xl opacity-50" />
        
        {/* Card */}
        <div className={`
          relative bg-white/50 backdrop-blur-xl rounded-xl p-4 
          border border-white/40 shadow-xl
          ${onClick ? 'cursor-pointer hover:bg-white/70' : ''}
          transition-all duration-300
        `}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--coconut-husk)]">Available Credits</span>
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-3xl text-[var(--coconut-shell)]">{total.toLocaleString()}</p>
            <span className="text-sm text-[var(--coconut-husk)]">credits</span>
          </div>
          
          {showTotal && (
            <div className="text-xs text-[var(--coconut-husk)] flex items-center gap-1">
              <span>{credits.free} free</span>
              <span>•</span>
              <span>{credits.paid} paid</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
  
  // Default variant - medium card
  return (
    <motion.div
      whileHover={onClick ? HOVER_LIFT_SMALL : undefined}
      whileTap={onClick ? TAP_SCALE : undefined}
      onClick={onClick}
      className={`relative ${className}`}
    >
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl blur-lg opacity-50" />
      
      {/* Card */}
      <div className={`
        relative bg-white/50 backdrop-blur-xl rounded-lg p-3 
        border border-white/40 shadow-lg
        ${onClick ? 'cursor-pointer hover:bg-white/70' : ''}
        transition-all duration-300
      `}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          
          <div className="flex-1">
            <div className="text-xs text-[var(--coconut-husk)]">Credits</div>
            <div className="text-xl text-[var(--coconut-shell)]">{total.toLocaleString()}</div>
          </div>
        </div>
        
        {showTotal && (
          <div className="mt-2 pt-2 border-t border-white/30 text-xs text-[var(--coconut-husk)] flex items-center gap-1">
            <span>{credits.free} free</span>
            <span>•</span>
            <span>{credits.paid} paid</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default CreditsBadge;
