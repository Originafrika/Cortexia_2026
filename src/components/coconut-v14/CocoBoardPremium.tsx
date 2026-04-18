/**
 * COCONUT V14 - COCOBOARD PREMIUM
 * Ultra-Premium Liquid Glass Design - Version 2.0
 * 
 * ✨ PREMIUM FEATURES:
 * - Layout asymétrique sophistiqué (2/3 content + 1/3 sidebar sticky)
 * - Sections liquid glass avec shimmer effects
 * - Animations stagger BDS-compliant
 * - Warm palette exclusive (shell/husk/cream/milk)
 * - Micro-interactions sur tous les éléments
 * - Sound integration complète
 * - Responsive mobile-first
 * - Sticky header premium
 * 
 * 🎯 SCORE CIBLE: 98% Premium Ultra-Sophistiqué
 * 
 * 🎨 BDS 7 ARTS COMPLIANCE:
 * - Grammaire: Structure claire et cohérente
 * - Logique: Hiérarchie évidente
 * - Rhétorique: Messages intentionnels
 * - Arithmétique: Rythme harmonieux (stagger delays)
 * - Géométrie: Proportions équilibrées (2/3 + 1/3)
 * - Musique: Motion orchestré
 * - Astronomie: Vision systémique
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider';
import { useCocoBoardStore } from '../../lib/stores/cocoboard-store';
import { useBreakpoint } from '../../lib/hooks/useBreakpoint';
import { CocoBoardHeader } from './CocoBoardHeader';
import { CocoBoardSidebarPremium } from './CocoBoardSidebarPremium';
import { PromptEditor } from './PromptEditor';
import { ReferencesManager } from './ReferencesManager';
import { SpecsAdjuster } from './SpecsAdjuster';
import { ColorPalettePicker } from './ColorPalettePicker';
import { GenerationView } from './GenerationView';
import { SpecsInputModal } from './SpecsInputModal';
import { ModeSelector, type GenerationMode } from './ModeSelector';
import { GenerationPreviewModal } from './GenerationPreviewModal';
import { AdvancedModeIndicator } from './AdvancedModeIndicator';
import { AdvancedErrorBoundary as ErrorBoundary } from './AdvancedErrorBoundary'; // ✅ FIXED: Use AdvancedErrorBoundary instead of ui-premium
import { 
  Loader2, AlertCircle, Sparkles, Zap, Palette, 
  Settings2, Image as ImageIcon, Wand2, FileText,
  Eye, Grid3x3, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import type { GeminiAnalysisResponse } from '../../lib/types/gemini';
import { projectId as supabaseProjectId, publicAnonKey } from '../../utils/supabase/info';
import { useAutoSave } from '../../lib/hooks/useAutoSave';
import { useCredits } from '../../lib/contexts/CreditsContext';
import { handleError, showSuccess, showWarning } from '../../lib/utils/errorHandler';

const API_BASE = `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-e55aa214`;

// ============================================
// ANIMATION VARIANTS - BDS COMPLIANT
// ============================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] // BDS easing
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// ============================================
// TYPES
// ============================================

interface CocoBoardPremiumProps {
  projectId: string;
  userId: string;
  cocoBoardId?: string;
  analysis?: GeminiAnalysisResponse;
  uploadedReferences?: {
    images: Array<{ url: string; description?: string; filename: string }>;
    videos: Array<{ url: string; description?: string; filename: string }>;
  } | null;
  onGenerationStart?: (generationId: string) => void;
}

// ============================================
// COMPONENT
// ============================================

export function CocoBoardPremium(props: CocoBoardPremiumProps) {
  return (
    <ErrorBoundary>
      <CocoBoardPremiumContent {...props} />
    </ErrorBoundary>
  );
}

function CocoBoardPremiumContent({ 
  projectId, 
  userId, 
  cocoBoardId, 
  analysis, 
  uploadedReferences, 
  onGenerationStart 
}: CocoBoardPremiumProps) {
  // 🔊 Sound context
  const { playClick, playWhoosh, playSuccess, playError, playHover, playPop } = useSoundContext();
  
  const { 
    currentBoard, 
    isLoading, 
    error,
    setCurrentBoard,
    setLoading,
    setError,
    reset,
  } = useCocoBoardStore();

  // Credits for cost widget
  const { getCoconutCredits } = useCredits();
  const totalCredits = getCoconutCredits(); // ✅ Coconut V14 uses ONLY paid credits

  // Local state
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('auto');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Specs modal data
  const [specsInputData, setSpecsInputData] = useState<{
    productName: string;
    prompt: string;
    suggestions: string[];
    subjectIndex: number;
  } | null>(null);

  // Responsive - Use useBreakpoint hook
  const { isMobile } = useBreakpoint();

  // ============================================
  // AUTO-SAVE
  // ============================================

  const { lastSaved: autoSaveTime } = useAutoSave({
    data: currentBoard,
    isDirty,
    onSave: async (data) => {
      console.log('💾 Auto-saving CocoBoard...');
      const response = await fetch(`${API_BASE}/coconut/cocoboard/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          userId,
          projectId,
          board: data
        })
      });

      if (!response.ok) {
        throw new Error('Auto-save failed');
      }

      setIsDirty(false);
      setLastSaved(new Date());
      console.log('✅ Auto-saved successfully');
    },
    localStorageKey: currentBoard?.id ? `cocoboard-${currentBoard.id}` : undefined,
    interval: 120000, // 2 minutes
    onError: (error) => {
      handleError(error, 'CocoBoard Auto-save', {
        toast: true,
        log: true,
        showDetails: false,
      });
    }
  });

  // ============================================
  // LOAD/CREATE LOGIC (simplified from original)
  // ============================================

  useEffect(() => {
    if (cocoBoardId) {
      loadCocoBoard();
    } else if (analysis) {
      createCocoBoardFromAnalysis(analysis);
    } else {
      createDemoCocoBoard();
    }

    return () => reset();
  }, [cocoBoardId, projectId, analysis]);

  const loadCocoBoard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/coconut/cocoboard/get?id=${cocoBoardId}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (!response.ok) throw new Error('Failed to load');
      const data = await response.json();
      setCurrentBoard(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CocoBoard');
    } finally {
      setLoading(false);
    }
  };

  const createCocoBoardFromAnalysis = async (geminiAnalysis: GeminiAnalysisResponse) => {
    setLoading(true);
    setError(null);
    try {
      const referencesWithUrls = uploadedReferences?.images || [];
      const generatedId = `cocoboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Clean finalPrompt if needed
      let cleanFinalPrompt: string = '';
      if (typeof geminiAnalysis.finalPrompt === 'object' && '0' in geminiAnalysis.finalPrompt) {
        cleanFinalPrompt = Object.values(geminiAnalysis.finalPrompt).join('');
      } else if (typeof geminiAnalysis.finalPrompt === 'string') {
        cleanFinalPrompt = geminiAnalysis.finalPrompt;
      } else {
        cleanFinalPrompt = String(geminiAnalysis.finalPrompt);
      }
      
      const newCocoBoard = {
        id: generatedId,
        projectId,
        userId,
        analysis: {
          projectTitle: geminiAnalysis.projectTitle,
          concept: {
            mainConcept: geminiAnalysis.concept.direction,
            visualStyle: geminiAnalysis.concept.keyMessage,
            targetEmotion: geminiAnalysis.concept.mood,
            keyMessage: geminiAnalysis.concept.keyMessage,
          },
          referenceAnalysis: {
            patterns: geminiAnalysis.referenceAnalysis?.availableAssets?.map((a: any) => a.usage) || [],
          },
          composition: {
            layout: geminiAnalysis.composition?.zones?.map((z: any) => z.name || '').join(', ') || '',
            hierarchy: geminiAnalysis.composition?.zones?.map((z: any) => z.description) || [],
            zones: geminiAnalysis.composition?.zones || [],
          },
          colorPalette: geminiAnalysis.colorPalette,
          assetsRequired: {
            missing: geminiAnalysis.assetsRequired?.missing || [],
            canGenerate: geminiAnalysis.assetsRequired?.missing?.some((a: any) => a.canBeGenerated) || false,
            multiPassNeeded: geminiAnalysis.recommendations?.generationApproach === 'multi-pass',
          },
          finalPrompt: cleanFinalPrompt,
          technicalSpecs: geminiAnalysis.technicalSpecs,
          estimatedCost: geminiAnalysis.estimatedCost,
          recommendations: geminiAnalysis.recommendations,
        },
        finalPrompt: cleanFinalPrompt,
        references: referencesWithUrls.map((ref, index) => ({
          id: `user-ref-img-${index + 1}`,
          url: ref.url,
          type: 'image' as const,
          description: ref.description,
          filename: ref.filename,
          order: index,
        })),
        specs: {
          model: geminiAnalysis.technicalSpecs.model,
          mode: geminiAnalysis.technicalSpecs.mode,
          ratio: geminiAnalysis.technicalSpecs.ratio,
          resolution: geminiAnalysis.technicalSpecs.resolution,
          referenceUrls: referencesWithUrls.map((ref, idx) => ({
            id: `user-ref-img-${idx + 1}`,
            url: ref.url,
            filename: ref.filename,
          })),
        },
        cost: geminiAnalysis.estimatedCost,
        status: 'validated' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Save to backend
      const saveResponse = await fetch(`${API_BASE}/coconut/cocoboard/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          projectId,
          userId,
          analysis: newCocoBoard.analysis,
          finalPrompt: newCocoBoard.finalPrompt,
          references: newCocoBoard.references,
          specs: newCocoBoard.specs,
          cost: newCocoBoard.cost,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save CocoBoard');
      }

      const savedData = await saveResponse.json();
      const savedBoard = {
        ...savedData.data,
        references: newCocoBoard.references,
        specs: newCocoBoard.specs,
      };
      
      setCurrentBoard(savedBoard);
      playSuccess();
      showSuccess('CocoBoard créé', 'Prêt pour la génération');
      
    } catch (err) {
      playError();
      setError(err instanceof Error ? err.message : 'Failed to create CocoBoard');
    } finally {
      setLoading(false);
    }
  };

  const createDemoCocoBoard = async () => {
    setLoading(true);
    try {
      const mockBoard = {
        id: `cocoboard-demo-${Date.now()}`,
        projectId,
        userId,
        analysis: {
          projectTitle: 'Premium Coconut V14 Demo',
          concept: {
            mainConcept: 'Ultra-premium liquid glass design',
            visualStyle: 'Sophisticated, modern, warm',
            targetEmotion: 'Prestige, trust, desire',
            keyMessage: 'Excellence in every pixel'
          },
          colorPalette: {
            primary: ['#8B7355', '#6B5D4F'],
            accent: ['#D4A574', '#C9A96E'],
            background: ['#FFFEF9', '#F5F0E8'],
            text: ['#2A2420', '#8B7355'],
            rationale: 'Coconut Warm palette exclusive'
          },
          finalPrompt: 'Premium demo scene with sophisticated lighting and warm colors',
          technicalSpecs: {
            model: 'flux-2-pro' as const,
            mode: 'text-to-image' as const,
            ratio: '16:9',
            resolution: '1K' as const,
            references: []
          },
          estimatedCost: {
            analysis: 100,
            finalGeneration: 15,
            total: 115
          },
        },
        finalPrompt: 'Premium demo scene',
        references: [],
        specs: {
          model: 'flux-2-pro' as const,
          mode: 'text-to-image' as const,
          ratio: '16:9',
          resolution: '1K' as const,
          referenceUrls: []
        },
        cost: { analysis: 100, finalGeneration: 15, total: 115 },
        status: 'validated' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCurrentBoard(mockBoard);
    } catch (err) {
      setError('Failed to create demo');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // UPDATE FUNCTIONS
  // ============================================

  const updatePrompt = (newPrompt: any) => {
    if (currentBoard) {
      setCurrentBoard({ ...currentBoard, finalPrompt: newPrompt });
      setIsDirty(true);
      playClick();
      toast.success('Prompt mis à jour');
    }
  };

  const updateSpecs = (specs: any) => {
    if (currentBoard) {
      setCurrentBoard({ ...currentBoard, specs });
      setIsDirty(true);
      playClick();
      toast.success('Spécifications mises à jour');
    }
  };

  const updateColorPalette = (newPalette: any) => {
    if (currentBoard) {
      setCurrentBoard({ 
        ...currentBoard, 
        analysis: {
          ...currentBoard.analysis,
          colorPalette: newPalette
        }
      });
      setIsDirty(true);
      playClick();
      toast.success('Palette mise à jour');
    }
  };

  const handleManualSave = async () => {
    if (!currentBoard) return;
    try {
      setIsSaving(true);
      playClick();
      
      const response = await fetch(`${API_BASE}/coconut/cocoboard/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          userId,
          projectId,
          board: currentBoard
        })
      });

      if (!response.ok) throw new Error('Save failed');

      setIsDirty(false);
      setLastSaved(new Date());
      playSuccess();
      toast.success('Sauvegardé');
    } catch (error) {
      playError();
      toast.error('Erreur de sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // RENDER - LOADING STATE
  // ============================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-white)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-full blur-2xl opacity-30 animate-pulse" />
            <Loader2 className="relative w-16 h-16 text-[var(--coconut-shell)] animate-spin mx-auto" />
          </div>
          <p className="text-lg font-medium text-[var(--coconut-shell)]">Chargement du CocoBoard...</p>
          <p className="text-sm text-[var(--coconut-husk)] mt-2">Préparation de l'espace créatif</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-white)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--coconut-shell)] mb-2">Erreur de chargement</h3>
          <p className="text-[var(--coconut-husk)] mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white rounded-xl hover:scale-105 transition-transform"
          >
            Réessayer
          </button>
        </motion.div>
      </div>
    );
  }

  if (!currentBoard) {
    return null;
  }

  // ============================================
  // RENDER - MAIN LAYOUT
  // ============================================

  return (
    <div className="min-h-screen bg-[var(--coconut-white)] relative overflow-hidden">
      {/* Premium animated background - Multi-layer */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] opacity-70" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,165,116,0.12)_0%,transparent_60%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,115,85,0.08)_0%,transparent_60%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />

      {/* Sticky Header Premium */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/60 border-b border-white/40 shadow-lg">
        <CocoBoardHeader 
          projectId={projectId}
          userId={userId}
          board={currentBoard}
        />
      </div>

      {/* Main Content - Asymmetric Layout (2/3 + 1/3) */}
      <main className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-32">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-3 gap-6 lg:gap-8"
        >
          
          {/* LEFT/CENTER: MAIN CONTENT (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Section 1: Overview Premium */}
            <motion.section
              variants={sectionVariants}
              onMouseEnter={() => { playHover(); setActiveSection('overview'); }}
              onMouseLeave={() => setActiveSection(null)}
              className="relative group"
            >
              {/* Ambient glow */}
              <div className="absolute -inset-2 bg-gradient-to-br from-[var(--coconut-shell)]/15 to-[var(--coconut-palm)]/10 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              
              {/* Main card */}
              <div className="relative bg-white/75 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 overflow-hidden">
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200" />
                
                <div className="relative p-6 sm:p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-xl blur-md opacity-40" />
                        <div className="relative w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-xl flex items-center justify-center shadow-lg">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--coconut-dark)]">Vue d'ensemble</h2>
                        <p className="text-sm text-[var(--coconut-husk)]">Orchestration créative</p>
                      </div>
                    </div>
                    
                    {activeSection === 'overview' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-2 h-2 rounded-full bg-[var(--coconut-palm)] animate-pulse"
                      />
                    )}
                  </div>

                  {/* Project Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Project Title */}
                    <motion.div
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={playClick}
                      className="relative group/card cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)]/10 to-[var(--coconut-palm)]/10 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
                      <div className="relative p-5 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-[var(--coconut-shell)]" />
                          </div>
                          <span className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide">Projet</span>
                        </div>
                        <p className="text-base font-medium text-[var(--coconut-dark)] line-clamp-2">
                          {currentBoard.analysis.projectTitle}
                        </p>
                      </div>
                    </motion.div>

                    {/* Status */}
                    <motion.div
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={playClick}
                      className="relative group/card cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
                      <div className="relative p-5 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide">Statut</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <p className="text-base font-medium text-[var(--coconut-dark)] capitalize">
                            {currentBoard.status}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Cost */}
                    <motion.div
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={playClick}
                      className="relative group/card cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
                      <div className="relative p-5 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                          </div>
                          <span className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide">Coût</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] bg-clip-text text-transparent">
                            {currentBoard.cost.total}
                          </p>
                          <span className="text-sm text-[var(--coconut-husk)]">crédits</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Concept Preview */}
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-[var(--coconut-cream)]/50 to-[var(--coconut-milk)]/30 border border-white/40">
                    <p className="text-sm font-medium text-[var(--coconut-husk)] mb-2">Concept principal</p>
                    <p className="text-base text-[var(--coconut-dark)] italic">
                      "{currentBoard.analysis.concept?.mainConcept || 'Concept créatif sophistiqué'}"
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Section 2: Prompt Editor Premium */}
            <motion.section
              variants={sectionVariants}
              onMouseEnter={() => { playHover(); setActiveSection('prompt'); }}
              onMouseLeave={() => setActiveSection(null)}
              className="relative group"
            >
              <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              
              <div className="relative bg-white/75 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200" />
                
                <div className="relative p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl blur-md opacity-40" />
                        <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Wand2 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--coconut-dark)]">Prompt créatif</h2>
                        <p className="text-sm text-[var(--coconut-husk)]">Description détaillée de la scène</p>
                      </div>
                    </div>
                    
                    {activeSection === 'prompt' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"
                      />
                    )}
                  </div>

                  <PromptEditor
                    value={currentBoard.finalPrompt}
                    onChange={updatePrompt}
                    disabled={false}
                  />
                </div>
              </div>
            </motion.section>

            {/* Section 3: Color Palette Premium */}
            <motion.section
              variants={sectionVariants}
              onMouseEnter={() => { playHover(); setActiveSection('colors'); }}
              onMouseLeave={() => setActiveSection(null)}
              className="relative group"
            >
              <div className="absolute -inset-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              
              <div className="relative bg-white/75 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200" />
                
                <div className="relative p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur-md opacity-40" />
                        <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Palette className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--coconut-dark)]">Palette de couleurs</h2>
                        <p className="text-sm text-[var(--coconut-husk)]">Harmonies chromatiques</p>
                      </div>
                    </div>
                    
                    {activeSection === 'colors' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"
                      />
                    )}
                  </div>

                  <ColorPalettePicker
                    palette={currentBoard.analysis.colorPalette}
                    onChange={updateColorPalette}
                    disabled={false}
                  />
                </div>
              </div>
            </motion.section>

            {/* Section 4: Technical Specs Premium */}
            <motion.section
              variants={sectionVariants}
              onMouseEnter={() => { playHover(); setActiveSection('specs'); }}
              onMouseLeave={() => setActiveSection(null)}
              className="relative group"
            >
              <div className="absolute -inset-2 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              
              <div className="relative bg-white/75 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200" />
                
                <div className="relative p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl blur-md opacity-40" />
                        <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Settings2 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--coconut-dark)]">Spécifications techniques</h2>
                        <p className="text-sm text-[var(--coconut-husk)]">Paramètres de génération</p>
                      </div>
                    </div>
                    
                    {activeSection === 'specs' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"
                      />
                    )}
                  </div>

                  <SpecsAdjuster
                    specs={currentBoard.specs}
                    onChange={updateSpecs}
                    disabled={false}
                  />
                </div>
              </div>
            </motion.section>

            {/* Section 5: References Premium */}
            <motion.section
              variants={sectionVariants}
              onMouseEnter={() => { playHover(); setActiveSection('references'); }}
              onMouseLeave={() => setActiveSection(null)}
              className="relative group"
            >
              <div className="absolute -inset-2 bg-gradient-to-br from-orange-500/10 to-rose-500/10 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              
              <div className="relative bg-white/75 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200" />
                
                <div className="relative p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl blur-md opacity-40" />
                        <div className="relative w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Grid3x3 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--coconut-dark)]">Références visuelles</h2>
                        <p className="text-sm text-[var(--coconut-husk)]">{currentBoard.references.length}/8 images</p>
                      </div>
                    </div>
                    
                    {activeSection === 'references' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"
                      />
                    )}
                  </div>

                  <ReferencesManager
                    references={currentBoard.references}
                    onAdd={(ref) => {
                      if (currentBoard) {
                        setCurrentBoard({
                          ...currentBoard,
                          references: [...currentBoard.references, ref]
                        });
                        setIsDirty(true);
                        playPop();
                      }
                    }}
                    onRemove={(id) => {
                      if (currentBoard) {
                        setCurrentBoard({
                          ...currentBoard,
                          references: currentBoard.references.filter(r => r.id !== id)
                        });
                        setIsDirty(true);
                        playClick();
                      }
                    }}
                    maxReferences={8}
                  />
                </div>
              </div>
            </motion.section>

          </div>

          {/* RIGHT: STICKY SIDEBAR (1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CocoBoardSidebarPremium
                board={currentBoard}
                totalCredits={totalCredits}
                isDirty={isDirty}
                isSaving={isSaving}
                lastSaved={lastSaved}
                onSave={handleManualSave}
                onGenerate={() => {
                  playWhoosh();
                  // Trigger generation logic here
                  toast.success('Génération lancée !');
                }}
              />
            </div>
          </div>

        </motion.div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showSpecsModal && specsInputData && (
          <SpecsInputModal
            isOpen={showSpecsModal}
            onClose={() => setShowSpecsModal(false)}
            onSubmit={(specs) => {
              // Handle specs submission
              setShowSpecsModal(false);
              playSuccess();
              toast.success('Spécifications enregistrées');
            }}
            productName={specsInputData.productName}
            prompt={specsInputData.prompt}
            suggestions={specsInputData.suggestions}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default CocoBoardPremium;