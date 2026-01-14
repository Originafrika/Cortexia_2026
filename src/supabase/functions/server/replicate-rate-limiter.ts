/**
 * REPLICATE API RATE LIMITER
 * Ensures we never exceed 6 requests per minute (Replicate's limit for accounts < $5)
 * 
 * Architecture:
 * - In-memory queue with timestamps
 * - Sliding window algorithm
 * - Automatic cleanup of old entries
 */

interface RateLimitEntry {
  timestamp: number;
  endpoint: string;
}

class ReplicateRateLimiter {
  private requests: RateLimitEntry[] = [];
  private readonly maxRequestsPerMinute = 6;
  private readonly windowMs = 60 * 1000; // 1 minute in milliseconds
  
  /**
   * Check if we can make a request now
   * Returns true if allowed, false if rate limit would be exceeded
   */
  canMakeRequest(): boolean {
    this.cleanup();
    return this.requests.length < this.maxRequestsPerMinute;
  }
  
  /**
   * Get milliseconds to wait before next request is allowed
   */
  getWaitTime(): number {
    this.cleanup();
    
    if (this.requests.length < this.maxRequestsPerMinute) {
      return 0;
    }
    
    // Find the oldest request
    const oldestRequest = this.requests[0];
    if (!oldestRequest) return 0;
    
    // Calculate when it will expire
    const expiresAt = oldestRequest.timestamp + this.windowMs;
    const waitTime = expiresAt - Date.now();
    
    return Math.max(0, waitTime);
  }
  
  /**
   * Record a new request
   */
  recordRequest(endpoint: string = 'unknown'): void {
    this.cleanup();
    this.requests.push({
      timestamp: Date.now(),
      endpoint,
    });
    
    console.log(`🚦 [Rate Limiter] Request recorded: ${this.requests.length}/${this.maxRequestsPerMinute} in current window`);
  }
  
  /**
   * Wait until a request can be made, then record it
   * Returns the wait time in ms
   */
  async waitAndRecord(endpoint: string = 'unknown'): Promise<number> {
    const waitTime = this.getWaitTime();
    
    if (waitTime > 0) {
      console.log(`⏳ [Rate Limiter] Waiting ${Math.ceil(waitTime / 1000)}s before making request...`);
      await this.sleep(waitTime);
    }
    
    this.recordRequest(endpoint);
    return waitTime;
  }
  
  /**
   * Remove requests older than the window
   */
  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    
    const beforeCount = this.requests.length;
    this.requests = this.requests.filter(req => req.timestamp > cutoff);
    
    if (beforeCount !== this.requests.length) {
      console.log(`🧹 [Rate Limiter] Cleaned up ${beforeCount - this.requests.length} expired requests`);
    }
  }
  
  /**
   * Get current status
   */
  getStatus(): {
    currentRequests: number;
    maxRequests: number;
    canMakeRequest: boolean;
    waitTime: number;
  } {
    this.cleanup();
    return {
      currentRequests: this.requests.length,
      maxRequests: this.maxRequestsPerMinute,
      canMakeRequest: this.canMakeRequest(),
      waitTime: this.getWaitTime(),
    };
  }
  
  /**
   * Reset all tracked requests (for testing only)
   */
  reset(): void {
    this.requests = [];
    console.log('🔄 [Rate Limiter] Reset all requests');
  }
  
  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
const rateLimiter = new ReplicateRateLimiter();

export default rateLimiter;
export { ReplicateRateLimiter };
