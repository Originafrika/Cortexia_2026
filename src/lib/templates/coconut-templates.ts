/**
 * COCONUT TEMPLATES
 * Predefined CocoBoard templates for common use cases
 * BDS: Géométrie (structure), Astronomie (vision systémique)
 */

// ❌ REMOVED: Import from cortexia-api (will be deleted in Phase 3)
// import type { CocoNode } from '../services/cortexia-api';

/**
 * CocoNode type (moved from cortexia-api for Phase 3 compatibility)
 */
export interface CocoNode {
  id: string;
  title: string;
  description?: string;
  type: 'image' | 'video' | 'shot' | 'composition' | 'asset';
  
  generationType?: {
    method: 'text-to-image' | 'image-to-image' | 'text-to-video' | 'image-to-video' | 'video-extend' | 'composition';
    requiresReference: boolean;
    referenceType?: 'user-upload' | 'generated' | 'previous-result';
  };
  
  prompt: string;
  negativePrompt?: string;
  model: string;
  
  dependencies: string[];
  referenceImages?: Array<{
    source: 'user-upload' | 'generated' | 'previous-node';
    nodeId?: string;
    url?: string;
    purpose: 'style-reference' | 'starting-frame' | 'last-frame' | 'composition-layer';
  }>;
  
  level: number;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'validating';
  
  result?: {
    url: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    duration?: number;
    validationScore?: number;
    feedback?: string;
  };
  
  metadata: any;
  settings?: {
    duration?: number;
    aspectRatio?: string;
    qualityLevel?: string;
    resolution?: string;
    startFrame?: string;
    endFrame?: string;
  };
  
  retryCount: number;
  suggestedImprovedPrompt?: string;
}

export interface CocoTemplate {
  id: string;
  name: string;
  description: string;
  category: 'social' | 'advertising' | 'content' | 'ecommerce';
  icon: string;
  thumbnail?: string;
  estimatedTime: string; // e.g. "2-3 minutes"
  estimatedCost: number; // in credits
  nodes: Omit<CocoNode, 'id' | 'status' | 'result'>[];
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'image' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[];
  default?: string;
}

// ============================================
// SOCIAL MEDIA TEMPLATES
// ============================================

export const INSTAGRAM_REEL_TEMPLATE: CocoTemplate = {
  id: 'instagram-reel',
  name: 'Instagram Reel',
  description: 'Vertical 9:16 reel with hook, content, and CTA',
  category: 'social',
  icon: '📱',
  estimatedTime: '2-3 minutes',
  estimatedCost: 15,
  variables: [
    {
      key: 'product',
      label: 'Product/Topic',
      type: 'text',
      required: true,
      placeholder: 'e.g., New sneakers collection'
    },
    {
      key: 'style',
      label: 'Visual Style',
      type: 'select',
      required: true,
      options: ['Modern', 'Minimalist', 'Vibrant', 'Cinematic', 'Playful'],
      default: 'Modern'
    },
    {
      key: 'reference',
      label: 'Brand Reference',
      type: 'image',
      required: false
    }
  ],
  nodes: [
    {
      title: 'Hook Shot (0-3s)',
      type: 'video',
      prompt: '[PRODUCT] - attention-grabbing opening shot, [STYLE] style, fast-paced, energetic, 9:16 vertical format',
      model: 'veo-3.1-fast',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '9:16',
        duration: 3,
        resolution: '720p'
      },
      retryCount: 0
    },
    {
      title: 'Main Content (3-12s)',
      type: 'video',
      prompt: '[PRODUCT] showcase, detailed views, [STYLE] cinematography, smooth camera movements, 9:16 vertical',
      model: 'veo-3.1-fast',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '9:16',
        duration: 9,
        resolution: '720p'
      },
      retryCount: 0
    },
    {
      title: 'CTA Shot (12-15s)',
      type: 'video',
      prompt: '[PRODUCT] with clear call-to-action, [STYLE] style, engaging finale, 9:16 vertical',
      model: 'veo-3.1-fast',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '9:16',
        duration: 3,
        resolution: '720p'
      },
      retryCount: 0
    }
  ]
};

export const TIKTOK_TREND_TEMPLATE: CocoTemplate = {
  id: 'tiktok-trend',
  name: 'TikTok Trend',
  description: 'Viral-ready TikTok video with trending format',
  category: 'social',
  icon: '🎵',
  estimatedTime: '2-3 minutes',
  estimatedCost: 12,
  variables: [
    {
      key: 'concept',
      label: 'Trend Concept',
      type: 'text',
      required: true,
      placeholder: 'e.g., Before/After transformation'
    },
    {
      key: 'mood',
      label: 'Mood',
      type: 'select',
      required: true,
      options: ['Fun', 'Dramatic', 'Inspiring', 'Humorous', 'Educational'],
      default: 'Fun'
    }
  ],
  nodes: [
    {
      title: 'Setup Shot',
      type: 'video',
      prompt: '[CONCEPT] - setup scene, [MOOD] tone, TikTok-style framing, 9:16 vertical',
      model: 'veo-3.1-fast',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '9:16',
        duration: 5,
        resolution: '720p'
      },
      retryCount: 0
    },
    {
      title: 'Payoff Shot',
      type: 'video',
      prompt: '[CONCEPT] - reveal/payoff, [MOOD] climax, viral moment, 9:16 vertical',
      model: 'veo-3.1-fast',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '9:16',
        duration: 5,
        resolution: '720p'
      },
      retryCount: 0
    }
  ]
};

// ============================================
// ADVERTISING TEMPLATES
// ============================================

export const PRODUCT_HERO_TEMPLATE: CocoTemplate = {
  id: 'product-hero',
  name: 'Product Hero Shot',
  description: 'High-quality product photography with multiple angles',
  category: 'advertising',
  icon: '📸',
  estimatedTime: '1-2 minutes',
  estimatedCost: 8,
  variables: [
    {
      key: 'product',
      label: 'Product Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Premium wireless headphones'
    },
    {
      key: 'background',
      label: 'Background Style',
      type: 'select',
      required: true,
      options: ['White studio', 'Black studio', 'Gradient', 'Natural', 'Urban'],
      default: 'White studio'
    }
  ],
  nodes: [
    {
      title: 'Front View',
      type: 'image',
      prompt: '[PRODUCT], professional front view, [BACKGROUND], studio lighting, high detail, commercial photography',
      model: 'flux-2-pro',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '1:1',
        resolution: '2K'
      },
      retryCount: 0
    },
    {
      title: '45° Angle',
      type: 'image',
      prompt: '[PRODUCT], 45-degree angle view, [BACKGROUND], dramatic lighting, professional product photo',
      model: 'flux-2-pro',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '1:1',
        resolution: '2K'
      },
      retryCount: 0
    },
    {
      title: 'Detail Close-up',
      type: 'image',
      prompt: '[PRODUCT] detail close-up, [BACKGROUND], macro photography, premium quality',
      model: 'flux-2-pro',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '4:3',
        resolution: '2K'
      },
      retryCount: 0
    },
    {
      title: 'Hero Composition',
      type: 'composition',
      prompt: 'Professional product showcase combining multiple angles of [PRODUCT], [BACKGROUND], editorial layout',
      model: 'nanobanana-pro',
      dependencies: ['{node:0}', '{node:1}', '{node:2}'],
      level: 1,
      metadata: {
        aspectRatio: '16:9',
        resolution: '4K'
      },
      retryCount: 0
    }
  ]
};

export const BRAND_CAMPAIGN_TEMPLATE: CocoTemplate = {
  id: 'brand-campaign',
  name: 'Multi-Platform Brand Campaign',
  description: 'Complete campaign assets for Instagram, TikTok, and YouTube',
  category: 'advertising',
  icon: '🎯',
  estimatedTime: '4-6 minutes',
  estimatedCost: 35,
  variables: [
    {
      key: 'brand',
      label: 'Brand/Product',
      type: 'text',
      required: true,
      placeholder: 'e.g., Eco-friendly water bottle'
    },
    {
      key: 'message',
      label: 'Campaign Message',
      type: 'text',
      required: true,
      placeholder: 'e.g., Sustainability meets style'
    },
    {
      key: 'brandImage',
      label: 'Brand Reference',
      type: 'image',
      required: true
    }
  ],
  nodes: [
    // Instagram assets
    {
      title: 'Instagram Square Post',
      type: 'image',
      prompt: '[BRAND] - [MESSAGE], Instagram-optimized, modern design, 1:1 format',
      model: 'flux-2-flex',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '1:1',
        resolution: '2K'
      },
      retryCount: 0
    },
    {
      title: 'Instagram Story',
      type: 'image',
      prompt: '[BRAND] - [MESSAGE], vertical Instagram story, eye-catching, 9:16 format',
      model: 'flux-2-flex',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '9:16',
        resolution: '2K'
      },
      retryCount: 0
    },
    // TikTok assets
    {
      title: 'TikTok Hero Shot',
      type: 'video',
      prompt: '[BRAND] - [MESSAGE], TikTok-style video, engaging, vertical 9:16',
      model: 'veo-3.1-fast',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '9:16',
        duration: 6,
        resolution: '720p'
      },
      retryCount: 0
    },
    // YouTube assets
    {
      title: 'YouTube Thumbnail',
      type: 'image',
      prompt: '[BRAND] - [MESSAGE], YouTube thumbnail, bold text, attention-grabbing, 16:9 format',
      model: 'flux-2-pro',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '16:9',
        resolution: '2K'
      },
      retryCount: 0
    }
  ]
};

// ============================================
// CONTENT CREATION TEMPLATES
// ============================================

export const YOUTUBE_THUMBNAIL_TEMPLATE: CocoTemplate = {
  id: 'youtube-thumbnail',
  name: 'YouTube Thumbnail Pack',
  description: 'A/B test ready thumbnail variations',
  category: 'content',
  icon: '🎬',
  estimatedTime: '1-2 minutes',
  estimatedCost: 6,
  variables: [
    {
      key: 'topic',
      label: 'Video Topic',
      type: 'text',
      required: true,
      placeholder: 'e.g., 10 Best AI Tools for 2024'
    },
    {
      key: 'emotion',
      label: 'Emotional Hook',
      type: 'select',
      required: true,
      options: ['Excited', 'Shocked', 'Curious', 'Serious', 'Happy'],
      default: 'Curious'
    }
  ],
  nodes: [
    {
      title: 'Variation A - Bold',
      type: 'image',
      prompt: 'YouTube thumbnail: [TOPIC], [EMOTION] expression, bold colors, large readable text, 16:9',
      model: 'flux-2-pro',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '16:9',
        resolution: '2K'
      },
      retryCount: 0
    },
    {
      title: 'Variation B - Minimal',
      type: 'image',
      prompt: 'YouTube thumbnail: [TOPIC], [EMOTION] vibe, minimalist design, clean text, 16:9',
      model: 'flux-2-pro',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '16:9',
        resolution: '2K'
      },
      retryCount: 0
    },
    {
      title: 'Variation C - Cinematic',
      type: 'image',
      prompt: 'YouTube thumbnail: [TOPIC], [EMOTION] mood, cinematic lighting, dramatic text, 16:9',
      model: 'flux-2-pro',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '16:9',
        resolution: '2K'
      },
      retryCount: 0
    }
  ]
};

// ============================================
// E-COMMERCE TEMPLATES
// ============================================

export const ECOMMERCE_PRODUCT_TEMPLATE: CocoTemplate = {
  id: 'ecommerce-product',
  name: 'E-commerce Product Pack',
  description: 'Complete product listing with hero, lifestyle, and detail shots',
  category: 'ecommerce',
  icon: '🛒',
  estimatedTime: '3-4 minutes',
  estimatedCost: 18,
  variables: [
    {
      key: 'product',
      label: 'Product Description',
      type: 'text',
      required: true,
      placeholder: 'e.g., Minimalist leather wallet, brown'
    },
    {
      key: 'context',
      label: 'Lifestyle Context',
      type: 'text',
      required: true,
      placeholder: 'e.g., On wooden desk with coffee'
    }
  ],
  nodes: [
    {
      title: 'Hero Shot - White Background',
      type: 'image',
      prompt: '[PRODUCT], professional product photography, white background, centered, high detail, e-commerce style',
      model: 'flux-2-pro',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '1:1',
        resolution: '2K'
      },
      retryCount: 0
    },
    {
      title: 'Lifestyle Shot',
      type: 'image',
      prompt: '[PRODUCT] [CONTEXT], lifestyle photography, natural lighting, authentic setting',
      model: 'flux-2-flex',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '4:3',
        resolution: '2K'
      },
      retryCount: 0
    },
    {
      title: 'Detail Close-up',
      type: 'image',
      prompt: '[PRODUCT] close-up detail, macro photography, texture visible, premium quality',
      model: 'flux-2-pro',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '1:1',
        resolution: '2K'
      },
      retryCount: 0
    },
    {
      title: 'Scale Shot',
      type: 'image',
      prompt: '[PRODUCT] with hand for scale, lifestyle context, natural pose, size reference',
      model: 'flux-2-flex',
      dependencies: [],
      level: 0,
      metadata: {
        aspectRatio: '4:3',
        resolution: '2K'
      },
      retryCount: 0
    },
    {
      title: 'Product Grid Composition',
      type: 'composition',
      prompt: 'E-commerce product grid layout combining multiple views of [PRODUCT], professional arrangement',
      model: 'nanobanana-pro',
      dependencies: ['{node:0}', '{node:1}', '{node:2}', '{node:3}'],
      level: 1,
      metadata: {
        aspectRatio: '16:9',
        resolution: '4K'
      },
      retryCount: 0
    }
  ]
};

// ============================================
// TEMPLATE REGISTRY
// ============================================

export const TEMPLATE_REGISTRY: Record<string, CocoTemplate> = {
  'instagram-reel': INSTAGRAM_REEL_TEMPLATE,
  'tiktok-trend': TIKTOK_TREND_TEMPLATE,
  'product-hero': PRODUCT_HERO_TEMPLATE,
  'brand-campaign': BRAND_CAMPAIGN_TEMPLATE,
  'youtube-thumbnail': YOUTUBE_THUMBNAIL_TEMPLATE,
  'ecommerce-product': ECOMMERCE_PRODUCT_TEMPLATE
};

export const TEMPLATE_CATEGORIES = {
  social: {
    label: 'Social Media',
    icon: '📱',
    templates: ['instagram-reel', 'tiktok-trend']
  },
  advertising: {
    label: 'Advertising',
    icon: '📸',
    templates: ['product-hero', 'brand-campaign']
  },
  content: {
    label: 'Content Creation',
    icon: '🎬',
    templates: ['youtube-thumbnail']
  },
  ecommerce: {
    label: 'E-commerce',
    icon: '🛒',
    templates: ['ecommerce-product']
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Apply template variables to create a personalized CocoBoard
 */
export function applyTemplateVariables(
  template: CocoTemplate,
  variables: Record<string, string | string[]>
): Omit<CocoNode, 'id' | 'status' | 'result'>[] {
  return template.nodes.map(node => {
    let prompt = node.prompt;
    
    // Replace variable placeholders
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `[${key.toUpperCase()}]`;
      const replacement = Array.isArray(value) ? value.join(', ') : value;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), replacement);
    });
    
    return {
      ...node,
      prompt
    };
  });
}

/**
 * Get all templates in a category
 */
export function getTemplatesByCategory(category: string): CocoTemplate[] {
  const categoryData = TEMPLATE_CATEGORIES[category as keyof typeof TEMPLATE_CATEGORIES];
  if (!categoryData) return [];
  
  return categoryData.templates.map(id => TEMPLATE_REGISTRY[id]).filter(Boolean);
}

/**
 * Get template by ID
 */
export function getTemplate(id: string): CocoTemplate | null {
  return TEMPLATE_REGISTRY[id] || null;
}