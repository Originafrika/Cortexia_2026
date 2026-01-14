/**
 * Auth0 Integration with PKCE (Authorization Code Flow)
 * Modern and secure - recommended by Auth0 for SPAs
 */

import { supabase } from './auth0-service';
import type { User, UserType } from '../contexts/AuthContext';

// Auth0 Configuration
const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  return defaultValue;
};

const AUTH0_DOMAIN = getEnvVar('VITE_AUTH0_DOMAIN', 'dev-3ipjnnnncplwcx0t.us.auth0.com');
const AUTH0_CLIENT_ID = getEnvVar('VITE_AUTH0_CLIENT_ID', 'uVQFFOIBOQCGGHHDPNzROnAHK2nGXFsr');
const REDIRECT_URI = `${window.location.origin}/callback`;

// ============================================================================
// PKCE UTILITIES
// ============================================================================

/**
 * Generate random string for code_verifier
 */
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  
  return result;
}

/**
 * Base64 URL encode
 */
function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate code_challenge from code_verifier
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(hash);
}

// ============================================================================
// AUTH0 LOGIN WITH PKCE
// ============================================================================

/**
 * Initiate Auth0 login with PKCE
 */
export async function loginWithAuth0PKCE(
  provider: 'google-oauth2' | 'apple' | 'github',
  userType: UserType
) {
  try {
    console.log('[Auth0 PKCE] Initiating login with:', provider, 'userType:', userType);
    
    // Generate PKCE parameters
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // Store code_verifier for token exchange
    sessionStorage.setItem('cortexia_code_verifier', codeVerifier);
    sessionStorage.setItem('cortexia_pending_user_type', userType);
    sessionStorage.setItem('cortexia_auth_provider', 'auth0');
    
    // Build Auth0 authorize URL with PKCE
    const state = JSON.stringify({ userType, nonce: Math.random().toString(36) });
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: AUTH0_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'openid profile email',
      connection: provider,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    
    const authorizeUrl = `https://${AUTH0_DOMAIN}/authorize?${params.toString()}`;
    
    console.log('[Auth0 PKCE] Redirecting to:', authorizeUrl);
    console.log('[Auth0 PKCE] Code challenge generated:', codeChallenge.substring(0, 20) + '...');
    
    // Redirect to Auth0
    window.location.href = authorizeUrl;
    
  } catch (error) {
    console.error('[Auth0 PKCE] Login error:', error);
    throw error;
  }
}

// ============================================================================
// AUTH0 CALLBACK HANDLING
// ============================================================================

/**
 * Parse Auth0 callback query params (?code=...&state=...)
 */
export function parseAuth0Callback(): {
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
} {
  const params = new URLSearchParams(window.location.search);
  
  console.log('[Auth0 PKCE] Callback URL:', window.location.href);
  console.log('[Auth0 PKCE] Parsed params:', {
    code: params.get('code') ? 'present' : 'missing',
    state: params.get('state') ? 'present' : 'missing',
    error: params.get('error') || 'none',
  });
  
  return {
    code: params.get('code') || undefined,
    state: params.get('state') || undefined,
    error: params.get('error') || undefined,
    errorDescription: params.get('error_description') || undefined,
  };
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<{
  accessToken: string;
  idToken: string;
}> {
  console.log('[Auth0 PKCE] Exchanging code for tokens...');
  
  const tokenUrl = `https://${AUTH0_DOMAIN}/oauth/token`;
  
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: AUTH0_CLIENT_ID,
    code: code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error('[Auth0 PKCE] Token exchange error:', errorData);
    throw new Error(errorData.error_description || 'Token exchange failed');
  }
  
  const tokens = await response.json();
  
  console.log('[Auth0 PKCE] Token exchange successful');
  
  return {
    accessToken: tokens.access_token,
    idToken: tokens.id_token,
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
    console.error('[Auth0 PKCE] JWT decode error:', error);
    return null;
  }
}

/**
 * Handle Auth0 PKCE callback
 */
export async function handleAuth0PKCECallback(): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  try {
    console.log('[Auth0 PKCE] Processing callback...');
    
    // Parse callback params
    const { code, state, error, errorDescription } = parseAuth0Callback();
    
    if (error) {
      console.error('[Auth0 PKCE] Callback error:', error, errorDescription);
      return { success: false, error: errorDescription || error };
    }
    
    if (!code) {
      console.error('[Auth0 PKCE] No authorization code received');
      return { success: false, error: 'No authorization code received' };
    }
    
    // Get code_verifier from sessionStorage
    const codeVerifier = sessionStorage.getItem('cortexia_code_verifier');
    
    if (!codeVerifier) {
      console.error('[Auth0 PKCE] No code_verifier found in session');
      return { success: false, error: 'Invalid session' };
    }
    
    // Exchange code for tokens
    const { accessToken, idToken } = await exchangeCodeForTokens(code, codeVerifier);
    
    // Decode ID token to get user info
    const userInfo = decodeJWT(idToken);
    
    if (!userInfo) {
      return { success: false, error: 'Failed to decode user info' };
    }
    
    console.log('[Auth0 PKCE] User info:', userInfo);
    
    // Extract userType from state or sessionStorage
    let userType: UserType = 'individual';
    
    if (state) {
      try {
        const stateData = JSON.parse(state);
        userType = stateData.userType || 'individual';
      } catch (e) {
        console.warn('[Auth0 PKCE] Failed to parse state:', e);
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
      id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name || userInfo.nickname || userInfo.email?.split('@')[0],
      type: userType,
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
      provider: 'auth0',
      auth0Id: userInfo.sub,
    };
    
    console.log('[Auth0 PKCE] User created:', user);
    
    // Save to localStorage for persistence
    await saveAuth0UserToStorage(user, accessToken);
    
    // Clean up session
    sessionStorage.removeItem('cortexia_code_verifier');
    sessionStorage.removeItem('cortexia_pending_user_type');
    sessionStorage.removeItem('cortexia_auth_provider');
    
    return { success: true, user };
    
  } catch (error: any) {
    console.error('[Auth0 PKCE] Callback processing error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save Auth0 user to localStorage
 */
async function saveAuth0UserToStorage(user: User, accessToken?: string) {
  try {
    const storedUsers = JSON.parse(localStorage.getItem('cortexia_users') || '[]');
    
    const existingIndex = storedUsers.findIndex((u: any) => u.email === user.email);
    
    const storedUser = {
      id: user.id,
      email: user.email,
      password: '',
      name: user.name,
      type: user.type,
      onboardingComplete: user.onboardingComplete,
      createdAt: user.createdAt,
      provider: 'auth0',
      auth0Id: user.auth0Id,
      accessToken,
    };
    
    if (existingIndex !== -1) {
      storedUsers[existingIndex] = storedUser;
    } else {
      storedUsers.push(storedUser);
    }
    
    localStorage.setItem('cortexia_users', JSON.stringify(storedUsers));
    localStorage.setItem('cortexia_session', user.id);
    
    console.log('[Auth0 PKCE] User saved to localStorage');
    
  } catch (error) {
    console.error('[Auth0 PKCE] Failed to save user:', error);
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
    console.log('[Auth0 PKCE] Logging out...');
    
    localStorage.removeItem('cortexia_session');
    sessionStorage.clear();
    
    const logoutUrl = `https://${AUTH0_DOMAIN}/v2/logout?client_id=${AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(window.location.origin)}`;
    
    window.location.href = logoutUrl;
    
  } catch (error) {
    console.error('[Auth0 PKCE] Logout error:', error);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { supabase };
