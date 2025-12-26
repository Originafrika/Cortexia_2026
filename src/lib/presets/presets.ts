/**
 * Cortexia Preset Library
 * Curated prompts optimized for best results across models
 */

export interface Preset {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  tags: string[];
  imageQuery: string; // For Unsplash preview
  aspectRatio?: string;
  style?: string;
  model?: string; // Recommended model
}

export const presets: Preset[] = [
  // 🎨 ARTISTIC
  {
    id: 'oil-painting-portrait',
    name: 'Oil Painting Portrait',
    description: 'Classic renaissance-style portrait with rich textures',
    category: 'artistic',
    prompt: 'Oil painting portrait, rich impasto texture, dramatic chiaroscuro lighting, renaissance style, expressive brushstrokes, warm earth tones',
    tags: ['portrait', 'classical', 'painting'],
    imageQuery: 'oil painting portrait',
    aspectRatio: '3:4',
    style: 'artistic'
  },
  {
    id: 'watercolor-landscape',
    name: 'Watercolor Landscape',
    description: 'Soft, flowing watercolor scenery',
    category: 'artistic',
    prompt: 'Delicate watercolor landscape, soft washes, bleeding colors, natural scenery, peaceful atmosphere, light paper texture',
    tags: ['landscape', 'watercolor', 'peaceful'],
    imageQuery: 'watercolor landscape',
    aspectRatio: '16:9',
    style: 'artistic'
  },
  {
    id: 'ink-sketch',
    name: 'Ink Sketch',
    description: 'Bold line art with dynamic strokes',
    category: 'artistic',
    prompt: 'Black ink sketch, bold expressive lines, dynamic hatching, high contrast, minimalist composition, artistic line work',
    tags: ['sketch', 'minimalist', 'line-art'],
    imageQuery: 'ink sketch drawing',
    aspectRatio: '1:1',
    style: 'artistic'
  },
  {
    id: 'abstract-geometric',
    name: 'Abstract Geometric',
    description: 'Modern geometric abstraction',
    category: 'artistic',
    prompt: 'Abstract geometric composition, bold shapes, vibrant color blocking, modern minimalism, clean lines, balanced negative space',
    tags: ['abstract', 'geometric', 'modern'],
    imageQuery: 'abstract geometric art',
    aspectRatio: '1:1',
    style: 'abstract'
  },

  // 🎬 CINEMATIC
  {
    id: 'film-noir',
    name: 'Film Noir',
    description: 'Classic 1940s detective movie aesthetic',
    category: 'cinematic',
    prompt: 'Film noir, high contrast black and white, dramatic shadows, venetian blind lighting, rain-slicked streets, 1940s atmosphere, moody cinematography',
    tags: ['noir', 'vintage', 'dramatic'],
    imageQuery: 'film noir detective',
    aspectRatio: '16:9',
    style: 'cinematic'
  },
  {
    id: 'sci-fi-dystopia',
    name: 'Sci-Fi Dystopia',
    description: 'Futuristic cyberpunk cityscape',
    category: 'cinematic',
    prompt: 'Cyberpunk dystopia, neon-lit megacity, flying vehicles, holographic advertisements, rain-soaked streets, blade runner aesthetic, cinematic wide shot',
    tags: ['sci-fi', 'cyberpunk', 'futuristic'],
    imageQuery: 'cyberpunk city night',
    aspectRatio: '21:9',
    style: 'cinematic'
  },
  {
    id: 'epic-fantasy',
    name: 'Epic Fantasy',
    description: 'Grand fantasy landscape with magical elements',
    category: 'cinematic',
    prompt: 'Epic fantasy landscape, towering mountains, ancient castles, magical aurora, dramatic god rays, Lord of the Rings style, cinematic composition',
    tags: ['fantasy', 'epic', 'landscape'],
    imageQuery: 'fantasy mountain castle',
    aspectRatio: '16:9',
    style: 'cinematic'
  },
  {
    id: 'horror-atmosphere',
    name: 'Horror Atmosphere',
    description: 'Eerie and unsettling mood',
    category: 'cinematic',
    prompt: 'Horror atmosphere, fog-shrouded environment, ominous shadows, desaturated colors, eerie silence, suspenseful composition, cinematic lighting',
    tags: ['horror', 'dark', 'atmospheric'],
    imageQuery: 'foggy horror atmosphere',
    aspectRatio: '16:9',
    style: 'cinematic'
  },

  // 📱 SOCIAL MEDIA
  {
    id: 'instagram-aesthetic',
    name: 'Instagram Aesthetic',
    description: 'Bright, vibrant social media style',
    category: 'social',
    prompt: 'Instagram aesthetic, bright natural lighting, pastel color palette, clean minimalist composition, lifestyle photography, soft shadows',
    tags: ['instagram', 'lifestyle', 'bright'],
    imageQuery: 'instagram aesthetic minimal',
    aspectRatio: '1:1',
    style: 'realistic'
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    description: 'Eye-catching thumbnail design',
    category: 'social',
    prompt: 'YouTube thumbnail style, bold composition, vibrant saturated colors, dynamic action, high energy, attention-grabbing visual',
    tags: ['youtube', 'bold', 'energetic'],
    imageQuery: 'bold colorful design',
    aspectRatio: '16:9',
    style: 'realistic'
  },
  {
    id: 'tiktok-viral',
    name: 'TikTok Viral',
    description: 'Trendy vertical content style',
    category: 'social',
    prompt: 'TikTok style, vertical composition, trendy aesthetic, gen-z appeal, vibrant colors, dynamic movement, modern viral content',
    tags: ['tiktok', 'vertical', 'trendy'],
    imageQuery: 'trendy gen z aesthetic',
    aspectRatio: '9:16',
    style: 'realistic'
  },
  {
    id: 'pinterest-inspiration',
    name: 'Pinterest Board',
    description: 'Inspirational lifestyle imagery',
    category: 'social',
    prompt: 'Pinterest inspiration, aesthetic lifestyle, warm cozy atmosphere, natural textures, aspirational living, soft focus details',
    tags: ['pinterest', 'lifestyle', 'cozy'],
    imageQuery: 'cozy aesthetic lifestyle',
    aspectRatio: '3:4',
    style: 'realistic'
  },

  // 💼 BUSINESS
  {
    id: 'product-hero',
    name: 'Product Hero Shot',
    description: 'Professional product photography',
    category: 'business',
    prompt: 'Professional product photography, clean white background, studio lighting, sharp focus, commercial quality, premium aesthetic',
    tags: ['product', 'commercial', 'clean'],
    imageQuery: 'product photography white',
    aspectRatio: '1:1',
    style: 'realistic'
  },
  {
    id: 'corporate-professional',
    name: 'Corporate Professional',
    description: 'Business and corporate imagery',
    category: 'business',
    prompt: 'Corporate professional photography, modern office environment, business attire, confident posture, natural lighting, clean composition',
    tags: ['corporate', 'professional', 'business'],
    imageQuery: 'corporate professional office',
    aspectRatio: '16:9',
    style: 'realistic'
  },
  {
    id: 'startup-tech',
    name: 'Startup Tech',
    description: 'Modern tech startup vibe',
    category: 'business',
    prompt: 'Modern tech startup aesthetic, collaborative workspace, glass and steel, natural light, innovation atmosphere, contemporary design',
    tags: ['tech', 'startup', 'modern'],
    imageQuery: 'modern tech office',
    aspectRatio: '16:9',
    style: 'realistic'
  },
  {
    id: 'marketing-ad',
    name: 'Marketing Ad',
    description: 'Eye-catching advertising visual',
    category: 'business',
    prompt: 'Marketing advertisement, bold visual hierarchy, strong call to action composition, professional polish, brand-focused aesthetic',
    tags: ['marketing', 'advertising', 'bold'],
    imageQuery: 'bold marketing design',
    aspectRatio: '1:1',
    style: 'realistic'
  },

  // 🌟 TRENDING
  {
    id: 'ai-art-surreal',
    name: 'AI Surrealism',
    description: 'Trending AI-generated surreal art',
    category: 'trending',
    prompt: 'AI-generated surreal art, impossible geometry, dreamlike atmosphere, vibrant iridescent colors, digital art style, mind-bending composition',
    tags: ['ai-art', 'surreal', 'digital'],
    imageQuery: 'surreal digital art',
    aspectRatio: '1:1',
    style: 'abstract'
  },
  {
    id: 'synthwave-retro',
    name: 'Synthwave Retro',
    description: '80s inspired neon aesthetic',
    category: 'trending',
    prompt: 'Synthwave aesthetic, 1980s retro futurism, neon pink and cyan, grid landscapes, sunset gradient, nostalgic digital art',
    tags: ['synthwave', '80s', 'neon'],
    imageQuery: 'synthwave neon retrowave',
    aspectRatio: '16:9',
    style: 'artistic'
  },
  {
    id: 'cottagecore-cozy',
    name: 'Cottagecore Aesthetic',
    description: 'Warm, rustic, nature-inspired',
    category: 'trending',
    prompt: 'Cottagecore aesthetic, rustic countryside, warm natural tones, wildflowers, vintage furniture, peaceful rural life, golden hour lighting',
    tags: ['cottagecore', 'nature', 'cozy'],
    imageQuery: 'cottagecore countryside',
    aspectRatio: '4:3',
    style: 'realistic'
  },
  {
    id: 'dark-academia',
    name: 'Dark Academia',
    description: 'Scholarly, moody, classical',
    category: 'trending',
    prompt: 'Dark academia aesthetic, old library, leather-bound books, warm candlelight, vintage academic atmosphere, moody classical composition',
    tags: ['academia', 'vintage', 'moody'],
    imageQuery: 'dark academia library',
    aspectRatio: '3:4',
    style: 'artistic'
  },
];

export const categories = [
  { id: 'all', name: 'All Presets', icon: '✨' },
  { id: 'artistic', name: 'Artistic', icon: '🎨' },
  { id: 'cinematic', name: 'Cinematic', icon: '🎬' },
  { id: 'social', name: 'Social Media', icon: '📱' },
  { id: 'business', name: 'Business', icon: '💼' },
  { id: 'trending', name: 'Trending', icon: '🌟' },
];
