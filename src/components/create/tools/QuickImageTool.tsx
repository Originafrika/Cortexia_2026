/**
 * QUICK IMAGE TOOL
 * Text-to-image with SeeDream (free)
 * With automatic fallback to Flux Schnell if Pollinations down
 */

import { useState } from 'react';
import { Wand2, Download, Sparkles, ArrowLeft, Loader2, Zap, AlertTriangle } from 'lucide-react';
import { getModelById, PROVIDER_STATUS } from '../../../lib/config/models-catalog';

interface QuickImageToolProps {
  onBack: () => void;
  userFreeCredits: number;
  userPaidCredits: number;
}

export function QuickImageTool({ onBack, userFreeCredits, userPaidCredits }: QuickImageToolProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  const primaryModel = getModelById('seedream')!;
  const fallbackModel = getModelById('flux-schnell')!;
  const pollinationsDown = !PROVIDER_STATUS.pollinations.available;
  
  // Determine which model will be used
  const activeModel = pollinationsDown ? fallbackModel : primaryModel;
  const creditCost = activeModel.creditCost;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (userPaidCredits > 0) {
      alert('Vous avez des crédits payants. Les outils gratuits sont désactivés.');
      return;
    }
    if (userFreeCredits < creditCost) {
      alert(`Crédits insuffisants. Besoin de ${creditCost}cr, vous avez ${userFreeCredits}cr.`);
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setUsedFallback(false);

    try {
      // Mock generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate result
      const mockResult = {
        url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1024',
        model: activeModel.id,
        prompt,
        usedFallback: pollinationsDown,
      };
      
      setResult(mockResult);
      setUsedFallback(pollinationsDown);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Génération échouée. Veuillez réessayer.');
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

        {/* Pollinations Warning */}
        {pollinationsDown && (
          <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-300 mb-1">
                Mode Fallback Actif
              </p>
              <p className="text-xs text-orange-400/80">
                SeeDream (Pollinations) est temporairement indisponible. 
                Nous utilisons <span className="font-medium">Flux Schnell (Together AI)</span> comme fallback.
                Coût: {fallbackModel.creditCost}cr (identique).
              </p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl">
              ⚡
            </div>
            <div>
              <h1 className="text-4xl font-bold">Quick Image</h1>
              <p className="text-sm text-gray-400">
                Génération rapide et créative
              </p>
            </div>
            
            {/* Credit cost badge */}
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">{creditCost} crédit</span>
            </div>
          </div>
          
          {/* Model info */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <Sparkles className="w-3 h-3" />
            <span>
              Modèle: <span className="text-white font-medium">{activeModel.name}</span> 
              {' • '} 
              Provider: <span className="text-white">{activeModel.provider}</span>
              {' • '} 
              Vitesse: {activeModel.speed}
            </span>
          </div>

          {/* Credits available */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-xs text-gray-400">Vos crédits gratuits:</span>
            <span className="text-sm font-medium text-green-300">{userFreeCredits}cr</span>
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
                className="w-full h-40 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 resize-none focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">{prompt.length} / 1000</p>
            </div>

            {/* Quick Suggestions */}
            <div>
              <label className="block text-sm font-medium mb-3">Suggestions Rapides</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Beautiful landscape',
                  'Futuristic city',
                  'Fantasy creature',
                  'Abstract art',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating || userPaidCredits > 0 || userFreeCredits < creditCost}
              className={`
                w-full py-4 rounded-xl font-medium text-lg transition-all flex items-center justify-center gap-2
                ${prompt.trim() && !isGenerating && userPaidCredits === 0 && userFreeCredits >= creditCost
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25'
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
                  Générer ({creditCost} crédit)
                </>
              )}
            </button>

            {/* Info boxes */}
            <div className="space-y-3">
              {userPaidCredits > 0 && (
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
                  <p className="text-xs text-orange-300">
                    ⚠️ Vous avez {userPaidCredits} crédits payants. Les outils gratuits sont désactivés.
                  </p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300">
                  💡 <span className="font-medium">Gratuit:</span> Ce modèle utilise vos crédits gratuits (25/mois).
                  {pollinationsDown && ' Fallback automatique vers Flux Schnell.'}
                </p>
              </div>
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
                    {usedFallback && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-orange-500/90 backdrop-blur-sm">
                        <p className="text-xs font-medium text-white">
                          Fallback: Flux Schnell
                        </p>
                      </div>
                    )}
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
                        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-green-400" />
                        <p className="text-sm text-gray-400">Génération en cours...</p>
                        <p className="text-xs text-gray-500 mt-2">{activeModel.speed}</p>
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
                      <span className="text-gray-500">Modèle:</span> {result.model}
                    </p>
                    {result.usedFallback && (
                      <p className="text-orange-300">
                        <span className="text-orange-400">⚠️ Fallback:</span> Pollinations indisponible
                      </p>
                    )}
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
