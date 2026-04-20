export {
  initNeonAuth,
  neonSignUp as signUp,
  neonSignIn as signIn,
  neonSignOut as signOut,
  getSession,
  getUser,
  isAuthenticated,
  getCurrentUser,
  restoreSession,
  updateProfile,
  requestPasswordReset,
  canAccessRoute,
} from './neon-auth';

export {
  auth,
  neonSignUp,
  neonSignIn,
  neonSignOut,
  signInWithGoogle,
  signInWithGitHub,
  signInWithVercel,
} from './auth';

export type {
  NeonAuthUser,
  AuthSession,
} from './neon-auth';