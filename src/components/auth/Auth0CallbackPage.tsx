/**
 * Auth0 Callback Page
 * Handles the OAuth redirect from Auth0 (implicit flow)
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { handleAuth0SDKCallback, hasAuth0Callback } from '../../lib/services/auth0-sdk';
import { useAuth } from '../../lib/contexts/AuthContext';

export function Auth0CallbackPage() {
  const navigate = useNavigate();
  const { updateUserFromCallback } = useAuth(); // ✅ Get updateUserFromCallback (no isNewUser here)
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false); // ✅ Prevent double execution

  useEffect(() => {
    // ✅ CRITICAL: Prevent double execution
    if (hasProcessed.current) {
      console.log('[Auth0Callback] Already processed, skipping');
      return;
    }
    
    const processCallback = async () => {
      try {
        hasProcessed.current = true; // ✅ Mark as processed
        
        console.log('[Auth0Callback] Processing callback...');
        
        // Check if this is an Auth0 callback
        if (!hasAuth0Callback()) {
          console.log('[Auth0Callback] Not an Auth0 callback, redirecting to root');
          // ✅ CRITICAL: Use window.location.replace to force navigation without loop
          window.location.replace('/');
          return;
        }
        
        console.log('[Auth0Callback] Detected Auth0 callback');
        
        // Handle Auth0 SDK callback
        const result = await handleAuth0SDKCallback();
        
        if (!result.success || !result.user) {
          console.error('[Auth0Callback] Failed:', result.error);
          setError(result.error || 'Authentication failed');
          
          // Redirect to login after 2s
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
        
        console.log('[Auth0Callback] Success! User:', result.user);
        
        // ✅ Clean URL to prevent re-triggering callback
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // ✅ Update AuthContext with user data and get isNewUser from response
        const { isNewUser } = await updateUserFromCallback(result.user);
        
        console.log('[Auth0Callback] isNewUser:', isNewUser, 'userType:', result.user.type);
        
        // ✅ NEW: Navigate based on signup vs signin
        if (isNewUser) {
          // SIGNUP → Always go to onboarding first
          console.log('[Auth0Callback] 🎉 NEW USER → Redirecting to onboarding');
          navigate('/onboarding', { replace: true });
        } else {
          // SIGNIN → Go to appropriate dashboard
          if (result.user.type === 'enterprise') {
            console.log('[Auth0Callback] ✅ SIGNIN (Enterprise) → Redirecting to Coconut');
            navigate('/coconut-v14', { replace: true });
          } else if (result.user.type === 'developer') {
            console.log('[Auth0Callback] ✅ SIGNIN (Developer) → Redirecting to API Dashboard');
            navigate('/coconut-v14', { replace: true }); // TODO: Create API Dashboard
          } else {
            console.log('[Auth0Callback] ✅ SIGNIN (Individual) → Redirecting to Feed');
            navigate('/feed', { replace: true });
          }
        }
      } catch (err: any) {
        console.error('[Auth0Callback] Error:', err);
        setError(err.message || 'An error occurred');
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    processCallback();
  }, []); // ✅ Remove isNewUser from deps (it's retrieved inside)

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="text-center">
          <div className="mb-4 text-red-500">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Error</h2>
          <p className="text-white/60">{error}</p>
          <p className="text-white/40 text-sm mt-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4A574]"></div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Completing sign in...</h2>
        <p className="text-white/60">Please wait while we set up your account</p>
      </div>
    </div>
  );
}