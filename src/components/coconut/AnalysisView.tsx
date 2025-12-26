// ============================================
// COCONUT V14 - ANALYSIS VIEW
// ============================================
// Vue principale pour afficher et éditer le CocoBoard

import { useState } from 'react';
import { useCocoBoard } from '../../lib/hooks/useCocoBoard';
import { ConceptDisplay } from './ConceptDisplay';
import { ColorPaletteDisplay } from './ColorPaletteDisplay';
import { AssetGallery } from './AssetGallery';
import { Loader2, AlertCircle, RefreshCw, GitBranch, CheckCircle2 } from 'lucide-react';

interface AnalysisViewProps {
  projectId: string;
  userId: string;
}

export function AnalysisView({ projectId, userId }: AnalysisViewProps) {
  const {
    cocoBoard,
    loading,
    error,
    saving,
    editField,
    getEffectiveValue,
    createVersion,
    isReady,
    refetch,
  } = useCocoBoard(projectId);

  const [generatingAssets, setGeneratingAssets] = useState<string[]>([]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleEditConcept = async (
    field: 'direction' | 'keyMessage' | 'mood',
    value: string
  ) => {
    await editField(`concept.${field}` as any, value, userId);
  };

  const handleEditColorPalette = async (
    field: 'primary' | 'accent' | 'background' | 'text' | 'rationale',
    value: string[] | string
  ) => {
    await editField(`colorPalette.${field}` as any, value, userId);
  };

  const handleGenerateAsset = async (assetId: string) => {
    // TODO: Implement asset generation
    console.log('Generate asset:', assetId);
    setGeneratingAssets([...generatingAssets, assetId]);
    
    // Simulate generation (replace with actual API call)
    setTimeout(() => {
      setGeneratingAssets(generatingAssets.filter(id => id !== assetId));
    }, 5000);
  };

  const handleCreateVersion = async () => {
    try {
      await createVersion(userId, 'User requested new version');
    } catch (error) {
      console.error('Failed to create version:', error);
    }
  };

  // ============================================
  // RENDER STATES
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du CocoBoard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!cocoBoard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">CocoBoard introuvable</h3>
          <p className="text-gray-600">Aucune analyse n'a été trouvée pour ce projet.</p>
        </div>
      </div>
    );
  }

  const ready = isReady();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{cocoBoard.projectTitle}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Version {cocoBoard.version}</span>
              <span>•</span>
              <span>
                {new Date(cocoBoard.updatedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Ready Status */}
            {ready ? (
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Prêt pour génération</span>
              </div>
            ) : (
              <div className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Assets manquants</span>
              </div>
            )}

            {/* Create Version */}
            <button
              onClick={handleCreateVersion}
              disabled={saving}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
            >
              <GitBranch className="w-4 h-4" />
              Nouvelle version
            </button>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
            <p className="text-sm text-purple-700 mb-1">Analyse</p>
            <p className="text-2xl font-bold text-purple-900">
              {cocoBoard.estimatedCost.analysis} <span className="text-sm font-normal">crédits</span>
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
            <p className="text-sm text-blue-700 mb-1">Assets</p>
            <p className="text-2xl font-bold text-blue-900">
              {cocoBoard.estimatedCost.assetsGeneration} <span className="text-sm font-normal">crédits</span>
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
            <p className="text-sm text-green-700 mb-1">Génération</p>
            <p className="text-2xl font-bold text-green-900">
              {cocoBoard.estimatedCost.finalGeneration} <span className="text-sm font-normal">crédits</span>
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4">
            <p className="text-sm text-amber-700 mb-1">Total</p>
            <p className="text-2xl font-bold text-amber-900">
              {cocoBoard.estimatedCost.total} <span className="text-sm font-normal">crédits</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Concept */}
        <ConceptDisplay
          direction={getEffectiveValue('concept.direction')}
          keyMessage={getEffectiveValue('concept.keyMessage')}
          mood={getEffectiveValue('concept.mood')}
          editable={cocoBoard.concept.editable}
          onEdit={handleEditConcept}
          saving={saving}
        />

        {/* Color Palette */}
        <ColorPaletteDisplay
          primary={getEffectiveValue('colorPalette.primary')}
          accent={getEffectiveValue('colorPalette.accent')}
          background={getEffectiveValue('colorPalette.background')}
          text={getEffectiveValue('colorPalette.text')}
          rationale={getEffectiveValue('colorPalette.rationale')}
          editable={cocoBoard.colorPalette.editable}
          onEdit={handleEditColorPalette}
          saving={saving}
        />
      </div>

      {/* Assets */}
      <div className="mb-6">
        <AssetGallery
          assets={cocoBoard.assets}
          onGenerateAsset={handleGenerateAsset}
          generating={generatingAssets}
        />
      </div>

      {/* Composition Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Composition</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Format</p>
            <p className="text-lg font-semibold text-gray-900">{cocoBoard.composition.ratio}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Résolution</p>
            <p className="text-lg font-semibold text-gray-900">{cocoBoard.composition.resolution}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Zones</p>
            <p className="text-lg font-semibold text-gray-900">{cocoBoard.composition.zones.length} zones</p>
          </div>
        </div>

        {/* Zones */}
        <div className="space-y-3">
          {cocoBoard.composition.zones.map((zone) => (
            <div key={zone.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{zone.name}</h4>
                  <p className="text-sm text-gray-500">{zone.position}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                  {zone.assetIds.length} assets
                </span>
              </div>
              <p className="text-sm text-gray-600">{zone.customDescription || zone.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final Prompt Preview */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prompt Final (Aperçu)</h3>
        <div className="bg-white rounded-lg p-4 font-mono text-sm text-gray-700 space-y-2">
          <p><span className="text-purple-600 font-semibold">Scene:</span> {getEffectiveValue('finalPrompt.scene')}</p>
          <p><span className="text-purple-600 font-semibold">Style:</span> {getEffectiveValue('finalPrompt.style')}</p>
          <p><span className="text-purple-600 font-semibold">Lighting:</span> {getEffectiveValue('finalPrompt.lighting')}</p>
          <p><span className="text-purple-600 font-semibold">Composition:</span> {getEffectiveValue('finalPrompt.composition')}</p>
          <p><span className="text-purple-600 font-semibold">Mood:</span> {getEffectiveValue('finalPrompt.mood')}</p>
        </div>
      </div>

      {/* Generate Button */}
      {ready && (
        <div className="mt-8 text-center">
          <button
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl text-lg font-semibold"
          >
            🚀 Générer l'image finale ({cocoBoard.estimatedCost.finalGeneration} crédits)
          </button>
        </div>
      )}
    </div>
  );
}
