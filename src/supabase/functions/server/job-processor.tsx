/**
 * Job Processor - Processes generation jobs from the queue
 * 
 * This service polls the queue and processes jobs sequentially
 * with automatic retry logic and error handling.
 */

import { GenerationQueue, type GenerationJob } from './generation-queue.tsx';
import { generateWithProvider } from './providers.tsx';
import { uploadAssetFromUrl, extractLastFrameFromVideo } from './storage.tsx';

// ============================================
// JOB PROCESSOR
// ============================================

export class JobProcessor {
  private processingJobs: Set<string> = new Set();
  
  /**
   * Process a single job
   */
  async processJob(job: GenerationJob): Promise<void> {
    // Check if already processing
    if (this.processingJobs.has(job.id)) {
      console.log(`⏭️ Job ${job.id} already processing, skipping...`);
      return;
    }

    // Mark as processing
    this.processingJobs.add(job.id);
    
    try {
      console.log(`🚀 Processing job ${job.id} (${job.type})`);
      
      // Update status to processing
      await GenerationQueue.updateJobStatus(job.id, 'processing');
      
      // Process based on type
      let result: GenerationJob['result'];
      
      if (job.type === 'image') {
        result = await this.processImageJob(job);
      } else if (job.type === 'video') {
        result = await this.processVideoJob(job);
      } else {
        throw new Error(`Unsupported job type: ${job.type}`);
      }
      
      // Upload result to permanent storage
      const storedUrl = await uploadAssetFromUrl(
        result!.url,
        job.type === 'video' ? 'video' : 'image',
        job.cocoboardId,
        job.nodeId
      );
      
      result!.url = storedUrl;
      
      // If video, extract last frame
      if (job.type === 'video' && result) {
        try {
          const lastFrameUrl = await extractLastFrameFromVideo(
            result.url,
            job.cocoboardId,
            job.nodeId
          );
          result.lastFrameUrl = lastFrameUrl;
        } catch (error) {
          console.warn('⚠️ Failed to extract last frame:', error);
          // Don't fail the job if frame extraction fails
        }
      }
      
      // Update status to completed
      await GenerationQueue.updateJobStatus(job.id, 'completed', result);
      
      console.log(`✅ Job ${job.id} completed successfully`);
      
    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Update status to error
      await GenerationQueue.updateJobStatus(job.id, 'error', undefined, errorMessage);
      
      // Auto-retry if not exceeded max retries
      const updatedJob = await GenerationQueue.getJob(job.id);
      if (updatedJob && updatedJob.retryCount < updatedJob.maxRetries) {
        console.log(`🔄 Auto-retrying job ${job.id} (${updatedJob.retryCount}/${updatedJob.maxRetries})`);
        await GenerationQueue.retryJob(job.id);
      }
      
    } finally {
      // Remove from processing set
      this.processingJobs.delete(job.id);
    }
  }
  
  /**
   * Process image generation job
   */
  private async processImageJob(job: GenerationJob): Promise<GenerationJob['result']> {
    console.log(`🎨 Generating image with ${job.params.provider}...`);
    
    // Generate image using the provider system
    const response = await generateWithProvider({
      prompt: job.params.prompt,
      quality: 'premium', // Coconut always uses premium
      useCredits: 'paid', // Use paid credits for Coconut
      userId: job.userId,
      advancedOptions: {
        model: job.params.provider === 'flux-2-pro' ? 'flux-2-pro' : 'auto',
        enhancePrompt: false, // Director already enhanced the prompt
      },
      // Convert aspectRatio to width/height
      width: job.params.aspectRatio === '16:9' ? 1280 : 
             job.params.aspectRatio === '9:16' ? 720 : 1024,
      height: job.params.aspectRatio === '16:9' ? 720 : 
              job.params.aspectRatio === '9:16' ? 1280 : 1024,
    });
    
    if (!response.success || !response.url) {
      throw new Error(response.error || 'No URL returned from provider');
    }
    
    return {
      url: response.url,
      metadata: {
        provider: response.provider || job.params.provider,
        model: response.model,
        creditsUsed: response.creditsUsed,
      },
    };
  }
  
  /**
   * Process video generation job
   */
  private async processVideoJob(job: GenerationJob): Promise<GenerationJob['result']> {
    console.log(`🎥 Generating video with ${job.params.provider}...`);
    
    // TODO: Implement video generation when Veo integration is ready
    // For now, return a stub error
    throw new Error('Video generation not yet implemented. Veo integration coming in Phase 21.');
  }
  
  /**
   * Process all pending jobs for a cocoboard
   */
  async processCocoboardQueue(cocoboardId: string): Promise<void> {
    console.log(`🔄 Processing queue for cocoboard: ${cocoboardId}`);
    
    let processed = 0;
    let hasMore = true;
    
    while (hasMore) {
      // Get next job
      const nextJob = await GenerationQueue.getNextJob(cocoboardId);
      
      if (!nextJob) {
        hasMore = false;
        break;
      }
      
      // Process job
      await this.processJob(nextJob);
      processed++;
      
      // Small delay between jobs
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`✅ Processed ${processed} jobs for cocoboard ${cocoboardId}`);
  }
  
  /**
   * Get processing status
   */
  getProcessingStatus(): {
    activeJobs: number;
    jobIds: string[];
  } {
    return {
      activeJobs: this.processingJobs.size,
      jobIds: Array.from(this.processingJobs),
    };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const jobProcessor = new JobProcessor();