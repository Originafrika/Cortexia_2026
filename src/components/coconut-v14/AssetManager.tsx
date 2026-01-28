/**
 * COCONUT V14 - ASSET MANAGER - LIGHT THEME
 * COCONUT PREMIUM DESIGN SYSTEM V3
 * - Light theme with Warm Cream accents
 * - Responsive grid layout
 * - Status badges with clear states
 * - Upload/Generate/Request workflows
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 3B: Import sound
import {
  Package,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileQuestion
} from 'lucide-react';
import type { MissingAsset } from '../../lib/types/gemini';
import { tokens, TRANSITIONS } from '@/lib/design/tokens';
import { WORKFLOW_LABELS, ACTION_LABELS } from '@/lib/i18n/translations';
import { handleError, showSuccess } from '@/lib/utils/errorHandler';
import { EmptyState } from '@/components/common/EmptyState';

// ============================================
// TYPES
// ============================================

interface AssetManagerProps {
  missingAssets: MissingAsset[];
  onGenerate: (assetId: string) => Promise<void>;
  onRequestFromUser: (assetId: string, message: string) => void;
  onAssetUploaded: (assetId: string, file: File) => void;
  onSkip: (assetId: string) => void;
  onComplete?: () => void;
  isGenerating?: boolean;
  generatingAssetId?: string | null;
}

type AssetStatus = 'pending' | 'generating' | 'generated' | 'uploaded' | 'skipped' | 'error';

interface AssetState {
  id: string;
  status: AssetStatus;
  result?: string;
  error?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function AssetManager({
  missingAssets,
  onGenerate,
  onRequestFromUser,
  onAssetUploaded,
  onSkip,
  onComplete,
  isGenerating = false,
  generatingAssetId = null,
}: AssetManagerProps) {
  // 🔊 PHASE 3B: Sound context
  const { playClick, playSuccess, playError } = useSoundContext();
  
  const [assetStates, setAssetStates] = useState<Map<string, AssetState>>(
    new Map(missingAssets.map(asset => [asset.id, { id: asset.id, status: 'pending' }]))
  );
  
  const [showRequestModal, setShowRequestModal] = useState<string | null>(null);
  
  // Handle generate asset
  const handleGenerate = async (assetId: string, assetDescription: string) => {
    playClick(); // 🔊 Sound feedback for generate
    setAssetStates(prev => new Map(prev).set(assetId, { id: assetId, status: 'generating' }));
    
    try {
      await onGenerate(assetId);
      playSuccess(); // 🔊 Sound feedback for success
      setAssetStates(prev => new Map(prev).set(assetId, { id: assetId, status: 'generated' }));
      showSuccess('Asset généré', assetDescription);
    } catch (error) {
      playError(); // 🔊 Sound feedback for error
      handleError(error as Error, 'AssetManager.handleGenerate', { 
        toast: true,
        context: { assetId, assetDescription }
      });
      setAssetStates(prev => new Map(prev).set(assetId, { 
        id: assetId, 
        status: 'error',
        error: error instanceof Error ? error.message : 'Échec de génération'
      }));
    }
  };
  
  // Handle file upload
  const handleFileUpload = (assetId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    playClick(); // 🔊 Sound feedback for upload action
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      onAssetUploaded(assetId, file);
      setAssetStates(prev => new Map(prev).set(assetId, { id: assetId, status: 'uploaded' }));
      showSuccess('Asset uploadé', file.name);
    } catch (error) {
      handleError(error as Error, 'AssetManager.handleFileUpload', { 
        toast: true,
        context: { assetId, fileName: file.name }
      });
    }
  };
  
  // Handle skip
  const handleSkip = (assetId: string) => {
    try {
      onSkip(assetId);
      setAssetStates(prev => new Map(prev).set(assetId, { id: assetId, status: 'skipped' }));
    } catch (error) {
      handleError(error as Error, 'AssetManager.handleSkip', { toast: true });
    }
  };
  
  // Stats
  const stats = {
    total: missingAssets.length,
    pending: Array.from(assetStates.values()).filter(s => s.status === 'pending').length,
    generated: Array.from(assetStates.values()).filter(s => s.status === 'generated').length,
    uploaded: Array.from(assetStates.values()).filter(s => s.status === 'uploaded').length,
    skipped: Array.from(assetStates.values()).filter(s => s.status === 'skipped').length,
  };
  
  const allHandled = stats.pending === 0;
  
  // Empty state
  if (missingAssets.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        preset="success"
        size="lg"
        title={WORKFLOW_LABELS.noMissingAssets}
        description={WORKFLOW_LABELS.allResourcesAvailable}
      />
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
            <Package className="w-7 h-7 text-cream-600" />
            <span>{WORKFLOW_LABELS.missingAssets}</span>
          </h2>
          <p className="text-stone-600 mt-1">
            {WORKFLOW_LABELS.manageAssets}
          </p>
        </div>
        
        {/* Progress */}
        <div className="text-right">
          <div className="text-sm text-stone-500 mb-1 font-medium">{WORKFLOW_LABELS.progression}</div>
          <div className="text-2xl font-bold text-stone-900">
            {stats.total - stats.pending}/{stats.total}
          </div>
        </div>
      </div>
      
      {/* Stats Bar - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label={WORKFLOW_LABELS.total} value={stats.total} color="bg-stone-100 text-stone-900" />
        <StatCard label={WORKFLOW_LABELS.generated} value={stats.generated} color="bg-green-100 text-green-700" />
        <StatCard label={WORKFLOW_LABELS.uploaded} value={stats.uploaded} color="bg-cream-100 text-cream-700" />
        <StatCard label={WORKFLOW_LABELS.skipped} value={stats.skipped} color="bg-stone-100 text-stone-600" />
      </div>
      
      {/* Assets List */}
      <div className="space-y-4">
        {missingAssets.map((asset) => {
          const state = assetStates.get(asset.id);
          const isActive = generatingAssetId === asset.id;
          
          return (
            <AssetCard
              key={asset.id}
              asset={asset}
              state={state!}
              isActive={isActive}
              onGenerate={() => handleGenerate(asset.id, asset.description)}
              onUpload={(e) => handleFileUpload(asset.id, e)}
              onRequest={() => setShowRequestModal(asset.id)}
              onSkip={() => handleSkip(asset.id)}
              isGenerating={isGenerating}
            />
          );
        })}
      </div>
      
      {/* Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <RequestModal
            asset={missingAssets.find(a => a.id === showRequestModal)!}
            onClose={() => setShowRequestModal(null)}
            onSend={(message) => {
              onRequestFromUser(showRequestModal, message);
              setShowRequestModal(null);
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Summary */}
      {allHandled && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={TRANSITIONS.medium}
          className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center"
        >
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-700 mb-2">{WORKFLOW_LABELS.allAssetsManaged}</h3>
          <p className="text-green-600">
            {WORKFLOW_LABELS.continueToFinalGeneration}
          </p>
          {onComplete && (
            <button
              onClick={onComplete}
              className="mt-4 py-2 px-4 bg-gradient-to-r from-cream-500 to-amber-500 text-white rounded-lg hover:from-cream-600 hover:to-amber-600 transition-all shadow-lg font-medium"
            >
              {WORKFLOW_LABELS.continueToCocoBoard}
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className={`${color} ${tokens.radius.md} p-4 text-center`}>
      <div className="text-2xl mb-1">{value}</div>
      <div className="text-xs opacity-75">{label}</div>
    </div>
  );
}

interface AssetCardProps {
  asset: MissingAsset;
  state: AssetState;
  isActive: boolean;
  onGenerate: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRequest: () => void;
  onSkip: () => void;
  isGenerating: boolean;
}

function AssetCard({
  asset,
  state,
  isActive,
  onGenerate,
  onUpload,
  onRequest,
  onSkip,
  isGenerating,
}: AssetCardProps) {
  
  const getStatusDisplay = () => {
    switch (state.status) {
      case 'pending':
        return {
          color: 'border-slate-200 bg-white',
          badge: <span className={`px-3 py-1 bg-slate-100 text-slate-700 text-xs ${tokens.radius.full}`}>En attente</span>
        };
      case 'generating':
        return {
          color: 'border-[var(--coconut-husk)]/30 bg-[var(--coconut-husk)]/5',
          badge: (
            <span className={`px-3 py-1 bg-[var(--coconut-husk)] ${tokens.textColors.white} text-xs ${tokens.radius.full} flex items-center ${tokens.gap.tight}`}>
              <Loader2 className={`${tokens.iconSize.xs} animate-spin`} />
              <span>Génération...</span>
            </span>
          )
        };
      case 'generated':
        return {
          color: 'border-[var(--coconut-palm)]/30 bg-[var(--coconut-palm)]/5',
          badge: (
            <span className={`px-3 py-1 bg-[var(--coconut-palm)] ${tokens.textColors.white} text-xs ${tokens.radius.full} flex items-center gap-1`}>
              <CheckCircle2 className={tokens.iconSize.xs} />
              <span>Généré</span>
            </span>
          )
        };
      case 'uploaded':
        return {
          color: 'border-[var(--coconut-cream)]/50 bg-[var(--coconut-cream)]/10',
          badge: (
            <span className={`px-3 py-1 bg-[var(--coconut-husk)] ${tokens.textColors.white} text-xs ${tokens.radius.full} flex items-center gap-1`}>
              <CheckCircle2 className={tokens.iconSize.xs} />
              <span>Uploadé</span>
            </span>
          )
        };
      case 'skipped':
        return {
          color: 'border-slate-200 bg-slate-50',
          badge: <span className={`px-3 py-1 bg-slate-400 ${tokens.textColors.white} text-xs ${tokens.radius.full}`}>Ignoré</span>
        };
      case 'error':
        return {
          color: 'border-[var(--coconut-shell)]/30 bg-[var(--coconut-shell)]/5',
          badge: (
            <span className={`px-3 py-1 bg-[var(--coconut-shell)] ${tokens.textColors.white} text-xs ${tokens.radius.full} flex items-center gap-1`}>
              <AlertCircle className={tokens.iconSize.xs} />
              <span>Erreur</span>
            </span>
          )
        };
    }
  };
  
  const { color, badge } = getStatusDisplay();
  const isPending = state.status === 'pending';
  const isCompleted = ['generated', 'uploaded', 'skipped'].includes(state.status);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={TRANSITIONS.medium}
      className={`border-2 ${color} ${tokens.radius.md} p-6 transition-all ${
        isActive ? 'ring-4 ring-[var(--coconut-husk)]/20' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className={`flex items-center ${tokens.gap.normal} mb-2`}>
            <h3 className="text-lg text-slate-900">{asset.description}</h3>
            {badge}
          </div>
          
          <div className={`flex items-center ${tokens.gap.normal} text-sm text-slate-600`}>
            <span className={`flex items-center gap-1`}>
              <Package className={tokens.iconSize.sm} />
              <span className="capitalize">{asset.type}</span>
            </span>
            {asset.canBeGenerated ? (
              <span className={`px-2 py-1 bg-[var(--coconut-palm)]/10 text-[var(--coconut-palm)] ${tokens.radius.sm} text-xs`}>
                {WORKFLOW_LABELS.canGenerate}
              </span>
            ) : (
              <span className={`px-2 py-1 bg-[var(--coconut-husk)]/10 text-[var(--coconut-shell)] ${tokens.radius.sm} text-xs`}>
                {WORKFLOW_LABELS.requestFromUser}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {state.status === 'error' && state.error && (
        <div className={`mb-4 p-3 bg-[var(--coconut-shell)]/10 ${tokens.borderColors.info} border ${tokens.radius.sm}`}>
          <p className="text-sm text-[var(--coconut-shell)]">{state.error}</p>
        </div>
      )}
      
      {/* Actions */}
      {isPending && (
        <div className="grid grid-cols-2 gap-3">
          {asset.canBeGenerated && (
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className={`py-2 px-4 ${tokens.gradients.success} ${tokens.textColors.white} ${tokens.radius.sm} hover:opacity-90 transition-all flex items-center justify-center ${tokens.gap.tight} ${tokens.disabled} ${tokens.focus}`}
            >
              <Sparkles className={tokens.iconSize.sm} />
              <span>Générer avec IA</span>
            </button>
          )}
          
          {!asset.canBeGenerated && (
            <button
              onClick={onRequest}
              className={`py-2 px-4 ${tokens.gradients.warning} ${tokens.textColors.white} ${tokens.radius.sm} hover:opacity-90 transition-all flex items-center justify-center ${tokens.gap.tight} ${tokens.focus}`}
            >
              <FileQuestion className={tokens.iconSize.sm} />
              <span>Demander au client</span>
            </button>
          )}
          
          <label className={`py-2 px-4 bg-[var(--coconut-husk)] ${tokens.textColors.white} ${tokens.radius.sm} hover:bg-[var(--coconut-shell)] transition-all flex items-center justify-center ${tokens.gap.tight} cursor-pointer ${tokens.focus}`}>
            <Upload className={tokens.iconSize.sm} />
            <span>Upload fichier</span>
            <input
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="hidden"
            />
          </label>
          
          <button
            onClick={onSkip}
            className={`col-span-2 py-2 px-4 bg-slate-200 text-slate-700 ${tokens.radius.sm} hover:bg-slate-300 transition-all ${tokens.focus}`}
          >
            Ignorer cet asset
          </button>
        </div>
      )}
      
      {/* Completed Actions */}
      {isCompleted && state.status !== 'skipped' && (
        <div className={`flex items-center ${tokens.gap.tight} text-[var(--coconut-palm)]`}>
          <CheckCircle2 className={tokens.iconSize.md} />
          <span className="text-sm">Asset prêt à l'emploi</span>
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// REQUEST MODAL
// ============================================

interface RequestModalProps {
  asset: MissingAsset;
  onClose: () => void;
  onSend: (message: string) => void;
}

function RequestModal({ asset, onClose, onSend }: RequestModalProps) {
  const [message, setMessage] = useState(asset.requestMessage || '');
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={TRANSITIONS.fast}
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm ${tokens.zIndex.modal} flex items-center justify-center p-4`}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={TRANSITIONS.spring}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white ${tokens.radius.lg} ${tokens.shadows.xl} max-w-2xl w-full p-8`}
      >
        <div className={`flex items-center justify-between mb-6`}>
          <h2 className="text-2xl text-slate-900">Demande au client</h2>
          <button
            onClick={onClose}
            className={`p-2 hover:bg-slate-100 ${tokens.radius.sm} transition-colors ${tokens.focus}`}
            aria-label={ACTION_LABELS.close}
          >
            <X className={`${tokens.iconSize.md} text-slate-600`} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-slate-600 mb-4">
            Cet asset ne peut pas être généré automatiquement. Envoyez un message au client pour demander ce fichier.
          </p>
          
          <div className={`p-4 bg-slate-50 ${tokens.radius.sm} border border-slate-200 mb-4`}>
            <h4 className="text-sm text-slate-700 mb-2">Asset requis:</h4>
            <p className="text-slate-900">{asset.description}</p>
          </div>
          
          <label className="block text-sm text-slate-700 mb-2">Message pour le client</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 ${tokens.radius.md} resize-none ${tokens.focus}`}
            placeholder="Décrivez ce dont vous avez besoin..."
          />
        </div>
        
        <div className={`flex items-center ${tokens.gap.normal}`}>
          <button
            onClick={onClose}
            className={`flex-1 py-3 bg-slate-200 text-slate-700 ${tokens.radius.md} hover:bg-slate-300 transition-colors ${tokens.focus}`}
          >
            {ACTION_LABELS.cancel}
          </button>
          <button
            onClick={() => onSend(message)}
            disabled={!message.trim()}
            className={`flex-1 py-3 ${tokens.gradients.info} ${tokens.textColors.white} ${tokens.radius.md} hover:opacity-90 transition-all ${tokens.disabled} ${tokens.focus}`}
          >
            Envoyer la demande
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}