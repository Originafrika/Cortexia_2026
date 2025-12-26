/**
 * GENERATION QUEUE - Job Queue System for Asset Generation
 * Phase 0: Foundation Infrastructure
 * 
 * Manages generation jobs with priority, dependencies, and status tracking.
 */

import * as kv from './kv_store.tsx';

// ============================================
// TYPES
// ============================================

export type JobStatus = 'pending' | 'processing' | 'completed' | 'error';
export type JobType = 'image' | 'video' | 'frame-extraction';

export interface GenerationJob {
  id: string;
  nodeId: string;
  cocoboardId: string;
  userId: string; // User ID for credit tracking
  type: JobType;
  status: JobStatus;
  priority: number; // Higher number = higher priority
  dependencies: string[]; // Job IDs that must complete first
  
  // Generation params
  params: {
    prompt: string;
    provider: 'flux-2-pro' | 'veo-3.1-fast';
    referenceImages?: string[];
    startFrame?: string;
    duration?: number;
    aspectRatio?: string;
    resolution?: string;
    [key: string]: any;
  };
  
  // Result
  result?: {
    url: string;
    lastFrameUrl?: string; // For video jobs
    metadata?: any;
  };
  
  // Timing
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  
  // Error handling
  error?: string;
  retryCount: number;
  maxRetries: number;
}

// ============================================
// GENERATION QUEUE CLASS
// ============================================

export class GenerationQueue {
  private static readonly QUEUE_PREFIX = 'generation-queue';
  private static readonly JOB_PREFIX = 'generation-job';
  
  /**
   * Add job to queue
   */
  static async addJob(job: Omit<GenerationJob, 'id' | 'status' | 'createdAt' | 'retryCount'>): Promise<string> {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    
    const fullJob: GenerationJob = {
      ...job,
      id: jobId,
      status: 'pending',
      createdAt: Date.now(),
      retryCount: 0,
      maxRetries: job.maxRetries || 3,
    };
    
    // Store job
    await kv.set(`${this.JOB_PREFIX}:${jobId}`, fullJob);
    
    // Add to queue for this CocoBoard
    const queueKey = `${this.QUEUE_PREFIX}:${job.cocoboardId}`;
    const queue = await kv.get<string[]>(queueKey) || [];
    queue.push(jobId);
    await kv.set(queueKey, queue);
    
    console.log(`✅ Job added to queue: ${jobId}`);
    
    return jobId;
  }
  
  /**
   * Get next job to process (respecting dependencies and priority)
   */
  static async getNextJob(cocoboardId: string): Promise<GenerationJob | null> {
    const queueKey = `${this.QUEUE_PREFIX}:${cocoboardId}`;
    const queue = await kv.get<string[]>(queueKey) || [];
    
    if (queue.length === 0) {
      return null;
    }
    
    // Get all pending jobs
    const pendingJobs: GenerationJob[] = [];
    
    for (const jobId of queue) {
      const job = await kv.get<GenerationJob>(`${this.JOB_PREFIX}:${jobId}`);
      if (job && job.status === 'pending') {
        pendingJobs.push(job);
      }
    }
    
    if (pendingJobs.length === 0) {
      return null;
    }
    
    // Filter jobs whose dependencies are complete
    const readyJobs = await Promise.all(
      pendingJobs.map(async (job) => {
        const depsComplete = await this.areDependenciesComplete(job.dependencies);
        return depsComplete ? job : null;
      })
    );
    
    const validJobs = readyJobs.filter((j): j is GenerationJob => j !== null);
    
    if (validJobs.length === 0) {
      return null;
    }
    
    // Sort by priority (highest first)
    validJobs.sort((a, b) => b.priority - a.priority);
    
    return validJobs[0];
  }
  
  /**
   * Check if all dependencies are complete
   */
  private static async areDependenciesComplete(dependencies: string[]): Promise<boolean> {
    if (dependencies.length === 0) {
      return true;
    }
    
    for (const depId of dependencies) {
      const depJob = await kv.get<GenerationJob>(`${this.JOB_PREFIX}:${depId}`);
      if (!depJob || depJob.status !== 'completed') {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Update job status
   */
  static async updateJobStatus(
    jobId: string,
    status: JobStatus,
    result?: GenerationJob['result'],
    error?: string
  ): Promise<void> {
    const job = await kv.get<GenerationJob>(`${this.JOB_PREFIX}:${jobId}`);
    
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }
    
    job.status = status;
    
    if (status === 'processing' && !job.startedAt) {
      job.startedAt = Date.now();
    }
    
    if (status === 'completed') {
      job.completedAt = Date.now();
      if (result) {
        job.result = result;
      }
    }
    
    if (status === 'error') {
      job.error = error;
      job.retryCount++;
    }
    
    await kv.set(`${this.JOB_PREFIX}:${jobId}`, job);
    
    console.log(`📝 Job ${jobId} status updated: ${status}`);
  }
  
  /**
   * Get all jobs for a CocoBoard
   */
  static async getJobsByCocoboard(cocoboardId: string): Promise<GenerationJob[]> {
    const queueKey = `${this.QUEUE_PREFIX}:${cocoboardId}`;
    const queue = await kv.get<string[]>(queueKey) || [];
    
    const jobs: GenerationJob[] = [];
    
    for (const jobId of queue) {
      const job = await kv.get<GenerationJob>(`${this.JOB_PREFIX}:${jobId}`);
      if (job) {
        jobs.push(job);
      }
    }
    
    return jobs;
  }
  
  /**
   * Get job by ID
   */
  static async getJob(jobId: string): Promise<GenerationJob | null> {
    return await kv.get<GenerationJob>(`${this.JOB_PREFIX}:${jobId}`);
  }
  
  /**
   * Get queue statistics
   */
  static async getQueueStats(cocoboardId: string): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    error: number;
  }> {
    const jobs = await this.getJobsByCocoboard(cocoboardId);
    
    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      error: jobs.filter(j => j.status === 'error').length,
    };
  }
  
  /**
   * Clear completed jobs (cleanup)
   */
  static async clearCompletedJobs(cocoboardId: string): Promise<void> {
    const queueKey = `${this.QUEUE_PREFIX}:${cocoboardId}`;
    const queue = await kv.get<string[]>(queueKey) || [];
    
    const remainingJobs: string[] = [];
    
    for (const jobId of queue) {
      const job = await kv.get<GenerationJob>(`${this.JOB_PREFIX}:${jobId}`);
      
      if (job && job.status !== 'completed') {
        remainingJobs.push(jobId);
      } else {
        // Delete completed job
        await kv.del(`${this.JOB_PREFIX}:${jobId}`);
      }
    }
    
    await kv.set(queueKey, remainingJobs);
    
    console.log(`🧹 Cleared ${queue.length - remainingJobs.length} completed jobs`);
  }
  
  /**
   * Retry failed job
   */
  static async retryJob(jobId: string): Promise<boolean> {
    const job = await this.getJob(jobId);
    
    if (!job) {
      return false;
    }
    
    if (job.retryCount >= job.maxRetries) {
      console.log(`❌ Job ${jobId} exceeded max retries (${job.maxRetries})`);
      return false;
    }
    
    job.status = 'pending';
    job.error = undefined;
    
    await kv.set(`${this.JOB_PREFIX}:${jobId}`, job);
    
    console.log(`🔄 Job ${jobId} queued for retry (attempt ${job.retryCount + 1}/${job.maxRetries})`);
    
    return true;
  }
}