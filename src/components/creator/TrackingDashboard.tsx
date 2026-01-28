/**
 * TRACKING DASHBOARD - Creator System
 * 
 * Track creation performance
 * Features:
 * - Total views/likes/shares
 * - Revenue tracking
 * - Top performing creations
 * - Recent activity
 * - Engagement metrics
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState, useEffect } from 'react';
import { Eye, Heart, Share2, DollarSign, TrendingUp, TrendingDown, Image as ImageIcon, Clock, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface CreationStats {
  id: string;
  imageUrl: string;
  title: string;
  views: number;
  likes: number;
  shares: number;
  revenue: number;
  createdAt: string;
  engagement: number; // Engagement rate percentage
}

interface DashboardStats {
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalRevenue: number;
  viewsChange: number; // % change from last period
  likesChange: number;
  sharesChange: number;
  revenueChange: number;
  topCreations: CreationStats[];
  recentActivity: Array<{
    id: string;
    type: 'view' | 'like' | 'share' | 'revenue';
    creationTitle: string;
    amount?: number;
    timestamp: string;
  }>;
}

interface TrackingDashboardProps {
  timeRange?: '7d' | '30d' | '90d' | 'all';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | 'all') => void;
}

export function TrackingDashboard({ timeRange = '30d', onTimeRangeChange }: TrackingDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '90d' | 'all'>(timeRange);

  useEffect(() => {
    loadStats();
  }, [selectedRange]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      console.log('[TrackingDashboard] Loading stats for range:', selectedRange);

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/creator/tracking?range=${selectedRange}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[TrackingDashboard] Stats loaded:', data);
        setStats(data);
      } else {
        console.error('[TrackingDashboard] Failed to load stats:', await res.text());
        toast.error('Failed to load tracking data');
      }
    } catch (error) {
      console.error('[TrackingDashboard] Error loading stats:', error);
      toast.error('Error loading tracking data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRangeChange = (range: '7d' | '30d' | '90d' | 'all') => {
    setSelectedRange(range);
    onTimeRangeChange?.(range);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view': return <Eye size={16} className="text-blue-600" />;
      case 'like': return <Heart size={16} className="text-red-600" />;
      case 'share': return <Share2 size={16} className="text-green-600" />;
      case 'revenue': return <DollarSign size={16} className="text-amber-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'view': return 'bg-blue-50 border-blue-200';
      case 'like': return 'bg-red-50 border-red-200';
      case 'share': return 'bg-green-50 border-green-200';
      case 'revenue': return 'bg-amber-50 border-amber-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cream-200 border-t-cream-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading tracking data...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-cream-100">
        <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600">No tracking data available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Performance Tracking</h2>
          <p className="text-sm text-gray-600">
            Monitor your creation's performance and earnings
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-cream-200">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => handleRangeChange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedRange === range
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-cream-50'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Views */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Eye size={24} className="text-blue-600" />
            </div>
            {stats.viewsChange !== 0 && (
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stats.viewsChange > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.viewsChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(stats.viewsChange)}%
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatNumber(stats.totalViews)}
          </p>
          <p className="text-sm text-gray-600">Total Views</p>
        </motion.div>

        {/* Total Likes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <Heart size={24} className="text-red-600" />
            </div>
            {stats.likesChange !== 0 && (
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stats.likesChange > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.likesChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(stats.likesChange)}%
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatNumber(stats.totalLikes)}
          </p>
          <p className="text-sm text-gray-600">Total Likes</p>
        </motion.div>

        {/* Total Shares */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Share2 size={24} className="text-green-600" />
            </div>
            {stats.sharesChange !== 0 && (
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stats.sharesChange > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.sharesChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(stats.sharesChange)}%
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatNumber(stats.totalShares)}
          </p>
          <p className="text-sm text-gray-600">Total Shares</p>
        </motion.div>

        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 shadow-lg text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <DollarSign size={24} className="text-white" />
            </div>
            {stats.revenueChange !== 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-white/90">
                {stats.revenueChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(stats.revenueChange)}%
              </div>
            )}
          </div>
          <p className="text-3xl font-bold mb-1">
            {formatCurrency(stats.totalRevenue)}
          </p>
          <p className="text-sm text-white/80">Total Revenue</p>
        </motion.div>
      </div>

      {/* Top Performing Creations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award size={20} className="text-amber-600" />
          Top Performing Creations
        </h3>

        {stats.topCreations.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No creations yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.topCreations.map((creation, index) => (
              <div
                key={creation.id}
                className="flex items-center gap-4 p-4 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors"
              >
                {/* Rank Badge */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-amber-100 text-amber-700' :
                  index === 1 ? 'bg-gray-200 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  #{index + 1}
                </div>

                {/* Image */}
                <img
                  src={creation.imageUrl}
                  alt={creation.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate mb-1">
                    {creation.title}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Eye size={14} />
                      <span>{formatNumber(creation.views)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart size={14} />
                      <span>{formatNumber(creation.likes)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 size={14} />
                      <span>{formatNumber(creation.shares)}</span>
                    </div>
                  </div>
                </div>

                {/* Engagement & Revenue */}
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(creation.revenue)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {creation.engagement.toFixed(1)}% engagement
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock size={20} className="text-blue-600" />
          Recent Activity
        </h3>

        {stats.recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <Clock size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${getActivityColor(activity.type)}`}
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-cream-200 flex items-center justify-center flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold capitalize">{activity.type}</span>
                    {' on '}
                    <span className="font-medium">{activity.creationTitle}</span>
                  </p>
                  {activity.amount && (
                    <p className="text-xs text-gray-600">
                      +{formatCurrency(activity.amount)}
                    </p>
                  )}
                </div>

                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
