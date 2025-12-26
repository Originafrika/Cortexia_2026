/**
 * WELCOME FLOW - First-time user onboarding wizard
 * 
 * Features:
 * - Welcome screen with value proposition
 * - Account setup wizard
 * - Preferences selection
 * - Free credits allocation
 * - Skip option
 */

import { useState } from 'react';
import { Modal, Button, Badge } from '@/components/ui-premium';
import { useAnalytics } from '@/lib/monitoring';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, Palette, Video, Image, CheckCircle2, ArrowRight, X } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface WelcomeFlowProps {
  isOpen: boolean;
  onComplete: (preferences: UserPreferences) => void;
  onSkip: () => void;
}

export interface UserPreferences {
  useCase: 'marketing' | 'social' | 'creative' | 'business';
  interests: string[];
  notificationsEnabled: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const STEPS = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'use-case', title: 'Use Case' },
  { id: 'interests', title: 'Interests' },
  { id: 'complete', title: 'Complete' },
];

const USE_CASES = [
  {
    id: 'marketing',
    title: 'Marketing Campaigns',
    description: 'Create professional ad campaigns and promotional materials',
    icon: Sparkles,
  },
  {
    id: 'social',
    title: 'Social Media',
    description: 'Generate engaging social media content and posts',
    icon: Zap,
  },
  {
    id: 'creative',
    title: 'Creative Projects',
    description: 'Bring your creative visions to life with AI',
    icon: Palette,
  },
  {
    id: 'business',
    title: 'Business Content',
    description: 'Professional presentations and business materials',
    icon: Video,
  },
];

const INTERESTS = [
  { id: 'images', label: 'Image Generation', icon: Image },
  { id: 'videos', label: 'Video Production', icon: Video },
  { id: 'campaigns', label: 'Full Campaigns', icon: Sparkles },
  { id: 'social', label: 'Social Content', icon: Zap },
  { id: 'branding', label: 'Brand Design', icon: Palette },
];

// ============================================
// COMPONENT
// ============================================

export function WelcomeFlow({ isOpen, onComplete, onSkip }: WelcomeFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>({
    useCase: 'marketing',
    interests: [],
    notificationsEnabled: true,
  });
  const { trackEvent } = useAnalytics();

  // Handle step completion
  const handleNext = () => {
    const step = STEPS[currentStep];
    trackEvent('onboarding_step_completed', { step: step.id });

    if (currentStep === STEPS.length - 1) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    trackEvent('onboarding_completed', {
      use_case: preferences.useCase,
      interests: preferences.interests,
    });
    onComplete(preferences);
  };

  const handleSkip = () => {
    trackEvent('onboarding_skipped', { step: STEPS[currentStep].id });
    onSkip();
  };

  // Render current step
  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome':
        return <WelcomeStep onNext={handleNext} onSkip={handleSkip} />;
      case 'use-case':
        return (
          <UseCaseStep
            selected={preferences.useCase}
            onSelect={(useCase) => setPreferences({ ...preferences, useCase })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'interests':
        return (
          <InterestsStep
            selected={preferences.interests}
            onToggle={(interest) => {
              const newInterests = preferences.interests.includes(interest)
                ? preferences.interests.filter((i) => i !== interest)
                : [...preferences.interests, interest];
              setPreferences({ ...preferences, interests: newInterests });
            }}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'complete':
        return <CompleteStep onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkip}
      size="lg"
      showCloseButton={false}
      className="max-w-2xl"
    >
      <div className="p-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center"
                style={{ width: `${100 / STEPS.length}%` }}
              >
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${
                      index === currentStep
                        ? 'bg-primary-500 text-white scale-110'
                        : index < currentStep
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'bg-gray-800 text-gray-500'
                    }
                  `}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`
                      flex-1 h-0.5 mx-2
                      transition-colors duration-300
                      ${index < currentStep ? 'bg-primary-500' : 'bg-gray-800'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </Modal>
  );
}

// ============================================
// STEP COMPONENTS
// ============================================

function WelcomeStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="text-center space-y-6">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Welcome to Cortexia</h2>
        <p className="text-lg text-gray-400">
          The most powerful AI creative platform
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-4 py-6">
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center mx-auto">
            <Image className="w-6 h-6 text-primary-400" />
          </div>
          <p className="text-sm text-gray-400">Generate Images</p>
        </div>
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mx-auto">
            <Video className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-sm text-gray-400">Create Videos</p>
        </div>
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 text-pink-400" />
          </div>
          <p className="text-sm text-gray-400">Full Campaigns</p>
        </div>
      </div>

      {/* Free credits badge */}
      <div className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-xl p-4 border border-primary-500/20">
        <Badge variant="premium" size="lg" className="mb-2">
          🎁 Welcome Bonus
        </Badge>
        <p className="text-white font-semibold">100 Free Credits</p>
        <p className="text-sm text-gray-400">Start creating immediately</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" size="lg" onClick={onSkip} className="flex-1">
          Skip for now
        </Button>
        <Button variant="primary" size="lg" onClick={onNext} className="flex-1">
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function UseCaseStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: string;
  onSelect: (useCase: any) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">What will you create?</h2>
        <p className="text-gray-400">Choose your primary use case</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {USE_CASES.map((useCase) => {
          const Icon = useCase.icon;
          const isSelected = selected === useCase.id;

          return (
            <button
              key={useCase.id}
              onClick={() => onSelect(useCase.id)}
              className={`
                p-6 rounded-xl border-2 text-left transition-all
                ${
                  isSelected
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                }
              `}
            >
              <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-primary-400' : 'text-gray-400'}`} />
              <h3 className="text-white font-semibold mb-1">{useCase.title}</h3>
              <p className="text-sm text-gray-400">{useCase.description}</p>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" size="lg" onClick={onNext} className="flex-1">
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function InterestsStep({
  selected,
  onToggle,
  onNext,
  onBack,
}: {
  selected: string[];
  onToggle: (interest: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">What interests you?</h2>
        <p className="text-gray-400">Select all that apply</p>
      </div>

      <div className="space-y-3">
        {INTERESTS.map((interest) => {
          const Icon = interest.icon;
          const isSelected = selected.includes(interest.id);

          return (
            <button
              key={interest.id}
              onClick={() => onToggle(interest.id)}
              className={`
                w-full p-4 rounded-lg border-2 flex items-center gap-4
                transition-all
                ${
                  isSelected
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                }
              `}
            >
              <div
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${isSelected ? 'bg-primary-500/20' : 'bg-gray-800'}
                `}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-400' : 'text-gray-400'}`} />
              </div>
              <span className="text-white font-medium flex-1 text-left">{interest.label}</span>
              {isSelected && <CheckCircle2 className="w-5 h-5 text-primary-400" />}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          disabled={selected.length === 0}
          className="flex-1"
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function CompleteStep({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="text-center space-y-6">
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="flex justify-center"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
      </motion.div>

      {/* Title */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">You&apos;re all set!</h2>
        <p className="text-lg text-gray-400">
          Your account is ready. Let&apos;s create something amazing!
        </p>
      </div>

      {/* Credits info */}
      <div className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-xl p-6 border border-primary-500/20">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Zap className="w-6 h-6 text-primary-400" />
          <span className="text-2xl font-bold text-white">100 Free Credits</span>
        </div>
        <p className="text-gray-400">Available in your account now</p>
      </div>

      {/* Next steps */}
      <div className="text-left bg-gray-900 rounded-xl p-6 space-y-3">
        <p className="text-white font-semibold mb-4">Next steps:</p>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
          <div>
            <p className="text-white">Try the interactive tutorial</p>
            <p className="text-sm text-gray-400">Learn how to create your first campaign</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
          <div>
            <p className="text-white">Explore templates</p>
            <p className="text-sm text-gray-400">Start with pre-built examples</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
          <div>
            <p className="text-white">Create from scratch</p>
            <p className="text-sm text-gray-400">Bring your own ideas to life</p>
          </div>
        </div>
      </div>

      {/* Action */}
      <Button variant="primary" size="lg" onClick={onComplete} className="w-full">
        Start Creating
        <Sparkles className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}
