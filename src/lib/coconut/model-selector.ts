// Coconut Model Selector — Dynamic LLM selection based on mode, complexity, and input size.
// Chooses the optimal LLM for CocoBoard blueprint generation to balance quality vs cost.

export type CocoboardMode = 'image' | 'video' | 'campaign';

/**
 * Select the optimal LLM preference for CocoBoard generation based on mode, asset count, and intent length.
 * 
 * Returns 'fast' or 'smart' — the LLM cascade will try free providers first
 * (Cloudflare → Groq → Nvidia) before falling back to paid Kie AI.
 * 
 * Strategy:
 * - 'fast' → Cloudflare Llama 3 8B → Groq Llama 3.1 8B → Nvidia → Kie Gemini 2.5 Flash
 * - 'smart' → Cloudflare Llama 3 8B → Groq Llama 3.3 70B → Nvidia Llama 4 Scout → Kie Gemini 3 Flash
 * 
 * Kie AI is ALWAYS the last resort — the company only pays if all free providers fail.
 */
export function selectCoconutLLM(
  mode: CocoboardMode,
  assetCount: number,
  intentLength: number,
): 'fast' | 'smart' {
  // Campaign → smart (complex multi-post planning, strategic narrative)
  if (mode === 'campaign') return 'smart';

  // Video complex → smart (multi-shot interdependent planning)
  if (mode === 'video' && assetCount > 3) return 'smart';
  if (mode === 'video' && intentLength > 200) return 'smart';
  if (mode === 'video') return 'fast';

  // Image simple → fast (single prompt, short intent)
  if (mode === 'image' && assetCount <= 1 && intentLength < 100) return 'fast';
  // Image medium → fast (2-3 step composition)
  if (mode === 'image' && assetCount <= 3) return 'fast';
  // Image complex (many assets or long brief) → smart
  return 'smart';
}

/**
 * Kie AI image generation model IDs.
 * Used by the orchestrator when executing image generation steps.
 */
export const KIE_IMAGE_IDS: Record<string, string> = {
  'flux-2-pro':       'flux-2/pro-text-to-image',
  'flux-2-flex':      'flux-2/flex-text-to-image',
  'flux-2-dev':       'flux-2/dev-text-to-image',
  'nano-banana-pro':  'nano-banana-pro',
  'nano-banana-2':    'nano-banana-2',
  'qwen2-image':      'qwen2/text-to-image',
};

/**
 * Kie AI video generation model IDs.
 * Used by the orchestrator when executing video generation steps.
 */
export const KIE_VIDEO_IDS: Record<string, string> = {
  'kling-3-std':      'kling-3.0/video',
  'kling-3-pro':      'kling-3.0/video',
  'kling-2.6-motion': 'kling-2.6/motion-control',
  'wan-2.6':          'wan/2-6-video-to-video',
  'seedance-1.5':     'bytedance/seedance-1.5-pro',
  'veo-3':            'veo-3/video',
};

/**
 * Image generation credit costs per model + resolution.
 * Used for estimating generation costs in CocoBoard blueprints.
 */
export const IMAGE_CREDIT_COSTS: Record<string, number> = {
  'flux-2-pro-1K':       2,
  'flux-2-pro-2K':       2,
  'flux-2-flex-1K':      1,
  'flux-2-flex-2K':      2,
  'flux-2-dev-1K':       1,
  'flux-2-dev-2K':       1,
  'nano-banana-pro-2K':  3,
  'nano-banana-pro-4K':  4,
  'nano-banana-2-2K':    2,
  'nano-banana-2-4K':    3,
  'qwen2-image-1K':      1,
  'qwen2-image-2K':      2,
};

/**
 * Video generation credit costs per model per second.
 * Used for estimating generation costs in CocoBoard blueprints.
 */
export const VIDEO_CREDIT_COSTS_PER_SECOND: Record<string, number> = {
  'kling-3-std':  2,
  'kling-3-pro':  3,
  'wan-2.6':      3,
  'seedance-1.5': 2,
  'veo-3':        4,
};
