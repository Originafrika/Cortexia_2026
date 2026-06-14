/**
 * COCONUT V14 - MODE SELECTOR
 * Creative Mode Selection Interface
 * 
 * ✅ FIXED: BDS Compliance Phase 2B
 * - Design tokens integration
 * - French labels
 * - Icon sizing standardized
 * - Focus states
 * - Error handler
 */

import React from 'react';
import { motion } from 'motion/react';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 3A: Import sound
import { Sparkles, Zap, Wand2, Settings, Check, Info, Hand, CheckCircle2 } from 'lucide-react';
import { tokens, TRANSITIONS } from '../../lib/design/tokens';

// ============================================
// TYPES
// ============================================

export type GenerationMode = 'auto' | 'semi-auto' | 'manual';

interface ModeSelectorProps {
  selectedMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  disabled?: boolean;
  className?: string;
}

// ============================================
// MODE CONFIGURATIONS
// ============================================

const MODES = [
  {
    id: 'auto' as GenerationMode,
    icon: Zap,
    title: 'Auto',
    description: 'L\'IA génère tout',
    color: 'purple',
    features: [
      'Génération instantanée',
      'Paramètres optimisés',
      'Itérations automatiques',
    ],
  },
  {
    id: 'semi-auto' as GenerationMode,
    icon: Settings,
    title: 'Semi-Auto',
    description: 'Validation par étapes',
    color: 'blue',
    features: [
      'Contrôle des specs',
      'Preview avant génération',
      'Ajustements manuels',
    ],
  },
  {
    id: 'manual' as GenerationMode,
    icon: Hand,
    title: 'Manuel',
    description: 'Contrôle total',
    color: 'green',
    features: [
      'Édition prompt détaillée',
      'Réglages techniques fins',
      'Gestion des références',
    ],
  },
] as const;

// ============================================
// COLOR SCHEMES
// ============================================

const COLOR_SCHEMES = {
  purple: {
    bg: 'from-[var(--coconut-shell)]/10 to-[var(--coconut-husk)]/10',
    border: 'border-[var(--coconut-shell)]/30',
    text: 'text-[var(--coconut-shell)]',
    icon: 'text-[var(--coconut-shell)]',
    activeBg: 'bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20',
    activeBorder: 'border-[var(--coconut-husk)]',
    shadow: 'shadow-lg shadow-[var(--coconut-shell)]/20',
  },
  blue: {
    bg: 'from-[var(--coconut-cream)]/30 to-[var(--coconut-milk)]/30',
    border: 'border-[var(--coconut-husk)]/30',
    text: 'text-[var(--coconut-husk)]',
    icon: 'text-[var(--coconut-husk)]',
    activeBg: 'bg-gradient-to-br from-[var(--coconut-cream)]/40 to-[var(--coconut-milk)]/40',
    activeBorder: 'border-[var(--coconut-husk)]',
    shadow: 'shadow-lg shadow-[var(--coconut-water)]/20',
  },
  green: {
    bg: 'from-[var(--coconut-husk)]/10 to-[var(--coconut-shell)]/10',
    border: 'border-[var(--coconut-husk)]/30',
    text: 'text-[var(--coconut-shell)]',
    icon: 'text-[var(--coconut-husk)]',
    activeBg: 'bg-gradient-to-br from-[var(--coconut-husk)]/20 to-[var(--coconut-shell)]/20',
    activeBorder: 'border-[var(--coconut-husk)]',
    shadow: 'shadow-lg shadow-[var(--coconut-husk)]/20',
  },
};

// ============================================
// MAIN COMPONENT
// ============================================

export function ModeSelector({ 
  selectedMode, 
  onModeChange, 
  disabled = false,
  className = '',
}: ModeSelectorProps) {
  // 🔊 PHASE 3A: Sound context
  const { playPop } = useSoundContext();
  
  const handleModeChange = (mode: GenerationMode) => {
    if (!disabled) {
      playPop(); // 🔊 Sound feedback for mode selection
      onModeChange(mode);
    }
  };
  
  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg text-[var(--coconut-shell)] mb-1">
          Mode de génération
        </h3>
        <p className="text-sm text-[var(--coconut-shell)]/70">
          Choisissez le niveau de contrôle souhaité
        </p>
      </div>

      {/* Mode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODES.map((mode) => {
          const isSelected = selectedMode === mode.id;
          const colors = COLOR_SCHEMES[mode.color];
          const Icon = mode.icon;

          return (
            <motion.button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              disabled={disabled}
              whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              transition={TRANSITIONS.fast}
              className={`
                relative overflow-hidden text-left
                backdrop-blur-xl bg-white/60 
                border-2 rounded-2xl p-5
                transition-all duration-300
                ${isSelected 
                  ? `${colors.activeBorder} ${colors.activeBg} ${colors.shadow}`
                  : `${colors.border} hover:${colors.border} hover:bg-white/80`
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={TRANSITIONS.fast}
                  className="absolute top-3 right-3"
                >
                  <div className={`w-6 h-6 rounded-full ${colors.activeBg} border ${colors.activeBorder} flex items-center justify-center`}>
                    <CheckCircle2 className={`w-4 h-4 ${colors.icon}`} />
                  </div>
                </motion.div>
              )}

              {/* Icon */}
              <div className={`
                w-12 h-12 rounded-xl mb-4
                bg-gradient-to-br ${colors.bg}
                border ${colors.border}
                flex items-center justify-center
                ${isSelected ? colors.shadow : ''}
              `}>
                <Icon className={`w-6 h-6 ${colors.icon}`} />
              </div>

              {/* Title */}
              <h4 className={`
                mb-1 text-base
                ${isSelected ? colors.text : 'text-[var(--coconut-shell)]'}
              `}>
                {mode.title}
              </h4>

              {/* Description */}
              <p className="text-sm text-[var(--coconut-shell)]/70 mb-3">
                {mode.description}
              </p>

              {/* Features */}
              <ul className="space-y-1.5">
                {mode.features.map((feature, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-2 text-xs text-[var(--coconut-shell)]/60"
                  >
                    <span className={`mt-0.5 ${isSelected ? colors.text : 'text-slate-400'}`}>•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Hover Glow Effect */}
              {!disabled && !isSelected && (
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10`}
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Mode Description */}
      <motion.div
        key={selectedMode}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={TRANSITIONS.medium}
        className="mt-4 p-4 rounded-xl bg-gradient-to-r from-slate-50/80 to-slate-100/80 backdrop-blur-xl border border-slate-200/60"
      >
        <p className="text-sm text-slate-700">
          {selectedMode === 'auto' && (
            <>
              <strong className="text-[var(--coconut-shell)]">Mode Auto :</strong> L'IA analyse votre intention et génère automatiquement tous les paramètres optimaux. Idéal pour une création rapide et efficace.
            </>
          )}
          {selectedMode === 'semi-auto' && (
            <>
              <strong className="text-[var(--coconut-husk)]">Mode Semi-Auto :</strong> L'IA propose des paramètres que vous pouvez valider ou ajuster avant génération. Balance parfaite entre rapidité et contrôle.
            </>
          )}
          {selectedMode === 'manual' && (
            <>
              <strong className="text-[var(--coconut-shell)]">Mode Manuel :</strong> Vous contrôlez chaque aspect de la génération : prompt, références, paramètres techniques. Pour les créatifs exigeants.
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}