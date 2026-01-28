/**
 * ENTERPRISE INTENT TEMPLATES
 * 
 * Templates intelligents industry-specific qui nourrissent le cerveau Gemini
 * avec des structures Intent pré-analysées pour accélérer le workflow orchestré.
 * 
 * Architecture:
 * - Intent structuré (description, format, targetUsage)
 * - Metadata industry-specific
 * - Brand guidance intégré
 * - Fonctionne pour Image, Video, Campaign
 * 
 * Workflow:
 * Template → Intent Input (pré-rempli) → Gemini Analysis → Directions → Generation
 */

import type { ImageFormat, TargetUsage } from '../types/gemini';
import type { IntentData } from '../../components/coconut-v14/IntentInputPremium';

// ============================================
// TYPES
// ============================================

export type TemplateCategory = 
  | 'ecommerce'
  | 'saas'
  | 'real-estate'
  | 'fashion'
  | 'food-beverage'
  | 'automotive'
  | 'healthcare'
  | 'education'
  | 'finance'
  | 'entertainment';

export type TemplateType = 'image' | 'video' | 'campaign';

export interface EnterpriseTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  type: TemplateType;
  icon: string; // Emoji
  description: string;
  
  // ✅ Intent Structure (nourrit Gemini)
  intentStructure: {
    description: string; // Pre-filled intent description
    format: ImageFormat;
    resolution: '1K' | '2K';
    targetUsage: TargetUsage;
    
    // Video-specific (si type === 'video')
    videoType?: 'commercial' | 'trailer' | 'explainer' | 'teaser' | 'social';
    targetDuration?: 15 | 30 | 60;
    messageKey?: string;
    callToAction?: string;
    platforms?: string[];
  };
  
  // ✅ Gemini Guidance (améliore l'analyse)
  geminiGuidance: {
    styleHints: string[]; // Suggestions de style pour Gemini
    compositionHints: string[]; // Suggestions de composition
    colorPaletteHints: string[]; // Suggestions de palette
    moodKeywords: string[]; // Mots-clés d'ambiance
  };
  
  // ✅ Brand Integration
  brandPlaceholders: {
    needsLogo: boolean;
    needsProductImage: boolean;
    needsBackgroundTexture: boolean;
    needsTypography: boolean;
  };
  
  // ✅ Campaign-specific (si type === 'campaign')
  campaignStructure?: {
    numberOfAssets: number; // Combien d'assets dans la campagne
    assetTypes: ('hero' | 'social' | 'banner' | 'story' | 'email')[];
    consistency: 'strict' | 'flexible'; // Cohérence visuelle
  };
  
  // ✅ Expected Output
  expectedOutput: {
    estimatedCost: number; // Coût estimé en crédits
    estimatedTime: number; // Temps estimé en secondes
    qualityLevel: 'standard' | 'professional' | 'premium';
  };
}

// ============================================
// ECOMMERCE TEMPLATES
// ============================================

export const ECOMMERCE_TEMPLATES: EnterpriseTemplate[] = [
  {
    id: 'ecom-product-hero',
    name: 'Product Hero Shot',
    category: 'ecommerce',
    type: 'image',
    icon: '📦',
    description: 'Professional product photography with clean background and dramatic lighting',
    
    intentStructure: {
      description: `Create a professional product hero shot with dramatic lighting and premium aesthetic. 
      
The product should be the focal point with cinematic lighting that highlights its key features and materials. Use a clean, minimal background that doesn't distract from the product. 

Lighting setup: Soft key light from 45° with subtle rim lighting to create depth and dimension. Add gentle shadows to ground the product.

Composition: Rule of thirds, product slightly off-center to create visual interest. Leave negative space for text overlay.

Mood: Premium, sophisticated, aspirational. The image should convey quality and desirability.

Color treatment: Subtle color grading to enhance the product's natural colors without oversaturation. Maintain accurate color representation for e-commerce.`,
      
      format: '1:1',
      resolution: '2K',
      targetUsage: 'web'
    },
    
    geminiGuidance: {
      styleHints: [
        'Commercial product photography aesthetic',
        'Studio lighting with soft shadows',
        'Premium e-commerce quality',
        'Photorealistic rendering',
        'Clean and professional composition'
      ],
      compositionHints: [
        'Product positioned using rule of thirds',
        'Negative space for text placement',
        'Subtle depth of field to focus attention',
        'Balanced lighting across product surface',
        'Clear view of product features and details'
      ],
      colorPaletteHints: [
        'Neutral background (white, light gray, or subtle gradient)',
        'Accurate product color representation',
        'Subtle warm or cool toning based on product type',
        'Professional color grading'
      ],
      moodKeywords: [
        'premium',
        'professional',
        'clean',
        'sophisticated',
        'aspirational',
        'trustworthy'
      ]
    },
    
    brandPlaceholders: {
      needsLogo: false,
      needsProductImage: true, // User uploads product image
      needsBackgroundTexture: false,
      needsTypography: false
    },
    
    expectedOutput: {
      estimatedCost: 2, // 2K image with Flux 2 Pro
      estimatedTime: 15,
      qualityLevel: 'premium'
    }
  },
  
  {
    id: 'ecom-lifestyle-video',
    name: 'Lifestyle Product Video',
    category: 'ecommerce',
    type: 'video',
    icon: '🎬',
    description: 'Product showcased in real-life context with emotional storytelling',
    
    intentStructure: {
      description: `Create a lifestyle video that showcases the product in a real-world context, connecting emotionally with the target audience.

Story arc: Start with a relatable problem or desire, introduce the product as the solution, show it being used naturally, end with satisfaction and brand message.

Visual style: Cinematic cinematography with smooth camera movements. Warm, inviting color palette. Natural lighting mixed with subtle artificial enhancement.

Pacing: Dynamic but not rushed. Allow moments to breathe. Use rhythm to maintain engagement.

Key scenes:
1. Opening: Establish the lifestyle/context (3-5s)
2. Product introduction: Hero moment with dramatic reveal (3-5s)
3. Usage demonstration: Show product in action, benefits clearly visible (15-20s)
4. Emotional payoff: Happy user, problem solved (3-5s)
5. Brand/CTA: Logo and call-to-action (2-3s)

Music: Upbeat, positive, modern. Should enhance emotion without overwhelming dialogue.`,
      
      format: '16:9',
      resolution: '2K',
      targetUsage: 'social',
      
      videoType: 'commercial',
      targetDuration: 30,
      messageKey: 'Product solves a real problem and enhances lifestyle',
      callToAction: 'Shop now',
      platforms: ['Instagram', 'Facebook', 'YouTube']
    },
    
    geminiGuidance: {
      styleHints: [
        'Cinematic lifestyle videography',
        'Natural yet polished aesthetic',
        'Emotional storytelling through visuals',
        'Modern commercial production quality'
      ],
      compositionHints: [
        'Varied shot types (wide, medium, close-up)',
        'Smooth camera movements (dolly, pan, gimbal)',
        'Rule of thirds for subject placement',
        'Dynamic transitions between scenes',
        'Focus on product benefits and user satisfaction'
      ],
      colorPaletteHints: [
        'Warm, inviting tones',
        'Slight color grading for cinematic look',
        'Consistent color throughout video',
        'Brand colors subtly integrated'
      ],
      moodKeywords: [
        'aspirational',
        'relatable',
        'joyful',
        'authentic',
        'modern',
        'desirable'
      ]
    },
    
    brandPlaceholders: {
      needsLogo: true,
      needsProductImage: true,
      needsBackgroundTexture: false,
      needsTypography: false
    },
    
    expectedOutput: {
      estimatedCost: 40, // VEO 3 30s video
      estimatedTime: 180, // ~3min generation
      qualityLevel: 'premium'
    }
  },
  
  {
    id: 'ecom-social-campaign',
    name: 'Social Media Campaign',
    category: 'ecommerce',
    type: 'campaign',
    icon: '📱',
    description: 'Multi-format campaign optimized for Instagram, Facebook, TikTok',
    
    intentStructure: {
      description: `Create a cohesive social media campaign with assets optimized for multiple platforms.

Campaign theme: [Product launch / Seasonal promotion / Brand awareness]

Visual consistency: All assets share the same color palette, typography, and brand aesthetic while being optimized for each platform's format.

Asset breakdown:
1. Instagram Feed Post (1:1) - Hero shot of product with key message
2. Instagram Story (9:16) - Vertical product showcase with swipe-up CTA
3. Facebook Post (4:3) - Product in lifestyle context
4. TikTok Video (9:16) - Quick, engaging product demo
5. Banner Ad (16:9) - Product hero with bold CTA

Brand guidelines: Maintain consistent brand voice, colors, and messaging across all assets. Each asset should work standalone but also as part of cohesive campaign.

Target audience: [Define demographic, interests, pain points]

Key message: [Primary value proposition]

Call-to-action: [Specific action - Shop Now, Learn More, Sign Up, etc.]`,
      
      format: '1:1', // Default, will vary by asset
      resolution: '2K',
      targetUsage: 'social',
      platforms: ['Instagram', 'Facebook', 'TikTok']
    },
    
    geminiGuidance: {
      styleHints: [
        'Modern social media aesthetic',
        'Platform-optimized compositions',
        'Attention-grabbing visuals',
        'Consistent brand identity across assets'
      ],
      compositionHints: [
        'Format-specific layouts (1:1, 9:16, 4:3, 16:9)',
        'Text-safe zones for each platform',
        'Clear focal points',
        'Mobile-first design thinking',
        'Thumb-stopping visual hooks'
      ],
      colorPaletteHints: [
        'Bold, attention-grabbing colors',
        'Brand colors prominently featured',
        'High contrast for mobile visibility',
        'Consistent palette across all assets'
      ],
      moodKeywords: [
        'energetic',
        'scroll-stopping',
        'on-trend',
        'shareable',
        'engaging'
      ]
    },
    
    brandPlaceholders: {
      needsLogo: true,
      needsProductImage: true,
      needsBackgroundTexture: false,
      needsTypography: true // Campaign needs consistent typography
    },
    
    campaignStructure: {
      numberOfAssets: 5,
      assetTypes: ['hero', 'social', 'story', 'banner'],
      consistency: 'strict' // All assets must be visually cohesive
    },
    
    expectedOutput: {
      estimatedCost: 15, // 5 images × 3 credits average
      estimatedTime: 90,
      qualityLevel: 'professional'
    }
  }
];

// ============================================
// SAAS TEMPLATES
// ============================================

export const SAAS_TEMPLATES: EnterpriseTemplate[] = [
  {
    id: 'saas-hero-section',
    name: 'Hero Section Visual',
    category: 'saas',
    type: 'image',
    icon: '💻',
    description: 'Modern hero section background for SaaS landing page',
    
    intentStructure: {
      description: `Create a modern, abstract hero section background for a SaaS landing page that conveys innovation, technology, and trust.

Visual concept: Abstract geometric shapes, flowing gradients, or subtle 3D elements that suggest connectivity, data flow, or digital transformation. Avoid literal representations - keep it conceptual and sophisticated.

Color palette: Modern tech palette - blues, purples, teals with subtle gradients. Can include accent colors like cyan or violet. Avoid harsh contrasts.

Lighting: Soft, diffused lighting with subtle glows. Create depth through layered transparency and shadows.

Composition: Asymmetric layout with clear focal points. Leave substantial negative space for text overlay (headline, subheadline, CTA). Consider the F-pattern reading flow.

Technical requirements:
- High resolution for retina displays
- Works well as background (won't compete with foreground content)
- Subtle animation potential (export as layered if possible)
- Looks professional across light/dark modes

Mood: Innovative, trustworthy, modern, sophisticated, forward-thinking`,
      
      format: '16:9',
      resolution: '2K',
      targetUsage: 'web'
    },
    
    geminiGuidance: {
      styleHints: [
        'Modern SaaS aesthetic',
        'Abstract and conceptual rather than literal',
        'Professional corporate design',
        'Tech-forward visual language',
        'Clean and uncluttered'
      ],
      compositionHints: [
        'Asymmetric but balanced layout',
        'Clear hierarchy and focal points',
        'Generous negative space for text',
        'Depth through layering',
        'F-pattern optimized'
      ],
      colorPaletteHints: [
        'Modern tech palette (blues, purples, teals)',
        'Subtle gradients for depth',
        'High contrast for accessibility',
        'Professional corporate colors'
      ],
      moodKeywords: [
        'innovative',
        'trustworthy',
        'modern',
        'sophisticated',
        'professional',
        'cutting-edge'
      ]
    },
    
    brandPlaceholders: {
      needsLogo: false,
      needsProductImage: false,
      needsBackgroundTexture: true,
      needsTypography: false
    },
    
    expectedOutput: {
      estimatedCost: 2,
      estimatedTime: 15,
      qualityLevel: 'premium'
    }
  },
  
  {
    id: 'saas-explainer-video',
    name: 'Product Explainer Video',
    category: 'saas',
    type: 'video',
    icon: '🎥',
    description: 'Animated explainer showcasing product features and benefits',
    
    intentStructure: {
      description: `Create an engaging product explainer video that clearly communicates how the SaaS product works and why it matters.

Story structure:
1. Problem statement (5s): Show the pain point your audience faces
2. Solution introduction (5s): Introduce your product as the answer
3. Feature walkthrough (40s): Demonstrate key features with visual examples
4. Results/Benefits (5s): Show the transformation and outcomes
5. Call-to-action (5s): Clear next step for viewer

Visual style: Clean, modern motion graphics. Use abstract representations and UI mockups rather than literal screenshots. Smooth transitions and animations.

Key principles:
- One message per scene
- Visual hierarchy guides attention
- Text is concise and reinforces narration
- Color coding for different concepts
- Consistent iconography

Technical specs:
- 60 seconds total duration
- 16:9 format for web
- Optimized for silent autoplay (text overlays)
- Brand colors prominently featured
- Professional voiceover sync points

Tone: Confident, helpful, clear. Avoid jargon - explain complex concepts simply.`,
      
      format: '16:9',
      resolution: '2K',
      targetUsage: 'web',
      
      videoType: 'explainer',
      targetDuration: 60,
      messageKey: 'Product simplifies complex workflows and delivers measurable results',
      callToAction: 'Start free trial',
      platforms: ['Website', 'YouTube', 'LinkedIn']
    },
    
    geminiGuidance: {
      styleHints: [
        'Clean motion graphics aesthetic',
        'Modern SaaS explainer style',
        'Abstract representations',
        'Professional animation quality'
      ],
      compositionHints: [
        'One clear message per scene',
        'Smooth scene transitions',
        'Visual hierarchy guides attention',
        'UI mockups integrated naturally',
        'Text overlays for key messages'
      ],
      colorPaletteHints: [
        'Brand colors as primary palette',
        'Contrasting accent colors',
        'Professional corporate aesthetic',
        'Consistent color coding throughout'
      ],
      moodKeywords: [
        'clear',
        'confident',
        'helpful',
        'professional',
        'trustworthy',
        'innovative'
      ]
    },
    
    brandPlaceholders: {
      needsLogo: true,
      needsProductImage: false,
      needsBackgroundTexture: false,
      needsTypography: true
    },
    
    expectedOutput: {
      estimatedCost: 40,
      estimatedTime: 180,
      qualityLevel: 'premium'
    }
  }
];

// ============================================
// REAL ESTATE TEMPLATES
// ============================================

export const REAL_ESTATE_TEMPLATES: EnterpriseTemplate[] = [
  {
    id: 'realestate-property-showcase',
    name: 'Property Showcase',
    category: 'real-estate',
    type: 'image',
    icon: '🏠',
    description: 'Professional architectural photography with golden hour lighting',
    
    intentStructure: {
      description: `Create professional architectural photography that showcases the property's best features with aspirational lifestyle appeal.

Lighting: Golden hour lighting (warm, soft, directional). Long shadows create drama and depth. Windows glow warmly from interior lighting.

Composition: Wide-angle perspective that shows scale and space. Leading lines draw eye through the image. Symmetry where appropriate for modern architecture.

Atmosphere: Welcoming, luxurious, livable. Property looks inviting and well-maintained. Subtle staging elements (furniture, plants) add warmth without cluttering.

Key features to highlight:
- Architectural design elements
- Natural light and windows
- Outdoor spaces (if applicable)
- Quality finishes and materials
- Sense of space and flow

Technical excellence:
- Perfect exposure with HDR-like detail
- Straight vertical lines (no distortion)
- Sharp focus throughout
- Professional color grading

Mood: Aspirational, luxurious, welcoming, dream-home quality`,
      
      format: '4:3',
      resolution: '2K',
      targetUsage: 'web'
    },
    
    geminiGuidance: {
      styleHints: [
        'Professional architectural photography',
        'Golden hour natural lighting',
        'HDR-style exposure',
        'Real estate marketing quality'
      ],
      compositionHints: [
        'Wide-angle perspective',
        'Straight vertical lines',
        'Leading lines create flow',
        'Symmetry for modern architecture',
        'Balanced foreground/background'
      ],
      colorPaletteHints: [
        'Warm golden hour tones',
        'Natural wood and stone colors',
        'Subtle saturation boost',
        'Professional color grading'
      ],
      moodKeywords: [
        'aspirational',
        'luxurious',
        'welcoming',
        'spacious',
        'prestigious',
        'dream-home'
      ]
    },
    
    brandPlaceholders: {
      needsLogo: true, // Agency logo
      needsProductImage: true, // Property photos
      needsBackgroundTexture: false,
      needsTypography: false
    },
    
    expectedOutput: {
      estimatedCost: 2,
      estimatedTime: 15,
      qualityLevel: 'premium'
    }
  },
  
  {
    id: 'realestate-virtual-tour-video',
    name: 'Virtual Property Tour',
    category: 'real-estate',
    type: 'video',
    icon: '🎬',
    description: 'Cinematic video walkthrough of property',
    
    intentStructure: {
      description: `Create a cinematic virtual property tour that takes viewers through the home in a smooth, engaging way.

Tour flow:
1. Exterior establishing shot (5s) - Show curb appeal and architecture
2. Entry/foyer (3s) - First impressions, welcoming entrance
3. Living spaces (10s) - Main living room, dining area, flow
4. Kitchen (7s) - Features, finishes, functionality
5. Bedrooms (7s) - Space, natural light, comfort
6. Bathrooms (5s) - Luxury finishes, spa-like features
7. Special features (8s) - Pool, view, unique selling points
8. Closing (5s) - Property details, agent contact

Camera work: Smooth gimbal movements - dolly, pan, glide. No shaky handheld. Slow enough to appreciate details, dynamic enough to maintain interest.

Lighting: Natural light maximized. Interior lights on. Golden hour for exterior shots if possible.

Music: Elegant, uplifting instrumental. Not distracting from visuals.

Text overlays: Property address, key stats (bedrooms, bathrooms, sqft), price, agent info

Pacing: Steady, elegant, confident. Let beautiful spaces speak for themselves.`,
      
      format: '16:9',
      resolution: '2K',
      targetUsage: 'web',
      
      videoType: 'commercial',
      targetDuration: 60,
      messageKey: 'This is your dream home',
      callToAction: 'Schedule showing',
      platforms: ['Website', 'YouTube', 'Facebook', 'Instagram']
    },
    
    geminiGuidance: {
      styleHints: [
        'Cinematic real estate videography',
        'Smooth professional camera work',
        'Luxury property marketing',
        'High-end production quality'
      ],
      compositionHints: [
        'Smooth gimbal movements',
        'Reveal techniques build anticipation',
        'Wide shots show space',
        'Detail shots highlight features',
        'Logical flow room to room'
      ],
      colorPaletteHints: [
        'Natural warm lighting',
        'Subtle color grading',
        'Bright and airy aesthetic',
        'Professional real estate look'
      ],
      moodKeywords: [
        'luxurious',
        'spacious',
        'elegant',
        'prestigious',
        'dream-home',
        'aspirational'
      ]
    },
    
    brandPlaceholders: {
      needsLogo: true,
      needsProductImage: true,
      needsBackgroundTexture: false,
      needsTypography: true // For property details overlay
    },
    
    expectedOutput: {
      estimatedCost: 40,
      estimatedTime: 180,
      qualityLevel: 'premium'
    }
  }
];

// ============================================
// FASHION TEMPLATES
// ============================================

export const FASHION_TEMPLATES: EnterpriseTemplate[] = [
  {
    id: 'fashion-editorial',
    name: 'Editorial Fashion Shoot',
    category: 'fashion',
    type: 'image',
    icon: '👗',
    description: 'High-fashion editorial photography with dramatic styling',
    
    intentStructure: {
      description: `Create a high-fashion editorial photograph that showcases the clothing/accessories with artistic vision and commercial appeal.

Concept: [Define specific concept - minimalist, avant-garde, street style, haute couture, etc.]

Model & Pose: Dynamic pose that shows garment construction and movement. Confident, editorial energy. Face can show emotion or be mysterious/artistic.

Styling: Complete look including clothing, accessories, hair, makeup. Everything cohesive and intentional. Styling supports but doesn't overshadow the featured pieces.

Background/Location: [Studio with seamless backdrop OR Location shoot - specify urban, nature, architectural, etc.] Background complements but doesn't compete with fashion.

Lighting: Dramatic fashion lighting - hard light with defined shadows OR soft diffused beauty lighting OR natural window light. Match lighting to concept.

Color story: [Monochromatic, complementary colors, bold contrasts, or muted tones - specify based on collection]

Technical specs:
- Sharp focus on garment details
- Texture and fabric visible
- Professional retouching
- Magazine-quality composition

Mood: [Choose: Bold & powerful, Dreamy & romantic, Edgy & urban, Minimal & refined, etc.]`,
      
      format: '2:3',
      resolution: '2K',
      targetUsage: 'advertising'
    },
    
    geminiGuidance: {
      styleHints: [
        'High-fashion editorial aesthetic',
        'Professional fashion photography',
        'Magazine-quality production',
        'Artistic yet commercial'
      ],
      compositionHints: [
        'Dynamic pose shows garment movement',
        'Rule of thirds or centered symmetry',
        'Negative space creates impact',
        'Leading lines guide attention',
        'Fashion photography conventions'
      ],
      colorPaletteHints: [
        'Cohesive color story',
        'Professional color grading',
        'Fashion-forward palette',
        'Garment colors are hero'
      ],
      moodKeywords: [
        'editorial',
        'high-fashion',
        'artistic',
        'confident',
        'striking',
        'sophisticated'
      ]
    },
    
    brandPlaceholders: {
      needsLogo: false,
      needsProductImage: true, // Garment/model reference
      needsBackgroundTexture: false,
      needsTypography: false
    },
    
    expectedOutput: {
      estimatedCost: 2,
      estimatedTime: 15,
      qualityLevel: 'premium'
    }
  }
];

// ============================================
// FOOD & BEVERAGE TEMPLATES
// ============================================

export const FOOD_BEVERAGE_TEMPLATES: EnterpriseTemplate[] = [
  {
    id: 'food-hero-shot',
    name: 'Food Hero Shot',
    category: 'food-beverage',
    type: 'image',
    icon: '🍔',
    description: 'Mouth-watering food photography with perfect styling',
    
    intentStructure: {
      description: `Create professional food photography that makes the dish look absolutely irresistible.

Hero dish: [Specify the food/drink item]

Styling: Food is hero - perfectly styled, fresh, appetizing. Steam visible if hot food. Condensation on cold drinks. Garnishes enhance but don't overwhelm.

Lighting: Soft natural window light from 45° angle. Subtle fill light to control shadows. Backlight creates appealing glow and highlights texture.

Composition: 45° or overhead angle (choose based on dish). Shallow depth of field focuses on hero element. Props support story but don't clutter.

Props & context: Complementary dishes, ingredients, utensils, surfaces create story. Everything contributes to appetite appeal and brand story.

Color palette: Rich, saturated colors that look natural and appetizing. Warm tones for comfort food, fresh bright tones for healthy food.

Technical excellence:
- Tack-sharp focus on hero element
- Texture visible (crispy, juicy, creamy, etc.)
- Perfect white balance
- Professional food styling

Mood: Irresistible, crave-worthy, fresh, delicious`,
      
      format: '1:1',
      resolution: '2K',
      targetUsage: 'social'
    },
    
    geminiGuidance: {
      styleHints: [
        'Professional food photography',
        'Restaurant/commercial quality',
        'Appetite appeal paramount',
        'Natural but enhanced beauty'
      ],
      compositionHints: [
        '45° or overhead angle',
        'Shallow depth of field',
        'Hero element in focus',
        'Props create context without clutter',
        'Negative space for text'
      ],
      colorPaletteHints: [
        'Rich, saturated but natural colors',
        'Warm tones for comfort food',
        'Fresh bright tones for healthy food',
        'Brand colors in props/background'
      ],
      moodKeywords: [
        'irresistible',
        'mouth-watering',
        'fresh',
        'delicious',
        'crave-worthy',
        'appetizing'
      ]
    },
    
    brandPlaceholders: {
      needsLogo: false,
      needsProductImage: true, // Food/dish reference
      needsBackgroundTexture: true, // Surface texture important
      needsTypography: false
    },
    
    expectedOutput: {
      estimatedCost: 2,
      estimatedTime: 15,
      qualityLevel: 'premium'
    }
  }
];

// ============================================
// TEMPLATE REGISTRY
// ============================================

export const ALL_ENTERPRISE_TEMPLATES: EnterpriseTemplate[] = [
  ...ECOMMERCE_TEMPLATES,
  ...SAAS_TEMPLATES,
  ...REAL_ESTATE_TEMPLATES,
  ...FASHION_TEMPLATES,
  ...FOOD_BEVERAGE_TEMPLATES,
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getTemplatesByCategory = (category: TemplateCategory): EnterpriseTemplate[] => {
  return ALL_ENTERPRISE_TEMPLATES.filter(t => t.category === category);
};

export const getTemplatesByType = (type: TemplateType): EnterpriseTemplate[] => {
  return ALL_ENTERPRISE_TEMPLATES.filter(t => t.type === type);
};

export const getTemplateById = (id: string): EnterpriseTemplate | undefined => {
  return ALL_ENTERPRISE_TEMPLATES.find(t => t.id === id);
};

/**
 * Convert enterprise template to IntentData for pre-filling IntentInputPremium
 */
export const templateToIntentData = (template: EnterpriseTemplate): Partial<IntentData> => {
  return {
    description: template.intentStructure.description,
    format: template.intentStructure.format,
    resolution: template.intentStructure.resolution,
    targetUsage: template.intentStructure.targetUsage,
    videoType: template.intentStructure.videoType,
    targetDuration: template.intentStructure.targetDuration,
    messageKey: template.intentStructure.messageKey,
    callToAction: template.intentStructure.callToAction,
    platforms: template.intentStructure.platforms,
    references: {
      images: [],
      videos: []
    }
  };
};
