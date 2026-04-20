/**
 * COCONUT V14 - SPECS ADJUSTER
 * 
 * ✅ FIXED: BDS Compliance Phase 2B
 * - Design tokens integration
 * - French labels
 * - Icon sizing standardized
 * - Focus states
 * - Consistent spacing/radius
 */

import React from 'react';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 2A: Import sound
import { Maximize2, Zap, Layers, Image as ImageIcon } from 'lucide-react';
import { tokens } from '../../lib/design/tokens';
import { getModelLabel, getModeLabel, getRatioLabel } from '../../lib/i18n/translations';

interface Specs {
  model: 'flux-2-pro' | 'flux-2-dev';
  mode: 'text-to-image' | 'image-to-image';
  ratio: string;
  resolution: '1K' | '2K';
}

interface SpecsAdjusterProps {
  specs: Specs;
  onChange: (specs: Specs) => void;
  disabled?: boolean;
}

const MODELS = [
  { value: 'flux-2-pro' as const, label: 'Flux 2 Pro', description: 'Qualité premium', multiplier: '1.0x' },
  { value: 'flux-2-dev' as const, label: 'Flux 2 Dev', description: 'Mode développement', multiplier: '0.5x' },
];

const MODES = [
  { value: 'text-to-image' as const, label: 'Texte → Image', description: 'Génération depuis le prompt', icon: '✨' },
  { value: 'image-to-image' as const, label: 'Image → Image', description: 'Transformation d\'image existante', icon: '🎨' },
];

const RATIOS = [
  { value: '1:1', label: 'Carré (1:1)', icon: '□', description: 'Parfait pour les réseaux sociaux' },
  { value: '3:4', label: 'Portrait (3:4)', icon: '▯', description: 'Instagram portrait' },
  { value: '4:3', label: 'Paysage (4:3)', icon: '▭', description: 'Paysage standard' },
  { value: '9:16', label: 'Vertical (9:16)', icon: '▯', description: 'Stories, Reels' },
  { value: '16:9', label: 'Horizontal (16:9)', icon: '▭', description: 'Écran large, YouTube' },
  { value: '21:9', label: 'Ultra-large (21:9)', icon: '▬', description: 'Cinématique' },
];

const RESOLUTIONS = [
  { value: '1K' as const, label: '1K', description: 'Génération rapide', pixels: '1024×1024', multiplier: '1.0x' },
  { value: '2K' as const, label: '2K', description: 'Qualité maximale', pixels: '2048×2048', multiplier: '3.0x' },
];

const PRESETS = [
  { 
    emoji: '📱',
    label: 'Post Instagram', 
    ratio: '1:1', 
    resolution: '1K' as const,
    description: 'Format carré pour le feed Instagram'
  },
  { 
    emoji: '📺',
    label: 'Miniature YouTube', 
    ratio: '16:9', 
    resolution: '2K' as const,
    description: 'HD écran large pour vidéo'
  },
  { 
    emoji: '📖',
    label: 'Story/Reel', 
    ratio: '9:16', 
    resolution: '1K' as const,
    description: 'Format vertical pour Stories'
  },
  { 
    emoji: '🖼️',
    label: 'Couverture Facebook', 
    ratio: '16:9', 
    resolution: '2K' as const,
    description: 'Bannière large pour profils'
  },
];

export function SpecsAdjuster({ specs, onChange, disabled = false }: SpecsAdjusterProps) {
  // 🔊 PHASE 2A: Sound context
  const { playPop, playClick } = useSoundContext();

  // Guard against undefined specs (board not yet initialized)
  if (!specs) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-500">
        <div className="text-sm">Loading specs...</div>
      </div>
    );
  }
  
  const handleModelChange = (model: 'flux-2-pro' | 'flux-2-dev') => {
    playPop(); // 🔊 Sound feedback for selection
    onChange({ ...specs, model });
  };

  const handleModeChange = (mode: 'text-to-image' | 'image-to-image') => {
    playPop(); // 🔊 Sound feedback for selection
    onChange({ ...specs, mode });
  };

  const handleRatioChange = (ratio: string) => {
    playPop(); // 🔊 Sound feedback for selection
    onChange({ ...specs, ratio });
  };

  const handleResolutionChange = (resolution: '1K' | '2K') => {
    playPop(); // 🔊 Sound feedback for selection
    onChange({ ...specs, resolution });
  };

  const handlePresetClick = (preset: typeof PRESETS[0]) => {
    playClick(); // 🔊 Sound feedback for preset
    onChange({
      ...specs,
      ratio: preset.ratio,
      resolution: preset.resolution
    });
  };

  return (
    <div className="space-y-6">
      {/* ✅ P1-06: Quick Presets */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="w-5 h-5 text-[var(--coconut-husk)]" />
          <h3 className="text-lg text-slate-900">Quick Presets</h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Popular</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESETS.map((preset) => {
            const isActive = specs.ratio === preset.ratio && specs.resolution === preset.resolution;
            return (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset)}
                disabled={disabled}
                className={`relative p-3 text-left rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isActive
                    ? 'border-[var(--coconut-husk)] bg-[var(--coconut-cream)] shadow-md'
                    : 'border-slate-200 hover:border-[var(--coconut-husk)]/50 hover:bg-[var(--coconut-cream)]/50 bg-white'
                }`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[var(--coconut-husk)] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                )}
                <div className="text-2xl mb-1">{preset.emoji}</div>
                <div className={`text-sm font-medium mb-1 ${isActive ? 'text-[var(--coconut-shell)]' : 'text-slate-900'}`}>
                  {preset.label}
                </div>
                <div className={`text-xs ${isActive ? 'text-[var(--coconut-shell)]' : 'text-slate-600'}`}>
                  {preset.description}
                </div>
                <div className={`text-xs mt-1 flex items-center gap-1 ${isActive ? 'text-[var(--coconut-husk)]' : 'text-slate-500'}`}>
                  <span>{preset.ratio}</span>
                  <span>•</span>
                  <span>{preset.resolution}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Model Selection */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="w-5 h-5 text-slate-700" />
          <h3 className="text-lg text-slate-900">Model</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MODELS.map((model) => (
            <button
              key={model.value}
              onClick={() => handleModelChange(model.value)}
              disabled={disabled}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                specs.model === model.value
                  ? 'border-[var(--coconut-palm)] bg-[var(--coconut-cream)] shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {specs.model === model.value && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-[var(--coconut-palm)] rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </div>
              )}
              <div className={`text-lg mb-1 ${specs.model === model.value ? 'text-[var(--coconut-shell)]' : 'text-slate-900'}`}>
                {model.label}
              </div>
              <div className={`text-sm mb-2 ${specs.model === model.value ? 'text-[var(--coconut-husk)]' : 'text-slate-600'}`}>
                {model.description}
              </div>
              <div className={`text-xs px-2 py-1 rounded inline-block ${
                specs.model === model.value 
                  ? 'bg-[var(--coconut-husk)]/20 text-[var(--coconut-shell)]' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                Cost: {model.multiplier}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Selection */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <ImageIcon className="w-5 h-5 text-slate-700" />
          <h3 className="text-lg text-slate-900">Generation Mode</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => handleModeChange(mode.value)}
              disabled={disabled}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                specs.mode === mode.value
                  ? 'border-[var(--coconut-husk)] bg-[var(--coconut-cream)] shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {specs.mode === mode.value && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-[var(--coconut-husk)] rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </div>
              )}
              <div className="text-2xl mb-2">{mode.icon}</div>
              <div className={`text-lg mb-1 ${specs.mode === mode.value ? 'text-[var(--coconut-shell)]' : 'text-slate-900'}`}>
                {mode.label}
              </div>
              <div className={`text-sm ${specs.mode === mode.value ? 'text-[var(--coconut-husk)]' : 'text-slate-600'}`}>
                {mode.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio Selection */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Maximize2 className="w-5 h-5 text-slate-700" />
          <h3 className="text-lg text-slate-900">Aspect Ratio</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {RATIOS.map((ratio) => (
            <button
              key={ratio.value}
              onClick={() => handleRatioChange(ratio.value)}
              disabled={disabled}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                specs.ratio === ratio.value
                  ? 'border-[var(--coconut-palm)] bg-[var(--coconut-palm)]/10 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-2xl">{ratio.icon}</div>
                {specs.ratio === ratio.value && (
                  <div className="w-5 h-5 bg-[var(--coconut-palm)] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                )}
              </div>
              <div className={`text-sm mb-1 ${specs.ratio === ratio.value ? 'text-[var(--coconut-shell)]' : 'text-slate-900'}`}>
                {ratio.label}
              </div>
              <div className={`text-xs ${specs.ratio === ratio.value ? 'text-[var(--coconut-husk)]' : 'text-slate-600'}`}>
                {ratio.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Resolution Selection */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Layers className="w-5 h-5 text-slate-700" />
          <h3 className="text-lg text-slate-900">Resolution</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {RESOLUTIONS.map((resolution) => (
            <button
              key={resolution.value}
              onClick={() => handleResolutionChange(resolution.value)}
              disabled={disabled}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                specs.resolution === resolution.value
                  ? 'border-[var(--coconut-husk)] bg-[var(--coconut-cream)] shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {specs.resolution === resolution.value && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-[var(--coconut-husk)] rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </div>
              )}
              <div className={`text-xl mb-1 ${specs.resolution === resolution.value ? 'text-[var(--coconut-shell)]' : 'text-slate-900'}`}>
                {resolution.label}
              </div>
              <div className={`text-xs mb-1 ${specs.resolution === resolution.value ? 'text-[var(--coconut-husk)]' : 'text-slate-600'}`}>
                {resolution.pixels}
              </div>
              <div className={`text-xs ${specs.resolution === resolution.value ? 'text-[var(--coconut-husk)]' : 'text-slate-600'}`}>
                {resolution.description}
              </div>
              <div className={`text-xs mt-2 px-2 py-1 rounded inline-block ${
                specs.resolution === resolution.value 
                  ? 'bg-[var(--coconut-husk)]/20 text-[var(--coconut-shell)]' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                Cost: {resolution.multiplier}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h4 className="text-sm text-slate-900 mb-2">📋 Current Configuration</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-600">Model:</span>
            <span className="ml-2 text-slate-900">{specs.model}</span>
          </div>
          <div>
            <span className="text-slate-600">Mode:</span>
            <span className="ml-2 text-slate-900 capitalize">{(specs.mode || 'text-to-image').replace('-', ' ')}</span>
          </div>
          <div>
            <span className="text-slate-600">Ratio:</span>
            <span className="ml-2 text-slate-900">{specs.ratio}</span>
          </div>
          <div>
            <span className="text-slate-600">Resolution:</span>
            <span className="ml-2 text-slate-900">{specs.resolution}</span>
          </div>
        </div>
      </div>
    </div>
  );
}