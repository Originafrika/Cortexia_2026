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
import {
  COCONUT_IMAGE_PROMPT,
  COCONUT_VIDEO_PROMPT,
  COCONUT_CAMPAIGN_PROMPT,
} from './prompts';
import { selectCoconutLLM } from './model-selector';
import { calculateStepCost, type TotalCost } from './cost-calculator';

function getSystemPromptForMode(mode: CoconutMode): string {
  switch (mode) {
    case 'image':
      return COCONUT_IMAGE_PROMPT;
    case 'video':
      return COCONUT_VIDEO_PROMPT;
    case 'campaign':
      return COCONUT_CAMPAIGN_PROMPT;
    default:
      return COCONUT_IMAGE_PROMPT;
  }
}

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
      const systemPrompt = getSystemPromptForMode(params.mode);
      const userPrompt = this.buildUserPrompt(params);
      
      const llmModel = selectCoconutLLM(
        params.mode,
        params.assets?.length || 0,
        params.intent.length,
      );

      console.log(`🧠 [CoconutOrchestrator] Generating blueprint — mode: ${params.mode}, LLM: ${llmModel}, assets: ${params.assets?.length || 0}, intent: ${params.intent.length} chars`);
      
      const llmResult = await llmCascade.callWithFallback({
        systemPrompt,
        userPrompt,
        temperature: 0.3,
        maxTokens: 8192,
        modelPreference: llmModel,
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
      ? `\n\nPROVIDED ASSETS (${params.assets.length}):\n${params.assets.map((a, i) => `  ${i + 1}. ${a}`).join('\n')}`
      : '\n\nPROVIDED ASSETS: None';

    return `CREATIVE INTENT:
${params.intent}
${assetContext}

Generate a complete CocoBoard blueprint as valid JSON following the mode-specific guidelines.
For campaigns, include the campaign object with phases, posts, and visualSteps.
Return ONLY valid JSON — no markdown, no explanation.`;
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
   * Topological sort with cycle detection.
   * Returns ordered step IDs respecting dependencies.
   * If circular dependencies detected, falls back to natural order.
   */
  private topologicalSort(steps: Step[]): { order: string[]; hasCycle: boolean } {
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const allIds = new Set<string>();

    for (const step of steps) {
      allIds.add(step.id);
      if (!graph.has(step.id)) graph.set(step.id, []);
      if (!inDegree.has(step.id)) inDegree.set(step.id, 0);

      for (const dep of step.dependsOn || []) {
        if (!graph.has(dep)) graph.set(dep, []);
        if (!inDegree.has(dep)) inDegree.set(dep, 0);
        graph.get(dep)!.push(step.id);
        inDegree.set(step.id, (inDegree.get(step.id) || 0) + 1);
      }
    }

    const queue: string[] = [];
    for (const [id, degree] of inDegree) {
      if (degree === 0) queue.push(id);
    }

    const order: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      order.push(current);
      for (const neighbor of graph.get(current) || []) {
        inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
        if (inDegree.get(neighbor) === 0) queue.push(neighbor);
      }
    }

    const hasCycle = order.length < allIds.size;
    if (hasCycle) {
      console.warn('⚠️ [CoconutOrchestrator] Circular dependencies detected, falling back to natural order');
      return { order: steps.map(s => s.id), hasCycle: true };
    }

    return { order, hasCycle: false };
  }

  /**
   * Execute blend batch — run all steps respecting dependencies.
   * Features:
   * - Topological sort with cycle detection
   * - Retry logic for failed steps (up to 2 retries)
   * - Continue execution if non-critical step fails
   * - Detailed progress reporting via onProgress callback
   */
  async executeBlendBatch(
    jobId: string,
    steps: Step[],
    userId: string,
    apiKey: string,
    onProgress?: (stepId: string, status: string, outputUrl?: string) => void
  ): Promise<{ success: boolean; completed: number; failed: number; skipped: number; totalCredits: number }> {
    const { order, hasCycle } = this.topologicalSort(steps);
    const completedSteps = new Map<string, { success: boolean; outputUrl?: string }>();
    let totalCredits = 0;
    let failed = 0;
    let skipped = 0;

    console.log(`🔄 [CoconutOrchestrator] Executing blend batch — ${order.length} steps, cycle: ${hasCycle}`);

    for (const stepId of order) {
      const step = steps.find(s => s.id === stepId);
      if (!step) continue;

      // Check if all dependencies succeeded
      const failedDeps = (step.dependsOn || []).filter(depId => {
        const dep = completedSteps.get(depId);
        return !dep?.success;
      });

      if (failedDeps.length > 0) {
        console.warn(`⏭️ [CoconutOrchestrator] Skipping step ${stepId} — dependencies failed: ${failedDeps.join(', ')}`);
        completedSteps.set(stepId, { success: false });
        skipped++;
        onProgress?.(stepId, 'skipped');
        continue;
      }

      // Execute with retry logic (up to 2 retries)
      let result: ExecuteStepResult | null = null;
      const maxRetries = 2;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
          console.log(`🔄 [CoconutOrchestrator] Retrying step ${stepId} — attempt ${attempt + 1}/${maxRetries + 1}`);
          await new Promise(r => setTimeout(r, 2000 * attempt)); // Exponential backoff
        }

        onProgress?.(stepId, attempt === 0 ? 'processing' : 'retrying');
        result = await this.executeStep({ jobId, step, userId, apiKey });

        if (result.success) break;
        console.warn(`⚠️ [CoconutOrchestrator] Step ${stepId} failed (attempt ${attempt + 1}): ${result.error}`);
      }

      totalCredits += result?.creditsConsumed || 0;

      if (result?.success) {
        completedSteps.set(stepId, { success: true, outputUrl: result.outputUrl });
        onProgress?.(stepId, 'completed', result.outputUrl);
        const actualCost = calculateStepCost(step);
        console.log(`✅ [CoconutOrchestrator] Step ${stepId} completed — estimated: ${step.creditsEstimated}cr, actual: ${actualCost.credits}cr (${actualCost.breakdown})`);
      } else {
        completedSteps.set(stepId, { success: false });
        failed++;
        onProgress?.(stepId, 'failed');
        console.error(`❌ [CoconutOrchestrator] Step ${stepId} failed after ${maxRetries + 1} attempts: ${result?.error}`);
      }
    }

    const completed = order.length - failed - skipped;
    console.log(`📊 [CoconutOrchestrator] Blend batch complete — ${completed}/${order.length} succeeded, ${failed} failed, ${skipped} skipped, ${totalCredits} credits`);

    return {
      success: failed === 0,
      completed,
      failed,
      skipped,
      totalCredits,
    };
  }
}

export const coconutOrchestrator = new CoconutOrchestrator();
