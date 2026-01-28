// providers.tsx - Provider routing, model selection, and fallback logic

import * as pollinations from "./pollinations.tsx";
import * as replicate from "./replicate.tsx";
import * as enhancer from "./enhancer.tsx";
import * as CreditsSystem from './unified-credits-system.ts'; // ✅ NEW: Use unified credits system
import * as pricing from "./pricing.tsx";

export interface GenerationRequest {
  prompt: string;
  negativePrompt?: string;
  images?: string[];
  quality: 'standard' | 'premium';
  advancedOptions?: {
    model?: 'auto' | 'seedream' | 'nanobanana' | 'flux-schnell' | 'kontext' | 'flux-2-pro' | 'imagen-4';
    enhancePrompt?: boolean;
    seed?: number;
  };
  useCredits: 'free' | 'paid';
  userId: string;
  width?: number;
  height?: number;
}

export interface GenerationResult {
  success: boolean;
  url?: string;
  error?: string;
  usedFallback?: boolean;
  fallbackReason?: string;
  provider?: string;
  model?: string;
  enhancedPrompt?: boolean;
  creditsUsed?: number;
  creditsRemaining?: {
    free: number;
    paid: number;
  };
}

/**
 * Auto-select best model based on context
 */
export function selectModel(request: GenerationRequest): string {
  // User override - respect their choice
  if (request.advancedOptions?.model && request.advancedOptions.model !== 'auto') {
    console.log(`🎯 User selected model: ${request.advancedOptions.model}`);
    return request.advancedOptions.model;
  }
  
  // Auto-selection logic
  const imageCount = request.images?.length || 0;
  
  // Premium quality
  if (request.quality === 'premium') {
    console.log('👑 Auto-selected: flux-2-pro (premium quality)');
    return 'flux-2-pro';
  }
  
  // Standard quality - based on image count
  if (imageCount === 0) {
    // Text-to-image: Seedream (default)
    console.log('🎨 Auto-selected: seedream (text-to-image)');
    return 'seedream';
  }
  
  if (imageCount === 1) {
    // Single image transformation: Kontext
    console.log('🖼️  Auto-selected: kontext (1 image enhancement)');
    return 'kontext';
  }
  
  if (imageCount >= 2 && imageCount <= 3) {
    // Multi-image: Nanobanana
    console.log('🍌 Auto-selected: nanobanana (2-3 images)');
    return 'nanobanana';
  }
  
  if (imageCount >= 4 && imageCount <= 10) {
    // Complex multi-image: Seedream
    console.log('🌱 Auto-selected: seedream (4-10 images)');
    return 'seedream';
  }
  
  if (imageCount > 10) {
    // Too many images - fallback to seedream with warning
    console.warn(`⚠️  Warning: ${imageCount} images exceeds recommended limit (10 max). Using seedream.`);
    return 'seedream';
  }
  
  // Default fallback
  console.log('🎨 Auto-selected: seedream (default)');
  return 'seedream';
}

/**
 * Get provider for a model
 */
function getProviderForModel(model: string): 'pollinations' | 'replicate' {
  if (model === 'flux-2-pro' || model === 'imagen-4') {
    return 'replicate';
  }
  
  // seedream, nanobanana, kontext
  return 'pollinations';
}

/**
 * Main generation function with provider routing and fallback
 */
export async function generateWithProvider(
  request: GenerationRequest
): Promise<GenerationResult> {
  try {
    // 1. Auto-select model
    const selectedModel = selectModel(request);
    console.log(`\n🎯 Generation Request:`);
    console.log(`   Model: ${selectedModel}`);
    console.log(`   Quality: ${request.quality}`);
    console.log(`   Images: ${request.images?.length || 0}`);
    console.log(`   Credits: ${request.useCredits}`);
    
    // 2. Determine if we'll enhance the prompt (for pricing calculation)
    const shouldEnhance = request.advancedOptions?.enhancePrompt !== false; // Default true
    const willEnhance = shouldEnhance && enhancer.shouldEnhancePrompt(selectedModel);
    
    // 3. Calculate cost (including enhance charge if applicable)
    const pricingResult = pricing.calculateCost({
      model: selectedModel,
      imageCount: request.images?.length || 0,
      quality: request.quality,
      enhancePrompt: willEnhance  // ✅ Pass enhance status for pricing
    });
    
    console.log(`💎 Cost: ${pricingResult.cost} ${pricingResult.creditType} credits`);
    console.log(`   Breakdown: ${pricingResult.breakdown.base} base + ${pricingResult.breakdown.imagesCharge} images + ${pricingResult.breakdown.enhanceCharge} enhance + ${pricingResult.breakdown.premiumSurcharge} premium`);
    
    // 4. Check & deduct credits (ALWAYS use creditType from pricing calculation)
    const deductionResult = await CreditsSystem.deductCredits(
      request.userId,
      pricingResult.cost,
      pricingResult.creditType  // ✅ Use backend-calculated creditType, not frontend choice
    );
    
    if (!deductionResult.success) {
      console.error(`❌ Credit deduction failed: ${deductionResult.error}`);
      return {
        success: false,
        error: deductionResult.error,
        creditsRemaining: deductionResult.remaining
      };
    }
    
    console.log(`✅ Credits deducted: ${deductionResult.remaining.free} free, ${deductionResult.remaining.paid} paid`);
    
    // 5. Enhance prompt if needed
    let finalPrompt = request.prompt;
    let wasEnhanced = false;
    
    if (shouldEnhance && enhancer.shouldEnhancePrompt(selectedModel)) {
      console.log('✨ Enhancing prompt...');
      const enhancerResult = await enhancer.enhancePrompt(request.prompt, selectedModel);
      
      if (enhancerResult.success && enhancerResult.enhanced) {
        finalPrompt = enhancerResult.enhancedPrompt!;
        wasEnhanced = true;
        console.log(`✅ Prompt enhanced: "${finalPrompt.substring(0, 100)}..."`);
      }
    } else {
      console.log('⏭️  Skipping prompt enhancement');
    }
    
    // 6. Route to provider
    const provider = getProviderForModel(selectedModel);
    console.log(`🚀 Routing to provider: ${provider}`);
    
    try {
      // Try primary provider
      const result = await generateWithModel(selectedModel, {
        ...request,
        prompt: finalPrompt
      });
      
      if (result.success) {
        console.log(`✅ Generation successful via ${provider}`);
        return {
          ...result,
          enhancedPrompt: wasEnhanced,
          creditsUsed: pricingResult.cost,
          creditsRemaining: deductionResult.remaining,
          usedFallback: false
        };
      }
      
      // Primary failed, try fallback
      throw new Error(result.error || 'Generation failed');
      
    } catch (primaryError) {
      console.warn(`⚠️  Primary provider ${provider} failed:`, primaryError);
      
      // Refund credits since generation failed (use same creditType as deduction)
      await refundCredits(request.userId, pricingResult.cost, pricingResult.creditType);
      
      // Build helpful error message with suggestions
      const errorMsg = primaryError instanceof Error ? primaryError.message : 'Generation failed';
      const isPollinationsError = provider === 'pollinations';
      
      let userFriendlyError = errorMsg;
      
      if (isPollinationsError) {
        // Suggest alternatives for Pollinations failures
        if (errorMsg.includes('insufficient pollen') || errorMsg.includes('rate limit')) {
          userFriendlyError = `${selectedModel} is currently unavailable. Please try:\n• Use Flux Schnell (free, fast)\n• Upgrade to premium models (Flux 2 Pro, Imagen 4)`;
        } else {
          userFriendlyError = `${selectedModel} failed. Try Flux Schnell or premium models.`;
        }
      }
      
      return {
        success: false,
        error: userFriendlyError,
        creditsRemaining: deductionResult.remaining
      };
    }
    
  } catch (error) {
    console.error('❌ Generation error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate with specific model
 */
async function generateWithModel(
  model: string,
  request: GenerationRequest
): Promise<GenerationResult> {
  const commonOptions = {
    prompt: request.prompt,
    negativePrompt: request.negativePrompt,
    width: request.width || 720,
    height: request.height || 1280,
    seed: request.advancedOptions?.seed
  };
  
  // Pollinations models
  if (model === 'seedream' || model === 'nanobanana' || model === 'kontext') {
    const result = await pollinations.generateImage({
      ...commonOptions,
      model,
      referenceImages: request.images,
      enhance: true,
      private: true,
      nologo: true,
      quality: 'high'
    });
    
    return {
      success: result.success,
      url: result.url,
      error: result.error,
      provider: 'pollinations',
      model
    };
  }
  
  // Replicate (Premium)
  if (model === 'flux-2-pro' || model === 'imagen-4') {
    const result = await replicate.generatePremium({
      ...commonOptions,
      model: model as 'flux-2-pro' | 'imagen-4',
      images: request.images
    });
    
    return {
      success: result.success,
      url: result.url,
      error: result.error,
      provider: 'replicate',
      model
    };
  }
  
  return {
    success: false,
    error: `Unknown model: ${model}`,
    provider: 'unknown',
    model
  };
}

/**
 * Refund credits when generation fails
 */
async function refundCredits(
  userId: string,
  amount: number,
  creditType: 'free' | 'paid'
): Promise<void> {
  try {
    const currentCredits = await CreditsSystem.getUserCredits(userId);
    const newAmount = creditType === 'free' 
      ? currentCredits.free + amount
      : currentCredits.paid + amount;
    
    await CreditsSystem.adminResetCredits(
      userId,
      creditType === 'free' ? newAmount : currentCredits.free,
      creditType === 'paid' ? newAmount : currentCredits.paid
    );
    
    console.log(`💸 Refunded ${amount} ${creditType} credits to ${userId}`);
  } catch (error) {
    console.error(`❌ Failed to refund credits:`, error);
  }
}

/**
 * Get available models for user
 */
export async function getAvailableModels(userId: string) {
  const userCredits = await CreditsSystem.getUserCredits(userId);
  
  return {
    standard: [
      {
        id: 'auto',
        name: 'Auto-select',
        description: 'Best model for your request',
        cost: 1,
        available: userCredits.free >= 1 || userCredits.paid >= 1
      },
      {
        id: 'seedream',
        name: 'Seedream',
        description: 'Text-to-image generation',
        cost: 1,
        available: userCredits.free >= 1 || userCredits.paid >= 1
      },
      {
        id: 'nanobanana',
        name: 'Nanobanana',
        description: 'Multi-image generation',
        cost: 2,
        available: userCredits.free >= 2 || userCredits.paid >= 2
      },
      {
        id: 'flux-schnell',
        name: 'Flux Schnell',
        description: 'Fast generation',
        cost: 1,
        available: userCredits.free >= 1 || userCredits.paid >= 1
      },
      {
        id: 'kontext',
        name: 'Kontext',
        description: 'Image enhancement',
        cost: 1,
        available: userCredits.free >= 1 || userCredits.paid >= 1
      }
    ],
    premium: [
      {
        id: 'flux-2-pro',
        name: 'Flux 2 Pro',
        description: 'Professional quality',
        cost: 3,
        available: userCredits.paid >= 3
      },
      {
        id: 'imagen-4',
        name: 'Imagen 4',
        description: 'Google\'s latest model',
        cost: 3,
        available: userCredits.paid >= 3
      }
    ]
  };
}