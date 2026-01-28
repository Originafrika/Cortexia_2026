/**
 * NAVIGATION SIDEBAR ULTRA-PREMIUM - Coconut V14
 * Liquid Glass Design with Active State Indicators
 * 
 * Features:
 * - Warm Coconut theme
 * - Active state with glow effects
 * - Animated transitions
 * - User profile section
 * - Credits display
 * - BDS 7 Arts compliance
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Sparkles,
  Clock,
  Zap,
  Settings,
  User,
  ChevronRight,
  Plus,
  Building2,
  ArrowLeft,
  Users,
} from 'lucide-react';
import { useCredits } from '../../lib/contexts/CreditsContext';
import { useSoundContext } from './SoundProvider';
import { useAuth } from '../../lib/contexts/AuthContext'; // ✅ NEW: Import useAuth

type CoconutScreen = 
  | 'dashboard'
  | 'type-select'
  | 'intent-input'
  | 'analyzing'
  | 'direction-select'
  | 'analysis-view'
  | 'asset-manager'
  | 'cocoboard'
  | 'generation'
  | 'history'
  | 'credits'
  | 'settings'
  | 'profile'
  | 'team'             // ✅ NEW: Team collaboration (Enterprise only)
  | 'client-portal';   // ✅ NEW: Client portal (Client role)

interface NavigationPremiumProps {
  currentScreen: CoconutScreen;
  onNavigate: (screen: CoconutScreen) => void;
  onToggleSidebar?: () => void;
  onBackToFeed?: () => void; // ✅ NEW: Allow navigation back to Feed
  pendingApprovalsCount?: number; // ✅ NEW: Count for badge
}

export function NavigationPremium({
  currentScreen,
  onNavigate,
  onToggleSidebar,
  onBackToFeed,
  pendingApprovalsCount = 0
}: NavigationPremiumProps) {
  const { credits, getCoconutCredits } = useCredits();
  const { playClick, playHover } = useSoundContext();
  const { user } = useAuth(); // ✅ NEW: Use user from AuthContext
  
  // ✅ FIXED: Calculate total differently for Enterprise vs Regular users
  const totalCredits = credits.isEnterprise 
    ? (credits.monthlyCreditsRemaining || 0) + (credits.addOnCredits || 0)
    : getCoconutCredits(); // Regular users: paid credits only
  
  // Navigation items
  const navItems = [
    { 
      id: 'dashboard' as CoconutScreen, 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      description: 'Vue d\'ensemble'
    },
    { 
      id: 'type-select' as CoconutScreen, 
      icon: Plus, 
      label: 'Nouveau projet',
      description: 'Créer une génération',
      highlight: true
    },
    // ✅ NEW: Team button (Enterprise only)
    ...(credits.isEnterprise ? [{
      id: 'team' as CoconutScreen,
      icon: Users,
      label: 'Team',
      description: 'Collaboration',
      badge: pendingApprovalsCount || 0, // ✅ FIXED: Use real pending count
      enterpriseOnly: true
    }] : []),
    { 
      id: 'history' as CoconutScreen, 
      icon: Clock, 
      label: 'Historique',
      description: 'Projets récents'
    },
    { 
      id: 'credits' as CoconutScreen, 
      icon: Zap, 
      label: 'Crédits',
      description: 'Gérer vos crédits'
    },
    { 
      id: 'settings' as CoconutScreen, 
      icon: Settings, 
      label: 'Paramètres',
      description: 'Configuration'
    },
  ];
  
  const handleNavigate = (screen: CoconutScreen) => {
    playClick();
    onNavigate(screen);
    onToggleSidebar?.();
  };
  
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full bg-white/40 backdrop-blur-3xl border-r border-white/30 flex flex-col shadow-2xl"
    >
      {/* Header / Logo */}
      <div className="relative p-6 border-b border-white/20">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)]/10 to-[var(--coconut-palm)]/10 rounded-t-2xl blur-xl" />
        
        <div className="relative flex items-center gap-3">
          {/* Logo icon - Use company logo if Enterprise */}
          {user?.type === 'enterprise' && user?.companyLogo ? (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-xl blur-md opacity-30 animate-pulse" />
              <div className="relative w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center shadow-lg overflow-hidden border border-white/40">
                {/* ✅ Company Logo Display */}
                {user.companyLogo ? (
                  <img 
                    src={user.companyLogo} 
                    alt="Company Logo" 
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  // No logo - show fallback icon
                  <Building2 className="w-6 h-6 text-[var(--coconut-shell)]" />
                )}
              </div>
            </div>
          ) : (
            // Default Coconut logo
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-xl blur-md opacity-50 animate-pulse" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
          
          {/* Text */}
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] bg-clip-text text-transparent">
              {user?.type === 'enterprise' && user?.companyName ? user.companyName : 'Coconut V14'} {/* ✅ Company name */}
            </h1>
            <p className="text-xs text-[var(--coconut-husk)]">
              {user?.type === 'enterprise' ? 'Enterprise Workspace' : 'AI Orchestration'}
            </p>
          </div>
        </div>
      </div>
      
      {/* ✅ NEW: Back to Feed Button (for Creators only) */}
      {onBackToFeed && user?.type !== 'enterprise' && (
        <div className="px-4 pt-4">
          <motion.button
            onClick={() => {
              playClick();
              onBackToFeed();
            }}
            onMouseEnter={playHover}
            whileHover={{ x: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full text-left px-4 py-3 rounded-xl transition-all group hover:bg-white/30"
          >
            <div className="relative flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-white/40 text-[var(--coconut-shell)] group-hover:bg-white/60 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--coconut-husk)] group-hover:text-[var(--coconut-shell)] transition-colors">
                  Retour au Feed
                </div>
                <div className="text-xs text-[var(--coconut-husk)]/70">
                  Quitter Coconut
                </div>
              </div>
            </div>
          </motion.button>
        </div>
      )}
      
      {/* Credits Display */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)] rounded-xl p-4 border border-white/40 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[var(--coconut-husk)]">Vos crédits</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                {totalCredits}
              </span>
              <span className="text-xs text-[var(--coconut-husk)]">disponibles</span>
            </div>
            
            {/* ✅ NEW: Show breakdown based on user type */}
            {credits.isEnterprise ? (
              // Enterprise: Show monthly + add-on
              <div className="mt-3 flex gap-2 text-[10px]">
                <div className="flex items-center gap-1 text-[var(--coconut-husk)]">
                  <div className="w-2 h-2 rounded-full bg-[var(--coconut-palm)]" />
                  <span>{credits.monthlyCreditsRemaining || 0} mensuels</span>
                </div>
                <div className="flex items-center gap-1 text-[var(--coconut-husk)]">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>{credits.addOnCredits || 0} add-on</span>
                </div>
              </div>
            ) : (
              // Regular: Show free + paid
              <div className="mt-3 flex gap-2 text-[10px]">
                <div className="flex items-center gap-1 text-[var(--coconut-husk)]">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{credits.free} gratuits</span>
                </div>
                <div className="flex items-center gap-1 text-[var(--coconut-husk)]">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>{credits.paid} payés</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              onMouseEnter={playHover}
              whileHover={{ x: 4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative w-full text-left px-4 py-3 rounded-xl transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 shadow-lg'
                  : 'hover:bg-white/30'
              }`}
            >
              {/* Active indicator glow */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-shell)]/30 to-[var(--coconut-palm)]/30 rounded-xl blur-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              {/* Content */}
              <div className="relative flex items-center gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white shadow-lg'
                    : item.highlight
                    ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white'
                    : 'bg-white/40 text-[var(--coconut-shell)] group-hover:bg-white/60'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[var(--coconut-shell)]'
                      : 'text-[var(--coconut-husk)] group-hover:text-[var(--coconut-shell)]'
                  }`}>
                    {item.label}
                  </div>
                  <div className="text-xs text-[var(--coconut-husk)]/70">
                    {item.description}
                  </div>
                </div>
                
                {/* ✅ NEW: Badge for Team pending items */}
                {item.badge && item.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-red-500 rounded-full blur-sm animate-pulse" />
                    <div className="relative min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                      {item.badge}
                    </div>
                  </motion.div>
                )}
                
                {isActive && !item.badge && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <ChevronRight className="w-4 h-4 text-[var(--coconut-shell)]" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </nav>
      
      {/* User Profile Section */}
      <div className="p-4 border-t border-white/20">
        <motion.button
          onClick={() => handleNavigate('profile')}
          onMouseEnter={playHover}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative w-full text-left px-4 py-3 rounded-xl transition-all group ${
            currentScreen === 'profile'
              ? 'bg-gradient-to-r from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20'
              : 'hover:bg-white/30'
          }`}
        >
          {currentScreen === 'profile' && (
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-shell)]/30 to-[var(--coconut-palm)]/30 rounded-xl blur-lg" />
          )}
          
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] flex items-center justify-center text-white font-semibold shadow-lg">
              <User className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--coconut-shell)]">
                {user?.name || 'Demo User'} {/* ✅ NEW: Use user name */}
              </div>
              <div className="text-xs text-[var(--coconut-husk)]">
                Voir le profil
              </div>
            </div>
          </div>
        </motion.button>
      </div>
    </motion.aside>
  );
}