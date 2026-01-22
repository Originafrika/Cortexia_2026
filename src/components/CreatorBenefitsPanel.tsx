/**
 * CREATOR BENEFITS PANEL - Premium UI for Creator perks
 * Shows Coconut quota, download benefits, and commission status
 * BDS (Beauty Design System) compliant with liquid glass design
 */

import { motion, AnimatePresence } from 'motion/react';
import { Crown, Sparkles, X, Zap, Download, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCoconutAccess } from '../lib/hooks/useCoconutAccess';
import { useCurrentUser } from '../lib/hooks/useCurrentUser';
import type { Screen } from '../App';

interface CreatorBenefitsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCoconut: () => void;
}

export function CreatorBenefitsPanel({ isOpen, onClose, onNavigateToCoconut }: CreatorBenefitsPanelProps) {
  const { userId } = useCurrentUser();
  const { accessData, isLoading } = useCoconutAccess(userId);

  // Calculate progress for quota circle
  const quotaPercentage = accessData 
    ? (accessData.remainingGenerations / accessData.monthlyQuota) * 100 
    : 0;

  // Format reset date
  const resetDate = accessData?.resetDate 
    ? new Date(accessData.resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'N/A';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] max-w-lg mx-auto z-[101] rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 60px rgba(99, 102, 241, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Header */}
            <div className="relative px-6 py-5 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Creator Benefits</h2>
                    <p className="text-sm text-white/60">Your exclusive perks</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-[var(--coconut-shell)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : accessData?.hasAccess ? (
                <>
                  {/* Coconut V14 Quota Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative rounded-2xl p-6 overflow-hidden cursor-pointer group"
                    onClick={onNavigateToCoconut}
                    style={{
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                      border: '1px solid rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)]/10 to-[var(--coconut-palm)]/10" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-5 h-5 text-[var(--coconut-shell)]" />
                            <h3 className="text-lg font-bold text-white">Coconut V14 Access</h3>
                          </div>
                          <p className="text-sm text-white/60">Premium AI orchestration</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[var(--coconut-shell)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Quota Circle */}
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <svg width="80" height="80" className="transform -rotate-90">
                            {/* Background circle */}
                            <circle
                              cx="40"
                              cy="40"
                              r="36"
                              stroke="rgba(255, 255, 255, 0.1)"
                              strokeWidth="6"
                              fill="none"
                            />
                            {/* Progress circle */}
                            <circle
                              cx="40"
                              cy="40"
                              r="36"
                              stroke="url(#coconut-gradient)"
                              strokeWidth="6"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 36}`}
                              strokeDashoffset={`${2 * Math.PI * 36 * (1 - quotaPercentage / 100)}`}
                              className="transition-all duration-500"
                            />
                            <defs>
                              <linearGradient id="coconut-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--coconut-shell)" />
                                <stop offset="100%" stopColor="var(--coconut-palm)" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">
                                {accessData.remainingGenerations}
                              </div>
                              <div className="text-xs text-white/60">left</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white/60">Monthly Quota</span>
                              <span className="text-sm font-semibold text-white">
                                {accessData.monthlyQuota} generations
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white/60">Used this month</span>
                              <span className="text-sm font-semibold text-white">
                                {accessData.usedThisMonth}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-white/60" />
                                <span className="text-sm text-white/60">Resets</span>
                              </div>
                              <span className="text-sm font-semibold text-[var(--coconut-shell)]">
                                {resetDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs text-white/60 leading-relaxed">
                          <Zap className="w-3.5 h-3.5 inline mr-1 text-[var(--coconut-shell)]" />
                          Use Coconut V14 to generate <strong className="text-white">images or videos</strong> with multi-AI orchestration. 
                          Campaign mode is Enterprise-only.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Download Benefits */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl p-5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center flex-shrink-0">
                        <Download className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-white mb-1">
                          Watermark-Free Downloads
                        </h3>
                        <p className="text-sm text-white/60 leading-relaxed">
                          Download all creations from the Feed without watermarks. Your work, your ownership.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Commission Benefits */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl p-5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-6 h-6 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-white mb-1">
                          10-15% Commission Streak
                        </h3>
                        <p className="text-sm text-white/60 leading-relaxed">
                          Earn commissions on referred users. Streak percentage based on consecutive Creator months.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Creator Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl p-5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 flex items-center justify-center flex-shrink-0">
                        <Crown className="w-6 h-6 text-[var(--coconut-shell)]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-white mb-2">
                          Creator Badge
                        </h3>
                        <div className="inline-flex px-3 py-1 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white text-xs font-bold rounded-full">
                          CREATOR
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed mt-2">
                          Your Creator badge appears on all your posts in the Feed, showcasing your elite status.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-white/40" />
                  </div>
                  <p className="text-white/60">
                    Creator benefits not available for your account type.
                  </p>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            {accessData?.hasAccess && (
              <div className="px-6 py-4 border-t border-white/10">
                <button
                  onClick={() => {
                    onNavigateToCoconut();
                    onClose();
                  }}
                  className="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, var(--coconut-shell) 0%, var(--coconut-palm) 100%)',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Open Coconut V14</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
