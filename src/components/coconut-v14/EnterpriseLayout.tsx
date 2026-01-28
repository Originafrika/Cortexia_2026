/**
 * 🏢 ENTERPRISE LAYOUT
 * Sidebar + Top bar architecture
 * Figma/Notion-inspired professional layout
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, Search, Bell, ChevronDown, 
  LayoutDashboard, Plus, Clock, Zap, Settings, Users, User, Code, Palette, Gift, Grid3x3
} from 'lucide-react';
import { useAuth } from '../../lib/contexts/AuthContext';
import { useCredits } from '../../lib/contexts/CreditsContext';
import { Badge } from '../ui-enterprise/Badge';
import { Button } from '../ui-enterprise/Button';
import { Input } from '../ui-enterprise/Input';
import { CommandPalette } from '../command-palette'; // ✅ NEW: Command Palette
import { NotificationCenter } from '../notifications'; // ✅ NEW: Notification Center

type EnterpriseScreen = 
  | 'dashboard'
  | 'type-select'
  | 'team'
  | 'history'
  | 'credits'
  | 'settings'
  | 'profile'
  | 'developer-dashboard' // ✅ NEW: Developer Dashboard
  | 'creator-system' // ✅ NEW: Creator System
  | 'referral' // ✅ NEW: Referral System
  | 'enhanced-feed'; // ✅ NEW: Enhanced Feed

export interface EnterpriseLayoutProps {
  currentScreen: EnterpriseScreen;
  onNavigate: (screen: EnterpriseScreen) => void;
  children: React.ReactNode;
  breadcrumbs?: { label: string; screen?: EnterpriseScreen }[];
  onBackToFeed?: () => void;
  pendingApprovalsCount?: number;
  showCommandPalette?: boolean;
  onToggleCommandPalette?: () => void;
}

export function EnterpriseLayout({
  currentScreen,
  onNavigate,
  children,
  breadcrumbs = [],
  onBackToFeed,
  pendingApprovalsCount = 0,
  showCommandPalette = false,
  onToggleCommandPalette,
}: EnterpriseLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false); // ✅ NEW
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false); // ✅ NEW
  const { user } = useAuth();
  const { credits, getCoconutCredits } = useCredits();
  
  // Calculate total credits
  const totalCredits = credits.isEnterprise 
    ? (credits.monthlyCreditsRemaining || 0) + (credits.addOnCredits || 0)
    : getCoconutCredits();
  
  // ✅ NEW: Handle Cmd+K shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Navigation items
  const navItems = [
    { 
      id: 'dashboard' as EnterpriseScreen, 
      icon: LayoutDashboard, 
      label: 'Dashboard',
    },
    { 
      id: 'type-select' as EnterpriseScreen, 
      icon: Plus, 
      label: 'New Generation',
      primary: true,
    },
    // Enterprise-only: Team
    ...(credits.isEnterprise ? [{
      id: 'team' as EnterpriseScreen,
      icon: Users,
      label: 'Team',
      badge: pendingApprovalsCount || 0,
    }] : []),
    { 
      id: 'history' as EnterpriseScreen, 
      icon: Clock, 
      label: 'History',
    },
    { 
      id: 'credits' as EnterpriseScreen, 
      icon: Zap, 
      label: 'Credits',
    },
    // ✅ NEW: Developer Dashboard (Developer only)
    ...(user?.type === 'developer' ? [{
      id: 'developer-dashboard' as EnterpriseScreen, 
      icon: Code, 
      label: 'API & Dev Tools',
    }] : []),
    // ✅ NEW: Creator System (For creators)
    ...(user?.isCreator ? [{
      id: 'creator-system' as EnterpriseScreen, 
      icon: Palette, 
      label: 'Creator Tools',
    }] : []),
    // ✅ NEW: Referral System
    ...(user?.type === 'enterprise' ? [{
      id: 'referral-dashboard' as EnterpriseScreen, 
      icon: Gift, 
      label: 'Referral System',
    }] : []),
    // ✅ NEW: Enhanced Feed
    ...(user?.type === 'enterprise' ? [{
      id: 'enhanced-feed' as EnterpriseScreen, 
      icon: Grid3x3, 
      label: 'Enhanced Feed',
    }] : []),
    { 
      id: 'settings' as EnterpriseScreen, 
      icon: Settings, 
      label: 'Settings',
    },
  ];
  
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* ============================================ */}
      {/* SIDEBAR */}
      {/* ============================================ */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -240, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -240, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="w-60 bg-white border-r border-gray-200 flex flex-col shadow-sm"
          >
            {/* Logo Section */}
            <div className="h-16 px-6 flex items-center border-b border-gray-200">
              <div className="flex items-center gap-3">
                {/* Logo */}
                {user?.type === 'enterprise' && user?.companyLogo ? (
                  <img 
                    src={user.companyLogo} 
                    alt="Company Logo" 
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">C</span>
                  </div>
                )}
                
                <div>
                  <h1 className="text-sm font-semibold text-gray-900">Coconut V14</h1>
                  {credits.isEnterprise && (
                    <p className="text-xs text-gray-500">Enterprise</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                const isPrimary = 'primary' in item && item.primary;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-md
                      text-sm font-medium
                      transition-all duration-150 ease-in-out
                      ${isPrimary
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {'badge' in item && item.badge > 0 && (
                      <Badge variant="error">{item.badge}</Badge>
                    )}
                  </button>
                );
              })}
            </nav>
            
            {/* User Profile Section */}
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || user?.email || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{totalCredits} credits</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      
      {/* ============================================ */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ============================================ */}
        {/* TOP BAR */}
        {/* ============================================ */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
          {/* Left: Menu toggle + Breadcrumbs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
            
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <span className="text-gray-400">/</span>}
                    {crumb.screen ? (
                      <button
                        onClick={() => onNavigate(crumb.screen!)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span className="text-gray-900 font-medium">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}
          </div>
          
          {/* Right: Search + Notifications + Profile */}
          <div className="flex items-center gap-3">
            {/* Search - Cmd+K trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Search className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">⌘K</span>
            </button>
            
            {/* Notifications */}
            <button 
              onClick={() => setNotificationCenterOpen(true)}
              className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {pendingApprovalsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            
            {/* Back to Feed button */}
            {onBackToFeed && (
              <Button variant="ghost" size="sm" onClick={onBackToFeed}>
                Exit Coconut
              </Button>
            )}
          </div>
        </header>
        
        {/* ============================================ */}
        {/* CONTENT */}
        {/* ============================================ */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
      
      {/* ============================================ */}
      {/* MODALS & OVERLAYS */}
      {/* ============================================ */}
      
      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(screen) => onNavigate(screen as EnterpriseScreen)}
      />
      
      {/* Notification Center */}
      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />
    </div>
  );
}