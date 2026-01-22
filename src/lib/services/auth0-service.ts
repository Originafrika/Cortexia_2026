/**
 * Auth Service - Handles authentication via Supabase
 * Uses Supabase's native OAuth integration for Google, Apple, GitHub
 */

import { createClient } from '@supabase/supabase-js';
import type { UserType } from '../contexts/AuthContext';

// ✅ Import from supabase info
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

// ✅ SINGLETON: Create single Supabase client instance
// This prevents "Multiple GoTrueClient instances" warning
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ============================================
// SUPABASE NATIVE OAUTH (Google, Apple, GitHub)
// ============================================

type SocialProvider = 'google' | 'apple' | 'github';

interface SocialLoginOptions {
  provider: SocialProvider;
  userType?: UserType;
  redirectTo?: string;
}

/**
 * Sign in with social provider using Supabase native OAuth
 */
export async function signInWithSocial(options: SocialLoginOptions) {
  try {
    const { provider, userType, redirectTo } = options;
    
    console.log('[AuthService] Initiating social login:', provider);
    
    // Store user type for after callback
    if (userType) {
      sessionStorage.setItem('cortexia_pending_user_type', userType);
    }
    
    // ✅ FIX: Redirect to /callback explicitly
    const callbackUrl = redirectTo || `${window.location.origin}/callback`;
    
    // Supabase native OAuth - simple and works out of the box!
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          // Pass user type as custom param
          user_type: userType || 'individual'
        }
      }
    });
    
    if (error) {
      console.error('[AuthService] OAuth error:', error);
      throw error;
    }
    
    console.log('[AuthService] OAuth redirect initiated to:', callbackUrl);
    return { success: true, data };
  } catch (error: any) {
    console.error('[AuthService] Sign in error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle OAuth callback and extract user data
 */
export async function handleAuth0Callback() {
  try {
    console.log('[AuthService] Handling OAuth callback...');
    
    // Get the current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[AuthService] Session error:', error);
      throw error;
    }
    
    if (!session) {
      console.warn('[AuthService] No session found');
      return { success: false, error: 'No session found' };
    }
    
    console.log('[AuthService] Session found:', session);
    
    // Extract user data from session
    const { user } = session;
    
    // Get user type from sessionStorage or default to individual
    const userType = (sessionStorage.getItem('cortexia_pending_user_type') || 'individual') as UserType;
    sessionStorage.removeItem('cortexia_pending_user_type');
    
    const userData = {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
      type: userType,
      onboardingComplete: false,
      createdAt: user.created_at,
      provider: 'auth0' as const, // Keep the same naming for compatibility
      auth0Id: user.id,
    };
    
    console.log('[AuthService] User data extracted:', userData);
    
    return {
      success: true,
      user: userData,
      session
    };
  } catch (error: any) {
    console.error('[AuthService] Callback error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sign out
 */
export async function signOutAuth0() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear session storage
    sessionStorage.removeItem('cortexia_pending_user_type');
    sessionStorage.removeItem('cortexia_user_type');
    
    return { success: true };
  } catch (error: any) {
    console.error('[AuthService] Sign out error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update user metadata
 */
export async function updateAuth0UserMetadata(metadata: Record<string, any>) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata
    });
    
    if (error) throw error;
    
    return { success: true, user: data.user };
  } catch (error: any) {
    console.error('[AuthService] Update metadata error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get current session
 */
export async function getAuth0Session() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    return { success: true, session };
  } catch (error: any) {
    console.error('[AuthService] Get session error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Listen to auth state changes
 */
export function onAuth0StateChange(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}