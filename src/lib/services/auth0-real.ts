/**
 * Auth0 Integration Service (REAL AUTH0 SDK)
 * Handles Google, Apple, GitHub social login via Auth0
 * Email/Password continues to use Supabase
 */

import { supabase } from './auth0-service'; // Keep Supabase for email/password
import type { User, UserType } from '../contexts/AuthContext';

// Auth0 Configuration - Safe access to env variables
const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  return defaultValue;
};

const AUTH0_DOMAIN = getEnvVar('VITE_AUTH0_DOMAIN', 'dev-3ipjnnnncplwcx0t.us.auth0.com');
const AUTH0_CLIENT_ID = getEnvVar('VITE_AUTH0_CLIENT_ID', 'uVQFFOIBOQCGGHHDPNzROnAHK2nGXFsr');
const REDIRECT_URI = `${window.location.origin}/callback`;

export interface Auth0Config {
  domain: string;
  clientId: string;
  redirectUri: string;
}

export const auth0Config: Auth0Config = {
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_CLIENT_ID,
  redirectUri: REDIRECT_URI,
};

// ============================================================================
// AUTH0 UNIVERSAL LOGIN (Redirect-based)
// ============================================================================

/**
 * Initiate Auth0 login with social provider
 * Uses Auth0 Universal Login (redirect-based)
 */
export async function loginWithAuth0Social(
  provider: 'google-oauth2' | 'apple' | 'github',
  userType: UserType
) {
  try {
    console.log('[Auth0] Initiating login with:', provider, 'userType:', userType);
    
    // Store userType for callback
    sessionStorage.setItem('cortexia_pending_user_type', userType);
    sessionStorage.setItem('cortexia_auth_provider', 'auth0');
    
    // Build Auth0 authorize URL
    const params = new URLSearchParams({
      response_type: 'token id_token',
      client_id: AUTH0_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'openid profile email',
      connection: provider,
      state: JSON.stringify({ userType }), // Pass userType in state
      nonce: Math.random().toString(36).substring(7),
    });
    
    const authorizeUrl = `https://${AUTH0_DOMAIN}/authorize?${params.toString()}`;
    
    console.log('[Auth0] Redirecting to:', authorizeUrl);
    
    // Redirect to Auth0
    window.location.href = authorizeUrl;
    
  } catch (error) {
    console.error('[Auth0] Login error:', error);
    throw error;
  }
}

// ============================================================================
// AUTH0 CALLBACK HANDLING
// ============================================================================

/**
 * Parse Auth0 callback hash (#access_token=...&id_token=...)
 */
export function parseAuth0Hash(): {
  accessToken?: string;
  idToken?: string;
  state?: string;
  error?: string;
} {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  
  // ✅ DEBUG: Log full hash
  console.log('[Auth0] Full hash:', window.location.hash);
  console.log('[Auth0] Parsed params:', {
    accessToken: params.get('access_token') ? 'present' : 'missing',
    idToken: params.get('id_token') ? 'present' : 'missing',
    state: params.get('state') ? 'present' : 'missing',
    error: params.get('error') || 'none',
  });
  
  return {
    accessToken: params.get('access_token') || undefined,
    idToken: params.get('id_token') || undefined,
    state: params.get('state') || undefined,
    error: params.get('error') || undefined,
  };
}

/**
 * Decode JWT token (simple base64 decode)
 */
function decodeJWT(token: string): any {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('[Auth0] JWT decode error:', error);
    return null;
  }
}

/**
 * Handle Auth0 callback and extract user info
 */
export async function handleAuth0SocialCallback(): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  try {
    console.log('[Auth0] Processing callback...');
    
    // Parse hash
    const { accessToken, idToken, state, error } = parseAuth0Hash();
    
    if (error) {
      console.error('[Auth0] Callback error:', error);
      return { success: false, error };
    }
    
    if (!idToken) {
      return { success: false, error: 'No ID token received' };
    }
    
    // Decode ID token to get user info
    const userInfo = decodeJWT(idToken);
    
    if (!userInfo) {
      return { success: false, error: 'Failed to decode user info' };
    }
    
    console.log('[Auth0] User info:', userInfo);
    
    // Extract userType from state or sessionStorage
    let userType: UserType = 'individual';
    
    if (state) {
      try {
        const stateData = JSON.parse(state);
        userType = stateData.userType || 'individual';
      } catch (e) {
        console.warn('[Auth0] Failed to parse state:', e);
      }
    }
    
    // Fallback to sessionStorage
    if (!userType || userType === 'individual') {
      const storedType = sessionStorage.getItem('cortexia_pending_user_type');
      if (storedType) {
        userType = storedType as UserType;
      }
    }
    
    // Create User object
    const user: User = {
      id: userInfo.sub, // Auth0 user ID
      email: userInfo.email,
      name: userInfo.name || userInfo.nickname || userInfo.email?.split('@')[0],
      type: userType,
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
      provider: 'auth0',
      auth0Id: userInfo.sub,
    };
    
    console.log('[Auth0] User created:', user);
    
    // Save to Supabase for unified user management
    await saveAuth0UserToSupabase(user, accessToken);
    
    // Clean up
    sessionStorage.removeItem('cortexia_pending_user_type');
    sessionStorage.removeItem('cortexia_auth_provider');
    
    return { success: true, user };
    
  } catch (error: any) {
    console.error('[Auth0] Callback processing error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save Auth0 user to Supabase for unified user management
 * This creates a "link" between Auth0 and our app
 */
async function saveAuth0UserToSupabase(user: User, accessToken?: string) {
  try {
    // Store in localStorage for persistence
    const storedUsers = JSON.parse(localStorage.getItem('cortexia_users') || '[]');
    
    const existingIndex = storedUsers.findIndex((u: any) => u.email === user.email);
    
    const storedUser = {
      id: user.id,
      email: user.email,
      password: '', // No password for Auth0 users
      name: user.name,
      type: user.type,
      onboardingComplete: user.onboardingComplete,
      createdAt: user.createdAt,
      provider: 'auth0',
      auth0Id: user.auth0Id,
      accessToken, // Store for API calls
    };
    
    if (existingIndex !== -1) {
      storedUsers[existingIndex] = storedUser;
    } else {
      storedUsers.push(storedUser);
    }
    
    localStorage.setItem('cortexia_users', JSON.stringify(storedUsers));
    localStorage.setItem('cortexia_session', user.id);
    
    console.log('[Auth0] User saved to localStorage');
    
  } catch (error) {
    console.error('[Auth0] Failed to save user:', error);
  }
}

// ============================================================================
// AUTH0 LOGOUT
// ============================================================================

/**
 * Logout from Auth0
 */
export async function logoutAuth0() {
  try {
    console.log('[Auth0] Logging out...');
    
    // Clear local storage
    localStorage.removeItem('cortexia_session');
    sessionStorage.clear();
    
    // Redirect to Auth0 logout
    const logoutUrl = `https://${AUTH0_DOMAIN}/v2/logout?client_id=${AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(window.location.origin)}`;
    
    window.location.href = logoutUrl;
    
  } catch (error) {
    console.error('[Auth0] Logout error:', error);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { supabase }; // Re-export for email/password