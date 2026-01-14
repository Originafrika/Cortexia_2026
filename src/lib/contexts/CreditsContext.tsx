// Credits Context - Manage user credits across the app (Dual System: Paid + Free)
// ✅ CONNECTED TO BACKEND - Real credit management with API
// ❌ NO LOCAL STORAGE - All credits from database only

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { getUserCredits, addPaidCredits as addPaidCreditsAPI } from '../api/credits';

// ✅ Backend-compatible UserCredits type
export interface UserCredits {
  free: number;
  paid: number;
  lastReset?: string;
}

interface CreditsContextType {
  credits: UserCredits;
  isLoading: boolean;
  error: string | null;
  userId: string; // ✅ Expose userId for API calls
  deductCredits: (amount: number, type?: 'free' | 'paid') => boolean;
  addPaidCredits: (amount: number) => Promise<void>;
  hasEnoughCredits: (amount: number, type?: 'free' | 'paid') => boolean;
  updateCredits: (newCredits: UserCredits) => void;
  refetchCredits: () => Promise<void>;
  getTotalCredits: () => number;
  getCoconutCredits: () => number; // ✅ NEW: Returns only paid credits for Coconut V14
  daysUntilReset: number;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

interface CreditsProviderProps {
  children: ReactNode;
  userId?: string; // User ID (defaults to 'demo-user')
}

export function CreditsProvider({ children, userId = 'demo-user' }: CreditsProviderProps) {
  const [credits, setCredits] = useState<UserCredits>({
    free: 0,  // ✅ Start at 0, will be loaded from backend
    paid: 0,  // ✅ Start at 0, will be loaded from backend
    lastReset: new Date().toISOString()
  });
  
  const [isLoading, setIsLoading] = useState(true); // ✅ Start loading until backend responds
  const [error, setError] = useState<string | null>(null);
  const [daysUntilReset, setDaysUntilReset] = useState(30);

  // ❌ REMOVED: No more localStorage for credits - database only

  // Fetch credits from backend (with fallback)
  const refetchCredits = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔄 Fetching credits for user: ${userId}`);
      const response = await getUserCredits(userId);

      if (!response.success || !response.credits) {
        throw new Error(response.error || 'Failed to fetch credits');
      }

      // ✅ CRITICAL: Only update if userId hasn't changed (prevent race condition)
      // This prevents old demo-user credits from overwriting real user credits
      setCredits(response.credits);
      setDaysUntilReset(response.daysUntilReset || 30);
      setIsLoading(false);

      console.log('✅ Credits fetched from backend:', response.credits);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Failed to fetch credits from backend:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
      
      // ❌ NO FALLBACK to localStorage - credits MUST come from database
      toast.error('Unable to load credits. Please refresh the page.', {
        description: errorMessage
      });
    }
  }, [userId]);

  // Fetch credits on mount AND when userId changes
  useEffect(() => {
    let cancelled = false; // ✅ Track if this effect has been cancelled
    
    const fetchWithCancel = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(`🔄 Fetching credits for user: ${userId}`);
        const response = await getUserCredits(userId);

        // ✅ CRITICAL: Check if effect was cancelled before updating state
        if (cancelled) {
          console.log('⏭️ Fetch cancelled for old userId, ignoring response');
          return;
        }

        if (!response.success || !response.credits) {
          throw new Error(response.error || 'Failed to fetch credits');
        }

        setCredits(response.credits);
        setDaysUntilReset(response.daysUntilReset || 30);
        setIsLoading(false);

        console.log('✅ Credits fetched from backend:', response.credits);

      } catch (err) {
        if (cancelled) return; // ✅ Ignore errors for cancelled fetches
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ Failed to fetch credits from backend:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
        
        toast.error('Unable to load credits. Please refresh the page.', {
          description: errorMessage
        });
      }
    };
    
    fetchWithCancel();
    
    // ✅ Cleanup: Mark as cancelled when userId changes
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Local deduction (optimistic update)
  // Backend handles actual deduction during generation
  const deductCredits = useCallback((amount: number, type: 'free' | 'paid' = 'free'): boolean => {
    const availableCredits = type === 'free' ? credits.free : credits.paid;

    if (availableCredits < amount) {
      const totalCredits = credits.free + credits.paid;
      
      if (totalCredits < amount) {
        toast.error(`Not enough credits! You need ${amount} but have ${totalCredits} total`, {
          description: 'Purchase more credits to continue creating'
        });
        return false;
      }

      // If preferred type doesn't have enough, suggest alternative
      const alternativeType = type === 'free' ? 'paid' : 'free';
      const alternativeCredits = type === 'free' ? credits.paid : credits.free;

      if (alternativeCredits >= amount) {
        toast.warning(`Not enough ${type} credits, but you have ${alternativeCredits} ${alternativeType} credits available`);
      }

      return false;
    }

    // Optimistic update (backend will be source of truth)
    setCredits(prev => ({
      ...prev,
      [type]: prev[type] - amount
    }));

    console.log(`💎 Deducted ${amount} ${type} credits locally (optimistic)`);
    return true;

  }, [credits]);

  const addPaidCredits = useCallback(async (amount: number) => {
    try {
      console.log(`💰 Adding ${amount} paid credits for user: ${userId}`);
      
      // ✅ FIX: Try backend first, fallback to local
      try {
        const response = await addPaidCreditsAPI(userId, amount);

        if (response.success && response.credits) {
          setCredits(response.credits);
          toast.success(`+${amount} paid credits added!`, {
            description: 'Credits never expire'
          });
          console.log('✅ Paid credits added via backend:', response.credits);
          return;
        }
      } catch (backendError) {
        console.warn('⚠️ Backend unavailable for addPaidCredits, using local fallback');
      }

      // ✅ Fallback: Add credits locally
      setCredits(prev => ({
        ...prev,
        paid: prev.paid + amount
      }));

      toast.success(`+${amount} paid credits added!`, {
        description: 'Credits never expire (local mode)'
      });

      console.log(`✅ Paid credits added locally: ${amount}`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Failed to add credits:', errorMessage);

      toast.error('Failed to add credits', {
        description: errorMessage
      });
    }
  }, [userId]);

  const hasEnoughCredits = useCallback((amount: number, type?: 'free' | 'paid'): boolean => {
    if (type) {
      return credits[type] >= amount;
    }
    return (credits.free + credits.paid) >= amount;
  }, [credits]);

  const updateCredits = useCallback((newCredits: UserCredits) => {
    setCredits(newCredits);
    console.log('💎 Credits updated:', newCredits);
  }, []);

  const getTotalCredits = useCallback((): number => {
    return credits.free + credits.paid;
  }, [credits]);

  // ✅ NEW: Returns only paid credits for Coconut V14
  const getCoconutCredits = useCallback((): number => {
    return credits.paid;
  }, [credits]);

  // ✅ DEMO USER AUTO-CREDIT - Give 10,000 paid credits on first launch (DISABLED for now)
  // This will be handled by onboarding flow instead
  /*
  useEffect(() => {
    const initDemoCredits = async () => {
      if (userId === 'demo-user') {
        // Check if we already credited
        const hasInitialized = localStorage.getItem('cortexia-demo-initialized');
        
        if (!hasInitialized && credits.paid === 0) {
          console.log('🥥 Initializing demo user with 10,000 paid credits...');
          await addPaidCredits(10000);
          localStorage.setItem('cortexia-demo-initialized', 'true');
        }
      }
    };

    // Wait a bit for initial credits fetch, then check
    setTimeout(initDemoCredits, 1000);
  }, [userId, credits.paid, addPaidCredits]);
  */

  return (
    <CreditsContext.Provider value={{ 
      credits,
      isLoading,
      error,
      userId, // ✅ Expose userId for API calls
      deductCredits,
      addPaidCredits,
      hasEnoughCredits,
      updateCredits,
      refetchCredits,
      getTotalCredits,
      getCoconutCredits, // ✅ NEW: Returns only paid credits for Coconut V14
      daysUntilReset
    }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits(): CreditsContextType {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
}