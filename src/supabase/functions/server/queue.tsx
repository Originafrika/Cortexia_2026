// /supabase/functions/server/queue.tsx
import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

interface QueueJob {
  id: string;
  cocoboard_id: string;
  node_id: string;
  type: "image" | "video";
  priority: number;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  params: {
    prompt: string;
    negative_prompt?: string;
    model?: string;
    width?: number;
    height?: number;
    duration?: number;
    seed?: number;
  };
  prediction_id?: string;
  result_url?: string;
  error_message?: string;
  progress: number;
  retry_count: number;
  max_retries: number;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

// Add job to queue
app.post("/add", async (c) => {
  try {
    const body = await c.req.json();
    const {
      cocoboard_id,
      node_id,
      type,
      priority = 5,
      params,
      max_retries = 3,
    } = body;

    if (!cocoboard_id || !node_id || !type || !params) {
      return c.json(
        {
          success: false,
          error: "cocoboard_id, node_id, type, and params are required",
        },
        400
      );
    }

    const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const job: QueueJob = {
      id,
      cocoboard_id,
      node_id,
      type,
      priority,
      status: "queued",
      params,
      progress: 0,
      retry_count: 0,
      max_retries,
      created_at: now,
      updated_at: now,
    };

    await kv.set(`queue:job:${id}`, job);
    await kv.set(`queue:pending:${priority}:${id}`, id);

    return c.json({ success: true, data: job });
  } catch (error) {
    console.error("❌ Add job to queue error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to add job",
      },
      500
    );
  }
});

// Get next job from queue (highest priority)
app.get("/next", async (c) => {
  try {
    const pendingJobs = await kv.getByPrefix("queue:pending:");

    if (pendingJobs.length === 0) {
      return c.json({ success: true, data: null });
    }

    // Sort by priority (descending) then by created_at (ascending)
    const sortedKeys = pendingJobs.sort((a, b) => {
      const aPriority = parseInt(a.split(":")[2]);
      const bPriority = parseInt(b.split(":")[2]);
      return bPriority - aPriority;
    });

    const nextJobId = sortedKeys[0] as string;
    const job = await kv.get(`queue:job:${nextJobId}`);

    if (!job) {
      // Cleanup orphaned key
      await kv.del(`queue:pending:${sortedKeys[0]}`);
      return c.json({ success: true, data: null });
    }

    return c.json({ success: true, data: job });
  } catch (error) {
    console.error("❌ Get next job error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get next job",
      },
      500
    );
  }
});

// Start processing job
app.post("/start/:jobId", async (c) => {
  try {
    const jobId = c.req.param("jobId");
    const body = await c.req.json();
    const { prediction_id } = body;

    const job = await kv.get<QueueJob>(`queue:job:${jobId}`);

    if (!job) {
      return c.json({ success: false, error: "Job not found" }, 404);
    }

    const now = new Date().toISOString();
    const updated: QueueJob = {
      ...job,
      status: "processing",
      prediction_id,
      started_at: now,
      updated_at: now,
    };

    await kv.set(`queue:job:${jobId}`, updated);

    // Remove from pending queue
    const pendingKeys = await kv.getByPrefix(`queue:pending:`);
    for (const key of pendingKeys) {
      if (key === jobId) {
        await kv.del(`queue:pending:${job.priority}:${jobId}`);
      }
    }

    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ Start job error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to start job",
      },
      500
    );
  }
});

// Update job progress
app.patch("/progress/:jobId", async (c) => {
  try {
    const jobId = c.req.param("jobId");
    const body = await c.req.json();
    const { progress } = body;

    const job = await kv.get<QueueJob>(`queue:job:${jobId}`);

    if (!job) {
      return c.json({ success: false, error: "Job not found" }, 404);
    }

    const updated: QueueJob = {
      ...job,
      progress: Math.min(100, Math.max(0, progress)),
      updated_at: new Date().toISOString(),
    };

    await kv.set(`queue:job:${jobId}`, updated);

    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ Update job progress error:", error);
    return c.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update progress",
      },
      500
    );
  }
});

// Complete job
app.post("/complete/:jobId", async (c) => {
  try {
    const jobId = c.req.param("jobId");
    const body = await c.req.json();
    const { result_url } = body;

    const job = await kv.get<QueueJob>(`queue:job:${jobId}`);

    if (!job) {
      return c.json({ success: false, error: "Job not found" }, 404);
    }

    const now = new Date().toISOString();
    const updated: QueueJob = {
      ...job,
      status: "completed",
      result_url,
      progress: 100,
      completed_at: now,
      updated_at: now,
    };

    await kv.set(`queue:job:${jobId}`, updated);

    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ Complete job error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to complete job",
      },
      500
    );
  }
});

// Fail job (with retry logic)
app.post("/fail/:jobId", async (c) => {
  try {
    const jobId = c.req.param("jobId");
    const body = await c.req.json();
    const { error_message } = body;

    const job = await kv.get<QueueJob>(`queue:job:${jobId}`);

    if (!job) {
      return c.json({ success: false, error: "Job not found" }, 404);
    }

    const now = new Date().toISOString();
    const retryCount = job.retry_count + 1;

    // Check if we should retry
    if (retryCount < job.max_retries) {
      // Retry: move back to queue with lower priority
      const updated: QueueJob = {
        ...job,
        status: "queued",
        retry_count: retryCount,
        error_message,
        updated_at: now,
      };

      await kv.set(`queue:job:${jobId}`, updated);
      await kv.set(`queue:pending:${job.priority - 1}:${jobId}`, jobId);

      return c.json({
        success: true,
        data: updated,
        message: `Job will retry (attempt ${retryCount}/${job.max_retries})`,
      });
    } else {
      // Max retries reached: mark as failed
      const updated: QueueJob = {
        ...job,
        status: "failed",
        retry_count: retryCount,
        error_message,
        updated_at: now,
      };

      await kv.set(`queue:job:${jobId}`, updated);

      return c.json({
        success: true,
        data: updated,
        message: "Max retries reached, job marked as failed",
      });
    }
  } catch (error) {
    console.error("❌ Fail job error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fail job",
      },
      500
    );
  }
});

// Cancel job
app.post("/cancel/:jobId", async (c) => {
  try {
    const jobId = c.req.param("jobId");

    const job = await kv.get<QueueJob>(`queue:job:${jobId}`);

    if (!job) {
      return c.json({ success: false, error: "Job not found" }, 404);
    }

    const updated: QueueJob = {
      ...job,
      status: "cancelled",
      updated_at: new Date().toISOString(),
    };

    await kv.set(`queue:job:${jobId}`, updated);

    // Remove from pending queue
    await kv.del(`queue:pending:${job.priority}:${jobId}`);

    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ Cancel job error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to cancel job",
      },
      500
    );
  }
});

// Get job status
app.get("/status/:jobId", async (c) => {
  try {
    const jobId = c.req.param("jobId");
    const job = await kv.get<QueueJob>(`queue:job:${jobId}`);

    if (!job) {
      return c.json({ success: false, error: "Job not found" }, 404);
    }

    return c.json({ success: true, data: job });
  } catch (error) {
    console.error("❌ Get job status error:", error);
    return c.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get job status",
      },
      500
    );
  }
});

// List all jobs (with filters)
app.get("/list", async (c) => {
  try {
    const status = c.req.query("status");
    const cocoboardId = c.req.query("cocoboard_id");

    const allJobs = await kv.getByPrefix("queue:job:");

    let filteredJobs = allJobs as QueueJob[];

    if (status) {
      filteredJobs = filteredJobs.filter((job) => job.status === status);
    }

    if (cocoboardId) {
      filteredJobs = filteredJobs.filter(
        (job) => job.cocoboard_id === cocoboardId
      );
    }

    // Sort by priority desc, then created_at asc
    filteredJobs.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    return c.json({ success: true, data: filteredJobs });
  } catch (error) {
    console.error("❌ List jobs error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list jobs",
      },
      500
    );
  }
});

// Get queue stats
app.get("/stats", async (c) => {
  try {
    const allJobs = (await kv.getByPrefix("queue:job:")) as QueueJob[];

    const stats = {
      total: allJobs.length,
      queued: allJobs.filter((j) => j.status === "queued").length,
      processing: allJobs.filter((j) => j.status === "processing").length,
      completed: allJobs.filter((j) => j.status === "completed").length,
      failed: allJobs.filter((j) => j.status === "failed").length,
      cancelled: allJobs.filter((j) => j.status === "cancelled").length,
    };

    return c.json({ success: true, data: stats });
  } catch (error) {
    console.error("❌ Get queue stats error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get stats",
      },
      500
    );
  }
});

export default app;
