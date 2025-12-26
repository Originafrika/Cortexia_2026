import type { 
  AnalyzeIntentPayload,
  AnalysisResult,
  IntentInput,
  ReferenceUrls 
} from '../../../lib/types/coconut-v14.ts';
import { AnalysisResultSchema, GEMINI_OUTPUT_JSON_SCHEMA } from './gemini-schemas.ts';
import { GEMINI_SYSTEM_INSTRUCTION, buildAnalysisPrompt, validatePromptLength } from './gemini-prompts.ts';

// ============================================
// ERROR HANDLING - Import error handlers
// ============================================

class GeminiAnalysisError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'GeminiAnalysisError';
  }
}

class TimeoutError extends Error {
  constructor(message: string, public timeout: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// ============================================
// CONFIGURATION
// ============================================

const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
const REPLICATE_API_BASE = 'https://api.replicate.com/v1';
const GEMINI_MODEL_VERSION = 'google/gemini-2.5-flash:latest';

// Timeouts & Limits
const MAX_POLL_ATTEMPTS = 60; // 60 attempts × 5s = 5 minutes max
const POLL_INTERVAL_MS = 5000; // 5 seconds
const MAX_THINKING_BUDGET = 8000; // Tokens for reasoning
const MAX_OUTPUT_TOKENS = 8192; // Sufficient for complex JSON

// ============================================
// MAIN ANALYZE FUNCTION
// ============================================

/**
 * Analyser une intention avec Gemini 2.5 Flash
 */
export async function analyzeIntentWithGemini(
  payload: AnalyzeIntentPayload
): Promise<AnalysisResult> {
  console.log('📊 Starting Gemini analysis...');
  console.log('Payload:', {
    userId: payload.userId,
    projectId: payload.projectId,
    descriptionLength: payload.description.length,
    imagesCount: payload.references.images.length,
    videosCount: payload.references.videos.length,
    format: payload.format,
    resolution: payload.resolution
  });
  
  if (!REPLICATE_API_KEY) {
    throw new Error('REPLICATE_API_KEY not configured');
  }
  
  // 1. Build user prompt
  const userPrompt = buildAnalysisPrompt({
    description: payload.description,
    references: {
      images: [],
      videos: [],
      descriptions: payload.references.descriptions
    },
    format: payload.format,
    resolution: payload.resolution,
    targetUsage: payload.targetUsage
  } as IntentInput, payload.references);
  
  // 2. Validate prompt length
  const promptValidation = validatePromptLength(userPrompt);
  if (!promptValidation.valid) {
    throw new Error(
      `Prompt too long: ${promptValidation.length} characters (max: ${promptValidation.maxLength})`
    );
  }
  
  console.log(`✅ User prompt built: ${promptValidation.length} characters`);
  
  // 3. Build Replicate prediction request
  const predictionRequest = buildReplicatePredictionRequest(
    userPrompt,
    payload.references
  );
  
  // 4. Create prediction
  console.log('🚀 Creating Replicate prediction...');
  const prediction = await createReplicatePrediction(predictionRequest);
  console.log(`✅ Prediction created: ${prediction.id}`);
  
  // 5. Poll until completion
  console.log('⏳ Polling prediction status...');
  const result = await pollPrediction(prediction.id);
  console.log('✅ Prediction completed');
  
  // 6. Parse and validate output
  console.log('🔍 Parsing and validating output...');
  const analysisResult = await parseAndValidateOutput(result);
  console.log('✅ Analysis validated successfully');
  
  return analysisResult;
}

// ============================================
// REPLICATE API INTEGRATION
// ============================================

interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: any;
  error?: string;
  logs?: string;
}

function buildReplicatePredictionRequest(
  userPrompt: string,
  references: ReferenceUrls
): any {
  const input: any = {
    prompt: userPrompt,
    system_instruction: GEMINI_SYSTEM_INSTRUCTION,
    max_output_tokens: MAX_OUTPUT_TOKENS,
    thinking_budget: MAX_THINKING_BUDGET,
    dynamic_thinking: true,
    temperature: 0.7,
    top_p: 0.95,
    output_schema: GEMINI_OUTPUT_JSON_SCHEMA
  };
  
  // Add images if provided
  if (references.images && references.images.length > 0) {
    input.images = references.images.slice(0, 10);
    console.log(`📸 Including ${input.images.length} images in analysis`);
  }
  
  // Add videos if provided
  if (references.videos && references.videos.length > 0) {
    input.videos = references.videos.slice(0, 10);
    console.log(`🎥 Including ${input.videos.length} videos in analysis`);
  }
  
  return {
    version: GEMINI_MODEL_VERSION,
    input
  };
}

async function createReplicatePrediction(
  request: any
): Promise<ReplicatePrediction> {
  const response = await fetch(`${REPLICATE_API_BASE}/predictions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait'
    },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Replicate API error: ${response.status} - ${error}`);
  }
  
  return await response.json();
}

async function getPrediction(predictionId: string): Promise<ReplicatePrediction> {
  const response = await fetch(
    `${REPLICATE_API_BASE}/predictions/${predictionId}`,
    {
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Replicate API error: ${response.status} - ${error}`);
  }
  
  return await response.json();
}

async function pollPrediction(
  predictionId: string,
  attempt: number = 0
): Promise<string> {
  if (attempt >= MAX_POLL_ATTEMPTS) {
    throw new TimeoutError(`Prediction timeout after ${MAX_POLL_ATTEMPTS} attempts`, MAX_POLL_ATTEMPTS);
  }
  
  const prediction = await getPrediction(predictionId);
  
  console.log(`📊 Poll attempt ${attempt + 1}/${MAX_POLL_ATTEMPTS} - Status: ${prediction.status}`);
  
  if (prediction.status === 'succeeded') {
    if (!prediction.output) {
      throw new GeminiAnalysisError('Prediction succeeded but no output received');
    }
    return prediction.output;
  }
  
  if (prediction.status === 'failed') {
    throw new GeminiAnalysisError(`Prediction failed: ${prediction.error || 'Unknown error'}`);
  }
  
  if (prediction.status === 'canceled') {
    throw new GeminiAnalysisError('Prediction was canceled');
  }
  
  // Continue polling
  await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  return pollPrediction(predictionId, attempt + 1);
}

// ============================================
// OUTPUT PARSING & VALIDATION
// ============================================

async function parseAndValidateOutput(output: any): Promise<AnalysisResult> {
  let jsonString: string;
  
  // Handle different output formats
  if (typeof output === 'string') {
    jsonString = output;
  } else if (Array.isArray(output)) {
    jsonString = output.join('');
  } else if (typeof output === 'object') {
    return validateWithSchema(output);
  } else {
    throw new GeminiAnalysisError(`Unexpected output type: ${typeof output}`);
  }
  
  // Extract JSON from markdown code blocks if present
  const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/) || 
                    jsonString.match(/```\s*([\s\S]*?)\s*```/);
  
  if (jsonMatch) {
    jsonString = jsonMatch[1];
  }
  
  // Clean up common issues
  jsonString = jsonString.trim();
  
  // Parse JSON
  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    console.error('❌ JSON parse error:', error);
    console.error('Raw output:', jsonString.substring(0, 500));
    throw new GeminiAnalysisError(`Failed to parse JSON output: ${error.message}`);
  }
  
  // Validate with Zod schema
  return validateWithSchema(parsed);
}

function validateWithSchema(data: any): AnalysisResult {
  try {
    const validated = AnalysisResultSchema.parse(data);
    console.log('✅ Schema validation passed');
    return validated;
  } catch (error) {
    console.error('❌ Schema validation error:', error);
    
    if (error.errors) {
      const firstError = error.errors[0];
      throw new GeminiAnalysisError(
        `Schema validation failed: ${firstError.path.join('.')} - ${firstError.message}`
      );
    }
    
    throw new GeminiAnalysisError(`Schema validation failed: ${error.message}`);
  }
}

// ============================================
// RETRY LOGIC
// ============================================

export async function analyzeWithRetry(
  payload: AnalyzeIntentPayload,
  maxRetries: number = 2
): Promise<AnalysisResult> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Analysis attempt ${attempt + 1}/${maxRetries + 1}`);
      return await analyzeIntentWithGemini(payload);
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${delayMs}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw new Error(
    `Analysis failed after ${maxRetries + 1} attempts. Last error: ${lastError?.message}`
  );
}

// ============================================
// EXPORT INFO
// ============================================

export const ANALYZER_INFO = {
  version: '14.0.0',
  phase: 2,
  status: 'complete',
  completionDate: '2024-12-25',
  features: {
    geminiVision: true,
    assetDetection: true,
    fluxPromptGeneration: true,
    jsonSchema: true,
    retry: true,
    multimodal: true
  },
  limits: {
    maxImages: 10,
    maxVideos: 10,
    maxPollAttempts: MAX_POLL_ATTEMPTS,
    pollIntervalMs: POLL_INTERVAL_MS,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    thinkingBudget: MAX_THINKING_BUDGET
  }
};

console.log('✅ Analyzer service loaded (COMPLETE - Phase 2)');