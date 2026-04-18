/**
 * Auth0 Integration using Auth0 SPA SDK
 * Handles PKCE automatically and securely
 */

import { createAuth0Client, Auth0Client } from '@auth0/auth0-spa-js';
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
// AUTH0 CLIENT SINGLETON
// ============================================================================

let auth0Client: Auth0Client | null = null;

/**
 * Get or create Auth0 client
 */
async function getAuth0Client(): Promise<Auth0Client> {
  if (!auth0Client) {
    console.log('[Auth0 SDK] Creating Auth0 client...');
    
    auth0Client = await createAuth0Client({
      domain: AUTH0_DOMAIN,
      clientId: AUTH0_CLIENT_ID,
      authorizationParams: {
        redirect_uri: REDIRECT_URI,
        scope: 'openid profile email',
      },
      cacheLocation: 'localstorage', // ✅ Persist auth state across redirects
      useRefreshTokens: true,
    });
    
    console.log('[Auth0 SDK] Auth0 client created');
  }
  
  return auth0Client;
}

// ============================================================================
// AUTH0 LOGIN
// ============================================================================

/**
 * Initiate Auth0 login with social provider
 */
export async function loginWithAuth0SDK(
  provider: 'google-oauth2' | 'apple' | 'github',
  userType: UserType,
  metadata?: {
    companyData?: any;
    developerData?: any;
    referralCode?: string; // ✅ NEW: Accept referral code
  }
): Promise<void> {
  try {
    console.log('[Auth0 SDK] Initiating login:', { provider, userType, metadata });
    
    // ✅ CRITICAL: Store userType in BOTH sessionStorage AND localStorage
    // Landing uses localStorage, so we need to support both
    sessionStorage.setItem('cortexia_pending_user_type', userType);
    localStorage.setItem('cortexia_selected_user_type', userType);
    
    // ✅ NEW: Store referral code if provided
    if (metadata?.referralCode) {
      sessionStorage.setItem('cortexia_pending_referral_code', metadata.referralCode);
      console.log('[Auth0 SDK] Stored referral code:', metadata.referralCode);
    }
    
    // Store metadata if provided
    if (metadata) {
      sessionStorage.setItem('cortexia_pending_metadata', JSON.stringify(metadata));
    }
    
    // Get Auth0 client
    const client = await getAuth0Client();
    
    // Login with redirect (Auth0 SDK handles PKCE automatically)
    await client.loginWithRedirect({
      authorizationParams: {
        connection: provider,
        redirect_uri: REDIRECT_URI,
        screen_hint: 'signup', // Suggest signup instead of login
      },
    });
    
    console.log('[Auth0 SDK] Redirect initiated');
    
  } catch (error: any) {
    console.error('[Auth0 SDK] Login error:', error);
    throw error;
  }
}

// ============================================================================
// AUTH0 CALLBACK HANDLING
// ============================================================================

/**
 * Handle Auth0 callback after redirect
 */
export async function handleAuth0SDKCallback(): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  try {
    console.log('[Auth0 SDK] Processing callback...');
    console.log('[Auth0 SDK] Callback URL:', window.location.href);
    
    // Get Auth0 client
    const client = await getAuth0Client();
    
    // Handle redirect callback (Auth0 SDK handles code exchange automatically)
    await client.handleRedirectCallback();
    
    console.log('[Auth0 SDK] Redirect callback handled successfully');
    
    // Get authenticated user
    const isAuthenticated = await client.isAuthenticated();
    
    if (!isAuthenticated) {
      console.error('[Auth0 SDK] User not authenticated after callback');
      return { success: false, error: 'Authentication failed' };
    }
    
    // Get user info
    const auth0User = await client.getUser();
    
    if (!auth0User) {
      console.error('[Auth0 SDK] No user info received');
      return { success: false, error: 'No user info received' };
    }
    
    console.log('[Auth0 SDK] User info:', auth0User);
    
    // ✅ CRITICAL: Get userType from sessionStorage OR localStorage
    // Landing uses localStorage, signup pages use both
    let userType: UserType = 'individual';
    const storedTypeSession = sessionStorage.getItem('cortexia_pending_user_type');
    const storedTypeLocal = localStorage.getItem('cortexia_selected_user_type');
    
    if (storedTypeSession) {
      userType = storedTypeSession as UserType;
      console.log('[Auth0 SDK] User type from sessionStorage:', userType);
    } else if (storedTypeLocal) {
      userType = storedTypeLocal as UserType;
      console.log('[Auth0 SDK] User type from localStorage:', userType);
    } else {
      console.warn('[Auth0 SDK] No user type found, defaulting to individual');
    }
    
    // ✅ NEW: Get referral code from sessionStorage
    const referralCode = sessionStorage.getItem('cortexia_pending_referral_code');
    if (referralCode) {
      console.log('[Auth0 SDK] Referral code found:', referralCode);
    }
    
    // Create User object
    const user: User = {
      id: auth0User.sub || '',
      email: auth0User.email || '',
      name: auth0User.name || auth0User.nickname || auth0User.email?.split('@')[0] || '',
      type: userType,
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
      provider: 'auth0',
      auth0Id: auth0User.sub,
      picture: auth0User.picture, // ✅ Add picture for avatar
      referralCode, // ✅ Add referral code
    };
    
    console.log('[Auth0 SDK] User created:', user);
    
    // Get access token
    const accessToken = await client.getTokenSilently();
    
    // Save to localStorage
    await saveAuth0UserToStorage(user, accessToken);
    
    // ✅ FIXED: Clean up ALL pending data from sessionStorage
    sessionStorage.removeItem('cortexia_pending_user_type');
    sessionStorage.removeItem('cortexia_pending_referral_code'); // ✅ Clean up referral code
    sessionStorage.removeItem('cortexia_pending_metadata'); // ✅ Clean up metadata
    sessionStorage.removeItem('cortexia_auth_data');
    localStorage.removeItem('cortexia_selected_user_type'); // ✅ Clean up landing selection
    
    return { success: true, user };
    
  } catch (error: any) {
    console.error('[Auth0 SDK] Callback error:', error);
    
    // Provide more specific error messages
    if (error.error === 'access_denied') {
      return { success: false, error: 'Access denied. Please try again.' };
    }
    
    if (error.error === 'login_required') {
      return { success: false, error: 'Login required. Please try again.' };
    }
    
    return { success: false, error: error.message || 'Authentication failed' };
  }
}

/**
 * Check if there's a pending Auth0 callback
 */
export function hasAuth0Callback(): boolean {
  const search = window.location.search;
  
  // Auth0 SDK callback has ?code= and ?state=
  return search.includes('code=') && search.includes('state=');
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
    
    console.log('[Auth0 SDK] User saved to localStorage');
    
  } catch (error) {
    console.error('[Auth0 SDK] Failed to save user:', error);
  }
}

// ============================================================================
// AUTH0 LOGOUT
// ============================================================================

/**
 * Logout from Auth0
 */
export async function logoutAuth0SDK() {
  try {
    console.log('[Auth0 SDK] Logging out...');
    
    localStorage.removeItem('cortexia_session');
    sessionStorage.clear();
    
    const client = await getAuth0Client();
    
    await client.logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
    
  } catch (error) {
    console.error('[Auth0 SDK] Logout error:', error);
  }
}

// ============================================================================
// CHECK AUTH STATUS
// ============================================================================

/**
 * Check if user is authenticated with Auth0
 */
export async function checkAuth0Authentication(): Promise<User | null> {
  try {
    const client = await getAuth0Client();
    
    const isAuthenticated = await client.isAuthenticated();
    
    if (!isAuthenticated) {
      return null;
    }
    
    const auth0User = await client.getUser();
    
    if (!auth0User) {
      return null;
    }
    
    // Try to get userType from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('cortexia_users') || '[]');
    const storedUser = storedUsers.find((u: any) => u.auth0Id === auth0User.sub);
    
    const user: User = {
      id: auth0User.sub || '',
      email: auth0User.email || '',
      name: auth0User.name || auth0User.nickname || '',
      type: storedUser?.type || 'individual',
      onboardingComplete: storedUser?.onboardingComplete || false,
      createdAt: storedUser?.createdAt || new Date().toISOString(),
      provider: 'auth0',
      auth0Id: auth0User.sub,
    };
    
    return user;
    
  } catch (error) {
    console.error('[Auth0 SDK] Check auth error:', error);
    return null;
  }
}