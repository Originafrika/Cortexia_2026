/**
 * TEXT TO IMAGE V3 - BDS Complete
 * BDS: Les 7 Arts de Perfection Divine appliqués
 * 
 * Free users: SeeDream → Fallback Flux Schnell
 * Paid users: Flux 2 Pro
 */

import { useState } from 'react';
import { Wand2, Download, Sparkles, ArrowLeft, Loader2, Zap, Crown, AlertTriangle, RefreshCw } from 'lucide-react';
import { selectBestModel, shouldUseFallback, getFallbackForFreeUser, PROVIDER_STATUS } from '../../../lib/config/cortexia-models';

interface TextToImageV3Props {
  onBack: () => void;
  userFreeCredits: number;
  userPaidCredits: number;
}

export function TextToImageV3({ onBack, userFreeCredits, userPaidCredits }: TextToImageV3Props) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  const hasPaidCredits = userPaidCredits > 0;
  const pollinationsDown = !PROVIDER_STATUS.pollinations.available;

  // BDS: Logique - Select best model based on user type
  const selectedModel = selectBestModel({
    prompt,
    mode: 'text-to-image',
    userCreditType: hasPaidCredits ? 'paid' : 'free',
  });

  // Check if should use fallback
  const needsFallback = !hasPaidCredits && shouldUseFallback(selectedModel);
  const activeModel = needsFallback ? getFallbackForFreeUser() : selectedModel;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setResult(null);
    setUsedFallback(needsFallback);

    try {
      // Mock generation - BDS: Musique - Rythme d'attente
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult = {
        url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1024',
        model: activeModel.id,
        modelName: activeModel.name,
        prompt,
        usedFallback: needsFallback,
      };
      
      setResult(mockResult);
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
        {/* BDS: Grammaire - Header navigation claire */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour au hub
        </button>

        {/* BDS: Rhétorique - Fallback warning guides attention */}
        {needsFallback && (
          <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-300 mb-1">
                Mode Fallback Actif
              </p>
              <p className="text-xs text-orange-400/80">
                SeeDream (Pollinations) est temporairement indisponible. 
                Nous utilisons <span className="font-medium">Flux Schnell (Together AI)</span> comme alternative gratuite.
              </p>
            </div>
          </div>
        )}

        {/* BDS: Géométrie - Title section avec proportions divines */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {/* Icon - 48px (multiple de 8) */}
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              ✨
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Text to Image
              </h1>
              <p className="text-sm text-gray-400">
                Créez des images à partir de texte
              </p>
            </div>
            
            {/* BDS: Arithmétique - Credit badge avec rythme */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
              hasPaidCredits 
                ? 'bg-purple-500/10 border-purple-500/30' 
                : 'bg-green-500/10 border-green-500/30'
            }`}>
              {hasPaidCredits ? (
                <Crown className="w-4 h-4 text-purple-400" />
              ) : (
                <Zap className="w-4 h-4 text-green-400" />
              )}
              <span className={`text-sm font-medium ${hasPaidCredits ? 'text-purple-300' : 'text-green-300'}`}>
                {hasPaidCredits ? 'Premium' : 'Gratuit'}
              </span>
            </div>
          </div>
          
          {/* BDS: Grammaire - Model info structurée */}
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

          {/* Credits display */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-xs text-gray-400">
              {hasPaidCredits ? 'Crédits premium:' : 'Crédits gratuits:'}
            </span>
            <span className={`text-sm font-medium ${hasPaidCredits ? 'text-purple-300' : 'text-green-300'}`}>
              {hasPaidCredits ? userPaidCredits : userFreeCredits}cr
            </span>
          </div>
        </div>

        {/* BDS: Géométrie - Grid layout harmonieux */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Controls - BDS: Logique - Flow évident */}
          <div className="space-y-6">
            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium mb-2">Votre prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: A majestic dragon flying over a medieval castle at sunset, cinematic lighting, ultra detailed..."
                className="w-full h-40 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 resize-none focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">{prompt.length} caractères</p>
            </div>

            {/* BDS: Musique - Quick suggestions avec rythme */}
            <div>
              <label className="block text-sm font-medium mb-3">Suggestions rapides</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Beautiful landscape painting',
                  'Futuristic cyberpunk city',
                  'Fantasy magical creature',
                  'Abstract colorful art',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 transition-all hover:scale-105"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* BDS: Rhétorique - Generate button guide l'action */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={`
                w-full py-4 rounded-xl font-medium text-lg transition-all flex items-center justify-center gap-2
                ${prompt.trim() && !isGenerating
                  ? hasPaidCredits
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 hover:scale-105'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25 hover:scale-105'
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
                  Générer l'image
                </>
              )}
            </button>

            {/* BDS: Logique - Info boxes cohérents */}
            <div className="space-y-3">
              {hasPaidCredits && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-xs text-purple-300">
                    👑 <span className="font-medium">Premium:</span> Utilise Flux 2 Pro pour une qualité SOTA
                  </p>
                </div>
              )}

              {!hasPaidCredits && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-300">
                    💡 <span className="font-medium">Gratuit:</span> Utilise SeeDream (Pollinations)
                    {needsFallback && ' • Fallback: Flux Schnell (Together AI)'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Preview - BDS: Astronomie - Vision d'ensemble */}
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
                    
                    {/* BDS: Musique - Overlay avec animation */}
                    {result.usedFallback && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-orange-500/90 backdrop-blur-sm animate-pulse">
                        <p className="text-xs font-medium text-white flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          Fallback: Flux Schnell
                        </p>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="px-4 py-2 bg-white text-black rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors hover:scale-105">
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

              {/* Result info */}
              {result && (
                <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-gray-400 mb-2">Informations</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-300">
                      <span className="text-gray-500">Modèle:</span> {result.modelName}
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
