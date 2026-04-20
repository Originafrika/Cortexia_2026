// Prompt Enhancement Service v2 — SCALE Framework Integration
// Advanced style modifiers, prompt templates, magic enhance, and quality analysis

// ============================================================================
// TYPES
// ============================================================================

export interface EnhancedPrompt {
  original: string;
  enhanced: string;
  suggestions: string[];
  keywords: string[];
  category: string;
  scaleComponents: ScaleComponents;
}

export interface ScaleComponents {
  shot: string;
  character: string;
  action: string;
  lighting: string;
  location: string;
  extra: string;
}

export interface PromptQualityAnalysis {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  feedback: string[];
  improvements: string[];
  missingElements: string[];
}

// ============================================================================
// ADVANCED STYLE MODIFIERS
// ============================================================================

const STYLE_MODIFIERS = {
  realistic: {
    camera: ['shot on Sony A7IV, 85mm f/1.4', 'shot on Canon EOS R5, 50mm f/1.2', 'shot on Hasselblad X2D, 90mm f/2.5', 'shot on Nikon Z9, 105mm f/2.8'],
    lighting: ['golden hour backlight with rim light', 'soft diffused window light', 'three-point studio softbox setup', 'natural overcast light with subtle fill', 'dramatic chiaroscuro with high contrast'],
    quality: ['photorealistic, ultra-detailed, sharp focus', 'professional photography, 8K resolution', 'award-winning photography, fine detail', 'editorial quality, magazine-ready'],
    color: ['natural color grading, true-to-life tones', 'warm color temperature (5600K)', 'Kodak Portra 400 film emulation, natural grain', 'clean digital rendering, accurate white balance'],
  },
  cinematic: {
    camera: ['shot on ARRI Alexa 65, anamorphic lens', 'cinematic 2.39:1 aspect ratio, shallow depth of field', 'shot on RED V-Raptor, 35mm spherical lens', 'cinematic framing, lens flare, film grain'],
    lighting: ['volumetric light rays through atmosphere', 'practical lights with cool ambient fill', 'dramatic side lighting with deep shadows', 'neon-lit with colored gels, moody atmosphere'],
    quality: ['cinematic composition, film still quality', 'movie scene aesthetic, color graded', 'Hollywood production value, 4K cinema quality'],
    color: ['teal and orange color grading', 'desaturated moody palette with selective color', 'warm amber and deep charcoal tones', 'cinematic LUT emulation, filmic contrast'],
  },
  artistic: {
    camera: ['artistic composition, creative framing', 'painterly perspective, expressive angle', 'mixed media aesthetic, layered composition'],
    lighting: ['dramatic directional lighting with colored gels', 'soft ethereal glow, dreamlike illumination', 'high contrast with bold shadow shapes'],
    quality: ['gallery-quality fine art, museum standard', 'contemporary art aesthetic, exhibition ready', 'artistic interpretation, creative vision'],
    color: ['vibrant saturated palette, bold colors', 'muted earth tones with accent highlights', 'monochromatic with single accent color', 'watercolor wash aesthetic, soft blending'],
  },
  anime: {
    camera: ['anime key visual, cel-shaded rendering', 'studio animation quality, clean line art', 'manga cover art style, dynamic composition'],
    lighting: ['anime-style lighting with dramatic highlights', 'soft gradient sky backdrop, lens flare', 'backlit silhouette with rim glow'],
    quality: ['studio quality animation, detailed line art', 'key animation frame quality, vibrant colors', 'professional anime production value'],
    color: ['vibrant anime color palette, saturated tones', 'pastel anime aesthetic, soft gradients', 'high contrast anime style, bold colors'],
  },
  '3d': {
    camera: ['3D render, octane render engine, ray tracing', 'physically based rendering, path traced', 'cinema 4D quality, subsurface scattering'],
    lighting: ['studio HDRI lighting, global illumination', 'volumetric fog with god rays', 'multiple area lights with soft shadows'],
    quality: ['unreal engine 5 quality, nanite detail', 'high poly model with PBR materials', 'photorealistic 3D render, ray-traced reflections'],
    color: ['physically accurate color rendering', 'metallic and dielectric material contrast', 'emissive glow with bloom effect'],
  },
  cyberpunk: {
    camera: ['cyberpunk composition, neon-lit framing', 'wide-angle dystopian cityscape', 'low angle with towering structures'],
    lighting: ['neon signs reflecting on wet surfaces', 'holographic light pollution, colored fog', 'dark atmosphere with bright accent lights'],
    quality: ['blade runner aesthetic, dystopian atmosphere', 'high tech low life, cyberpunk 2077 style', 'futuristic cityscape, rain-slicked streets'],
    color: ['magenta and cyan neon palette', 'dark blues with electric accent colors', 'chromatic aberration, digital glitch aesthetic'],
  },
  vintage: {
    camera: ['shot on vintage film camera, 35mm', 'medium format analog photography', 'polaroid instant camera aesthetic'],
    lighting: ['warm tungsten lighting, soft shadows', 'natural window light with lens flare', 'golden hour with film halation'],
    quality: ['film grain texture, analog warmth', 'vintage color processing, faded tones', 'aged photograph aesthetic, nostalgic mood'],
    color: ['Kodak Gold 200 warm tones', 'Fuji Superia greenish shadows', 'faded polaroid color shift, light leaks', 'sepia-toned vintage aesthetic'],
  },
  minimalist: {
    camera: ['minimalist composition, centered subject', 'clean negative space, geometric framing', 'symmetrical balance, simple geometry'],
    lighting: ['even diffused lighting, no harsh shadows', 'single directional light with clean shadow', 'flat lighting for graphic quality'],
    quality: ['minimalist design, less is more', 'clean aesthetic, breathing room', 'Swiss design influence, grid-based composition'],
    color: ['monochromatic palette, single accent color', 'black and white with one color accent', 'muted tones with high contrast', 'pure white background, isolated subject'],
  },
};

// ============================================================================
// CATEGORY TEMPLATES WITH SCALE FRAMEWORK
// ============================================================================

const CATEGORY_TEMPLATES = [
  {
    category: 'portrait',
    keywords: ['portrait', 'face', 'person', 'people', 'man', 'woman', 'child', 'selfie', 'model', 'headshot', 'character'],
    scale: {
      shot: 'Medium close-up, 85mm portrait lens, f/2.8 for shallow depth of field',
      action: 'natural expression, relaxed posture, genuine emotion',
      lighting: 'Soft diffused studio lighting, three-point setup with key light at 45°',
      location: 'Clean neutral background with subtle gradient',
      extra: 'Natural skin tones, sharp focus on eyes, editorial portrait quality',
    },
  },
  {
    category: 'product',
    keywords: ['product', 'bottle', 'phone', 'shoe', 'watch', 'bag', 'laptop', 'device', 'package', 'brand', 'logo', 'advertisement', 'poster'],
    scale: {
      shot: 'Product photography, 50mm lens, f/8 for full sharpness, slight high angle',
      action: 'Hero positioning following rule of thirds, prominently displayed',
      lighting: 'Three-point softbox setup, accent light for edge definition',
      location: 'Studio environment with polished surface or lifestyle context',
      extra: 'Commercial quality, ultra-sharp details, brand-ready aesthetic',
    },
  },
  {
    category: 'landscape',
    keywords: ['landscape', 'mountain', 'beach', 'ocean', 'sunset', 'sunrise', 'forest', 'river', 'sky', 'nature', 'scenery', 'view'],
    scale: {
      shot: 'Wide-angle shot, 24mm lens, f/11 for deep focus, low angle',
      action: 'Natural elements in motion — clouds, water, light shifting',
      lighting: 'Golden hour, warm directional light, long shadows, atmospheric haze',
      location: 'Expansive setting with foreground, midground, and background layers',
      extra: 'Landscape photography, rich color grading, fine art print quality',
    },
  },
  {
    category: 'food',
    keywords: ['food', 'dish', 'meal', 'cake', 'coffee', 'drink', 'restaurant', 'plate', 'culinary', 'dessert', 'pizza', 'burger'],
    scale: {
      shot: 'Overhead 45° angle, 50mm lens, f/4 for selective focus',
      action: 'Styled with natural imperfections — steam, drips, garnish',
      lighting: 'Natural window light from side, warm color temperature (3200K)',
      location: 'Rustic wooden table or marble surface with complementary props',
      extra: 'Food photography, appetizing color grading, editorial magazine style',
    },
  },
  {
    category: 'architecture',
    keywords: ['building', 'house', 'interior', 'exterior', 'room', 'office', 'kitchen', 'bathroom', 'architecture', 'modern home'],
    scale: {
      shot: 'Wide-angle or tilt-shift lens, straight verticals, eye-level',
      action: 'Clean lines, intentional negative space, human scale reference',
      lighting: 'Natural daylight with warm interior accents, golden hour exterior',
      location: 'Space with architectural details emphasized, clean composition',
      extra: 'Architectural photography, perspective-corrected, ArchDaily style',
    },
  },
  {
    category: 'abstract',
    keywords: ['abstract', 'geometric', 'pattern', 'texture', 'gradient', 'art', 'digital art', 'illustration', 'conceptual'],
    scale: {
      shot: 'Macro or wide composition, centered or golden ratio framing',
      action: 'Dynamic interplay of shapes, colors, and textures',
      lighting: 'Dramatic directional lighting with strong contrast, colored gels',
      location: 'Minimal or gradient background to let elements dominate',
      extra: 'Contemporary digital art, gallery-quality, Behance featured style',
    },
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function detectCategory(prompt: string): string {
  const lower = prompt.toLowerCase();
  for (const template of CATEGORY_TEMPLATES) {
    if (template.keywords.some(kw => lower.includes(kw))) return template.category;
  }
  return 'general';
}

function getScaleForCategory(category: string): ScaleComponents {
  const template = CATEGORY_TEMPLATES.find(t => t.category === category);
  if (template) return template.scale;
  return {
    shot: 'Well-composed shot, appropriate focal length',
    character: 'Subject presented compellingly',
    action: 'Natural pose or state',
    lighting: 'Professional lighting setup',
    location: 'Contextually appropriate environment',
    extra: 'High quality, professional result',
  };
}

function hasQualityModifiers(prompt: string): boolean {
  const terms = ['detailed', 'high quality', '8k', '4k', 'professional', 'photorealistic', 'render', 'sharp', 'hd', 'ultra', 'award-winning', 'editorial'];
  const lower = prompt.toLowerCase();
  return terms.some(term => lower.includes(term));
}

function extractKeywords(prompt: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'that', 'this', 'which', 'their', 'there', 'they', 'will', 'would', 'could', 'should']);
  return prompt.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(word => word.length > 2 && !stopWords.has(word)).slice(0, 10);
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class PromptEnhancementService {
  
  enhancePrompt(prompt: string, style: string = 'realistic'): EnhancedPrompt {
    const original = prompt.trim();
    if (!original) {
      return { original: '', enhanced: '', suggestions: [], keywords: [], category: 'general', scaleComponents: getScaleForCategory('general') };
    }

    const category = detectCategory(original);
    const scale = getScaleForCategory(category);
    const modifiers = STYLE_MODIFIERS[style as keyof typeof STYLE_MODIFIERS] || STYLE_MODIFIERS.realistic;

    let enhanced = original;

    if (!hasQualityModifiers(original)) {
      enhanced += `, ${randomFrom(modifiers.quality)}`;
    }

    if (!original.toLowerCase().includes('lighting') && !original.toLowerCase().includes('light')) {
      enhanced += `, ${randomFrom(modifiers.lighting)}`;
    }

    if (!original.toLowerCase().includes('shot on') && !original.toLowerCase().includes('camera') && !original.toLowerCase().includes('lens')) {
      enhanced += `, ${randomFrom(modifiers.camera)}`;
    }

    if (!original.toLowerCase().includes('color') && !original.toLowerCase().includes('tone') && !original.toLowerCase().includes('palette')) {
      enhanced += `, ${randomFrom(modifiers.color)}`;
    }

    const keywords = extractKeywords(original);
    const suggestions = this.generateSuggestions(original, style, category);

    return {
      original,
      enhanced,
      suggestions,
      keywords,
      category,
      scaleComponents: scale,
    };
  }

  private generateSuggestions(original: string, style: string, category: string): string[] {
    const modifiers = STYLE_MODIFIERS[style as keyof typeof STYLE_MODIFIERS] || STYLE_MODIFIERS.realistic;
    const suggestions: string[] = [];

    suggestions.push(`${original}, ${randomFrom(modifiers.lighting)}, ${randomFrom(modifiers.quality)}`);
    suggestions.push(`${original}, ${randomFrom(modifiers.camera)}, ${randomFrom(modifiers.color)}`);

    const lightingOptions = ['golden hour backlight', 'dramatic chiaroscuro', 'soft diffused window light', 'neon-lit atmosphere', 'volumetric light rays'];
    suggestions.push(`${original}, ${randomFrom(lightingOptions)}`);

    const compositionOptions = ['rule of thirds composition', 'golden ratio framing', 'centered symmetrical balance', 'dynamic diagonal composition', 'leading lines perspective'];
    suggestions.push(`${original}, ${randomFrom(compositionOptions)}`);

    return suggestions.slice(0, 4);
  }

  getAutoComplete(partial: string): string[] {
    const lower = partial.toLowerCase();
    if (lower.length < 2) return [];

    const subjects = [
      'cyberpunk city at night',
      'fantasy landscape with mountains',
      'portrait of a person',
      'abstract geometric art',
      'product photography studio',
      'anime character design',
      'futuristic vehicle concept',
      'nature scene at golden hour',
      'architectural interior design',
      'cosmic space scene with nebula',
      'food photography overhead',
      'minimalist composition',
    ];

    return subjects.filter(s => s.toLowerCase().startsWith(lower)).slice(0, 5);
  }

  magicEnhance(prompt: string, style: string = 'realistic'): string {
    if (!prompt.trim()) return '';
    return this.enhancePrompt(prompt, style).enhanced;
  }

  getPromptTips(): string[] {
    return [
      'Be specific about the subject — what exactly should be visible?',
      'Add lighting details: golden hour, studio softbox, neon glow, etc.',
      'Specify camera angle and lens: wide-angle, close-up, 85mm portrait',
      'Include style references: "shot on Kodak Portra 400", "cinematic color grading"',
      'Describe the mood and atmosphere, not just the subject',
      'Use the SCALE framework: Shot → Character → Action → Lighting → Extra',
      'Keep prompts under 500 characters for best model comprehension',
      'For text rendering: use quotes and specify font style + placement',
      'Avoid vague terms like "beautiful" — describe what makes it beautiful',
      'Add quality markers: "ultra-detailed", "sharp focus", "professional"',
    ];
  }

  analyzePrompt(prompt: string): PromptQualityAnalysis {
    const feedback: string[] = [];
    const improvements: string[] = [];
    const missingElements: string[] = [];
    let score = 50;

    if (prompt.length < 10) {
      feedback.push('⚠️ Prompt is too short');
      improvements.push('Add more descriptive details about the subject');
      score -= 20;
    } else if (prompt.length >= 10 && prompt.length < 50) {
      feedback.push('📝 Basic prompt — could use more detail');
      improvements.push('Add lighting, camera, and style information');
      score -= 5;
    } else if (prompt.length >= 50 && prompt.length <= 300) {
      feedback.push('✓ Good prompt length');
      score += 10;
    } else if (prompt.length > 300) {
      feedback.push('⚠️ Prompt may be too long for some models');
      improvements.push('Consider simplifying to under 300 characters');
      score -= 5;
    }

    if (hasQualityModifiers(prompt)) {
      feedback.push('✓ Has quality modifiers');
      score += 15;
    } else {
      improvements.push('Add quality modifiers (ultra-detailed, 8K, professional)');
      missingElements.push('quality markers');
    }

    const lightingTerms = ['lighting', 'light', 'golden hour', 'studio', 'neon', 'volumetric', 'chiaroscuro', 'rim light', 'backlit', 'diffused'];
    if (lightingTerms.some(t => prompt.toLowerCase().includes(t))) {
      feedback.push('✓ Lighting specified');
      score += 10;
    } else {
      improvements.push('Describe the lighting setup');
      missingElements.push('lighting');
    }

    const cameraTerms = ['shot on', 'camera', 'lens', 'mm', 'f/', 'close-up', 'wide-angle', 'portrait', 'macro', 'telephoto'];
    if (cameraTerms.some(t => prompt.toLowerCase().includes(t))) {
      feedback.push('✓ Camera/framing specified');
      score += 10;
    } else {
      improvements.push('Specify camera angle or lens type');
      missingElements.push('camera/framing');
    }

    const styleTerms = ['cinematic', 'photorealistic', 'anime', 'vintage', 'minimalist', 'cyberpunk', 'artistic', '3d render', 'editorial', 'commercial'];
    if (styleTerms.some(t => prompt.toLowerCase().includes(t))) {
      feedback.push('✓ Style specified');
      score += 10;
    } else {
      improvements.push('Specify an art or photography style');
      missingElements.push('style');
    }

    const colorTerms = ['color', 'palette', 'tones', 'warm', 'cool', 'monochrome', 'vibrant', 'muted', '#', 'hex'];
    if (colorTerms.some(t => prompt.toLowerCase().includes(t))) {
      feedback.push('✓ Color direction specified');
      score += 10;
    } else {
      improvements.push('Describe the color palette or mood');
      missingElements.push('color direction');
    }

    const descriptiveTerms = ['dramatic', 'stunning', 'epic', 'vibrant', 'detailed', 'sharp', 'elegant', 'bold', 'serene', 'atmospheric'];
    if (descriptiveTerms.some(t => prompt.toLowerCase().includes(t))) {
      feedback.push('✓ Good descriptive language');
      score += 10;
    } else {
      improvements.push('Add descriptive adjectives');
      missingElements.push('descriptive language');
    }

    score = Math.max(0, Math.min(100, score));

    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 75) grade = 'B';
    else if (score >= 60) grade = 'C';
    else if (score >= 40) grade = 'D';
    else grade = 'F';

    return { score, grade, feedback, improvements, missingElements };
  }

  getStyleOptions(): { name: string; description: string; preview: string }[] {
    return [
      { name: 'realistic', description: 'Photorealistic, true-to-life photography', preview: 'shot on Sony A7IV, natural color grading' },
      { name: 'cinematic', description: 'Movie-quality, color-graded film stills', preview: 'shot on ARRI Alexa 65, teal and orange grading' },
      { name: 'artistic', description: 'Fine art, gallery-quality creative vision', preview: 'gallery-quality, vibrant saturated palette' },
      { name: 'anime', description: 'Studio-quality anime and manga aesthetics', preview: 'cel-shaded rendering, vibrant anime palette' },
      { name: '3d', description: 'High-end 3D renders with PBR materials', preview: 'octane render, ray tracing, PBR materials' },
      { name: 'cyberpunk', description: 'Neon-lit dystopian futuristic aesthetics', preview: 'neon signs on wet surfaces, magenta and cyan' },
      { name: 'vintage', description: 'Analog film warmth and nostalgic tones', preview: 'Kodak Gold 200, film grain, faded tones' },
      { name: 'minimalist', description: 'Clean, simple compositions with breathing room', preview: 'negative space, centered subject, pure white' },
    ];
  }
}

export const promptEnhancementService = new PromptEnhancementService();
