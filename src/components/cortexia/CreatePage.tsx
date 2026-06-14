/**
 * COCONUT - Orchestrateur Multimodal IA
 * Page de création multimodale suivant le Beauty Design System
 * Architecture: Intent → AI Analysis → CocoBoard → Generation
 * With morphing transition from Create page
 */

import { useState, useEffect } from 'react';
import { IntentInput } from './IntentInput';
import { AnalysisView } from './AnalysisView';
import { CocoboardView } from './CocoboardView'; // ✅ USE NEW SOPHISTICATED VIEW
import { CocoboardView as CocoboardViewComplete } from './CocoboardViewComplete'; // Keep for features
import { TemplatesGallery } from './TemplatesGallery';
import { TemplateConfigurator } from './TemplateConfigurator';
import { CoconutPremiumHeader } from './CoconutPremiumHeader';
import { ParallaxBackground } from '../shared/ParallaxBackground';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../lib/contexts/ThemeContext';
import { toast } from 'sonner';

// ✅ REAL API (not mock)
import {
  analyzeUserIntent,
  analyzeReferenceImages,
  generateCocoBoard,
  type AIAnalysis,
  type ReferenceAnalysis,
  type CocoBoard
} from '../../lib/services/cortexia-api';

import {
  createProject
} from '../../lib/services/cortexia-projects-api';

import {
  applyTemplateVariables,
  type CocoTemplate
} from '../../lib/templates/coconut-templates';

import { useAuth } from '../../lib/contexts/AuthContext';

type CreateStep = 'templates' | 'intent' | 'configure-template' | 'analysis' | 'cocoboard';

export function CreatePage() {
  const [currentStep, setCurrentStep] = useState<CreateStep>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<CocoTemplate | null>(null);
  const [userIntent, setUserIntent] = useState<string>('');
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [cocoboard, setCocoboard] = useState<CocoBoard | null>(null);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [referenceAnalysis, setReferenceAnalysis] = useState<ReferenceAnalysis | null>(null);
  const [selectedMode, setSelectedMode] = useState<'auto' | 'semi-auto' | 'manual'>('auto'); // ← NEW
  
  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingBoard, setIsGeneratingBoard] = useState(false);
  const [isAnalyzingReferences, setIsAnalyzingReferences] = useState(false);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);

  // Get current user
  const { user } = useAuth();

  // BDS: Astronomie - Switch theme to indigo on mount
  const { setTheme } = useTheme();
  
  useEffect(() => {
    setTheme('indigo');
  }, [setTheme]);

  // Step 1: User selects a template
  const handleTemplateSelect = (template: CocoTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep('configure-template');
  };

  // Step 2: User configures the template
  const handleTemplateConfirm = async (variables: Record<string, string | string[]>) => {
    if (!selectedTemplate) return;
    
    setError(null);
    
    try {
      // Build intent from template and variables
      const templateIntent = buildIntentFromTemplate(selectedTemplate, variables);
      
      // Extract references if any
      const imageVars = Object.entries(variables).filter(([key, value]) => 
        typeof value === 'string' && value.startsWith('data:image')
      );
      
      // Prepare user assets from uploaded images
      const userAssets = imageVars.map(([key, value]) => ({
        type: key.includes('logo') ? 'logo' : 
              key.includes('product') ? 'product' :
              key.includes('background') ? 'background' : 'image',
        url: value as string
      }));
      
      // Store for use in board generation
      setReferenceImages(imageVars.map(([_, value]) => value as string));
      setUserIntent(templateIntent);
      
      // ✅ SKIP ANALYSIS STEP - GO DIRECTLY TO BOARD GENERATION WITH BACKEND
      setIsGeneratingBoard(true);
      console.log('🌳 Generating CocoBoard directly from template with backend...');
      
      // Store assets for /analyze endpoint
      (window as any).__coconut_objective = undefined; // Templates don't have objectives
      (window as any).__coconut_assets = userAssets.length > 0 ? userAssets : undefined;
      
      // Create synthetic analysis for UI display
      const syntheticAnalysis: AIAnalysis = {
        type: selectedTemplate.category === 'social' ? 'video' : 'image',
        reasoning: `Template-based: ${selectedTemplate.name}`,
        structure: {
          type: selectedTemplate.category === 'social' ? 'video' : 'image',
          count: 1,
          breakdown: [{ nodeType: selectedTemplate.category === 'social' ? 'video' : 'image', count: 1 }]
        },
        recommendations: {
          model: selectedTemplate.category === 'social' ? 'veo-3.1-fast' : 'flux-2-pro',
          quality: 'balanced',
          estimatedCost: 5,
          estimatedTime: 30
        }
      };
      
      setAnalysis(syntheticAnalysis);
      
      // Generate board with real backend (mode: auto for templates)
      const board = await generateCocoBoard(
        templateIntent,
        syntheticAnalysis,
        'auto', // Templates use auto mode by default
        referenceImages
      );
      
      setCocoboard(board);
      console.log('✅ CocoBoard generated from template:', board.id, `(${board.nodes.length} nodes)`);
      
      setCurrentStep('cocoboard');
      
    } catch (error) {
      console.error('❌ Template board generation failed:', error);
      setError(error instanceof Error ? error.message : 'Template board generation failed');
    } finally {
      setIsGeneratingBoard(false);
    }
  };

  // Helper: Build intent from template
  function buildIntentFromTemplate(template: CocoTemplate, variables: Record<string, string | string[]>): string {
    let intent = template.description;
    
    // Replace variables in intent
    Object.entries(variables).forEach(([key, value]) => {
      if (typeof value === 'string' && !value.startsWith('data:image')) {
        // Text variable - include in intent
        intent += ` with ${key}: ${value}`;
      }
    });
    
    return intent;
  }

  // Step X: User submits custom intent (non-template flow)
  const handleIntentSubmit = async (
    intent: string,
    selectedType: 'auto' | 'image' | 'video' | 'campaign', // ✅ NEW: Receive user's selected type
    objective?: string,
    uploadedAssets?: Array<{ type: string; url: string }>
  ) => {
    setUserIntent(intent);
    setError(null);
    
    try {
      // Store objective and assets for later
      const objectiveForBoard = objective;
      const assetsForBoard = uploadedAssets;
      
      // 🎬 VIDEO FLOW: Redirect to Coconut V14 Video
      if (selectedType === 'video') {
        console.log('🎬 Video flow detected - creating project in DB...');
        
        if (!user?.userId) {
          toast.error('Vous devez être connecté pour créer une vidéo');
          return;
        }
        
        try {
          // Create project in database
          const project = await createProject({
            userId: user.userId,
            type: 'video',
            intent,
            objective,
            assets: uploadedAssets,
            metadata: {
              source: 'cortexia-create-page',
              timestamp: Date.now()
            }
          });
          
          console.log('✅ Video project created:', project.id);
          toast.success('Projet créé ! Redirection...');
          
          // Navigate to Coconut V14 with projectId
          window.location.href = `/create-v4?projectId=${project.id}`;
          
        } catch (error) {
          console.error('❌ Failed to create video project:', error);
          toast.error('Erreur lors de la création du projet');
          setError(error instanceof Error ? error.message : 'Failed to create video project');
        }
        
        return;
      }
      
      // Analyze reference images if provided
      if (uploadedAssets && uploadedAssets.length > 0) {
        setIsAnalyzingReferences(true);
        console.log(`🖼️ Analyzing ${uploadedAssets.length} reference assets...`);
        
        const refAnalysis = await analyzeReferenceImages(uploadedAssets.map(a => a.url));
        setReferenceImages(uploadedAssets.map(a => a.url));
        setReferenceAnalysis(refAnalysis);
        
        console.log('✅ Reference analysis complete:', refAnalysis.style);
        setIsAnalyzingReferences(false);
      }
      
      // Analyze intent with REAL BACKEND (image/campaign only)
      setIsAnalyzing(true);
      console.log(`🧠 Analyzing intent with backend (type: ${selectedType})...`);
      
      const result = await analyzeUserIntent(intent, selectedType); // ✅ Pass selectedType
      setAnalysis(result);
      
      // Store for next step
      (window as any).__coconut_objective = objectiveForBoard;
      (window as any).__coconut_assets = assetsForBoard;
      
      console.log('✅ Intent analysis complete:', result.type);
      setCurrentStep('analysis');
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
      setIsAnalyzingReferences(false);
    }
  };

  // Step 3: User confirms analysis and chooses mode
  const handleAnalysisConfirm = async (mode: 'auto' | 'semi-auto' | 'manual') => {
    if (!analysis) return;
    
    setError(null);
    setIsGeneratingBoard(true);
    setSelectedMode(mode); // ← NEW: Store selected mode
    
    try {
      console.log(`🌳 Generating CocoBoard in ${mode} mode...`);
      
      const board = await generateCocoBoard(
        userIntent,
        analysis,
        mode,
        referenceImages
      );
      
      setCocoboard(board);
      console.log('✅ CocoBoard generated:', board.id, `(${board.nodes.length} nodes)`);
      
      setCurrentStep('cocoboard');
    } catch (error) {
      console.error('❌ Board generation failed:', error);
      setError(error instanceof Error ? error.message : 'Board generation failed');
    } finally {
      setIsGeneratingBoard(false);
    }
  };

  // Reset to start
  const handleReset = () => {
    setCurrentStep('templates');
    setSelectedTemplate(null);
    setUserIntent('');
    setAnalysis(null);
    setCocoboard(null);
    setReferenceImages([]);
    setReferenceAnalysis(null);
    setSelectedMode('auto'); // ← NEW: Reset mode
    setError(null);
  };

  // NEW: Node-level actions (placeholders for now, implement later with backend routes)
  const handleRetryNode = async (nodeId: string) => {
    console.log('🔄 Retry node:', nodeId);
    // TODO: Implement with backend /retry-node route
  };

  const handleImproveNode = async (nodeId: string) => {
    console.log('✨ Improve node:', nodeId);
    // TODO: Implement with backend /improve-node route
  };

  const handleApproveNode = async (nodeId: string) => {
    console.log('✅ Approve node:', nodeId);
    // TODO: Implement with backend /approve-node route
  };

  const handleEditNode = async (nodeId: string) => {
    console.log('✏️ Edit node:', nodeId);
    // TODO: Implement node editing modal
  };

  const handleStartGeneration = async () => {
    console.log('🚀 Start generation for entire board');
    // TODO: Implement with backend /start-generation route
  };

  return (
    <div className="w-full min-h-screen bg-black text-white relative overflow-hidden">
      {/* BDS: Géométrie - Animated background gradient orbs (Indigo/Purple theme) */}
      <ParallaxBackground />

      {/* BDS: Rhétorique - Premium Épuré Header */}
      <CoconutPremiumHeader 
        currentStep={currentStep}
        onBack={handleReset}
      />

      {/* BDS: Logique - Main content (Responsive) */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <AnimatePresence>
          {currentStep === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TemplatesGallery
                onSelectTemplate={handleTemplateSelect}
                onCustomIntent={() => setCurrentStep('intent')}
              />
            </motion.div>
          )}

          {currentStep === 'configure-template' && selectedTemplate && (
            <motion.div
              key="configure-template"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TemplateConfigurator
                template={selectedTemplate}
                onSubmit={handleTemplateConfirm}
                isLoading={isAnalyzing || isAnalyzingReferences}
              />
            </motion.div>
          )}

          {currentStep === 'intent' && (
            <motion.div
              key="intent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <IntentInput 
                onSubmit={handleIntentSubmit}
                isLoading={isAnalyzing || isAnalyzingReferences}
              />
            </motion.div>
          )}

          {currentStep === 'analysis' && analysis && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnalysisView
                analysis={analysis}
                referenceAnalysis={referenceAnalysis}
                onConfirm={handleAnalysisConfirm}
                onBack={() => setCurrentStep('intent')}
                isGenerating={isGeneratingBoard}
              />
            </motion.div>
          )}

          {currentStep === 'cocoboard' && cocoboard && (
            <motion.div
              key="cocoboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CocoboardView
                cocoboard={cocoboard}
                mode={selectedMode}
                onBack={handleReset}
                onStartGeneration={handleStartGeneration}
                onRetryNode={handleRetryNode}
                onImproveNode={handleImproveNode}
                onApproveNode={handleApproveNode}
                onEditNode={handleEditNode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}