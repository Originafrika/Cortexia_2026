/**
 * Locale loader for i18n system
 * Beauty Design System - Grammaire (Clarity of Signs)
 */

import en from './en';
import fr from './fr';

export type Locale = 'en' | 'fr';

export const locales = {
  en,
  fr,
} as const;

export const availableLocales: Locale[] = ['en', 'fr'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
};

export default locales;