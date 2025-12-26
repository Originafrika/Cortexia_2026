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

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationProvider } from './NotificationProvider';
import { Dashboard } from './Dashboard';
import { SettingsPanel } from './SettingsPanel';
import { CreditsManager } from './CreditsManager';
import { CocoBoardDemo } from './CocoBoardDemo';
import { CocoBoard } from './CocoBoard';
import { HistoryManager } from './HistoryManager';
import { UserProfileCoconut } from './UserProfileCoconut';
import { GlassButton } from '../ui/glass-button';
import { ErrorBoundary } from '../ui-premium/ErrorBoundary';
import { useCredits } from '../../lib/contexts/CreditsContext';
import {
  LayoutDashboard,
  Sparkles,
  Settings,
  Zap,
  Menu,
  X,
  ChevronRight,
  Clock,
  User
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

type Screen = 'dashboard' | 'cocoboard' | 'credits' | 'settings' | 'history' | 'profile';

// ============================================
// PREMIUM SIDEBAR NAVIGATION
// ============================================

const Navigation = ({ 
  currentScreen, 
  onNavigate,
  onToggleSidebar 
}: { 
  currentScreen: Screen; 
  onNavigate: (screen: Screen) => void;
  onToggleSidebar: () => void;
}) => {
  const { credits } = useCredits();
  const totalCredits = credits.free + credits.paid;
  
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, color: 'from-purple-500 to-purple-600' },
    { id: 'cocoboard' as const, label: 'CocoBoard', icon: Sparkles, color: 'from-[var(--coconut-shell)] to-[var(--coconut-husk)]' },
    { id: 'credits' as const, label: 'Credits', icon: Zap, color: 'from-amber-500 to-amber-600' },
    { id: 'settings' as const, label: 'Settings', icon: Settings, color: 'from-blue-500 to-blue-600' },
    { id: 'history' as const, label: 'History', icon: Clock, color: 'from-gray-500 to-gray-600' },
    { id: 'profile' as const, label: 'Profile', icon: User, color: 'from-green-500 to-green-600' },
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
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-xl blur-md opacity-50" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div>
              <h2 className="text-[var(--coconut-shell)]">Coconut V14</h2>
              <p className="text-xs text-[var(--coconut-husk)]">Creation Hub</p>
            </div>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            onClick={onToggleSidebar}
            className="lg:hidden w-8 h-8 rounded-lg bg-white/50 backdrop-blur-xl hover:bg-white/70 flex items-center justify-center border border-white/40 shadow-lg transition-all duration-300"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-[var(--coconut-shell)]" />
          </motion.button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                onClick={() => {
                  onNavigate(item.id);
                  onToggleSidebar();
                }}
                className="relative w-full group"
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/60 backdrop-blur-xl rounded-xl border border-white/60 shadow-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                {/* Hover effect */}
                {!isActive && (
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
                
                {/* Content */}
                <div className={`
                  relative px-4 py-3 rounded-xl
                  flex items-center gap-3
                  transition-all duration-300
                  ${isActive
                    ? 'text-[var(--coconut-shell)]'
                    : 'text-[var(--coconut-husk)] group-hover:text-[var(--coconut-shell)]'
                  }
                `}>
                  {/* Icon with gradient background */}
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    transition-all duration-300
                    ${isActive 
                      ? `bg-gradient-to-br ${item.color} shadow-lg` 
                      : 'bg-white/40 group-hover:bg-white/60'
                    }
                  `}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[var(--coconut-shell)]'}`} />
                  </div>
                  
                  <span className="flex-1 text-left">{item.label}</span>
                  
                  {/* Arrow indicator */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </nav>

        {/* Credits Quick View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative mt-6"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl blur-lg opacity-50" />
          
          {/* Card */}
          <div className="relative bg-white/50 backdrop-blur-xl rounded-xl p-4 border border-white/40 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[var(--coconut-husk)]">Available Credits</span>
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-2 mb-4">
              <p className="text-3xl text-[var(--coconut-shell)]">{totalCredits}</p>
              <span className="text-sm text-[var(--coconut-husk)]">credits</span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onNavigate('credits');
                onToggleSidebar();
              }}
              className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">Buy More Credits</span>
            </motion.button>
          </div>
        </motion.div>
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 pt-6 border-t border-white/30"
        >
          <p className="text-xs text-[var(--coconut-husk)] text-center">
            Coconut V14 · Premium Edition
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN APP
// ============================================

export function CoconutV14App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <NotificationProvider position="top-right">
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
          <Navigation
            currentScreen={currentScreen}
            onNavigate={setCurrentScreen}
            onToggleSidebar={() => {}}
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
                <Navigation
                  currentScreen={currentScreen}
                  onNavigate={setCurrentScreen}
                  onToggleSidebar={() => setSidebarOpen(false)}
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
                <Dashboard
                  onNavigateToCreate={() => setCurrentScreen('cocoboard')}
                  onNavigateToCredits={() => setCurrentScreen('credits')}
                />
              )}
              
              {currentScreen === 'cocoboard' && (
                <ErrorBoundary>
                  <CocoBoard 
                    projectId="demo-project" 
                    userId="demo-user"
                  />
                </ErrorBoundary>
              )}
              
              {currentScreen === 'credits' && (
                <CreditsManager />
              )}
              
              {currentScreen === 'settings' && (
                <SettingsPanel />
              )}
              
              {currentScreen === 'history' && (
                <HistoryManager userId="demo-user" />
              )}
              
              {currentScreen === 'profile' && (
                <UserProfileCoconut 
                  username="demo-user"
                  onClose={() => setCurrentScreen('dashboard')}
                  allPosts={[]}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </NotificationProvider>
  );
}

export default CoconutV14App;