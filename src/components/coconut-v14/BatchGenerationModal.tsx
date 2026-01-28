/**
 * BATCH GENERATION MODAL - Enterprise Feature
 * 
 * Permet aux utilisateurs Enterprise de générer plusieurs variantes
 * en une seule action - différentiateur clé vs Individual users.
 * 
 * Features:
 * - Configure batch size (2-10 variantes)
 * - Type de variation (Seed, Prompt, Style, Creative)
 * - Cost calculator avec batch discount
 * - Preview des variations
 * - BDS 7 Arts compliance
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Layers,
  Zap,
  Sparkles,
  Shuffle,
  Wand2,
  Palette,
  Clock,
  AlertCircle,
  Info,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useSoundContext } from './SoundProvider';
import type { GeminiAnalysisResponse } from '../../lib/types/gemini';

// ============================================
// TYPES
// ============================================

export type VariationType = 
  | 'seed'      // Même prompt, différentes seeds → variations subtiles
  | 'prompt'    // Variations du prompt → variations modérées
  | 'style'     // Différents styles visuels → variations marquées
  | 'creative'; // Mix créatif de tout → variations maximales

export interface BatchConfig {
  count: number;              // 2-10 variantes
  variationType: VariationType;
  preserveCore: boolean;      // Garder les éléments clés (composition, couleurs)
  parallelGeneration: boolean; // Générer en parallèle (plus rapide)
}

interface BatchGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: BatchConfig) => void;
  analysis: GeminiAnalysisResponse;
  userCredits: number;
  baseCost: number; // Coût d'une génération simple
  isLoading?: boolean;
}

// ============================================
// VARIATION TYPE CONFIGS
// ============================================

const VARIATION_TYPES: Record<VariationType, {
  label: string;
  icon: React.ElementType;
  description: string;
  example: string;
  costMultiplier: number; // Multiplicateur du coût de base
  gradient: string;
}> = {
  seed: {
    label: 'Seed Variations',
    icon: Shuffle,
    description: 'Variations subtiles avec différentes seeds aléatoires',
    example: 'Même composition, légères différences de détails et textures',
    costMultiplier: 1.0, // Coût normal
    gradient: 'from-blue-500 to-cyan-500',
  },
  prompt: {
    label: 'Prompt Variations',
    icon: Wand2,
    description: 'Variations modérées du prompt par IA',
    example: 'Angles différents, éclairages variés, même style général',
    costMultiplier: 1.1, // +10% (Gemini re-génère des prompts)
    gradient: 'from-purple-500 to-pink-500',
  },
  style: {
    label: 'Style Variations',
    icon: Palette,
    description: 'Différents styles visuels appliqués au même concept',
    example: 'Minimaliste, maximaliste, vintage, futuriste, etc.',
    costMultiplier: 1.2, // +20% (Génère des style prompts)
    gradient: 'from-amber-500 to-orange-500',
  },
  creative: {
    label: 'Creative Mix',
    icon: Sparkles,
    description: 'Mix créatif de variations pour exploration maximale',
    example: 'Combinaison de seed, prompt et style variations',
    costMultiplier: 1.3, // +30% (Le plus complexe)
    gradient: 'from-[var(--coconut-shell)] to-[var(--coconut-palm)]',
  },
};

// ============================================
// BATCH DISCOUNT TIERS
// ============================================

const BATCH_DISCOUNTS = [
  { minCount: 5, discount: 0.05, label: '5% off' },   // 5+ variantes
  { minCount: 7, discount: 0.10, label: '10% off' },  // 7+ variantes
  { minCount: 10, discount: 0.15, label: '15% off' }, // 10 variantes
];

// ============================================
// COMPONENT
// ============================================

export const BatchGenerationModal: React.FC<BatchGenerationModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  analysis,
  userCredits,
  baseCost,
  isLoading = false,
}) => {
  const { playClick, playHover, playSuccess } = useSoundContext();
  
  const [count, setCount] = useState(3);
  const [variationType, setVariationType] = useState<VariationType>('seed');
  const [preserveCore, setPreserveCore] = useState(true);
  const [parallelGeneration, setParallelGeneration] = useState(true);
  
  // Calculate total cost with discounts
  const costCalculation = useMemo(() => {
    const typeMultiplier = VARIATION_TYPES[variationType].costMultiplier;
    const baseTotal = baseCost * count * typeMultiplier;
    
    // Find applicable discount
    const applicableDiscount = [...BATCH_DISCOUNTS]
      .reverse()
      .find(tier => count >= tier.minCount);
    
    const discount = applicableDiscount?.discount || 0;
    const discountAmount = baseTotal * discount;
    const total = Math.ceil(baseTotal - discountAmount);
    
    return {
      baseTotal: Math.ceil(baseTotal),
      discount,
      discountAmount: Math.ceil(discountAmount),
      total,
      perVariant: Math.ceil(total / count),
      canAfford: userCredits >= total,
    };
  }, [count, variationType, baseCost, userCredits]);
  
  // Estimated time (parallel vs sequential)
  const estimatedTime = useMemo(() => {
    const baseTime = 15; // seconds per generation
    if (parallelGeneration) {
      // Parallel: time of slowest generation + overhead
      return baseTime + (count * 2); // 2s overhead per variant
    } else {
      // Sequential: sum of all generations
      return baseTime * count;
    }
  }, [count, parallelGeneration]);
  
  const handleGenerate = () => {
    playSuccess();
    onGenerate({
      count,
      variationType,
      preserveCore,
      parallelGeneration,
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 30px 100px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-white/10 bg-black/40 backdrop-blur-xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] flex items-center justify-center">
                <Layers size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Batch Generation</h2>
                <p className="text-sm text-gray-400">Generate multiple variations in one go</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Enterprise Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/10 border border-[var(--coconut-shell)]/30"
          >
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-[var(--coconut-shell)] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Enterprise Feature</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Batch generation allows you to explore multiple variations efficiently. 
                  Individual users can only generate one at a time.
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Batch Size Selector */}
          <div>
            <label className="text-sm font-semibold text-white mb-3 block">
              Number of Variations
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 5, 7, 10].map((num) => {
                const isSelected = count === num;
                const discount = BATCH_DISCOUNTS.find(d => num >= d.minCount);
                
                return (
                  <button
                    key={num}
                    onClick={() => {
                      playClick();
                      setCount(num);
                    }}
                    onMouseEnter={() => playHover()}
                    className={`
                      relative p-4 rounded-xl border transition-all
                      ${isSelected
                        ? 'bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] border-[var(--coconut-shell)]/50 text-white shadow-lg scale-105'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                      }
                    `}
                  >
                    <div className="text-2xl font-bold mb-1">{num}</div>
                    {discount && (
                      <div className="text-xs bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded">
                        {discount.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Variation Type Selector */}
          <div>
            <label className="text-sm font-semibold text-white mb-3 block">
              Variation Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.keys(VARIATION_TYPES) as VariationType[]).map((type) => {
                const config = VARIATION_TYPES[type];
                const Icon = config.icon;
                const isSelected = variationType === type;
                
                return (
                  <button
                    key={type}
                    onClick={() => {
                      playClick();
                      setVariationType(type);
                    }}
                    onMouseEnter={() => playHover()}
                    className={`
                      relative p-4 rounded-xl border text-left transition-all
                      ${isSelected
                        ? `bg-gradient-to-br ${config.gradient} bg-opacity-20 border-white/30 text-white`
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle size={18} className="text-white" />
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white mb-1">
                          {config.label}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {config.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pl-13 text-xs text-gray-500 italic">
                      "{config.example}"
                    </div>
                    
                    {config.costMultiplier > 1 && (
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 text-xs text-gray-300">
                        <Zap size={12} />
                        +{((config.costMultiplier - 1) * 100).toFixed(0)}% cost
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Advanced Options */}
          <div>
            <label className="text-sm font-semibold text-white mb-3 block">
              Advanced Options
            </label>
            <div className="space-y-3">
              {/* Preserve Core */}
              <button
                onClick={() => {
                  playClick();
                  setPreserveCore(!preserveCore);
                }}
                className={`
                  w-full p-4 rounded-xl border text-left transition-all
                  ${preserveCore
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-white">Preserve Core Elements</h4>
                      {preserveCore && <CheckCircle size={16} className="text-green-400" />}
                    </div>
                    <p className="text-xs text-gray-400">
                      Maintain composition, color palette, and key elements across variations
                    </p>
                  </div>
                </div>
              </button>
              
              {/* Parallel Generation */}
              <button
                onClick={() => {
                  playClick();
                  setParallelGeneration(!parallelGeneration);
                }}
                className={`
                  w-full p-4 rounded-xl border text-left transition-all
                  ${parallelGeneration
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-white">Parallel Generation</h4>
                      {parallelGeneration && <CheckCircle size={16} className="text-green-400" />}
                    </div>
                    <p className="text-xs text-gray-400">
                      Generate all variations simultaneously (faster but uses more resources)
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          {/* Cost Breakdown */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">Cost Breakdown</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Base cost per variant</span>
                <span className="text-white font-medium">{baseCost} credits</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Variation type multiplier</span>
                <span className="text-white font-medium">×{VARIATION_TYPES[variationType].costMultiplier}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Number of variants</span>
                <span className="text-white font-medium">×{count}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white font-medium">{costCalculation.baseTotal} credits</span>
              </div>
              
              {costCalculation.discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-400 flex items-center gap-1">
                    <TrendingUp size={14} />
                    Batch discount ({(costCalculation.discount * 100).toFixed(0)}%)
                  </span>
                  <span className="text-green-400 font-medium">
                    -{costCalculation.discountAmount} credits
                  </span>
                </div>
              )}
              
              <div className="pt-3 border-t border-white/20 flex items-center justify-between">
                <span className="font-semibold text-white">Total Cost</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  {costCalculation.total} credits
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Cost per variant</span>
                <span>{costCalculation.perVariant} credits</span>
              </div>
            </div>
            
            {/* Credits Status */}
            <div className="mt-4 p-3 rounded-lg bg-black/30 border border-white/10">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Your credits</span>
                <span className="font-bold text-white">{userCredits} credits</span>
              </div>
              {costCalculation.canAfford ? (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle size={14} />
                  <span>Sufficient credits</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle size={14} />
                  <span>Insufficient credits (need {costCalculation.total - userCredits} more)</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Estimated Time */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-white font-medium">Estimated Time</p>
              <p className="text-xs text-gray-400">
                ~{estimatedTime}s {parallelGeneration ? '(parallel)' : '(sequential)'}
              </p>
            </div>
          </div>
          
          {/* Info */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400 leading-relaxed">
                All variations will be based on your current CocoBoard configuration. 
                You can compare and select the best variants after generation.
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 p-6 border-t border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="flex gap-3">
            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              onClick={handleGenerate}
              disabled={isLoading || !costCalculation.canAfford}
              className={`
                flex-1 h-12 rounded-xl font-semibold transition-all
                flex items-center justify-center gap-2
                ${isLoading || !costCalculation.canAfford
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] hover:shadow-lg hover:shadow-[var(--coconut-shell)]/30 text-white'
                }
              `}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Layers size={18} />
                  <span>Generate {count} Variations</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
