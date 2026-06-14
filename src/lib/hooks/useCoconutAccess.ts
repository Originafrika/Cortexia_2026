/**
 * useCoconutAccess - Hook for managing Coconut V14 access
 * Handles Creator monthly quota (3 generations) and Enterprise unlimited access
 * v3.0 - Optimized with localStorage cache for instant loading
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface CoconutAccessData {
  hasAccess: boolean;
  isCreator: boolean;
  isEnterprise: boolean;
  monthlyQuota: number;
  remainingGenerations: number;
  usedThisMonth: number;
  resetDate: string;
  accountType: 'individual' | 'enterprise' | 'developer';
}

interface CachedAccessData {
  data: CoconutAccessData;
  timestamp: number;
  userId: string;
}

const CACHE_KEY = 'cortexia_coconut_access_cache';
const CACHE_DURATION = 2 * 60 * 1000;

function getCachedData(userId: string): CoconutAccessData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed: CachedAccessData = JSON.parse(cached);
    if (parsed.userId === userId && Date.now() - parsed.timestamp < CACHE_DURATION) {
      return parsed.data;
    }
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (err) {
    return null;
  }
}

function setCachedData(userId: string, data: CoconutAccessData): void {
  try {
    const cached: CachedAccessData = { data, timestamp: Date.now(), userId };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch (err) {}
}

export function clearCoconutAccessCache(): void {
  localStorage.removeItem(CACHE_KEY);
}

export async function preloadCoconutAccess(userId: string): Promise<void> {
  try {
    const response = await fetch(`/api/creators/access?userId=${userId}`);
    const data = await response.json();
    if (data.success) {
      const transformedData: CoconutAccessData = {
        hasAccess: data.hasCoconutAccess,
        isCreator: data.isCreator,
        isEnterprise: data.accountType === 'enterprise' || data.isEnterprise,
        monthlyQuota: data.isEnterprise ? -1 : 3,
        remainingGenerations: data.coconutGenerationsRemaining || 0,
        usedThisMonth: data.coconutGenerationsUsed || 0,
        resetDate: data.expiresAt || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
        accountType: data.accountType || 'individual'
      };
      setCachedData(userId, transformedData);
    }
  } catch (err) {}
}

export function useCoconutAccess(userId: string | null) {
  const [accessData, setAccessData] = useState<CoconutAccessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchInProgressRef = useRef(false);

  const fetchAccessData = useCallback(async (bypassCache = false) => {
    if (!userId) {
      setAccessData(null);
      setIsLoading(false);
      return;
    }

    if (userId === 'demo-user' || userId === 'preview-user') {
      setAccessData({
        hasAccess: true,
        isCreator: true,
        isEnterprise: true,
        monthlyQuota: -1,
        remainingGenerations: 1500,
        usedThisMonth: 0,
        resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
        accountType: 'enterprise'
      });
      setIsLoading(false);
      return;
    }

    if (fetchInProgressRef.current && !bypassCache) return;

    if (!bypassCache) {
      const cached = getCachedData(userId);
      if (cached) {
        setAccessData(cached);
        setIsLoading(false);
      }
    }

    try {
      fetchInProgressRef.current = true;
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/creators/access?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        const transformedData: CoconutAccessData = {
          hasAccess: data.hasCoconutAccess,
          isCreator: data.isCreator,
          isEnterprise: data.accountType === 'enterprise' || data.isEnterprise,
          monthlyQuota: data.isEnterprise ? -1 : 3,
          remainingGenerations: data.coconutGenerationsRemaining || 0,
          usedThisMonth: data.coconutGenerationsUsed || 0,
          resetDate: data.expiresAt || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
          accountType: data.accountType || 'individual'
        };
        setCachedData(userId, transformedData);
        setAccessData(transformedData);
      } else {
        setError(data.error || 'Failed to fetch access data');
      }
    } catch (err) {
      setError('Failed to fetch access data');
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    fetchAccessData();
  }, [userId, fetchAccessData]);

  const trackGeneration = useCallback(async (generationType: 'image' | 'video' | 'campaign') => {
    if (!userId || !accessData?.hasAccess) return false;
    try {
      const response = await fetch(`/api/creators/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, generationType })
      });
      const data = await response.json();
      if (data.success) {
        clearCoconutAccessCache();
        await fetchAccessData(true);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }, [userId, accessData, fetchAccessData]);

  return { accessData, isLoading, error, trackGeneration, refetch: fetchAccessData };
}
