/**
 * ONBOARDING - Central export for all onboarding components
 * 
 * Usage:
 * import { WelcomeFlow, InteractiveTutorial, HelpCenter } from '@/components/onboarding';
 */

export { WelcomeFlow } from './WelcomeFlow';
export type { WelcomeFlowProps, UserPreferences } from './WelcomeFlow';

export { InteractiveTutorial, defaultTutorialSteps } from './InteractiveTutorial';
export type { TutorialStep, InteractiveTutorialProps } from './InteractiveTutorial';

export {
  ContextualTooltip,
  HelpTooltip,
  FirstTimeHint,
  KeyboardShortcutTooltip,
  resetAllTooltips,
} from './ContextualTooltip';
export type { ContextualTooltipProps } from './ContextualTooltip';

export { HelpCenter } from './HelpCenter';
export type { HelpCenterProps } from './HelpCenter';

// ============================================
// ONBOARDING MANAGER
// ============================================

/**
 * OnboardingManager - Coordinate all onboarding flows
 * 
 * This manager helps coordinate multiple onboarding components
 * and track user progress through the onboarding journey.
 */

export class OnboardingManager {
  private static STORAGE_KEY = 'cortexia_onboarding_state';

  static getState(): OnboardingState {
    if (typeof localStorage === 'undefined') {
      return this.getDefaultState();
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultState();
    } catch {
      return this.getDefaultState();
    }
  }

  static setState(state: Partial<OnboardingState>): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const current = this.getState();
      const updated = { ...current, ...state };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save onboarding state:', e);
    }
  }

  static completeWelcome(): void {
    this.setState({ welcomeCompleted: true, welcomeCompletedAt: Date.now() });
  }

  static completeTutorial(): void {
    this.setState({ tutorialCompleted: true, tutorialCompletedAt: Date.now() });
  }

  static skipWelcome(): void {
    this.setState({ welcomeSkipped: true });
  }

  static skipTutorial(): void {
    this.setState({ tutorialSkipped: true });
  }

  static shouldShowWelcome(): boolean {
    const state = this.getState();
    return !state.welcomeCompleted && !state.welcomeSkipped;
  }

  static shouldShowTutorial(): boolean {
    const state = this.getState();
    return state.welcomeCompleted && !state.tutorialCompleted && !state.tutorialSkipped;
  }

  static reset(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private static getDefaultState(): OnboardingState {
    return {
      welcomeCompleted: false,
      tutorialCompleted: false,
      welcomeSkipped: false,
      tutorialSkipped: false,
      welcomeCompletedAt: null,
      tutorialCompletedAt: null,
    };
  }
}

export interface OnboardingState {
  welcomeCompleted: boolean;
  tutorialCompleted: boolean;
  welcomeSkipped: boolean;
  tutorialSkipped: boolean;
  welcomeCompletedAt: number | null;
  tutorialCompletedAt: number | null;
}

// ============================================
// REACT HOOK
// ============================================

import { useState, useEffect } from 'react';

/**
 * Hook for managing onboarding state in React components
 */
export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(OnboardingManager.getState());

  useEffect(() => {
    // Listen for storage changes (if onboarding state is updated in another tab)
    const handleStorageChange = () => {
      setState(OnboardingManager.getState());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    state,
    shouldShowWelcome: OnboardingManager.shouldShowWelcome(),
    shouldShowTutorial: OnboardingManager.shouldShowTutorial(),
    completeWelcome: () => {
      OnboardingManager.completeWelcome();
      setState(OnboardingManager.getState());
    },
    completeTutorial: () => {
      OnboardingManager.completeTutorial();
      setState(OnboardingManager.getState());
    },
    skipWelcome: () => {
      OnboardingManager.skipWelcome();
      setState(OnboardingManager.getState());
    },
    skipTutorial: () => {
      OnboardingManager.skipTutorial();
      setState(OnboardingManager.getState());
    },
    reset: () => {
      OnboardingManager.reset();
      setState(OnboardingManager.getState());
    },
  };
}

// ============================================
// USAGE EXAMPLE
// ============================================

/**
 * Example usage in App component:
 * 
 * import { WelcomeFlow, InteractiveTutorial, useOnboarding } from '@/components/onboarding';
 * 
 * function App() {
 *   const onboarding = useOnboarding();
 * 
 *   return (
 *     <>
 *       <YourApp />
 * 
 *       <WelcomeFlow
 *         isOpen={onboarding.shouldShowWelcome}
 *         onComplete={(preferences) => {
 *           // Save user preferences
 *           savePreferences(preferences);
 *           onboarding.completeWelcome();
 *         }}
 *         onSkip={onboarding.skipWelcome}
 *       />
 * 
 *       <InteractiveTutorial
 *         steps={defaultTutorialSteps}
 *         isOpen={onboarding.shouldShowTutorial}
 *         onComplete={onboarding.completeTutorial}
 *         onSkip={onboarding.skipTutorial}
 *       />
 *     </>
 *   );
 * }
 */
