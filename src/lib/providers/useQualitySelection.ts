// useQualitySelection - Simplified model selection logic
// Auto-selects best model based on context, hides provider complexity

import { useMemo } from 'react';
import type { CreditType } from '../contexts/CreditsContext';

export type QualityTier = 'standard' | 'premium';

export interface QualitySelection {
  tier: QualityTier;
  model: string;
  provider: 'pollinations' | 'together' | 'replicate';
  cost: number;
  creditType: CreditType;
  reason: string;
}

interface UseQualitySelectionParams {
  type: 'text-to-image' | 'image-to-image';
  imageCount?: number; // Number of reference images (for image-to-image)
  userHasPaidCredits?: boolean; // Does user have paid credits available
  forceQuality?: QualityTier; // Manual override
}

export function useQualitySelection({
  type,
  imageCount = 0,
  userHasPaidCredits = false,
  forceQuality
}: UseQualitySelectionParams): QualitySelection {
  
  return useMemo(() => {
    // Manual override
    if (forceQuality === 'premium') {
      if (!userHasPaidCredits) {
        // User wants premium but has no paid credits - show upgrade prompt
        return {
          tier: 'premium',
          model: 'flux-2-pro',
          provider: 'replicate',
          cost: 3,
          creditType: 'paid',
          reason: 'Premium quality requires paid credits'
        };
      }
      
      // Use flux-2-pro for premium (we can add imagen-4 logic later)
      return {
        tier: 'premium',
        model: 'flux-2-pro',
        provider: 'replicate',
        cost: 3,
        creditType: 'paid',
        reason: 'Premium quality selected'
      };
    }

    // AUTO-SELECTION (Standard tier)
    
    if (type === 'text-to-image') {
      // Text-to-image → flux (Together AI)
      return {
        tier: 'standard',
        model: 'flux',
        provider: 'together',
        cost: 1,
        creditType: 'free',
        reason: 'Fast text-to-image generation'
      };
    }

    // Image-to-image → Auto-select based on image count
    if (type === 'image-to-image') {
      if (imageCount === 1) {
        // 1 image → kontext (Pollinations)
        return {
          tier: 'standard',
          model: 'kontext',
          provider: 'pollinations',
          cost: 1,
          creditType: 'free',
          reason: 'Single image transformation'
        };
      } else if (imageCount >= 2 && imageCount <= 3) {
        // 2-3 images → nanobanana (Pollinations)
        return {
          tier: 'standard',
          model: 'nanobanana',
          provider: 'pollinations',
          cost: 1,
          creditType: 'free',
          reason: 'Multi-image blend (2-3 images)'
        };
      } else if (imageCount >= 4) {
        // 4-10 images → seedream (Pollinations)
        return {
          tier: 'standard',
          model: 'seedream',
          provider: 'pollinations',
          cost: 1,
          creditType: 'free',
          reason: 'Advanced multi-image blend (4-10 images)'
        };
      }
    }

    // Fallback to flux
    return {
      tier: 'standard',
      model: 'flux',
      provider: 'together',
      cost: 1,
      creditType: 'free',
      reason: 'Default text-to-image'
    };
  }, [type, imageCount, userHasPaidCredits, forceQuality]);
}
