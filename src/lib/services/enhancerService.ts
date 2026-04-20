/**
 * Cortexia Intelligence v4 — Prompt Enhancement Service
 * 
 * Uses the SCALE framework (Shot → Character → Action → Lighting & Location → Extra)
 * from Kling 3.0 / Veo 3.1 / FLUX.2 / Nano Banana official prompting guides.
 * 
 * Architecture:
 * 1. Detect category (portrait, product, landscape, abstract, food, architecture)
 * 2. Apply SCALE framework to build structured enhancement
 * 3. Inject cinematography, lighting, color grading, and style modifiers
 * 4. Return enhanced prompt optimized for the target model
 */

import type { ModelName } from '../types/studio';

// ============================================================================
// CONFIGURATION
// ============================================================================

const ENHANCER_MODEL = 'ServiceNow/Apriel-1.5-15B';
const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';

const MODELS_NEEDING_ENHANCEMENT: ModelName[] = [
  'seedream',
  'kontext',
  'nanobanana',
  'flux-schnell'
];

// ============================================================================
// SCALE FRAMEWORK — Core Enhancement Structure
// ============================================================================

/**
 * SCALE framework for prompt enhancement.
 * Based on Kling 3.0 official guide:
 * Shot (camera type + movement) → Character (subject + appearance) →
 * Action (motion timeline) → Lighting & Location (light + environment) →
 * Extra (audio / style / tech specs)
 */
export interface ScalePrompt {
  shot: string;          // Camera angle, lens, framing, movement
  character: string;     // Subject description, appearance, details
  action: string;        // What the subject is doing, pose, expression
  lighting: string;      // Lighting setup, quality, direction, color temperature
  location: string;      // Environment, background, setting
  extra: string;         // Style, color grading, film stock, quality markers
}

/**
 * Category detection for template-based enhancement.
 */
export type EnhancementCategory =
  | 'portrait'
  | 'product'
  | 'landscape'
  | 'abstract'
  | 'food'
  | 'architecture'
  | 'general';

// ============================================================================
// CATEGORY DETECTION
// ============================================================================

const CATEGORY_KEYWORDS: Record<EnhancementCategory, string[]> = {
  portrait: ['portrait', 'headshot', 'face', 'person', 'people', 'man', 'woman', 'child', 'selfie', 'model', 'photo of me', 'my photo'],
  product: ['product', 'bottle', 'phone', 'shoe', 'watch', 'bag', 'laptop', 'device', 'package', 'brand', 'logo', 'advertisement', 'poster', 'ad'],
  landscape: ['landscape', 'mountain', 'beach', 'ocean', 'sunset', 'sunrise', 'forest', 'river', 'sky', 'nature', 'scenery', 'view'],
  abstract: ['abstract', 'geometric', 'pattern', 'texture', 'gradient', 'art', 'digital art', 'illustration', 'conceptual'],
  food: ['food', 'dish', 'meal', 'cake', 'coffee', 'drink', 'restaurant', 'plate', 'culinary', 'recipe', 'dessert', 'pizza', 'burger'],
  architecture: ['building', 'house', 'interior', 'exterior', 'room', 'office', 'kitchen', 'bathroom', 'modern home', 'architecture'],
  general: [],
};

function detectCategory(prompt: string): EnhancementCategory {
  const lower = prompt.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'general') continue;
    if (keywords.some(kw => lower.includes(kw))) {
      return category as EnhancementCategory;
    }
  }
  return 'general';
}

// ============================================================================
// CATEGORY TEMPLATES — SCALE-based Enhancement
// ============================================================================

const CATEGORY_TEMPLATES: Record<EnhancementCategory, Partial<ScalePrompt>> = {
  portrait: {
    shot: 'Medium close-up, 85mm portrait lens, f/2.8 for shallow depth of field, eye-level angle',
    action: 'natural expression, relaxed posture, genuine emotion',
    lighting: 'Soft diffused studio lighting, three-point setup with key light at 45°, subtle fill light, rim light for hair separation',
    location: 'Clean neutral background with subtle gradient, no distractions',
    extra: 'Natural skin tones, no over-smoothing, professional photography quality, sharp focus on eyes, editorial portrait style',
  },
  product: {
    shot: 'Product photography, 50mm lens, f/8 for full product sharpness, slight high angle',
    action: 'Prominently displayed, hero positioning following rule of thirds',
    lighting: 'Three-point softbox setup, clean white or gradient background, subtle reflections on glossy surfaces, accent light for edge definition',
    location: 'Studio environment with polished surface or lifestyle context',
    extra: 'Commercial product photography, ultra-sharp details, brand-quality aesthetic, color-accurate rendering, premium advertising style',
  },
  landscape: {
    shot: 'Wide-angle shot, 24mm lens, f/11 for deep focus, low angle for dramatic sky',
    action: 'Natural elements in motion — clouds drifting, water flowing, light shifting',
    lighting: 'Golden hour or blue hour, warm directional light, long shadows, atmospheric haze for depth',
    location: 'Expansive natural setting with foreground interest, midground subject, and distant background layers',
    extra: 'Landscape photography, rich color grading, HDR toning, fine art print quality, National Geographic aesthetic',
  },
  abstract: {
    shot: 'Macro or wide composition depending on scale, centered or golden ratio framing',
    action: 'Dynamic interplay of shapes, colors, and textures creating visual tension',
    lighting: 'Dramatic directional lighting with strong contrast, colored gels or gradient illumination',
    location: 'Minimal or gradient background to let the abstract elements dominate',
    extra: 'Contemporary digital art, gallery-quality composition, vibrant color palette, modern aesthetic, Behance featured style',
  },
  food: {
    shot: 'Overhead 45° angle or close-up, 50mm lens, f/4 for selective focus on hero element',
    action: 'Food styled with natural imperfections — steam rising, sauce dripping, garnish placed',
    lighting: 'Natural window light from side, soft fill with white card, warm color temperature (3200K), specular highlights on glossy surfaces',
    location: 'Rustic wooden table, marble surface, or styled kitchen counter with complementary props',
    extra: 'Food photography, appetizing color grading, shallow depth of field, editorial food magazine style, Saveur aesthetic',
  },
  architecture: {
    shot: 'Wide-angle or tilt-shift lens, straight verticals, eye-level or low angle for grandeur',
    action: 'Space presented in its best light — clean lines, intentional negative space, human scale reference',
    lighting: 'Natural daylight with warm interior accents, balanced exposure between highlights and shadows, golden hour exterior',
    location: 'Interior or exterior space with architectural details emphasized, clean composition',
    extra: 'Architectural photography, perspective-corrected, clean lines, ArchDaily featured style, professional real estate quality',
  },
  general: {
    shot: 'Well-composed shot, appropriate focal length for the subject, balanced framing',
    action: 'Subject presented in its most compelling form',
    lighting: 'Professional lighting setup appropriate to the scene, balanced exposure',
    location: 'Contextually appropriate environment with visual depth',
    extra: 'High quality, professional photography, sharp focus, natural colors',
  },
};

// ============================================================================
// CINEMATOGRAPHY & STYLE MODIFIERS
// ============================================================================

const CAMERA_ANGLES = [
  'eye-level', 'low angle', 'high angle', "bird's eye view", 'dutch angle',
  'over-the-shoulder', 'POV', 'worm-eye view', 'three-quarter view',
];

const LENS_TYPES = [
  '14mm ultra-wide', '24mm wide-angle', '35mm standard wide', '50mm standard',
  '85mm portrait', '100mm macro', '135mm telephoto', '200mm telephoto',
];

const LIGHTING_SETUPS = [
  'three-point softbox setup',
  'golden hour backlight with rim light',
  'dramatic chiaroscuro with harsh shadows',
  'soft diffused window light',
  'neon-lit with colored gels',
  'volumetric light rays through atmosphere',
  'studio beauty dish with subtle fill',
  'natural overcast soft light',
  'warm practical lights with cool ambient',
];

const COLOR_GRADING = [
  'warm ivory tones with teal shadows',
  'cinematic color grading with muted tones',
  'Kodak Portra 400 film emulation',
  'Fuji Pro 400H pastel aesthetic',
  'high contrast black and white',
  'vibrant saturated colors',
  'desaturated moody palette',
  'warm amber and deep charcoal',
];

const FILM_STOCKS = [
  'shot on Kodak Portra 400, natural grain',
  'shot on Fujifilm Pro 400H, soft pastel tones',
  'shot on Ilford HP5, classic black and white',
  'shot on Cinestill 800T, cinematic halation',
  'shot on Polaroid 600, vintage instant aesthetic',
  'shot on ARRI Alexa 65, digital cinema quality',
  'shot on Sony A7IV, clean modern digital',
];

const QUALITY_MARKERS = [
  'ultra-detailed, sharp focus, professional quality',
  'award-winning photography, 8K resolution',
  'editorial quality, magazine-ready',
  'fine art print quality, gallery standard',
  'commercial advertising quality, brand-ready',
];

// ============================================================================
// SYSTEM PROMPT — SCALE Framework
// ============================================================================

function buildScaleSystemPrompt(category: EnhancementCategory): string {
  const template = CATEGORY_TEMPLATES[category];
  
  return `You are Cortexia Intelligence v4, an expert prompt enhancement AI using the SCALE framework.

SCALE Framework:
- **S**hot: Camera type, lens, angle, framing, movement
- **C**haracter: Subject description, appearance, details
- **A**ction: What the subject is doing, pose, expression
- **L**ighting & Location: Lighting setup + environment
- **E**xtra: Style, color grading, film stock, quality markers

Your task: Transform short user prompts into detailed, professional-grade image generation prompts.

Rules:
1. Preserve the core subject and intent — do NOT change what the user wants
2. Apply the SCALE framework to add missing dimensions
3. Use natural flowing language, NOT comma-separated keywords
4. Keep it under 200 words
5. Be specific — replace vague terms with concrete visual descriptions
6. For text rendering: use quotes around text, specify font style and placement

Category template for "${category}":
- Shot: ${template.shot}
- Action: ${template.action}
- Lighting: ${template.lighting}
- Location: ${template.location}
- Extra: ${template.extra}

Adapt these to the user's specific prompt. Return ONLY the enhanced prompt.`;
}

// ============================================================================
// ENHANCEMENT FUNCTIONS
// ============================================================================

export function needsEnhancement(model: ModelName): boolean {
  return MODELS_NEEDING_ENHANCEMENT.includes(model);
}

/**
 * Detect the category of a prompt for template-based enhancement.
 */
export function detectPromptCategory(prompt: string): EnhancementCategory {
  return detectCategory(prompt);
}

/**
 * Build a SCALE-structured prompt from components.
 */
export function buildScalePrompt(components: Partial<ScalePrompt>): string {
  const parts = [
    components.shot,
    components.character,
    components.action,
    components.lighting,
    components.location,
    components.extra,
  ].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Get random style modifiers for variety.
 */
export function getRandomStyleModifiers(): { camera: string; lens: string; lighting: string; grading: string; film: string; quality: string } {
  return {
    camera: CAMERA_ANGLES[Math.floor(Math.random() * CAMERA_ANGLES.length)],
    lens: LENS_TYPES[Math.floor(Math.random() * LENS_TYPES.length)],
    lighting: LIGHTING_SETUPS[Math.floor(Math.random() * LIGHTING_SETUPS.length)],
    grading: COLOR_GRADING[Math.floor(Math.random() * COLOR_GRADING.length)],
    film: FILM_STOCKS[Math.floor(Math.random() * FILM_STOCKS.length)],
    quality: QUALITY_MARKERS[Math.floor(Math.random() * QUALITY_MARKERS.length)],
  };
}

/**
 * Enhance a prompt using Together AI with SCALE framework.
 */
export async function enhancePrompt(
  prompt: string,
  context?: {
    imageCount?: number;
    generationType?: 'text-to-image' | 'image-to-image' | 'multi-image';
  }
): Promise<{ enhanced: string; original: string; success: boolean; error?: string }> {
  try {
    if (!prompt || prompt.trim().length === 0) {
      return { enhanced: '', original: prompt, success: false, error: 'Empty prompt' };
    }

    // Skip if already detailed
    if (prompt.length > 200) {
      return { enhanced: prompt, original: prompt, success: true };
    }

    const category = detectCategory(prompt);
    const systemPrompt = buildScaleSystemPrompt(category);

    let userPrompt = prompt;
    if (context?.imageCount && context.imageCount > 0) {
      if (context.generationType === 'image-to-image') {
        userPrompt = `[Context: Enhancing/transforming ${context.imageCount} image(s)]\n${prompt}`;
      } else if (context.generationType === 'multi-image') {
        userPrompt = `[Context: Fusing ${context.imageCount} images together]\n${prompt}`;
      }
    }

    const apiKey = import.meta.env.VITE_TOGETHER_API_KEY;
    if (!apiKey) {
      console.warn('Together AI API key not configured, skipping enhancement');
      return { enhanced: prompt, original: prompt, success: false, error: 'API key not configured' };
    }

    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ENHANCER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 400,
        temperature: 0.7,
        top_p: 0.9,
        stop: ['\n\n', 'Input:', 'Output:'],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Together AI API error:', errorData);
      return { enhanced: prompt, original: prompt, success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    const enhancedPrompt = data.choices?.[0]?.message?.content?.trim();

    if (!enhancedPrompt) {
      return { enhanced: prompt, original: prompt, success: false, error: 'Empty response from API' };
    }

    return { enhanced: enhancedPrompt, original: prompt, success: true };
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    return { enhanced: prompt, original: prompt, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function enhancePromptWithRetry(
  prompt: string,
  context?: { imageCount?: number; generationType?: 'text-to-image' | 'image-to-image' | 'multi-image' },
  maxRetries = 2
): Promise<{ enhanced: string; original: string; success: boolean; error?: string }> {
  let lastError: string | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await enhancePrompt(prompt, context);
    if (result.success) return result;
    lastError = result.error;
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  return { enhanced: prompt, original: prompt, success: false, error: lastError || 'Max retries exceeded' };
}

export async function enhancePromptBatch(
  prompts: string[],
  context?: { imageCount?: number; generationType?: 'text-to-image' | 'image-to-image' | 'multi-image' }
): Promise<Array<{ enhanced: string; original: string; success: boolean; error?: string }>> {
  return Promise.all(prompts.map(prompt => enhancePrompt(prompt, context)));
}

// ============================================================================
// ENHANCEMENT EXAMPLES — SCALE Framework
// ============================================================================

export function getEnhancementExamples(): Array<{ input: string; output: string; category: EnhancementCategory }> {
  return [
    {
      input: 'sunset beach',
      output: 'Wide-angle shot at 24mm, f/11 for deep focus, low angle for dramatic sky. Expansive tropical shoreline at golden hour with wet sand reflecting amber and orange hues. Gentle waves lapping at the shore in rhythmic motion, silhouettes of distant palm trees swaying. Warm directional sunlight from the horizon casting long shadows, atmospheric haze adding depth. Kodak Portra 400 film emulation, rich color grading, fine art print quality, National Geographic aesthetic.',
      category: 'landscape',
    },
    {
      input: 'professional headshot',
      output: 'Medium close-up, 85mm portrait lens, f/2.8 for shallow depth of field, eye-level angle. Confident business professional in smart attire, natural skin tones with no over-smoothing. Relaxed posture with genuine expression, subtle smile, sharp focus on eyes. Soft diffused studio lighting, three-point setup with key light at 45°, subtle fill light, rim light for hair separation. Clean neutral background with subtle gradient. Professional photography quality, editorial portrait style.',
      category: 'portrait',
    },
    {
      input: 'luxury perfume bottle',
      output: 'Product photography, 50mm lens, f/8 for full product sharpness, slight high angle. Elegant glass perfume bottle with gold accents, hero positioning following rule of thirds, prominent display with subtle reflections on glossy surfaces. Three-point softbox setup, clean gradient background, accent light for edge definition on bottle facets. Studio environment with polished dark marble surface. Commercial product photography, ultra-sharp details, premium advertising quality, warm ivory tones with teal shadows.',
      category: 'product',
    },
    {
      input: 'modern kitchen',
      output: 'Wide-angle tilt-shift lens, straight verticals, eye-level angle for clean architectural perspective. Contemporary kitchen with minimalist cabinetry, clean lines, integrated appliances, marble island as focal point. Natural daylight from large windows balanced with warm interior pendant lights, golden hour exterior glow through glass. Spacious interior with foreground island, midground seating area, and distant garden view. Architectural photography, perspective-corrected, ArchDaily featured style, professional quality.',
      category: 'architecture',
    },
    {
      input: 'chocolate cake',
      output: 'Overhead 45° angle, 50mm lens, f/4 for selective focus on the cake surface. Rich triple-layer chocolate cake with glossy ganache dripping down the sides, fresh berries and mint garnish placed naturally, subtle imperfections for authenticity. Natural window light from the side, soft fill with white card, warm color temperature (3200K), specular highlights on the glossy ganache. Rustic wooden table with scattered cocoa powder and a vintage fork nearby. Food photography, appetizing color grading, editorial food magazine style.',
      category: 'food',
    },
  ];
}

export function estimateEnhancementTime(): number {
  return 2000;
}
