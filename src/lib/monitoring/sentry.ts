/**
 * SENTRY - Error tracking integration (optional)
 * 
 * This file prepares Sentry integration but doesn't require it.
 * To enable: Install @sentry/react and configure with your DSN.
 * 
 * npm install @sentry/react
 */

import { logger } from './logger';

// ============================================
// TYPES
// ============================================

export interface SentryConfig {
  dsn: string;
  environment: 'development' | 'staging' | 'production';
  release?: string;
  tracesSampleRate?: number;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
}

export interface ErrorContext {
  userId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

// ============================================
// SENTRY INTEGRATION (OPTIONAL)
// ============================================

class SentryIntegration {
  private isInitialized = false;
  private isEnabled = false;

  /**
   * Initialize Sentry (if package is installed)
   */
  init(config: SentryConfig): void {
    if (this.isInitialized) {
      logger.warn('Sentry already initialized');
      return;
    }

    try {
      // Try to import Sentry (will fail if not installed)
      const Sentry = this.getSentry();
      
      if (!Sentry) {
        logger.info('Sentry not installed - error tracking disabled');
        return;
      }

      // Initialize Sentry
      Sentry.init({
        dsn: config.dsn,
        environment: config.environment,
        release: config.release,
        
        // Performance Monitoring
        tracesSampleRate: config.tracesSampleRate ?? 1.0,
        
        // Session Replay
        integrations: [
          // new Sentry.Replay({
          //   maskAllText: false,
          //   blockAllMedia: false,
          // }),
        ],
        replaysSessionSampleRate: config.replaysSessionSampleRate ?? 0.1,
        replaysOnErrorSampleRate: config.replaysOnErrorSampleRate ?? 1.0,

        // Filter errors
        beforeSend(event, hint) {
          // Don't send in development
          if (config.environment === 'development') {
            return null;
          }

          // Filter out known non-critical errors
          const error = hint.originalException;
          if (error && typeof error === 'object' && 'message' in error) {
            const message = (error as Error).message;
            
            // Ignore network errors from ad blockers, etc.
            if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
              return null;
            }
          }

          return event;
        },
      });

      this.isInitialized = true;
      this.isEnabled = true;

      logger.info('Sentry initialized', {
        environment: config.environment,
        release: config.release,
      });
    } catch (error) {
      logger.warn('Failed to initialize Sentry', error as Error);
    }
  }

  /**
   * Get Sentry instance (if available)
   */
  private getSentry(): any {
    try {
      // Try to dynamically import Sentry
      // In production, this would be: import * as Sentry from '@sentry/react'
      // For now, check window object
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        return (window as any).Sentry;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Capture exception
   */
  captureException(error: Error, context?: ErrorContext): void {
    if (!this.isEnabled) {
      logger.error('Sentry not enabled - logging error instead', error, context);
      return;
    }

    const Sentry = this.getSentry();
    if (!Sentry) return;

    Sentry.withScope((scope: any) => {
      // Add context
      if (context?.userId) {
        scope.setUser({ id: context.userId });
      }
      if (context?.component) {
        scope.setTag('component', context.component);
      }
      if (context?.action) {
        scope.setTag('action', context.action);
      }
      if (context?.metadata) {
        scope.setContext('metadata', context.metadata);
      }

      // Capture exception
      Sentry.captureException(error);
    });
  }

  /**
   * Capture message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!this.isEnabled) {
      logger.info(`Sentry message: ${message}`);
      return;
    }

    const Sentry = this.getSentry();
    if (!Sentry) return;

    Sentry.captureMessage(message, level);
  }

  /**
   * Set user context
   */
  setUser(userId: string, email?: string, username?: string): void {
    if (!this.isEnabled) return;

    const Sentry = this.getSentry();
    if (!Sentry) return;

    Sentry.setUser({
      id: userId,
      email,
      username,
    });
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (!this.isEnabled) return;

    const Sentry = this.getSentry();
    if (!Sentry) return;

    Sentry.setUser(null);
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(message: string, category?: string, level?: string, data?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const Sentry = this.getSentry();
    if (!Sentry) return;

    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
    });
  }

  /**
   * Start transaction for performance monitoring
   */
  startTransaction(name: string, op: string): any {
    if (!this.isEnabled) return null;

    const Sentry = this.getSentry();
    if (!Sentry) return null;

    return Sentry.startTransaction({ name, op });
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const sentry = new SentryIntegration();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export const initSentry = (config: SentryConfig) => sentry.init(config);

export const captureException = (error: Error, context?: ErrorContext) =>
  sentry.captureException(error, context);

export const captureMessage = (message: string, level?: 'info' | 'warning' | 'error') =>
  sentry.captureMessage(message, level);

export const setSentryUser = (userId: string, email?: string, username?: string) =>
  sentry.setUser(userId, email, username);

export const clearSentryUser = () => sentry.clearUser();

export const addBreadcrumb = (
  message: string,
  category?: string,
  level?: string,
  data?: Record<string, any>
) => sentry.addBreadcrumb(message, category, level, data);

// ============================================
// ERROR REPORTER GLOBAL
// ============================================

/**
 * Global error reporter that can be used by ErrorBoundary
 */
if (typeof window !== 'undefined') {
  (window as any).__ERROR_REPORTER__ = {
    captureException: (error: Error, context?: any) => {
      sentry.captureException(error, context?.contexts?.react);
    },
    captureMessage: (message: string, options?: any) => {
      sentry.captureMessage(message, options?.level);
    },
  };
}

// ============================================
// SETUP INSTRUCTIONS
// ============================================

/**
 * To enable Sentry:
 * 
 * 1. Install the package:
 *    npm install @sentry/react
 * 
 * 2. Get your DSN from Sentry.io:
 *    https://sentry.io/settings/projects/your-project/keys/
 * 
 * 3. Initialize in your app:
 *    import { initSentry } from '@/lib/monitoring/sentry';
 *    
 *    initSentry({
 *      dsn: 'YOUR_SENTRY_DSN',
 *      environment: process.env.NODE_ENV,
 *      release: process.env.npm_package_version,
 *      tracesSampleRate: 1.0,
 *    });
 * 
 * 4. Wrap your app with Sentry's ErrorBoundary:
 *    import * as Sentry from '@sentry/react';
 *    
 *    <Sentry.ErrorBoundary fallback={ErrorFallback}>
 *      <App />
 *    </Sentry.ErrorBoundary>
 */
