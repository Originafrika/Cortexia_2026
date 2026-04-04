/**
 * Format number with locale support
 * @param num - Number to format
 * @param locale - Locale to use (default: 'en-US')
 */
export function formatNumber(num: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format number to compact form (1K, 1M, etc.)
 * @param num - Number to format
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
