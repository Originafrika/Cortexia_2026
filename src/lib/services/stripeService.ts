// Stripe Service - Enterprise subscription ($900/mois) and credit packs
import { loadStripe, Stripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const API_URL = import.meta.env.VITE_API_URL || '';

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY || '');
  }
  return stripePromise;
};

export interface CheckoutResult {
  success: boolean;
  sessionId?: string;
  error?: string;
}

export interface CreditPackOption {
  type: 'PACK_1000' | 'PACK_5000' | 'PACK_10000';
  credits: number;
  priceEUR: number;
  discount: number;
}

export const ENTERPRISE_CREDIT_PACKS: CreditPackOption[] = [
  { type: 'PACK_1000', credits: 1000, priceEUR: 90, discount: 0.10 },
  { type: 'PACK_5000', credits: 5000, priceEUR: 425, discount: 0.15 },
  { type: 'PACK_10000', credits: 10000, priceEUR: 800, discount: 0.20 },
];

class StripeService {
  /**
   * Start Enterprise subscription checkout ($900/mois)
   * Returns checkout session URL
   */
  async startEnterpriseSubscription(): Promise<CheckoutResult> {
    try {
      const response = await fetch(`${API_URL}/api/stripe/checkout/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
        return { success: true, sessionId };
      }

      // Or use Stripe.js redirect
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw new Error(error.message);
      }

      return { success: true, sessionId };
    } catch (error) {
      console.error('Stripe subscription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Subscription failed',
      };
    }
  }

  /**
   * Purchase credit pack (requires active subscription)
   */
  async purchaseCreditPack(packType: CreditPackOption['type']): Promise<CheckoutResult> {
    try {
      const pack = ENTERPRISE_CREDIT_PACKS.find(p => p.type === packType);
      if (!pack) {
        throw new Error('Invalid pack type');
      }

      const response = await fetch(`${API_URL}/api/stripe/checkout/credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          packType,
          credits: pack.credits,
          priceEUR: pack.priceEUR,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
        return { success: true, sessionId };
      }

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw new Error(error.message);
      }

      return { success: true, sessionId };
    } catch (error) {
      console.error('Stripe credit pack error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Purchase failed',
      };
    }
  }

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(): Promise<{
    success: boolean;
    subscription?: {
      status: 'active' | 'canceled' | 'past_due' | 'unpaid';
      plan: string;
      currentPeriodEnd: string;
      creditsRemaining: number;
      creditsConsumed: number;
    };
    error?: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/api/stripe/subscription`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch subscription');
      }

      const data = await response.json();
      return { success: true, subscription: data };
    } catch (error) {
      console.error('Stripe status error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch status',
      };
    }
  }

  /**
   * Cancel subscription at period end
   */
  async cancelSubscription(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/stripe/subscription/cancel`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }

      return { success: true };
    } catch (error) {
      console.error('Stripe cancel error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Cancellation failed',
      };
    }
  }

  /**
   * Resume canceled subscription
   */
  async resumeSubscription(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/stripe/subscription/resume`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to resume subscription');
      }

      return { success: true };
    } catch (error) {
      console.error('Stripe resume error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Resume failed',
      };
    }
  }

  /**
   * Get billing portal URL for invoices/payment methods
   */
  async getBillingPortalUrl(): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/stripe/billing-portal`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create portal session');
      }

      const { url } = await response.json();
      return { success: true, url };
    } catch (error) {
      console.error('Stripe portal error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to open portal',
      };
    }
  }

  /**
   * Format price for display
   */
  formatPrice(euroCents: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(euroCents / 100);
  }

  /**
   * Calculate pack savings
   */
  calculateSavings(pack: CreditPackOption): number {
    const basePrice = pack.credits * 0.10; // €0.10 per credit base
    return Math.round((basePrice - pack.priceEUR) * 100) / 100;
  }
}

export const stripeService = new StripeService();
