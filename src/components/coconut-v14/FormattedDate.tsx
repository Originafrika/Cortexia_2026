/**
 * FORMATTED DATE COMPONENT - P2-14
 * React component wrapper for formatDate utilities
 */

import React from 'react';
import { formatDate, formatRelativeTime, formatTime, Locale, DateFormatStyle } from '../../lib/utils/formatDate';

interface FormattedDateProps {
  date: Date | string | number;
  format?: 'date' | 'relative' | 'time';
  locale?: Locale;
  style?: DateFormatStyle;
  includeTime?: boolean;
  use24Hour?: boolean;
  className?: string;
  title?: string; // Tooltip with full date
}

export function FormattedDate({
  date,
  format = 'date',
  locale = 'fr-FR',
  style = 'medium',
  includeTime = false,
  use24Hour,
  className = '',
  title
}: FormattedDateProps) {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;

  if (isNaN(dateObj.getTime())) {
    return <span className={className}>Invalid date</span>;
  }

  let formatted: string;

  switch (format) {
    case 'relative':
      formatted = formatRelativeTime(dateObj, { locale });
      break;
    case 'time':
      formatted = formatTime(dateObj, { locale, use24Hour });
      break;
    case 'date':
    default:
      formatted = formatDate(dateObj, { locale, style, includeTime });
      break;
  }

  // Default title: full date/time
  const defaultTitle = formatDate(dateObj, { 
    locale, 
    style: 'full', 
    includeTime: true 
  });

  return (
    <time 
      dateTime={dateObj.toISOString()} 
      className={className}
      title={title || defaultTitle}
    >
      {formatted}
    </time>
  );
}

/**
 * Usage examples:
 * 
 * // Basic date
 * <FormattedDate date={project.createdAt} />
 * // → "30 déc. 2024"
 * 
 * // Relative time
 * <FormattedDate date={project.updatedAt} format="relative" />
 * // → "il y a 2 heures"
 * 
 * // Time only
 * <FormattedDate date={new Date()} format="time" />
 * // → "14:30"
 * 
 * // With locale
 * <FormattedDate 
 *   date={project.createdAt} 
 *   locale="en-US" 
 *   style="long"
 * />
 * // → "December 30, 2024"
 * 
 * // With time included
 * <FormattedDate 
 *   date={project.createdAt} 
 *   includeTime={true}
 * />
 * // → "30 déc. 2024 à 14:30"
 */
