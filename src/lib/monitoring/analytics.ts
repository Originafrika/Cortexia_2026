/**
 * ANALYTICS - Google Analytics 4 integration
 * 
 * Features:
 * - Page view tracking
 * - Event tracking
 * - User properties
 * - Conversion tracking
 * - E-commerce tracking
 */

import { logger } from './logger';

// ============================================
// TYPES
// ============================================

export interface AnalyticsConfig {
  measurementId: string;
  enableDebug?: boolean;
  anonymizeIp?: boolean;
}

export interface PageViewParams {
  page_title?: string;
  page_location?: string;
  page_path?: string;
}

export interface EventParams {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

export interface UserProperties {
  user_id?: string;
  user_type?: 'free' | 'paid' | 'trial';
  credits_balance?: number;
  [key: string]: any;
}

// ============================================
// ANALYTICS CLASS
// ============================================

class Analytics {
  private isInitialized = false;
  private config: AnalyticsConfig | null = null;
  private queue: Array<() => void> = [];

  /**
   * Initialize Google Analytics
   */
  init(config: AnalyticsConfig): void {
    if (this.isInitialized) {
      logger.warn('Analytics already initialized');
      return;
    }

    this.config = config;

    // Load gtag script
    this.loadGtagScript(config.measurementId);

    // Initialize gtag
    this.gtag('js', new Date());
    this.gtag('config', config.measurementId, {
      anonymize_ip: config.anonymizeIp ?? true,
      debug_mode: config.enableDebug ?? false,
    });

    this.isInitialized = true;

    // Process queued events
    this.queue.forEach((fn) => fn());
    this.queue = [];

    logger.info('Analytics initialized', { measurementId: config.measurementId });
  }

  /**
   * Load Google Analytics script
   */
  private loadGtagScript(measurementId: string): void {
    if (typeof window === 'undefined') return;

    // Check if already loaded
    if ((window as any).gtag) return;

    // Create script tag
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function gtag() {
      (window as any).dataLayer.push(arguments);
    };
  }

  /**
   * Track page view
   */
  pageView(params?: PageViewParams): void {
    const defaultParams: PageViewParams = {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
    };

    this.event('page_view', { ...defaultParams, ...params });
    logger.debug('Page view tracked', { ...defaultParams, ...params });
  }

  /**
   * Track event
   */
  event(eventName: string, params?: EventParams): void {
    if (!this.isInitialized) {
      // Queue event until initialized
      this.queue.push(() => this.event(eventName, params));
      return;
    }

    this.gtag('event', eventName, params);
    logger.debug(`Event tracked: ${eventName}`, params);
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.isInitialized) {
      this.queue.push(() => this.setUserProperties(properties));
      return;
    }

    this.gtag('set', 'user_properties', properties);
    logger.debug('User properties set', properties);
  }

  /**
   * Set user ID
   */
  setUserId(userId: string): void {
    if (!this.isInitialized) {
      this.queue.push(() => this.setUserId(userId));
      return;
    }

    this.gtag('config', this.config!.measurementId, {
      user_id: userId,
    });
    logger.debug('User ID set', { userId });
  }

  /**
   * Track Coconut-specific events
   */
  
  // Campaign events
  trackCampaignCreated(campaignType: string): void {
    this.event('campaign_created', {
      category: 'campaign',
      type: campaignType,
    });
  }

  trackCampaignDeleted(): void {
    this.event('campaign_deleted', {
      category: 'campaign',
    });
  }

  // Generation events
  trackGenerationStarted(nodeType: string, provider: string): void {
    this.event('generation_started', {
      category: 'generation',
      node_type: nodeType,
      provider,
    });
  }

  trackGenerationCompleted(
    nodeType: string,
    provider: string,
    duration: number,
    creditsUsed: number
  ): void {
    this.event('generation_completed', {
      category: 'generation',
      node_type: nodeType,
      provider,
      duration,
      credits_used: creditsUsed,
      value: creditsUsed, // For conversion value
    });
  }

  trackGenerationFailed(nodeType: string, provider: string, error: string): void {
    this.event('generation_failed', {
      category: 'generation',
      node_type: nodeType,
      provider,
      error,
    });
  }

  // Credit events
  trackCreditsUsed(amount: number, type: 'free' | 'paid'): void {
    this.event('credits_used', {
      category: 'credits',
      amount,
      type,
    });
  }

  trackCreditsPurchased(amount: number, price: number): void {
    this.event('purchase', {
      transaction_id: `credits_${Date.now()}`,
      value: price,
      currency: 'USD',
      items: [
        {
          item_id: 'paid_credits',
          item_name: 'Paid Credits',
          quantity: amount,
          price,
        },
      ],
    });
  }

  // User journey events
  trackSignup(method: string): void {
    this.event('sign_up', {
      method,
    });
  }

  trackLogin(method: string): void {
    this.event('login', {
      method,
    });
  }

  trackOnboardingStarted(): void {
    this.event('onboarding_started', {
      category: 'onboarding',
    });
  }

  trackOnboardingCompleted(duration: number): void {
    this.event('onboarding_completed', {
      category: 'onboarding',
      duration,
    });
  }

  trackOnboardingSkipped(): void {
    this.event('onboarding_skipped', {
      category: 'onboarding',
    });
  }

  // Feature usage
  trackFeatureUsed(feature: string): void {
    this.event('feature_used', {
      category: 'feature',
      feature_name: feature,
    });
  }

  // Export events
  trackExport(format: string, nodeCount: number): void {
    this.event('export', {
      category: 'export',
      format,
      node_count: nodeCount,
    });
  }

  // Error events
  trackError(errorType: string, errorMessage: string): void {
    this.event('error', {
      category: 'error',
      error_type: errorType,
      error_message: errorMessage,
      fatal: false,
    });
  }

  /**
   * Call gtag function
   */
  private gtag(...args: any[]): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag(...args);
    }
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const analytics = new Analytics();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export const initAnalytics = (config: AnalyticsConfig) => analytics.init(config);

export const trackPageView = (params?: PageViewParams) => analytics.pageView(params);

export const trackEvent = (eventName: string, params?: EventParams) =>
  analytics.event(eventName, params);

export const setUserProperties = (properties: UserProperties) =>
  analytics.setUserProperties(properties);

export const setUserId = (userId: string) => analytics.setUserId(userId);

// ============================================
// REACT HOOKS
// ============================================

/**
 * Hook for tracking page views on route change
 */
export function usePageViewTracking() {
  React.useEffect(() => {
    analytics.pageView();
  }, []);
}

/**
 * Hook for tracking events
 */
export function useAnalytics() {
  return {
    trackEvent: (eventName: string, params?: EventParams) =>
      analytics.event(eventName, params),
    
    trackCampaignCreated: (campaignType: string) =>
      analytics.trackCampaignCreated(campaignType),
    
    trackGenerationStarted: (nodeType: string, provider: string) =>
      analytics.trackGenerationStarted(nodeType, provider),
    
    trackGenerationCompleted: (
      nodeType: string,
      provider: string,
      duration: number,
      creditsUsed: number
    ) => analytics.trackGenerationCompleted(nodeType, provider, duration, creditsUsed),
    
    trackFeatureUsed: (feature: string) => analytics.trackFeatureUsed(feature),
  };
}

// Fix React import
import React from 'react';
