/**
 * Production-Ready Profile Fetching Utility
 * Handles profile fetching with retry logic and error handling
 */

import { projectId } from '../../utils/supabase/info';

const API_BASE = '/api';

export interface ProfileData {
  success: boolean;
  userId: string;
  email: string;
  displayName: string;
  username: string;
  accountType: 'individual' | 'enterprise' | 'developer';
  onboardingComplete: boolean;
  referralCode: string;
  createdAt: string;
  profile: any;
}

interface FetchProfileOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * Fetch user profile from backend with retry logic
 * @param userId - User ID
 * @param accessToken - Access token for authentication
 * @param options - Fetch options (maxRetries, retryDelay, timeout)
 * @returns Profile data or null if failed
 */
export async function fetchUserProfile(
  userId: string,
  accessToken: string,
  options: FetchProfileOptions = {}
): Promise<ProfileData | null> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 5000,
  } = options;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[ProfileFetch] Attempt ${attempt + 1}/${maxRetries} for user ${userId}`);

      // Create fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(
        `${API_BASE}/auth/profile/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          console.error('[ProfileFetch] User not found (404)');
          return null;
        }
        
        if (response.status === 401) {
          console.error('[ProfileFetch] Unauthorized (401)');
          return null;
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || !data.accountType) {
        throw new Error('Invalid profile data structure');
      }

      console.log('✅ [ProfileFetch] Successfully fetched profile:', data.accountType);
      return data;

    } catch (error: any) {
      console.warn(`⚠️ [ProfileFetch] Attempt ${attempt + 1} failed:`, error.message);

      // Don't retry on abort (timeout) or 404/401
      if (error.name === 'AbortError' || error.message.includes('404') || error.message.includes('401')) {
        return null;
      }

      // Last attempt - return null
      if (attempt === maxRetries - 1) {
        console.error('❌ [ProfileFetch] All retry attempts exhausted');
        return null;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }

  return null;
}

/**
 * Store profile data in sessionStorage
 * @param profile - Profile data to store
 */
export function storeProfileData(profile: ProfileData): void {
  try {
    sessionStorage.setItem('cortexia_user_type', profile.accountType);
    sessionStorage.setItem('cortexia_user_data', JSON.stringify(profile));
    console.log('✅ [ProfileFetch] Stored profile in sessionStorage');
  } catch (error) {
    console.error('❌ [ProfileFetch] Failed to store profile:', error);
  }
}

/**
 * Load profile data from sessionStorage
 * @returns Profile data or null if not found
 */
export function loadStoredProfile(): ProfileData | null {
  try {
    const storedData = sessionStorage.getItem('cortexia_user_data');
    if (!storedData) {
      return null;
    }

    const profile = JSON.parse(storedData);
    
    // Validate profile structure
    if (!profile.accountType || !profile.userId) {
      console.warn('⚠️ [ProfileFetch] Invalid stored profile structure');
      return null;
    }

    console.log('✅ [ProfileFetch] Loaded profile from sessionStorage:', profile.accountType);
    return profile;
  } catch (error) {
    console.error('❌ [ProfileFetch] Failed to load stored profile:', error);
    return null;
  }
}

/**
 * Clear stored profile data
 */
export function clearStoredProfile(): void {
  try {
    sessionStorage.removeItem('cortexia_user_data');
    sessionStorage.removeItem('cortexia_user_type');
    console.log('✅ [ProfileFetch] Cleared stored profile');
  } catch (error) {
    console.error('❌ [ProfileFetch] Failed to clear stored profile:', error);
  }
}
