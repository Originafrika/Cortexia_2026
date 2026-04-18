/**
 * CENTRALIZED ERROR HANDLER
 * Beauty Design System - Astronomie (Vision Systémique)
 * 
 * Provides consistent error handling across the application:
 * - Logging to console
 * - Toast notifications
 * - Analytics tracking
 * - User-friendly messages
 */

import { toast } from 'sonner';

export interface ErrorHandlerOptions {
  toast?: boolean;
  log?: boolean;
  track?: boolean;
  showDetails?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Error context for better debugging
 */
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * User-friendly error messages (French)
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  'Failed to fetch': 'Impossible de se connecter au serveur',
  'NetworkError': 'Erreur de connexion réseau',
  'AbortError': 'Requête annulée',
  
  // API errors
  '400': 'Requête invalide',
  '401': 'Authentification requise',
  '403': 'Accès refusé',
  '404': 'Ressource introuvable',
  '500': 'Erreur serveur',
  '503': 'Service temporairement indisponible',
  
  // App errors
  'VALIDATION_ERROR': 'Données invalides',
  'SAVE_ERROR': 'Échec de la sauvegarde',
  'GENERATION_ERROR': 'Échec de la génération',
  'UPLOAD_ERROR': 'Échec du téléchargement',
  
  // Default
  'UNKNOWN': 'Une erreur inattendue s\'est produite',
};

/**
 * Get user-friendly error message
 */
function getFriendlyMessage(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message;
  
  // Check if it's a known error
  for (const [key, friendlyMessage] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(key)) {
      return friendlyMessage;
    }
  }
  
  return ERROR_MESSAGES.UNKNOWN;
}

/**
 * Format error for logging
 */
function formatErrorLog(
  error: Error | string,
  context: string,
  errorContext?: ErrorContext
): string {
  const timestamp = new Date().toISOString();
  const message = typeof error === 'string' ? error : error.message;
  const stack = error instanceof Error ? error.stack : undefined;
  
  let log = `[${timestamp}] [${context}] ${message}`;
  
  if (errorContext) {
    log += `\nContext: ${JSON.stringify(errorContext, null, 2)}`;
  }
  
  if (stack) {
    log += `\nStack: ${stack}`;
  }
  
  return log;
}

/**
 * Main error handler
 */
export function handleError(
  error: Error | string,
  context: string,
  options: ErrorHandlerOptions = {},
  errorContext?: ErrorContext
): void {
  const {
    toast: showToast = true,
    log = true,
    track = true,
    showDetails = false,
    action,
  } = options;
  
  const message = typeof error === 'string' ? error : error.message;
  const friendlyMessage = getFriendlyMessage(error);
  
  // 1. Log to console (development)
  if (log && process.env.NODE_ENV !== 'production') {
    console.error(formatErrorLog(error, context, errorContext));
  }
  
  // 2. Track to analytics (production)
  if (track && process.env.NODE_ENV === 'production') {
    // TODO: Integrate with analytics service
    // analytics.error.caught(message, context, errorContext);
  }
  
  // 3. Show toast notification
  if (showToast) {
    toast.error(friendlyMessage, {
      description: showDetails ? message : undefined,
      duration: 5000,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    });
  }
}

/**
 * Handle validation errors
 */
export function handleValidationError(
  errors: string[],
  context: string,
  options?: ErrorHandlerOptions
): void {
  const message = `Validation échouée : ${errors.join(', ')}`;
  
  handleError(
    new Error(message),
    context,
    {
      ...options,
      showDetails: true,
    }
  );
}

/**
 * Handle API errors
 */
export async function handleApiError(
  response: Response,
  context: string,
  options?: ErrorHandlerOptions
): Promise<void> {
  let errorMessage = `Erreur ${response.status}`;
  
  try {
    const data = await response.json();
    errorMessage = data.error || data.message || errorMessage;
  } catch {
    errorMessage = await response.text() || errorMessage;
  }
  
  handleError(
    new Error(errorMessage),
    context,
    options
  );
}

/**
 * Success toast helper (consistency)
 */
export function showSuccess(
  title: string,
  description?: string,
  action?: {
    label: string;
    onClick: () => void;
  }
): void {
  toast.success(title, {
    description,
    duration: 3000,
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
  });
}

/**
 * Info toast helper
 */
export function showInfo(
  title: string,
  description?: string
): void {
  toast.info(title, {
    description,
    duration: 4000,
  });
}

/**
 * Warning toast helper
 */
export function showWarning(
  title: string,
  description?: string,
  action?: {
    label: string;
    onClick: () => void;
  }
): void {
  toast.warning(title, {
    description,
    duration: 4000,
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
  });
}

/**
 * Async error wrapper
 * Usage: await withErrorHandling(() => someAsyncFunction(), 'Context')
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string,
  options?: ErrorHandlerOptions
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(
      error instanceof Error ? error : new Error(String(error)),
      context,
      options
    );
    return null;
  }
}

/**
 * React Error Boundary helper
 */
export function logErrorBoundary(
  error: Error,
  errorInfo: { componentStack: string }
): void {
  handleError(
    error,
    'React Error Boundary',
    {
      toast: true,
      log: true,
      track: true,
      showDetails: process.env.NODE_ENV !== 'production',
    },
    {
      component: 'ErrorBoundary',
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    }
  );
}
