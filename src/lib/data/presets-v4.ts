import type { Preset } from '../types/create-v4';

export const presets: Preset[] = [
  // Art Styles
  {
    id: 'anime-portrait',
    name: 'Anime Portrait',
    category: 'art-styles',
    prompt: 'Beautiful anime character portrait, detailed eyes, vibrant colors, studio lighting, high quality anime art',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400',
    config: { aspectRatio: '9:16' },
    tags: ['anime', 'portrait', 'character'],
    popular: true,
  },
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    category: 'art-styles',
    prompt: 'Classical oil painting style, rich textures, museum quality, masterful brushwork, renaissance technique',
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
    config: { aspectRatio: '4:3' },
    tags: ['painting', 'classical', 'art'],
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    category: 'art-styles',
    prompt: 'Delicate watercolor painting, soft colors, flowing brushstrokes, artistic paper texture, gentle gradients',
    thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
    config: { aspectRatio: '1:1' },
    tags: ['watercolor', 'soft', 'artistic'],
  },
  {
    id: 'digital-art',
    name: 'Digital Art',
    category: 'art-styles',
    prompt: 'Modern digital art, vibrant colors, clean lines, professional illustration, trending on artstation',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    config: { aspectRatio: '16:9' },
    tags: ['digital', 'modern', 'illustration'],
    popular: true,
  },

  // Cinematic
  {
    id: 'film-noir',
    name: 'Film Noir',
    category: 'cinematic',
    prompt: 'Film noir cinematography, dramatic lighting, high contrast black and white, moody shadows, 1940s detective style',
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400',
    config: { aspectRatio: '21:9' },
    tags: ['noir', 'cinematic', 'dramatic'],
  },
  {
    id: 'sci-fi-epic',
    name: 'Sci-Fi Epic',
    category: 'cinematic',
    prompt: 'Epic sci-fi scene, futuristic technology, dramatic lighting, cinematic composition, blade runner aesthetic',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
    config: { aspectRatio: '21:9' },
    tags: ['sci-fi', 'futuristic', 'epic'],
    popular: true,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk City',
    category: 'cinematic',
    prompt: 'Cyberpunk neon city, rain-soaked streets, holographic signs, atmospheric fog, blade runner style, cinematic',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
    config: { aspectRatio: '16:9' },
    tags: ['cyberpunk', 'neon', 'urban'],
    popular: true,
  },

  // Social Media
  {
    id: 'instagram-portrait',
    name: 'Instagram Portrait',
    category: 'social-media',
    prompt: 'Professional Instagram portrait, natural lighting, trendy aesthetic, high quality photography, influencer style',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    config: { aspectRatio: '1:1' },
    tags: ['instagram', 'portrait', 'social'],
  },
  {
    id: 'tiktok-vertical',
    name: 'TikTok Vertical',
    category: 'social-media',
    prompt: 'Eye-catching TikTok style content, dynamic composition, vibrant colors, mobile-first framing, engaging visual',
    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400',
    config: { aspectRatio: '9:16' },
    tags: ['tiktok', 'vertical', 'mobile'],
    popular: true,
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    category: 'social-media',
    prompt: 'Attention-grabbing YouTube thumbnail, bold text placement ready, vibrant colors, high contrast, click-worthy',
    thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400',
    config: { aspectRatio: '16:9' },
    tags: ['youtube', 'thumbnail', 'clickbait'],
  },

  // Business
  {
    id: 'product-shot',
    name: 'Product Shot',
    category: 'business',
    prompt: 'Professional product photography, clean background, studio lighting, commercial quality, e-commerce ready',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    config: { aspectRatio: '1:1' },
    tags: ['product', 'commercial', 'clean'],
  },
  {
    id: 'corporate-branding',
    name: 'Corporate Branding',
    category: 'business',
    prompt: 'Professional corporate branding visual, modern business aesthetic, clean lines, trustworthy presentation',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
    config: { aspectRatio: '16:9' },
    tags: ['corporate', 'business', 'professional'],
  },

  // Character
  {
    id: 'fantasy-hero',
    name: 'Fantasy Hero',
    category: 'character',
    prompt: 'Epic fantasy hero character, detailed armor, dramatic pose, fantasy art style, highly detailed',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400',
    config: { aspectRatio: '9:16' },
    tags: ['fantasy', 'hero', 'character'],
  },

  // Landscape
  {
    id: 'mountain-vista',
    name: 'Mountain Vista',
    category: 'landscape',
    prompt: 'Majestic mountain landscape, dramatic lighting, epic vista, national geographic quality, breathtaking scenery',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    config: { aspectRatio: '21:9' },
    tags: ['landscape', 'mountains', 'nature'],
    popular: true,
  },

  // Product
  {
    id: 'tech-product',
    name: 'Tech Product',
    category: 'product',
    prompt: 'Sleek tech product render, minimalist design, modern aesthetic, apple-style presentation, premium quality',
    thumbnail: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400',
    config: { aspectRatio: '1:1' },
    tags: ['tech', 'product', 'minimal'],
  },
];
