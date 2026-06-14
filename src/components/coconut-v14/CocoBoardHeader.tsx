/**
 * COCONUT V14 - COCOBOARD HEADER
 * Ultra-Premium Liquid Glass Navigation
 * 
 * ✅ FIXED: BDS Compliance
 * - Consistent spacing, radius, z-index
 * - Focus states for accessibility
 * - French messages
 * - Responsive layout
 * - Design tokens
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 2A: Import sound
import { ArrowLeft, Save, Download, Zap, Sparkles, AlertCircle, CheckCircle, Loader2, Share2, Eye } from 'lucide-react';
import { GenerationView } from './GenerationView';
import { GenerationConfirmModal } from './GenerationConfirmModal';
import { ExportCocoBoard } from './ExportCocoBoard';
import { ShareCocoBoard } from './ShareCocoBoard';
import type { CocoBoard } from '../../lib/types/coconut-v14';
import { tokens, TRANSITIONS } from '../../lib/design/tokens';
import { handleError, showSuccess } from '../../lib/utils/errorHandler';

interface CocoBoardHeaderProps {
  projectId: string;
  userId: string;
  board: CocoBoard;
}

export function CocoBoardHeader({ projectId, userId, board }: CocoBoardHeaderProps) {
  // 🔊 PHASE 2A: Sound context
  const { playClick, playSuccess, playPop } = useSoundContext();
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showGeneration, setShowGeneration] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Save CocoBoard
  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/coconut-v14/cocoboard/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          projectId,
          cocoboard: board,
          status: 'draft'
        })
      });

      if (!response.ok) {
        throw new Error('Échec de la sauvegarde');
      }

      const data = await response.json();

      if (data.success) {
        playSuccess(); // 🔊 Sound feedback for success
        setLastSaved(Date.now());
        setIsDirty(false);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
        
        showSuccess('CocoBoard sauvegardé', 'Toutes vos modifications sont enregistrées');
      } else {
        throw new Error(data.error || 'Échec de la sauvegarde');
      }
    } catch (err) {
      handleError(err, 'CocoBoard Save', {
        toast: true,
        action: {
          label: 'Réessayer',
          onClick: () => handleSave()
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Validate CocoBoard
  const handleValidate = async (): Promise<boolean> => {
    setValidationErrors([]);

    try {
      const errors: string[] = [];

      if (!board.finalPrompt) {
        errors.push('Le prompt créatif n\'a pas été généré');
      }

      if (!board.specs.ratio || !board.specs.resolution) {
        errors.push('Les spécifications techniques sont incomplètes (ratio ou résolution manquante)');
      }

      if (board.references.length > 8) {
        errors.push('Maximum 8 références autorisées');
      }

      if (errors.length > 0) {
        setValidationErrors(errors);
        return false;
      }

      return true;
    } catch (err) {
      handleError(err, 'CocoBoard Validation');
      return false;
    }
  };

  // Start generation
  const handleGenerate = async () => {
    // Validate first
    const isValid = await handleValidate();
    
    if (!isValid) {
      handleError(
        new Error('Validation échouée'),
        'CocoBoard Generate',
        {
          toast: true,
          showDetails: true,
          action: {
            label: 'Voir détails',
            onClick: () => {
              // Show validation details
              console.log('Validation errors:', validationErrors);
            }
          }
        }
      );
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmGenerate = () => {
    setShowConfirmModal(false);
    setShowGeneration(true);
    setIsGenerating(true);
  };

  return (
    <>
      {/* Premium Glass Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-30 backdrop-blur-xl border-b bg-gradient-to-b from-white/80 to-white/60 border-white/40 shadow-lg"
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4">
            {/* Left: Back Button + Title */}
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className={`p-2 sm:p-2.5 ${tokens.radius.md} ${tokens.colors.surface.glass} ${tokens.colors.border.base} border hover:border-[var(--coconut-shell)]/40 transition-all ${tokens.focus} flex-shrink-0`}
                aria-label="Retour"
              >
                <ArrowLeft className={`w-4 h-4 sm:w-5 sm:h-5 ${tokens.colors.text.primary}`} />
              </motion.button>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg md:text-xl ${tokens.colors.text.primary} font-semibold truncate">
                  {board.analysis.projectTitle || 'CocoBoard'}
                </h1>
                <AnimatePresence>
                  {lastSaved && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs ${tokens.colors.text.secondary} hidden sm:block"
                    >
                      Sauvegardé il y a {Math.round((Date.now() - lastSaved) / 1000)}s
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
              {/* Validation Errors */}
              <AnimatePresence>
                {validationErrors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={TRANSITIONS.fast}
                    className={`px-4 py-2 ${tokens.radius.md} text-sm backdrop-blur-xl border bg-[var(--coconut-shell)]/10 text-[var(--coconut-shell)] border-[var(--coconut-shell)]/40`}
                  >
                    ⚠️ {validationErrors.length} erreur{validationErrors.length > 1 ? 's' : ''}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Desktop: All buttons */}
              <div className="hidden sm:flex items-center gap-3">
                {/* Export Button */}
                <ExportCocoBoard 
                  board={board}
                  projectTitle={board.analysis.projectTitle}
                />

                {/* Share Button */}
                <ShareCocoBoard
                  boardId={board.id}
                  projectTitle={board.analysis.projectTitle}
                />

                {/* Save Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isSaving || !isDirty}
                  className={`px-4 py-2 ${tokens.colors.surface.glass} ${tokens.radius.md} flex items-center ${tokens.gap.tight} ${tokens.colors.border.base} border shadow-lg transition-all duration-300 ${tokens.disabled} ${tokens.focus}`}
                  aria-label="Sauvegarder"
                  aria-busy={isSaving}
                >
                  {justSaved ? (
                    <CheckCircle className={`${tokens.iconSize.sm} text-[var(--coconut-palm)]`} />
                  ) : isSaving ? (
                    <Loader2 className={`${tokens.iconSize.sm} ${tokens.colors.text.primary} animate-spin`} />
                  ) : (
                    <Save className={`${tokens.iconSize.sm} ${tokens.colors.text.primary}`} />
                  )}
                  <span className={`text-sm ${tokens.colors.text.primary}`}>
                    {justSaved ? 'Sauvegardé' : 'Sauvegarder'}
                  </span>
                </motion.button>
              </div>

              {/* Generate Button - Always visible */}
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`relative group overflow-hidden ${tokens.disabled} ${tokens.focus}`}
                aria-label="Générer l'image"
                aria-busy={isGenerating}
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-husk)] to-[var(--coconut-shell)] bg-[length:200%_100%] animate-gradient" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                {/* Content */}
                <div className={`relative px-6 py-2.5 flex items-center ${tokens.gap.tight} ${tokens.radius.md}`}>
                  {isGenerating ? (
                    <Loader2 className={`${tokens.iconSize.md} text-white animate-spin`} />
                  ) : (
                    <Zap className={`${tokens.iconSize.md} text-white`} />
                  )}
                  <span className="text-white">
                    {isGenerating ? 'Génération...' : 'Générer'}
                  </span>
                  <div className="text-xs text-white/80">{board.cost.total} ⭐</div>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Generation Confirm Modal */}
      <GenerationConfirmModal
        board={board}
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmGenerate}
        isGenerating={isGenerating}
      />

      {/* Generation Modal */}
      <AnimatePresence>
        {showGeneration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={TRANSITIONS.fast}
            className={`fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${tokens.zIndex.modal}`}
            onClick={() => !isGenerating && setShowGeneration(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ 
                ...TRANSITIONS.medium,
                delay: 0.1, // Stagger after backdrop
              }}
              className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/90 backdrop-blur-[60px] ${tokens.radius.lg} shadow-2xl border border-white/60`}
              onClick={(e) => e.stopPropagation()}
            >
              <GenerationView
                cocoBoardId={board.id}
                onComplete={(result) => {
                  setIsGenerating(false);
                  setShowGeneration(false);
                }}
                onCancel={() => {
                  setIsGenerating(false);
                  setShowGeneration(false);
                }}
                onError={(error) => {
                  setIsGenerating(false);
                  handleError(error, 'Generation');
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}