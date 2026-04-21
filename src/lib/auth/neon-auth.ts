/**
 * NEON AUTH INTEGRATION
 * Primary authentication client for Cortexia
 * Uses better-auth client with Neon Auth server
 */

import { createAuthClient } from 'better-auth/client';

const NEON_AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL || '';

const authClient = NEON_AUTH_URL ? createAuthClient({
  baseURL: NEON_AUTH_URL,
}) : null;

const SESSION_KEY = 'neon_auth_session';
const USERS_KEY = 'neon_auth_users';

export interface NeonAuthUser {
  id: string;
  email: string;
  name?: string;
  type: 'individual' | 'enterprise' | 'developer';
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt?: string;
  
  companyLogo?: string | null;
  brandColors?: string[];
  companyName?: string;
  
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    credits: number;
  };
}

export interface AuthSession {
  user: NeonAuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

function convertToNeonUser(user: BetterAuthUser): NeonAuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name || undefined,
    type: 'individual',
    onboardingComplete: false,
    createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
  };
}

function convertSessionToAuthSession(
  session: { session: { accessToken: string; expiresAt: Date; refreshToken?: string } | null; user: BetterAuthUser | null }
): AuthSession {
  return {
    user: session.user ? convertToNeonUser(session.user) : null,
    accessToken: session.session?.accessToken || null,
    refreshToken: session.session?.refreshToken || null,
    expiresAt: session.session?.expiresAt?.getTime() || null,
  };
}

const getStoredUsers = (): NeonAuthUser[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveUser = (user: NeonAuthUser) => {
  if (typeof window === 'undefined') return;
  const users = getStoredUsers();
  const existingIndex = users.findIndex(u => u.email === user.email);
  
  if (existingIndex !== -1) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

function storeSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    const session: AuthSession = JSON.parse(stored);
    
    if (session.expiresAt && Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export async function neonSignUp(
  email: string,
  password: string,
  type: 'individual' | 'enterprise' | 'developer' = 'individual',
  metadata?: { name?: string; companyName?: string }
): Promise<{ success: boolean; user?: NeonAuthUser; session?: AuthSession; error?: string }> {
  if (!authClient) {
    return { success: false, error: 'Auth not configured' };
  }

  try {
    const result = await authClient.signUp.email({
      email,
      password,
      name: metadata?.name || email.split('@')[0],
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    // Create user in users table with credits (if API available)
    try {
      await fetch(`${window.location.origin}/api/auth/signup-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: metadata?.name || email.split('@')[0], type }),
      });
    } catch (e) {
      console.warn('[NeonAuth] Failed to sync user to DB:', e);
    }

    const sessionResult = await authClient.getSession();
    
    if (sessionResult.data?.session) {
      const authSession = convertSessionToAuthSession(sessionResult.data.session);
      storeSession(authSession);
      
      const neonUser = convertToNeonUser(sessionResult.data.session.user);
      saveUser(neonUser);

      return {
        success: true,
        user: neonUser,
        session: authSession,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Signup failed',
    };
  }
}

export async function neonSignIn(
  email: string,
  password: string
): Promise<{ success: boolean; user?: NeonAuthUser; session?: AuthSession; error?: string }> {
  if (!authClient) {
    return { success: false, error: 'Auth not configured' };
  }

  try {
    const result = await authClient.signIn.email({
      email,
      password,
    });

    if (result.error) {
      const errorMessage = result.error.message.toLowerCase();
      if (errorMessage.includes('invalid') || errorMessage.includes('incorrect')) {
        return { success: false, error: 'Identifiants invalides' };
      }
      return { success: false, error: result.error.message };
    }

    const sessionResult = await authClient.getSession();
    
    if (sessionResult.data?.session) {
      const authSession = convertSessionToAuthSession(sessionResult.data.session);
      storeSession(authSession);
      
      const neonUser = convertToNeonUser(sessionResult.data.session.user);

      console.log('[NeonAuth] Signed in successfully:', neonUser.email);

      return {
        success: true,
        user: neonUser,
        session: authSession,
      };
    }

    return { success: false, error: 'Failed to get session' };
  } catch (error) {
    console.error('[NeonAuth] Sign in error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la connexion',
    };
  }
}

export async function neonSignOut(): Promise<void> {
  if (authClient) {
    try {
      (authClient.adapter as { signOut: () => Promise<{ error?: { message: string } }> }).signOut();
    } catch (error) {
      console.error('[NeonAuth] Signout error:', error);
    }
  }

  clearSession();
  sessionStorage.removeItem('cortexia_user_type');
  sessionStorage.removeItem('cortexia_pending_user_type');
  
  console.log('[NeonAuth] Signed out');
}

export async function getCurrentUser(): Promise<NeonAuthUser | null> {
  if (!authClient) return null;

  try {
    const adapter = authClient.adapter as {
      getSession: () => Promise<{ data?: { session: { user: BetterAuthUser | null } } }>;
    };

    const result = await adapter.getSession();
    
    if (result.data?.session?.user) {
      return convertToNeonUser(result.data.session.user);
    }
    
    return null;
  } catch (error) {
    console.error('[NeonAuth] Get current user error:', error);
    return null;
  }
}

export function getUser(): { user: NeonAuthUser | null; accessToken: string | null } {
  const session = getSession();
  
  if (session?.user) {
    return {
      user: session.user,
      accessToken: session.accessToken,
    };
  }
  
  return { user: null, accessToken: null };
}

export function restoreSession(): { user: NeonAuthUser | null; accessToken: string | null } {
  if (typeof window === 'undefined') return { user: null, accessToken: null };
  
  // Check localStorage first (new format from auth.ts)
  const storedUser = localStorage.getItem('cortexia_user');
  console.log('[NeonAuth] restoreSession called, storedUser exists:', !!storedUser);
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      return {
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          type: userData.type || 'individual',
          onboardingComplete: userData.onboardingComplete || false,
          createdAt: userData.createdAt,
        },
        accessToken: 'neon-auth',
      };
    } catch (e) {
      console.error('[NeonAuth] restoreSession parse error:', e);
      // Ignore parse error
    }
  }
  
  // Check old session format
  const session = getSession();
  if (session?.user) {
    return {
      user: session.user,
      accessToken: session.accessToken,
    };
  }
  
  return { user: null, accessToken: null };
}

export async function updateProfile(
  updates: Partial<NeonAuthUser>
): Promise<{ success: boolean; user?: NeonAuthUser; error?: string }> {
  if (!authClient) {
    return { success: false, error: 'Auth not configured' };
  }

  try {
    const session = getSession();
    if (!session?.accessToken) {
      return { success: false, error: 'Not authenticated' };
    }

    const adapter = authClient.adapter as {
      updateUser: (options: Record<string, unknown>) => Promise<{ error?: { message: string }; data?: BetterAuthUser }>;
    };

    const result = await adapter.updateUser({
      ...updates,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    const updatedUser = convertToNeonUser(result.data!);
    const newSession: AuthSession = {
      ...session,
      user: updatedUser,
    };
    storeSession(newSession);

    return { success: true, user: updatedUser };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Profile update failed',
    };
  }
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  if (!authClient) {
    return { success: false, error: 'Auth not configured' };
  }

  try {
    const adapter = authClient.adapter as {
      sendPasswordResetEmail: (options: { email: string }) => Promise<{ error?: { message: string } }>;
    };

    const result = await adapter.sendPasswordResetEmail({
      email,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Password reset request failed',
    };
  }
}

export function canAccessRoute(route: string, userType: 'individual' | 'enterprise' | 'developer' | null): boolean {
  const allowedRoutes: Record<string, string[]> = {
    individual: ['feed', 'discovery', 'create', 'create-v4', 'profile', 'messages', 'new-message', 'wallet', 'creator-dashboard', 'settings', 'coconut-v14', 'coconut-campaign', 'coconut-v14-cocoboard'],
    enterprise: ['coconut-v14', 'coconut-campaign', 'coconut-v14-cocoboard', 'settings'],
    developer: ['coconut-v14', 'coconut-campaign', 'coconut-v14-cocoboard', 'settings'],
  };

  if (['landing', 'login', 'signup-individual', 'signup-enterprise', 'signup-developer', 'feed', 'discovery', 'onboarding', 'auth-callback'].includes(route)) {
    return true;
  }

  if (!userType) return false;
  
  return allowedRoutes[userType]?.includes(route) || false;
}

export function initNeonAuth() {
  if (!NEON_AUTH_URL) {
    console.warn('[NeonAuth] VITE_NEON_AUTH_URL not configured');
  } else if (authClient) {
    console.log('[NeonAuth] Initialized with:', NEON_AUTH_URL);
  }
}

export default {
  initNeonAuth,
  signUp: neonSignUp,
  signIn: neonSignIn,
  signOut: neonSignOut,
  getSession,
  getUser,
  isAuthenticated,
  getCurrentUser,
  restoreSession,
  updateProfile,
  requestPasswordReset,
  canAccessRoute,
};