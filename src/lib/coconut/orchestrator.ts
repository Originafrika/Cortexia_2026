// Coconut Orchestrator - Main service for CocoBoard generation and CocoBlend execution
// Orchestrates LLM cascade for blueprint generation and Kie AI for image/video generation

import { llmCascade } from '../ai/llmCascade';
import { sseService } from '../services/sseService';
import { r2Storage } from '../services/r2Storage';
import {
  CoconutMode,
  Step,
  ImageStep,
  VideoStep,
  CocoBoardBlueprint,
  JobStatus,
  calculateTotalCredits,
  generateExecutionOrder,
  identifyParallelGroups,
} from './schemas';

// System prompt for CocoBoard generation
const COCOBOARD_SYSTEM_PROMPT = `You are CocoBoard, an expert AI creative director for Cortexia Enterprise.
Your task is to analyze user intent and generate structured creative plans (CocoBoard blueprints).

For IMAGE mode:
- Create 1-3 image generation steps
- Specify FLUX-2 models (pro/flex/dev) based on quality needs
- Include aspect ratio and resolution recommendations

For VIDEO mode:
- Create 3-6 steps: hook image → hook video → development → climax → CTA
- Use Kling-3, Wan-2.6, or Seedance models
- Specify T2V or I2V based on flow

For CAMPAIGN mode:
- Create a 4-week marketing campaign
- 14-21 posts across Instagram/TikTok/Facebook
- Each week has a theme: Teaser → Launch → Social Proof → Conversion

Output valid JSON matching the CocoBoardBlueprint schema.
Include estimated credits for each step.`;

interface GenerateBlueprintParams {
  mode: CoconutMode;
  intent: string;
  assets?: string[];
  userId: string;
  organizationId?: string;
}

interface GenerateBlueprintResult {
  success: boolean;
  blueprint?: CocoBoardBlueprint;
  provider?: string;
  cost?: number;
  error?: string;
}

interface ExecuteStepParams {
  jobId: string;
  step: Step;
  userId: string;
  apiKey: string;
}

interface ExecuteStepResult {
  success: boolean;
  outputUrl?: string;
  creditsConsumed: number;
  error?: string;
}

class CoconutOrchestrator {
  /**
   * Generate CocoBoard blueprint using LLM cascade
   * Fixed cost: 100 credits (debit before calling)
   */
  async generateBlueprint(params: GenerateBlueprintParams): Promise<GenerateBlueprintResult> {
    try {
      const userPrompt = this.buildUserPrompt(params);
      
      const llmResult = await llmCascade.callWithFallback({
        systemPrompt: COCOBOARD_SYSTEM_PROMPT,
        userPrompt,
        temperature: 0.7,
        maxTokens: 4096,
        modelPreference: 'smart',
      });

      if (!llmResult.success || !llmResult.response?.content) {
        return {
          success: false,
          error: `LLM cascade failed: ${llmResult.attempts.map(a => `${a.provider}: ${a.error}`).join(', ')}`,
        };
      }

      // Parse and validate blueprint
      const content = llmResult.response.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          success: false,
          error: 'LLM response did not contain valid JSON',
        };
      }

      const blueprintData = JSON.parse(jsonMatch[0]);
      
      // Enrich with calculated fields
      const blueprint: CocoBoardBlueprint = {
        ...blueprintData,
        version: 'v14',
        mode: params.mode,
        intent: params.intent,
        executionOrder: generateExecutionOrder(blueprintData.steps),
        parallelGroups: identifyParallelGroups(blueprintData.steps),
        estimatedCredits: calculateTotalCredits(blueprintData.steps),
      };

      return {
        success: true,
        blueprint,
        provider: llmResult.response.provider,
        cost: llmResult.totalCost,
      };
    } catch (error) {
      console.error('Blueprint generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Build user prompt for LLM
   */
  private buildUserPrompt(params: GenerateBlueprintParams): string {
    const assetContext = params.assets?.length 
      ? `\nReference assets provided: ${params.assets.length} images`
      : '';

    return `MODE: ${params.mode}
INTENT: ${params.intent}${assetContext}

Generate a complete CocoBoard blueprint as valid JSON with:
- title: Campaign/project title
- description: Brief overview
- complexity: simple|medium|complex
- steps: Array of generation steps with IDs, prompts, models, and credit estimates
- executionOrder: Step IDs in dependency order

For campaigns, include the campaign object with phases and posts.`;
  }

  /**
   * Execute a single generation step using Kie AI
   * Returns output URL and credits consumed
   */
  async executeStep(params: ExecuteStepParams): Promise<ExecuteStepResult> {
    try {
      switch (params.step.type) {
        case 'image':
          return this.executeImageStep(params);
        case 'video':
          return this.executeVideoStep(params);
        case 'text':
          return { success: true, creditsConsumed: 0 };
        default:
          return { success: false, creditsConsumed: 0, error: 'Unknown step type' };
      }
    } catch (error) {
      console.error('Step execution error:', error);
      return {
        success: false,
        creditsConsumed: 0,
        error: error instanceof Error ? error.message : 'Execution failed',
      };
    }
  }

  /**
   * Execute image generation step via Kie AI
   */
  private async executeImageStep(params: ExecuteStepParams): Promise<ExecuteStepResult> {
    const step = params.step as ImageStep;
    
    try {
      const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${params.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.mapImageModel(step.model),
          input: {
            prompt: step.prompt,
            aspect_ratio: step.aspectRatio,
            resolution: step.resolution,
            ...(step.referenceImages?.length && {
              input_urls: step.referenceImages.slice(0, 8),
              strength: 0.85,
            }),
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          creditsConsumed: 0,
          error: `Kie AI error: ${response.status} - ${error}`,
        };
      }

      const result = await response.json();
      
      if (result.code !== 200 || !result.data?.taskId) {
        return {
          success: false,
          creditsConsumed: 0,
          error: result.msg || 'Task creation failed',
        };
      }

      // Poll for completion
      const outputUrl = await this.pollTaskStatus(result.data.taskId, 'image', params.apiKey);
      
      if (!outputUrl) {
        return {
          success: false,
          creditsConsumed: step.creditsEstimated,
          error: 'Generation timeout or failed',
        };
      }

      // Store in R2
      const r2Result = await this.storeOutputInR2(params.jobId, step.id, outputUrl, 'image');

      return {
        success: r2Result.success,
        outputUrl: r2Result.url,
        creditsConsumed: step.creditsEstimated,
        error: r2Result.error,
      };
    } catch (error) {
      return {
        success: false,
        creditsConsumed: 0,
        error: error instanceof Error ? error.message : 'Image generation failed',
      };
    }
  }

  /**
   * Execute video generation step via Kie AI
   */
  private async executeVideoStep(params: ExecuteStepParams): Promise<ExecuteStepResult> {
    const step = params.step as VideoStep;
    
    try {
      const response = await fetch('https://api.kie.ai/api/v1/veo/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${params.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: step.model,
          prompt: step.prompt,
          generationType: step.generationType,
          ...(step.generationType === 'IMAGE_2_VIDEO' && step.sourceImageStepId && {
            imageUrls: [step.sourceImageStepId], // This would be resolved to actual URL
          }),
          aspectRatio: step.aspectRatio,
          duration: step.duration,
          enableTranslation: true,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          creditsConsumed: 0,
          error: `Kie AI error: ${response.status} - ${error}`,
        };
      }

      const result = await response.json();
      
      if (result.code !== 200 || !result.data?.taskId) {
        return {
          success: false,
          creditsConsumed: 0,
          error: result.msg || 'Video generation failed',
        };
      }

      // Poll for completion
      const outputUrl = await this.pollTaskStatus(result.data.taskId, 'video', params.apiKey);
      
      if (!outputUrl) {
        return {
          success: false,
          creditsConsumed: step.creditsEstimated,
          error: 'Video generation timeout or failed',
        };
      }

      // Store in R2
      const r2Result = await this.storeOutputInR2(params.jobId, step.id, outputUrl, 'video');

      return {
        success: r2Result.success,
        outputUrl: r2Result.url,
        creditsConsumed: step.creditsEstimated,
        error: r2Result.error,
      };
    } catch (error) {
      return {
        success: false,
        creditsConsumed: 0,
        error: error instanceof Error ? error.message : 'Video generation failed',
      };
    }
  }

  /**
   * Poll Kie AI task status
   */
  private async pollTaskStatus(
    taskId: string,
    type: 'image' | 'video',
    apiKey: string,
    maxAttempts: number = 60,
    intervalMs: number = 5000
  ): Promise<string | null> {
    const endpoint = type === 'video'
      ? `https://api.kie.ai/api/v1/veo/record-info?taskId=${taskId}`
      : `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });

        if (!response.ok) {
          await new Promise(r => setTimeout(r, intervalMs));
          continue;
        }

        const result = await response.json();
        
        if (result.code === 200 && result.data) {
          // Check status
          const status = result.data.status;
          
          if (status === 'success' || status === 'completed') {
            return result.data.url || result.data.outputUrl || null;
          }
          
          if (status === 'failed' || status === 'error') {
            return null;
          }
        }

        await new Promise(r => setTimeout(r, intervalMs));
      } catch (error) {
        console.error('Poll error:', error);
        await new Promise(r => setTimeout(r, intervalMs));
      }
    }

    return null; // Timeout
  }

  /**
   * Store output in R2
   */
  private async storeOutputInR2(
    jobId: string,
    stepId: string,
    sourceUrl: string,
    type: 'image' | 'video'
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Fetch from source
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        return { success: false, error: 'Failed to fetch output' };
      }

      const blob = await response.blob();
      
      // Upload to R2
      const extension = type === 'image' ? 'png' : 'mp4';
      const key = r2Storage.generateKey(jobId, stepId, type, extension);
      const result = await r2Storage.uploadFile(key, blob, type === 'image' ? 'image/png' : 'video/mp4');

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'R2 storage failed',
      };
    }
  }

  /**
   * Map image model to Kie AI format
   */
  private mapImageModel(model: string): string {
    const modelMap: Record<string, string> = {
      'flux-2-pro': 'flux-2/pro-text-to-image',
      'flux-2-flex': 'flux-2/flex-text-to-image',
      'flux-2-dev': 'flux-2/dev-text-to-image',
      'nano-banana-pro': 'nano-banana/pro',
      'nano-banana-2': 'nano-banana/2',
      'qwen2-image': 'qwen2/image',
    };
    return modelMap[model] || model;
  }

  /**
   * Execute blend batch - run all steps respecting dependencies
   */
  async executeBlendBatch(
    jobId: string,
    steps: Step[],
    userId: string,
    apiKey: string,
    onProgress?: (stepId: string, status: string, outputUrl?: string) => void
  ): Promise<{ success: boolean; completed: number; failed: number; totalCredits: number }> {
    const executionOrder = generateExecutionOrder(steps);
    const completedSteps = new Map<string, { success: boolean; outputUrl?: string }>();
    let totalCredits = 0;
    let failed = 0;

    for (const stepId of executionOrder) {
      const step = steps.find(s => s.id === stepId);
      if (!step) continue;

      // Resolve dependencies
      if (step.dependsOn) {
        for (const depId of step.dependsOn) {
          const dep = completedSteps.get(depId);
          if (!dep?.success) {
            // Skip this step - dependency failed
            onProgress?.(stepId, 'skipped');
            failed++;
            continue;
          }
        }
      }

      onProgress?.(stepId, 'processing');

      const result = await this.executeStep({
        jobId,
        step,
        userId,
        apiKey,
      });

      totalCredits += result.creditsConsumed;

      if (result.success) {
        completedSteps.set(stepId, { success: true, outputUrl: result.outputUrl });
        onProgress?.(stepId, 'completed', result.outputUrl);
      } else {
        completedSteps.set(stepId, { success: false });
        failed++;
        onProgress?.(stepId, 'failed');
      }
    }

    return {
      success: failed === 0,
      completed: completedSteps.size - failed,
      failed,
      totalCredits,
    };
  }
}

export const coconutOrchestrator = new CoconutOrchestrator();
