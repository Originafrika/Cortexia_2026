// Mock Generation Service - For UI testing without backend
// Simulates API calls with realistic delays and responses

import type { 
  GenerationParams, 
  ModelConfig, 
  UserCredits,
  ProviderStatus 
} from './types';
import { getTimeUntilPollinationsReset } from './credits';

/**
 * Mock provider status (simulates rate limiting)
 */
export async function getMockProviderStatuses(): Promise<ProviderStatus[]> {
  // Simulate 30% chance Pollinations is rate limited
  const pollinationsRateLimited = Math.random() < 0.3;
  
  const resetTime = new Date();
  resetTime.setUTCHours(24, 0, 0, 0); // Next midnight UTC
  
  return [
    {
      provider: 'pollinations',
      available: !pollinationsRateLimited,
      rateLimited: pollinationsRateLimited,
      resetTime: pollinationsRateLimited ? resetTime : undefined,
      remaining: pollinationsRateLimited ? 0 : 1000,
      limit: 10000,
      message: pollinationsRateLimited 
        ? 'Daily rate limit reached. Resets at midnight UTC.' 
        : 'Available'
    },
    {
      provider: 'together',
      available: true,
      rateLimited: false,
      remaining: 500,
      limit: 600,
      message: 'Available (600 RPM)'
    },
    {
      provider: 'replicate',
      available: true,
      rateLimited: false,
      message: 'Available (unlimited)'
    }
  ];
}

/**
 * Mock generation (simulates API call)
 */
export async function mockGenerate(
  params: GenerationParams,
  model: ModelConfig,
  credits: UserCredits
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
  cost: number;
  newBalance: UserCredits;
}> {
  
  // Simulate network delay based on model speed
  const delay = {
    5: 2000,  // Ultra-fast: 2s
    4: 4000,  // Fast: 4s
    3: 6000,  // Medium: 6s
    2: 10000, // Slow: 10s
    1: 15000  // Very slow: 15s
  }[model.speedRating] || 5000;
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Calculate cost
  let cost = model.costPerGeneration;
  if (params.referenceImages) {
    cost += params.referenceImages.length * model.costPerReferenceImage;
  }
  if (params.isEnhancement) {
    cost += model.enhancementBonus;
  }
  if (params.type === 'video' && params.duration) {
    cost += params.duration;
  }
  
  // Check if user can afford
  if (credits.total < cost) {
    return {
      success: false,
      error: `Insufficient credits. Need ${cost}, have ${credits.total}`,
      cost,
      newBalance: credits
    };
  }
  
  // Deduct credits (paid first)
  let paidUsed = Math.min(credits.paid, cost);
  let freeUsed = cost - paidUsed;
  
  const newBalance: UserCredits = {
    paid: credits.paid - paidUsed,
    free: credits.free - freeUsed,
    total: (credits.paid - paidUsed) + (credits.free - freeUsed)
  };
  
  // Simulate 5% failure rate for realism
  if (Math.random() < 0.05) {
    return {
      success: false,
      error: 'Generation failed. Please try again.',
      cost: 0, // Don't charge on failure
      newBalance: credits // Return original balance
    };
  }
  
  // Success - return mock image URL
  const mockUrls = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1024',
    'https://images.unsplash.com/photo-1618004652321-13a63e576b80?w=1024',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1024',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1024'
  ];
  
  const randomUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];
  
  return {
    success: true,
    url: randomUrl,
    cost,
    newBalance
  };
}

/**
 * Mock credit purchase
 */
export async function mockPurchaseCredits(
  amount: number,
  currentCredits: UserCredits
): Promise<{
  success: boolean;
  newBalance: UserCredits;
  error?: string;
}> {
  
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate 2% payment failure rate
  if (Math.random() < 0.02) {
    return {
      success: false,
      newBalance: currentCredits,
      error: 'Payment failed. Please try again or use a different payment method.'
    };
  }
  
  // Success - add paid credits
  const newBalance: UserCredits = {
    paid: currentCredits.paid + amount,
    free: currentCredits.free,
    total: currentCredits.paid + amount + currentCredits.free
  };
  
  return {
    success: true,
    newBalance
  };
}

/**
 * Mock monthly credit reset
 */
export function mockMonthlyReset(currentCredits: UserCredits): UserCredits {
  return {
    paid: currentCredits.paid, // Paid credits never expire
    free: 25, // Reset to 25 free credits
    total: currentCredits.paid + 25
  };
}

/**
 * Get mock user credits (for testing)
 */
export function getMockUserCredits(scenario: 'new' | 'low' | 'paid' | 'rich'): UserCredits {
  switch (scenario) {
    case 'new':
      return { paid: 0, free: 25, total: 25 };
    
    case 'low':
      return { paid: 0, free: 3, total: 3 };
    
    case 'paid':
      return { paid: 50, free: 10, total: 60 };
    
    case 'rich':
      return { paid: 500, free: 25, total: 525 };
    
    default:
      return { paid: 0, free: 25, total: 25 };
  }
}
