/**
 * COCONUT V14 - CREDITS MANAGER ULTRA-PREMIUM
 * Flexible credit purchase system
 * 
 * Pricing Model:
 * - Pay-as-you-go (no subscriptions)
 * - $0.10 per credit ($1.00 per 10 credits)
 * 
 * Minimums:
 * - Normal users: 10 credits minimum ($1.00)
 * - Enterprise: 10,000 credits minimum ($1,000.00)
 * - Enterprise recharge: 1,000 credits minimum ($100.00)
 * 
 * Usage:
 * - Gemini Analysis: 100 credits
 * - Flux 2 Pro: 1-9 credits per generation
 * - Complete workflow: ~115 credits
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DataTable, DataTableColumn } from '../ui-premium/DataTable';
import { useNotify } from '../coconut-v14/NotificationProvider';
import { useSoundContext } from './SoundProvider';
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
  Sparkles,
  RefreshCw,
  Activity,
  Image,
  Video,
  Brain,
  Flame,
  Target,
  ArrowRight,
  CheckCircle,
  XCircle,
  Building2,
  User,
  Plus,
  Minus,
  ShoppingCart,
  Info
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

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
  onPurchase?: (credits: number, amount: number) => void;
  isEnterprise?: boolean;
}

// ============================================
// MOCK DATA
// ============================================

const mockTransactions: Transaction[] = [
  {
    id: 1,
    type: 'purchase',
    description: 'Credits purchase - 500 credits',
    credits: 500,
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
  {
    id: 4,
    type: 'purchase',
    description: 'Credits purchase - 100 credits',
    credits: 100,
    date: '2024-12-24T14:20:00',
    status: 'completed',
  },
  {
    id: 5,
    type: 'usage',
    description: 'AI Analysis - Gemini 2.5 Flash',
    credits: -100,
    date: '2024-12-24T13:45:00',
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

// Quick buy presets for normal users
const quickBuyPresets = [
  { credits: 100, popular: false },
  { credits: 500, popular: true },
  { credits: 1000, popular: false },
  { credits: 5000, popular: false },
];

// ============================================
// COMPONENT
// ============================================

export function CreditsManager({ 
  currentCredits = usageStats.remaining,
  onPurchase,
  isEnterprise = false
}: CreditsManagerProps) {
  const notify = useNotify();
  const { playClick, playSuccess, playPop } = useSoundContext();
  const [purchaseAmount, setPurchaseAmount] = useState(isEnterprise ? 10000 : 100);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const minimumPurchase = isEnterprise ? 10000 : 10;
  const pricePerCredit = 0.10;
  const totalPrice = purchaseAmount * pricePerCredit;

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [transactionsData, analyticsData] = await Promise.all([
          api.fetchTransactions(1, 10, true).catch(() => ({
            transactions: mockTransactions
          })),
          api.fetchAnalytics(true).catch(() => usageStats),
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

  // Handle purchase amount change
  const handleAmountChange = (value: string) => {
    const num = parseInt(value) || 0;
    setPurchaseAmount(Math.max(minimumPurchase, num));
    playPop();
  };

  // Quick increment/decrement
  const incrementAmount = (delta: number) => {
    setPurchaseAmount(prev => Math.max(minimumPurchase, prev + delta));
    playPop();
  };

  // Handle purchase
  const handlePurchase = async () => {
    if (purchaseAmount < minimumPurchase) {
      notify.error(
        'Minimum not met',
        `Minimum purchase is ${minimumPurchase} credits`
      );
      return;
    }

    playClick();
    setPurchasing(true);
    
    setTimeout(() => {
      playSuccess();
      notify.success(
        'Purchase successful!',
        `${purchaseAmount} credits have been added to your account`
      );
      onPurchase?.(purchaseAmount, totalPrice);
      setPurchasing(false);
    }, 2000);
  };

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
            ? 'bg-[var(--coconut-palm)]/20 border-[var(--coconut-palm)]/30 text-[var(--coconut-palm)]'
            : 'bg-[var(--coconut-husk)]/20 border-[var(--coconut-husk)]/30 text-[var(--coconut-shell)]'
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
        <span className={`font-mono ${value > 0 ? 'text-[var(--coconut-palm)]' : 'text-[var(--coconut-shell)]'}`}>
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
          {value === 'completed' ? (
            <CheckCircle className="w-4 h-4 text-[var(--coconut-palm)]" />
          ) : value === 'failed' ? (
            <XCircle className="w-4 h-4 text-red-500" />
          ) : (
            <Clock className="w-4 h-4 text-amber-500" />
          )}
          <span className="text-sm text-[var(--coconut-shell)] capitalize">{value}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--coconut-white)] relative overflow-hidden">
      {/* Premium animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] opacity-60" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,165,116,0.08)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(107,142,112,0.06)_0%,transparent_50%)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-xl mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl text-[var(--coconut-shell)] mb-3">
            Credits Management
          </h1>
          <p className="text-base md:text-lg text-[var(--coconut-husk)] max-w-2xl mx-auto">
            Pay-as-you-go • $0.10 per credit • No subscription required
          </p>
        </motion.div>

        {/* Current Balance Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/20 rounded-3xl blur-2xl opacity-50 animate-pulse" />
          <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 lg:p-10 border border-white/60">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              
              {/* Left: Balance Info */}
              <div>
                <div className="flex items-center gap-2 text-sm text-[var(--coconut-husk)] mb-3">
                  <Activity className="w-4 h-4" />
                  <span>Current Balance</span>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="flex items-baseline gap-3 mb-6"
                >
                  <Zap className="w-10 h-10 md:w-12 md:h-12 text-amber-500" />
                  <span className="text-5xl md:text-6xl lg:text-7xl text-[var(--coconut-shell)] font-bold">
                    {currentCredits.toLocaleString()}
                  </span>
                  <span className="text-xl md:text-2xl text-[var(--coconut-husk)] font-medium">credits</span>
                </motion.div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/50 backdrop-blur-xl rounded-xl border border-white/40">
                    <div className="flex items-center gap-2 text-[var(--coconut-husk)] text-xs mb-1">
                      <TrendingDown className="w-3 h-3" />
                      <span>Daily Usage</span>
                    </div>
                    <div className="text-2xl text-[var(--coconut-shell)] font-bold">~{stats.avgPerDay}</div>
                  </div>
                  
                  <div className="p-4 bg-white/50 backdrop-blur-xl rounded-xl border border-white/40">
                    <div className="flex items-center gap-2 text-[var(--coconut-husk)] text-xs mb-1">
                      <Clock className="w-3 h-3" />
                      <span>Days Left</span>
                    </div>
                    <div className="text-2xl text-[var(--coconut-shell)] font-bold">~{Math.floor(currentCredits / stats.avgPerDay)}</div>
                  </div>
                </div>
              </div>

              {/* Right: Progress Ring */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <svg className="w-48 h-48 md:w-56 md:h-56 transform -rotate-90">
                    <circle
                      cx="112"
                      cy="112"
                      r="100"
                      stroke="rgba(139, 115, 85, 0.1)"
                      strokeWidth="16"
                      fill="none"
                    />
                    <motion.circle
                      cx="112"
                      cy="112"
                      r="100"
                      stroke="url(#gradient-balance)"
                      strokeWidth="16"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 628" }}
                      animate={{ strokeDasharray: `${(currentCredits / stats.totalPurchased) * 628} 628` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="gradient-balance" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="50%" stopColor="#D97706" />
                        <stop offset="100%" stopColor="#F59E0B" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl md:text-5xl text-[var(--coconut-shell)] font-bold">
                      {Math.round((currentCredits / stats.totalPurchased) * 100)}%
                    </div>
                    <div className="text-sm text-[var(--coconut-husk)] mt-1 font-medium">Remaining</div>
                    <div className="text-xs text-[var(--coconut-husk)] mt-2">
                      of {stats.totalPurchased.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Purchase Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          
          {/* Purchase Card - 2 cols */}
          <div className="lg:col-span-2 relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 md:p-8 border border-white/60">
              
              {/* Account Type Badge */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-[var(--coconut-shell)]">Purchase Credits</h2>
                <div className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
                  isEnterprise 
                    ? 'bg-[var(--coconut-palm)]/20 border border-[var(--coconut-palm)]/30 text-[var(--coconut-palm)]'
                    : 'bg-[var(--coconut-shell)]/20 border border-[var(--coconut-shell)]/30 text-[var(--coconut-shell)]'
                }`}>
                  {isEnterprise ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  {isEnterprise ? 'Enterprise Account' : 'Personal Account'}
                </div>
              </div>

              {/* Quick Buy Presets (Normal users only) */}
              {!isEnterprise && (
                <div className="mb-6">
                  <label className="text-sm text-[var(--coconut-husk)] mb-3 block">Quick Buy</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {quickBuyPresets.map((preset) => (
                      <motion.button
                        key={preset.credits}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setPurchaseAmount(preset.credits);
                          playPop();
                        }}
                        className={`
                          relative p-4 rounded-xl border transition-all duration-300
                          ${purchaseAmount === preset.credits
                            ? 'bg-white/80 border-amber-500/50 shadow-lg'
                            : 'bg-white/50 border-white/40 hover:bg-white/70'
                          }
                        `}
                      >
                        {preset.popular && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className="text-xl text-[var(--coconut-shell)]">{preset.credits}</div>
                        <div className="text-xs text-[var(--coconut-husk)] mt-1">
                          ${(preset.credits * pricePerCredit).toFixed(2)}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Amount Input */}
              <div className="space-y-4">
                <label className="text-sm text-[var(--coconut-husk)] block">
                  {isEnterprise ? 'Custom Amount' : 'Or enter custom amount'}
                </label>
                
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => incrementAmount(isEnterprise ? -1000 : -10)}
                    className="w-12 h-12 bg-white/60 backdrop-blur-xl hover:bg-white/80 rounded-xl flex items-center justify-center border border-white/40 shadow-lg transition-all duration-300"
                  >
                    <Minus className="w-5 h-5 text-[var(--coconut-shell)]" />
                  </motion.button>
                  
                  <input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    min={minimumPurchase}
                    step={isEnterprise ? 1000 : 10}
                    className="flex-1 px-6 py-4 bg-white/60 backdrop-blur-xl rounded-xl border border-white/40 text-center text-3xl text-[var(--coconut-shell)] focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                  />
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => incrementAmount(isEnterprise ? 1000 : 10)}
                    className="w-12 h-12 bg-white/60 backdrop-blur-xl hover:bg-white/80 rounded-xl flex items-center justify-center border border-white/40 shadow-lg transition-all duration-300"
                  >
                    <Plus className="w-5 h-5 text-[var(--coconut-shell)]" />
                  </motion.button>
                </div>

                <div className="flex items-start gap-2 p-3 bg-white/50 backdrop-blur-xl rounded-lg border border-white/40">
                  <Info className="w-4 h-4 text-[var(--coconut-husk)] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[var(--coconut-husk)]">
                    Minimum purchase: {minimumPurchase.toLocaleString()} credits 
                    (${(minimumPurchase * pricePerCredit).toFixed(2)})
                  </p>
                </div>
              </div>

              {/* Total & Purchase Button */}
              <div className="mt-6 pt-6 border-t border-[var(--coconut-husk)]/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg text-[var(--coconut-husk)]">Total</span>
                  <div className="text-right">
                    <div className="text-3xl text-[var(--coconut-shell)]">
                      ${totalPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-[var(--coconut-husk)]">
                      for {purchaseAmount.toLocaleString()} credits
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePurchase}
                  disabled={purchasing || purchaseAmount < minimumPurchase}
                  className="w-full relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-husk)] to-[var(--coconut-shell)] bg-[length:200%_100%] animate-gradient" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="relative px-6 py-4 flex items-center justify-center gap-3 rounded-xl">
                    {purchasing ? (
                      <>
                        <RefreshCw className="w-5 h-5 text-white animate-spin" />
                        <span className="text-white text-lg">Processing...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 text-white" />
                        <span className="text-white text-lg">Purchase Now</span>
                      </>
                    )}
                  </div>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Pricing Info Card - 1 col */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/60 h-full">
              <h3 className="text-lg text-[var(--coconut-shell)] mb-4">Pricing Details</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/50 backdrop-blur-xl rounded-xl border border-white/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--coconut-husk)]">Price per credit</span>
                    <span className="text-xl text-[var(--coconut-shell)]">$0.10</span>
                  </div>
                  <div className="text-xs text-[var(--coconut-husk)]">
                    Fixed rate • No tiers
                  </div>
                </div>

                <div className="p-4 bg-white/50 backdrop-blur-xl rounded-xl border border-white/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--coconut-husk)]">Complete workflow</span>
                    <span className="text-xl text-[var(--coconut-shell)]">~115</span>
                  </div>
                  <div className="text-xs text-[var(--coconut-husk)]">
                    Analysis (100) + Generation (1-9) + Refs (1-8)
                  </div>
                </div>

                <div className="p-4 bg-white/50 backdrop-blur-xl rounded-xl border border-white/40">
                  <div className="text-sm text-[var(--coconut-husk)] mb-2">Usage breakdown</div>
                  <div className="space-y-2 text-xs text-[var(--coconut-husk)]">
                    <div className="flex items-center gap-2">
                      <Brain className="w-3 h-3" />
                      <span>Gemini Analysis: 100 credits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Image className="w-3 h-3" />
                      <span>Flux 2 Pro 1K: 1 credit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Image className="w-3 h-3" />
                      <span>Flux 2 Pro 2K: 2 credits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="w-3 h-3" />
                      <span>+1 credit per reference (max 8)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[var(--coconut-cream)]/30 backdrop-blur-xl rounded-xl border border-[var(--coconut-palm)]/30">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--coconut-palm)] flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-[var(--coconut-shell)]">
                      <div className="mb-1">Credits never expire</div>
                      <div>No monthly fees or subscriptions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Usage Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
        >
          {/* Total Purchased */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-palm)]/30 to-[var(--coconut-husk)]/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-white/60">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-palm)]/20 to-[var(--coconut-husk)]/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[var(--coconut-palm)]" />
                </div>
                <div className="text-xs text-[var(--coconut-husk)] bg-white/50 px-2 py-1 rounded-lg">
                  All time
                </div>
              </div>
              <div className="text-3xl md:text-4xl text-[var(--coconut-shell)] mb-2">
                {stats.totalPurchased.toLocaleString()}
              </div>
              <div className="text-sm text-[var(--coconut-husk)] mb-4">Total Purchased</div>
              <div className="w-full bg-white/40 rounded-full h-2 overflow-hidden backdrop-blur-xl">
                <div className="h-full bg-gradient-to-r from-[var(--coconut-palm)] to-[var(--coconut-husk)] w-full" />
              </div>
            </div>
          </motion.div>

          {/* Total Used */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/30 to-amber-600/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-white/60">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-xs text-[var(--coconut-husk)] bg-white/50 px-2 py-1 rounded-lg flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Active
                </div>
              </div>
              <div className="text-3xl md:text-4xl text-[var(--coconut-shell)] mb-2">
                {stats.totalUsed.toLocaleString()}
              </div>
              <div className="text-sm text-[var(--coconut-husk)] mb-4">Total Used</div>
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

          {/* Most Used Model */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-shell)]/30 to-[var(--coconut-husk)]/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-white/60">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[var(--coconut-shell)]" />
                </div>
                <div className="text-xs text-[var(--coconut-husk)] bg-white/50 px-2 py-1 rounded-lg flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Top
                </div>
              </div>
              <div className="text-xl md:text-2xl text-[var(--coconut-shell)] mb-2">
                {stats.mostUsedModel}
              </div>
              <div className="text-sm text-[var(--coconut-husk)] mb-3">Most Used Model</div>
              <div className="flex items-center gap-3 text-sm text-[var(--coconut-husk)]">
                <div className="flex items-center gap-1">
                  <Image className="w-4 h-4" />
                  <span>{stats.imagesGenerated}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  <span>{stats.videosGenerated}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl text-[var(--coconut-shell)]">Recent Transactions</h2>
            <button
              onClick={() => {
                playClick();
                notify.info('History', 'Opening full transaction history...');
              }}
              className="text-sm text-[var(--coconut-husk)] hover:text-[var(--coconut-shell)] transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-cream)]/40 to-[var(--coconut-milk)]/40 rounded-2xl blur-lg opacity-50" />
            <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl overflow-hidden border border-white/60">
              <DataTable
                data={transactions}
                columns={columns}
                pageSize={5}
                emptyMessage="No transactions yet"
              />
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default CreditsManager;