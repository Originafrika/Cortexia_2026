/**
 * UPSTASH REDIS CLIENT
 * For rate limiting, caching, and temporary storage
 */

// Server-side (Node.js)
const UPSTASH_REDIS_URL = typeof window === 'undefined' 
  ? process.env.UPSTASH_REDIS_REST_URL || ''
  : '';

// Client-side (Browser - from Vite env)
const CLIENT_UPSTASH_REDIS_URL = typeof window !== 'undefined'
  ? (import.meta as any).env?.VITE_UPSTASH_REDIS_URL || (import.meta as any).env?.NEXT_PUBLIC_UPSTASH_REDIS_URL || ''
  : '';

const UPSTASH_REDIS_TOKEN = typeof window === 'undefined'
  ? process.env.UPSTASH_REDIS_REST_TOKEN || ''
  : '';

const CLIENT_UPSTASH_REDIS_TOKEN = typeof window !== 'undefined'
  ? (import.meta as any).env?.VITE_UPSTASH_REDIS_TOKEN || (import.meta as any).env?.NEXT_PUBLIC_UPSTASH_REDIS_TOKEN || ''
  : '';

const getRedisUrl = () => {
  const url = UPSTASH_REDIS_URL || CLIENT_UPSTASH_REDIS_URL;
  console.log('[Redis] getRedisUrl:', { UPSTASH_REDIS_URL, CLIENT_UPSTASH_REDIS_URL, result: url });
  return url;
};

const getRedisToken = () => {
  const token = UPSTASH_REDIS_TOKEN || CLIENT_UPSTASH_REDIS_TOKEN;
  console.log('[Redis] getRedisToken:', { hasToken: !!token });
  return token;
};

interface RedisCommand {
  command: string;
  args: (string | number)[];
}

/**
 * Execute a Redis command via Upstash REST API
 */
async function redisCommand(command: string, ...args: (string | number)[]): Promise<any> {
  const redisUrl = getRedisUrl();
  const redisToken = getRedisToken();
  
  if (!redisUrl || !redisToken) {
    console.warn('Upstash Redis credentials not configured');
    return null;
  }

  const response = await fetch(`${redisUrl}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${redisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([command, ...args]),
  });

  if (!response.ok) {
    throw new Error(`Redis command failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}

/**
 * Get a value by key
 */
export async function get(key: string): Promise<string | null> {
  try {
    const result = await redisCommand('GET', key);
    return result;
  } catch (error) {
    console.error('Redis GET failed:', error);
    return null;
  }
}

/**
 * Set a value with optional expiration (in seconds)
 */
export async function set(
  key: string, 
  value: string, 
  options?: { ex?: number }
): Promise<void> {
  try {
    if (options?.ex) {
      await redisCommand('SETEX', key, options.ex, value);
    } else {
      await redisCommand('SET', key, value);
    }
  } catch (error) {
    console.error('Redis SET failed:', error);
    throw error;
  }
}

/**
 * Delete a key
 */
export async function del(key: string): Promise<void> {
  try {
    await redisCommand('DEL', key);
  } catch (error) {
    console.error('Redis DEL failed:', error);
    throw error;
  }
}

/**
 * Increment a counter
 */
export async function incr(key: string): Promise<number> {
  try {
    const result = await redisCommand('INCR', key);
    return parseInt(result, 10);
  } catch (error) {
    console.error('Redis INCR failed:', error);
    return 0;
  }
}

/**
 * Set expiration on a key
 */
export async function expire(key: string, seconds: number): Promise<void> {
  try {
    await redisCommand('EXPIRE', key, seconds);
  } catch (error) {
    console.error('Redis EXPIRE failed:', error);
  }
}

/**
 * Check if key exists
 */
export async function exists(key: string): Promise<boolean> {
  try {
    const result = await redisCommand('EXISTS', key);
    return result === 1;
  } catch (error) {
    console.error('Redis EXISTS failed:', error);
    return false;
  }
}

/**
 * Get time to live for a key
 */
export async function ttl(key: string): Promise<number> {
  try {
    const result = await redisCommand('TTL', key);
    return result;
  } catch (error) {
    console.error('Redis TTL failed:', error);
    return -1;
  }
}

// Export the Redis client interface
export const redis = {
  get,
  set,
  del,
  incr,
  expire,
  exists,
  ttl,
};

export default redis;
