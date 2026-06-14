// Coconut Model Selector — Dynamic LLM selection based on mode, complexity, and input size.
// Chooses the optimal LLM for CocoBoard blueprint generation to balance quality vs cost.

export type CocoboardMode = 'image' | 'video' | 'campaign';

/**
 * AI MODELS DATABASE
 * Centralized knowledge about available models, their capabilities, and prompting styles.
 */
export const AI_MODELS = {
  // --- IMAGE MODELS ---
  'flux-2-pro': {
    id: 'flux-2-pro',
    name: 'FLUX.2 Pro (Kie)',
    provider: 'kie',
    type: 'image',
    capabilities: ['text-rendering', 'photorealism', 'multi-reference'],
    bestFor: 'Final high-fidelity commercial posters and hero images.',
    promptingStyle: 'Descriptive, technical camera settings, structural details. Responds well to explicit layout instructions.',
  },
  'flux-2-flex': {
    id: 'flux-2-flex',
    name: 'FLUX.2 Flex',
    provider: 'kie',
    type: 'image',
    capabilities: ['balanced-speed', 'high-fidelity'],
    bestFor: 'Fast iterations with professional quality.',
    promptingStyle: 'Natural language prompts, handles artistic styles well.',
  },
  'nano-banana-pro': {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    provider: 'kie',
    type: 'image',
    capabilities: ['character-consistency', 'skin-tones', 'luxury-aesthetic'],
    bestFor: 'African subjects, high-end fashion, and consistent brand personas.',
    promptingStyle: 'Atmospheric, focus on textures (skin, fabric), cinematic lighting descriptions.',
  },
  'nano-banana-2': {
    id: 'nano-banana-2',
    name: 'Nano Banana 2',
    provider: 'kie',
    type: 'image',
    capabilities: ['fast-iteration', 'i2i', 'compositing'],
    bestFor: 'Rapid prototyping and complex image-to-image editing.',
    promptingStyle: 'Direct instructions, focus on changes from reference, composition-heavy.',
  },

  // --- VIDEO MODELS ---
  'kling-3.0-pro': {
    id: 'kling-3.0-pro',
    name: 'Kling 3.0 Pro',
    provider: 'kie',
    type: 'video',
    capabilities: ['physics-accuracy', 'high-fidelity', 'close-ups'],
    bestFor: 'Product reveals, hero shots, and complex physical interactions.',
    promptingStyle: 'High detail on material properties, light refractions, and micro-movements.',
  },
  'wan-2.6': {
    id: 'wan-2.6',
    name: 'Wan 2.6 Pro',
    provider: 'kie',
    type: 'video',
    capabilities: ['temporal-stability', '1080p'],
    bestFor: 'Cinematic sequences requiring high stability across frames.',
    promptingStyle: 'Director-style instructions, specific camera gear mentions.',
  },
  'seedance-1.5': {
    id: 'seedance-1.5',
    name: 'Seedance 1.5',
    provider: 'kie',
    type: 'video',
    capabilities: ['audio-sync', 'camera-control'],
    bestFor: 'Ads with integrated sound design and precise camera paths.',
    promptingStyle: 'Sync-focused, rhythm-based action descriptions.',
  },
} as const;

/**
 * Select the optimal LLM preference for CocoBoard generation based on mode, asset count, and intent length.
 */
export function selectCoconutLLM(
  mode: CocoboardMode,
  assetCount: number,
  intentLength: number,
): 'fast' | 'smart' {
  if (mode === 'campaign') return 'smart';
  if (mode === 'video' && assetCount > 3) return 'smart';
  if (mode === 'video' && intentLength > 200) return 'smart';
  if (mode === 'video') return 'fast';
  if (mode === 'image' && assetCount <= 1 && intentLength < 100) return 'fast';
  if (mode === 'image' && assetCount <= 3) return 'fast';
  return 'smart';
}

/**
 * Kie AI image generation model IDs mapping.
 */
export const KIE_IMAGE_IDS: Record<string, string> = {
  'flux-2-pro':       'flux-2/pro',
  'flux-2-flex':      'flux-2/flex',
  'flux-2-dev':       'flux-2/dev',
  'nano-banana-pro':  'nano-banana-pro',
  'nano-banana-2':    'nano-banana-2',
};

/**
 * Kie AI video generation model IDs mapping.
 */
export const KIE_VIDEO_IDS: Record<string, string> = {
  'kling-3.0-pro':    'kling-3.0/video-pro',
  'kling-3.0-std':    'kling-3.0/video-std',
  'wan-2.6':          'wan/2-6-video',
  'seedance-1.5':     'bytedance/seedance-1.5-pro',
};

/**
 * Image generation credit costs.
 */
export const IMAGE_CREDIT_COSTS: Record<string, number> = {
  'flux-2-pro':          5,
  'flux-2-flex':         3,
  'nano-banana-pro':     4,
  'nano-banana-2':       2,
};

/**
 * Video generation credit costs per second.
 */
export const VIDEO_CREDIT_COSTS_PER_SECOND: Record<string, number> = {
  'kling-3.0-pro': 4,
  'kling-3.0-std': 2,
  'wan-2.6':       3,
  'seedance-1.5':  2,
};
