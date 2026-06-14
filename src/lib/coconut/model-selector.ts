// Coconut Model Selector — Dynamic AI selection and orchestration logic.
// 2026 Edition: Supporting Long-Form Video, Unified Blueprints, and Creator Tiers.

export type CocoboardMode = 'image' | 'video' | 'campaign';

/**
 * AI MODELS DATABASE
 * 2026 Production Suite — Orchestrated via Kie AI
 */
export const AI_MODELS = {
  // --- IMAGE MODELS ---
  'flux-2-pro': {
    id: 'flux-2-pro',
    name: 'FLUX.2 Pro',
    provider: 'kie',
    type: 'image',
    capabilities: ['text-perfection', 'ultra-realism', 'commercial-ready'],
    bestFor: 'High-end brand assets and hero imagery.',
    blueprintRequired: true,
  },
  'nano-banana-pro': {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    provider: 'kie',
    type: 'image',
    capabilities: ['character-consistency', 'african-aesthetic', 'luxury-skin'],
    bestFor: 'Fashion and consistent brand personas.',
    blueprintRequired: true,
  },

  // --- VIDEO MODELS ---
  'seedance-2-magic': {
    id: 'seedance-2-magic',
    name: 'Seedance 2 Magic',
    provider: 'kie',
    type: 'video',
    capabilities: ['long-form', 'scene-consistency', 'audio-reactive'],
    bestFor: 'Full cinematic ads (up to 3 min) via scene-by-scene orchestration.',
    blueprintRequired: true,
    maxDuration: 180, // 3 minutes
  },
  'kling-3.0-pro': {
    id: 'kling-3.0-pro',
    name: 'Kling 3.0 Pro',
    provider: 'kie',
    type: 'video',
    capabilities: ['physical-simulation', 'human-motion', '1080p'],
    bestFor: 'Action-heavy sequences and realistic human interactions.',
    blueprintRequired: true,
    maxDuration: 10,
  },
  'wan-2.6': {
    id: 'wan-2.6',
    name: 'Wan 2.6 Cinematic',
    provider: 'kie',
    type: 'video',
    capabilities: ['temporal-stability', 'motion-control'],
    bestFor: 'Smooth, cinematic camera moves and high-stability shots.',
    blueprintRequired: true,
    maxDuration: 8,
  },
} as const;

/**
 * CREATOR REWARDS SYSTEM
 * Rules for unlocking premium Coconut tools
 */
export const CREATOR_TIERS = {
  standard: {
    label: 'Creator',
    reqPosts: 0,
    reqLikes: 0,
    coconutAccess: 'none',
  },
  topCreator: {
    label: 'Top Creator',
    reqPosts: 10, // Minimum 10 high-quality posts
    reqLikes: 100, // Total 100 likes across all posts
    coconutAccess: 'limited', // 3 generations / month
  },
  partner: {
    label: 'Partner',
    reqPosts: 50,
    reqLikes: 1000,
    coconutAccess: 'extended', // 10 generations / month
  }
};

/**
 * Blueprint Logic: Every mode now requires a Storyboard/Plan.
 * This function generates the 'Thinking' phase before the 'Doing' phase.
 */
export function generateBlueprintMetadata(mode: CocoboardMode, intent: string) {
  return {
    version: '2026.1',
    mode,
    intent,
    thinkingPhase: true,
    requiresSceneConsistency: mode === 'video' || mode === 'campaign',
    steps: mode === 'image' ? 1 : (mode === 'video' ? 4 : 12), // Video gets 4 scenes by default
  };
}

export const KIE_MODEL_MAPPING: Record<string, string> = {
  'flux-2-pro': 'flux-2/pro',
  'seedance-2-magic': 'bytedance/seedance-2.0-pro',
  'kling-3.0-pro': 'kling-3.0/video-pro',
  'wan-2.6': 'wan/2-6-video',
};

export const CREDIT_COSTS = {
  IMAGE_BASE: 5,
  VIDEO_PER_SCENE: 20,
  CAMPAIGN_BASE: 100,
};
