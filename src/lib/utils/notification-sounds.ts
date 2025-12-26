/**
 * COCONUT V14 - PHASE 4 JOUR 4
 * Notification Sounds System
 * 
 * Audio feedback pour les notifications
 * BDS: Musique (Rythme Visuel & Sonore)
 */

export type NotificationSound = 'success' | 'error' | 'warning' | 'info' | 'pop' | 'woosh';

// ============================================
// AUDIO CONTEXT
// ============================================

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// ============================================
// SOUND GENERATORS (Web Audio API)
// ============================================

/**
 * Génère un son de succès (ding positif)
 */
function playSuccessSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Oscillator principal (note haute)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  
  osc1.frequency.setValueAtTime(800, now);
  osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
  
  gain1.gain.setValueAtTime(0.3, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  
  osc1.start(now);
  osc1.stop(now + 0.3);
  
  // Oscillator secondaire (harmonique)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  
  osc2.frequency.setValueAtTime(1600, now + 0.05);
  gain2.gain.setValueAtTime(0.15, now + 0.05);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
  
  osc2.start(now + 0.05);
  osc2.stop(now + 0.25);
}

/**
 * Génère un son d'erreur (buzz négatif)
 */
function playErrorSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  // Son grave et rapide
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
  osc.type = 'sawtooth';
  
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  
  osc.start(now);
  osc.stop(now + 0.2);
}

/**
 * Génère un son d'avertissement (beep moyen)
 */
function playWarningSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.frequency.setValueAtTime(600, now);
  osc.type = 'sine';
  
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
  
  osc.start(now);
  osc.stop(now + 0.15);
  
  // Second beep
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  
  osc2.frequency.setValueAtTime(600, now + 0.2);
  osc2.type = 'sine';
  
  gain2.gain.setValueAtTime(0.25, now + 0.2);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
  
  osc2.start(now + 0.2);
  osc2.stop(now + 0.35);
}

/**
 * Génère un son d'info (notification douce)
 */
function playInfoSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.frequency.setValueAtTime(500, now);
  osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);
  osc.type = 'sine';
  
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  
  osc.start(now);
  osc.stop(now + 0.2);
}

/**
 * Génère un son pop (click, tap)
 */
function playPopSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
  osc.type = 'sine';
  
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
  
  osc.start(now);
  osc.stop(now + 0.05);
}

/**
 * Génère un son woosh (transition)
 */
function playWooshSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Noise generator (white noise)
  const bufferSize = ctx.sampleRate * 0.3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, now);
  filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  noise.start(now);
  noise.stop(now + 0.3);
}

// ============================================
// MAIN PLAY FUNCTION
// ============================================

const soundGenerators: Record<NotificationSound, () => void> = {
  success: playSuccessSound,
  error: playErrorSound,
  warning: playWarningSound,
  info: playInfoSound,
  pop: playPopSound,
  woosh: playWooshSound,
};

/**
 * Joue un son de notification
 * @param sound - Type de son à jouer
 * @param volume - Volume (0 à 1)
 */
export function playNotificationSound(sound: NotificationSound, volume: number = 1) {
  try {
    // Vérifier si l'utilisateur a autorisé les sons
    const soundEnabled = localStorage.getItem('coconut_sounds_enabled');
    if (soundEnabled === 'false') return;
    
    // Jouer le son
    const generator = soundGenerators[sound];
    if (generator) {
      generator();
    }
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
}

/**
 * Active/désactive les sons
 */
export function setSoundsEnabled(enabled: boolean) {
  localStorage.setItem('coconut_sounds_enabled', enabled ? 'true' : 'false');
}

/**
 * Vérifie si les sons sont activés
 */
export function areSoundsEnabled(): boolean {
  const soundEnabled = localStorage.getItem('coconut_sounds_enabled');
  return soundEnabled !== 'false'; // Par défaut activé
}

// ============================================
// EXPORT CONVENIENCE FUNCTIONS
// ============================================

export const sounds = {
  success: () => playNotificationSound('success'),
  error: () => playNotificationSound('error'),
  warning: () => playNotificationSound('warning'),
  info: () => playNotificationSound('info'),
  pop: () => playNotificationSound('pop'),
  woosh: () => playNotificationSound('woosh'),
};
