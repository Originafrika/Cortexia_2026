/**
 * COCONUT V14 - UNIFIED HISTORY MANAGER
 * Tabs to switch between Image/Video history and Campaign history
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Target } from 'lucide-react';
import { HistoryManager } from './HistoryManager';
import { CampaignHistoryManager } from './CampaignHistoryManager';
import { useSoundContext } from './SoundProvider';

interface UnifiedHistoryManagerProps {
  userId: string;
  initialTab?: 'generations' | 'campaigns';
  onViewCampaign?: (cocoBoardId: string) => void; // ✅ NEW: Pass callback
}

export function UnifiedHistoryManager({ userId, initialTab = 'generations', onViewCampaign }: UnifiedHistoryManagerProps) {
  const { playClick } = useSoundContext();
  const [activeTab, setActiveTab] = useState<'generations' | 'campaigns'>(initialTab);

  return (
    <div className="h-full flex flex-col">
      {/* Tab Selector */}
      <div className="relative bg-white/70 backdrop-blur-xl border-b border-warm-200/50 px-8 py-4 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2">
            <button
              onClick={() => {
                playClick();
                setActiveTab('generations');
              }}
              className={`
                relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 z-20
                ${activeTab === 'generations'
                  ? 'text-white'
                  : 'text-[var(--coconut-husk)] hover:text-[var(--coconut-shell)] hover:bg-white/50'
                }
              `}
            >
              {activeTab === 'generations' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-xl shadow-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <ImageIcon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Générations</span>
            </button>

            <button
              onClick={() => {
                playClick();
                setActiveTab('campaigns');
              }}
              className={`
                relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 z-20
                ${activeTab === 'campaigns'
                  ? 'text-white'
                  : 'text-[var(--coconut-husk)] hover:text-[var(--coconut-shell)] hover:bg-white/50'
                }
              `}
            >
              {activeTab === 'campaigns' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-xl shadow-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Target className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Campagnes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'generations' ? (
          <HistoryManager userId={userId} />
        ) : (
          <CampaignHistoryManager 
            userId={userId}
            onViewCampaign={onViewCampaign}
          />
        )}
      </div>
    </div>
  );
}

export default UnifiedHistoryManager;