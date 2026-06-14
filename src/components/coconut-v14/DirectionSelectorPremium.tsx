/**
 * DIRECTION SELECTOR ULTRA-PREMIUM - Choix de la direction créative
 * Étape 3 du workflow: Analyzing → Direction Selector → Analysis View
 * 
 * Premium Features:
 * - Hero section avec résumé de l'analyse
 * - Layout asymétrique (Featured + Grid)
 * - Preview cards avec mood/palette/keywords
 * - Comparaison visuelle premium
 * - Palette Coconut Warm exclusive
 * - Animations sophistiquées
 * - BDS 7 Arts compliance
 * - Score cible: 98%+
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider';
import { 
  Sparkles,
  Palette,
  Eye,
  Zap,
  CheckCircle,
  Info,
  ArrowRight,
  RefreshCw,
  Edit,
  ChevronRight
} from 'lucide-react';
import type { GeminiAnalysisResponse } from '../../lib/types/gemini';

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

interface DirectionSelectorPremiumProps {
  analysis: GeminiAnalysisResponse;
  availableDirections: CreativeDirection[];
  onDirectionSelect: (directionId: string) => void;
  onEdit?: () => void;
  onReanalyze?: () => void;
  userCredits?: number;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function DirectionSelectorPremium({
  analysis,
  availableDirections,
  onDirectionSelect,
  onEdit,
  onReanalyze,
  userCredits, // ✅ No default, must be passed from parent
}: DirectionSelectorPremiumProps) {
  const { playClick, playSuccess, playWhoosh } = useSoundContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSelect = (directionId: string) => {
    playClick();
    setSelectedId(directionId);
  };

  const handleConfirm = () => {
    if (selectedId) {
      playSuccess();
      playWhoosh();
      onDirectionSelect(selectedId);
    }
  };

  // Get recommended direction (first one)
  const recommendedDirection = availableDirections[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] relative overflow-hidden">
      
      {/* Premium ambient lights */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,165,116,0.12)_0%,transparent_40%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(249,115,22,0.08)_0%,transparent_40%)]" />
      
      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          {/* Step indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/40">
            <Sparkles className="w-4 h-4 text-[var(--coconut-shell)]" />
            <span className="text-sm font-medium text-[var(--coconut-shell)]">Phase 3 • Direction créative</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-palm)] to-[var(--coconut-shell)] bg-clip-text text-transparent">
            Choisissez votre direction créative
          </h1>

          {/* Subtitle with analysis summary */}
          <p className="text-lg text-[var(--coconut-husk)] max-w-3xl">
            Gemini a analysé votre projet et généré <span className="font-semibold text-[var(--coconut-shell)]">{availableDirections.length} directions créatives</span> optimisées. 
            Sélectionnez celle qui correspond le mieux à votre vision.
          </p>

          {/* Quick actions */}
          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                onClick={() => {
                  playClick();
                  onEdit();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 border border-white/40 text-[var(--coconut-husk)] hover:bg-white/80 hover:text-[var(--coconut-shell)] transition-all text-sm"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier l'intent</span>
              </button>
            )}
            {onReanalyze && (
              <button
                onClick={() => {
                  playClick();
                  onReanalyze();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 border border-white/40 text-[var(--coconut-husk)] hover:bg-white/80 hover:text-[var(--coconut-shell)] transition-all text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Ré-analyser</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Analysis Summary Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl p-6 border border-cyan-100"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-cyan-700 mb-2">Résumé de l'analyse Gemini</h3>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-cyan-600 mb-1">Concept détecté</p>
                  <p className="font-medium text-cyan-700">{analysis.concept?.direction || 'Créatif'}</p>
                </div>
                <div>
                  <p className="text-xs text-cyan-600 mb-1">Esthétique</p>
                  <p className="font-medium text-cyan-700">{analysis.referenceAnalysis?.detectedStyle?.aesthetic || 'Moderne'}</p>
                </div>
                <div>
                  <p className="text-xs text-cyan-600 mb-1">Mood global</p>
                  <p className="font-medium text-cyan-700">{analysis.concept?.mood || 'Inspirant'}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FEATURED DIRECTION (Recommended) */}
        {recommendedDirection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-[var(--coconut-shell)]">Recommandé par l'IA</span>
            </div>

            <FeaturedDirectionCard
              direction={recommendedDirection}
              isSelected={selectedId === recommendedDirection.id}
              onSelect={() => handleSelect(recommendedDirection.id)}
              onHover={() => setHoveredId(recommendedDirection.id)}
              onLeave={() => setHoveredId(null)}
            />
          </motion.div>
        )}

        {/* OTHER DIRECTIONS GRID */}
        {availableDirections.length > 1 && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[var(--coconut-shell)]">
                Autres directions créatives
              </h2>
              <p className="text-sm text-[var(--coconut-husk)]">
                Explorez des alternatives pour votre projet
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {availableDirections.slice(1).map((direction, index) => (
                <motion.div
                  key={direction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + (index * 0.1) }}
                >
                  <StandardDirectionCard
                    direction={direction}
                    isSelected={selectedId === direction.id}
                    onSelect={() => handleSelect(direction.id)}
                    onHover={() => setHoveredId(direction.id)}
                    onLeave={() => setHoveredId(null)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Confirm CTA (Sticky Bottom on mobile) */}
        <AnimatePresence>
          {selectedId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="sticky bottom-8 z-10"
            >
              <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-6 border border-white/60 shadow-2xl">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-[var(--coconut-palm)]" />
                    <div>
                      <p className="font-semibold text-[var(--coconut-shell)]">
                        Direction sélectionnée
                      </p>
                      <p className="text-sm text-[var(--coconut-husk)]">
                        {availableDirections.find(d => d.id === selectedId)?.name}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirm}
                    className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <span>Continuer</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// FEATURED DIRECTION CARD (Large format)
// ============================================

interface FeaturedDirectionCardProps {
  direction: CreativeDirection;
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}

function FeaturedDirectionCard({ direction, isSelected, onSelect, onHover, onLeave }: FeaturedDirectionCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.01, y: -4 }}
      whileTap={{ scale: 0.99 }}
      className={`group relative w-full text-left transition-all ${
        isSelected ? 'ring-4 ring-[var(--coconut-shell)]/30' : ''
      }`}
    >
      {/* Glow effect */}
      <div className="absolute -inset-2 bg-gradient-to-br from-[var(--coconut-shell)]/20 via-[var(--coconut-palm)]/15 to-amber-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Card */}
      <div className={`relative bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border overflow-hidden transition-all ${
        isSelected
          ? 'border-[var(--coconut-shell)] shadow-[var(--coconut-shell)]/20'
          : 'border-white/60 hover:border-white/80'
      }`}>
        
        {/* Badges */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3 h-3" />
            Recommandé
          </div>
          {isSelected && (
            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg">
              <CheckCircle className="w-3 h-3" />
              Sélectionné
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 p-8">
          
          {/* LEFT: Main Info */}
          <div className="space-y-6">
            {/* Icon */}
            <div className="relative inline-block">
              <div className="absolute -inset-2 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-2xl blur-lg opacity-50" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-2xl flex items-center justify-center shadow-xl">
                <Palette className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] bg-clip-text text-transparent mb-2">
                {direction.name}
              </h3>
              <p className="text-base text-[var(--coconut-husk)] leading-relaxed">
                {direction.description}
              </p>
            </div>

            {/* Mood */}
            <div>
              <p className="text-xs font-semibold text-[var(--coconut-husk)] mb-2 uppercase tracking-wide">
                Mood & Ambiance
              </p>
              <p className="text-sm text-[var(--coconut-shell)] font-medium px-4 py-2 bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)] rounded-lg border border-white/40 inline-block">
                {direction.mood}
              </p>
            </div>

            {/* Reasoning */}
            <div className="p-4 bg-gradient-to-br from-cyan-50 to-purple-50 rounded-xl border border-cyan-100">
              <div className="flex items-start gap-2 mb-2">
                <Info className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">Pourquoi cette direction ?</p>
              </div>
              <p className="text-sm text-cyan-600 leading-relaxed">
                {direction.reasoning}
              </p>
            </div>
          </div>

          {/* RIGHT: Visual Details */}
          <div className="space-y-6">
            
            {/* Color Palette */}
            <div>
              <p className="text-xs font-semibold text-[var(--coconut-husk)] mb-3 uppercase tracking-wide">
                Palette de couleurs
              </p>
              <div className="flex flex-wrap gap-3">
                {direction.colorPalette.map((color, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-12 h-12 rounded-xl shadow-lg border-2 border-white"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-[var(--coconut-husk)] font-mono">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Style Keywords */}
            <div>
              <p className="text-xs font-semibold text-[var(--coconut-husk)] mb-3 uppercase tracking-wide">
                Mots-clés stylistiques
              </p>
              <div className="flex flex-wrap gap-2">
                {direction.styleKeywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-white/60 text-sm text-[var(--coconut-shell)] border border-white/40 font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <div className={`relative group/btn inline-block ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-xl blur opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                <div className="relative px-6 py-3 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg">
                  {isSelected ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Sélectionné</span>
                    </>
                  ) : (
                    <>
                      <span>Choisir cette direction</span>
                      <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ============================================
// STANDARD DIRECTION CARD (Compact format)
// ============================================

interface StandardDirectionCardProps {
  direction: CreativeDirection;
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}

function StandardDirectionCard({ direction, isSelected, onSelect, onHover, onLeave }: StandardDirectionCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative w-full h-full text-left transition-all ${
        isSelected ? 'ring-4 ring-[var(--coconut-shell)]/30' : ''
      }`}
    >
      {/* Glow */}
      <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-husk)]/20 via-[var(--coconut-shell)]/15 to-[var(--coconut-palm)]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
      
      {/* Card */}
      <div className={`relative h-full bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border overflow-hidden transition-all ${
        isSelected
          ? 'border-[var(--coconut-shell)] shadow-[var(--coconut-shell)]/20'
          : 'border-white/60 hover:border-white/80'
      }`}>
        
        {isSelected && (
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg z-10">
            <CheckCircle className="w-3 h-3" />
            Sélectionné
          </div>
        )}

        <div className="p-6 space-y-4">
          
          {/* Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-husk)] to-[var(--coconut-shell)] rounded-xl blur opacity-40" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-[var(--coconut-husk)] to-[var(--coconut-shell)] rounded-xl flex items-center justify-center shadow-lg">
                <Palette className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-bold text-[var(--coconut-shell)] mb-1">
                {direction.name}
              </h4>
              <p className="text-sm text-[var(--coconut-husk)] line-clamp-2">
                {direction.description}
              </p>
            </div>
          </div>

          {/* Mood */}
          <div>
            <p className="text-xs text-[var(--coconut-husk)] mb-1">Mood</p>
            <p className="text-sm font-medium text-[var(--coconut-shell)]">{direction.mood}</p>
          </div>

          {/* Color Palette Preview */}
          <div>
            <p className="text-xs text-[var(--coconut-husk)] mb-2">Palette</p>
            <div className="flex gap-2">
              {direction.colorPalette.slice(0, 4).map((color, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-lg shadow-md border-2 border-white"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Keywords Preview */}
          <div>
            <p className="text-xs text-[var(--coconut-husk)] mb-2">Mots-clés</p>
            <div className="flex flex-wrap gap-2">
              {direction.styleKeywords.slice(0, 3).map((keyword, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-md bg-white/40 text-xs text-[var(--coconut-shell)] border border-white/40"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2 flex items-center justify-between text-sm">
            <span className="text-[var(--coconut-husk)] group-hover:text-[var(--coconut-shell)] transition-colors flex items-center gap-1.5">
              Sélectionner
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <CheckCircle className={`w-5 h-5 transition-all ${
              isSelected ? 'text-[var(--coconut-palm)] scale-110' : 'text-[var(--coconut-husk)]/30'
            }`} />
          </div>
        </div>
      </div>
    </motion.button>
  );
}