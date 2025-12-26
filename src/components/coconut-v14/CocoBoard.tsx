/**
 * COCONUT V14 - COCOBOARD COMPONENT
 * Ultra-Premium Liquid Glass Design
 * 
 * Features:
 * - Intense frosted glass effects
 * - Smooth motion animations
 * - Coconut theme colors
 * - BDS 7 Arts compliance
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCocoBoardStore } from '../../lib/stores/cocoboard-store';
import { CocoBoardHeader } from './CocoBoardHeader';
import { PromptEditor } from './PromptEditor';
import { ReferencesManager } from './ReferencesManager';
import { SpecsAdjuster } from './SpecsAdjuster';
import { CostCalculator } from './CostCalculator';
import { GenerationView } from './GenerationView';
import { IterationsGallery } from './IterationsGallery';
import { ErrorBoundary } from '../ui-premium/ErrorBoundary';
import { SkeletonCard } from '../ui-premium/SkeletonLoader';
import { Loader2, AlertCircle, Sparkles, Zap, Palette, Settings2, Image as ImageIcon } from 'lucide-react';
import { api } from '../../lib/api/client';

interface CocoBoardProps {
  projectId: string;
  userId: string;
  cocoBoardId?: string;
}

export function CocoBoard({ projectId, userId, cocoBoardId }: CocoBoardProps) {
  return (
    <ErrorBoundary>
      <CocoBoardContent projectId={projectId} userId={userId} cocoBoardId={cocoBoardId} />
    </ErrorBoundary>
  );
}

function CocoBoardContent({ projectId, userId, cocoBoardId }: CocoBoardProps) {
  const { 
    currentBoard, 
    isLoading, 
    error,
    setCurrentBoard,
    setLoading,
    setError,
    reset,
  } = useCocoBoardStore();

  // Load CocoBoard on mount
  useEffect(() => {
    if (cocoBoardId) {
      loadCocoBoard();
    } else {
      createDemoCocoBoard();
    }

    return () => {
      reset();
    };
  }, [cocoBoardId, projectId]);

  const loadCocoBoard = async () => {
    setLoading(true);
    setError(null);

    try {
      const cocoBoard = await api.fetchCocoBoard(cocoBoardId!);
      setCurrentBoard(cocoBoard);
    } catch (err) {
      console.error('Error loading CocoBoard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load CocoBoard');
    } finally {
      setLoading(false);
    }
  };

  const createDemoCocoBoard = async () => {
    setLoading(true);
    setError(null);

    try {
      const mockAnalysis = {
        projectTitle: 'Premium Luxury Watch Advertisement',
        concept: {
          mainConcept: 'Timeless elegance meets modern craftsmanship',
          visualStyle: 'Ultra-premium, sophisticated, minimalist with dramatic impact',
          targetEmotion: 'Desire, exclusivity, aspiration, prestige',
          keyMessage: 'Excellence in every detail'
        },
        referenceAnalysis: {
          patterns: ['Minimal composition', 'Dramatic lighting', 'Negative space mastery'],
          styleNotes: 'Professional studio photography with cinematic quality',
          colorInsights: ['Deep blacks', 'Golden hour warmth', 'Platinum accents']
        },
        composition: {
          layout: 'centered with asymmetric balance',
          hierarchy: ['Hero Product', 'Brand Story', 'Emotional Trigger'],
          zones: []
        },
        colorPalette: {
          primary: ['#0A0A0A', '#1A1716'],
          accent: ['#D4A574', '#E8B298', '#C9A96E'],
          background: ['#FFFEF9', '#F5F0E8'],
          text: ['#2A2420', '#8B7355'],
          rationale: 'Sophisticated coconut-inspired palette with premium feel'
        },
        assetsRequired: {
          missing: [],
          canGenerate: true,
          multiPassNeeded: false
        },
        finalPrompt: {
          scene: 'Luxury product studio with dramatic three-point lighting and atmospheric haze',
          subjects: [],
          style: 'Ultra high-end commercial photography, cinematic quality, award-winning composition',
          color_palette: ['#0A0A0A', '#D4A574', '#FFFEF9'],
          lighting: 'Dramatic Rembrandt lighting with soft key, rim light accents, subtle fill',
          composition: 'Rule of thirds with asymmetric balance, generous negative space, visual breathing room',
          mood: 'Sophisticated, prestigious, timeless, aspirational'
        },
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
        recommendations: {
          generationApproach: 'single-pass' as const,
          rationale: 'Premium single-pass generation for maximum quality'
        }
      };

      try {
        const cocoBoard = await api.createCocoBoard(projectId, userId, mockAnalysis);
        setCurrentBoard(cocoBoard);
        console.log('✅ CocoBoard created via API');
      } catch (apiError) {
        console.warn('📊 API unavailable, using premium mock CocoBoard');
        const mockCocoBoard = {
          id: `cocoboard-demo-${Date.now()}`,
          projectId,
          userId,
          analysis: mockAnalysis,
          finalPrompt: mockAnalysis.finalPrompt,
          references: [],
          specs: mockAnalysis.technicalSpecs,
          cost: mockAnalysis.estimatedCost,
          status: 'ready' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setCurrentBoard(mockCocoBoard);
      }
    } catch (err) {
      console.error('Error creating CocoBoard:', err);
      setError(err instanceof Error ? err.message : 'Failed to create CocoBoard');
    } finally {
      setLoading(false);
    }
  };

  // Update functions
  const updatePrompt = (newPrompt: any) => {
    if (currentBoard) {
      setCurrentBoard({ ...currentBoard, finalPrompt: newPrompt });
    }
  };

  const addReference = (ref: any) => {
    if (currentBoard) {
      setCurrentBoard({ 
        ...currentBoard, 
        references: [...currentBoard.references, ref] 
      });
    }
  };

  const removeReference = (id: string) => {
    if (currentBoard) {
      setCurrentBoard({ 
        ...currentBoard, 
        references: currentBoard.references.filter(r => r.id !== id) 
      });
    }
  };

  const updateBoard = (updates: any) => {
    if (currentBoard) {
      setCurrentBoard({ ...currentBoard, ...updates });
    }
  };

  const updateSpecs = (specs: any) => {
    if (currentBoard) {
      setCurrentBoard({ ...currentBoard, specs });
    }
  };

  // Loading state with premium skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--coconut-white)]">
        {/* Animated background */}
        <div className="fixed inset-0 bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] opacity-60" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SkeletonCard className="h-24" />
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <SkeletonCard className="h-96" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <SkeletonCard className="h-96" />
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <SkeletonCard className="h-64" />
          </motion.div>
        </div>
      </div>
    );
  }

  // Error state with premium UI
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-white)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          {/* Glass card with intense blur */}
          <div 
            className="relative bg-white/80 backdrop-blur-[40px] rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-white/40"
            style={{
              boxShadow: '0 8px 32px rgba(139, 115, 85, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.4) inset'
            }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-red-400/20 to-red-500/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6 border border-red-200/40">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-center text-[var(--coconut-shell)] mb-3">Failed to Load CocoBoard</h2>
            <p className="text-center text-[var(--coconut-husk)] mb-8">{error}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => cocoBoardId ? loadCocoBoard() : createDemoCocoBoard()}
              className="w-full px-6 py-3 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-husk)] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // No board loaded
  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-white)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--coconut-shell)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--coconut-husk)]">Loading CocoBoard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--coconut-white)] relative overflow-hidden">
      {/* Premium animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] opacity-60" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,165,116,0.08)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,115,85,0.06)_0%,transparent_50%)]" />

      {/* Header */}
      <div className="relative">
        <CocoBoardHeader 
          projectId={projectId}
          userId={userId}
          board={currentBoard}
        />
      </div>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Overview Section - Premium Glass Cards */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 rounded-3xl blur-xl opacity-50" />
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/60">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-xl flex items-center justify-center backdrop-blur-xl border border-white/40">
                    <Sparkles className="w-6 h-6 text-[var(--coconut-shell)]" />
                  </div>
                  <div>
                    <h2 className="text-2xl text-[var(--coconut-shell)]">CocoBoard Overview</h2>
                    <p className="text-sm text-[var(--coconut-husk)]">Premium creative orchestration workspace</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Project Card */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-600/10 rounded-xl" />
                    <div className="relative bg-white/50 backdrop-blur-xl rounded-xl p-5 border border-white/40 shadow-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-xs text-blue-700/70">Project</div>
                      </div>
                      <div className="text-base text-blue-900">{currentBoard.analysis.projectTitle}</div>
                    </div>
                  </motion.div>

                  {/* Status Card */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-purple-600/10 rounded-xl" />
                    <div className="relative bg-white/50 backdrop-blur-xl rounded-xl p-5 border border-white/40 shadow-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-xs text-purple-700/70">Status</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-base text-purple-900 capitalize">{currentBoard.status}</div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Cost Card */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-amber-600/10 rounded-xl" />
                    <div className="relative bg-white/50 backdrop-blur-xl rounded-xl p-5 border border-white/40 shadow-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-xs text-amber-700/70">Total Cost</div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <div className="text-xl text-amber-900">{currentBoard.cost.total}</div>
                        <div className="text-xs text-amber-700/70">credits</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.section>

            {/* Concept Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-palm)]/20 to-[var(--coconut-sunset)]/20 rounded-3xl blur-xl opacity-50" />
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/60">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-palm)]/20 to-[var(--coconut-sunset)]/20 rounded-xl flex items-center justify-center backdrop-blur-xl border border-white/40">
                    <Palette className="w-6 h-6 text-[var(--coconut-palm)]" />
                  </div>
                  <div>
                    <h2 className="text-2xl text-[var(--coconut-shell)]">Creative Concept</h2>
                    <p className="text-sm text-[var(--coconut-husk)]">AI-analyzed creative direction</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/40 backdrop-blur-xl rounded-xl p-5 border border-white/40">
                    <div className="text-xs text-[var(--coconut-husk)] mb-2">Main Concept</div>
                    <div className="text-[var(--coconut-shell)]">{currentBoard.analysis.concept.mainConcept}</div>
                  </div>
                  
                  <div className="bg-white/40 backdrop-blur-xl rounded-xl p-5 border border-white/40">
                    <div className="text-xs text-[var(--coconut-husk)] mb-2">Visual Style</div>
                    <div className="text-[var(--coconut-shell)]">{currentBoard.analysis.concept.visualStyle}</div>
                  </div>
                  
                  <div className="bg-white/40 backdrop-blur-xl rounded-xl p-5 border border-white/40">
                    <div className="text-xs text-[var(--coconut-husk)] mb-2">Target Emotion</div>
                    <div className="text-[var(--coconut-shell)]">{currentBoard.analysis.concept.targetEmotion}</div>
                  </div>
                  
                  <div className="bg-white/40 backdrop-blur-xl rounded-xl p-5 border border-white/40">
                    <div className="text-xs text-[var(--coconut-husk)] mb-2">Key Message</div>
                    <div className="text-[var(--coconut-shell)]">{currentBoard.analysis.concept.keyMessage}</div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Prompt Editor Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-50" />
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/60">
                <div className="p-8 pb-0">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center backdrop-blur-xl border border-white/40">
                      <Settings2 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl text-[var(--coconut-shell)]">Final Prompt Editor</h2>
                      <p className="text-sm text-[var(--coconut-husk)]">Fine-tune your creative prompt</p>
                    </div>
                  </div>
                </div>
                <div className="px-8 pb-8">
                  <PromptEditor
                    value={currentBoard.finalPrompt}
                    onChange={(newPrompt) => updatePrompt(newPrompt)}
                    height="500px"
                  />
                </div>
              </div>
            </motion.section>

            {/* References Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-3xl blur-xl opacity-50" />
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/60">
                <ReferencesManager
                  references={currentBoard.references}
                  onAdd={(ref) => addReference(ref)}
                  onRemove={(id) => removeReference(id)}
                  onReorder={(refs) => updateBoard({ references: refs })}
                  onUpdate={(id, updates) => {
                    const updatedRefs = currentBoard.references.map(r =>
                      r.id === id ? { ...r, ...updates } : r
                    );
                    updateBoard({ references: updatedRefs });
                  }}
                  maxReferences={8}
                />
              </div>
            </motion.section>

            {/* Specs Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-50" />
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/60">
                <h2 className="text-2xl text-[var(--coconut-shell)] mb-6">Technical Specifications</h2>
                <SpecsAdjuster
                  specs={{
                    model: currentBoard.specs.model,
                    mode: currentBoard.specs.mode,
                    ratio: currentBoard.specs.ratio,
                    resolution: currentBoard.specs.resolution
                  }}
                  onChange={(specs) => updateSpecs(specs)}
                />
              </div>
            </motion.section>

            {/* Cost Calculator Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-3xl blur-xl opacity-50" />
              <div className="relative bg-white/70 backdrop-blur-[60px] rounded-2xl shadow-xl p-8 border border-white/60">
                <h2 className="text-2xl text-[var(--coconut-shell)] mb-6">Cost Estimation</h2>
                <CostCalculator
                  specs={{
                    model: currentBoard.specs.model,
                    mode: currentBoard.specs.mode,
                    ratio: currentBoard.specs.ratio,
                    resolution: currentBoard.specs.resolution,
                    referencesCount: currentBoard.references.length
                  }}
                  userCredits={1000}
                  showBreakdown={true}
                />
              </div>
            </motion.section>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}