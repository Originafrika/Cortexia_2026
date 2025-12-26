/**
 * TEXT TO IMAGE TOOL
 * Génération d'images à partir de texte
 * BDS: Toutes les dimensions appliquées
 */

import { useState } from 'react';
import { Wand2, Download, Sparkles, ArrowLeft, Loader2, Zap, Crown } from 'lucide-react';
import { generateTextToImage } from '../../../lib/services/creation-tools-mock';
import { PRESET_DIMENSIONS, PRESET_STYLES, CREDIT_COSTS, API_ROUTING } from '../../../lib/config/creation-tools';
import type { TextToImageResult } from '../../../lib/types/creation-tools';

interface TextToImageToolProps {
  onBack: () => void;
}

export function TextToImageTool({ onBack }: TextToImageToolProps) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedDimension, setSelectedDimension] = useState<keyof typeof PRESET_DIMENSIONS>('square');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<TextToImageResult | null>(null);

  const creditCost = CREDIT_COSTS['text-to-image'];
  const routing = API_ROUTING['text-to-image'];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setResult(null);

    try {
      const dimension = PRESET_DIMENSIONS[selectedDimension];
      const generated = await generateTextToImage({
        prompt: `${prompt}, ${selectedStyle} style`,
        negativePrompt,
        width: dimension.width,
        height: dimension.height,
        provider: 'replicate', // Auto-selected, not user choice
      });
      setResult(generated);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au hub
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold">Text to Image</h1>
            
            {/* Credit cost badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">{creditCost} crédits</span>
            </div>
          </div>
          
          <p className="text-gray-400 mb-3">Générez des images professionnelles à partir de descriptions textuelles</p>
          
          {/* Powered by */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Sparkles className="w-3 h-3" />
            <span>Powered by {routing.primary.model} • {routing.speed}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Controls */}
          <div className="space-y-6">
            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium mb-2">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: A majestic dragon flying over a medieval castle at sunset..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 resize-none focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">{prompt.length} / 500</p>
            </div>

            {/* Negative Prompt */}
            <div>
              <label className="block text-sm font-medium mb-2">Negative Prompt (optionnel)</label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="Ex: blurry, low quality, watermark..."
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium mb-3">Dimensions</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(PRESET_DIMENSIONS).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDimension(key as keyof typeof PRESET_DIMENSIONS)}
                    className={`
                      p-3 rounded-lg border transition-all
                      ${selectedDimension === key
                        ? 'bg-purple-600/20 border-purple-500/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                      }
                    `}
                  >
                    <p className="text-sm font-medium mb-1">{value.label}</p>
                    <p className="text-xs text-gray-500">{value.width} × {value.height}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-medium mb-3">Style</label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${selectedStyle === style.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }
                    `}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={`
                w-full py-4 rounded-xl font-medium text-lg transition-all flex items-center justify-center gap-2
                ${prompt.trim() && !isGenerating
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Générer l'image ({creditCost} crédits)
                </>
              )}
            </button>
            
            {/* Info note */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-300">
                💡 <span className="font-medium">Best model automatically selected:</span> We use {routing.primary.model.split('/')[1]} for optimal quality
              </p>
            </div>
          </div>

          {/* Right: Preview */}
          <div>
            <div className="sticky top-8">
              <label className="block text-sm font-medium mb-3">Aperçu</label>
              <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                {result ? (
                  <div className="relative h-full group">
                    <img
                      src={result.url}
                      alt="Generated"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="px-4 py-2 bg-white text-black rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors">
                        <Download className="w-4 h-4" />
                        Télécharger
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-600">
                    {isGenerating ? (
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-400" />
                        <p className="text-sm text-gray-400">Génération en cours...</p>
                        <p className="text-xs text-gray-500 mt-2">{routing.speed}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Sparkles className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-sm">Votre image apparaîtra ici</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {result && (
                <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-gray-400 mb-2">Informations</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-300">
                      <span className="text-gray-500">Dimensions:</span> {result.width} × {result.height}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-500">Model:</span> {routing.primary.model.split('/')[1]}
                    </p>
                    <p className="text-gray-300 truncate">
                      <span className="text-gray-500">Prompt:</span> {result.prompt}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}