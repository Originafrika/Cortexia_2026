/**
 * CAMPAIGN GENERATION VIEW PREMIUM - Real-time batch generation progress
 * Phase 3: Detailed progress tracking with asset previews
 * 
 * Features:
 * - Real-time progress bar with ETA
 * - Grid of completed assets with previews
 * - Current asset being generated indicator
 * - Error handling per asset
 * - Download all as ZIP
 * - Export calendar
 * - Publish selected to feed
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider';
import {
  ArrowLeft,
  Download,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Video as VideoIcon,
  Share2,
  Eye,
  Clock,
  TrendingUp,
} from 'lucide-react';
import type {
  CampaignAssetResult,
  CampaignStatus,
} from '../../lib/types/coconut-v14-campaign';
import { useNotify } from './NotificationProvider';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// ============================================
// TYPES
// ============================================

interface CampaignGenerationViewPremiumProps {
  campaignId: string;
  onBack: () => void;
  onComplete?: () => void;
}

interface ProgressData {
  status: CampaignStatus;
  progress: {
    total: number;
    completed: number;
    failed: number;
    current: string | null;
  };
  results: CampaignAssetResult[];
  errors: Array<{
    assetId: string;
    error: string;
  }>;
}

// ============================================
// COMPONENT
// ============================================

export function CampaignGenerationViewPremium({
  campaignId,
  onBack,
  onComplete,
}: CampaignGenerationViewPremiumProps) {
  const { playSound } = useSoundContext();
  const notify = useNotify();

  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());

  // Poll generation status
  useEffect(() => {
    if (!isPolling) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/campaign/${campaignId}/status`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );

        const result = await response.json();

        if (result.success) {
          setProgressData(result.data);

          // Stop polling if completed or failed
          if (result.data.status === 'completed' || result.data.status === 'failed') {
            setIsPolling(false);
            
            if (result.data.status === 'completed') {
              playSound?.('success');
              notify?.({
                type: 'success',
                message: 'Campagne générée avec succès !',
              });
              onComplete?.();
            } else {
              notify?.({
                type: 'error',
                message: 'La génération a échoué',
              });
            }
          }
        }
      } catch (error) {
        console.error('Poll error:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Cleanup
    return () => clearInterval(pollInterval);
  }, [campaignId, isPolling, playSound, notify, onComplete]);

  // Calculate ETA
  const estimatedTimeRemaining = progressData
    ? Math.ceil(((progressData.progress.total - progressData.progress.completed) * 2) / 60) // 2min per asset average
    : 0;

  // Calculate progress percentage
  const progressPercentage = progressData
    ? Math.round((progressData.progress.completed / progressData.progress.total) * 100)
    : 0;

  // Toggle asset selection
  const toggleAssetSelection = useCallback((assetId: string) => {
    setSelectedAssets((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
    playSound?.('click');
  }, [playSound]);

  // Select all
  const selectAll = useCallback(() => {
    if (progressData) {
      setSelectedAssets(new Set(progressData.results.map((r) => r.assetId)));
      playSound?.('success');
    }
  }, [progressData, playSound]);

  // Download as ZIP
  const handleDownloadZip = useCallback(async () => {
    playSound?.('success');
    notify?.({
      type: 'info',
      message: 'Téléchargement du ZIP en cours...',
    });

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/campaign/${campaignId}/export`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        window.open(result.downloadUrl, '_blank');
        notify?.({
          type: 'success',
          message: 'ZIP prêt au téléchargement',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Download ZIP error:', error);
      notify?.({
        type: 'error',
        message: 'Erreur lors du téléchargement',
      });
    }
  }, [campaignId, playSound, notify]);

  // Export calendar
  const handleExportCalendar = useCallback(async () => {
    playSound?.('success');
    notify?.({
      type: 'info',
      message: 'Export du calendrier...',
    });

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/campaign/${campaignId}/calendar/export`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ format: 'pdf' }),
        }
      );

      const result = await response.json();

      if (result.success) {
        window.open(result.downloadUrl, '_blank');
        notify?.({
          type: 'success',
          message: 'Calendrier exporté',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Export calendar error:', error);
      notify?.({
        type: 'error',
        message: 'Erreur lors de l\'export',
      });
    }
  }, [campaignId, playSound, notify]);

  if (!progressData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-warm-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-warm-500 animate-spin mx-auto mb-4" />
          <p className="text-warm-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const isCompleted = progressData.status === 'completed';
  const isFailed = progressData.status === 'failed';

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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-warm-900 mb-2 drop-shadow-[0_2px_20px_rgba(212,165,116,0.2)]">
                Génération de campagne
              </h1>
              <p className="text-warm-600">
                {progressData.progress.completed} / {progressData.progress.total} assets générés
              </p>
            </div>

            {isCompleted && (
              <div className="flex gap-3">
                <button
                  onClick={handleExportCalendar}
                  className="px-6 py-3 bg-white border border-warm-300 hover:border-warm-400 text-warm-700 rounded-xl font-medium transition-all flex items-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Export calendrier
                </button>

                <button
                  onClick={handleDownloadZip}
                  className="px-6 py-3 bg-gradient-to-br from-warm-500 to-warm-700 hover:from-warm-600 hover:to-warm-800 text-white rounded-xl font-semibold transition-all shadow-xl shadow-warm-600/30 hover:shadow-2xl hover:shadow-warm-700/40 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Télécharger ZIP
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Progress Bar */}
        {!isCompleted && !isFailed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 shadow-lg border border-warm-200/50 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-warm-600 mb-1">Progression</div>
                <div className="text-4xl font-bold text-warm-900">
                  {progressPercentage}%
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-warm-600 mb-1">Temps restant estimé</div>
                <div className="text-2xl font-bold text-warm-900">
                  ~{estimatedTimeRemaining} min
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-4 bg-warm-100 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-warm-500 to-warm-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Current asset */}
            {progressData.progress.current && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center gap-3 p-4 bg-warm-50 rounded-xl"
              >
                <Loader2 className="w-5 h-5 text-warm-600 animate-spin" />
                <div>
                  <div className="text-sm font-semibold text-warm-900">
                    En cours de génération
                  </div>
                  <div className="text-xs text-warm-600">
                    Asset {progressData.progress.current}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Completed Assets Grid */}
        {progressData.results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-lg border border-warm-200/50 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-warm-900">
                Assets générés ({progressData.results.length})
              </h2>

              {isCompleted && (
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="px-4 py-2 text-sm border-2 border-warm-300 text-warm-700 rounded-xl font-semibold hover:bg-warm-50 transition-all"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    onClick={handleDownloadZip}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-warm-500 to-warm-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger ZIP
                  </button>
                  <button
                    onClick={handleExportCalendar}
                    className="px-4 py-2 text-sm border-2 border-warm-300 text-warm-700 rounded-xl font-semibold hover:bg-warm-50 transition-all flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Export calendrier
                  </button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {progressData.results.map((result) => (
                <AssetResultCard
                  key={result.assetId}
                  result={result}
                  isSelected={selectedAssets.has(result.assetId)}
                  onToggleSelect={() => toggleAssetSelection(result.assetId)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Errors */}
        {progressData.errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 rounded-3xl p-6 shadow-lg border border-red-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-bold text-red-900">
                Erreurs ({progressData.errors.length})
              </h2>
            </div>

            <div className="space-y-2">
              {progressData.errors.map((error, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg">
                  <div className="text-sm font-semibold text-red-900 mb-1">
                    Asset {error.assetId}
                  </div>
                  <div className="text-xs text-red-600">{error.error}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Completion Actions */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 shadow-2xl text-white text-center"
          >
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Campagne prête !</h2>
            <p className="text-green-100 mb-6">
              Tous vos assets sont générés et prêts à être publiés
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleDownloadZip}
                className="px-6 py-3 bg-white text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-all flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Télécharger tout
              </button>
              <button
                onClick={() => {
                  playSound?.('click');
                  onBack();
                }}
                className="px-6 py-3 bg-white/10 text-white border-2 border-white/40 rounded-xl font-semibold hover:bg-white/20 hover:border-white/60 transition-all"
              >
                Retour au dashboard
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ============================================
// ASSET RESULT CARD
// ============================================

interface AssetResultCardProps {
  result: CampaignAssetResult;
  isSelected: boolean;
  onToggleSelect: () => void;
}

function AssetResultCard({ result, isSelected, onToggleSelect }: AssetResultCardProps) {
  const { playSound } = useSoundContext();
  const Icon = result.type === 'image' ? ImageIcon : VideoIcon;

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      onClick={() => {
        playSound?.('click');
        onToggleSelect();
      }}
      className={`
        relative rounded-2xl overflow-hidden cursor-pointer transition-all
        ${isSelected ? 'ring-4 ring-warm-500' : 'ring-1 ring-warm-200 hover:ring-warm-300'}
      `}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-warm-100 flex items-center justify-center">
        {result.thumbnailUrl ? (
          <img
            src={result.thumbnailUrl}
            alt={result.concept}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon className="w-12 h-12 text-warm-400" />
        )}
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
            result.type === 'image' 
              ? 'bg-blue-500/20 text-blue-300' 
              : 'bg-purple-500/20 text-purple-300'
          }`}>
            <Icon className="w-3 h-3" />
          </div>
          <div className="text-xs font-semibold text-white uppercase">
            {result.format}
          </div>
        </div>
        <p className="text-xs text-white/90 line-clamp-1">{result.concept}</p>
        <div className="text-xs text-white/70 mt-1">Semaine {result.weekNumber}</div>
      </div>

      {/* Selection checkbox */}
      <div className="absolute top-3 right-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
          isSelected 
            ? 'bg-warm-500 text-white' 
            : 'bg-white/80 text-warm-600'
        }`}>
          {isSelected && <CheckCircle className="w-4 h-4" />}
        </div>
      </div>

      {/* Status badge */}
      {result.status === 'completed' && (
        <div className="absolute top-3 left-3">
          <div className="px-2 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Généré
          </div>
        </div>
      )}

      {result.status === 'failed' && (
        <div className="absolute top-3 left-3">
          <div className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Échec
          </div>
        </div>
      )}
    </motion.div>
  );
}