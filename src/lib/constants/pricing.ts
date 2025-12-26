// Centralized pricing constants for all generation types

export const GENERATION_COSTS = {
  image: 1,
  video: 3,
  avatar: 2,
  template: 1,
  remix: 1,
  coconutPro: 5,
  // Kie AI Image Models (Premium - in Cortexia credits)
  // Note: 1 Cortexia credit = $0.10, 1 Kie AI credit = $0.005
  // Flux 2 Pro: Accessible Premium
  'flux-2-pro-1k': 1,    // Cost us $0.025, we charge $0.10 → 300% margin
  'flux-2-pro-2k': 2,    // Cost us $0.035, we charge $0.20 → 471% margin
  // Flux 2 Flex: Ultra-Premium (best quality on market, 3x Pro pricing)
  'flux-2-flex-1k': 3,   // Cost us $0.07, we charge $0.30 → 329% margin
  'flux-2-flex-2k': 6,   // Cost us $0.12, we charge $0.60 → 400% margin
  // Nano Banana Pro: Ultra-Premium Google DeepMind (4K, typography, multi-character)
  'nano-banana-pro-1k': 3,   // Cost us $0.09, we charge $0.30 → 233% margin (same as Flex 1K)
  'nano-banana-pro-2k': 6,   // Cost us $0.09, we charge $0.60 → 567% margin (same as Flex 2K)
  'nano-banana-pro-4k': 10,  // Cost us $0.12, we charge $1.00 → 733% margin (exclusive 4K)
  'reference-image': 1,  // Cost us $0, we charge $0.10 → ∞% margin!
  // InfiniteTalk: AI Lip-Sync Avatar (MeiGen-AI via Kie AI) - Premium only, up to 15s
  // Loss leader pricing for user acquisition (negative margins)
  'infinitalk-480p': 1,   // Cost us $0.225 (45 Kie AI credits), we charge $0.10 → -56% margin (loss leader)
  'infinitalk-720p': 2,  // Cost us $0.90 (180 Kie AI credits), we charge $0.20 → -78% margin (loss leader)
} as const;

export type GenerationType = keyof typeof GENERATION_COSTS;

/**
 * Calculate cost for Kie AI image models (in Cortexia credits)
 */
export function getKieAIImageCost(
  model: string, 
  resolution: '1K' | '2K' | '4K',
  referenceImageCount: number = 0
): number {
  let baseCost = 0;
  
  if (model === 'flux-2-pro') {
    baseCost = resolution === '1K' ? 1 : 2; // Pro: 1 or 2 credits
  } else if (model === 'flux-2-flex') {
    baseCost = resolution === '1K' ? 3 : 6; // Flex: 3x Pro pricing (ultra-premium)
  } else if (model === 'nano-banana-pro') {
    baseCost = resolution === '1K' ? 3 : resolution === '2K' ? 6 : 10; // Nano Banana Pro: 3/6/10 credits
  } else {
    baseCost = GENERATION_COSTS.image; // Fallback
  }
  
  // Add cost for reference images (1 credit per image)
  const refImageCost = referenceImageCount * GENERATION_COSTS['reference-image'];
  
  return baseCost + refImageCost;
}

export function getCreditLabel(cost: number): string {
  return `${cost} credit${cost > 1 ? 's' : ''}`;}

/**
 * Calculate cost for InfiniteTalk avatar generation (in Cortexia credits)
 */
export function getInfiniteTalkCost(
  resolution: '480p' | '720p'
): number {
  if (resolution === '480p') {
    return GENERATION_COSTS['infinitalk-480p'];
  } else {
    return GENERATION_COSTS['infinitalk-720p'];
  }
}