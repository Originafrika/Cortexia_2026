/**
 * SpecsInputModal - User Input Modal for Product Specs
 * 
 * ✅ FIXED: BDS Compliance Phase 2B
 * - Design tokens integration
 * - French labels
 * - Icon sizing standardized
 * - Focus states
 * - Error handler
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 3A: Import sound
import { X, Sparkles, CheckCircle2, ArrowRight, Zap, Package } from 'lucide-react';
import { GlassCard } from '../ui/glass-card';
import { tokens, TRANSITIONS } from '../../lib/design/tokens';

interface SpecsInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (specs: string) => void;
  productName: string;
  prompt: string;
  suggestions: string[];
}

export function SpecsInputModal({
  isOpen,
  onClose,
  onSubmit,
  productName,
  prompt,
  suggestions,
}: SpecsInputModalProps) {
  // 🔊 PHASE 3A: Sound context
  const { playClick, playPop, playSuccess } = useSoundContext();
  
  const [specs, setSpecs] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ NEW: Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        playClick(); // 🔊 Sound feedback
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isSubmitting, onClose, playClick]);

  const handleSubmit = async () => {
    const finalSpecs = specs || selectedSuggestion || '';
    if (finalSpecs.trim() && !isSubmitting) {
      playSuccess(); // 🔊 Sound feedback for success
      setIsSubmitting(true);
      onSubmit(finalSpecs);
      // onClose is called by parent after successful submit
      
      // Reset after 1s
      setTimeout(() => {
        setIsSubmitting(false);
        setSpecs('');
        setSelectedSuggestion(null);
      }, 1000);
    }
  };

  const handleSkip = () => {
    playClick(); // 🔊 Sound feedback
    // Use first suggestion as default
    onSubmit(suggestions[0] || 'Produit Premium | Haute Qualité | Fabriqué avec Soin');
    onClose();
  };

  const handleSuggestionClick = (suggestion: string) => {
    playPop(); // 🔊 Sound feedback for selection
    setSelectedSuggestion(suggestion);
    setSpecs(suggestion);
  };
  
  // ✅ ENHANCED: Handle Enter key to submit (Cmd/Ctrl+Enter or just Enter in textarea)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 🥥 Coconut-themed backdrop with warm blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[var(--coconut-shell)]/40 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-labelledby="specs-modal-title"
            aria-describedby="specs-modal-description"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl mx-4 sm:mx-0 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="overflow-hidden shadow-2xl" variant="light" blur="xl">
                
                {/* 🥥 Premium Header - Coconut Gradient */}
                <div className="relative bg-gradient-to-br from-[var(--coconut-shell)] via-[var(--coconut-husk)] to-[var(--coconut-palm)] px-4 sm:px-8 py-5 sm:py-6 text-white overflow-hidden">
                  {/* Animated tropical pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_60%)]" />
                  </div>
                  
                  {/* Close button */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 hover:bg-white/20 hover:text-white transition-colors z-10"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                  
                  <div className="relative flex items-start gap-3 sm:gap-4">
                    {/* Icon */}
                    <motion.div
                      initial={{ rotate: -10 }}
                      animate={{ rotate: 0 }}
                      transition={{ type: 'spring', damping: 10 }}
                      className="p-2 sm:p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/20 flex-shrink-0"
                    >
                      <Package className="w-6 h-6 sm:w-7 sm:h-7" />
                    </motion.div>
                    
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2"
                      >
                        Spécifications Produit
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-white/95"
                      >
                        Pour une publicité optimale, confirmons les caractéristiques de{' '}
                        <span className="font-bold text-[var(--coconut-husk)]">{productName}</span>
                      </motion.p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="px-8 py-6 space-y-6 bg-gradient-to-br from-[var(--coconut-white)] to-[var(--coconut-cream)]">
                  
                  {/* Question */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-[var(--coconut-shell)] font-semibold mb-2">
                      {prompt}
                    </label>
                    <p className="text-sm text-[var(--coconut-shell)]/70 mb-4">
                      Entrez 3-4 caractéristiques clés séparées par des " | " 
                      <span className="ml-2 text-xs text-[var(--coconut-shell)]/50">
                        (⌘/Ctrl + Enter pour valider)
                      </span>
                    </p>
                    
                    <textarea
                      value={specs}
                      onChange={(e) => {
                        setSpecs(e.target.value);
                        setSelectedSuggestion(null);
                      }}
                      placeholder="100% Naturel | Sans Additifs | Origine Contrôlée"
                      className="w-full px-5 py-4 bg-white/70 backdrop-blur-sm border-2 border-[var(--coconut-husk)]/30 rounded-2xl focus:border-[var(--coconut-palm)] focus:ring-4 focus:ring-[var(--coconut-palm)]/20 outline-none transition-all resize-none text-[var(--coconut-shell)] placeholder:text-[var(--coconut-husk)]"
                      rows={3}
                      autoFocus
                      onKeyDown={handleKeyDown}
                    />
                  </motion.div>

                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <p className="text-sm font-semibold text-[var(--coconut-shell)] mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[var(--coconut-husk)]" />
                        Suggestions intelligentes
                      </p>
                      <div className="space-y-2">
                        {suggestions.map((suggestion, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`group w-full px-5 py-4 text-left rounded-2xl border-2 transition-all ${
                              selectedSuggestion === suggestion || specs === suggestion
                                ? 'border-[var(--coconut-palm)] bg-[var(--coconut-palm)]/10 backdrop-blur-sm shadow-lg shadow-[var(--coconut-palm)]/20'
                                : 'border-[var(--coconut-husk)]/30 bg-white/60 backdrop-blur-sm hover:border-[var(--coconut-palm)]/60 hover:bg-[var(--coconut-palm)]/5 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium transition-colors ${
                                selectedSuggestion === suggestion || specs === suggestion
                                  ? 'text-[var(--coconut-shell)]'
                                  : 'text-[var(--coconut-shell)]/80 group-hover:text-[var(--coconut-shell)]'
                              }`}>
                                {suggestion}
                              </span>
                              {(selectedSuggestion === suggestion || specs === suggestion) && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', damping: 15 }}
                                >
                                  <CheckCircle2 className="w-5 h-5 text-[var(--coconut-shell)]" />
                                </motion.div>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Info Box - Coconut themed */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-gradient-to-br from-[var(--coconut-cream)]/50 to-[var(--coconut-milk)]/30 border border-[var(--coconut-husk)]/20 rounded-2xl p-5 backdrop-blur-sm"
                  >
                    <p className="text-sm text-[var(--coconut-shell)] leading-relaxed">
                      <strong className="font-semibold text-[var(--coconut-shell)]">✨ Pourquoi c'est important :</strong>{' '}
                      Les specs précises garantissent que votre publicité communique exactement les bons 
                      arguments de vente. Coconut V14 utilisera ces informations pour créer un visuel 
                      professionnel et ultra-convaincant.
                    </p>
                  </motion.div>

                </div>

                {/* Footer - Coconut gradient */}
                <div className="bg-gradient-to-br from-[var(--coconut-milk)] to-[var(--coconut-cream)] px-8 py-5 flex items-center justify-between gap-4 border-t border-[var(--coconut-husk)]/20">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSkip}
                    className="px-6 py-2.5 text-[var(--coconut-shell)]/70 hover:text-[var(--coconut-shell)] font-medium rounded-xl hover:bg-white/60 transition-all"
                  >
                    Utiliser suggestion par défaut
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={(!specs.trim() && !selectedSuggestion) || isSubmitting}
                    className="group relative px-8 py-3 bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-husk)] to-[var(--coconut-palm)] text-white font-semibold rounded-xl shadow-lg shadow-[var(--coconut-shell)]/30 hover:shadow-xl hover:shadow-[var(--coconut-shell)]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none overflow-hidden"
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                    
                    <span className="relative flex items-center gap-2">
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Sparkles className="w-5 h-5" />
                          </motion.div>
                          Validation...
                        </>
                      ) : (
                        <>
                          Continuer avec ces specs
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </motion.button>
                </div>

              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}