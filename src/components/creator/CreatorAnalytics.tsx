/**
 * CREATOR ANALYTICS - Creator System
 * 
 * Advanced analytics for creators
 * Features:
 * - Views over time chart
 * - Engagement metrics
 * - Audience demographics
 * - Revenue breakdown
 * - Export reports
 * - Performance insights
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Download, 
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

interface AnalyticsData {
  viewsOverTime: Array<{ date: string; views: number; engagement: number }>;
  audienceDemographics: {
    byCountry: Array<{ country: string; percentage: number }>;
    byAge: Array<{ ageGroup: string; percentage: number }>;
    byDevice: Array<{ device: string; percentage: number }>;
  };
  revenueBreakdown: Array<{ source: string; amount: number }>;
  engagementMetrics: {
    averageTimeSpent: number;
    bounceRate: number;
    returnVisitorRate: number;
    shareRate: number;
  };
  performanceInsights: Array<{
    id: string;
    metric: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    insight: string;
  }>;
}

interface CreatorAnalyticsProps {
  timeRange?: '7d' | '30d' | '90d' | 'all';
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export function CreatorAnalytics({ timeRange = '30d' }: CreatorAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '90d' | 'all'>(timeRange);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [selectedRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      console.log('[CreatorAnalytics] Loading analytics for range:', selectedRange);

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/creator/analytics?range=${selectedRange}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[CreatorAnalytics] Analytics loaded:', data);
        setAnalytics(data);
      } else {
        console.error('[CreatorAnalytics] Failed to load analytics:', await res.text());
        toast.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('[CreatorAnalytics] Error loading analytics:', error);
      toast.error('Error loading analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/creator/analytics/export?range=${selectedRange}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${selectedRange}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Analytics exported successfully!');
      } else {
        toast.error('Failed to export analytics');
      }
    } catch (error) {
      console.error('[CreatorAnalytics] Error exporting analytics:', error);
      toast.error('Error exporting analytics');
    } finally {
      setIsExporting(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp size={16} className="text-green-600" />;
    if (trend === 'down') return <TrendingUp size={16} className="text-red-600 rotate-180" />;
    return <Activity size={16} className="text-gray-600" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cream-200 border-t-cream-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-cream-100">
        <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600">No analytics data available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Creator Analytics</h2>
          <p className="text-sm text-gray-600">
            Deep insights into your audience and performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-cream-200">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedRange === range
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-cream-50'
                }`}
              >
                {range === '7d' ? '7D' : range === '30d' ? '30D' : range === '90d' ? '90D' : 'All'}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={18} />
                Export Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {analytics.engagementMetrics.averageTimeSpent}s
          </p>
          <p className="text-sm text-gray-600">Avg. Time Spent</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Target size={20} className="text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {analytics.engagementMetrics.bounceRate}%
          </p>
          <p className="text-sm text-gray-600">Bounce Rate</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users size={20} className="text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {analytics.engagementMetrics.returnVisitorRate}%
          </p>
          <p className="text-sm text-gray-600">Return Visitors</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {analytics.engagementMetrics.shareRate}%
          </p>
          <p className="text-sm text-gray-600">Share Rate</p>
        </motion.div>
      </div>

      {/* Views Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-600" />
          Views & Engagement Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.viewsOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="views" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Views"
            />
            <Line 
              type="monotone" 
              dataKey="engagement" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 3 }}
              name="Engagement %"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audience by Country */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={20} className="text-green-600" />
            Audience by Country
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.audienceDemographics.byCountry}
                dataKey="percentage"
                nameKey="country"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.country}: ${entry.percentage}%`}
              >
                {analytics.audienceDemographics.byCountry.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Audience by Device */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-purple-600" />
            Audience by Device
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.audienceDemographics.byDevice}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="device" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px'
                }}
              />
              <Bar 
                dataKey="percentage" 
                fill="#8b5cf6"
                radius={[8, 8, 0, 0]}
                name="Percentage %"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-amber-600" />
            Revenue Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.revenueBreakdown}
                dataKey="amount"
                nameKey="source"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.source}: $${entry.amount}`}
              >
                {analytics.revenueBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Age Demographics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Audience by Age
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.audienceDemographics.byAge}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="ageGroup" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px'
                }}
              />
              <Bar 
                dataKey="percentage" 
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                name="Percentage %"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target size={20} className="text-purple-600" />
          Performance Insights
        </h3>

        <div className="space-y-4">
          {analytics.performanceInsights.map((insight) => (
            <div
              key={insight.id}
              className="flex items-start gap-4 p-4 bg-cream-50 rounded-xl"
            >
              <div className="w-10 h-10 rounded-lg bg-white border border-cream-200 flex items-center justify-center flex-shrink-0">
                {getTrendIcon(insight.trend)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">{insight.metric}</h4>
                  <span className="text-lg font-bold text-gray-900">{insight.value}</span>
                </div>
                <p className="text-sm text-gray-600">{insight.insight}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
