/**
 * CREATION TOOLS MOCK SERVICE
 * Simule les appels aux APIs Pollinations, Together, Replicate
 */

import type {
  TextToImageParams,
  TextToImageResult,
  ImageToImageParams,
  ImageToImageResult,
  ImageToVideoParams,
  ImageToVideoResult,
  ImageUpscaleParams,
  ImageUpscaleResult,
  BackgroundRemovalParams,
  BackgroundRemovalResult,
  StyleTransferParams,
  StyleTransferResult,
  PromptEnhancerParams,
  PromptEnhancerResult,
  VideoToVideoParams,
  VideoToVideoResult,
  BatchGenerationParams,
  BatchGenerationResult,
} from '../types/creation-tools';

const MOCK_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1024',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1024',
  'https://images.unsplash.com/photo-1635776062043-223faf322554?w=1024',
  'https://images.unsplash.com/photo-1636690598798-39413e0cffc0?w=1024',
];

const MOCK_VIDEO_URL = 'https://cdn.pixabay.com/vimeo/302989446/abstract-22547.mp4';

function randomMockImage(): string {
  return MOCK_IMAGE_URLS[Math.floor(Math.random() * MOCK_IMAGE_URLS.length)];
}

function simulateDelay(min: number, max: number): Promise<void> {
  const delay = min + Math.random() * (max - min);
  return new Promise(resolve => setTimeout(resolve, delay * 1000));
}

// TEXT TO IMAGE
export async function generateTextToImage(params: TextToImageParams): Promise<TextToImageResult> {
  await simulateDelay(3, 6);
  
  return {
    id: `img_${Date.now()}`,
    url: randomMockImage(),
    prompt: params.prompt,
    width: params.width,
    height: params.height,
    provider: params.provider,
    createdAt: new Date().toISOString(),
  };
}

// IMAGE TO IMAGE
export async function generateImageToImage(params: ImageToImageParams): Promise<ImageToImageResult> {
  await simulateDelay(4, 7);
  
  return {
    id: `img2img_${Date.now()}`,
    url: randomMockImage(),
    sourceUrl: params.sourceImage,
    prompt: params.prompt,
    provider: params.provider,
    createdAt: new Date().toISOString(),
  };
}

// IMAGE TO VIDEO
export async function generateImageToVideo(params: ImageToVideoParams): Promise<ImageToVideoResult> {
  await simulateDelay(8, 15);
  
  return {
    id: `vid_${Date.now()}`,
    url: MOCK_VIDEO_URL,
    sourceUrl: params.sourceImage,
    duration: params.duration || 5,
    provider: params.provider,
    createdAt: new Date().toISOString(),
  };
}

// IMAGE UPSCALE
export async function upscaleImage(params: ImageUpscaleParams): Promise<ImageUpscaleResult> {
  await simulateDelay(5, 10);
  
  return {
    id: `upscale_${Date.now()}`,
    url: params.sourceImage, // Mock: même image
    sourceUrl: params.sourceImage,
    scale: params.scale,
    provider: params.provider,
    createdAt: new Date().toISOString(),
  };
}

// BACKGROUND REMOVAL
export async function removeBackground(params: BackgroundRemovalParams): Promise<BackgroundRemovalResult> {
  await simulateDelay(2, 4);
  
  return {
    id: `nobg_${Date.now()}`,
    url: params.sourceImage, // Mock: même image
    sourceUrl: params.sourceImage,
    provider: params.provider,
    createdAt: new Date().toISOString(),
  };
}

// STYLE TRANSFER
export async function transferStyle(params: StyleTransferParams): Promise<StyleTransferResult> {
  await simulateDelay(5, 8);
  
  return {
    id: `style_${Date.now()}`,
    url: randomMockImage(),
    sourceUrl: params.sourceImage,
    styleUrl: params.styleImage,
    provider: params.provider,
    createdAt: new Date().toISOString(),
  };
}

// PROMPT ENHANCER
export async function enhancePrompt(params: PromptEnhancerParams): Promise<PromptEnhancerResult> {
  await simulateDelay(1, 2);
  
  const enhancements = [
    'professional photography',
    '8k ultra HD',
    'highly detailed',
    'cinematic lighting',
    'award winning',
  ];
  
  const keywords = params.prompt.split(' ').slice(0, 5);
  
  return {
    original: params.prompt,
    enhanced: `${params.prompt}, ${enhancements.join(', ')}, ${params.style || 'realistic'} style`,
    improvements: enhancements,
    keywords,
  };
}

// VIDEO TO VIDEO
export async function generateVideoToVideo(params: VideoToVideoParams): Promise<VideoToVideoResult> {
  await simulateDelay(15, 25);
  
  return {
    id: `vid2vid_${Date.now()}`,
    url: MOCK_VIDEO_URL,
    sourceUrl: params.sourceVideo,
    prompt: params.prompt,
    provider: params.provider,
    createdAt: new Date().toISOString(),
  };
}

// BATCH GENERATION
export async function generateBatch(params: BatchGenerationParams): Promise<BatchGenerationResult> {
  const totalPrompts = params.prompts.length;
  await simulateDelay(3 * totalPrompts, 5 * totalPrompts);
  
  const results: TextToImageResult[] = params.prompts.map((prompt, i) => ({
    id: `batch_${Date.now()}_${i}`,
    url: randomMockImage(),
    prompt,
    width: params.width,
    height: params.height,
    provider: params.provider,
    createdAt: new Date().toISOString(),
  }));
  
  return {
    id: `batch_${Date.now()}`,
    results,
    total: totalPrompts,
    completed: totalPrompts,
    failed: 0,
    createdAt: new Date().toISOString(),
  };
}

// PROVIDER CAPABILITIES
export const PROVIDER_CAPABILITIES = {
  pollinations: {
    textToImage: true,
    imageToImage: true,
    imageToVideo: false,
    videoToVideo: false,
    upscale: false,
    backgroundRemoval: false,
    styleTransfer: true,
  },
  together: {
    textToImage: true,
    imageToImage: true,
    imageToVideo: false,
    videoToVideo: false,
    upscale: false,
    backgroundRemoval: false,
    styleTransfer: false,
  },
  replicate: {
    textToImage: true,
    imageToImage: true,
    imageToVideo: true,
    videoToVideo: true,
    upscale: true,
    backgroundRemoval: true,
    styleTransfer: true,
  },
};

// PROVIDER MODELS
export const PROVIDER_MODELS = {
  pollinations: [
    { id: 'flux', name: 'Flux', description: 'Fast and creative' },
    { id: 'turbo', name: 'Turbo', description: 'Lightning fast' },
  ],
  together: [
    { id: 'sdxl', name: 'SDXL', description: 'High quality' },
    { id: 'flux-schnell', name: 'Flux Schnell', description: 'Fast generation' },
  ],
  replicate: [
    { id: 'flux-pro', name: 'Flux Pro', description: 'SOTA quality' },
    { id: 'veo-3.1', name: 'Veo 3.1', description: 'Video generation' },
    { id: 'sdxl', name: 'SDXL', description: 'Versatile' },
  ],
};
