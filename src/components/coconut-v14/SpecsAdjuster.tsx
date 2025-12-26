/**
 * COCONUT V14 - SPECS ADJUSTER
 * Phase 3 - Jour 5: Adjust technical specifications
 */

import React from 'react';
import { Maximize2, Zap, Layers } from 'lucide-react';

interface Specs {
  format: string;
  resolution: string;
  mode: 'single-pass' | 'multi-pass';
  passes?: number;
}

interface SpecsAdjusterProps {
  specs: Specs;
  onChange: (specs: Specs) => void;
  disabled?: boolean;
}

const FORMATS = [
  { value: '1:1', label: 'Square (1:1)', icon: '□', description: 'Perfect for social media' },
  { value: '3:4', label: 'Portrait (3:4)', icon: '▯', description: 'Instagram portrait' },
  { value: '4:3', label: 'Landscape (4:3)', icon: '▭', description: 'Standard landscape' },
  { value: '9:16', label: 'Vertical (9:16)', icon: '▯', description: 'Stories, Reels' },
  { value: '16:9', label: 'Horizontal (16:9)', icon: '▭', description: 'Widescreen, YouTube' },
  { value: '21:9', label: 'Ultra-wide (21:9)', icon: '▬', description: 'Cinematic' },
];

const RESOLUTIONS = [
  { value: '1K', label: '1K', description: 'Fast generation', pixels: '1024×1024', multiplier: '1.0x' },
  { value: '2K', label: '2K', description: 'Balanced quality', pixels: '2048×2048', multiplier: '1.5x' },
  { value: '4K', label: '4K', description: 'Maximum detail', pixels: '4096×4096', multiplier: '2.5x' },
];

export function SpecsAdjuster({ specs, onChange, disabled = false }: SpecsAdjusterProps) {
  const handleFormatChange = (format: string) => {
    onChange({ ...specs, format });
  };

  const handleResolutionChange = (resolution: string) => {
    onChange({ ...specs, resolution });
  };

  const handleModeChange = (mode: 'single-pass' | 'multi-pass') => {
    onChange({ ...specs, mode, passes: mode === 'multi-pass' ? 2 : undefined });
  };

  const handlePassesChange = (passes: number) => {
    onChange({ ...specs, passes });
  };

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Maximize2 className="w-5 h-5 text-slate-700" />
          <h3 className="text-lg text-slate-900">Aspect Ratio</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {FORMATS.map((format) => (
            <button
              key={format.value}
              onClick={() => handleFormatChange(format.value)}
              disabled={disabled}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                specs.format === format.value
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-2xl">{format.icon}</div>
                {specs.format === format.value && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                )}
              </div>
              <div className={`text-sm mb-1 ${specs.format === format.value ? 'text-blue-900' : 'text-slate-900'}`}>
                {format.label}
              </div>
              <div className={`text-xs ${specs.format === format.value ? 'text-blue-700' : 'text-slate-600'}`}>
                {format.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Resolution Selection */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="w-5 h-5 text-slate-700" />
          <h3 className="text-lg text-slate-900">Resolution</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {RESOLUTIONS.map((resolution) => (
            <button
              key={resolution.value}
              onClick={() => handleResolutionChange(resolution.value)}
              disabled={disabled}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                specs.resolution === resolution.value
                  ? 'border-purple-600 bg-purple-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {specs.resolution === resolution.value && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </div>
              )}
              <div className={`text-xl mb-1 ${specs.resolution === resolution.value ? 'text-purple-900' : 'text-slate-900'}`}>
                {resolution.label}
              </div>
              <div className={`text-xs mb-1 ${specs.resolution === resolution.value ? 'text-purple-700' : 'text-slate-600'}`}>
                {resolution.pixels}
              </div>
              <div className={`text-xs ${specs.resolution === resolution.value ? 'text-purple-700' : 'text-slate-600'}`}>
                {resolution.description}
              </div>
              <div className={`text-xs mt-2 px-2 py-1 rounded inline-block ${
                specs.resolution === resolution.value 
                  ? 'bg-purple-200 text-purple-900' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                Cost: {resolution.multiplier}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Selection */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Layers className="w-5 h-5 text-slate-700" />
          <h3 className="text-lg text-slate-900">Generation Mode</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Single Pass */}
          <button
            onClick={() => handleModeChange('single-pass')}
            disabled={disabled}
            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
              specs.mode === 'single-pass'
                ? 'border-green-600 bg-green-50 shadow-md'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {specs.mode === 'single-pass' && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </div>
            )}
            <div className={`text-lg mb-1 ${specs.mode === 'single-pass' ? 'text-green-900' : 'text-slate-900'}`}>
              Single-Pass
            </div>
            <div className={`text-sm mb-2 ${specs.mode === 'single-pass' ? 'text-green-700' : 'text-slate-600'}`}>
              Fast generation with good quality
            </div>
            <div className="flex items-center space-x-2">
              <div className={`text-xs px-2 py-1 rounded ${
                specs.mode === 'single-pass' 
                  ? 'bg-green-200 text-green-900' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                ⚡ Fast
              </div>
              <div className={`text-xs px-2 py-1 rounded ${
                specs.mode === 'single-pass' 
                  ? 'bg-green-200 text-green-900' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                💰 Lower cost
              </div>
            </div>
          </button>

          {/* Multi Pass */}
          <button
            onClick={() => handleModeChange('multi-pass')}
            disabled={disabled}
            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
              specs.mode === 'multi-pass'
                ? 'border-orange-600 bg-orange-50 shadow-md'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {specs.mode === 'multi-pass' && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </div>
            )}
            <div className={`text-lg mb-1 ${specs.mode === 'multi-pass' ? 'text-orange-900' : 'text-slate-900'}`}>
              Multi-Pass
            </div>
            <div className={`text-sm mb-2 ${specs.mode === 'multi-pass' ? 'text-orange-700' : 'text-slate-600'}`}>
              Multiple iterations for premium quality
            </div>
            <div className="flex items-center space-x-2">
              <div className={`text-xs px-2 py-1 rounded ${
                specs.mode === 'multi-pass' 
                  ? 'bg-orange-200 text-orange-900' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                ✨ Premium
              </div>
              <div className={`text-xs px-2 py-1 rounded ${
                specs.mode === 'multi-pass' 
                  ? 'bg-orange-200 text-orange-900' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                💎 Best quality
              </div>
            </div>
          </button>
        </div>

        {/* Passes Slider (Multi-Pass only) */}
        {specs.mode === 'multi-pass' && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-orange-900">Number of Passes</label>
              <span className="text-lg text-orange-900">{specs.passes || 2}</span>
            </div>
            <input
              type="range"
              min="2"
              max="5"
              step="1"
              value={specs.passes || 2}
              onChange={(e) => handlePassesChange(parseInt(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
            />
            <div className="flex justify-between text-xs text-orange-700 mt-1">
              <span>2 passes</span>
              <span>5 passes</span>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h4 className="text-sm text-slate-900 mb-2">📋 Current Configuration</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-600">Format:</span>
            <span className="ml-2 text-slate-900">{specs.format}</span>
          </div>
          <div>
            <span className="text-slate-600">Resolution:</span>
            <span className="ml-2 text-slate-900">{specs.resolution}</span>
          </div>
          <div>
            <span className="text-slate-600">Mode:</span>
            <span className="ml-2 text-slate-900 capitalize">{specs.mode}</span>
          </div>
          {specs.mode === 'multi-pass' && (
            <div>
              <span className="text-slate-600">Passes:</span>
              <span className="ml-2 text-slate-900">{specs.passes || 2}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
