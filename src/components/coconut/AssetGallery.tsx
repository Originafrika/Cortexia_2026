// ============================================
// COCONUT V14 - ASSET GALLERY
// ============================================
// Affiche tous les assets (disponibles + manquants)

import { Image, Loader2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import type { CocoBoardAsset } from '../../lib/types/coconut-v14';

interface AssetGalleryProps {
  assets: CocoBoardAsset[];
  onGenerateAsset?: (assetId: string) => void;
  generating?: string[]; // IDs of assets being generated
}

export function AssetGallery({
  assets,
  onGenerateAsset,
  generating = [],
}: AssetGalleryProps) {
  const getStatusIcon = (status: CocoBoardAsset['status']) => {
    switch (status) {
      case 'available':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'generated':
        return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
      case 'generating':
        return <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />;
      case 'missing':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusLabel = (status: CocoBoardAsset['status']) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'generated':
        return 'Généré';
      case 'generating':
        return 'Génération...';
      case 'missing':
        return 'Manquant';
      case 'failed':
        return 'Échec';
    }
  };

  const getSourceBadge = (source: CocoBoardAsset['source']) => {
    switch (source) {
      case 'user-provided':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">User</span>;
      case 'gemini-detected':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Gemini</span>;
      case 'flux-generated':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Flux</span>;
    }
  };

  const availableAssets = assets.filter(a => a.status === 'available' || a.status === 'generated');
  const missingAssets = assets.filter(a => a.status === 'missing' || a.status === 'generating' || a.status === 'failed');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Image className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Assets</h3>
          <p className="text-sm text-gray-500">
            {availableAssets.length} disponibles · {missingAssets.length} à générer
          </p>
        </div>
      </div>

      {/* Available Assets */}
      {availableAssets.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Assets Disponibles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableAssets.map((asset) => (
              <div
                key={asset.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  {asset.signedUrl || asset.url ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={asset.signedUrl || asset.url}
                        alt={asset.description}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                      <Image className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(asset.status)}
                      <span className="text-xs text-gray-500">{getStatusLabel(asset.status)}</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium mb-1 line-clamp-2">
                      {asset.customDescription || asset.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {asset.type}
                      </span>
                      {getSourceBadge(asset.source)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Assets */}
      {missingAssets.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Assets à Générer</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {missingAssets.map((asset) => {
              const isGenerating = generating.includes(asset.id);
              const canGenerate = asset.generationMetadata && !isGenerating && asset.status === 'missing';

              return (
                <div
                  key={asset.id}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Placeholder */}
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                      {isGenerating ? (
                        <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                      ) : (
                        <Image className="w-6 h-6 text-purple-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(isGenerating ? 'generating' : asset.status)}
                        <span className="text-xs text-gray-500">
                          {isGenerating ? 'Génération...' : getStatusLabel(asset.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 font-medium mb-2 line-clamp-2">
                        {asset.customDescription || asset.description}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {asset.type}
                        </span>
                        {getSourceBadge(asset.source)}
                      </div>

                      {/* Generate Button */}
                      {canGenerate && onGenerateAsset && (
                        <button
                          onClick={() => onGenerateAsset(asset.id)}
                          className="w-full px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          Générer avec Flux
                        </button>
                      )}

                      {isGenerating && (
                        <div className="w-full px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium text-center">
                          Génération en cours...
                        </div>
                      )}

                      {asset.status === 'failed' && (
                        <div className="w-full px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium text-center">
                          Échec - Réessayer
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {assets.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Image className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">Aucun asset détecté</p>
        </div>
      )}
    </div>
  );
}
