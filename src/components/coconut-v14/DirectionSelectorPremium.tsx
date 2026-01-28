/**
 * DIRECTION SELECTOR ULTRA-PREMIUM - LIGHT THEME
 * Étape 3 du workflow: Analyzing → Direction Selector → Analysis View
 * 
 * COCONUT PREMIUM DESIGN SYSTEM V3
 * - Light theme with Warm Cream accents
 * - Hero section avec résumé de l'analyse
 * - Layout asymétrique (Featured + Grid)
 * - Preview cards avec mood/palette/keywords
 * - Comparaison visuelle premium
 * - BDS 7 Arts compliance
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
    <div className="min-h-screen bg-white relative overflow-hidden">
      
      {/* Premium ambient lights - Light theme */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,229,224,0.4)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(227,213,202,0.3)_0%,transparent_50%)]" />
      
      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          {/* Step indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream-50 border border-cream-200">
            <Sparkles className="w-4 h-4 text-cream-600" />
            <span className="text-sm font-medium text-stone-700">Phase 3 • Direction créative</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-stone-900 via-cream-700 to-stone-900 bg-clip-text text-transparent">
            Choisissez votre direction créative
          </h1>

          {/* Subtitle with analysis summary */}
          <p className="text-lg text-stone-600 max-w-3xl">
            Gemini a analysé votre projet et généré <span className="font-semibold text-cream-700">{availableDirections.length} directions créatives</span> optimisées. 
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 hover:border-cream-300 transition-all text-sm font-medium"
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 hover:border-cream-300 transition-all text-sm font-medium"
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
          className="bg-gradient-to-br from-cream-50 to-amber-50 rounded-2xl p-6 border border-cream-200"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cream-400 to-amber-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-stone-900 mb-2">Résumé de l'analyse Gemini</h3>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-stone-500 mb-1 font-medium">Concept détecté</p>
                  <p className="font-semibold text-stone-800">{analysis.concept?.direction || 'Créatif'}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 mb-1 font-medium">Esthétique</p>
                  <p className="font-semibold text-stone-800">{analysis.referenceAnalysis?.detectedStyle?.aesthetic || 'Moderne'}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 mb-1 font-medium">Mood global</p>
                  <p className="font-semibold text-stone-800">{analysis.concept?.mood || 'Inspirant'}</p>
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
              <span className="text-sm font-semibold text-stone-900">Recommandé par l'IA</span>
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
              <h2 className="text-xl font-semibold text-stone-900">
                Autres directions créatives
              </h2>
              <p className="text-sm text-stone-600">
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
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-stone-200 shadow-2xl">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-stone-900">
                        Direction sélectionnée
                      </p>
                      <p className="text-sm text-stone-600">
                        {availableDirections.find(d => d.id === selectedId)?.name}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirm}
                    className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-cream-500 to-amber-500 text-white font-semibold shadow-lg hover:shadow-xl hover:from-cream-600 hover:to-amber-600 transition-all flex items-center gap-2"
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
        isSelected ? 'ring-4 ring-cream-400/40' : ''
      }`}
    >
      {/* Glow effect */}
      <div className="absolute -inset-2 bg-gradient-to-br from-cream-400/20 via-amber-400/15 to-amber-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Card */}
      <div className={`relative bg-white rounded-2xl shadow-2xl border overflow-hidden transition-all ${
        isSelected
          ? 'border-cream-400 shadow-cream-400/20'
          : 'border-stone-200 hover:border-cream-300'
      }`}>
        
        {/* Badges */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3 h-3" />
            Recommandé
          </div>
          {isSelected && (
            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-cream-500 to-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg">
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
              <div className="absolute -inset-2 bg-gradient-to-br from-cream-400 to-amber-400 rounded-2xl blur-lg opacity-50" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-cream-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Palette className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-stone-900 via-cream-700 to-stone-900 bg-clip-text text-transparent mb-2">
                {direction.name}
              </h3>
              <p className="text-base text-stone-600 leading-relaxed">
                {direction.description}
              </p>
            </div>

            {/* Mood */}
            <div>
              <p className="text-xs font-semibold text-stone-500 mb-2 uppercase tracking-wide">
                Mood & Ambiance
              </p>
              <p className="text-sm text-stone-900 font-medium px-4 py-2 bg-gradient-to-br from-cream-50 to-amber-50 rounded-lg border border-cream-200 inline-block">
                {direction.mood}
              </p>
            </div>

            {/* Reasoning */}
            <div className="p-4 bg-gradient-to-br from-cream-50 to-amber-50 rounded-xl border border-cream-200">
              <div className="flex items-start gap-2 mb-2">
                <Info className="w-4 h-4 text-cream-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-stone-700 uppercase tracking-wide">Pourquoi cette direction ?</p>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">
                {direction.reasoning}
              </p>
            </div>
          </div>

          {/* RIGHT: Visual Details */}
          <div className="space-y-6">
            
            {/* Color Palette */}
            <div>
              <p className="text-xs font-semibold text-stone-500 mb-3 uppercase tracking-wide">
                Palette de couleurs
              </p>
              <div className="flex flex-wrap gap-3">
                {direction.colorPalette.map((color, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-12 h-12 rounded-xl shadow-lg border-2 border-white"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-stone-600 font-mono">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Style Keywords */}
            <div>
              <p className="text-xs font-semibold text-stone-500 mb-3 uppercase tracking-wide">
                Mots-clés stylistiques
              </p>
              <div className="flex flex-wrap gap-2">
                {direction.styleKeywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-stone-50 text-sm text-stone-700 border border-stone-200 font-medium hover:bg-cream-50 hover:border-cream-300 transition-colors"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <div className={`relative group/btn inline-block ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                <div className="absolute inset-0 bg-gradient-to-r from-cream-500 to-amber-500 rounded-xl blur opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                <div className="relative px-6 py-3 bg-gradient-to-r from-cream-500 to-amber-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg">
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
        isSelected ? 'ring-4 ring-cream-400/40' : ''
      }`}
    >
      {/* Glow */}
      <div className="absolute -inset-1 bg-gradient-to-br from-cream-300/20 via-amber-300/15 to-amber-400/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
      
      {/* Card */}
      <div className={`relative h-full bg-white rounded-2xl shadow-xl border overflow-hidden transition-all ${
        isSelected
          ? 'border-cream-400 shadow-cream-400/20'
          : 'border-stone-200 hover:border-cream-300'
      }`}>
        
        {isSelected && (
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-cream-500 to-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg z-10">
            <CheckCircle className="w-3 h-3" />
            Sélectionné
          </div>
        )}

        <div className="p-6 space-y-4">
          
          {/* Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-stone-300 to-cream-400 rounded-xl blur opacity-40" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-stone-400 to-cream-500 rounded-xl flex items-center justify-center shadow-lg">
                <Palette className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-bold text-stone-900 mb-1">
                {direction.name}
              </h4>
              <p className="text-sm text-stone-600 line-clamp-2">
                {direction.description}
              </p>
            </div>
          </div>

          {/* Mood */}
          <div>
            <p className="text-xs text-stone-500 mb-1 font-medium">Mood</p>
            <p className="text-sm font-semibold text-stone-800">{direction.mood}</p>
          </div>

          {/* Color Palette Preview */}
          <div>
            <p className="text-xs text-stone-500 mb-2 font-medium">Palette</p>
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
            <p className="text-xs text-stone-500 mb-2 font-medium">Mots-clés</p>
            <div className="flex flex-wrap gap-2">
              {direction.styleKeywords.slice(0, 3).map((keyword, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-md bg-stone-50 text-xs text-stone-700 border border-stone-200"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2 flex items-center justify-between text-sm">
            <span className="text-stone-600 group-hover:text-stone-900 transition-colors flex items-center gap-1.5 font-medium">
              Sélectionner
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <CheckCircle className={`w-5 h-5 transition-all ${
              isSelected ? 'text-green-600 scale-110' : 'text-stone-300'
            }`} />
          </div>
        </div>
      </div>
    </motion.button>
  );
}