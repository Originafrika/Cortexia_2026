/**
 * Prompt Utilities - URL-safe prompt cleaning
 * Prevents "net/url: invalid control character in URL" errors
 */

/**
 * Sanitize prompt for URL encoding
 * Removes control characters (newlines, tabs, etc.) that cause URL encoding errors
 * 
 * @param prompt - The raw prompt string
 * @returns Clean prompt safe for URL encoding
 * 
 * @example
 * ```typescript
 * const raw = "Ultra enhance\nwith newlines\tand tabs";
 * const clean = sanitizePromptForURL(raw);
 * // Result: "Ultra enhance with newlines and tabs"
 * ```
 */
export function sanitizePromptForURL(prompt: string): string {
  if (!prompt) return '';
  
  return prompt
    // Remove all control characters (newlines, tabs, carriage returns, etc.)
    .replace(/[\n\r\t\v\f]/g, ' ')
    // Remove any other non-printable ASCII characters (0x00-0x1F)
    .replace(/[\x00-\x1F]/g, '')
    // Collapse multiple consecutive spaces into one
    .replace(/\s+/g, ' ')
    // Trim leading and trailing whitespace
    .trim();
}

/**
 * Validate that a prompt is URL-safe
 * 
 * @param prompt - The prompt to validate
 * @returns Object with isValid flag and optional error message
 */
export function validatePromptForURL(prompt: string): {
  isValid: boolean;
  error?: string;
} {
  if (!prompt || prompt.trim().length === 0) {
    return {
      isValid: false,
      error: 'Prompt is empty'
    };
  }
  
  // Check for control characters
  const hasControlChars = /[\x00-\x1F]/.test(prompt);
  if (hasControlChars) {
    return {
      isValid: false,
      error: 'Prompt contains invalid control characters'
    };
  }
  
  // Check for newlines/tabs (common issues)
  const hasNewlines = /[\n\r\t]/.test(prompt);
  if (hasNewlines) {
    return {
      isValid: false,
      error: 'Prompt contains newlines or tabs'
    };
  }
  
  return { isValid: true };
}

/**
 * Safe encode prompt for URL
 * Combines sanitization + encoding in one step
 * 
 * @param prompt - The raw prompt
 * @returns URL-encoded clean prompt
 */
export function encodePromptForURL(prompt: string): string {
  const sanitized = sanitizePromptForURL(prompt);
  return encodeURIComponent(sanitized);
}

/**
 * Calculate encoded URL length (useful for checking limits)
 * 
 * @param prompt - The prompt to check
 * @returns Object with original length, sanitized length, and encoded length
 */
export function getPromptURLLength(prompt: string): {
  original: number;
  sanitized: number;
  encoded: number;
} {
  const sanitized = sanitizePromptForURL(prompt);
  const encoded = encodeURIComponent(sanitized);
  
  return {
    original: prompt.length,
    sanitized: sanitized.length,
    encoded: encoded.length
  };
}
