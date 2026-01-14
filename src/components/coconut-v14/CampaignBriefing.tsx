/**
 * CAMPAIGN BRIEFING - Multi-week campaign brief collection
 * Step 1 of Campaign Mode workflow
 * 
 * Premium Features:
 * - Multi-step form with progressive disclosure
 * - Coconut Warm palette exclusive
 * - Real-time budget calculator
 * - Smart defaults based on objective
 * - File upload for brand assets
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { useSoundContext } from './SoundProvider';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Target,
  Calendar,
  DollarSign,
  Users,
  Image as ImageIcon,
  Video as VideoIcon,
  Upload,
  X,
  CheckCircle,
  Info,
} from 'lucide-react';
import type { 
  CampaignBriefingInput,
  CampaignObjective,
  CampaignChannel,
} from '../../lib/types/coconut-v14-campaign';
import { useNotify } from './NotificationProvider';

// ============================================
// TYPES
// ============================================

interface CampaignBriefingProps {
  onSubmit: (briefing: CampaignBriefingInput) => void;
  onBack: () => void;
  isLoading?: boolean;
  userId: string;
}

// ============================================
// COMPONENT
// ============================================

export function CampaignBriefing({
  onSubmit,
  onBack,
  isLoading = false,
  userId,
}: CampaignBriefingProps) {
  const { playSound } = useSoundContext();
  const notify = useNotify();

  // Form state
  const [objective, setObjective] = useState<CampaignObjective>('product-launch');
  const [duration, setDuration] = useState<2 | 4 | 6 | 8 | 12>(6);
  const [budgetCredits, setBudgetCredits] = useState(5000);
  const [channels, setChannels] = useState<CampaignChannel[]>(['instagram', 'facebook']);
  const [demographics, setDemographics] = useState({
    ageRange: '25-45 ans',
    gender: 'all' as const,
    location: 'France',
  });
  const [psychographics, setPsychographics] = useState('');
  const [imagesCount, setImagesCount] = useState(16);
  const [videosCount, setVideosCount] = useState(8);
  const [description, setDescription] = useState('');
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
  const [uniqueSellingPoints, setUniqueSellingPoints] = useState('');

  // Calculate estimated cost
  const estimatedCost = React.useMemo(() => {
    const analysis = 100;
    const images = imagesCount * 30; // Assume 2K images
    const videos = videosCount * 40; // Assume 8s premium average
    return analysis + images + videos;
  }, [imagesCount, videosCount]);

  const handleSubmit = useCallback(() => {
    playSound?.('click');

    // Validation
    if (!description || description.length < 50) {
      notify?.({
        type: 'error',
        message: 'Le brief doit contenir au moins 50 caractères',
      });
      return;
    }

    if (!productName || !productCategory) {
      notify?.({
        type: 'error',
        message: 'Veuillez renseigner le nom et la catégorie du produit/marque',
      });
      return;
    }

    if (estimatedCost > budgetCredits) {
      notify?.({
        type: 'error',
        message: `Budget insuffisant: ${estimatedCost} crédits nécessaires, ${budgetCredits} disponibles`,
      });
      return;
    }

    const briefing: CampaignBriefingInput = {
      objective,
      duration,
      budgetCredits,
      channels,
      targetAudience: {
        demographics,
        psychographics,
      },
      contentMix: {
        imagesCount,
        videosCount,
        preferredFormats: {
          images: ['1:1', '9:16'],
          videos: ['9:16', '16:9'],
        },
      },
      providedAssets: {
        productPhotos: [],
      },
      description,
      productInfo: {
        name: productName,
        category: productCategory,
        keyFeatures,
        uniqueSellingPoints,
      },
      userId,
    };

    onSubmit(briefing);
  }, [
    objective,
    duration,
    budgetCredits,
    channels,
    demographics,
    psychographics,
    imagesCount,
    videosCount,
    description,
    productName,
    productCategory,
    keyFeatures,
    uniqueSellingPoints,
    userId,
    estimatedCost,
    onSubmit,
    playSound,
    notify,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-warm-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => {
              playSound?.('click');
              onBack();
            }}
            className="flex items-center gap-2 text-warm-700 hover:text-warm-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-warm-500 to-warm-700 flex items-center justify-center shadow-lg shadow-warm-600/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-warm-900 drop-shadow-[0_2px_20px_rgba(212,165,116,0.2)]">
                Brief de campagne
              </h1>
              <p className="text-warm-600">
                Décrivez votre campagne marketing complète
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Objectif */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-warm-200/50"
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-warm-600" />
                <h2 className="text-xl font-bold text-warm-900">
                  1. Objectif de la campagne
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'product-launch' as const, label: '🚀 Lancement produit', desc: 'Nouveau produit sur le marché' },
                  { value: 'brand-repositioning' as const, label: '🔄 Repositionnement', desc: 'Nouvelle image de marque' },
                  { value: 'seasonal-promotion' as const, label: '🎁 Promotion', desc: 'Offre saisonnière' },
                  { value: 'awareness' as const, label: '📢 Notoriété', desc: 'Faire connaître la marque' },
                  { value: 'conversion' as const, label: '💰 Conversion', desc: 'Maximiser les ventes' },
                ].slice(0, 4).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      playSound?.('click');
                      setObjective(option.value);
                    }}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-left
                      ${objective === option.value
                        ? 'border-warm-500 bg-warm-50 shadow-md'
                        : 'border-warm-200 hover:border-warm-300 bg-white'
                      }
                    `}
                  >
                    <div className="font-semibold text-warm-900 text-sm mb-1">
                      {option.label}
                    </div>
                    <div className="text-xs text-warm-600">
                      {option.desc}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Section 2: Durée & Budget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-warm-200/50"
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-warm-600" />
                <h2 className="text-xl font-bold text-warm-900">
                  2. Durée et budget
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-2">
                    Durée de la campagne
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value) as any)}
                    className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-warm-900 focus:border-warm-500 focus:ring-2 focus:ring-warm-500/20 outline-none transition-all [&>option]:text-gray-900 [&>option]:bg-white"
                  >
                    <option value={2}>2 semaines (sprint)</option>
                    <option value={4}>4 semaines (1 mois)</option>
                    <option value={6}>6 semaines (recommandé)</option>
                    <option value={8}>8 semaines (2 mois)</option>
                    <option value={12}>12 semaines (trimestre)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-2">
                    Budget crédits
                  </label>
                  <input
                    type="number"
                    value={budgetCredits}
                    onChange={(e) => setBudgetCredits(Number(e.target.value))}
                    min={500}
                    max={50000}
                    step={100}
                    className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-warm-900 focus:border-warm-500 focus:ring-2 focus:ring-warm-500/20 outline-none transition-all"
                  />
                </div>
              </div>
            </motion.div>

            {/* Section 3: Mix de contenus */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-warm-200/50"
            >
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-warm-600" />
                <h2 className="text-xl font-bold text-warm-900">
                  3. Mix de contenus
                </h2>
              </div>

              <div className="bg-gradient-to-br from-warm-50 to-amber-50 rounded-2xl p-6 border border-warm-200">
                <div className="flex items-start gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-warm-900 mb-1">Gemini décidera pour vous</h3>
                    <p className="text-sm text-warm-700">
                      Notre IA analysera votre brief et déterminera automatiquement la quantité optimale d'images et de vidéos pour maximiser l'impact et l'engagement de votre campagne.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-warm-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-5 h-5 text-warm-600" />
                      <span className="text-sm font-medium text-warm-700">Images</span>
                    </div>
                    <p className="text-2xl font-bold text-warm-900">Auto</p>
                    <p className="text-xs text-warm-600 mt-1">Entre 10-50 assets</p>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-warm-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <VideoIcon className="w-5 h-5 text-warm-600" />
                      <span className="text-sm font-medium text-warm-700">Vidéos</span>
                    </div>
                    <p className="text-2xl font-bold text-warm-900">Auto</p>
                    <p className="text-xs text-warm-600 mt-1">Entre 5-20 assets</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-warm-600 flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  Gemini optimisera le ratio images/vidéos en fonction de votre budget, objectifs et plateforme cible (généralement 2/3 images, 1/3 vidéos).
                </p>
              </div>
            </motion.div>

            {/* Section 4: Brief */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-warm-200/50"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-warm-600" />
                <h2 className="text-xl font-bold text-warm-900">
                  4. Brief de campagne
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-2">
                    Nom du produit/marque
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Pure Essence"
                    className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-warm-500 focus:ring-2 focus:ring-warm-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-2">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    placeholder="Ex: Cosmétiques naturels"
                    className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-warm-500 focus:ring-2 focus:ring-warm-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-2">
                    Description complète de la campagne
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez votre campagne: objectifs, message clé, ton souhaité, audience détaillée..."
                    rows={8}
                    minLength={50}
                    maxLength={2000}
                    className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-warm-500 focus:ring-2 focus:ring-warm-500/20 outline-none transition-all resize-none"
                  />
                  <div className="mt-2 text-xs text-warm-500">
                    {description.length} / 2000 caractères {description.length < 50 && '(minimum 50)'}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-warm-500 to-warm-600 rounded-3xl p-6 shadow-xl text-white sticky top-8"
            >
              <h3 className="text-xl font-bold mb-4">Résumé</h3>

              <div className="space-y-4">
                <div>
                  <div className="text-warm-100 text-sm mb-1">Durée</div>
                  <div className="font-semibold">{duration} semaines</div>
                </div>

                <div>
                  <div className="text-warm-100 text-sm mb-1">Assets totaux</div>
                  <div className="font-semibold">
                    {imagesCount + videosCount} ({imagesCount} images + {videosCount} vidéos)
                  </div>
                </div>

                <div className="border-t border-warm-400 pt-4">
                  <div className="text-warm-100 text-sm mb-2">Coût estimé</div>
                  <div className="text-3xl font-bold mb-1">{estimatedCost.toLocaleString()}</div>
                  <div className="text-warm-100 text-sm">crédits</div>

                  {estimatedCost > budgetCredits && (
                    <div className="mt-3 bg-red-500/20 border border-red-400 rounded-lg p-3 text-sm">
                      ⚠️ Budget insuffisant
                    </div>
                  )}
                </div>

                <div className="text-xs text-warm-100">
                  • 100cr analyse Gemini<br />
                  • {imagesCount * 30}cr images (30cr/img)<br />
                  • {videosCount * 40}cr vidéos (40cr/vid)
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading || description.length < 50 || estimatedCost > budgetCredits}
                className="w-full mt-6 px-6 py-4 bg-white text-warm-600 rounded-xl font-semibold hover:bg-warm-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-warm-600 border-t-transparent rounded-full"
                    />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    Générer plan de campagne
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}