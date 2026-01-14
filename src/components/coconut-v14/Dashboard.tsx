/**
 * COCONUT V14 - DASHBOARD ULTRA-PREMIUM
 * Architecture-driven design showcasing the 4-phase workflow
 * 
 * Architecture Flow:
 * 1. INTENT INPUT → 2. AI ANALYSIS (Gemini) → 3. COCOBOARD → 4. GENERATION (Flux 2 Pro)
 * 
 * Features:
 * - Premium asymmetric layout with warm palette
 * - Hero credits card with prominent display
 * - Visual workflow timeline with connections
 * - Rich recent generations preview
 * - BDS 7 Arts compliance (Grammaire, Logique, Rhétorique, Arithmétique, Géométrie, Musique, Astronomie)
 * - Coconut Warm colors exclusively (shell/husk/cream/milk/palm)
 * - Liquid glass design with breathing room
 * - Score cible: 95%+ premium feel
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../ui/glass-card';
import { useSoundContext } from '../coconut-v14/SoundProvider';
import { useCredits } from '../../lib/contexts/CreditsContext';
import { useNotify } from '../coconut-v14/NotificationProvider';
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
  Image,
  Video,
  DollarSign,
  RefreshCw,
  Star,
  Flame,
  Target,
  Palette
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface DashboardProps {
  onNavigateToCreate?: () => void;
  onNavigateToCredits?: () => void;
}

// ============================================
// MOCK DATA
// ============================================

const mockStats = {
  totalGenerations: 142,
  totalCreditsUsed: 18450,
  successRate: 94.5,
  imagesGenerated: 98,
  videosGenerated: 44,
  creditsRemaining: 2500,
};

const recentGenerations = [
  {
    id: '1',
    prompt: 'Luxury fashion ad with coconut warm tones',
    thumbnail: null,
    status: 'completed',
    credits: 115,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    prompt: 'Product photography for tropical theme',
    thumbnail: null,
    status: 'completed',
    credits: 115,
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: '3',
    prompt: 'Social media campaign visual',
    thumbnail: null,
    status: 'pending',
    credits: 115,
    createdAt: new Date(Date.now() - 10800000),
  },
];

// ============================================
// COMPONENT
// ============================================

export function Dashboard({ onNavigateToCreate, onNavigateToCredits }: DashboardProps) {
  const [loading, setLoading] = useState(false);
  const notify = useNotify();
  const { getCoconutCredits } = useCredits();
  const { playClick, playWhoosh } = useSoundContext();
  
  const creditsRemaining = getCoconutCredits(); // ✅ Coconut V14 uses ONLY paid credits

  return (
    <div className="min-h-screen bg-[var(--coconut-white)] relative overflow-hidden">
      {/* Premium animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] opacity-60" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,165,116,0.08)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(107,142,112,0.06)_0%,transparent_50%)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="flex items-center gap-3 text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-palm)] to-[var(--coconut-shell)] bg-clip-text text-transparent">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              Cortexia Creation Hub
            </h1>
            <p className="text-sm md:text-base text-[var(--coconut-husk)] mt-2">
              <span className="bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent font-semibold">Coconut V14</span> • Replace a complete creative team with AI
            </p>
          </div>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playClick();
                playWhoosh();
                onNavigateToCredits?.();
              }}
              className="px-4 md:px-5 py-2.5 bg-white/60 backdrop-blur-xl hover:bg-white/80 rounded-xl flex items-center gap-2 border border-white/40 shadow-lg transition-all duration-300 text-sm md:text-base"
            >
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-[var(--coconut-shell)]" />
              <span className="text-[var(--coconut-shell)] hidden md:inline">Top Up</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playClick();
                playWhoosh();
                onNavigateToCreate?.();
              }}
              className="relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-husk)] to-[var(--coconut-shell)] bg-[length:200%_100%] animate-gradient" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative px-4 md:px-6 py-2.5 flex items-center gap-2 rounded-xl">
                <Plus className="w-5 h-5 text-white" />
                <span className="text-white text-sm md:text-base">New Project</span>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Hero Stats - Credits & Quick Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Credits Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
            className="relative md:col-span-1"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl blur-lg opacity-50" />
            <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-white/60">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-amber-500" />
                </div>
                <button
                  onClick={() => {
                    playClick();
                    onNavigateToCredits?.();
                  }}
                  className="text-xs text-[var(--coconut-husk)] hover:text-[var(--coconut-shell)] transition-colors"
                >
                  + Add Credits
                </button>
              </div>
              <div className="text-3xl md:text-4xl text-[var(--coconut-shell)] mb-1">
                {creditsRemaining.toLocaleString()}
              </div>
              <div className="text-sm text-[var(--coconut-husk)]">Credits Available</div>
              <div className="mt-4 h-2 bg-[var(--coconut-cream)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(creditsRemaining / 5000) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
                />
              </div>
            </div>
          </motion.div>

          {/* Success Rate */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 rounded-2xl blur-lg opacity-50" />
            <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-white/60">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-[var(--coconut-shell)]" />
                </div>
                <div className="flex items-center gap-1 text-xs text-[var(--coconut-shell)] bg-[var(--coconut-cream)] px-2 py-1 rounded-lg">
                  <TrendingUp className="w-3 h-3" />
                  +5.2%
                </div>
              </div>
              <div className="text-3xl md:text-4xl text-[var(--coconut-shell)] mb-1">
                {mockStats.successRate}%
              </div>
              <div className="text-sm text-[var(--coconut-husk)]">Success Rate</div>
            </div>
          </motion.div>

          {/* Total Generations */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-husk)]/20 to-[var(--coconut-shell)]/20 rounded-2xl blur-lg opacity-50" />
            <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-white/60">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-husk)]/20 to-[var(--coconut-shell)]/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-[var(--coconut-shell)]" />
                </div>
                <div className="flex items-center gap-1 text-xs text-[var(--coconut-shell)] bg-[var(--coconut-cream)] px-2 py-1 rounded-lg">
                  <Flame className="w-3 h-3" />
                  +18%
                </div>
              </div>
              <div className="text-3xl md:text-4xl text-[var(--coconut-shell)] mb-1">
                {mockStats.totalGenerations}
              </div>
              <div className="text-sm text-[var(--coconut-husk)]">Total Generations</div>
            </div>
          </motion.div>
        </motion.div>

        {/* 4-Phase Architecture Workflow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-palm)] to-[var(--coconut-husk)] bg-clip-text text-transparent mb-2">
              Production Workflow
            </h2>
            <p className="text-sm md:text-base text-[var(--coconut-husk)]">
              4-phase AI orchestration • <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent font-semibold">~115 credits</span> per project
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Phase 1: Intent Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.03, y: -6 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-shell)]/30 via-[var(--coconut-husk)]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-white/60 hover:border-[var(--coconut-shell)]/40 transition-all duration-300">
                {/* Phase Badge */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-[var(--coconut-shell)] text-white rounded-lg flex items-center justify-center text-sm">
                  1
                </div>
                
                <div className="mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-xl flex items-center justify-center mb-3">
                    <Sparkles className="w-7 h-7 text-[var(--coconut-shell)]" />
                  </div>
                  <h3 className="text-lg text-[var(--coconut-shell)] mb-2">
                    Intent Input
                  </h3>
                  <p className="text-sm text-[var(--coconut-husk)] mb-4">
                    Describe your vision • Upload references • Set specs
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-[var(--coconut-husk)]">
                  <CheckCircle className="w-4 h-4 text-[var(--coconut-palm)]" />
                  <span>Free (0 credits)</span>
                </div>
              </div>
            </motion.div>

            {/* Phase 2: AI Analysis */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.03, y: -6 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-palm)]/30 via-[var(--coconut-shell)]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-white/60 hover:border-[var(--coconut-palm)]/40 transition-all duration-300">
                {/* Phase Badge */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-[var(--coconut-palm)] text-white rounded-lg flex items-center justify-center text-sm">
                  2
                </div>
                
                <div className="mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[var(--coconut-palm)]/20 to-[var(--coconut-shell)]/20 rounded-xl flex items-center justify-center mb-3">
                    <Brain className="w-7 h-7 text-[var(--coconut-palm)]" />
                  </div>
                  <h3 className="text-lg text-[var(--coconut-shell)] mb-2">
                    AI Analysis
                  </h3>
                  <p className="text-sm text-[var(--coconut-husk)] mb-4">
                    Gemini 2.5 Flash • Vision analysis • Creative brief
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-[var(--coconut-husk)]">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>100 credits</span>
                </div>
              </div>
            </motion.div>

            {/* Phase 3: CocoBoard */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.03, y: -6 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-husk)]/30 via-[var(--coconut-shell)]/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-white/60 hover:border-[var(--coconut-husk)]/40 transition-all duration-300">
                {/* Phase Badge */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-[var(--coconut-husk)] text-white rounded-lg flex items-center justify-center text-sm">
                  3
                </div>
                
                <div className="mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[var(--coconut-husk)]/20 to-[var(--coconut-shell)]/20 rounded-xl flex items-center justify-center mb-3">
                    <Layout className="w-7 h-7 text-[var(--coconut-husk)]" />
                  </div>
                  <h3 className="text-lg text-[var(--coconut-shell)] mb-2">
                    CocoBoard
                  </h3>
                  <p className="text-sm text-[var(--coconut-husk)] mb-4">
                    Edit prompt • Adjust specs • Preview & refine
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-[var(--coconut-husk)]">
                  <CheckCircle className="w-4 h-4 text-[var(--coconut-palm)]" />
                  <span>Free (0 credits)</span>
                </div>
              </div>
            </motion.div>

            {/* Phase 4: Generation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.03, y: -6 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-shell)]/40 via-amber-500/30 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-white/60 hover:border-amber-500/40 transition-all duration-300">
                {/* Phase Badge */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg flex items-center justify-center text-sm">
                  4
                </div>
                
                <div className="mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl flex items-center justify-center mb-3">
                    <Zap className="w-7 h-7 text-amber-500" />
                  </div>
                  <h3 className="text-lg text-[var(--coconut-shell)] mb-2">
                    Generation
                  </h3>
                  <p className="text-sm text-[var(--coconut-husk)] mb-4">
                    Flux 2 Pro • High quality • Image-to-image mode
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-[var(--coconut-husk)]">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>1-9 credits</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] bg-clip-text text-transparent">
              Recent Generations
            </h2>
            <button
              onClick={() => {
                playClick();
                notify.info('History', 'Opening history view...');
              }}
              className="text-sm text-[var(--coconut-husk)] hover:text-[var(--coconut-shell)] transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {recentGenerations.length === 0 ? (
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-cream)]/40 to-[var(--coconut-milk)]/40 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-12 border border-white/60 text-center">
                <Sparkles className="w-12 h-12 text-[var(--coconut-husk)]/40 mx-auto mb-4" />
                <h3 className="text-lg text-[var(--coconut-shell)] mb-2">No generations yet</h3>
                <p className="text-sm text-[var(--coconut-husk)] mb-6">
                  Start your first project to see results here
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    playClick();
                    playWhoosh();
                    onNavigateToCreate?.();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create First Project
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {recentGenerations.map((gen, index) => (
                <motion.div
                  key={gen.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="relative group cursor-pointer"
                  onClick={() => {
                    playClick();
                    notify.info('Generation', `Opening ${gen.id}...`);
                  }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--coconut-shell)]/10 to-[var(--coconut-husk)]/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-white/40 hover:border-white/60 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      {/* Thumbnail placeholder */}
                      <div className="w-16 h-16 bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Image className="w-6 h-6 text-[var(--coconut-shell)]/40" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--coconut-shell)] truncate mb-1">
                          {gen.prompt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-[var(--coconut-husk)]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(gen.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-500" />
                            {gen.credits} credits
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 ${
                        gen.status === 'completed' 
                          ? 'bg-[var(--coconut-cream)] text-[var(--coconut-shell)]' 
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {gen.status === 'completed' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Complete</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-white/50 backdrop-blur-xl rounded-xl p-4 border border-white/40">
            <div className="flex items-center gap-2 text-[var(--coconut-husk)] text-xs mb-2">
              <Image className="w-4 h-4" />
              <span>Images</span>
            </div>
            <div className="text-2xl text-[var(--coconut-shell)]">
              {mockStats.imagesGenerated}
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-xl rounded-xl p-4 border border-white/40">
            <div className="flex items-center gap-2 text-[var(--coconut-husk)] text-xs mb-2">
              <Video className="w-4 h-4" />
              <span>Videos</span>
            </div>
            <div className="text-2xl text-[var(--coconut-shell)]">
              {mockStats.videosGenerated}
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-xl rounded-xl p-4 border border-white/40">
            <div className="flex items-center gap-2 text-[var(--coconut-husk)] text-xs mb-2">
              <Zap className="w-4 h-4" />
              <span>Credits Used</span>
            </div>
            <div className="text-2xl text-[var(--coconut-shell)]">
              {(mockStats.totalCreditsUsed / 1000).toFixed(1)}k
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-xl rounded-xl p-4 border border-white/40">
            <div className="flex items-center gap-2 text-[var(--coconut-husk)] text-xs mb-2">
              <Star className="w-4 h-4" />
              <span>Avg Quality</span>
            </div>
            <div className="text-2xl text-[var(--coconut-shell)]">
              {mockStats.successRate}%
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}