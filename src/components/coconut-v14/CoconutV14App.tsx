/**
 * COCONUT V14 - APP ULTRA-PREMIUM
 * Liquid Glass Design with Coconut Theme
 * 
 * Features:
 * - Premium frosted glass sidebar
 * - Animated background avec coconut gradients
 * - Motion page transitions
 * - Mobile-responsive sidebar
 * - BDS 7 Arts compliance
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, ChevronRight, 
  LayoutDashboard, Sparkles, Zap, Settings, Clock, User, Grid, History
} from 'lucide-react';
import { useCredits } from '../../lib/contexts/CreditsContext';
import { useTranslation } from '../../lib/i18n'; // ✅ NEW: i18n hook
import { LanguageSwitcher } from '../LanguageSwitcher'; // ✅ NEW: Language switcher
import { useCurrentUser } from '../../lib/hooks/useCurrentUser'; // ✅ NEW: Get real user
import { useAuth } from '../../lib/contexts/AuthContext'; // ✅ NEW: Get userType
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
// ✅ FIX 1.2: Import CocoBoard store
import { useCocoBoardStore } from '../../lib/stores/cocoboard-store';
// ✅ NEW: Projects API
import { getProject, createProject, type Project } from '../../lib/services/cortexia-projects-api';
// ✅ NEW: Coconut Access Hook
import { useCoconutAccess } from '../../lib/hooks/useCoconutAccess';

// Components
import { IntentInputPremium } from './IntentInputPremium'; // 🆕 PREMIUM VERSION
import { AnalyzingLoaderPremium } from './AnalyzingLoaderPremium'; // 🆕 PREMIUM VERSION
import { CocoBoardPremium } from './CocoBoardPremium'; // 🆕 PREMIUM VERSION (upgraded!)
import { AnalysisViewPremium } from './AnalysisViewPremium'; // 🆕 PREMIUM VERSION
import { GenerationViewPremium } from './GenerationViewPremium'; // 🆕 PREMIUM VERSION (upgraded!)
import { ProjectsList } from './ProjectsList';
import { VideoFlowOrchestrator } from './VideoFlowOrchestrator'; // ✅ NEW: Video flow
// ✅ FIX 3.3: Import advanced error boundary
import { AdvancedErrorBoundary } from './AdvancedErrorBoundary';
// ✅ FIX: Import NotificationProvider
import { NotificationProvider, useNotify } from './NotificationProvider';
// ✅ FIX: Import SoundProvider
import { SoundProvider, useSoundContext } from './SoundProvider';
// ✅ FIX: Import missing components
import { DashboardPremium } from './DashboardPremium';
import { CreditsManager } from './CreditsManager';
import { SettingsPanel } from './SettingsPanel';
import { HistoryManager } from './HistoryManager';
import { CampaignHistoryManager } from './CampaignHistoryManager';
import { UnifiedHistoryManager } from './UnifiedHistoryManager';
import { UserProfileCoconut } from './UserProfileCoconut';
import { AssetManager } from './AssetManager';
import { EnterpriseSubscriptionManager } from './EnterpriseSubscriptionManager'; // ✅ NEW: Enterprise subscription
import { DirectionSelectorPremium } from './DirectionSelectorPremium'; // 🆕 PREMIUM VERSION
import { TypeSelectorPremium } from './TypeSelectorPremium'; // 🆕 PREMIUM VERSION
import { NavigationPremium } from './NavigationPremium'; // 🆕 NEW: Premium Navigation Sidebar
import { CampaignWorkflow } from './CampaignWorkflow'; // 🆕 NEW: Campaign mode workflow
import { EnterpriseTemplateSelector } from './EnterpriseTemplateSelector'; // 🆕 NEW: Enterprise templates
import { BatchGenerationModal, type BatchConfig } from './BatchGenerationModal'; // ✅ NEW: Batch generation
import { BatchResultsView, type BatchVariant } from './BatchResultsView'; // ✅ NEW: Batch results
import { TeamDashboard } from './TeamDashboard'; // ✅ NEW: Team collaboration dashboard
import { TeamInviteModal } from './TeamInviteModal'; // ✅ NEW: Team invite modal
import { ClientPortal } from './ClientPortal'; // ✅ NEW: Client portal view

// ✅ FIX: Import missing types and functions from correct locations
import type { IntentData } from './IntentInput';
import type { GeminiAnalysisResponse } from '../../lib/types/gemini';
import { generateCreativeDirections, applyDirectionToAnalysis } from '../../lib/utils/creative-directions-generator';
import { templateToIntentData, type EnterpriseTemplate } from '../../lib/data/enterprise-templates'; // 🆕 NEW: Template helper

// ✅ FIX: Import CreativeDirection type from DirectionSelector
import type { CreativeDirection } from './DirectionSelector';

// ============================================
// TYPES
// ============================================

type CoconutV14Screen = 
  | 'dashboard'        // ✅ Point d'entrée
  | 'boards'           // ✅ Projects list
  | 'type-select'      // 🆕 NOUVEAU: Choix image/video/campaign (PHASE 1)
  | 'template-select'  // 🆕 NEW: Enterprise template selection (PHASE 1.5)
  | 'intent-input'     // 🆕 New generation flow
  | 'analyzing'         // 🆕 Gemini analysis loading
  | 'direction-select'  // 🆕 NEW: Creative direction selection
  | 'analysis-view'     // 🆕 Display Gemini results
  | 'asset-manager'     // 🆕 Manage missing assets
  | 'cocoboard' 
  | 'generation'        // 🆕 Final generation
  | 'credits' 
  | 'settings' 
  | 'history' 
  | 'profile'
  | 'video-flow'       // ✅ NEW: Video flow screen
  | 'team'             // 🆕 NEW: Team collaboration dashboard (Enterprise only)
  | 'client-portal';   // 🆕 NEW: Client portal view (Client role only)

// ============================================
// PREMIUM SIDEBAR NAVIGATION
// ============================================

const CoconutV14Sidebar = ({
  currentScreen,
  onNavigate,
  onToggleSidebar,
  onBackToFeed,
}: {
  currentScreen: CoconutV14Screen;
  onNavigate: (screen: CoconutV14Screen) => void;
  onToggleSidebar: () => void;
  onBackToFeed?: () => void;
}) => {
  const { getCoconutCredits, refetchCredits, credits } = useCredits(); // ✅ Added credits object
  const totalCredits = getCoconutCredits(); // ✅ Coconut V14 uses total credits (monthly + add-on for Enterprise)
  const { playClick, playWhoosh } = useSoundContext(); // 🔊 PHASE 2: Add sound
  const { t } = useTranslation(); // ✅ NEW: i18n hook
  
  const menuItems = [
    { id: 'dashboard' as const, label: t('coconutV14.menu.dashboard'), icon: LayoutDashboard, color: 'from-[var(--coconut-shell)] to-[var(--coconut-palm)]' },
    { id: 'boards' as const, label: t('coconutV14.menu.boards'), icon: Grid, color: 'from-[var(--coconut-shell)] to-[var(--coconut-husk)]' },
    { id: 'history' as const, label: t('coconutV14.menu.history'), icon: History, color: 'from-[var(--coconut-shell)] to-[var(--coconut-husk)]' },
    { id: 'credits' as const, label: t('wallet.credits'), icon: Zap, color: 'from-[var(--coconut-husk)] to-[var(--coconut-shell)]' },
    { id: 'settings' as const, label: t('coconutV14.menu.settings'), icon: Settings, color: 'from-[var(--coconut-husk)] to-[var(--coconut-shell)]' },
  ];

  return (
    <motion.div
      className="h-full relative overflow-hidden"
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Glass background with coconut gradient */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-cream)]/40 via-[var(--coconut-milk)]/30 to-[var(--coconut-white)]/20" />
      
      {/* Border */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-white/30" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col p-6">
        
        {/* Header Premium avec gradient backdrop - WARM EXCLUSIVE */}
        <div className="relative mb-10">
          {/* Ambient glow WARM */}
          <div className="absolute -inset-6 bg-gradient-to-br from-[var(--coconut-shell)]/15 to-[var(--coconut-palm)]/10 rounded-3xl blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
          
          <div className="relative flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Logo avec triple glow effect WARM */}
              <div className="relative group">
                {/* Outer glow */}
                <div className="absolute -inset-2 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-2xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                {/* Middle glow */}
                <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                {/* Logo card */}
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] flex items-center justify-center shadow-2xl border border-white/30">
                  <Sparkles className="w-7 h-7 text-white group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-[var(--coconut-dark)] to-[var(--coconut-shell)] bg-clip-text text-transparent">Coconut V14</h2>
                <p className="text-xs text-[var(--coconut-husk)] font-medium">Creation Hub Pro</p>
              </div>
            </motion.div>
            
            {/* Language Switcher + Close button container */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <LanguageSwitcher variant="compact" />
              
              {/* Close button premium (mobile) - WARM */}
              <button
                onClick={onToggleSidebar}
                className="lg:hidden w-10 h-10 rounded-xl bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl flex items-center justify-center text-[var(--coconut-shell)] hover:from-white/90 hover:to-white/70 hover:scale-110 transition-all duration-300 shadow-xl border border-white/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Credits Badge Ultra-Premium - WARM EXCLUSIVE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-10 group"
        >
          {/* Ambient background glow WARM */}
          <div className="absolute -inset-2 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/15 rounded-2xl blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
          
          {/* Main card */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-2xl border border-white/70 shadow-2xl overflow-hidden">
            {/* Shimmer effect WARM */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--coconut-cream)]/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-[var(--coconut-husk)] uppercase tracking-wider block">Total Credits</span>
                  <span className="text-[10px] text-[var(--coconut-husk)]/60 mt-0.5 block">Pay-as-you-go • $0.09/credit</span>
                </div>
                <div className="relative">
                  {/* Icon glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-lg blur-md opacity-50" />
                  <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] flex items-center justify-center shadow-xl">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-baseline gap-2 mb-4">
                <div className="text-4xl font-black bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-husk)] to-[var(--coconut-palm)] bg-clip-text text-transparent">
                  {totalCredits.toLocaleString()}
                </div>
                <span className="text-sm font-bold text-[var(--coconut-husk)]">cr</span>
              </div>
              
              {/* ✅ NEW: Enterprise credits breakdown */}
              {credits.isEnterprise && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {/* Monthly Credits */}
                  <div className="bg-gradient-to-br from-[#F5EBE0]/20 to-[#E3D5CA]/20 rounded-lg p-2 border border-[#F5EBE0]/30">
                    <p className="text-[#6B5D4F]/60 text-xs mb-1">Mensuels</p>
                    <p className="text-[var(--coconut-dark)] text-lg font-semibold">
                      {(credits.monthlyCreditsRemaining || 0).toLocaleString()}
                    </p>
                    {credits.nextResetDate && (
                      <p className="text-[var(--coconut-husk)]/60 text-xs">
                        Reset {new Date(credits.nextResetDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                  
                  {/* Add-on Credits */}
                  <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-lg p-2 border border-purple-500/30">
                    <p className="text-purple-600 text-xs mb-1">Add-on</p>
                    <p className="text-[var(--coconut-dark)] text-lg font-semibold">
                      {(credits.addOnCredits || 0).toLocaleString()}
                    </p>
                    <p className="text-[var(--coconut-husk)]/60 text-xs">Jamais expirés</p>
                  </div>
                </div>
              )}
              
              {/* Progress indicator WARM */}
              <div className="relative">
                <div className="h-2 bg-gradient-to-r from-[var(--coconut-cream)] to-[var(--coconut-milk)] rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-husk)] to-[var(--coconut-palm)] rounded-full shadow-lg"
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                {/* Progress glow */}
                <motion.div
                  className="absolute inset-0 h-2 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', delay: 1 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Divider premium WARM */}
        <div className="relative mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--coconut-husk)]/30 to-transparent" />
          <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-[var(--coconut-cream)]/50 to-transparent blur-sm" />
        </div>
        
        {/* Navigation Items Premium - WARM EXCLUSIVE */}
        <nav className="flex-1 space-y-4 pr-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.02, x: 6, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  playClick();
                  playWhoosh();
                  onNavigate(item.id);
                  onToggleSidebar();
                }}
                className={`
                  relative w-full px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 group overflow-hidden
                  ${isActive 
                    ? 'text-white shadow-2xl' 
                    : 'text-[var(--coconut-husk)] hover:text-[var(--coconut-shell)]'
                  }
                `}
              >
                {/* Background for active state - WARM TRIPLE LAYER */}
                {isActive && (
                  <>
                    {/* Outer glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-shell)]/30 to-[var(--coconut-palm)]/30 rounded-2xl blur-lg -z-10" />
                    {/* Middle glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--coconut-shell)]/40 to-[var(--coconut-palm)]/40 rounded-2xl blur-md -z-10" />
                    {/* Main background */}
                    <motion.div 
                      layoutId="activeBackground"
                      className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-2xl shadow-2xl border border-white/20`}
                      transition={{ type: "spring", bounce: 0.15, duration: 0.7 }}
                      animate={{ 
                        boxShadow: [
                          '0 20px 40px -12px rgba(107, 93, 79, 0.3)',
                          '0 20px 40px -12px rgba(107, 93, 79, 0.5)',
                          '0 20px 40px -12px rgba(107, 93, 79, 0.3)',
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    {/* Active shimmer WARM */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </>
                )}
                
                {/* Background for inactive hover state - WARM GLASS */}
                {!isActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/0 group-hover:border-white/40" />
                    {/* Hover glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--coconut-shell)]/0 to-[var(--coconut-palm)]/0 group-hover:from-[var(--coconut-shell)]/20 group-hover:to-[var(--coconut-palm)]/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10" />
                  </>
                )}
                
                {/* Icon with glow for active - LARGER + PULSE */}
                <div className={`relative flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${isActive ? 'drop-shadow-2xl' : ''}`}>
                  <Icon className="w-6 h-6 flex-shrink-0 relative z-10" />
                  {isActive && (
                    <>
                      {/* Icon glow */}
                      <div className="absolute inset-0 bg-white/60 rounded-full blur-lg" />
                      {/* Pulse ring */}
                      <motion.div
                        className="absolute inset-0 bg-white/30 rounded-full"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </>
                  )}
                </div>
                
                <span className="text-sm font-semibold relative z-10 transition-all duration-200 group-hover:tracking-wide">{item.label}</span>
                
                {/* Active indicator - ENHANCED */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ 
                      type: "spring",
                      bounce: 0.5,
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    className="ml-auto relative z-10"
                  >
                    <div className="relative">
                      {/* Chevron glow */}
                      <div className="absolute inset-0 bg-white/40 rounded-full blur-sm" />
                      <ChevronRight className="relative w-5 h-5" />
                    </div>
                  </motion.div>
                )}
                
                {/* Inactive hover indicator - NEW */}
                {!isActive && (
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-auto relative z-10 opacity-0 group-hover:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4 text-[var(--coconut-shell)]" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </nav>
        
        {/* Divider premium WARM */}
        <div className="relative my-8">
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--coconut-husk)]/30 to-transparent" />
          <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-[var(--coconut-cream)]/50 to-transparent blur-sm" />
        </div>
        
        {/* Footer Premium - WARM EXCLUSIVE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Ambient glow WARM */}
          <div className="absolute -inset-6 bg-gradient-to-t from-[var(--coconut-palm)]/10 via-[var(--coconut-shell)]/5 to-transparent rounded-3xl blur-2xl" />
          
          <div className="relative p-5 rounded-xl bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-2xl border border-white/50 shadow-xl">
            <div className="flex items-center justify-center gap-3 mb-2">
              {/* Glow dots WARM */}
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] animate-pulse shadow-lg" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[var(--coconut-palm)] blur-sm animate-pulse" />
              </div>
              <p className="text-xs font-bold bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-husk)] bg-clip-text text-transparent">
                Powered by Cortexia AI
              </p>
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--coconut-palm)] to-[var(--coconut-shell)] animate-pulse shadow-lg" style={{ animationDelay: '0.5s' }} />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[var(--coconut-shell)] blur-sm animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
            <p className="text-xs text-[var(--coconut-husk)] text-center font-medium">
              Premium Creation Suite
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN APP CONTENT (uses NotificationProvider)
// ============================================

function CoconutV14AppContent({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  // ✅ Get real authenticated user
  const { userId, userName, displayName, isDemoUser } = useCurrentUser();
  const { userType } = useAuth();
  
  // ✅ NEW: Check Coconut access
  const { accessData, isLoading: isCheckingAccess, error: accessError, trackGeneration } = useCoconutAccess(userId);
  
  // ✅ PHASE 1 FIX: Start on Dashboard instead of intent-input
  const [currentScreen, setCurrentScreen] = useState<CoconutV14Screen>('dashboard');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  
  // 🆕 PHASE 1: Add state for selected type
  const [selectedType, setSelectedType] = useState<'image' | 'video' | 'campaign' | null>(null);
  
  // ✅ FIX 1.2: Remove local state, use zustand store instead
  // const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiAnalysisResponse | null>(null);
  // const [uploadedReferences, setUploadedReferences] = useState<...>(null);
  
  // ✅ FIX 1.2: Use zustand store for analysis data
  const { 
    geminiAnalysis, 
    uploadedReferences,
    setGeminiAnalysis,
    setUploadedReferences,
    reset: resetStore 
  } = useCocoBoardStore();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // 🆕 NEW: Creative Direction states
  const [originalUserInput, setOriginalUserInput] = useState<string>('');
  const [availableDirections, setAvailableDirections] = useState<CreativeDirection[]>([]);
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [isSelectingDirection, setIsSelectingDirection] = useState(false);
  
  // ✅ FIX 1.1: Add currentGenerationId for generation screen
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);
  
  // ✅ NEW: Prevent double submission
  const isSubmittingRef = useRef(false);
  
  // ✅ NEW: Video-specific intent data
  const [videoIntentData, setVideoIntentData] = useState<IntentData | null>(null);
  const [videoProjectId, setVideoProjectId] = useState<string | null>(null);
  
  // ✅ NEW: Campaign editing
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  
  // ✅ NEW: Batch Generation states
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchVariants, setBatchVariants] = useState<BatchVariant[]>([]);
  const [showBatchResults, setShowBatchResults] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  
  // ✅ NEW: Team Collaboration states (Enterprise only)
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]); // TeamMember[] from team-collaboration.tsx
  const [showTeamInvite, setShowTeamInvite] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'editor' | 'viewer' | 'client'>('editor');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  
  const { getCoconutCredits, refetchCredits } = useCredits();
  const notify = useNotify();
  const navigate = useNavigate(); // ✅ Keep for other routes if needed
  
  // ✅ NEW: Define API_BASE before using it
  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;
  
  // ✅ NEW: Load team data on mount (Enterprise only)
  useEffect(() => {
    const loadTeamData = async () => {
      // Only load team data for Enterprise users
      if (!accessData?.isEnterprise) {
        console.log('🚫 Not Enterprise - skipping team load');
        return;
      }
      
      try {
        // Load user's primary team
        const teamsResponse = await fetch(
          `${API_BASE}/team/teams?userId=${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            }
          }
        );
        
        if (!teamsResponse.ok) {
          console.warn('⚠️ Failed to load teams');
          return;
        }
        
        const teamsData = await teamsResponse.json();
        
        if (teamsData.success && teamsData.data?.teams?.length > 0) {
          const primaryTeam = teamsData.data.teams[0]; // Use first team
          setCurrentTeamId(primaryTeam.id);
          
          // Load team members
          const membersResponse = await fetch(
            `${API_BASE}/team/teams/${primaryTeam.id}/members`,
            {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              }
            }
          );
          
          if (membersResponse.ok) {
            const membersData = await membersResponse.json();
            if (membersData.success) {
              setTeamMembers(membersData.data.members || []);
              
              // Find current user's role
              const currentMember = membersData.data.members?.find(
                (m: any) => m.userId === userId
              );
              if (currentMember) {
                setUserRole(currentMember.role);
              }
              
              console.log(`✅ Team loaded: ${primaryTeam.name} (${membersData.data.members?.length || 0} members)`);
            }
          }
          
          // Load pending approvals count
          if (primaryTeam.id) {
            const approvalsResponse = await fetch(
              `${API_BASE}/team/teams/${primaryTeam.id}/approvals/pending?userId=${userId}`,
              {
                headers: {
                  'Authorization': `Bearer ${publicAnonKey}`,
                  'Content-Type': 'application/json',
                }
              }
            );
            
            if (approvalsResponse.ok) {
              const approvalsData = await approvalsResponse.json();
              if (approvalsData.success) {
                setPendingApprovalsCount(approvalsData.data?.count || 0);
                console.log(`✅ Pending approvals: ${approvalsData.data?.count || 0}`);
              }
            }
          }
        } else {
          console.log('ℹ️ No team found - user needs to create one');
        }
      } catch (error) {
        console.error('❌ Error loading team data:', error);
        // Don't show error to user - team features will simply be disabled
      }
    };
    
    if (userId && accessData) {
      loadTeamData();
    }
  }, [userId, accessData]);
  
  // ✅ NEW: Access Control - Block unauthorized users
  useEffect(() => {
    // Skip if still checking access
    if (isCheckingAccess) return;
    
    // Block developers completely
    if (userType === 'developer') {
      console.log('🚫 Developers cannot access Coconut V14');
      toast.error('Developers cannot access Coconut. Use API instead.');
      navigate('/dashboard-dev');
      return;
    }
    
    // Check if user has Coconut access (Enterprise or Creator)
    if (!accessData?.hasAccess) {
      console.log('🚫 No Coconut access detected');
      toast.error('You need Creator status or Enterprise account to access Coconut V14');
      navigate('/create-hub');
      return;
    }
    
    // Show warning if no generations left (for Creators only)
    if (!accessData.isEnterprise && accessData.remainingGenerations === 0) {
      toast.warning('No Coconut generations left this month. Upgrade to Enterprise for unlimited access.');
    }
    
    console.log('✅ Coconut access granted:', {
      isEnterprise: accessData.isEnterprise,
      remaining: accessData.remainingGenerations,
      isCreator: accessData.isCreator
    });
  }, [userId, userType, accessData, isCheckingAccess, navigate]);
  
  // ✅ NEW: Load project from URL params if projectId is provided
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectIdParam = params.get('projectId');
    
    if (projectIdParam) {
      console.log('📂 Loading project from URL:', projectIdParam);
      
      // Load project from database
      getProject(projectIdParam)
        .then(project => {
          console.log('✅ Project loaded:', project);
          
          // Check project type
          if (project.type === 'video') {
            // Load video flow with project data
            setVideoIntentData({
              description: project.intent,
              references: {
                images: project.assets?.filter(a => a.type.startsWith('image')).map(a => ({
                  file: new File([], a.url.split('/').pop() || 'image'),
                  preview: a.url,
                  description: a.type
                })) || [],
                videos: project.assets?.filter(a => a.type.startsWith('video')).map(a => ({
                  file: new File([], a.url.split('/').pop() || 'video'),
                  preview: a.url,
                  description: a.type
                })) || []
              },
              format: '16:9', // Default, can be stored in project.metadata
              resolution: '4K',
              targetUsage: project.objective || 'general'
            });
            
            setSelectedType('video');
            setCurrentProjectId(project.id);
            setCurrentScreen('video-flow');
            
            toast.success('Projet chargé ! Analyse en cours...');
          } else {
            // Image/campaign flow
            setCurrentProjectId(project.id);
            toast.info('Chargement du projet...');
            // TODO: Load image project data
          }
        })
        .catch(error => {
          console.error('❌ Failed to load project:', error);
          toast.error('Erreur lors du chargement du projet');
          setCurrentScreen('dashboard');
        });
    }
  }, []); // Run once on mount
  
  // ✅ Handler: Submit intent and analyze with Gemini
  const handleIntentSubmit = async (intentData: IntentData) => {
    // ✅ Prevent double submission
    if (isSubmittingRef.current) {
      console.warn('⚠️ Submit already in progress, ignoring duplicate call');
      return;
    }
    
    isSubmittingRef.current = true;
    console.log('🚀 handleIntentSubmit called', intentData);
    
    try {
      setIsAnalyzing(true);
      setCurrentScreen('analyzing');
      
      // Step 1: Create project first (for BOTH image and video)
      console.log('📦 Creating project...');
      
      // ✅ PRODUCTION: Use unified /projects API
      const project = await createProject({
        userId: userId || 'demo-user',
        type: selectedType === 'video' ? 'video' : 'image', // ✅ Set correct type
        intent: intentData.description,
        objective: intentData.targetUsage || (selectedType === 'video' ? intentData.callToAction : ''),
        assets: [
          ...intentData.references.images.map(img => ({
            type: `image/${img.file.type.split('/')[1] || 'png'}`,
            url: img.preview
          })),
          ...intentData.references.videos.map(vid => ({
            type: `video/${vid.file.type.split('/')[1] || 'mp4'}`,
            url: vid.preview || ''
          }))
        ],
        metadata: {
          format: intentData.format,
          resolution: intentData.resolution,
          videoType: selectedType === 'video' ? intentData.videoType : undefined,
          targetDuration: selectedType === 'video' ? intentData.targetDuration : undefined,
          source: 'coconut-v14-app'
        }
      });
      
      const newProjectId = project.id;
      console.log('✅ Project created:', newProjectId);
      setCurrentProjectId(newProjectId);
      
      // ✅ If video type, use VideoFlowOrchestrator
      if (selectedType === 'video') {
        setVideoIntentData(intentData);
        setVideoProjectId(newProjectId); // ✅ Store video projectId
        setCurrentScreen('video-flow');
        isSubmittingRef.current = false; // ✅ Reset flag
        return;
      }
      
      // Step 2: Call backend analyze-intent route
      console.log('🧠 Analyzing intent with Gemini...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/coconut-v14/analyze-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId, // ✅ Use real user ID
            projectId: newProjectId, // ✅ Use real project ID
            description: intentData.description,
            references: {
              images: intentData.references.images.map((upload, i) => ({
                url: upload.preview, // ✅ Use signed URL from upload (not blob)
                filename: upload.file.name,
                description: upload.description || '',
              })),
              videos: intentData.references.videos.map((upload, i) => ({
                url: upload.preview || '', // ✅ Use signed URL from upload (not blob)
                filename: upload.file.name,
                description: upload.description || '',
              })),
            },
            format: intentData.format,
            resolution: intentData.resolution,
            targetUsage: intentData.targetUsage,
          }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Analysis failed:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // ✅ DEBUG: Log raw response text BEFORE JSON parsing
      const responseText = await response.text();
      console.log('🔍 [DEBUG] Raw response (first 500 chars):', responseText.substring(0, 500));
      
      const result = JSON.parse(responseText);
      
      // ✅ DEBUG: Check finalPrompt type immediately after parsing
      console.log('🔍 [DEBUG] finalPrompt type after JSON.parse:', typeof result.data?.finalPrompt);
      console.log('🔍 [DEBUG] finalPrompt preview:', 
        typeof result.data?.finalPrompt === 'string' 
          ? result.data.finalPrompt.substring(0, 100) + '...'
          : JSON.stringify(result.data?.finalPrompt).substring(0, 200) + '...'
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze intent');
      }
      
      console.log('✅ Analysis complete', result.data);
      
      // ✅ Store uploaded references with URLs for later use
      setUploadedReferences({
        images: intentData.references.images.map(upload => ({
          url: upload.preview,
          description: upload.description || '',
          filename: upload.file.name
        })),
        videos: intentData.references.videos.map(upload => ({
          url: upload.preview || '',
          description: upload.description || '',
          filename: upload.file.name
        }))
      });
      
      // 🆕 NEW: Store original user input for direction selection
      setOriginalUserInput(intentData.description);
      
      // 🆕 NEW: Generate creative directions
      console.log('🎨 Generating creative directions...');
      const directions = await generateCreativeDirections(
        intentData.description,
        result.data.concept?.direction || '',  //  FIXED: result.data is the analysis, not result.data.analysis
        { 
          images: intentData.references.images,
          videos: intentData.references.videos 
        }
      );
      
      setAvailableDirections(directions);
      setGeminiAnalysis(result.data);  // ✅ FIXED: result.data is the analysis
      setCurrentProjectId(result.data.projectId || newProjectId);
      
      // ✅ Refetch credits after analysis (100 credits were deducted)
      await refetchCredits();
      console.log('💎 Credits refreshed after analysis');
      
      // 🆕 NEW: Show direction selector instead of going directly to analysis-view
      setCurrentScreen('direction-select');
      
      notify.success('Analyse terminée !', 'Choisissez une direction créative');
      
    } catch (error) {
      console.error('❌ Error analyzing intent:', error);
      notify.error('Erreur d\'analyse', error instanceof Error ? error.message : 'Une erreur est survenue');
      setCurrentScreen('intent-input');
    } finally {
      setIsAnalyzing(false);
      isSubmittingRef.current = false;
    }
  };
  
  // ✅ Handler: Proceed from analysis to CocoBoard or AssetManager
  const handleProceedFromAnalysis = () => {
    if (!geminiAnalysis) return;
    
    // Check if there are missing assets
    const hasMissingAssets = geminiAnalysis.assetsRequired.missing.length > 0;
    
    if (hasMissingAssets) {
      setCurrentScreen('asset-manager');
    } else {
      setCurrentScreen('cocoboard');
    }
  };
  
  // ✅ Handler: Edit intent (go back to IntentInput)
  const handleEditIntent = () => {
    setCurrentScreen('intent-input');
  };
  
  // ✅ Handler: Reanalyze with same data
  const handleReanalyze = async () => {
    // This would need to store the original intent data
    // For now, just go back to intent input
    setCurrentScreen('intent-input');
    notify.info('Modification nécessaire', 'Veuillez soumettre à nouveau votre projet');
  };
  
  // ✅ Handler: Assets completed, proceed to CocoBoard
  const handleAssetsCompleted = () => {
    setCurrentScreen('cocoboard');
  };
  
  // ✅ Handler: Navigate to create (new generation)
  const handleNavigateToCreate = () => {
    // ✅ PHASE 1: Navigate to type-select instead of intent-input
    resetStore();
    setCurrentProjectId(null);
    setCurrentGenerationId(null);
    setSelectedType(null); // Reset type selection
    setCurrentScreen('type-select'); // ✅ NEW: Go to type selector first
  };
  
  // 🆕 PHASE 1: Handler for type selection
  const handleTypeSelect = (type: 'image' | 'video' | 'campaign') => {
    console.log('📸 Type selected:', type);
    
    // ✅ Block Campaign mode for non-Enterprise users (Creators only)
    if (type === 'campaign' && !accessData?.isEnterprise) {
      console.log('🚫 Campaign mode blocked for non-Enterprise');
      toast.error('Campaign mode is only available for Enterprise accounts');
      notify.error('Upgrade Required', 'Campaign mode is an Enterprise-only feature');
      return;
    }
    
    // ✅ Check if Creator has generations left
    if (!accessData?.isEnterprise && accessData?.remainingGenerations === 0) {
      console.log('🚫 No generations left');
      toast.error('No Coconut generations left this month');
      notify.error('Quota Exceeded', 'Buy 1000 credits to unlock Creator access or upgrade to Enterprise');
      return;
    }
    
    setSelectedType(type);
    
    // ✅ NEW: If campaign type, use dedicated campaign workflow
    if (type === 'campaign') {
      setCurrentScreen('campaign');
    } else {
      setCurrentScreen('intent-input');
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--coconut-white)] relative">
      
      {/* Premium animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] opacity-60" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,165,116,0.08)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(107,142,112,0.06)_0%,transparent_50%)]" />
      
      {/* Mobile Menu Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-12 h-12 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 text-[var(--coconut-shell)] shadow-xl flex items-center justify-center"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </motion.button>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-72 flex-shrink-0 relative z-10">
        <NavigationPremium
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          onToggleSidebar={() => {}}
          onBackToFeed={onNavigate ? () => onNavigate('feed') : undefined}
          pendingApprovalsCount={pendingApprovalsCount}
        />
      </div>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            
            {/* Sidebar */}
            <div className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50">
              <NavigationPremium
                currentScreen={currentScreen}
                onNavigate={setCurrentScreen}
                onToggleSidebar={() => setSidebarOpen(false)}
                onBackToFeed={onNavigate ? () => onNavigate('feed') : undefined}
                pendingApprovalsCount={pendingApprovalsCount}
              />
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ 
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1] // BDS M2 easing
            }}
            className="h-full"
          >
            {currentScreen === 'dashboard' && (
              <DashboardPremium
                onNavigateToCreate={handleNavigateToCreate}
                onNavigateToCredits={() => setCurrentScreen('credits')}
                onNavigateToTypeSelect={() => setCurrentScreen('type-select')} // ✅ NEW: Navigate to type selector
              />
            )}
            
            {currentScreen === 'cocoboard' && (
              <CocoBoardPremium 
                projectId={currentProjectId || 'demo-project'} 
                userId={userId}
                analysis={geminiAnalysis}
                uploadedReferences={uploadedReferences}
                onGenerationStart={(generationId: string) => {
                  console.log('🎬 Generation started:', generationId);
                  // ✅ FIX 1.1: Use state instead of navigation
                  setCurrentGenerationId(generationId);
                  setCurrentScreen('generation');
                }}
                // ✅ NEW: Pass team collaboration props
                teamId={currentTeamId || undefined}
                teamMembers={teamMembers}
                isEnterprise={accessData?.isEnterprise || false}
              />
            )}
            
            {currentScreen === 'credits' && (
              <EnterpriseSubscriptionManager />
            )}
            
            {currentScreen === 'settings' && (
              <SettingsPanel />
            )}
            
            {currentScreen === 'history' && (
              <UnifiedHistoryManager 
                userId={userId || 'demo-user'}
                onViewCampaign={(cocoBoardId) => {
                  console.log('📋 [App] Loading campaign for editing:', cocoBoardId);
                  setEditingCampaignId(cocoBoardId);
                  setSelectedType('campaign');
                  setCurrentScreen('campaign');
                }}
              />
            )}
            
            {currentScreen === 'profile' && (
              <UserProfileCoconut 
                username="demo-user"
                onClose={() => setCurrentScreen('dashboard')}
                allPosts={[]}
              />
            )}
            
            {currentScreen === 'intent-input' && (
              <IntentInputPremium
                selectedType={selectedType!} // ✅ PHASE 2: Pass selected type
                onSubmit={handleIntentSubmit}
                onBack={() => setCurrentScreen('type-select')} // ✅ PHASE 2: Back to type selector
                isLoading={isAnalyzing}
                userCredits={getCoconutCredits()}
                userId={userId} // ✅ NEW: Pass real userId
              />
            )}
            
            {currentScreen === 'analyzing' && (
              <AnalyzingLoaderPremium />
            )}
            
            {currentScreen === 'analysis-view' && geminiAnalysis && (
              <AnalysisViewPremium
                analysis={geminiAnalysis}
                onProceed={handleProceedFromAnalysis}
                onEdit={handleEditIntent}
                onReanalyze={handleReanalyze}
                userCredits={getCoconutCredits()}
              />
            )}
            
            {currentScreen === 'asset-manager' && geminiAnalysis && (
              <AssetManager
                missingAssets={geminiAnalysis.assetsRequired.missing}
                onGenerate={async (assetId: string) => {
                  console.log('🎨 Generate asset:', assetId);
                  // TODO: Call generation API
                  await new Promise(resolve => setTimeout(resolve, 2000));
                }}
                onRequestFromUser={(assetId: string, message: string) => {
                  console.log('📧 Request from user:', assetId, message);
                  notify.success('Demande envoyée', 'Nous avons envoyé votre demande au client');
                }}
                onAssetUploaded={(assetId: string, file: File) => {
                  console.log('📤 Asset uploaded:', assetId, file.name);
                  notify.success('Asset uploadé', `${file.name} a été ajouté`);
                }}
                onSkip={(assetId: string) => {
                  console.log('⏭️ Skip asset:', assetId);
                }}
                onComplete={() => {
                  console.log('✅ All assets handled, proceeding to CocoBoard');
                  setCurrentScreen('cocoboard');
                }}
              />
            )}
            
            {currentScreen === 'direction-select' && geminiAnalysis && (
              <DirectionSelectorPremium
                analysis={geminiAnalysis}
                availableDirections={availableDirections}
                onDirectionSelect={async (directionId: string) => {
                  console.log('🎨 Direction selected:', directionId);
                  setSelectedDirection(directionId);
                  setIsSelectingDirection(true);
                  
                  // Apply direction to analysis
                  const updatedAnalysis = applyDirectionToAnalysis(
                    geminiAnalysis,
                    directionId,
                    availableDirections // 🔧 FIX: Pass the directions array
                  );
                  
                  setGeminiAnalysis(updatedAnalysis);
                  setIsSelectingDirection(false);
                  
                  // Proceed to analysis view
                  setCurrentScreen('analysis-view');
                }}
                onEdit={handleEditIntent}
                onReanalyze={handleReanalyze}
                userCredits={getCoconutCredits()}
              />
            )}
            
            {currentScreen === 'generation' && currentGenerationId && (
              <GenerationViewPremium
                generationId={currentGenerationId}
                projectId={currentProjectId || 'demo-project'}
                userId="demo-user"
                analysis={geminiAnalysis}
                uploadedReferences={uploadedReferences}
                onNavigateToCreate={handleNavigateToCreate}
              />
            )}
            
            {currentScreen === 'type-select' && (
              <TypeSelectorPremium
                onSelectType={handleTypeSelect}
                onBack={() => setCurrentScreen('dashboard')}
                onBrowseTemplates={() => setCurrentScreen('template-select')} // ✅ NEW: Navigate to templates
                coconutGenerationsRemaining={accessData?.remainingGenerations}
                isEnterprise={accessData?.isEnterprise}
              />
            )}
            
            {currentScreen === 'boards' && (
              <ProjectsList
                onCreateNew={handleNavigateToCreate}
                onProjectClick={(projectId) => {
                  console.log('📂 Project clicked:', projectId);
                  // TODO: Load project and navigate to cocoboard
                  notify.info('Project', `Loading project ${projectId}...`);
                  setCurrentProjectId(projectId);
                  setCurrentScreen('cocoboard');
                }}
              />
            )}
            
            {currentScreen === 'video-flow' && videoIntentData && (
              <VideoFlowOrchestrator
                intentData={videoIntentData}
                userId={userId || 'demo-user'}
                projectId={videoProjectId || undefined} // ✅ Pass projectId
                onBack={() => setCurrentScreen('dashboard')}
              />
            )}
            
            {currentScreen === 'campaign' && (
              <CampaignWorkflow
                userId={userId || 'demo-user'}
                onBack={() => {
                  setEditingCampaignId(null); // Reset editing state
                  setCurrentScreen('dashboard');
                }}
                existingCocoBoardId={editingCampaignId || undefined}
              />
            )}
            
            {currentScreen === 'template-select' && (
              <EnterpriseTemplateSelector
                selectedType={selectedType || 'image'} // ✅ Pass selected type (default to image)
                onSelectTemplate={(template: EnterpriseTemplate) => {
                  console.log('🎨 Template selected:', template);
                  // ✅ Set the type from template before submitting
                  setSelectedType(template.type as 'image' | 'video' | 'campaign');
                  const intentData = templateToIntentData(template);
                  handleIntentSubmit(intentData as IntentData);
                }}
                onSkip={() => {
                  // ✅ Skip templates and go to intent input
                  setCurrentScreen('intent-input');
                }}
                onBack={() => setCurrentScreen('type-select')}
              />
            )}
            
            {currentScreen === 'batch-generation' && (
              <BatchGenerationModal
                show={showBatchModal}
                onClose={() => setShowBatchModal(false)}
                onGenerate={async (config: BatchConfig) => {
                  console.log('🎨 Batch generation config:', config);
                  setIsBatchGenerating(true);
                  
                  // TODO: Call batch generation API
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  
                  // Simulate batch results
                  const variants: BatchVariant[] = [
                    { id: '1', name: 'Variant 1', preview: 'https://via.placeholder.com/150' },
                    { id: '2', name: 'Variant 2', preview: 'https://via.placeholder.com/150' },
                    { id: '3', name: 'Variant 3', preview: 'https://via.placeholder.com/150' },
                  ];
                  
                  setBatchVariants(variants);
                  setIsBatchGenerating(false);
                  setShowBatchResults(true);
                }}
                isGenerating={isBatchGenerating}
              />
            )}
            
            {currentScreen === 'batch-results' && (
              <BatchResultsView
                show={showBatchResults}
                onClose={() => setShowBatchResults(false)}
                variants={batchVariants}
                onDownload={(variantId: string) => {
                  console.log('📥 Downloading variant:', variantId);
                  // TODO: Call download API
                  notify.success('Download started', 'Your file is being prepared for download');
                }}
              />
            )}
            
            {currentScreen === 'team' && accessData?.isEnterprise && (
              <TeamDashboard
                userId={userId || 'demo-user'}
                enterpriseAccountId={accessData?.enterpriseAccountId || 'demo-enterprise'}
                onCreateTeam={() => {
                  notify.info('Create Team', 'Team creation flow');
                }}
                onInviteMember={(teamId) => {
                  setCurrentTeamId(teamId);
                  setShowTeamInvite(true);
                }}
                onManageTeam={(teamId) => {
                  console.log('Manage team:', teamId);
                }}
              />
            )}
            
            {currentScreen === 'client-portal' && userRole === 'client' && currentTeamId && (
              <ClientPortal
                userId={userId || 'demo-user'}
                userName={displayName || userName}
                teamId={currentTeamId}
                teamMembers={teamMembers}
              />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Team Invite Modal */}
        <AnimatePresence>
          {showTeamInvite && currentTeamId && (
            <TeamInviteModal
              isOpen={showTeamInvite}
              onClose={() => setShowTeamInvite(false)}
              teamId={currentTeamId}
              invitedBy={userId || 'demo-user'}
              onMemberInvited={() => {
                notify.success('Member invited successfully');
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// EXPORTED WRAPPER WITH NOTIFICATION PROVIDER
// ============================================

export function CoconutV14App({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  return (
    <AdvancedErrorBoundary context="CoconutV14App">
      <SoundProvider>
        <NotificationProvider>
          <CoconutV14AppContent onNavigate={onNavigate} />
        </NotificationProvider>
      </SoundProvider>
    </AdvancedErrorBoundary>
  );
}