import * as Sentry from '@sentry/react';
import { logger } from './logger';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const SENTRY_ORG = import.meta.env.VITE_SENTRY_ORG;
const SENTRY_PROJECT = import.meta.env.VITE_SENTRY_PROJECT;
const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

const IGNORED_ERROR_PATTERNS = [
  'Failed to fetch',
  'NetworkError',
  'Network request failed',
  'timeout',
  'TimeoutError',
  'ECONNABORTED',
  'abort',
  'cancel',
];

function isIgnoredError(error: unknown): boolean {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return IGNORED_ERROR_PATTERNS.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}

export function init() {
  if (!SENTRY_DSN) {
    logger.warn('Sentry DSN not provided - error tracking disabled');
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: APP_ENV,
      release: APP_VERSION,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      integrations: [],
      ignoreErrors: IGNORED_ERROR_PATTERNS,
      beforeSend(event, hint) {
        const error = hint.originalException;
        if (isIgnoredError(error)) {
          return null;
        }
        return event;
      },
    });

    logger.info('Sentry initialized', {
      dsn: SENTRY_DSN ? '(configured)' : '(missing)',
      org: SENTRY_ORG,
      project: SENTRY_PROJECT,
      environment: APP_ENV,
      release: APP_VERSION,
    });
  } catch (error) {
    logger.error('Failed to initialize Sentry', error as Error);
  }
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!SENTRY_DSN) return;
  
  if (isIgnoredError(error)) return;

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (!SENTRY_DSN) return;
  Sentry.captureMessage(message, level);
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  captureError(error, context);
}

export const ErrorBoundary = Sentry.ErrorBoundary;

export { Sentry };