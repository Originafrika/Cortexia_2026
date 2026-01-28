/**
 * PAYMENT SUCCESS PAGE
 * Receives Stripe redirect and verifies payment with Authorization header
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router'; // ✅ FIX: Changed from react-router-dom to react-router
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
          setStatus('error');
          setMessage('No session ID found');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        console.log('✅ Verifying payment session:', sessionId);

        // Call backend with Authorization header
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/checkout/verify-session?session_id=${sessionId}`,
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
          console.log('✅ Payment verified:', data);
          setStatus('success');
          setMessage(`${data.credits} credits have been added to your account!`);
          
          // Redirect after 3 seconds
          setTimeout(() => navigate('/'), 3000);
        } else {
          console.error('❌ Payment verification failed:', data);
          setStatus('error');
          setMessage(data.error || 'Payment verification failed');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (error) {
        console.error('❌ Payment verification error:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your payment');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="max-w-md w-full mx-4 p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 text-center">
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Processing Payment</h1>
            <p className="text-white/80">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center text-5xl">
              ✓
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
            <p className="text-white/90 text-lg mb-2">{message}</p>
            <p className="text-white/60 text-sm mt-6">Redirecting back to Cortexia...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center text-5xl">
              ✕
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Payment Error</h1>
            <p className="text-white/80">{message}</p>
            <p className="text-white/60 text-sm mt-6">Redirecting back to Cortexia...</p>
          </>
        )}
      </div>
    </div>
  );
}