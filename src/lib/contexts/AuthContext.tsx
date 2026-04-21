/**
 * AuthContext - Complete Authentication System
 * Supports: Individual, Enterprise, Developer accounts
 * Features: Route protection, Read-only mode, Type-based access
 * Auth Methods: Supabase Auth (email/password) + Auth0 (social login)
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, handleAuth0Callback, signOutAuth0, updateAuth0UserMetadata, onAuth0StateChange, getAuth0Session } from '../services/auth0-service';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { preloadCoconutAccess } from '../hooks/useCoconutAccess';
import { 
  neonSignIn, 
  neonSignUp, 
  neonSignOut, 
  getSession as getNeonSession,
  restoreSession,
  getUser,
  type NeonAuthUser 
} from '../auth/neon-auth';

// ============================================
// TYPES
// ============================================

export type UserType = 'individual' | 'enterprise' | 'developer';

export interface User {
  id: string;
  email: string;
  name?: string;
  type: UserType; // ✅ User type for access control
  onboardingComplete: boolean; // ✅ Onboarding status
  createdAt: string;
  
  // ✅ Enterprise branding
  companyLogo?: string | null; // ✅ Company logo URL
  brandColors?: string[]; // ✅ Brand color palette
  companyName?: string; // ✅ Company name
  
  // ✅ Auth provider info
  provider?: 'supabase' | 'auth0'; // ✅ Which auth method was used
  auth0Id?: string; // ✅ Auth0 user ID (if using Auth0)
  picture?: string; // ✅ Profile picture URL (from Auth0)
  referralCode?: string; // ✅ Referral code (from sessionStorage during signup)
  
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    credits: number;
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  userType: UserType | null;
  
  // ✅ NEW: Track if user just signed up (needs onboarding)
  isNewUser: boolean;
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  signUp: (email: string, password: string, type: UserType, name?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => void; // ✅ NEW: Force refresh user from localStorage
  
  // ✅ NEW: Update user from OAuth callback
  updateUserFromCallback: (user: User) => Promise<{ isNewUser: boolean }>;
  
  // ✅ NEW: Update user profile/branding
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: (onboardingData?: { companyLogo?: string | null; brandColors?: string[]; companyName?: string }) => Promise<{ success: boolean; error?: string }>;
  
  // Access control
  canAccessRoute: (route: string) => boolean;
  requiresAuth: (route: string) => boolean;
  refreshUser: () => void;
}

// ============================================
// MOCK USER STORAGE (localStorage) - For Supabase fallback
// ============================================

const STORAGE_KEY = 'cortexia_users';
const SESSION_KEY = 'cortexia_session';

interface StoredUser {
  id: string;
  email: string;
  // ❌ REMOVED: password field (security risk)
  name?: string;
  type: UserType;
  onboardingComplete: boolean;
  createdAt: string;
  
  // ✅ Enterprise branding
  companyLogo?: string | null;
  brandColors?: string[];
  companyName?: string;
  
  // ✅ Provider info
  provider?: 'supabase' | 'auth0';
  auth0Id?: string; // ✅ Auth0 user ID
  accessToken?: string; // ✅ Store access token for API calls
}

const getStoredUsers = (): StoredUser[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveUser = (user: StoredUser) => {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

const findUser = (email: string, password: string): StoredUser | null => {
  // ❌ REMOVED: Password comparison - use Supabase Auth only
  // This function is deprecated but kept for backward compatibility
  console.warn('[AuthContext] findUser is deprecated - use Supabase Auth signIn instead');
  return null;
};

const getLocalSession = (): string | null => {
  return localStorage.getItem(SESSION_KEY);
};

const setSession = (userId: string) => {
  localStorage.setItem(SESSION_KEY, userId);
};

const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  // Also clear Neon Auth session
  if (typeof window !== 'undefined') {
    localStorage.removeItem('neon_auth_session');
    localStorage.removeItem('neon_auth_users');
  }
};

const getUserById = (id: string): StoredUser | null => {
  const users = getStoredUsers();
  return users.find(u => u.id === id) || null;
};

// ✅ NEW: Save/update Auth0 user in localStorage for persistence
const saveOrUpdateAuth0User = (user: User) => {
  const users = getStoredUsers();
  const existingIndex = users.findIndex(u => u.email === user.email);
  
  const storedUser: StoredUser = {
    id: user.id,
    email: user.email,
    // ❌ REMOVED: password field (security risk)
    name: user.name,
    type: user.type,
    onboardingComplete: user.onboardingComplete,
    createdAt: user.createdAt,
    companyLogo: user.companyLogo,
    brandColors: user.brandColors,
    companyName: user.companyName,
    provider: 'auth0'
  };
  
  if (existingIndex !== -1) {
    users[existingIndex] = storedUser;
  } else {
    users.push(storedUser);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

// ============================================
// ROUTE ACCESS CONTROL
// ============================================

// Routes that require authentication
const PROTECTED_ROUTES = [
  'create',
  'create-v4',
  'profile',
  'messages',
  'new-message',
  'wallet',
  'creator-dashboard',
  'settings'
];

// Routes accessible by user type
const TYPE_ROUTES: Record<UserType, string[]> = {
  individual: ['landing', 'feed', 'discovery', 'create', 'create-v4', 'profile', 'messages', 'wallet', 'creator-dashboard', 'settings', 'coconut-v14', 'coconut-campaign', 'coconut-v14-cocoboard'], // ✅ Individual can access Coconut IF they're Creators (checked in CoconutV14App)
  enterprise: ['landing', 'coconut-v14', 'coconut-campaign', 'coconut-v14-cocoboard', 'settings'], // ✅ Enterprise = Coconut ONLY
  developer: ['landing', 'coconut-v14', 'coconut-campaign', 'coconut-v14-cocoboard', 'settings'] // ✅ Developer = API + Coconut
};

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<UserType | null>(null);

  // ✅ Auto-restore session on mount (Neon Auth + localStorage)
  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        // 1. Check for Neon session first (priority)
        const { user, accessToken } = restoreSession();
        
        if (user && accessToken) {
          // Neon session found
          console.log('[AuthContext] ✅ Restored Neon session for:', user.email);
          
          const userData: User = {
            id: user.id,
            email: user.email,
            name: user.name,
            type: user.type,
            onboardingComplete: user.onboardingComplete,
            createdAt: user.createdAt,
            companyLogo: user.companyLogo,
            brandColors: user.brandColors,
            companyName: user.companyName,
            provider: 'supabase',
          };
          
          setUser(userData);
          setIsAuthenticated(true);
          setUserType(userData.type);
          
          console.log('[AuthContext] ✅ Auth initialized successfully (Neon user)');
          return;
        }
        
        // 2. Fallback: Check Supabase session (for OAuth users still using old auth)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!error && session?.user) {
          // Supabase OAuth session found
          const supabaseUser = session.user;
          const metadata = supabaseUser.user_metadata || {};
          
          // ✅ PRODUCTION: Try to load complete profile from sessionStorage first
          const storedProfileData = sessionStorage.getItem('cortexia_user_data');
          let userData: User;
          
          if (storedProfileData) {
            try {
              const profile = JSON.parse(storedProfileData);
              console.log('✅ [AuthContext] Loaded profile from sessionStorage:', profile.accountType);
              
              // ✅ CRITICAL FIX: Fetch user type from backend KV store to ensure consistency
              try {
                const typeResponse = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/users/${supabaseUser.id}/type`,
                  {
                    headers: {
                      'Authorization': `Bearer ${publicAnonKey}`,
                    },
                  }
                );
                
                if (typeResponse.ok) {
                  const typeData = await typeResponse.json();
                  if (typeData.success && typeData.type) {
                    console.log(`✅ [AuthContext] User type from backend: ${typeData.type} (was ${profile.accountType} in sessionStorage)`);
                    profile.accountType = typeData.type; // ✅ Override with backend value
                    profile.onboardingComplete = typeData.onboardingComplete;
                    
                    // ✅ Update sessionStorage to sync
                    sessionStorage.setItem('cortexia_user_data', JSON.stringify(profile));
                    sessionStorage.setItem('cortexia_user_type', typeData.type); // ✅ CRITICAL: Also update cortexia_user_type for AuthFlow
                  }
                }
              } catch (typeErr) {
                console.warn('⚠️ [AuthContext] Failed to fetch user type from backend, using cached value');
              }
              
              userData = {
                id: supabaseUser.id,
                email: profile.email || supabaseUser.email!,
                name: profile.displayName || metadata.full_name || metadata.name || supabaseUser.email?.split('@')[0],
                type: profile.accountType as UserType, // ✅ Use backend accountType
                onboardingComplete: profile.onboardingComplete || metadata.onboarding_complete || false,
                createdAt: profile.createdAt || supabaseUser.created_at,
                companyLogo: metadata.company_logo,
                brandColors: metadata.brand_colors,
                companyName: profile.companyName || metadata.company_name,
                provider: 'auth0', // Keep naming for compatibility
                auth0Id: supabaseUser.id,
                picture: metadata.picture,
                referralCode: profile.referralCode || sessionStorage.getItem('cortexia_referral_code') || undefined
              };
            } catch (err) {
              console.warn('⚠️ [AuthContext] Failed to parse stored profile, falling back to defaults');
              // Fallback to old method
              const storedUserType = sessionStorage.getItem('cortexia_user_type') || 
                                     sessionStorage.getItem('cortexia_pending_user_type') ||
                                     metadata.user_type || 
                                     'individual';
              
              userData = {
                id: supabaseUser.id,
                email: supabaseUser.email!,
                name: metadata.full_name || metadata.name || supabaseUser.email?.split('@')[0],
                type: storedUserType as UserType,
                onboardingComplete: metadata.onboarding_complete || false,
                createdAt: supabaseUser.created_at,
                companyLogo: metadata.company_logo,
                brandColors: metadata.brand_colors,
                companyName: metadata.company_name,
                provider: 'auth0',
                auth0Id: supabaseUser.id,
                picture: metadata.picture,
                referralCode: sessionStorage.getItem('cortexia_referral_code') || undefined
              };
            }
          } else {
            // Get user type from sessionStorage or metadata
            const storedUserType = sessionStorage.getItem('cortexia_user_type') || 
                                   sessionStorage.getItem('cortexia_pending_user_type') ||
                                   metadata.user_type || 
                                   'individual';
            
            userData = {
              id: supabaseUser.id,
              email: supabaseUser.email!,
              name: metadata.full_name || metadata.name || supabaseUser.email?.split('@')[0],
              type: storedUserType as UserType,
              onboardingComplete: metadata.onboarding_complete || false,
              createdAt: supabaseUser.created_at,
              companyLogo: metadata.company_logo,
              brandColors: metadata.brand_colors,
              companyName: metadata.company_name,
              provider: 'auth0',
              auth0Id: supabaseUser.id,
              picture: metadata.picture,
              referralCode: sessionStorage.getItem('cortexia_referral_code') || undefined
            };
          }
          
          if (mounted) {
            setUser(userData);
            saveOrUpdateAuth0User(userData); // Sync to localStorage
            setSession(supabaseUser.id);
            
            // Store user type for future use
            sessionStorage.setItem('cortexia_user_type', userData.type);
          }
        } else {
          // 2. Fallback to localStorage session (for email/password users)
          const sessionUserId = getLocalSession();
          if (sessionUserId) {
            const storedUser = getUserById(sessionUserId);
            if (storedUser) {
              if (mounted) {
                setUser({
                  id: storedUser.id,
                  email: storedUser.email,
                  name: storedUser.name,
                  type: storedUser.type,
                  onboardingComplete: storedUser.onboardingComplete,
                  createdAt: storedUser.createdAt,
                  companyLogo: storedUser.companyLogo,
                  brandColors: storedUser.brandColors,
                  companyName: storedUser.companyName,
                  provider: storedUser.provider || 'supabase'
                });
              }
            } else {
              clearSession();
            }
          }
        }
      } catch (error) {
        console.error('[AuthContext] Init error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initAuth();
    
    // ✅ Listen to Supabase auth state changes
    const { data: authListener } = onAuth0StateChange((session) => {
      if (!mounted) return;
      
      console.log('🔄 [AuthContext] Auth state changed:', session ? 'SESSION EXISTS' : 'NO SESSION', session?.user?.id);
      
      if (session?.user) {
        const supabaseUser = session.user;
        const metadata = supabaseUser.user_metadata || {};
        
        // ✅ CRITICAL FIX: Fetch user type from backend KV store instead of just sessionStorage
        const initUserFromSession = async () => {
          let userType: UserType = 'individual';
          let onboardingComplete = false;
          
          try {
            const typeResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/users/${supabaseUser.id}/type`,
              {
                headers: {
                  'Authorization': `Bearer ${publicAnonKey}`,
                },
              }
            );
            
            if (typeResponse.ok) {
              const typeData = await typeResponse.json();
              if (typeData.success && typeData.type) {
                console.log(`✅ [AuthContext] User type from backend (auth listener): ${typeData.type}`);
                userType = typeData.type as UserType;
                onboardingComplete = typeData.onboardingComplete;
                
                // ✅ Update sessionStorage
                sessionStorage.setItem('cortexia_user_type', userType);
              }
            } else {
              // Fallback to sessionStorage if backend fails
              const storedUserType = sessionStorage.getItem('cortexia_user_type') || 
                                     sessionStorage.getItem('cortexia_pending_user_type') ||
                                     metadata.user_type || 
                                     'individual';
              userType = storedUserType as UserType;
              onboardingComplete = metadata.onboarding_complete || false;
            }
          } catch (err) {
            console.warn('⚠️ [AuthContext] Failed to fetch user type in auth listener, using fallback');
            // Fallback to sessionStorage
            const storedUserType = sessionStorage.getItem('cortexia_user_type') || 
                                   sessionStorage.getItem('cortexia_pending_user_type') ||
                                   metadata.user_type || 
                                   'individual';
            userType = storedUserType as UserType;
            onboardingComplete = metadata.onboarding_complete || false;
          }
          
          const userData: User = {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: metadata.full_name || metadata.name || supabaseUser.email?.split('@')[0],
            type: userType, // ✅ Use backend value
            onboardingComplete: onboardingComplete,
            createdAt: supabaseUser.created_at,
            companyLogo: metadata.company_logo,
            brandColors: metadata.brand_colors,
            companyName: metadata.company_name,
            provider: 'auth0',
            auth0Id: supabaseUser.id,
            picture: metadata.picture,
            referralCode: sessionStorage.getItem('cortexia_referral_code') || undefined
          };
          
          console.log('✅ [AuthContext] Setting user from auth state change:', userData.id, userData.type);
          setUser(userData);
          saveOrUpdateAuth0User(userData);
          setSession(supabaseUser.id);
          
          // Store user type for future use
          sessionStorage.setItem('cortexia_user_type', userData.type);
        };
        
        // ✅ Execute async function
        initUserFromSession();
      }
      // ✅ FIX V3: NEVER auto-clear user from session events
      // OAuth sessions can expire/refresh without meaning the user signed out
      // Only clear user on explicit signOut() call
      // This prevents false logouts from token refresh or session expiry
      else if (!session) {
        console.log('ℹ️ [AuthContext] Session event shows no session, but ignoring - only signOut() can clear user');
      }
    });
    
    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
};
  }, []);

  // ✅ Sign In - Use custom API (same as Express server in local)
  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Signing in with email:', email);
      
      const API_URL = (import.meta as any).env?.VITE_API_URL || '';
      
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error('[AuthContext] Sign in error:', data.error);
        return { success: false, error: data.error || 'Email ou mot de passe incorrect' };
      }

      const user: User = {
        id: data.user?.id || 'user',
        email: data.user?.email || email,
        name: data.user?.name || email.split('@')[0],
        type: data.user?.type || 'individual',
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        provider: 'local',
      };

      if (data.token) {
        localStorage.setItem('cortexia_token', data.token);
      }

      sessionStorage.setItem('cortexia_user_type', user.type);
      sessionStorage.setItem('cortexia_user_id', user.id);
      localStorage.setItem('cortexia_user', JSON.stringify(user));

      console.log('[AuthContext] Sign in successful:', user);
      
      return { success: true, user };
    } catch (error) {
      console.error('[AuthContext] Sign in error:', error);
      return { success: false, error: 'Erreur lors de la connexion' };
    }
  };

  // ✅ Sign Up - Use custom API
  const signUp = async (email: string, password: string, type: UserType, name?: string) => {
    try {
      console.log('[AuthContext] Signing up with email:', email, 'type:', type);
      
      const API_URL = (import.meta as any).env?.VITE_API_URL || '';
      
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error('[AuthContext] Sign up error:', data.error);
        return { 
          success: false, 
          error: data.error || 'Erreur lors de la création du compte' 
        };
      }
      
      const user: User = {
        id: data.userId,
        email: email,
        name: name || email.split('@')[0],
        type: type,
        onboardingComplete: false,
        createdAt: new Date().toISOString(),
        provider: 'local',
      };
      
      sessionStorage.setItem('cortexia_user_type', type);
      sessionStorage.setItem('cortexia_user_id', user.id);
      
      // Set user state
      setUser(user);
      setIsAuthenticated(true);
      setUserType(type);
      setIsNewUser(true); // Mark as new user for onboarding flow
      
      console.log('[AuthContext] Sign up successful:', user.email);
      
      return { success: true, user };
    } catch (error) {
      console.error('[AuthContext] Sign up exception:', error);
      return { success: false, error: 'Erreur lors de la création du compte' };
    }
  };

  // ✅ Sign Out
  const signOut = async () => {
    // ✅ Use Neon Auth for sign out
    await neonSignOut();
    
    // Check if user is Auth0 user - still call signOutAuth0 for OAuth users
    if (user?.provider === 'auth0') {
      await signOutAuth0();
    }
    
    setUser(null);
    setIsAuthenticated(false);
    setUserType(null);
    clearSession();
  };

  // ✅ Force refresh user from localStorage (for after signup/onboarding)
  const refreshUser = () => {
    console.log('[AuthContext] 🔄 Force refreshing user from localStorage...');
    const storedUserStr = localStorage.getItem('cortexia_user');
    if (storedUserStr) {
      try {
        const userData = JSON.parse(storedUserStr);
        console.log('[AuthContext] 🔄 Found user in localStorage:', userData.email);
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          type: userData.type || 'individual',
          onboardingComplete: userData.onboardingComplete || false,
          createdAt: userData.createdAt,
          provider: 'supabase',
        });
        setIsAuthenticated(true);
        setUserType(userData.type || 'individual');
      } catch (e) {
        console.error('[AuthContext] ❌ Failed to parse stored user:', e);
      }
    }
  };

  // ✅ Check if route requires authentication
  const requiresAuth = (route: string): boolean => {
    return PROTECTED_ROUTES.includes(route);
  };

  // ✅ Check if user can access route
  const canAccessRoute = (route: string): boolean => {
    // ✅ CRITICAL: Landing is accessible to everyone (including authenticated users)
    if (route === 'landing') {
      return true;
    }
    
    // Public routes (accessible without auth)
    if (['login', 'signup-individual', 'signup-enterprise', 'signup-developer', 'feed', 'discovery'].includes(route)) {
      return true;
    }
    
    // ✅ CRITICAL: Onboarding and auth-callback are accessible by ALL authenticated users
    if (route === 'onboarding' || route === 'auth-callback') {
      return true;
    }
    
    // ✅ FIX: During loading, allow access to avoid race conditions on mobile
    if (loading) {
      console.log('⏳ [canAccessRoute] Loading in progress, allowing access to:', route);
      return true;
    }
    
    // ✅ NEW: Also check localStorage for Neon/Auth0 users when user context is null
    const hasAuth0User = typeof window !== 'undefined' && !!localStorage.getItem('cortexia_auth0_user');
    const hasNeonUser = typeof window !== 'undefined' && !!localStorage.getItem('cortexia_user');
    const hasAnyUser = user || hasAuth0User || hasNeonUser;
    
    // Protected routes require auth (either from context OR localStorage)
    if (!hasAnyUser) {
      return false;
    }
    
    // Check type-specific access
    // For users in localStorage, use stored type or default to individual
    const userType = user?.type || (hasNeonUser ? 'individual' : null);
    const allowedRoutes = TYPE_ROUTES[userType as keyof typeof TYPE_ROUTES] || [];
    return allowedRoutes.includes(route);
  };

  // ✅ Update user from OAuth callback
  const updateUserFromCallback = async (user: User): Promise<{ isNewUser: boolean }> => {
    try {
      if (!user) {
        return { isNewUser: false };
      }
      
      // ✅ For Auth0 users, just update localStorage (no Supabase session)
      if (user.provider === 'auth0') {
        console.log('[AuthContext] Updating Auth0 user (localStorage only)');
        
        // Update local state
        setUser(user);
        saveOrUpdateAuth0User(user);
        setSession(user.id);
        
        // ✅ NEW: Create user profile in backend if new user
        try {
          console.log('[AuthContext] 🔄 Creating Auth0 user profile in backend...', {
            userId: user.id,
            email: user.email,
            type: user.type,
            provider: user.provider,
          });
          
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/users/create-or-update-auth0`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({
                userId: user.id,
                email: user.email,
                name: user.name,
                userType: user.type,
                auth0Id: user.auth0Id,
                picture: user.picture,
                referralCode: user.referralCode, // ✅ Pass referral code from user object
              }),
            }
          );
          
          console.log('[AuthContext] Backend response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('[AuthContext] ✅ Auth0 user profile created/updated in backend', data);
            
            // ✅ NEW: Update user object with backend data
            const updatedUser: User = {
              ...user,
              // ✅ CRITICAL: Sync userType from backend (in case sessionStorage was cleared)
              type: data.profile?.accountType || user.type,
              onboardingComplete: data.profile?.onboardingComplete ?? user.onboardingComplete,
              // Sync other fields from backend if available
              companyLogo: data.profile?.companyLogo ?? user.companyLogo,
              brandColors: data.profile?.brandColors ?? user.brandColors,
              companyName: data.profile?.companyName ?? user.companyName,
            };
            
            // ✅ Update state with synced user
            setUser(updatedUser);
            saveOrUpdateAuth0User(updatedUser);
            
            // ✅ NEW: Mark user as new if backend says so
            if (data.isNewUser) {
              console.log('[AuthContext] 🎉 New user detected! Will need onboarding.');
              setIsNewUser(true);
              return { isNewUser: true };
            } else {
              console.log('[AuthContext] ✅ Existing user, skip onboarding.');
              setIsNewUser(false);
              return { isNewUser: false };
            }
          } else {
            // ✅ CRITICAL: Log response body for debugging
            const errorText = await response.text();
            console.error('[AuthContext] ❌ Backend returned error:', {
              status: response.status,
              statusText: response.statusText,
              body: errorText,
            });
          }
        } catch (err) {
          console.error('[AuthContext] ❌ CRITICAL: Failed to create Auth0 user profile in backend:', err);
          console.error('[AuthContext] User will NOT be saved in KV store! Provider:', user.provider, 'Email:', user.email);
          // Non-blocking error - user can still continue BUT WARN LOUDLY
        }
        
        return { isNewUser: false };
      }
      
      // ✅ For Supabase users, update via Supabase Auth
      if (user.provider === 'supabase') {
        const result = await updateAuth0UserMetadata(user);
        if (!result.success) {
          console.error('[AuthContext] Failed to update Supabase metadata');
          return { isNewUser: false };
        }
        
        // Update local state
        setUser(user);
        saveOrUpdateAuth0User(user);
        
        return { isNewUser: false };
      }
      
      // ✅ Legacy fallback: update localStorage
      const storedUser = getUserById(user.id);
      if (!storedUser) {
        return { isNewUser: false };
      }
      
      const updatedUser: StoredUser = {
        ...storedUser,
        ...user
      };
      
      const users = getStoredUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        
        setUser({
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          type: updatedUser.type,
          onboardingComplete: updatedUser.onboardingComplete,
          createdAt: updatedUser.createdAt,
          companyLogo: updatedUser.companyLogo,
          brandColors: updatedUser.brandColors,
          companyName: updatedUser.companyName,
          provider: updatedUser.provider
        });
        
        return { isNewUser: false };
      } else {
        return { isNewUser: false };
      }
    } catch (error) {
      return { isNewUser: false };
    }
  };

  // ✅ Update user profile/branding
  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }
      
      // ✅ If Auth0 user, update via Supabase Auth
      if (user.provider === 'auth0') {
        const result = await updateAuth0UserMetadata(updates);
        if (!result.success) {
          return { success: false, error: result.error };
        }
        
        // Update local state
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        saveOrUpdateAuth0User(updatedUser);
        
        return { success: true };
      }
      
      // ✅ Otherwise, update localStorage (legacy)
      const storedUser = getUserById(user.id);
      if (!storedUser) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }
      
      const updatedUser: StoredUser = {
        ...storedUser,
        ...updates
      };
      
      const users = getStoredUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        
        setUser({
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          type: updatedUser.type,
          onboardingComplete: updatedUser.onboardingComplete,
          createdAt: updatedUser.createdAt,
          companyLogo: updatedUser.companyLogo,
          brandColors: updatedUser.brandColors,
          companyName: updatedUser.companyName
        });
        
        return { success: true };
      } else {
        return { success: false, error: 'Utilisateur non trouvé' };
      }
    } catch (error) {
      return { success: false, error: 'Erreur lors de la mise à jour du profil' };
    }
  };

  // ✅ Complete onboarding
  const completeOnboarding = async (onboardingData?: { companyLogo?: string | null; brandColors?: string[]; companyName?: string }) => {
    try {
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }
      
      // ✅ If Auth0 user, update backend KV store (not Supabase Auth metadata)
      if (user.provider === 'auth0') {
        try {
          // ✅ Update backend profile
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/users/${user.id}/complete-onboarding`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({
                companyLogo: onboardingData?.companyLogo,
                brandColors: onboardingData?.brandColors,
                companyName: onboardingData?.companyName
              }),
            }
          );
          
          if (!response.ok) {
            console.error('[AuthContext] Failed to complete onboarding in backend');
            return { success: false, error: 'Failed to update backend' };
          }
          
          const data = await response.json();
          console.log('[AuthContext] Onboarding completed in backend:', data);
          
          // ✅ Update local state
          const updatedUser = { 
            ...user, 
            onboardingComplete: true,
            companyLogo: onboardingData?.companyLogo || user.companyLogo,
            brandColors: onboardingData?.brandColors || user.brandColors,
            companyName: onboardingData?.companyName || user.companyName
          };
          setUser(updatedUser);
          saveOrUpdateAuth0User(updatedUser);
          
          return { success: true };
        } catch (err) {
          console.error('[AuthContext] Complete onboarding error:', err);
          return { success: false, error: 'Network error' };
        }
      }
      
      // ✅ Otherwise, update localStorage (legacy)
      const storedUser = getUserById(user.id);
      if (!storedUser) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }
      
      const updatedUser: StoredUser = {
        ...storedUser,
        onboardingComplete: true,
        companyLogo: onboardingData?.companyLogo || storedUser.companyLogo,
        brandColors: onboardingData?.brandColors || storedUser.brandColors,
        companyName: onboardingData?.companyName || storedUser.companyName
      };
      
      const users = getStoredUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        
        setUser({
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          type: updatedUser.type,
          onboardingComplete: updatedUser.onboardingComplete,
          createdAt: updatedUser.createdAt,
          companyLogo: updatedUser.companyLogo,
          brandColors: updatedUser.brandColors,
          companyName: updatedUser.companyName
        });
        
        return { success: true };
      } else {
        return { success: false, error: 'Utilisateur non trouvé' };
      }
    } catch (error) {
      return { success: false, error: 'Erreur lors de la finalisation de l\'onboarding' };
    }
  };

  // ✅ CRITICAL: Also check localStorage for Neon users since they don't use Supabase auth
    const hasNeonUser = typeof window !== 'undefined' && !!localStorage.getItem('cortexia_user');
    console.log('[AuthContext] isAuthenticated check:', 'user:', !!user, 'hasNeonUser:', hasNeonUser, 'user.id:', user?.id);
    
    const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user || hasNeonUser,
    userType: user?.type || null,
    isNewUser,
    signIn,
    signUp,
    signOut,
    updateUserFromCallback,
    updateUserProfile,
    completeOnboarding,
    canAccessRoute,
    requiresAuth,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}