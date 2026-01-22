import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router';
import { LayoutGroup } from 'motion/react';
import { Toaster } from 'sonner@2.0.3';

// Providers
import { AuthProvider, useAuth } from './lib/contexts/AuthContext';
import { ThemeProvider } from './lib/contexts/ThemeContext';
import { CreditsProvider, useCredits } from './lib/contexts/CreditsContext';
import { GenerationQueueProvider } from './lib/contexts/GenerationQueueContext';
import { ProvidersProvider } from './lib/contexts/ProvidersContext';

// Pages
import { LandingPage } from './components/landing/LandingPage';
import { AuthFlow } from './components/auth/AuthFlow';
import { LoginPage } from './components/auth/LoginPage';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { Auth0CallbackPage } from './components/auth/Auth0CallbackPage';
import { Auth0SetupHelper } from './components/auth/Auth0SetupHelper';
import { ForYouFeed } from './components/ForYouFeed';
import { Discovery } from './components/discovery/Discovery';
import { Messages } from './components/messages/Messages';
import { Profile } from './components/Profile';
import { CreateHubGlass } from './components/create/CreateHubGlass';
import { TextToImageV3 } from './components/create/TextToImageV3';
import { CoconutV14App } from './components/coconut-v14/CoconutV14App';
import { CocoBoardDemo } from './components/coconut-v14/CocoBoardDemo';
// ❌ REMOVED: CoconutPage doesn't exist in /components/coconut/
// import { CoconutPage } from './components/coconut/CoconutPage';
import { CreatorDashboard } from './components/CreatorDashboardNew'; // ✅ UPDATED: New dashboard with tabs
import { Wallet } from './components/Wallet';
import { Settings } from './components/Settings';
import { AdminPanel } from './components/AdminPanel'; // ✅ NEW: Admin Panel
import { Activity } from './components/Activity'; // ✅ NEW: Activity page
import TestCampaignPage from './components/TestCampaignPage'; // ✅ TEST: Campaign endpoints
import { GenerationView } from './components/generation/GenerationView'; // ✅ Generation view component
import { SettingsPage } from './pages/SettingsPage'; // ✅ NEW: Full settings page
import { DebugCreditsPanel } from './components/debug/DebugCreditsPanel'; // ✅ NEW: Debug panel for credits
import MigrationPage from './pages/admin/migration'; // ✅ NEW: Migration panel
import StorageCleanupPage from './pages/admin/storage-cleanup'; // ✅ NEW: Storage cleanup panel
import { MyUploadsPanel } from './components/uploads/MyUploadsPanel'; // ✅ NEW: My uploads management
import { PaymentSuccess } from './components/PaymentSuccess'; // ✅ NEW: Payment success handler
import { PaymentCancel } from './components/PaymentCancel'; // ✅ NEW: Payment cancel handler
import EnterpriseSubscriptionSuccess from './pages/enterprise-subscription-success'; // ✅ FIXED: Enterprise subscription success
import EnterpriseAddonSuccess from './pages/enterprise-addon-success'; // ✅ FIXED: Enterprise add-on success

// Components
import { TabBar } from './components/TabBar';
import { UserProfile } from './components/UserProfile';
import { NewMessage } from './components/NewMessage';

export type Screen = 
  | 'landing'
  | 'signup-individual'
  | 'signup-enterprise'
  | 'signup-developer'
  | 'login'
  | 'login-individual'
  | 'login-enterprise'
  | 'login-developer'
  | 'onboarding'
  | 'auth-callback' // ✅ NEW: Auth0 callback
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
  | 'new-message'
  | 'activity'
  | 'my-uploads'; // ✅ NEW: My uploads management

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="purple">
          {/* ✅ NEW: Wrapper to pass userId to CreditsProvider */}
          <CreditsProviderWrapper>
            <GenerationQueueProvider>
              <LayoutGroup>
                <Routes>
                  {/* ✅ Generation View - Must be before /* */}
                  <Route path="/generation/:generationId" element={<GenerationView />} />
                  {/* ✅ Payment Success - Must be before /* */}
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  {/* ✅ Payment Cancel - Must be before /* */}
                  <Route path="/payment-cancel" element={<PaymentCancel />} />
                  {/* ✅ Enterprise Subscription Success - Must be before /* */}
                  <Route path="/enterprise-subscription-success" element={<EnterpriseSubscriptionSuccess />} />
                  {/* ✅ Enterprise Add-on Success - Must be before /* */}
                  <Route path="/enterprise-addon-success" element={<EnterpriseAddonSuccess />} />
                  {/* ✅ Admin Panel - Dev only */}
                  <Route path="/admin" element={<AdminPanel />} />
                  {/* ✅ Migration Panel - Admin only */}
                  <Route path="/admin/migration" element={<MigrationPage />} />
                  {/* ✅ Storage Cleanup Panel - Admin only */}
                  <Route path="/admin/storage-cleanup" element={<StorageCleanupPage />} />
                  {/* ✅ TEST: Campaign Page */}
                  <Route path="/test" element={<TestCampaignPage />} />
                  {/* All routes (including /create via AppContent) */}
                  <Route path="/*" element={<AppContent />} />
                </Routes>
              </LayoutGroup>
              <Toaster position="top-right" />
            </GenerationQueueProvider>
          </CreditsProviderWrapper>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

/**
 * ✅ Wrapper to get userId from AuthContext and pass to CreditsProvider
 */
function CreditsProviderWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  // ✅ CRITICAL: Stable userId that only updates when user truly changes
  // This prevents flickering between demo-user and real user
  const [stableUserId, setStableUserId] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    // Only update userId when NOT loading
    if (!loading) {
      if (user?.id) {
        // User is authenticated - update to real userId
        console.log('🔐 [CreditsProviderWrapper] Setting stable userId:', user.id);
        setStableUserId(user.id);
      } else if (!stableUserId) {
        // No user and no stableUserId yet - use demo-user
        console.log('🔐 [CreditsProviderWrapper] No user, using demo-user');
        setStableUserId('demo-user');
      }
      // ✅ IMPORTANT: If stableUserId exists but user is null, DON'T change it
      // This prevents losing the user during temporary auth refreshes
    }
  }, [user, loading, stableUserId]);
  
  // ✅ Wait for initial userId to be set
  if (!stableUserId) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-pulse text-white/40 text-sm">Chargement...</div>
      </div>
    );
  }
  
  // ✅ DEBUG: Log userId
  console.log('🆔 [CreditsProviderWrapper] userId:', stableUserId, 'user:', user);
  
  return (
    <CreditsProvider userId={stableUserId}>
      {children}
    </CreditsProvider>
  );
}

function AppContent() {
  const { credits, addPaidCredits, updateCredits } = useCredits();
  const { user, isAuthenticated, userType, canAccessRoute, requiresAuth, signOut, loading } = useAuth(); // ✅ ADD: loading
  const location = useLocation(); // ✅ Track URL changes
  const navigate = useNavigate(); // ✅ Add navigate for URL routing
  
  // ✅ REMOVED: Local auth state (now managed by AuthContext)
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [onboardingComplete, setOnboardingComplete] = useState(false);
  // const [userType, setUserType] = useState<'individual' | 'enterprise' | 'developer' | null>(null);
  
  // Detect initial screen from URL
  const getInitialScreen = (): Screen => {
    const path = window.location.pathname;
    if (path === '/create') return 'create';
    if (path === '/onboarding') return 'onboarding'; // ✅ ADD: Detect onboarding route
    
    // ✅ NEW: Auth0 callback detection (supports both /callback and /auth/callback)
    if (path === '/callback' || path === '/auth/callback' || window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
      return 'auth-callback';
    }
    
    // ✅ NEW: Landing page for non-authenticated users
    if (!isAuthenticated) return 'landing';
    
    // ✅ NEW: Route based on user type after auth
    if (isAuthenticated && user) {
      // ✅ CRITICAL: Check if onboarding is needed
      // ALL users must complete onboarding
      if (!user.onboardingComplete) {
        console.log('[App] User needs onboarding, routing to /onboarding');
        return 'onboarding';
      }
      
      // Route to appropriate screen based on user type
      if (userType === 'enterprise' || userType === 'developer') {
        return 'coconut-v14'; // ✅ Enterprise/Developer → Coconut
      }
      
      return 'feed'; // ✅ Individual → Feed
    }
    
    return 'landing';
  };
  
  const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen());
  
  // ✅ NEW: Handle navigation with both state + URL update
  const handleNavigate = React.useCallback((screen: typeof currentScreen) => {
    setCurrentScreen(screen);
    
    // Update URL to match screen
    const urlMap: Record<typeof currentScreen, string> = {
      'landing': '/',
      'signup-individual': '/signup-individual',
      'signup-enterprise': '/signup-enterprise',
      'signup-developer': '/signup-developer',
      'login': '/login',
      'login-individual': '/login-individual',
      'login-enterprise': '/login-enterprise',
      'login-developer': '/login-developer',
      'onboarding': '/onboarding',
      'auth-callback': '/callback',
      'feed': '/feed',
      'discovery': '/discovery',
      'messages': '/messages',
      'profile': '/profile',
      'create': '/create',
      'create-v4': '/create-v4',
      'coconut-campaign': '/coconut-campaign',
      'coconut-v14-cocoboard': '/coconut-v14-cocoboard',
      'coconut-v14': '/coconut-v14',
      'creator-dashboard': '/creator-dashboard',
      'wallet': '/wallet',
      'settings': '/settings',
      'new-message': '/new-message',
      'activity': '/activity',
    };
    
    const targetUrl = urlMap[screen] || '/';
    if (location.pathname !== targetUrl) {
      navigate(targetUrl);
    }
  }, [navigate, location.pathname]);
  
  // ✅ Sync currentScreen with URL pathname changes
  useEffect(() => {
    const path = location.pathname;
    
    // ✅ Create reverse mapping: URL → Screen
    const screenMap: Record<string, Screen> = {
      '/': 'landing',
      '/signup-individual': 'signup-individual',
      '/signup-enterprise': 'signup-enterprise',
      '/signup-developer': 'signup-developer',
      '/login': 'login',
      '/login-individual': 'login-individual',
      '/login-enterprise': 'login-enterprise',
      '/login-developer': 'login-developer',
      '/onboarding': 'onboarding',
      '/callback': 'auth-callback',
      '/feed': 'feed',
      '/discovery': 'discovery',
      '/messages': 'messages',
      '/profile': 'profile',
      '/create': 'create',
      '/create-v4': 'create-v4',
      '/coconut-campaign': 'coconut-campaign',
      '/coconut-v14-cocoboard': 'coconut-v14-cocoboard',
      '/coconut-v14': 'coconut-v14',
      '/creator-dashboard': 'creator-dashboard',
      '/wallet': 'wallet',
      '/settings': 'settings',
      '/new-message': 'new-message',
      '/activity': 'activity',
    };
    
    const expectedScreen = screenMap[path];
    
    // ✅ Only sync if URL has a known screen AND it doesn't match current screen
    if (expectedScreen && expectedScreen !== currentScreen) {
      console.log(`[AppContent] URL changed to ${path}, syncing screen to ${expectedScreen}`);
      setCurrentScreen(expectedScreen);
    }
  }, [location.pathname]); // ✅ REMOVED currentScreen from dependencies to prevent loop
  
  // ✅ NEW: Auto-navigate based on auth state changes
  useEffect(() => {
    // ✅ CRITICAL: Wait for auth to finish loading
    if (loading) {
      console.log('⏳ Auth still loading, skipping route protection');
      return;
    }
    
    // ✅ SECURITY: Also wait for userType to be defined (prevents race conditions on mobile)
    if (isAuthenticated && !userType && currentScreen !== 'onboarding' && currentScreen !== 'auth-callback') {
      console.log('⏳ Auth loaded but userType not yet defined, skipping route protection');
      return;
    }
    
    // ✅ SKIP route protection for onboarding and callback
    if (currentScreen === 'onboarding' || currentScreen === 'auth-callback') {
      return;
    }
    
    // ✅ IMPORTANT: Use direct navigate instead of handleNavigate to avoid dependency loop
    if (!isAuthenticated && requiresAuth(currentScreen)) {
      // ✅ Redirect to login if trying to access protected route without auth
      console.log('🔒 Route protected, redirecting to login');
      setCurrentScreen('login');
      if (location.pathname !== '/login') {
        navigate('/login');
      }
    } else if (isAuthenticated && !canAccessRoute(currentScreen)) {
      // ✅ Redirect to appropriate dashboard if wrong route for user type
      console.log('⚠️ Access denied for user type, redirecting');
      if (userType === 'enterprise' || userType === 'developer') {
        setCurrentScreen('coconut-v14');
        if (location.pathname !== '/coconut-v14') {
          navigate('/coconut-v14');
        }
      } else {
        setCurrentScreen('feed');
        if (location.pathname !== '/feed') {
          navigate('/feed');
        }
      }
    }
  }, [isAuthenticated, currentScreen, userType, loading, canAccessRoute, requiresAuth, navigate, location.pathname]);
  
  // ✅ NEW: Handle onboarding redirect when no user/userType
  useEffect(() => {
    if (!loading && currentScreen === 'onboarding' && (!user || !userType)) {
      console.warn('⚠️ Onboarding without user/userType, redirecting to landing');
      setCurrentScreen('landing');
      if (location.pathname !== '/') {
        navigate('/');
      }
    }
  }, [loading, currentScreen, user, userType, navigate, location.pathname]);
  
  const [createMode, setCreateMode] = useState<'create' | 'remix'>('create');
  const [createPrefillPrompt, setCreatePrefillPrompt] = useState<string>('');
  const [remixImage, setRemixImage] = useState<string | undefined>(undefined); // ✅ NEW: Remix image URL
  const [remixParentId, setRemixParentId] = useState<string | undefined>(undefined); // ✅ NEW: Parent creation ID for remix chain
  const [visitingUsername, setVisitingUsername] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  // V2 Creation Hub state
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  
  // ✅ REMOVED: Cleanup caused issues with remix navigation
  // Clean up is now handled manually in handleOpenCreate

  // Handle opening create screen with prefilled prompt
  const handleOpenCreate = (prefillPrompt?: string) => {
    // ✅ CRITICAL FIX: Check localStorage directly to avoid race conditions
    const auth0User = localStorage.getItem('cortexia_auth0_user');
    const hasAuth0User = !!auth0User;
    
    // ✅ DEBUG: Log auth state
    console.log('🎨 [handleOpenCreate] isAuthenticated:', isAuthenticated, 'user:', user?.id, 'loading:', loading, 'hasAuth0User:', hasAuth0User);
    
    // ✅ IMPORTANT: Also check loading state
    if (loading) {
      console.log('⏳ Auth still loading, please wait...');
      return;
    }
    
    // ✅ NEW: Check auth (either from context OR localStorage)
    if (!isAuthenticated && !hasAuth0User) {
      console.log('🔒 Create requires auth, redirecting to login');
      handleNavigate('login');
      return;
    }
    
    if (prefillPrompt) {
      setCreatePrefillPrompt(prefillPrompt);
    } else {
      setCreatePrefillPrompt('');
    }
    setCreateMode('create');
    setRemixImage(undefined); // Reset remix image
    setSelectedTool(null); // Reset tool selection when opening create
    
    // ✅ Use handleNavigate to sync state + URL
    handleNavigate('create');
  };

  // ✅ NEW: Handle opening remix screen with image
  const handleOpenRemix = (imageUrl: string, prefillPrompt?: string, parentCreationId?: string) => {
    // ✅ Check auth
    const auth0User = localStorage.getItem('cortexia_auth0_user');
    const hasAuth0User = !!auth0User;
    
    if (loading) {
      console.log('⏳ Auth still loading, please wait...');
      return;
    }
    
    if (!isAuthenticated && !hasAuth0User) {
      console.log('🔒 Remix requires auth, redirecting to login');
      handleNavigate('login');
      return;
    }
    
    // Set remix state
    setRemixImage(imageUrl);
    setRemixParentId(parentCreationId); // ✅ NEW: Store parent creation ID
    setCreatePrefillPrompt(prefillPrompt || '');
    setCreateMode('remix');
    setSelectedTool(null);
    
    console.log('🎨 [handleOpenRemix] Setting remix:', { imageUrl, parentCreationId, prefillPrompt });
    
    // ✅ Use handleNavigate to sync state + URL
    handleNavigate('create');
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
    handleNavigate('create');
  };

  const renderScreen = () => {
    // ✅ NEW: Landing & Auth flow
    if (currentScreen === 'landing') {
      return <LandingPage onNavigate={handleNavigate} />;
    }
    
    if (currentScreen === 'signup-individual' || currentScreen === 'signup-enterprise' || currentScreen === 'signup-developer') {
      return (
        <AuthFlow 
          onNavigate={handleNavigate}
          onSignupComplete={(type) => {
            // ✅ Auth handled by AuthContext.signUp
            handleNavigate('onboarding');
          }}
          onBack={() => handleNavigate('landing')}
          signupType={currentScreen}
        />
      );
    }
    
    if (currentScreen === 'login' || currentScreen === 'login-individual' || currentScreen === 'login-enterprise' || currentScreen === 'login-developer') {
      // ✅ Use AuthFlow for typed logins
      if (currentScreen === 'login-individual' || currentScreen === 'login-enterprise' || currentScreen === 'login-developer') {
        return (
          <AuthFlow
            signupType={currentScreen}
            onNavigate={handleNavigate}
            onSignupComplete={(type) => {
              // Not used for login, but required by AuthFlow
              handleNavigate('feed');
            }}
            onBack={() => handleNavigate('landing')}
          />
        );
      }
      
      // ✅ Fallback: Generic login redirects to individual
      return (
        <LoginPage 
          onNavigate={handleNavigate}
          onLoginSuccess={(userId, loginUserType) => {
            // ✅ Auth already handled by AuthContext.signIn
            // Just route to appropriate screen
            if (loginUserType === 'enterprise' || loginUserType === 'developer') {
              handleNavigate('coconut-v14');
            } else {
              handleNavigate('feed');
            }
          }}
        />
      );
    }
    
    if (currentScreen === 'onboarding') {
      // ✅ Handle onboarding - wait for auth to load
      if (loading) {
        return (
          <div className="flex items-center justify-center h-screen bg-black">
            <div className="animate-pulse text-white/40 text-sm">Chargement...</div>
          </div>
        );
      }
      
      // ✅ Check if user exists and has type (redirection handled by useEffect above)
      if (!user || !userType) {
        return (
          <div className="flex items-center justify-center h-screen bg-black">
            <div className="animate-pulse text-white/40 text-sm">Redirection...</div>
          </div>
        );
      }
      
      return (
        <OnboardingFlow 
          userType={userType}
          onComplete={async () => {
            // ✅ Route based on user type after onboarding
            console.log('[App] Onboarding complete, routing to dashboard for:', userType);
            
            // ✅ CRITICAL: Wait a bit for React state to settle before navigation
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // ✅ Navigate using handleNavigate (syncs state + URL)
            if (userType === 'enterprise') {
              console.log('[App] Enterprise → Coconut V14');
              handleNavigate('coconut-v14');
            } else if (userType === 'developer') {
              console.log('[App] Developer → API Dashboard (using Coconut for now)');
              handleNavigate('coconut-v14');
            } else {
              console.log('[App] Individual → Feed');
              handleNavigate('feed');
            }
          }}
        />
      );
    }
    
    // ✅ NEW: Auth0 Callback Handler
    if (currentScreen === 'auth-callback') {
      return <Auth0CallbackPage />;
    }
    
    // ✅ EXISTING: Main app screens
    switch (currentScreen) {
      case 'feed':
        return <ForYouFeed onNavigate={handleNavigate} isAuthenticated={isAuthenticated} onOpenRemix={handleOpenRemix} />;
      case 'discovery':
        return <Discovery 
          onNavigate={handleNavigate}
          onCreateClick={handleOpenCreate}
          onViewPost={handleViewPost}
          onViewCreator={handleViewCreator}
        />;
      case 'messages':
        return <Messages onNavigate={handleNavigate} />;
      case 'profile':
        return <Profile onNavigate={handleNavigate} />;
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
          return <CoconutV14App onNavigate={handleNavigate} />;
        }
        if (selectedTool === 'coconut-v13-premium' || selectedTool === 'coconut') {
          // ✅ CoconutV14 - CocoBoard Demo (Premium version)
          return <CocoBoardDemo onNavigate={() => handleBackFromCoconut()} />;
        }
        // Default: show hub
        return (
          <CreateHubGlass 
            onNavigate={handleNavigate}
            onSelectTool={handleSelectTool}
            remixImage={remixImage}
            remixPrompt={createPrefillPrompt}
            remixParentId={remixParentId}
          />
        );
      case 'create-v4':
        return (
          <div className="flex items-center justify-center h-screen bg-black text-white">
            <div className="text-center">
              <h1 className="text-2xl mb-4">Coconut V9 - Coming Soon</h1>
              <p className="text-gray-400 mb-6">The new creation experience is being built</p>
              <button
                onClick={() => handleNavigate('create')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        );
      case 'coconut-campaign':
        return <CoconutV14App onNavigate={handleBackFromCoconut} />; {/* ✅ FIXED: Use CoconutV14App instead of missing CoconutPage */}
      case 'coconut-v14-cocoboard':
        return <CocoBoardDemo onNavigate={() => handleBackFromCoconut()} />;
      case 'coconut-v14':
        // ✅ COCONUT V14 - Ultra-Premium Full App
        return <CoconutV14App onNavigate={handleNavigate} />;
      case 'creator-dashboard':
        return <CreatorDashboard onNavigate={handleNavigate} />;
      case 'wallet':
        return <Wallet onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage />; // ✅ FIXED: SettingsPage doesn't use onNavigate
      case 'new-message':
        return <NewMessage onNavigate={handleNavigate} />;
      case 'activity':
        return <Activity onNavigate={handleNavigate} />;
      case 'my-uploads':
        return <MyUploadsPanel />;
      default:
        return <ForYouFeed onNavigate={handleNavigate} onOpenRemix={handleOpenRemix} />;
    }
  };

  const showTabBar = !['landing', 'signup-individual', 'signup-enterprise', 'signup-developer', 'login', 'login-individual', 'login-enterprise', 'login-developer', 'onboarding', 'auth-callback', 'create', 'create-v4', 'coconut-campaign', 'coconut-v14-cocoboard', 'coconut-v14', 'creator-dashboard', 'wallet', 'settings', 'new-message', 'activity', 'my-uploads'].includes(currentScreen);

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
            onNavigate={handleNavigate}
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
        
        {/* ✅ Auth0 Setup Helper - Shows if Auth0 is not configured */}
        {(currentScreen === 'login' || currentScreen === 'landing') && (
          <div data-auth0-helper>
            <Auth0SetupHelper />
          </div>
        )}
        
        {/* ✅ Debug Credits Panel - Shows in dev mode only */}
        {user?.id && (
          <DebugCreditsPanel 
            userId={user.id}
            onCreditsUpdated={() => {
              // Force refresh credits by triggering updateCredits
              updateCredits();
              window.location.reload();
            }}
          />
        )}
      </div>
    </ProvidersProvider>
  );
}