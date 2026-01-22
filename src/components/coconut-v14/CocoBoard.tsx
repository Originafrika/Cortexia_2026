/**
 * COCONUT V14 - COCOBOARD COMPONENT
 * Ultra-Premium Liquid Glass Design
 * 
 * ✅ FIXED: BDS Compliance Phase 2B
 * - Design tokens integration
 * - Error handler centralized
 * - Auto-save interval: 30s → 120s
 * - SpecsModal timing optimized
 * - Max-width container
 * - French messages
 * 
 * Features:
 * - Intense frosted glass effects
 * - Smooth motion animations
 * - Coconut theme colors
 * - BDS 7 Arts compliance
 * - WCAG 2.1 AA accessible
 * - Optimized performance with state management
 * 
 * Performance Notes:
 * - Child components (PromptEditor, ReferencesManager, etc.) handle their own memoization
 * - Update functions use full board spread for simplicity (production: use immer or zustand with selectors)
 * - Animations use GPU-accelerated properties (transform, opacity)
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 2A: Import sound
import { useCocoBoardStore } from '../../lib/stores/cocoboard-store';
import { useBreakpoint, useIsMobile } from '../../lib/hooks/useBreakpoint'; // 📱 PHASE 8
import { CocoBoardHeader } from './CocoBoardHeader';
import { CocoBoardOverview } from './CocoBoardOverview';
import { CocoBoardSidebarPremium } from './CocoBoardSidebarPremium'; // 🆕 PREMIUM SIDEBAR
import { PromptEditor } from './PromptEditor';
import { ReferencesManager } from './ReferencesManager';
import { SpecsAdjuster } from './SpecsAdjuster';
import { CostCalculator } from './CostCalculator';
import { GenerationView } from './GenerationView';
import { IterationsGallery } from './IterationsGallery';
import { SpecsInputModal } from './SpecsInputModal';
import { CostWidget } from './CostWidget';
import { ModeSelector, type GenerationMode } from './ModeSelector'; // 🆕 PHASE 3C
import { GenerationPreviewModal } from './GenerationPreviewModal'; // 🆕 PHASE 3D
import { AdvancedModeIndicator } from './AdvancedModeIndicator'; // 🆕 PHASE 3D
import { AdvancedErrorBoundary as ErrorBoundary } from './AdvancedErrorBoundary'; // ✅ FIXED: Use AdvancedErrorBoundary instead of ui-premium
import { Skeleton } from '../ui/skeleton'; // ✅ FIXED: Use shadcn skeleton instead of ui-premium
import { Loader2, AlertCircle, Sparkles, Zap, Palette, Settings2, Image as ImageIcon } from 'lucide-react';
import { api } from '../../lib/api/client';
import { toast } from 'sonner@2.0.3';
import type { GeminiAnalysisResponse } from '../../lib/types/gemini';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { buildTextPromptFromJSON } from '../../lib/utils/promptUtils';
import { useAutoSave } from '../../lib/hooks/useAutoSave';
import { useCredits } from '../../lib/contexts/CreditsContext';
import { tokens, TRANSITIONS } from '../../lib/design/tokens';
import { handleError, showSuccess, showWarning } from '../../lib/utils/errorHandler';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

interface CocoBoardProps {
  projectId: string;
  userId: string;
  cocoBoardId?: string;
  analysis?: GeminiAnalysisResponse; // 🆕 Accept Gemini analysis directly
  uploadedReferences?: {  // 🆕 Accept uploaded references with URLs
    images: Array<{ url: string; description?: string; filename: string }>;
    videos: Array<{ url: string; description?: string; filename: string }>;
  } | null;
  onGenerationStart?: (generationId: string) => void; // 🆕 Callback when generation starts
}

export function CocoBoard({ projectId, userId, cocoBoardId, analysis, uploadedReferences, onGenerationStart }: CocoBoardProps) {
  return (
    <ErrorBoundary>
      <CocoBoardContent 
        projectId={projectId} 
        userId={userId} 
        cocoBoardId={cocoBoardId} 
        analysis={analysis} 
        uploadedReferences={uploadedReferences}
        onGenerationStart={onGenerationStart}
      />
    </ErrorBoundary>
  );
}

function CocoBoardContent({ projectId, userId, cocoBoardId, analysis, uploadedReferences, onGenerationStart }: CocoBoardProps) {
  // 🔊 PHASE 2A: Sound context
  const { playClick, playWhoosh, playSuccess, playError } = useSoundContext();
  
  const { 
    currentBoard, 
    isLoading, 
    error,
    setCurrentBoard,
    setLoading,
    setError,
    reset,
  } = useCocoBoardStore();

  // ✅ P0-07: Get user credits for CostWidget
  const { getCoconutCredits } = useCredits();
  const totalCredits = getCoconutCredits(); // ✅ Coconut V14 uses ONLY paid credits

  // Local state for UX indicators
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // 🆕 PHASE 3C: Generation mode state
  const [generationMode, setGenerationMode] = useState<GenerationMode>('auto');
  
  // 🆕 PHASE 3D: Preview modal state for semi-auto mode
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // ✅ P0-06: Auto-save hook
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
    interval: 120000, // ✅ FIXED: 120 seconds (2 min) instead of 30s - less intrusive
    onError: (error) => {
      handleError(error, 'CocoBoard Auto-save', {
        toast: true,
        log: true,
        showDetails: false,
      });
    }
  });

  // 🆕 User specs input modal state
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [specsInputData, setSpecsInputData] = useState<{
    productName: string;
    prompt: string;
    suggestions: string[];
    subjectIndex: number;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false); // ✅ ADD: Track generation state

  // 🆕 Detect if user input needed when board loads
  useEffect(() => {
    if (!currentBoard?.finalPrompt?.subjects || showSpecsModal) return; // ✅ FIX: Don't re-check if modal already open
    
    console.log('🔍 Checking if user specs input needed...');
    
    // Find subject with userInputRequired flag
    const subjectNeedingInput = currentBoard.finalPrompt.subjects.findIndex(
      (subject: any) => subject.userInputRequired === true
    );
    
    if (subjectNeedingInput !== -1) {
      const subject = currentBoard.finalPrompt.subjects[subjectNeedingInput];
      console.log('⚠️ User specs input REQUIRED for subject:', subject);
      
      // Extract product name from project title or description
      const productName = extractProductName(currentBoard.analysis?.projectTitle || 'le produit');
      
      setSpecsInputData({
        productName,
        prompt: (subject as any).prompt || 'Quelles sont les caractéristiques clés à afficher ?',
        suggestions: (subject as any).suggestions || [
          '100% Naturel | Sans Sucre Ajouté | Riche en Vitamine C',
          '100% Bio | Pressé à Froid | Sans Additif',
          'Origine France | Pur Jus | Zéro Calorie',
        ],
        subjectIndex: subjectNeedingInput,
      });
      
      setShowSpecsModal(true);
    }
  }, [currentBoard?.id]); // ✅ FIX: Only run when board ID changes, not on every update

  // 🆕 Extract product name from project title
  const extractProductName = (title: string): string => {
    // Try to extract product name from patterns like:
    // "Pub Nabo Citron" -> "Nabo Citron"
    // "Advertisement for Coca-Cola Zero" -> "Coca-Cola Zero"
    const patterns = [
      /pub\s+(.+)/i,
      /advertisement\s+for\s+(.+)/i,
      /ad\s+for\s+(.+)/i,
      /campaign\s+for\s+(.+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // Fallback: return full title
    return title;
  };

  // 🆕 Handle specs submission from modal
  const handleSpecsSubmit = async (specs: string) => {
    if (!currentBoard || !specsInputData) return;
    
    console.log('✅ User submitted specs:', specs);
    
    try {
      // Update the subject with user-provided specs
      const updatedSubjects = [...currentBoard.finalPrompt.subjects];
      const currentSubject = updatedSubjects[specsInputData.subjectIndex];
      
      // ✅ FIX: Replace [USER_SPECS_REQUIRED] in description while preserving format
      // Instead of rebuilding the description, just replace the placeholder
      let newDescription = currentSubject.description;
      if (newDescription.includes('[USER_SPECS_REQUIRED]')) {
        newDescription = newDescription.replace('[USER_SPECS_REQUIRED]', specs);
      } else {
        // Fallback: rebuild if no placeholder found (shouldn't happen)
        newDescription = `Product specs grid text '${specs}', size 14pt, font-weight 300`;
      }
      
      updatedSubjects[specsInputData.subjectIndex] = {
        ...currentSubject,
        description: newDescription,
        userInputRequired: false,
      };
      
      const updatedPrompt = {
        ...currentBoard.finalPrompt,
        subjects: updatedSubjects,
      };
      
      const updatedBoard = {
        ...currentBoard,
        finalPrompt: updatedPrompt,
      };
      
      setCurrentBoard(updatedBoard);
      
      // ✅ CRITICAL FIX: MUST save to backend so generation can read updated specs
      // The server reads from KV store, not from our local state!
      console.log('💾 Saving updated board to backend...');
      console.log('🔗 API_BASE:', API_BASE);
      console.log('🆔 cocoBoardId:', currentBoard.id);
      console.log('📦 Payload:', { cocoBoardId: currentBoard.id, finalPrompt: updatedPrompt });
      
      const saveUrl = `${API_BASE}/coconut/cocoboard/update`;
      console.log('🌐 Full URL:', saveUrl);
      
      const saveResponse = await fetch(saveUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          cocoBoardId: currentBoard.id,
          finalPrompt: updatedPrompt,
        }),
      });
      
      console.log('📡 Response status:', saveResponse.status);
      console.log('📡 Response ok:', saveResponse.ok);
      
      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        console.error('❌ Backend error response:', errorText);
        throw new Error(`Failed to save updated specs: ${saveResponse.status} ${errorText}`);
      }
      
      const saveData = await saveResponse.json();
      console.log('✅ Specs saved to backend successfully:', saveData);
      
      showSuccess('Spécifications mises à jour', `Specs: ${specs}`);
      
      setShowSpecsModal(false);
      setSpecsInputData(null);
      
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Unknown error'), 'CocoBoard SpecsSubmit');
    }
  };

  // Load CocoBoard on mount
  useEffect(() => {
    console.log('🔄 CocoBoard useEffect triggered', { cocoBoardId, projectId, hasAnalysis: !!analysis });
    
    if (cocoBoardId) {
      console.log('📥 Loading existing CocoBoard:', cocoBoardId);
      loadCocoBoard();
    } else if (analysis) {
      console.log('🧠 Creating CocoBoard from Gemini analysis');
      createCocoBoardFromAnalysis(analysis);
    } else {
      console.log('🆕 Creating demo CocoBoard');
      createDemoCocoBoard();
    }

    return () => {
      reset();
    };
  }, [cocoBoardId, projectId, analysis]);

  const loadCocoBoard = async () => {
    console.log('⏳ loadCocoBoard START');
    setLoading(true);
    setError(null);

    try {
      console.log('📡 Fetching CocoBoard from API...');
      const cocoBoard = await api.fetchCocoBoard(cocoBoardId!);
      console.log('✅ CocoBoard loaded successfully:', cocoBoard);
      setCurrentBoard(cocoBoard);
    } catch (err) {
      console.error('❌ Error loading CocoBoard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load CocoBoard');
    } finally {
      console.log('🏁 loadCocoBoard END - setting loading to false');
      setLoading(false);
    }
  };
  
  // 🆕 Create CocoBoard from Gemini analysis
  const createCocoBoardFromAnalysis = async (geminiAnalysis: GeminiAnalysisResponse) => {
    console.log('⏳ createCocoBoardFromAnalysis START');
    setLoading(true);
    setError(null);

    try {
      console.log('🧠 Using Gemini analysis to create CocoBoard');
      
      // ✅ FIXED: Use uploaded references with URLs instead of empty URLs
      const referencesWithUrls = uploadedReferences?.images || [];
      console.log('📸 Using uploaded references:', referencesWithUrls);
      
      // ✅ CRITICAL FIX: Generate proper ID format immediately
      const generatedId = `cocoboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log('🆔 Generated CocoBoard ID:', generatedId);
      
      // ✅ DEBUG: Verify finalPrompt type BEFORE creating CocoBoard
      console.log('🔍 [PRE-CREATE] finalPrompt type:', typeof geminiAnalysis.finalPrompt);
      console.log('🔍 [PRE-CREATE] Constructor:', geminiAnalysis.finalPrompt?.constructor?.name);
      console.log('🔍 [PRE-CREATE] Is corrupted object?:', typeof geminiAnalysis.finalPrompt === 'object' && '0' in geminiAnalysis.finalPrompt);
      
      // ✅ CRITICAL FIX: Clean the finalPrompt if it's corrupted by Gemini
      let cleanFinalPrompt: string = '';
      
      if (typeof geminiAnalysis.finalPrompt === 'object' && '0' in geminiAnalysis.finalPrompt) {
        // Corrupted object with numeric keys - reconstruct the string
        console.log('🔧 Reconstructing finalPrompt from object format...');
        cleanFinalPrompt = Object.values(geminiAnalysis.finalPrompt).join('');
        console.log('✅ Reconstructed prompt length:', cleanFinalPrompt.length);
      } else if (typeof geminiAnalysis.finalPrompt === 'string') {
        cleanFinalPrompt = geminiAnalysis.finalPrompt;
      } else {
        console.error('❌ Unexpected finalPrompt type:', typeof geminiAnalysis.finalPrompt);
        cleanFinalPrompt = String(geminiAnalysis.finalPrompt);
      }
      
      // Remove appended metadata (mood, style, color_palette, subjects)
      // Pattern: ends with "Professionnel, moderne, épuré" + "Modern, Clean, Professional" + hex codes
      const metadataPattern = /(Professionnel.*?épuré)(Modern.*?Minimal)(#[A-F0-9]{6}.*?\])(\{\}|\[\])?$/i;
      // Simpler approach: find "Professionnel" and remove everything from there to the end
      const professionnelIndex = cleanFinalPrompt.lastIndexOf('Professionnel');
      if (professionnelIndex > 0 && cleanFinalPrompt.length - professionnelIndex < 200) {
        console.log('🔧 Cleaning appended metadata from finalPrompt...');
        const originalLength = cleanFinalPrompt.length;
        // Find the last period or word boundary before "Professionnel"
        const beforeProfessionnel = cleanFinalPrompt.substring(0, professionnelIndex);
        const lastPeriod = beforeProfessionnel.lastIndexOf('.');
        if (lastPeriod > 0) {
          cleanFinalPrompt = cleanFinalPrompt.substring(0, lastPeriod + 1).trim();
          console.log(`✅ Removed ${originalLength - cleanFinalPrompt.length} characters of metadata`);
          console.log('✅ Cleaned prompt length:', cleanFinalPrompt.length);
        }
      }
      
      console.log('🔍 [POST-CLEAN] finalPrompt type:', typeof cleanFinalPrompt);
      console.log('🔍 [POST-CLEAN] Preview:', cleanFinalPrompt.substring(0, 100) + '...');
      
      const newCocoBoard = {
        id: generatedId, // ✅ Use proper ID format from the start
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
          // ✅ CRITICAL FIX: Use cleaned prompt
          finalPrompt: cleanFinalPrompt,
          technicalSpecs: geminiAnalysis.technicalSpecs,
          estimatedCost: geminiAnalysis.estimatedCost,
          recommendations: geminiAnalysis.recommendations,
        },
        // ✅ CRITICAL FIX: Use cleaned prompt
        finalPrompt: cleanFinalPrompt,
        references: referencesWithUrls.map((ref, index) => ({
          id: `user-ref-img-${index + 1}`,
          url: ref.url, // ✅ FIXED: Use real uploaded URL
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
          // ✅ FIXED: Store full reference objects with URLs, not just IDs
          referenceUrls: referencesWithUrls.map(ref => ({
            id: `user-ref-img-${referencesWithUrls.indexOf(ref) + 1}`,
            url: ref.url,
            filename: ref.filename,
          })),
        },
        cost: geminiAnalysis.estimatedCost,
        status: 'validated' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // ✅ DEBUG: Verify finalPrompt type AFTER creating CocoBoard
      console.log('🔍 [POST-CREATE] root finalPrompt type:', typeof newCocoBoard.finalPrompt);
      console.log('🔍 [POST-CREATE] analysis.finalPrompt type:', typeof newCocoBoard.analysis.finalPrompt);
      console.log('🔍 [POST-CREATE] root is string?:', typeof newCocoBoard.finalPrompt === 'string');
      console.log('🔍 [POST-CREATE] analysis is string?:', typeof newCocoBoard.analysis.finalPrompt === 'string');
      
      console.log('✅ CocoBoard created from Gemini analysis:', newCocoBoard);
      
      // 🆕 SAVE TO BACKEND - Critical fix!
      console.log('💾 Saving CocoBoard to backend...');
      try {
        const backendUrl = `${API_BASE}/coconut/cocoboard/create`;
        console.log('📍 Backend URL:', backendUrl);
        
        const payload = {
          projectId,
          userId,
          analysis: newCocoBoard.analysis,
          finalPrompt: newCocoBoard.finalPrompt, // ✅ ADD: Include finalPrompt
          references: newCocoBoard.references,
          specs: newCocoBoard.specs,
          cost: newCocoBoard.cost, // ✅ ADD: Include cost
        };
        console.log('📦 Payload:', JSON.stringify(payload, null, 2).substring(0, 500) + '...');
        
        const saveResponse = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`, // ✅ Use publicAnonKey, not projectId
          },
          body: JSON.stringify(payload),
        });

        console.log('📥 Backend response status:', saveResponse.status);
        const responseText = await saveResponse.text();
        console.log('📄 Backend response:', responseText);

        if (!saveResponse.ok) {
          let errorData;
          try {
            errorData = JSON.parse(responseText);
          } catch {
            errorData = { error: responseText };
          }
          console.error('❌ Backend save failed:', errorData);
          throw new Error(errorData.error || errorData.message || 'Failed to save CocoBoard to backend');
        }

        const savedData = JSON.parse(responseText);
        console.log('✅ CocoBoard saved to backend:', savedData.data);
        
        // ✅ FIX: Validate that backend returned an ID
        if (!savedData.data || !savedData.data.id) {
          console.error('❌ Backend response missing ID:', savedData);
          throw new Error('Backend did not return a valid CocoBoard ID');
        }
        
        console.log('✅ Backend-generated CocoBoard ID:', savedData.data.id);
        
        // Use the backend-generated CocoBoard ID but keep our references
        const savedBoard = {
          ...savedData.data,
          references: newCocoBoard.references,
          specs: newCocoBoard.specs,
        };
        
        console.log('✅ Final savedBoard with ID:', savedBoard.id);
        setCurrentBoard(savedBoard);
        
        showSuccess('CocoBoard créé et sauvegardé', 'Prêt pour la génération');
        
      } catch (saveError) {
        console.error('❌ Failed to save CocoBoard to backend:', saveError);
        // ✅ FIX 1.3: Fail explicitly instead of fake success with local board
        toast.error('Erreur de sauvegarde', {
          description: 'Impossible de créer le CocoBoard. Vérifiez votre connexion.',
          action: {
            label: 'Réessayer',
            onClick: () => {
              // Retry the creation
              handleCreateFromAnalysis();
            }
          }
        });
        throw saveError; // ✅ Don't fake success
      }
      
    } catch (err) {
      console.error('❌ Error creating CocoBoard from analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to create CocoBoard from analysis');
    } finally {
      console.log('🏁 createCocoBoardFromAnalysis END');
      setLoading(false);
    }
  };

  const createDemoCocoBoard = async () => {
    console.log('⏳ createDemoCocoBoard START');
    setLoading(true);
    setError(null);

    try {
      console.log('📊 Creating mock analysis...');
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

      console.log('✅ Mock analysis created');

      // In demo mode, use mock directly instead of hitting API
      // This avoids the 15-20 second retry delay
      console.log('⚡ Demo mode: Using mock CocoBoard directly (no API call)');
      
      const mockCocoBoard = {
        id: `cocoboard-demo-${Date.now()}`,
        projectId,
        userId,
        analysis: mockAnalysis,
        finalPrompt: mockAnalysis.finalPrompt,
        references: [],
        specs: mockAnalysis.technicalSpecs,
        cost: mockAnalysis.estimatedCost,
        status: 'validated' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('✅ Mock CocoBoard created:', mockCocoBoard);
      setCurrentBoard(mockCocoBoard);
      
    } catch (err) {
      console.error('❌ Fatal error creating CocoBoard:', err);
      setError(err instanceof Error ? err.message : 'Failed to create CocoBoard');
    } finally {
      console.log('🏁 createDemoCocoBoard END - setting loading to false');
      setLoading(false);
    }
  };

  // Update functions
  const updatePrompt = (newPrompt: any) => {
    if (currentBoard) {
      setCurrentBoard({ ...currentBoard, finalPrompt: newPrompt });
      toast.success('Prompt updated successfully', {
        description: 'Your creative prompt has been saved',
      });
      setIsDirty(true);
    }
  };

  const addReference = (ref: any) => {
    if (currentBoard) {
      setCurrentBoard({ 
        ...currentBoard, 
        references: [...currentBoard.references, ref] 
      });
      toast.success('Reference added', {
        description: `${currentBoard.references.length + 1}/${8} references`,
      });
      setIsDirty(true);
    }
  };

  const removeReference = (id: string) => {
    if (currentBoard) {
      setCurrentBoard({ 
        ...currentBoard, 
        references: currentBoard.references.filter(r => r.id !== id) 
      });
      toast.success('Reference removed', {
        description: `${currentBoard.references.length - 1}/${8} references remaining`,
      });
      setIsDirty(true);
    }
  };

  const updateBoard = (updates: any) => {
    if (currentBoard) {
      setCurrentBoard({ ...currentBoard, ...updates });
      toast.success('CocoBoard updated', {
        description: 'Changes saved successfully',
      });
      setIsDirty(true);
    }
  };

  const updateSpecs = (specs: any) => {
    if (currentBoard) {
      setCurrentBoard({ ...currentBoard, specs });
      toast.success('Specifications updated', {
        description: `${specs.model} • ${specs.ratio} • ${specs.resolution}`,
      });
      setIsDirty(true);
    }
  };

  // 🆕 Manual save function for sidebar
  const handleManualSave = async () => {
    if (!currentBoard) {
      toast.error('Erreur', { description: 'Aucun CocoBoard à sauvegarder.' });
      return;
    }

    try {
      setIsSaving(true);
      playClick();
      
      console.log('💾 Manual save triggered...');
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

      if (!response.ok) {
        throw new Error('Save failed');
      }

      setIsDirty(false);
      setLastSaved(new Date());
      playSuccess();
      toast.success('Sauvegardé', { description: 'Vos modifications ont été enregistrées.' });
      console.log('✅ Manual save successful');
    } catch (error) {
      console.error('❌ Manual save error:', error);
      playError();
      toast.error('Erreur de sauvegarde', {
        description: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ NEW: Toggle brand guidelines for this project
  const handleToggleBrandGuidelines = async (enabled: boolean) => {
    if (!currentBoard) return;
    
    try {
      playClick();
      
      // Update local state
      setCurrentBoard({ ...currentBoard, useBrandGuidelines: enabled });
      setIsDirty(true);
      
      // Show toast
      toast.success(
        enabled ? 'Brand guidelines activées' : 'Brand guidelines désactivées',
        { 
          description: enabled 
            ? 'Votre identité de marque sera appliquée aux générations' 
            : 'Les générations utiliseront uniquement le prompt'
        }
      );
      
      console.log(`✅ Brand guidelines ${enabled ? 'enabled' : 'disabled'} for project`);
    } catch (error) {
      console.error('❌ Error toggling brand guidelines:', error);
      playError();
      toast.error('Erreur', { description: 'Impossible de modifier les paramètres de marque' });
    }
  };

  // ✅ NEW: Handle generation click (PHASE 3D: Mode-aware)
  const handleGenerateNow = async () => {
    console.log('🎯 handleGenerateNow called');
    console.log('🎨 Generation mode:', generationMode);
    console.log('📦 currentBoard:', JSON.stringify(currentBoard, null, 2));
    
    if (!currentBoard) {
      console.error('❌ currentBoard is null/undefined');
      toast.error('Erreur système', {
        description: 'CocoBoard non chargé.',
      });
      return;
    }
    
    // ✅ NEW CHECK: Block generation if user specs are required but not filled
    const hasUserSpecsRequired = currentBoard.finalPrompt?.subjects?.some(
      (subject: any) => 
        subject.description?.includes('[USER_SPECS_REQUIRED]') ||
        subject.userInputRequired === true
    );
    
    if (hasUserSpecsRequired) {
      console.warn('⚠️ User specs required but not filled yet');
      toast.warning('Spécifications requises', {
        description: 'Veuillez remplir les spécifications du produit avant de générer.',
      });
      
      // Re-open the specs modal if it was closed
      if (!showSpecsModal) {
        const subjectNeedingInput = currentBoard.finalPrompt.subjects.findIndex(
          (subject: any) => 
            subject.description?.includes('[USER_SPECS_REQUIRED]') ||
            subject.userInputRequired === true
        );
        
        if (subjectNeedingInput !== -1) {
          const subject = currentBoard.finalPrompt.subjects[subjectNeedingInput];
          const productName = extractProductName(
            currentBoard.analysis?.projectTitle || projectId || 'votre produit'
          );
          
          setSpecsInputData({
            productName,
            prompt: (subject as any).userInputPrompt || 
                   `Quelles sont les caractéristiques clés de ${productName} ?`,
            suggestions: (subject as any).suggestions || [
              '100% Naturel | Sans Sucre Ajouté | Riche en Vitamine C',
              '100% Bio | Pressé à Froid | Sans Additif',
              'Origine France | Pur Jus | Zéro Calorie',
            ],
            subjectIndex: subjectNeedingInput,
          });
          
          setShowSpecsModal(true);
        }
      }
      
      return; // ❌ BLOCK GENERATION
    }
    
    // ✅ CHECK 1: Validate cocoBoardId
    console.log('🆔 currentBoard.id:', currentBoard.id);
    console.log('🆔 Type of currentBoard.id:', typeof currentBoard.id);
    
    if (!currentBoard.id) {
      console.error('❌ Missing cocoBoardId in currentBoard:', {
        id: currentBoard.id,
        hasId: 'id' in currentBoard,
        keys: Object.keys(currentBoard),
        fullBoard: currentBoard
      });
      toast.error('Erreur système', {
        description: 'ID du CocoBoard manquant. Veuillez réessayer.',
      });
      return;
    }
    
    // ✅ CHECK 2: Block if already generating
    if (isGenerating) {
      console.warn('⚠️ Generation already in progress, skipping...');
      return;
    }
    
    // ✅ CHECK 3: Validate finalPrompt exists and is FluxPrompt object
    if (!currentBoard.finalPrompt || typeof currentBoard.finalPrompt !== 'object') {
      console.error('❌ Invalid finalPrompt type:', typeof currentBoard.finalPrompt);
      toast.error('Prompt invalide', {
        description: 'Le prompt de génération est invalide ou manquant.',
      });
      return;
    }
    
    // ✅ CHECK 3.1: Validate finalPrompt structure
    if (!currentBoard.finalPrompt.scene || 
        !currentBoard.finalPrompt.subjects || 
        !Array.isArray(currentBoard.finalPrompt.subjects)) {
      console.error('❌ Invalid finalPrompt structure:', currentBoard.finalPrompt);
      toast.error('Prompt incomplet', {
        description: 'Le prompt ne contient pas tous les éléments requis (scene, subjects).',
      });
      return;
    }
    
    // ✅ CHECK 3.2: Validate subjects have required fields
    // ✅ FIX 7F: Position can be empty if integrated in description (Fix 7B)
    const invalidSubjects = currentBoard.finalPrompt.subjects.filter(
      (s: any) => !s.description
      // Position is no longer required as it's integrated in description (Fix 7B)
    );
    if (invalidSubjects.length > 0) {
      console.error('❌ Invalid subjects:', invalidSubjects);
      toast.error('Subjects incomplets', {
        description: `${invalidSubjects.length} subject(s) manquent de description.`,
      });
      return;
    }
    
    // ✅ Preview text prompt that will be sent to Kie AI
    const textPromptPreview = buildTextPromptFromJSON(currentBoard.finalPrompt);
    
    // 🆕 PHASE 3D: Handle different generation modes
    if (generationMode === 'semi-auto') {
      // Semi-Auto: Show preview modal for confirmation
      console.log('🔵 Semi-Auto mode: Opening preview modal');
      setShowPreviewModal(true);
      return; // Exit here, actual generation will happen after modal confirmation
    }
    
    if (generationMode === 'manual') {
      // Manuel: Ensure user has reviewed everything (already done via UI)
      // Additional validation could be added here if needed
      console.log('🟢 Manuel mode: User has full control, proceeding');
    }
    
    if (generationMode === 'auto') {
      console.log('🟣 Auto mode: Direct generation');
    }
    
    // Continue with actual generation (Auto or Manual)
    await executeGeneration();
  };
  
  // 🆕 PHASE 3D: Extracted generation logic for reuse
  const executeGeneration = async () => {
    try {
      setIsGenerating(true);
      
      console.log('🚀 Starting generation for CocoBoard:', currentBoard.id);
      console.log('📊 CocoBoard details:', {
        id: currentBoard.id,
        projectId: currentBoard.projectId,
        type: 'FluxPrompt object',
        scene: currentBoard.finalPrompt.scene?.substring(0, 50) + '...',
        subjectsCount: currentBoard.finalPrompt.subjects.length,
        textPromptLength: textPromptPreview.length,
        hasReferences: currentBoard.references?.length > 0
      });
      
      // ✅ Warn if text prompt will be too long
      if (textPromptPreview.length > 5000) {
        console.warn(`⚠️ Text prompt will be ${textPromptPreview.length} chars (max 5000)`);
        toast.warning('Prompt très long', {
          description: `Le prompt sera tronqué à 5000 caractères (actuellement ${textPromptPreview.length}).`,
        });
      }
      
      const response = await fetch(`${API_BASE}/coconut/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          cocoBoardId: currentBoard.id,
          // ✅ Send the clean text prompt directly to override corrupted DB prompt
          overridePrompt: textPromptPreview,
        }),
      });
      
      console.log('📥 Generation start response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Generation start failed:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Generation started:', result);
      
      if (result.success) {
        toast.success('Génération démarrée !', {
          description: `Votre image est en cours de création...`,
        });
        if (onGenerationStart) {
          onGenerationStart(result.data.id);
        }
      } else {
        throw new Error(result.error || 'Failed to start generation');
      }
      
    } catch (error) {
      console.error('❌ Generation start error:', error);
      toast.error('Erreur de génération', {
        description: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    } finally {
      setIsGenerating(false);
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
            <Skeleton className="h-24 w-full rounded-lg" />
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Skeleton className="h-96 w-full rounded-lg" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Skeleton className="h-96 w-full rounded-lg" />
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Skeleton className="h-64 w-full rounded-lg" />
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
            <div className="w-20 h-20 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--coconut-husk)]/40">
              <AlertCircle className="w-10 h-10 text-[var(--coconut-shell)]" />
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
      <main className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <AnimatePresence mode="wait">
          {/* LAYOUT PREMIUM: Content (2/3) + Sidebar (1/3) */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* LEFT/CENTER: MAIN CONTENT (2/3) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:col-span-2 space-y-8"
            >
            {/* Overview Section - Full width in content area */}
            <div className="grid grid-cols-1 gap-6">
              {/* Overview Section - Premium Glass Cards */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 rounded-3xl blur-xl opacity-50" />
                <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 border border-white/60">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-xl flex items-center justify-center backdrop-blur-xl border border-white/40">
                      <Sparkles className="w-6 h-6 text-[var(--coconut-shell)]" />
                    </div>
                    <div>
                      <h2 className="text-2xl text-[var(--coconut-shell)]">Project Overview</h2>
                      <p className="text-sm text-[var(--coconut-shell)]/70">Creative orchestration workspace</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Project Card */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2, boxShadow: '0 12px 24px rgba(59, 130, 246, 0.2)' }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="group relative overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-[var(--coconut-shell)] focus-within:ring-offset-2 rounded-xl"
                      role="button"
                      tabIndex={0}
                      aria-label="View project details"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)]/10 to-[var(--coconut-husk)]/10 rounded-xl transition-opacity duration-300 group-hover:opacity-100 opacity-60" />
                      <div className="relative bg-white/50 backdrop-blur-xl rounded-xl p-5 border border-white/40 shadow-lg transition-all duration-300 group-hover:border-[var(--coconut-husk)]/60">
                        <div className="flex items-center gap-2 mb-3">
                          <motion.div 
                            className="w-8 h-8 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-lg flex items-center justify-center"
                            whileHover={{ rotate: 5 }}
                            transition={{ duration: 0.2 }}
                            aria-hidden="true"
                          >
                            <ImageIcon className="w-5 h-5 text-[var(--coconut-shell)] transition-transform duration-300 group-hover:scale-110" />
                          </motion.div>
                          <div className="text-sm text-[var(--coconut-husk)] transition-colors duration-300 group-hover:text-[var(--coconut-shell)]">Project</div>
                        </div>
                        <div className="text-lg text-[var(--coconut-shell)] line-clamp-2">{currentBoard.analysis.projectTitle}</div>
                      </div>
                    </motion.div>

                    {/* Status Card */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2, boxShadow: '0 12px 24px rgba(107, 142, 112, 0.2)' }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="group relative overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-[var(--coconut-palm)] focus-within:ring-offset-2 rounded-xl"
                      role="button"
                      tabIndex={0}
                      aria-label={`Project status: ${currentBoard.status}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)]/10 to-[var(--coconut-husk)]/10 rounded-xl transition-opacity duration-300 group-hover:opacity-100 opacity-60" />
                      <div className="relative bg-white/50 backdrop-blur-xl rounded-xl p-5 border border-white/40 shadow-lg transition-all duration-300 group-hover:border-[var(--coconut-husk)]/60">
                        <div className="flex items-center gap-2 mb-3">
                          <motion.div 
                            className="w-8 h-8 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-lg flex items-center justify-center"
                            whileHover={{ rotate: 5 }}
                            transition={{ duration: 0.2 }}
                            aria-hidden="true"
                          >
                            <Zap className="w-5 h-5 text-[var(--coconut-shell)] transition-transform duration-300 group-hover:scale-110" />
                          </motion.div>
                          <div className="text-sm text-[var(--coconut-husk)] transition-colors duration-300 group-hover:text-[var(--coconut-shell)]">Status</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg text-[var(--coconut-shell)] capitalize">{currentBoard.status}</div>
                          <div className="w-2 h-2 bg-[var(--coconut-palm)] rounded-full animate-pulse" aria-label="Active" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Cost Card */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2, boxShadow: '0 12px 24px rgba(245, 158, 11, 0.2)' }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="group relative overflow-hidden cursor-pointer focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 rounded-xl"
                      role="button"
                      tabIndex={0}
                      aria-label={`Total cost: ${currentBoard.cost.total} credits`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-husk)]/10 to-[var(--coconut-shell)]/10 rounded-xl transition-opacity duration-300 group-hover:opacity-100 opacity-60" />
                      <div className="relative bg-white/50 backdrop-blur-xl rounded-xl p-5 border border-white/40 shadow-lg transition-all duration-300 group-hover:border-[var(--coconut-husk)]/60">
                        <div className="flex items-center gap-2 mb-3">
                          <motion.div 
                            className="w-8 h-8 bg-gradient-to-br from-[var(--coconut-husk)]/20 to-[var(--coconut-shell)]/20 rounded-lg flex items-center justify-center"
                            whileHover={{ rotate: 5 }}
                            transition={{ duration: 0.2 }}
                            aria-hidden="true"
                          >
                            <Sparkles className="w-5 h-5 text-[var(--coconut-shell)] transition-transform duration-300 group-hover:scale-110" />
                          </motion.div>
                          <div className="text-sm text-[var(--coconut-shell)] transition-colors duration-300 group-hover:text-[var(--coconut-shell)]">Cost</div>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <div className="text-2xl text-[var(--coconut-shell)]">{currentBoard.cost.total}</div>
                          <div className="text-sm text-[var(--coconut-husk)]">credits</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.section>
            </div>

            {/* 🆕 PHASE 3C: Mode Selector Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.07 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-3xl blur-xl opacity-50" />
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 border border-white/60 space-y-4">
                <ModeSelector
                  selectedMode={generationMode}
                  onModeChange={setGenerationMode}
                  disabled={isGenerating}
                />
                
                {/* 🆕 PHASE 3D: Advanced Mode Indicator */}
                <AdvancedModeIndicator mode={generationMode} />
              </div>
            </motion.section>

            {/* HERO: Prompt Editor Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-shell)]/30 to-[var(--coconut-husk)]/30 rounded-3xl blur-xl opacity-60" />
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/60">
                <div className="p-6 sm:p-10 pb-0">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-xl flex items-center justify-center backdrop-blur-xl border border-white/40">
                        <Settings2 className="w-6 h-6 text-[var(--coconut-shell)]" />
                      </div>
                      <div>
                        <h2 className="text-3xl text-[var(--coconut-shell)]">Creative Prompt</h2>
                        <p className="text-sm text-[var(--coconut-shell)]/70">Fine-tune your generation parameters</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 sm:px-10 pb-10">
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
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-3xl blur-xl opacity-50" />
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 border border-white/60">
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
              transition={{ duration: 0.4, delay: 0.12 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-cream)]/40 to-[var(--coconut-milk)]/40 rounded-3xl blur-xl opacity-50" />
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 border border-white/60">
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

            {/* Concept Section (Moved to bottom as AI insight) */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.14 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-3xl blur-xl opacity-50" />
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8 border border-white/60">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-xl flex items-center justify-center backdrop-blur-xl border border-white/40">
                    <Palette className="w-6 h-6 text-[var(--coconut-shell)]" />
                  </div>
                  <div>
                    <h2 className="text-2xl text-[var(--coconut-shell)]">AI Creative Analysis</h2>
                    <p className="text-sm text-[var(--coconut-shell)]/70">Intelligent direction insights</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/40 backdrop-blur-xl rounded-xl p-5 border border-white/40">
                    <div className="text-sm text-[var(--coconut-shell)]/80 mb-2">Main Concept</div>
                    <div className="text-[var(--coconut-shell)]">{currentBoard.analysis.concept.mainConcept}</div>
                  </div>
                  
                  <div className="bg-white/40 backdrop-blur-xl rounded-xl p-5 border border-white/40">
                    <div className="text-sm text-[var(--coconut-shell)]/80 mb-2">Visual Style</div>
                    <div className="text-[var(--coconut-shell)]">{currentBoard.analysis.concept.visualStyle}</div>
                  </div>
                  
                  <div className="bg-white/40 backdrop-blur-xl rounded-xl p-5 border border-white/40">
                    <div className="text-sm text-[var(--coconut-shell)]/80 mb-2">Target Emotion</div>
                    <div className="text-[var(--coconut-shell)]">{currentBoard.analysis.concept.targetEmotion}</div>
                  </div>
                  
                  <div className="bg-white/40 backdrop-blur-xl rounded-xl p-5 border border-white/40">
                    <div className="text-sm text-[var(--coconut-shell)]/80 mb-2">Key Message</div>
                    <div className="text-[var(--coconut-shell)]">{currentBoard.analysis.concept.keyMessage}</div>
                  </div>
                </div>
              </div>
            </motion.section>
            </motion.div>

            {/* RIGHT: SIDEBAR PREMIUM (1/3) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <CocoBoardSidebarPremium
                board={currentBoard}
                userCredits={totalCredits}
                isDirty={isDirty}
                onSave={handleManualSave}
                onGenerate={handleGenerateNow}
                isGenerating={isGenerating}
                onToggleBrandGuidelines={handleToggleBrandGuidelines}
              />
            </motion.div>
          </div>
        </AnimatePresence>
      </main>

      {/* Sticky CTA Footer */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent backdrop-blur-xl" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-white/60">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Dirty indicator */}
                  <AnimatePresence>
                    {isDirty && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[var(--coconut-husk)]/20 border border-[var(--coconut-husk)]/40 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-[var(--coconut-husk)] rounded-full animate-pulse" />
                        <span className="text-xs text-[var(--coconut-shell)]">Unsaved changes</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="hidden sm:flex items-baseline gap-2">
                    <span className="text-3xl text-[var(--coconut-shell)]">{currentBoard.cost.total}</span>
                    <span className="text-sm text-[var(--coconut-shell)]/70">credits</span>
                  </div>
                  <div className="h-8 w-px bg-[var(--coconut-shell)]/20 hidden sm:block" />
                  <div className="text-sm text-[var(--coconut-shell)]/70">
                    <span className="text-[var(--coconut-shell)]">{currentBoard.specs.model}</span> • {currentBoard.specs.ratio} • {currentBoard.specs.resolution}
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    playClick(); // 🔊 Sound feedback
                    playWhoosh();
                    handleGenerateNow();
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-husk)] text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">Generate Now</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🆕 User Specs Input Modal */}
      {specsInputData && (
        <SpecsInputModal
          isOpen={showSpecsModal}
          onClose={() => setShowSpecsModal(false)}
          onSubmit={handleSpecsSubmit}
          productName={specsInputData.productName}
          prompt={specsInputData.prompt}
          suggestions={specsInputData.suggestions}
        />
      )}

      {/* 🆕 PHASE 3D: Generation Preview Modal (Semi-Auto mode) */}
      <GenerationPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onConfirm={async () => {
          setShowPreviewModal(false);
          await executeGeneration();
        }}
        board={currentBoard}
        isGenerating={isGenerating}
        userCredits={totalCredits}
      />

      {/* ✅ P0-07: Cost Widget - Always Visible */}
      <CostWidget cost={currentBoard.cost} userCredits={totalCredits} />
    </div>
  );
}