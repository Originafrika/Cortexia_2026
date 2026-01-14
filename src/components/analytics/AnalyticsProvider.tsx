/**
 * ANALYTICS PROVIDER - Analytics context wrapper
 * 
 * Wraps the app and provides analytics functionality
 * Automatically tracks page views and performance metrics
 */

import React, { useEffect } from 'react';
import { analytics } from '../../lib/analytics/tracker';

interface AnalyticsProviderProps {
  children: React.ReactNode;
  userId?: string;
  userProperties?: Record<string, any>;
}

export function AnalyticsProvider({
  children,
  userId,
  userProperties
}: AnalyticsProviderProps) {
  // Identify user
  useEffect(() => {
    if (userId) {
      analytics.identify(userId, userProperties);
    }
  }, [userId, userProperties]);

  // Track page load performance
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track page load time
    window.addEventListener('load', () => {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        analytics.performance.pageLoad(loadTime);
      }
    });

    // Track Core Web Vitals
    if ('web-vital' in window) {
      // CLS, FID, LCP tracking would go here
      // Requires web-vitals library
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      analytics.destroy();
    };
  }, []);

  return <>{children}</>;
}

/**
 * Privacy banner for analytics consent
 */
interface PrivacyBannerProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function AnalyticsPrivacyBanner({ onAccept, onDecline }: PrivacyBannerProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('analytics_consent');
    if (consent === null) {
      setIsVisible(true);
    } else {
      analytics.setEnabled(consent === 'true');
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('analytics_consent', 'true');
    analytics.setEnabled(true);
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('analytics_consent', 'false');
    analytics.setEnabled(false);
    setIsVisible(false);
    onDecline();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 shadow-2xl">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1">
            Cookies & Analytics
          </h3>
          <p className="text-sm text-slate-300">
            Nous utilisons des cookies pour améliorer votre expérience et analyser l'utilisation de notre plateforme. 
            Vos données restent anonymes et ne sont jamais partagées avec des tiers.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-medium transition-all shadow-lg"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Analytics dashboard component (for debugging)
 */
export function AnalyticsDashboard() {
  const [events, setEvents] = React.useState<any[]>([]);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    if (isVisible) {
      const storedEvents = analytics.getEvents();
      setEvents(storedEvents.slice(-50)); // Show last 50 events
    }
  }, [isVisible]);

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-[9998] p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-xl transition-colors"
        title="Analytics Dashboard"
      >
        📊
      </button>

      {/* Dashboard modal */}
      {isVisible && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                📊 Analytics Dashboard
              </h2>
              <button
                onClick={() => setIsVisible(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Stats */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-purple-600">{events.length}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {events.filter(e => e.category === 'generation').length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Generations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {events.filter(e => e.category === 'error').length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Errors</div>
              </div>
            </div>

            {/* Events list */}
            <div className="p-4 overflow-auto max-h-96">
              <div className="space-y-2">
                {events.reverse().map((event, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {event.category} → {event.action}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {event.label && (
                      <div className="text-slate-600 dark:text-slate-400">
                        {event.label}
                      </div>
                    )}
                    {event.metadata && (
                      <pre className="text-xs text-slate-500 mt-1 overflow-auto">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
              <button
                onClick={() => {
                  analytics.clear();
                  setEvents([]);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                Clear All Events
              </button>
              <button
                onClick={() => setEvents(analytics.getEvents().slice(-50))}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
