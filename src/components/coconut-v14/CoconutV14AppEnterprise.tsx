/**
 * 🥥 COCONUT V14 - ENTERPRISE EDITION
 * Complete refactor with Enterprise Design System
 * Clean, minimal, Figma/Notion-inspired professional interface
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner@2.0.3';

// Contexts & Hooks
import { useAuth } from '../../lib/contexts/AuthContext';
import { useCredits } from '../../lib/contexts/CreditsContext';
import { useCurrentUser } from '../../lib/hooks/useCurrentUser';
import { useCoconutAccess } from '../../lib/hooks/useCoconutAccess';
import { useCocoBoardStore } from '../../lib/stores/cocoboard-store';
import { projectId as supabaseProjectId, publicAnonKey } from '../../utils/supabase/info';

// Layout
import { EnterpriseLayout } from './EnterpriseLayout';
import { EnterpriseDashboard } from './EnterpriseDashboard';

// Screens - ENTERPRISE VERSIONS
import { 
  TypeSelectorEnterprise,
  IntentInputEnterprise,
  AnalysisViewEnterprise,
  GenerationViewEnterprise,
  CreditsManagerEnterprise,
  SettingsPanelEnterprise,
  HistoryManagerEnterprise
} from '../coconut-v14-enterprise';

// Screens - PREMIUM VERSIONS (fallback pour les écrans non encore migrés)
import { AnalyzingLoaderPremium } from './AnalyzingLoaderPremium';
import { DirectionSelectorPremium } from './DirectionSelectorPremium';
import { CocoBoardPremium } from './CocoBoardPremium';
import { UserProfileCoconut } from './UserProfileCoconut';
import { TeamDashboard } from './TeamDashboard'; // ❌ OLD: Will be replaced
import { TeamManagementPage } from '../enterprise/team'; // ✅ NEW: Team Collaboration
import { ClientPortal } from './ClientPortal';
import { VideoFlowOrchestrator } from './VideoFlowOrchestrator';
import { CampaignWorkflow } from './CampaignWorkflow';
import { EnterpriseTemplateSelector } from './EnterpriseTemplateSelector';
import { AssetManager } from './AssetManager';
import { DeveloperDashboard } from '../developer'; // ✅ NEW: Developer Dashboard
import { CreatorSystem } from '../creator'; // ✅ NEW: Creator System
import { ReferralDashboard } from '../referral'; // ✅ NEW: Referral System
import { EnhancedFeed } from '../feed'; // ✅ NEW: Enhanced Feed

// Providers
import { NotificationProvider } from './NotificationProvider';
import { SoundProvider } from './SoundProvider';
import { AdvancedErrorBoundary } from './AdvancedErrorBoundary';

// Types
import type { GeminiAnalysisResponse } from '../../lib/types/gemini';
import type { CreativeDirection } from './DirectionSelector';
import { generateCreativeDirections, applyDirectionToAnalysis } from '../../lib/utils/creative-directions-generator';

// ============================================
// TYPES
// ============================================

export type EnterpriseScreen = 
  | 'dashboard'
  | 'type-select'
  | 'template-select'
  | 'intent-input'
  | 'analyzing'
  | 'direction-select'
  | 'analysis-view'
  | 'asset-manager'
  | 'cocoboard'
  | 'generation'
  | 'credits'
  | 'settings'
  | 'history'
  | 'profile'
  | 'team'
  | 'client-portal'
  | 'video-flow'
  | 'campaign'
  | 'developer-dashboard'
  | 'creator-system'
  | 'referral-dashboard'
  | 'enhanced-feed';

// Internal type for intent submission
interface IntentData {
  userInput: string;
  references?: any;
  format?: string;
  resolution?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CoconutV14AppEnterprise({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  return (
    <AdvancedErrorBoundary>
      <NotificationProvider>
        <SoundProvider>
          <CoconutV14AppEnterpriseContent onNavigate={onNavigate} />
        </SoundProvider>
      </NotificationProvider>
    </AdvancedErrorBoundary>
  );
}

function CoconutV14AppEnterpriseContent({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const navigate = useNavigate();
  const { userId, displayName } = useCurrentUser();
  const { userType } = useAuth();
  const { credits, getCoconutCredits } = useCredits();
  const { accessData, trackGeneration } = useCoconutAccess(userId);
  
  // ============================================
  // STATE
  // ============================================
  
  const [currentScreen, setCurrentScreen] = useState<EnterpriseScreen>('dashboard');
  const [selectedType, setSelectedType] = useState<'image' | 'video' | 'campaign' | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  
  // Analysis state (from Zustand store)
  const {
    geminiAnalysis,
    uploadedReferences,
    setGeminiAnalysis,
    setUploadedReferences,
    reset: resetStore,
  } = useCocoBoardStore();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [originalUserInput, setOriginalUserInput] = useState<string>('');
  const [availableDirections, setAvailableDirections] = useState<CreativeDirection[]>([]);
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  
  // Team collaboration state
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [teamData, setTeamData] = useState<any>(null);
  
  // History state
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // ============================================
  // LOAD TEAM DATA (Enterprise only)
  // ============================================
  
  useEffect(() => {
    if (credits.isEnterprise && userId) {
      loadTeamData();
    }
  }, [credits.isEnterprise, userId]);
  
  const loadTeamData = async () => {
    try {
      const response = await fetch(
        `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-e55aa214/team/dashboard`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-user-id': userId || '',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setTeamData(data);
        setPendingApprovalsCount(data.pendingApprovals?.length || 0);
      }
    } catch (error) {
      console.error('Failed to load team data:', error);
    }
  };
  
  // ============================================
  // NAVIGATION HANDLERS
  // ============================================
  
  const handleNavigate = (screen: EnterpriseScreen) => {
    setCurrentScreen(screen);
    
    // Reset state when navigating to certain screens
    if (screen === 'type-select') {
      setSelectedType(null);
      resetStore();
    }
    
    // Load history when navigating to history screen
    if (screen === 'history' && userId) {
      loadHistory();
    }
  };
  
  // ============================================
  // LOAD HISTORY
  // ============================================
  
  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(
        `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-e55aa214/coconut-v14/history`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-user-id': userId || '',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setHistoryItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  // ============================================
  // HISTORY HANDLERS
  // ============================================
  
  const handleHistoryItemClick = (id: string) => {
    const item = historyItems.find(i => i.id === id);
    if (!item) return;
    
    if (item.status === 'completed') {
      setCurrentGenerationId(id);
      setCurrentScreen('generation');
    }
  };
  
  const handleHistoryDownload = async (id: string) => {
    const item = historyItems.find(i => i.id === id);
    if (!item || !item.resultUrl) return;
    
    try {
      const response = await fetch(item.resultUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${item.title}-${Date.now()}.${item.type === 'video' ? 'mp4' : 'png'}`;
      link.click();
      toast.success('Téléchargement démarré');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };
  
  const handleHistoryDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    
    try {
      const response = await fetch(
        `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-e55aa214/coconut-v14/history/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-user-id': userId || '',
          },
        }
      );
      
      if (response.ok) {
        setHistoryItems(prev => prev.filter(item => item.id !== id));
        toast.success('Élément supprimé');
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Erreur lors de la suppression');
    }
  };
  
  const handleBackToFeed = () => {
    if (onNavigate) {
      onNavigate('feed');
    } else {
      navigate('/');
    }
  };
  
  // ============================================
  // TYPE SELECTION
  // ============================================
  
  const handleTypeSelect = (type: 'image' | 'video' | 'campaign') => {
    setSelectedType(type);
    
    if (type === 'video') {
      setCurrentScreen('video-flow');
    } else if (type === 'campaign') {
      setCurrentScreen('campaign');
    } else {
      // Enterprise users can select templates
      if (credits.isEnterprise) {
        setCurrentScreen('template-select');
      } else {
        setCurrentScreen('intent-input');
      }
    }
  };
  
  // ============================================
  // TEMPLATE SELECTION (Enterprise only)
  // ============================================
  
  const handleTemplateSelect = (templateId: string | null) => {
    if (templateId) {
      // Load template and pre-fill intent
      // TODO: Implement template loading
    }
    setCurrentScreen('intent-input');
  };
  
  // ============================================
  // INTENT SUBMISSION
  // ============================================
  
  const handleIntentSubmit = async (intentData: IntentData) => {
    setIsAnalyzing(true);
    setOriginalUserInput(intentData.userInput);
    setCurrentScreen('analyzing');
    
    try {
      const response = await fetch(
        `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-e55aa214/coconut-v14/analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userInput: intentData.userInput,
            references: intentData.references,
            userId: userId || 'anonymous',
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const analysisResult: GeminiAnalysisResponse = await response.json();
      
      // Store analysis in Zustand
      setGeminiAnalysis(analysisResult);
      if (intentData.references) {
        setUploadedReferences(intentData.references);
      }
      
      // Generate creative directions
      const directions = generateCreativeDirections(analysisResult);
      setAvailableDirections(directions);
      
      setIsAnalyzing(false);
      setCurrentScreen('direction-select');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
      setIsAnalyzing(false);
      setCurrentScreen('intent-input');
    }
  };
  
  // ============================================
  // DIRECTION SELECTION
  // ============================================
  
  const handleDirectionSelect = (directionId: string) => {
    setSelectedDirection(directionId);
    
    // Apply direction to analysis
    const direction = availableDirections.find(d => d.id === directionId);
    if (direction && geminiAnalysis) {
      const updatedAnalysis = applyDirectionToAnalysis(geminiAnalysis, direction);
      setGeminiAnalysis(updatedAnalysis);
    }
    
    setCurrentScreen('analysis-view');
  };
  
  // ============================================
  // COCOBOARD & GENERATION
  // ============================================
  
  const handleOpenCocoBoard = (projectId: string) => {
    setCurrentProjectId(projectId);
    setCurrentScreen('cocoboard');
  };
  
  const handleStartGeneration = (generationId: string) => {
    setCurrentGenerationId(generationId);
    setCurrentScreen('generation');
    
    // Track generation for access limits
    if (trackGeneration) {
      trackGeneration();
    }
  };
  
  // ============================================
  // BREADCRUMBS
  // ============================================
  
  const getBreadcrumbs = () => {
    const crumbs: { label: string; screen?: EnterpriseScreen }[] = [];
    
    switch (currentScreen) {
      case 'type-select':
        crumbs.push({ label: 'Dashboard', screen: 'dashboard' });
        crumbs.push({ label: 'New Generation' });
        break;
      case 'template-select':
        crumbs.push({ label: 'Dashboard', screen: 'dashboard' });
        crumbs.push({ label: 'New Generation', screen: 'type-select' });
        crumbs.push({ label: 'Select Template' });
        break;
      case 'intent-input':
        crumbs.push({ label: 'Dashboard', screen: 'dashboard' });
        crumbs.push({ label: 'New Generation', screen: 'type-select' });
        crumbs.push({ label: 'Describe Your Vision' });
        break;
      case 'analyzing':
        crumbs.push({ label: 'Dashboard', screen: 'dashboard' });
        crumbs.push({ label: 'Analyzing...' });
        break;
      case 'direction-select':
        crumbs.push({ label: 'Dashboard', screen: 'dashboard' });
        crumbs.push({ label: 'Choose Direction' });
        break;
      case 'analysis-view':
        crumbs.push({ label: 'Dashboard', screen: 'dashboard' });
        crumbs.push({ label: 'Review Analysis' });
        break;
      case 'cocoboard':
        crumbs.push({ label: 'Dashboard', screen: 'dashboard' });
        crumbs.push({ label: 'CocoBoard' });
        break;
      case 'generation':
        crumbs.push({ label: 'Dashboard', screen: 'dashboard' });
        crumbs.push({ label: 'Generating...' });
        break;
      case 'team':
        crumbs.push({ label: 'Dashboard', screen: 'dashboard' });
        crumbs.push({ label: 'Team Collaboration' });
        break;
      case 'history':
        crumbs.push({ label: 'Dashboard', screen: 'dashboard' });
        crumbs.push({ label: 'History' });
        break;
      default:
        break;
    }
    
    return crumbs;
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <EnterpriseLayout
      currentScreen={currentScreen}
      onNavigate={handleNavigate}
      breadcrumbs={getBreadcrumbs()}
      onBackToFeed={handleBackToFeed}
      pendingApprovalsCount={pendingApprovalsCount}
    >
      {currentScreen === 'dashboard' && (
        <EnterpriseDashboard onNavigate={handleNavigate} />
      )}
      
      {currentScreen === 'type-select' && (
        <TypeSelectorEnterprise
          onSelectType={handleTypeSelect}
          onBack={() => setCurrentScreen('dashboard')}
          onBrowseTemplates={credits.isEnterprise ? () => setCurrentScreen('template-select') : undefined}
          coconutGenerationsRemaining={accessData?.coconutGenerationsRemaining}
          isEnterprise={credits.isEnterprise}
        />
      )}
      
      {currentScreen === 'template-select' && (
        <EnterpriseTemplateSelector
          onSelect={handleTemplateSelect}
          selectedType={selectedType || 'image'}
        />
      )}
      
      {currentScreen === 'intent-input' && selectedType && (
        <IntentInputEnterprise
          selectedType={selectedType}
          onSubmit={handleIntentSubmit}
          onBack={() => setCurrentScreen('type-select')}
          isLoading={isAnalyzing}
          userCredits={credits.credits}
          userId={userId || 'anonymous'}
        />
      )}
      
      {currentScreen === 'analyzing' && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <AnalyzingLoaderPremium />
        </div>
      )}
      
      {currentScreen === 'direction-select' && (
        <div className="p-6 max-w-7xl mx-auto">
          <DirectionSelectorPremium
            directions={availableDirections}
            onSelect={handleDirectionSelect}
            onSkip={() => setCurrentScreen('analysis-view')}
          />
        </div>
      )}
      
      {currentScreen === 'analysis-view' && geminiAnalysis && (
        <AnalysisViewEnterprise
          analysis={geminiAnalysis}
          onProceed={() => {
            // Create project and open CocoBoard
            const projectId = `project-${Date.now()}`;
            handleOpenCocoBoard(projectId);
          }}
          onEdit={() => setCurrentScreen('direction-select')}
          onBack={() => setCurrentScreen('direction-select')}
          isLoading={false}
        />
      )}
      
      {currentScreen === 'asset-manager' && (
        <div className="p-6 max-w-7xl mx-auto">
          <AssetManager
            onComplete={() => setCurrentScreen('cocoboard')}
          />
        </div>
      )}
      
      {currentScreen === 'cocoboard' && currentProjectId && (
        <CocoBoardPremium
          projectId={currentProjectId}
          onStartGeneration={handleStartGeneration}
          onBack={() => setCurrentScreen('dashboard')}
        />
      )}
      
      {currentScreen === 'generation' && currentGenerationId && (
        <GenerationViewEnterprise
          status="generating"
          progress={50}
          onBackToFeed={() => setCurrentScreen('dashboard')}
          estimatedTime="2-3 minutes"
          currentStep="Generating your creation..."
        />
      )}
      
      {currentScreen === 'video-flow' && (
        <VideoFlowOrchestrator
          onComplete={() => setCurrentScreen('dashboard')}
          onBack={() => setCurrentScreen('type-select')}
        />
      )}
      
      {currentScreen === 'campaign' && (
        <CampaignWorkflow
          campaignId={editingCampaignId}
          onComplete={() => setCurrentScreen('dashboard')}
          onBack={() => setCurrentScreen('type-select')}
        />
      )}
      
      {currentScreen === 'team' && (
        <div className="p-6 max-w-7xl mx-auto">
          <TeamManagementPage
            teamId={userId || undefined}
            onNavigate={handleNavigate}
          />
        </div>
      )}
      
      {currentScreen === 'client-portal' && (
        <div className="p-6 max-w-7xl mx-auto">
          <ClientPortal />
        </div>
      )}
      
      {currentScreen === 'history' && (
        <HistoryManagerEnterprise
          items={historyItems}
          isLoading={isLoadingHistory}
          onItemClick={handleHistoryItemClick}
          onDownload={handleHistoryDownload}
          onDelete={handleHistoryDelete}
        />
      )}
      
      {currentScreen === 'credits' && (
        <CreditsManagerEnterprise
          currentCredits={credits.credits}
          monthlyUsage={accessData?.monthlyUsage || 0}
          onPurchase={(amount) => {
            toast.success(`Purchase of ${amount} credits initiated`);
          }}
          isEnterprise={credits.isEnterprise}
        />
      )}
      
      {currentScreen === 'settings' && (
        <SettingsPanelEnterprise
          onClose={() => setCurrentScreen('dashboard')}
          onSave={(settings) => {
            toast.success('Settings saved successfully');
          }}
        />
      )}
      
      {currentScreen === 'profile' && (
        <div className="p-6 max-w-5xl mx-auto">
          <UserProfileCoconut />
        </div>
      )}
      
      {currentScreen === 'developer-dashboard' && (
        <div className="p-6 max-w-7xl mx-auto">
          <DeveloperDashboard />
        </div>
      )}
      
      {currentScreen === 'creator-system' && (
        <div className="p-6 max-w-7xl mx-auto">
          <CreatorSystem />
        </div>
      )}
      
      {currentScreen === 'referral-dashboard' && (
        <div className="p-6 max-w-7xl mx-auto">
          <ReferralDashboard />
        </div>
      )}
      
      {currentScreen === 'enhanced-feed' && (
        <div className="p-6 max-w-7xl mx-auto">
          <EnhancedFeed />
        </div>
      )}
    </EnterpriseLayout>
  );
}