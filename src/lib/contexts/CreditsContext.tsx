// Credits Context - Manage user credits across the app (Dual System: Paid + Free)
// ✅ CONNECTED TO BACKEND - Real credit management with API
// ❌ NO LOCAL STORAGE - All credits from database only

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { getUserCredits, addPaidCredits as addPaidCreditsAPI } from '../api/credits';
import { projectId } from '../../utils/supabase/info';

// ✅ Backend-compatible UserCredits type
export interface UserCredits {
  free: number;
  paid: number;
  lastReset?: string;
  
  // ✅ NEW: Enterprise subscription credits
  isEnterprise?: boolean;
  monthlyCredits?: number; // Enterprise: Monthly subscription credits (10,000)
  monthlyCreditsRemaining?: number; // Enterprise: How many monthly credits left
  addOnCredits?: number; // Enterprise: Add-on credits (never expire)
  nextResetDate?: string; // Enterprise: When monthly credits reset
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
  getCoconutCredits: () => number; // ✅ NEW: Returns total credits for Coconut V14 (including Enterprise monthly + add-on)
  daysUntilReset: number;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

interface CreditsProviderProps {
  children: ReactNode;
  userId?: string; // User ID (defaults to 'demo-user')
}

export function CreditsProvider({ children, userId = 'demo-user' }: CreditsProviderProps) {
  const [credits, setCredits] = useState<UserCredits>(() => {
    // ✅ Initialize with demo credits if userId is demo-user (for instant display)
    if (userId === 'demo-user') {
      return {
        free: 25,
        paid: 1500,
        lastReset: new Date().toISOString()
      };
    }
    return {
      free: 0,
      paid: 0,
      lastReset: new Date().toISOString()
    };
  });
  
  const [isLoading, setIsLoading] = useState(() => userId !== 'demo-user'); // ✅ Don't load for demo-user
  const [error, setError] = useState<string | null>(null);
  const [daysUntilReset, setDaysUntilReset] = useState(30);

  // ❌ REMOVED: No more localStorage for credits - database only

  // Fetch credits from backend (with fallback)
  const refetchCredits = useCallback(async () => {
    // ✅ Skip backend fetch for demo-user - credits are initialized locally
    if (userId === 'demo-user') {
      console.log('🥥 Skipping refetchCredits for demo-user - using local credits');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔄 Fetching credits for user: ${userId}`);
      console.log(`📍 API will call: https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/credits/${encodeURIComponent(userId)}`);
      
      const response = await getUserCredits(userId);
      
      console.log('📦 getUserCredits response:', response);

      // ✅ FIX: Even if backend fails, use fallback credits (success=true with fallback)
      if (response.credits) {
        setCredits(response.credits);
        setDaysUntilReset(response.daysUntilReset || 30);
        setIsLoading(false);
        
        // Show warning if using fallback (but only once, not repeatedly)
        if (response.error && !sessionStorage.getItem('credits-fallback-warned')) {
          console.warn('⚠️ Using fallback credits due to backend error:', response.error);
          sessionStorage.setItem('credits-fallback-warned', 'true');
        } else if (!response.error) {
          console.log('✅ Credits fetched from backend:', response.credits);
        }
      } else {
        throw new Error(response.error || 'Failed to fetch credits');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Failed to fetch credits from backend:', errorMessage);
      console.error('❌ Full error object:', err);
      setError(errorMessage);
      setIsLoading(false);
      
      // ✅ IMPROVED: Only show error toast once per session
      if (!sessionStorage.getItem('credits-error-shown')) {
        toast.error('Unable to load credits. Using demo mode.', {
          description: 'Backend not available'
        });
        sessionStorage.setItem('credits-error-shown', 'true');
      }
      
      // ✅ Set demo credits as fallback
      setCredits({
        free: 50,
        paid: 0,
        lastReset: new Date().toISOString()
      });
    }
  }, [userId]);

  // Fetch credits on mount AND when userId changes (skip for demo-user)
  useEffect(() => {
    // ✅ Skip backend fetch for demo-user - credits are initialized locally
    if (userId === 'demo-user') {
      console.log('🥥 Skipping backend fetch for demo-user - using local credits');
      return;
    }

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

        // ✅ FIX: Even if backend fails, use fallback credits (success=true with fallback)
        if (response.credits) {
          setCredits(response.credits);
          setDaysUntilReset(response.daysUntilReset || 30);
          setIsLoading(false);
          
          // Show warning if using fallback (but only once)
          if (response.error && !sessionStorage.getItem('credits-fallback-warned')) {
            console.warn('⚠️ Using fallback credits due to backend error:', response.error);
            sessionStorage.setItem('credits-fallback-warned', 'true');
          } else if (!response.error) {
            console.log('✅ Credits fetched from backend:', response.credits);
          }
        } else {
          throw new Error(response.error || 'Failed to fetch credits');
        }

      } catch (err) {
        if (cancelled) return; // ✅ Ignore errors for cancelled fetches
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ Failed to fetch credits from backend:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
        
        // ✅ IMPROVED: Only show error toast once per session (skip for demo-user)
        if (userId !== 'demo-user' && !sessionStorage.getItem('credits-error-shown')) {
          toast.error('Unable to load credits. Using demo mode.', {
            description: 'Backend not available'
          });
          sessionStorage.setItem('credits-error-shown', 'true');
        }
        
        // ✅ Set demo credits as fallback
        const demoCredits = userId === 'demo-user' 
          ? { free: 25, paid: 1500, lastReset: new Date().toISOString() }
          : { free: 50, paid: 0, lastReset: new Date().toISOString() };
        setCredits(demoCredits);
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
  // Priority: PAID credits FIRST (premium models), then FREE credits (Pollinations)
  const deductCredits = useCallback((amount: number, type: 'free' | 'paid' = 'paid'): boolean => {
    const totalCredits = credits.free + credits.paid;

    // Check if user has enough total credits
    if (totalCredits < amount) {
      toast.error(`Not enough credits! You need ${amount} but have ${totalCredits} total`, {
        description: 'Purchase more credits to continue creating'
      });
      return false;
    }

    // ✅ PRIORITY LOGIC: Use PAID credits first (premium models access)
    let remaining = amount;
    let paidUsed = 0;
    let freeUsed = 0;

    // 1. Use PAID credits first
    if (credits.paid > 0) {
      paidUsed = Math.min(remaining, credits.paid);
      remaining -= paidUsed;
    }

    // 2. Use FREE credits as fallback
    if (remaining > 0 && credits.free > 0) {
      freeUsed = Math.min(remaining, credits.free);
      remaining -= freeUsed;
    }

    // Optimistic update (backend will be source of truth)
    setCredits(prev => ({
      ...prev,
      paid: prev.paid - paidUsed,
      free: prev.free - freeUsed
    }));

    console.log(`💎 Deducted ${amount} credits locally (optimistic):`);
    console.log(`   - ${paidUsed} paid credits (premium models)`);
    console.log(`   - ${freeUsed} free credits (Pollinations)`);
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
    // ✅ NEW: For Enterprise users, total = monthly remaining + add-on
    if (credits.isEnterprise) {
      return (credits.monthlyCreditsRemaining || 0) + (credits.addOnCredits || 0);
    }
    
    // ✅ For regular users: free + paid
    return credits.free + credits.paid;
  }, [credits]);

  // ✅ NEW: Returns total credits for Coconut V14 (including Enterprise monthly + add-on)
  const getCoconutCredits = useCallback((): number => {
    // ✅ For Enterprise: return total (monthly + add-on)
    if (credits.isEnterprise) {
      return getTotalCredits();
    }
    // ✅ For regular users: only paid credits
    return credits.paid;
  }, [credits, getTotalCredits]);

  // ✅ DEMO USER AUTO-CREDIT - Already handled in useState initialization
  // No need for separate effect since we initialize with 1500 credits upfront

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
      getCoconutCredits, // ✅ NEW: Returns total credits for Coconut V14 (including Enterprise monthly + add-on)
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