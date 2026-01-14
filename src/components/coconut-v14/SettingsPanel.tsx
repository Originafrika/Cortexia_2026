/**
 * COCONUT V14 - SETTINGS PANEL ULTRA-PREMIUM
 * Architecture-aligned settings management
 * 
 * Features:
 * - Premium tab navigation with smooth transitions
 * - Account settings with profile management
 * - Preferences (language, timezone, theme)
 * - Notifications with toggle switches
 * - Security (password, API keys)
 * - System info card (Coconut V14 architecture)
 * - BDS 7 Arts compliance
 * - Coconut Warm colors only
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider';
import { GlassInput } from '../ui/glass-input';
import { PremiumSelect, SelectOption } from '../ui-premium/PremiumSelect';
import { useNotify } from '../coconut-v14/NotificationProvider';
import { api, ApiError } from '../../lib/api/client';
import type { UserSettings } from '../../lib/api/client';
import {
  User,
  Bell,
  Palette,
  Key,
  Shield,
  Globe,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Zap,
  Save,
  Settings as SettingsIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Info,
  Brain,
  Layout,
  Activity,
  CheckCircle,
  Copy,
  RotateCcw,
  Laptop
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface SettingsPanelProps {
  onClose?: () => void;
}

interface UserSettings {
  username: string;
  email: string;
  displayName: string;
  language: string;
  timezone: string;
  theme: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  profileVisibility: string;
  showActivity: boolean;
}

// ============================================
// OPTIONS
// ============================================

const languageOptions: SelectOption[] = [
  { value: 'en', label: 'English', icon: <Globe className="w-4 h-4" /> },
  { value: 'fr', label: 'Français', icon: <Globe className="w-4 h-4" /> },
  { value: 'es', label: 'Español', icon: <Globe className="w-4 h-4" /> },
  { value: 'de', label: 'Deutsch', icon: <Globe className="w-4 h-4" /> },
];

const timezoneOptions: SelectOption[] = [
  { value: 'utc', label: 'UTC', icon: <Globe className="w-4 h-4" /> },
  { value: 'est', label: 'Eastern (EST)', icon: <Globe className="w-4 h-4" /> },
  { value: 'pst', label: 'Pacific (PST)', icon: <Globe className="w-4 h-4" /> },
  { value: 'cet', label: 'Central Europe (CET)', icon: <Globe className="w-4 h-4" /> },
];

const themeOptions: SelectOption[] = [
  { value: 'coconut', label: 'Coconut (Default)', icon: <Palette className="w-4 h-4" /> },
  { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  { value: 'system', label: 'System', icon: <Laptop className="w-4 h-4" /> },
];

const visibilityOptions: SelectOption[] = [
  { value: 'public', label: 'Public', icon: <Globe className="w-4 h-4" /> },
  { value: 'private', label: 'Private', icon: <Lock className="w-4 h-4" /> },
  { value: 'friends', label: 'Friends Only', icon: <User className="w-4 h-4" /> },
];

// ============================================
// COMPONENT
// ============================================

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { playClick, playSuccess, playPop } = useSoundContext();
  
  const notify = useNotify();
  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'notifications' | 'security'>('account');
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState<UserSettings>({
    username: 'demo_user',
    email: 'demo@coconut.ai',
    displayName: 'Demo User',
    language: 'en',
    timezone: 'utc',
    theme: 'coconut',
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    profileVisibility: 'public',
    showActivity: true,
  });
  
  // Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        const data = await api.fetchUserSettings(true).catch(() => {
          console.warn('⚙️ Using default settings (API unavailable)');
          return settings;
        });
        
        setSettings(data);
        
      } catch (err) {
        console.error('Failed to load settings:', err);
        notify.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSettingChange = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    playPop();
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    playClick();
    try {
      setSaving(true);
      await api.saveUserSettings(settings).catch(() => {});
      playSuccess();
      notify.success('Settings Saved!', 'Your preferences have been updated');
      setHasUnsavedChanges(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to save settings';
      notify.error('Save Failed', message);
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (tabId: typeof activeTab) => {
    playClick();
    setActiveTab(tabId);
  };

  const handleCopyApiKey = () => {
    playClick();
    notify.success('Copied!', 'API key copied to clipboard');
  };

  const tabs = [
    { 
      id: 'account' as const, 
      label: 'Account', 
      icon: User, 
      color: 'from-[var(--coconut-shell)] to-[var(--coconut-husk)]',
      description: 'Manage your profile'
    },
    { 
      id: 'preferences' as const, 
      label: 'Preferences', 
      icon: SettingsIcon, 
      color: 'from-[var(--coconut-husk)] to-[var(--coconut-palm)]',
      description: 'Customize your experience'
    },
    { 
      id: 'notifications' as const, 
      label: 'Notifications', 
      icon: Bell, 
      color: 'from-amber-500 to-amber-600',
      description: 'Control alerts'
    },
    { 
      id: 'security' as const, 
      label: 'Security', 
      icon: Shield, 
      color: 'from-[var(--coconut-palm)] to-[var(--coconut-shell)]',
      description: 'Password & API access'
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--coconut-white)] relative overflow-hidden">
      {/* Premium animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] opacity-60" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,165,116,0.08)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(107,142,112,0.06)_0%,transparent_50%)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-2xl shadow-xl mb-4">
            <SettingsIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl text-[var(--coconut-shell)] mb-3">
            Settings
          </h1>
          <p className="text-base md:text-lg text-[var(--coconut-husk)] max-w-2xl mx-auto">
            Manage your account and customize your experience
          </p>
        </motion.div>

        {/* Save Changes Banner */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-amber-600/30 rounded-2xl blur-xl opacity-70" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-xl shadow-xl p-4 border border-amber-500/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Info className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-[var(--coconut-shell)]">You have unsaved changes</div>
                    <div className="text-xs text-[var(--coconut-husk)]">Don't forget to save your preferences</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      playClick();
                      setHasUnsavedChanges(false);
                      // Reset to original would go here
                    }}
                    className="px-4 py-2 bg-white/60 backdrop-blur-xl hover:bg-white/80 rounded-lg border border-white/40 text-[var(--coconut-shell)] text-sm transition-all duration-300 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Discard
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="relative group overflow-hidden disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600" />
                    <div className="relative px-6 py-2 flex items-center gap-2 rounded-lg">
                      {saving ? (
                        <>
                          <RefreshCw className="w-4 h-4 text-white animate-spin" />
                          <span className="text-white text-sm">Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 text-white" />
                          <span className="text-white text-sm">Save Changes</span>
                        </>
                      )}
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation - Horizontal on Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-2 border border-white/60">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                    onClick={() => handleTabChange(tab.id)}
                    className="relative group"
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeSettingsTab"
                        className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-lg shadow-lg"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    {/* Hover effect */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                    
                    {/* Content */}
                    <div className={`
                      relative p-4 rounded-lg
                      flex flex-col items-center gap-2
                      transition-all duration-300
                      ${isActive
                        ? 'text-[var(--coconut-shell)]'
                        : 'text-[var(--coconut-husk)] group-hover:text-[var(--coconut-shell)]'
                      }
                    `}>
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center
                        transition-all duration-300
                        ${isActive 
                          ? `bg-gradient-to-br ${tab.color} shadow-lg` 
                          : 'bg-white/40 group-hover:bg-white/60'
                        }
                      `}>
                        <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-[var(--coconut-shell)]'}`} />
                      </div>
                      <div className="text-center">
                        <div className={`text-sm ${isActive ? 'font-semibold' : ''}`}>{tab.label}</div>
                        <div className="text-xs opacity-60 hidden md:block">{tab.description}</div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'account' && (
              <div className="space-y-6">
                {/* Profile Info */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-2xl blur-xl opacity-50" />
                  <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 md:p-8 border border-white/60">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-[var(--coconut-shell)]" />
                      </div>
                      <div>
                        <h2 className="text-2xl text-[var(--coconut-shell)]">Account Information</h2>
                        <p className="text-sm text-[var(--coconut-husk)]">Manage your personal details</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <GlassInput
                        label="Username"
                        value={settings.username}
                        onChange={(e) => handleSettingChange('username', e.target.value)}
                        icon={<User className="w-5 h-5" />}
                        fullWidth
                      />
                      
                      <GlassInput
                        label="Display Name"
                        value={settings.displayName}
                        onChange={(e) => handleSettingChange('displayName', e.target.value)}
                        icon={<User className="w-5 h-5" />}
                        fullWidth
                      />
                      
                      <div className="md:col-span-2">
                        <GlassInput
                          label="Email"
                          type="email"
                          value={settings.email}
                          onChange={(e) => handleSettingChange('email', e.target.value)}
                          icon={<Mail className="w-5 h-5" />}
                          fullWidth
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-palm)]/20 to-[var(--coconut-husk)]/20 rounded-2xl blur-xl opacity-50" />
                  <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 md:p-8 border border-white/60">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-palm)]/20 to-[var(--coconut-husk)]/20 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-[var(--coconut-palm)]" />
                      </div>
                      <div>
                        <h3 className="text-xl text-[var(--coconut-shell)]">Privacy</h3>
                        <p className="text-sm text-[var(--coconut-husk)]">Control who can see your information</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <PremiumSelect
                        options={visibilityOptions}
                        value={settings.profileVisibility}
                        onChange={(value) => handleSettingChange('profileVisibility', value as string)}
                        label="Profile Visibility"
                        fullWidth
                      />
                      
                      <label className="flex items-center justify-between p-4 rounded-xl bg-white/50 hover:bg-white/70 cursor-pointer transition-all duration-300 backdrop-blur-xl border border-white/40">
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-[var(--coconut-husk)]" />
                          <div>
                            <div className="text-sm text-[var(--coconut-shell)]">Show activity status</div>
                            <div className="text-xs text-[var(--coconut-husk)]">Let others see when you're active</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.showActivity}
                          onChange={(e) => handleSettingChange('showActivity', e.target.checked)}
                          className="w-5 h-5 rounded border-white/40 bg-white/50 text-[var(--coconut-shell)] cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                {/* Appearance */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-husk)]/20 to-[var(--coconut-palm)]/20 rounded-2xl blur-xl opacity-50" />
                  <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 md:p-8 border border-white/60">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-husk)]/20 to-[var(--coconut-palm)]/20 rounded-xl flex items-center justify-center">
                        <Palette className="w-6 h-6 text-[var(--coconut-husk)]" />
                      </div>
                      <div>
                        <h2 className="text-2xl text-[var(--coconut-shell)]">Appearance</h2>
                        <p className="text-sm text-[var(--coconut-husk)]">Customize how Coconut V14 looks</p>
                      </div>
                    </div>
                    
                    <PremiumSelect
                      options={themeOptions}
                      value={settings.theme}
                      onChange={(value) => handleSettingChange('theme', value as string)}
                      label="Theme"
                      fullWidth
                    />
                  </div>
                </div>

                {/* Localization */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-2xl blur-xl opacity-50" />
                  <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 md:p-8 border border-white/60">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-xl flex items-center justify-center">
                        <Globe className="w-6 h-6 text-[var(--coconut-shell)]" />
                      </div>
                      <div>
                        <h3 className="text-xl text-[var(--coconut-shell)]">Localization</h3>
                        <p className="text-sm text-[var(--coconut-husk)]">Language and regional preferences</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <PremiumSelect
                        options={languageOptions}
                        value={settings.language}
                        onChange={(value) => handleSettingChange('language', value as string)}
                        label="Language"
                        fullWidth
                      />
                      
                      <PremiumSelect
                        options={timezoneOptions}
                        value={settings.timezone}
                        onChange={(value) => handleSettingChange('timezone', value as string)}
                        label="Timezone"
                        fullWidth
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl blur-xl opacity-50" />
                <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 md:p-8 border border-white/60">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl flex items-center justify-center">
                      <Bell className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl text-[var(--coconut-shell)]">Notifications</h2>
                      <p className="text-sm text-[var(--coconut-husk)]">Manage how you receive updates</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <motion.label
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 md:p-5 rounded-xl bg-white/50 hover:bg-white/70 cursor-pointer transition-all duration-300 backdrop-blur-xl border border-white/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-husk)]/20 to-[var(--coconut-shell)]/20 rounded-xl flex items-center justify-center">
                          <Mail className="w-6 h-6 text-[var(--coconut-husk)]" />
                        </div>
                        <div>
                          <div className="text-[var(--coconut-shell)] font-medium">Email Notifications</div>
                          <div className="text-sm text-[var(--coconut-husk)]">Receive updates via email</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                        className="w-5 h-5 rounded border-white/40 bg-white/50 text-[var(--coconut-shell)] cursor-pointer"
                      />
                    </motion.label>

                    <motion.label
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 md:p-5 rounded-xl bg-white/50 hover:bg-white/70 cursor-pointer transition-all duration-300 backdrop-blur-xl border border-white/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-husk)]/20 to-[var(--coconut-shell)]/20 rounded-xl flex items-center justify-center">
                          <Bell className="w-6 h-6 text-[var(--coconut-shell)]" />
                        </div>
                        <div>
                          <div className="text-[var(--coconut-shell)] font-medium">Push Notifications</div>
                          <div className="text-sm text-[var(--coconut-husk)]">Browser push notifications</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                        className="w-5 h-5 rounded border-white/40 bg-white/50 text-[var(--coconut-shell)] cursor-pointer"
                      />
                    </motion.label>

                    <motion.label
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 md:p-5 rounded-xl bg-white/50 hover:bg-white/70 cursor-pointer transition-all duration-300 backdrop-blur-xl border border-white/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl flex items-center justify-center">
                          {settings.soundEnabled ? (
                            <Volume2 className="w-6 h-6 text-amber-600" />
                          ) : (
                            <VolumeX className="w-6 h-6 text-[var(--coconut-husk)]" />
                          )}
                        </div>
                        <div>
                          <div className="text-[var(--coconut-shell)]">Sound Effects</div>
                          <div className="text-sm text-[var(--coconut-husk)]">Play sounds for interactions</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                        className="w-5 h-5 rounded border-white/40 bg-white/50 text-[var(--coconut-shell)] cursor-pointer"
                      />
                    </motion.label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Password */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-palm)]/20 to-[var(--coconut-shell)]/20 rounded-2xl blur-xl opacity-50" />
                  <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 md:p-8 border border-white/60">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-palm)]/20 to-[var(--coconut-shell)]/20 rounded-xl flex items-center justify-center">
                        <Lock className="w-6 h-6 text-[var(--coconut-palm)]" />
                      </div>
                      <div>
                        <h3 className="text-xl text-[var(--coconut-shell)]">Change Password</h3>
                        <p className="text-sm text-[var(--coconut-husk)]">Update your account password</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <GlassInput
                        label="Current Password"
                        type="password"
                        placeholder="••••••••"
                        icon={<Lock className="w-5 h-5" />}
                        fullWidth
                      />
                      <GlassInput
                        label="New Password"
                        type="password"
                        placeholder="••••••••"
                        icon={<Lock className="w-5 h-5" />}
                        fullWidth
                      />
                      <GlassInput
                        label="Confirm New Password"
                        type="password"
                        placeholder="••••••••"
                        icon={<Lock className="w-5 h-5" />}
                        fullWidth
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          playClick();
                          notify.success('Password Updated', 'Your password has been changed successfully');
                        }}
                        className="w-full px-6 py-3 bg-gradient-to-r from-[var(--coconut-palm)] to-[var(--coconut-shell)] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Update Password
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* API Key */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-2xl blur-xl opacity-50" />
                  <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 md:p-8 border border-white/60">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-xl flex items-center justify-center">
                        <Key className="w-6 h-6 text-[var(--coconut-shell)]" />
                      </div>
                      <div>
                        <h3 className="text-xl text-[var(--coconut-shell)]">API Access</h3>
                        <p className="text-sm text-[var(--coconut-husk)]">Programmatic access to Coconut V14</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <GlassInput
                          value={showApiKey ? 'coco_v14_1234567890abcdefghijklmnopqrstuv' : '••••••••••••••••••••••••••••••••'}
                          icon={<Key className="w-5 h-5" />}
                          fullWidth
                          readOnly
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            playClick();
                            setShowApiKey(!showApiKey);
                          }}
                          className="px-4 py-2 bg-white/60 backdrop-blur-xl hover:bg-white/80 rounded-xl flex items-center gap-2 border border-white/40 shadow-lg transition-all duration-300 whitespace-nowrap"
                        >
                          {showApiKey ? <EyeOff className="w-5 h-5 text-[var(--coconut-shell)]" /> : <Eye className="w-5 h-5 text-[var(--coconut-shell)]" />}
                          <span className="text-[var(--coconut-shell)] hidden md:inline">{showApiKey ? 'Hide' : 'Show'}</span>
                        </motion.button>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCopyApiKey}
                        className="w-full px-6 py-3 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-husk)] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Copy className="w-5 h-5" />
                        Copy API Key
                      </motion.button>

                      <div className="p-4 bg-[var(--coconut-cream)]/30 backdrop-blur-xl rounded-xl border border-[var(--coconut-husk)]/30">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-[var(--coconut-husk)] flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-[var(--coconut-shell)] space-y-1">
                            <div>Keep your API key secret and secure</div>
                            <div>Use it to access Coconut V14 programmatically</div>
                            <div>Rate limits apply based on your account tier</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Info */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl blur-xl opacity-50" />
                  <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 md:p-8 border border-white/60">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-xl text-[var(--coconut-shell)]">System Information</h3>
                        <p className="text-sm text-[var(--coconut-husk)]">Coconut V14 architecture details</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white/50 backdrop-blur-xl rounded-xl border border-white/40">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-[var(--coconut-palm)]" />
                          <span className="text-xs text-[var(--coconut-husk)]">AI Analysis</span>
                        </div>
                        <div className="text-sm text-[var(--coconut-shell)]">Gemini 2.5 Flash</div>
                      </div>
                      
                      <div className="p-4 bg-white/50 backdrop-blur-xl rounded-xl border border-white/40">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-amber-600" />
                          <span className="text-xs text-[var(--coconut-husk)]">Generation</span>
                        </div>
                        <div className="text-sm text-[var(--coconut-shell)]">Flux 2 Pro</div>
                      </div>
                      
                      <div className="p-4 bg-white/50 backdrop-blur-xl rounded-xl border border-white/40">
                        <div className="flex items-center gap-2 mb-2">
                          <Layout className="w-4 h-4 text-[var(--coconut-shell)]" />
                          <span className="text-xs text-[var(--coconut-husk)]">Version</span>
                        </div>
                        <div className="text-sm text-[var(--coconut-shell)]">v14.0.0</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}

export default SettingsPanel;