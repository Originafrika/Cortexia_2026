/**
 * COCONUT V14 - ADVANCED MODE INDICATOR
 * Ultra-Premium Liquid Glass Design
 * 
 * 🎯 PHASE 3D: Visual indicator for Manual mode
 * - Shows when manual mode is active
 * - Provides contextual tips
 * - Activates advanced features
 * 
 * BDS Compliance: 7 Arts de Perfection Divine
 * 
 * ✨ PHASE 4 - SESSION 15: SOUND INTEGRATION
 * - Pattern: Display-only component (no interactions)
 * - Sound context imported for future use
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hand, Info, Sparkles } from 'lucide-react';
import { TRANSITIONS } from '../../lib/design/tokens';
import type { GenerationMode } from './ModeSelector';
// Sound context imported for future use if we add interactive tips
import { useSoundContext } from './SoundProvider';

// ============================================
// TYPES
// ============================================

interface AdvancedModeIndicatorProps {
  mode: GenerationMode;
  className?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function AdvancedModeIndicator({ mode, className = '' }: AdvancedModeIndicatorProps) {
  
  // Only show for manual mode
  if (mode !== 'manual') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={TRANSITIONS.medium}
        className={className}
      >
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[var(--coconut-palm)]/10 to-[var(--coconut-cream)]/10 border border-[var(--coconut-palm)]/40 p-4">
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-palm)]/5 via-[var(--coconut-cream)]/10 to-[var(--coconut-palm)]/5"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Content */}
          <div className="relative flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[var(--coconut-palm)]/20 to-[var(--coconut-cream)]/20 rounded-lg flex items-center justify-center border border-[var(--coconut-palm)]/40">
              <Hand className="w-5 h-5 text-[var(--coconut-husk)]" />
            </div>

            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm text-[var(--coconut-shell)]">Mode Manuel Activé</h4>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                >
                  <Sparkles className="w-4 h-4 text-[var(--coconut-husk)]" />
                </motion.div>
              </div>
              <p className="text-xs text-[var(--coconut-husk)] leading-relaxed">
                Vous avez le contrôle total. Éditez le prompt, ajustez les specs techniques, 
                et gérez vos références en détail avant de générer.
              </p>
            </div>

            {/* Info badge */}
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-[var(--coconut-palm)]/20 flex items-center justify-center">
                <Info className="w-3.5 h-3.5 text-[var(--coconut-husk)]" />
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="relative mt-3 pt-3 border-t border-[var(--coconut-palm)]/30">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[var(--coconut-husk)]">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--coconut-palm)]" />
                <span>Édition prompt détaillée</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--coconut-palm)]" />
                <span>Contrôle specs techniques</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--coconut-palm)]" />
                <span>Gestion références avancée</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}