import React, { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { toast } from 'sonner';

interface EnterpriseSubscription {
  monthlyAllowance: number;
  monthlyCost: number;
  creditsUsed: number;
  daysRemaining: number;
  addOnsActive: string[];
}

/**
 * Enterprise Pricing Card
 * Fixed subscription: $999/month = 10,000 credits ($0.0999 per credit)
 * Optional add-ons: +$99.90/1000, +$199.80/2000, +$499.50/5000, +$299/month unlimited
 */
export const EnterprisePricingCard: React.FC = () => {
  const { user } = useAuth();
  const [showAddOns, setShowAddOns] = useState(false);

  const subscription: EnterpriseSubscription = {
    monthlyAllowance: 10000,
    monthlyCost: 999,
    creditsUsed: 3247,
    daysRemaining: 9,
    addOnsActive: []
  };

  const addOns = [
    { name: '+1,000 credits', price: 99.9, credits: 1000 },
    { name: '+2,000 credits', price: 199.8, credits: 2000 },
    { name: '+5,000 credits', price: 499.5, credits: 5000 },
    { name: 'Unlimited add-on', price: 299, monthly: true },
  ];

  const creditsRemaining = subscription.monthlyAllowance - subscription.creditsUsed;
  const utilisationPercent = (subscription.creditsUsed / subscription.monthlyAllowance) * 100;
  const creditRate = (subscription.monthlyCost / subscription.monthlyAllowance).toFixed(4);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-stone-800 rounded-lg border border-stone-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cream-200">Coconut V14 Subscription</h2>
        <p className="text-stone-400 text-sm mt-1">Enterprise AI Orchestration Platform</p>
      </div>

      {/* Current Plan Status */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-stone-900 rounded-lg border border-stone-700">
          <p className="text-stone-400 text-xs uppercase tracking-wide">Monthly Plan</p>
          <p className="text-2xl font-bold text-cream-200 mt-1">${subscription.monthlyCost}</p>
          <p className="text-stone-500 text-xs mt-1">Renews in {subscription.daysRemaining} days</p>
        </div>

        <div className="p-4 bg-stone-900 rounded-lg border border-stone-700">
          <p className="text-stone-400 text-xs uppercase tracking-wide">Per-Credit Rate</p>
          <p className="text-2xl font-bold text-cream-200 mt-1">${creditRate}</p>
          <p className="text-stone-500 text-xs mt-1">(Based on 10,000 credits/mo)</p>
        </div>
      </div>

      {/* Credit Allocation */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-stone-50">Monthly Credit Allocation</h3>
          <p className="text-stone-400 text-sm">
            {subscription.creditsUsed.toLocaleString()} / {subscription.monthlyAllowance.toLocaleString()}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-900 rounded-full h-3 overflow-hidden border border-stone-700">
          <div
            className="bg-gradient-to-r from-emerald-600 to-cream-200 h-full transition-all"
            style={{ width: `${Math.min(utilisationPercent, 100)}%` }}
          />
        </div>

        <div className="flex justify-between mt-2 text-xs text-stone-400">
          <span>Used: {utilisationPercent.toFixed(1)}%</span>
          <span>Remaining: {creditsRemaining.toLocaleString()} credits</span>
        </div>
      </div>

      {/* Usage Breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 bg-stone-900 rounded-lg border border-emerald-600/20">
          <p className="text-emerald-600 text-xs font-semibold">Monthly Included</p>
          <p className="text-lg font-bold text-stone-50 mt-1">10,000</p>
        </div>
        <div className="p-3 bg-stone-900 rounded-lg border border-amber-600/20">
          <p className="text-amber-600 text-xs font-semibold">Used This Month</p>
          <p className="text-lg font-bold text-stone-50 mt-1">{subscription.creditsUsed.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-stone-900 rounded-lg border border-cyan-600/20">
          <p className="text-cyan-600 text-xs font-semibold">Remaining</p>
          <p className="text-lg font-bold text-stone-50 mt-1">{creditsRemaining.toLocaleString()}</p>
        </div>
      </div>

      {/* Add-On Credits */}
      <div className="mb-6 p-4 bg-stone-900 rounded-lg border border-stone-700">
        <button
          onClick={() => setShowAddOns(!showAddOns)}
          className="flex justify-between items-center w-full"
        >
          <h3 className="font-semibold text-stone-50">Add-On Credits (Optional)</h3>
          <span className="text-cream-200">{showAddOns ? '−' : '+'}</span>
        </button>

        {showAddOns && (
          <div className="mt-4 space-y-2">
            {addOns.map((addon, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 bg-stone-800 rounded border border-stone-700 hover:border-cream-200/50 transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-stone-50">{addon.name}</p>
                  {addon.monthly && (
                    <p className="text-xs text-stone-400">Monthly recurring</p>
                  )}
                </div>
                <button className="px-3 py-1 bg-cream-200 text-stone-900 text-sm font-semibold rounded hover:bg-cream-300">
                  ${addon.price.toFixed(2)}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Batch Discount Info */}
      <div className="mb-6 p-4 bg-cyan-600/10 border border-cyan-600 rounded-lg">
        <p className="text-cyan-600 font-semibold text-sm">ℹ Batch Generation Discount</p>
        <p className="text-stone-400 text-xs mt-1">
          All batches automatically get -20% discount when generating 10+ assets together. This savings is already reflected in your per-credit rate.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 py-3 bg-cream-200 text-stone-900 font-bold rounded-lg hover:bg-cream-300 transition-colors">
          Manage Billing
        </button>
        <button className="flex-1 py-3 bg-stone-700 text-stone-50 font-bold rounded-lg hover:bg-stone-600 transition-colors border border-stone-600">
          Cancel Subscription
        </button>
      </div>

      {/* Footer */}
      <p className="text-xs text-stone-500 text-center mt-4">
        Questions? <a href="#" className="text-cream-200 hover:underline">Contact support</a>
      </p>
    </div>
  );
};
