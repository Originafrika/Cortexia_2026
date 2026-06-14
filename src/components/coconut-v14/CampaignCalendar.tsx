/**
 * COCONUT V14 - CAMPAIGN CALENDAR VIEW
 * Visual timeline of campaign assets across weeks
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Image as ImageIcon, Video, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import type { GeminiCampaignAnalysisResponse } from '../../lib/types/coconut-v14';

interface CampaignCalendarProps {
  campaign: GeminiCampaignAnalysisResponse;
  onViewAsset?: (assetId: string) => void;
}

export function CampaignCalendar({ campaign, onViewAsset }: CampaignCalendarProps) {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const weeks = campaign.weeks || [];
  const currentWeek = weeks[currentWeekIndex];

  // Group assets by scheduled date
  const assetsByDate: Record<string, typeof campaign.allAssets> = {};
  campaign.allAssets?.forEach(asset => {
    const date = asset.scheduledDate;
    if (!assetsByDate[date]) {
      assetsByDate[date] = [];
    }
    assetsByDate[date].push(asset);
  });

  // Get dates for current week
  const weekDates: string[] = [];
  if (currentWeek) {
    const start = new Date(currentWeek.startDate);
    const end = new Date(currentWeek.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      weekDates.push(d.toISOString().split('T')[0]);
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      month: date.toLocaleDateString('fr-FR', { month: 'short' })
    };
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-warm-50 to-amber-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-warm-200/50 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-warm-900">
                  {campaign.campaignTitle}
                </h1>
                <p className="text-sm text-warm-600">
                  {campaign.timeline?.totalWeeks} semaines • {campaign.allAssets?.length || 0} assets
                </p>
              </div>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentWeekIndex(Math.max(0, currentWeekIndex - 1))}
                disabled={currentWeekIndex === 0}
                className="p-2 rounded-xl hover:bg-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-warm-700" />
              </button>
              
              <div className="text-center min-w-[180px]">
                <div className="text-sm font-medium text-warm-600">Semaine {currentWeekIndex + 1}</div>
                <div className="text-lg font-bold text-warm-900">
                  {currentWeek && `${formatDate(currentWeek.startDate).day} ${formatDate(currentWeek.startDate).month} - ${formatDate(currentWeek.endDate).day} ${formatDate(currentWeek.endDate).month}`}
                </div>
              </div>

              <button
                onClick={() => setCurrentWeekIndex(Math.min(weeks.length - 1, currentWeekIndex + 1))}
                disabled={currentWeekIndex === weeks.length - 1}
                className="p-2 rounded-xl hover:bg-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5 text-warm-700" />
              </button>
            </div>
          </div>

          {/* Week Theme */}
          {currentWeek && (
            <div className="mt-4 p-4 bg-gradient-to-r from-white/60 to-amber-50/60 rounded-2xl border border-warm-200/50">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-warm-900 mb-1">{currentWeek.theme}</h3>
                  <p className="text-sm text-warm-700">{currentWeek.objective}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-warm-600">Budget semaine</div>
                  <div className="text-lg font-bold text-warm-900">{currentWeek.budgetWeek || 0}cr</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-7 gap-4">
            {weekDates.map((dateStr, idx) => {
              const dateInfo = formatDate(dateStr);
              const assets = assetsByDate[dateStr] || [];
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <motion.div
                  key={dateStr}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`
                    bg-white rounded-2xl border-2 overflow-hidden
                    ${isToday ? 'border-amber-500 shadow-lg shadow-amber-500/20' : 'border-warm-200/50'}
                  `}
                >
                  {/* Date Header */}
                  <div className={`
                    p-3 text-center
                    ${isToday 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' 
                      : 'bg-warm-50 text-warm-900'
                    }
                  `}>
                    <div className="text-xs font-medium uppercase">{dateInfo.dayName}</div>
                    <div className="text-2xl font-bold">{dateInfo.day}</div>
                    <div className="text-xs opacity-70">{dateInfo.month}</div>
                  </div>

                  {/* Assets */}
                  <div className="p-3 space-y-2 min-h-[200px]">
                    {assets.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-warm-400 text-sm">
                        Aucun asset
                      </div>
                    ) : (
                      assets.map((asset, assetIdx) => (
                        <motion.button
                          key={asset.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + assetIdx * 0.05 }}
                          onClick={() => onViewAsset?.(asset.id)}
                          className="w-full text-left p-2 rounded-xl bg-gradient-to-br from-warm-50 to-amber-50 hover:from-warm-100 hover:to-amber-100 border border-warm-200/50 transition-all group"
                        >
                          <div className="flex items-start gap-2">
                            <div className={`
                              w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                              ${asset.type === 'image' 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-purple-100 text-purple-600'
                              }
                            `}>
                              {asset.type === 'image' ? (
                                <ImageIcon className="w-4 h-4" />
                              ) : (
                                <Video className="w-4 h-4" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-warm-900 truncate">
                                {asset.keyMessage?.headline || asset.concept}
                              </div>
                              <div className="text-xs text-warm-600 mt-0.5">
                                {asset.scheduledTime}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                {asset.channels?.map((channel, i) => (
                                  <span 
                                    key={i}
                                    className="px-1.5 py-0.5 text-xs rounded bg-white/60 text-warm-700"
                                  >
                                    {channel}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <Eye className="w-4 h-4 text-warm-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Week Stats */}
          {currentWeek && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 grid md:grid-cols-3 gap-4"
            >
              <div className="bg-white rounded-2xl p-6 border border-warm-200/50">
                <div className="text-sm text-warm-600 mb-1">Images</div>
                <div className="text-3xl font-bold text-blue-600">
                  {currentWeek.assets?.filter(a => a.type === 'image').length || 0}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-warm-200/50">
                <div className="text-sm text-warm-600 mb-1">Vidéos</div>
                <div className="text-3xl font-bold text-purple-600">
                  {currentWeek.assets?.filter(a => a.type === 'video').length || 0}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-warm-200/50">
                <div className="text-sm text-warm-600 mb-1">Impressions attendues</div>
                <div className="text-3xl font-bold text-warm-900">
                  {currentWeek.kpisWeek?.impressions?.toLocaleString() || 0}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
