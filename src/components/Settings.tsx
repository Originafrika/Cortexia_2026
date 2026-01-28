import React, { useState } from 'react';
import { ArrowLeft, WalletIcon, Shield, Bell, HelpCircle, FileText, Info, LogOut, ChevronRight, Trash2, AlertTriangle } from 'lucide-react';
import type { Screen } from '../App';
import { signOut } from '../utils/supabase/auth';
import { useTranslation } from '../lib/i18n'; // ✅ i18n hook
import { LanguageSwitcher } from './LanguageSwitcher'; // ✅ Language switcher
import { useAuth } from '../lib/contexts/AuthContext'; // ✅ Auth context
import { projectId, publicAnonKey } from '../utils/supabase/info'; // ✅ Supabase config

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
}

export function Settings({ onNavigate }: SettingsProps) {
  const { t } = useTranslation();
  const { user } = useAuth(); // ✅ Get current user
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // ✅ Delete confirmation modal
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'password' | 'deleting'>('confirm'); // ✅ Multi-step deletion
  const [password, setPassword] = useState(''); // ✅ Password for confirmation
  const [deleteError, setDeleteError] = useState<string | null>(null); // ✅ Error handling
  
  const handleLogout = async () => {
    console.log('🚪 [Settings] Logging out...');
    try {
      await signOut();
      console.log('✅ [Settings] Logout successful, redirecting to login');
      onNavigate('login');
    } catch (error) {
      console.error('❌ [Settings] Logout error:', error);
    }
  };

  // ✅ NEW: Handle account deletion (production-ready, RGPD-compliant)
  const handleDeleteAccount = async () => {
    if (!user?.id) {
      setDeleteError('User not authenticated');
      return;
    }

    setDeleteStep('deleting');
    setDeleteError(null);

    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;
      
      console.log('🗑️ [Settings] Initiating account deletion for user:', user.id);
      
      const response = await fetch(`${apiUrl}/users/${user.id}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password || undefined, // Optional password confirmation
          confirm: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      console.log('✅ [Settings] Account deleted successfully');
      
      // Sign out and redirect
      await signOut();
      onNavigate('landing');
      
    } catch (error: any) {
      console.error('❌ [Settings] Account deletion error:', error);
      setDeleteError(error.message || 'Failed to delete account. Please try again.');
      setDeleteStep('confirm');
    }
  };
  
  const sections = [
    {
      title: t('settings.account').toUpperCase(),
      items: [
        { label: t('navigation.wallet'), icon: WalletIcon, action: () => onNavigate('wallet') },
        { label: t('settings.privacy'), icon: Shield, action: () => {} },
        { label: t('settings.notifications'), icon: Bell, action: () => {} },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        { label: 'Help Center', icon: HelpCircle, action: () => {} },
        { label: 'Report a Problem', icon: FileText, action: () => {} },
      ],
    },
    {
      title: 'ABOUT',
      items: [
        { label: 'Terms of Service', icon: FileText, action: () => {} },
        { label: 'Privacy Policy', icon: Shield, action: () => {} },
        { label: 'About Cortexia', icon: Info, action: () => {} },
      ],
    },
  ];
  
  // ✅ Protection: Ensure sections is valid
  if (!sections || sections.length === 0) {
    console.error('❌ [Settings] No sections defined');
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <p className="text-white/60">Error loading settings</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black z-10 px-4 pt-12 pb-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('profile')}>
              <ArrowLeft className="text-white" size={24} />
            </button>
            <h1 className="text-white text-xl">{t('settings.title')}</h1>
          </div>
          <LanguageSwitcher variant="compact" />
        </div>
      </div>

      {/* Settings Sections */}
      <div className="p-4">
        {/* Language Setting - Highlighted */}
        <div className="mb-6">
          <h2 className="text-white/40 text-xs font-medium mb-3">{t('settings.language').toUpperCase()}</h2>
          <div className="bg-gray-900 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{t('settings.selectLanguage')}</p>
                <p className="text-white/40 text-sm mt-1">{t('settings.languageDescription')}</p>
              </div>
              <LanguageSwitcher variant="default" />
            </div>
          </div>
        </div>

        {sections.map((section, sectionIdx) => {
          // ✅ Protection: Skip invalid sections
          if (!section || !section.items) {
            console.warn(`⚠️ [Settings] Invalid section at index ${sectionIdx}`);
            return null;
          }
          
          return (
            <div key={sectionIdx} className="mb-6">
              <h3 className="text-[#6366f1] text-sm mb-3 px-2">{section.title}</h3>
              <div className="bg-[#1A1A1A] rounded-lg overflow-hidden">
                {section.items.map((item, itemIdx) => {
                  // ✅ Protection: Skip invalid items
                  if (!item || !item.icon) {
                    console.warn(`⚠️ [Settings] Invalid item at ${sectionIdx}.${itemIdx}`);
                    return null;
                  }
                  
                  const Icon = item.icon;
                  return (
                    <button
                      key={itemIdx}
                      onClick={item.action}
                      className={`w-full flex items-center justify-between p-4 hover:bg-[#262626] transition-colors ${
                        itemIdx < section.items.length - 1 ? 'border-b border-gray-800' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="text-[#6366f1]" size={20} />
                        <span className="text-white">{item.label}</span>
                      </div>
                      <ChevronRight className="text-gray-400" size={20} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* App Version */}
        <div className="text-center text-gray-400 text-sm mb-6">
          Version 1.0.0
        </div>

        {/* Logout Button */}
        <button 
          className="w-full py-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors" 
          onClick={handleLogout}
        >
          <LogOut size={20} />
          {t('settings.logout')}
        </button>

        {/* Delete Account Button */}
        <button 
          className="w-full py-4 mt-4 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 flex items-center justify-center gap-2 hover:bg-gray-800 hover:text-red-400 hover:border-red-500/50 transition-colors" 
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 size={20} />
          {t('settings.deleteAccount')}
        </button>
      </div>

      {/* ✅ DELETE CONFIRMATION MODAL (RGPD-compliant) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          
          <div className="relative w-full max-w-md bg-gray-900 rounded-2xl p-6 border border-red-500/20">
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="text-red-500" size={32} />
              </div>
            </div>

            {/* Step 1: Confirmation */}
            {deleteStep === 'confirm' && (
              <>
                <h2 className="text-white text-xl font-bold text-center mb-2">
                  {t('settings.deleteConfirmTitle')}
                </h2>
                <p className="text-white/60 text-center mb-6">
                  {t('settings.deleteConfirmMessage')}
                </p>

                {/* RGPD Warning */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                  <p className="text-red-400 text-sm font-medium mb-2">
                    {t('settings.deleteWarningTitle')}
                  </p>
                  <ul className="text-red-400/80 text-sm space-y-1">
                    <li>• {t('settings.deleteWarning1')}</li>
                    <li>• {t('settings.deleteWarning2')}</li>
                    <li>• {t('settings.deleteWarning3')}</li>
                    <li>• {t('settings.deleteWarning4')}</li>
                  </ul>
                </div>

                {deleteError && (
                  <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-4">
                    <p className="text-red-400 text-sm">{deleteError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteError(null);
                      setPassword('');
                      setDeleteStep('confirm');
                    }}
                    className="flex-1 py-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"
                  >
                    {t('settings.cancel')}
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 py-3 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors font-medium"
                  >
                    {t('settings.deleteConfirm')}
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Deleting */}
            {deleteStep === 'deleting' && (
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white">{t('settings.deletingAccount')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}