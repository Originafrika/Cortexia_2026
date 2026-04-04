/**
 * TYPE SELECTOR ULTRA-PREMIUM - Choix du type de création
 * Étape 1 du workflow: Dashboard → Type Selector → Intent Input
 * 
 * Premium Features:
 * - Hero section inspirante avec tagline
 * - Cards asymétriques premium (Featured + 2 colonnes)
 * - Palette Coconut Warm exclusive
 * - Animations sophistiquées avec stagger
 * - Workflow context visible
 * - BDS 7 Arts compliance
 * - Liquid glass design
 * - Score cible: 98%+
 */

import React from 'react';
import { motion } from 'motion/react';
import { useSoundContext } from './SoundProvider';
import { useHaptic } from '../../lib/hooks/useHaptic';
import { 
  Image as ImageIcon, 
  Video, 
  Layers, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';

interface TypeSelectorPremiumProps {
  onSelectType: (type: 'image' | 'video' | 'campaign') => void;
  onBack: () => void;
  coconutGenerationsRemaining?: number; // ✅ NEW: Remaining Coconut generations for Creators
  isEnterprise?: boolean; // ✅ NEW: Is Enterprise user (unlimited)
}

export function TypeSelectorPremium({ 
  onSelectType, 
  onBack,
  coconutGenerationsRemaining,
  isEnterprise 
}: TypeSelectorPremiumProps) {
  const { playClick, playWhoosh, playSuccess } = useSoundContext();
  const { light, medium } = useHaptic();

  const types = [
    {
      id: 'image' as const,
      icon: ImageIcon,
      title: 'Image',
      subtitle: 'Visuel statique haute qualité',
      description: 'Créez des images uniques avec IA : affiches, visuels de marque, illustrations, designs de produits, packaging...',
      examples: ['Affiche événement', 'Post Instagram', 'Packaging produit', 'Illustration éditoriale'],
      useCases: ['Marketing', 'Communication', 'Branding'],
      gradient: 'from-[var(--coconut-shell)] to-[var(--coconut-palm)]',
      bgGradient: 'from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/10',
      glowColor: 'from-[var(--coconut-shell)]/30 via-[var(--coconut-palm)]/20 to-amber-500/20',
      estimatedTime: '45-90s',
      estimatedCost: '~115 crédits',
      popular: true,
      recommended: true,
      quality: '4K',
      workflow: '4 phases',
    },
    {
      id: 'video' as const,
      icon: Video,
      title: 'Vidéo',
      subtitle: 'Animation dynamique et motion',
      description: 'Générez des vidéos captivantes : clips promotionnels, animations de marque, transitions cinématiques, stories...',
      examples: ['Clip publicitaire', 'Animation logo', 'Vidéo produit', 'Story Instagram'],
      useCases: ['Social Media', 'Publicité', 'Storytelling'],
      gradient: 'from-[var(--coconut-husk)] to-[var(--coconut-shell)]',
      bgGradient: 'from-[var(--coconut-husk)]/20 to-[var(--coconut-shell)]/10',
      glowColor: 'from-[var(--coconut-husk)]/30 via-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20',
      estimatedTime: '2-5 min',
      estimatedCost: '~250 crédits',
      popular: false,
      recommended: false,
      quality: '1080p',
      workflow: '5 phases',
    },
    {
      id: 'campaign' as const,
      icon: Layers,
      title: 'Campagne',
      subtitle: 'Multi-format & stratégie complète',
      description: 'Orchestrez des campagnes complètes : contenus multi-plateformes, stratégie cohérente, déclinaisons optimisées...',
      examples: ['Pack social media', 'Kit marketing', 'Stratégie de lancement', 'Campagne 360°'],
      useCases: ['Marketing 360°', 'Lancement produit', 'Branding complet'],
      gradient: 'from-[var(--coconut-palm)] to-amber-500',
      bgGradient: 'from-[var(--coconut-palm)]/20 to-amber-500/10',
      glowColor: 'from-[var(--coconut-palm)]/30 via-amber-500/20 to-amber-600/20',
      estimatedTime: '5-10 min',
      estimatedCost: '400+ crédits',
      popular: false,
      recommended: false,
      quality: 'Multi-format',
      workflow: '6 phases',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] relative overflow-hidden">
      
      {/* Premium ambient lights */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,165,116,0.12)_0%,transparent_40%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(249,115,22,0.08)_0%,transparent_40%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_90%,rgba(139,115,85,0.06)_0%,transparent_50%)]" />
      
      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => {
            playClick();
            light();
            onBack();
          }}
          className="group flex items-center gap-2 text-[var(--coconut-husk)] hover:text-[var(--coconut-shell)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Retour au Dashboard</span>
        </motion.button>

        {/* ========== HERO SECTION ========== */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-4"
        >
          {/* Step indicator */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-[var(--coconut-shell)]" />
            <span className="text-sm font-medium text-[var(--coconut-shell)]">Phase 1 • Type de projet</span>
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-palm)] to-[var(--coconut-shell)] bg-clip-text text-transparent">
            Que souhaitez-vous créer ?
          </h1>

          {/* Tagline */}
          <p className="text-lg sm:text-xl text-[var(--coconut-husk)] max-w-3xl mx-auto leading-relaxed">
            Choisissez le format qui correspond à votre vision créative. 
            <span className="block mt-1 text-base text-[var(--coconut-husk)]/70">
              L'IA analysera ensuite votre projet en détail avec <span className="bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent font-semibold">Gemini 2.5 Flash</span>
            </span>
          </p>
          
          {/* ✅ NEW: Coconut Generations Quota Display */}
          {!isEnterprise && coconutGenerationsRemaining !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl border border-white/60 shadow-xl"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] rounded-lg blur opacity-50" />
                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-[var(--coconut-husk)] uppercase tracking-wide">
                  Coconut Générations
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-black ${coconutGenerationsRemaining === 0 ? 'text-red-600' : 'bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] bg-clip-text text-transparent'}`}>
                    {coconutGenerationsRemaining}
                  </span>
                  <span className="text-sm text-[var(--coconut-husk)]">/  3 restantes ce mois</span>
                </div>
              </div>
              {coconutGenerationsRemaining === 0 && (
                <div className="ml-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                  QUOTA ÉPUISÉ
                </div>
              )}
            </motion.div>
          )}
          
          {isEnterprise && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 backdrop-blur-xl border border-amber-500/30 shadow-xl"
            >
              <Star className="w-5 h-5 text-amber-500" />
              <div className="text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                Enterprise • Générations illimitées
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ========== PREMIUM LAYOUT: FEATURED + 2 COLUMNS ========== */}
        
        {/* Featured Type - IMAGE (Most Popular) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <FeaturedTypeCard
            type={types[0]}
            onSelect={() => {
              playSuccess();
              playWhoosh();
              medium();
              onSelectType(types[0].id);
            }}
          />
        </motion.div>

        {/* Secondary Types Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {types.slice(1).map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + (index * 0.1) }}
            >
              <StandardTypeCard
                type={type}
                onSelect={() => {
                  playSuccess();
                  playWhoosh();
                  medium();
                  onSelectType(type.id);
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-xl"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--coconut-shell)] mb-1">
                Workflow intelligent en 4 phases
              </h3>
              <p className="text-sm text-[var(--coconut-husk)] leading-relaxed">
                Après avoir choisi votre type, vous pourrez : <span className="font-medium">1)</span> Décrire votre vision • 
                <span className="font-medium"> 2)</span> L'IA analysera avec Gemini 2.5 • 
                <span className="font-medium"> 3)</span> Vous affinerez sur le CocoBoard • 
                <span className="font-medium"> 4)</span> Génération finale avec Flux 2 Pro
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// FEATURED TYPE CARD (Large format premium)
// ============================================

interface FeaturedTypeCardProps {
  type: {
    id: 'image' | 'video' | 'campaign';
    icon: React.ElementType;
    title: string;
    subtitle: string;
    description: string;
    examples: string[];
    useCases: string[];
    gradient: string;
    bgGradient: string;
    glowColor: string;
    estimatedTime: string;
    estimatedCost: string;
    popular: boolean;
    recommended: boolean;
    quality: string;
    workflow: string;
  };
  onSelect: () => void;
}

function FeaturedTypeCard({ type, onSelect }: FeaturedTypeCardProps) {
  const Icon = type.icon;

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.01, y: -4 }}
      whileTap={{ scale: 0.99 }}
      className="group relative w-full text-left"
    >
      {/* Ambient glow */}
      <div className={`absolute -inset-2 bg-gradient-to-br ${type.glowColor} rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500`} />
      
      {/* Card */}
      <div className="relative bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 overflow-hidden">
        
        {/* Badges row */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {type.popular && (
            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg">
              <Star className="w-3 h-3" />
              Plus populaire
            </div>
          )}
          {type.recommended && (
            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg">
              <Award className="w-3 h-3" />
              Recommandé
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 p-8 lg:p-10">
          
          {/* LEFT SIDE - Main Info */}
          <div className="space-y-6">
            {/* Icon */}
            <div className="relative inline-block">
              <div className={`absolute -inset-2 bg-gradient-to-br ${type.gradient} rounded-2xl blur-xl opacity-60`} />
              <div className={`relative w-20 h-20 bg-gradient-to-br ${type.gradient} rounded-2xl flex items-center justify-center shadow-xl`}>
                <Icon className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title & subtitle */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] bg-clip-text text-transparent mb-2">
                {type.title}
              </h2>
              <p className="text-base text-[var(--coconut-husk)]">
                {type.subtitle}
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-[var(--coconut-husk)] leading-relaxed">
              {type.description}
            </p>

            {/* Use Cases */}
            <div>
              <p className="text-xs font-semibold text-[var(--coconut-husk)] mb-2 uppercase tracking-wide">
                Idéal pour
              </p>
              <div className="flex flex-wrap gap-2">
                {type.useCases.map((useCase, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)] text-xs font-medium text-[var(--coconut-shell)] border border-white/40"
                  >
                    {useCase}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <div className="relative group/btn inline-block">
                <div className={`absolute inset-0 bg-gradient-to-r ${type.gradient} rounded-xl blur opacity-50 group-hover/btn:opacity-100 transition-opacity`} />
                <div className={`relative px-6 py-3 bg-gradient-to-r ${type.gradient} text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg group-hover/btn:shadow-xl transition-all`}>
                  <span>Choisir Image</span>
                  <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Specs & Examples */}
          <div className="space-y-6">
            
            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-white/40">
                <div className="flex items-center gap-2 text-[var(--coconut-husk)] text-xs mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps</span>
                </div>
                <div className="text-xl font-bold text-[var(--coconut-shell)]">
                  {type.estimatedTime}
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-white/40">
                <div className="flex items-center gap-2 text-[var(--coconut-husk)] text-xs mb-2">
                  <Zap className="w-4 h-4" />
                  <span>Coût</span>
                </div>
                <div className="text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                  {type.estimatedCost}
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-white/40">
                <div className="flex items-center gap-2 text-[var(--coconut-husk)] text-xs mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Qualité</span>
                </div>
                <div className="text-xl font-bold text-[var(--coconut-shell)]">
                  {type.quality}
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-white/40">
                <div className="flex items-center gap-2 text-[var(--coconut-husk)] text-xs mb-2">
                  <Layers className="w-4 h-4" />
                  <span>Workflow</span>
                </div>
                <div className="text-xl font-bold text-[var(--coconut-shell)]">
                  {type.workflow}
                </div>
              </div>
            </div>

            {/* Examples */}
            <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-xl rounded-xl p-5 border border-white/60">
              <p className="text-xs font-semibold text-[var(--coconut-husk)] mb-3 uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Exemples de projets
              </p>
              <div className="space-y-2">
                {type.examples.map((example, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-[var(--coconut-shell)]"
                  >
                    <CheckCircle className="w-4 h-4 text-[var(--coconut-palm)] flex-shrink-0" />
                    <span>{example}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ============================================
// STANDARD TYPE CARD (Compact format)
// ============================================

interface StandardTypeCardProps {
  type: {
    id: 'image' | 'video' | 'campaign';
    icon: React.ElementType;
    title: string;
    subtitle: string;
    description: string;
    examples: string[];
    useCases: string[];
    gradient: string;
    bgGradient: string;
    glowColor: string;
    estimatedTime: string;
    estimatedCost: string;
    quality: string;
    workflow: string;
  };
  onSelect: () => void;
}

function StandardTypeCard({ type, onSelect }: StandardTypeCardProps) {
  const Icon = type.icon;

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group relative w-full h-full text-left"
    >
      {/* Glow effect */}
      <div className={`absolute -inset-1 bg-gradient-to-br ${type.glowColor} rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
      
      {/* Card */}
      <div className="relative h-full bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 hover:border-white/80 transition-all duration-300 overflow-hidden">
        
        <div className="p-6 space-y-4">
          
          {/* Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className={`absolute -inset-1 bg-gradient-to-br ${type.gradient} rounded-xl blur opacity-50`} />
              <div className={`relative w-14 h-14 bg-gradient-to-br ${type.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold text-[var(--coconut-shell)] mb-1">
                {type.title}
              </h3>
              <p className="text-sm text-[var(--coconut-husk)]">
                {type.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-[var(--coconut-husk)] leading-relaxed">
            {type.description}
          </p>

          {/* Specs inline */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-[var(--coconut-husk)]">
              <Clock className="w-3.5 h-3.5" />
              <span>{type.estimatedTime}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                {type.estimatedCost}
              </span>
            </div>
          </div>

          {/* Examples */}
          <div className="pt-3 border-t border-white/30">
            <p className="text-xs text-[var(--coconut-husk)] mb-2">Exemples :</p>
            <div className="flex flex-wrap gap-2">
              {type.examples.slice(0, 3).map((example, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-md bg-white/40 text-xs text-[var(--coconut-shell)] border border-white/40"
                >
                  {example}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2 flex items-center justify-between text-sm">
            <span className="text-[var(--coconut-husk)] group-hover:text-[var(--coconut-shell)] transition-colors flex items-center gap-1.5">
              Sélectionner
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <CheckCircle className="w-5 h-5 text-[var(--coconut-husk)]/30 group-hover:text-[var(--coconut-palm)] transition-colors" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}