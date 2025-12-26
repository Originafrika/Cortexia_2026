/**
 * PLATFORM SPECIFICATIONS
 * Technical specs for each social media platform
 */

export type PlatformId = 
  | 'instagram-story'
  | 'instagram-post'
  | 'instagram-reel'
  | 'facebook-feed'
  | 'facebook-story'
  | 'twitter-feed'
  | 'linkedin-feed'
  | 'tiktok'
  | 'youtube-short'
  | 'youtube-video';

export interface PlatformSpec {
  id: PlatformId;
  name: string;
  platform: 'Instagram' | 'Facebook' | 'Twitter' | 'LinkedIn' | 'TikTok' | 'YouTube';
  category: 'story' | 'feed' | 'reel' | 'short' | 'video';
  
  // Dimensions
  aspectRatio: string;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  
  // Video specs
  maxDuration?: number; // seconds
  minDuration?: number; // seconds
  maxFileSize?: number; // MB
  
  // Image specs
  formats?: string[]; // e.g., ['jpg', 'png', 'webp']
  
  // Content guidelines
  recommendedTextLength?: number; // characters
  hashtagLimit?: number;
  
  // Colors & branding
  safeZone?: { top: number; bottom: number; left: number; right: number }; // percentages
  
  // Best practices
  tips: string[];
  
  icon: string; // emoji
  color: string; // hex color for UI
}

// ============================================
// PLATFORM DEFINITIONS
// ============================================

export const PLATFORM_SPECS: Record<PlatformId, PlatformSpec> = {
  // ========== INSTAGRAM ==========
  'instagram-story': {
    id: 'instagram-story',
    name: 'Instagram Story',
    platform: 'Instagram',
    category: 'story',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxDuration: 60,
    minDuration: 1,
    maxFileSize: 100,
    formats: ['jpg', 'png', 'mp4'],
    recommendedTextLength: 125,
    hashtagLimit: 30,
    safeZone: { top: 14, bottom: 20, left: 5, right: 5 },
    tips: [
      'Keep key content in the center to avoid UI overlap',
      'Use vertical format for maximum screen real estate',
      'Add stickers, polls, or questions for engagement',
      'Include a clear call-to-action',
    ],
    icon: '📱',
    color: '#E1306C',
  },
  
  'instagram-post': {
    id: 'instagram-post',
    name: 'Instagram Post',
    platform: 'Instagram',
    category: 'feed',
    aspectRatio: '1:1',
    width: 1080,
    height: 1080,
    maxDuration: 60,
    minDuration: 3,
    maxFileSize: 100,
    formats: ['jpg', 'png', 'mp4'],
    recommendedTextLength: 2200,
    hashtagLimit: 30,
    tips: [
      'Square format is most versatile for feed',
      'First 125 characters appear before "more"',
      'Use 3-5 relevant hashtags',
      'High-quality visuals perform best',
    ],
    icon: '🖼️',
    color: '#C13584',
  },
  
  'instagram-reel': {
    id: 'instagram-reel',
    name: 'Instagram Reel',
    platform: 'Instagram',
    category: 'reel',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxDuration: 90,
    minDuration: 3,
    maxFileSize: 1000,
    formats: ['mp4'],
    recommendedTextLength: 2200,
    hashtagLimit: 30,
    safeZone: { top: 18, bottom: 25, left: 0, right: 0 },
    tips: [
      'Hook viewers in the first 3 seconds',
      'Use trending audio for discoverability',
      'Keep text readable in small sizes',
      'Vertical video only',
    ],
    icon: '🎬',
    color: '#F77737',
  },
  
  // ========== FACEBOOK ==========
  'facebook-feed': {
    id: 'facebook-feed',
    name: 'Facebook Feed',
    platform: 'Facebook',
    category: 'feed',
    aspectRatio: '16:9',
    width: 1200,
    height: 630,
    maxDuration: 240,
    minDuration: 1,
    maxFileSize: 1000,
    formats: ['jpg', 'png', 'mp4'],
    recommendedTextLength: 250,
    hashtagLimit: 30,
    tips: [
      'Landscape format works best for desktop',
      'First 90 characters are most important',
      'Videos auto-play on mute',
      'Add captions for accessibility',
    ],
    icon: '👥',
    color: '#1877F2',
  },
  
  'facebook-story': {
    id: 'facebook-story',
    name: 'Facebook Story',
    platform: 'Facebook',
    category: 'story',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxDuration: 20,
    minDuration: 1,
    maxFileSize: 100,
    formats: ['jpg', 'png', 'mp4'],
    safeZone: { top: 14, bottom: 20, left: 5, right: 5 },
    tips: [
      'Stories are ephemeral - create urgency',
      'Use full-screen vertical format',
      'Keep branding subtle',
      'Include interactive elements',
    ],
    icon: '💬',
    color: '#4267B2',
  },
  
  // ========== TWITTER/X ==========
  'twitter-feed': {
    id: 'twitter-feed',
    name: 'Twitter/X Feed',
    platform: 'Twitter',
    category: 'feed',
    aspectRatio: '16:9',
    width: 1200,
    height: 675,
    maxDuration: 140,
    minDuration: 0.5,
    maxFileSize: 512,
    formats: ['jpg', 'png', 'gif', 'mp4'],
    recommendedTextLength: 280,
    hashtagLimit: 10,
    tips: [
      'Keep videos under 2:20 for best engagement',
      'Add alt text for accessibility',
      'Use 1-2 relevant hashtags max',
      'First frame should be compelling',
    ],
    icon: '𝕏',
    color: '#1DA1F2',
  },
  
  // ========== LINKEDIN ==========
  'linkedin-feed': {
    id: 'linkedin-feed',
    name: 'LinkedIn Feed',
    platform: 'LinkedIn',
    category: 'feed',
    aspectRatio: '16:9',
    width: 1200,
    height: 627,
    maxDuration: 600,
    minDuration: 3,
    maxFileSize: 200,
    formats: ['jpg', 'png', 'mp4'],
    recommendedTextLength: 1300,
    hashtagLimit: 10,
    tips: [
      'Professional tone is essential',
      'Educational content performs well',
      'First 150 characters hook readers',
      'Use 3-5 industry hashtags',
    ],
    icon: '💼',
    color: '#0A66C2',
  },
  
  // ========== TIKTOK ==========
  'tiktok': {
    id: 'tiktok',
    name: 'TikTok',
    platform: 'TikTok',
    category: 'short',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxDuration: 180,
    minDuration: 5,
    maxFileSize: 287,
    formats: ['mp4'],
    recommendedTextLength: 150,
    hashtagLimit: 100,
    safeZone: { top: 20, bottom: 30, left: 0, right: 0 },
    tips: [
      'First 3 seconds are critical',
      'Use trending sounds and effects',
      'Vertical video only',
      'On-screen text should be large',
    ],
    icon: '🎵',
    color: '#000000',
  },
  
  // ========== YOUTUBE ==========
  'youtube-short': {
    id: 'youtube-short',
    name: 'YouTube Short',
    platform: 'YouTube',
    category: 'short',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    maxDuration: 60,
    minDuration: 15,
    maxFileSize: 2000,
    formats: ['mp4'],
    recommendedTextLength: 100,
    safeZone: { top: 15, bottom: 30, left: 0, right: 0 },
    tips: [
      'Hook viewers immediately',
      'Vertical format only',
      'Add #Shorts to title',
      'Keep branding visible',
    ],
    icon: '⚡',
    color: '#FF0000',
  },
  
  'youtube-video': {
    id: 'youtube-video',
    name: 'YouTube Video',
    platform: 'YouTube',
    category: 'video',
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    maxDuration: 3600,
    minDuration: 30,
    maxFileSize: 128000,
    formats: ['mp4'],
    recommendedTextLength: 5000,
    tips: [
      'Landscape format for desktop',
      'Thumbnail is crucial for clicks',
      'First 15 seconds hook viewers',
      'Include timestamps for longer videos',
    ],
    icon: '📺',
    color: '#FF0000',
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all platforms for a specific social network
 */
export function getPlatformsByNetwork(network: 'Instagram' | 'Facebook' | 'Twitter' | 'LinkedIn' | 'TikTok' | 'YouTube'): PlatformSpec[] {
  return Object.values(PLATFORM_SPECS).filter(spec => spec.platform === network);
}

/**
 * Get specs by category
 */
export function getPlatformsByCategory(category: PlatformSpec['category']): PlatformSpec[] {
  return Object.values(PLATFORM_SPECS).filter(spec => spec.category === category);
}

/**
 * Get all unique platforms
 */
export function getAllPlatforms(): PlatformSpec[] {
  return Object.values(PLATFORM_SPECS);
}

/**
 * Get recommended platforms for a content type
 */
export function getRecommendedPlatforms(contentType: 'image' | 'video' | 'story'): PlatformSpec[] {
  if (contentType === 'story') {
    return getPlatformsByCategory('story');
  }
  
  if (contentType === 'video') {
    return [
      PLATFORM_SPECS['youtube-video'],
      PLATFORM_SPECS['facebook-feed'],
      PLATFORM_SPECS['linkedin-feed'],
      PLATFORM_SPECS['twitter-feed'],
    ];
  }
  
  // Image
  return [
    PLATFORM_SPECS['instagram-post'],
    PLATFORM_SPECS['facebook-feed'],
    PLATFORM_SPECS['linkedin-feed'],
    PLATFORM_SPECS['twitter-feed'],
  ];
}

/**
 * Check if content meets platform requirements
 */
export function validateContent(
  platformId: PlatformId,
  content: {
    type: 'image' | 'video';
    width: number;
    height: number;
    duration?: number;
    fileSize?: number; // MB
  }
): { valid: boolean; issues: string[] } {
  const spec = PLATFORM_SPECS[platformId];
  const issues: string[] = [];
  
  // Check dimensions
  const contentAspect = content.width / content.height;
  const [specW, specH] = spec.aspectRatio.split(':').map(Number);
  const specAspect = specW / specH;
  
  if (Math.abs(contentAspect - specAspect) > 0.1) {
    issues.push(`Aspect ratio mismatch. Expected ${spec.aspectRatio}, got ${content.width}:${content.height}`);
  }
  
  // Check duration for videos
  if (content.type === 'video' && content.duration) {
    if (spec.maxDuration && content.duration > spec.maxDuration) {
      issues.push(`Video too long. Max ${spec.maxDuration}s, got ${content.duration}s`);
    }
    if (spec.minDuration && content.duration < spec.minDuration) {
      issues.push(`Video too short. Min ${spec.minDuration}s, got ${content.duration}s`);
    }
  }
  
  // Check file size
  if (content.fileSize && spec.maxFileSize && content.fileSize > spec.maxFileSize) {
    issues.push(`File too large. Max ${spec.maxFileSize}MB, got ${content.fileSize}MB`);
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
}
