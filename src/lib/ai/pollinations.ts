/**
 * POLLINATIONS AI SERVICE - Free Tier
 * 
 * Based on official Pollinations pricing (April 2025):
 * - Seed tier: 0.15 pollen/hour = 3.6$/day of free generations
 * - Tier grants used first, then purchased pollen
 * - PAID models require purchased pollen only
 * 
 * FREE models (can use tier grants):
 * - Flux Schnell (flux): $0.001/img, cap 1K
 * - Z-Image Turbo (zimage): $0.002/img, cap 500
 * - FLUX.2 Klein 4B (klein): $0.01/img, cap 100
 * 
 * PAID models (purchased pollen only) → routed to Kie AI:
 * - Pruna p-image, p-image-edit, Grok Imagine, Seedream series
 * - Wan 2.7 Image, Kontext, NanoBanana, GPT Image, Nova Canvas
 */

const POLLINATIONS_BASE_URL = 'https://image.pollinations.ai';
const POLLINATIONS_TEXT_URL = 'https://text.pollinations.ai';

// FREE models (can use tier grants)
export const FREE_TIER_MODELS = {
  flux: 'flux',           // Flux Schnell - $0.001/img, cap 1K
  zimage: 'zimage',       // Z-Image Turbo - $0.002/img, cap 500
  klein: 'klein',         // FLUX.2 Klein 4B - $0.01/img, cap 100
} as const;

// PAID models (purchased pollen only) - listed for reference, routed to Kie AI
export const PAID_MODELS = {
  pImage: 'p-image',               // Pruna p-image - $0.005/img
  pImageEdit: 'p-image-edit',      // Pruna p-image-edit - $0.01/img
  grokImagine: 'grok-imagine',      // Grok Imagine - $0.02/img
  seedream: 'seedream',            // Seedream 4.0 - $0.03/img
  qwenImage: 'qwen-image',         // Qwen Image Plus - $0.03/img
  seedream5: 'seedream5',          // Seedream 5.0 Lite - $0.035/img
  wanImage: 'wan-image',           // Wan 2.7 Image - $0.035/img
  kontext: 'kontext',            // FLUX.1 Kontext - $0.04/img
  nanobanana: 'nanobanana',        // NanoBanana - $0.3/M tokens
  seedreamPro: 'seedream-pro',      // Seedream 4.5 Pro - $0.04/img
  novaCanvas: 'nova-canvas',       // Amazon Nova Canvas - $0.04/img
  nanobanana2: 'nanobanana-2',     // NanoBanana 2 - $0.5/M tokens
  wanImagePro: 'wan-image-pro',    // Wan 2.7 Image Pro - $0.075/img
  grokImaginePro: 'grok-imagine-pro', // Grok Imagine Pro - $0.07/img
  nanobananaPro: 'nanobanana-pro',  // NanoBanana Pro - $1.25/M tokens
  gptimage: 'gptimage',            // GPT Image 1 Mini - $2.0/M tokens
  gptimageLarge: 'gptimage-large',   // GPT Image 1.5 - $5.0/M tokens
} as const;

export type FreeTierModel = keyof typeof FREE_TIER_MODELS;
export type PaidModel = keyof typeof PAID_MODELS;

// Pricing per image (USD)
export const POLLINATIONS_PRICING = {
  flux: 0.001,        // Flux Schnell - most economical
  zimage: 0.002,      // Z-Image Turbo
  klein: 0.01,        // FLUX.2 Klein 4B
} as const;

// Rate caps (requests per hour from Pollinations)
export const POLLINATIONS_CAPS = {
  flux: 1000,         // 1K requests/hour
  zimage: 500,        // 500 requests/hour
  klein: 100,         // 100 requests/hour
} as const;

export interface PollinationsImageParams {
  prompt: string;
  model?: FreeTierModel;
  width?: number;
  height?: number;
  seed?: number;
  nologo?: boolean;       // false = watermark (default for free)
  negativePrompt?: string;
  enhance?: boolean;
}

export interface PollinationsTextParams {
  prompt: string;
  model?: 'openai' | 'llama' | 'mistral' | 'claude' | 'gemini';
  seed?: number;
  jsonMode?: boolean;
  systemPrompt?: string;
  temperature?: number;
}

export interface GenerationResult {
  url: string;
  seed: number;
  model: string;
  usedWatermark: boolean;
}

/**
 * Generate image using Pollinations (free tier)
 */
export async function generateFreeImage(
  params: PollinationsImageParams
): Promise<GenerationResult> {
  const {
    prompt,
    model = 'flux',
    width = 1024,
    height = 1024,
    seed = Math.floor(Math.random() * 1000000),
    nologo = false, // Always watermark for free tier
    negativePrompt,
    enhance = true
  } = params;

  // Build query parameters
  const queryParams = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    seed: seed.toString(),
    nologo: nologo.toString(),
    enhance: enhance.toString(),
    model: FREE_TIER_MODELS[model]
  });

  if (negativePrompt) {
    queryParams.append('negative', negativePrompt);
  }

  const url = `${POLLINATIONS_BASE_URL}/prompt/${encodeURIComponent(prompt)}?${queryParams.toString()}`;

  console.log('[Pollinations] Generating free image:', { model, width, height, seed });

  // Pollinations returns image directly
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Pollinations generation failed: ${response.status} ${response.statusText}`);
  }

  // Return the URL (image is served directly)
  return {
    url,
    seed,
    model: FREE_TIER_MODELS[model],
    usedWatermark: !nologo
  };
}

/**
 * Generate text using Pollinations (free tier)
 */
export async function generateFreeText(
  params: PollinationsTextParams
): Promise<string> {
  const {
    prompt,
    model = 'openai',
    seed = Math.floor(Math.random() * 1000000),
    jsonMode = false,
    systemPrompt,
    temperature = 0.7
  } = params;

  const body: Record<string, any> = {
    messages: [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt }
    ],
    model,
    seed,
    temperature
  };

  if (jsonMode) {
    body.jsonMode = true;
  }

  const POLLINATIONS_API_KEY = typeof window !== 'undefined' 
  ? (import.meta as any).env?.VITE_POLLINATIONS_API_KEY || ''
  : '';

  const response = await fetch(POLLINATIONS_TEXT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${POLLINATIONS_API_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Pollinations text generation failed: ${response.status}`);
  }

  const data = await response.json();
  return data.text || data.content || data.message || '';
}

/**
 * Check if model is available on free tier
 * PAID models require purchased pollen only
 */
export function isFreeTierModel(model: string): boolean {
  return Object.keys(FREE_TIER_MODELS).includes(model);
}

/**
 * Check if model is PAID (purchased pollen only)
 */
export function isPaidModel(model: string): boolean {
  const paidModelValues = Object.values(PAID_MODELS) as string[];
  return paidModelValues.includes(model);
}

/**
 * Calculate cost for Pollinations generation
 * Flux Schnell: $0.001/image (3600 images/day possible with Seed tier)
 */
export function calculatePollinationsCost(
  model: FreeTierModel,
  count: number = 1
): number {
  const rate = POLLINATIONS_PRICING[model] || 0.001;
  return rate * count;
}

/**
 * Get rate cap for model (requests per hour)
 */
export function getModelCap(model: FreeTierModel): number {
  return POLLINATIONS_CAPS[model] || 100;
}

/**
 * Check if user has free generations remaining today
 * 
 * OPTIMIZATION: With 0.15 pollen/hour = 3.6$/day budget
 * Flux Schnell: $0.001/img = 3600 images/day max
 * Limit: 5 images/day per user = 720 users/day max
 */
export async function checkFreeGenerationsRemaining(
  userId: string,
  redis: { get: (key: string) => Promise<string | null>; set: (key: string, value: string, options?: { ex: number }) => Promise<void> }
): Promise<{ remaining: number; used: number; resetAt: Date }> {
  const today = new Date().toISOString().split('T')[0];
  const key = `free_gen:${userId}:${today}`;
  
  const used = parseInt(await redis.get(key) || '0', 10);
  // Seed tier: 0.15 pollen/hour × 24h = 3.6 pollen/day
  // Budget: 0.15 pollen/hour × 24h = 3.6$/day
  // Flux Schnell: $0.001/img = 3600 images/day max
  // Limit 5/day per user to serve 720 users/day (conservative)
  const FREE_DAILY_LIMIT = 5;
  const remaining = Math.max(0, FREE_DAILY_LIMIT - used);
  
  // Reset at midnight UTC
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  
  return {
    remaining,
    used,
    resetAt: tomorrow
  };
}

/**
 * Record a free generation usage
 */
export async function recordFreeGeneration(
  userId: string,
  redis: { get: (key: string) => Promise<string | null>; set: (key: string, value: string, options?: { ex: number }) => Promise<void> }
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const key = `free_gen:${userId}:${today}`;
  
  const current = parseInt(await redis.get(key) || '0', 10);
  
  // Set with 24h expiration
  const ttl = 24 * 60 * 60; // 24 hours
  await redis.set(key, (current + 1).toString(), { ex: ttl });
}

/**
 * List available free models with accurate pricing
 * PAID models excluded (routed to Kie AI)
 */
export function getFreeTierModels(): Array<{ id: FreeTierModel; name: string; description: string; cost: number; cap: number }> {
  return [
    { id: 'flux', name: 'Flux Schnell', description: 'Fastest, most economical ($0.001/img)', cost: 0.001, cap: 1000 },
    { id: 'zimage', name: 'Z-Image Turbo', description: 'Turbo speed with good quality', cost: 0.002, cap: 500 },
    { id: 'klein', name: 'FLUX.2 Klein 4B', description: 'Alpha model, 4B parameters', cost: 0.01, cap: 100 },
  ];
}

/**
 * Get recommended model based on use case
 */
export function getRecommendedModel(useCase: 'speed' | 'quality' | 'balanced'): FreeTierModel {
  switch (useCase) {
    case 'speed':
      return 'flux';  // Flux Schnell - fastest and cheapest
    case 'quality':
      return 'klein'; // FLUX.2 Klein - best quality among free
    case 'balanced':
    default:
      return 'zimage'; // Z-Image Turbo - good balance
  }
}
