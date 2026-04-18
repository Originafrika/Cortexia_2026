/**
 * UPSTASH REDIS CLIENT
 * For rate limiting, caching, and temporary storage
 */

const UPSTASH_REDIS_URL = typeof window !== 'undefined' 
  ? (import.meta as any).env?.VITE_UPSTASH_REDIS_URL 
  : '';

const UPSTASH_REDIS_TOKEN = typeof window !== 'undefined'
  ? (import.meta as any).env?.VITE_UPSTASH_REDIS_TOKEN
  : '';

interface RedisCommand {
  command: string;
  args: (string | number)[];
}

/**
 * Execute a Redis command via Upstash REST API
 */
async function redisCommand(command: string, ...args: (string | number)[]): Promise<any> {
  if (!UPSTASH_REDIS_URL || !UPSTASH_REDIS_TOKEN) {
    throw new Error('Upstash Redis credentials not configured');
  }

  const response = await fetch(`${UPSTASH_REDIS_URL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${UPSTASH_REDIS_TOKEN}`,
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
