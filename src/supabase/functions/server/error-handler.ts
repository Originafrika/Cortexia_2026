/**
 * ERROR HANDLER & RETRY LOGIC
 * 
 * Gestion robuste des erreurs avec retry automatique et fallback
 */

export type ErrorSeverity = 'transient' | 'retryable' | 'permanent';

export interface GenerationError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  retryable: boolean;
  suggestedAction: string;
  context?: any;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // ms
  maxDelay: number; // ms
  backoffMultiplier: number;
  fallbackModel?: string;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 2000, // 2 seconds
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
};

/**
 * Classify error to determine retry strategy
 */
export function classifyError(error: any): GenerationError {
  const errorStr = error instanceof Error ? error.message : String(error);
  const errorLower = errorStr.toLowerCase();
  
  // Transient errors (network, rate limit, temporary overload)
  if (
    errorLower.includes('timeout') ||
    errorLower.includes('network') ||
    errorLower.includes('econnrefused') ||
    errorLower.includes('enotfound') ||
    errorLower.includes('rate limit') ||
    errorLower.includes('throttled') ||
    errorLower.includes('too many requests') ||
    errorLower.includes('503') ||
    errorLower.includes('502') ||
    errorLower.includes('504')
  ) {
    return {
      code: 'TRANSIENT_ERROR',
      message: errorStr,
      severity: 'transient',
      retryable: true,
      suggestedAction: 'Retry with exponential backoff'
    };
  }
  
  // API key / auth errors (retryable if key might be refreshed)
  if (
    errorLower.includes('unauthorized') ||
    errorLower.includes('401') ||
    errorLower.includes('api key') ||
    errorLower.includes('authentication')
  ) {
    return {
      code: 'AUTH_ERROR',
      message: errorStr,
      severity: 'retryable',
      retryable: true,
      suggestedAction: 'Check API key and retry'
    };
  }
  
  // Content policy errors (permanent, don't retry)
  if (
    errorLower.includes('content policy') ||
    errorLower.includes('nsfw') ||
    errorLower.includes('inappropriate') ||
    errorLower.includes('violated')
  ) {
    return {
      code: 'CONTENT_POLICY_VIOLATION',
      message: errorStr,
      severity: 'permanent',
      retryable: false,
      suggestedAction: 'Modify prompt to comply with content policy'
    };
  }
  
  // Invalid input errors (permanent)
  if (
    errorLower.includes('invalid') ||
    errorLower.includes('bad request') ||
    errorLower.includes('400')
  ) {
    return {
      code: 'INVALID_INPUT',
      message: errorStr,
      severity: 'permanent',
      retryable: false,
      suggestedAction: 'Fix input parameters'
    };
  }
  
  // Model capacity errors (retryable with fallback)
  if (
    errorLower.includes('capacity') ||
    errorLower.includes('overloaded') ||
    errorLower.includes('unavailable')
  ) {
    return {
      code: 'MODEL_CAPACITY',
      message: errorStr,
      severity: 'retryable',
      retryable: true,
      suggestedAction: 'Retry or use fallback model'
    };
  }
  
  // Default: treat as retryable
  return {
    code: 'UNKNOWN_ERROR',
    message: errorStr,
    severity: 'retryable',
    retryable: true,
    suggestedAction: 'Retry with caution'
  };
}

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context?: any
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;
  
  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${finalConfig.maxAttempts}...`);
      const result = await operation();
      
      if (attempt > 1) {
        console.log(`✅ Success on attempt ${attempt}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      const classified = classifyError(error);
      
      console.error(`❌ Attempt ${attempt} failed:`, {
        code: classified.code,
        severity: classified.severity,
        message: classified.message.substring(0, 200)
      });
      
      // If not retryable, fail immediately
      if (!classified.retryable) {
        console.error(`🛑 Error not retryable: ${classified.suggestedAction}`);
        throw error;
      }
      
      // If last attempt, fail
      if (attempt === finalConfig.maxAttempts) {
        console.error(`🛑 All ${finalConfig.maxAttempts} attempts exhausted`);
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
        finalConfig.maxDelay
      );
      
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Retry with fallback model
 */
export async function withFallback<T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation: () => Promise<T>,
  context?: any
): Promise<T> {
  try {
    return await withRetry(primaryOperation, {
      maxAttempts: 2, // Only 2 attempts for primary
      baseDelay: 1000
    }, context);
  } catch (primaryError) {
    const classified = classifyError(primaryError);
    
    console.warn(`⚠️ Primary operation failed (${classified.code}), trying fallback...`);
    
    try {
      return await withRetry(fallbackOperation, {
        maxAttempts: 2
      }, context);
    } catch (fallbackError) {
      console.error('❌ Both primary and fallback failed');
      
      // Throw the more informative error
      const primaryClassified = classifyError(primaryError);
      const fallbackClassified = classifyError(fallbackError);
      
      if (primaryClassified.severity === 'permanent') {
        throw primaryError;
      } else {
        throw fallbackError;
      }
    }
  }
}

/**
 * User-friendly error message generation
 */
export function generateUserMessage(error: GenerationError): string {
  switch (error.code) {
    case 'TRANSIENT_ERROR':
      return 'Temporary network issue. Please try again in a moment.';
    
    case 'AUTH_ERROR':
      return 'Authentication error. Please check your account and try again.';
    
    case 'CONTENT_POLICY_VIOLATION':
      return 'Your request violates content policy. Please modify your prompt and try again.';
    
    case 'INVALID_INPUT':
      return 'Invalid input parameters. Please check your settings and try again.';
    
    case 'MODEL_CAPACITY':
      return 'AI model is currently at capacity. Retrying with alternative model...';
    
    case 'UNKNOWN_ERROR':
      return 'An unexpected error occurred. Our team has been notified.';
    
    default:
      return error.message || 'Generation failed. Please try again.';
  }
}

/**
 * Log error for monitoring
 */
export function logError(error: GenerationError, context?: any): void {
  console.error('🚨 [ERROR LOGGED]', {
    timestamp: new Date().toISOString(),
    code: error.code,
    severity: error.severity,
    message: error.message,
    context: context ? JSON.stringify(context).substring(0, 500) : undefined
  });
  
  // TODO: Send to monitoring service (Sentry, etc.)
}
