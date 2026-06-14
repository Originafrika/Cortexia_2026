/**
 * COCONUT V14 - LOADING SCREEN
 * Premium loading state with animations
 */

import React from 'react';
import { motion } from 'motion/react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
  progress?: number; // 0-100
}

export function LoadingScreen({ 
  message = 'Chargement...', 
  submessage,
  progress 
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-[var(--coconut-milk)] via-white to-[var(--coconut-water)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8 max-w-md"
      >
        {/* Spinner */}
        <div className="relative inline-flex">
          {/* Outer ring */}
          <motion.div
            className="w-32 h-32 rounded-full border-4 border-[var(--coconut-shell)]/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner ring */}
          <motion.div
            className="absolute inset-0 w-32 h-32 rounded-full border-4 border-transparent border-t-[var(--coconut-shell)]"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-[var(--coconut-shell)]" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <motion.h2
            className="text-2xl text-[var(--coconut-dark)]"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {message}
          </motion.h2>
          
          {submessage && (
            <p className="text-sm text-[var(--coconut-shell)]/60">
              {submessage}
            </p>
          )}
        </div>

        {/* Progress bar (if provided) */}
        {progress !== undefined && (
          <div className="space-y-2">
            <div className="w-full h-2 bg-[var(--coconut-shell)]/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-[var(--coconut-shell)]/40">
              {progress}%
            </p>
          </div>
        )}

        {/* Floating dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[var(--coconut-shell)]"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
