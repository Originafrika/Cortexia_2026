/**
 * ENTERPRISE SUBSCRIPTION MANAGER
 * Manages enterprise subscription and add-on credits for Coconut V14
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotify } from './NotificationProvider';
import { useSoundContext } from './SoundProvider';
import { useAuth } from '../../lib/contexts/AuthContext'; // ✅ FIX: Correct path
import { useCredits } from '../../lib/contexts/CreditsContext'; // ✅ NEW: For refetchCredits
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import {
  Zap,
  Building2,
  CheckCircle,
  Clock,
  Calendar,
  CreditCard,
  Plus,
  Minus,
  ShoppingCart,
  Info,
  RefreshCw,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface EnterpriseSubscriptionStatus {
  hasSubscription: boolean;
  subscription?: {
    status: 'active' | 'past_due' | 'canceled' | 'unpaid';
    monthlyCredits: number;
    subscriptionCreditsRemaining: number;
    addOnCredits: number;
    totalCredits: number;
    nextResetDate: string;
    currentPeriodEnd: string;
  };
}

export function EnterpriseSubscriptionManager() {
  const notify = useNotify();
  const { playClick, playSuccess, playPop } = useSoundContext();
  const { user } = useAuth(); // ✅ ADD: Get user from AuthContext
  const { refetchCredits } = useCredits(); // ✅ NEW: For refetchCredits
  
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<EnterpriseSubscriptionStatus | null>(null);
  const [addOnAmount, setAddOnAmount] = useState(1000);
  const [purchasing, setPurchasing] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const MIN_ADDON = 1000;
  const ADDON_PRICE = 0.09; // ✅ Enterprise discount: $0.09/credit

  // Fetch subscription status
  useEffect(() => {
    if (user?.id) {
      fetchStatus();
    }
  }, [user?.id]);

  const fetchStatus = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/enterprise/subscription/status?userId=${user.id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
      notify.error('Error', 'Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  // Handle subscription creation
  const handleSubscribe = async () => {
    if (!user?.id) {
      notify.error('Error', 'Please log in to subscribe');
      return;
    }

    try {
      console.log('🔵 [Enterprise] handleSubscribe CALLED');
      console.log('🔵 [Enterprise] userId:', user.id);
      playClick();
      setSubscribing(true);

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/enterprise/subscription/create`;
      console.log('🔵 [Enterprise] Calling:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      console.log('🔵 [Enterprise] Response status:', response.status);

      const data = await response.json();
      console.log('🔵 [Enterprise] Response data:', data);

      if (response.ok && data.success) {
        if (data.url) {
          console.log('🔵 [Enterprise] Redirecting to Stripe:', data.url);
          // Redirect to Stripe Checkout
          window.location.href = data.url;
        } else {
          console.log('🔵 [Enterprise] Test mode - no redirect');
          // Test mode
          playSuccess();
          notify.success('Subscribed!', 'Your enterprise subscription is now active');
          fetchStatus();
        }
      } else {
        console.error('❌ [Enterprise] Subscription failed:', data.error);
        notify.error('Error', data.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('❌ [Enterprise] Subscription error:', error);
      notify.error('Error', 'Failed to create subscription');
    } finally {
      setSubscribing(false);
    }
  };

  // Handle add-on purchase
  const handlePurchaseAddOn = async () => {
    if (!user?.id) {
      notify.error('Error', 'Please log in to purchase');
      return;
    }

    try {
      playClick();
      setPurchasing(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/enterprise/addon/purchase`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            credits: addOnAmount,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url;
        } else {
          // Test mode
          playSuccess();
          notify.success('Purchase complete!', `${addOnAmount} add-on credits added`);
          fetchStatus();
          refetchCredits(); // ✅ NEW: Refetch credits
        }
      } else {
        notify.error('Error', data.error || 'Failed to purchase add-on credits');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      notify.error('Error', 'Failed to purchase add-on credits');
    } finally {
      setPurchasing(false);
    }
  };

  const incrementAddOn = (delta: number) => {
    setAddOnAmount(prev => Math.max(MIN_ADDON, prev + delta));
    playPop();
  };

  const hasActiveSubscription = subscriptionStatus?.hasSubscription && 
                                subscriptionStatus?.subscription?.status === 'active';

  const daysUntilReset = subscriptionStatus?.subscription?.nextResetDate
    ? Math.ceil((new Date(subscriptionStatus.subscription.nextResetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-[var(--coconut-shell)] animate-spin" />
          <p className="text-[var(--coconut-husk)]">Loading subscription...</p>
        </div>
      </div>
    );
  }

  // NO SUBSCRIPTION
  if (!hasActiveSubscription) {
    return (
      <div className="min-h-[600px] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-br from-[var(--coconut-shell)]/30 to-[var(--coconut-palm)]/30 rounded-3xl blur-2xl opacity-50" />
            <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-12 border border-white/60 text-center">
              
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-2xl shadow-xl mb-6">
                <Building2 className="w-10 h-10 text-white" />
              </div>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl text-[var(--coconut-shell)] mb-4">
                Enterprise Subscription Required
              </h2>
              
              {/* Description */}
              <p className="text-lg text-[var(--coconut-husk)] mb-8">
                Subscribe to Coconut V14 Enterprise to access premium AI orchestration
              </p>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-white/50 backdrop-blur-xl rounded-xl border border-white/40 text-left">
                  <CheckCircle className="w-5 h-5 text-[var(--coconut-palm)] mb-2" />
                  <div className="text-sm text-[var(--coconut-shell)] mb-1">10,000 monthly credits</div>
                  <div className="text-xs text-[var(--coconut-husk)]">Resets every 30 days</div>
                </div>

                <div className="p-4 bg-white/50 backdrop-blur-xl rounded-xl border border-white/40 text-left">
                  <CheckCircle className="w-5 h-5 text-[var(--coconut-palm)] mb-2" />
                  <div className="text-sm text-[var(--coconut-shell)] mb-1">Premium AI orchestration</div>
                  <div className="text-xs text-[var(--coconut-husk)]">Gemini + Flux Pro 2</div>
                </div>

                <div className="p-4 bg-white/50 backdrop-blur-xl rounded-xl border border-white/40 text-left">
                  <CheckCircle className="w-5 h-5 text-[var(--coconut-palm)] mb-2" />
                  <div className="text-sm text-[var(--coconut-shell)] mb-1">Unlimited projects</div>
                  <div className="text-xs text-[var(--coconut-husk)]">Boards & campaigns</div>
                </div>

                <div className="p-4 bg-white/50 backdrop-blur-xl rounded-xl border border-white/40 text-left">
                  <CheckCircle className="w-5 h-5 text-[var(--coconut-palm)] mb-2" />
                  <div className="text-sm text-[var(--coconut-shell)] mb-1">Add-on credits available</div>
                  <div className="text-xs text-[var(--coconut-husk)]">$0.09/credit, never expire</div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-8 p-6 bg-[var(--coconut-cream)]/30 backdrop-blur-xl rounded-xl border border-[var(--coconut-palm)]/30">
                <div className="text-5xl text-[var(--coconut-shell)] mb-2">$999</div>
                <div className="text-[var(--coconut-husk)]">per month</div>
              </div>

              {/* Subscribe Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubscribe}
                disabled={subscribing}
                className="w-full relative group overflow-hidden disabled:opacity-50 mb-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-husk)] to-[var(--coconut-shell)] bg-[length:200%_100%] animate-gradient" />
                <div className="relative px-8 py-5 flex items-center justify-center gap-3 rounded-xl">
                  {subscribing ? (
                    <>
                      <RefreshCw className="w-6 h-6 text-white animate-spin" />
                      <span className="text-white text-xl">Creating subscription...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6 text-white" />
                      <span className="text-white text-xl">Subscribe Now</span>
                    </>
                  )}
                </div>
              </motion.button>

              {/* DEV: Test Button */}
              {(import.meta.env?.DEV || window.location.hostname === 'localhost') && user?.id && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    try {
                      playClick();
                      
                      const response = await fetch(
                        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/enterprise/test/create-subscription`,
                        {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${publicAnonKey}`,
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ userId: user.id }),
                        }
                      );

                      if (response.ok) {
                        playSuccess();
                        notify.success('Test subscription created!', 'Refreshing status...');
                        setTimeout(async () => {
                          await fetchStatus();
                          await refetchCredits(); // ✅ NEW: Refetch credits
                        }, 1000);
                      } else {
                        const data = await response.json();
                        notify.error('Error', data.error || 'Failed to create test subscription');
                      }
                    } catch (error) {
                      console.error('Test subscription error:', error);
                      notify.error('Error', 'Failed to create test subscription');
                    }
                  }}
                  className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl text-gray-700 text-sm transition-colors"
                >
                  🧪 Create Test Subscription (Dev Only)
                </motion.button>
              )}

              {/* Info */}
              <p className="text-sm text-[var(--coconut-husk)] mt-6">
                Cancel anytime • Credits reset every 30 days from subscription date
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // HAS ACTIVE SUBSCRIPTION
  const sub = subscriptionStatus.subscription!;

  return (
    <div className="min-h-screen bg-[var(--coconut-white)] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] opacity-60" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,165,116,0.08)_0%,transparent_50%)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-2xl shadow-xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl text-[var(--coconut-shell)] mb-3">
            Enterprise Subscription
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--coconut-palm)]/20 backdrop-blur-xl rounded-lg border border-[var(--coconut-palm)]/30">
            <CheckCircle className="w-4 h-4 text-[var(--coconut-palm)]" />
            <span className="text-[var(--coconut-palm)] font-medium">Active</span>
          </div>
        </motion.div>

        {/* Credits Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 rounded-3xl blur-2xl opacity-50" />
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 border border-white/60">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Subscription Credits */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-palm)]/20 to-[var(--coconut-husk)]/20 rounded-xl blur-xl opacity-50" />
                <div className="relative p-6 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-[var(--coconut-husk)] uppercase tracking-wide">Monthly Credits</h3>
                    <Calendar className="w-5 h-5 text-[var(--coconut-palm)]" />
                  </div>
                  <div className="text-4xl text-[var(--coconut-shell)] mb-2">
                    {sub.subscriptionCreditsRemaining.toLocaleString()}
                  </div>
                  <div className="text-xs text-[var(--coconut-husk)] mb-3">
                    of {sub.monthlyCredits.toLocaleString()}
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-2">
                    <div 
                      className="h-full bg-gradient-to-r from-[var(--coconut-palm)] to-[var(--coconut-husk)] rounded-full transition-all duration-500"
                      style={{ width: `${(sub.subscriptionCreditsRemaining / sub.monthlyCredits) * 100}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-[var(--coconut-husk)]">
                    <Clock className="w-3 h-3" />
                    <span>Resets in {daysUntilReset} days</span>
                  </div>
                </div>
              </div>

              {/* Add-on Credits */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl blur-xl opacity-50" />
                <div className="relative p-6 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-[var(--coconut-husk)] uppercase tracking-wide">Add-on Credits</h3>
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-4xl text-[var(--coconut-shell)] mb-2">
                    {sub.addOnCredits.toLocaleString()}
                  </div>
                  <div className="text-xs text-[var(--coconut-husk)] mb-3">
                    Never expire
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-2">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full w-full" />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>$0.09 per credit</span>
                  </div>
                </div>
              </div>

              {/* Total Available */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-shell)]/30 to-[var(--coconut-palm)]/30 rounded-xl blur-xl opacity-50" />
                <div className="relative p-6 bg-gradient-to-br from-[var(--coconut-shell)]/10 to-[var(--coconut-palm)]/10 backdrop-blur-xl rounded-xl border border-[var(--coconut-palm)]/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-[var(--coconut-palm)] uppercase tracking-wide">Total Available</h3>
                    <Zap className="w-5 h-5 text-[var(--coconut-palm)]" />
                  </div>
                  <div className="text-5xl text-[var(--coconut-shell)] mb-2">
                    {sub.totalCredits.toLocaleString()}
                  </div>
                  <div className="text-xs text-[var(--coconut-husk)]">
                    Ready to use
                  </div>
                </div>
              </div>
            </div>

            {/* Reset Info */}
            <div className="mt-6 p-4 bg-[var(--coconut-cream)]/30 backdrop-blur-xl rounded-xl border border-[var(--coconut-palm)]/30">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[var(--coconut-palm)] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[var(--coconut-shell)]">
                  <div className="mb-1">
                    Your monthly credits reset on <strong>{new Date(sub.nextResetDate).toLocaleDateString()}</strong>
                  </div>
                  <div className="text-xs text-[var(--coconut-husk)]">
                    Credits are used in this order: monthly credits first, then add-on credits
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Purchase Add-on Credits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 md:p-8 border border-white/60">
            
            <h2 className="text-2xl text-[var(--coconut-shell)] mb-6">Purchase Add-on Credits</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Amount Selector */}
              <div>
                <label className="text-sm text-[var(--coconut-husk)] mb-3 block">
                  Number of credits
                </label>
                
                <div className="flex items-center gap-3 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => incrementAddOn(-1000)}
                    className="w-12 h-12 bg-white/60 backdrop-blur-xl hover:bg-white/80 rounded-xl flex items-center justify-center border border-white/40 shadow-lg transition-all"
                  >
                    <Minus className="w-5 h-5 text-[var(--coconut-shell)]" />
                  </motion.button>
                  
                  <input
                    type="number"
                    value={addOnAmount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || MIN_ADDON;
                      setAddOnAmount(Math.max(MIN_ADDON, val));
                    }}
                    min={MIN_ADDON}
                    step={1000}
                    className="flex-1 px-6 py-4 bg-white/60 backdrop-blur-xl rounded-xl border border-white/40 text-center text-3xl text-[var(--coconut-shell)] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => incrementAddOn(1000)}
                    className="w-12 h-12 bg-white/60 backdrop-blur-xl hover:bg-white/80 rounded-xl flex items-center justify-center border border-white/40 shadow-lg transition-all"
                  >
                    <Plus className="w-5 h-5 text-[var(--coconut-shell)]" />
                  </motion.button>
                </div>

                <div className="p-3 bg-white/50 backdrop-blur-xl rounded-lg border border-white/40 text-xs text-[var(--coconut-husk)]">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Minimum purchase: {MIN_ADDON.toLocaleString()} credits (${MIN_ADDON * ADDON_PRICE})</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="text-sm text-[var(--coconut-husk)] mb-3 block">
                  Purchase summary
                </label>
                
                <div className="space-y-3 mb-6">
                  <div className="p-4 bg-white/50 backdrop-blur-xl rounded-xl border border-white/40">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-[var(--coconut-husk)]">Credits</span>
                      <span className="text-[var(--coconut-shell)] text-xl font-mono">
                        {addOnAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-[var(--coconut-husk)]">Price per credit</span>
                      <span className="text-[var(--coconut-shell)] text-xl font-mono">${ADDON_PRICE}</span>
                    </div>
                    <div className="pt-3 border-t border-white/30">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--coconut-husk)]">Total</span>
                        <span className="text-[var(--coconut-shell)] text-3xl font-bold">
                          ${(addOnAmount * ADDON_PRICE).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--coconut-cream)]/30 backdrop-blur-xl rounded-lg border border-[var(--coconut-palm)]/30 text-xs text-[var(--coconut-shell)]">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--coconut-palm)] flex-shrink-0" />
                      <span>These credits never expire and can be used even after your subscription ends (if subscription is active)</span>
                    </div>
                  </div>
                </div>

                {/* Purchase Button */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePurchaseAddOn}
                  disabled={purchasing || addOnAmount < MIN_ADDON}
                  className="w-full relative group overflow-hidden disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 bg-[length:200%_100%] animate-gradient" />
                  <div className="relative px-6 py-4 flex items-center justify-center gap-3 rounded-xl">
                    {purchasing ? (
                      <>
                        <RefreshCw className="w-5 h-5 text-white animate-spin" />
                        <span className="text-white text-lg">Processing...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 text-white" />
                        <span className="text-white text-lg">Purchase Add-on Credits</span>
                      </>
                    )}
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}