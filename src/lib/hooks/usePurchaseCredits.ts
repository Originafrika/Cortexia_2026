/**
 * usePurchaseCredits - Hook for purchasing credits via Stripe
 * Handles checkout session creation and redirects to Stripe
 */

import { useState } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';

interface PurchaseResult {
  success: boolean;
  error?: string;
  testMode?: boolean;
  credits?: number;
}

export function usePurchaseCredits() {
  const [loading, setLoading] = useState(false);

  /**
   * Purchase credits for a specific package
   * @param userId - User ID
   * @param packageId - Package ID (0-3)
   * @returns Promise with success/error
   */
  const purchaseCredits = async (
    userId: string,
    packageId: number
  ): Promise<PurchaseResult> => {
    setLoading(true);

    try {
      console.log(`🛒 Starting purchase for user ${userId}, package ${packageId}`);

      // Call backend to create Stripe checkout session
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/checkout/create-session`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId, packageId })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.testMode) {
        // ✅ TEST MODE: Credits added instantly (no Stripe)
        console.log('✅ TEST MODE: Credits added instantly');
        toast.success(`Test mode: ${data.credits} credits added instantly!`);
        
        // Refresh page after 1 second to show new credits
        setTimeout(() => {
          window.location.reload();
        }, 1000);

        return {
          success: true,
          testMode: true,
          credits: data.credits
        };
      }

      if (!data.url) {
        throw new Error('No checkout URL returned');
      }

      console.log('✅ Checkout session created, redirecting to Stripe...');

      // Redirect to Stripe checkout
      window.location.href = data.url;

      return {
        success: true
      };

    } catch (error) {
      console.error('❌ Purchase error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to start purchase process';

      toast.error(errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    purchaseCredits,
    loading
  };
}
