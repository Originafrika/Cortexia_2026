import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ForYouFeed } from './components/ForYouFeed';
import { Discovery } from './components/Discovery';
import { Messages } from './components/Messages';
import { Profile } from './components/Profile';
import { ErrorBoundary } from './components/error-boundary';
import { CreatorDashboard } from './components/CreatorDashboard';
import { Wallet } from './components/Wallet';
import { Settings } from './components/Settings';
import { Activity } from './components/Activity';
import { NewMessage } from './components/NewMessage';
import { TabBar } from './components/TabBar';
import { UserProfile } from './components/UserProfile';
import { CreateHubGlass } from './components/create/CreateHubGlass';
import { TextToImageV3 } from './components/create/tools/TextToImageV3';
import { CreatePage as CoconutPage } from './components/cortexia/CreatePage';
import { CocoBoardDemo } from './components/coconut-v14/CocoBoardDemo';
import { CoconutV14App } from './components/coconut-v14/CoconutV14App';
import { CreditsProvider } from './lib/contexts/CreditsContext';
import { ProvidersProvider } from './lib/contexts/ProvidersContext';
import { AuthProvider } from './lib/contexts/AuthContext';
import { ThemeProvider } from './lib/contexts/ThemeContext';
import { GenerationQueueProvider } from './lib/contexts/GenerationQueueContext';
import { PurchaseCreditsModal } from './components/providers/PurchaseCreditsModal';
import { mockPurchaseCredits } from './lib/providers/mockService';
import { CREDIT_PACKAGES } from './lib/providers/config';
import { useCredits } from './lib/contexts/CreditsContext';
import { Toaster } from 'sonner';
import { AnimatePresence, motion, LayoutGroup } from 'motion/react';

export type Screen = 
  | 'feed' 
  | 'discovery' 
  | 'messages' 
  | 'profile' 
  | 'create'
  | 'create-v4'
  | 'coconut-campaign'
  | 'coconut-v14-cocoboard'
  | 'coconut-v14'
  | 'creator-dashboard'
  | 'wallet'
  | 'settings'
  | 'activity'
  | 'new-message';

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider defaultTheme="purple">
            <CreditsProvider>
              <GenerationQueueProvider>
                <LayoutGroup>
                  <Routes>
                    {/* All routes (including /create via AppContent) */}
                    <Route path="/*" element={<AppContent />} />
                  </Routes>
                </LayoutGroup>
                <Toaster position="top-right" />
              </GenerationQueueProvider>
            </CreditsProvider>
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

function AppContent() {
  const { credits, addPaidCredits, updateCredits } = useCredits();
  
  // Detect initial screen from URL
  const getInitialScreen = (): Screen => {
    const path = window.location.pathname;
    if (path === '/create') return 'create';
    return 'feed';
  };
  
  const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen());
  const [createMode, setCreateMode] = useState<'create' | 'remix'>('create');
  const [createPrefillPrompt, setCreatePrefillPrompt] = useState<string>('');
  const [visitingUsername, setVisitingUsername] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  // V2 Creation Hub state
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  // ❌ REMOVED: Hardcoded credits - use credits from context instead
  // const [userFreeCredits, setUserFreeCredits] = useState(25);
  // const [userPaidCredits, setUserPaidCredits] = useState(0);

  // Handle opening create screen with prefilled prompt
  const handleOpenCreate = (prefillPrompt?: string) => {
    if (prefillPrompt) {
      setCreatePrefillPrompt(prefillPrompt);
    } else {
      setCreatePrefillPrompt('');
    }
    setCreateMode('create');
    setSelectedTool(null); // Reset tool selection when opening create
    setCurrentScreen('create');
  };

  // Handle viewing a specific post (stays in Discovery, opens modal)
  const handleViewPost = (postId: string) => {
    // This will be handled by Discovery component's internal state
    console.log('Viewing post:', postId);
  };

  // Handle viewing a creator profile
  const handleViewCreator = (username: string) => {
    setVisitingUsername(username);
  };
  
  // Handle tool selection
  const handleSelectTool = (toolId: string) => {
    setSelectedTool(toolId);
  };
  
  // Handle back from tool to hub
  const handleBackToHub = () => {
    setSelectedTool(null);
  };

  // Handle back from Coconut to create hub
  const handleBackFromCoconut = () => {
    setSelectedTool(null);
    setCurrentScreen('create');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'feed':
        return <ForYouFeed onNavigate={setCurrentScreen} />;
      case 'discovery':
        return <Discovery 
          onNavigate={setCurrentScreen}
          onCreateClick={handleOpenCreate}
          onViewPost={handleViewPost}
          onViewCreator={handleViewCreator}
        />;
      case 'messages':
        return <Messages onNavigate={setCurrentScreen} />;
      case 'profile':
        return <Profile onNavigate={setCurrentScreen} />;
      case 'create':
        // Show selected tool or hub
        if (selectedTool === 'text-to-image') {
          return (
            <TextToImageV3 
              onBack={handleBackToHub}
              userFreeCredits={credits.free}
              userPaidCredits={credits.paid}
            />
          );
        }
        if (selectedTool === 'coconut-v14') {
          // ✅ COCONUT V14 - Ultra-Premium Full App
          return <CoconutV14App />;
        }
        if (selectedTool === 'coconut-v13-premium' || selectedTool === 'coconut') {
          // ✅ CoconutV14 - CocoBoard Demo (Premium version)
          return <CocoBoardDemo onNavigate={() => handleBackFromCoconut()} />;
        }
        // Default: show hub
        return (
          <CreateHubGlass 
            onNavigate={setCurrentScreen}
            onSelectTool={handleSelectTool}
          />
        );
      case 'create-v4':
        return (
          <div className="flex items-center justify-center h-screen bg-black text-white">
            <div className="text-center">
              <h1 className="text-2xl mb-4">Coconut V9 - Coming Soon</h1>
              <p className="text-gray-400 mb-6">The new creation experience is being built</p>
              <button
                onClick={() => setCurrentScreen('create')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        );
      case 'coconut-campaign':
        return <CoconutPage onNavigate={handleBackFromCoconut} />;
      case 'coconut-v14-cocoboard':
        return <CocoBoardDemo onNavigate={() => handleBackFromCoconut()} />;
      case 'coconut-v14':
        // ✅ COCONUT V14 - Ultra-Premium Full App
        return <CoconutV14App />;
      case 'creator-dashboard':
        return <CreatorDashboard onNavigate={setCurrentScreen} />;
      case 'wallet':
        return <Wallet onNavigate={setCurrentScreen} />;
      case 'settings':
        return <Settings onNavigate={setCurrentScreen} />;
      case 'activity':
        return <Activity onNavigate={setCurrentScreen} />;
      case 'new-message':
        return <NewMessage onNavigate={setCurrentScreen} />;
      default:
        return <ForYouFeed onNavigate={setCurrentScreen} />;
    }
  };

  const showTabBar = !['create', 'create-v4', 'coconut-campaign', 'coconut-v14-cocoboard', 'coconut-v14', 'creator-dashboard', 'wallet', 'settings', 'activity', 'new-message'].includes(currentScreen);

  return (
    <ProvidersProvider
      onOpenPurchaseModal={() => setShowPurchaseModal(true)}
      onClosePurchaseModal={() => setShowPurchaseModal(false)}
      isPurchaseModalOpen={showPurchaseModal}
    >
      <div className="relative w-full h-screen bg-black">
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#fff',
              border: '1px solid #333',
            },
          }}
        />
        {renderScreen()}
        {showTabBar && (
          <TabBar 
            currentScreen={currentScreen} 
            onNavigate={setCurrentScreen}
            onCreateClick={() => handleOpenCreate()}
          />
        )}
        
        {/* User Profile Overlay - when visiting another user */}
        {visitingUsername && (
          <UserProfile 
            username={visitingUsername}
            onClose={() => setVisitingUsername(null)}
          />
        )}
        
        {/* Purchase Credits Modal */}
        <PurchaseCreditsModal
          open={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          currentCredits={credits}
          onPurchase={async (packageIdx) => {
            const pkg = CREDIT_PACKAGES[packageIdx];
            
            const result = await mockPurchaseCredits(pkg.credits, credits);
            
            if (result.success) {
              updateCredits(result.newBalance);
              return { success: true };
            } else {
              return { success: false, error: result.error };
            };
          }}
        />
      </div>
    </ProvidersProvider>
  );
}