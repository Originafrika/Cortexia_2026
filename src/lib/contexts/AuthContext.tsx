/**
 * AuthContext - Neon Auth focused Authentication System
 * Supports: Individual, Enterprise, Developer accounts
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  neonSignIn, 
  neonSignUp, 
  neonSignOut, 
  restoreSession
} from '../auth';

// ============================================
// TYPES
// ============================================

export type UserType = 'individual' | 'enterprise' | 'developer';

export interface User {
  id: string;
  email: string;
  name?: string;
  type: UserType;
  onboardingComplete: boolean;
  createdAt: string;
  
  // Enterprise branding
  companyLogo?: string | null;
  brandColors?: string[];
  companyName?: string;
  
  premiumBalance?: number;
  freeBalance?: number;
  provider?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  userType: UserType | null;
  isNewUser: boolean;
  
  signIn: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  signUp: (email: string, password: string, type: UserType, name?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => void;
  
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: (onboardingData?: { companyLogo?: string | null; brandColors?: string[]; companyName?: string }) => Promise<{ success: boolean; error?: string }>;
  
  canAccessRoute: (route: string) => boolean;
  requiresAuth: (route: string) => boolean;
}

// ============================================
// ROUTE ACCESS CONTROL
// ============================================

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

const TYPE_ROUTES: Record<UserType, string[]> = {
  individual: ['landing', 'feed', 'discovery', 'create', 'create-v4', 'profile', 'messages', 'wallet', 'creator-dashboard', 'settings', 'coconut-v14', 'coconut-campaign', 'coconut-v14-cocoboard'],
  enterprise: ['landing', 'coconut-v14', 'coconut-campaign', 'coconut-v14-cocoboard', 'settings'],
  developer: ['landing', 'coconut-v14', 'coconut-campaign', 'coconut-v14-cocoboard', 'settings']
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<UserType | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { user: restoredUser } = restoreSession();
        if (restoredUser) {
          setUser(restoredUser as User);
          setIsAuthenticated(true);
          setUserType(restoredUser.type as UserType);
        }
      } catch (error) {
        console.error('[AuthContext] Init error:', error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await neonSignIn(email, password);
      if (!result.success || !result.user) {
        return { success: false, error: result.error || 'Erreur de connexion' };
      }

      const userData = result.user as User;
      setUser(userData);
      setIsAuthenticated(true);
      setUserType(userData.type);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la connexion' };
    }
  };

  const signUp = async (email: string, password: string, type: UserType, name?: string) => {
    try {
      const result = await neonSignUp(email, password, type, { name });
      if (!result.success || !result.user) {
        return { success: false, error: result.error || 'Erreur d\'inscription' };
      }

      const userData = result.user as User;
      setUser(userData);
      setIsAuthenticated(true);
      setUserType(userData.type);
      setIsNewUser(true);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: 'Erreur lors de l\'inscription' };
    }
  };

  const signOut = async () => {
    await neonSignOut();
    setUser(null);
    setIsAuthenticated(false);
    setUserType(null);
  };

  const refreshUser = () => {
    const storedUserStr = localStorage.getItem('cortexia_user');
    if (storedUserStr) {
      try {
        const userData = JSON.parse(storedUserStr);
        setUser(userData);
        setIsAuthenticated(true);
        setUserType(userData.type);
      } catch (e) {
        console.error('[AuthContext] Failed to parse stored user:', e);
      }
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return { success: false, error: 'Non authentifié' };
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('cortexia_user', JSON.stringify(updatedUser));
    return { success: true };
  };

  const completeOnboarding = async (onboardingData?: any) => {
    if (!user) return { success: false, error: 'Non authentifié' };
    const updatedUser = { ...user, ...onboardingData, onboardingComplete: true };
    setUser(updatedUser);
    localStorage.setItem('cortexia_user', JSON.stringify(updatedUser));
    return { success: true };
  };

  const requiresAuth = (route: string): boolean => PROTECTED_ROUTES.includes(route);

  const canAccessRoute = (route: string): boolean => {
    if (route === 'landing') return true;
    if (['login', 'signup-individual', 'signup-enterprise', 'signup-developer', 'feed', 'discovery'].includes(route)) return true;
    if (route === 'onboarding' || route === 'auth-callback') return true;
    if (loading) return true;
    if (!isAuthenticated) return false;
    const allowedRoutes = TYPE_ROUTES[userType!] || [];
    return allowedRoutes.includes(route);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    userType,
    isNewUser,
    signIn,
    signUp,
    signOut,
    refreshUser,
    updateUserProfile,
    completeOnboarding,
    canAccessRoute,
    requiresAuth
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
