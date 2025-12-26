const KIE_AI_BASE_URL = 'https://api.kie.ai/api/v1/jobs';
const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');

export interface NanoBananaProGenerationParams {
  prompt: string;
  imageInput?: string[]; // Up to 8 images
  aspectRatio?: '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9' | 'auto';
  resolution?: '1K' | '2K' | '4K';
  outputFormat?: 'png' | 'jpg';
}

export interface KieAITaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface KieAIStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    model: string;
    state: 'waiting' | 'queuing' | 'generating' | 'success' | 'fail';
    param: string;
    resultJson?: string;
    failCode?: string;
    failMsg?: string;
    costTime?: number;
    completeTime?: number;
    createTime: number;
    updateTime?: number;
  };
}

/**
 * Calculate cost for Nano Banana Pro generation
 */
export function calculateNanoBananaCost(
  resolution: '1K' | '2K' | '4K',
  referenceImageCount: number = 0
): number {
  // Base cost for Nano Banana Pro (in Cortexia credits)
  // Cost us: $0.09 for 1K/2K, $0.12 for 4K
  // We charge: $0.30 for 1K (3 credits), $0.60 for 2K (6 credits), $1.00 for 4K (10 credits)
  let baseCost = 0;
  
  if (resolution === '1K') {
    baseCost = 3; // 3 credits for 1K → 233% margin (same as Flex 1K)
  } else if (resolution === '2K') {
    baseCost = 6; // 6 credits for 2K → 567% margin (same as Flex 2K)
  } else if (resolution === '4K') {
    baseCost = 10; // 10 credits for 4K → 733% margin (exclusive 4K)
  }
  
  // Add 1 credit per reference image
  const refImageCost = referenceImageCount;
  
  return baseCost + refImageCost;
}

/**
 * Create a Nano Banana Pro generation task
 */
export async function createNanoBananaTask(
  params: NanoBananaProGenerationParams
): Promise<KieAITaskResponse> {
  console.log('🍌 Creating Nano Banana Pro task with params:', JSON.stringify({
    prompt: params.prompt.substring(0, 100),
    imageInputCount: params.imageInput?.length || 0,
    aspectRatio: params.aspectRatio,
    resolution: params.resolution,
    outputFormat: params.outputFormat,
  }));

  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY is not set in environment variables');
  }

  const requestBody = {
    model: 'nano-banana-pro',
    input: {
      prompt: params.prompt,
      image_input: params.imageInput || [],
      aspect_ratio: params.aspectRatio || '1:1',
      resolution: params.resolution || '1K',
      output_format: params.outputFormat || 'png',
    },
  };

  console.log('📤 Sending request to Kie AI:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(`${KIE_AI_BASE_URL}/createTask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KIE_AI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('📥 Kie AI raw response:', responseText);

    if (!response.ok) {
      console.error('❌ Kie AI API error:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      });
      throw new Error(
        `Kie AI API error (${response.status}): ${response.statusText}. Body: ${responseText}`
      );
    }

    let result: KieAITaskResponse;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse Kie AI response:', parseError);
      throw new Error(`Invalid JSON response from Kie AI: ${responseText}`);
    }

    if (result.code !== 200) {
      console.error('❌ Kie AI task creation failed:', result);
      throw new Error(`Kie AI error: ${result.msg}`);
    }

    console.log('✅ Task created successfully:', result.data.taskId);
    return result;
  } catch (error) {
    console.error('❌ Error in createNanoBananaTask:', error);
    throw error;
  }
}

/**
 * Query task status
 */
export async function queryNanoBananaTaskStatus(
  taskId: string
): Promise<KieAIStatusResponse> {
  console.log('🔍 Querying Nano Banana Pro task status:', taskId);

  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY is not set in environment variables');
  }

  try {
    const response = await fetch(`${KIE_AI_BASE_URL}/recordInfo?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${KIE_AI_API_KEY}`,
      },
    });

    const responseText = await response.text();
    console.log('📥 Kie AI status raw response:', responseText);

    if (!response.ok) {
      console.error('❌ Kie AI status query error:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      });
      throw new Error(
        `Kie AI status query error (${response.status}): ${response.statusText}. Body: ${responseText}`
      );
    }

    let result: KieAIStatusResponse;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse Kie AI status response:', parseError);
      throw new Error(`Invalid JSON status response from Kie AI: ${responseText}`);
    }

    if (result.code !== 200) {
      console.error('❌ Kie AI status query failed:', result);
      throw new Error(`Kie AI status error: ${result.msg}`);
    }

    console.log('✅ Task status:', {
      taskId: result.data.taskId,
      state: result.data.state,
      hasResult: !!result.data.resultJson,
      failCode: result.data.failCode,
      failMsg: result.data.failMsg,
    });

    return result;
  } catch (error) {
    console.error('❌ Error in queryNanoBananaTaskStatus:', error);
    throw error;
  }
}

/**
 * Poll task until completion (with timeout)
 */
export async function pollNanoBananaTask(
  taskId: string,
  maxAttempts = 120, // 2 minutes with 1s intervals
  intervalMs = 1000
): Promise<string> {
  console.log(
    `🔄 Starting to poll Nano Banana Pro task ${taskId} (max ${maxAttempts} attempts, ${intervalMs}ms interval)`
  );

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 Poll attempt ${attempt}/${maxAttempts} for task ${taskId}`);

    const status = await queryNanoBananaTaskStatus(taskId);

    if (status.data.state === 'success') {
      console.log('✅ Nano Banana Pro task completed successfully!');

      if (!status.data.resultJson) {
        throw new Error('Task succeeded but no resultJson in response');
      }

      let resultData: { resultUrls?: string[] };
      try {
        resultData = JSON.parse(status.data.resultJson);
      } catch (e) {
        throw new Error(
          `Failed to parse resultJson: ${status.data.resultJson}. Error: ${e}`
        );
      }

      if (!resultData.resultUrls || resultData.resultUrls.length === 0) {
        throw new Error('No result URLs in resultJson');
      }

      const imageUrl = resultData.resultUrls[0];
      console.log('🎨 Nano Banana Pro image URL:', imageUrl);
      return imageUrl;
    } else if (status.data.state === 'fail') {
      const errorMsg = status.data.failMsg || 'Unknown error';
      const errorCode = status.data.failCode || 'N/A';
      console.error('❌ Nano Banana Pro task failed:', {
        failCode: errorCode,
        failMsg: errorMsg,
        taskId,
      });
      throw new Error(`Nano Banana Pro generation failed (code: ${errorCode}): ${errorMsg}`);
    }

    // Still processing (waiting, queuing, generating)
    console.log(`⏳ Task status: ${status.data.state}, waiting...`);
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  // Timeout
  throw new Error(
    `Nano Banana Pro task timed out after ${maxAttempts * intervalMs}ms (${maxAttempts} attempts)`
  );
}

/**
 * Full generation flow: create task + poll until completion
 */
export async function generateWithNanoBananaPro(
  params: NanoBananaProGenerationParams
): Promise<string> {
  console.log('🚀 Starting Nano Banana Pro generation flow');

  // Create task
  const taskResponse = await createNanoBananaTask(params);
  const taskId = taskResponse.data.taskId;

  console.log('📋 Task ID:', taskId);

  // Poll until completion
  const imageUrl = await pollNanoBananaTask(taskId);

  console.log('✅ Nano Banana Pro generation complete!');
  return imageUrl;
}