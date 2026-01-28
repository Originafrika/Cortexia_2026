/**
 * PAYMENT CANCEL PAGE
 * Handles cancelled Stripe checkout
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router'; // ✅ FIX: Changed from react-router-dom to react-router

export function PaymentCancel() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect after 3 seconds
    const timer = setTimeout(() => navigate('/'), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="max-w-md w-full mx-4 p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center text-5xl">
          ✕
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Payment Cancelled</h1>
        <p className="text-white/80 text-lg">No worries! You can try again anytime.</p>
        <p className="text-white/60 text-sm mt-6">Redirecting back to Cortexia...</p>
      </div>
    </div>
  );
}