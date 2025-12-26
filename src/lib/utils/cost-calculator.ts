/**
 * COCONUT V14 - COST CALCULATOR
 * Phase 3 - Jour 5: Real-time cost calculation
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
  format: string;
  resolution: string;
  mode: 'single-pass' | 'multi-pass';
  passes?: number;
  referencesCount: number;
}

/**
 * Credit costs (1 credit = 0.1$)
 */
const COSTS = {
  // Gemini Analysis
  geminiFlash: 5,          // 5 credits for multimodal analysis
  
  // Flux 2 Pro Generation
  fluxBase: 100,           // Base cost for single-pass
  
  // Resolution multipliers
  resolutionMultipliers: {
    '1K': 1.0,             // 1024x1024 or similar
    '2K': 1.5,             // 2048x2048 or similar
    '4K': 2.5,             // 4096x4096 or similar
  },
  
  // Format multipliers
  formatMultipliers: {
    '1:1': 1.0,            // Square
    '3:4': 1.1,            // Portrait
    '4:3': 1.1,            // Landscape
    '9:16': 1.2,           // Vertical
    '16:9': 1.2,           // Horizontal
    '21:9': 1.3,           // Ultra-wide
  },
  
  // References
  perReference: 2,         // 2 credits per reference image
  
  // Multi-pass
  multiPassBase: 50,       // Additional 50 credits for multi-pass mode
  perPass: 20,             // 20 credits per additional pass
};

/**
 * Calculate total cost for generation
 */
export function calculateCost(specs: GenerationSpecs): CostBreakdown {
  const steps: CostBreakdown['steps'] = [];
  
  // 1. Gemini Analysis (always included)
  const geminiCost = COSTS.geminiFlash;
  steps.push({
    name: 'Gemini Analysis',
    credits: geminiCost,
    description: 'Multimodal intent analysis with Gemini 2.0 Flash'
  });
  
  // 2. Flux Base Cost
  let fluxCost = COSTS.fluxBase;
  steps.push({
    name: 'Flux 2 Pro Base',
    credits: COSTS.fluxBase,
    description: 'Base generation with Flux 2 Pro'
  });
  
  // 3. Resolution Multiplier
  const resMultiplier = COSTS.resolutionMultipliers[specs.resolution as keyof typeof COSTS.resolutionMultipliers] || 1.0;
  if (resMultiplier > 1.0) {
    const resolutionCost = Math.round(COSTS.fluxBase * (resMultiplier - 1.0));
    fluxCost += resolutionCost;
    steps.push({
      name: `${specs.resolution} Resolution`,
      credits: resolutionCost,
      description: `${resMultiplier}x multiplier for ${specs.resolution}`
    });
  }
  
  // 4. Format Multiplier
  const formatMultiplier = COSTS.formatMultipliers[specs.format as keyof typeof COSTS.formatMultipliers] || 1.0;
  if (formatMultiplier > 1.0) {
    const formatCost = Math.round(COSTS.fluxBase * (formatMultiplier - 1.0));
    fluxCost += formatCost;
    steps.push({
      name: `${specs.format} Format`,
      credits: formatCost,
      description: `${formatMultiplier}x multiplier for ${specs.format} aspect ratio`
    });
  }
  
  // 5. References
  const referencesCost = specs.referencesCount * COSTS.perReference;
  if (referencesCost > 0) {
    steps.push({
      name: 'References',
      credits: referencesCost,
      description: `${specs.referencesCount} reference image${specs.referencesCount > 1 ? 's' : ''} @ ${COSTS.perReference} credits each`
    });
  }
  
  // 6. Multi-pass
  let multiPassCost = 0;
  if (specs.mode === 'multi-pass') {
    multiPassCost = COSTS.multiPassBase;
    const passes = specs.passes || 2;
    if (passes > 1) {
      multiPassCost += (passes - 1) * COSTS.perPass;
    }
    steps.push({
      name: 'Multi-Pass Mode',
      credits: multiPassCost,
      description: `${passes} passes for enhanced quality`
    });
  }
  
  const total = geminiCost + fluxCost + referencesCost + multiPassCost;
  
  return {
    geminiAnalysis: geminiCost,
    fluxGeneration: fluxCost,
    references: referencesCost,
    multiPass: multiPassCost,
    total,
    steps
  };
}

/**
 * Get recommended settings for budget
 */
export function getRecommendedSettings(maxCredits: number): GenerationSpecs {
  // Start with minimal settings
  let specs: GenerationSpecs = {
    format: '1:1',
    resolution: '1K',
    mode: 'single-pass',
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
  
  if (maxCredits >= calculateCost({ ...specs, resolution: '4K' }).total) {
    specs.resolution = '4K';
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
  
  // Try multi-pass
  const multiPassSpecs = { ...specs, mode: 'multi-pass' as const, passes: 2 };
  if (calculateCost(multiPassSpecs).total <= maxCredits) {
    specs = multiPassSpecs;
  }
  
  return specs;
}

/**
 * Format cost in dollars
 */
export function formatCost(credits: number): string {
  const dollars = credits * 0.1;
  return `$${dollars.toFixed(2)}`;
}

/**
 * Validate specs combination
 */
export function validateSpecs(specs: GenerationSpecs): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check references count
  if (specs.referencesCount < 0) {
    errors.push('References count cannot be negative');
  }
  
  if (specs.referencesCount > 8) {
    errors.push('Maximum 8 references allowed');
  }
  
  // Check multi-pass
  if (specs.mode === 'multi-pass') {
    if (!specs.passes || specs.passes < 2) {
      errors.push('Multi-pass mode requires at least 2 passes');
    }
    
    if (specs.passes && specs.passes > 5) {
      errors.push('Maximum 5 passes allowed');
    }
  }
  
  // Check format
  const validFormats = ['1:1', '3:4', '4:3', '9:16', '16:9', '21:9'];
  if (!validFormats.includes(specs.format)) {
    errors.push(`Invalid format. Must be one of: ${validFormats.join(', ')}`);
  }
  
  // Check resolution
  const validResolutions = ['1K', '2K', '4K'];
  if (!validResolutions.includes(specs.resolution)) {
    errors.push(`Invalid resolution. Must be one of: ${validResolutions.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get cost tier (for UI styling)
 */
export function getCostTier(credits: number): 'low' | 'medium' | 'high' | 'premium' {
  if (credits < 50) return 'low';
  if (credits < 100) return 'medium';
  if (credits < 150) return 'high';
  return 'premium';
}
