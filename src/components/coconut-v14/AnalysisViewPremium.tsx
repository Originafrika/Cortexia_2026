/**
 * ANALYSIS VIEW ULTRA-PREMIUM - Résultats de l'analyse Gemini
 * Étape 4 du workflow: Direction Selector → Analysis View → CocoBoard/AssetManager
 * 
 * Premium Features:
 * - Hero section avec direction choisie
 * - Layout asymétrique 2/3 + 1/3 (Content | Sidebar)
 * - Sections expandable premium
 * - Color palette visualization
 * - Final prompt preview avec syntax highlight
 * - Assets status cards
 * - Palette Coconut Warm exclusive
 * - BDS 7 Arts compliance
 * - Score cible: 98%+
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider';
import {
  CheckCircle,
  Sparkles,
  Palette,
  FileText,
  Image as ImageIcon,
  Package,
  Lightbulb,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Edit,
  RefreshCw,
  Eye,
  Target,
  AlertCircle,
  TrendingUp,
  Layout
} from 'lucide-react';
import type { GeminiAnalysisResponse } from '../../lib/types/gemini';

interface AnalysisViewPremiumProps {
  analysis: GeminiAnalysisResponse;
  onProceed: () => void;
  onEdit: () => void;
  onReanalyze: () => void;
  userCredits?: number;
}

export function AnalysisViewPremium({
  analysis,
  onProceed,
  onEdit,
  onReanalyze,
  userCredits, // ✅ No default, must be passed from parent
}: AnalysisViewPremiumProps) {
  const { playClick, playSuccess, playPop } = useSoundContext();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['concept', 'prompt', 'palette'])
  );

  const toggleSection = (section: string) => {
    playPop();
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const canAfford = userCredits >= analysis.estimatedCost.total;
  const remainingCost = analysis.estimatedCost.total - analysis.estimatedCost.analysis;
  const hasMissingAssets = analysis.assetsRequired.missing.length > 0;

  // Helper: Convert prompt object to string if needed
  const getPromptText = (prompt: any): string => {
    if (typeof prompt === 'string') {
      return prompt;
    }
    
    // Check if it's an object with numeric indices (serialized string)
    if (typeof prompt === 'object' && prompt !== null) {
      // Try to reconstruct string from numeric indices
      const keys = Object.keys(prompt).filter(k => !isNaN(Number(k)));
      if (keys.length > 0) {
        return keys
          .map(k => Number(k))
          .sort((a, b) => a - b)
          .map(k => prompt[k])
          .join('');
      }
      
      // Otherwise, format as JSON
      return JSON.stringify(prompt, null, 2);
    }
    
    return String(prompt);
  };

  // Check if sections have content
  const hasStyleGuide = 
    analysis.referenceAnalysis?.detectedStyle?.aesthetic ||
    analysis.referenceAnalysis?.detectedStyle?.lighting ||
    analysis.referenceAnalysis?.detectedStyle?.materials;
  
  const hasCompositionZones = analysis.composition?.zones && analysis.composition.zones.length > 0;

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
          {/* Success badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/40">
            <CheckCircle className="w-4 h-4 text-[var(--coconut-palm)]" />
            <span className="text-sm font-medium text-[var(--coconut-palm)]">Analyse terminée avec succès</span>
          </div>

          {/* Title & subtitle */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-palm)] to-[var(--coconut-shell)] bg-clip-text text-transparent mb-3">
              {analysis.projectTitle}
            </h1>
            <p className="text-lg text-[var(--coconut-husk)] max-w-3xl">
              Gemini a analysé votre projet et généré un prompt optimisé pour Flux 2 Pro. Vérifiez les détails avant de continuer.
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-3">
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
          </div>
        </motion.div>

        {/* Main Grid: Content (2/3) + Sidebar (1/3) */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT/CENTER: MAIN CONTENT (2/3) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            
            {/* Concept Section */}
            <ExpandableSection
              id="concept"
              icon={Sparkles}
              title="Concept créatif"
              isExpanded={expandedSections.has('concept')}
              onToggle={() => toggleSection('concept')}
              gradient="from-[var(--coconut-shell)] to-[var(--coconut-palm)]"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide block mb-2">
                    Direction artistique
                  </label>
                  <p className="text-base text-[var(--coconut-shell)] leading-relaxed">
                    {analysis.concept.direction}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide block mb-2">
                      Message clé
                    </label>
                    <p className="text-sm text-[var(--coconut-shell)]">
                      {analysis.concept.keyMessage}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide block mb-2">
                      Mood & Ambiance
                    </label>
                    <p className="text-sm text-[var(--coconut-shell)]">
                      {analysis.concept.mood}
                    </p>
                  </div>
                </div>
              </div>
            </ExpandableSection>

            {/* Final Prompt Section */}
            <ExpandableSection
              id="prompt"
              icon={FileText}
              title="Prompt final optimisé"
              badge={`${typeof analysis.finalPrompt === 'string' ? analysis.finalPrompt.split(' ').length : 0} mots`}
              isExpanded={expandedSections.has('prompt')}
              onToggle={() => toggleSection('prompt')}
              gradient="from-[var(--coconut-husk)] to-[var(--coconut-shell)]"
            >
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700">
                  <pre className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap font-mono">
                    {getPromptText(analysis.finalPrompt)}
                  </pre>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-cyan-50 to-purple-50 rounded-xl border border-cyan-100">
                  <Eye className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide mb-1">
                      À savoir
                    </p>
                    <p className="text-sm text-cyan-600 leading-relaxed">
                      Ce prompt a été optimisé par Gemini 2.5 pour maximiser la qualité de génération avec Flux 2 Pro. 
                      Il inclut les paramètres de style, composition et ambiance détectés.
                    </p>
                  </div>
                </div>
              </div>
            </ExpandableSection>

            {/* Style Guide Section */}
            {hasStyleGuide && (
              <ExpandableSection
                id="style"
                icon={Palette}
                title="Guide de style"
                isExpanded={expandedSections.has('style')}
                onToggle={() => toggleSection('style')}
                gradient="from-[var(--coconut-palm)] to-amber-500"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-white/40">
                    <label className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide block mb-2">
                      Esthétique
                    </label>
                    <p className="text-sm text-[var(--coconut-shell)] font-medium">
                      {analysis.referenceAnalysis?.detectedStyle?.aesthetic || 'Non spécifié'}
                    </p>
                  </div>

                  <div className="p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-white/40">
                    <label className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide block mb-2">
                      Éclairage
                    </label>
                    <p className="text-sm text-[var(--coconut-shell)] font-medium">
                      {analysis.referenceAnalysis?.detectedStyle?.lighting || 'Non spécifié'}
                    </p>
                  </div>

                  <div className="p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-white/40 col-span-2">
                    <label className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide block mb-2">
                      Matériaux
                    </label>
                    <p className="text-sm text-[var(--coconut-shell)] font-medium">
                      {analysis.referenceAnalysis?.detectedStyle?.materials || 'Non spécifié'}
                    </p>
                  </div>

                  <div className="p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-white/40 col-span-2">
                    <label className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide block mb-2">
                      Mood général
                    </label>
                    <p className="text-sm text-[var(--coconut-shell)] font-medium">
                      {analysis.concept?.mood || 'Non spécifié'}
                    </p>
                  </div>
                </div>
              </ExpandableSection>
            )}

            {/* Composition Section */}
            {hasCompositionZones && (
              <ExpandableSection
                id="composition"
                icon={Layout}
                title="Composition visuelle"
                isExpanded={expandedSections.has('composition')}
                onToggle={() => toggleSection('composition')}
                gradient="from-[var(--coconut-shell)] to-[var(--coconut-husk)]"
              >
                <div className="space-y-4">
                  {/* Format & Resolution */}
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)] rounded-lg border border-white/40">
                      <span className="text-xs text-[var(--coconut-husk)]">Format</span>
                      <p className="text-sm font-semibold text-[var(--coconut-shell)]">
                        {analysis.composition.ratio}
                      </p>
                    </div>
                    <div className="px-4 py-2 bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)] rounded-lg border border-white/40">
                      <span className="text-xs text-[var(--coconut-husk)]">Résolution</span>
                      <p className="text-sm font-semibold text-[var(--coconut-shell)]">
                        {analysis.composition.resolution}
                      </p>
                    </div>
                  </div>

                  {/* Zones */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide">
                      Zones de composition
                    </label>
                    {analysis.composition.zones.map((zone, i) => (
                      <div
                        key={i}
                        className="p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-white/40"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-semibold text-[var(--coconut-shell)]">
                            {zone.name}
                          </h5>
                          <span className="text-xs text-[var(--coconut-husk)] bg-[var(--coconut-cream)]/50 px-2 py-1 rounded-md">
                            {zone.position}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--coconut-husk)]">
                          {zone.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </ExpandableSection>
            )}

            {/* Assets Required (if any) */}
            {hasMissingAssets && (
              <ExpandableSection
                id="assets"
                icon={Package}
                title="Assets manquants"
                badge={`${analysis.assetsRequired.missing.length}`}
                isExpanded={expandedSections.has('assets')}
                onToggle={() => toggleSection('assets')}
                gradient="from-amber-500 to-amber-600"
              >
                <div className="space-y-3">
                  {analysis.assetsRequired.missing.map((asset, i) => (
                    <div
                      key={i}
                      className="p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-white/40"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h5 className="text-sm font-semibold text-[var(--coconut-shell)] flex-1">
                          {asset.description}
                        </h5>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            asset.canBeGenerated
                              ? 'bg-[var(--coconut-palm)]/20 text-[var(--coconut-palm)]'
                              : 'bg-amber-500/20 text-amber-600'
                          }`}
                        >
                          {asset.canBeGenerated ? 'Génération IA' : 'Demande client'}
                        </span>
                      </div>
                      {asset.requestMessage && (
                        <p className="text-sm text-[var(--coconut-husk)] italic">
                          {asset.requestMessage}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            )}

            {/* Recommendations */}
            <ExpandableSection
              id="recommendations"
              icon={Lightbulb}
              title="Recommandations"
              isExpanded={expandedSections.has('recommendations')}
              onToggle={() => toggleSection('recommendations')}
              gradient="from-cyan-500 to-purple-500"
            >
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-cyan-50 to-purple-50 rounded-xl border border-cyan-100">
                  <label className="text-xs font-semibold text-cyan-700 uppercase tracking-wide block mb-2">
                    Approche de génération
                  </label>
                  <p className="text-sm font-semibold text-cyan-600 uppercase tracking-wide">
                    {analysis.recommendations.generationApproach}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide block mb-2">
                    Justification
                  </label>
                  <p className="text-sm text-[var(--coconut-shell)] leading-relaxed">
                    {analysis.recommendations.rationale}
                  </p>
                </div>

                {analysis.recommendations.alternatives && (
                  <div>
                    <label className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide block mb-2">
                      Alternatives
                    </label>
                    <p className="text-sm text-[var(--coconut-husk)] italic">
                      {analysis.recommendations.alternatives}
                    </p>
                  </div>
                )}
              </div>
            </ExpandableSection>
          </motion.div>

          {/* RIGHT: SIDEBAR (1/3) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1 space-y-6"
          >
            
            {/* Sticky sidebar */}
            <div className="lg:sticky lg:top-8 space-y-6">
              
              {/* Color Palette */}
              <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-6 border border-white/60 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-[var(--coconut-shell)]" />
                  <h3 className="font-semibold text-[var(--coconut-shell)]">Palette de couleurs</h3>
                </div>

                <div className="space-y-4">
                  <ColorGroup label="Primaire" colors={analysis.colorPalette.primary} />
                  <ColorGroup label="Accent" colors={analysis.colorPalette.accent} />
                  <ColorGroup label="Fond" colors={analysis.colorPalette.background} />
                  <ColorGroup label="Texte" colors={analysis.colorPalette.text} />

                  <div className="pt-4 border-t border-white/30">
                    <label className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide block mb-2">
                      Justification
                    </label>
                    <p className="text-sm text-[var(--coconut-husk)] leading-relaxed">
                      {analysis.colorPalette.rationale}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-6 border border-white/60 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-[var(--coconut-shell)]">Coût total</h3>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--coconut-husk)]">Analyse Gemini</span>
                    <span className="font-medium text-[var(--coconut-palm)] flex items-center gap-1">
                      {analysis.estimatedCost.analysis} cr
                      <CheckCircle className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {analysis.estimatedCost.assetGeneration > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--coconut-husk)]">Génération assets</span>
                      <span className="font-medium text-[var(--coconut-shell)]">
                        {analysis.estimatedCost.assetGeneration} cr
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--coconut-husk)]">Génération finale</span>
                    <span className="font-medium text-[var(--coconut-shell)]">
                      {analysis.estimatedCost.finalGeneration} cr
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/30 flex items-center justify-between mb-4">
                  <span className="font-semibold text-[var(--coconut-shell)]">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                    {analysis.estimatedCost.total} cr
                  </span>
                </div>

                {/* Credits status */}
                <div className="p-3 rounded-lg bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)] border border-white/40">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-[var(--coconut-husk)]">Vos crédits</span>
                    <span className="font-bold text-[var(--coconut-shell)]">{userCredits} cr</span>
                  </div>
                  {canAfford ? (
                    <div className="flex items-center gap-2 text-xs text-[var(--coconut-palm)]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Crédits suffisants pour continuer</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-red-500">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Crédits insuffisants</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl p-5 border border-cyan-100">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-cyan-700 text-sm mb-1">Prochaines étapes</h4>
                    <p className="text-xs text-cyan-600 leading-relaxed">
                      {hasMissingAssets
                        ? 'Gérez les assets manquants, puis affinez votre création sur le CocoBoard avant la génération finale.'
                        : 'Affinez votre création sur le CocoBoard avant de lancer la génération finale avec Flux 2 Pro.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-cyan-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Temps estimé : 2-5 minutes</span>
                </div>
              </div>

              {/* CTA Button */}
              <motion.button
                onClick={() => {
                  playSuccess();
                  onProceed();
                }}
                disabled={!canAfford}
                whileHover={canAfford ? { scale: 1.02, y: -2 } : {}}
                whileTap={canAfford ? { scale: 0.98 } : {}}
                className={`w-full relative group overflow-hidden rounded-2xl transition-all ${
                  !canAfford ? 'opacity-50 cursor-not-allowed' : 'shadow-xl hover:shadow-2xl'
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] ${
                    canAfford ? 'animate-gradient bg-[length:200%_100%]' : ''
                  }`}
                />
                <div className="relative px-6 py-4 flex items-center justify-center gap-3 text-white">
                  {hasMissingAssets ? (
                    <>
                      <Package className="w-5 h-5" />
                      <span className="font-semibold">Gérer les assets</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span className="font-semibold">Ouvrir le CocoBoard</span>
                    </>
                  )}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXPANDABLE SECTION COMPONENT
// ============================================

interface ExpandableSectionProps {
  id: string;
  icon: React.ElementType;
  title: string;
  badge?: string;
  isExpanded: boolean;
  onToggle: () => void;
  gradient: string;
  children: React.ReactNode;
}

function ExpandableSection({
  id,
  icon: Icon,
  title,
  badge,
  isExpanded,
  onToggle,
  gradient,
  children,
}: ExpandableSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 overflow-hidden"
    >
      {/* Header (always visible) */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/40 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--coconut-shell)]">{title}</h3>
            {badge && (
              <span className="text-xs text-[var(--coconut-husk)] bg-[var(--coconut-cream)]/50 px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[var(--coconut-husk)] group-hover:text-[var(--coconut-shell)] transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[var(--coconut-husk)] group-hover:text-[var(--coconut-shell)] transition-colors" />
          )}
        </div>
      </button>

      {/* Content (expandable) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// COLOR GROUP COMPONENT
// ============================================

interface ColorGroupProps {
  label: string;
  colors: string[];
}

function ColorGroup({ label, colors }: ColorGroupProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide block mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {colors.map((color, i) => (
          <div key={i} className="group relative">
            <div
              className="w-12 h-12 rounded-lg shadow-md border-2 border-white cursor-pointer group-hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-mono text-[var(--coconut-husk)] bg-white/90 px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {color}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}