/**
 * COCONUT V14 - DASHBOARD ULTRA-PREMIUM
 * Liquid Glass Design with Coconut Theme
 * 
 * Features:
 * - Frosted glass stats cards avec intense blur
 * - Animated background avec coconut gradients
 * - Motion animations partout
 * - Premium data visualization
 * - BDS 7 Arts compliance
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../ui/glass-card';
import { GlassButton } from '../ui/glass-button';
import { StatsCard } from '../ui-premium/StatsCard';
import { DataTable, DataTableColumn } from '../ui-premium/DataTable';
import { CircularProgress, RingProgress } from '../ui-premium/ProgressIndicator';
import { SkeletonCard, SkeletonList } from '../ui-premium/SkeletonLoader';
import { AnimatedStaggerContainer, AnimatedStaggerItem } from '../ui-premium/AnimatedWrapper';
import { EmptyState } from '../ui-premium/EmptyState';
import { Tooltip } from '../ui-premium/Tooltip';
import { ConfirmDialog } from '../ui-premium/ConfirmDialog';
import { useNotify } from '../coconut-v14/NotificationProvider';
import { useCredits } from '../../lib/contexts/CreditsContext';
import { useConfirm } from '../../lib/hooks/useConfirm';
import { api, ApiError } from '../../lib/api/client';
import type { DashboardStats, Generation } from '../../lib/api/client';
import {
  Image,
  Video,
  Zap,
  TrendingUp,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Download,
  Share2,
  Trash2,
  Eye,
  Plus,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Search,
  Filter,
  X,
  Star,
  TrendingDown
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
  averageCreditsPerDay: 520,
  creditsRemaining: 2500,
  creditsTotal: 5000,
  imagesGenerated: 98,
  videosGenerated: 44,
  sparklineData: [300, 450, 380, 520, 480, 550, 520],
};

// ============================================
// COMPONENT
// ============================================

export function Dashboard({ onNavigateToCreate, onNavigateToCredits }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const notify = useNotify();
  const { credits } = useCredits();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  
  const creditsRemaining = credits.free + credits.paid;
  const creditsTotal = stats?.creditsTotal ?? 5000;

  // ✅ FIX UI-10: Filter generations by search query and filters
  const filteredGenerations = useMemo(() => {
    let filtered = [...generations];
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(gen => {
        // Search in prompt fields
        const promptText = JSON.stringify(gen.prompt || {}).toLowerCase();
        const idMatch = gen.id.toLowerCase().includes(query);
        return promptText.includes(query) || idMatch;
      });
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(gen => gen.status === statusFilter);
    }
    
    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(gen => gen.type === typeFilter);
    }
    
    return filtered;
  }, [generations, searchQuery, statusFilter, typeFilter]);

  // Fetch data from backend
  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      
      // Fetch in parallel
      const [statsData, historyData] = await Promise.all([
        api.fetchDashboardStats().catch(() => {
          console.warn('📊 Using mock dashboard stats (API unavailable)');
          return mockStats;
        }),
        api.fetchGenerationHistory(1, 5).catch(() => {
          console.warn('📜 Using empty generation history (API unavailable)');
          return { generations: [], pagination: { page: 1, pageSize: 5, total: 0, totalPages: 0 } };
        }),
      ]);
      
      setStats(statsData);
      setGenerations(historyData.generations);
      setLastUpdated(new Date());
      
    } catch (err) {
      const message = err instanceof ApiError 
        ? err.message 
        : 'Failed to load dashboard data';
      
      console.error('Dashboard error:', err);
      setError(message);
      
      // Use mock data as fallback
      setStats(mockStats);
      setGenerations([]);
      
      if (!silent) {
        notify.warning(
          'Demo Mode',
          'Using mock data. Backend API is not available.'
        );
      }
      
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchData(true);
      }
    }, 30000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Manual refresh handler
  const handleRefresh = async () => {
    await fetchData(false);
    notify.success('Refreshed', 'Dashboard data updated');
  };

  // Format last updated time
  const getLastUpdatedText = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 120) return '1 minute ago';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    return lastUpdated.toLocaleTimeString();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || typeFilter !== 'all';

  // Table columns
  const columns: DataTableColumn<Generation>[] = [
    {
      key: 'type',
      header: 'Type',
      accessor: (row) => row.type,
      width: '100px',
      render: (value) => (
        <div className="flex items-center gap-2">
          {value === 'image' ? (
            <Image className="w-4 h-4 text-[var(--coconut-palm)]" />
          ) : (
            <Video className="w-4 h-4 text-blue-600" />
          )}
          <span className="capitalize text-[var(--coconut-shell)]">{value}</span>
        </div>
      ),
    },
    {
      key: 'prompt',
      header: 'Prompt',
      accessor: (row) => row.prompt,
      sortable: true,
      render: (value) => (
        <span className="truncate max-w-xs block text-[var(--coconut-shell)]" title={value}>
          {value}
        </span>
      ),
    },
    {
      key: 'model',
      header: 'Model',
      accessor: (row) => row.model,
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 rounded-lg bg-[var(--coconut-palm)]/20 border border-[var(--coconut-palm)]/30 text-[var(--coconut-palm)] text-sm">
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      sortable: true,
      width: '120px',
      render: (value) => {
        const config = {
          completed: {
            icon: CheckCircle,
            className: 'bg-green-500/20 border-green-500/30 text-green-700',
          },
          failed: {
            icon: XCircle,
            className: 'bg-red-500/20 border-red-500/30 text-red-700',
          },
          pending: {
            icon: Clock,
            className: 'bg-amber-500/20 border-amber-500/30 text-amber-700',
          },
        };
        const { icon: Icon, className } = config[value as keyof typeof config];
        return (
          <div className={`flex items-center gap-2 px-2 py-1 rounded-lg border text-sm ${className}`}>
            <Icon className="w-4 h-4" />
            <span className="capitalize">{value}</span>
          </div>
        );
      },
    },
    {
      key: 'credits',
      header: 'Credits',
      accessor: (row) => row.credits,
      sortable: true,
      align: 'right',
      width: '100px',
      render: (value) => (
        <span className="font-mono text-[var(--coconut-shell)]">{value}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      accessor: (row) => row.createdAt,
      sortable: true,
      width: '150px',
      render: (value) => {
        const date = new Date(value);
        return (
          <span className="text-sm text-[var(--coconut-husk)]">
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        );
      },
    },
  ];

  const handleDeleteGeneration = (generation: Generation) => {
    confirm({
      title: 'Delete Generation?',
      message: `Are you sure you want to delete "${generation.prompt.substring(0, 50)}..."?`,
      variant: 'danger',
      confirmText: 'Delete',
    }).then((confirmed) => {
      if (confirmed) {
        setGenerations(prev => prev.filter(g => g.id !== generation.id));
        notify.success('Generation deleted');
      }
    });
  };

  return (
    <div className="min-h-screen bg-[var(--coconut-white)] relative overflow-hidden">
      {/* Premium animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] opacity-60" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,165,116,0.08)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(107,142,112,0.06)_0%,transparent_50%)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="flex items-center gap-3 text-[var(--coconut-shell)]">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 rounded-xl flex items-center justify-center backdrop-blur-xl border border-white/40">
                <Sparkles className="w-6 h-6 text-[var(--coconut-shell)]" />
              </div>
              Dashboard
            </h1>
            <p className="text-[var(--coconut-husk)] mt-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-sm">
              <span>Welcome to Coconut V14 Creation Hub</span>
              <span className="text-xs text-[var(--coconut-husk)]/60">
                • Last updated: {getLastUpdatedText()}
              </span>
            </p>
          </div>
          
          <div className="flex gap-2 md:gap-3">
            <Tooltip content="Auto-refreshes every 30s">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={loading}
                className="w-10 h-10 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl flex items-center justify-center border border-white/40 shadow-lg transition-all duration-300 disabled:opacity-50"
                aria-label="Refresh dashboard"
              >
                <RefreshCw className={`w-5 h-5 text-[var(--coconut-shell)] ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
            </Tooltip>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNavigateToCredits}
              className="px-4 py-2 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl flex items-center gap-2 border border-white/40 shadow-lg transition-all duration-300"
            >
              <DollarSign className="w-5 h-5 text-amber-600" />
              <span className="text-[var(--coconut-shell)] hidden md:inline">Buy Credits</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNavigateToCreate}
              className="relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-husk)] to-[var(--coconut-shell)] bg-[length:200%_100%] animate-gradient" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative px-6 py-2.5 flex items-center gap-2 rounded-xl">
                <Plus className="w-5 h-5 text-white" />
                <span className="text-white hidden md:inline">New Generation</span>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {error ? (
          // Error State
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-3xl blur-xl opacity-50" />
            <div className="relative bg-white/70 backdrop-blur-[60px] rounded-2xl shadow-xl p-8 border border-white/60">
              <EmptyState
                icon={<AlertTriangle className="w-16 h-16 text-red-600" />}
                title="Failed to Load Dashboard"
                description={error}
                action={
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRefresh}
                    className="px-6 py-3 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-husk)] text-white rounded-xl shadow-lg flex items-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                  </motion.button>
                }
              />
            </div>
          </motion.div>
        ) : loading ? (
          // Loading State
          <AnimatedStaggerContainer>
            <AnimatedStaggerItem>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </AnimatedStaggerItem>
            <AnimatedStaggerItem>
              <SkeletonList items={5} />
            </AnimatedStaggerItem>
          </AnimatedStaggerContainer>
        ) : (
          <AnimatedStaggerContainer>
            
            {/* Stats Cards */}
            <AnimatedStaggerItem>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {/* Total Generations */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl blur-lg opacity-50" />
                  <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl p-6 border border-white/60">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-700 bg-green-100/80 backdrop-blur-xl px-2 py-1 rounded-lg">
                        <TrendingUp className="w-3 h-3" />
                        +18%
                      </div>
                    </div>
                    <div className="text-3xl text-[var(--coconut-shell)] mb-1">
                      {stats?.totalGenerations ?? mockStats.totalGenerations}
                    </div>
                    <div className="text-sm text-[var(--coconut-husk)]">Total Generations</div>
                  </div>
                </motion.div>

                {/* Credits Used */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl blur-lg opacity-50" />
                  <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl p-6 border border-white/60">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100/80 backdrop-blur-xl px-2 py-1 rounded-lg">
                        <TrendingUp className="w-3 h-3" />
                        +15%
                      </div>
                    </div>
                    <div className="text-3xl text-[var(--coconut-shell)] mb-1">
                      {stats?.totalCreditsUsed ?? mockStats.totalCreditsUsed}
                    </div>
                    <div className="text-sm text-[var(--coconut-husk)]">Credits Used</div>
                  </div>
                </motion.div>

                {/* Success Rate */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl blur-lg opacity-50" />
                  <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl p-6 border border-white/60">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-700 bg-green-100/80 backdrop-blur-xl px-2 py-1 rounded-lg">
                        <TrendingUp className="w-3 h-3" />
                        +2.4%
                      </div>
                    </div>
                    <div className="text-3xl text-[var(--coconut-shell)] mb-1">
                      {stats?.successRate ?? mockStats.successRate}%
                    </div>
                    <div className="text-sm text-[var(--coconut-husk)]">Success Rate</div>
                  </div>
                </motion.div>

                {/* Avg Credits/Day */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl blur-lg opacity-50" />
                  <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl p-6 border border-white/60">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-100/80 backdrop-blur-xl px-2 py-1 rounded-lg">
                        <TrendingUp className="w-3 h-3" />
                        +8%
                      </div>
                    </div>
                    <div className="text-3xl text-[var(--coconut-shell)] mb-1">
                      {stats?.averageCreditsPerDay ?? mockStats.averageCreditsPerDay}
                    </div>
                    <div className="text-sm text-[var(--coconut-husk)]">Avg. Credits/Day</div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatedStaggerItem>

            {/* Credits Overview & Generation Types - CONTINUED IN NEXT MESSAGE */}
            <AnimatedStaggerItem>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4"
              >
                
                {/* Credits Remaining */}
                <div className="lg:col-span-2 relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 rounded-2xl blur-lg opacity-50" />
                  <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl p-6 border border-white/60">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-xl text-[var(--coconut-shell)]">Credits Overview</h3>
                        <p className="text-sm text-[var(--coconut-husk)] mt-1">Current balance and usage</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onNavigateToCredits}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg shadow-lg flex items-center gap-2"
                      >
                        <DollarSign className="w-4 h-4" />
                        Top Up
                      </motion.button>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="relative">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="rgba(139, 115, 85, 0.1)"
                            strokeWidth="12"
                            fill="none"
                          />
                          <motion.circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="url(#gradient-credits)"
                            strokeWidth="12"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: "0 352" }}
                            animate={{ strokeDasharray: `${(creditsRemaining / creditsTotal) * 352} 352` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                          <defs>
                            <linearGradient id="gradient-credits" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="var(--coconut-shell)" />
                              <stop offset="100%" stopColor="var(--coconut-palm)" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-2xl text-[var(--coconut-shell)]">{Math.round((creditsRemaining / creditsTotal) * 100)}%</div>
                          <div className="text-xs text-[var(--coconut-husk)]">Remaining</div>
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--coconut-husk)]">Remaining Credits</span>
                          <span className="text-2xl text-[var(--coconut-shell)]">{creditsRemaining}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--coconut-husk)]">Total Credits</span>
                          <span className="text-lg text-[var(--coconut-shell)]">{creditsTotal}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--coconut-husk)]">Used</span>
                          <span className="text-lg text-[var(--coconut-shell)]">{creditsTotal - creditsRemaining}</span>
                        </div>
                        
                        <div className="pt-2 border-t border-[var(--coconut-husk)]/20">
                          <div className="text-sm text-[var(--coconut-husk)]">
                            At current usage: <span className="text-[var(--coconut-shell)]">~4.8 days</span> remaining
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generation Types */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-palm)]/20 to-[var(--coconut-sunset)]/20 rounded-2xl blur-lg opacity-50" />
                  <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl p-6 border border-white/60 h-full">
                    <h3 className="text-xl text-[var(--coconut-shell)] mb-6">Generation Types</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Image className="w-5 h-5 text-[var(--coconut-palm)]" />
                            <span className="text-[var(--coconut-shell)]">Images</span>
                          </div>
                          <span className="text-xl text-[var(--coconut-shell)]">{stats?.imagesGenerated ?? mockStats.imagesGenerated}</span>
                        </div>
                        
                        <div className="w-full bg-white/40 rounded-full h-2 overflow-hidden backdrop-blur-xl">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[var(--coconut-palm)] to-[var(--coconut-shell)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${(stats?.imagesGenerated ?? mockStats.imagesGenerated) / (stats?.totalGenerations ?? mockStats.totalGenerations) * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Video className="w-5 h-5 text-blue-600" />
                            <span className="text-[var(--coconut-shell)]">Videos</span>
                          </div>
                          <span className="text-xl text-[var(--coconut-shell)]">{stats?.videosGenerated ?? mockStats.videosGenerated}</span>
                        </div>
                        
                        <div className="w-full bg-white/40 rounded-full h-2 overflow-hidden backdrop-blur-xl">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${(stats?.videosGenerated ?? mockStats.videosGenerated) / (stats?.totalGenerations ?? mockStats.totalGenerations) * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatedStaggerItem>

            {/* Quick Actions */}
            <AnimatedStaggerItem>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl p-6 border border-white/60">
                  <h3 className="text-xl text-[var(--coconut-shell)] mb-4">Quick Actions</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onNavigateToCreate}
                      className="p-4 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl flex flex-col items-center gap-2 border border-white/40 shadow-lg transition-all duration-300"
                    >
                      <Plus className="w-6 h-6 text-[var(--coconut-palm)]" />
                      <span className="text-sm text-[var(--coconut-shell)]">New Image</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onNavigateToCreate}
                      className="p-4 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl flex flex-col items-center gap-2 border border-white/40 shadow-lg transition-all duration-300"
                    >
                      <Video className="w-6 h-6 text-blue-600" />
                      <span className="text-sm text-[var(--coconut-shell)]">New Video</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => notify.info('Export', 'Preparing your export...')}
                      className="p-4 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl flex flex-col items-center gap-2 border border-white/40 shadow-lg transition-all duration-300"
                    >
                      <Download className="w-6 h-6 text-purple-600" />
                      <span className="text-sm text-[var(--coconut-shell)]">Export All</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onNavigateToCredits}
                      className="p-4 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl flex flex-col items-center gap-2 border border-white/40 shadow-lg transition-all duration-300"
                    >
                      <DollarSign className="w-6 h-6 text-amber-600" />
                      <span className="text-sm text-[var(--coconut-shell)]">Buy Credits</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </AnimatedStaggerItem>
          </AnimatedStaggerContainer>
        )}
      </div>
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
      />
    </div>
  );
}

export default Dashboard;