/**
 * Premium Access Badge
 * Shows users when they have paid credits that unlock premium models
 */

import { Sparkles, Crown, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface PremiumAccessBadgeProps {
  paidCredits: number;
  variant?: 'inline' | 'banner' | 'compact';
  showCredits?: boolean;
}

export function PremiumAccessBadge({ 
  paidCredits, 
  variant = 'inline',
  showCredits = true 
}: PremiumAccessBadgeProps) {
  
  // Don't show if no paid credits
  if (paidCredits <= 0) {
    return null;
  }

  // Inline variant (subtle badge)
  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
      >
        <Crown className="size-3.5 text-amber-400" />
        <span className="text-xs font-medium text-amber-200">
          Premium Unlocked
        </span>
        {showCredits && (
          <span className="text-xs text-amber-300/70">
            {paidCredits.toLocaleString()}
          </span>
        )}
      </motion.div>
    );
  }

  // Compact variant (icon only with tooltip)
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ rotate: -10, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        className="relative group"
        title={`Premium Access Active • ${paidCredits.toLocaleString()} paid credits`}
      >
        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
          <Sparkles className="size-4 text-amber-400" />
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-amber-500/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <div className="text-xs text-amber-200 font-medium">Premium Access</div>
          <div className="text-xs text-gray-400">{paidCredits.toLocaleString()} paid credits</div>
        </div>
      </motion.div>
    );
  }

  // Banner variant (full-width prominent)
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-4"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_50%)]" />
      <motion.div
        animate={{
          x: ['0%', '100%'],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"
      />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/40">
            <Crown className="size-5 text-amber-300" />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Premium Models Unlocked</h3>
              <Zap className="size-3.5 text-amber-400 animate-pulse" />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Access to Flux Pro, Replicate & premium models
            </p>
          </div>
        </div>

        {showCredits && (
          <div className="text-right">
            <div className="text-lg font-bold text-amber-300">
              {paidCredits.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">paid credits</div>
          </div>
        )}
      </div>

      {/* Premium glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-amber-400/5 pointer-events-none" />
    </motion.div>
  );
}

/**
 * Free Credits Only Warning
 * Shows when user only has free credits (limited to Pollinations)
 */
interface FreeCreditsWarningProps {
  freeCredits: number;
  onUpgrade?: () => void;
}

export function FreeCreditsWarning({ freeCredits, onUpgrade }: FreeCreditsWarningProps) {
  if (freeCredits <= 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="size-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Free Credits Active</h3>
          </div>
          <p className="text-xs text-gray-400 mb-2">
            Currently using free tier models. Upgrade to paid credits for premium quality.
          </p>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="text-xs font-medium text-blue-300 hover:text-blue-200 transition-colors"
            >
              Unlock Premium Models →
            </button>
          )}
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-blue-300">
            {freeCredits.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">free credits</div>
        </div>
      </div>
    </motion.div>
  );
}