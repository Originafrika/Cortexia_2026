/**
 * Environment Detection & Configuration
 * Détecte si l'application tourne dans Figma Make ou en production
 */

// Détecte si nous sommes dans l'environnement Figma Make
export const IS_FIGMA_MAKE = typeof window !== 'undefined' && 
  (window.location.hostname.includes('figma') || 
   window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1' ||
   // Figma Make détecté via le domaine lov.io
   window.location.hostname.includes('lov.io'));

// Détecte si l'API backend est disponible
export const HAS_BACKEND_API = !IS_FIGMA_MAKE;

// Configuration API
export const API_CONFIG = {
  useMockData: IS_FIGMA_MAKE, // ✅ Utilise les données mock dans Figma Make
  enableLogging: true,
  timeoutMs: 5000,
};

export function logEnvironment() {
  if (API_CONFIG.enableLogging) {
    console.log('🌍 Environment Detection:');
    console.log('  - Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');
    console.log('  - IS_FIGMA_MAKE:', IS_FIGMA_MAKE);
    console.log('  - HAS_BACKEND_API:', HAS_BACKEND_API);
    console.log('  - Use Mock Data:', API_CONFIG.useMockData);
  }
}