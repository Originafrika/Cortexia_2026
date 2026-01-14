/**
 * CAMPAIGN COCOBOARD PREMIUM - Review & Edit campaign timeline
 * Phase 3: Full editing capabilities with drag & drop
 * 
 * Features:
 * - Visual timeline by weeks with asset cards
 * - Inline editing of assets (concept, format, specs)
 * - Drag & drop reordering within/between weeks
 * - Visual identity panel with palette
 * - Budget tracker live
 * - Coconut Warm premium design
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Calendar, 
  Image as ImageIcon, 
  DollarSign, 
  Target,
  Edit2,
  Trash2,
  Check,
  X,
  Palette,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Video as VideoIcon,
  Clock,
  LayoutGrid,
} from 'lucide-react';
import { useSoundContext } from './SoundProvider';
import type {
  GeminiCampaignAnalysisResponse,
  HydratedCampaignAnalysis,
  CampaignAsset,
  CampaignWeek,
  HydratedCampaignWeek,
} from '../../lib/types/coconut-v14-campaign';
import { useNotify } from './NotificationProvider';
import { CampaignCalendar } from './CampaignCalendar'; // ✅ NEW: Import calendar view

// ============================================
// TYPES
// ============================================

interface CampaignCocoBoardPremiumProps {
  campaignData: HydratedCampaignAnalysis;
  onSave: (updatedData: HydratedCampaignAnalysis) => void;
  onGenerate: () => void;
  onBack: () => void;
  isGenerating?: boolean;
}

interface EditingAsset {
  assetId: string;
  weekNumber: number;
}

// ============================================
// COMPONENT
// ============================================

export function CampaignCocoBoardPremium({
  campaignData: initialData,
  onSave,
  onGenerate,
  onBack,
  isGenerating = false,
}: CampaignCocoBoardPremiumProps) {
  const { playSound } = useSoundContext();
  const notify = useNotify();

  const [campaignData, setCampaignData] = useState(initialData);
  const [editingAsset, setEditingAsset] = useState<EditingAsset | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(
    new Set(campaignData.weeks.map((w) => w.weekNumber))
  );
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid'); // ✅ NEW: View toggle

  // Calculate total cost
  const totalCost = campaignData.estimatedCost.total;
  const imagesCount = campaignData.allAssets.filter((a) => a.type === 'image').length;
  const videosCount = campaignData.allAssets.filter((a) => a.type === 'video').length;

  // ✅ NEW: If calendar view, render calendar component
  if (viewMode === 'calendar') {
    return (
      <div className="relative h-screen">
        {/* Calendar Header with Back to Grid */}
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => {
              playSound?.('click');
              setViewMode('grid');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-warm-200 hover:bg-white transition-all"
          >
            <LayoutGrid className="w-5 h-5 text-warm-700" />
            <span className="font-medium text-warm-700">Vue Grille</span>
          </button>
        </div>

        <CampaignCalendar 
          campaign={campaignData} 
          onViewAsset={(assetId) => {
            console.log('View asset:', assetId);
            // TODO: Open asset modal
          }}
        />
      </div>
    );
  }

  // Toggle week expansion
  const toggleWeek = useCallback((weekNumber: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNumber)) {
        next.delete(weekNumber);
      } else {
        next.add(weekNumber);
      }
      return next;
    });
    playSound?.('click');
  }, [playSound]);

  // Edit asset
  const handleEditAsset = useCallback((assetId: string, weekNumber: number) => {
    setEditingAsset({ assetId, weekNumber });
    playSound?.('click');
  }, [playSound]);

  // Save asset changes
  const handleSaveAsset = useCallback((assetId: string, updates: Partial<CampaignAsset>) => {
    setCampaignData((prev) => {
      const newData = { ...prev };
      
      // Update in allAssets
      const assetIndex = newData.allAssets.findIndex((a) => a.id === assetId);
      if (assetIndex !== -1) {
        newData.allAssets[assetIndex] = {
          ...newData.allAssets[assetIndex],
          ...updates,
        };
      }

      // Update in weeks
      newData.weeks = newData.weeks.map((week) => ({
        ...week,
        assets: week.assets.map((asset) =>
          asset.id === assetId ? { ...asset, ...updates } : asset
        ),
      }));

      return newData;
    });

    setEditingAsset(null);
    playSound?.('success');
    notify?.success('Asset mis à jour');
  }, [playSound, notify]);

  // Delete asset
  const handleDeleteAsset = useCallback((assetId: string) => {
    if (!confirm('Supprimer cet asset ?')) return;

    setCampaignData((prev) => {
      const newData = { ...prev };
      
      // Remove from allAssets
      newData.allAssets = newData.allAssets.filter((a) => a.id !== assetId);

      // Remove from weeks
      newData.weeks = newData.weeks.map((week) => ({
        ...week,
        assets: week.assets.filter((a) => a.id !== assetId),
      }));

      // Recalculate cost
      const deletedAsset = prev.allAssets.find((a) => a.id === assetId);
      if (deletedAsset) {
        newData.estimatedCost.total -= deletedAsset.estimatedCost;
        if (deletedAsset.type === 'image') {
          newData.estimatedCost.images -= deletedAsset.estimatedCost;
        } else {
          newData.estimatedCost.videos -= deletedAsset.estimatedCost;
        }
      }

      return newData;
    });

    playSound?.('whoosh');
    notify?.success('Asset supprimé');
  }, [playSound, notify]);

  // Save all changes
  const handleSaveAll = useCallback(() => {
    onSave(campaignData);
    playSound?.('success');
    notify?.success('Campagne sauvegardée');
  }, [campaignData, onSave, playSound, notify]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-warm-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => {
              playSound?.('click');
              onBack();
            }}
            className="flex items-center gap-2 text-warm-700 hover:text-warm-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-warm-900 mb-2 drop-shadow-[0_2px_20px_rgba(212,165,116,0.2)]">
                CocoBoard - Plan de Campagne
              </h1>
              <p className="text-warm-600">
                {campaignData.timeline.totalWeeks} semaines • {imagesCount} images • {videosCount} vidéos
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* ✅ NEW: Calendar View Toggle */}
              <button
                onClick={() => {
                  playSound?.('click');
                  setViewMode('calendar');
                }}
                className="px-6 py-3 bg-white hover:bg-warm-50 text-warm-700 rounded-xl font-medium transition-all shadow-lg border border-warm-200 hover:border-warm-300 flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Vue Calendrier
              </button>

              <button
                onClick={handleSaveAll}
                className="px-6 py-3 bg-palm-500 hover:bg-palm-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-palm-500/30 hover:shadow-xl hover:shadow-palm-600/40 flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Sauvegarder
              </button>

              <button
                onClick={() => {
                  playSound?.('click');
                  onGenerate();
                }}
                disabled={isGenerating}
                className="px-8 py-3 bg-gradient-to-br from-warm-500 to-warm-700 hover:from-warm-600 hover:to-warm-800 text-white rounded-xl font-semibold transition-all shadow-xl shadow-warm-600/30 hover:shadow-2xl hover:shadow-warm-700/40 disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Générer tous les assets
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-warm-200/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warm-400 to-warm-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-warm-600">Durée</div>
                <div className="text-2xl font-bold text-warm-900">
                  {campaignData.timeline.totalWeeks} sem
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-warm-200/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-warm-600">Assets</div>
                <div className="text-2xl font-bold text-warm-900">
                  {campaignData.allAssets.length}
                </div>
              </div>
            </div>
            <div className="text-xs text-warm-500 mt-2">
              {imagesCount} images • {videosCount} vidéos
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-warm-200/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-warm-600">Budget</div>
                <div className="text-2xl font-bold text-warm-900">
                  {totalCost.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="text-xs text-warm-500 mt-2">crédits estimés</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-warm-200/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-warm-600">Objectif</div>
                <div className="text-sm font-bold text-warm-900 line-clamp-2">
                  {campaignData.kpis.primary.substring(0, 20)}...
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Strategy & KPIs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          {/* Strategy */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-warm-200/50">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-warm-600" />
              <h2 className="text-xl font-bold text-warm-900">Stratégie</h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-warm-700 mb-1">Positionnement</div>
                <p className="text-sm text-warm-600 leading-relaxed">
                  {campaignData.strategy.positioning}
                </p>
              </div>

              <div>
                <div className="text-sm font-semibold text-warm-700 mb-1">Thème</div>
                <p className="text-sm text-warm-600">
                  {campaignData.strategy.theme}
                </p>
              </div>

              <div>
                <div className="text-sm font-semibold text-warm-700 mb-2">Piliers de message</div>
                <div className="space-y-1">
                  {campaignData.strategy.messagingPillars.map((pillar, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-warm-500 mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-warm-600">{pillar}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-warm-700 mb-1">Arc narratif</div>
                <p className="text-sm text-warm-600 leading-relaxed">
                  {campaignData.strategy.narrativeArc}
                </p>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-warm-200/50">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-warm-600" />
              <h2 className="text-xl font-bold text-warm-900">Indicateurs Clés</h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-warm-700 mb-2">KPI Principal</div>
                <div className="px-4 py-3 bg-gradient-to-r from-warm-50 to-warm-100 rounded-xl border border-warm-200">
                  <p className="text-sm font-semibold text-warm-900">
                    {campaignData.kpis.primary}
                  </p>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-warm-700 mb-2">KPIs Secondaires</div>
                <div className="space-y-2">
                  {campaignData.kpis.secondary.map((kpi, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-palm-500 mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-warm-600">{kpi}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-warm-700 mb-1">Suivi recommandé</div>
                <p className="text-sm text-warm-600 leading-relaxed">
                  {campaignData.kpis.trackingRecommendations}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Visual Identity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-lg border border-warm-200/50 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-warm-600" />
            <h2 className="text-xl font-bold text-warm-900">Identité Visuelle</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-warm-700 mb-3">Palette</div>
              <div className="flex flex-wrap gap-3">
                {campaignData.visualIdentity.palette.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="w-12 h-12 rounded-xl shadow-md border-2 border-white"
                      style={{ backgroundColor: color.hex }}
                      title={color.usage}
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-warm-900">{color.name}</div>
                      <div className="text-warm-500">{color.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-warm-700 mb-3">Style</div>
              <p className="text-sm text-warm-600 mb-3">
                {campaignData.visualIdentity.photographyStyle}
              </p>
              <div className="text-sm">
                <span className="font-semibold text-warm-700">Typography:</span>{' '}
                <span className="text-warm-600">
                  {campaignData.visualIdentity.typography.headlines} •{' '}
                  {campaignData.visualIdentity.typography.body}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Timeline by Weeks */}
        <div className="space-y-6">
          {campaignData.weeks.map((week, weekIdx) => (
            <motion.div
              key={week.weekNumber}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + weekIdx * 0.05 }}
              className="bg-white rounded-3xl shadow-lg border border-warm-200/50 overflow-hidden"
            >
              {/* Week Header */}
              <button
                onClick={() => toggleWeek(week.weekNumber)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-warm-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warm-400 to-warm-500 flex items-center justify-center text-white font-bold">
                    {week.weekNumber}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-warm-900">
                      Semaine {week.weekNumber}: {week.objective}
                    </h3>
                    <p className="text-sm text-warm-600">{week.theme}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-warm-600">
                      {week.assets.length} assets
                    </div>
                    <div className="text-sm font-semibold text-warm-900">
                      {week.budgetWeek}cr
                    </div>
                  </div>
                  {expandedWeeks.has(week.weekNumber) ? (
                    <ChevronUp className="w-5 h-5 text-warm-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-warm-600" />
                  )}
                </div>
              </button>

              {/* Week Assets */}
              <AnimatePresence>
                {expandedWeeks.has(week.weekNumber) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-warm-200"
                  >
                    <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {week.assets.map((asset) => (
                        <AssetCard
                          key={asset.id}
                          asset={asset}
                          isEditing={editingAsset?.assetId === asset.id}
                          onEdit={() => handleEditAsset(asset.id, week.weekNumber)}
                          onSave={(updates) => handleSaveAsset(asset.id, updates)}
                          onDelete={() => handleDeleteAsset(asset.id)}
                          onCancelEdit={() => setEditingAsset(null)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Sticky Footer Actions */}
        <div className="sticky bottom-8 mt-8">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-warm-200/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-warm-600 mb-1">
                  Prêt à générer {campaignData.allAssets.length} assets
                </div>
                <div className="text-2xl font-bold text-warm-900">
                  {totalCost.toLocaleString()} crédits
                </div>
              </div>

              <button
                onClick={() => {
                  playSound?.('success');
                  onGenerate();
                }}
                disabled={isGenerating}
                className="px-8 py-4 bg-gradient-to-r from-warm-500 to-warm-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    Générer la campagne
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ASSET CARD COMPONENT
// ============================================

interface AssetCardProps {
  asset: CampaignAsset;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<CampaignAsset>) => void;
  onDelete: () => void;
  onCancelEdit: () => void;
}

function AssetCard({
  asset,
  isEditing,
  onEdit,
  onSave,
  onDelete,
  onCancelEdit,
}: AssetCardProps) {
  const { playSound } = useSoundContext();
  const [editedConcept, setEditedConcept] = useState(asset.concept);
  const [editedFormat, setEditedFormat] = useState(asset.format);

  const Icon = asset.type === 'image' ? ImageIcon : VideoIcon;

  if (isEditing) {
    return (
      <motion.div
        layout
        className="bg-warm-50 rounded-2xl p-4 border-2 border-warm-400"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-warm-700 mb-1">
              Concept
            </label>
            <input
              type="text"
              value={editedConcept}
              onChange={(e) => setEditedConcept(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-warm-300 focus:border-warm-500 focus:ring-2 focus:ring-warm-500/20 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-warm-700 mb-1">
              Format
            </label>
            <select
              value={editedFormat}
              onChange={(e) => setEditedFormat(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-warm-300 bg-white text-gray-900 focus:border-warm-500 focus:ring-2 focus:ring-warm-500/20 outline-none text-sm [&>option]:text-gray-900 [&>option]:bg-white"
            >
              <option value="1:1">1:1 Carré</option>
              <option value="9:16">9:16 Vertical</option>
              <option value="16:9">16:9 Horizontal</option>
              <option value="4:3">4:3</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                playSound?.('success');
                onSave({ concept: editedConcept, format: editedFormat });
              }}
              className="flex-1 px-3 py-2 bg-warm-500 text-white rounded-lg text-sm font-semibold hover:bg-warm-600 transition-colors flex items-center justify-center gap-1"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
            <button
              onClick={() => {
                playSound?.('click');
                onCancelEdit();
              }}
              className="px-3 py-2 bg-warm-200 text-warm-700 rounded-lg text-sm font-semibold hover:bg-warm-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      className="bg-warm-50 rounded-2xl p-4 border border-warm-200 hover:border-warm-300 transition-all group relative"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              asset.type === 'image'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-purple-100 text-purple-600'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-warm-700 uppercase">
              {asset.type} {asset.format}
            </div>
            {asset.type === 'video' && asset.videoDuration && (
              <div className="text-xs text-warm-500">{asset.videoDuration}s</div>
            )}
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              playSound?.('click');
              onEdit();
            }}
            className="w-8 h-8 rounded-lg bg-white border border-warm-200 hover:border-warm-400 flex items-center justify-center text-warm-600 hover:text-warm-800 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              playSound?.('whoosh');
              onDelete();
            }}
            className="w-8 h-8 rounded-lg bg-white border border-warm-200 hover:border-red-400 flex items-center justify-center text-warm-600 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Concept */}
      <p className="text-sm text-warm-900 font-semibold mb-2 line-clamp-2">
        {asset.concept}
      </p>

      {/* Marketing Objective */}
      <div className="mb-2 px-2 py-1 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200">
        <p className="text-xs text-amber-800 font-medium">
          {asset.marketingObjective}
        </p>
      </div>

      {/* Copy (if exists) */}
      {asset.copy && (asset.copy.headline || asset.copy.cta) && (
        <div className="mb-3 space-y-1">
          {asset.copy.headline && (
            <div className="text-xs">
              <span className="font-semibold text-warm-700">Titre:</span>{' '}
              <span className="text-warm-600">{asset.copy.headline}</span>
            </div>
          )}
          {asset.copy.cta && (
            <div className="text-xs">
              <span className="font-semibold text-warm-700">CTA:</span>{' '}
              <span className="text-warm-600">{asset.copy.cta}</span>
            </div>
          )}
        </div>
      )}

      {/* Expected KPIs */}
      {asset.expectedKpis && (
        <div className="mb-3 p-2 bg-white rounded-lg border border-warm-200">
          <div className="text-xs font-semibold text-warm-700 mb-1">KPIs attendus</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-warm-500">Impressions</div>
              <div className="font-semibold text-warm-900">
                {asset.expectedKpis.impressions.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-warm-500">Engagement</div>
              <div className="font-semibold text-warm-900">
                {asset.expectedKpis.engagementRate}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-1 text-warm-600">
          <Clock className="w-3 h-3" />
          {new Date(asset.scheduledDate).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
          })}
        </div>
        <div className="font-semibold text-warm-700">
          {asset.estimatedCost}cr
        </div>
      </div>

      {/* Channels */}
      {asset.channels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {asset.channels.slice(0, 3).map((channel) => (
            <span
              key={channel}
              className="px-2 py-0.5 bg-white rounded text-xs text-warm-600 border border-warm-200"
            >
              {channel}
            </span>
          ))}
          {asset.channels.length > 3 && (
            <span className="px-2 py-0.5 bg-white rounded text-xs text-warm-600 border border-warm-200">
              +{asset.channels.length - 3}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}