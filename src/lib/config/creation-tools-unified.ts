/**
 * CREATION TOOLS - Unified with Existing Provider System
 * Uses ModelConfig from /lib/providers/config.ts
 * BDS: Logique du Système - Cohérence Cognitive
 */

import { AVAILABLE_MODELS, type ModelConfig } from '../providers/config';
import type { ProviderType } from '../providers/types';

export interface CreationTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'quick-create' | 'templates' | 'advanced' | 'video';
  
  // Reference existing models by their IDs
  primaryModelId: string; // Free users
  fallbackModelId?: string; // If primary unavailable
  premiumModelId?: string; // Paid users
  
  // Access control
  freeAccess: boolean; // Can free users access?
  paidOnly: boolean; // Requires paid credits?
  
  // Capabilities
  requiresImages?: { min: number; max: number };
  supportsVideo?: boolean;
  
  features: string[];
  isNew?: boolean;
}

// ========== QUICK CREATE TOOLS ==========

export const QUICK_CREATE_TOOLS: CreationTool[] = [
  {
    id: 'text-to-image',
    name: 'Text to Image',
    description: 'Créez des images à partir de texte',
    icon: '✨',
    category: 'quick-create',
    primaryModelId: 'pollinations-seedream', // Free
    fallbackModelId: 'together-flux-schnell', // If Pollinations down
    premiumModelId: 'replicate-flux-2-pro', // Paid users
    freeAccess: true,
    paidOnly: false,
    features: ['Rapide', 'Créatif', 'Gratuit'],
  },
  
  {
    id: 'image-enhance',
    name: 'Image Enhancement',
    description: 'Améliorez une image (1 image)',
    icon: '🎨',
    category: 'quick-create',
    primaryModelId: 'pollinations-nanobanana', // Uses kontext logic (1 image)
    premiumModelId: 'replicate-flux-2-pro',
    freeAccess: true,
    paidOnly: false,
    requiresImages: { min: 1, max: 1 },
    features: ['1 image', 'Enhancement', 'Quality++'],
  },
  
  {
    id: 'image-blend',
    name: 'Image Blend',
    description: 'Fusionnez 2-3 images',
    icon: '🎭',
    category: 'quick-create',
    primaryModelId: 'pollinations-nanobanana', // 2-3 images
    premiumModelId: 'replicate-flux-2-pro',
    freeAccess: true,
    paidOnly: false,
    requiresImages: { min: 2, max: 3 },
    features: ['2-3 images', 'Composition', 'Creative'],
  },
  
  {
    id: 'multi-image',
    name: 'Multi-Image Creator',
    description: 'Créez à partir de 4-10 images',
    icon: '🖼️',
    category: 'quick-create',
    primaryModelId: 'pollinations-seedream', // 4-10 images
    premiumModelId: 'replicate-flux-2-pro',
    freeAccess: true,
    paidOnly: false,
    requiresImages: { min: 4, max: 10 },
    features: ['4-10 images', 'Complex', 'Advanced'],
  },
];

// ========== TEMPLATE TOOLS ==========

export const TEMPLATE_TOOLS: CreationTool[] = [
  // Free templates
  {
    id: 'portrait-template',
    name: 'Portrait Pro',
    description: 'Templates professionnels de portraits',
    icon: '👤',
    category: 'templates',
    primaryModelId: 'pollinations-seedream',
    premiumModelId: 'replicate-flux-2-pro',
    freeAccess: true,
    paidOnly: false,
    features: ['Headshots', 'Professional', 'Multiple styles'],
  },
  
  {
    id: 'product-template',
    name: 'Product Showcase',
    description: 'Templates pour produits e-commerce',
    icon: '📦',
    category: 'templates',
    primaryModelId: 'pollinations-seedream',
    premiumModelId: 'replicate-flux-2-pro',
    freeAccess: true,
    paidOnly: false,
    features: ['E-commerce', 'Clean', 'Professional'],
  },
  
  {
    id: 'social-media-template',
    name: 'Social Media Pack',
    description: 'Templates pour réseaux sociaux',
    icon: '📱',
    category: 'templates',
    primaryModelId: 'pollinations-seedream',
    premiumModelId: 'replicate-flux-2-pro',
    freeAccess: true,
    paidOnly: false,
    features: ['Instagram', 'TikTok', 'Twitter'],
  },
  
  {
    id: 'branding-template',
    name: 'Branding Kit',
    description: 'Templates de branding complets',
    icon: '🎯',
    category: 'templates',
    primaryModelId: 'pollinations-seedream',
    premiumModelId: 'replicate-flux-2-pro',
    freeAccess: true,
    paidOnly: false,
    features: ['Logo', 'Colors', 'Typography'],
  },
  
  // Paid templates (video) - TODO: Add video models when available
  {
    id: 'video-ad-template',
    name: 'Video Ads',
    description: 'Templates de publicités vidéo (COMING SOON)',
    icon: '🎬',
    category: 'templates',
    primaryModelId: 'replicate-flux-2-pro', // Placeholder until video models added
    freeAccess: false,
    paidOnly: true,
    supportsVideo: true,
    features: ['Ads', 'Marketing', 'Professional'],
    isNew: true,
  },
  
  {
    id: 'story-video-template',
    name: 'Story Creator',
    description: 'Créez des stories vidéo (COMING SOON)',
    icon: '📖',
    category: 'templates',
    primaryModelId: 'replicate-flux-2-pro', // Placeholder
    freeAccess: false,
    paidOnly: true,
    supportsVideo: true,
    features: ['Stories', 'Vertical', 'Engaging'],
    isNew: true,
  },
];

// ========== ADVANCED TOOLS ==========

export const ADVANCED_TOOLS: CreationTool[] = [
  {
    id: 'coconut',
    name: 'Coconut V9',
    description: 'Orchestration multimodale complète',
    icon: '🥥',
    category: 'advanced',
    premiumModelId: 'replicate-flux-2-pro',
    freeAccess: false,
    paidOnly: true,
    requiresImages: { min: 0, max: 8 }, // Up to 8 images
    features: ['Campaign creation', 'Multi-modal', 'Advanced'],
    isNew: true,
  },
  
  {
    id: 'ai-vision',
    name: 'AI Vision',
    description: 'Intelligence et analyse d\'images (COMING SOON)',
    icon: '👁️',
    category: 'advanced',
    premiumModelId: 'replicate-flux-2-pro', // Placeholder for Gemini
    freeAccess: false,
    paidOnly: true,
    features: ['Analysis', 'Intelligence', 'Vision'],
  },
];

// ========== VIDEO TOOLS (COMING SOON) ==========

export const VIDEO_TOOLS: CreationTool[] = [
  {
    id: 'image-to-video',
    name: 'Image to Video',
    description: 'Transformez vos images en vidéos (COMING SOON)',
    icon: '🎥',
    category: 'video',
    premiumModelId: 'replicate-flux-2-pro', // Placeholder for Veo 3.1
    freeAccess: false,
    paidOnly: true,
    supportsVideo: true,
    features: ['Image→Video', 'Professional', 'Fast'],
    isNew: true,
  },
  
  {
    id: 'video-creator',
    name: 'Video Creator',
    description: 'Créez des vidéos complètes (COMING SOON)',
    icon: '🎞️',
    category: 'video',
    premiumModelId: 'replicate-flux-2-pro', // Placeholder
    freeAccess: false,
    paidOnly: true,
    supportsVideo: true,
    features: ['Full video', 'Professional', 'Fast'],
    isNew: true,
  },
];

// ========== ALL TOOLS ==========

export const ALL_CORTEXIA_TOOLS: CreationTool[] = [
  ...QUICK_CREATE_TOOLS,
  ...TEMPLATE_TOOLS,
  ...ADVANCED_TOOLS,
  ...VIDEO_TOOLS,
];

// ========== TOOL CATEGORIES ==========

export const TOOL_CATEGORIES = [
  {
    id: 'quick-create' as const,
    name: 'Quick Create',
    description: 'Création rapide et simple',
    badge: 'FREE',
    color: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  },
  {
    id: 'templates' as const,
    name: 'Templates',
    description: 'Templates prêts à l\'emploi',
    badge: 'MIXED',
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  },
  {
    id: 'advanced' as const,
    name: 'Advanced',
    description: 'Outils avancés (Coconut, AI)',
    badge: 'PAID',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  },
  {
    id: 'video' as const,
    name: 'Video',
    description: 'Création vidéo professionnelle',
    badge: 'COMING SOON',
    color: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
  },
];

// ========== HELPER FUNCTIONS ==========

export function getToolById(id: string): CreationTool | undefined {
  return ALL_CORTEXIA_TOOLS.find(t => t.id === id);
}

export function getModelForTool(
  tool: CreationTool, 
  userHasPaidCredits: boolean,
  pollinationsAvailable: boolean = true
): ModelConfig | undefined {
  // Paid users always use premium models
  if (userHasPaidCredits && tool.premiumModelId) {
    return AVAILABLE_MODELS.find(m => m.id === tool.premiumModelId);
  }
  
  // Free users
  if (!tool.freeAccess) {
    return undefined; // Tool not accessible for free users
  }
  
  // Use fallback if Pollinations down
  if (!pollinationsAvailable && tool.fallbackModelId) {
    return AVAILABLE_MODELS.find(m => m.id === tool.fallbackModelId);
  }
  
  // Use primary model
  return AVAILABLE_MODELS.find(m => m.id === tool.primaryModelId);
}

export function canAccessTool(
  tool: CreationTool, 
  userHasPaidCredits: boolean
): boolean {
  // Paid-only tools require paid credits
  if (tool.paidOnly) {
    return userHasPaidCredits;
  }
  
  // Free tools blocked if user has paid credits
  if (tool.freeAccess) {
    return !userHasPaidCredits;
  }
  
  return false;
}

export function getAccessibleTools(userHasPaidCredits: boolean): CreationTool[] {
  return ALL_CORTEXIA_TOOLS.filter(tool => canAccessTool(tool, userHasPaidCredits));
}
