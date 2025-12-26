/**
 * PERFORMANCE MONITORING - Web Vitals and custom metrics tracking
 * 
 * Features:
 * - Core Web Vitals (CLS, FID, LCP, FCP, TTFB)
 * - Custom performance marks
 * - API response time tracking
 * - Generation success rate
 * - Memory usage tracking
 */

import { logger } from './logger';

// ============================================
// TYPES
// ============================================

export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export interface CustomMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  webVitals: WebVitalsMetric[];
  customMetrics: CustomMetric[];
  timestamp: string;
  url: string;
  userAgent: string;
}

// ============================================
// WEB VITALS THRESHOLDS
// ============================================

const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  LCP: { good: 2500, poor: 4000 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

// ============================================
// RATING CALCULATION
// ============================================

function getRating(name: WebVitalsMetric['name'], value: number): WebVitalsMetric['rating'] {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// ============================================
// WEB VITALS TRACKING
// ============================================

class PerformanceMonitor {
  private metrics: Map<string, CustomMetric> = new Map();
  private webVitals: WebVitalsMetric[] = [];

  constructor() {
    this.initWebVitals();
  }

  /**
   * Initialize Web Vitals tracking
   */
  private initWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Use web-vitals library if available, otherwise use Performance API
    if ('web-vitals' in window) {
      // web-vitals library integration (would need to be installed)
      this.initWebVitalsLibrary();
    } else {
      // Fallback to Performance Observer API
      this.initPerformanceObserver();
    }
  }

  /**
   * Init with web-vitals library (recommended)
   */
  private initWebVitalsLibrary(): void {
    // This would use the web-vitals npm package
    // import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';
    // For now, using Performance Observer as fallback
    this.initPerformanceObserver();
  }

  /**
   * Init with Performance Observer API
   */
  private initPerformanceObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        if (lastEntry) {
          this.reportWebVital({
            name: 'LCP',
            value: lastEntry.renderTime || lastEntry.loadTime,
            rating: getRating('LCP', lastEntry.renderTime || lastEntry.loadTime),
            delta: 0,
            id: this.generateId(),
          });
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.reportWebVital({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            rating: getRating('FID', entry.processingStart - entry.startTime),
            delta: 0,
            id: this.generateId(),
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        this.reportWebVital({
          name: 'CLS',
          value: clsValue,
          rating: getRating('CLS', clsValue),
          delta: 0,
          id: this.generateId(),
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observer not supported');
    }

    // Navigation Timing (FCP, TTFB)
    if ('performance' in window && 'timing' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const timing = performance.timing;
          
          // First Contentful Paint
          if ('getEntriesByType' in performance) {
            const paintEntries = performance.getEntriesByType('paint');
            const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
            
            if (fcp) {
              this.reportWebVital({
                name: 'FCP',
                value: fcp.startTime,
                rating: getRating('FCP', fcp.startTime),
                delta: 0,
                id: this.generateId(),
              });
            }
          }
          
          // Time to First Byte
          const ttfb = timing.responseStart - timing.requestStart;
          this.reportWebVital({
            name: 'TTFB',
            value: ttfb,
            rating: getRating('TTFB', ttfb),
            delta: 0,
            id: this.generateId(),
          });
        }, 0);
      });
    }
  }

  /**
   * Report Web Vital metric
   */
  private reportWebVital(metric: WebVitalsMetric): void {
    this.webVitals.push(metric);
    
    // Log to logger
    logger.info(`Web Vital: ${metric.name}`, {
      value: metric.value,
      rating: metric.rating,
    });

    // Send to analytics
    this.sendToAnalytics('web_vital', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_rating: metric.rating,
    });
  }

  /**
   * Track custom metric
   */
  trackMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: CustomMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.set(name, metric);
    
    logger.info(`Custom Metric: ${name}`, { value, ...metadata });
    
    this.sendToAnalytics('custom_metric', {
      metric_name: name,
      metric_value: value,
      ...metadata,
    });
  }

  /**
   * Mark performance point
   */
  mark(name: string): void {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
  }

  /**
   * Measure performance between marks
   */
  measure(name: string, startMark: string, endMark: string): number | null {
    if ('performance' in window && 'measure' in performance) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        if (measure) {
          this.trackMetric(name, measure.duration);
          return measure.duration;
        }
      } catch (e) {
        console.warn('Performance measure failed:', e);
      }
    }
    return null;
  }

  /**
   * Track API call performance
   */
  trackAPI(endpoint: string, duration: number, status: number): void {
    this.trackMetric(`api_${endpoint}`, duration, { status });
  }

  /**
   * Track generation performance
   */
  trackGeneration(nodeId: string, duration: number, success: boolean): void {
    this.trackMetric('generation_duration', duration, {
      nodeId,
      success,
    });
  }

  /**
   * Track memory usage
   */
  trackMemory(): void {
    if ('performance' in window && 'memory' in (performance as any)) {
      const memory = (performance as any).memory;
      
      this.trackMetric('memory_used', memory.usedJSHeapSize, {
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      });
    }
  }

  /**
   * Get performance report
   */
  getReport(): PerformanceReport {
    return {
      webVitals: this.webVitals,
      customMetrics: Array.from(this.metrics.values()),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
  }

  /**
   * Send metrics to analytics service
   */
  private sendToAnalytics(eventName: string, params: Record<string, any>): void {
    // Integration with Google Analytics, Mixpanel, etc.
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, params);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const performanceMonitor = new PerformanceMonitor();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export const trackMetric = (name: string, value: number, metadata?: Record<string, any>) =>
  performanceMonitor.trackMetric(name, value, metadata);

export const mark = (name: string) => performanceMonitor.mark(name);

export const measure = (name: string, startMark: string, endMark: string) =>
  performanceMonitor.measure(name, startMark, endMark);

export const trackAPI = (endpoint: string, duration: number, status: number) =>
  performanceMonitor.trackAPI(endpoint, duration, status);

export const trackGeneration = (nodeId: string, duration: number, success: boolean) =>
  performanceMonitor.trackGeneration(nodeId, duration, success);

export const trackMemory = () => performanceMonitor.trackMemory();

export const getPerformanceReport = () => performanceMonitor.getReport();

// ============================================
// REACT HOOK
// ============================================

/**
 * Hook for tracking component performance
 */
export function usePerformanceTracking(componentName: string) {
  React.useEffect(() => {
    const startMark = `${componentName}-start`;
    const endMark = `${componentName}-end`;
    
    mark(startMark);
    
    return () => {
      mark(endMark);
      measure(`${componentName}-render`, startMark, endMark);
    };
  }, [componentName]);
}

// Fix React import
import React from 'react';
