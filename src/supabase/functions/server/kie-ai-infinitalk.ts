/**
 * InfiniteTalk AI Lip-Sync Video Handler (Kie AI)
 * Creates talking avatars from image + audio with perfect lip sync
 * Pricing: 480P (8 credits), 720P (18 credits)
 */

const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
const KIE_AI_BASE_URL = 'https://api.kie.ai/api/v1';

export interface InfiniteTalkInput {
  image_url: string;
  audio_url: string;
  prompt: string;
  resolution?: '480p' | '720p';
  seed?: number;
}

export interface InfiniteTalkTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface InfiniteTalkStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    model: string;
    state: 'waiting' | 'queuing' | 'generating' | 'success' | 'fail'; // ✅ Add queuing & generating
    param: string;
    resultJson: string | null;
    failCode: string | null;
    failMsg: string | null;
    costTime: number | null;
    completeTime: number | null;
    createTime: number;
  };
}

/**
 * Create InfiniteTalk generation task
 */
export async function createInfiniteTalkTask(
  input: InfiniteTalkInput,
  callBackUrl?: string
): Promise<InfiniteTalkTaskResponse> {
  console.log('[InfiniteTalk] Creating task with input:', {
    resolution: input.resolution || '480p',
    hasImage: !!input.image_url,
    hasAudio: !!input.audio_url,
    promptLength: input.prompt?.length || 0,
    callBackUrl: callBackUrl || 'none'
  });

  const requestBody = {
    model: 'infinitalk/from-audio',
    ...(callBackUrl && { callBackUrl }), // Add callback URL if provided
    input: {
      image_url: input.image_url,
      audio_url: input.audio_url,
      prompt: input.prompt,
      resolution: input.resolution || '480p',
      ...(input.seed && { seed: input.seed })
    }
  };

  console.log('[InfiniteTalk] Request body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(`${KIE_AI_BASE_URL}/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KIE_AI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[InfiniteTalk] Task creation failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`InfiniteTalk task creation failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('[InfiniteTalk] Task created successfully:', result);

  return result;
}

/**
 * Query InfiniteTalk task status
 */
export async function queryInfiniteTalkStatus(
  taskId: string
): Promise<InfiniteTalkStatusResponse> {
  const response = await fetch(
    `${KIE_AI_BASE_URL}/jobs/recordInfo?taskId=${taskId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KIE_AI_API_KEY}`
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[InfiniteTalk] Status query failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`InfiniteTalk status query failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result;
}

/**
 * Poll for task completion with timeout
 */
export async function pollInfiniteTalkTask(
  taskId: string,
  maxAttempts: number = 60, // 60 attempts = 5 minutes max
  intervalMs: number = 5000 // Poll every 5 seconds
): Promise<string[]> {
  console.log(`[InfiniteTalk] 🔄 Starting to poll task ${taskId} (max ${maxAttempts} attempts, ${intervalMs}ms interval)`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const status = await queryInfiniteTalkStatus(taskId);
      
      const minutes = Math.floor((attempt * intervalMs) / 60000);
      const seconds = Math.floor(((attempt * intervalMs) % 60000) / 1000);
      
      console.log(`[InfiniteTalk] 📊 Poll attempt ${attempt}/${maxAttempts} [${minutes}:${seconds.toString().padStart(2, '0')}]:`, {
        state: status.data.state,
        taskId: taskId.substring(0, 16) + '...'
      });

      if (status.data.state === 'success') {
        if (!status.data.resultJson) {
          throw new Error('InfiniteTalk task succeeded but no result JSON found');
        }

        const result = JSON.parse(status.data.resultJson);
        console.log('[InfiniteTalk] ✅ Task completed successfully:', {
          videoUrls: result.resultUrls,
          costTime: status.data.costTime
        });

        return result.resultUrls || [];
      }

      if (status.data.state === 'fail') {
        console.error('[InfiniteTalk] ❌ Task failed:', {
          failCode: status.data.failCode,
          failMsg: status.data.failMsg
        });
        throw new Error(`InfiniteTalk generation failed: ${status.data.failMsg || 'Unknown error'}`);
      }

      // Log current state for debugging
      if (attempt % 5 === 0) {
        console.log(`[InfiniteTalk] ⏳ Still ${status.data.state}, elapsed: ${minutes}m ${seconds}s`);
      }

      // Still waiting/queuing/generating, sleep before next attempt
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    } catch (error) {
      console.error(`[InfiniteTalk] ⚠️ Error during poll attempt ${attempt}:`, error);
      // If it's a query error, re-throw after logging
      if (error instanceof Error && error.message.includes('status query failed')) {
        throw error;
      }
      // For other errors, continue polling
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
  }

  throw new Error(`InfiniteTalk task timeout after ${maxAttempts} attempts (${Math.floor(maxAttempts * intervalMs / 60000)} minutes)`);
}

/**
 * Calculate cost for InfiniteTalk generation
 */
export function calculateInfiniteTalkCost(
  resolution: '480p' | '720p'
): number {
  // Base cost for InfiniteTalk (in Cortexia credits, max 15s)
  // Cost us: 480P = $0.225 (45 Kie AI credits), 720P = $0.90 (180 Kie AI credits)
  // We charge: 480P = $0.10 (1 credit) → -56% margin (loss leader), 720P = $0.20 (2 credits) → -78% margin (loss leader)
  // Strategic loss leader pricing for user acquisition
  
  if (resolution === '480p') {
    return 1; // 1 credit for 480P → -56% margin (loss leader)
  } else {
    return 2; // 2 credits for 720P → -78% margin (loss leader)
  }
}

/**
 * Main generation function
 */
export async function generateInfiniteTalkVideo(
  input: InfiniteTalkInput
): Promise<string[]> {
  console.log('[InfiniteTalk] Starting video generation:', {
    resolution: input.resolution || '480p'
  });

  // Create task
  const taskResponse = await createInfiniteTalkTask(input);
  const taskId = taskResponse.data.taskId;

  // Poll for completion
  const videoUrls = await pollInfiniteTalkTask(taskId);

  console.log('[InfiniteTalk] Generation complete:', {
    taskId,
    videoCount: videoUrls.length
  });

  return videoUrls;
}