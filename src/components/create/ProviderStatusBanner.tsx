/**
 * PROVIDER STATUS BANNER
 * Informe les users si Pollinations est down
 */

import { AlertTriangle, Zap } from 'lucide-react';

export function ProviderStatusBanner() {
  return (
    <div className="mb-8 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-orange-300 mb-2">
          ⚠️ Modèles Gratuits Temporairement Indisponibles
        </p>
        <p className="text-xs text-orange-400/80 mb-3">
          Les modèles gratuits (SeeDream, NanoBanana, Kontext) utilisant Pollinations sont actuellement down. 
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-green-300 font-medium">Solution 1:</span>
            <span className="text-gray-400">Utilisez <span className="text-white font-medium">Flux Schnell</span> (Together AI) comme fallback gratuit</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-purple-300 font-medium">Solution 2:</span>
            <span className="text-gray-400">Achetez des crédits payants pour accéder aux modèles premium</span>
          </div>
        </div>

        <button className="mt-3 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors flex items-center gap-2">
          <Zap className="w-3 h-3" />
          Acheter des crédits payants
        </button>
      </div>
    </div>
  );
}
