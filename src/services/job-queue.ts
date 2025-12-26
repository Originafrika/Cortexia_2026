/**
 * Job Queue Service
 * Manages generation jobs and polling
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/jobs`;

export type JobStatus = 'pending' | 'processing' | 'completed' | 'error';
export type JobType = 'image' | 'video' | 'frame-extraction';

export interface GenerationJob {
  id: string;
  nodeId: string;
  cocoboardId: string;
  type: JobType;
  status: JobStatus;
  priority: number;
  dependencies: string[];
  
  params: {
    prompt: string;
    provider: 'flux-2-pro' | 'veo-3.1-fast';
    [key: string]: any;
  };
  
  result?: {
    url: string;
    lastFrameUrl?: string;
    metadata?: any;
  };
  
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  
  error?: string;
  retryCount: number;
  maxRetries: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: number;
}

class JobQueueService {
  private headers: HeadersInit;
  private pollingIntervals: Map<string, number> = new Map();

  constructor() {
    this.headers = {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a new generation job
   */
  async createJob(params: {
    nodeId: string;
    cocoboardId: string;
    type: 'image' | 'video';
    priority?: number;
    dependencies?: string[];
    params: {
      prompt: string;
      provider: 'flux-2-pro' | 'veo-3.1-fast';
      [key: string]: any;
    };
    maxRetries?: number;
    autoProcess?: boolean;
  }): Promise<string> {
    console.log('📝 Creating generation job:', {
      type: params.type,
      nodeId: params.nodeId,
      provider: params.params.provider,
    });

    try {
      const url = new URL(`${BASE_URL}/create`);
      if (params.autoProcess) {
        url.searchParams.set('autoProcess', 'true');
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(params),
      });

      const result: ApiResponse<{ jobId: string }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Job creation failed');
      }

      console.log('✅ Job created:', result.data.jobId);
      return result.data.jobId;
    } catch (error) {
      console.error('❌ Job creation error:', error);
      throw error;
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<GenerationJob> {
    try {
      const response = await fetch(`${BASE_URL}/status/${jobId}`, {
        method: 'GET',
        headers: this.headers,
      });

      const result: ApiResponse<GenerationJob> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get job status');
      }

      return result.data;
    } catch (error) {
      console.error('❌ Job status error:', error);
      throw error;
    }
  }

  /**
   * List all jobs for a cocoboard
   */
  async listJobs(cocoboardId: string): Promise<GenerationJob[]> {
    try {
      const response = await fetch(`${BASE_URL}/list/${cocoboardId}`, {
        method: 'GET',
        headers: this.headers,
      });

      const result: ApiResponse<{ jobs: GenerationJob[] }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to list jobs');
      }

      return result.data.jobs;
    } catch (error) {
      console.error('❌ Job list error:', error);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getStats(cocoboardId: string): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    error: number;
  }> {
    try {
      const response = await fetch(`${BASE_URL}/stats/${cocoboardId}`, {
        method: 'GET',
        headers: this.headers,
      });

      const result: ApiResponse<{
        total: number;
        pending: number;
        processing: number;
        completed: number;
        error: number;
      }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get stats');
      }

      return result.data;
    } catch (error) {
      console.error('❌ Stats error:', error);
      throw error;
    }
  }

  /**
   * Start processing queue
   */
  async processQueue(cocoboardId: string): Promise<void> {
    console.log('🚀 Starting queue processing for cocoboard:', cocoboardId);

    try {
      const response = await fetch(`${BASE_URL}/process/${cocoboardId}`, {
        method: 'POST',
        headers: this.headers,
      });

      const result: ApiResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to start processing');
      }

      console.log('✅ Queue processing started');
    } catch (error) {
      console.error('❌ Process error:', error);
      throw error;
    }
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<void> {
    console.log('🔄 Retrying job:', jobId);

    try {
      const response = await fetch(`${BASE_URL}/retry/${jobId}`, {
        method: 'POST',
        headers: this.headers,
      });

      const result: ApiResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Retry failed');
      }

      console.log('✅ Job queued for retry');
    } catch (error) {
      console.error('❌ Retry error:', error);
      throw error;
    }
  }

  /**
   * Clear completed jobs
   */
  async clearCompleted(cocoboardId: string): Promise<void> {
    console.log('🧹 Clearing completed jobs for cocoboard:', cocoboardId);

    try {
      const response = await fetch(`${BASE_URL}/cleanup/${cocoboardId}`, {
        method: 'DELETE',
        headers: this.headers,
      });

      const result: ApiResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Cleanup failed');
      }

      console.log('✅ Completed jobs cleared');
    } catch (error) {
      console.error('❌ Cleanup error:', error);
      throw error;
    }
  }

  /**
   * Poll job status until completion
   */
  async pollJobUntilComplete(
    jobId: string,
    onUpdate?: (job: GenerationJob) => void,
    onComplete?: (job: GenerationJob) => void,
    onError?: (job: GenerationJob) => void,
    pollInterval: number = 2000,
    maxPolls: number = 150 // 5 minutes max with 2s interval
  ): Promise<GenerationJob> {
    let polls = 0;

    return new Promise((resolve, reject) => {
      const intervalId = window.setInterval(async () => {
        try {
          polls++;

          const job = await this.getJobStatus(jobId);

          // Call update callback
          if (onUpdate) {
            onUpdate(job);
          }

          // Check if complete
          if (job.status === 'completed') {
            clearInterval(intervalId);
            this.pollingIntervals.delete(jobId);
            if (onComplete) {
              onComplete(job);
            }
            resolve(job);
            return;
          }

          // Check if error
          if (job.status === 'error') {
            clearInterval(intervalId);
            this.pollingIntervals.delete(jobId);
            if (onError) {
              onError(job);
            }
            reject(new Error(job.error || 'Job failed'));
            return;
          }

          // Check if max polls reached
          if (polls >= maxPolls) {
            clearInterval(intervalId);
            this.pollingIntervals.delete(jobId);
            reject(new Error('Polling timeout exceeded'));
            return;
          }

        } catch (error) {
          clearInterval(intervalId);
          this.pollingIntervals.delete(jobId);
          reject(error);
        }
      }, pollInterval);

      // Store interval ID
      this.pollingIntervals.set(jobId, intervalId);
    });
  }

  /**
   * Stop polling for a job
   */
  stopPolling(jobId: string): void {
    const intervalId = this.pollingIntervals.get(jobId);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(jobId);
      console.log('⏹️ Stopped polling for job:', jobId);
    }
  }

  /**
   * Stop all polling
   */
  stopAllPolling(): void {
    this.pollingIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.pollingIntervals.clear();
    console.log('⏹️ Stopped all polling');
  }
}

// Export singleton instance
export const jobQueue = new JobQueueService();
