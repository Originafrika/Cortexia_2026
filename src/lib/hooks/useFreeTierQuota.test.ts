import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFreeTierQuota, FREE_TIER_DAILY_LIMIT } from '@/lib/hooks/useFreeTierQuota';
import { supabase } from '@/lib/supabase/client';

// Mock supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    rpc: vi.fn()
  }
}));

describe('useFreeTierQuota', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should return default quota when userId is undefined', async () => {
    const { result } = renderHook(() => useFreeTierQuota(undefined));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.quota.remaining).toBe(FREE_TIER_DAILY_LIMIT);
    expect(result.current.quota.total).toBe(FREE_TIER_DAILY_LIMIT);
    expect(result.current.hasQuota()).toBe(true);
  });

  it('should fetch quota from server when userId is provided', async () => {
    const mockQuota = {
      remaining: 3,
      used_today: 2,
      resets_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: mockQuota,
      error: null
    });

    const { result } = renderHook(() => useFreeTierQuota('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(supabase.rpc).toHaveBeenCalledWith('get_free_tier_quota', {
      p_user_id: 'user-123'
    });
    expect(result.current.quota.remaining).toBe(3);
    expect(result.current.quota.usedToday).toBe(2);
  });

  it('should handle increment usage', async () => {
    const mockQuota = {
      remaining: 5,
      used_today: 0,
      resets_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce({ data: mockQuota, error: null })
      .mockResolvedValueOnce({ data: null, error: null });

    const { result } = renderHook(() => useFreeTierQuota('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await result.current.incrementUsage();
    
    expect(supabase.rpc).toHaveBeenCalledWith('increment_free_tier_usage', {
      p_user_id: 'user-123'
    });
    expect(result.current.quota.remaining).toBe(4);
    expect(result.current.quota.usedToday).toBe(1);
  });

  it('should return false for hasQuota when remaining is 0', async () => {
    const mockQuota = {
      remaining: 0,
      used_today: 5,
      resets_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: mockQuota,
      error: null
    });

    const { result } = renderHook(() => useFreeTierQuota('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.hasQuota()).toBe(false);
  });

  it('should handle RPC errors gracefully', async () => {
    vi.mocked(supabase.rpc).mockRejectedValueOnce(new Error('RPC failed'));

    const { result } = renderHook(() => useFreeTierQuota('user-123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe('RPC failed');
    expect(result.current.quota.remaining).toBe(FREE_TIER_DAILY_LIMIT);
  });
});
