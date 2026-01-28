/**
 * REFERRAL DASHBOARD - Parrainage System
 * 
 * Complete referral program dashboard
 * Features:
 * - Unique referral link
 * - Copy to clipboard
 * - Share on social media
 * - Referral stats (total referrals, earnings, pending)
 * - Referral list with status
 * - Reward tiers
 * - Leaderboard
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState, useEffect } from 'react';
import { 
  Gift, 
  Copy, 
  Share2, 
  Users, 
  DollarSign, 
  Clock,
  CheckCircle,
  TrendingUp,
  Award,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  currentTier: string;
  nextTierProgress: number; // 0-100
}

interface Referral {
  id: string;
  email: string;
  name?: string;
  status: 'pending' | 'active' | 'converted';
  signupDate: string;
  convertedDate?: string;
  earnings: number;
}

interface RewardTier {
  name: string;
  referralsRequired: number;
  bonusPerReferral: number;
  extraBonus: number;
  color: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  referrals: number;
  earnings: number;
  isCurrentUser?: boolean;
}

const REWARD_TIERS: RewardTier[] = [
  { name: 'Bronze', referralsRequired: 0, bonusPerReferral: 50, extraBonus: 0, color: 'orange' },
  { name: 'Silver', referralsRequired: 5, bonusPerReferral: 75, extraBonus: 100, color: 'gray' },
  { name: 'Gold', referralsRequired: 10, bonusPerReferral: 100, extraBonus: 500, color: 'amber' },
  { name: 'Platinum', referralsRequired: 25, bonusPerReferral: 150, extraBonus: 2000, color: 'purple' },
  { name: 'Diamond', referralsRequired: 50, bonusPerReferral: 200, extraBonus: 5000, color: 'blue' },
];

export function ReferralDashboard() {
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralLink, setReferralLink] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'referrals' | 'leaderboard'>('overview');

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setIsLoading(true);
      console.log('[ReferralDashboard] Loading referral data');

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/referral/dashboard`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[ReferralDashboard] Data loaded:', data);
        
        setReferralCode(data.referralCode);
        setReferralLink(data.referralLink);
        setStats(data.stats);
        setReferrals(data.referrals || []);
        setLeaderboard(data.leaderboard || []);
      } else {
        console.error('[ReferralDashboard] Failed to load data:', await res.text());
        toast.error('Failed to load referral data');
      }
    } catch (error) {
      console.error('[ReferralDashboard] Error loading data:', error);
      toast.error('Error loading referral data');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    } catch (error) {
      console.error('[ReferralDashboard] Error copying to clipboard:', error);
      toast.error('Failed to copy link');
    }
  };

  const shareOnSocial = (platform: 'twitter' | 'facebook' | 'linkedin' | 'email') => {
    const text = `Join me on Cortexia Creation Hub! Use my referral link to get started: ${referralLink}`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(referralLink);

    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        url = `mailto:?subject=Join Cortexia Creation Hub&body=${encodedText}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'converted': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'converted': return <DollarSign size={14} />;
      default: return <Users size={14} />;
    }
  };

  const getCurrentTier = () => {
    if (!stats) return REWARD_TIERS[0];
    
    for (let i = REWARD_TIERS.length - 1; i >= 0; i--) {
      if (stats.totalReferrals >= REWARD_TIERS[i].referralsRequired) {
        return REWARD_TIERS[i];
      }
    }
    return REWARD_TIERS[0];
  };

  const getNextTier = () => {
    const currentTier = getCurrentTier();
    const currentIndex = REWARD_TIERS.findIndex(t => t.name === currentTier.name);
    
    if (currentIndex < REWARD_TIERS.length - 1) {
      return REWARD_TIERS[currentIndex + 1];
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cream-200 border-t-cream-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading referral data...</p>
        </div>
      </div>
    );
  }

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <Gift size={24} className="text-white" />
          </div>
          Referral Program
        </h2>
        <p className="text-gray-600">
          Earn rewards by inviting friends to Cortexia Creation Hub
        </p>
      </div>

      {/* Referral Link Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Your Referral Link</h3>
            <p className="text-purple-100">
              Share this link to earn ${currentTier.bonusPerReferral} per successful referral
            </p>
          </div>
          <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
            <p className="text-sm font-medium">{currentTier.name} Tier</p>
          </div>
        </div>

        {/* Link Display */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 flex items-center gap-3">
          <div className="flex-1 overflow-hidden">
            <p className="text-sm text-purple-100 mb-1">Your unique code</p>
            <p className="text-lg font-mono font-bold truncate">{referralCode}</p>
          </div>
          <button
            onClick={copyToClipboard}
            className="px-6 py-3 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg"
          >
            <Copy size={18} />
            Copy Link
          </button>
        </div>

        {/* Social Share */}
        <div className="flex items-center gap-3">
          <p className="text-sm text-purple-100">Share on:</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => shareOnSocial('twitter')}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Share on Twitter"
            >
              <Twitter size={18} />
            </button>
            <button
              onClick={() => shareOnSocial('facebook')}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Share on Facebook"
            >
              <Facebook size={18} />
            </button>
            <button
              onClick={() => shareOnSocial('linkedin')}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Share on LinkedIn"
            >
              <Linkedin size={18} />
            </button>
            <button
              onClick={() => shareOnSocial('email')}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Share via Email"
            >
              <Mail size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalReferrals}
            </p>
            <p className="text-sm text-gray-600">Total Referrals</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.activeReferrals}
            </p>
            <p className="text-sm text-gray-600">Active Referrals</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock size={24} className="text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.pendingReferrals}
            </p>
            <p className="text-sm text-gray-600">Pending Referrals</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-lg text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <DollarSign size={24} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">
              {formatCurrency(stats.totalEarnings)}
            </p>
            <p className="text-sm text-green-100">Total Earnings</p>
            {stats.pendingEarnings > 0 && (
              <p className="text-xs text-green-200 mt-2">
                +{formatCurrency(stats.pendingEarnings)} pending
              </p>
            )}
          </motion.div>
        </div>
      )}

      {/* Tier Progress */}
      {nextTier && stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Progress to {nextTier.name}</h3>
              <p className="text-sm text-gray-600">
                {stats.totalReferrals} / {nextTier.referralsRequired} referrals
              </p>
            </div>
            <Award size={24} className={`text-${nextTier.color}-600`} />
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className={`bg-gradient-to-r from-${nextTier.color}-500 to-${nextTier.color}-600 h-3 rounded-full transition-all duration-500`}
              style={{ width: `${stats.nextTierProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600">
              {nextTier.referralsRequired - stats.totalReferrals} more referrals to unlock
            </p>
            <p className="font-semibold text-gray-900">
              +{formatCurrency(nextTier.extraBonus)} bonus
            </p>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-cream-100">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
            selectedTab === 'overview'
              ? 'text-purple-600 border-purple-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedTab('referrals')}
          className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
            selectedTab === 'referrals'
              ? 'text-purple-600 border-purple-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Your Referrals ({referrals.length})
        </button>
        <button
          onClick={() => setSelectedTab('leaderboard')}
          className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
            selectedTab === 'leaderboard'
              ? 'text-purple-600 border-purple-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Leaderboard
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Reward Tiers</h3>
          <div className="space-y-4">
            {REWARD_TIERS.map((tier, index) => (
              <div
                key={tier.name}
                className={`p-4 rounded-xl border-2 ${
                  tier.name === currentTier.name
                    ? `border-${tier.color}-500 bg-${tier.color}-50`
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award size={24} className={`text-${tier.color}-600`} />
                    <div>
                      <h4 className="font-semibold text-gray-900">{tier.name}</h4>
                      <p className="text-sm text-gray-600">
                        {tier.referralsRequired === 0 
                          ? 'Starting tier' 
                          : `${tier.referralsRequired}+ referrals`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatCurrency(tier.bonusPerReferral)}/referral
                    </p>
                    {tier.extraBonus > 0 && (
                      <p className="text-sm text-gray-600">
                        +{formatCurrency(tier.extraBonus)} unlock bonus
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {selectedTab === 'referrals' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          {referrals.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-2">No referrals yet</p>
              <p className="text-sm text-gray-500">Share your referral link to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {referral.name || referral.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        Joined {formatDate(referral.signupDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatCurrency(referral.earnings)}
                      </p>
                      {referral.status === 'pending' && (
                        <p className="text-xs text-gray-500">Pending</p>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-lg border flex items-center gap-1 text-sm font-medium ${getStatusColor(referral.status)}`}>
                      {getStatusIcon(referral.status)}
                      <span className="capitalize">{referral.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {selectedTab === 'leaderboard' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-600" />
            Top Referrers
          </h3>

          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Award size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">Leaderboard coming soon!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    entry.isCurrentUser
                      ? 'bg-purple-50 border-2 border-purple-200'
                      : 'bg-cream-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                      entry.rank === 1 ? 'bg-amber-100 text-amber-700' :
                      entry.rank === 2 ? 'bg-gray-200 text-gray-700' :
                      entry.rank === 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      #{entry.rank}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users size={20} className="text-gray-600" />
                    </div>

                    {/* Name */}
                    <div>
                      <p className="font-medium text-gray-900">
                        {entry.name}
                        {entry.isCurrentUser && (
                          <span className="ml-2 text-xs text-purple-600 font-semibold">(You)</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {entry.referrals} referrals
                      </p>
                    </div>
                  </div>

                  {/* Earnings */}
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatCurrency(entry.earnings)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
