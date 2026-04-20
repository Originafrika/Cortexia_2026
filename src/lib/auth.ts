/**
 * NEON AUTH CLIENT
 * Authentication via Neon Auth (Better Auth)
 * Docs: https://neon.com/docs/auth/overview
 */

import { createAuthClient } from '@neondatabase/auth';

const NEON_AUTH_URL = 'https://ep-cool-meadow-an2f2vge.neonauth.c-6.us-east-1.aws.neon.tech/neondb/auth';

export const auth = createAuthClient(NEON_AUTH_URL);

console.log('[NeonAuth] Initialized:', NEON_AUTH_URL);

const API_BASE = typeof window !== 'undefined' 
  ? window.location.origin 
  : 'http://localhost:5173';

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

// ✅ Sign Up with email/password
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
      premiumBalance: 0, // ✅ FREE TIER: No paid credits for new users
      freeBalance: 25,
    };
    
    localStorage.setItem('cortexia_user', JSON.stringify(userData));
    localStorage.setItem('cortexia_session', 'neon-auth-signup');
    localStorage.setItem('cortexia_user_id', userData.id);
    
    console.log('[NeonAuth] ✅ Signup successful:', email, 'local ID:', userData.id);
    
    return { success: true, user: userData };
  } catch (error) {
    console.error('[NeonAuth] Signup error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Signup failed' };
  }
};

// ✅ Sign In with email/password
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
      type: localUser?.type || 'individual' as const,
      onboardingComplete: true,
      createdAt: localUser?.createdAt || new Date().toISOString(),
      premiumBalance: localUser?.premiumBalance || 0,
      freeBalance: localUser?.freeBalance || 25,
    };
    
    localStorage.setItem('cortexia_user', JSON.stringify(userData));
    localStorage.setItem('cortexia_session', 'neon-auth');
    localStorage.setItem('cortexia_user_id', userData.id);
    
    console.log('[NeonAuth] ✅ Signin successful:', email, 'local ID:', userData.id);
    
    return { success: true, user: userData };
  } catch (error) {
    console.error('[NeonAuth] Signin error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
  }
};

// ✅ Delete account (self-delete)
export const deleteAccount = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE}/api/auth/delete-account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.removeItem('cortexia_user');
      localStorage.removeItem('cortexia_session');
      localStorage.removeItem('cortexia_user_id');
      sessionStorage.clear();
      
      console.log('[NeonAuth] ✅ Account deleted');
      return { success: true };
    } else {
      console.error('[NeonAuth] ❌ Delete failed:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('[NeonAuth] Delete account error:', error);
    return { success: false, error: 'Failed to delete account' };
  }
};

// ✅ Sign Out
export const neonSignOut = async () => {
  try {
    await auth.signOut();
    localStorage.removeItem('cortexia_user');
    localStorage.removeItem('cortexia_session');
  } catch (e) {
    console.error('[NeonAuth] Sign out error:', e);
  }
};

// ✅ OAuth Sign-In
export const signInWithGoogle = () => auth.signIn.social({ 
  provider: 'google', 
  callbackURL: `${API_BASE}/api/auth/callback` 
});
export const signInWithGitHub = () => auth.signIn.social({ 
  provider: 'github', 
  callbackURL: `${API_BASE}/api/auth/callback` 
});
export const signInWithVercel = () => auth.signIn.social({ 
  provider: 'vercel', 
  callbackURL: `${API_BASE}/api/auth/callback` 
});

export default auth;