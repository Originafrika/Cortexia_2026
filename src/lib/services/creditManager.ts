/**
 * Service de gestion des crédits
 * Gère le système dual (free + paid) avec priorité aux crédits payants
 */

import type { CreditBalance, CreditTransaction, ModelName } from '../types/studio';
// MVP: Mock storage au lieu de KV store
// import * as kv from '../../supabase/functions/server/kv_store';

// ============================================================================
// CONSTANTS
// ============================================================================

const FREE_CREDITS_PER_MONTH = 25;
const CREDIT_PRICE_USD = 0.10; // $0.10 par crédit

// MVP: Mock storage in memory (à remplacer par KV store en prod)
const mockStorage = new Map<string, any>();

// ============================================================================
// CREDIT BALANCE
// ============================================================================

/**
 * Récupère le solde actuel de l'utilisateur
 */
export async function getBalance(userId: string): Promise<CreditBalance> {
  try {
    const data = mockStorage.get(`credits:${userId}`);
    
    if (!data) {
      // Initialiser avec 25 crédits gratuits
      const initialBalance: CreditBalance = {
        free: FREE_CREDITS_PER_MONTH,
        paid: 0,
        total: FREE_CREDITS_PER_MONTH,
        canUseFree: true
      };
      mockStorage.set(`credits:${userId}`, initialBalance);
      return initialBalance;
    }

    const balance = data as CreditBalance;
    balance.total = balance.free + balance.paid;
    balance.canUseFree = balance.paid === 0;

    return balance;
  } catch (error) {
    console.error('Error getting credit balance:', error);
    // Retourner balance par défaut en cas d'erreur
    return {
      free: FREE_CREDITS_PER_MONTH,
      paid: 0,
      total: FREE_CREDITS_PER_MONTH,
      canUseFree: true
    };
  }
}

/**
 * Met à jour le solde de l'utilisateur
 */
async function updateBalance(
  userId: string,
  balance: CreditBalance
): Promise<void> {
  balance.total = balance.free + balance.paid;
  balance.canUseFree = balance.paid === 0;
  mockStorage.set(`credits:${userId}`, balance);
}

/**
 * Vérifie si l'utilisateur peut se permettre une génération
 */
export async function canAfford(
  userId: string,
  cost: number
): Promise<boolean> {
  const balance = await getBalance(userId);
  return balance.total >= cost;
}

// ============================================================================
// DEDUCT CREDITS
// ============================================================================

/**
 * Déduit des crédits pour une génération
 * RÈGLE: Paid credits consommés EN PREMIER
 */
export async function deductCredits(
  userId: string,
  cost: number,
  model: ModelName,
  generationId: string
): Promise<{ success: boolean; balance: CreditBalance; error?: string }> {
  try {
    const balance = await getBalance(userId);

    // Vérifier si suffisant
    if (balance.total < cost) {
      return {
        success: false,
        balance,
        error: `Insufficient credits. Need ${cost}, have ${balance.total}`
      };
    }

    // Sauvegarder l'état avant
    const balanceBefore = { ...balance };

    // PRIORITÉ: Consommer paid credits en premier
    let remainingCost = cost;
    let creditType: 'paid' | 'free' = 'paid';

    if (balance.paid >= remainingCost) {
      // Tous les crédits viennent de paid
      balance.paid -= remainingCost;
      creditType = 'paid';
    } else if (balance.paid > 0) {
      // Utiliser tout le paid, puis le free
      remainingCost -= balance.paid;
      balance.paid = 0;
      balance.free -= remainingCost;
      creditType = 'paid'; // On considère que ça vient du paid car utilisé en priorité
    } else {
      // Uniquement free credits
      balance.free -= remainingCost;
      creditType = 'free';
    }

    // Mettre à jour le solde
    await updateBalance(userId, balance);

    // Enregistrer la transaction
    const transaction: CreditTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'deduction',
      amount: cost,
      creditType,
      balanceBefore,
      balanceAfter: balance,
      timestamp: new Date(),
      metadata: {
        model,
        generationId
      }
    };

    await recordTransaction(userId, transaction);

    return { success: true, balance };
  } catch (error) {
    console.error('Error deducting credits:', error);
    return {
      success: false,
      balance: await getBalance(userId),
      error: 'Failed to deduct credits'
    };
  }
}

/**
 * Rembourse des crédits (en cas d'erreur de génération)
 */
export async function refundCredits(
  userId: string,
  amount: number,
  originalCreditType: 'paid' | 'free',
  reason: string
): Promise<{ success: boolean; balance: CreditBalance }> {
  try {
    const balance = await getBalance(userId);
    const balanceBefore = { ...balance };

    // Rembourser dans le type original
    if (originalCreditType === 'paid') {
      balance.paid += amount;
    } else {
      balance.free += amount;
      // Ne pas dépasser la limite mensuelle
      balance.free = Math.min(balance.free, FREE_CREDITS_PER_MONTH);
    }

    await updateBalance(userId, balance);

    // Enregistrer la transaction
    const transaction: CreditTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'refund',
      amount,
      creditType: originalCreditType,
      balanceBefore,
      balanceAfter: balance,
      timestamp: new Date(),
      metadata: { reason }
    };

    await recordTransaction(userId, transaction);

    return { success: true, balance };
  } catch (error) {
    console.error('Error refunding credits:', error);
    return {
      success: false,
      balance: await getBalance(userId)
    };
  }
}

// ============================================================================
// PURCHASE CREDITS
// ============================================================================

/**
 * Ajoute des crédits payants (après paiement)
 */
export async function addPaidCredits(
  userId: string,
  amount: number
): Promise<{ success: boolean; balance: CreditBalance }> {
  try {
    const balance = await getBalance(userId);
    const balanceBefore = { ...balance };

    balance.paid += amount;

    await updateBalance(userId, balance);

    // Enregistrer la transaction
    const transaction: CreditTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'purchase',
      amount,
      creditType: 'paid',
      balanceBefore,
      balanceAfter: balance,
      timestamp: new Date()
    };

    await recordTransaction(userId, transaction);

    return { success: true, balance };
  } catch (error) {
    console.error('Error adding paid credits:', error);
    return {
      success: false,
      balance: await getBalance(userId)
    };
  }
}

/**
 * Calcule le prix pour un nombre de crédits
 */
export function calculatePrice(credits: number): number {
  return credits * CREDIT_PRICE_USD;
}

// ============================================================================
// MONTHLY RESET
// ============================================================================

/**
 * Réinitialise les crédits gratuits mensuels
 * À appeler au début de chaque mois
 */
export async function resetMonthlyCredits(userId: string): Promise<void> {
  try {
    const balance = await getBalance(userId);
    const balanceBefore = { ...balance };

    // Reset free credits à 25
    balance.free = FREE_CREDITS_PER_MONTH;

    await updateBalance(userId, balance);

    // Enregistrer la transaction
    const transaction: CreditTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'monthly_reset',
      amount: FREE_CREDITS_PER_MONTH,
      creditType: 'free',
      balanceBefore,
      balanceAfter: balance,
      timestamp: new Date()
    };

    await recordTransaction(userId, transaction);
  } catch (error) {
    console.error('Error resetting monthly credits:', error);
  }
}

/**
 * Vérifie si un reset mensuel est nécessaire
 */
export async function checkMonthlyReset(userId: string): Promise<void> {
  try {
    const lastResetKey = `credits:${userId}:last_reset`;
    const lastReset = mockStorage.get(lastResetKey);

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;

    if (!lastReset || lastReset !== currentMonth) {
      await resetMonthlyCredits(userId);
      mockStorage.set(lastResetKey, currentMonth);
    }
  } catch (error) {
    console.error('Error checking monthly reset:', error);
  }
}

// ============================================================================
// TRANSACTIONS HISTORY
// ============================================================================

/**
 * Enregistre une transaction
 */
async function recordTransaction(
  userId: string,
  transaction: CreditTransaction
): Promise<void> {
  try {
    const key = `credits:${userId}:transactions:${transaction.id}`;
    mockStorage.set(key, transaction);
  } catch (error) {
    console.error('Error recording transaction:', error);
  }
}

/**
 * Récupère l'historique des transactions
 */
export async function getTransactionHistory(
  userId: string,
  limit = 50
): Promise<CreditTransaction[]> {
  try {
    const prefix = `credits:${userId}:transactions:`;
    const transactions: CreditTransaction[] = [];
    
    // MVP: Itérer sur le mock storage
    for (const [key, value] of mockStorage.entries()) {
      if (key.startsWith(prefix)) {
        transactions.push(value as CreditTransaction);
      }
    }
    
    // Trier par date décroissante
    const sorted = transactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return sorted;
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return [];
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Formate un solde de crédits pour affichage
 */
export function formatBalance(balance: CreditBalance): string {
  if (balance.paid > 0) {
    return `${balance.paid} paid • ${balance.free} free`;
  }
  return `${balance.free} free`;
}

/**
 * Obtient le type de crédit qui sera utilisé
 */
export function getNextCreditType(balance: CreditBalance): 'paid' | 'free' {
  return balance.paid > 0 ? 'paid' : 'free';
}