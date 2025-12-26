// pricing.tsx - Dynamic pricing calculation based on model and image count

export interface PricingInput {
  model: string;
  imageCount: number;
  quality: 'standard' | 'premium';
  enhancePrompt?: boolean; // NEW: Track if prompt enhancement is active
}

export interface PricingResult {
  cost: number;
  creditType: 'free' | 'paid';
  breakdown: {
    base: number;
    imagesCharge: number; // Renamed from imageMultiplier
    enhanceCharge: number; // NEW: +1 if enhance active
    premiumSurcharge: number;
  };
}

/**
 * Calculate cost with additive pricing model:
 * 
 * Base: 1 credit per generation
 * +1 credit per reference image
 * +1 credit if enhance active
 * 
 * Standard models (Free credits):
 * - Text-to-image, no enhance: 1 credit
 * - Text-to-image, enhance: 2 credits
 * - 1 image, no enhance: 2 credits (1 base + 1 image)
 * - 1 image, enhance: 3 credits (1 base + 1 image + 1 enhance)
 * - 3 images, enhance: 5 credits (1 base + 3 images + 1 enhance)
 * 
 * Premium models (Paid credits):
 * - Same formula + 2 credits premium surcharge
 */
export function calculateCost(input: PricingInput): PricingResult {
  const isPremium = input.quality === 'premium' || 
                    input.model === 'flux-2-pro' || 
                    input.model === 'imagen-4';
  
  // Base cost: 1 credit per generation
  const baseCost = 1;
  
  // +1 credit per reference image
  const imagesCharge = input.imageCount;
  
  // +1 credit if enhance active
  const enhanceCharge = input.enhancePrompt ? 1 : 0;
  
  // Premium surcharge: +2 credits for premium models
  const premiumSurcharge = isPremium ? 2 : 0;
  
  const totalCost = baseCost + imagesCharge + enhanceCharge + premiumSurcharge;
  
  return {
    cost: totalCost,
    creditType: isPremium ? 'paid' : 'free',
    breakdown: {
      base: baseCost,
      imagesCharge,
      enhanceCharge,
      premiumSurcharge
    }
  };
}

/**
 * Get human-readable pricing description
 */
export function getPricingDescription(input: PricingInput): string {
  const result = calculateCost(input);
  
  if (result.cost === 1) {
    return '1 credit';
  }
  
  return `${result.cost} credits`;
}

/**
 * Validate if user has enough credits
 */
export function canAfford(
  cost: number,
  creditType: 'free' | 'paid',
  freeCredits: number,
  paidCredits: number
): boolean {
  if (creditType === 'free') {
    return freeCredits >= cost;
  } else {
    return paidCredits >= cost;
  }
}

/**
 * Get pricing examples for documentation
 */
export function getPricingExamples() {
  return {
    standard: {
      textToImage: calculateCost({ model: 'seedream', imageCount: 0, quality: 'standard' }),
      oneImage: calculateCost({ model: 'kontext', imageCount: 1, quality: 'standard' }),
      twoThreeImages: calculateCost({ model: 'nanobanana', imageCount: 3, quality: 'standard' }),
      fourTenImages: calculateCost({ model: 'nanobanana', imageCount: 5, quality: 'standard' })
    },
    premium: {
      textToImage: calculateCost({ model: 'flux-2-pro', imageCount: 0, quality: 'premium' }),
      oneImage: calculateCost({ model: 'flux-2-pro', imageCount: 1, quality: 'premium' }),
      twoThreeImages: calculateCost({ model: 'flux-2-pro', imageCount: 3, quality: 'premium' }),
      fourTenImages: calculateCost({ model: 'flux-2-pro', imageCount: 5, quality: 'premium' })
    }
  };
}

// Example usage:
// const cost = calculateCost({ model: 'seedream', imageCount: 0, quality: 'standard' });
// console.log(cost); // { cost: 1, creditType: 'free', breakdown: { base: 1, imageMultiplier: 0, premiumSurcharge: 0 } }