// QualitySelector - Simplified UI for model selection
// Hides technical complexity (providers, model names, rate limits)
// Shows only: Quality tier + Cost + Free/Pro badge

import { motion } from "motion/react";
import { Sparkles, Zap, Crown, Info } from "lucide-react";
import { useState } from "react";

interface QualitySelectorProps {
  selectedTier: 'standard' | 'premium';
  cost: number;
  isPremium: boolean;
  onChange: (tier: 'standard' | 'premium') => void;
  autoSelected?: boolean; // Show "Auto-selected" hint
  showAdvanced?: boolean; // Show advanced options
}

export function QualitySelector({
  selectedTier,
  cost,
  isPremium,
  onChange,
  autoSelected = true,
  showAdvanced = false
}: QualitySelectorProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-3">
      {/* Main Display - Collapsed by default */}
      <motion.div
        className="p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedTier === 'premium' ? (
              <Crown className="w-5 h-5 text-yellow-400" />
            ) : (
              <Sparkles className="w-5 h-5 text-[#6366f1]" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">
                  {selectedTier === 'premium' ? 'Premium Quality' : 'Standard Quality'}
                </span>
                {!isPremium && (
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                    Free
                  </span>
                )}
                {isPremium && (
                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                    Pro
                  </span>
                )}
              </div>
              {autoSelected && (
                <p className="text-xs text-white/50 mt-0.5">
                  Auto-selected for best results
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/70">
              {cost} {cost === 1 ? 'credit' : 'credits'}
            </span>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg
                className="w-4 h-4 text-white/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Expanded Options */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          {/* Standard Option */}
          <motion.button
            onClick={() => {
              onChange('standard');
              setExpanded(false);
            }}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              selectedTier === 'standard'
                ? 'border-[#6366f1] bg-[#6366f1]/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-3">
              <Sparkles className={`w-5 h-5 mt-0.5 ${
                selectedTier === 'standard' ? 'text-[#6366f1]' : 'text-white/50'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">Standard Quality</span>
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                    Free
                  </span>
                </div>
                <p className="text-sm text-white/60">
                  Fast generation with great results
                </p>
                <p className="text-xs text-white/40 mt-1">
                  1 credit • Uses free monthly credits
                </p>
              </div>
              {selectedTier === 'standard' && (
                <div className="w-5 h-5 rounded-full bg-[#6366f1] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </motion.button>

          {/* Premium Option */}
          <motion.button
            onClick={() => {
              onChange('premium');
              setExpanded(false);
            }}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              selectedTier === 'premium'
                ? 'border-yellow-400 bg-yellow-400/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-3">
              <Crown className={`w-5 h-5 mt-0.5 ${
                selectedTier === 'premium' ? 'text-yellow-400' : 'text-white/50'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">Premium Quality</span>
                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                    Pro
                  </span>
                </div>
                <p className="text-sm text-white/60">
                  Professional-grade with maximum detail
                </p>
                <p className="text-xs text-white/40 mt-1">
                  3 credits • Requires paid credits
                </p>
              </div>
              {selectedTier === 'premium' && (
                <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </motion.button>

          {/* Info Note */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-400/80">
              The best model is automatically selected based on your prompt and images. 
              You can override this if needed.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
