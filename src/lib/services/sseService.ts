// SSE (Server-Sent Events) Service - Real-time updates for CocoBlend
// Uses Upstash Redis Pub/Sub for real-time job progress updates

import { Redis } from '@upstash/redis';

const REDIS_URL = import.meta.env.VITE_UPSTASH_REDIS_REST_URL || import.meta.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = import.meta.env.UPSTASH_REDIS_REST_TOKEN;

const redis = new Redis({
  url: REDIS_URL || '',
  token: REDIS_TOKEN || '',
});

export interface SSEMessage {
  type: 'step_update' | 'step_failed' | 'step_complete' | 'blend_done' | 'blend_paused_credits' | 'status_change';
  jobId: string;
  stepId?: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface StepUpdateData {
  stepId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  creditsConsumed?: number;
  progress?: number; // 0-100
  error?: string;
}

export interface BlendDoneData {
  jobId: string;
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  totalCreditsConsumed: number;
  downloadUrl?: string;
}

class SSEService {
  private eventSource: EventSource | null = null;
  private subscribers: Map<string, Set<(message: SSEMessage) => void>> = new Map();

  /**
   * Publish a message to Redis (called from backend/QStash)
   */
  async publish(channel: string, message: SSEMessage): Promise<void> {
    try {
      await redis.publish(channel, JSON.stringify(message));
    } catch (error) {
      console.error('SSE publish error:', error);
    }
  }

  /**
   * Subscribe to job updates via EventSource
   */
  subscribeToJob(
    jobId: string,
    onMessage: (message: SSEMessage) => void,
    onError?: (error: Error) => void
  ): () => void {
    const channel = `job:${jobId}`;
    
    // Add to subscribers
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(onMessage);

    // Create EventSource if not exists
    if (!this.eventSource) {
      this.connectEventSource();
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(channel);
      if (subs) {
        subs.delete(onMessage);
        if (subs.size === 0) {
          this.subscribers.delete(channel);
        }
      }
      
      // Close EventSource if no more subscribers
      if (this.subscribers.size === 0 && this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
    };
  }

  /**
   * Connect to SSE endpoint
   */
  private connectEventSource(): void {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    this.eventSource = new EventSource(`${apiUrl}/api/coconut/sse`);

    this.eventSource.onmessage = (event) => {
      try {
        const message: SSEMessage = JSON.parse(event.data);
        const channel = `job:${message.jobId}`;
        const subs = this.subscribers.get(channel);
        
        if (subs) {
          subs.forEach(callback => callback(message));
        }
      } catch (error) {
        console.error('SSE parse error:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      // Auto-reconnect will happen automatically
    };
  }

  /**
   * Send step update (for backend use)
   */
  async sendStepUpdate(
    jobId: string,
    stepData: StepUpdateData
  ): Promise<void> {
    await this.publish(`job:${jobId}`, {
      type: 'step_update',
      jobId,
      stepId: stepData.stepId,
      data: stepData as unknown as Record<string, unknown>,
      timestamp: Date.now(),
    });
  }

  /**
   * Send step failure (for backend use)
   */
  async sendStepFailed(
    jobId: string,
    stepId: string,
    error: string
  ): Promise<void> {
    await this.publish(`job:${jobId}`, {
      type: 'step_failed',
      jobId,
      stepId,
      data: { error },
      timestamp: Date.now(),
    });
  }

  /**
   * Send blend completion (for backend use)
   */
  async sendBlendDone(
    jobId: string,
    data: BlendDoneData
  ): Promise<void> {
    await this.publish(`job:${jobId}`, {
      type: 'blend_done',
      jobId,
      data: data as unknown as Record<string, unknown>,
      timestamp: Date.now(),
    });
  }

  /**
   * Send credits paused (for backend use)
   */
  async sendCreditsPaused(
    jobId: string,
    requiredCredits: number,
    availableCredits: number
  ): Promise<void> {
    await this.publish(`job:${jobId}`, {
      type: 'blend_paused_credits',
      jobId,
      data: { requiredCredits, availableCredits },
      timestamp: Date.now(),
    });
  }

  /**
   * Poll for updates (fallback for environments without EventSource)
   */
  async pollForUpdates(
    jobId: string,
    since: number = 0
  ): Promise<SSEMessage[]> {
    try {
      const messages = await redis.lrange(`job:${jobId}:history`, 0, -1);
      return messages
        .map((msg: unknown) => {
          try {
            return JSON.parse(msg as string) as SSEMessage;
          } catch {
            return null;
          }
        })
        .filter((msg): msg is SSEMessage => msg !== null && msg.timestamp > since);
    } catch (error) {
      console.error('SSE poll error:', error);
      return [];
    }
  }
}

export const sseService = new SSEService();
