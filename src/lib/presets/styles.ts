/**
 * Style Modifiers for Cortexia
 * Applied as prompt suffixes to control aesthetic
 */

export interface StyleModifier {
  id: string;
  name: string;
  suffix: string;
  description: string;
  category: 'base' | 'mood' | 'lighting' | 'quality';
}

export const styleModifiers: StyleModifier[] = [
  // BASE STYLES
  {
    id: 'realistic',
    name: 'Realistic',
    suffix: 'photorealistic, highly detailed, natural lighting',
    description: 'Photo-realistic quality',
    category: 'base'
  },
  {
    id: 'artistic',
    name: 'Artistic',
    suffix: 'artistic interpretation, expressive style, creative composition',
    description: 'Artistic and expressive',
    category: 'base'
  },
  {
    id: 'abstract',
    name: 'Abstract',
    suffix: 'abstract composition, non-representational, conceptual art',
    description: 'Abstract and conceptual',
    category: 'base'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    suffix: 'minimalist design, clean simple composition, negative space',
    description: 'Clean and minimal',
    category: 'base'
  },

  // MOOD
  {
    id: 'warm',
    name: 'Warm',
    suffix: 'warm color palette, golden tones, inviting atmosphere',
    description: 'Warm and inviting',
    category: 'mood'
  },
  {
    id: 'cool',
    name: 'Cool',
    suffix: 'cool color palette, blue tones, calm atmosphere',
    description: 'Cool and calm',
    category: 'mood'
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    suffix: 'vibrant saturated colors, high energy, bold palette',
    description: 'Bold and energetic',
    category: 'mood'
  },
  {
    id: 'muted',
    name: 'Muted',
    suffix: 'muted desaturated tones, subtle palette, understated',
    description: 'Soft and understated',
    category: 'mood'
  },

  // LIGHTING
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    suffix: 'golden hour lighting, warm sunset glow, soft shadows',
    description: 'Sunset/sunrise lighting',
    category: 'lighting'
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    suffix: 'dramatic lighting, strong contrast, deep shadows',
    description: 'High contrast drama',
    category: 'lighting'
  },
  {
    id: 'soft',
    name: 'Soft Light',
    suffix: 'soft diffused lighting, gentle shadows, even illumination',
    description: 'Gentle and even',
    category: 'lighting'
  },
  {
    id: 'neon',
    name: 'Neon',
    suffix: 'neon lighting, vibrant glowing colors, cyberpunk atmosphere',
    description: 'Neon glow',
    category: 'lighting'
  },

  // QUALITY
  {
    id: 'hq',
    name: 'High Quality',
    suffix: '8k, ultra detailed, professional quality, sharp focus',
    description: 'Maximum quality',
    category: 'quality'
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    suffix: 'cinematic composition, film grain, anamorphic lens',
    description: 'Movie-like quality',
    category: 'quality'
  },
  {
    id: 'vintage',
    name: 'Vintage',
    suffix: 'vintage aesthetic, film photography, retro colors',
    description: 'Nostalgic quality',
    category: 'quality'
  },
];

export const styleCategories = [
  { id: 'base', name: 'Base Style' },
  { id: 'mood', name: 'Mood' },
  { id: 'lighting', name: 'Lighting' },
  { id: 'quality', name: 'Quality' },
];

/**
 * Combine style modifiers into a prompt suffix
 */
export function combineStyleModifiers(modifierIds: string[]): string {
  const selected = styleModifiers.filter(m => modifierIds.includes(m.id));
  return selected.map(m => m.suffix).join(', ');
}
