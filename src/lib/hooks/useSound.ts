/**
 * USE SOUND HOOK - BDS Musique (Son)
 * Micro-sounds pour interactions (click, hover, success, error)
 * 7 Arts: Musique (rythme sonore), Rhétorique (feedback impactant)
 */

import { useCallback, useRef, useEffect } from 'react';

type SoundType = 'click' | 'hover' | 'success' | 'error' | 'whoosh' | 'pop';

interface SoundConfig {
  volume?: number; // 0 to 1
  playbackRate?: number; // 0.5 to 2
}

// BDS: Arithmétique - Sound frequencies and durations (harmonious ratios)
const SOUND_PRESETS: Record<SoundType, { frequency: number; duration: number; type: OscillatorType }> = {
  click: { frequency: 800, duration: 50, type: 'sine' },
  hover: { frequency: 600, duration: 30, type: 'sine' },
  success: { frequency: 1000, duration: 150, type: 'square' },
  error: { frequency: 300, duration: 200, type: 'sawtooth' },
  whoosh: { frequency: 400, duration: 100, type: 'sine' },
  pop: { frequency: 1200, duration: 80, type: 'triangle' },
};

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isEnabledRef = useRef(true);

  // BDS: Logique - Initialize AudioContext on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      audioContextRef.current = new AudioContext();
    }

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // BDS: Musique - Play synthesized sound
  const play = useCallback((type: SoundType, config: SoundConfig = {}) => {
    if (!isEnabledRef.current || !audioContextRef.current) return;

    const { volume = 0.3, playbackRate = 1 } = config;
    const preset = SOUND_PRESETS[type];

    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = preset.type;
      oscillator.frequency.value = preset.frequency * playbackRate;

      // BDS: Arithmétique - Smooth envelope (ADSR-like)
      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01); // Attack
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + preset.duration / 1000); // Decay

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(now);
      oscillator.stop(now + preset.duration / 1000);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }, []);

  // BDS: Rhétorique - Convenience methods for common interactions
  const playClick = useCallback(() => play('click', { volume: 0.2 }), [play]);
  const playHover = useCallback(() => play('hover', { volume: 0.1 }), [play]);
  const playSuccess = useCallback(() => play('success', { volume: 0.25 }), [play]);
  const playError = useCallback(() => play('error', { volume: 0.3 }), [play]);
  const playWhoosh = useCallback(() => play('whoosh', { volume: 0.15 }), [play]);
  const playPop = useCallback(() => play('pop', { volume: 0.2 }), [play]);

  // BDS: Logique - Enable/disable sound globally
  const toggle = useCallback(() => {
    isEnabledRef.current = !isEnabledRef.current;
    return isEnabledRef.current;
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);

  return {
    play,
    playClick,
    playHover,
    playSuccess,
    playError,
    playWhoosh,
    playPop,
    toggle,
    setEnabled,
    isEnabled: isEnabledRef.current,
  };
}
