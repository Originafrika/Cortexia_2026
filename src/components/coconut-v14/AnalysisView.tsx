/**
 * COCONUT V14 - ANALYSIS VIEW
 * Beauty Design System - 7 Arts de Perfection Divine compliant
 * 
 * ✅ FIXED (Phase 4):
 * - AV-C1: Design tokens partout
 * - AV-C2: Couleurs via tokens (cohérentes)
 * - AV-C3: Icon sizing standardisé
 * - AV-C4: Labels 100% FR (plus de mélange EN/FR)
 * - AV-C5: Error handler intégré
 * - AV-C6: EmptyState component
 * - AV-H1-H5: Spacing, radius, focus, ARIA, formatage
 * 
 * ✨ PHASE 4 - SESSION 15: SOUND INTEGRATION
 * - Feedback sonores sur toutes les interactions
 * - Pattern: playClick (actions), playSuccess (proceed), playPop (expand)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Image as ImageIcon,
  Palette,
  Layout,
  Package,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Edit3,
  Lightbulb,
  DollarSign
} from 'lucide-react';
import type { GeminiAnalysisResponse } from '../../lib/types/gemini';
import { tokens, TRANSITIONS } from '@/lib/design/tokens';
import { WORKFLOW_LABELS, ACTION_LABELS, formatCredits } from '@/lib/i18n/translations';
import { handleError } from '@/lib/utils/errorHandler';
import { EmptyState } from '@/components/common/EmptyState';
import { useSoundContext } from './SoundProvider';

// ============================================
// TYPES
// ============================================

interface AnalysisViewProps {
  analysis: GeminiAnalysisResponse;
  onProceed: () => void;
  onEdit: () => void;
  onReanalyze: () => void;
  isLoading?: boolean;
  userCredits?: number;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function AnalysisView({
  analysis,
  onProceed,
  onEdit,
  onReanalyze,
  isLoading = false,
  userCredits, // ✅ No default, must be passed from parent
}: AnalysisViewProps) {
  
  const { playClick, playSuccess, playPop } = useSoundContext();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['concept', 'palette']));
  
  const toggleSection = (section: string) => {
    playPop();
    setExpandedSections(prev => {
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
  
  const handleProceedClick = async () => {
    try {
      playSuccess();
      await onProceed();
    } catch (error) {
      handleError(error as Error, 'AnalysisView.onProceed', { toast: true });
    }
  };
  
  const handleEditClick = () => {
    try {
      playClick();
      onEdit();
    } catch (error) {
      handleError(error as Error, 'AnalysisView.onEdit', { toast: true });
    }
  };
  
  const handleReanalyzeClick = async () => {
    try {
      playClick();
      await onReanalyze();
    } catch (error) {
      handleError(error as Error, 'AnalysisView.onReanalyze', { toast: true });
    }
  };
  
  return (
    <div className={`max-w-6xl mx-auto ${tokens.layout.sectionSpacing}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={TRANSITIONS.medium}
        className="text-center"
      >
        <div className={`inline-flex items-center ${tokens.gap.tight} px-4 py-2 bg-[var(--coconut-palm)]/10 text-[var(--coconut-palm)] ${tokens.radius.full} mb-4`}>
          <CheckCircle2 className={tokens.iconSize.md} />
          <span>{WORKFLOW_LABELS.analysisComplete}</span>
        </div>
        <h1 className="text-3xl mb-2 text-slate-900">{analysis.projectTitle}</h1>
        <p className="text-slate-600">
          {WORKFLOW_LABELS.creativeProduction}
        </p>
      </motion.div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Analysis */}
        <div className={`lg:col-span-2 ${tokens.layout.sectionSpacing}`}>
          
          {/* Concept Section */}
          <Section
            icon={Sparkles}
            title={WORKFLOW_LABELS.creativeConcept}
            isExpanded={expandedSections.has('concept')}
            onToggle={() => toggleSection('concept')}
            iconColor="text-[var(--coconut-husk)]"
            bgColor="from-[var(--coconut-cream)] to-[var(--coconut-milk)]"
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-600 mb-1 block">{WORKFLOW_LABELS.artisticDirection}</label>
                <p className="text-slate-900">{analysis.concept.direction}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600 mb-1 block">{WORKFLOW_LABELS.keyMessage}</label>
                <p className="text-slate-900">{analysis.concept.keyMessage}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600 mb-1 block">{WORKFLOW_LABELS.moodAmbiance}</label>
                <p className="text-slate-900">{analysis.concept.mood}</p>
              </div>
            </div>
          </Section>
          
          {/* References Analysis */}
          <Section
            icon={ImageIcon}
            title={WORKFLOW_LABELS.referencesAnalyzed}
            isExpanded={expandedSections.has('references')}
            onToggle={() => toggleSection('references')}
            iconColor="text-[var(--coconut-husk)]"
            bgColor="from-[var(--coconut-cream)] to-[var(--coconut-milk)]"
          >
            <div className="space-y-4">
              {/* Available Assets */}
              {analysis.referenceAnalysis.availableAssets.length > 0 && (
                <div>
                  <h4 className="text-sm text-slate-700 mb-3">{WORKFLOW_LABELS.availableAssets}</h4>
                  <div className="space-y-2">
                    {analysis.referenceAnalysis.availableAssets.map((asset, index) => (
                      <div key={index} className={`flex items-start ${tokens.gap.normal} p-3 ${tokens.bgColors.glassWarm} ${tokens.radius.sm} border border-slate-200`}>
                        <CheckCircle2 className={`${tokens.iconSize.md} text-[var(--coconut-palm)] flex-shrink-0 mt-0.5`} />
                        <div className="flex-1">
                          <p className="text-sm text-slate-900">{asset.description}</p>
                          <p className="text-xs text-slate-600 mt-1">{asset.usage}</p>
                          {asset.notes && (
                            <p className="text-xs text-slate-500 mt-1 italic">{asset.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Detected Style */}
              <div>
                <h4 className="text-sm text-slate-700 mb-3">{WORKFLOW_LABELS.detectedStyle}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 ${tokens.bgColors.glassWarm} ${tokens.radius.sm} border border-slate-200`}>
                    <label className="text-xs text-slate-600 block mb-1">{WORKFLOW_LABELS.aesthetic}</label>
                    <p className="text-sm text-slate-900">{analysis.referenceAnalysis.detectedStyle.aesthetic}</p>
                  </div>
                  <div className={`p-3 ${tokens.bgColors.glassWarm} ${tokens.radius.sm} border border-slate-200`}>
                    <label className="text-xs text-slate-600 block mb-1">{WORKFLOW_LABELS.lighting}</label>
                    <p className="text-sm text-slate-900">{analysis.referenceAnalysis.detectedStyle.lighting}</p>
                  </div>
                  <div className={`p-3 ${tokens.bgColors.glassWarm} ${tokens.radius.sm} border border-slate-200 col-span-2`}>
                    <label className="text-xs text-slate-600 block mb-1">{WORKFLOW_LABELS.materials}</label>
                    <p className="text-sm text-slate-900">{analysis.referenceAnalysis.detectedStyle.materials}</p>
                  </div>
                </div>
              </div>
            </div>
          </Section>
          
          {/* Composition */}
          <Section
            icon={Layout}
            title={WORKFLOW_LABELS.visualComposition}
            isExpanded={expandedSections.has('composition')}
            onToggle={() => toggleSection('composition')}
            iconColor="text-[var(--coconut-shell)]"
            bgColor="from-[var(--coconut-cream)] to-[var(--coconut-milk)]"
          >
            <div className="space-y-3">
              <div className={`flex items-center ${tokens.gap.normal} text-sm`}>
                <span className="text-slate-600">{WORKFLOW_LABELS.format}:</span>
                <span className={`px-3 py-1 bg-slate-100 ${tokens.radius.full} text-slate-900`}>{analysis.composition.ratio}</span>
                <span className="text-slate-600">{WORKFLOW_LABELS.resolution}:</span>
                <span className={`px-3 py-1 bg-slate-100 ${tokens.radius.full} text-slate-900`}>{analysis.composition.resolution}</span>
              </div>
              
              <div className="space-y-2">
                {analysis.composition.zones.map((zone, index) => (
                  <div key={index} className={`p-3 ${tokens.bgColors.glassWarm} ${tokens.radius.sm} border border-slate-200`}>
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-sm text-slate-900">{zone.name}</h5>
                      <span className="text-xs text-slate-500">{zone.position}</span>
                    </div>
                    <p className="text-sm text-slate-600">{zone.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>
          
          {/* Assets Required */}
          {analysis.assetsRequired.missing.length > 0 ? (
            <Section
              icon={Package}
              title={WORKFLOW_LABELS.missingAssets}
              isExpanded={expandedSections.has('assets')}
              onToggle={() => toggleSection('assets')}
              iconColor="text-[var(--coconut-husk)]"
              bgColor="from-[var(--coconut-cream)] to-[var(--coconut-milk)]"
            >
              <div className="space-y-2">
                {analysis.assetsRequired.missing.map((asset, index) => (
                  <div key={index} className={`p-3 ${tokens.bgColors.glassWarm} ${tokens.radius.sm} border border-slate-200`}>
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-sm text-slate-900">{asset.description}</h5>
                      <span className={`text-xs px-2 py-1 ${tokens.radius.full} ${
                        asset.canBeGenerated 
                          ? 'bg-[var(--coconut-palm)]/10 text-[var(--coconut-palm)]' 
                          : 'bg-[var(--coconut-husk)]/10 text-[var(--coconut-husk)]'
                      }`}>
                        {asset.canBeGenerated ? WORKFLOW_LABELS.canGenerate : WORKFLOW_LABELS.requestFromUser}
                      </span>
                    </div>
                    {asset.requiredAction === 'request-from-user' && asset.requestMessage && (
                      <p className="text-sm text-slate-600 italic">{asset.requestMessage}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          ) : null}
          
          {/* Recommendations */}
          <Section
            icon={Lightbulb}
            title={WORKFLOW_LABELS.recommendations}
            isExpanded={expandedSections.has('recommendations')}
            onToggle={() => toggleSection('recommendations')}
            iconColor="text-[var(--coconut-palm)]"
            bgColor="from-[var(--coconut-palm)]/10 to-[var(--coconut-palm)]/5"
          >
            <div className="space-y-3">
              <div className={`p-3 ${tokens.bgColors.glassWarm} ${tokens.radius.sm} border border-slate-200`}>
                <label className="text-xs text-slate-600 block mb-1">{WORKFLOW_LABELS.generationApproach}</label>
                <p className="text-sm text-slate-900 uppercase tracking-wide">
                  {analysis.recommendations.generationApproach}
                </p>
              </div>
              
              <div>
                <label className="text-xs text-slate-600 block mb-2">{WORKFLOW_LABELS.rationale}</label>
                <p className="text-sm text-slate-900">{analysis.recommendations.rationale}</p>
              </div>
              
              {analysis.recommendations.alternatives && (
                <div>
                  <label className="text-xs text-slate-600 block mb-2">{WORKFLOW_LABELS.alternatives}</label>
                  <p className="text-sm text-slate-600 italic">{analysis.recommendations.alternatives}</p>
                </div>
              )}
            </div>
          </Section>
        </div>
        
        {/* Right Column - Color Palette & Actions */}
        <div className={tokens.layout.sectionSpacing}>
          
          {/* Color Palette */}
          <Section
            icon={Palette}
            title={WORKFLOW_LABELS.colorPalette}
            isExpanded={expandedSections.has('palette')}
            onToggle={() => toggleSection('palette')}
            iconColor="text-[var(--coconut-shell)]"
            bgColor="from-[var(--coconut-cream)] to-[var(--coconut-milk)]"
            compact
          >
            <div className="space-y-4">
              <ColorGroup label={WORKFLOW_LABELS.primary} colors={analysis.colorPalette.primary} />
              <ColorGroup label={WORKFLOW_LABELS.accent} colors={analysis.colorPalette.accent} />
              <ColorGroup label={WORKFLOW_LABELS.background} colors={analysis.colorPalette.background} />
              <ColorGroup label={WORKFLOW_LABELS.text} colors={analysis.colorPalette.text} />
              
              <div className="pt-3 border-t border-slate-200">
                <label className="text-xs text-slate-600 block mb-2">{WORKFLOW_LABELS.rationale}</label>
                <p className="text-sm text-slate-700">{analysis.colorPalette.rationale}</p>
              </div>
            </div>
          </Section>
          
          {/* Cost Breakdown */}
          <div className={`backdrop-blur-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 ${tokens.radius.lg} p-6 ${tokens.shadows.lg}`}>
            <div className={`flex items-center ${tokens.gap.tight} mb-4`}>
              <DollarSign className={`${tokens.iconSize.md} text-slate-700`} />
              <h3 className="text-lg text-slate-900">{WORKFLOW_LABELS.totalCost}</h3>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{WORKFLOW_LABELS.geminiAnalysis}</span>
                <span className="text-[var(--coconut-palm)]">{formatCredits(analysis.estimatedCost.analysis)} ✓</span>
              </div>
              {analysis.estimatedCost.assetGeneration > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{WORKFLOW_LABELS.assetGeneration}</span>
                  <span className="text-slate-900">{formatCredits(analysis.estimatedCost.assetGeneration)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{WORKFLOW_LABELS.finalGeneration}</span>
                <span className="text-slate-900">{formatCredits(analysis.estimatedCost.finalGeneration)}</span>
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-700">{WORKFLOW_LABELS.total}</span>
                <span className="text-2xl text-slate-900">{formatCredits(analysis.estimatedCost.total)}</span>
              </div>
              
              <div className="text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-600">{WORKFLOW_LABELS.alreadyCharged}</span>
                  <span className="text-slate-900">{formatCredits(analysis.estimatedCost.analysis)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{WORKFLOW_LABELS.remainingToCharge}</span>
                  <span className="text-slate-900">{formatCredits(remainingCost)}</span>
                </div>
              </div>
              
              {canAfford ? (
                <div className={`mt-3 flex items-center ${tokens.gap.tight} text-[var(--coconut-palm)] bg-[var(--coconut-palm)]/10 ${tokens.radius.sm} px-3 py-2`}>
                  <CheckCircle2 className={tokens.iconSize.sm} />
                  <span className="text-sm">{WORKFLOW_LABELS.sufficientBalance}</span>
                </div>
              ) : (
                <div className={`mt-3 flex items-center ${tokens.gap.tight} text-[var(--coconut-shell)] bg-[var(--coconut-shell)]/10 ${tokens.radius.sm} px-3 py-2`}>
                  <AlertCircle className={tokens.iconSize.sm} />
                  <span className="text-sm">{WORKFLOW_LABELS.insufficientCredits}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleProceedClick}
              disabled={isLoading || !canAfford}
              className={`
                w-full py-3 ${tokens.radius.md} ${tokens.textColors.white}
                flex items-center justify-center ${tokens.gap.tight}
                transition-all duration-300 ${tokens.focus} ${tokens.disabled}
                ${isLoading || !canAfford
                  ? 'bg-slate-400 cursor-not-allowed'
                  : `${tokens.gradients.success} hover:opacity-90 ${tokens.shadows.lg} hover:${tokens.shadows.xl}`
                }
              `}
              aria-label={WORKFLOW_LABELS.createCocoBoard}
            >
              <span>{WORKFLOW_LABELS.createCocoBoard}</span>
              <ArrowRight className={tokens.iconSize.md} />
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleEditClick}
                disabled={isLoading}
                className={`py-2 px-4 bg-white border border-slate-300 text-slate-700 ${tokens.radius.sm} hover:bg-slate-50 transition-colors flex items-center justify-center ${tokens.gap.tight} ${tokens.focus} ${tokens.disabled}`}
                aria-label={ACTION_LABELS.edit}
              >
                <Edit3 className={tokens.iconSize.sm} />
                <span>{ACTION_LABELS.edit}</span>
              </button>
              
              <button
                onClick={handleReanalyzeClick}
                disabled={isLoading}
                className={`py-2 px-4 bg-white border border-slate-300 text-slate-700 ${tokens.radius.sm} hover:bg-slate-50 transition-colors flex items-center justify-center ${tokens.gap.tight} ${tokens.focus} ${tokens.disabled}`}
                aria-label={WORKFLOW_LABELS.reanalyze}
              >
                <RefreshCw className={tokens.iconSize.sm} />
                <span>{WORKFLOW_LABELS.reanalyze}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface SectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  iconColor: string;
  bgColor: string;
  children: React.ReactNode;
  compact?: boolean;
}

function Section({ icon: Icon, title, isExpanded, onToggle, iconColor, bgColor, children, compact }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={TRANSITIONS.medium}
      className={`backdrop-blur-xl bg-gradient-to-br ${bgColor} border border-white/20 ${tokens.radius.lg} overflow-hidden ${tokens.shadows.lg}`}
    >
      <button
        onClick={onToggle}
        className={`w-full px-6 py-4 flex items-center justify-between hover:bg-white/30 transition-colors ${tokens.focus}`}
        aria-expanded={isExpanded}
        aria-controls={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className={`flex items-center ${tokens.gap.normal}`}>
          <Icon className={`${tokens.iconSize.md} ${iconColor}`} />
          <h3 className={`text-slate-900 ${compact ? 'text-base' : 'text-lg'}`}>{title}</h3>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={TRANSITIONS.fast}
        >
          <ArrowRight className={`${tokens.iconSize.md} text-slate-600 rotate-90`} />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={TRANSITIONS.smooth}
          >
            <div className="px-6 pb-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ColorGroupProps {
  label: string;
  colors: string[];
}

function ColorGroup({ label, colors }: ColorGroupProps) {
  return (
    <div>
      <label className="text-xs text-slate-600 block mb-2">{label}</label>
      <div className={`flex flex-wrap ${tokens.gap.tight}`}>
        {colors.map((color, index) => (
          <div key={index} className={`flex items-center ${tokens.gap.tight}`}>
            <div
              className={`w-10 h-10 ${tokens.radius.sm} border-2 border-white ${tokens.shadows.md}`}
              style={{ backgroundColor: color }}
              role="img"
              aria-label={`${label} couleur ${index + 1}: ${color}`}
              title={color}
            />
            <span className="text-xs text-slate-600 font-mono">{color}</span>
          </div>
        ))}
      </div>
    </div>
  );
}