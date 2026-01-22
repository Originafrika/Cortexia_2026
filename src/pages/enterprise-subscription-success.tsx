import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, Loader, XCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export default function EnterpriseSubscriptionSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        // Get session_id from URL
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');

        if (!sessionId) {
          setStatus('error');
          setMessage('No session ID found');
          return;
        }

        console.log('🔍 Verifying Stripe session:', sessionId);

        // Call backend to verify and activate subscription
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/enterprise/subscription/verify?session_id=${sessionId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          setStatus('error');
          setMessage(data.error || 'Failed to verify subscription');
          return;
        }

        console.log('✅ Subscription activated:', data.subscription);

        setStatus('success');
        setSubscriptionDetails(data.subscription);
        setMessage('Your enterprise subscription has been activated!');

        // Redirect to Coconut V14 after 3 seconds
        setTimeout(() => {
          navigate('/coconut-v14');
        }, 3000);

      } catch (error) {
        console.error('❌ Verification error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to verify subscription');
      }
    };

    verifySubscription();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-[#2d2d2d]/80 backdrop-blur-xl border border-[#ffd700]/20 rounded-3xl p-8 shadow-2xl"
      >
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {status === 'loading' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader className="w-16 h-16 text-[#ffd700]" />
            </motion.div>
          )}
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <XCircle className="w-16 h-16 text-red-500" />
            </motion.div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-4">
          {status === 'loading' && (
            <span className="text-white">Activating Subscription...</span>
          )}
          {status === 'success' && (
            <span className="text-green-500">Success!</span>
          )}
          {status === 'error' && (
            <span className="text-red-500">Error</span>
          )}
        </h1>

        {/* Message */}
        <p className="text-center text-[#e0e0e0] mb-6">
          {message}
        </p>

        {/* Subscription Details */}
        {status === 'success' && subscriptionDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1a1a1a]/50 rounded-xl p-4 space-y-2"
          >
            <div className="flex justify-between">
              <span className="text-[#b0b0b0]">Status:</span>
              <span className="text-green-500 font-semibold">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#b0b0b0]">Monthly Credits:</span>
              <span className="text-[#ffd700] font-semibold">
                {subscriptionDetails.monthlyCredits?.toLocaleString() || '10,000'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#b0b0b0]">Total Credits:</span>
              <span className="text-[#ffd700] font-semibold">
                {subscriptionDetails.credits?.toLocaleString() || '10,000'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        {status === 'success' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-[#b0b0b0] text-sm mt-6"
          >
            Redirecting to Coconut V14...
          </motion.p>
        )}

        {status === 'error' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/coconut-v14')}
            className="w-full bg-[#ffd700] hover:bg-[#ffed4e] text-black font-semibold py-3 rounded-xl transition-colors"
          >
            Return to Coconut V14
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
