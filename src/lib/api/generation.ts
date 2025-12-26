import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/generation`;

export interface GenerateImageRequest {
  layerId: string;
  prompt: string;
  aspectRatio?: string;
  seed?: number;
}

export interface GenerateVideoRequest {
  shotId: string;
  prompt: string;
  duration?: string;
  aspectRatio?: string;
  seed?: number;
}

export interface GenerationJob {
  jobId: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  output?: string | string[];
  error?: string;
  logs?: string;
  metrics?: {
    predict_time?: number;
  };
}

/**
 * Generate an image layer
 */
export async function generateImage(
  request: GenerateImageRequest
): Promise<{ success: boolean; jobId?: string; status?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Generate image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image',
    };
  }
}

/**
 * Generate a video shot
 */
export async function generateVideo(
  request: GenerateVideoRequest
): Promise<{ success: boolean; jobId?: string; status?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Generate video error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate video',
    };
  }
}

/**
 * Check job status
 */
export async function checkJobStatus(
  jobId: string
): Promise<{ success: boolean; job?: GenerationJob; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/status/${jobId}`, {
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();

    if (!data.success) {
      return data;
    }

    return {
      success: true,
      job: {
        jobId: data.jobId,
        status: data.status,
        output: data.output,
        error: data.error,
        logs: data.logs,
        metrics: data.metrics,
      },
    };
  } catch (error) {
    console.error('Check job status error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check job status',
    };
  }
}

/**
 * Cancel a generation job
 */
export async function cancelJob(jobId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/cancel/${jobId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Cancel job error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel job',
    };
  }
}

/**
 * Get generation info by layer/shot ID
 */
export async function getGenerationByLayerId(
  layerId: string
): Promise<{ success: boolean; generation?: any; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/layer/${layerId}`, {
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get generation',
    };
  }
}

/**
 * Poll a job until completion with progress callback
 */
export async function pollJobUntilComplete(
  jobId: string,
  onProgress?: (status: string) => void
): Promise<{ success: boolean; job?: GenerationJob; error?: string }> {
  const maxAttempts = 60; // 2 minutes max
  const intervalMs = 2000; // 2 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await checkJobStatus(jobId);

    if (!result.success) {
      return result;
    }

    const job = result.job!;

    // Call progress callback
    if (onProgress) {
      onProgress(job.status);
    }

    // Check if completed
    if (job.status === 'succeeded' || job.status === 'failed') {
      return { success: true, job };
    }

    // Wait before next check
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return {
    success: false,
    error: 'Generation timed out',
  };
}
