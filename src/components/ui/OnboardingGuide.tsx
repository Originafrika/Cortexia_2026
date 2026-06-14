/**
 * ONBOARDING GUIDE - Interactive product tour
 * ✅ BDS Compliant: Rhétorique (Guide l'attention avec intention)
 * 
 * Features:
 * - Step-by-step guide
 * - Spotlight effect
 * - Progress indicator
 * - Skip/Next navigation
 * - LocalStorage persistence
 * - Keyboard navigation
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingGuideProps {
  steps: OnboardingStep[];
  tourId: string; // Unique ID for localStorage
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
}

export function OnboardingGuide({
  steps,
  tourId,
  onComplete,
  onSkip,
  autoStart = false
}: OnboardingGuideProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Check if tour was already completed
  useEffect(() => {
    const completed = localStorage.getItem(`onboarding_${tourId}_completed`);
    if (!completed && autoStart) {
      setIsActive(true);
    }
  }, [tourId, autoStart]);

  // Update target position when step changes
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const updateTargetPosition = () => {
      const element = document.querySelector(currentStep.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updateTargetPosition();
    
    // Update on window resize
    window.addEventListener('resize', updateTargetPosition);
    return () => window.removeEventListener('resize', updateTargetPosition);
  }, [isActive, currentStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentStepIndex]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    localStorage.setItem(`onboarding_${tourId}_skipped`, 'true');
    onSkip?.();
  };

  const handleComplete = () => {
    setIsActive(false);
    localStorage.setItem(`onboarding_${tourId}_completed`, 'true');
    onComplete?.();
  };

  const getTooltipPosition = (): React.CSSProperties => {
    if (!targetRect) return {};

    const padding = 16;
    const position = currentStep.position || 'bottom';

    switch (position) {
      case 'top':
        return {
          left: targetRect.left + targetRect.width / 2,
          top: targetRect.top - padding,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          left: targetRect.left + targetRect.width / 2,
          top: targetRect.bottom + padding,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          left: targetRect.left - padding,
          top: targetRect.top + targetRect.height / 2,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return {
          left: targetRect.right + padding,
          top: targetRect.top + targetRect.height / 2,
          transform: 'translate(0, -50%)'
        };
      case 'center':
        return {
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        };
      default:
        return {};
    }
  };

  if (!isActive) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999]"
        style={{ pointerEvents: 'none' }}
      >
        {/* Backdrop with spotlight cutout */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          style={{
            clipPath: targetRect 
              ? `polygon(
                  0 0, 100% 0, 100% 100%, 0 100%, 0 0,
                  ${targetRect.left - 8}px ${targetRect.top - 8}px,
                  ${targetRect.left - 8}px ${targetRect.bottom + 8}px,
                  ${targetRect.right + 8}px ${targetRect.bottom + 8}px,
                  ${targetRect.right + 8}px ${targetRect.top - 8}px,
                  ${targetRect.left - 8}px ${targetRect.top - 8}px
                )`
              : undefined
          }}
        />

        {/* Highlighted element border */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute border-4 border-purple-500 rounded-xl shadow-2xl shadow-purple-500/50"
            style={{
              left: targetRect.left - 8,
              top: targetRect.top - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="absolute w-full max-w-md px-4"
          style={{
            ...getTooltipPosition(),
            pointerEvents: 'auto'
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  {currentStep.icon || <Sparkles className="w-5 h-5 flex-shrink-0" />}
                  <div>
                    <h3 className="font-semibold text-lg">{currentStep.title}</h3>
                    <p className="text-sm text-white/80 mt-1">
                      Étape {currentStepIndex + 1} sur {steps.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSkip}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Fermer le guide"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <p className="text-slate-700 leading-relaxed">
                {currentStep.description}
              </p>

              {/* Action button (optional) */}
              {currentStep.action && (
                <button
                  onClick={currentStep.action.onClick}
                  className="w-full py-2 px-4 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors font-medium text-sm"
                >
                  {currentStep.action.label}
                </button>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200">
                <button
                  onClick={handleSkip}
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Passer le guide
                </button>

                <div className="flex items-center gap-2">
                  {!isFirstStep && (
                    <button
                      onClick={handlePrevious}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      aria-label="Étape précédente"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                  )}

                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all shadow-lg font-medium text-sm"
                  >
                    {isLastStep ? (
                      <>
                        <Check className="w-4 h-4" />
                        Terminer
                      </>
                    ) : (
                      <>
                        Suivant
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

/**
 * Hook to control onboarding programmatically
 */
export function useOnboarding(tourId: string) {
  const [isCompleted, setIsCompleted] = useState(() => {
    return localStorage.getItem(`onboarding_${tourId}_completed`) === 'true';
  });

  const [isSkipped, setIsSkipped] = useState(() => {
    return localStorage.getItem(`onboarding_${tourId}_skipped`) === 'true';
  });

  const reset = () => {
    localStorage.removeItem(`onboarding_${tourId}_completed`);
    localStorage.removeItem(`onboarding_${tourId}_skipped`);
    setIsCompleted(false);
    setIsSkipped(false);
  };

  const shouldShow = !isCompleted && !isSkipped;

  return {
    isCompleted,
    isSkipped,
    shouldShow,
    reset
  };
}
