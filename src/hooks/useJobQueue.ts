/**
 * Job Queue Hook
 * React hook for job queue management
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { jobQueue, type GenerationJob } from '../services/job-queue';

interface JobQueueState {
  jobs: Map<string, GenerationJob>; // jobId -> job
  stats: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    error: number;
  } | null;
  loading: boolean;
  error: string | null;
}

export function useJobQueue(cocoboardId?: string) {
  const [state, setState] = useState<JobQueueState>({
    jobs: new Map(),
    stats: null,
    loading: false,
    error: null,
  });

  const pollIntervalRef = useRef<number | null>(null);

  /**
   * Create a new job
   */
  const createJob = useCallback(async (params: {
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
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const jobId = await jobQueue.createJob(params);
      
      // Start polling for this job
      startPollingJob(jobId);
      
      setState(prev => ({ ...prev, loading: false }));
      return jobId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Job creation failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Get job status
   */
  const getJobStatus = useCallback(async (jobId: string) => {
    try {
      const job = await jobQueue.getJobStatus(jobId);
      
      // Update local state
      setState(prev => ({
        ...prev,
        jobs: new Map(prev.jobs).set(jobId, job),
      }));
      
      return job;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get job status';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * List all jobs
   */
  const listJobs = useCallback(async (boardId?: string) => {
    const id = boardId || cocoboardId;
    if (!id) return [];

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const jobs = await jobQueue.listJobs(id);
      
      // Update state
      const jobsMap = new Map<string, GenerationJob>();
      jobs.forEach(job => {
        jobsMap.set(job.id, job);
      });
      
      setState(prev => ({ 
        ...prev, 
        jobs: jobsMap,
        loading: false,
      }));
      
      return jobs;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to list jobs';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, [cocoboardId]);

  /**
   * Get stats
   */
  const getStats = useCallback(async (boardId?: string) => {
    const id = boardId || cocoboardId;
    if (!id) return null;

    try {
      const stats = await jobQueue.getStats(id);
      
      setState(prev => ({ ...prev, stats }));
      
      return stats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get stats';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [cocoboardId]);

  /**
   * Retry job
   */
  const retryJob = useCallback(async (jobId: string) => {
    try {
      await jobQueue.retryJob(jobId);
      
      // Refresh job status
      await getJobStatus(jobId);
      
      // Start polling again
      startPollingJob(jobId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Retry failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [getJobStatus]);

  /**
   * Clear completed jobs
   */
  const clearCompleted = useCallback(async (boardId?: string) => {
    const id = boardId || cocoboardId;
    if (!id) return;

    try {
      await jobQueue.clearCompleted(id);
      
      // Refresh jobs list
      await listJobs(id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Cleanup failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [cocoboardId, listJobs]);

  /**
   * Start polling for a specific job
   */
  const startPollingJob = useCallback((jobId: string) => {
    jobQueue.pollJobUntilComplete(
      jobId,
      // onUpdate
      (job) => {
        setState(prev => ({
          ...prev,
          jobs: new Map(prev.jobs).set(jobId, job),
        }));
      },
      // onComplete
      (job) => {
        setState(prev => ({
          ...prev,
          jobs: new Map(prev.jobs).set(jobId, job),
        }));
        console.log('✅ Job completed:', jobId);
      },
      // onError
      (job) => {
        setState(prev => ({
          ...prev,
          jobs: new Map(prev.jobs).set(jobId, job),
          error: job.error || 'Job failed',
        }));
        console.error('❌ Job failed:', jobId, job.error);
      }
    ).catch(error => {
      console.error('❌ Polling error:', error);
    });
  }, []);

  /**
   * Stop polling for a job
   */
  const stopPollingJob = useCallback((jobId: string) => {
    jobQueue.stopPolling(jobId);
  }, []);

  /**
   * Start periodic stats polling
   */
  const startStatsPolling = useCallback((boardId?: string, interval: number = 5000) => {
    const id = boardId || cocoboardId;
    if (!id) return;

    // Clear existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // Poll immediately
    getStats(id);

    // Then poll periodically
    pollIntervalRef.current = window.setInterval(() => {
      getStats(id);
    }, interval);
  }, [cocoboardId, getStats]);

  /**
   * Stop stats polling
   */
  const stopStatsPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Stop all polling
      jobQueue.stopAllPolling();
      stopStatsPolling();
    };
  }, [stopStatsPolling]);

  return {
    jobs: Array.from(state.jobs.values()),
    jobsMap: state.jobs,
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    
    createJob,
    getJobStatus,
    listJobs,
    getStats,
    retryJob,
    clearCompleted,
    
    startPollingJob,
    stopPollingJob,
    startStatsPolling,
    stopStatsPolling,
  };
}
