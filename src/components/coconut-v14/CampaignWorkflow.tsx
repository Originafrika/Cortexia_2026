/**
 * CAMPAIGN WORKFLOW - Complete campaign mode orchestration
 * Handles: Briefing → Analysis → CocoBoard Review → Generation → Results
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { CampaignBriefing } from './CampaignBriefing';
import { AnalyzingLoaderPremium } from './AnalyzingLoaderPremium';
import { CampaignCocoBoardPremium } from './CampaignCocoBoardPremium';
import { CampaignGenerationViewPremium } from './CampaignGenerationViewPremium';
import { useNotify } from './NotificationProvider';
import type { 
  CampaignBriefingInput,
  GeminiCampaignAnalysisResponse,
  HydratedCampaignAnalysis,
} from '../../lib/types/coconut-v14-campaign';
import { hydrateCampaignData, dehydrateCampaignData } from '../../lib/types/coconut-v14-campaign';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// ============================================
// TYPES
// ============================================

type CampaignStep = 'briefing' | 'analyzing' | 'cocoboard' | 'generating' | 'results';

interface CampaignWorkflowProps {
  userId: string;
  onBack: () => void;
  existingCocoBoardId?: string; // ✅ NEW: Load existing campaign
}

// ============================================
// COMPONENT
// ============================================

export function CampaignWorkflow({ userId, onBack, existingCocoBoardId }: CampaignWorkflowProps) {
  const notify = useNotify();

  const [step, setStep] = useState<CampaignStep>('briefing');
  const [briefing, setBriefing] = useState<CampaignBriefingInput | null>(null);
  const [analysis, setAnalysis] = useState<HydratedCampaignAnalysis | null>(null);
  const [cocoBoardId, setCocoBoardId] = useState<string>('');
  const [campaignId, setCampaignId] = useState<string>('');
  const [campaignResults, setCampaignResults] = useState<any>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  // ✅ NEW: Load existing campaign if existingCocoBoardId is provided
  useEffect(() => {
    if (existingCocoBoardId) {
      loadExistingCampaign(existingCocoBoardId);
    }
  }, [existingCocoBoardId]);

  // ✅ NEW: Function to load existing campaign
  const loadExistingCampaign = async (cocoBoardIdToLoad: string) => {
    console.log('📥 [Campaign] Loading existing campaign:', cocoBoardIdToLoad);
    setIsLoadingExisting(true);

    try {
      // Fetch CocoBoard data
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/campaign/cocoboard?cocoBoardId=${cocoBoardIdToLoad}&userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load campaign');
      }

      console.log('✅ [Campaign] Campaign loaded:', result.data);

      // Hydrate the data
      const hydratedData = hydrateCampaignData(result.data);

      setAnalysis(hydratedData);
      setCocoBoardId(cocoBoardIdToLoad);
      setStep('cocoboard');

      notify?.success('Campagne chargée avec succès');

    } catch (error) {
      console.error('❌ [Campaign] Load error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      notify?.error(errorMessage || 'Erreur lors du chargement de la campagne');
      setStep('briefing');
    } finally {
      setIsLoadingExisting(false);
    }
  };

  // Step 1: Submit briefing → Start analysis
  const handleSubmitBriefing = useCallback(async (briefingData: CampaignBriefingInput) => {
    console.log('🚀 [Campaign] Submitting briefing...', briefingData);
    
    setBriefing(briefingData);
    setStep('analyzing');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/campaign/analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ briefing: briefingData }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      console.log('✅ [Campaign] Analysis complete');
      
      // ✅ FIX: Hydrate weeks.assets from allAssets
      const hydratedData = hydrateCampaignData(result.data);
      
      setAnalysis(hydratedData);
      setCocoBoardId(result.cocoBoardId);
      setStep('cocoboard');

      const assetsCount = result.data?.allAssets?.length || 0;
      const weeksCount = result.data?.timeline?.totalWeeks || 0;
      
      notify?.success(`Plan de campagne généré : ${assetsCount} assets sur ${weeksCount} semaines`);

    } catch (error) {
      console.error('❌ [Campaign] Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      notify?.error(errorMessage || 'Erreur lors de l\'analyse de campagne');
      setStep('briefing');
    }
  }, [notify]);

  // Step 2: Validate CocoBoard → Start generation
  const handleStartGeneration = useCallback(async () => {
    console.log('🎬 [Campaign] Starting batch generation...');
    
    setStep('generating');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/campaign/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            cocoBoardId,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }

      console.log('✅ [Campaign] Generation started');
      setCampaignId(result.data.campaignId);

      // Poll for status
      pollGenerationStatus(result.data.campaignId);

    } catch (error) {
      console.error('❌ [Campaign] Generation error:', error);
      notify?.error(error.message || 'Erreur lors du lancement de la génération');
      setStep('cocoboard');
    }
  }, [userId, cocoBoardId, notify]);

  // Poll generation status
  const pollGenerationStatus = useCallback(async (campId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/campaign/${campId}/status`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );

        const result = await response.json();

        if (result.success && result.data.status === 'completed') {
          clearInterval(pollInterval);
          setStep('results');
          notify?.success('Campagne générée avec succès !');
          setCampaignResults(result.data.results);
        }

      } catch (error) {
        console.error('Poll error:', error);
      }
    }, 5000);

    // Cleanup after 10 minutes
    setTimeout(() => clearInterval(pollInterval), 10 * 60 * 1000);
  }, [notify]);

  // ✅ Save CocoBoard to backend
  const handleSaveCocoBoard = useCallback(async (updatedData: HydratedCampaignAnalysis) => {
    console.log('💾 [Campaign] Saving CocoBoard to backend...');
    
    try {
      // Dé-hydrater avant envoi (backend attend IDs dans weeks.assets)
      const dehydrated = dehydrateCampaignData(updatedData);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/campaign/cocoboard/save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            cocoBoardId,
            campaignData: dehydrated,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Save failed');
      }

      // Update local state avec version hydratée
      setAnalysis(updatedData);
      notify?.success('Campagne sauvegardée au backend');
      console.log('✅ [Campaign] CocoBoard saved to backend');

    } catch (error) {
      console.error('❌ [Campaign] Save error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      notify?.error(errorMessage || 'Erreur lors de la sauvegarde');
    }
  }, [userId, cocoBoardId, notify]);

  // Render current step
  if (step === 'briefing') {
    return (
      <CampaignBriefing
        onSubmit={handleSubmitBriefing}
        onBack={onBack}
        userId={userId}
      />
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-50 via-white to-warm-100">
        <AnalyzingLoaderPremium
          currentPhase="Analyse stratégique par Gemini"
          message="Génération du plan de campagne marketing..."
        />
      </div>
    );
  }

  if (step === 'cocoboard' && analysis) {
    return (
      <CampaignCocoBoardPremium
        campaignData={analysis}
        onSave={handleSaveCocoBoard}
        onGenerate={handleStartGeneration}
        onBack={() => setStep('briefing')}
      />
    );
  }

  if (step === 'generating' || step === 'results') {
    return (
      <CampaignGenerationViewPremium
        campaignId={campaignId}
        onBack={onBack}
        onComplete={() => setStep('results')}
        results={campaignResults}
      />
    );
  }

  return null;
}