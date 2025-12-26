/**
 * SOUND EFFECTS LIBRARY
 * High-quality audio feedback for user actions
 */

/**
 * Play success sound - Positive, uplifting chime
 */
export function playSuccessSound() {
  // Create AudioContext for better sound generation
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Success: Happy ascending arpeggio (C-E-G major chord)
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
  const startTime = audioContext.currentTime;
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    
    // Envelope: quick attack, short sustain, smooth release
    const noteStart = startTime + (index * 0.08);
    const noteEnd = noteStart + 0.15;
    
    gainNode.gain.setValueAtTime(0, noteStart);
    gainNode.gain.linearRampToValueAtTime(0.15, noteStart + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, noteEnd);
    
    oscillator.start(noteStart);
    oscillator.stop(noteEnd);
  });
  
  // Clean up
  setTimeout(() => {
    audioContext.close();
  }, 500);
}

/**
 * Play error sound - Negative, descending tone
 */
export function playErrorSound() {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Error: Descending dissonant notes
  const frequencies = [440, 370, 320]; // A4, F#4, E4 (minor descending)
  const startTime = audioContext.currentTime;
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'triangle'; // Slightly harsh for error
    
    const noteStart = startTime + (index * 0.1);
    const noteEnd = noteStart + 0.2;
    
    gainNode.gain.setValueAtTime(0, noteStart);
    gainNode.gain.linearRampToValueAtTime(0.12, noteStart + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, noteEnd);
    
    oscillator.start(noteStart);
    oscillator.stop(noteEnd);
  });
  
  setTimeout(() => {
    audioContext.close();
  }, 600);
}

/**
 * Play notification sound - Neutral, attention-getting
 */
export function playNotificationSound() {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  const startTime = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
  
  oscillator.start(startTime);
  oscillator.stop(startTime + 0.15);
  
  setTimeout(() => {
    audioContext.close();
  }, 200);
}
