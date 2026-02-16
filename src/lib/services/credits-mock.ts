/**
 * Mock Credits Service
 * Service de crédits local pour l'environnement de développement Figma Make
 */

export interface UserCredits {
  free: number;
  paid: number;
  lastReset?: string;
  isEnterprise?: boolean;
  monthlyCredits?: number;
  monthlyCreditsRemaining?: number;
  addOnCredits?: number;
  nextResetDate?: string;
}

const STORAGE_KEY = 'cortexia_credits_mock';

// Crédits par défaut pour différents profils
const DEFAULT_CREDITS: Record<string, UserCredits> = {
  'demo-user': {
    free: 50,
    paid: 100,
    lastReset: new Date().toISOString(),
  },
  'enterprise-demo': {
    free: 0,
    paid: 0,
    isEnterprise: true,
    monthlyCredits: 10000,
    monthlyCreditsRemaining: 8500,
    addOnCredits: 5000,
    nextResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

/**
 * Charge les crédits depuis le localStorage ou utilise les valeurs par défaut
 */
function loadCredits(userId: string): UserCredits {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load credits from localStorage:', error);
  }

  // Retourne les crédits par défaut
  return DEFAULT_CREDITS[userId] || DEFAULT_CREDITS['demo-user'];
}

/**
 * Sauvegarde les crédits dans le localStorage
 */
function saveCredits(userId: string, credits: UserCredits): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(credits));
  } catch (error) {
    console.warn('Failed to save credits to localStorage:', error);
  }
}

/**
 * Get user credits (Mock)
 */
export async function getUserCredits(
  userId: string
): Promise<{ success: boolean; credits?: UserCredits; daysUntilReset?: number; error?: string }> {
  // Simule un délai réseau
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log(`📊 [MOCK] Getting credits for user: ${userId}`);

  const credits = loadCredits(userId);

  // Calcule les jours avant le reset
  let daysUntilReset = 30;
  if (credits.isEnterprise && credits.nextResetDate) {
    const now = new Date();
    const resetDate = new Date(credits.nextResetDate);
    daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  console.log(`✅ [MOCK] Credits loaded:`, credits);

  return {
    success: true,
    credits,
    daysUntilReset,
  };
}

/**
 * Add paid credits to user (Mock)
 */
export async function addPaidCredits(
  userId: string,
  amount: number
): Promise<{ success: boolean; credits?: UserCredits; daysUntilReset?: number; error?: string }> {
  // Simule un délai réseau
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log(`💰 [MOCK] Adding ${amount} paid credits to user: ${userId}`);

  const credits = loadCredits(userId);
  credits.paid += amount;

  saveCredits(userId, credits);

  console.log(`✅ [MOCK] Credits updated:`, credits);

  return {
    success: true,
    credits,
    daysUntilReset: 30,
  };
}

/**
 * Deduct credits from user (Mock)
 */
export async function deductCredits(
  userId: string,
  amount: number,
  type: 'free' | 'paid' = 'paid'
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  // Simule un délai réseau
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log(`💳 [MOCK] Deducting ${amount} ${type} credits from user: ${userId}`);

  const credits = loadCredits(userId);

  if (type === 'paid') {
    if (credits.paid < amount) {
      return {
        success: false,
        error: 'Insufficient paid credits',
      };
    }
    credits.paid -= amount;
  } else {
    if (credits.free < amount) {
      return {
        success: false,
        error: 'Insufficient free credits',
      };
    }
    credits.free -= amount;
  }

  saveCredits(userId, credits);

  console.log(`✅ [MOCK] Credits deducted. New balance:`, credits);

  return {
    success: true,
    newBalance: credits.paid + credits.free,
  };
}

/**
 * Reset all credits to default (for testing)
 */
export function resetMockCredits(userId: string): void {
  console.log(`🔄 [MOCK] Resetting credits for user: ${userId}`);
  localStorage.removeItem(`${STORAGE_KEY}_${userId}`);
}
