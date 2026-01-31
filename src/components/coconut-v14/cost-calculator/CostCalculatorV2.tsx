import React, { useState, useMemo } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCredits } from '@/lib/contexts/CreditsContext';

interface Asset {
  type: 'image' | 'video';
  resolution?: 'standard' | 'hd' | '4k';
  model?: 'flux2-pro' | 'flux2-dev' | 'gemini-2.5';
  quality?: 'veo3-fast' | 'veo3';
  duration?: number;
  quantity: number;
}

/**
 * Cost Calculator V2
 * Updated pricing:
 * - Individual: $0.10 per credit
 * - Enterprise: $0.0999 per credit ($999/month = 10,000 credits)
 * - Batch discount: -20% for 10+ assets
 */
export const CostCalculatorV2: React.FC = () => {
  const { user } = useAuth();
  const { credits } = useCredits();
  const [assets, setAssets] = useState<Asset[]>([
    { type: 'image', resolution: 'hd', model: 'flux2-pro', quantity: 1 }
  ]);

  const creditRate = user?.userType === 'enterprise' ? 0.0999 : 0.10;

  const costBreakdown = useMemo(() => {
    let totalCredits = 0;
    const breakdown = [];

    assets.forEach((asset, idx) => {
      let credits = 0;
      let description = '';

      if (asset.type === 'image') {
        const resolutionMultiplier = {
          'standard': 1,
          'hd': 1.67,
          '4k': 3.33
        };
        const baseCredits = 15;
        credits = Math.round(baseCredits * (resolutionMultiplier[asset.resolution!] || 1));
        credits *= asset.quantity;
        description = `${asset.quantity}× ${asset.resolution} image (${asset.model})`;
      } 
      
      if (asset.type === 'video') {
        const qualityBase = asset.quality === 'veo3-fast' ? 7 : 35;
        const durationMultiplier = (asset.duration || 2) / 2;
        const perVideo = Math.round(qualityBase * durationMultiplier);
        credits = perVideo * asset.quantity;
        description = `${asset.quantity}× ${asset.duration}s video (${asset.quality})`;
      }

      totalCredits += credits;
      breakdown.push({
        description,
        quantity: asset.quantity,
        creditsPerItem: Math.round(credits / asset.quantity),
        totalCredits: credits,
        usdCost: (credits * creditRate).toFixed(2)
      });
    });

    // Apply batch discount if 10+ assets
    const totalAssets = assets.reduce((sum, a) => sum + a.quantity, 0);
    const hasBatchDiscount = totalAssets >= 10;
    const discountAmount = hasBatchDiscount ? Math.ceil(totalCredits * 0.20) : 0;
    const finalCredits = totalCredits - discountAmount;

    return {
      breakdown,
      totalAssets,
      baselineCredits: totalCredits,
      baselineCost: (totalCredits * creditRate).toFixed(2),
      batchDiscount: hasBatchDiscount ? 20 : 0,
      discountCredits: discountAmount,
      discountCost: (discountAmount * creditRate).toFixed(2),
      finalCredits,
      finalCost: (finalCredits * creditRate).toFixed(2)
    };
  }, [assets, creditRate]);

  const userCredits = credits?.total || 0;
  const canAfford = userCredits >= costBreakdown.finalCredits;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-cream-200">Cost Calculator</h2>
        <p className="text-stone-400 text-sm mt-1">
          {user?.userType === 'individual' 
            ? 'Pay per use: $0.10 per credit'
            : 'Enterprise rate: $0.0999 per credit'}
        </p>
      </div>

      {/* Current Balance */}
      <div className={`p-4 rounded-lg border-2 ${
        canAfford 
          ? 'bg-emerald-600/10 border-emerald-600'
          : 'bg-rose-600/10 border-rose-600'
      }`}>
        <p className={canAfford ? 'text-emerald-600' : 'text-rose-600'}>
          {canAfford ? '✓ Sufficient balance' : '✗ Insufficient balance'}
        </p>
        <p className="text-2xl font-bold text-stone-50 mt-1">
          {userCredits.toLocaleString()} credits (${(userCredits * creditRate).toFixed(2)})
        </p>
      </div>

      {/* Asset Breakdown */}
      <div className="space-y-3 bg-stone-900 p-4 rounded-lg border border-stone-700">
        <h3 className="font-semibold text-stone-50">Assets</h3>
        
        {costBreakdown.breakdown.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 bg-stone-800 rounded border border-stone-700">
            <div>
              <p className="text-stone-50 font-medium">{item.description}</p>
              <p className="text-stone-400 text-xs">
                {item.creditsPerItem} cr × {item.quantity} = {item.totalCredits} cr
              </p>
            </div>
            <p className="text-cream-200 font-bold">${item.usdCost}</p>
          </div>
        ))}
      </div>

      {/* Cost Summary */}
      <div className="space-y-2 p-4 bg-stone-900 rounded-lg border border-stone-700">
        <div className="flex justify-between text-stone-400">
          <span>Baseline Cost ({costBreakdown.totalAssets} assets)</span>
          <span>{costBreakdown.baselineCredits.toLocaleString()} cr = ${costBreakdown.baselineCost}</span>
        </div>

        {costBreakdown.batchDiscount > 0 && (
          <div className="flex justify-between p-2 bg-emerald-600/10 rounded border border-emerald-600">
            <span className="text-emerald-600 font-semibold">-{costBreakdown.batchDiscount}% Batch Discount</span>
            <span className="text-emerald-600 font-bold">-{costBreakdown.discountCredits} cr (${costBreakdown.discountCost})</span>
          </div>
        )}

        <div className="border-t border-stone-700 pt-2 flex justify-between">
          <span className="text-lg font-bold text-cream-200">Final Cost</span>
          <span className="text-2xl font-bold text-cream-200">
            {costBreakdown.finalCredits.toLocaleString()} cr = ${costBreakdown.finalCost}
          </span>
        </div>
      </div>

      {/* Warnings */}
      {!canAfford && (
        <div className="p-4 bg-rose-600/10 border border-rose-600 rounded-lg">
          <p className="text-rose-600 font-semibold">Insufficient Credits</p>
          <p className="text-stone-400 text-sm mt-1">
            You need {(costBreakdown.finalCredits - userCredits).toLocaleString()} more credits
          </p>
          <button className="mt-3 px-4 py-2 bg-rose-600 text-white text-sm font-bold rounded hover:bg-rose-700">
            {user?.userType === 'individual' ? 'Buy Credits' : 'Add Credits'}
          </button>
        </div>
      )}

      {costBreakdown.batchDiscount > 0 && (
        <div className="p-4 bg-cyan-600/10 border border-cyan-600 rounded-lg">
          <p className="text-cyan-600 font-semibold">ℹ Batch Discount Applied</p>
          <p className="text-stone-400 text-sm mt-1">
            You're generating {costBreakdown.totalAssets} assets together, qualifying for a {costBreakdown.batchDiscount}% discount!
          </p>
        </div>
      )}

      {/* Action Button */}
      <button
        disabled={!canAfford}
        className={`w-full py-3 font-bold rounded-lg transition-colors ${
          canAfford
            ? 'bg-cream-200 text-stone-900 hover:bg-cream-300'
            : 'bg-stone-700 text-stone-500 cursor-not-allowed'
        }`}
      >
        {canAfford ? 'Generate Assets' : 'Insufficient Credits'}
      </button>
    </div>
  );
};
