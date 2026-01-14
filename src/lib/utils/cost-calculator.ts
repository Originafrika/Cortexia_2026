/**
 * COCONUT V14 - COST CALCULATOR
 * ✅ FIXED: Corrected pricing according to architecture spec
 * - Gemini Analysis: 100 credits (was 5)
 * - Flux Generation: 5-15 credits base (was 100)
 */

export interface CostBreakdown {
  geminiAnalysis: number;
  fluxGeneration: number;
  references: number;
  multiPass: number;
  total: number;
  steps: {
    name: string;
    credits: number;
    description: string;
  }[];
}

export interface GenerationSpecs {
  model: 'flux-2-pro' | 'flux-2-dev';
  mode: 'text-to-image' | 'image-to-image';
  ratio: string;
  resolution: '1K' | '2K';
  referencesCount?: number;
}

/**
 * Credit costs (1 credit = 0.1$)
 * ✅ CORRECTED ACCORDING TO COCONUT_V14_ARCHITECTURE_REVISED.md
 */
const COSTS = {
  // ✅ FIX: Gemini Analysis (was 5, now 100 as specified)
  geminiFlash: 100,        // 100 credits for multimodal analysis (10 images + 10 videos + reasoning)
  
  // ✅ FIX: Flux 2 Pro Generation Base (was 100, now 5 as specified)
  flux1K: 5,               // 5 credits for 1K generation
  flux2K: 10,              // 10 credits for 2K generation
  
  // Model multipliers (kept for flexibility)
  modelMultipliers: {
    'flux-2-pro': 1.0,     // Full price
    'flux-2-dev': 0.5,     // Half price for dev
  },
  
  // ✅ SIMPLIFIED: Resolution now uses direct costs instead of multipliers
  // Resolution multipliers (deprecated - using direct costs now)
  resolutionMultipliers: {
    '1K': 1.0,             // Direct cost: flux1K = 5 credits
    '2K': 2.0,             // Direct cost: flux2K = 10 credits (2x)
  },
  
  // Ratio multipliers (minimal impact, kept for edge cases)
  ratioMultipliers: {
    '1:1': 1.0,            // Square
    '3:4': 1.0,            // Portrait (simplified from 1.1)
    '4:3': 1.0,            // Landscape (simplified from 1.1)
    '9:16': 1.0,           // Vertical (simplified from 1.2)
    '16:9': 1.0,           // Horizontal (simplified from 1.2)
    '21:9': 1.0,           // Ultra-wide (simplified from 1.3)
  },
  
  // Mode multipliers (minimal impact)
  modeMultipliers: {
    'text-to-image': 1.0,  // Standard
    'image-to-image': 1.0, // Same cost (simplified from 1.2)
  },
  
  // References
  perReference: 2,         // 2 credits per reference image (kept)
};

/**
 * Calculate total cost for generation
 * ✅ FIXED: Uses correct base costs (flux1K=5, flux2K=10)
 */
export function calculateCost(specs: GenerationSpecs): CostBreakdown {
  const steps: CostBreakdown['steps'] = [];
  
  // 1. Gemini Analysis (fixed cost - 100 credits)
  const geminiCost = COSTS.geminiFlash;
  steps.push({
    name: 'AI Analysis',
    credits: geminiCost,
    description: 'Gemini multimodal analysis of intent and references'
  });
  
  // 2. ✅ FIXED: Flux Generation with correct base costs
  let fluxCost = specs.resolution === '1K' ? COSTS.flux1K : COSTS.flux2K;
  
  // Apply model multiplier
  const modelMultiplier = COSTS.modelMultipliers[specs.model];
  fluxCost *= modelMultiplier;
  
  // Apply ratio multiplier (now 1.0 for all - simplified)
  const ratioMultiplier = COSTS.ratioMultipliers[specs.ratio as keyof typeof COSTS.ratioMultipliers] || 1.0;
  fluxCost *= ratioMultiplier;
  
  // Apply mode multiplier (now 1.0 for all - simplified)
  const modeMultiplier = COSTS.modeMultipliers[specs.mode];
  fluxCost *= modeMultiplier;
  
  fluxCost = Math.round(fluxCost);
  
  steps.push({
    name: 'Image Generation',
    credits: fluxCost,
    description: `${specs.model} (${specs.resolution}, ${specs.ratio}, ${specs.mode})`
  });
  
  // 3. References
  const referencesCost = (specs.referencesCount || 0) * COSTS.perReference;
  if (referencesCost > 0) {
    steps.push({
      name: 'References',
      credits: referencesCost,
      description: `${specs.referencesCount} reference image${specs.referencesCount! > 1 ? 's' : ''} @ ${COSTS.perReference} credits each`
    });
  }
  
  const total = geminiCost + fluxCost + referencesCost;
  
  return {
    geminiAnalysis: geminiCost,
    fluxGeneration: fluxCost,
    references: referencesCost,
    multiPass: 0,
    total,
    steps
  };
}

/**
 * Format cost for display
 */
export function formatCost(credits: number): string {
  const dollars = (credits * 0.1).toFixed(2);
  return `$${dollars}`;
}

/**
 * Get cost tier for UI styling
 */
export function getCostTier(total: number): 'low' | 'medium' | 'high' | 'premium' {
  if (total < 50) return 'low';
  if (total < 100) return 'medium';
  if (total < 200) return 'high';
  return 'premium';
}

/**
 * Validate specs combination
 */
export function validateSpecs(specs: GenerationSpecs): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check references count
  if (specs.referencesCount && specs.referencesCount < 0) {
    errors.push('References count cannot be negative');
  }
  
  if (specs.referencesCount && specs.referencesCount > 8) {
    errors.push('Maximum 8 references allowed');
  }
  
  // Check ratio
  const validRatios = ['1:1', '3:4', '4:3', '9:16', '16:9', '21:9'];
  if (!validRatios.includes(specs.ratio)) {
    errors.push(`Invalid ratio. Must be one of: ${validRatios.join(', ')}`);
  }
  
  // Check resolution
  const validResolutions = ['1K', '2K'];
  if (!validResolutions.includes(specs.resolution)) {
    errors.push(`Invalid resolution. Must be one of: ${validResolutions.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get recommended settings for budget
 */
export function getRecommendedSettings(maxCredits: number): GenerationSpecs {
  // Start with minimal settings
  let specs: GenerationSpecs = {
    model: 'flux-2-pro',
    mode: 'text-to-image',
    ratio: '1:1',
    resolution: '1K',
    referencesCount: 0
  };
  
  const minCost = calculateCost(specs).total;
  
  if (maxCredits < minCost) {
    return specs; // Not enough credits
  }
  
  // Upgrade resolution if possible
  if (maxCredits >= calculateCost({ ...specs, resolution: '2K' }).total) {
    specs.resolution = '2K';
  }
  
  // Add references
  for (let refs = 1; refs <= 8; refs++) {
    const testSpecs = { ...specs, referencesCount: refs };
    if (calculateCost(testSpecs).total <= maxCredits) {
      specs.referencesCount = refs;
    } else {
      break;
    }
  }
  
  return specs;
}