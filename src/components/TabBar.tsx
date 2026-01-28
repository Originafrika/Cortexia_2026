import React from 'react';
import { motion } from 'motion/react';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react';
import type { Screen } from '../App';
import { useTranslation } from '../lib/i18n'; // ✅ NEW: i18n hook

interface TabBarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onCreateClick: () => void;
}

export function TabBar({ currentScreen, onNavigate, onCreateClick }: TabBarProps) {
  const { t } = useTranslation(); // ✅ NEW
  
  const tabs = [
    { id: 'feed' as Screen, icon: Home, label: t('navigation.home') },
    { id: 'discovery' as Screen, icon: Search, label: t('navigation.discover') },
    { id: 'messages' as Screen, icon: MessageCircle, label: t('navigation.messages') },
    { id: 'profile' as Screen, icon: User, label: t('navigation.profile') },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-black z-50"
      style={{ 
        borderTopLeftRadius: '16px', 
        borderTopRightRadius: '16px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="flex items-center justify-around h-16 px-4">
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="flex flex-col items-center justify-center flex-1"
              aria-label={tab.label}
            >
              <Icon 
                className={isActive ? 'text-[#6366f1]' : 'text-white'} 
                size={24}
                fill={isActive ? '#6366f1' : 'none'}
                strokeWidth={isActive ? 0 : 2}
              />
            </button>
          );
        })}
        
        <button
          onClick={onCreateClick}
          className="flex items-center justify-center w-12 h-12 bg-[#6366f1] rounded-full -mt-2"
          aria-label="Create"
        >
          <PlusCircle className="text-white" size={28} strokeWidth={2.5} />
        </button>

        {tabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="flex flex-col items-center justify-center flex-1"
              aria-label={tab.label}
            >
              <Icon 
                className={isActive ? 'text-[#6366f1]' : 'text-white'} 
                size={24}
                fill={isActive ? '#6366f1' : 'none'}
                strokeWidth={isActive ? 0 : 2}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}