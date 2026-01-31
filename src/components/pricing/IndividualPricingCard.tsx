import React, { useState } from 'react';
import { useCredits } from '@/lib/contexts/CreditsContext';
import { toast } from 'sonner';

interface CreditPackage {
  credits: number;
  price: number;
  popular?: boolean;
  savings?: string;
}

/**
 * Individual User Pricing Card
 * Pay-as-you-go model: $0.10 per credit
 * No subscriptions, no commitments
 */
export const IndividualPricingCard: React.FC = () => {
  const { credits } = useCredits();
  const [selectedPackage, setSelectedPackage] = useState<number>(100);

  const packages: CreditPackage[] = [
    { credits: 50, price: 5.0 },
    { credits: 100, price: 10.0, popular: true },
    { credits: 250, price: 24.9, savings: 'Save $0.10' },
    { credits: 500, price: 49.9, savings: 'Save $0.10' },
    { credits: 1000, price: 99.9, savings: 'Save $0.10' },
  ];

  const currentCredits = credits?.total || 0;
  const currentValue = (currentCredits * 0.1).toFixed(2);

  const handlePurchase = async (pkg: CreditPackage) => {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credits: pkg.credits,
          price: pkg.price,
          userType: 'individual'
        })
      });
      
      const { sessionId } = await response.json();
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
    } catch (error) {
      toast.error('Failed to initiate purchase');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-stone-800 rounded-lg border border-stone-700">
      {/* Current Balance */}
      <div className="mb-6 p-4 bg-stone-900 rounded-lg border border-cream-200/20">
        <p className="text-stone-400 text-sm">Current Balance</p>
        <p className="text-2xl font-bold text-cream-200">
          {currentCredits} credits <span className="text-sm text-stone-400">(${currentValue})</span>
        </p>
      </div>

      {/* Pricing Header */}
      <h3 className="text-lg font-semibold text-stone-50 mb-4">Purchase Credits</h3>
      <p className="text-stone-400 text-sm mb-6">1 credit = $0.10 USD • No subscriptions, just pay-as-you-go</p>

      {/* Credit Packages Grid */}
      <div className="space-y-3 mb-6">
        {packages.map((pkg, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedPackage(pkg.credits)}
            className={`w-full p-4 rounded-lg border-2 transition-all flex justify-between items-center ${
              selectedPackage === pkg.credits
                ? 'bg-cream-200/10 border-cream-200'
                : 'bg-stone-900 border-stone-700 hover:border-stone-600'
            }`}
          >
            <div className="text-left">
              <p className="font-semibold text-stone-50">
                {pkg.credits.toLocaleString()} credits
              </p>
              {pkg.savings && (
                <p className="text-xs text-emerald-600">{pkg.savings}</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-cream-200">${pkg.price.toFixed(2)}</p>
              {pkg.popular && (
                <p className="text-xs text-amber-600 font-semibold">⭐ Popular</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Batch Discount Info */}
      <div className="mb-6 p-4 bg-cyan-600/10 border border-cyan-600 rounded-lg">
        <p className="text-cyan-600 font-semibold text-sm">💡 Bulk Discount Available</p>
        <p className="text-stone-400 text-xs mt-1">
          Get -20% off when generating 10+ assets together in a batch
        </p>
      </div>

      {/* Proceed Button */}
      <button
        onClick={() => {
          const pkg = packages.find(p => p.credits === selectedPackage);
          if (pkg) handlePurchase(pkg);
        }}
        className="w-full py-3 bg-cream-200 text-stone-900 font-bold rounded-lg hover:bg-cream-300 transition-colors"
      >
        Proceed to Payment
      </button>

      {/* Info Text */}
      <p className="text-xs text-stone-500 text-center mt-4">
        Powered by Stripe • Credits added instantly • No refunds after use
      </p>
    </div>
  );
};
