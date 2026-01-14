/**
 * Auth0 Configuration for Cortexia Creation Hub V3
 * Direct Auth0 integration (not via Supabase)
 */

// ✅ Fix: Safely access import.meta.env (only available in browser)
const getEnvVar = (key: string, fallback: string = '') => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || fallback;
  }
  return fallback;
};

export const auth0Config = {
  // Auth0 Domain (replace with your tenant)
  domain: getEnvVar('VITE_AUTH0_DOMAIN', 'dev-3ipjnnnncplwcx0t.us.auth0.com'),
  
  // Auth0 Client ID
  clientId: getEnvVar('VITE_AUTH0_CLIENT_ID', 'uVQFFOIBOQCGGHHDPNzROnAHK2nGXFsr'),
  
  // ✅ CRITICAL: Use the deployed site URL for callback
  redirectUri: typeof window !== 'undefined' 
    ? `${window.location.origin}/callback`
    : 'https://cortexia.figma.site/callback',
  
  // Auth0 Audience (optional - for API access)
  audience: getEnvVar('VITE_AUTH0_AUDIENCE'),
  
  // Scopes
  scope: 'openid profile email',
  
  // ✅ CRITICAL: Use 'token id_token' for implicit flow (no backend needed)
  responseType: 'token id_token',
  
  // Connection types
  connections: {
    google: 'google-oauth2',
    apple: 'apple',
    github: 'github',
    microsoft: 'windowslive',
  }
};

// ✅ Export with uppercase alias for consistency
export const AUTH0_CONFIG = auth0Config;

export const isAuth0Configured = () => {
  return (
    auth0Config.domain !== 'YOUR_AUTH0_DOMAIN.auth0.com' &&
    auth0Config.clientId !== 'YOUR_AUTH0_CLIENT_ID' &&
    auth0Config.domain.includes('auth0.com') &&
    auth0Config.clientId.length > 20
  );
};