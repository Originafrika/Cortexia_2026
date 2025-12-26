// Prompt Validator - Ensures prompts meet length requirements
// Prevents truncation and generation failures

export interface PromptValidationResult {
  isValid: boolean;
  length: number;
  status: 'safe' | 'caution' | 'warning' | 'error';
  message: string;
  truncated?: string;
}

// Limits based on pollinations.tsx configuration
const SAFE_LIMIT = 700;      // Recommended safe limit
const WARNING_LIMIT = 1000;  // Approaching danger zone
const MAX_LIMIT = 1500;      // Absolute maximum (from pollinations.tsx)

/**
 * Validate prompt length and provide recommendations
 */
export function validatePrompt(prompt: string): PromptValidationResult {
  const length = prompt.length;
  
  if (length <= SAFE_LIMIT) {
    return {
      isValid: true,
      length,
      status: 'safe',
      message: `✅ Prompt length is safe (${length}/${SAFE_LIMIT} chars)`
    };
  }
  
  if (length <= WARNING_LIMIT) {
    return {
      isValid: true,
      length,
      status: 'caution',
      message: `⚡ Prompt is getting long (${length}/${WARNING_LIMIT} chars). Consider shortening for better results.`
    };
  }
  
  if (length <= MAX_LIMIT) {
    return {
      isValid: true,
      length,
      status: 'warning',
      message: `⚠️  Prompt is very long (${length}/${MAX_LIMIT} chars). High risk of issues. Please shorten.`
    };
  }
  
  // Exceeds maximum - will be truncated
  const truncated = prompt.substring(0, MAX_LIMIT);
  return {
    isValid: false,
    length,
    status: 'error',
    message: `❌ Prompt too long (${length} chars). Exceeds ${MAX_LIMIT} char limit and will be truncated!`,
    truncated
  };
}

/**
 * Get a compact summary of prompt validation
 */
export function getPromptStatus(length: number): {
  emoji: string;
  color: string;
  label: string;
} {
  if (length <= SAFE_LIMIT) {
    return { emoji: '✅', color: 'green', label: 'Safe' };
  }
  if (length <= WARNING_LIMIT) {
    return { emoji: '⚡', color: 'yellow', label: 'Caution' };
  }
  if (length <= MAX_LIMIT) {
    return { emoji: '⚠️', color: 'orange', label: 'Warning' };
  }
  return { emoji: '❌', color: 'red', label: 'Error' };
}

/**
 * Automatically truncate prompt to safe length if needed
 * Preserves sentence structure when possible
 */
export function safeTruncatePrompt(prompt: string, maxLength: number = SAFE_LIMIT): string {
  if (prompt.length <= maxLength) {
    return prompt;
  }
  
  // Try to find a good break point (period, newline, or sentence end)
  const truncated = prompt.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastNewline = truncated.lastIndexOf('\n');
  const lastBreak = Math.max(lastPeriod, lastNewline);
  
  if (lastBreak > maxLength * 0.8) {
    // Use the break point if it's not too far back (within last 20%)
    return prompt.substring(0, lastBreak + 1).trim();
  }
  
  // Otherwise just truncate at max length
  return truncated.trim();
}

/**
 * Calculate estimated URL-encoded length
 * URL encoding can increase length by ~30-50%
 */
export function estimateEncodedLength(prompt: string): number {
  // Approximate: special chars get encoded as %XX (3 chars)
  const specialChars = prompt.match(/[^a-zA-Z0-9]/g)?.length || 0;
  const normalChars = prompt.length - specialChars;
  
  // Each special char becomes 3 chars (%XX), normal chars stay 1
  return normalChars + (specialChars * 3);
}

/**
 * Dev-only: Log prompt validation during development
 */
export function logPromptValidation(
  prompt: string, 
  context: string = 'Unknown'
): void {
  const validation = validatePrompt(prompt);
  const encodedEstimate = estimateEncodedLength(prompt);
  
  console.group(`🔍 Prompt Validation: ${context}`);
  console.log(`Status: ${validation.status.toUpperCase()}`);
  console.log(`Length: ${validation.length} chars`);
  console.log(`Encoded (estimated): ~${encodedEstimate} chars`);
  console.log(`Message: ${validation.message}`);
  
  if (validation.status !== 'safe') {
    console.warn(`⚠️  Consider optimizing this prompt`);
    if (validation.length > MAX_LIMIT) {
      console.error(`❌ CRITICAL: Prompt exceeds maximum length!`);
    }
  }
  
  console.groupEnd();
}

// Export limits for use in other modules
export const PROMPT_LIMITS = {
  SAFE: SAFE_LIMIT,
  WARNING: WARNING_LIMIT,
  MAX: MAX_LIMIT
};
