/**
 * CREATOR SYSTEM - Main Dashboard
 * 
 * Centralized creator features
 * Features:
 * - Watermark editor
 * - Tracking dashboard
 * - Analytics
 * - Tabs navigation
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState } from 'react';
import { Palette, Activity, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WatermarkEditor } from './WatermarkEditor';
import { TrackingDashboard } from './TrackingDashboard';
import { CreatorAnalytics } from './CreatorAnalytics';

type CreatorTab = 'watermark' | 'tracking' | 'analytics';

interface CreatorSystemProps {
  onNavigate?: (view: string) => void;
}

export function CreatorSystem({ onNavigate }: CreatorSystemProps) {
  const [selectedTab, setSelectedTab] = useState<CreatorTab>('tracking');

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <BarChart3 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Creator Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your watermark, track performance, and analyze your audience
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-cream-100 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('tracking')}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
              selectedTab === 'tracking'
                ? 'text-purple-600 border-purple-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <Activity size={18} className="inline mr-2" />
            Performance
          </button>
          <button
            onClick={() => setSelectedTab('analytics')}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
              selectedTab === 'analytics'
                ? 'text-purple-600 border-purple-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <BarChart3 size={18} className="inline mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setSelectedTab('watermark')}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
              selectedTab === 'watermark'
                ? 'text-purple-600 border-purple-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <Palette size={18} className="inline mr-2" />
            Watermark
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'tracking' && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <TrackingDashboard />
            </motion.div>
          )}

          {selectedTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CreatorAnalytics />
            </motion.div>
          )}

          {selectedTab === 'watermark' && (
            <motion.div
              key="watermark"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <WatermarkEditor />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
