/**
 * ANALYSIS VIEW COMPONENT
 * Affiche l'analyse IA et permet de confirmer le mode de génération
 * BDS: Logique (cohérence), Arithmétique (harmonie visuelle)
 */

import { useState } from 'react';
import { Check, Zap, Settings, Hand, ArrowLeft, Sparkles, Target, Layers, TrendingUp, Image as ImageIcon } from 'lucide-react';
import { useSound } from '../../lib/hooks/useSound';
import { useHaptic } from '../../lib/hooks/useHaptic';
import type { AIAnalysis, ReferenceAnalysis } from '../../lib/services/cortexia-api';

interface AnalysisViewProps {
  analysis: AIAnalysis;
  referenceAnalysis?: ReferenceAnalysis | null;
  onConfirm: (mode: 'auto' | 'semi-auto' | 'manual') => void;
  onBack: () => void;
  isGenerating: boolean;
}

export function AnalysisView({ analysis, referenceAnalysis, onConfirm, onBack, isGenerating }: AnalysisViewProps) {
  const [selectedMode, setSelectedMode] = useState<'auto' | 'semi-auto' | 'manual'>('auto');

  // BDS: Musique - Sound & Haptic feedback
  const { playClick, playHover, playSuccess } = useSound();
  const { light, medium } = useHaptic();

  const modes: Array<{
    id: 'auto' | 'semi-auto' | 'manual';
    icon: React.ReactNode;
    title: string;
    description: string;
    features: string[];
  }> = [
    {
      id: 'auto',
      icon: <Zap className="w-6 h-6" />,
      title: 'Automatique',
      description: "L'IA gère tout de A à Z",
      features: [
        'Génération instantanée',
        'Zéro configuration',
        'Optimisé par l\'IA',
      ],
    },
    {
      id: 'semi-auto',
      icon: <Settings className="w-6 h-6" />,
      title: 'Semi-automatique',
      description: 'Contrôle les étapes clés',
      features: [
        'Validation à chaque shot',
        'Ajustements possibles',
        'Équilibre contrôle/vitesse',
      ],
    },
    {
      id: 'manual',
      icon: <Hand className="w-6 h-6" />,
      title: 'Manuel',
      description: 'Contrôle total sur chaque détail',
      features: [
        'Édition complète',
        'Prompts personnalisés',
        'Contrôle granulaire',
      ],
    },
  ];

  const typeLabels = {
    image: 'Image',
    video: 'Vidéo',
    campaign: 'Campagne',
  };

  // Extract data from analysis structure
  const totalAssets = analysis.structure?.count || 0;
  const estimatedCost = analysis.recommendations?.estimatedCost || 0;
  const estimatedTime = analysis.recommendations?.estimatedTime || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Back button */}
      <button
        onClick={() => {
          playClick();
          light();
          onBack();
        }}
        onMouseEnter={() => playHover()}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 sm:mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Modifier l'intention
      </button>

      {/* Header - BDS: Responsive */}
      <div className="mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-3 sm:mb-4">
          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
          <span className="text-xs sm:text-sm text-green-300">Analyse terminée</span>
        </div>
        
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
          Voici ce que l'IA a compris
        </h2>
        
        <p className="text-gray-400 text-base sm:text-lg">
          Vérifiez l'analyse et choisissez votre mode de création
        </p>
      </div>

      {/* Analysis reasoning */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
        <p className="text-xs sm:text-sm text-gray-400 mb-2">Analyse de l'IA :</p>
        <p className="text-sm sm:text-base text-white leading-relaxed">{analysis.reasoning}</p>
      </div>

      {/* Analysis cards - BDS: Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <AnalysisCard
          icon={<Target className="w-5 h-5 sm:w-6 sm:h-6" />}
          title="Type détecté"
          value={typeLabels[analysis.type]}
          description={`${totalAssets} asset${totalAssets > 1 ? 's' : ''} à générer`}
          color="purple"
        />
        
        <AnalysisCard
          icon={<Layers className="w-5 h-5 sm:w-6 sm:h-6" />}
          title="Coût estimé"
          value={`${estimatedCost} crédits`}
          description="Estimation automatique"
          color="blue"
        />
        
        <AnalysisCard
          icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />}
          title="Temps estimé"
          value={`${estimatedTime}s`}
          description="Génération optimisée"
          color="green"
        />
      </div>

      {/* Structure breakdown - BDS: Responsive */}
      <div className="mb-8 sm:mb-12 p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Structure du projet</h3>
        
        <div className="space-y-4 sm:space-y-6">
          <div>
            <p className="text-xs sm:text-sm text-gray-400 mb-2">Composition</p>
            <div className="flex flex-wrap gap-2">
              {analysis.structure?.breakdown.map((item, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300"
                >
                  {item.count} {item.nodeType}{item.count > 1 ? 's' : ''}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-xs sm:text-sm text-gray-400 mb-3">Modèle recommandé</p>
            <div className="flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-blue-400" />
              <span className="text-base text-white">{analysis.recommendations?.model}</span>
              <span className="px-2 py-1 rounded bg-blue-500/10 text-xs text-blue-300">
                {analysis.recommendations?.quality}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode selection - BDS: Responsive */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Choisissez votre mode de création</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                playClick();
                light();
                setSelectedMode(mode.id);
              }}
              onMouseEnter={() => playHover()}
              className={`
                p-4 sm:p-6 rounded-xl border-2 transition-all text-left
                ${selectedMode === mode.id
                  ? 'border-purple-500 bg-purple-600/10 shadow-lg shadow-purple-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
                }
              `}
            >
              <div className={`mb-3 sm:mb-4 ${selectedMode === mode.id ? 'text-purple-400' : 'text-gray-400'}`}>
                {mode.icon}
              </div>
              
              <h4 className={`text-base sm:text-lg mb-1 sm:mb-2 ${selectedMode === mode.id ? 'text-white' : 'text-gray-300'}`}>
                {mode.title}
              </h4>
              
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                {mode.description}
              </p>
              
              <ul className="space-y-1.5 sm:space-y-2">
                {mode.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                    <Check className="w-3 h-3 text-purple-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              {selectedMode === mode.id && analysis.suggestedMode === mode.id && (
                <div className="mt-2 sm:mt-3 px-2 py-1 rounded bg-purple-500/20 text-xs text-purple-300 inline-block">
                  Recommandé par l'IA
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Confirm button - BDS: Responsive */}
      <button
        onClick={() => {
          playSuccess();
          medium();
          onConfirm(selectedMode);
        }}
        onMouseEnter={() => playHover()}
        disabled={isGenerating}
        className={`
          w-full py-3 sm:py-4 rounded-xl text-base sm:text-lg transition-all
          ${isGenerating
            ? 'bg-white/5 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25'
          }
        `}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            Génération du CocoBoard...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Générer le CocoBoard
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
        )}
      </button>
    </div>
  );
}

// Analysis card component
interface AnalysisCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  color: 'purple' | 'blue' | 'green';
}

function AnalysisCard({ icon, title, value, description, color }: AnalysisCardProps) {
  const colorClasses = {
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
  };

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3 sm:mb-4`}>
        {icon}
      </div>
      <p className="text-xs sm:text-sm text-gray-400 mb-1">{ title}</p>
      <p className="text-xl sm:text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs sm:text-sm text-gray-500">{description}</p>
    </div>
  );
}