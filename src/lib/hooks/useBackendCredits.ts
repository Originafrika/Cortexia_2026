// useBackendCredits.ts - Hook to fetch and manage credits from backend

import { useState, useEffect, useCallback } from 'react';
import { getUserCredits, addPaidCredits as addPaidCreditsAPI, type UserCredits } from '../api/generation';
import { toast } from 'sonner@2.0.3';

interface BackendCreditsState {
  credits: UserCredits | null;
  isLoading: boolean;
  error: string | null;
  daysUntilReset: number;
}

interface UseBackendCreditsReturn extends BackendCreditsState {
  refetch: () => Promise<void>;
  addCredits: (amount: number) => Promise<void>;
  updateLocalCredits: (credits: UserCredits) => void;
}

/**
 * Hook to manage credits from backend
 * @param userId - User ID (for now we'll use a mock ID)
 * @param autoFetch - Whether to fetch credits on mount
 */
export function useBackendCredits(
  userId: string = 'demo-user',
  autoFetch: boolean = true
): UseBackendCreditsReturn {
  const [state, setState] = useState<BackendCreditsState>({
    credits: null,
    isLoading: false,
    error: null,
    daysUntilReset: 30
  });

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await getUserCredits(userId);

      if (!response.success || !response.credits) {
        throw new Error(response.error || 'Failed to fetch credits');
      }

      setState({
        credits: response.credits,
        isLoading: false,
        error: null,
        daysUntilReset: response.daysUntilReset || 30
      });

      console.log('✅ Credits fetched:', response.credits);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to fetch credits:', errorMessage);

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      toast.error('Failed to load credits', {
        description: errorMessage
      });
    }
  }, [userId]);

  const addCredits = useCallback(async (amount: number) => {
    try {
      const response = await addPaidCreditsAPI(userId, amount);

      if (!response.success || !response.credits) {
        throw new Error(response.error || 'Failed to add credits');
      }

      setState(prev => ({
        ...prev,
        credits: response.credits!
      }));

      toast.success(`+${amount} paid credits added!`, {
        description: 'Credits never expire'
      });

      console.log('✅ Credits added:', response.credits);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to add credits:', errorMessage);

      toast.error('Failed to add credits', {
        description: errorMessage
      });
    }
  }, [userId]);

  const updateLocalCredits = useCallback((credits: UserCredits) => {
    setState(prev => ({ ...prev, credits }));
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [autoFetch, refetch]);

  return {
    ...state,
    refetch,
    addCredits,
    updateLocalCredits
  };
}
