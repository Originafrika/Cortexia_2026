/**
 * ANALYTICS TRACKER - Event tracking system
 * ✅ Privacy-focused, lightweight analytics
 * 
 * Features:
 * - Event tracking
 * - User properties
 * - Page views
 * - Performance metrics
 * - Error tracking
 * - Batch sending
 * - LocalStorage fallback
 */

type EventCategory = 
  | 'generation'
  | 'navigation'
  | 'interaction'
  | 'error'
  | 'performance'
  | 'conversion';

interface AnalyticsEvent {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

interface UserProperties {
  userId?: string;
  credits?: number;
  plan?: string;
  [key: string]: any;
}

class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userProperties: UserProperties = {};
  private batchSize = 10;
  private batchInterval = 30000; // 30 seconds
  private batchTimer: NodeJS.Timeout | null = null;
  private isEnabled = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initBatchSending();
    this.trackPageView();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    const stored = sessionStorage.getItem('analytics_session_id');
    if (stored) return stored;

    const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', newId);
    return newId;
  }

  /**
   * Initialize batch sending
   */
  private initBatchSending() {
    this.batchTimer = setInterval(() => {
      this.sendBatch();
    }, this.batchInterval);

    // Send on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.sendBatch(true);
      });
    }
  }

  /**
   * Track event
   */
  track(
    category: EventCategory,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      metadata,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userProperties.userId
    };

    this.events.push(event);
    console.log('📊 Analytics Event:', event);

    // Send batch if queue is full
    if (this.events.length >= this.batchSize) {
      this.sendBatch();
    }
  }

  /**
   * Track page view
   */
  trackPageView(path?: string) {
    const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '/');
    this.track('navigation', 'page_view', currentPath);
  }

  /**
   * Track generation events
   */
  generation = {
    started: (cost: number, specs: any) => {
      this.track('generation', 'generation_started', undefined, cost, specs);
    },
    completed: (cost: number, duration: number) => {
      this.track('generation', 'generation_completed', undefined, cost, { duration });
    },
    failed: (error: string, cost: number) => {
      this.track('generation', 'generation_failed', error, cost);
    },
    refunded: (amount: number, reason: string) => {
      this.track('generation', 'credits_refunded', reason, amount);
    }
  };

  /**
   * Track user interactions
   */
  interaction = {
    click: (element: string, location?: string) => {
      this.track('interaction', 'click', element, undefined, { location });
    },
    toggle: (feature: string, state: boolean) => {
      this.track('interaction', 'toggle', feature, state ? 1 : 0);
    },
    search: (query: string, resultsCount: number) => {
      this.track('interaction', 'search', query, resultsCount);
    },
    filter: (filterName: string, filterValue: string) => {
      this.track('interaction', 'filter_applied', filterName, undefined, { value: filterValue });
    }
  };

  /**
   * Track errors
   */
  error = {
    occurred: (errorMessage: string, errorType: string, context?: any) => {
      this.track('error', 'error_occurred', errorType, undefined, {
        message: errorMessage,
        context
      });
    },
    boundary: (errorInfo: any, componentStack?: string) => {
      this.track('error', 'error_boundary', undefined, undefined, {
        errorInfo,
        componentStack
      });
    }
  };

  /**
   * Track performance metrics
   */
  performance = {
    pageLoad: (duration: number) => {
      this.track('performance', 'page_load', undefined, duration);
    },
    apiCall: (endpoint: string, duration: number, success: boolean) => {
      this.track('performance', 'api_call', endpoint, duration, { success });
    },
    renderTime: (component: string, duration: number) => {
      this.track('performance', 'component_render', component, duration);
    }
  };

  /**
   * Track conversions
   */
  conversion = {
    signup: (plan?: string) => {
      this.track('conversion', 'user_signup', plan);
    },
    creditsPurchased: (amount: number, price: number) => {
      this.track('conversion', 'credits_purchased', undefined, amount, { price });
    },
    projectCompleted: (projectType: string, creditsSpent: number) => {
      this.track('conversion', 'project_completed', projectType, creditsSpent);
    }
  };

  /**
   * Set user properties
   */
  identify(userId: string, properties?: UserProperties) {
    this.userProperties = {
      userId,
      ...properties
    };
    console.log('👤 User identified:', this.userProperties);
  }

  /**
   * Update user properties
   */
  setUserProperties(properties: Partial<UserProperties>) {
    this.userProperties = {
      ...this.userProperties,
      ...properties
    };
  }

  /**
   * Send batch of events
   */
  private async sendBatch(immediate = false) {
    if (this.events.length === 0) return;

    const batch = [...this.events];
    this.events = [];

    try {
      // In production, send to your analytics endpoint
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     events: batch,
      //     userProperties: this.userProperties
      //   })
      // });

      // For now, just store in localStorage for debugging
      const stored = localStorage.getItem('analytics_events') || '[]';
      const allEvents = JSON.parse(stored);
      allEvents.push(...batch);
      
      // Keep only last 1000 events
      const trimmed = allEvents.slice(-1000);
      localStorage.setItem('analytics_events', JSON.stringify(trimmed));

      console.log(`📤 Analytics batch sent: ${batch.length} events`);
    } catch (error) {
      console.error('❌ Failed to send analytics batch:', error);
      // Re-add events to queue
      this.events.unshift(...batch);
    }
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('analytics_enabled', enabled ? 'true' : 'false');
  }

  /**
   * Check if tracking is enabled
   */
  getEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('analytics_enabled');
    return stored !== 'false';
  }

  /**
   * Clear all stored events
   */
  clear() {
    this.events = [];
    localStorage.removeItem('analytics_events');
  }

  /**
   * Get all stored events (for debugging)
   */
  getEvents(): AnalyticsEvent[] {
    const stored = localStorage.getItem('analytics_events');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    this.sendBatch(true);
  }
}

// Singleton instance
export const analytics = new AnalyticsTracker();

// React hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    generation: analytics.generation,
    interaction: analytics.interaction,
    error: analytics.error,
    performance: analytics.performance,
    conversion: analytics.conversion,
    identify: analytics.identify.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics)
  };
}

// Export types
export type { AnalyticsEvent, EventCategory, UserProperties };
