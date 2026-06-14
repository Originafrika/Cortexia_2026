// SmartModelSelector - AI-powered model selection with explanations
// Fixes: Auto-selection invisible, pas d'explication, pas de confiance

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Crown, Info, Zap, Wand2 } from "lucide-react";

export type ModelId = 'auto' | 'flux-schnell' | 'flux-2-pro' | 'flux-2-flex' | 'nano-banana-pro' | 'kling-3.0-pro' | 'wan-2.6';

export interface ModelInfo {
  id: ModelId;
  name: string;
  description: string;
  cost: number;
  creditType: 'free' | 'paid';
  icon: string;
  bestFor: string;
  stats?: string;
}

interface SmartModelSelectorProps {
  selectedModel: ModelId;
  imageCount: number;
  quality: 'standard' | 'premium';
  onModelChange: (model: ModelId) => void;
  autoSelected?: boolean;
}

const MODEL_INFO: Record<ModelId, Omit<ModelInfo, 'id'>> = {
  auto: {
    name: 'Auto-Select',
    description: 'AI chooses the best model for your request',
    cost: 1,
    creditType: 'free',
    icon: '✨',
    bestFor: 'Optimal results every time'
  },
  'flux-schnell': {
    name: 'Flux Schnell',
    description: 'Ultra-fast high-quality generation',
    cost: 1,
    creditType: 'free',
    icon: '⚡',
    bestFor: 'Quick concepts and everyday use',
    stats: 'Sub-5s generation'
  },
  'flux-2-flex': {
    name: 'Flux 2 Flex',
    description: 'Balanced speed and professional quality',
    cost: 3,
    creditType: 'paid',
    icon: '🎨',
    bestFor: 'Creative iterations and artistic styles',
    stats: 'High artistic flexibility'
  },
  'flux-2-pro': {
    name: 'Flux 2 Pro',
    description: 'Maximum photorealism and detail',
    cost: 5,
    creditType: 'paid',
    icon: '👑',
    bestFor: 'Commercial photography and hero assets',
    stats: 'Top-tier realism'
  },
  'nano-banana-pro': {
    name: 'Nano Banana Pro',
    description: 'Luxury aesthetic & skin tones',
    cost: 4,
    creditType: 'paid',
    icon: '🍌',
    bestFor: 'African subjects and high-end fashion',
    stats: 'Best for diverse subjects'
  },
  'kling-3.0-pro': {
    name: 'Kling 3.0 Pro',
    description: 'Next-gen AI Video',
    cost: 10,
    creditType: 'paid',
    icon: '🎬',
    bestFor: 'Cinematic movement and realism',
    stats: 'Physics-accurate motion'
  },
  'wan-2.6': {
    name: 'Wan 2.6 Pro',
    description: 'Stable cinematic sequences',
    cost: 8,
    creditType: 'paid',
    icon: '🔮',
    bestFor: 'Longer videos and high stability',
    stats: '1080p native quality'
  }
};

function getAutoSelectedModel(imageCount: number, quality: 'standard' | 'premium'): ModelId {
  if (quality === 'premium') return 'flux-2-pro';
  return 'flux-schnell';
}

function getSelectionReason(imageCount: number, quality: 'standard' | 'premium', model: ModelId): string {
  if (quality === 'premium') {
    return 'Premium quality selected for professional-grade results with maximum detail and realism.';
  }
  
  return 'Fast, reliable model selected for optimal performance and quality balance.';
}

export function SmartModelSelector({
  selectedModel,
  imageCount,
  quality,
  onModelChange,
  autoSelected = true
}: SmartModelSelectorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const effectiveModel = selectedModel === 'auto' 
    ? getAutoSelectedModel(imageCount, quality)
    : selectedModel;
  
  const modelInfo = MODEL_INFO[effectiveModel] || MODEL_INFO['flux-schnell'];
  const selectionReason = getSelectionReason(imageCount, quality, effectiveModel);
  const isPremium = modelInfo.creditType === 'paid';

  return (
    <div className="space-y-3">
      {/* Current Selection Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#6366f1]/20 to-[#8b5cf6]/20 border border-[#6366f1]/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-[#6366f1] flex items-center justify-center">
            {autoSelected && selectedModel === 'auto' ? (
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            ) : isPremium ? (
              <Crown className="w-5 h-5 text-yellow-400" />
            ) : (
              <Wand2 className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-white font-medium">{modelInfo.name}</p>
              {autoSelected && selectedModel === 'auto' && (
                <span className="px-2 py-0.5 rounded-full bg-[#6366f1]/30 text-[#6366f1] text-xs font-medium">
                  ✨ AI-Selected
                </span>
              )}
            </div>
            <p className="text-xs text-white/60">{modelInfo.description}</p>
          </div>
        </div>

        {/* Explanation Box */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-black/30">
          <Info className="w-4 h-4 text-[#6366f1] flex-shrink-0 mt-0.5" />
          <p 
            className="text-xs text-white/70 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: selectionReason }}
          />
        </div>

        {/* Stats Badge */}
        {modelInfo.stats && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-white/50">{modelInfo.bestFor}</span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/20">
              <Sparkles className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-medium">
                {modelInfo.stats}
              </span>
            </div>
          </div>
        )}

        {/* Cost Display */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/50">Generation cost</span>
          <div className="flex items-center gap-2">
            <div className={`
              px-2 py-1 rounded-md text-xs font-medium
              ${isPremium 
                ? 'bg-yellow-500/20 text-yellow-400' 
                : 'bg-green-500/20 text-green-400'
              }
            `}>
              {isPremium ? 'Pro' : 'Free'}
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#6366f1]" />
              <span className="text-sm font-medium text-white tabular-nums">
                {modelInfo.cost} credit{modelInfo.cost > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Override */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs text-white/60 hover:text-white/90 underline transition-colors"
      >
        {showAdvanced ? 'Hide' : 'Choose different model manually'}
      </button>

      {/* Advanced Model Selection */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {Object.entries(MODEL_INFO).map(([id, info]) => {
              if (id === 'auto') return null; // Skip auto in manual list
              const isSelected = selectedModel === id;
              const model = info as ModelInfo;
              
              return (
                <motion.button
                  key={id}
                  onClick={() => onModelChange(id as ModelId)}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full p-3 rounded-xl border-2 transition-all text-left
                    ${isSelected
                      ? 'border-[#6366f1] bg-[#6366f1]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{model.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {model.name}
                        </span>
                        <span className={`
                          px-2 py-0.5 rounded-full text-xs font-medium
                          ${model.creditType === 'paid'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                          }
                        `}>
                          {model.creditType === 'paid' ? 'Pro' : 'Free'}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 mb-1">
                        {model.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-white/40">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>{model.cost} credit{model.cost > 1 ? 's' : ''}</span>
                        </div>
                        {model.stats && (
                          <span>• {model.stats}</span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#6366f1] flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
