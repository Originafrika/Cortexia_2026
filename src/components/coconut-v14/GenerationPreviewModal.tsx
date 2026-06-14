/**
 * COCONUT V14 - GENERATION PREVIEW MODAL
 * Ultra-Premium Liquid Glass Design
 * 
 * 🎯 PHASE 3D: Modal de preview pour mode Semi-Auto
 * - Affiche récap complet avant génération
 * - Permet validation ou retour
 * - Affiche coût estimé
 * 
 * BDS Compliance: 7 Arts de Perfection Divine
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 3A: Import sound
import { X, Sparkles, Image as ImageIcon, Palette, Zap, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { tokens, TRANSITIONS } from '../../lib/design/tokens';
import type { CocoBoard } from '../../lib/types/cocoboard';

// ============================================
// TYPES
// ============================================

interface GenerationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  board: CocoBoard;
  isGenerating?: boolean;
  userCredits?: number;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function GenerationPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  board,
  isGenerating = false,
  userCredits, // ✅ No default, must be passed from parent
}: GenerationPreviewModalProps) {
  // 🔊 PHASE 3A: Sound context
  const { playClick, playSuccess } = useSoundContext();
  
  const canAfford = userCredits >= board.cost.total;
  
  const handleClose = () => {
    playClick(); // 🔊 Sound feedback
    onClose();
  };
  
  const handleConfirm = () => {
    if (canAfford && !isGenerating) {
      playSuccess(); // 🔊 Sound feedback for generation start
      onConfirm();
    }
  };
  
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={TRANSITIONS.fast}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={TRANSITIONS.medium}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto relative w-full max-w-3xl max-h-[90vh] overflow-hidden"
            >
              {/* Glass Card */}
              <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
                
                {/* Header */}
                <div className="relative bg-gradient-to-br from-[var(--coconut-shell)]/10 to-[var(--coconut-husk)]/10 border-b border-white/60 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-xl flex items-center justify-center backdrop-blur-xl border border-[var(--coconut-husk)]/40">
                        <Sparkles className="w-6 h-6 text-[var(--coconut-shell)]" />
                      </div>
                      <div>
                        <h2 className="text-2xl text-[var(--coconut-shell)]">
                          Preview de génération
                        </h2>
                        <p className="text-sm text-[var(--coconut-shell)]/70">
                          Vérifiez avant de lancer la création
                        </p>
                      </div>
                    </div>
                    
                    {/* Close button */}
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleClose}
                      disabled={isGenerating}
                      className="w-10 h-10 rounded-full bg-white/60 hover:bg-white/80 flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      <X className="w-5 h-5 text-slate-600" />
                    </motion.button>
                  </div>
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6">
                  
                  {/* Project Info */}
                  <div className="space-y-3">
                    <h3 className="text-lg text-[var(--coconut-shell)] flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-[var(--coconut-shell)]" />
                      Projet
                    </h3>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--coconut-cream)]/80 to-[var(--coconut-milk)]/80 border border-[var(--coconut-husk)]/40">
                      <p className="text-base text-[var(--coconut-shell)]">{board.analysis.projectTitle}</p>
                      {board.analysis.concept?.direction && (
                        <p className="text-sm text-[var(--coconut-husk)] mt-2">
                          Direction: {board.analysis.concept.direction}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Technical Specs */}
                  <div className="space-y-3">
                    <h3 className="text-lg text-[var(--coconut-shell)] flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[var(--coconut-husk)]" />
                      Spécifications techniques
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--coconut-husk)]/20 to-[var(--coconut-sunset)]/20 border border-[var(--coconut-husk)]/40">
                        <p className="text-xs text-[var(--coconut-husk)] mb-1">Modèle</p>
                        <p className="text-sm text-[var(--coconut-shell)]">{board.specs.model}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--coconut-husk)]/20 to-[var(--coconut-sunset)]/20 border border-[var(--coconut-husk)]/40">
                        <p className="text-xs text-[var(--coconut-husk)] mb-1">Mode</p>
                        <p className="text-sm text-[var(--coconut-shell)]">{board.specs.mode}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--coconut-husk)]/20 to-[var(--coconut-sunset)]/20 border border-[var(--coconut-husk)]/40">
                        <p className="text-xs text-[var(--coconut-husk)] mb-1">Ratio</p>
                        <p className="text-sm text-[var(--coconut-shell)]">{board.specs.ratio}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--coconut-husk)]/20 to-[var(--coconut-sunset)]/20 border border-[var(--coconut-husk)]/40">
                        <p className="text-xs text-[var(--coconut-husk)] mb-1">Résolution</p>
                        <p className="text-sm text-[var(--coconut-shell)]">{board.specs.resolution}</p>
                      </div>
                    </div>
                  </div>

                  {/* Prompt Preview */}
                  <div className="space-y-3">
                    <h3 className="text-lg text-[var(--coconut-shell)] flex items-center gap-2">
                      <Palette className="w-5 h-5 text-[var(--coconut-shell)]" />
                      Prompt de génération
                    </h3>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--coconut-shell)]/10 to-[var(--coconut-husk)]/10 border border-[var(--coconut-husk)]/40 max-h-40 overflow-y-auto">
                      <p className="text-sm text-[var(--coconut-shell)] whitespace-pre-wrap font-mono">
                        {typeof board.finalPrompt === 'string' 
                          ? board.finalPrompt 
                          : board.finalPrompt?.scene || 'Aucun prompt défini'}
                      </p>
                    </div>
                  </div>

                  {/* References */}
                  {board.references && board.references.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg text-[var(--coconut-shell)] flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-[var(--coconut-shell)]" />
                        Références ({board.references.length})
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                        {board.references.slice(0, 8).map((ref, idx) => (
                          <div 
                            key={idx}
                            className="aspect-square rounded-lg bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-cream)]/60 border border-[var(--coconut-shell)]/40 flex items-center justify-center overflow-hidden"
                          >
                            {ref.url ? (
                              <img src={ref.url} alt={ref.description} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-[var(--coconut-shell)]" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cost Summary */}
                  <div className="space-y-3">
                    <h3 className="text-lg text-[var(--coconut-shell)] flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-amber-600" />
                      Coût estimé
                    </h3>
                    <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50/80 to-yellow-50/80 border border-amber-200/60">
                      <div className="flex items-baseline justify-between mb-3">
                        <span className="text-sm text-amber-700">Total</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl text-amber-900">{board.cost.total}</span>
                          <span className="text-sm text-amber-700">crédits</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-amber-700">Vos crédits</span>
                        <span className={`${canAfford ? 'text-[var(--coconut-husk)]' : 'text-[var(--coconut-shell)]'}`}>
                          {userCredits} crédits
                        </span>
                      </div>
                      {!canAfford && (
                        <div className="mt-3 p-3 rounded-lg bg-[var(--coconut-cream)]/60 border border-[var(--coconut-husk)]/30 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-[var(--coconut-shell)] mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-[var(--coconut-shell)]">
                            Crédits insuffisants. Besoin de {board.cost.total - userCredits} crédits supplémentaires.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Footer Actions */}
                <div className="border-t border-white/60 p-6 bg-gradient-to-br from-slate-50/80 to-slate-100/80">
                  <div className="flex items-center justify-between gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClose}
                      disabled={isGenerating}
                      className="px-6 py-3 rounded-xl bg-white/80 hover:bg-white border border-slate-200 text-slate-700 transition-all disabled:opacity-50"
                    >
                      Retour
                    </motion.button>

                    <motion.button
                      whileHover={canAfford && !isGenerating ? { scale: 1.02 } : {}}
                      whileTap={canAfford && !isGenerating ? { scale: 0.98 } : {}}
                      onClick={handleConfirm}
                      disabled={!canAfford || isGenerating}
                      className={`
                        flex items-center gap-2 px-8 py-3 rounded-xl shadow-lg transition-all
                        ${canAfford && !isGenerating
                          ? 'bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-husk)] text-white hover:shadow-xl'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }
                      `}
                    >
                      {isGenerating ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Sparkles className="w-5 h-5" />
                          </motion.div>
                          <span>Génération en cours...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Confirmer et générer</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}