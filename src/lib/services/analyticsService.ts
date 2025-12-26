// Analytics Service - Track user behavior and generation patterns
// Fixes: Pas d'analytics, pas de recommendations, pas de stats

export interface GenerationEvent {
  userId: string;
  model: string;
  provider: string;
  usedFallback: boolean;
  enhancedPrompt: boolean;
  imageCount: number;
  generationTime: number;
  creditsUsed: number;
  creditType: 'free' | 'paid';
  success: boolean;
  timestamp: string;
  quality: 'standard' | 'premium';
}

export interface UserStats {
  totalGenerations: number;
  successRate: number;
  averageGenerationTime: number;
  mostUsedModel: string;
  totalCreditsUsed: number;
  creditsSaved: number;
  favoriteQuality: 'standard' | 'premium';
  multiImagePercentage: number;
}

class AnalyticsService {
  private events: GenerationEvent[] = [];
  private readonly STORAGE_KEY = 'cortexia_analytics';

  constructor() {
    this.loadEvents();
  }

  /**
   * Load events from localStorage
   */
  private loadEvents() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }

  /**
   * Save events to localStorage
   */
  private saveEvents() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events));
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  }

  /**
   * Track a generation event
   */
  trackGeneration(event: Omit<GenerationEvent, 'timestamp'>) {
    const fullEvent: GenerationEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    this.events.push(fullEvent);
    
    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }

    this.saveEvents();
  }

  /**
   * Get user statistics for a specific user
   */
  getUserStats(userId: string, days: number = 30): UserStats {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const userEvents = this.events.filter(
      e => e.userId === userId && new Date(e.timestamp) > cutoffDate
    );

    if (userEvents.length === 0) {
      return {
        totalGenerations: 0,
        successRate: 0,
        averageGenerationTime: 0,
        mostUsedModel: 'none',
        totalCreditsUsed: 0,
        creditsSaved: 0,
        favoriteQuality: 'standard',
        multiImagePercentage: 0
      };
    }

    const successfulGenerations = userEvents.filter(e => e.success);
    const totalGenerationTime = userEvents.reduce((sum, e) => sum + e.generationTime, 0);
    const totalCredits = userEvents.reduce((sum, e) => sum + e.creditsUsed, 0);
    
    // Calculate most used model
    const modelCounts = userEvents.reduce((acc, e) => {
      acc[e.model] = (acc[e.model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedModel = Object.entries(modelCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'none';

    // Calculate credits saved (free credits used)
    const freeCreditsUsed = userEvents
      .filter(e => e.creditType === 'free')
      .reduce((sum, e) => sum + e.creditsUsed, 0);
    const creditsSaved = freeCreditsUsed * 0.20; // Assume $0.20 per credit

    // Quality preference
    const standardCount = userEvents.filter(e => e.quality === 'standard').length;
    const premiumCount = userEvents.filter(e => e.quality === 'premium').length;
    const favoriteQuality = premiumCount > standardCount ? 'premium' : 'standard';

    // Multi-image usage
    const multiImageCount = userEvents.filter(e => e.imageCount >= 2).length;
    const multiImagePercentage = (multiImageCount / userEvents.length) * 100;

    return {
      totalGenerations: userEvents.length,
      successRate: (successfulGenerations.length / userEvents.length) * 100,
      averageGenerationTime: totalGenerationTime / userEvents.length,
      mostUsedModel,
      totalCreditsUsed: totalCredits,
      creditsSaved,
      favoriteQuality,
      multiImagePercentage
    };
  }

  /**
   * Get personalized recommendations based on usage patterns
   */
  getRecommendations(userId: string): {
    suggestion: string;
    reason: string;
    savings?: string;
  } | null {
    const stats = this.getUserStats(userId);

    if (stats.totalGenerations === 0) {
      return null;
    }

    // Recommendation: Upgrade to paid if heavy multi-image user
    if (stats.multiImagePercentage > 67 && stats.totalGenerations > 10) {
      return {
        suggestion: "You love multi-image fusions! Get 50 Pro credits for $9.99",
        reason: `${Math.round(stats.multiImagePercentage)}% of your generations use 2+ credits`,
        savings: `Save $${(stats.totalCreditsUsed * 0.10).toFixed(2)}/month with Pro credits`
      };
    }

    // Recommendation: Try premium quality
    if (stats.favoriteQuality === 'standard' && stats.totalGenerations > 20) {
      return {
        suggestion: "Try Premium Quality for professional results",
        reason: "You've mastered standard generation - time to level up!",
      };
    }

    // Recommendation: Use free credits
    if (stats.creditsSaved < 1 && stats.totalGenerations > 5) {
      return {
        suggestion: "You're not using your free credits!",
        reason: "Get 25 free credits every month - no payment needed"
      };
    }

    return null;
  }

  /**
   * Clear all analytics data
   */
  clearData() {
    this.events = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const analyticsService = new AnalyticsService();
