/**
 * useCurrentUser - Centralized hook for getting current authenticated user
 * 
 * Benefits:
 * - Single source of truth for current user
 * - Automatic fallback to demo-user for unauthenticated users
 * - Easy to use across components
 */

import { useAuth } from '../contexts/AuthContext';

export function useCurrentUser() {
  const { user, isAuthenticated, loading } = useAuth();
  
  // ✅ Return real user ID if authenticated, otherwise 'demo-user'
  const userId = user?.id || 'demo-user';
  const userName = user?.name || 'Guest';
  const userEmail = user?.email || '';
  const userType = user?.type || 'individual';
  
  return {
    userId,
    userName,
    userEmail,
    userType,
    isAuthenticated,
    loading,
    user,
    // ✅ Helper: Check if current user is demo
    isDemoUser: userId === 'demo-user',
    // ✅ Helper: Get user display name
    displayName: user?.name || user?.email?.split('@')[0] || 'Guest'
  };
}
