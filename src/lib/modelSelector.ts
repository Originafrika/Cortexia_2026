// Model Selector - Smart AI Model Selection for Better Face Quality
// ✅ CORTEXIA INTELLIGENTLY SWITCHES between SEEDREAM and NANOBANANA

import { detectPeopleInPrompt } from './promptEnhancer';

// ✅ Pollinations API supports: seedream (general generation) and nanobanana (upscale/enhance/face-swap)
export type PollinationsModel = 'seedream' | 'nanobanana';

export interface ModelRecommendation {
  model: PollinationsModel;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * 🎯 MODEL SELECTION - Smart selection between seedream and nanobanana
 * 
 * - seedream: General purpose AI generation (creative/generative tasks)
 * - nanobanana: Specialized for upscaling, quality enhancement, outpainting, and face swap
 * 
 * @param prompt - User's generation prompt
 * @param userPreference - Optional manual model override
 * @returns Model recommendation with reasoning
 */
export function selectBestModel(
  prompt: string, 
  userPreference?: PollinationsModel
): ModelRecommendation {
  // Manual override
  if (userPreference) {
    return {
      model: userPreference,
      reason: `User-selected model: ${userPreference}`,
      confidence: 'high'
    };
  }
  
  // Default: seedream for general generation
  return {
    model: 'seedream',
    reason: 'SeeDream - Universal AI model for general generation',
    confidence: 'high'
  };
}

/**
 * ✅ Get model for specific template type
 * 🍌 NANOBANANA for: upscale/enhance, outpainting, restoration, AND face swap
 * 🌱 SEEDREAM for: all other creative/generative tasks
 * 
 * ✅ CONFIRMED: Face swap uses NANOBANANA (working with Pollinations API multi-image input)
 */
export function getModelForTemplate(templateName: string, templatePrompt?: string): PollinationsModel {
  const lowerName = templateName.toLowerCase();
  const lowerPrompt = (templatePrompt || '').toLowerCase();
  
  // 🍌 NANOBANANA for upscale/enhance templates
  const isEnhanceUpscale = 
    lowerName.includes('ultra enhance') ||
    lowerName.includes('upscale') ||
    lowerName.includes('quality boost') ||
    lowerName.includes('restoration') ||  // ✅ Added for Old Photo Restoration
    lowerName.includes('hd') ||
    lowerName.includes('4k') ||
    lowerName.includes('10k') ||  // ✅ Added for Ultra Enhance & 10K Upscale
    lowerPrompt.includes('upscale') ||
    lowerPrompt.includes('enhance quality') ||
    lowerPrompt.includes('enhance clarity') ||  // ✅ Added for Old Photo Restoration
    lowerPrompt.includes('restoration') ||
    lowerPrompt.includes('detail restoration') ||  // ✅ Enhancement technique
    lowerPrompt.includes('deblur') ||  // ✅ Enhancement technique
    lowerPrompt.includes('sharpen') ||  // ✅ Enhancement technique
    lowerPrompt.includes('sharpness') ||  // ✅ Enhancement technique
    lowerPrompt.includes('repair damage') ||  // ✅ Restoration
    lowerPrompt.includes('repair scratches');  // ✅ Restoration
  
  // ⚠️ EXCEPTIONS: Templates with "enhance" in name but are creative/generative (use SEEDREAM)
  const isCreativeEnhancement = 
    (lowerName.includes('portrait enhancement') || lowerName.includes('portrait studio retouch')) ||  // Portrait Studio Retouch is creative transformation
    lowerPrompt.includes('studio lighting') ||  // Relighting is creative
    lowerPrompt.includes('beauty retouching') ||  // Beauty retouching is creative
    lowerPrompt.includes('artistic relighting');  // Artistic relighting is creative
  
  // Remove false positives
  const isTrueEnhancement = isEnhanceUpscale && !isCreativeEnhancement;
  
  // 🍌 NANOBANANA for outpainting/extension
  const isOutpainting = 
    lowerName.includes('outpaint') ||
    lowerName.includes('extension') ||
    lowerName.includes('extend') ||
    lowerName.includes('expand') ||
    lowerPrompt.includes('outpaint') ||
    lowerPrompt.includes('extend') ||
    lowerPrompt.includes('expand') ||
    lowerPrompt.includes('scene extension');
  
  // 🍌 NANOBANANA for face swap (confirmed working with Pollinations API)
  const isFaceSwap = 
    lowerName.includes('face swap') ||
    lowerName.includes('faceswap') ||
    lowerName.includes('face-swap') ||
    lowerName.includes('swap face') ||
    lowerPrompt.includes('face swap') ||
    lowerPrompt.includes('swap face') ||
    lowerPrompt.includes('replace face') ||
    lowerPrompt.includes('face replacement');
  
  // 🍌 NANOBANANA for AI Face Enhancement templates (special case)
  // These templates specifically enhance facial details with upscaling
  const isFaceEnhancement = 
    lowerName.includes('face enhancement') ||
    lowerName.includes('face enhance') ||
    lowerPrompt.includes('face enhancement using uploaded');
  
  // 🍌 NANOBANANA for upscale, enhance, outpainting, face swap, AND face enhancement
  if (isTrueEnhancement || isOutpainting || isFaceSwap || isFaceEnhancement) {
    if (isFaceSwap) {
      console.log(`🍌 Using NANOBANANA for face swap: \"${templateName}\"`);
    } else if (isFaceEnhancement) {
      console.log(`🍌 Using NANOBANANA for face enhancement: \"${templateName}\"`);
    } else {
      console.log(`🍌 Using NANOBANANA for enhance/upscale/outpainting template: \"${templateName}\"`);
    }
    return 'nanobanana';
  }
  
  // 🌱 SEEDREAM for all other templates
  return 'seedream';
}