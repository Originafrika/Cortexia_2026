import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `/api`;

export interface UserCredits {
  free: number;
  paid: number;
  lastReset?: string;
}

/**
 * Get user credits
 */
export async function getUserCredits(
  userId: string
): Promise<{ success: boolean; credits?: UserCredits; daysUntilReset?: number; error?: string }> {
  try {
    const url = `${API_BASE}/credits?userId=${encodeURIComponent(userId)}`;
    console.log('📞 Fetching credits from:', url);
    
    const response = await fetch(url);

    console.log('📥 Credits response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Credits response error:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Credits data:', data);
    return {
      success: true,
      credits: {
        free: data.credits?.free || 0,
        paid: data.credits?.premium || 0
      }
    };
  } catch (error) {
    console.error('Get user credits error:', error);
    return {
      success: true,
      credits: {
        free: 10,
        paid: 0,
        lastReset: new Date().toISOString()
      },
      daysUntilReset: 30,
      error: error instanceof Error ? error.message : 'Failed to get credits'
    };
  }
}

/**
 * Add paid credits to user
 */
export async function addPaidCredits(
  userId: string,
  amount: number
): Promise<{ success: boolean; credits?: UserCredits; daysUntilReset?: number; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/credits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, amount, type: 'premium', reason: 'purchase' }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Add paid credits error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add credits',
    };
  }
}

/**
 * Deduct credits from user
 */
export async function deductCredits(
  userId: string,
  amount: number,
  type: 'free' | 'paid' = 'paid'
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const creditType = type === 'paid' ? 'premium' : 'free';
    const response = await fetch(`${API_BASE}/credits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, amount: -amount, type: creditType, reason: 'usage' }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Deduct credits error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deduct credits',
    };
  }
}