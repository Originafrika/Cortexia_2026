// Auth exports
export {
  initNeonAuth,
  signUp,
  signIn,
  signOut,
  getSession,
  getCurrentUser,
  refreshToken,
  requestPasswordReset,
  updateProfile,
  linkOAuthProvider,
  isAuthenticated,
  requireAuth,
} from './neon-auth';

export type {
  NeonAuthUser,
  AuthSession,
} from './neon-auth';
