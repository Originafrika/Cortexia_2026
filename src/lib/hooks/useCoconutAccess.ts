/**
 * useCoconutAccess - Hook for managing Coconut V14 access
 * Handles Creator monthly quota (3 generations) and Enterprise unlimited access
 * v3.0 - Optimized with localStorage cache for instant loading
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export interface CoconutAccessData {
  hasAccess: boolean;
  isCreator: boolean;
  isEnterprise: boolean;
  monthlyQuota: number; // Total quota per month (3 for Creators, unlimited for Enterprise)
  remainingGenerations: number; // How many generations left this month
  usedThisMonth: number;
  resetDate: string; // ISO date when quota resets
  accountType: 'individual' | 'enterprise' | 'developer';
}

interface CachedAccessData {
  data: CoconutAccessData;
  timestamp: number;
  userId: string;
}

const CACHE_KEY = 'cortexia_coconut_access_cache';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache

/**
 * Get cached access data from localStorage
 */
function getCachedData(userId: string): CoconutAccessData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedAccessData = JSON.parse(cached);
    
    // Check if cache is for the same user and not expired
    if (parsed.userId === userId && Date.now() - parsed.timestamp < CACHE_DURATION) {
      console.log('🥥 [useCoconutAccess] ⚡ Using cached data (instant load)');
      return parsed.data;
    }
    
    // Cache expired or wrong user
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (err) {
    console.error('Error reading cache:', err);
    return null;
  }
}

/**
 * Save access data to localStorage cache
 */
function setCachedData(userId: string, data: CoconutAccessData): void {
  try {
    const cached: CachedAccessData = {
      data,
      timestamp: Date.now(),
      userId
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    console.log('🥥 [useCoconutAccess] 💾 Data cached for instant future loads');
  } catch (err) {
    console.error('Error saving cache:', err);
  }
}

/**
 * Clear cache (useful after generation tracking)
 */
export function clearCoconutAccessCache(): void {
  localStorage.removeItem(CACHE_KEY);
  console.log('🥥 [useCoconutAccess] 🗑️ Cache cleared');
}

/**
 * ✅ OPTIMIZATION 4: Preload access data (call this on login/signup)
 * This caches the data so it's instantly available when the user opens CreateHub
 */
export async function preloadCoconutAccess(userId: string): Promise<void> {
  try {
    console.log('🥥 [preloadCoconutAccess] ⚡ Preloading access data for instant future loads...');
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/creators/${userId}/coconut-access`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );

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
      
      // Save to cache
      setCachedData(userId, transformedData);
      console.log('🥥 [preloadCoconutAccess] ✅ Access data preloaded and cached');
    }
  } catch (err) {
    console.error('🥥 [preloadCoconutAccess] ❌ Preload failed (non-critical):', err);
    // Non-critical error - cache will be populated on first use
  }
}

export function useCoconutAccess(userId: string | null) {
  const [accessData, setAccessData] = useState<CoconutAccessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchInProgressRef = useRef(false); // Prevent duplicate fetches

  console.log('🥥 [useCoconutAccess] HOOK INITIALIZED with userId:', userId);

  const fetchAccessData = useCallback(async (bypassCache = false) => {
    console.log('🥥 [useCoconutAccess] fetchAccessData called with userId:', userId, 'bypassCache:', bypassCache);
    
    if (!userId) {
      console.log('🥥 [useCoconutAccess] No userId, skipping fetch');
      setAccessData(null);
      setIsLoading(false);
      return;
    }

    // ✅ Prevent duplicate concurrent fetches
    if (fetchInProgressRef.current && !bypassCache) {
      console.log('🥥 [useCoconutAccess] ⏭️ Fetch already in progress, skipping');
      return;
    }

    // ✅ OPTIMIZATION 1: Try cache first (instant load!)
    if (!bypassCache) {
      const cached = getCachedData(userId);
      if (cached) {
        setAccessData(cached);
        setIsLoading(false);
        // Continue fetching in background to update cache
        console.log('🥥 [useCoconutAccess] 🔄 Refreshing cache in background...');
      }
    }

    try {
      fetchInProgressRef.current = true;
      setIsLoading(true);
      setError(null);

      console.log('🥥 [useCoconutAccess] Fetching from:', `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/creators/${userId}/coconut-access`);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/creators/${userId}/coconut-access`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      console.log('🥥 [useCoconutAccess] Response status:', response.status);

      const data = await response.json();

      console.log('🥥 [useCoconutAccess] RAW Backend response:', JSON.stringify(data, null, 2));
      console.log('🥥 [useCoconutAccess] data.success:', data.success);

      if (data.success) {
        console.log('🥥 [useCoconutAccess] Backend response:', data);
        
        const transformedData: CoconutAccessData = {
          hasAccess: data.hasCoconutAccess,
          isCreator: data.isCreator,
          isEnterprise: data.accountType === 'enterprise' || data.isEnterprise,
          monthlyQuota: data.isEnterprise ? -1 : 3, // 3 for Creators, unlimited for Enterprise
          remainingGenerations: data.coconutGenerationsRemaining || 0,
          usedThisMonth: data.coconutGenerationsUsed || 0,
          resetDate: data.expiresAt || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
          accountType: data.accountType || 'individual'
        };
        
        console.log('🥥 [useCoconutAccess] Transformed data:', transformedData);
        console.log('🥥 [useCoconutAccess] Button should show:', transformedData.hasAccess && transformedData.isCreator);
        console.log('🥥 [useCoconutAccess] SETTING accessData to:', transformedData);
        
        // ✅ OPTIMIZATION 2: Save to cache for next time
        setCachedData(userId, transformedData);
        
        setAccessData(transformedData);
        console.log('🥥 [useCoconutAccess] ✅ accessData SET');
      } else {
        console.error('🥥 [useCoconutAccess] Backend error:', data.error);
        setError(data.error || 'Failed to fetch access data');
      }
    } catch (err) {
      console.error('Error fetching Coconut access:', err);
      setError('Failed to fetch access data');
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    fetchAccessData();
  }, [fetchAccessData]);

  const trackGeneration = useCallback(async (generationType: 'image' | 'video' | 'campaign') => {
    if (!userId || !accessData?.hasAccess) return false;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/creators/${userId}/coconut-track`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ generationType })
        }
      );

      const data = await response.json();

      if (data.success) {
        // ✅ OPTIMIZATION 3: Clear cache before refresh (ensures fresh data)
        clearCoconutAccessCache();
        
        // Refresh access data to get updated remaining count
        await fetchAccessData(true); // bypassCache = true
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error tracking generation:', err);
      return false;
    }
  }, [userId, accessData, fetchAccessData]);

  return {
    accessData,
    isLoading,
    error,
    trackGeneration,
    refetch: fetchAccessData
  };
}