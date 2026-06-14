// UserStatsCard - Display user statistics and personalized recommendations
// Fixes: Pas d'analytics visible, pas de recommendations

import { motion } from "motion/react";
import { TrendingUp, Zap, Clock, Star, DollarSign, Images, Lightbulb } from "lucide-react";
import { UserStats } from "../../lib/services/analyticsService";
import { Button } from "../ui/Button";

interface UserStatsCardProps {
  stats: UserStats;
  recommendation?: {
    suggestion: string;
    reason: string;
    savings?: string;
  } | null;
  onUpgradeClick?: () => void;
  className?: string;
}

export function UserStatsCard({
  stats,
  recommendation,
  onUpgradeClick,
  className = ''
}: UserStatsCardProps) {
  if (stats.totalGenerations === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-medium">Your Stats This Month</h3>
          <p className="text-xs text-white/60">Track your creative journey</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Total Generations */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-[#6366f1]" />
            <span className="text-xs text-white/60">Generations</span>
          </div>
          <p className="text-2xl font-bold text-white tabular-nums">
            {stats.totalGenerations}
          </p>
        </div>

        {/* Success Rate */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-green-400" />
            <span className="text-xs text-white/60">Success Rate</span>
          </div>
          <p className="text-2xl font-bold text-green-400 tabular-nums">
            {Math.round(stats.successRate)}%
          </p>
        </div>

        {/* Average Time */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-white/60">Avg Time</span>
          </div>
          <p className="text-2xl font-bold text-white tabular-nums">
            {Math.round(stats.averageGenerationTime)}s
          </p>
        </div>

        {/* Credits Saved */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-white/60">Saved</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400 tabular-nums">
            ${stats.creditsSaved.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Most used model</span>
          <span className="text-white font-medium">{stats.mostUsedModel}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Favorite quality</span>
          <span className="text-white font-medium capitalize">{stats.favoriteQuality}</span>
        </div>
        {stats.multiImagePercentage > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Multi-image usage</span>
            <div className="flex items-center gap-1.5">
              <Images className="w-3.5 h-3.5 text-[#6366f1]" />
              <span className="text-white font-medium">
                {Math.round(stats.multiImagePercentage)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Recommendation */}
      {recommendation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-gradient-to-r from-[#6366f1]/20 to-[#8b5cf6]/20 border border-[#6366f1]/30"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#6366f1] flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium mb-1 text-sm">
                {recommendation.suggestion}
              </p>
              <p className="text-xs text-white/70 mb-2">
                {recommendation.reason}
              </p>
              {recommendation.savings && (
                <div className="flex items-center gap-1.5 mb-3">
                  <DollarSign className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs text-green-400 font-medium">
                    {recommendation.savings}
                  </span>
                </div>
              )}
            </div>
          </div>
          {onUpgradeClick && (
            <Button
              size="sm"
              variant="primary"
              fullWidth
              onClick={onUpgradeClick}
            >
              Get Pro Credits
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
