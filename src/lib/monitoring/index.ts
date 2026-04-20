/**
 * MONITORING - Central export for all monitoring utilities
 * 
 * Usage:
 * import { logger, analytics, performanceMonitor } from '@/lib/monitoring';
 */

// Logger
export { logger, debug, info, warn, error, useLogger, logAction, logGeneration, logAPI, logPerformance } from './logger';
export type { LogLevel, LogContext, LogEntry } from './logger';

// Analytics
export { analytics, initAnalytics, trackPageView, trackEvent, setUserProperties, setUserId, usePageViewTracking, useAnalytics } from './analytics';
export type { AnalyticsConfig, PageViewParams, EventParams, UserProperties } from './analytics';

// Performance
export { performanceMonitor, trackMetric, mark, measure, trackAPI, trackGeneration, trackMemory, getPerformanceReport, usePerformanceTracking } from './performance';
export type { WebVitalsMetric, CustomMetric, PerformanceReport } from './performance';

// Sentry
export { sentry, initSentry, captureException, captureMessage, setSentryUser, clearSentryUser, addBreadcrumb } from './sentry';
export type { SentryConfig, ErrorContext } from './sentry';

// Sentry Client
export { init, captureError, captureMessage, captureException, ErrorBoundary, Sentry } from './sentry-client';

// Provider
export { MonitoringProvider, MonitoringProviderWithContext, useMonitoring, defaultMonitoringConfig } from './MonitoringProvider';
export type { MonitoringConfig, MonitoringProviderProps } from './MonitoringProvider';

// ============================================
// QUICK START GUIDE
// ============================================

/**
 * QUICK START:
 * 
 * 1. Wrap your app with MonitoringProvider:
 * 
 *    import { MonitoringProvider, defaultMonitoringConfig } from '@/lib/monitoring';
 *    
 *    function App() {
 *      return (
 *        <MonitoringProvider config={defaultMonitoringConfig}>
 *          <YourApp />
 *        </MonitoringProvider>
 *      );
 *    }
 * 
 * 2. Use logger anywhere:
 * 
 *    import { logger } from '@/lib/monitoring';
 *    
 *    logger.info('User clicked button', { buttonId: 'submit' });
 *    logger.error('API call failed', error, { endpoint: '/api/generate' });
 * 
 * 3. Track analytics events:
 * 
 *    import { analytics } from '@/lib/monitoring';
 *    
 *    analytics.trackCampaignCreated('video');
 *    analytics.trackGenerationCompleted('image', 'flux-2-pro', 5000, 10);
 * 
 * 4. Track performance:
 * 
 *    import { mark, measure } from '@/lib/monitoring';
 *    
 *    mark('generation-start');
 *    await generateAsset();
 *    mark('generation-end');
 *    measure('generation-duration', 'generation-start', 'generation-end');
 * 
 * 5. Use in components:
 * 
 *    import { useLogger, useAnalytics } from '@/lib/monitoring';
 *    
 *    function MyComponent() {
 *      const log = useLogger('MyComponent');
 *      const { trackFeatureUsed } = useAnalytics();
 *      
 *      const handleClick = () => {
 *        log.info('Button clicked');
 *        trackFeatureUsed('export');
 *      };
 *    }
 */
