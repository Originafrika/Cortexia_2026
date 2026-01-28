/**
 * DEVELOPER DASHBOARD - Developer Profile Feature
 * 
 * Main dashboard for developer accounts
 * Features:
 * - API keys management
 * - Usage statistics
 * - Rate limits
 * - Documentation quick links
 * - Webhooks management
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState, useEffect } from 'react';
import { Key, Activity, Book, Zap, AlertCircle, Plus, TrendingUp, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../lib/contexts/AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { ApiKeysPanel } from './ApiKeysPanel';
import { UsageStatsPanel } from './UsageStatsPanel';
import { WebhooksPanel } from './WebhooksPanel';
import { DocumentationPanel } from './DocumentationPanel';

interface DeveloperStats {
  totalRequests: number;
  requestsThisMonth: number;
  successRate: number;
  activeApiKeys: number;
  remainingQuota: number;
  webhooksConfigured: number;
}

interface DeveloperDashboardProps {
  onNavigate?: (view: string) => void;
}

export function DeveloperDashboard({ onNavigate }: DeveloperDashboardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DeveloperStats>({
    totalRequests: 0,
    requestsThisMonth: 0,
    successRate: 0,
    activeApiKeys: 0,
    remainingQuota: 0,
    webhooksConfigured: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'keys' | 'stats' | 'webhooks' | 'docs'>('keys');

  useEffect(() => {
    loadDeveloperStats();
  }, []);

  const loadDeveloperStats = async () => {
    try {
      setIsLoading(true);
      console.log('[DeveloperDashboard] Loading developer stats');

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      // ✅ FIXED: Load from multiple endpoints
      const [keysRes, usageRes, webhooksRes] = await Promise.all([
        fetch(`${apiUrl}/developer/api-keys?userId=${user?.id}`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`${apiUrl}/developer/usage?userId=${user?.id}`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`${apiUrl}/developer/webhooks?userId=${user?.id}`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        })
      ]);

      let apiKeys = [];
      let usageData = { totalRequests: 0, totalImages: 0, totalVideos: 0 };
      let webhooks = [];

      if (keysRes.ok) {
        const data = await keysRes.json();
        apiKeys = data.data?.apiKeys || [];
      }

      if (usageRes.ok) {
        const data = await usageRes.json();
        usageData = data.data?.stats || usageData;
      }

      if (webhooksRes.ok) {
        const data = await webhooksRes.json();
        webhooks = data.data?.webhooks || [];
      }

      // Calculate stats
      const activeKeys = apiKeys.filter((k: any) => k.status === 'active').length;
      const successRate = usageData.totalRequests > 0 
        ? Math.round(((usageData.totalRequests - 0) / usageData.totalRequests) * 100)
        : 100;

      setStats({
        totalRequests: usageData.totalRequests || 0,
        requestsThisMonth: usageData.totalRequests || 0, // TODO: Filter by month
        successRate,
        activeApiKeys: activeKeys,
        remainingQuota: 10000 - (usageData.totalRequests || 0), // TODO: Get from user plan
        webhooksConfigured: webhooks.length
      });

      console.log('[DeveloperDashboard] Stats loaded successfully');
    } catch (error) {
      console.error('[DeveloperDashboard] Error loading stats:', error);
      toast.error('Error loading developer stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cream-200 border-t-cream-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading developer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Code size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Developer Dashboard
              </h1>
              <p className="text-gray-600">
                Manage API keys, monitor usage, and integrate Cortexia into your apps
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Activity size={24} className="text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                This Month
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.requestsThisMonth.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">API Requests</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <TrendingUp size={14} className="text-green-600" />
              <span>{stats.totalRequests.toLocaleString()} total</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Zap size={24} className="text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Success
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.successRate}%
            </p>
            <p className="text-sm text-gray-600">Success Rate</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${stats.successRate}%` }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Key size={24} className="text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                Active
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stats.activeApiKeys}
            </p>
            <p className="text-sm text-gray-600">API Keys</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <AlertCircle size={14} />
              <span>Max 5 keys per account</span>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 mb-8 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-1">
                {stats.remainingQuota.toLocaleString()} Credits
              </h3>
              <p className="text-amber-50 text-sm">
                Remaining this month • Resets in {30 - new Date().getDate()} days
              </p>
            </div>
            <button
              onClick={() => onNavigate?.('wallet')}
              className="px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:shadow-xl transition-all duration-200"
            >
              Add Credits
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-cream-100 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('keys')}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
              selectedTab === 'keys'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <Key size={18} className="inline mr-2" />
            API Keys
          </button>
          <button
            onClick={() => setSelectedTab('stats')}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
              selectedTab === 'stats'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <Activity size={18} className="inline mr-2" />
            Usage & Stats
          </button>
          <button
            onClick={() => setSelectedTab('webhooks')}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
              selectedTab === 'webhooks'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <Zap size={18} className="inline mr-2" />
            Webhooks ({stats.webhooksConfigured})
          </button>
          <button
            onClick={() => setSelectedTab('docs')}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
              selectedTab === 'docs'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <Book size={18} className="inline mr-2" />
            Documentation
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'keys' && (
            <motion.div
              key="keys"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ApiKeysPanel onUpdate={loadDeveloperStats} />
            </motion.div>
          )}

          {selectedTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <UsageStatsPanel />
            </motion.div>
          )}

          {selectedTab === 'webhooks' && (
            <motion.div
              key="webhooks"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <WebhooksPanel onUpdate={loadDeveloperStats} />
            </motion.div>
          )}

          {selectedTab === 'docs' && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DocumentationPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}