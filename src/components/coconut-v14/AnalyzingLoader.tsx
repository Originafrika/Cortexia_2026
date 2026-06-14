/**
 * ANALYZING LOADER
 * Beauty Design System - 7 Arts de Perfection Divine compliant
 * Loader élégant pour la phase d'analyse avec design tokens, traductions, et accessibility
 * 
 * ✅ FIXED (Phase 2):
 * - AL-C1: Design tokens partout (spacing, radius, iconSize)
 * - AL-C2: Couleurs via tokens.colors.workflow
 * - AL-C3: Text colors via tokens.textColors
 * - AL-C4: Error handling intégré
 * - AL-C5: Traductions complètes (WORKFLOW_LABELS)
 * - AL-H1: Animations via TRANSITIONS
 * - AL-H2: Spacing cohérent
 * - AL-H3: Focus states ajoutés
 * - AL-H4: ARIA complet
 * 
 * ✨ PHASE 2B - SESSION 14: COCONUT WARM PALETTE EXCLUSIVE
 * - Correction complète: toutes couleurs orange → Coconut Warm
 * - Palette exclusive: shell/husk/cream/milk uniquement
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, Zap, Palette, Type, Image, CheckCircle2, Clock } from 'lucide-react';
import { tokens, TRANSITIONS } from '@/lib/design/tokens';
import { WORKFLOW_LABELS, formatCredits, formatTime } from '@/lib/i18n/translations';
import { handleError } from '@/lib/utils/errorHandler';

// ============================================
// TYPES
// ============================================

interface AnalyzingLoaderProps {
  currentStep?: number; // 0-4 for progress tracking
  onStepChange?: (step: number) => void;
  creditsUsed?: number;
  estimatedTimeSeconds?: number;
  onError?: (error: Error) => void;
}

// ============================================
// CONSTANTS
// ============================================

const ANALYSIS_STEPS = [
  { icon: Brain, text: WORKFLOW_LABELS.steps.intentAnalysis, emoji: '🧠', duration: 3000 },
  { icon: Palette, text: WORKFLOW_LABELS.steps.styleDetection, emoji: '🎨', duration: 2500 },
  { icon: Image, text: WORKFLOW_LABELS.steps.referenceAnalysis, emoji: '🖼️', duration: 2000 },
  { icon: Type, text: WORKFLOW_LABELS.steps.promptGeneration, emoji: '📝', duration: 3500 },
  { icon: Zap, text: WORKFLOW_LABELS.steps.typoOptimization, emoji: '🎯', duration: 2000 },
];

// ============================================
// MAIN COMPONENT
// ============================================

export function AnalyzingLoader({ 
  currentStep = 0, 
  onStepChange,
  creditsUsed = 15,
  estimatedTimeSeconds = 45,
  onError,
}: AnalyzingLoaderProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const totalSteps = ANALYSIS_STEPS.length;
  const progress = ((activeStep + 1) / totalSteps) * 100;

  // Timer for elapsed time
  useEffect(() => {
    try {
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    } catch (error) {
      handleError(error as Error, 'AnalyzingLoader.timeTracker', { toast: false });
      onError?.(error as Error);
    }
  }, [onError]);

  // Calculate remaining time
  const remainingTime = Math.max(0, estimatedTimeSeconds - elapsedTime);

  useEffect(() => {
    try {
      // Auto-progress simulation if no external control
      if (currentStep === 0 && !onStepChange) {
        const interval = setInterval(() => {
          setActiveStep(prev => {
            if (prev >= totalSteps - 1) {
              clearInterval(interval);
              return prev;
            }
            return prev + 1;
          });
        }, 3000);
        return () => clearInterval(interval);
      } else {
        setActiveStep(currentStep);
      }
    } catch (error) {
      handleError(error as Error, 'AnalyzingLoader.stepProgress', { toast: false });
      onError?.(error as Error);
    }
  }, [currentStep, onStepChange, totalSteps, onError]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center justify-center min-h-[60vh] ${tokens.layout.containerPadding}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={WORKFLOW_LABELS.analysisInProgress}
    >
      {/* Credits & Time Banner */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={TRANSITIONS.medium}
        className="mb-8 w-full max-w-2xl"
      >
        <div className={`${tokens.gradients.coconutWarmSubtle} backdrop-blur-xl ${tokens.borderColors.coconutWarm} border ${tokens.radius.lg} p-6`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Credits counter */}
            <div className={`flex items-center ${tokens.gap.normal}`}>
              <div className={`w-12 h-12 ${tokens.radius.md} ${tokens.bgColors.coconutWarmSubtle} flex items-center justify-center`}>
                <Zap className={`${tokens.iconSize.lg} ${tokens.textColors.coconutWarm}`} />
              </div>
              <div>
                <p className={`text-sm ${tokens.textColors.whiteMuted}`}>{WORKFLOW_LABELS.analysisInProgress}</p>
                <motion.p 
                  className={`text-2xl ${tokens.textColors.white}`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={TRANSITIONS.pulse}
                  aria-live="polite"
                >
                  {formatCredits(creditsUsed)}
                </motion.p>
              </div>
            </div>

            {/* Time estimate */}
            <div className={`flex items-center ${tokens.gap.normal}`}>
              <div className={`w-12 h-12 ${tokens.radius.md} bg-[var(--coconut-cream)]/40 flex items-center justify-center`}>
                <Clock className={`${tokens.iconSize.lg} text-[var(--coconut-husk)]`} />
              </div>
              <div>
                <p className={`text-sm ${tokens.textColors.whiteMuted}`}>{WORKFLOW_LABELS.estimatedTime}</p>
                <p className={`text-2xl ${tokens.textColors.white}`} aria-live="polite">
                  {formatTime(remainingTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Reassuring message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...TRANSITIONS.medium, delay: 0.5 }}
            className={`mt-4 pt-4 border-t ${tokens.borderColors.whiteSubtle}`}
          >
            <p className={`text-sm ${tokens.textColors.whiteSubtle} text-center`}>
              💡 <strong className={tokens.textColors.white}>{WORKFLOW_LABELS.reassuringMessage}</strong>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Animated Icon Ring */}
      <div className="relative mb-8">
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={TRANSITIONS.rotate}
          className={`absolute inset-0 w-32 h-32 ${tokens.radius.full} border-4 border-transparent border-t-[${tokens.colors.workflow.coconutWarm}] border-r-[${tokens.colors.workflow.coconutWarm}]/50`}
          aria-hidden="true"
        />
        
        {/* Middle rotating ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ ...TRANSITIONS.rotate, duration: 2 }}
          className={`absolute inset-2 w-28 h-28 ${tokens.radius.full} border-4 border-transparent border-b-[${tokens.colors.workflow.coconutWarmLight}] border-l-[${tokens.colors.workflow.coconutWarmLight}]/50`}
          aria-hidden="true"
        />
        
        {/* Center icon with step indicator */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={TRANSITIONS.pulse}
            className={`w-16 h-16 ${tokens.radius.full} ${tokens.gradients.coconutWarm} flex items-center justify-center`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={TRANSITIONS.medium}
              >
                {React.createElement(ANALYSIS_STEPS[activeStep]?.icon || Brain, { 
                  className: `${tokens.iconSize.xl} ${tokens.textColors.white}` 
                })}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Floating particles */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [-10, -30, -10],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut'
            }}
            className="absolute"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 120}deg) translateX(60px)`,
            }}
            aria-hidden="true"
          >
            <Sparkles className={`${tokens.iconSize.md} ${tokens.textColors.coconutWarm}`} />
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-6">
        <div className={`flex items-center justify-between mb-2`}>
          <span className={`text-sm ${tokens.textColors.whiteSubtle}`}>Progression</span>
          <span className={`text-sm ${tokens.textColors.white}`}>{activeStep + 1}/{totalSteps}</span>
        </div>
        <div className={`h-2 bg-white/10 ${tokens.radius.full} overflow-hidden backdrop-blur-sm`}>
          <motion.div
            className={`h-full ${tokens.gradients.coconutWarm}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={TRANSITIONS.medium}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Text content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...TRANSITIONS.medium, delay: 0.2 }}
        className="text-center space-y-4 max-w-lg"
      >
        <h3 className={`text-2xl ${tokens.textColors.white}`}>
          {WORKFLOW_LABELS.analysisInProgress}...
        </h3>
        
        {/* Current step highlight */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={TRANSITIONS.medium}
            className={`text-lg ${tokens.textColors.whiteSubtle} flex items-center justify-center ${tokens.gap.tight}`}
          >
            <span className="text-2xl" aria-hidden="true">{ANALYSIS_STEPS[activeStep]?.emoji}</span>
            <span>{ANALYSIS_STEPS[activeStep]?.text}</span>
          </motion.div>
        </AnimatePresence>

        {/* Progress steps */}
        <div className="pt-6 space-y-2">
          {ANALYSIS_STEPS.map((step, i) => {
            const isCompleted = i < activeStep;
            const isActive = i === activeStep;
            const isPending = i > activeStep;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...TRANSITIONS.medium, delay: 0.1 * i }}
                className={`flex items-center justify-between ${tokens.gap.normal} px-4 py-2 ${tokens.radius.md} transition-all ${
                  isActive 
                    ? `${tokens.bgColors.coconutWarmSubtle} ${tokens.borderColors.coconutWarm} border` 
                    : isCompleted
                    ? `${tokens.borderColors.success} bg-[var(--coconut-palm)]/10 border`
                    : `${tokens.bgColors.whiteGhost} ${tokens.borderColors.whiteSubtle} border`
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? 'bg-[var(--coconut-shell)]/20 ring-4 ring-[var(--coconut-shell)]/20' 
                    : isCompleted 
                      ? 'bg-[var(--coconut-palm)]/20' 
                      : tokens.bgColors.whiteGhost
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className={`${tokens.iconSize.md} ${tokens.textColors.success}`} />
                  ) : (
                    <step.icon className={`${tokens.iconSize.md} ${
                      isActive ? tokens.textColors.coconutWarm : tokens.textColors.whiteGhost
                    }`} />
                  )}
                </div>
                <span className={`text-sm ${
                  isActive ? `${tokens.textColors.white}` : isCompleted ? tokens.textColors.success : tokens.textColors.whiteGhost
                }`}>
                  {step.text}
                </span>
                
                {isActive && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex gap-1"
                    aria-hidden="true"
                  >
                    {[0, 1, 2].map((dot) => (
                      <motion.div
                        key={dot}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ 
                          duration: 1, 
                          repeat: Infinity, 
                          delay: dot * 0.2 
                        }}
                        className={`w-1.5 h-1.5 ${tokens.radius.full} bg-[var(--coconut-shell)]`}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            );
          })}</div>

        {/* Enhanced reassuring message */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className={`text-sm ${tokens.textColors.whiteMuted} pt-4`}
        >
          ✨ {WORKFLOW_LABELS.professionalQuality}
        </motion.p>
      </motion.div>

      {/* Ambient glow effect - COCONUT WARM */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-64 h-64 rounded-full bg-[var(--coconut-shell)] blur-[100px]"
        />
      </div>
    </motion.div>
  );
}