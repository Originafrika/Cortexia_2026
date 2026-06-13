/**
 * NEON AUTH CLIENT
 * Authentication via Neon Auth (Better Auth)
 * Docs: https://neon.com/docs/auth/overview
 */

import { createAuthClient } from '@neondatabase/auth';

const NEON_AUTH_URL =
  import.meta.env.VITE_NEON_AUTH_URL ||
  import.meta.env.NEXT_PUBLIC_NEON_AUTH_URL;

if (!NEON_AUTH_URL) {
  console.error('❌ [NeonAuth] Missing VITE_NEON_AUTH_URL or NEXT_PUBLIC_NEON_AUTH_URL environment variable');
}

export const auth = createAuthClient(NEON_AUTH_URL || '');

console.log('[NeonAuth] Initialized:', NEON_AUTH_URL);

const API_BASE = '';

/**
 * Synchronize Neon Auth user with local Neon PostgreSQL database
 */
async function syncUserToLocalDb(neonUserId: string, email: string, name: string, type: string) {
  try {
    const response = await fetch(`${API_BASE}/api/auth/sync-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ neonUserId, email, name, type }),
    });
    const data = await response.json();
    if (data.success) {
      console.log('[NeonAuth] ✅ User synced to local DB:', data.user?.id);
      return data.user;
    } else {
      console.error('[NeonAuth] ❌ User sync failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('[NeonAuth] ❌ User sync error:', error);
    return null;
  }
}

/**
 * Sign up with email/password
 */
export const neonSignUp = async (
  email: string,
  password: string,
  type: 'individual' | 'enterprise' | 'developer' = 'individual',
  metadata?: { name?: string; companyName?: string }
) => {
  try {
    const result = await auth.signUp.email({
      email,
      password,
      name: metadata?.name || email.split('@')[0],
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    // Get the real user ID from Neon Auth
    const sessionResult = await auth.getSession();
    const neonUserId = sessionResult.data?.session?.user?.id || `neon-${Date.now()}`;
    const userName = metadata?.name || email.split('@')[0];

    // Sync user to local DB
    const localUser = await syncUserToLocalDb(neonUserId, email, userName, type);

    const userData = {
      id: localUser?.id || neonUserId,
      email,
      name: userName,
      type,
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
      premiumBalance: 0,
      freeBalance: 25,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('cortexia_user', JSON.stringify(userData));
      localStorage.setItem('cortexia_session', 'neon-auth-signup');
      localStorage.setItem('cortexia_user_id', userData.id);
      sessionStorage.setItem('cortexia_user_type', userData.type);
    }

    console.log('[NeonAuth] ✅ Signup successful:', email, 'local ID:', userData.id);

    return { success: true, user: userData };
  } catch (error) {
    console.error('[NeonAuth] Signup error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Signup failed' };
  }
};

/**
 * Sign in with email/password
 */
export const neonSignIn = async (email: string, password: string) => {
  try {
    const result = await auth.signIn.email({ email, password });

    if (result.error) {
      const msg = result.error.message.toLowerCase();
      if (msg.includes('invalid') || msg.includes('incorrect')) {
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }
      return { success: false, error: result.error.message };
    }

    // Get the real user ID from Neon Auth
    const sessionResult = await auth.getSession();
    const neonUserId = sessionResult.data?.session?.user?.id || `neon-${Date.now()}`;
    const userName = email.split('@')[0];

    // Sync user to local DB (or get existing)
    const localUser = await syncUserToLocalDb(neonUserId, email, userName, 'individual');

    const userData = {
      id: localUser?.id || neonUserId,
      email,
      name: userName,
      type: (localUser?.type || 'individual') as 'individual' | 'enterprise' | 'developer',
      onboardingComplete: true,
      createdAt: localUser?.createdAt || new Date().toISOString(),
      premiumBalance: localUser?.premiumBalance || 0,
      freeBalance: localUser?.freeBalance || 25,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('cortexia_user', JSON.stringify(userData));
      localStorage.setItem('cortexia_session', 'neon-auth');
      localStorage.setItem('cortexia_user_id', userData.id);
      sessionStorage.setItem('cortexia_user_type', userData.type);
    }

    console.log('[NeonAuth] ✅ Signin successful:', email, 'local ID:', userData.id);

    return { success: true, user: userData };
  } catch (error) {
    console.error('[NeonAuth] Signin error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
  }
};

/**
 * Restore session from localStorage or Neon Auth
 */
export function restoreSession() {
  if (typeof window === 'undefined') return { user: null, accessToken: null };

  const storedUser = localStorage.getItem('cortexia_user');
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      return {
        user: userData,
        accessToken: 'neon-auth',
      };
    } catch (e) {
      console.error('[NeonAuth] restoreSession parse error:', e);
    }
  }

  return { user: null, accessToken: null };
}

/**
 * Sign out
 */
export const neonSignOut = async () => {
  try {
    await auth.signOut();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cortexia_user');
      localStorage.removeItem('cortexia_session');
      localStorage.removeItem('cortexia_user_id');
      sessionStorage.removeItem('cortexia_user_type');
    }
  } catch (e) {
    console.error('[NeonAuth] Sign out error:', e);
  }
};

/**
 * OAuth Sign-In
 */
export const signInWithGoogle = () => auth.signIn.social({
  provider: 'google',
  callbackURL: `${API_BASE}/api/auth/callback`,
  newUserCallbackURL: `${API_BASE}/onboarding`
});
export const signInWithGitHub = () => auth.signIn.social({
  provider: 'github',
  callbackURL: `${API_BASE}/api/auth/callback`,
  newUserCallbackURL: `${API_BASE}/onboarding`
});
export const signInWithVercel = () => auth.signIn.social({
  provider: 'vercel',
  callbackURL: `${API_BASE}/api/auth/callback`,
  newUserCallbackURL: `${API_BASE}/onboarding`
});

export default auth;
