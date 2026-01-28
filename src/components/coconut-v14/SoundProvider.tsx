/**
 * SOUND PROVIDER - BDS MUSIQUE (Art 6)
 * Context provider for global sound management
 * Enables/disables sounds globally + provides useSound hook
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useSound } from '../../lib/hooks/useSound';

interface SoundContextValue {
  isEnabled: boolean;
  toggleSound: () => void;
  setEnabled: (enabled: boolean) => void;
  playClick: () => void;
  playHover: () => void;
  playSuccess: () => void;
  playError: () => void;
  playWhoosh: () => void;
  playPop: () => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const sound = useSound();

  const toggleSound = useCallback(() => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    sound.setEnabled(newState);
    return newState;
  }, [soundEnabled, sound]);

  const setEnabled = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    sound.setEnabled(enabled);
  }, [sound]);

  // Wrapped sound methods that check enabled state
  const playClick = useCallback(() => {
    if (soundEnabled) sound.playClick();
  }, [soundEnabled, sound]);

  const playHover = useCallback(() => {
    if (soundEnabled) sound.playHover();
  }, [soundEnabled, sound]);

  const playSuccess = useCallback(() => {
    if (soundEnabled) sound.playSuccess();
  }, [soundEnabled, sound]);

  const playError = useCallback(() => {
    if (soundEnabled) sound.playError();
  }, [soundEnabled, sound]);

  const playWhoosh = useCallback(() => {
    if (soundEnabled) sound.playWhoosh();
  }, [soundEnabled, sound]);

  const playPop = useCallback(() => {
    if (soundEnabled) sound.playPop();
  }, [soundEnabled, sound]);

  const value: SoundContextValue = {
    isEnabled: soundEnabled,
    toggleSound,
    setEnabled,
    playClick,
    playHover,
    playSuccess,
    playError,
    playWhoosh,
    playPop,
  };

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSoundContext() {
  const context = useContext(SoundContext);
  if (!context) {
    // ✅ FIX: Return no-op functions instead of throwing
    // This allows components to work without SoundProvider (Enterprise mode)
    console.warn('useSoundContext used outside SoundProvider - sounds will be disabled');
    return {
      isEnabled: false,
      toggleSound: () => false,
      setEnabled: () => {},
      playClick: () => {},
      playHover: () => {},
      playSuccess: () => {},
      playError: () => {},
      playWhoosh: () => {},
      playPop: () => {},
    };
  }
  return context;
}