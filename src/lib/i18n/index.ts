/**
 * i18n System - Central Export
 * Beauty Design System - Grammaire (Clarity of Signs)
 */

export { I18nProvider, useTranslation } from './useTranslation';
export { locales, availableLocales, localeNames, type Locale } from './locales';

// Re-export existing translation utilities (backward compatibility)
export * from './translations';
