import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

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
    // ✅ Encode userId to handle special characters like | in google-oauth2|123456
    const encodedUserId = encodeURIComponent(userId);
    const url = `${API_BASE}/credits/${encodedUserId}`;
    console.log('📞 Fetching credits from:', url);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    console.log('📥 Credits response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Credits response error:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Credits data:', data);
    return data;
  } catch (error) {
    console.error('Get user credits error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get credits',
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
    const response = await fetch(`${API_BASE}/credits/add-paid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ userId, amount }),
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
    const response = await fetch(`${API_BASE}/credits/deduct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ userId, amount, type }),
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