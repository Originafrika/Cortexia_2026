/**
 * Auth0 Client Service
 * Handles OAuth authentication via Auth0 (Google, Apple, GitHub)
 */

import { createAuth0Client, Auth0Client } from '@auth0/auth0-spa-js';
import { AUTH0_CONFIG } from '../config/auth0';

export type UserType = 'individual' | 'enterprise' | 'developer';

let auth0Client: Auth0Client | null = null;

/**
 * Initialize Auth0 Client
 */
export async function getAuth0Client(): Promise<Auth0Client> {
  if (auth0Client) return auth0Client;

  console.log('🔧 Initializing Auth0 Client v2.0 (appState fix, no redirect_uri)');

  auth0Client = await createAuth0Client({
    domain: AUTH0_CONFIG.domain,
    clientId: AUTH0_CONFIG.clientId,
    authorizationParams: {
      audience: `https://${AUTH0_CONFIG.domain}/api/v2/`,
      scope: 'openid profile email',
    },
    cacheLocation: 'localstorage',
    useRefreshTokens: true,
  });

  return auth0Client;
}

/**
 * Login with Google via Auth0
 * @param userType - Type of user account (individual, enterprise, developer)
 * @param referralCode - Optional referral code from Individual user
 */
export async function loginWithGoogle(userType: UserType, referralCode?: string): Promise<void> {
  const client = await getAuth0Client();

  try {
    console.log('🔑 Starting Google login with userType:', userType);
    
    // ✅ Store referral code in sessionStorage for callback
    if (referralCode) {
      sessionStorage.setItem('cortexia_pending_referral_code', referralCode);
      console.log('📎 Stored referral code for callback:', referralCode);
    }
    
    // 🔄 Use redirect instead of popup (Figma Sites blocks popups with COOP)
    await client.loginWithRedirect({
      authorizationParams: {
        connection: 'google-oauth2',
        // ✅ Don't specify redirect_uri - SDK uses window.location.origin by default
        // This avoids potential mismatches with Auth0 config
      },
      // ✅ Use appState instead of state (state is managed by SDK for CSRF)
      appState: { userType, referralCode }, // ✅ Pass referralCode in appState too
    });

    // This code won't execute because of redirect
    // The callback will be handled in handleRedirectCallback
  } catch (error: any) {
    console.error('Auth0 Google login error:', error);
    throw new Error(error.message || 'Google login failed');
  }
}

/**
 * Login with Apple via Auth0
 * @param userType - Type of user account (individual, enterprise, developer)
 * @param referralCode - Optional referral code from Individual user
 */
export async function loginWithApple(userType: UserType, referralCode?: string): Promise<void> {
  const client = await getAuth0Client();

  try {
    console.log('🔑 Starting Apple login with userType:', userType);
    
    // ✅ Store referral code in sessionStorage for callback
    if (referralCode) {
      sessionStorage.setItem('cortexia_pending_referral_code', referralCode);
      console.log('📎 Stored referral code for callback:', referralCode);
    }

    await client.loginWithRedirect({
      authorizationParams: {
        connection: 'apple',
        // ✅ Don't specify redirect_uri - SDK uses window.location.origin by default
      },
      // ✅ Use appState instead of state (state is managed by SDK for CSRF)
      appState: { userType, referralCode }, // ✅ Pass referralCode in appState too
    });

    // This code won't execute because of redirect
  } catch (error: any) {
    console.error('Auth0 Apple login error:', error);
    throw new Error(error.message || 'Apple login failed');
  }
}

/**
 * Login with GitHub via Auth0
 * @param userType - Type of user account (individual, enterprise, developer)
 * @param referralCode - Optional referral code from Individual user
 */
export async function loginWithGitHub(userType: UserType, referralCode?: string): Promise<void> {
  const client = await getAuth0Client();

  try {
    console.log('🔑 Starting GitHub login with userType:', userType);
    
    // ✅ Store referral code in sessionStorage for callback
    if (referralCode) {
      sessionStorage.setItem('cortexia_pending_referral_code', referralCode);
      console.log('📎 Stored referral code for callback:', referralCode);
    }

    await client.loginWithRedirect({
      authorizationParams: {
        connection: 'github',
        // ✅ Don't specify redirect_uri - SDK uses window.location.origin by default
      },
      // ✅ Use appState instead of state (state is managed by SDK for CSRF)
      appState: { userType, referralCode }, // ✅ Pass referralCode in appState too
    });

    // This code won't execute because of redirect
  } catch (error: any) {
    console.error('Auth0 GitHub login error:', error);
    throw new Error(error.message || 'GitHub login failed');
  }
}

/**
 * Handle OAuth callback after redirect
 * This should be called on the callback page (/auth/callback)
 */
export async function handleAuth0Callback(): Promise<{
  accessToken: string;
  idToken: string;
  userType: UserType;
} | null> {
  try {
    const client = await getAuth0Client();
    
    // Check if we're on a callback URL
    const query = window.location.search;
    if (!query.includes('code=') && !query.includes('error=')) {
      console.log('⚠️ Not a callback URL');
      return null;
    }

    console.log('🔄 Processing Auth0 callback...');

    // Handle the redirect callback
    const result = await client.handleRedirectCallback();
    
    console.log('✅ Auth0 callback successful:', result);

    // Get tokens
    const accessToken = await client.getTokenSilently();
    const idToken = await client.getIdTokenClaims();

    // Extract userType from appState
    const userType = (result.appState?.userType as UserType) || 'individual';

    console.log('✅ Tokens retrieved, userType:', userType);

    // Clean up URL (remove ?code=... and ?state=...)
    window.history.replaceState({}, document.title, window.location.pathname);

    return {
      accessToken,
      idToken: idToken?.__raw || '',
      userType,
    };
  } catch (error: any) {
    console.error('Auth0 callback error:', error);
    
    // 🔧 If "Invalid state" error, clean localStorage and redirect
    if (error.message?.includes('Invalid state') || error.message?.includes('state')) {
      console.warn('⚠️ Invalid state detected, cleaning Auth0 localStorage and redirecting to landing');
      
      // Clean Auth0 keys from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('auth0') || key.includes('@@auth0spajs@@')) {
          localStorage.removeItem(key);
          console.log('🗑️ Removed localStorage key:', key);
        }
      });
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Return null to trigger redirect to landing in Auth0CallbackPage
      throw new Error('Invalid state - localStorage cleaned. Please try logging in again.');
    }
    
    // Clean up URL even on error
    window.history.replaceState({}, document.title, window.location.pathname);
    return null;
  }
}

/**
 * Get current authenticated user
 */
export async function getAuth0User(): Promise<any> {
  const client = await getAuth0Client();
  const isAuthenticated = await client.isAuthenticated();
  
  if (!isAuthenticated) {
    return null;
  }

  return await client.getUser();
}

/**
 * Logout
 */
export async function logoutAuth0(): Promise<void> {
  const client = await getAuth0Client();
  
  await client.logout({
    logoutParams: {
      returnTo: window.location.origin,
    },
  });
}

/**
 * Check if user is authenticated
 */
export async function isAuth0Authenticated(): Promise<boolean> {
  const client = await getAuth0Client();
  return await client.isAuthenticated();
}

/**
 * Get access token
 */
export async function getAuth0AccessToken(): Promise<string | null> {
  try {
    const client = await getAuth0Client();
    const isAuthenticated = await client.isAuthenticated();
    
    if (!isAuthenticated) {
      return null;
    }

    return await client.getTokenSilently();
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}