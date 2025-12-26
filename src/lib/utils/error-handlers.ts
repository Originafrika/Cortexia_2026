/**
 * COCONUT V14 - Error Handlers & Edge Cases
 * Comprehensive error handling for Phase 2 Gemini Analysis
 */

// ============================================
// ERROR TYPES
// ============================================

export class CoconutError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'CoconutError';
  }
}

export class GeminiAnalysisError extends CoconutError {
  constructor(message: string, details?: any) {
    super(message, 'GEMINI_ANALYSIS_ERROR', 500, details);
    this.name = 'GeminiAnalysisError';
  }
}

export class CocoBoardError extends CoconutError {
  constructor(message: string, details?: any) {
    super(message, 'COCOBOARD_ERROR', 500, details);
    this.name = 'CocoBoardError';
  }
}

export class InsufficientCreditsError extends CoconutError {
  constructor(required: number, available: number) {
    super(
      `Insufficient credits: ${required} required, ${available} available`,
      'INSUFFICIENT_CREDITS',
      402,
      { required, available }
    );
    this.name = 'InsufficientCreditsError';
  }
}

export class ValidationError extends CoconutError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400, { field });
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends CoconutError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND', 404, { resource, id });
    this.name = 'NotFoundError';
  }
}

export class TimeoutError extends CoconutError {
  constructor(operation: string, timeout: number) {
    super(
      `Operation timed out: ${operation} (${timeout}ms)`,
      'TIMEOUT',
      408,
      { operation, timeout }
    );
    this.name = 'TimeoutError';
  }
}

// ============================================
// ERROR HANDLER FUNCTIONS
// ============================================

/**
 * Handle Gemini API errors with retry logic
 */
export async function handleGeminiError<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 2000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      console.error(`Gemini operation failed (attempt ${attempt}/${maxRetries}):`, error);
      
      // Don't retry on validation errors or client errors
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new GeminiAnalysisError(
    `Gemini operation failed after ${maxRetries} attempts`,
    { lastError: lastError?.message }
  );
}

/**
 * Handle timeout with abort controller
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeout: number,
  operationName: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(operationName, timeout));
    }, timeout);
  });
  
  return Promise.race([operation(), timeoutPromise]);
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  const missing = requiredFields.filter(field => {
    const value = getNestedValue(data, field);
    return value === undefined || value === null || value === '';
  });
  
  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(', ')}`,
      missing[0]
    );
  }
}

/**
 * Get nested object value by path
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(
  jsonString: string,
  fallback: T
): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
}

/**
 * Extract error message from various error types
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof CoconutError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unknown error occurred';
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown) {
  if (error instanceof CoconutError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      },
      statusCode: error.statusCode
    };
  }
  
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: extractErrorMessage(error)
    },
    statusCode: 500
  };
}

// ============================================
// EDGE CASES VALIDATORS
// ============================================

/**
 * Validate intent input for analysis
 */
export function validateIntentInput(intent: any): void {
  validateRequiredFields(intent, ['description']);
  
  // Validate description length
  if (intent.description.length < 10) {
    throw new ValidationError('Intent description must be at least 10 characters');
  }
  
  if (intent.description.length > 5000) {
    throw new ValidationError('Intent description must be less than 5000 characters');
  }
  
  // Validate references if provided
  if (intent.references) {
    if (intent.references.images && !Array.isArray(intent.references.images)) {
      throw new ValidationError('References images must be an array');
    }
    
    if (intent.references.videos && !Array.isArray(intent.references.videos)) {
      throw new ValidationError('References videos must be an array');
    }
    
    // Validate image count (max 10)
    if (intent.references.images && intent.references.images.length > 10) {
      throw new ValidationError('Maximum 10 reference images allowed');
    }
    
    // Validate video count (max 10)
    if (intent.references.videos && intent.references.videos.length > 10) {
      throw new ValidationError('Maximum 10 reference videos allowed');
    }
  }
  
  // Validate format
  const validFormats = ['1:1', '3:4', '4:3', '16:9', '9:16', '2:3', '3:2'];
  if (intent.format && !validFormats.includes(intent.format)) {
    throw new ValidationError(`Invalid format: ${intent.format}. Must be one of: ${validFormats.join(', ')}`);
  }
  
  // Validate resolution
  const validResolutions = ['1K', '2K', '4K', '8K'];
  if (intent.resolution && !validResolutions.includes(intent.resolution)) {
    throw new ValidationError(`Invalid resolution: ${intent.resolution}. Must be one of: ${validResolutions.join(', ')}`);
  }
}

/**
 * Validate CocoBoard edit field path
 */
export function validateEditFieldPath(field: string): void {
  const validPaths = [
    'concept.direction',
    'concept.keyMessage',
    'concept.mood',
    'colorPalette.primary',
    'colorPalette.accent',
    'colorPalette.background',
    'colorPalette.text',
    'colorPalette.rationale',
    'composition.zones',
    'finalPrompt.scene',
    'finalPrompt.style',
    'finalPrompt.lighting',
    'finalPrompt.mood',
    'specs.format',
    'specs.resolution'
  ];
  
  const isValid = validPaths.some(validPath => field.startsWith(validPath));
  
  if (!isValid) {
    throw new ValidationError(
      `Invalid field path: ${field}. Must be one of the allowed editable fields.`,
      field
    );
  }
}

/**
 * Validate color array (HEX codes)
 */
export function validateColorArray(colors: any): void {
  if (!Array.isArray(colors)) {
    throw new ValidationError('Colors must be an array');
  }
  
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  
  const invalidColors = colors.filter((color: any) => {
    return typeof color !== 'string' || !hexRegex.test(color);
  });
  
  if (invalidColors.length > 0) {
    throw new ValidationError(
      `Invalid HEX color codes: ${invalidColors.join(', ')}. Must be in format #RRGGBB or #RGB`
    );
  }
  
  if (colors.length === 0) {
    throw new ValidationError('Color array cannot be empty');
  }
  
  if (colors.length > 10) {
    throw new ValidationError('Maximum 10 colors allowed');
  }
}

/**
 * Sanitize user input to prevent injection
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[^\w\s.,!?;:()\-'"/\n]/g, '') // Keep only safe characters
    .trim();
}

/**
 * Validate asset status transition
 */
export function validateAssetStatusTransition(
  currentStatus: string,
  newStatus: string
): void {
  const validTransitions: Record<string, string[]> = {
    'missing': ['generating', 'user-provided'],
    'generating': ['generated', 'failed'],
    'generated': ['regenerating'],
    'failed': ['generating'],
    'user-provided': [],
    'available': []
  };
  
  const allowed = validTransitions[currentStatus] || [];
  
  if (!allowed.includes(newStatus)) {
    throw new ValidationError(
      `Invalid status transition: ${currentStatus} -> ${newStatus}`
    );
  }
}

// ============================================
// RATE LIMITING
// ============================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check rate limit for user
 */
export function checkRateLimit(
  userId: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): void {
  const now = Date.now();
  const entry = rateLimitStore.get(userId);
  
  if (!entry || now > entry.resetAt) {
    // Start new window
    rateLimitStore.set(userId, {
      count: 1,
      resetAt: now + windowMs
    });
    return;
  }
  
  if (entry.count >= maxRequests) {
    const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000);
    throw new CoconutError(
      `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`,
      'RATE_LIMIT_EXCEEDED',
      429,
      { resetInSeconds }
    );
  }
  
  entry.count++;
}

/**
 * Clear rate limit for user (e.g., after successful payment)
 */
export function clearRateLimit(userId: string): void {
  rateLimitStore.delete(userId);
}

// ============================================
// GRACEFUL DEGRADATION
// ============================================

/**
 * Fallback analysis if Gemini fails completely
 */
export function createFallbackAnalysis(intent: any) {
  return {
    projectTitle: 'Project Analysis',
    concept: {
      direction: 'Based on your description',
      keyMessage: intent.description.substring(0, 100),
      mood: 'Professional'
    },
    colorPalette: {
      primary: ['#2C3E50'],
      accent: ['#3498DB'],
      background: ['#ECF0F1'],
      text: ['#2C3E50'],
      rationale: 'Default professional palette'
    },
    composition: {
      format: intent.format || '16:9',
      resolution: intent.resolution || '2K',
      zones: []
    },
    assetsRequired: {
      available: [],
      missing: []
    },
    finalPrompt: {
      scene: intent.description,
      style: 'professional',
      lighting: 'natural',
      mood: 'professional'
    },
    estimatedCost: {
      analysis: 100,
      assets: 0,
      generation: 15,
      total: 115
    },
    isFallback: true
  };
}

// ============================================
// LOGGING UTILITIES
// ============================================

export function logError(
  context: string,
  error: unknown,
  additionalData?: Record<string, any>
): void {
  console.error(`[${context}] Error:`, {
    message: extractErrorMessage(error),
    error,
    ...additionalData,
    timestamp: new Date().toISOString()
  });
}

export function logWarning(
  context: string,
  message: string,
  data?: Record<string, any>
): void {
  console.warn(`[${context}] Warning: ${message}`, {
    ...data,
    timestamp: new Date().toISOString()
  });
}

export function logInfo(
  context: string,
  message: string,
  data?: Record<string, any>
): void {
  console.log(`[${context}] ${message}`, {
    ...data,
    timestamp: new Date().toISOString()
  });
}
