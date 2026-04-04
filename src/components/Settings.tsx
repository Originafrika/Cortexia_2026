import React from 'react';
import { ArrowLeft, WalletIcon, Shield, Bell, HelpCircle, FileText, Info, LogOut, ChevronRight } from 'lucide-react';
import type { Screen } from '../App';
import { signOut } from '../utils/supabase/auth';
import { useTranslation } from '../lib/i18n'; // ✅ NEW: i18n hook
import { LanguageSwitcher } from './LanguageSwitcher'; // ✅ NEW: Language switcher

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
}

export function Settings({ onNavigate }: SettingsProps) {
  const { t } = useTranslation(); // ✅ NEW
  
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
        <button className="w-full py-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 flex items-center justify-center gap-2" onClick={handleLogout}>
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </div>
  );
}