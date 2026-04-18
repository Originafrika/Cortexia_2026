/**
 * NEON AUTH INTEGRATION
 * Using Neon Auth (Beta) for authentication
 * Documentation: https://neon.tech/docs/guides/neon-auth
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = typeof window !== 'undefined'
  ? (import.meta as any).env?.VITE_NEON_DATABASE_URL
  : '';

export interface NeonAuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: NeonAuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

// Initialize Neon client
const sql = neon(DATABASE_URL || '');

/**
 * Initialize Neon Auth
 * This should be called once when the app starts
 */
export async function initNeonAuth(): Promise<boolean> {
  if (!DATABASE_URL) {
    console.error('Neon Auth: DATABASE_URL not configured');
    return false;
  }

  try {
    // Test connection
    const result = await sql`SELECT 1 as connected`;
    console.log('Neon Auth: Connected successfully', result);
    return true;
  } catch (error) {
    console.error('Neon Auth: Connection failed', error);
    return false;
  }
}

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: { name?: string; avatarUrl?: string }
): Promise<{ success: boolean; user?: NeonAuthUser; error?: string }> {
  try {
    // Note: In production, this should be handled server-side
    // This is a simplified client-side version for demonstration
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, metadata }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const user = await response.json();
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Signup failed',
    };
  }
}

/**
 * Sign in existing user
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const session = await response.json();
    
    // Store session
    storeSession(session);
    
    return { success: true, session };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Signin failed',
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  const session = getSession();
  
  if (session?.accessToken) {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });
    } catch (error) {
      console.error('Signout error:', error);
    }
  }

  // Clear local storage
  localStorage.removeItem('neon_auth_session');
}

/**
 * Get current session
 */
export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('neon_auth_session');
  if (!stored) return null;

  try {
    const session: AuthSession = JSON.parse(stored);
    
    // Check if expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      localStorage.removeItem('neon_auth_session');
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<NeonAuthUser | null> {
  const session = getSession();
  
  if (!session?.accessToken) return null;

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, clear session
        localStorage.removeItem('neon_auth_session');
      }
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(): Promise<boolean> {
  const session = getSession();
  
  if (!session?.refreshToken) return false;

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });

    if (!response.ok) {
      localStorage.removeItem('neon_auth_session');
      return false;
    }

    const newSession = await response.json();
    storeSession(newSession);
    
    return true;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Password reset request failed',
    };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  updates: Partial<Pick<NeonAuthUser, 'name' | 'avatarUrl'>>
): Promise<{ success: boolean; user?: NeonAuthUser; error?: string }> {
  const session = getSession();
  
  if (!session?.accessToken) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const response = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const user = await response.json();
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Profile update failed',
    };
  }
}

/**
 * Link OAuth provider (Google, GitHub, etc.)
 */
export async function linkOAuthProvider(provider: 'google' | 'github' | 'apple'): Promise<void> {
  const session = getSession();
  
  if (!session?.accessToken) {
    throw new Error('Not authenticated');
  }

  // Redirect to OAuth provider
  const response = await fetch(`/api/auth/link/${provider}`, {
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to initiate OAuth linking');
  }

  const { url } = await response.json();
  window.location.href = url;
}

// Helper function to store session
function storeSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('neon_auth_session', JSON.stringify(session));
}

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

// Helper function to require authentication
export async function requireAuth(): Promise<NeonAuthUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}
