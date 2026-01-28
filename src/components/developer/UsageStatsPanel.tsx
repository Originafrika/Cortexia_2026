/**
 * USAGE STATS PANEL - Developer Dashboard
 * 
 * Display API usage statistics and metrics
 * Features:
 * - Requests over time chart
 * - Success/error rates
 * - Endpoint breakdown
 * - Rate limit status
 * - Response time metrics
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface UsageData {
  requestsByDay: Array<{ date: string; requests: number; errors: number }>;
  endpointBreakdown: Array<{ endpoint: string; count: number; avgResponseTime: number }>;
  statusCodes: Array<{ code: number; count: number }>;
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  rateLimitStatus: {
    limit: number;
    remaining: number;
    resetAt: string;
  };
}

export function UsageStatsPanel() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadUsageData();
  }, [timeRange]);

  const loadUsageData = async () => {
    try {
      setIsLoading(true);
      console.log('[UsageStatsPanel] Loading usage data for range:', timeRange);

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/developer/usage?range=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[UsageStatsPanel] Usage data loaded:', data);
        setUsageData(data);
      } else {
        console.error('[UsageStatsPanel] Failed to load usage data:', await res.text());
        toast.error('Failed to load usage statistics');
      }
    } catch (error) {
      console.error('[UsageStatsPanel] Error loading usage data:', error);
      toast.error('Error loading usage statistics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cream-200 border-t-cream-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading usage statistics...</p>
        </div>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-cream-100">
        <Activity size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600">No usage data available yet</p>
      </div>
    );
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Usage & Statistics</h2>
          <p className="text-sm text-gray-600">
            Monitor your API usage and performance metrics
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-cream-200">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-cream-50'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Rate Limit Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm mb-1">Rate Limit Status</p>
            <h3 className="text-3xl font-bold mb-2">
              {usageData.rateLimitStatus.remaining.toLocaleString()} / {usageData.rateLimitStatus.limit.toLocaleString()}
            </h3>
            <p className="text-purple-100 text-sm">
              Resets {new Date(usageData.rateLimitStatus.resetAt).toLocaleString()}
            </p>
          </div>
          <div className="w-24 h-24">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(usageData.rateLimitStatus.remaining / usageData.rateLimitStatus.limit) * 251.2} 251.2`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Activity size={20} className="text-blue-600" />
            </div>
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {usageData.totalRequests.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total Requests</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <span className={`text-sm font-medium ${
              usageData.errorRate < 5 ? 'text-green-600' : 'text-amber-600'
            }`}>
              {usageData.errorRate < 5 ? 'Good' : 'Warning'}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {(100 - usageData.errorRate).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Success Rate</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Clock size={20} className="text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">Avg</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {usageData.avgResponseTime}ms
          </p>
          <p className="text-sm text-gray-600">Response Time</p>
        </motion.div>
      </div>

      {/* Requests Over Time Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-600" />
          Requests Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={usageData.requestsByDay}>
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
            <Line 
              type="monotone" 
              dataKey="requests" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Requests"
            />
            <Line 
              type="monotone" 
              dataKey="errors" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 3 }}
              name="Errors"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Endpoint Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-purple-600" />
            Top Endpoints
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageData.endpointBreakdown.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="endpoint" 
                stroke="#9ca3af"
                style={{ fontSize: '11px' }}
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
                dataKey="count" 
                fill="#8b5cf6"
                radius={[8, 8, 0, 0]}
                name="Requests"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Codes Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600" />
            Status Codes Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={usageData.statusCodes}
                dataKey="count"
                nameKey="code"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.code}: ${entry.count}`}
              >
                {usageData.statusCodes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Endpoint Details Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl shadow-sm border border-cream-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-cream-100">
          <h3 className="font-semibold text-gray-900">Endpoint Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Requests
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Avg Response Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {usageData.endpointBreakdown.map((endpoint, index) => (
                <tr key={index} className="hover:bg-cream-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                    {endpoint.endpoint}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-semibold">
                    {endpoint.count.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className={`px-3 py-1 rounded-full font-medium ${
                      endpoint.avgResponseTime < 500
                        ? 'bg-green-100 text-green-700'
                        : endpoint.avgResponseTime < 1000
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {endpoint.avgResponseTime}ms
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
