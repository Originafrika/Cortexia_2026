/**
 * Replicate API Integration for Coconut V7
 * 
 * Models:
 * - Image: black-forest-labs/flux-schnell
 * - Video: minimax/video-01
 */

const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_KEY');
const REPLICATE_API_URL = 'https://api.replicate.com/v1';

export interface ImageGenerationRequest {
  prompt: string;
  aspectRatio?: string;
  seed?: number;
}

export interface VideoGenerationRequest {
  prompt: string;
  duration?: string;
  aspectRatio?: string;
  seed?: number;
}

export interface GenerationJob {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  output?: string | string[];
  error?: string;
  logs?: string;
  metrics?: {
    predict_time?: number;
  };
}

/**
 * Start an image generation
 */
export async function generateImage(
  request: ImageGenerationRequest
): Promise<GenerationJob> {
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_KEY not configured');
  }

  // FLUX Schnell model for fast image generation
  const response = await fetch(`${REPLICATE_API_URL}/predictions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: '5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637',
      input: {
        prompt: request.prompt,
        aspect_ratio: request.aspectRatio || '16:9',
        num_outputs: 1,
        output_format: 'png',
        output_quality: 90,
        seed: request.seed,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Replicate image generation error:', error);
    throw new Error(`Failed to start image generation: ${response.statusText}`);
  }

  const job = await response.json();
  return {
    id: job.id,
    status: job.status,
    output: job.output,
    error: job.error,
  };
}

/**
 * Start a video generation
 */
export async function generateVideo(
  request: VideoGenerationRequest
): Promise<GenerationJob> {
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_KEY not configured');
  }

  // MiniMax Video-01 for video generation
  const response = await fetch(`${REPLICATE_API_URL}/predictions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: '4c933a874045fd2f87e410665e28de99dd04bba8c3f97c92fa7c5dc6a4bd325e',
      input: {
        prompt: request.prompt,
        prompt_optimizer: true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Replicate video generation error:', error);
    throw new Error(`Failed to start video generation: ${response.statusText}`);
  }

  const job = await response.json();
  return {
    id: job.id,
    status: job.status,
    output: job.output,
    error: job.error,
  };
}

/**
 * Check the status of a generation job
 */
export async function checkJobStatus(jobId: string): Promise<GenerationJob> {
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_KEY not configured');
  }

  const response = await fetch(`${REPLICATE_API_URL}/predictions/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Replicate job status error:', error);
    throw new Error(`Failed to check job status: ${response.statusText}`);
  }

  const job = await response.json();
  return {
    id: job.id,
    status: job.status,
    output: job.output,
    error: job.error,
    logs: job.logs,
    metrics: job.metrics,
  };
}

/**
 * Cancel a running generation job
 */
export async function cancelJob(jobId: string): Promise<void> {
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_KEY not configured');
  }

  const response = await fetch(`${REPLICATE_API_URL}/predictions/${jobId}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Replicate job cancel error:', error);
    throw new Error(`Failed to cancel job: ${response.statusText}`);
  }
}

/**
 * Poll a job until completion
 */
export async function pollJobUntilComplete(
  jobId: string,
  maxAttempts: number = 60,
  intervalMs: number = 2000
): Promise<GenerationJob> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const job = await checkJobStatus(jobId);

    if (job.status === 'succeeded' || job.status === 'failed') {
      return job;
    }

    // Wait before next check
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;
  }

  throw new Error(`Job ${jobId} timed out after ${maxAttempts} attempts`);
}
