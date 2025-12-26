import { Hono } from 'npm:hono';
import * as replicate from './replicate.ts';
import * as kv from './kv_store.tsx';

const generation = new Hono();

/**
 * Generate an image layer
 * POST /generation/image
 */
generation.post('/image', async (c) => {
  try {
    const body = await c.req.json();
    const { layerId, prompt, aspectRatio, seed } = body;

    if (!layerId || !prompt) {
      return c.json(
        { success: false, error: 'layerId and prompt are required' },
        400
      );
    }

    console.log(`🎨 Starting image generation for layer ${layerId}`);

    // Start generation
    const job = await replicate.generateImage({
      prompt,
      aspectRatio: aspectRatio || '16:9',
      seed,
    });

    // Store job info in KV
    await kv.set(`generation:${layerId}`, {
      layerId,
      jobId: job.id,
      type: 'image',
      status: job.status,
      prompt,
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Image generation started: ${job.id}`);

    return c.json({
      success: true,
      jobId: job.id,
      status: job.status,
    });
  } catch (error) {
    console.error('❌ Image generation error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start image generation',
      },
      500
    );
  }
});

/**
 * Generate a video shot
 * POST /generation/video
 */
generation.post('/video', async (c) => {
  try {
    const body = await c.req.json();
    const { shotId, prompt, duration, aspectRatio, seed } = body;

    if (!shotId || !prompt) {
      return c.json(
        { success: false, error: 'shotId and prompt are required' },
        400
      );
    }

    console.log(`🎬 Starting video generation for shot ${shotId}`);

    // Start generation
    const job = await replicate.generateVideo({
      prompt,
      duration,
      aspectRatio,
      seed,
    });

    // Store job info in KV
    await kv.set(`generation:${shotId}`, {
      shotId,
      jobId: job.id,
      type: 'video',
      status: job.status,
      prompt,
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Video generation started: ${job.id}`);

    return c.json({
      success: true,
      jobId: job.id,
      status: job.status,
    });
  } catch (error) {
    console.error('❌ Video generation error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start video generation',
      },
      500
    );
  }
});

/**
 * Check job status
 * GET /generation/status/:jobId
 */
generation.get('/status/:jobId', async (c) => {
  try {
    const jobId = c.req.param('jobId');

    if (!jobId) {
      return c.json({ success: false, error: 'jobId is required' }, 400);
    }

    console.log(`🔍 Checking status for job ${jobId}`);

    // Check status with Replicate
    const job = await replicate.checkJobStatus(jobId);

    // Update KV if we have the layer/shot ID
    const kvKeys = await kv.getByPrefix('generation:');
    const relevantKV = kvKeys.find((item) => item.value.jobId === jobId);

    if (relevantKV) {
      await kv.set(relevantKV.key, {
        ...relevantKV.value,
        status: job.status,
        output: job.output,
        error: job.error,
        updatedAt: new Date().toISOString(),
      });
    }

    return c.json({
      success: true,
      jobId: job.id,
      status: job.status,
      output: job.output,
      error: job.error,
      logs: job.logs,
      metrics: job.metrics,
    });
  } catch (error) {
    console.error('❌ Status check error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check job status',
      },
      500
    );
  }
});

/**
 * Cancel a generation job
 * POST /generation/cancel/:jobId
 */
generation.post('/cancel/:jobId', async (c) => {
  try {
    const jobId = c.req.param('jobId');

    if (!jobId) {
      return c.json({ success: false, error: 'jobId is required' }, 400);
    }

    console.log(`⏹️ Cancelling job ${jobId}`);

    await replicate.cancelJob(jobId);

    // Update KV
    const kvKeys = await kv.getByPrefix('generation:');
    const relevantKV = kvKeys.find((item) => item.value.jobId === jobId);

    if (relevantKV) {
      await kv.set(relevantKV.key, {
        ...relevantKV.value,
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      });
    }

    return c.json({
      success: true,
      message: 'Job cancelled',
    });
  } catch (error) {
    console.error('❌ Cancel error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel job',
      },
      500
    );
  }
});

/**
 * Get generation info by layer/shot ID
 * GET /generation/layer/:layerId
 */
generation.get('/layer/:layerId', async (c) => {
  try {
    const layerId = c.req.param('layerId');

    if (!layerId) {
      return c.json({ success: false, error: 'layerId is required' }, 400);
    }

    const info = await kv.get(`generation:${layerId}`);

    if (!info) {
      return c.json({ success: false, error: 'Generation not found' }, 404);
    }

    return c.json({
      success: true,
      generation: info,
    });
  } catch (error) {
    console.error('❌ Get generation error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get generation info',
      },
      500
    );
  }
});

/**
 * Poll a job until completion
 * GET /generation/poll/:jobId
 */
generation.get('/poll/:jobId', async (c) => {
  try {
    const jobId = c.req.param('jobId');

    if (!jobId) {
      return c.json({ success: false, error: 'jobId is required' }, 400);
    }

    console.log(`⏳ Polling job ${jobId} until completion`);

    // Poll with timeout
    const job = await replicate.pollJobUntilComplete(jobId, 60, 2000);

    return c.json({
      success: true,
      jobId: job.id,
      status: job.status,
      output: job.output,
      error: job.error,
      metrics: job.metrics,
    });
  } catch (error) {
    console.error('❌ Poll error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to poll job',
      },
      500
    );
  }
});

export default generation;
