/**
 * Language Switcher Component
 * Beauty Design System - Premium Glass Design
 * 
 * Allows users to switch between EN/FR with smooth animation
 */

import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../lib/i18n/useTranslation';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
}

export function LanguageSwitcher({ variant = 'default', className = '' }: LanguageSwitcherProps) {
  const { locale, setLocale } = useTranslation();

  if (variant === 'minimal') {
    return (
      <button
        onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-[var(--coconut-husk)] hover:text-[var(--coconut-shell)] transition-colors ${className}`}
        aria-label="Change language"
      >
        <Globe size={16} />
        <span>{locale.toUpperCase()}</span>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`relative inline-flex items-center gap-1 p-0.5 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10 ${className}`}>
        {/* Background slider */}
        <motion.div
          className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-md shadow-lg"
          animate={{ x: locale === 'en' ? 1 : 'calc(100% + 2px)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />

        {/* EN Button */}
        <button
          onClick={() => setLocale('en')}
          className={`relative z-10 px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
            locale === 'en' ? 'text-white' : 'text-[var(--coconut-husk)] hover:text-[var(--coconut-shell)]'
          }`}
          aria-label="Switch to English"
        >
          EN
        </button>

        {/* FR Button */}
        <button
          onClick={() => setLocale('fr')}
          className={`relative z-10 px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
            locale === 'fr' ? 'text-white' : 'text-[var(--coconut-husk)] hover:text-[var(--coconut-shell)]'
          }`}
          aria-label="Switch to French"
        >
          FR
        </button>
      </div>
    );
  }

  // Default variant - Premium glass design
  return (
    <div className={`relative inline-flex items-center gap-2 p-1 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-lg ${className}`}>
      {/* Globe icon */}
      <div className="pl-2">
        <Globe size={18} className="text-[var(--coconut-husk)]" />
      </div>

      {/* Background slider */}
      <motion.div
        className="absolute top-1 bottom-1 w-[calc(50%-8px)] bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-lg shadow-xl"
        animate={{ x: locale === 'en' ? 36 : 'calc(100% - 28px)' }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      />

      {/* EN Button */}
      <button
        onClick={() => setLocale('en')}
        className={`relative z-10 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
          locale === 'en' ? 'text-white' : 'text-[var(--coconut-husk)] hover:text-[var(--coconut-shell)]'
        }`}
        aria-label="Switch to English"
      >
        English
      </button>

      {/* FR Button */}
      <button
        onClick={() => setLocale('fr')}
        className={`relative z-10 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
          locale === 'fr' ? 'text-white' : 'text-[var(--coconut-husk)] hover:text-[var(--coconut-shell)]'
        }`}
        aria-label="Switch to French"
      >
        Français
      </button>
    </div>
  );
}
