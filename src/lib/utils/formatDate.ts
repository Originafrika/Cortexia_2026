/**
 * DATE FORMATTING UTILITIES - P2-14
 * Localized timestamp formatting
 */

export type DateFormatStyle = 'short' | 'medium' | 'long' | 'full';
export type Locale = 'fr-FR' | 'en-US' | 'en-GB' | 'es-ES' | 'de-DE';

/**
 * Format date with localization
 */
export function formatDate(
  date: Date | string | number,
  options: {
    locale?: Locale;
    style?: DateFormatStyle;
    includeTime?: boolean;
  } = {}
): string {
  const {
    locale = 'fr-FR', // Default to French for Coconut
    style = 'medium',
    includeTime = false
  } = options;

  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    short: { year: 'numeric', month: 'numeric', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  }[style];

  const timeFormatOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit'
  };

  const finalOptions = includeTime 
    ? { ...dateFormatOptions, ...timeFormatOptions }
    : dateFormatOptions;

  return new Intl.DateTimeFormat(locale, finalOptions).format(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago", "il y a 3 jours")
 */
export function formatRelativeTime(
  date: Date | string | number,
  options: {
    locale?: Locale;
  } = {}
): string {
  const { locale = 'fr-FR' } = options;

  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  // Use Intl.RelativeTimeFormat for proper localization
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffSeconds < 60) {
    return rtf.format(-diffSeconds, 'second');
  } else if (diffMinutes < 60) {
    return rtf.format(-diffMinutes, 'minute');
  } else if (diffHours < 24) {
    return rtf.format(-diffHours, 'hour');
  } else if (diffDays < 7) {
    return rtf.format(-diffDays, 'day');
  } else if (diffWeeks < 4) {
    return rtf.format(-diffWeeks, 'week');
  } else if (diffMonths < 12) {
    return rtf.format(-diffMonths, 'month');
  } else {
    return rtf.format(-diffYears, 'year');
  }
}

/**
 * Format time only (e.g., "14:30", "2:30 PM")
 */
export function formatTime(
  date: Date | string | number,
  options: {
    locale?: Locale;
    use24Hour?: boolean;
  } = {}
): string {
  const {
    locale = 'fr-FR',
    use24Hour = locale === 'fr-FR' // French uses 24h by default
  } = options;

  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid time';
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24Hour
  };

  return new Intl.DateTimeFormat(locale, timeOptions).format(dateObj);
}

/**
 * Format date range
 */
export function formatDateRange(
  startDate: Date | string | number,
  endDate: Date | string | number,
  options: {
    locale?: Locale;
    style?: DateFormatStyle;
  } = {}
): string {
  const {
    locale = 'fr-FR',
    style = 'medium'
  } = options;

  const startObj = typeof startDate === 'string' || typeof startDate === 'number' 
    ? new Date(startDate) 
    : startDate;

  const endObj = typeof endDate === 'string' || typeof endDate === 'number' 
    ? new Date(endDate) 
    : endDate;

  if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
    return 'Invalid date range';
  }

  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    short: { month: 'numeric', day: 'numeric' },
    medium: { month: 'short', day: 'numeric' },
    long: { month: 'long', day: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric' }
  }[style];

  const formatter = new Intl.DateTimeFormat(locale, dateFormatOptions);

  // If same year, don't repeat it
  const startFormatted = formatter.format(startObj);
  const endFormatted = formatter.format(endObj);

  if (startObj.getFullYear() === endObj.getFullYear()) {
    return `${startFormatted} - ${endFormatted} ${startObj.getFullYear()}`;
  }

  return `${startFormatted} ${startObj.getFullYear()} - ${endFormatted} ${endObj.getFullYear()}`;
}

/**
 * Get localized day name
 */
export function getDayName(
  date: Date | string | number,
  options: {
    locale?: Locale;
    format?: 'long' | 'short' | 'narrow';
  } = {}
): string {
  const {
    locale = 'fr-FR',
    format = 'long'
  } = options;

  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat(locale, { weekday: format }).format(dateObj);
}

/**
 * Get localized month name
 */
export function getMonthName(
  date: Date | string | number,
  options: {
    locale?: Locale;
    format?: 'long' | 'short' | 'narrow';
  } = {}
): string {
  const {
    locale = 'fr-FR',
    format = 'long'
  } = options;

  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat(locale, { month: format }).format(dateObj);
}

/**
 * Usage examples:
 * 
 * // Basic formatting
 * formatDate(new Date(), { locale: 'fr-FR', style: 'medium' })
 * // → "30 déc. 2024"
 * 
 * formatDate(new Date(), { locale: 'en-US', style: 'long' })
 * // → "December 30, 2024"
 * 
 * // With time
 * formatDate(new Date(), { locale: 'fr-FR', style: 'medium', includeTime: true })
 * // → "30 déc. 2024 à 14:30"
 * 
 * // Relative time
 * formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000), { locale: 'fr-FR' })
 * // → "il y a 2 heures"
 * 
 * formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000), { locale: 'en-US' })
 * // → "2 hours ago"
 * 
 * // Time only
 * formatTime(new Date(), { locale: 'fr-FR' })
 * // → "14:30"
 * 
 * formatTime(new Date(), { locale: 'en-US', use24Hour: false })
 * // → "2:30 PM"
 * 
 * // Date range
 * formatDateRange(new Date('2024-12-01'), new Date('2024-12-31'), { locale: 'fr-FR' })
 * // → "1 déc. - 31 déc. 2024"
 * 
 * // Day/Month names
 * getDayName(new Date(), { locale: 'fr-FR', format: 'long' })
 * // → "lundi"
 * 
 * getMonthName(new Date(), { locale: 'fr-FR', format: 'short' })
 * // → "déc."
 */
