/**
 * CREATION TOOLS V2 - COMPLETE CATALOG
 * Tous les outils basés sur les modèles disponibles
 */

import type { CreditType } from './models-catalog';

export interface CreationTool {
  id: string;
  name: string;
  description: string;
  category: 'basics' | 'premium' | 'video' | 'advanced' | 'nsfw';
  icon: string;
  models: string[]; // Model IDs compatible
  defaultModel: string; // Default model to use
  creditType: CreditType;
  minCredits: number; // Minimum credits needed
  features: string[];
  isNew?: boolean;
  isPopular?: boolean;
}

export const CREATION_TOOLS_V2: CreationTool[] = [
  // ========== BASICS (FREE) ==========
  {
    id: 'quick-image',
    name: 'Quick Image',
    description: 'Générez rapidement des images créatives',
    category: 'basics',
    icon: '⚡',
    models: ['seedream', 'flux-schnell'],
    defaultModel: 'seedream',
    creditType: 'free',
    minCredits: 1,
    features: ['Fast', '~3s', 'Creative'],
    isPopular: true,
  },
  {
    id: 'image-enhancer',
    name: 'Image Enhancer',
    description: 'Améliorez une seule image',
    category: 'basics',
    icon: '✨',
    models: ['kontext', 'flux-schnell'],
    defaultModel: 'kontext',
    creditType: 'free',
    minCredits: 1,
    features: ['Enhancement', 'Refinement', '~4s'],
    isPopular: true,
  },
  {
    id: 'multi-image-composer',
    name: 'Multi-Image Composer',
    description: 'Composez plusieurs images ensemble',
    category: 'basics',
    icon: '🎭',
    models: ['nanobanana', 'flux-schnell'],
    defaultModel: 'nanobanana',
    creditType: 'free',
    minCredits: 2,
    features: ['Multi-image', 'Composition', '~5s'],
  },
  
  // ========== PREMIUM (PAID) ==========
  {
    id: 'pro-image-generator',
    name: 'Pro Image Generator',
    description: 'Qualité professionnelle SOTA',
    category: 'premium',
    icon: '👑',
    models: ['flux-2-pro', 'flux-2-flex'],
    defaultModel: 'flux-2-pro',
    creditType: 'paid',
    minCredits: 3,
    features: ['Premium Quality', 'Professional', '~8s'],
    isPopular: true,
  },
  {
    id: 'creative-flex',
    name: 'Creative Flex',
    description: 'Génération flexible et adaptable',
    category: 'premium',
    icon: '🎨',
    models: ['flux-2-flex', 'flux-2-pro'],
    defaultModel: 'flux-2-flex',
    creditType: 'paid',
    minCredits: 3,
    features: ['Flexible', 'Adaptable', '~7s'],
  },
  {
    id: 'premium-transformer',
    name: 'Premium Transformer',
    description: 'Transformations d\'images premium',
    category: 'premium',
    icon: '🔮',
    models: ['nanobanana-i2i', 'nanobanana-text'],
    defaultModel: 'nanobanana-i2i',
    creditType: 'paid',
    minCredits: 3,
    features: ['Image-to-Image', 'Premium', '~7s'],
  },
  
  // ========== VIDEO (PAID) ==========
  {
    id: 'image-to-video',
    name: 'Image to Video',
    description: 'Animez vos images en vidéo',
    category: 'video',
    icon: '🎬',
    models: ['veo-3-fast'],
    defaultModel: 'veo-3-fast',
    creditType: 'paid',
    minCredits: 10,
    features: ['Video', 'Cinematic', '~15s'],
    isNew: true,
  },
  {
    id: 'video-creator',
    name: 'Video Creator',
    description: 'Créez des vidéos complètes',
    category: 'video',
    icon: '🎥',
    models: ['veo-3-fast'],
    defaultModel: 'veo-3-fast',
    creditType: 'paid',
    minCredits: 10,
    features: ['Full Video', 'Fast', 'Ultra Quality'],
    isPopular: true,
  },
  
  // ========== ADVANCED (PAID) ==========
  {
    id: 'avatar-creator',
    name: 'Avatar Creator',
    description: 'Créez des avatars parlants animés',
    category: 'advanced',
    icon: '👤',
    models: ['infinitalk'],
    defaultModel: 'infinitalk',
    creditType: 'paid',
    minCredits: 8,
    features: ['Talking Avatar', 'Animation', '~20s'],
    isNew: true,
  },
  {
    id: 'batch-generator',
    name: 'Batch Generator',
    description: 'Générez plusieurs images en une fois',
    category: 'advanced',
    icon: '📦',
    models: ['seedream', 'nanobanana-text', 'flux-2-pro'],
    defaultModel: 'seedream',
    creditType: 'free', // Free users can batch with free models
    minCredits: 1, // Per image
    features: ['Batch', 'Multiple', 'Efficient'],
  },
  
  // ========== NSFW (PAID) ==========
  {
    id: 'nsfw-generator',
    name: 'NSFW Generator',
    description: 'Génération sans restrictions',
    category: 'nsfw',
    icon: '🔞',
    models: ['z-image'],
    defaultModel: 'z-image',
    creditType: 'paid',
    minCredits: 4,
    features: ['NSFW', 'Unrestricted', '~8s'],
  },
];

export const TOOL_CATEGORIES_V2 = [
  {
    id: 'basics' as const,
    name: 'Basics',
    description: 'Outils gratuits essentiels (25 crédits/mois)',
    badge: 'FREE',
    color: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    description: 'Qualité professionnelle',
    badge: 'PAID',
    color: 'from-purple-500/20 to-blue-500/20 border-purple-500/30',
  },
  {
    id: 'video' as const,
    name: 'Video',
    description: 'Création vidéo avancée',
    badge: 'PAID',
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  },
  {
    id: 'advanced' as const,
    name: 'Advanced',
    description: 'Outils avancés et spécialisés',
    badge: 'PAID',
    color: 'from-pink-500/20 to-purple-500/20 border-pink-500/30',
  },
  {
    id: 'nsfw' as const,
    name: 'NSFW',
    description: 'Contenu adulte (18+)',
    badge: 'PAID',
    color: 'from-red-500/20 to-orange-500/20 border-red-500/30',
  },
];

// Helper functions
export function getToolById(toolId: string): CreationTool | undefined {
  return CREATION_TOOLS_V2.find(t => t.id === toolId);
}

export function getToolsByCategory(category: string): CreationTool[] {
  return CREATION_TOOLS_V2.filter(t => t.category === category);
}

export function getFreeTools(): CreationTool[] {
  return CREATION_TOOLS_V2.filter(t => t.creditType === 'free');
}

export function getPaidTools(): CreationTool[] {
  return CREATION_TOOLS_V2.filter(t => t.creditType === 'paid');
}

export function getAccessibleTools(userFreeCredits: number, userPaidCredits: number): CreationTool[] {
  return CREATION_TOOLS_V2.filter(tool => {
    if (tool.creditType === 'free') {
      // Can only use free tools if no paid credits
      return userPaidCredits === 0 && userFreeCredits >= tool.minCredits;
    } else {
      // Paid tools require paid credits
      return userPaidCredits >= tool.minCredits;
    }
  });
}
