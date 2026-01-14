/**
 * COST WIDGET - P0-07
 * Fixed position cost display (simplified - total only)
 * 
 * ✅ FIXED: BDS Compliance Phase 2B
 * - Design tokens integration
 * - French labels
 * - Icon sizing standardized
 * - Focus states
 * 
 * ✨ SIMPLIFIED: Removed expandable details (Option B)
 * - Shows only total cost
 * - Cleaner, more focused UI
 */

import React from 'react';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Z_INDEX } from '../../lib/constants/z-index';

interface CostWidgetProps {
  cost: {
    analysis: number;
    backgroundGeneration: number;
    assetGeneration: number;
    finalGeneration: number;
    total: number;
  };
  userCredits?: number;
  isVisible?: boolean; // ✅ NEW: Can be hidden/shown
}

export function CostWidget({ cost, userCredits = 0, isVisible = true }: CostWidgetProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 max-w-[calc(100vw-2rem)] sm:max-w-sm"
      style={{ zIndex: Z_INDEX.FLOATING_BUTTON }}
    >
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-400/50 backdrop-blur-xl p-3 sm:p-4">
        {/* Simplified display - total only */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="text-left">
            <div className="text-xl sm:text-2xl text-white font-bold">{cost.total} ⭐</div>
            <div className="text-xs text-white/80">Coût total</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}