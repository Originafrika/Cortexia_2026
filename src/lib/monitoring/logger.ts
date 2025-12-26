/**
 * LOGGER - Centralized logging system
 * 
 * Features:
 * - Multiple log levels
 * - Structured logging
 * - Context tracking
 * - Production/Development modes
 * - Integration with monitoring services
 */

// ============================================
// TYPES
// ============================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  stack?: string;
}

// ============================================
// LOGGER CLASS
// ============================================

class Logger {
  private context: LogContext = {};
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  constructor() {
    // Initialize session ID
    this.context.sessionId = this.generateSessionId();
  }

  /**
   * Set global context for all logs
   */
  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Get current context
   */
  getContext(): LogContext {
    return { ...this.context };
  }

  /**
   * Clear context
   */
  clearContext(): void {
    const sessionId = this.context.sessionId;
    this.context = { sessionId };
  }

  /**
   * Debug level log
   */
  debug(message: string, metadata?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, metadata);
    }
  }

  /**
   * Info level log
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }

  /**
   * Warning level log
   */
  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
  }

  /**
   * Error level log
   */
  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log('error', message, metadata, error);
  }

  /**
   * Core logging function
   */
  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        ...this.context,
        metadata: { ...this.context.metadata, ...metadata },
      },
      error,
      stack: error?.stack,
    };

    // Add to in-memory logs
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest
    }

    // Console output
    this.logToConsole(entry);

    // Send to monitoring service (if configured)
    this.sendToMonitoring(entry);
  }

  /**
   * Log to console with formatting
   */
  private logToConsole(entry: LogEntry): void {
    const { timestamp, level, message, context, error, stack } = entry;

    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const contextStr = context ? JSON.stringify(context, null, 2) : '';

    switch (level) {
      case 'debug':
        console.debug(prefix, message, contextStr);
        break;
      case 'info':
        console.info(prefix, message, contextStr);
        break;
      case 'warn':
        console.warn(prefix, message, contextStr);
        break;
      case 'error':
        console.error(prefix, message, contextStr);
        if (error) console.error('Error:', error);
        if (stack) console.error('Stack:', stack);
        break;
    }
  }

  /**
   * Send to monitoring service
   */
  private sendToMonitoring(entry: LogEntry): void {
    // Only send errors and warnings to monitoring in production
    if (process.env.NODE_ENV === 'production' && ['error', 'warn'].includes(entry.level)) {
      // Integration point for Sentry, LogRocket, etc.
      if (typeof window !== 'undefined' && (window as any).__ERROR_REPORTER__) {
        (window as any).__ERROR_REPORTER__.captureMessage(entry.message, {
          level: entry.level,
          contexts: {
            custom: entry.context,
          },
        });
      }
    }
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const logger = new Logger();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export const debug = (message: string, metadata?: Record<string, any>) =>
  logger.debug(message, metadata);

export const info = (message: string, metadata?: Record<string, any>) =>
  logger.info(message, metadata);

export const warn = (message: string, metadata?: Record<string, any>) =>
  logger.warn(message, metadata);

export const error = (message: string, err?: Error, metadata?: Record<string, any>) =>
  logger.error(message, err, metadata);

// ============================================
// REACT HOOK
// ============================================

/**
 * Hook for logging with component context
 */
export function useLogger(component: string) {
  return {
    debug: (message: string, metadata?: Record<string, any>) =>
      logger.debug(message, { ...metadata, component }),
    
    info: (message: string, metadata?: Record<string, any>) =>
      logger.info(message, { ...metadata, component }),
    
    warn: (message: string, metadata?: Record<string, any>) =>
      logger.warn(message, { ...metadata, component }),
    
    error: (message: string, error?: Error, metadata?: Record<string, any>) =>
      logger.error(message, error, { ...metadata, component }),
  };
}

// ============================================
// ACTION LOGGER
// ============================================

/**
 * Log user actions
 */
export function logAction(action: string, metadata?: Record<string, any>): void {
  logger.info(`Action: ${action}`, { ...metadata, action });
}

/**
 * Log generation events
 */
export function logGeneration(
  nodeId: string,
  status: 'started' | 'success' | 'error',
  metadata?: Record<string, any>
): void {
  const level = status === 'error' ? 'error' : 'info';
  const message = `Generation ${status}: ${nodeId}`;
  
  if (level === 'error') {
    logger.error(message, undefined, { ...metadata, nodeId, status });
  } else {
    logger.info(message, { ...metadata, nodeId, status });
  }
}

/**
 * Log API calls
 */
export function logAPI(
  endpoint: string,
  method: string,
  status: number,
  duration: number,
  error?: Error
): void {
  const metadata = { endpoint, method, status, duration };
  
  if (error || status >= 400) {
    logger.error(`API Error: ${method} ${endpoint}`, error, metadata);
  } else {
    logger.info(`API Call: ${method} ${endpoint}`, metadata);
  }
}

/**
 * Log performance metrics
 */
export function logPerformance(metric: string, value: number, metadata?: Record<string, any>): void {
  logger.info(`Performance: ${metric}`, { ...metadata, metric, value });
}
