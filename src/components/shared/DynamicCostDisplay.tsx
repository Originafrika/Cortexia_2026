// DynamicCostDisplay - Real-time cost breakdown with explanations
// Fixes: Coût statique, pas de breakdown, pas transparent

import { motion, AnimatePresence } from "motion/react";
import { Zap, Images, Crown, Info } from "lucide-react";

interface CostBreakdown {
  base: number;
  multiImage?: number;
  premium?: number;
  total: number;
  creditType: 'free' | 'paid';
}

interface DynamicCostDisplayProps {
  imageCount: number;
  quality: 'standard' | 'premium';
  model: string;
  creditsRemaining: {
    free: number;
    paid: number;
  };
  className?: string;
}

function calculateCost(imageCount: number, quality: 'standard' | 'premium', model: string): CostBreakdown {
  let base = 1;
  let multiImage = 0;
  let premium = 0;
  let creditType: 'free' | 'paid' = 'free';

  // Premium quality
  if (quality === 'premium') {
    premium = 2;
    creditType = 'paid';
  }

  // Multi-image addon
  if (imageCount >= 2 || model === 'nanobanana') {
    multiImage = 1;
  }

  // Premium models
  if (model === 'flux-2-pro' || model === 'imagen-4') {
    base = 3;
    creditType = 'paid';
    multiImage = 0; // Already included
    premium = 0; // Already included
  }

  const total = base + multiImage + premium;

  return {
    base,
    multiImage: multiImage > 0 ? multiImage : undefined,
    premium: premium > 0 ? premium : undefined,
    total,
    creditType
  };
}

export function DynamicCostDisplay({
  imageCount,
  quality,
  model,
  creditsRemaining,
  className = ''
}: DynamicCostDisplayProps) {
  const cost = calculateCost(imageCount, quality, model);
  const remainingAfter = creditsRemaining[cost.creditType] - cost.total;
  const canAfford = remainingAfter >= 0;

  return (
    <div className={`p-4 rounded-xl bg-white/5 border border-white/10 ${className}`}>
      <div className="space-y-3">
        {/* Base cost */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Base generation</span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-white/40" />
            <span className="text-sm text-white tabular-nums">{cost.base} credit{cost.base > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Multi-image addon */}
        <AnimatePresence>
          {cost.multiImage && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Images className="w-3.5 h-3.5 text-[#6366f1]" />
                <span className="text-sm text-white/70">Multi-image fusion</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-[#6366f1] tabular-nums">+{cost.multiImage} credit{cost.multiImage > 1 ? 's' : ''}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium quality addon */}
        <AnimatePresence>
          {cost.premium && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Crown className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-sm text-white/70">Premium quality</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-yellow-400 tabular-nums">+{cost.premium} credit{cost.premium > 1 ? 's' : ''}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Total */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Total Cost</span>
            <div className="flex items-center gap-2">
              <div className={`
                px-2 py-1 rounded-md text-xs font-medium
                ${cost.creditType === 'free'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
                }
              `}>
                {cost.creditType === 'free' ? 'Free' : 'Pro'}
              </div>
              <Zap className="w-4 h-4 text-[#6366f1]" />
              <span className="text-lg font-bold text-white tabular-nums">
                {cost.total}
              </span>
            </div>
          </div>

          {/* Remaining after */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">After generation</span>
            <span className={`
              text-xs tabular-nums font-medium
              ${canAfford ? 'text-white/60' : 'text-red-400'}
            `}>
              {canAfford ? (
                <>
                  {remainingAfter} {cost.creditType} credit{remainingAfter !== 1 ? 's' : ''} remaining
                </>
              ) : (
                <>
                  Insufficient {cost.creditType} credits
                </>
              )}
            </span>
          </div>
        </div>

        {/* Insufficient credits warning */}
        <AnimatePresence>
          {!canAfford && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-red-400 font-medium mb-1">
                      Not enough {cost.creditType} credits
                    </p>
                    <p className="text-xs text-red-400/80">
                      {cost.creditType === 'free' ? (
                        <>
                          You have {creditsRemaining.free} free credits. 
                          {creditsRemaining.paid > 0 && (
                            <> Try using Pro credits instead, or wait for your monthly refill.</>
                          )}
                          {creditsRemaining.paid === 0 && (
                            <> Purchase Pro credits or wait for monthly refill.</>
                          )}
                        </>
                      ) : (
                        <>
                          You have {creditsRemaining.paid} Pro credits. Purchase more to continue.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Savings info for free credits */}
        {canAfford && cost.creditType === 'free' && cost.total > 1 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10">
            <Zap className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs text-green-400">
              Using free credits • Save ${((cost.total - 1) * 0.20).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
