/**
 * ERROR HANDLER UTILITIES
 * Phase 10 - Error Handling & Resilience
 * 
 * Système centralisé de gestion d'erreurs.
 * 
 * Features:
 * - Error classification
 * - User-friendly messages
 * - Logging
 * - Retry logic
 * - Error recovery strategies
 */

import { toast } from 'sonner';

// ============================================
// ERROR TYPES
// ============================================

export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW',       // Can be ignored
  MEDIUM = 'MEDIUM', // Should be handled
  HIGH = 'HIGH',     // Must be handled
  CRITICAL = 'CRITICAL', // System-breaking
}

// ============================================
// APP ERROR CLASS
// ============================================

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly userMessage: string;
  public readonly technicalMessage: string;
  public readonly statusCode?: number;
  public readonly retryable: boolean;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;

  constructor({
    type = ErrorType.UNKNOWN,
    severity = ErrorSeverity.MEDIUM,
    userMessage,
    technicalMessage,
    statusCode,
    retryable = false,
    context,
  }: {
    type?: ErrorType;
    severity?: ErrorSeverity;
    userMessage: string;
    technicalMessage?: string;
    statusCode?: number;
    retryable?: boolean;
    context?: Record<string, any>;
  }) {
    super(technicalMessage || userMessage);
    
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.userMessage = userMessage;
    this.technicalMessage = technicalMessage || userMessage;
    this.statusCode = statusCode;
    this.retryable = retryable;
    this.context = context;
    this.timestamp = new Date();

    // Maintain proper stack trace (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      severity: this.severity,
      userMessage: this.userMessage,
      technicalMessage: this.technicalMessage,
      statusCode: this.statusCode,
      retryable: this.retryable,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

// ============================================
// ERROR CLASSIFICATION
// ============================================

/**
 * Classify an error based on its properties
 */
export function classifyError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AppError({
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.HIGH,
      userMessage: 'Erreur de connexion. Vérifiez votre connexion internet.',
      technicalMessage: error.message,
      retryable: true,
    });
  }

  // HTTP errors
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as any).status;
    
    if (status === 401) {
      return new AppError({
        type: ErrorType.AUTHENTICATION,
        severity: ErrorSeverity.HIGH,
        userMessage: 'Session expirée. Veuillez vous reconnecter.',
        statusCode: 401,
        retryable: false,
      });
    }
    
    if (status === 403) {
      return new AppError({
        type: ErrorType.AUTHORIZATION,
        severity: ErrorSeverity.HIGH,
        userMessage: 'Vous n\'avez pas les permissions nécessaires.',
        statusCode: 403,
        retryable: false,
      });
    }
    
    if (status === 404) {
      return new AppError({
        type: ErrorType.NOT_FOUND,
        severity: ErrorSeverity.MEDIUM,
        userMessage: 'Ressource introuvable.',
        statusCode: 404,
        retryable: false,
      });
    }
    
    if (status === 429) {
      return new AppError({
        type: ErrorType.RATE_LIMIT,
        severity: ErrorSeverity.MEDIUM,
        userMessage: 'Trop de requêtes. Veuillez patienter quelques instants.',
        statusCode: 429,
        retryable: true,
      });
    }
    
    if (status >= 500) {
      return new AppError({
        type: ErrorType.SERVER,
        severity: ErrorSeverity.HIGH,
        userMessage: 'Erreur serveur. Nos équipes ont été notifiées.',
        statusCode: status,
        retryable: true,
      });
    }
    
    if (status >= 400) {
      return new AppError({
        type: ErrorType.CLIENT,
        severity: ErrorSeverity.MEDIUM,
        userMessage: 'Requête invalide. Veuillez vérifier vos données.',
        statusCode: status,
        retryable: false,
      });
    }
  }

  // Validation errors
  if (error instanceof Error && error.message.includes('validation')) {
    return new AppError({
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.LOW,
      userMessage: 'Données invalides. Veuillez corriger les erreurs.',
      technicalMessage: error.message,
      retryable: false,
    });
  }

  // Timeout errors
  if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('aborted'))) {
    return new AppError({
      type: ErrorType.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'La requête a pris trop de temps. Veuillez réessayer.',
      technicalMessage: error.message,
      retryable: true,
    });
  }

  // Generic Error object
  if (error instanceof Error) {
    return new AppError({
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Une erreur inattendue s\'est produite.',
      technicalMessage: error.message,
      retryable: false,
      context: { stack: error.stack },
    });
  }

  // Unknown error type
  return new AppError({
    type: ErrorType.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'Une erreur inattendue s\'est produite.',
    technicalMessage: String(error),
    retryable: false,
  });
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Handle an error with appropriate UI feedback
 */
export function handleError(error: unknown, options?: {
  silent?: boolean;
  logToConsole?: boolean;
  context?: Record<string, any>;
}): AppError {
  const appError = classifyError(error);
  
  // Add additional context
  if (options?.context) {
    appError.context = { ...appError.context, ...options.context };
  }

  // Log to console in development
  if (options?.logToConsole !== false && process.env.NODE_ENV !== 'production') {
    console.error('[Error Handler]', appError.toJSON());
  }

  // Show toast notification (unless silent)
  if (!options?.silent) {
    const toastConfig = getToastConfig(appError);
    
    if (toastConfig.type === 'error') {
      toast.error(appError.userMessage, {
        description: toastConfig.description,
        duration: toastConfig.duration,
      });
    } else if (toastConfig.type === 'warning') {
      toast.warning(appError.userMessage, {
        description: toastConfig.description,
        duration: toastConfig.duration,
      });
    }
  }

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production' && appError.severity >= ErrorSeverity.HIGH) {
    // TODO: Send to Sentry, LogRocket, etc.
    logErrorToService(appError);
  }

  return appError;
}

/**
 * Get toast configuration based on error
 */
function getToastConfig(error: AppError) {
  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      return {
        type: 'error' as const,
        description: 'Veuillez contacter le support.',
        duration: 10000,
      };
    case ErrorSeverity.HIGH:
      return {
        type: 'error' as const,
        description: error.retryable ? 'Vous pouvez réessayer.' : undefined,
        duration: 7000,
      };
    case ErrorSeverity.MEDIUM:
      return {
        type: 'warning' as const,
        description: error.retryable ? 'Réessayez dans quelques instants.' : undefined,
        duration: 5000,
      };
    case ErrorSeverity.LOW:
      return {
        type: 'warning' as const,
        description: undefined,
        duration: 3000,
      };
  }
}

/**
 * Log error to external service (placeholder)
 */
function logErrorToService(error: AppError): void {
  // TODO: Integrate with Sentry, LogRocket, etc.
  console.error('[Error Service]', error.toJSON());
}

// ============================================
// ERROR RECOVERY
// ============================================

/**
 * Attempt to recover from an error
 */
export async function attemptRecovery(
  error: AppError,
  recoveryFn: () => Promise<any>,
  maxAttempts: number = 3
): Promise<{ success: boolean; data?: any; error?: AppError }> {
  if (!error.retryable) {
    return { success: false, error };
  }

  let attempts = 0;
  let lastError = error;

  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempts - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      const data = await recoveryFn();
      return { success: true, data };
    } catch (err) {
      lastError = classifyError(err);
      
      if (!lastError.retryable) {
        break;
      }
    }
  }

  return { success: false, error: lastError };
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors.push(`Le champ "${field}" est requis.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a validation error
 */
export function createValidationError(errors: string[]): AppError {
  return new AppError({
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.LOW,
    userMessage: errors.join(' '),
    technicalMessage: `Validation failed: ${errors.join(', ')}`,
    retryable: false,
    context: { errors },
  });
}

// ============================================
// BOUNDARY HELPERS
// ============================================

/**
 * Check if error should show fallback UI
 */
export function shouldShowFallback(error: AppError): boolean {
  return error.severity >= ErrorSeverity.HIGH;
}

/**
 * Check if error should be logged
 */
export function shouldLogError(error: AppError): boolean {
  return error.severity >= ErrorSeverity.MEDIUM;
}

/**
 * Get recovery suggestion for error
 */
export function getRecoverySuggestion(error: AppError): string | null {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Vérifiez votre connexion internet et réessayez.';
    case ErrorType.AUTHENTICATION:
      return 'Reconnectez-vous pour continuer.';
    case ErrorType.RATE_LIMIT:
      return 'Attendez quelques minutes avant de réessayer.';
    case ErrorType.SERVER:
      return 'Nos serveurs rencontrent des difficultés. Réessayez dans quelques instants.';
    case ErrorType.TIMEOUT:
      return 'La requête a pris trop de temps. Réessayez avec une connexion plus stable.';
    default:
      return error.retryable ? 'Réessayez.' : null;
  }
}
