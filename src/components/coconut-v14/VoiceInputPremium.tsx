/**
 * VOICE INPUT PREMIUM - Coconut V14
 * Saisie vocale avec Web Speech API + Design Coconut Warm
 * 
 * Features:
 * - Real-time transcription
 * - Visual feedback premium
 * - Sound effects
 * - Language switcher (FR/EN)
 * - BDS 7 Arts compliance
 * - Coconut Warm palette
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Languages, Check, AlertCircle } from 'lucide-react';
import { useSoundContext } from './SoundProvider';

interface VoiceInputPremiumProps {
  onTranscript: (text: string) => void;
  className?: string;
  disabled?: boolean;
}

export function VoiceInputPremium({ 
  onTranscript, 
  className = '',
  disabled = false 
}: VoiceInputPremiumProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'fr-FR' | 'en-US'>('fr-FR');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const { playClick, playSuccess } = useSoundContext();

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
    recognitionRef.current.lang = language;

    recognitionRef.current.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptPart + ' ';
        } else {
          interim += transcriptPart;
        }
      }

      if (final) {
        setTranscript(prev => prev + final);
        onTranscript(transcript + final);
        playSuccess();
      }
      
      setInterimTranscript(interim);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      // Don't stop on "no-speech" error
      if (event.error === 'no-speech') {
        return;
      }
      
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        setPermissionError('Microphone access denied. Please allow microphone access.');
      } else if (event.error === 'aborted') {
        return;
      } else {
        setPermissionError(`Error: ${event.error}`);
      }
      
      setTimeout(() => setPermissionError(null), 5000);
    };

    recognitionRef.current.onend = () => {
      // Auto-restart if still listening
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Failed to restart recognition:', error);
          setIsListening(false);
        }
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, language, onTranscript, transcript, playSuccess]);

  const toggleListening = () => {
    if (disabled) return;
    
    playClick();
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimTranscript('');
    } else {
      setTranscript('');
      setInterimTranscript('');
      setPermissionError(null);
      
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start recognition:', error);
        setPermissionError('Failed to start microphone. Please try again.');
      }
    }
  };

  const switchLanguage = (lang: 'fr-FR' | 'en-US') => {
    playClick();
    setLanguage(lang);
    setShowLanguageMenu(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
      
      // Restart if currently listening
      if (isListening) {
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 100);
      }
    }
  };

  // Check if speech recognition is supported
  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  if (!isSupported) {
    return (
      <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <AlertCircle size={14} />
          <span>Voice input not supported in this browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        {/* Main Voice Button */}
        <button
          onClick={toggleListening}
          disabled={disabled}
          className={`
            relative group flex items-center justify-center w-12 h-12 rounded-xl
            transition-all duration-300
            ${disabled 
              ? 'bg-white/5 border border-white/10 cursor-not-allowed opacity-50' 
              : isListening
                ? 'bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] border border-[var(--coconut-shell)]/50 shadow-lg shadow-[var(--coconut-shell)]/30'
                : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--coconut-shell)]/30'
            }
          `}
        >
          {/* Listening pulse animation */}
          {isListening && (
            <>
              <motion.div
                className="absolute inset-0 rounded-xl bg-[var(--coconut-shell)]/30"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-xl bg-[var(--coconut-palm)]/20"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              />
            </>
          )}

          {/* Icon */}
          <motion.div
            animate={isListening ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
          >
            {isListening ? (
              <Mic className="w-5 h-5 text-white relative z-10" />
            ) : (
              <MicOff className="w-5 h-5 text-gray-400 group-hover:text-[var(--coconut-shell)] transition-colors relative z-10" />
            )}
          </motion.div>
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => {
              playClick();
              setShowLanguageMenu(!showLanguageMenu);
            }}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-3 h-12 rounded-xl
              bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--coconut-shell)]/30
              transition-all duration-300
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Languages size={16} className="text-gray-400" />
            <span className="text-sm text-gray-300 font-medium">
              {language === 'fr-FR' ? '🇫🇷 FR' : '🇺🇸 EN'}
            </span>
          </button>

          {/* Language Menu */}
          <AnimatePresence>
            {showLanguageMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-2 w-40 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden z-50"
              >
                <button
                  onClick={() => switchLanguage('fr-FR')}
                  className={`
                    w-full px-4 py-3 flex items-center justify-between
                    hover:bg-white/10 transition-colors
                    ${language === 'fr-FR' ? 'bg-[var(--coconut-shell)]/20' : ''}
                  `}
                >
                  <span className="text-sm text-white">🇫🇷 Français</span>
                  {language === 'fr-FR' && (
                    <Check size={14} className="text-[var(--coconut-shell)]" />
                  )}
                </button>
                
                <button
                  onClick={() => switchLanguage('en-US')}
                  className={`
                    w-full px-4 py-3 flex items-center justify-between
                    hover:bg-white/10 transition-colors
                    ${language === 'en-US' ? 'bg-[var(--coconut-shell)]/20' : ''}
                  `}
                >
                  <span className="text-sm text-white">🇺🇸 English</span>
                  {language === 'en-US' && (
                    <Check size={14} className="text-[var(--coconut-shell)]" />
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Indicator */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-2 px-4 h-12 rounded-xl bg-[var(--coconut-shell)]/10 border border-[var(--coconut-shell)]/30"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[var(--coconut-shell)]"
            />
            <span className="text-sm text-[var(--coconut-shell)] font-medium">
              Listening...
            </span>
          </motion.div>
        )}
      </div>

      {/* Interim Transcript Display */}
      <AnimatePresence>
        {interimTranscript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 rounded-xl bg-[var(--coconut-shell)]/10 border border-[var(--coconut-shell)]/20"
          >
            <p className="text-sm text-gray-300 italic">
              "{interimTranscript}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {permissionError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30"
          >
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{permissionError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
