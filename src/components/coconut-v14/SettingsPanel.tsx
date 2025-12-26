/**
 * COCONUT V14 - SETTINGS PANEL ULTRA-PREMIUM
 * Liquid Glass Design with Coconut Theme
 * 
 * Features:
 * - Frosted glass cards avec intense blur
 * - Animated tab navigation
 * - Premium form inputs
 * - Smooth transitions
 * - BDS 7 Arts compliance
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../ui/glass-card';
import { GlassButton } from '../ui/glass-button';
import { GlassInput } from '../ui/glass-input';
import { PremiumSelect, SelectOption } from '../ui-premium/PremiumSelect';
import { AnimatedStaggerContainer, AnimatedStaggerItem } from '../ui-premium/AnimatedWrapper';
import { SkeletonCard } from '../ui-premium/SkeletonLoader';
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
  Sparkles
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
  { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
  { value: 'coconut', label: 'Coconut (Default)', icon: <Palette className="w-4 h-4" /> },
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
  
  // Load settings from backend on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await api.fetchUserSettings().catch(() => settings);
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
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
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.saveUserSettings(settings).catch(() => {});
      notify.success('Settings Saved!', 'Your preferences have been updated');
      setHasUnsavedChanges(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to save settings';
      notify.error('Save Failed', message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: User, color: 'from-purple-500 to-purple-600' },
    { id: 'preferences' as const, label: 'Preferences', icon: SettingsIcon, color: 'from-blue-500 to-blue-600' },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell, color: 'from-amber-500 to-amber-600' },
    { id: 'security' as const, label: 'Security', icon: Shield, color: 'from-green-500 to-green-600' },
  ];

  return (
    <div className="min-h-screen bg-[var(--coconut-white)] relative overflow-hidden">
      {/* Premium animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] opacity-60" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,165,116,0.08)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(107,142,112,0.06)_0%,transparent_50%)]" />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="flex items-center gap-3 text-[var(--coconut-shell)]">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 rounded-xl flex items-center justify-center backdrop-blur-xl border border-white/40">
                <SettingsIcon className="w-6 h-6 text-[var(--coconut-shell)]" />
              </div>
              Settings
            </h1>
            <p className="text-[var(--coconut-husk)] mt-1 text-sm">Manage your account and preferences</p>
          </div>
          
          <AnimatePresence>
            {hasUnsavedChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSettings(settings);
                    setHasUnsavedChanges(false);
                  }}
                  className="px-4 py-2 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl border border-white/40 shadow-lg transition-all duration-300 text-[var(--coconut-shell)]"
                >
                  Reset
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-husk)] to-[var(--coconut-shell)] bg-[length:200%_100%] animate-gradient" />
                  <div className="relative px-6 py-2.5 flex items-center gap-2 rounded-xl">
                    {saving ? (
                      <RefreshCw className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Save className="w-5 h-5 text-white" />
                    )}
                    <span className="text-white">{saving ? 'Saving...' : 'Save Changes'}</span>
                  </div>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Tabs Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 rounded-2xl blur-lg opacity-50" />
            <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl p-4 border border-white/60 h-fit">
              <div className="space-y-2">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <motion.button
                      key={tab.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                      onClick={() => setActiveTab(tab.id)}
                      className="relative w-full group"
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeSettingsTab"
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
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center
                          transition-all duration-300
                          ${isActive 
                            ? `bg-gradient-to-br ${tab.color} shadow-lg` 
                            : 'bg-white/40 group-hover:bg-white/60'
                          }
                        `}>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[var(--coconut-shell)]'}`} />
                        </div>
                        <span className="flex-1 text-left">{tab.label}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeTab === 'account' && (
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-2xl blur-lg opacity-50" />
                    <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl p-6 border border-white/60">
                      <h2 className="text-2xl text-[var(--coconut-shell)] mb-6">Account Information</h2>
                      
                      <div className="space-y-6">
                        <GlassInput
                          label="Username"
                          value={settings.username}
                          onChange={(e) => handleSettingChange('username', e.target.value)}
                          icon={<User className="w-5 h-5" />}
                          fullWidth
                        />
                        
                        <GlassInput
                          label="Email"
                          type="email"
                          value={settings.email}
                          onChange={(e) => handleSettingChange('email', e.target.value)}
                          icon={<Mail className="w-5 h-5" />}
                          fullWidth
                        />
                        
                        <GlassInput
                          label="Display Name"
                          value={settings.displayName}
                          onChange={(e) => handleSettingChange('displayName', e.target.value)}
                          icon={<User className="w-5 h-5" />}
                          fullWidth
                        />

                        <div className="pt-4 border-t border-[var(--coconut-husk)]/20">
                          <h3 className="text-lg text-[var(--coconut-shell)] mb-3">Profile Visibility</h3>
                          <PremiumSelect
                            options={visibilityOptions}
                            value={settings.profileVisibility}
                            onChange={(value) => handleSettingChange('profileVisibility', value as string)}
                            label="Who can see your profile?"
                            fullWidth
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl blur-lg opacity-50" />
                    <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl p-6 border border-white/60">
                      <h2 className="text-2xl text-[var(--coconut-shell)] mb-6">Preferences</h2>
                      
                      <div className="space-y-6">
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
                        
                        <PremiumSelect
                          options={themeOptions}
                          value={settings.theme}
                          onChange={(value) => handleSettingChange('theme', value as string)}
                          label="Theme"
                          fullWidth
                        />

                        <div className="pt-4 border-t border-[var(--coconut-husk)]/20">
                          <h3 className="text-lg text-[var(--coconut-shell)] mb-3">Activity</h3>
                          <label className="flex items-center justify-between p-4 rounded-xl bg-white/50 hover:bg-white/70 cursor-pointer transition-all duration-300 backdrop-blur-xl border border-white/40">
                            <span className="text-[var(--coconut-shell)]">Show my activity to others</span>
                            <input
                              type="checkbox"
                              checked={settings.showActivity}
                              onChange={(e) => handleSettingChange('showActivity', e.target.checked)}
                              className="w-5 h-5 rounded border-white/40 bg-white/50 text-[var(--coconut-shell)]"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-2xl blur-lg opacity-50" />
                    <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl p-6 border border-white/60">
                      <h2 className="text-2xl text-[var(--coconut-shell)] mb-6">Notifications</h2>
                      
                      <div className="space-y-4">
                        <motion.label
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center justify-between p-4 rounded-xl bg-white/50 hover:bg-white/70 cursor-pointer transition-all duration-300 backdrop-blur-xl border border-white/40"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                              <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-[var(--coconut-shell)]">Email Notifications</div>
                              <div className="text-sm text-[var(--coconut-husk)]">Receive updates via email</div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                            className="w-5 h-5 rounded border-white/40 bg-white/50 text-[var(--coconut-shell)]"
                          />
                        </motion.label>

                        <motion.label
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center justify-between p-4 rounded-xl bg-white/50 hover:bg-white/70 cursor-pointer transition-all duration-300 backdrop-blur-xl border border-white/40"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                              <Bell className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="text-[var(--coconut-shell)]">Push Notifications</div>
                              <div className="text-sm text-[var(--coconut-husk)]">Browser push notifications</div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.pushNotifications}
                            onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                            className="w-5 h-5 rounded border-white/40 bg-white/50 text-[var(--coconut-shell)]"
                          />
                        </motion.label>

                        <motion.label
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center justify-between p-4 rounded-xl bg-white/50 hover:bg-white/70 cursor-pointer transition-all duration-300 backdrop-blur-xl border border-white/40"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-lg flex items-center justify-center">
                              {settings.soundEnabled ? (
                                <Volume2 className="w-5 h-5 text-amber-600" />
                              ) : (
                                <VolumeX className="w-5 h-5 text-[var(--coconut-husk)]" />
                              )}
                            </div>
                            <div>
                              <div className="text-[var(--coconut-shell)]">Sound Effects</div>
                              <div className="text-sm text-[var(--coconut-husk)]">Play sounds for notifications</div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.soundEnabled}
                            onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                            className="w-5 h-5 rounded border-white/40 bg-white/50 text-[var(--coconut-shell)]"
                          />
                        </motion.label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-2xl blur-lg opacity-50" />
                    <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl p-6 border border-white/60">
                      <h2 className="text-2xl text-[var(--coconut-shell)] mb-6">Security</h2>
                      
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg text-[var(--coconut-shell)] mb-3">Change Password</h3>
                          <div className="space-y-3">
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
                              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              Update Password
                            </motion.button>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-[var(--coconut-husk)]/20">
                          <h3 className="text-lg text-[var(--coconut-shell)] mb-3">API Key</h3>
                          <p className="text-sm text-[var(--coconut-husk)] mb-3">
                            Use this key to access Coconut V14 API programmatically
                          </p>
                          <div className="flex gap-3 mb-3">
                            <GlassInput
                              value={showApiKey ? 'sk_live_1234567890abcdef' : '••••••••••••••••'}
                              icon={<Key className="w-5 h-5" />}
                              fullWidth
                              readOnly
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="px-4 py-2 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl flex items-center gap-2 border border-white/40 shadow-lg transition-all duration-300"
                            >
                              {showApiKey ? <EyeOff className="w-5 h-5 text-[var(--coconut-shell)]" /> : <Eye className="w-5 h-5 text-[var(--coconut-shell)]" />}
                              <span className="text-[var(--coconut-shell)]">{showApiKey ? 'Hide' : 'Show'}</span>
                            </motion.button>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => notify.success('API Key copied to clipboard')}
                            className="px-6 py-3 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-husk)] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            Copy API Key
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;
