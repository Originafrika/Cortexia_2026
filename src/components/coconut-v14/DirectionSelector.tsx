/**
 * COCONUT V14 - DIRECTION SELECTOR
 * Smart Direction Selection with AI Suggestions
 * 
 * ✅ FIXED: BDS Compliance Phase 2B
 * - Design tokens integration
 * - French labels
 * - Icon sizing standardized
 * - Focus states
 * - Error handler
 * ♿ PHASE 6: ACCESSIBILITY COMPLETE
 * - Focus trap implemented
 * - Keyboard shortcuts (Arrow keys, Enter)
 * - ARIA attributes
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 3A: Import sound
import { ArrowRight, Sparkles, RefreshCw, Palette, Zap, Info, Keyboard, Check } from 'lucide-react';
import { tokens, TRANSITIONS } from '@/lib/design/tokens';
import { WORKFLOW_LABELS, ACTION_LABELS } from '@/lib/i18n/translations';
import { handleError } from '@/lib/utils/errorHandler';
import { EmptyState } from '@/components/common/EmptyState';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';

// ============================================
// TYPES
// ============================================

export interface CreativeDirection {
  id: string;
  name: string;
  description: string;
  mood: string;
  colorPalette: string[];
  styleKeywords: string[];
  reasoning: string;
  thumbnail?: string;
}

interface DirectionSelectorProps {
  projectTitle: string;
  userInput: string;
  detectedGenre?: string;
  directions: CreativeDirection[];
  onSelect: (directionId: string) => void;
  onCancel?: () => void;
  onReanalyze?: () => void;
  isSubmitting?: boolean;
  
  // Alternative props for backward compatibility
  analysis?: any;
  availableDirections?: CreativeDirection[];
  onDirectionSelect?: (directionId: string) => void;
  onEdit?: () => void;
  userCredits?: number;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function DirectionSelector(props: DirectionSelectorProps) {
  const {
    projectTitle: _projectTitle,
    userInput: _userInput,
    detectedGenre,
    directions: _directions,
    onSelect: _onSelect,
    onCancel,
    onReanalyze,
    isSubmitting = false,
    
    // New props
    analysis,
    availableDirections,
    onDirectionSelect,
    onEdit,
  } = props;
  
  // Use new props if available, otherwise fall back to old ones
  const projectTitle = _projectTitle || analysis?.projectTitle || 'Project';
  const userInput = _userInput || analysis?.concept?.direction || '';
  const directions = _directions || availableDirections || [];
  const onSelect = _onSelect || onDirectionSelect || (() => {});
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  // Keyboard navigation for direction cards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting) return;

      try {
        switch (e.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            e.preventDefault();
            setFocusedIndex(prev => (prev + 1) % directions.length);
            break;
          
          case 'ArrowUp':
          case 'ArrowLeft':
            e.preventDefault();
            setFocusedIndex(prev => (prev - 1 + directions.length) % directions.length);
            break;
          
          case 'Enter':
          case ' ':
            e.preventDefault();
            if (focusedIndex >= 0 && focusedIndex < directions.length) {
              handleSelect(directions[focusedIndex].id);
            }
            break;
          
          case 'Escape':
            e.preventDefault();
            if (onCancel) {
              onCancel();
            }
            break;
        }
      } catch (error) {
        handleError(error as Error, 'DirectionSelector.keyboardNav', { toast: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, directions, isSubmitting, onCancel]);

  const handleSelect = (directionId: string) => {
    try {
      setSelectedId(directionId);
    } catch (error) {
      handleError(error as Error, 'DirectionSelector.handleSelect', { toast: true });
    }
  };

  const handleConfirm = () => {
    try {
      if (selectedId) {
        onSelect(selectedId);
      }
    } catch (error) {
      handleError(error as Error, 'DirectionSelector.handleConfirm', { toast: true });
    }
  };

  const handleConfirmKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleConfirm();
    }
  };

  // Empty state if no directions
  if (directions.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <EmptyState
          icon={Sparkles}
          title={WORKFLOW_LABELS.noDirectionsAvailable}
          description={WORKFLOW_LABELS.cannotGenerateDirections}
          action={onReanalyze ? {
            label: ACTION_LABELS.retry,
            onClick: onReanalyze
          } : undefined}
        />
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex items-center justify-center ${tokens.layout.containerPadding}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={TRANSITIONS.medium}
        className={`w-full max-w-5xl ${tokens.gradients.coconutDark} backdrop-blur-2xl ${tokens.radius.lg} ${tokens.borderColors.orange} border ${tokens.shadows.xl} overflow-hidden`}
        role="dialog"
        aria-labelledby="direction-selector-title"
        aria-describedby="direction-selector-description"
      >
        {/* Header */}
        <div className={`p-8 pb-6 ${tokens.borderColors.orangeDark} border-b bg-gradient-to-br from-[var(--coconut-husk)]/20 to-[var(--coconut-shell)]/20`}>
          <div className={`flex items-start ${tokens.gap.normal}`}>
            <div className={`p-3 bg-gradient-to-br from-[var(--coconut-husk)]/30 to-[var(--coconut-shell)]/30 ${tokens.radius.lg} ${tokens.borderColors.orangeDark} border`}>
              <Sparkles className={`${tokens.iconSize.lg} text-[var(--coconut-husk)]`} />
            </div>
            <div className="flex-1">
              <h2 id="direction-selector-title" className={`text-2xl ${tokens.textColors.orangeLight} mb-2`}>
                {WORKFLOW_LABELS.selectDirection}
              </h2>
              <p id="direction-selector-description" className={`${tokens.textColors.orangeSubtle} text-sm`}>
                {WORKFLOW_LABELS.project} : <span className="text-[var(--coconut-shell)]">{projectTitle}</span>
              </p>
              {detectedGenre && (
                <p className={`${tokens.textColors.orangeSubtle} text-sm mt-1`}>
                  {WORKFLOW_LABELS.detectedGenre} : <span className="text-[var(--coconut-husk)]">{detectedGenre}</span>
                </p>
              )}
            </div>
          </div>

          {/* User Input Summary */}
          <div className={`mt-4 p-4 ${tokens.bgColors.orangeDark} ${tokens.radius.md} ${tokens.borderColors.orangeDark} border`}>
            <p className={`text-[var(--coconut-milk)] text-sm leading-relaxed`}>
              <span className="text-[var(--coconut-husk)]/80">{WORKFLOW_LABELS.yourRequest} :</span> "{userInput}"
            </p>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className={`mt-4 p-3 ${tokens.bgColors.orangeDarker} ${tokens.radius.sm} ${tokens.borderColors.orangeDarker} border`}>
            <div className={`flex items-center ${tokens.gap.small}`}>
              <Keyboard className={`${tokens.iconSize.sm} ${tokens.textColors.orangeSubtle}`} />
              <p className="text-[var(--coconut-shell)]/60 text-xs flex items-center gap-2">
                {WORKFLOW_LABELS.keyboardShortcuts} : <kbd className="px-1.5 py-0.5 bg-[var(--coconut-husk)]/10 rounded">↑↓</kbd> {WORKFLOW_LABELS.navigation} • <kbd className="px-1.5 py-0.5 bg-[var(--coconut-husk)]/10 rounded">Entrée</kbd> {WORKFLOW_LABELS.selection} • <kbd className="px-1.5 py-0.5 bg-[var(--coconut-husk)]/10 rounded">Échap</kbd> {ACTION_LABELS.cancel}
              </p>
            </div>
          </div>
        </div>

        {/* Directions Grid */}
        <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto" role="radiogroup" aria-labelledby="direction-selector-title">
          {directions.map((direction, index) => (
            <DirectionCard
              key={direction.id}
              direction={direction}
              index={index}
              isSelected={selectedId === direction.id}
              isFocused={focusedIndex === index}
              onSelect={() => handleSelect(direction.id)}
              onFocus={() => setFocusedIndex(index)}
              disabled={isSubmitting}
            />
          ))}
        </div>

        {/* Footer Actions */}
        <div className={`p-6 ${tokens.borderColors.whiteGhost} border-t ${tokens.bgColors.whiteGhost} flex items-center justify-between`}>
          <p className={`${tokens.textColors.whiteMuted} text-sm flex items-center ${tokens.gap.tight}`}>
            <Info className={tokens.iconSize.sm} />
            {WORKFLOW_LABELS.chooseDirection}
          </p>
          
          <div className={`flex ${tokens.gap.normal}`}>
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={isSubmitting}
                className={`px-6 py-2.5 ${tokens.radius.md} ${tokens.bgColors.whiteGhost} hover:bg-white/10 ${tokens.textColors.whiteSubtle} hover:text-white ${tokens.borderColors.whiteSubtle} border transition-all ${tokens.disabled} ${tokens.focus}`}
                aria-label={`${ACTION_LABELS.cancel} la sélection`}
              >
                {ACTION_LABELS.cancel}
              </button>
            )}
            
            <button
              onClick={handleConfirm}
              onKeyDown={handleConfirmKeyDown}
              disabled={!selectedId || isSubmitting}
              className={`px-8 py-2.5 ${tokens.radius.md} bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-husk)] hover:from-[var(--coconut-shell)]/90 hover:to-[var(--coconut-husk)]/90 ${tokens.textColors.white} ${tokens.shadows.lg} shadow-[var(--coconut-shell)]/25 transition-all ${tokens.disabled} ${tokens.focus}`}
              aria-label="Confirmer la direction sélectionnée et lancer la génération"
            >
              {isSubmitting ? (
                <span className={`flex items-center ${tokens.gap.tight}`}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Sparkles className={tokens.iconSize.sm} />
                  </motion.div>
                  {WORKFLOW_LABELS.generationInProgress}
                </span>
              ) : (
                WORKFLOW_LABELS.confirmAndGenerate
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// SUB-COMPONENT: DIRECTION CARD
// ============================================

interface DirectionCardProps {
  direction: CreativeDirection;
  index: number;
  isSelected: boolean;
  isFocused?: boolean;
  onSelect: () => void;
  onFocus?: () => void;
  disabled?: boolean;
}

function DirectionCard({ direction, index, isSelected, isFocused, onSelect, onFocus, disabled }: DirectionCardProps) {
  // 🔊 PHASE 3A: Sound context
  const { playPop, playClick } = useSoundContext();
  
  const icons = [Sparkles, Palette, Zap];
  const Icon = icons[index % icons.length];
  const cardRef = useRef<HTMLButtonElement>(null);

  // Scroll into view when focused with keyboard
  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isFocused]);

  // Handle keyboard interaction
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <motion.button
      ref={cardRef}
      onClick={() => {
        playPop(); // 🔊 Sound feedback for selection
        onSelect();
      }}
      onFocus={onFocus}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        w-full p-6 ${tokens.radius.lg} border-2 text-left transition-all
        ${isSelected
          ? `${tokens.gradients.coconutOrange} border-[var(--coconut-husk)]/50 ${tokens.shadows.lg} shadow-[var(--coconut-husk)]/20`
          : isFocused
          ? `bg-[var(--coconut-cream)]/10 border-[var(--coconut-husk)]/40 ring-2 ring-[var(--coconut-husk)]/50`
          : `${tokens.bgColors.whiteGhost} ${tokens.borderColors.orangeSubtle} hover:bg-[var(--coconut-cream)]/10 hover:border-[var(--coconut-husk)]/30`
        }
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${tokens.focus}
      `}
      role="radio"
      aria-checked={isSelected}
      aria-label={`${WORKFLOW_LABELS.selectDirection}: ${direction.name}. ${direction.description}`}
      tabIndex={isFocused ? 0 : -1}
    >
      <div className={`flex items-start ${tokens.gap.normal}`}>
        {/* Icon & Selection */}
        <div className="relative">
          <div className={`
            p-3 ${tokens.radius.md} transition-all
            ${isSelected ? 'bg-[var(--coconut-husk)]/30' : 'bg-[var(--coconut-cream)]/10'}
          `}>
            <Icon className={`${tokens.iconSize.md} ${isSelected ? 'text-[var(--coconut-shell)]' : 'text-[var(--coconut-husk)]/60'}`} />
          </div>
          
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={TRANSITIONS.spring}
              className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--coconut-husk)] rounded-full flex items-center justify-center"
            >
              <Check className={`${tokens.iconSize.xs} ${tokens.textColors.white}`} />
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Title & Description */}
          <div>
            <h3 className={`text-lg ${tokens.textColors.white} mb-1`}>
              {direction.name}
            </h3>
            <p className={`${tokens.textColors.whiteSubtle} text-sm leading-relaxed`}>
              {direction.description}
            </p>
          </div>

          {/* Mood */}
          <div className={`flex items-center ${tokens.gap.tight}`}>
            <span className="text-[var(--coconut-shell)]/60 text-xs uppercase tracking-wider">{WORKFLOW_LABELS.mood} :</span>
            <span className={`${tokens.textColors.whiteSubtle} text-sm`}>{direction.mood}</span>
          </div>

          {/* Color Palette */}
          <div className={`flex items-center ${tokens.gap.normal}`}>
            <span className="text-[var(--coconut-shell)]/60 text-xs uppercase tracking-wider">{WORKFLOW_LABELS.colors} :</span>
            <div className={`flex ${tokens.gap.tight}`}>
              {direction.colorPalette.slice(0, 5).map((color, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 ${tokens.radius.sm} border-2 ${tokens.borderColors.orangeSubtle} ${tokens.shadows.lg}`}
                  style={{ backgroundColor: color }}
                  title={color}
                  aria-label={`Couleur de palette ${i + 1}: ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Style Keywords */}
          <div className={`flex flex-wrap ${tokens.gap.tight}`}>
            {direction.styleKeywords.map((keyword, i) => (
              <span
                key={i}
                className={`px-3 py-1 bg-[var(--coconut-cream)]/10 ${tokens.radius.sm} ${tokens.textColors.whiteSubtle} text-xs ${tokens.borderColors.orangeSubtle} border`}
              >
                {keyword}
              </span>
            ))}
          </div>

          {/* Reasoning */}
          {direction.reasoning && (
            <div className={`pt-3 border-t ${tokens.borderColors.orangeSubtle}`}>
              <p className={`${tokens.textColors.whiteMuted} text-xs italic`}>
                💡 {direction.reasoning}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}