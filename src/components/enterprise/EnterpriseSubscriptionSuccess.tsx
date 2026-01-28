/**
 * ENTERPRISE SUBSCRIPTION SUCCESS PAGE
 * Handles successful subscription activation
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router'; // ✅ FIX: Changed from react-router-dom to react-router
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function EnterpriseSubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Activating your enterprise subscription...');
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
          setStatus('error');
          setMessage('No session ID found');
          setTimeout(() => navigate('/coconut-v14'), 3000);
          return;
        }

        console.log('✅ Verifying enterprise subscription:', sessionId);

        // Call backend to verify and activate
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/enterprise/subscription/verify?session_id=${sessionId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          console.log('✅ Subscription activated:', data);
          setStatus('success');
          setCredits(data.subscription?.credits || 10000);
          setMessage('Your enterprise subscription is now active!');
          
          // Redirect after 3 seconds
          setTimeout(() => navigate('/coconut-v14'), 3000);
        } else {
          console.error('❌ Subscription verification failed:', data);
          setStatus('error');
          setMessage(data.error || 'Subscription activation failed');
          setTimeout(() => navigate('/coconut-v14'), 3000);
        }
      } catch (error) {
        console.error('❌ Subscription verification error:', error);
        setStatus('error');
        setMessage('An error occurred while activating your subscription');
        setTimeout(() => navigate('/coconut-v14'), 3000);
      }
    };

    verifySubscription();
  }, [searchParams, navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--coconut-shell)] via-[var(--coconut-milk)] to-[var(--coconut-cream)]">
      <div className="max-w-md w-full mx-4 p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-[var(--coconut-palm)]/30 text-center">
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--coconut-palm)]/20 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[var(--coconut-palm)]/30 border-t-[var(--coconut-palm)] rounded-full animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--coconut-shell)] mb-4">Activating Subscription</h1>
            <p className="text-[var(--coconut-shell)]/80">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--coconut-palm)]/20 flex items-center justify-center text-5xl">
              ✓
            </div>
            <h1 className="text-3xl font-bold text-[var(--coconut-shell)] mb-4">Welcome to Coconut V14 Enterprise!</h1>
            <p className="text-[var(--coconut-shell)]/90 text-lg mb-2">{message}</p>
            <div className="mt-4 p-4 bg-[var(--coconut-cream)]/30 rounded-xl">
              <p className="text-[var(--coconut-shell)]/70 text-sm">
                {credits.toLocaleString()} credits available
              </p>
              <p className="text-[var(--coconut-shell)]/70 text-sm mt-1">
                Resets on the 1st of each month
              </p>
            </div>
            <p className="text-[var(--coconut-shell)]/60 text-sm mt-6">Redirecting to Coconut V14...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center text-5xl">
              ✕
            </div>
            <h1 className="text-3xl font-bold text-[var(--coconut-shell)] mb-4">Subscription Error</h1>
            <p className="text-[var(--coconut-shell)]/80">{message}</p>
            <p className="text-[var(--coconut-shell)]/60 text-sm mt-6">Redirecting back...</p>
          </>
        )}
      </div>
    </div>
  );
}