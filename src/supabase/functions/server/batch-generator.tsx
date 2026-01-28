/**
 * BATCH GENERATOR - Enterprise Feature Backend
 * 
 * Génère plusieurs variantes d'un même concept en parallèle ou séquentiel
 * 
 * Features:
 * - 4 types de variations (seed, prompt, style, creative)
 * - Parallel ou sequential generation
 * - Batch discounts automatiques
 * - Preserve core elements option
 * - Cost calculation et deduction
 */

import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY')!;

// ============================================
// TYPES
// ============================================

export type VariationType = 'seed' | 'prompt' | 'style' | 'creative';

export interface BatchConfig {
  count: number;
  variationType: VariationType;
  preserveCore: boolean;
  parallelGeneration: boolean;
}

export interface BatchGenerationRequest {
  projectId: string;
  userId: string;
  boardId: string;
  batchConfig: BatchConfig;
  basePrompt: string;
  baseSpecs: {
    model: string;
    ratio: string;
    resolution: string;
  };
  analysis: {
    colorPalette: any;
    styleHints: string[];
    compositionHints: string[];
  };
}

export interface BatchVariant {
  id: string;
  imageUrl: string;
  prompt: string;
  seed: number;
  variationType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// ============================================
// COST MULTIPLIERS & DISCOUNTS
// ============================================

const VARIATION_TYPE_MULTIPLIERS: Record<VariationType, number> = {
  seed: 1.0,
  prompt: 1.1,
  style: 1.2,
  creative: 1.3,
};

const BATCH_DISCOUNTS = [
  { minCount: 10, discount: 0.15 },
  { minCount: 7, discount: 0.10 },
  { minCount: 5, discount: 0.05 },
];

// ============================================
// VARIATION GENERATORS
// ============================================

/**
 * Generate seed variations (same prompt, different seeds)
 */
function generateSeedVariations(
  basePrompt: string,
  count: number
): Array<{ prompt: string; seed: number }> {
  const variations = [];
  
  for (let i = 0; i < count; i++) {
    variations.push({
      prompt: basePrompt,
      seed: Math.floor(Math.random() * 1000000),
    });
  }
  
  return variations;
}

/**
 * Generate prompt variations using Gemini
 */
async function generatePromptVariations(
  basePrompt: string,
  count: number,
  analysis: any,
  preserveCore: boolean
): Promise<Array<{ prompt: string; seed: number }>> {
  console.log(`🎨 Generating ${count} prompt variations...`);
  
  const variations = [];
  
  // Prompt variation templates
  const angleVariations = [
    'from a bird\'s eye view',
    'from a low angle perspective',
    'from a side view',
    'close-up detailed shot',
    'wide establishing shot',
    'from a Dutch angle',
  ];
  
  const lightingVariations = [
    'with natural window lighting',
    'with dramatic studio lighting',
    'with soft ambient lighting',
    'with golden hour warm glow',
    'with cool blue hour tones',
    'with cinematic rim lighting',
  ];
  
  const atmosphereVariations = [
    'calm and serene atmosphere',
    'dynamic and energetic mood',
    'minimalist and clean aesthetic',
    'rich and detailed environment',
    'moody and atmospheric',
    'bright and airy feeling',
  ];
  
  // Core elements to preserve
  const coreElements = preserveCore 
    ? `Preserve these core elements: ${analysis.compositionHints?.slice(0, 2).join(', ')}`
    : '';
  
  for (let i = 0; i < count; i++) {
    const angle = angleVariations[i % angleVariations.length];
    const lighting = lightingVariations[Math.floor(i / 2) % lightingVariations.length];
    const atmosphere = atmosphereVariations[Math.floor(i / 3) % atmosphereVariations.length];
    
    let variantPrompt = basePrompt;
    
    // Add variation modifiers
    if (i % 3 === 0) {
      variantPrompt += `, ${angle}, ${lighting}`;
    } else if (i % 3 === 1) {
      variantPrompt += `, ${lighting}, ${atmosphere}`;
    } else {
      variantPrompt += `, ${angle}, ${atmosphere}`;
    }
    
    if (coreElements) {
      variantPrompt += `. ${coreElements}`;
    }
    
    variations.push({
      prompt: variantPrompt,
      seed: Math.floor(Math.random() * 1000000),
    });
  }
  
  return variations;
}

/**
 * Generate style variations
 */
async function generateStyleVariations(
  basePrompt: string,
  count: number,
  analysis: any,
  preserveCore: boolean
): Promise<Array<{ prompt: string; seed: number }>> {
  console.log(`🎨 Generating ${count} style variations...`);
  
  const variations = [];
  
  const stylePresets = [
    'minimalist style with clean lines and negative space',
    'industrial aesthetic with raw materials and exposed elements',
    'biophilic design with natural elements and organic shapes',
    'maximalist approach with rich details and layered textures',
    'scandinavian style with light woods and muted tones',
    'art deco elegance with geometric patterns and luxury materials',
    'brutalist concrete and bold architectural forms',
    'mid-century modern with vintage furniture and warm tones',
    'contemporary sleek design with glass and metal',
    'rustic farmhouse aesthetic with weathered textures',
  ];
  
  // Core composition to preserve
  const coreComposition = preserveCore && analysis.compositionHints?.length > 0
    ? `Maintain ${analysis.compositionHints[0]}`
    : '';
  
  for (let i = 0; i < count; i++) {
    const style = stylePresets[i % stylePresets.length];
    
    let variantPrompt = `${basePrompt}, ${style}`;
    
    if (coreComposition) {
      variantPrompt += `. ${coreComposition}`;
    }
    
    variations.push({
      prompt: variantPrompt,
      seed: Math.floor(Math.random() * 1000000),
    });
  }
  
  return variations;
}

/**
 * Generate creative mix variations (combines all types)
 */
async function generateCreativeMixVariations(
  basePrompt: string,
  count: number,
  analysis: any,
  preserveCore: boolean
): Promise<Array<{ prompt: string; seed: number }>> {
  console.log(`🎨 Generating ${count} creative mix variations...`);
  
  const variations = [];
  
  // Combine elements from all variation types
  const promptVars = await generatePromptVariations(basePrompt, Math.ceil(count / 3), analysis, preserveCore);
  const styleVars = await generateStyleVariations(basePrompt, Math.ceil(count / 3), analysis, preserveCore);
  const seedVars = generateSeedVariations(basePrompt, Math.ceil(count / 3));
  
  // Mix them creatively
  const allVars = [...promptVars, ...styleVars, ...seedVars];
  
  // Shuffle and take the requested count
  for (let i = 0; i < count; i++) {
    const idx = i % allVars.length;
    variations.push(allVars[idx]);
  }
  
  return variations.slice(0, count);
}

// ============================================
// MAIN VARIATION GENERATOR
// ============================================

async function generateVariations(
  basePrompt: string,
  config: BatchConfig,
  analysis: any
): Promise<Array<{ prompt: string; seed: number }>> {
  console.log(`🔄 Generating ${config.count} variations of type: ${config.variationType}`);
  
  switch (config.variationType) {
    case 'seed':
      return generateSeedVariations(basePrompt, config.count);
    
    case 'prompt':
      return generatePromptVariations(basePrompt, config.count, analysis, config.preserveCore);
    
    case 'style':
      return generateStyleVariations(basePrompt, config.count, analysis, config.preserveCore);
    
    case 'creative':
      return generateCreativeMixVariations(basePrompt, config.count, analysis, config.preserveCore);
    
    default:
      throw new Error(`Unknown variation type: ${config.variationType}`);
  }
}

// ============================================
// IMAGE GENERATION (REPLICATE)
// ============================================

async function generateImageWithReplicate(
  prompt: string,
  seed: number,
  specs: any
): Promise<string> {
  console.log(`🎨 Generating image with seed ${seed}...`);
  
  // Parse resolution
  const [width, height] = specs.resolution.split('x').map(Number);
  
  // Create prediction
  const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4', // FLUX schnell
      input: {
        prompt,
        width,
        height,
        num_outputs: 1,
        seed,
        output_format: 'png',
        output_quality: 90,
      },
    }),
  });
  
  if (!createResponse.ok) {
    throw new Error(`Failed to create prediction: ${createResponse.statusText}`);
  }
  
  const prediction = await createResponse.json();
  const predictionId = prediction.id;
  
  // Poll for completion
  let finalPrediction = prediction;
  let attempts = 0;
  const maxAttempts = 60; // 60 seconds max
  
  while (finalPrediction.status !== 'succeeded' && finalPrediction.status !== 'failed' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_KEY}`,
      },
    });
    
    finalPrediction = await pollResponse.json();
    attempts++;
  }
  
  if (finalPrediction.status === 'failed') {
    throw new Error(`Image generation failed: ${finalPrediction.error}`);
  }
  
  if (!finalPrediction.output || finalPrediction.output.length === 0) {
    throw new Error('No output from image generation');
  }
  
  return finalPrediction.output[0];
}

// ============================================
// COST CALCULATION
// ============================================

export function calculateBatchCost(baseCost: number, config: BatchConfig): {
  baseTotal: number;
  discount: number;
  total: number;
  perVariant: number;
} {
  const typeMultiplier = VARIATION_TYPE_MULTIPLIERS[config.variationType];
  const baseTotal = Math.ceil(baseCost * config.count * typeMultiplier);
  
  // Find applicable discount
  const applicableDiscount = BATCH_DISCOUNTS.find(tier => config.count >= tier.minCount);
  const discount = applicableDiscount?.discount || 0;
  
  const total = Math.ceil(baseTotal * (1 - discount));
  const perVariant = Math.ceil(total / config.count);
  
  return {
    baseTotal,
    discount,
    total,
    perVariant,
  };
}

// ============================================
// MAIN BATCH GENERATION FUNCTION
// ============================================

export async function generateBatch(request: BatchGenerationRequest): Promise<{
  success: boolean;
  batchId: string;
  variants: BatchVariant[];
  totalCost: number;
  estimatedTime: number;
  error?: string;
}> {
  const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`🚀 Starting batch generation: ${batchId}`);
  console.log(`   Config:`, request.batchConfig);
  
  try {
    // 1. Generate variation prompts
    const variations = await generateVariations(
      request.basePrompt,
      request.batchConfig,
      request.analysis
    );
    
    console.log(`✅ Generated ${variations.length} variation configs`);
    
    // 2. Initialize variants
    const variants: BatchVariant[] = variations.map((v, i) => ({
      id: `var_${batchId}_${i}`,
      imageUrl: '',
      prompt: v.prompt,
      seed: v.seed,
      variationType: request.batchConfig.variationType,
      status: 'pending' as const,
    }));
    
    // 3. Calculate cost
    const baseCost = 10; // Base cost per image
    const costInfo = calculateBatchCost(baseCost, request.batchConfig);
    
    console.log(`💰 Total cost: ${costInfo.total} credits (discount: ${costInfo.discount * 100}%)`);
    
    // 4. Deduct credits
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: currentCredits } = await supabase
      .from('kv_store_e55aa214')
      .select('value')
      .eq('key', `credits:${request.userId}`)
      .single();
    
    const credits = currentCredits?.value || { free: 0, paid: 0 };
    const totalAvailable = credits.free + credits.paid;
    
    if (totalAvailable < costInfo.total) {
      throw new Error(`Insufficient credits. Need ${costInfo.total}, have ${totalAvailable}`);
    }
    
    // Deduct from paid first, then free
    let remaining = costInfo.total;
    let newPaid = credits.paid;
    let newFree = credits.free;
    
    if (newPaid >= remaining) {
      newPaid -= remaining;
      remaining = 0;
    } else {
      remaining -= newPaid;
      newPaid = 0;
      newFree -= remaining;
    }
    
    await supabase
      .from('kv_store_e55aa214')
      .upsert({
        key: `credits:${request.userId}`,
        value: { free: newFree, paid: newPaid },
        updated_at: new Date().toISOString(),
      });
    
    console.log(`✅ Deducted ${costInfo.total} credits`);
    
    // 5. Generate images (parallel or sequential)
    const startTime = Date.now();
    
    if (request.batchConfig.parallelGeneration) {
      console.log(`⚡ Generating ${variants.length} images in PARALLEL...`);
      
      // Generate all in parallel
      const promises = variants.map(async (variant) => {
        try {
          variant.status = 'processing';
          const imageUrl = await generateImageWithReplicate(
            variant.prompt,
            variant.seed,
            request.baseSpecs
          );
          variant.imageUrl = imageUrl;
          variant.status = 'completed';
          console.log(`✅ Completed variant ${variant.id}`);
        } catch (error) {
          console.error(`❌ Failed variant ${variant.id}:`, error);
          variant.status = 'failed';
          variant.error = error instanceof Error ? error.message : 'Unknown error';
        }
      });
      
      await Promise.all(promises);
      
    } else {
      console.log(`🔄 Generating ${variants.length} images SEQUENTIALLY...`);
      
      // Generate one by one
      for (const variant of variants) {
        try {
          variant.status = 'processing';
          const imageUrl = await generateImageWithReplicate(
            variant.prompt,
            variant.seed,
            request.baseSpecs
          );
          variant.imageUrl = imageUrl;
          variant.status = 'completed';
          console.log(`✅ Completed variant ${variant.id}`);
        } catch (error) {
          console.error(`❌ Failed variant ${variant.id}:`, error);
          variant.status = 'failed';
          variant.error = error instanceof Error ? error.message : 'Unknown error';
        }
      }
    }
    
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`⏱️  Total generation time: ${totalTime}s`);
    
    // 6. Save batch to KV store
    await supabase
      .from('kv_store_e55aa214')
      .upsert({
        key: `batch:${batchId}`,
        value: {
          projectId: request.projectId,
          userId: request.userId,
          boardId: request.boardId,
          config: request.batchConfig,
          variants,
          totalCost: costInfo.total,
          estimatedTime: totalTime,
          createdAt: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      });
    
    console.log(`✅ Batch generation complete: ${batchId}`);
    
    return {
      success: true,
      batchId,
      variants,
      totalCost: costInfo.total,
      estimatedTime: totalTime,
    };
    
  } catch (error) {
    console.error(`❌ Batch generation failed:`, error);
    
    return {
      success: false,
      batchId,
      variants: [],
      totalCost: 0,
      estimatedTime: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
