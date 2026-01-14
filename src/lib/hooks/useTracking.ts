/**
 * USE TRACKING - React hooks for analytics
 * 
 * Easy-to-use hooks for tracking user interactions
 */

import { useEffect, useCallback, useRef } from 'react';
import { analytics } from '../analytics/tracker';

/**
 * Track page view on mount
 */
export function usePageView(pageName?: string) {
  useEffect(() => {
    analytics.trackPageView(pageName);
  }, [pageName]);
}

/**
 * Track clicks with automatic cleanup
 */
export function useTrackClick(elementName: string, location?: string) {
  return useCallback(() => {
    analytics.interaction.click(elementName, location);
  }, [elementName, location]);
}

/**
 * Track form submissions
 */
export function useTrackForm(formName: string) {
  const trackStart = useCallback(() => {
    analytics.track('interaction', 'form_started', formName);
  }, [formName]);

  const trackComplete = useCallback(() => {
    analytics.track('interaction', 'form_completed', formName);
  }, [formName]);

  const trackAbandoned = useCallback(() => {
    analytics.track('interaction', 'form_abandoned', formName);
  }, [formName]);

  return { trackStart, trackComplete, trackAbandoned };
}

/**
 * Track component mount/unmount time
 */
export function useTrackComponentLifetime(componentName: string) {
  const mountTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const mountTime = mountTimeRef.current;

    return () => {
      const lifetime = Date.now() - mountTime;
      analytics.track('performance', 'component_lifetime', componentName, lifetime);
    };
  }, [componentName]);
}

/**
 * Track API calls
 */
export function useTrackApi() {
  const trackApiCall = useCallback(
    async <T,>(
      endpoint: string,
      fetchFn: () => Promise<T>
    ): Promise<T> => {
      const startTime = Date.now();
      let success = false;

      try {
        const result = await fetchFn();
        success = true;
        return result;
      } catch (error) {
        throw error;
      } finally {
        const duration = Date.now() - startTime;
        analytics.performance.apiCall(endpoint, duration, success);
      }
    },
    []
  );

  return trackApiCall;
}

/**
 * Track search interactions
 */
export function useTrackSearch() {
  const trackSearch = useCallback((query: string, resultsCount: number) => {
    analytics.interaction.search(query, resultsCount);
  }, []);

  return trackSearch;
}

/**
 * Track video/media playback
 */
export function useTrackMedia(mediaName: string) {
  const trackPlay = useCallback(() => {
    analytics.track('interaction', 'media_play', mediaName);
  }, [mediaName]);

  const trackPause = useCallback(() => {
    analytics.track('interaction', 'media_pause', mediaName);
  }, [mediaName]);

  const trackComplete = useCallback(() => {
    analytics.track('interaction', 'media_complete', mediaName);
  }, [mediaName]);

  const trackProgress = useCallback((percent: number) => {
    analytics.track('interaction', 'media_progress', mediaName, percent);
  }, [mediaName]);

  return { trackPlay, trackPause, trackComplete, trackProgress };
}

/**
 * Track scroll depth
 */
export function useTrackScrollDepth(elementRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!elementRef.current) return;

    let maxDepth = 0;
    const milestones = [25, 50, 75, 100];
    const tracked = new Set<number>();

    const handleScroll = () => {
      if (!elementRef.current) return;

      const element = elementRef.current;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      const scrollPercent = (scrollTop / scrollHeight) * 100;

      if (scrollPercent > maxDepth) {
        maxDepth = scrollPercent;

        // Track milestones
        milestones.forEach(milestone => {
          if (scrollPercent >= milestone && !tracked.has(milestone)) {
            tracked.add(milestone);
            analytics.track('interaction', 'scroll_depth', `${milestone}%`, milestone);
          }
        });
      }
    };

    const element = elementRef.current;
    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [elementRef]);
}

/**
 * Track time on page
 */
export function useTrackTimeOnPage(pageName: string) {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const startTime = startTimeRef.current;

    const trackTime = () => {
      const timeSpent = Date.now() - startTime;
      analytics.track('performance', 'time_on_page', pageName, timeSpent);
    };

    // Track on unmount
    return trackTime;
  }, [pageName]);
}

/**
 * Track feature usage
 */
export function useTrackFeature(featureName: string) {
  const trackUsed = useCallback(() => {
    analytics.track('interaction', 'feature_used', featureName);
  }, [featureName]);

  const trackEnabled = useCallback(() => {
    analytics.track('interaction', 'feature_enabled', featureName);
  }, [featureName]);

  const trackDisabled = useCallback(() => {
    analytics.track('interaction', 'feature_disabled', featureName);
  }, [featureName]);

  return { trackUsed, trackEnabled, trackDisabled };
}

/**
 * Track AB test variant
 */
export function useTrackABTest(testName: string, variant: string) {
  useEffect(() => {
    analytics.track('interaction', 'ab_test_shown', testName, undefined, { variant });
  }, [testName, variant]);
}

/**
 * Track errors within a component
 */
export function useTrackErrors(componentName: string) {
  const trackError = useCallback((error: Error, errorInfo?: any) => {
    analytics.error.occurred(error.message, error.name, {
      component: componentName,
      stack: error.stack,
      ...errorInfo
    });
  }, [componentName]);

  return trackError;
}
