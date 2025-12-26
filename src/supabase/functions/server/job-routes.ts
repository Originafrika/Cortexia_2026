/**
 * Job Queue Routes
 * API endpoints for job management
 */

import { Hono } from "npm:hono";
import { GenerationQueue, type GenerationJob } from "./generation-queue.tsx";
import { jobProcessor } from "./job-processor.tsx";
import type { ApiResponse } from "./coconut-types.ts";

const app = new Hono();

// ============================================
// JOB CREATION
// ============================================

/**
 * POST /create
 * Create a new generation job
 */
app.post("/create", async (c) => {
  try {
    const body = await c.req.json() as {
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
    };

    console.log('📝 Creating generation job:', {
      type: body.type,
      nodeId: body.nodeId,
      provider: body.params.provider,
    });

    if (!body.nodeId || !body.cocoboardId || !body.type || !body.params) {
      return c.json<ApiResponse>({
        success: false,
        error: "nodeId, cocoboardId, type, and params are required",
        code: "MISSING_FIELDS",
        timestamp: Date.now(),
      }, 400);
    }

    // Create job
    const jobId = await GenerationQueue.addJob({
      nodeId: body.nodeId,
      cocoboardId: body.cocoboardId,
      type: body.type,
      priority: body.priority ?? 5,
      dependencies: body.dependencies || [],
      params: body.params,
      maxRetries: body.maxRetries ?? 3,
    });

    // Optionally start processing immediately
    const autoProcess = c.req.query('autoProcess') === 'true';
    if (autoProcess) {
      // Don't await - process in background
      jobProcessor.processCocoboardQueue(body.cocoboardId).catch(error => {
        console.error('❌ Background processing error:', error);
      });
    }

    return c.json<ApiResponse<{ jobId: string }>>({
      success: true,
      data: { jobId },
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('❌ Job creation error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Job creation failed',
      code: "JOB_CREATE_ERROR",
      timestamp: Date.now(),
    }, 500);
  }
});

// ============================================
// JOB STATUS
// ============================================

/**
 * GET /status/:jobId
 * Get job status
 */
app.get("/status/:jobId", async (c) => {
  try {
    const jobId = c.req.param('jobId');

    console.log('📊 Getting job status:', jobId);

    const job = await GenerationQueue.getJob(jobId);

    if (!job) {
      return c.json<ApiResponse>({
        success: false,
        error: "Job not found",
        code: "JOB_NOT_FOUND",
        timestamp: Date.now(),
      }, 404);
    }

    return c.json<ApiResponse<GenerationJob>>({
      success: true,
      data: job,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('❌ Job status error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get job status',
      code: "JOB_STATUS_ERROR",
      timestamp: Date.now(),
    }, 500);
  }
});

/**
 * GET /list/:cocoboardId
 * List all jobs for a cocoboard
 */
app.get("/list/:cocoboardId", async (c) => {
  try {
    const cocoboardId = c.req.param('cocoboardId');

    console.log('📋 Listing jobs for cocoboard:', cocoboardId);

    const jobs = await GenerationQueue.getJobsByCocoboard(cocoboardId);

    return c.json<ApiResponse<{ jobs: GenerationJob[] }>>({
      success: true,
      data: { jobs },
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('❌ Job list error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list jobs',
      code: "JOB_LIST_ERROR",
      timestamp: Date.now(),
    }, 500);
  }
});

/**
 * GET /stats/:cocoboardId
 * Get queue statistics
 */
app.get("/stats/:cocoboardId", async (c) => {
  try {
    const cocoboardId = c.req.param('cocoboardId');

    console.log('📊 Getting queue stats for cocoboard:', cocoboardId);

    const stats = await GenerationQueue.getQueueStats(cocoboardId);

    return c.json<ApiResponse<typeof stats>>({
      success: true,
      data: stats,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('❌ Stats error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get stats',
      code: "STATS_ERROR",
      timestamp: Date.now(),
    }, 500);
  }
});

// ============================================
// JOB PROCESSING
// ============================================

/**
 * POST /process/:cocoboardId
 * Start processing queue for a cocoboard
 */
app.post("/process/:cocoboardId", async (c) => {
  try {
    const cocoboardId = c.req.param('cocoboardId');

    console.log('🚀 Starting queue processing for cocoboard:', cocoboardId);

    // Process in background
    jobProcessor.processCocoboardQueue(cocoboardId).catch(error => {
      console.error('❌ Queue processing error:', error);
    });

    return c.json<ApiResponse>({
      success: true,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('❌ Process error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start processing',
      code: "PROCESS_ERROR",
      timestamp: Date.now(),
    }, 500);
  }
});

/**
 * GET /processor/status
 * Get processor status
 */
app.get("/processor/status", async (c) => {
  try {
    const status = jobProcessor.getProcessingStatus();

    return c.json<ApiResponse<typeof status>>({
      success: true,
      data: status,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('❌ Processor status error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get processor status',
      code: "PROCESSOR_STATUS_ERROR",
      timestamp: Date.now(),
    }, 500);
  }
});

// ============================================
// JOB CONTROL
// ============================================

/**
 * POST /retry/:jobId
 * Retry a failed job
 */
app.post("/retry/:jobId", async (c) => {
  try {
    const jobId = c.req.param('jobId');

    console.log('🔄 Retrying job:', jobId);

    const success = await GenerationQueue.retryJob(jobId);

    if (!success) {
      return c.json<ApiResponse>({
        success: false,
        error: "Job not found or exceeded max retries",
        code: "RETRY_FAILED",
        timestamp: Date.now(),
      }, 400);
    }

    return c.json<ApiResponse>({
      success: true,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('❌ Retry error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Retry failed',
      code: "RETRY_ERROR",
      timestamp: Date.now(),
    }, 500);
  }
});

/**
 * DELETE /cleanup/:cocoboardId
 * Clear completed jobs
 */
app.delete("/cleanup/:cocoboardId", async (c) => {
  try {
    const cocoboardId = c.req.param('cocoboardId');

    console.log('🧹 Cleaning up completed jobs for cocoboard:', cocoboardId);

    await GenerationQueue.clearCompletedJobs(cocoboardId);

    return c.json<ApiResponse>({
      success: true,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Cleanup failed',
      code: "CLEANUP_ERROR",
      timestamp: Date.now(),
    }, 500);
  }
});

export default app;
