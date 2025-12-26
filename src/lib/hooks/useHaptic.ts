/**
 * USE HAPTIC HOOK - BDS Musique (Vibration)
 * Haptic feedback pour mobile (vibrations légères sur interactions)
 * 7 Arts: Musique (rythme haptique), Rhétorique (feedback tactile impactant)
 */

import { useCallback, useRef } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

// BDS: Arithmétique - Haptic patterns (durations in ms)
const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 40,
  success: [10, 50, 10], // Double tap
  warning: [30, 50, 30, 50, 30], // Triple pulse
  error: [50, 100, 50], // Strong double
  selection: 5, // Very light
};

export function useHaptic() {
  const isEnabledRef = useRef(true);

  // BDS: Logique - Check if Vibration API is supported
  const isSupported = useCallback(() => {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }, []);

  // BDS: Musique - Trigger haptic feedback
  const vibrate = useCallback((type: HapticType) => {
    if (!isEnabledRef.current || !isSupported()) return;

    try {
      const pattern = HAPTIC_PATTERNS[type];
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, [isSupported]);

  // BDS: Rhétorique - Convenience methods for common interactions
  const light = useCallback(() => vibrate('light'), [vibrate]);
  const medium = useCallback(() => vibrate('medium'), [vibrate]);
  const heavy = useCallback(() => vibrate('heavy'), [vibrate]);
  const success = useCallback(() => vibrate('success'), [vibrate]);
  const warning = useCallback(() => vibrate('warning'), [vibrate]);
  const error = useCallback(() => vibrate('error'), [vibrate]);
  const selection = useCallback(() => vibrate('selection'), [vibrate]);

  // BDS: Logique - Enable/disable haptic globally
  const toggle = useCallback(() => {
    isEnabledRef.current = !isEnabledRef.current;
    return isEnabledRef.current;
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);

  // BDS: Géométrie - Stop all vibrations
  const stop = useCallback(() => {
    if (isSupported()) {
      navigator.vibrate(0);
    }
  }, [isSupported]);

  return {
    vibrate,
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    stop,
    toggle,
    setEnabled,
    isEnabled: isEnabledRef.current,
    isSupported: isSupported(),
  };
}
