/**
 * i18n Hook with Context Provider
 * Beauty Design System - Logique (Cognitive Consistency)
 * 
 * Provides translation functionality with auto-detection and persistence
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locales, type Locale } from './locales';

type TranslationKey = string;
type TranslationParams = Record<string, string | number>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number, currency?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'cortexia_locale';

/**
 * Get value from nested object using dot notation
 * Example: "wallet.referral.title" -> locales.en.wallet.referral.title
 */
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  
  return value;
}

/**
 * Replace parameters in translation string
 * Example: "Expires: {date}" with {date: "2024-01-22"} -> "Expires: 2024-01-22"
 */
function interpolate(text: string, params?: TranslationParams): string {
  if (!params) return text;
  
  let result = text;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  });
  
  return result;
}

/**
 * Detect browser language
 */
function detectBrowserLanguage(): Locale {
  const browserLang = navigator.language.toLowerCase();
  
  if (browserLang.startsWith('fr')) {
    return 'fr';
  }
  
  // Default to English
  return 'en';
}

interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

export function I18nProvider({ children, defaultLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize locale on mount
  useEffect(() => {
    // 1. Check if a default locale was provided
    if (defaultLocale) {
      setLocaleState(defaultLocale);
      setIsInitialized(true);
      return;
    }

    // 2. Check localStorage
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && (saved === 'en' || saved === 'fr')) {
      setLocaleState(saved);
      setIsInitialized(true);
      return;
    }

    // 3. Auto-detect from browser
    const detected = detectBrowserLanguage();
    setLocaleState(detected);
    setIsInitialized(true);
  }, [defaultLocale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    
    // TODO: Optionally sync to backend user profile
    // await updateUserProfile({ locale: newLocale });
  };

  const t = (key: TranslationKey, params?: TranslationParams): string => {
    const translation = getNestedValue(locales[locale], key);
    
    if (translation === undefined) {
      console.warn(`[i18n] Translation key not found: "${key}" for locale "${locale}"`);
      return key; // Fallback to key itself
    }
    
    if (typeof translation !== 'string') {
      console.warn(`[i18n] Translation value is not a string: "${key}"`);
      return key;
    }
    
    return interpolate(translation, params);
  };

  const formatDate = (
    date: Date | string,
    options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  ): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US';
    
    return new Intl.DateTimeFormat(localeCode, options).format(d);
  };

  const formatNumber = (num: number): string => {
    const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US';
    return new Intl.NumberFormat(localeCode).format(num);
  };

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US';
    return new Intl.NumberFormat(localeCode, {
      style: 'currency',
      currency,
    }).format(amount);
  };

  // Don't render children until locale is initialized to avoid flash of wrong language
  if (!isInitialized) {
    return null;
  }

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        formatDate,
        formatNumber,
        formatCurrency,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to access i18n context
 */
export function useTranslation() {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  
  return context;
}
