/**
 * VEO SERVICE - Video generation using Veo 3.1 Fast via Kie AI
 * Video generation using Veo 3.1 Fast via Kie AI
 */

import { uploadAssetFromUrl } from './storage.tsx';

const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
const KIE_AI_ENDPOINT = 'https://api.kie.ai/v1/video/generations';

/**
 * Generate video from text prompt
 */
export async function generateVideo(params: {
  prompt: string;
  negativePrompt?: string;
  duration?: number; // 2-10 seconds
  aspectRatio?: string; // 16:9, 9:16, 1:1
  resolution?: string; // 720p, 1080p
}): Promise<{ url: string; duration: number }> {
  console.log('🎬 [Veo] Generating video from text...');
  console.log(`   Duration: ${params.duration || 5}s`);
  console.log(`   Aspect Ratio: ${params.aspectRatio || '16:9'}`);
  
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY not configured');
  }
  
  const response = await fetch(KIE_AI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KIE_AI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'veo-3.1-fast',
      prompt: params.prompt,
      negative_prompt: params.negativePrompt,
      duration: params.duration || 5,
      aspect_ratio: params.aspectRatio || '16:9',
      resolution: params.resolution || '720p',
      generate_audio: false
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kie AI API error: ${error}`);
  }
  
  const result = await response.json();
  
  // Poll for completion
  const videoUrl = await pollForCompletion(result.id);
  
  // Upload to Supabase Storage
  const storedUrl = await uploadAssetFromUrl(videoUrl, 'video', 'coconut', result.id);
  
  console.log('✅ [Veo] Video generated successfully');
  
  return {
    url: storedUrl,
    duration: params.duration || 5
  };
}

/**
 * Generate video from image (image-to-video)
 */
export async function generateVideoFromImage(params: {
  prompt: string;
  image: string; // Starting frame URL
  lastFrame?: string; // Optional last frame for continuity
  negativePrompt?: string;
  duration?: number;
  aspectRatio?: string;
  resolution?: string;
}): Promise<{ url: string; duration: number }> {
  console.log('🎬 [Veo] Generating video from image...');
  console.log(`   Starting Frame: ${params.image.substring(0, 50)}...`);
  if (params.lastFrame) {
    console.log(`   Last Frame (continuity): ${params.lastFrame.substring(0, 50)}...`);
  }
  
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY not configured');
  }
  
  const requestBody: any = {
    model: 'veo-3.1-fast',
    prompt: params.prompt,
    negative_prompt: params.negativePrompt,
    image: params.image, // Starting frame
    duration: params.duration || 5,
    aspect_ratio: params.aspectRatio || '16:9',
    resolution: params.resolution || '720p',
    generate_audio: false
  };
  
  // Add last frame for continuity if provided
  if (params.lastFrame) {
    requestBody.last_frame = params.lastFrame;
  }
  
  const response = await fetch(KIE_AI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KIE_AI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kie AI API error: ${error}`);
  }
  
  const result = await response.json();
  
  // Poll for completion
  const videoUrl = await pollForCompletion(result.id);
  
  // Upload to Supabase Storage
  const storedUrl = await uploadAssetFromUrl(videoUrl, 'video', 'coconut', result.id);
  
  console.log('✅ [Veo] Video from image generated successfully');
  
  return {
    url: storedUrl,
    duration: params.duration || 5
  };
}

/**
 * Extend existing video
 */
export async function extendVideo(params: {
  videoUrl: string; // Previous video URL
  prompt: string;
  duration: number;
  aspectRatio?: string;
}): Promise<{ url: string; duration: number }> {
  console.log('🎬 [Veo] Extending video...');
  console.log(`   Previous Video: ${params.videoUrl.substring(0, 50)}...`);
  console.log(`   Extend Duration: ${params.duration}s`);
  
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY not configured');
  }
  
  // Veo 3.1 Fast supports extend via "last_frame" parameter
  // We use the last frame of the previous video as the starting point
  const response = await fetch(KIE_AI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KIE_AI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'veo-3.1-fast',
      prompt: params.prompt,
      last_frame: params.videoUrl, // Use previous video's last frame
      duration: params.duration,
      aspect_ratio: params.aspectRatio || '16:9',
      resolution: '720p',
      generate_audio: false
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kie AI API error: ${error}`);
  }
  
  const result = await response.json();
  
  // Poll for completion
  const videoUrl = await pollForCompletion(result.id);
  
  // Upload to Supabase Storage
  const storedUrl = await uploadAssetFromUrl(videoUrl, 'video', 'coconut', result.id);
  
  console.log('✅ [Veo] Video extended successfully');
  
  return {
    url: storedUrl,
    duration: params.duration
  };
}

/**
 * Poll for video generation completion
 */
async function pollForCompletion(generationId: string): Promise<string> {
  console.log('  ⏳ Polling for completion...');
  
  const maxAttempts = 60; // 5 minutes max (5s intervals)
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
    
    const response = await fetch(`${KIE_AI_ENDPOINT}/${generationId}`, {
      headers: {
        'Authorization': `Bearer ${KIE_AI_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to check generation status: ${response.statusText}`);
    }
    
    const status = await response.json();
    
    if (status.status === 'completed') {
      console.log('  ✅ Video generation completed');
      return status.output.video_url;
    } else if (status.status === 'failed') {
      throw new Error(`Video generation failed: ${status.error || 'Unknown error'}`);
    }
    
    attempts++;
    console.log(`  ⏳ Still processing... (${attempts}/${maxAttempts})`);
  }
  
  throw new Error('Video generation timed out');
}