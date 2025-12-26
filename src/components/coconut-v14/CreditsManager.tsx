/**
 * COCONUT V14 - CREDITS MANAGER ULTRA-PREMIUM
 * Liquid Glass Design with Coconut Theme
 * 
 * Features:
 * - Premium credits balance display
 * - Animated package cards avec glass
 * - Transaction history avec blur
 * - Usage analytics premium
 * - BDS 7 Arts compliance
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../ui/glass-card';
import { GlassButton } from '../ui/glass-button';
import { DataTable, DataTableColumn } from '../ui-premium/DataTable';
import { CircularProgress, LinearProgress } from '../ui-premium/ProgressIndicator';
import { AnimatedStaggerContainer, AnimatedStaggerItem } from '../ui-premium/AnimatedWrapper';
import { SkeletonCard, SkeletonList } from '../ui-premium/SkeletonLoader';
import { EmptyState } from '../ui-premium/EmptyState';
import { useNotify } from '../coconut-v14/NotificationProvider';
import { api, ApiError } from '../../lib/api/client';
import type { Transaction, UsageAnalytics } from '../../lib/api/client';
import {
  Zap,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  Check,
  DollarSign,
  Package,
  Sparkles,
  Star,
  Crown,
  RefreshCw,
  AlertCircle,
  Activity,
  Image,
  Video
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus: number;
  popular?: boolean;
  badge?: string;
  color: string;
}

interface Transaction {
  id: number;
  type: 'purchase' | 'usage';
  description: string;
  credits: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface CreditsManagerProps {
  currentCredits?: number;
  onPurchase?: (packageId: string) => void;
}

// ============================================
// MOCK DATA
// ============================================

const creditPackages: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 1000,
    price: 9.99,
    bonus: 0,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 5000,
    price: 39.99,
    bonus: 500,
    popular: true,
    badge: 'Most Popular',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'business',
    name: 'Business',
    credits: 15000,
    price: 99.99,
    bonus: 2000,
    badge: 'Best Value',
    color: 'from-amber-500 to-amber-600',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 50000,
    price: 299.99,
    bonus: 10000,
    badge: 'Premium',
    color: 'from-emerald-500 to-emerald-600',
  },
];

const mockTransactions: Transaction[] = [
  {
    id: 1,
    type: 'purchase',
    description: 'Pro Package - 5000 credits + 500 bonus',
    credits: 5500,
    date: '2024-12-25T10:00:00',
    status: 'completed',
  },
  {
    id: 2,
    type: 'usage',
    description: 'Image generation - Flux 2 Pro',
    credits: -115,
    date: '2024-12-25T09:30:00',
    status: 'completed',
  },
  {
    id: 3,
    type: 'usage',
    description: 'Video generation - Veo 3.1 Fast',
    credits: -280,
    date: '2024-12-25T08:15:00',
    status: 'completed',
  },
];

const usageStats = {
  totalPurchased: 12500,
  totalUsed: 10000,
  remaining: 2500,
  avgPerDay: 520,
  mostUsedModel: 'Flux 2 Pro',
  imagesGenerated: 68,
  videosGenerated: 22,
};

// ============================================
// COMPONENT
// ============================================

export function CreditsManager({ 
  currentCredits = usageStats.remaining,
  onPurchase 
}: CreditsManagerProps) {
  const notify = useNotify();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [transactionsData, analyticsData] = await Promise.all([
          api.fetchTransactions(1, 10).catch(() => ({ transactions: mockTransactions })),
          api.fetchAnalytics().catch(() => usageStats),
        ]);
        
        setTransactions(transactionsData.transactions || mockTransactions);
        setAnalytics(analyticsData || usageStats);
        
      } catch (err) {
        console.error('Credits Manager error:', err);
        setTransactions(mockTransactions);
        setAnalytics(usageStats);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = analytics || usageStats;

  // Table columns
  const columns: DataTableColumn<Transaction>[] = [
    {
      key: 'type',
      header: 'Type',
      accessor: (row) => row.type,
      width: '100px',
      render: (value) => (
        <span className={`
          px-2 py-1 rounded-lg text-sm border
          ${value === 'purchase'
            ? 'bg-green-500/20 border-green-500/30 text-green-700'
            : 'bg-amber-500/20 border-amber-500/30 text-amber-700'
          }
        `}>
          {value === 'purchase' ? 'Purchase' : 'Usage'}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      accessor: (row) => row.description,
      sortable: true,
      render: (value) => (
        <span className="text-[var(--coconut-shell)]">{value}</span>
      ),
    },
    {
      key: 'credits',
      header: 'Credits',
      accessor: (row) => row.credits,
      sortable: true,
      align: 'right',
      render: (value) => (
        <span className={`font-mono ${value > 0 ? 'text-green-700' : 'text-amber-700'}`}>
          {value > 0 ? '+' : ''}{value}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      accessor: (row) => row.date,
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
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      width: '120px',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-sm text-[var(--coconut-shell)] capitalize">{value}</span>
        </div>
      ),
    },
  ];

  const handlePurchasePackage = async (pkg: CreditPackage) => {
    notify.info('Processing payment...', undefined, { duration: 2000 });
    
    setTimeout(() => {
      notify.success(
        'Purchase successful!',
        `${pkg.credits + pkg.bonus} credits have been added to your account`
      );
      onPurchase?.(pkg.id);
    }, 2000);
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
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="flex items-center gap-3 text-[var(--coconut-shell)]">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl flex items-center justify-center backdrop-blur-xl border border-white/40">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
              Credits
            </h1>
            <p className="text-[var(--coconut-husk)] mt-1 text-sm">Manage your credits and purchase packages</p>
          </div>
        </motion.div>

        <AnimatedStaggerContainer>
          
          {/* Current Balance */}
          <AnimatedStaggerItem>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-3xl blur-xl opacity-50" />
              <div className="relative bg-white/70 backdrop-blur-[60px] rounded-2xl shadow-xl p-8 border border-white/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--coconut-husk)] mb-2">Current Balance</p>
                    <motion.h2
                      className="flex items-baseline gap-3"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      <Zap className="w-10 h-10 text-amber-600" />
                      <span className="text-5xl text-[var(--coconut-shell)]">{currentCredits.toLocaleString()}</span>
                      <span className="text-2xl text-[var(--coconut-husk)]">credits</span>
                    </motion.h2>
                    
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center gap-2 text-[var(--coconut-shell)]">
                        <TrendingDown className="w-4 h-4 text-amber-600" />
                        <span className="text-sm">~{stats.avgPerDay} credits/day</span>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--coconut-shell)]">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">~{Math.floor(currentCredits / stats.avgPerDay)} days remaining</span>
                      </div>
                    </div>
                  </div>
                  
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
                        stroke="url(#gradient-balance)"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "0 352" }}
                        animate={{ strokeDasharray: `${(currentCredits / stats.totalPurchased) * 352} 352` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="gradient-balance" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-2xl text-[var(--coconut-shell)]">{Math.round((currentCredits / stats.totalPurchased) * 100)}%</div>
                      <div className="text-xs text-[var(--coconut-husk)]">Remaining</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatedStaggerItem>

          {/* Usage Stats */}
          <AnimatedStaggerItem>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Total Purchased */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl p-6 border border-white/60">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm text-[var(--coconut-husk)]">Total Purchased</h3>
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-3xl text-[var(--coconut-shell)] mb-3">{stats.totalPurchased.toLocaleString()}</p>
                  <div className="w-full bg-white/40 rounded-full h-2 overflow-hidden backdrop-blur-xl">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-600 w-full" />
                  </div>
                </div>
              </motion.div>

              {/* Total Used */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl p-6 border border-white/60">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm text-[var(--coconut-husk)]">Total Used</h3>
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-3xl text-[var(--coconut-shell)] mb-3">{stats.totalUsed.toLocaleString()}</p>
                  <div className="w-full bg-white/40 rounded-full h-2 overflow-hidden backdrop-blur-xl">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.totalUsed / stats.totalPurchased) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Most Used */}
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl p-6 border border-white/60">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm text-[var(--coconut-husk)]">Most Used</h3>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-xl text-[var(--coconut-shell)]">{stats.mostUsedModel}</p>
                  <p className="text-sm text-[var(--coconut-husk)] mt-1">
                    {stats.imagesGenerated} images, {stats.videosGenerated} videos
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatedStaggerItem>

          {/* Credit Packages */}
          <AnimatedStaggerItem>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-2xl text-[var(--coconut-shell)]">Credit Packages</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {creditPackages.map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -8 }}
                    className="relative"
                  >
                    <div className={`absolute -inset-1 bg-gradient-to-br ${pkg.color}/20 rounded-3xl blur-xl opacity-50 ${pkg.popular ? 'opacity-70' : ''}`} />
                    <div className={`relative bg-white/70 backdrop-blur-[60px] rounded-2xl shadow-xl p-6 border ${pkg.popular ? 'border-purple-500/50' : 'border-white/60'}`}>
                      {pkg.badge && (
                        <div className={`
                          absolute -top-3 left-1/2 -translate-x-1/2
                          px-3 py-1 rounded-full text-xs
                          bg-gradient-to-r ${pkg.color} text-white shadow-lg
                          flex items-center gap-1
                        `}>
                          {pkg.popular ? <Star className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                          {pkg.badge}
                        </div>
                      )}
                      
                      <div className="text-center space-y-4">
                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${pkg.color}/10`}>
                          <Package className={`w-8 h-8 ${pkg.popular ? 'text-purple-600' : 'text-[var(--coconut-shell)]'}`} />
                        </div>
                        
                        <div>
                          <h3 className="text-xl text-[var(--coconut-shell)]">{pkg.name}</h3>
                          <p className="text-3xl text-[var(--coconut-shell)] mt-2">
                            ${pkg.price}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <Zap className="w-5 h-5 text-amber-600" />
                            <span className="text-2xl text-[var(--coconut-shell)]">
                              {pkg.credits.toLocaleString()}
                            </span>
                          </div>
                          
                          {pkg.bonus > 0 && (
                            <div className="text-sm text-green-700">
                              + {pkg.bonus} bonus credits
                            </div>
                          )}
                          
                          <p className="text-xs text-[var(--coconut-husk)]">
                            ${(pkg.price / (pkg.credits + pkg.bonus) * 1000).toFixed(2)} per 1000 credits
                          </p>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePurchasePackage(pkg)}
                          className={`w-full px-4 py-3 bg-gradient-to-r ${pkg.color} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2`}
                        >
                          <CreditCard className="w-5 h-5" />
                          Purchase
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatedStaggerItem>

          {/* Transaction History */}
          <AnimatedStaggerItem>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-4"
            >
              <h2 className="text-2xl text-[var(--coconut-shell)]">Transaction History</h2>
              
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-white/70 backdrop-blur-[60px] rounded-xl shadow-xl overflow-hidden border border-white/60">
                  <DataTable
                    data={transactions}
                    columns={columns}
                    pageSize={10}
                    emptyMessage="No transactions yet"
                  />
                </div>
              </div>
            </motion.div>
          </AnimatedStaggerItem>

        </AnimatedStaggerContainer>
      </div>
    </div>
  );
}

export default CreditsManager;
