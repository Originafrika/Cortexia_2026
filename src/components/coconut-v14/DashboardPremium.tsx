/**
 * COCONUT V14 - DASHBOARD ULTRA-PREMIUM V3
 * Multi-capability orchestration dashboard
 * 
 * Coconut V14 Capabilities:
 * 1. 📸 IMAGE GENERATION → Gemini Analysis (100cr) → Flux 2 Pro (1-9cr)
 * 2. 🎬 VIDEO GENERATION → Kie AI Veo 3.1 (Analyze only)
 * 3. 🎯 CAMPAIGN MANAGEMENT → Multi-asset workflow orchestration
 * 
 * Premium Features:
 * - Hero section with quick action cards
 * - Credits hero card (enterprise subscription)
 * - Workflow timeline with 3 capability paths
 * - Real-time stats (images, videos, campaigns)
 * - Coconut Warm exclusive palette
 * - BDS 7 Arts compliance
 * - Liquid glass design
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useSoundContext } from './SoundProvider';
import { useCredits } from '../../lib/contexts/CreditsContext';
import { useNotify } from './NotificationProvider';
import {
  Sparkles,
  Brain,
  Layout,
  Zap,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  Image as ImageIcon,
  Video,
  Target,
  Flame,
  ChevronRight,
  Layers,
  Wand2,
} from 'lucide-react';

interface DashboardPremiumProps {
  onNavigateToCreate?: () => void;
  onNavigateToCredits?: () => void;
  onNavigateToTypeSelect?: () => void; // ✅ Navigate to type selector
}

const recentGenerations: any[] = []; // ✅ Empty - no mock data

const mockStats = {
  totalGenerations: 0,
  successRate: 0,
  imagesGenerated: 0,
  videosGenerated: 0,
};

export function DashboardPremium({ onNavigateToCreate, onNavigateToCredits, onNavigateToTypeSelect }: DashboardPremiumProps) {
  const { credits, getCoconutCredits } = useCredits(); // ✅ ADD: Get full credits object
  const { playClick, playWhoosh } = useSoundContext();
  const notify = useNotify();
  
  // ✅ FIXED: Calculate total differently for Enterprise vs Regular users
  const creditsRemaining = credits.isEnterprise 
    ? (credits.monthlyCreditsRemaining || 0) + (credits.addOnCredits || 0)
    : getCoconutCredits(); // Regular users: paid credits only

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] relative overflow-hidden">
      {/* Premium ambient lights */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,165,116,0.12)_0%,transparent_40%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(249,115,22,0.08)_0%,transparent_40%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_90%,rgba(139,115,85,0.06)_0%,transparent_50%)]" />
      
      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* ========== HERO COMPACT ========== */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-4"
        >
          {/* Icon + Title inline */}
          <div className="flex items-center justify-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              {/* Glow warm */}
              <div className="absolute -inset-2 bg-gradient-to-br from-[var(--coconut-shell)]/30 to-[var(--coconut-palm)]/30 rounded-2xl blur-xl opacity-60" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-2xl shadow-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-palm)] to-[var(--coconut-shell)] bg-clip-text text-transparent">
                Cortexia Creation Hub
              </h1>
              <p className="text-sm text-[var(--coconut-husk)] mt-1">
                <span className="bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] bg-clip-text text-transparent font-semibold">Coconut V14</span> orchestration • 100% designer level
              </p>
            </div>
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playClick();
              playWhoosh();
              onNavigateToTypeSelect?.(); // ✅ Navigate to type selector
            }}
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl overflow-hidden shadow-2xl shadow-[var(--coconut-shell)]/30 transition-shadow hover:shadow-[var(--coconut-shell)]/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-palm)] to-[var(--coconut-shell)] bg-[length:200%_100%] animate-gradient" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="relative flex items-center gap-3">
              <Plus className="w-5 h-5 text-white" />
              <span className="font-semibold text-white">Start New Project</span>
              <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        </motion.div>

        {/* ========== CREDITS HERO CARD (CENTERED, DOMINANT) ========== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-2xl mx-auto"
        >
          {/* Triple glow warm */}
          <div className="absolute -inset-3 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 rounded-3xl blur-3xl opacity-40 animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute -inset-2 bg-gradient-to-br from-[var(--coconut-shell)]/30 to-[var(--coconut-palm)]/30 rounded-3xl blur-2xl opacity-60" />
          <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-palm)]/40 to-[var(--coconut-shell)]/40 rounded-3xl blur-xl opacity-80" />
          
          {/* Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border-2 border-white/70 overflow-hidden"
          >
            {/* Shimmer warm */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--coconut-cream)]/50 to-transparent -translate-x-full animate-shimmer" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  {/* Icon with glow */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-2xl blur-md opacity-60" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-2xl flex items-center justify-center shadow-xl">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--coconut-husk)] uppercase tracking-wider">Total Credits</div>
                    <div className="text-xs text-[var(--coconut-husk)]/60 mt-0.5">Pay-as-you-go • $0.09/credit</div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    playClick();
                    onNavigateToCredits?.();
                  }}
                  className="relative group px-5 py-2.5 rounded-xl overflow-hidden shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative text-white text-sm font-semibold flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Top Up
                  </span>
                </motion.button>
              </div>

              {/* Credits number */}
              <div className="mb-6">
                <div className="text-6xl font-black bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-husk)] to-[var(--coconut-palm)] bg-clip-text text-transparent">
                  {creditsRemaining.toLocaleString()}
                </div>
                <div className="text-sm text-[var(--coconut-husk)] mt-2 font-medium">
                  {creditsRemaining >= 115 ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--coconut-palm)]" />
                      Ready for {Math.floor(creditsRemaining / 115)} complete projects (115 cr each)
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-[var(--coconut-shell)]">
                      <Zap className="w-4 h-4" />
                      Top up to start new projects (min 115 credits)
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-[var(--coconut-cream)] to-[var(--coconut-milk)] rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((creditsRemaining / 5000) * 100, 100)}%` }}
                    transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-husk)] to-[var(--coconut-palm)] rounded-full shadow-lg relative overflow-hidden"
                  >
                    {/* Progress shimmer */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.div>
                </div>
                {/* Tick marks */}
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-[10px] text-[var(--coconut-husk)]/60">0</span>
                  <span className="text-[10px] text-[var(--coconut-husk)]/60">5,000</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ========== WORKFLOW TIMELINE (DOMINANT, HORIZONTAL) ========== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-palm)] to-[var(--coconut-husk)] bg-clip-text text-transparent">
              Standard Creation Workflow
            </h2>
            <p className="text-sm text-[var(--coconut-husk)] mt-1.5">
              Universal 4-phase process • Adapts to images, videos & campaigns
            </p>
          </div>

          {/* TIMELINE FLOW */}
          <div className="relative">
            {/* Connection line warm */}
            <div className="absolute top-12 left-[12%] right-[12%] h-1 bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-palm)] to-[var(--coconut-husk)] rounded-full hidden lg:block opacity-30" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Phase 1 - Intent Input */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ scale: 1.05, y: -6 }}
                className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-[var(--coconut-shell)]/40 shadow-xl hover:border-[var(--coconut-shell)] hover:shadow-2xl transition-all group"
              >
                {/* Badge warm */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white rounded-xl flex items-center justify-center font-bold shadow-lg z-10">
                  1
                </div>
                
                {/* Glow on hover */}
                <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-shell)]/0 to-[var(--coconut-palm)]/0 group-hover:from-[var(--coconut-shell)]/20 group-hover:to-[var(--coconut-palm)]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
                
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-[var(--coconut-shell)]" />
                </div>
                
                <h3 className="font-bold text-[var(--coconut-shell)] mb-2">Intent Input</h3>
                <p className="text-xs text-[var(--coconut-husk)] mb-4 leading-relaxed">
                  Describe your vision • Upload references • Set objectives
                </p>
                
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--coconut-palm)] bg-[var(--coconut-cream)] px-2.5 py-1.5 rounded-lg font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Free
                </div>
              </motion.div>

              {/* Phase 2 - AI Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{ scale: 1.05, y: -6 }}
                className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-[var(--coconut-palm)]/40 shadow-xl hover:border-[var(--coconut-palm)] hover:shadow-2xl transition-all group"
              >
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-[var(--coconut-palm)] to-[var(--coconut-husk)] text-white rounded-xl flex items-center justify-center font-bold shadow-lg z-10">
                  2
                </div>
                
                <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-palm)]/0 to-[var(--coconut-husk)]/0 group-hover:from-[var(--coconut-palm)]/20 group-hover:to-[var(--coconut-husk)]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
                
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-palm)]/20 to-[var(--coconut-husk)]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-[var(--coconut-palm)]" />
                </div>
                
                <h3 className="font-bold text-[var(--coconut-shell)] mb-2">AI Analysis</h3>
                <p className="text-xs text-[var(--coconut-husk)] mb-4 leading-relaxed">
                  Gemini vision • Strategy brief • Asset plan
                </p>
                
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--coconut-shell)] bg-[var(--coconut-cream)] px-2.5 py-1.5 rounded-lg font-medium">
                  <Zap className="w-3 h-3" />
                  ~100 credits
                </div>
              </motion.div>

              {/* Phase 3 - CocoBoard */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                whileHover={{ scale: 1.05, y: -6 }}
                className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-[var(--coconut-husk)]/40 shadow-xl hover:border-[var(--coconut-husk)] hover:shadow-2xl transition-all group"
              >
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-[var(--coconut-husk)] to-[var(--coconut-shell)] text-white rounded-xl flex items-center justify-center font-bold shadow-lg z-10">
                  3
                </div>
                
                <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-husk)]/0 to-[var(--coconut-shell)]/0 group-hover:from-[var(--coconut-husk)]/20 group-hover:to-[var(--coconut-shell)]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
                
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-husk)]/20 to-[var(--coconut-shell)]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Layout className="w-6 h-6 text-[var(--coconut-husk)]" />
                </div>
                
                <h3 className="font-bold text-[var(--coconut-shell)] mb-2">CocoBoard</h3>
                <p className="text-xs text-[var(--coconut-husk)] mb-4 leading-relaxed">
                  Review • Edit • Adjust • Approve final specs
                </p>
                
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--coconut-palm)] bg-[var(--coconut-cream)] px-2.5 py-1.5 rounded-lg font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Free
                </div>
              </motion.div>

              {/* Phase 4 - Generation */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                whileHover={{ scale: 1.05, y: -6 }}
                className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-[var(--coconut-palm)]/40 shadow-xl hover:border-[var(--coconut-palm)] hover:shadow-2xl transition-all group"
              >
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-[var(--coconut-palm)] to-[var(--coconut-shell)] text-white rounded-xl flex items-center justify-center font-bold shadow-lg z-10">
                  4
                </div>
                
                <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-palm)]/0 to-[var(--coconut-shell)]/0 group-hover:from-[var(--coconut-palm)]/20 group-hover:to-[var(--coconut-shell)]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
                
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-palm)]/20 to-[var(--coconut-shell)]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-[var(--coconut-palm)]" />
                </div>
                
                <h3 className="font-bold text-[var(--coconut-shell)] mb-2">Generation</h3>
                <p className="text-xs text-[var(--coconut-husk)] mb-4 leading-relaxed">
                  AI-powered creation • High quality output
                </p>
                
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--coconut-shell)] bg-[var(--coconut-cream)] px-2.5 py-1.5 rounded-lg font-medium">
                  <Zap className="w-3 h-3" />
                  Variable
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ========== WHAT YOU CAN CREATE (3 CAPABILITIES) ========== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-palm)] to-[var(--coconut-husk)] bg-clip-text text-transparent">
              What You Can Create
            </h2>
            <p className="text-sm text-[var(--coconut-husk)] mt-1.5">
              Choose from 3 AI-powered creation workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* IMAGE GENERATION */}
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                playClick();
                playWhoosh();
                onNavigateToTypeSelect?.();
              }}
              className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-[var(--coconut-shell)]/40 shadow-xl hover:border-[var(--coconut-shell)] hover:shadow-2xl transition-all group text-left"
            >
              {/* Glow on hover */}
              <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-shell)]/0 to-[var(--coconut-palm)]/0 group-hover:from-[var(--coconut-shell)]/20 group-hover:to-[var(--coconut-palm)]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
              
              {/* Icon */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-7 h-7 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-[var(--coconut-shell)] mb-2 flex items-center gap-2">
                Image Generation
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-[var(--coconut-husk)] mb-4 leading-relaxed">
                Professional images with Gemini 2.5 Flash analysis and Flux 2 Pro generation
              </p>

              {/* Specs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--coconut-husk)]">Analysis</span>
                  <span className="font-semibold text-[var(--coconut-shell)]">100 cr</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--coconut-husk)]">Generation</span>
                  <span className="font-semibold text-[var(--coconut-shell)]">1-9 cr</span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-[var(--coconut-husk)]/20 to-transparent my-2" />
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[var(--coconut-husk)]">Total</span>
                  <span className="text-[var(--coconut-shell)]">~115 cr</span>
                </div>
              </div>

              {/* Badge */}
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white text-[10px] font-bold shadow-lg">
                POPULAR
              </div>
            </motion.button>

            {/* VIDEO GENERATION */}
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                playClick();
                playWhoosh();
                onNavigateToTypeSelect?.();
              }}
              className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-[var(--coconut-palm)]/40 shadow-xl hover:border-[var(--coconut-palm)] hover:shadow-2xl transition-all group text-left"
            >
              {/* Glow on hover */}
              <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-palm)]/0 to-[var(--coconut-husk)]/0 group-hover:from-[var(--coconut-palm)]/20 group-hover:to-[var(--coconut-husk)]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
              
              {/* Icon */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-palm)] to-[var(--coconut-husk)] rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[var(--coconut-palm)] to-[var(--coconut-husk)] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Video className="w-7 h-7 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-[var(--coconut-shell)] mb-2 flex items-center gap-2">
                Video Generation
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-[var(--coconut-husk)] mb-4 leading-relaxed">
                AI-powered video creation with Kie AI Veo 3.1 analysis workflow
              </p>

              {/* Specs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--coconut-husk)]">Analysis</span>
                  <span className="font-semibold text-[var(--coconut-palm)]">Veo 3.1</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--coconut-husk)]">Duration</span>
                  <span className="font-semibold text-[var(--coconut-palm)]">5-10s</span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-[var(--coconut-husk)]/20 to-transparent my-2" />
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[var(--coconut-husk)]">Status</span>
                  <span className="text-[var(--coconut-palm)]">Analyze only</span>
                </div>
              </div>

              {/* Badge */}
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[var(--coconut-palm)] to-[var(--coconut-husk)] text-white text-[10px] font-bold shadow-lg">
                NEW
              </div>
            </motion.button>

            {/* CAMPAIGN MANAGEMENT */}
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                playClick();
                playWhoosh();
                onNavigateToTypeSelect?.();
              }}
              className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-[var(--coconut-husk)]/40 shadow-xl hover:border-[var(--coconut-husk)] hover:shadow-2xl transition-all group text-left"
            >
              {/* Glow on hover */}
              <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-husk)]/0 to-[var(--coconut-shell)]/0 group-hover:from-[var(--coconut-husk)]/20 group-hover:to-[var(--coconut-shell)]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
              
              {/* Icon */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-husk)] to-[var(--coconut-shell)] rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[var(--coconut-husk)] to-[var(--coconut-shell)] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Target className="w-7 h-7 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-[var(--coconut-shell)] mb-2 flex items-center gap-2">
                Campaign Management
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-[var(--coconut-husk)] mb-4 leading-relaxed">
                Multi-asset orchestration for complete marketing campaigns
              </p>

              {/* Specs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--coconut-husk)]">Multi-format</span>
                  <span className="font-semibold text-[var(--coconut-husk)]">✓</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--coconut-husk)]">Platforms</span>
                  <span className="font-semibold text-[var(--coconut-husk)]">All</span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-[var(--coconut-husk)]/20 to-transparent my-2" />
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[var(--coconut-husk)]">Credits</span>
                  <span className="text-[var(--coconut-husk)]">Variable</span>
                </div>
              </div>

              {/* Badge */}
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[var(--coconut-husk)] to-[var(--coconut-shell)] text-white text-[10px] font-bold shadow-lg">
                PRO
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* ========== STATS + RECENT (2 COLUMNS) ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* QUICK STATS */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <h2 className="text-xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] bg-clip-text text-transparent mb-4">
              Quick Stats
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                className="relative bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-lg hover:border-[var(--coconut-shell)]/40 transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 rounded-xl flex items-center justify-center mb-3">
                  <Target className="w-5 h-5 text-[var(--coconut-shell)]" />
                </div>
                <div className="text-3xl font-bold text-[var(--coconut-shell)]">
                  {mockStats.successRate}%
                </div>
                <div className="text-xs text-[var(--coconut-husk)] mt-1">Success Rate</div>
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-[var(--coconut-palm)] bg-[var(--coconut-cream)] px-2 py-0.5 rounded-lg font-medium">
                  <TrendingUp className="w-2.5 h-2.5" />
                  +5%
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                className="relative bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-lg hover:border-[var(--coconut-shell)]/40 transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--coconut-husk)]/20 to-[var(--coconut-shell)]/20 rounded-xl flex items-center justify-center mb-3">
                  <Activity className="w-5 h-5 text-[var(--coconut-shell)]" />
                </div>
                <div className="text-3xl font-bold text-[var(--coconut-shell)]">
                  {mockStats.totalGenerations}
                </div>
                <div className="text-xs text-[var(--coconut-husk)] mt-1">Projects</div>
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-[var(--coconut-palm)] bg-[var(--coconut-cream)] px-2 py-0.5 rounded-lg font-medium">
                  <Flame className="w-2.5 h-2.5" />
                  +18%
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-lg hover:border-[var(--coconut-shell)]/40 transition-all"
              >
                <div className="flex items-center gap-2 text-[var(--coconut-husk)] text-xs mb-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Images</span>
                </div>
                <div className="text-2xl font-bold text-[var(--coconut-shell)]">
                  {mockStats.imagesGenerated}
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-lg hover:border-[var(--coconut-shell)]/40 transition-all"
              >
                <div className="flex items-center gap-2 text-[var(--coconut-husk)] text-xs mb-2">
                  <Video className="w-4 h-4" />
                  <span>Videos</span>
                </div>
                <div className="text-2xl font-bold text-[var(--coconut-shell)]">
                  {mockStats.videosGenerated}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* RECENT GENERATIONS */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] bg-clip-text text-transparent">
                Recent Generations
              </h2>
              <button
                onClick={() => {
                  playClick();
                  notify.info('History', 'Opening history view...');
                }}
                className="text-sm text-[var(--coconut-husk)] hover:text-[var(--coconut-shell)] transition-colors flex items-center gap-1 group"
              >
                View All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="space-y-3">
              {recentGenerations.length === 0 ? (
                // ✅ Empty state - no mock data
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/60 text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-[var(--coconut-shell)]/40" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--coconut-shell)] mb-2">
                    Start Your First Project
                  </h3>
                  <p className="text-sm text-[var(--coconut-husk)] max-w-sm mx-auto">
                    Click "Start New Project" above to begin creating with Coconut V14's AI-powered workflow
                  </p>
                </motion.div>
              ) : (
                recentGenerations.map((gen, index) => (
                  <motion.div
                    key={gen.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1.2 + (0.1 * index) }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    onClick={() => {
                      playClick();
                      notify.info('Generation', `Opening ${gen.id}...`);
                    }}
                    className="group relative bg-white/70 backdrop-blur-xl rounded-xl p-4 border border-white/60 hover:border-[var(--coconut-shell)]/40 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <ImageIcon className="w-5 h-5 text-[var(--coconut-shell)]/50" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--coconut-shell)] truncate mb-1">
                          {gen.prompt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-[var(--coconut-husk)]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(gen.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-[var(--coconut-shell)]" />
                            {gen.credits} cr
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                        gen.status === 'completed' 
                          ? 'bg-[var(--coconut-cream)] text-[var(--coconut-palm)]' 
                          : 'bg-[var(--coconut-milk)] text-[var(--coconut-husk)]'
                      }`}>
                        {gen.status === 'completed' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Done</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </>
                        )}
                      </div>

                      <ChevronRight className="w-5 h-5 text-[var(--coconut-husk)]/30 group-hover:text-[var(--coconut-shell)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}