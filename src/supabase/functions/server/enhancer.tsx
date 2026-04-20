// enhancer.tsx - Prompt enhancement using Pollinations nova-micro
// Cortexia Intelligence v4 — SCALE Framework (Shot → Character → Action → Lighting & Location → Extra)

const POLLINATIONS_API_KEY = Deno.env.get('POLLINATIONS_API_KEY');

// ============================================================================
// SCALE FRAMEWORK — Category Detection & Templates
// ============================================================================

type EnhancementCategory = 'portrait' | 'product' | 'landscape' | 'abstract' | 'food' | 'architecture' | 'general';

const CATEGORY_KEYWORDS: Record<EnhancementCategory, string[]> = {
  portrait: ['portrait', 'headshot', 'face', 'person', 'people', 'man', 'woman', 'child', 'selfie', 'model', 'photo of me'],
  product: ['product', 'bottle', 'phone', 'shoe', 'watch', 'bag', 'laptop', 'device', 'package', 'brand', 'logo', 'advertisement', 'poster', 'ad'],
  landscape: ['landscape', 'mountain', 'beach', 'ocean', 'sunset', 'sunrise', 'forest', 'river', 'sky', 'nature', 'scenery'],
  abstract: ['abstract', 'geometric', 'pattern', 'texture', 'gradient', 'art', 'digital art', 'illustration'],
  food: ['food', 'dish', 'meal', 'cake', 'coffee', 'drink', 'restaurant', 'plate', 'culinary', 'dessert', 'pizza'],
  architecture: ['building', 'house', 'interior', 'exterior', 'room', 'office', 'kitchen', 'bathroom', 'architecture'],
  general: [],
};

function detectCategory(prompt: string): EnhancementCategory {
  const lower = prompt.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'general') continue;
    if (keywords.some(kw => lower.includes(kw))) return category as EnhancementCategory;
  }
  return 'general';
}

const CATEGORY_TEMPLATES: Record<EnhancementCategory, { shot: string; action: string; lighting: string; location: string; extra: string }> = {
  portrait: {
    shot: 'Medium close-up, 85mm portrait lens, f/2.8 for shallow depth of field, eye-level angle',
    action: 'natural expression, relaxed posture, genuine emotion',
    lighting: 'Soft diffused studio lighting, three-point setup with key light at 45°, subtle fill, rim light for hair separation',
    location: 'Clean neutral background with subtle gradient, no distractions',
    extra: 'Natural skin tones, no over-smoothing, professional photography quality, sharp focus on eyes, editorial portrait style',
  },
  product: {
    shot: 'Product photography, 50mm lens, f/8 for full product sharpness, slight high angle',
    action: 'Prominently displayed, hero positioning following rule of thirds',
    lighting: 'Three-point softbox setup, clean gradient background, subtle reflections on glossy surfaces, accent light for edge definition',
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
// SYSTEM PROMPT — SCALE Framework
// ============================================================================

function buildScaleSystemPrompt(category: EnhancementCategory): string {
  const t = CATEGORY_TEMPLATES[category];
  return `You are Cortexia Intelligence v4, an expert AI image prompt optimizer using the SCALE framework.

SCALE Framework:
- Shot: Camera type, lens, angle, framing
- Character: Subject description, appearance, details
- Action: What the subject is doing, pose, expression
- Lighting & Location: Lighting setup + environment
- Extra: Style, color grading, film stock, quality markers

Rules:
1. Return ONLY the optimized prompt, nothing else
2. NO explanations, NO reasoning, NO meta-commentary
3. Preserve the core subject and intent — do NOT change what the user wants
4. Apply SCALE to add missing dimensions
5. Use natural flowing language, NOT comma-separated keywords
6. Keep it under 200 words
7. Be specific — replace vague terms with concrete visual descriptions

Category template for "${category}":
- Shot: ${t.shot}
- Action: ${t.action}
- Lighting: ${t.lighting}
- Location: ${t.location}
- Extra: ${t.extra}

Adapt these to the user's specific prompt. Return ONLY the enhanced prompt.`;
}

// ============================================================================
// ENHANCEMENT FUNCTIONS
// ============================================================================

export interface EnhancePromptOptions {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface EnhancePromptResult {
  success: boolean;
  enhancedPrompt?: string;
  originalPrompt: string;
  error?: string;
  tokensUsed?: number;
  category?: EnhancementCategory;
}

/**
 * Determine if a model should use prompt enhancement.
 * Premium models (flux-2-pro, imagen-4) don't need enhancement.
 */
export function shouldEnhancePrompt(model: string): boolean {
  const premiumModels = ['flux-2-pro', 'imagen-4'];
  return !premiumModels.includes(model);
}

/**
 * Detect the category of a prompt for template-based enhancement.
 */
export function detectPromptCategory(prompt: string): EnhancementCategory {
  return detectCategory(prompt);
}

/**
 * Enhance a prompt using Pollinations nova-micro with SCALE framework.
 */
export async function enhancePrompt(
  prompt: string,
  model: string = 'seedream',
  options: Partial<EnhancePromptOptions> = {}
): Promise<EnhancePromptResult> {
  // Skip enhancement if not needed
  if (!shouldEnhancePrompt(model)) {
    console.log(`⏭️  Skipping enhancement for premium model: ${model}`);
    return { success: true, originalPrompt: prompt, enhancedPrompt: prompt };
  }
  
  // Skip if prompt is already detailed (>150 chars)
  if (prompt.length > 150) {
    console.log(`⏭️  Skipping enhancement, prompt already detailed (${prompt.length} chars)`);
    return { success: true, originalPrompt: prompt, enhancedPrompt: prompt };
  }
  
  if (!POLLINATIONS_API_KEY) {
    console.warn('⚠️ POLLINATIONS_API_KEY not set, skipping enhancement');
    return { success: true, originalPrompt: prompt, enhancedPrompt: prompt, error: 'API key not configured' };
  }
  
  try {
    const category = detectCategory(prompt);
    console.log(`✨ Enhancing prompt [${category}] with SCALE framework via Pollinations: "${prompt.substring(0, 50)}..."`);
    
    const systemPrompt = buildScaleSystemPrompt(category).replace(/\n/g, ' ').trim();
    const baseUrl = 'https://enter.pollinations.ai/api/generate/text';
    
    const encodedPrompt = encodeURIComponent(prompt);
    const encodedSystem = encodeURIComponent(systemPrompt);
    
    const url = `${baseUrl}/${encodedPrompt}?system=${encodedSystem}&private=true&model=nova-micro`;
    
    console.log(`🔗 Pollinations URL (nova-micro): ${url.substring(0, 150)}...`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${POLLINATIONS_API_KEY}` }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Pollinations API error (${response.status}):`, errorText);
      return { success: false, originalPrompt: prompt, enhancedPrompt: prompt, error: `API error: ${response.status}` };
    }
    
    const enhancedPrompt = (await response.text()).trim();
    
    console.log(`🔍 Raw response: "${enhancedPrompt.substring(0, 100)}..." (${enhancedPrompt.length} chars)`);
    
    // Validation: check if enhanced is meaningful
    if (!enhancedPrompt || enhancedPrompt.length < 20) {
      console.warn(`⚠️ Enhancement produced invalid result (${enhancedPrompt.length} chars), using original`);
      return { success: true, originalPrompt: prompt, enhancedPrompt: prompt };
    }
    
    // If enhanced is significantly shorter (>50% reduction), probably an error
    const lengthDiff = enhancedPrompt.length - prompt.length;
    if (lengthDiff < 0 && Math.abs(lengthDiff) > prompt.length * 0.5) {
      console.warn('⚠️ Enhancement significantly shortened prompt, using original');
      return { success: true, originalPrompt: prompt, enhancedPrompt: prompt };
    }
    
    console.log(`✅ Enhanced [${category}] (${enhancedPrompt.length} chars): "${enhancedPrompt.substring(0, 100)}..."`);
    console.log(`📊 Length change: ${lengthDiff > 0 ? '+' : ''}${lengthDiff} chars (${((lengthDiff / prompt.length) * 100).toFixed(1)}%)`);
    
    return {
      success: true,
      originalPrompt: prompt,
      enhancedPrompt,
      tokensUsed: Math.ceil(enhancedPrompt.length / 4),
      category,
    };
    
  } catch (error) {
    console.error('❌ Prompt enhancement failed:', error);
    return {
      success: false,
      originalPrompt: prompt,
      enhancedPrompt: prompt,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch enhance multiple prompts
 */
export async function enhancePrompts(
  prompts: string[],
  model: string = 'seedream'
): Promise<EnhancePromptResult[]> {
  return Promise.all(prompts.map(prompt => enhancePrompt(prompt, model)));
}

/**
 * Get enhancement status for a model
 */
export function getEnhancementInfo(model: string): { shouldEnhance: boolean; reason: string } {
  const premiumModels = ['flux-2-pro', 'imagen-4'];
  if (premiumModels.includes(model)) {
    return { shouldEnhance: false, reason: 'Premium model produces excellent results without enhancement' };
  }
  return { shouldEnhance: true, reason: 'Enhancement improves quality for standard models' };
}
