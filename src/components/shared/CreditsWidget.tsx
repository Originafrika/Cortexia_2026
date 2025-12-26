// CreditsWidget - Enhanced credits display with free/paid breakdown and countdown
// Fixes: Credits mélangés, pas de reset countdown, pas d'upsell intelligent

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Sparkles, Crown, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { Z_INDEX } from "../../lib/constants/design-system";
import { Button } from "../ui/Button";

export interface UserCredits {
  free: number;
  paid: number;
  daysUntilReset: number;
}

interface CreditsWidgetProps {
  credits: UserCredits;
  onGetMoreClick?: () => void;
  className?: string;
}

export function CreditsWidget({ credits, onGetMoreClick, className = '' }: CreditsWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalCredits = credits.free + credits.paid;
  const isLowCredits = totalCredits < 5;
  const freePercentage = (credits.free / 25) * 100;

  return (
    <motion.div
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      className={`${className}`}
      style={{ zIndex: Z_INDEX.sticky }}
    >
      <motion.div
        layout
        className="min-w-[200px] p-4 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10 shadow-2xl shadow-black/50 backdrop-blur-xl"
      >
        {/* Compact View */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white/60 uppercase tracking-wide font-medium">
            Credits
          </span>
          {onGetMoreClick && (
            <button 
              onClick={onGetMoreClick}
              className="text-xs text-[#6366f1] hover:text-[#6366f1]/80 font-medium transition-colors"
            >
              Get more
            </button>
          )}
        </div>

        {/* Free Credits with Progress Bar */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-green-400" />
              </div>
              <span className="text-sm text-white font-medium">Free</span>
            </div>
            <span className="text-lg font-bold text-white tabular-nums">
              {credits.free}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${freePercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
            />
          </div>

          {/* Reset countdown */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-white/40" />
            <span className="text-xs text-white/50">
              {credits.daysUntilReset === 0 ? (
                <span className="text-green-400 font-medium">Refilling soon!</span>
              ) : (
                `Refill in ${credits.daysUntilReset} day${credits.daysUntilReset > 1 ? 's' : ''}`
              )}
            </span>
          </div>
        </div>

        {/* Paid Credits */}
        <AnimatePresence>
          {credits.paid > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="h-px bg-white/10 my-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Crown className="w-3.5 h-3.5 text-yellow-400" />
                  </div>
                  <span className="text-sm text-white font-medium">Pro</span>
                </div>
                <span className="text-lg font-bold text-yellow-400 tabular-nums">
                  {credits.paid}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Total */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Total Available</span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#6366f1]" />
              <span className="text-xl font-bold text-white tabular-nums">
                {totalCredits}
              </span>
            </div>
          </div>
        </div>

        {/* Expanded Stats */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Monthly allowance</span>
                  <span className="text-white/70">25 free credits</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Used this month</span>
                  <span className="text-white/70">{25 - credits.free} credits</span>
                </div>
                {credits.paid > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Pro credits</span>
                    <span className="text-yellow-400 font-medium">Never expire</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Low Credits Warning */}
        <AnimatePresence>
          {isLowCredits && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20"
            >
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-orange-400 font-medium mb-1">
                    Running low!
                  </p>
                  <p className="text-xs text-orange-400/80 mb-2">
                    Only {totalCredits} credit{totalCredits !== 1 ? 's' : ''} remaining
                  </p>
                </div>
              </div>
              {onGetMoreClick && (
                <Button
                  size="sm"
                  variant="primary"
                  fullWidth
                  onClick={onGetMoreClick}
                  className="text-xs"
                >
                  Buy 50 credits for $9.99
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success indicators when high credits */}
        <AnimatePresence>
          {totalCredits >= 20 && isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-green-500/10"
            >
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-green-400">
                You're all set for the month!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
