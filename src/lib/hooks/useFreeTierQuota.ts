import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

interface FreeTierQuota {
  remaining: number;
  total: number;
  usedToday: number;
  resetsAt: string;
  isLimited: boolean;
}

const FREE_TIER_DAILY_LIMIT = 5;
const QUOTA_KEY = 'cortexia_free_quota';

export function useFreeTierQuota(userId: string | undefined) {
  const [quota, setQuota] = useState<FreeTierQuota>({
    remaining: FREE_TIER_DAILY_LIMIT,
    total: FREE_TIER_DAILY_LIMIT,
    usedToday: 0,
    resetsAt: '',
    isLimited: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = useCallback(async () => {
    if (!userId) {
      setQuota({
        remaining: FREE_TIER_DAILY_LIMIT,
        total: FREE_TIER_DAILY_LIMIT,
        usedToday: 0,
        resetsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isLimited: true
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check local cache first
      const cached = localStorage.getItem(`${QUOTA_KEY}_${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = new Date();
        const resetsAt = new Date(parsed.resetsAt);
        
        if (now < resetsAt) {
          setQuota(parsed);
          setLoading(false);
          return;
        }
      }

      // Fetch from server
      const { data, error: rpcError } = await supabase
        .rpc('get_free_tier_quota', { p_user_id: userId });

      if (rpcError) throw rpcError;

      const quotaData: FreeTierQuota = {
        remaining: data?.remaining || FREE_TIER_DAILY_LIMIT,
        total: FREE_TIER_DAILY_LIMIT,
        usedToday: data?.used_today || 0,
        resetsAt: data?.resets_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isLimited: true
      };

      // Cache locally
      localStorage.setItem(`${QUOTA_KEY}_${userId}`, JSON.stringify(quotaData));
      setQuota(quotaData);
    } catch (err) {
      console.error('Failed to fetch free tier quota:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch quota');
      
      // Fallback to default
      setQuota({
        remaining: FREE_TIER_DAILY_LIMIT,
        total: FREE_TIER_DAILY_LIMIT,
        usedToday: 0,
        resetsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isLimited: true
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const incrementUsage = useCallback(async () => {
    if (!userId) return;

    try {
      const { error: rpcError } = await supabase
        .rpc('increment_free_tier_usage', { p_user_id: userId });

      if (rpcError) throw rpcError;

      // Update local state
      setQuota(prev => ({
        ...prev,
        remaining: Math.max(0, prev.remaining - 1),
        usedToday: prev.usedToday + 1
      }));

      // Update cache
      const cached = localStorage.getItem(`${QUOTA_KEY}_${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.remaining = Math.max(0, parsed.remaining - 1);
        parsed.usedToday = parsed.usedToday + 1;
        localStorage.setItem(`${QUOTA_KEY}_${userId}`, JSON.stringify(parsed));
      }
    } catch (err) {
      console.error('Failed to increment usage:', err);
    }
  }, [userId]);

  const hasQuota = useCallback(() => {
    return quota.remaining > 0;
  }, [quota.remaining]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  return {
    quota,
    loading,
    error,
    refresh: fetchQuota,
    incrementUsage,
    hasQuota,
    FREE_TIER_DAILY_LIMIT
  };
}

export type { FreeTierQuota };
export { FREE_TIER_DAILY_LIMIT };
