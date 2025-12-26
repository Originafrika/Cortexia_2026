/**
 * INTERACTIVE TUTORIAL - Step-by-step guided tour
 * 
 * Features:
 * - Step-by-step guide
 * - UI element highlighting
 * - Interactive tooltips
 * - Progress tracking
 * - Completion rewards
 */

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button, Badge } from '@/components/ui-premium';
import { useAnalytics } from '@/lib/monitoring';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for element to highlight
  placement: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'input';
  waitForAction?: boolean; // Wait for user to perform action
}

export interface InteractiveTutorialProps {
  steps: TutorialStep[];
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function InteractiveTutorial({
  steps,
  isOpen,
  onComplete,
  onSkip,
}: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const { trackEvent } = useAnalytics();

  const step = steps[currentStep];

  // Find target element and calculate position
  useEffect(() => {
    if (!isOpen || !step) return;

    const element = document.querySelector(step.target) as HTMLElement;
    if (!element) {
      console.warn(`Tutorial target not found: ${step.target}`);
      return;
    }

    setTargetElement(element);

    // Calculate tooltip position
    const rect = element.getBoundingClientRect();
    const position = calculateTooltipPosition(rect, step.placement);
    setTooltipPosition(position);

    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Track step view
    trackEvent('tutorial_step_viewed', {
      step_id: step.id,
      step_number: currentStep + 1,
    });

    // Add highlight class to element
    element.classList.add('tutorial-highlight');

    return () => {
      element.classList.remove('tutorial-highlight');
    };
  }, [currentStep, step, isOpen, trackEvent]);

  // Handle next step
  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous step
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle completion
  const handleComplete = () => {
    trackEvent('tutorial_completed', {
      steps_completed: steps.length,
    });
    onComplete();
  };

  // Handle skip
  const handleSkip = () => {
    trackEvent('tutorial_skipped', {
      step_number: currentStep + 1,
      steps_completed: currentStep,
    });
    onSkip();
  };

  if (!isOpen || !step || !targetElement) return null;

  return createPortal(
    <>
      {/* Backdrop overlay with spotlight */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998]"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(2px)',
          }}
        >
          {/* Spotlight cutout */}
          <Spotlight targetElement={targetElement} />
        </motion.div>
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed z-[9999] w-[400px]"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          <div className="bg-gray-900 border-2 border-primary-500 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500/20 to-purple-500/20 p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="primary" size="sm">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
                <button
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-gray-300 mb-4">{step.description}</p>

              {step.action && (
                <div className="bg-primary-500/10 rounded-lg p-3 mb-4 border border-primary-500/20">
                  <p className="text-sm text-primary-400">
                    {step.action === 'click' && '👆 Click the highlighted element'}
                    {step.action === 'hover' && '🖱️ Hover over the highlighted element'}
                    {step.action === 'input' && '⌨️ Type in the highlighted field'}
                  </p>
                </div>
              )}

              {/* Progress */}
              <div className="mb-4">
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`
                        h-1 flex-1 rounded-full transition-all
                        ${index === currentStep ? 'bg-primary-500' : index < currentStep ? 'bg-primary-500/50' : 'bg-gray-800'}
                      `}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                  className="flex-1"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      Complete
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Pointer arrow */}
          <div
            className={`
              absolute w-4 h-4 bg-gray-900 border-2 border-primary-500 rotate-45
              ${getArrowPositionClass(step.placement)}
            `}
          />
        </motion.div>
      </AnimatePresence>
    </>,
    document.body
  );
}

// ============================================
// SPOTLIGHT COMPONENT
// ============================================

function Spotlight({ targetElement }: { targetElement: HTMLElement }) {
  const rect = targetElement.getBoundingClientRect();
  const padding = 8;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: 'hard-light' }}
    >
      <defs>
        <mask id="spotlight-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect
            x={rect.left - padding}
            y={rect.top - padding}
            width={rect.width + padding * 2}
            height={rect.height + padding * 2}
            rx="8"
            fill="black"
          />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="rgba(0, 0, 0, 0.8)"
        mask="url(#spotlight-mask)"
      />
      {/* Highlight border */}
      <rect
        x={rect.left - padding}
        y={rect.top - padding}
        width={rect.width + padding * 2}
        height={rect.height + padding * 2}
        rx="8"
        fill="none"
        stroke="url(#gradient)"
        strokeWidth="2"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function calculateTooltipPosition(
  rect: DOMRect,
  placement: TutorialStep['placement']
): { top: number; left: number } {
  const offset = 20;
  const tooltipWidth = 400;

  switch (placement) {
    case 'top':
      return {
        top: rect.top - 200 - offset,
        left: rect.left + rect.width / 2 - tooltipWidth / 2,
      };
    case 'bottom':
      return {
        top: rect.bottom + offset,
        left: rect.left + rect.width / 2 - tooltipWidth / 2,
      };
    case 'left':
      return {
        top: rect.top + rect.height / 2 - 100,
        left: rect.left - tooltipWidth - offset,
      };
    case 'right':
      return {
        top: rect.top + rect.height / 2 - 100,
        left: rect.right + offset,
      };
  }
}

function getArrowPositionClass(placement: TutorialStep['placement']): string {
  switch (placement) {
    case 'top':
      return 'bottom-[-10px] left-1/2 -translate-x-1/2 border-b-0 border-r-0';
    case 'bottom':
      return 'top-[-10px] left-1/2 -translate-x-1/2 border-t-0 border-l-0';
    case 'left':
      return 'right-[-10px] top-1/2 -translate-y-1/2 border-l-0 border-b-0';
    case 'right':
      return 'left-[-10px] top-1/2 -translate-y-1/2 border-r-0 border-t-0';
  }
}

// ============================================
// DEFAULT TUTORIAL STEPS
// ============================================

export const defaultTutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Cortexia! 👋',
    description: 'Let\'s take a quick tour to help you get started. This will only take a minute.',
    target: 'body',
    placement: 'bottom',
  },
  {
    id: 'create-campaign',
    title: 'Create Your First Campaign',
    description: 'Click here to start a new Coconut campaign. This is where all the magic happens!',
    target: '[data-tutorial="create-campaign"]',
    placement: 'bottom',
    action: 'click',
  },
  {
    id: 'canvas',
    title: 'The Canvas',
    description: 'This is your creative workspace. You\'ll build campaigns visually by connecting nodes.',
    target: '[data-tutorial="canvas"]',
    placement: 'right',
  },
  {
    id: 'add-node',
    title: 'Add Nodes',
    description: 'Click this button to add new nodes to your campaign. Each node generates a specific asset.',
    target: '[data-tutorial="add-node"]',
    placement: 'bottom',
    action: 'click',
  },
  {
    id: 'node-inspector',
    title: 'Configure Nodes',
    description: 'When you select a node, its settings appear here. Customize prompts, styles, and more.',
    target: '[data-tutorial="node-inspector"]',
    placement: 'left',
  },
  {
    id: 'generate',
    title: 'Generate Assets',
    description: 'When you\'re ready, click here to generate all your assets with AI. Your credits will be used.',
    target: '[data-tutorial="generate-button"]',
    placement: 'bottom',
  },
  {
    id: 'complete',
    title: 'You\'re Ready! 🎉',
    description: 'That\'s all you need to know to get started. Now go create something amazing!',
    target: 'body',
    placement: 'bottom',
  },
];

// ============================================
// CSS FOR HIGHLIGHT EFFECT
// ============================================

// Add to global styles or inject:
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .tutorial-highlight {
      position: relative;
      z-index: 9999 !important;
      pointer-events: auto !important;
    }
  `;
  document.head.appendChild(style);
}
