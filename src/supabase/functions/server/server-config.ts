/**
 * SERVER CONFIGURATION
 * Central config for logging and server behavior
 */

// ============================================================================
// LOGGING CONFIGURATION
// ============================================================================

/**
 * Set to 'quiet' to reduce startup logs
 * Set to 'verbose' for full logging
 * Set to 'normal' for balanced logging
 */
export const LOG_LEVEL = Deno.env.get('LOG_LEVEL') || 'quiet'; // ✅ DEFAULT: quiet

export const shouldLog = (level: 'verbose' | 'normal' | 'quiet' | 'error' = 'normal'): boolean => {
  if (LOG_LEVEL === 'verbose') return true;
  if (LOG_LEVEL === 'quiet') return level === 'quiet' || level === 'error'; // Always log errors
  return level !== 'verbose'; // normal mode: log normal, quiet, and error
};

// ============================================================================
// STARTUP MESSAGES
// ============================================================================

export function logStartup(message: string) {
  if (shouldLog('normal')) {
    console.log(message);
  }
}

export function logVerbose(message: string) {
  if (shouldLog('verbose')) {
    console.log(message);
  }
}

export function logQuiet(message: string) {
  // Always log critical messages
  console.log(message);
}

// ============================================================================
// SERVER INFO
// ============================================================================

export const SERVER_INFO = {
  name: 'Coconut V14 Server',
  version: '14.0.0',
  mode: LOG_LEVEL,
};

// ============================================================================
// STARTUP BANNER
// ============================================================================

export function showStartupBanner() {
  if (LOG_LEVEL === 'quiet') {
    // Minimal banner
    console.log('🥥 Coconut V14 Server ready');
  } else {
    // Full banner
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║ 🌟 COCONUT V14 - FLUX PRO OPTIMIZED SERVER READY! 🌟 ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
  }
}