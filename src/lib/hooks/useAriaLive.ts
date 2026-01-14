/**
 * ARIA LIVE REGION HOOK
 * Phase 6 - Accessibilité Complète
 * 
 * Crée une région ARIA live pour les annonces aux lecteurs d'écran.
 * 
 * Usage:
 * const announce = useAriaLive();
 * announce('Génération terminée avec succès!', 'polite');
 */

import { useCallback, useEffect, useRef } from 'react';

type AriaLivePoliteness = 'polite' | 'assertive' | 'off';

export function useAriaLive() {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create live region if it doesn't exist
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only'; // Screen reader only
      liveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    return () => {
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current);
        liveRegionRef.current = null;
      }
    };
  }, []);

  const announce = useCallback((message: string, politeness: AriaLivePoliteness = 'polite') => {
    if (!liveRegionRef.current) return;

    const liveRegion = liveRegionRef.current;
    
    // Update politeness level
    liveRegion.setAttribute('aria-live', politeness);
    
    // Clear previous message
    liveRegion.textContent = '';
    
    // Add new message with slight delay to ensure screen readers catch it
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = message;
      }
    }, 100);
    
    // Clear message after announcement
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = '';
      }
    }, 5000);
  }, []);

  return announce;
}

/**
 * Hook for creating a persistent live region component
 */
export function AriaLiveRegion() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    />
  );
}
