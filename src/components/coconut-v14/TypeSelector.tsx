/**
 * TYPE SELECTOR - Choix du type de création
 * Étape 3 du flow: Dashboard → Type Selector → Intent Input
 * BDS: Grammaire (clarté), Rhétorique (guidance), Géométrie (structure)
 * 
 * ✅ PHASE 1: Nouveau component pour flow correct
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 3A: Import sound
import { useHaptic } from '../../lib/hooks/useHaptic'; // 🔊 Import haptic hook
import { FileType, Type, Palette, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface TypeSelectorProps {
  onSelectType: (type: 'image' | 'video' | 'campaign') => void;
  onBack: () => void;
}

export function TypeSelector({ onSelectType, onBack }: TypeSelectorProps) {
  const { playClick, playHover, playSuccess } = useSoundContext();
  const { light, medium } = useHaptic();

  const types = [
    {
      id: 'image' as const,
      icon: FileType,
      title: 'Image',
      subtitle: 'Affiche, poster, visuel',
      description: 'Créez des images uniques avec IA : affiches, visuels de marque, illustrations, designs de produits...',
      examples: ['Affiche événement', 'Post Instagram', 'Packaging produit', 'Illustration éditoriale'],
      gradient: 'from-[var(--coconut-shell)] to-[var(--coconut-husk)]',
      glowColor: 'coconut',
      estimatedTime: '45-90s',
      estimatedCost: '115 crédits',
      popular: true,
    },
    {
      id: 'video' as const,
      icon: Type,
      title: 'Vidéo',
      subtitle: 'Clip, animation, cinématique',
      description: 'Générez des vidéos captivantes : clips promotionnels, animations de marque, transitions cinématiques...',
      examples: ['Clip publicitaire 15s', 'Animation logo', 'Vidéo produit', 'Transition cinématique'],
      gradient: 'from-[var(--coconut-husk)] to-[var(--coconut-shell)]',
      glowColor: 'blue',
      estimatedTime: '2-5 min',
      estimatedCost: '250 crédits',
      popular: false,
    },
    {
      id: 'campaign' as const,
      icon: Palette,
      title: 'Campagne',
      subtitle: 'Multi-format, stratégie complète',
      description: 'Orchestrez des campagnes complètes : contenus multi-plateformes, stratégie cohérente, variantes optimisées...',
      examples: ['Campagne Instagram', 'Pack réseaux sociaux', 'Kit marketing produit', 'Stratégie de lancement'],
      gradient: 'from-[var(--coconut-palm)] to-[var(--coconut-husk)]',
      glowColor: 'green',
      estimatedTime: '5-10 min',
      estimatedCost: '400+ crédits',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--coconut-dark)] relative overflow-hidden">
      {/* Animated Background - BDS: Musique (rythme visuel) */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)]/10 via-[var(--coconut-dark)] to-[var(--coconut-palm)]/10" />
        
        {/* Floating orbs */}
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 rounded-full bg-[var(--coconut-palm)]/10 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-[var(--coconut-palm)]/10 blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back Button - BDS: Logique (navigation évidente) */}
        <motion.button
          onClick={() => {
            playClick();
            light();
            onBack();
          }}
          onMouseEnter={() => playHover()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Retour au Dashboard</span>
        </motion.button>

        {/* Header - BDS: Grammaire (clarté) */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Sparkles className="w-4 h-4 text-[var(--coconut-husk)]" />
            <span className="text-sm text-gray-300">Étape 1 sur 6</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-[var(--coconut-milk)] to-[var(--coconut-cream)] bg-clip-text text-transparent">
            Que voulez-vous créer ?
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Choisissez le type de contenu que vous souhaitez générer avec l'IA
          </p>
        </motion.div>

        {/* Type Cards Grid - BDS: Géométrie (proportions divines) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {types.map((type, index) => (
            <TypeCard
              key={type.id}
              type={type}
              index={index}
              onSelect={() => {
                playSuccess();
                medium();
                onSelectType(type.id);
              }}
              onHover={() => playHover()}
            />
          ))}
        </div>

        {/* Info Footer */}
        <motion.div
          className="text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p>
            💡 Vous pourrez affiner votre création à l'étape suivante
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// TYPE CARD COMPONENT
// ============================================

interface TypeCardProps {
  type: {
    id: 'image' | 'video' | 'campaign';
    icon: React.ElementType;
    title: string;
    subtitle: string;
    description: string;
    examples: string[];
    gradient: string;
    glowColor: string;
    estimatedTime: string;
    estimatedCost: string;
    popular: boolean;
  };
  index: number;
  onSelect: () => void;
  onHover: () => void;
}

function TypeCard({ type, index, onSelect, onHover }: TypeCardProps) {
  const Icon = type.icon;

  return (
    <motion.button
      onClick={onSelect}
      onMouseEnter={onHover}
      className="group relative text-left"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Glow effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${type.gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

      {/* Card */}
      <div className="relative h-full p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
        {/* Popular Badge */}
        {type.popular && (
          <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-husk)] text-xs font-medium text-white flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Populaire
          </div>
        )}

        {/* Icon */}
        <div className="mb-6">
          <div className="relative inline-block">
            <div className={`absolute inset-0 bg-gradient-to-r ${type.gradient} rounded-xl blur-md opacity-50`} />
            <div className={`relative w-16 h-16 rounded-xl bg-gradient-to-r ${type.gradient} flex items-center justify-center`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-1">
          {type.title}
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          {type.subtitle}
        </p>

        {/* Description */}
        <p className="text-sm text-gray-300 mb-6 leading-relaxed">
          {type.description}
        </p>

        {/* Examples */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-2">Exemples :</p>
          <div className="flex flex-wrap gap-2">
            {type.examples.map((example, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-md bg-white/5 text-xs text-gray-400 border border-white/5"
              >
                {example}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <div>
            <p className="text-xs text-gray-500">Temps estimé</p>
            <p className="text-sm text-white">{type.estimatedTime}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Coût total</p>
            <p className="text-sm text-white">{type.estimatedCost}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-gray-400 group-hover:text-white transition-colors">
            Sélectionner →
          </span>
          <CheckCircle2 className="w-5 h-5 text-gray-600 group-hover:text-[var(--coconut-cream)] transition-colors" />
        </div>
      </div>
    </motion.button>
  );
}