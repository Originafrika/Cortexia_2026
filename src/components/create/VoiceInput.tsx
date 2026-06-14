/**
 * VOICE INPUT - Saisie vocale avec Web Speech API
 * Features: Real-time transcription, visual feedback, sound effects
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useSound } from '../../lib/hooks/useSound';
import { useHaptic } from '../../lib/hooks/useHaptic';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceInput({ onTranscript, className = '' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'fr-FR' | 'en-US'>('fr-FR'); // Default to French
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const { playClick, playHover } = useSound();
  const { light, medium } = useHaptic();

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.maxAlternatives = 1;
    recognitionRef.current.lang = language; // Set the language

    recognitionRef.current.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (final) {
        setTranscript(prev => prev + final);
        onTranscript(transcript + final);
        
        // Play confirmation sound
        const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
      
      setInterimTranscript(interim);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      // Don't stop on "no-speech" error - just continue listening
      if (event.error === 'no-speech') {
        console.log('No speech detected, continuing to listen...');
        return; // Keep listening
      }
      
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        setPermissionError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (event.error === 'aborted') {
        // Silently handle aborted error
        return;
      } else {
        setPermissionError(`Speech recognition error: ${event.error}`);
      }
      
      // Clear error after 5 seconds
      setTimeout(() => setPermissionError(null), 5000);
    };

    recognitionRef.current.onend = () => {
      // Auto-restart if still listening (for continuous long recordings)
      if (isListening && recognitionRef.current) {
        console.log('Recognition ended, restarting...');
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log('Could not restart recognition:', e);
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, transcript, language]);

  const toggleListening = async () => {
    if (isListening) {
      // Stop listening
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimTranscript('');
      medium();
      
      // Play stop sound
      const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } else {
      // Request microphone permission first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream immediately, we just needed permission
        stream.getTracks().forEach(track => track.stop());
        
        // Clear any previous errors
        setPermissionError(null);
        
        // Start listening
        recognitionRef.current?.start();
        setIsListening(true);
        setTranscript('');
        setInterimTranscript('');
        light();
        
        // Play start sound
        const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (error) {
        console.error('Microphone permission denied:', error);
        setPermissionError('Microphone access denied. Please allow microphone access and try again.');
        
        // Clear error after 5 seconds
        setTimeout(() => setPermissionError(null), 5000);
      }
    }
    
    playClick();
  };

  // Check if speech recognition is available
  const isAvailable = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  if (!isAvailable) {
    return null; // Don't render if not available
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={toggleListening}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowLanguageMenu(!showLanguageMenu);
            playClick();
          }}
          onMouseEnter={() => playHover()}
          className={`
            relative w-10 h-10 rounded-xl backdrop-blur-xl flex items-center justify-center transition-all border
            ${isListening 
              ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-lg shadow-red-500/30' 
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }
            ${className}
          `}
          title={isListening ? 'Stop recording' : `Start voice input (${language === 'fr-FR' ? 'Français' : 'English'})`}
        >
          {isListening ? (
            <>
              <MicOff size={18} />
              {/* Pulsing animation */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-red-500/30"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </>
          ) : (
            <Mic size={18} />
          )}
          
          {/* Language indicator badge */}
          {!isListening && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <span className="text-[9px] font-bold text-white/70">
                {language === 'fr-FR' ? 'FR' : 'EN'}
              </span>
            </div>
          )}
        </button>

        {/* Language selector menu */}
        <AnimatePresence>
          {showLanguageMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute top-full mt-2 right-0 z-50 w-32 rounded-xl backdrop-blur-3xl border border-white/20 shadow-2xl overflow-hidden"
              style={{ background: 'rgba(0, 0, 0, 0.85)' }}
            >
              <button
                onClick={() => {
                  setLanguage('fr-FR');
                  setShowLanguageMenu(false);
                  playClick();
                  light();
                }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                  language === 'fr-FR' 
                    ? 'bg-[#6366f1]/20 text-white' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                🇫🇷 Français
              </button>
              <button
                onClick={() => {
                  setLanguage('en-US');
                  setShowLanguageMenu(false);
                  playClick();
                  light();
                }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                  language === 'en-US' 
                    ? 'bg-[#6366f1]/20 text-white' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                🇺🇸 English
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interim transcript toast */}
      <AnimatePresence>
        {isListening && (interimTranscript || transcript) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-md px-4"
          >
            <div className="rounded-2xl backdrop-blur-3xl border border-white/20 p-4 shadow-2xl" style={{ background: 'rgba(0, 0, 0, 0.85)' }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Volume2 className="w-4 h-4 text-red-400 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">Listening...</p>
                  <p className="text-sm text-white">
                    {transcript}
                    <span className="text-gray-400">{interimTranscript}</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permission error toast */}
      <AnimatePresence>
        {permissionError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-md px-4"
          >
            <div className="rounded-2xl backdrop-blur-3xl border border-red-500/30 p-4 shadow-2xl" style={{ background: 'rgba(220, 38, 38, 0.15)' }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <MicOff className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-red-400 mb-1">Microphone Error</p>
                  <p className="text-sm text-white">{permissionError}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Click the <span className="text-white">🔒</span> icon in your browser's address bar to allow microphone access.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}