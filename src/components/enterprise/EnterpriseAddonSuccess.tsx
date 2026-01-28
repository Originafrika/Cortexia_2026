/**
 * ENTERPRISE ADD-ON CREDITS SUCCESS PAGE
 * Handles successful add-on credit purchase
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router'; // ✅ FIX: Changed from react-router-dom to react-router
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function EnterpriseAddonSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your purchase...');
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    const verifyPurchase = async () => {
      try {
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
          setStatus('error');
          setMessage('No session ID found');
          setTimeout(() => navigate('/coconut-v14'), 3000);
          return;
        }

        console.log('✅ Verifying add-on purchase:', sessionId);

        // Call backend to verify and add credits
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/enterprise/addon/verify?session_id=${sessionId}`,
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
          console.log('✅ Add-on credits added:', data);
          setStatus('success');
          setCredits(data.credits || 0);
          setMessage(`${data.credits?.toLocaleString()} add-on credits added!`);
          
          // Redirect after 3 seconds
          setTimeout(() => navigate('/coconut-v14'), 3000);
        } else {
          console.error('❌ Add-on verification failed:', data);
          setStatus('error');
          setMessage(data.error || 'Purchase verification failed');
          setTimeout(() => navigate('/coconut-v14'), 3000);
        }
      } catch (error) {
        console.error('❌ Add-on verification error:', error);
        setStatus('error');
        setMessage('An error occurred while processing your purchase');
        setTimeout(() => navigate('/coconut-v14'), 3000);
      }
    };

    verifyPurchase();
  }, [searchParams, navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--coconut-shell)] via-[var(--coconut-milk)] to-[var(--coconut-cream)]">
      <div className="max-w-md w-full mx-4 p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-[var(--coconut-palm)]/30 text-center">
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--coconut-palm)]/20 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[var(--coconut-palm)]/30 border-t-[var(--coconut-palm)] rounded-full animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--coconut-shell)] mb-4">Processing Purchase</h1>
            <p className="text-[var(--coconut-shell)]/80">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--coconut-palm)]/20 flex items-center justify-center text-5xl">
              ✓
            </div>
            <h1 className="text-3xl font-bold text-[var(--coconut-shell)] mb-4">Purchase Successful!</h1>
            <p className="text-[var(--coconut-shell)]/90 text-lg mb-2">{message}</p>
            <div className="mt-4 p-4 bg-[var(--coconut-cream)]/30 rounded-xl">
              <p className="text-[var(--coconut-shell)]/70 text-sm">
                These credits never expire
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
            <h1 className="text-3xl font-bold text-[var(--coconut-shell)] mb-4">Purchase Error</h1>
            <p className="text-[var(--coconut-shell)]/80">{message}</p>
            <p className="text-[var(--coconut-shell)]/60 text-sm mt-6">Redirecting back...</p>
          </>
        )}
      </div>
    </div>
  );
}