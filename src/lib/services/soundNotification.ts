/**
 * 🔊 Sound Notification Service
 * Plays notification sounds when generation is complete
 * Using Web Audio API for cross-browser compatibility
 */

export class SoundNotificationService {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Initialize on first user interaction (browser requirement)
    if (typeof window !== 'undefined') {
      this.initAudioContext();
    }
  }

  private initAudioContext() {
    try {
      // @ts-ignore - AudioContext or webkitAudioContext
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('🔇 Web Audio API not supported, notifications disabled');
      this.isEnabled = false;
    }
  }

  /**
   * Play a success notification sound
   * Pleasant, non-intrusive tone to indicate completion
   */
  async playSuccessSound() {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      // Resume audio context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const now = this.audioContext.currentTime;

      // Create oscillator for pleasant notification tone
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Two-tone pleasant notification (like iOS/macOS)
      // First tone: 800Hz
      oscillator.frequency.setValueAtTime(800, now);
      // Second tone: 1000Hz (perfect fifth interval)
      oscillator.frequency.setValueAtTime(1000, now + 0.1);

      // Envelope: quick attack, gentle release
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Attack
      gainNode.gain.setValueAtTime(0.3, now + 0.1); // Sustain first tone
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.15); // Transition
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4); // Release

      // Sine wave for smooth, pleasant sound
      oscillator.type = 'sine';

      // Play
      oscillator.start(now);
      oscillator.stop(now + 0.4);

      console.log('🔔 Success notification played');
    } catch (error) {
      console.warn('🔇 Could not play notification sound:', error);
    }
  }

  /**
   * Play an error notification sound
   * Subtle, lower tone to indicate failure
   */
  async playErrorSound() {
    if (!this.isEnabled || !this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const now = this.audioContext.currentTime;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Single lower tone for error
      oscillator.frequency.setValueAtTime(400, now);

      // Quick envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      oscillator.type = 'sine';

      oscillator.start(now);
      oscillator.stop(now + 0.25);

      console.log('🔕 Error notification played');
    } catch (error) {
      console.warn('🔇 Could not play notification sound:', error);
    }
  }

  /**
   * Enable or disable sound notifications
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    console.log(`🔊 Sound notifications ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if notifications are enabled
   */
  isNotificationEnabled(): boolean {
    return this.isEnabled;
  }
}

// Singleton instance
export const soundNotification = new SoundNotificationService();
