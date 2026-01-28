/**
 * BATCH RESULTS VIEW - Enterprise Feature
 * 
 * Affiche toutes les variantes générées en batch avec comparaison side-by-side
 * et sélection des meilleures.
 * 
 * Features:
 * - Grid view avec toutes les variantes
 * - Compare mode (2-4 variantes côte à côte)
 * - Favorite/star system
 * - Download selected
 * - Regenerate individual variants
 * - BDS 7 Arts compliance
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Star,
  StarOff,
  Maximize2,
  Grid3x3,
  Columns,
  RefreshCw,
  Check,
  Trash2,
  Eye,
  Share2,
  ArrowLeft
} from 'lucide-react';
import { useSoundContext } from './SoundProvider';

// ============================================
// TYPES
// ============================================

export interface BatchVariant {
  id: string;
  imageUrl: string;
  prompt: string;
  seed: number;
  variationType: string;
  generatedAt: Date;
  isFavorite: boolean;
}

interface BatchResultsViewProps {
  variants: BatchVariant[];
  onClose: () => void;
  onToggleFavorite: (variantId: string) => void;
  onDownload: (variantIds: string[]) => void;
  onRegenerate: (variantId: string) => void;
  onDelete: (variantId: string) => void;
}

type ViewMode = 'grid' | 'compare';

// ============================================
// COMPONENT
// ============================================

export const BatchResultsView: React.FC<BatchResultsViewProps> = ({
  variants,
  onClose,
  onToggleFavorite,
  onDownload,
  onRegenerate,
  onDelete,
}) => {
  const { playClick, playHover, playSuccess } = useSoundContext();
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set());
  const [previewVariant, setPreviewVariant] = useState<BatchVariant | null>(null);
  
  const favorites = variants.filter(v => v.isFavorite);
  
  const toggleSelection = (variantId: string) => {
    playClick();
    setSelectedVariants(prev => {
      const next = new Set(prev);
      if (next.has(variantId)) {
        next.delete(variantId);
      } else {
        next.add(variantId);
      }
      return next;
    });
  };
  
  const selectAll = () => {
    playClick();
    setSelectedVariants(new Set(variants.map(v => v.id)));
  };
  
  const deselectAll = () => {
    playClick();
    setSelectedVariants(new Set());
  };
  
  const downloadSelected = () => {
    playSuccess();
    const ids = Array.from(selectedVariants);
    onDownload(ids);
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl">
      {/* Header */}
      <div className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="h-full max-w-[1800px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm">Back to CocoBoard</span>
            </button>
            
            <div className="h-6 w-px bg-white/10" />
            
            <div>
              <h2 className="text-lg font-bold text-white">
                Batch Results
              </h2>
              <p className="text-xs text-gray-500">
                {variants.length} variants • {favorites.length} favorites • {selectedVariants.size} selected
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
              <button
                onClick={() => {
                  playClick();
                  setViewMode('grid');
                }}
                className={`
                  px-3 py-1.5 rounded-md text-xs font-medium transition-all
                  ${viewMode === 'grid'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                  }
                `}
              >
                <Grid3x3 size={14} className="inline mr-1" />
                Grid
              </button>
              
              <button
                onClick={() => {
                  playClick();
                  setViewMode('compare');
                }}
                className={`
                  px-3 py-1.5 rounded-md text-xs font-medium transition-all
                  ${viewMode === 'compare'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                  }
                `}
              >
                <Columns size={14} className="inline mr-1" />
                Compare
              </button>
            </div>
            
            {/* Selection Actions */}
            {selectedVariants.size > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <button
                  onClick={downloadSelected}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] hover:shadow-lg hover:shadow-[var(--coconut-shell)]/30 text-white text-sm font-medium transition-all flex items-center gap-2"
                >
                  <Download size={16} />
                  Download ({selectedVariants.size})
                </button>
                
                <button
                  onClick={deselectAll}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white text-sm transition-all"
                >
                  Clear
                </button>
              </motion.div>
            )}
            
            {selectedVariants.size === 0 && (
              <button
                onClick={selectAll}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all flex items-center gap-2"
              >
                <Check size={16} />
                Select All
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="h-[calc(100vh-4rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-[1800px] mx-auto p-6">
          
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {variants.map((variant) => (
                <VariantCard
                  key={variant.id}
                  variant={variant}
                  isSelected={selectedVariants.has(variant.id)}
                  onToggleSelect={() => toggleSelection(variant.id)}
                  onToggleFavorite={() => {
                    playClick();
                    onToggleFavorite(variant.id);
                  }}
                  onPreview={() => {
                    playClick();
                    setPreviewVariant(variant);
                  }}
                  onRegenerate={() => {
                    playClick();
                    onRegenerate(variant.id);
                  }}
                  onDelete={() => {
                    playClick();
                    onDelete(variant.id);
                  }}
                  playHover={playHover}
                />
              ))}
            </div>
          )}
          
          {/* Compare View */}
          {viewMode === 'compare' && (
            <div className="grid grid-cols-2 gap-4">
              {variants.slice(0, 4).map((variant) => (
                <CompareCard
                  key={variant.id}
                  variant={variant}
                  onToggleFavorite={() => {
                    playClick();
                    onToggleFavorite(variant.id);
                  }}
                  onDownload={() => {
                    playClick();
                    onDownload([variant.id]);
                  }}
                  playHover={playHover}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Preview Modal */}
      <AnimatePresence>
        {previewVariant && (
          <PreviewModal
            variant={previewVariant}
            onClose={() => {
              playClick();
              setPreviewVariant(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// VARIANT CARD (Grid View)
// ============================================

interface VariantCardProps {
  variant: BatchVariant;
  isSelected: boolean;
  onToggleSelect: () => void;
  onToggleFavorite: () => void;
  onPreview: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
  playHover: () => void;
}

const VariantCard: React.FC<VariantCardProps> = ({
  variant,
  isSelected,
  onToggleSelect,
  onToggleFavorite,
  onPreview,
  onRegenerate,
  onDelete,
  playHover,
}) => {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        group relative rounded-2xl overflow-hidden cursor-pointer transition-all
        ${isSelected ? 'ring-4 ring-[var(--coconut-shell)]' : ''}
      `}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      onMouseEnter={() => {
        playHover();
        setShowActions(true);
      }}
      onMouseLeave={() => setShowActions(false)}
      onClick={onToggleSelect}
    >
      {/* Image */}
      <div className="aspect-square bg-black/40">
        <img
          src={variant.imageUrl}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3">
        <div
          className={`
            w-6 h-6 rounded-lg border-2 transition-all
            ${isSelected
              ? 'bg-[var(--coconut-shell)] border-[var(--coconut-shell)]'
              : 'bg-black/50 border-white/30 backdrop-blur-sm'
            }
          `}
        >
          {isSelected && <Check size={16} className="text-white m-0.5" />}
        </div>
      </div>
      
      {/* Favorite */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all hover:scale-110"
      >
        {variant.isFavorite ? (
          <Star size={16} className="text-yellow-400 fill-yellow-400" />
        ) : (
          <StarOff size={16} className="text-white/60" />
        )}
      </button>
      
      {/* Actions Overlay */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onPreview}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all"
            >
              <Eye size={18} className="text-white" />
            </button>
            
            <button
              onClick={onRegenerate}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all"
            >
              <RefreshCw size={18} className="text-white" />
            </button>
            
            <button
              onClick={onDelete}
              className="w-10 h-10 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 flex items-center justify-center transition-all"
            >
              <Trash2 size={18} className="text-red-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Info */}
      <div className="p-3 border-t border-white/10">
        <p className="text-xs text-gray-400 line-clamp-2 mb-2">
          {variant.prompt}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Seed: {variant.seed}</span>
          <span className="capitalize">{variant.variationType}</span>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPARE CARD (Compare View)
// ============================================

interface CompareCardProps {
  variant: BatchVariant;
  onToggleFavorite: () => void;
  onDownload: () => void;
  playHover: () => void;
}

const CompareCard: React.FC<CompareCardProps> = ({
  variant,
  onToggleFavorite,
  onDownload,
  playHover,
}) => {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      onMouseEnter={playHover}
    >
      {/* Image */}
      <div className="aspect-square bg-black/40">
        <img
          src={variant.imageUrl}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-white line-clamp-3 flex-1">
            {variant.prompt}
          </p>
          
          <button
            onClick={onToggleFavorite}
            className="flex-shrink-0"
          >
            {variant.isFavorite ? (
              <Star size={20} className="text-yellow-400 fill-yellow-400" />
            ) : (
              <StarOff size={20} className="text-white/60 hover:text-white transition-colors" />
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Seed: {variant.seed}</span>
          <span className="capitalize px-2 py-1 rounded-md bg-white/10">
            {variant.variationType}
          </span>
        </div>
        
        <button
          onClick={onDownload}
          className="w-full h-10 rounded-xl bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] hover:shadow-lg hover:shadow-[var(--coconut-shell)]/30 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
        >
          <Download size={16} />
          Download
        </button>
      </div>
    </div>
  );
};

// ============================================
// PREVIEW MODAL
// ============================================

interface PreviewModalProps {
  variant: BatchVariant;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ variant, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={variant.imageUrl}
          alt=""
          className="w-full h-auto rounded-2xl shadow-2xl"
        />
        
        <div className="mt-4 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
          <p className="text-white text-sm mb-2">{variant.prompt}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Seed: {variant.seed}</span>
            <span className="capitalize">{variant.variationType}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
