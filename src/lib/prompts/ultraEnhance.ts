// Ultra Enhancement Prompts - Maximum Quality for 10K+ Upscaling
// 🎯 Optimized for nanobanana model: Technical precision + Cloudflare safe
// Balance: Enough detail for quality, short enough for GET requests (< 300 chars)

/**
 * ULTIMATE QUALITY PROMPT - For 10K+ upscaling
 * Focus: Technical keywords that maximize nanobanana's capabilities
 * - Ultra-resolution (10K+)
 * - Deblur technology (motion, focus, camera shake)
 * - Micro-texture extraction
 * - Composition preservation (zero hallucination)
 * - Photorealistic fidelity
 */
export const ULTRA_ENHANCE_10K_PROMPT = `10K ultra-resolution upscale. Preserve exact composition zero modifications. Advanced deblur motion-blur focus-blur camera-shake removal. Extract maximum micro-texture detail pores fabric-weave material-grain. Crystal-clear sharpness photorealistic fidelity. Professional quality`;

/**
 * EXTREME QUALITY PROMPT - For maximum detail extraction
 * Adds: HDR, dynamic range, tonal accuracy
 */
export const EXTREME_ENHANCE_PROMPT = `15K extreme-resolution super-sampling. Forensic composition preservation zero creative changes. Multi-pass deblur motion focus shake lens-aberration. Atomic-level micro-detail extraction pores weave grain surface-topology. HDR dynamic-range tonal-accuracy. Museum-grade photorealistic output`;

/**
 * BALANCED PROMPT - Good quality, very safe for Cloudflare
 * For users experiencing 400 errors
 */
export const BALANCED_ENHANCE_PROMPT = `Ultra-resolution upscale maximum quality. Preserve composition exactly. Advanced deblur technology. Extract micro-texture details. Crystal-clear professional output`;

/**
 * Resolution-specific prompts
 */
export const RESOLUTION_PROMPTS = {
  '4K': `4K resolution upscale. Preserve composition. Enhanced sharpness micro-detail extraction. Professional quality`,
  
  '8K': `8K ultra-resolution upscale. Preserve exact composition. Advanced deblur motion-blur focus-blur. Extract micro-texture detail. Crystal-clear sharpness`,
  
  '10K': ULTRA_ENHANCE_10K_PROMPT,
  
  '15K': EXTREME_ENHANCE_PROMPT,
  
  'MAX': `Maximum resolution upscale 20K+. Forensic preservation composition. Multi-pass advanced deblur all-blur-types. Atomic micro-detail extraction all-surfaces. HDR extended-gamut. Museum-archival-grade output`
};

/**
 * Content-aware enhancement prompts
 * Specialized for different content types
 */
export const CONTENT_AWARE_PROMPTS = {
  /**
   * PORTRAIT - Face preservation priority
   */
  portrait: `10K portrait upscale. Forensic facial-identity preservation zero modifications. Advanced deblur motion focus. Micro-detail pores skin-texture eye-definition. Natural skin-tone accuracy. Crystal-clear professional headshot quality`,
  
  /**
   * PRODUCT - Material texture + color accuracy
   */
  product: `10K product upscale. Exact composition brand-color preservation deltaE<2. Material-aware texture enhancement metal fabric glass plastic. Razor-sharp edges. Micro-detail surface-finish. Commercial photography grade`,
  
  /**
   * LANDSCAPE - Environmental detail
   */
  landscape: `10K landscape upscale. Composition preservation atmospheric-depth. Environmental detail foliage water sky architecture. Natural depth-of-field. Crystal-clear across-frame. Cinematic quality`,
  
  /**
   * ARCHITECTURE - Geometric precision
   */
  architecture: `10K architectural upscale. Geometric precision line-accuracy. Material texture brick concrete glass metal. Sharp structural-detail. Lighting accuracy. Professional photography quality`,
  
  /**
   * UNIVERSAL - Works for everything
   */
  universal: ULTRA_ENHANCE_10K_PROMPT
};

/**
 * Deblur-focused prompts (for very blurry images)
 */
export const DEBLUR_PROMPTS = {
  /**
   * MOTION BLUR - Moving subjects
   */
  motion: `10K upscale ultra-deblur focus. Motion-blur elimination directional-deconvolution frame-reconstruction. Camera-shake compensation stabilization. Extract sharp detail from blur. Preserve composition. Professional quality`,
  
  /**
   * FOCUS BLUR - Out of focus
   */
  focus: `10K upscale extreme-deblur. Out-of-focus correction depth-reconstruction. Defocus-blur reversal advanced-deconvolution. Lens-aberration removal. Sharp across depth-field. Preserve composition. Professional quality`,
  
  /**
   * GENERAL BLUR - All types
   */
  general: `10K upscale advanced-deblur all-types. Motion-blur focus-blur camera-shake lens-aberration gaussian-blur removal. Multi-pass deconvolution detail-reconstruction. Crystal-clear sharpness. Preserve composition. Professional quality`
};

/**
 * Style preservation prompts
 */
export const STYLE_PRESERVATION = {
  /**
   * PHOTOREALISTIC - Natural look
   */
  photorealistic: `10K ultra-resolution upscale photorealistic-fidelity. Preserve natural-lighting authentic-colors real-world-textures. Zero artificial-sharpening zero-over-processing. Natural-grain-structure. Museum-grade realism`,
  
  /**
   * ARTISTIC - Preserve artistic style
   */
  artistic: `10K upscale preserve-artistic-style. Maintain original aesthetic painting-style texture-style color-palette. Enhanced clarity detail-extraction. Zero style-modification. Faithful-to-source enhancement`,
  
  /**
   * VINTAGE - Old photo restoration
   */
  vintage: `10K vintage-restoration upscale. Preserve film-grain analog-character period-style. Advanced deblur age-degradation-correction. Maintain authentic-vintage-look. Enhanced clarity archival-quality`
};

/**
 * Select optimal prompt based on requirements
 */
export const selectEnhancePrompt = (options: {
  targetResolution?: '4K' | '8K' | '10K' | '15K' | 'MAX';
  contentType?: 'portrait' | 'product' | 'landscape' | 'architecture' | 'universal';
  hasBlur?: boolean;
  blurType?: 'motion' | 'focus' | 'general';
  preserveStyle?: 'photorealistic' | 'artistic' | 'vintage';
  safeModeCloudflare?: boolean; // Use shorter prompt if experiencing 400 errors
}): string => {
  // Safe mode - use balanced prompt
  if (options.safeModeCloudflare) {
    return BALANCED_ENHANCE_PROMPT;
  }
  
  // Prioritize deblur if specified
  if (options.hasBlur && options.blurType) {
    return DEBLUR_PROMPTS[options.blurType];
  }
  
  // Style preservation
  if (options.preserveStyle) {
    return STYLE_PRESERVATION[options.preserveStyle];
  }
  
  // Content-aware
  if (options.contentType && options.contentType !== 'universal') {
    return CONTENT_AWARE_PROMPTS[options.contentType];
  }
  
  // Resolution-specific
  if (options.targetResolution) {
    return RESOLUTION_PROMPTS[options.targetResolution];
  }
  
  // Default: 10K universal
  return ULTRA_ENHANCE_10K_PROMPT;
};

/**
 * Get prompt length for validation
 */
export const validatePromptLength = (prompt: string): {
  length: number;
  encoded: number;
  safe: boolean;
  warning?: string;
} => {
  const length = prompt.length;
  const encoded = encodeURIComponent(prompt).length;
  
  return {
    length,
    encoded,
    safe: encoded < 500, // Conservative limit for Cloudflare
    warning: encoded > 500 ? 'Prompt may be too long for Cloudflare. Consider using BALANCED_ENHANCE_PROMPT.' : undefined
  };
};

/**
 * Combine prompt with custom user instructions (safely)
 */
export const combineWithCustom = (basePrompt: string, customPrompt?: string): string => {
  if (!customPrompt || customPrompt.trim() === '') {
    return basePrompt;
  }
  
  // Truncate custom if too long
  const maxCustomLength = 100;
  const trimmedCustom = customPrompt.length > maxCustomLength 
    ? customPrompt.substring(0, maxCustomLength) + '...'
    : customPrompt;
  
  return `${basePrompt}. Additional: ${trimmedCustom}`;
};

// Export all for easy access
export default {
  ULTRA_ENHANCE_10K_PROMPT,
  EXTREME_ENHANCE_PROMPT,
  BALANCED_ENHANCE_PROMPT,
  RESOLUTION_PROMPTS,
  CONTENT_AWARE_PROMPTS,
  DEBLUR_PROMPTS,
  STYLE_PRESERVATION,
  selectEnhancePrompt,
  validatePromptLength,
  combineWithCustom
};
