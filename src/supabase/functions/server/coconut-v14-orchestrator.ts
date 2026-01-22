/**
 * COCONUT V14 - GENERATION ORCHESTRATOR
 * Phase 3 - Jour 2: Complete generation pipeline
 * 
 * Responsibilities:
 * - Single-pass generation (direct from CocoBoard)
 * - Multi-pass generation (assets → composition)
 * - Job tracking & status updates
 * - Credit management & refunds
 * - Error recovery & retry
 */

import { createClient } from 'npm:@supabase/supabase-js@2';
import * as gemini from './gemini-service.ts';
import * as flux from './coconut-v14-flux.ts';
import * as credits from './coconut-v14-credits.ts';
import * as projectsUnified from './projects.tsx'; // ✅ MIGRATED: Use unified projects system
import * as cocoboard from './coconut-v14-cocoboard.ts';
import * as storage from './coconut-v14-storage.ts';
import type { 
  CocoBoard, 
  GenerationJob,
  GeneratedAsset,
  MissingAsset,
  FluxPrompt,
  TechnicalSpecs
} from '../../../lib/types/coconut-v14.ts';

// ============================================
// CONFIGURATION
// ============================================

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Generation modes
const SINGLE_PASS_COST = 15; // 15 crédits (text-to-image)
const MULTI_PASS_BASE_COST = 15; // 15 crédits for final composition
const ASSET_GENERATION_COST = 15; // 15 crédits per asset

// ============================================
// ERROR CLASSES
// ============================================

class OrchestrationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'OrchestrationError';
  }
}

class InsufficientCreditsError extends OrchestrationError {
  constructor(required: number, available: number) {
    super(
      `Insufficient credits: ${required} required, ${available} available`,
      { required, available }
    );
    this.name = 'InsufficientCreditsError';
  }
}

// ============================================
// JOB MANAGEMENT
// ============================================

/**
 * Create generation job in KV store
 */
async function createGenerationJob(
  userId: string,
  projectId: string,
  cocoBoardId: string,
  mode: 'single-pass' | 'multi-pass',
  estimatedCost: number
): Promise<GenerationJob> {
  const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  const job: GenerationJob = {
    id: jobId,
    userId,
    projectId,
    cocoboardId: cocoBoardId,
    mode,
    status: 'initializing',
    progress: 0,
    assets: [],
    logs: [`[${new Date().toISOString()}] Job created (${mode})`],
    estimatedCost,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Store in KV
  await supabase
    .from('kv_store_e55aa214')
    .upsert({
      key: `generation_job:${jobId}`,
      value: JSON.stringify(job)
    });
  
  console.log(`✅ Generation job created: ${jobId} (${mode})`);
  
  return job;
}

/**
 * Update generation job
 */
async function updateGenerationJob(
  jobId: string,
  updates: Partial<GenerationJob>
): Promise<void> {
  // Get current job
  const { data } = await supabase
    .from('kv_store_e55aa214')
    .select('value')
    .eq('key', `generation_job:${jobId}`)
    .single();
  
  if (!data) {
    throw new OrchestrationError(`Job not found: ${jobId}`);
  }
  
  const job = JSON.parse(data.value) as GenerationJob;
  
  // Merge updates
  const updatedJob: GenerationJob = {
    ...job,
    ...updates,
    updatedAt: new Date()
  };
  
  // Update in KV
  await supabase
    .from('kv_store_e55aa214')
    .update({
      value: JSON.stringify(updatedJob)
    })
    .eq('key', `generation_job:${jobId}`);
  
  console.log(`✅ Job updated: ${jobId} (status: ${updatedJob.status})`);
}

/**
 * Add log entry to job
 */
async function addJobLog(jobId: string, message: string): Promise<void> {
  const { data } = await supabase
    .from('kv_store_e55aa214')
    .select('value')
    .eq('key', `generation_job:${jobId}`)
    .single();
  
  if (!data) return;
  
  const job = JSON.parse(data.value) as GenerationJob;
  const logEntry = `[${new Date().toISOString()}] ${message}`;
  
  job.logs.push(logEntry);
  job.updatedAt = new Date();
  
  await supabase
    .from('kv_store_e55aa214')
    .update({
      value: JSON.stringify(job)
    })
    .eq('key', `generation_job:${jobId}`);
}

/**
 * Get generation job
 */
export async function getGenerationJob(jobId: string): Promise<GenerationJob | null> {
  const { data } = await supabase
    .from('kv_store_e55aa214')
    .select('value')
    .eq('key', `generation_job:${jobId}`)
    .single();
  
  if (!data) return null;
  
  return JSON.parse(data.value) as GenerationJob;
}

// ============================================
// SINGLE-PASS GENERATION
// ============================================

/**
 * Generate image directly from CocoBoard (single-pass)
 * 
 * Use case: When all assets are available or can be described in final prompt
 */
export async function singlePassGeneration(
  userId: string,
  projectId: string,
  board: CocoBoard
): Promise<GenerationJob> {
  const startTime = Date.now();
  
  console.log('🎨 Starting single-pass generation...');
  console.log('Project:', projectId);
  
  // 1. Check credits
  const totalCost = SINGLE_PASS_COST;
  const hasCredits = await credits.checkCredits(userId, totalCost);
  
  if (!hasCredits) {
    const balance = await credits.getCreditBalance(userId);
    throw new InsufficientCreditsError(totalCost, balance);
  }
  
  // 2. Create job
  const job = await createGenerationJob(
    userId,
    projectId,
    board.id,
    'single-pass',
    totalCost
  );
  
  try {
    // 3. Deduct credits upfront
    await credits.deductCredits(
      userId,
      totalCost,
      `Single-pass generation - Project ${projectId}`,
      projectId
    );
    await addJobLog(job.id, `Debited ${totalCost} credits`);
    
    // 4. Update job status
    await updateGenerationJob(job.id, {
      status: 'generating-final',
      progress: 10
    });
    
    // 5. Determine mode: text-to-image or image-to-image
    const hasReferences = board.references && board.references.length > 0;
    const referenceUrls = hasReferences 
      ? board.references.map(ref => ref.url)
      : [];
    
    await addJobLog(
      job.id, 
      hasReferences 
        ? `Using image-to-image with ${referenceUrls.length} references`
        : 'Using text-to-image'
    );
    
    // 6. Create Flux task
    let taskId: string;
    
    if (hasReferences) {
      // Image-to-image mode
      taskId = await flux.createImageToImageTask(
        board.finalPrompt,
        referenceUrls,
        board.specs
      );
    } else {
      // Text-to-image mode
      taskId = await flux.createTextToImageTask(
        board.finalPrompt,
        board.specs
      );
    }
    
    await addJobLog(job.id, `Flux task created: ${taskId}`);
    await updateGenerationJob(job.id, {
      progress: 20,
      currentTask: taskId
    });
    
    // 7. Poll for completion
    await addJobLog(job.id, 'Polling for completion...');
    
    const imageUrl = await flux.pollFluxTaskWithRetry(
      taskId,
      2,
      (progress, status) => {
        // Update job progress
        const jobProgress = 20 + Math.floor(progress * 0.7); // 20-90%
        updateGenerationJob(job.id, { progress: jobProgress });
        addJobLog(job.id, `Progress: ${progress}% (${status})`);
      }
    );
    
    await addJobLog(job.id, `Generation completed: ${imageUrl}`);
    
    // 8. Upload to Supabase Storage
    await updateGenerationJob(job.id, {
      status: 'saving',
      progress: 90
    });
    
    const finalUrl = await storage.uploadGeneratedImage(
      imageUrl,
      projectId,
      'final'
    );
    
    await addJobLog(job.id, `Image saved to storage: ${finalUrl}`);
    
    // 9. Update job as completed
    const duration = Date.now() - startTime;
    
    await updateGenerationJob(job.id, {
      status: 'completed',
      progress: 100,
      finalImage: finalUrl,
      completedAt: new Date(),
      metadata: {
        duration: `${duration}ms`,
        mode: hasReferences ? 'image-to-image' : 'text-to-image',
        referencesCount: referenceUrls.length
      }
    });
    
    // 10. Update project
    await projectsUnified.updateProjectStatus(projectId, 'completed', {
      generationJobId: job.id,
      finalImage: finalUrl,
      cost: totalCost,
      completedAt: new Date().toISOString()
    });
    
    await addJobLog(job.id, `✅ Single-pass generation complete (${duration}ms)`);
    
    console.log(`✅ Single-pass generation completed in ${duration}ms`);
    
    return await getGenerationJob(job.id) as GenerationJob;
    
  } catch (error) {
    console.error('❌ Single-pass generation failed:', error);
    
    // Update job as failed
    await updateGenerationJob(job.id, {
      status: 'error',
      error: error.message
    });
    
    await addJobLog(job.id, `❌ Error: ${error.message}`);
    
    // Refund credits (minus a small fee for processing)
    const refundAmount = Math.floor(totalCost * 0.8); // Refund 80%
    if (refundAmount > 0) {
      await credits.addCredits(
        userId,
        refundAmount,
        `Refund for failed generation - Job ${job.id}`
      );
      await addJobLog(job.id, `Refunded ${refundAmount} credits`);
    }
    
    throw error;
  }
}

// ============================================
// MULTI-PASS GENERATION
// ============================================

/**
 * Generate missing assets first, then compose final image (multi-pass)
 * 
 * Use case: When some assets are missing and need to be generated separately
 */
export async function multiPassGeneration(
  userId: string,
  projectId: string,
  board: CocoBoard
): Promise<GenerationJob> {
  const startTime = Date.now();
  
  console.log('🎨 Starting multi-pass generation...');
  console.log('Project:', projectId);
  
  // 1. Get missing assets
  const missingAssets = board.analysis.assetsRequired.missing.filter(
    asset => asset.canBeGenerated
  );
  
  if (missingAssets.length === 0) {
    throw new OrchestrationError(
      'No missing assets to generate. Use single-pass instead.'
    );
  }
  
  console.log(`Missing assets to generate: ${missingAssets.length}`);
  
  // 2. Calculate total cost
  const assetsCost = missingAssets.length * ASSET_GENERATION_COST;
  const finalCost = MULTI_PASS_BASE_COST;
  const totalCost = assetsCost + finalCost;
  
  // 3. Check credits
  const hasCredits = await credits.checkCredits(userId, totalCost);
  
  if (!hasCredits) {
    const balance = await credits.getCreditBalance(userId);
    throw new InsufficientCreditsError(totalCost, balance);
  }
  
  // 4. Create job
  const job = await createGenerationJob(
    userId,
    projectId,
    board.id,
    'multi-pass',
    totalCost
  );
  
  try {
    // 5. Deduct credits upfront
    await credits.deductCredits(
      userId,
      totalCost,
      `Multi-pass generation - Project ${projectId}`,
      projectId
    );
    await addJobLog(job.id, `Debited ${totalCost} credits (${missingAssets.length} assets + final)`);
    
    // 6. Generate missing assets
    await updateGenerationJob(job.id, {
      status: 'generating-assets',
      progress: 10,
      totalAssets: missingAssets.length
    });
    
    const generatedAssets: GeneratedAsset[] = [];
    
    for (let i = 0; i < missingAssets.length; i++) {
      const asset = missingAssets[i];
      const assetProgress = 10 + Math.floor((i / missingAssets.length) * 60); // 10-70%
      
      await addJobLog(
        job.id, 
        `Generating asset ${i + 1}/${missingAssets.length}: ${asset.description}`
      );
      
      await updateGenerationJob(job.id, {
        progress: assetProgress,
        currentAsset: asset.description
      });
      
      try {
        // Generate asset
        const generatedAsset = await generateAsset(asset, board.specs, job.id);
        generatedAssets.push(generatedAsset);
        
        await addJobLog(
          job.id,
          `✅ Asset ${i + 1} generated: ${generatedAsset.assetId}`
        );
        
      } catch (assetError) {
        console.error(`Failed to generate asset ${asset.id}:`, assetError);
        await addJobLog(
          job.id,
          `⚠️ Asset ${i + 1} failed: ${assetError.message}`
        );
        // Continue with other assets
      }
    }
    
    // Update job with generated assets
    await updateGenerationJob(job.id, {
      assets: generatedAssets
    });
    
    await addJobLog(
      job.id,
      `Generated ${generatedAssets.length}/${missingAssets.length} assets`
    );
    
    // 7. Compose final image
    await updateGenerationJob(job.id, {
      status: 'composing',
      progress: 70
    });
    
    await addJobLog(job.id, 'Composing final image...');
    
    // Build final prompt with generated assets
    const enhancedPrompt = buildEnhancedPrompt(
      board.finalPrompt,
      generatedAssets
    );
    
    // Get all reference URLs (user refs + generated assets)
    const allReferences = [
      ...board.references.map(ref => ref.url),
      ...generatedAssets.map(asset => asset.imageUrl)
    ].slice(0, 8); // Max 8 references for Flux
    
    await addJobLog(
      job.id,
      `Using ${allReferences.length} references for final composition`
    );
    
    // Create final composition task
    const taskId = await flux.createImageToImageTask(
      enhancedPrompt,
      allReferences,
      board.specs
    );
    
    await addJobLog(job.id, `Final composition task created: ${taskId}`);
    await updateGenerationJob(job.id, {
      progress: 75,
      currentTask: taskId
    });
    
    // Poll for final composition
    const imageUrl = await flux.pollFluxTaskWithRetry(
      taskId,
      2,
      (progress, status) => {
        const jobProgress = 75 + Math.floor(progress * 0.15); // 75-90%
        updateGenerationJob(job.id, { progress: jobProgress });
        addJobLog(job.id, `Composition progress: ${progress}% (${status})`);
      }
    );
    
    await addJobLog(job.id, `Final composition completed: ${imageUrl}`);
    
    // 8. Upload to storage
    await updateGenerationJob(job.id, {
      status: 'saving',
      progress: 90
    });
    
    const finalUrl = await storage.uploadGeneratedImage(
      imageUrl,
      projectId,
      'final'
    );
    
    await addJobLog(job.id, `Final image saved: ${finalUrl}`);
    
    // 9. Complete job
    const duration = Date.now() - startTime;
    
    await updateGenerationJob(job.id, {
      status: 'completed',
      progress: 100,
      finalImage: finalUrl,
      completedAt: new Date(),
      metadata: {
        duration: `${duration}ms`,
        mode: 'multi-pass',
        assetsGenerated: generatedAssets.length,
        totalReferences: allReferences.length
      }
    });
    
    // 10. Update project
    await projectsUnified.updateProjectStatus(projectId, 'completed', {
      generationJobId: job.id,
      finalImage: finalUrl,
      assetsGenerated: generatedAssets.length,
      cost: totalCost,
      completedAt: new Date().toISOString()
    });
    
    await addJobLog(job.id, `✅ Multi-pass generation complete (${duration}ms)`);
    
    console.log(`✅ Multi-pass generation completed in ${duration}ms`);
    
    return await getGenerationJob(job.id) as GenerationJob;
    
  } catch (error) {
    console.error('❌ Multi-pass generation failed:', error);
    
    // Update job as failed
    await updateGenerationJob(job.id, {
      status: 'error',
      error: error.message
    });
    
    await addJobLog(job.id, `❌ Error: ${error.message}`);
    
    // Refund credits (minus cost of successful asset generations)
    const successfulAssets = job.assets?.length || 0;
    const usedCredits = successfulAssets * ASSET_GENERATION_COST;
    const refundAmount = Math.floor((totalCost - usedCredits) * 0.8); // 80% refund
    
    if (refundAmount > 0) {
      await credits.addCredits(
        userId,
        refundAmount,
        `Refund for failed multi-pass generation - Job ${job.id}`
      );
      await addJobLog(job.id, `Refunded ${refundAmount} credits`);
    }
    
    throw error;
  }
}

// ============================================
// ASSET GENERATION
// ============================================

/**
 * Generate a single missing asset
 */
async function generateAsset(
  asset: MissingAsset,
  specs: TechnicalSpecs,
  jobId: string
): Promise<GeneratedAsset> {
  console.log(`🎨 Generating asset: ${asset.description}`);
  
  if (!asset.promptFlux) {
    throw new OrchestrationError(
      `No Flux prompt available for asset: ${asset.id}`
    );
  }
  
  // Create Flux task for asset
  const taskId = await flux.createTextToImageTask(
    asset.promptFlux,
    specs
  );
  
  console.log(`Asset task created: ${taskId}`);
  
  // Poll for completion
  const imageUrl = await flux.pollFluxTaskWithRetry(taskId, 2);
  
  console.log(`Asset generated: ${imageUrl}`);
  
  return {
    assetId: asset.id,
    imageUrl,
    taskId,
    generatedAt: new Date()
  };
}

/**
 * Build enhanced prompt with generated assets context
 */
function buildEnhancedPrompt(
  basePrompt: FluxPrompt,
  generatedAssets: GeneratedAsset[]
): FluxPrompt {
  // Add context about generated assets to scene description
  const assetsContext = generatedAssets.length > 0
    ? ` Integrate the following generated elements: ${generatedAssets.map(a => a.assetId).join(', ')}.`
    : '';
  
  return {
    ...basePrompt,
    scene: basePrompt.scene + assetsContext
  };
}

// ============================================
// ORCHESTRATOR ENTRY POINT
// ============================================

/**
 * Generate from CocoBoard - automatically choose single or multi-pass
 */
export async function generateFromCocoBoard(
  userId: string,
  projectId: string,
  cocoBoardId: string
): Promise<GenerationJob> {
  console.log('🎬 Starting generation orchestration...');
  console.log('CocoBoard:', cocoBoardId);
  
  // 1. Get CocoBoard
  const board = await cocoboard.getCocoBoard(cocoBoardId);
  
  if (!board) {
    throw new OrchestrationError(`CocoBoard not found: ${cocoBoardId}`);
  }
  
  // 2. Determine generation mode
  const missingAssets = board.analysis.assetsRequired.missing.filter(
    asset => asset.canBeGenerated && asset.requiredAction === 'generate'
  );
  
  const useMultiPass = missingAssets.length > 0;
  
  console.log(
    useMultiPass 
      ? `Multi-pass mode: ${missingAssets.length} assets to generate`
      : 'Single-pass mode: direct generation'
  );
  
  // 3. Execute appropriate pipeline
  if (useMultiPass) {
    return await multiPassGeneration(userId, projectId, board);
  } else {
    return await singlePassGeneration(userId, projectId, board);
  }
}

// ============================================
// EXPORTS & INFO
// ============================================

export const ORCHESTRATOR_INFO = {
  version: '14.0.0',
  phase: 3,
  features: {
    singlePass: true,
    multiPass: true,
    assetGeneration: true,
    jobTracking: true,
    creditManagement: true,
    errorRecovery: true,
    refunds: true
  },
  pricing: {
    singlePass: SINGLE_PASS_COST,
    multiPassBase: MULTI_PASS_BASE_COST,
    perAsset: ASSET_GENERATION_COST
  }
};

console.log('✅ Generation orchestrator loaded (Phase 3 - Jour 2)');