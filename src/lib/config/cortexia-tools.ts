/**
 * CORTEXIA TOOLS - Real Specification
 * BDS: Logique du Système - Cohérence Cognitive
 */

export interface CreationTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'quick-create' | 'templates' | 'advanced' | 'video';
  requiredCredits: 'free' | 'paid';
  features: string[];
  isNew?: boolean;
  modelIds: string[]; // Compatible model IDs
}

// ========== QUICK CREATE ==========

export const QUICK_CREATE_TOOLS: CreationTool[] = [
  {
    id: 'text-to-image',
    name: 'Text to Image',
    description: 'Créez des images à partir de texte',
    icon: '✨',
    category: 'quick-create',
    requiredCredits: 'free',
    features: ['Rapide', 'Créatif', 'Simple'],
    modelIds: ['seedream', 'flux-schnell', 'flux-2-pro', 'flux-2-flex'],
  },
  {
    id: 'image-enhance',
    name: 'Image Enhancement',
    description: 'Améliorez une image',
    icon: '🎨',
    category: 'quick-create',
    requiredCredits: 'free',
    features: ['1 image', 'Refinement', 'Quality++'],
    modelIds: ['kontext', 'flux-2-pro'],
  },
  {
    id: 'image-blend',
    name: 'Image Blend',
    description: 'Fusionnez 2-3 images',
    icon: '🎭',
    category: 'quick-create',
    requiredCredits: 'free',
    features: ['2-3 images', 'Composition', 'Creative'],
    modelIds: ['nanobanana', 'nanobanana-kie'],
  },
  {
    id: 'multi-image',
    name: 'Multi-Image Creator',
    description: 'Créez à partir de 4-10 images',
    icon: '🖼️',
    category: 'quick-create',
    requiredCredits: 'free',
    features: ['4-10 images', 'Complex', 'Advanced'],
    modelIds: ['seedream', 'flux-2-pro'],
  },
];

// ========== TEMPLATES ==========

export const TEMPLATE_TOOLS: CreationTool[] = [
  // Free Templates
  {
    id: 'portrait-template',
    name: 'Portrait Pro',
    description: 'Templates professionnels de portraits',
    icon: '👤',
    category: 'templates',
    requiredCredits: 'free',
    features: ['Headshots', 'Professional', 'Multiple styles'],
    modelIds: ['seedream', 'flux-2-pro'],
  },
  {
    id: 'product-template',
    name: 'Product Showcase',
    description: 'Templates pour produits e-commerce',
    icon: '📦',
    category: 'templates',
    requiredCredits: 'free',
    features: ['E-commerce', 'Clean', 'Professional'],
    modelIds: ['seedream', 'flux-2-pro'],
  },
  {
    id: 'social-media-template',
    name: 'Social Media Pack',
    description: 'Templates pour réseaux sociaux',
    icon: '📱',
    category: 'templates',
    requiredCredits: 'free',
    features: ['Instagram', 'TikTok', 'Twitter'],
    modelIds: ['seedream', 'flux-2-pro'],
  },
  {
    id: 'branding-template',
    name: 'Branding Kit',
    description: 'Templates de branding complets',
    icon: '🎯',
    category: 'templates',
    requiredCredits: 'free',
    features: ['Logo', 'Colors', 'Typography'],
    modelIds: ['seedream', 'flux-2-pro'],
  },
  
  // Video Templates (PAID ONLY)
  {
    id: 'video-ad-template',
    name: 'Video Ads',
    description: 'Templates de publicités vidéo',
    icon: '🎬',
    category: 'templates',
    requiredCredits: 'paid',
    features: ['Ads', 'Marketing', 'Professional'],
    modelIds: ['veo-3.1-fast'],
    isNew: true,
  },
  {
    id: 'story-video-template',
    name: 'Story Creator',
    description: 'Créez des stories vidéo engageantes',
    icon: '📖',
    category: 'templates',
    requiredCredits: 'paid',
    features: ['Stories', 'Vertical', 'Engaging'],
    modelIds: ['veo-3.1-fast'],
    isNew: true,
  },
];

// ========== ADVANCED TOOLS ==========

export const ADVANCED_TOOLS: CreationTool[] = [
  {
    id: 'coconut',
    name: 'Coconut V9',
    description: 'Orchestration multimodale complète (PAID ONLY)',
    icon: '🥥',
    category: 'advanced',
    requiredCredits: 'paid',
    features: ['Flux 2 Pro', 'Up to 8 images', 'Campaign creation', 'Advanced'],
    modelIds: ['flux-2-pro', 'gemini-vision', 'veo-3.1-fast'],
    isNew: true,
  },
  {
    id: 'ai-vision',
    name: 'AI Vision',
    description: 'Intelligence et analyse d\'images',
    icon: '👁️',
    category: 'advanced',
    requiredCredits: 'paid',
    features: ['Gemini', 'Analysis', 'Intelligence'],
    modelIds: ['gemini-vision'],
  },
];

// ========== VIDEO TOOLS (PAID ONLY) ==========

export const VIDEO_TOOLS: CreationTool[] = [
  {
    id: 'image-to-video',
    name: 'Image to Video',
    description: 'Transformez vos images en vidéos',
    icon: '🎥',
    category: 'video',
    requiredCredits: 'paid',
    features: ['Veo 3.1', 'image + last_frame', 'Ultra quality'],
    modelIds: ['veo-3.1-fast'],
    isNew: true,
  },
  {
    id: 'video-creator',
    name: 'Video Creator',
    description: 'Créez des vidéos complètes',
    icon: '🎞️',
    category: 'video',
    requiredCredits: 'paid',
    features: ['Full video', 'Professional', 'Fast'],
    modelIds: ['veo-3.1-fast'],
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
    badge: 'PAID',
    color: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
  },
];

// ========== HELPER FUNCTIONS ==========

export function getToolById(id: string): CreationTool | undefined {
  return ALL_CORTEXIA_TOOLS.find(t => t.id === id);
}

export function getToolsByCategory(category: string): CreationTool[] {
  return ALL_CORTEXIA_TOOLS.filter(t => t.category === category);
}

export function canAccessTool(tool: CreationTool, userHasPaidCredits: boolean): boolean {
  if (tool.requiredCredits === 'free') {
    // Free tools accessible if user has NO paid credits
    return !userHasPaidCredits;
  } else {
    // Paid tools require paid credits
    return userHasPaidCredits;
  }
}

export function getAccessibleTools(userHasPaidCredits: boolean): CreationTool[] {
  return ALL_CORTEXIA_TOOLS.filter(tool => canAccessTool(tool, userHasPaidCredits));
}
