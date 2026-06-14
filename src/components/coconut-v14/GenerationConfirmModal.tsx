/**
 * GENERATION CONFIRM MODAL
 * P0-03 & P0-04: Confirmation avant génération + Preview du prompt
 * 
 * Affiche:
 * - Le coût total détaillé
 * - Le prompt final nettoyé
 * - Checkbox de confirmation obligatoire
 * 
 * ✅ ENHANCED: Escape key support, better accessibility, clearer warnings
 * ✨ PHASE 4 - SESSION 15: SOUND INTEGRATION
 * - Pattern: playClick (buttons), playSuccess (confirm), playPop (expand)
 * ♿ PHASE 6: ACCESSIBILITY COMPLETE
 * - Focus trap implemented
 * - ARIA live announcements
 * - Full keyboard navigation
 * 📱 PHASE 8: Responsive
 * - Mobile detection and layout adjustments
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, Zap, Eye, CheckCircle2, Copy, Check } from 'lucide-react';
import type { CocoBoard } from '../../lib/types/coconut-v14';
import { useSoundContext } from './SoundProvider';
import tokens from '../../lib/styles/tokens'; // Default import
import { useFocusTrap } from '../../lib/hooks/useFocusTrap';
import { useAriaLive } from '../../lib/hooks/useAriaLive';
import { useIsMobile } from '../../lib/hooks/useMediaQuery'; // 📱 PHASE 8: Responsive

interface GenerationConfirmModalProps {
  board: CocoBoard;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isGenerating?: boolean;
  userCredits?: number; // ✅ NEW: Show remaining credits after generation
}

export function GenerationConfirmModal({
  board,
  isOpen,
  onClose,
  onConfirm,
  isGenerating = false,
  userCredits = 0 // ✅ NEW
}: GenerationConfirmModalProps) {
  const { playClick, playSuccess, playPop } = useSoundContext();
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // ✅ NEW: Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isGenerating) {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isGenerating]);

  // ✅ NEW: Calculate remaining credits
  const remainingCredits = userCredits - board.cost.total;
  const hasEnoughCredits = remainingCredits >= 0;

  const handleCopyPrompt = async () => {
    playClick();
    try {
      await navigator.clipboard.writeText(board.finalPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleConfirm = () => {
    if (!hasConfirmed || !hasEnoughCredits) return;
    playSuccess();
    onConfirm();
  };

  const handleClose = () => {
    if (isGenerating) return; // Cannot close during generation
    playClick();
    setHasConfirmed(false);
    setPromptExpanded(false);
    onClose();
  };
  
  const handleTogglePrompt = () => {
    playPop();
    setPromptExpanded(!promptExpanded);
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    playClick();
    setHasConfirmed(e.target.checked);
  };

  // ♿ PHASE 6: ACCESSIBILITY COMPLETE
  const focusRef = useFocusTrap();
  const announceRef = useAriaLive();

  // 📱 PHASE 8: Responsive
  const isMobile = useIsMobile();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[200] flex items-center justify-center p-4 ${tokens.glass.modalBackdropStrong}`}
          onClick={handleClose}
          role="dialog"
          aria-labelledby="confirm-modal-title"
          aria-describedby="confirm-modal-description"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-3xl max-h-[90vh] overflow-hidden ${tokens.glass.modalContainer} ${tokens.radius.lg} ${tokens.glass.glowShell}`}
            onClick={(e) => e.stopPropagation()}
            ref={focusRef}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[var(--coconut-husk)] to-[var(--coconut-shell)] p-6 border-b border-[var(--coconut-husk)]/30">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 id="confirm-modal-title" className="text-2xl font-bold text-white mb-1">
                    Confirmer la génération
                  </h2>
                  <p id="confirm-modal-description" className="text-white/80 text-sm">
                    Vérifiez les détails avant de lancer la génération ({board.cost.total} crédits)
                  </p>
                </div>
                
                {!isGenerating && (
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Fermer (Échap)"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
              {/* ✅ NEW: Credits Warning Banner (if low) */}
              {userCredits > 0 && (
                <div className={`rounded-2xl p-6 border-2 ${
                  hasEnoughCredits
                    ? 'bg-[var(--coconut-palm)]/10 border-[var(--coconut-palm)]/30'
                    : 'bg-[var(--coconut-shell)]/10 border-[var(--coconut-shell)]/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${hasEnoughCredits ? 'text-[var(--coconut-palm)]' : 'text-[var(--coconut-shell)]'}`}>
                        {hasEnoughCredits ? '✅ Crédits suffisants' : '❌ Crédits insuffisants'}
                      </p>
                      <p className={`text-xs mt-1 ${hasEnoughCredits ? 'text-[var(--coconut-palm)]' : 'text-[var(--coconut-shell)]'}`}>
                        Solde actuel: <strong>{userCredits} crédits</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs ${hasEnoughCredits ? 'text-[var(--coconut-palm)]' : 'text-[var(--coconut-shell)]'}`}>
                        Après génération
                      </p>
                      <p className={`text-2xl font-bold ${hasEnoughCredits ? 'text-[var(--coconut-palm)]' : 'text-[var(--coconut-shell)]'}`}>
                        {remainingCredits} crédits
                      </p>
                    </div>
                  </div>
                  
                  {!hasEnoughCredits && (
                    <div className="mt-4 pt-4 border-t border-[var(--coconut-shell)]/20">
                      <p className="text-sm text-[var(--coconut-shell)]">
                        Il vous manque <strong>{Math.abs(remainingCredits)} crédits</strong>.{' '}
                        <a href="/coconut-v14/credits" className="underline hover:no-underline">
                          Acheter des crédits
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Cost Breakdown */}
              <div className="bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)] rounded-2xl p-6 border border-[var(--coconut-husk)]/20">
                <h3 className="text-lg text-[var(--coconut-shell)] mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[var(--coconut-husk)]" />
                  Détail des Coûts
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-[var(--coconut-husk)]/20">
                    <span className="text-sm text-[var(--coconut-husk)]">🧠 Analyse AI (Gemini)</span>
                    <span className="text-[var(--coconut-shell)] font-medium">{board.cost.analysis} crédits</span>
                  </div>
                  
                  {board.cost.backgroundGeneration > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-[var(--coconut-husk)]/20">
                      <span className="text-sm text-[var(--coconut-husk)]">🎨 Génération arrière-plan</span>
                      <span className="text-[var(--coconut-shell)] font-medium">{board.cost.backgroundGeneration} crédits</span>
                    </div>
                  )}
                  
                  {board.cost.assetGeneration > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-[var(--coconut-husk)]/20">
                      <span className="text-sm text-[var(--coconut-husk)]">🖼️ Génération assets</span>
                      <span className="text-[var(--coconut-shell)] font-medium">{board.cost.assetGeneration} crédits</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between py-2 border-b border-[var(--coconut-husk)]/20">
                    <span className="text-sm text-[var(--coconut-husk)]">⚡ Génération finale (Flux 2 Pro)</span>
                    <span className="text-[var(--coconut-shell)] font-medium">{board.cost.finalGeneration} crédits</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t-2 border-[var(--coconut-husk)]/30">
                    <span className="text-lg text-[var(--coconut-shell)] font-semibold">Total</span>
                    <span className="text-3xl text-[var(--coconut-shell)] font-bold">{board.cost.total} ⭐</span>
                  </div>
                </div>
              </div>

              {/* Prompt Preview */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg text-slate-900 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-slate-600" />
                    Prompt Final
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyPrompt}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2 text-sm text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                      aria-label="Copier le prompt"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-[var(--coconut-palm)]" />
                          <span className="text-[var(--coconut-palm)]">Copié!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleTogglePrompt}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                      {promptExpanded ? 'Réduire' : 'Voir tout'}
                    </button>
                  </div>
                </div>
                
                <div className={`bg-slate-900 rounded-xl p-4 overflow-auto ${
                  promptExpanded ? 'max-h-96' : 'max-h-32'
                } transition-all`}>
                  <pre className="text-sm text-slate-100 whitespace-pre-wrap break-words font-mono">
                    {board.finalPrompt}
                  </pre>
                </div>

                <div className="mt-3 p-3 bg-[var(--coconut-cream)] rounded-lg border border-[var(--coconut-husk)]/20">
                  <p className="text-xs text-[var(--coconut-husk)]">
                    💡 <strong>Astuce:</strong> Ce prompt a été optimisé automatiquement par notre AI pour garantir 
                    un résultat professionnel avec Flux 2 Pro.
                  </p>
                </div>
              </div>

              {/* Specs Summary */}
              <div className="bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)] rounded-2xl p-6 border border-[var(--coconut-husk)]/20">
                <h3 className="text-lg text-[var(--coconut-shell)] mb-4">Spécifications Techniques</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[var(--coconut-husk)] mb-1">Modèle</p>
                    <p className="text-sm text-[var(--coconut-shell)] font-medium">{board.specs.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--coconut-husk)] mb-1">Mode</p>
                    <p className="text-sm text-[var(--coconut-shell)] font-medium">{board.specs.mode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--coconut-husk)] mb-1">Format</p>
                    <p className="text-sm text-[var(--coconut-shell)] font-medium">{board.specs.ratio}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--coconut-husk)] mb-1">Résolution</p>
                    <p className="text-sm text-[var(--coconut-shell)] font-medium">{board.specs.resolution}</p>
                  </div>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div className="bg-gradient-to-br from-[var(--coconut-palm)]/10 to-[var(--coconut-palm)]/5 rounded-2xl p-6 border-2 border-[var(--coconut-palm)]/30">
                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={hasConfirmed}
                      onChange={handleCheckboxChange}
                      disabled={isGenerating || !hasEnoughCredits}
                      className="w-6 h-6 rounded-lg border-2 border-[var(--coconut-palm)] text-[var(--coconut-palm)] focus:ring-2 focus:ring-[var(--coconut-palm)] focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Confirmer que j'ai vérifié et accepte de dépenser les crédits"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[var(--coconut-shell)] group-hover:text-[var(--coconut-husk)] transition-colors">
                      J'ai vérifié le prompt et je confirme vouloir dépenser{' '}
                      <strong className="text-[var(--coconut-palm)]">{board.cost.total} crédits</strong>{' '}
                      pour générer cette image professionnelle.
                    </p>
                    <p className="text-xs text-[var(--coconut-palm)] mt-1">
                      ⚠️ Cette action est irréversible - les crédits seront déduits immédiatement
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-[var(--coconut-husk)]/20 p-6">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handleClose}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  Annuler
                </button>
                
                <button
                  onClick={handleConfirm}
                  disabled={!hasConfirmed || isGenerating || !hasEnoughCredits}
                  className="relative group overflow-hidden px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-[var(--coconut-palm)]"
                >
                  {/* Gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-palm)] to-[var(--coconut-palm)] group-hover:from-[var(--coconut-palm)]/90 group-hover:to-[var(--coconut-palm)]/90 transition-all" />
                  
                  {/* Content */}
                  <div className="relative flex items-center gap-2 text-white font-medium">
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="w-5 h-5" />
                        </motion.div>
                        <span>Génération en cours...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Confirmer et Générer ({board.cost.total} crédits)</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}