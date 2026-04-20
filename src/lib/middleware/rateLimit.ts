/**
 * RATE LIMITING MIDDLEWARE
 * Distributed rate limiting using Upstash Redis
 * 
 * Limits:
 * - Auth: 10 requests/minute
 * - Generation: 60 requests/minute  
 * - General: 100 requests/minute
 */

import { Redis } from '@upstash/redis';

interface RateLimitConfig {
  limit: number;
  window: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

const CONFIG = {
  auth: { limit: 10, window: 60 },
  generation: { limit: 60, window: 60 },
  general: { limit: 100, window: 60 },
};

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('[RateLimit] Redis credentials not configured');
    return null;
  }

  return new Redis({
    url,
    token,
  });
}

function getIdentifier(ip: string, userId?: string): string {
  if (userId) {
    return `${userId}:${ip}`;
  }
  return `anon:${ip}`;
}

async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const client = getRedisClient();
  if (!client) {
    return { success: true, remaining: config.limit, reset: Date.now() + config.window * 1000 };
  }

  const now = Date.now();
  const windowStart = now - config.window * 1000;
  const redisKey = `ratelimit:${key}`;

  try {
    const [currentCount, trimmed] = await Promise.all([
      client.zadd(redisKey, { score: now, member: now.toString() }),
      client.zremrangebyscore(redisKey, 0, windowStart),
    ]);

    await client.expire(redisKey, config.window);

    const remaining = Math.max(0, config.limit - currentCount);
    const success = currentCount <= config.limit;

    const oldestRequest = await client.zrange(redisKey, 0, 0, { withScores: true });
    const reset = oldestRequest.length > 0 
      ? Math.ceil((oldestRequest[0].score || now) / 1000) + config.window
      : Math.ceil(now / 1000) + config.window;

    return { success, remaining, reset };
  } catch (error) {
    console.error('[RateLimit] Redis error:', error);
    return { success: true, remaining: config.limit, reset: now + config.window * 1000 };
  }
}

export interface RateLimitOptions {
  type: 'auth' | 'generation' | 'general';
  ip: string;
  userId?: string;
}

export async function rateLimitMiddleware(
  options: RateLimitOptions
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const { type, ip, userId } = options;
  const config = CONFIG[type];
  const identifier = getIdentifier(ip, userId);
  const key = `${type}:${identifier}`;

  return checkRateLimit(key, config);
}

export function createRateLimiter(type: 'auth' | 'generation' | 'general') {
  return async (ip: string, userId?: string) => {
    return rateLimitMiddleware({ type, ip, userId });
  };
}

export const authRateLimit = createRateLimiter('auth');
export const generationRateLimit = createRateLimiter('generation');
export const generalRateLimit = createRateLimiter('general');

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly remaining: number,
    public readonly reset: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export function throwIfRateLimited(result: RateLimitResult): void {
  if (!result.success) {
    throw new RateLimitError(
      'Rate limit exceeded',
      result.remaining,
      result.reset
    );
  }
}