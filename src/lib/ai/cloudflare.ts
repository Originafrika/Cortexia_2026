/**
 * Cloudflare Workers AI Service
 * PRIMARY Free Tier Provider (Backend)
 * 
 * Free allocation: 10,000 Neurons per day (backend budget only)
 * Users still limited to 5 generations/day via main AI service
 * 
 * Key model:
 * - @cf/black-forest-labs/flux-1-schnell: 4.80 neurons per 512x512 tile
 */

// @ts-ignore - Module may not be installed
import { Redis } from '@upstash/redis';

// Initialize Redis for backend neuron tracking only
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const redis: any = new Redis({
  url: typeof window !== 'undefined' 
    ? (import.meta as any).env?.VITE_UPSTASH_REDIS_REST_URL 
    : process?.env?.VITE_UPSTASH_REDIS_REST_URL,
  token: typeof window !== 'undefined'
    ? (import.meta as any).env?.VITE_UPSTASH_REDIS_REST_TOKEN
    : process?.env?.VITE_UPSTASH_REDIS_REST_TOKEN,
});

const CLOUDFLARE_ACCOUNT_ID = typeof window !== 'undefined' 
  ? (import.meta as any).env?.VITE_CF_ACCOUNT_ID 
  : process?.env?.CF_ACCOUNT_ID;

const CLOUDFLARE_API_TOKEN = typeof window !== 'undefined'
  ? (import.meta as any).env?.VITE_CF_API_TOKEN
  : process?.env?.CF_API_TOKEN;

const CLOUDFLARE_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}`;

// Backend tracking only - not exposed to users
export const CLOUDFLARE_FREE_TIER = {
  dailyNeuronLimit: 10000,
  resetHour: 0, // UTC midnight
};

export const CLOUDFLARE_MODELS = {
  'flux-1-schnell': {
    id: '@cf/black-forest-labs/flux-1-schnell',
    name: 'Flux 1 Schnell',
    type: 'image',
    neuronsPerTile: 4.80,
    neuronsPerStep: 9.60,
  },
} as const;

export type CloudflareModel = keyof typeof CLOUDFLARE_MODELS;

export interface CloudflareImageParams {
  prompt: string;
  model: CloudflareModel;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
}

// Backend-only result - no neuron info exposed to users
export interface CloudflareGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Calculate neurons needed (backend only)
 */
export function calculateNeuronCost(
  model: CloudflareModel,
  width: number = 512,
  height: number = 512,
  steps: number = 4
): number {
  const config = CLOUDFLARE_MODELS[model];
  if (!config) return 0;

  // Calculate tiles (512x512 base)
  const tilesX = Math.ceil(width / 512);
  const tilesY = Math.ceil(height / 512);
  const totalTiles = tilesX * tilesY;

  // Base cost for tiles + step cost
  const baseCost = config.neuronsPerTile * totalTiles;
  const stepCost = config.neuronsPerStep * steps;

  return Math.round((baseCost + stepCost) * 100) / 100;
}

/**
 * Backend key for tracking total platform neuron usage
 */
function getPlatformNeuronKey(): string {
  const today = new Date().toISOString().split('T')[0];
  return `platform:cloudflare:neurons:${today}`;
}

/**
 * Check if platform has neurons available (backend only)
 */
export async function checkPlatformNeuronAvailability(
  estimatedCost: number
): Promise<boolean> {
  try {
    const key = getPlatformNeuronKey();
    const currentUsage = (await redis.get(key) as number | null) ?? 0;
    return (CLOUDFLARE_FREE_TIER.dailyNeuronLimit - currentUsage) >= estimatedCost;
  } catch (error) {
    console.error('Error checking platform neurons:', error);
    return true; // Fail open
  }
}

/**
 * Record platform neuron usage (backend only)
 */
export async function recordPlatformNeuronUsage(neuronsUsed: number): Promise<void> {
  try {
    const key = getPlatformNeuronKey();
    const currentUsage = (await redis.get(key) as number | null) ?? 0;
    const newUsage = currentUsage + neuronsUsed;
    
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);
    const ttlSeconds = Math.floor((midnight.getTime() - now.getTime()) / 1000);
    
    await redis.set(key, newUsage, { ex: ttlSeconds });
  } catch (error) {
    console.error('Error recording neuron usage:', error);
  }
}

/**
 * Generate image using Cloudflare Workers AI
 * Called by main AI service after checking user's 5/day limit
 */
export async function generateCloudflareImage(
  params: CloudflareImageParams
): Promise<CloudflareGenerationResult> {
  const apiKey = typeof window !== 'undefined' 
    ? (import.meta as any).env?.VITE_CLOUDFLARE_API_KEY 
    : undefined;
  
  const accountId = typeof window !== 'undefined'
    ? (import.meta as any).env?.VITE_CLOUDFLARE_ACCOUNT_ID
    : undefined;

  if (!apiKey || !accountId) {
    return {
      success: false,
      error: 'Cloudflare credentials not configured',
    };
  }

  const modelConfig = CLOUDFLARE_MODELS[params.model];
  if (!modelConfig) {
    return {
      success: false,
      error: `Unknown model: ${params.model}`,
    };
  }

  const estimatedCost = calculateNeuronCost(
    params.model,
    params.width,
    params.height,
    params.steps
  );

  // Backend check: ensure we have budget
  const hasBudget = await checkPlatformNeuronAvailability(estimatedCost);
  if (!hasBudget) {
    return {
      success: false,
      error: 'Platform budget exhausted',
    };
  }

  try {
    const response = await fetch(`${CLOUDFLARE_BASE_URL}/ai/run/${modelConfig.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        width: params.width || 512,
        height: params.height || 512,
        num_steps: params.steps || 4,
        seed: params.seed,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare AI error: ${response.status} - ${error}`);
    }

    const result = await response.json();

    if (result.success && result.result?.image) {
      // Record backend usage
      await recordPlatformNeuronUsage(estimatedCost);

      return {
        success: true,
        imageUrl: `data:image/png;base64,${result.result.image}`,
      };
    }

    return {
      success: false,
      error: result.errors?.[0]?.message || 'Image generation failed',
    };

  } catch (error) {
    console.error('Cloudflare AI generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if Cloudflare AI is properly configured
 */
export function isCloudflareConfigured(): boolean {
  const apiKey = typeof window !== 'undefined' 
    ? (import.meta as any).env?.VITE_CLOUDFLARE_API_KEY 
    : undefined;
  const accountId = typeof window !== 'undefined'
    ? (import.meta as any).env?.VITE_CLOUDFLARE_ACCOUNT_ID
    : undefined;
  
  return !!(apiKey && accountId);
}
