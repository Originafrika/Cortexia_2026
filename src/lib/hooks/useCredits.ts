// useCredits Hook - Centralized credits management with backend integration
// Fixes: État des crédits dispersé, pas de sync backend

import { useState, useEffect, useCallback } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = '/api';

export interface UserCredits {
  free: number;
  paid: number;
  daysUntilReset: number;
}

interface UseCreditsReturn {
  credits: UserCredits;
  loading: boolean;
  error: string | null;
  refreshCredits: () => Promise<void>;
  canAfford: (cost: number, creditType: 'free' | 'paid') => boolean;
}

export function useCredits(userId: string): UseCreditsReturn {
  const [credits, setCredits] = useState<UserCredits>({
    free: 0,
    paid: 0,
    daysUntilReset: 30
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE}/credits?userId=${encodeURIComponent(userId)}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch credits: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setCredits({
          free: data.credits.free,
          paid: data.credits.paid,
          daysUntilReset: data.daysUntilReset
        });
      } else {
        throw new Error(data.error || 'Failed to fetch credits');
      }
    } catch (err) {
      console.error('Credits fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch credits');
      
      // Fallback to default values on error
      setCredits({
        free: 25,
        paid: 0,
        daysUntilReset: 30
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const canAfford = useCallback((cost: number, creditType: 'free' | 'paid'): boolean => {
    return credits[creditType] >= cost;
  }, [credits]);

  return {
    credits,
    loading,
    error,
    refreshCredits: fetchCredits,
    canAfford
  };
}
