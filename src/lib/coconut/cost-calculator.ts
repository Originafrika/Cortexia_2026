// Cost Calculator — Precise credit estimation for Coconut steps
// Calculates costs based on model, resolution, duration, and generation type

export type CoconutMode = 'image' | 'video' | 'campaign';

export interface ImageCostParams {
  model: string;
  resolution: '1K' | '2K' | '4K';
}

export interface VideoCostParams {
  model: string;
  duration: number; // seconds
  withAudio?: boolean;
  resolution?: '720p' | '1080p';
}

export interface StepCost {
  stepId: string;
  type: 'image' | 'video' | 'text' | 'cocoboard' | 'modification';
  model: string;
  credits: number;
  breakdown: string;
}

export interface TotalCost {
  cocoboard: number;
  generation: number;
  modification: number;
  total: number;
  steps: StepCost[];
}

// ============================================================================
// IMAGE COSTS
// ============================================================================

const IMAGE_COSTS: Record<string, Record<string, number>> = {
  'flux-2-pro':       { '1K': 2, '2K': 2, '4K': 4 },
  'flux-2-flex':      { '1K': 1, '2K': 2, '4K': 3 },
  'flux-2-dev':       { '1K': 1, '2K': 1, '4K': 2 },
  'nano-banana-pro':  { '1K': 2, '2K': 3, '4K': 4 },
  'nano-banana-2':    { '1K': 1, '2K': 2, '4K': 3 },
  'qwen2-image':      { '1K': 1, '2K': 2, '4K': 3 },
};

export function calculateImageCost(params: ImageCostParams): number {
  const modelCosts = IMAGE_COSTS[params.model];
  if (!modelCosts) return 2; // Default fallback
  return modelCosts[params.resolution] || 2;
}

// ============================================================================
// VIDEO COSTS
// ============================================================================

const VIDEO_COSTS_PER_SECOND: Record<string, { noAudio: number; withAudio: number }> = {
  'kling-3-std':  { noAudio: 2, withAudio: 3 },
  'kling-3-pro':  { noAudio: 3, withAudio: 4 },
  'kling-2.6-motion': { noAudio: 6, withAudio: 7 },
  'wan-2.6':      { noAudio: 2, withAudio: 3 },
  'seedance-1.5': { noAudio: 2, withAudio: 3 },
  'veo-3':        { noAudio: 3, withAudio: 5 },
};

// Wan 2.6 has fixed pricing for specific durations
const WAN_FIXED_COSTS: Record<string, Record<string, number>> = {
  '720p':  { '5': 8, '10': 15, '15': 22 },
  '1080p': { '5': 12, '10': 22, '15': 32 },
};

export function calculateVideoCost(params: VideoCostParams): number {
  if (params.model === 'wan-2.6') {
    const res = params.resolution || '720p';
    const dur = String(params.duration);
    return WAN_FIXED_COSTS[res]?.[dur] || Math.ceil(params.duration * 2);
  }

  const costs = VIDEO_COSTS_PER_SECOND[params.model];
  if (!costs) return Math.ceil(params.duration * 2); // Default fallback

  const rate = params.withAudio ? costs.withAudio : costs.noAudio;
  return Math.ceil(params.duration * rate);
}

// ============================================================================
// STEP COST CALCULATION
// ============================================================================

export function calculateStepCost(step: {
  id: string;
  type: string;
  model: string;
  resolution?: string;
  duration?: number;
  withAudio?: boolean;
}): StepCost {
  let credits = 0;
  let breakdown = '';

  if (step.type === 'image') {
    const resolution = (step.resolution as '1K' | '2K' | '4K') || '2K';
    credits = calculateImageCost({ model: step.model, resolution });
    breakdown = `${step.model} @ ${resolution}`;
  } else if (step.type === 'video') {
    const duration = step.duration || 5;
    const withAudio = step.withAudio || false;
    const resolution = (step.resolution as '720p' | '1080p') || '720p';
    credits = calculateVideoCost({ model: step.model, duration, withAudio, resolution });
    breakdown = `${step.model} · ${duration}s${withAudio ? ' +audio' : ''} @ ${resolution}`;
  } else if (step.type === 'text') {
    credits = 0;
    breakdown = 'Text only — no cost';
  } else {
    credits = 2;
    breakdown = `Unknown type: ${step.type}`;
  }

  return {
    stepId: step.id,
    type: step.type as StepCost['type'],
    model: step.model,
    credits,
    breakdown,
  };
}

// ============================================================================
// TOTAL COST CALCULATION
// ============================================================================

export function calculateTotalCost(steps: Array<{
  id: string;
  type: string;
  model: string;
  resolution?: string;
  duration?: number;
  withAudio?: boolean;
}>, options?: {
  cocoboardCost?: number;
  modificationCost?: number;
}): TotalCost {
  const cocoboardCost = options?.cocoboardCost ?? 100;
  const modificationCost = options?.modificationCost ?? 0;

  const stepCosts = steps.map(step => calculateStepCost(step));
  const generationCost = stepCosts.reduce((sum, s) => sum + s.credits, 0);

  return {
    cocoboard: cocoboardCost,
    generation: generationCost,
    modification: modificationCost,
    total: cocoboardCost + generationCost + modificationCost,
    steps: stepCosts,
  };
}

// ============================================================================
// COST BREAKDOWN FOR UI
// ============================================================================

export function formatCostBreakdown(total: TotalCost): string {
  const lines = [
    `📋 Cocoboard: ${total.cocoboard} crédits (fixe)`,
    `🎨 Génération: ${total.generation} crédits`,
  ];

  if (total.modification > 0) {
    lines.push(`✏️ Modifications: ${total.modification} crédits`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`💰 Total: ${total.total} crédits`);

  if (total.steps.length > 0) {
    lines.push('');
    lines.push('Détail par étape:');
    for (const step of total.steps) {
      lines.push(`  • ${step.stepId}: ${step.credits} cr — ${step.breakdown}`);
    }
  }

  return lines.join('\n');
}
