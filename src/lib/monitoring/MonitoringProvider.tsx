/**
 * MONITORING PROVIDER - Centralized monitoring initialization
 * 
 * Features:
 * - Initializes all monitoring services
 * - Error tracking
 * - Analytics
 * - Performance monitoring
 * - Logger setup
 */

import { useEffect, ReactNode } from 'react';
import { initAnalytics } from './analytics';
import { initSentry } from './sentry';
import { logger } from './logger';
import { performanceMonitor } from './performance';

// ============================================
// TYPES
// ============================================

export interface MonitoringConfig {
  analytics?: {
    enabled: boolean;
    measurementId: string;
    enableDebug?: boolean;
  };
  sentry?: {
    enabled: boolean;
    dsn: string;
    environment?: 'development' | 'staging' | 'production';
    release?: string;
  };
  performance?: {
    enabled: boolean;
    trackWebVitals?: boolean;
    trackMemory?: boolean;
  };
}

export interface MonitoringProviderProps {
  config: MonitoringConfig;
  children: ReactNode;
}

// ============================================
// PROVIDER COMPONENT
// ============================================

export function MonitoringProvider({ config, children }: MonitoringProviderProps) {
  useEffect(() => {
    // Initialize monitoring services
    initializeMonitoring(config);

    // Setup error handlers
    setupGlobalErrorHandlers();

    // Track initial page view
    if (config.analytics?.enabled) {
      // Delay to ensure analytics is fully loaded
      setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'page_view');
        }
      }, 100);
    }

    logger.info('Monitoring initialized', {
      analytics: config.analytics?.enabled,
      sentry: config.sentry?.enabled,
      performance: config.performance?.enabled,
    });
  }, [config]);

  return <>{children}</>;
}

// ============================================
// INITIALIZATION
// ============================================

function initializeMonitoring(config: MonitoringConfig): void {
  // Initialize Analytics
  if (config.analytics?.enabled && config.analytics.measurementId) {
    initAnalytics({
      measurementId: config.analytics.measurementId,
      enableDebug: config.analytics.enableDebug ?? false,
      anonymizeIp: true,
    });
  }

  // Initialize Sentry
  if (config.sentry?.enabled && config.sentry.dsn) {
    initSentry({
      dsn: config.sentry.dsn,
      environment: config.sentry.environment ?? 'production',
      release: config.sentry.release,
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }

  // Initialize Performance Monitoring
  if (config.performance?.enabled) {
    // Performance monitoring is auto-initialized
    // Track memory periodically if enabled
    if (config.performance.trackMemory) {
      setInterval(() => {
        performanceMonitor.trackMemory();
      }, 60000); // Every minute
    }
  }
}

// ============================================
// GLOBAL ERROR HANDLERS
// ============================================

function setupGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  // Unhandled errors
  window.addEventListener('error', (event) => {
    logger.error('Unhandled error', event.error, {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', event.reason, {
      promise: event.promise,
    });
  });

  // Console error override (optional - captures console.error calls)
  if (process.env.NODE_ENV === 'production') {
    const originalError = console.error;
    console.error = (...args: any[]) => {
      // Log to monitoring
      logger.error('Console error', undefined, { args });
      
      // Call original
      originalError.apply(console, args);
    };
  }
}

// ============================================
// DEFAULT CONFIG
// ============================================

export const defaultMonitoringConfig: MonitoringConfig = {
  analytics: {
    enabled: process.env.NODE_ENV === 'production',
    measurementId: process.env.GA_MEASUREMENT_ID || '',
    enableDebug: process.env.NODE_ENV === 'development',
  },
  sentry: {
    enabled: process.env.NODE_ENV === 'production',
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV as any,
    release: process.env.npm_package_version,
  },
  performance: {
    enabled: true,
    trackWebVitals: true,
    trackMemory: process.env.NODE_ENV === 'development',
  },
};

// ============================================
// MONITORING CONTEXT (OPTIONAL)
// ============================================

import { createContext, useContext } from 'react';

interface MonitoringContextValue {
  config: MonitoringConfig;
  logger: typeof logger;
  performanceMonitor: typeof performanceMonitor;
}

const MonitoringContext = createContext<MonitoringContextValue | null>(null);

export function MonitoringProviderWithContext({ config, children }: MonitoringProviderProps) {
  useEffect(() => {
    initializeMonitoring(config);
    setupGlobalErrorHandlers();
  }, [config]);

  const value: MonitoringContextValue = {
    config,
    logger,
    performanceMonitor,
  };

  return (
    <MonitoringContext.Provider value={value}>
      {children}
    </MonitoringContext.Provider>
  );
}

export function useMonitoring(): MonitoringContextValue {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within MonitoringProvider');
  }
  return context;
}
