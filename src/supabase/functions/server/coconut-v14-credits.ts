import * as kv from './kv_store.tsx';
import type { 
  CreditBalance, 
  CreditTransaction 
} from '../../../lib/types/coconut-v14.ts';

// ============================================
// GET CREDIT BALANCE
// ============================================

export async function getCreditBalance(userId: string): Promise<number> {
  try {
    const key = `coconut-v14:credits:${userId}`;
    const balance = await kv.get<CreditBalance>(key);
    
    if (!balance) {
      // Initialiser avec 0 crédits
      await kv.set(key, {
        userId,
        balance: 0,
        lastUpdated: new Date()
      });
      return 0;
    }
    
    return balance.balance;
  } catch (error) {
    console.error(`❌ Error getting credit balance for ${userId}:`, error);
    return 0;
  }
}

// ============================================
// CHECK CREDITS (SUFFICIENT?)
// ============================================

export async function checkCredits(
  userId: string, 
  required: number
): Promise<boolean> {
  const balance = await getCreditBalance(userId);
  return balance >= required;
}

// ============================================
// ENSURE CREDITS (THROW IF INSUFFICIENT)
// ============================================

export async function ensureCredits(
  userId: string,
  required: number
): Promise<void> {
  const hasCredits = await checkCredits(userId, required);
  
  if (!hasCredits) {
    const balance = await getCreditBalance(userId);
    throw new Error(
      `Insufficient credits. Required: ${required}, Available: ${balance}`
    );
  }
}

// ============================================
// DEDUCT CREDITS
// ============================================

export async function deductCredits(
  userId: string,
  amount: number,
  reason?: string,
  projectId?: string
): Promise<void> {
  try {
    const key = `coconut-v14:credits:${userId}`;
    const current = await kv.get<CreditBalance>(key);
    
    if (!current || current.balance < amount) {
      throw new Error(
        `Insufficient credits. Required: ${amount}, Available: ${current?.balance || 0}`
      );
    }
    
    // Débiter
    const updated: CreditBalance = {
      userId,
      balance: current.balance - amount,
      lastUpdated: new Date()
    };
    
    await kv.set(key, updated);
    
    // Log transaction
    await logTransaction({
      id: crypto.randomUUID(),
      userId,
      amount: -amount,
      type: 'debit',
      reason: reason || 'Coconut usage',
      projectId,
      timestamp: new Date()
    });
    
    console.log(`✅ Debited ${amount} credits from ${userId}. New balance: ${updated.balance}`);
  } catch (error) {
    console.error(`❌ Error deducting credits for ${userId}:`, error);
    throw error;
  }
}

// ============================================
// ADD CREDITS
// ============================================

export async function addCredits(
  userId: string,
  amount: number,
  reason?: string
): Promise<void> {
  try {
    const key = `coconut-v14:credits:${userId}`;
    const current = await kv.get<CreditBalance>(key);
    
    const updated: CreditBalance = {
      userId,
      balance: (current?.balance || 0) + amount,
      lastUpdated: new Date()
    };
    
    await kv.set(key, updated);
    
    // Log transaction
    await logTransaction({
      id: crypto.randomUUID(),
      userId,
      amount: amount,
      type: 'credit',
      reason: reason || 'Credit purchase',
      timestamp: new Date()
    });
    
    console.log(`✅ Added ${amount} credits to ${userId}. New balance: ${updated.balance}`);
  } catch (error) {
    console.error(`❌ Error adding credits for ${userId}:`, error);
    throw error;
  }
}

// ============================================
// REFUND CREDITS
// ============================================

export async function refundCredits(
  userId: string,
  amount: number,
  reason: string,
  projectId?: string
): Promise<void> {
  await addCredits(userId, amount, `Refund: ${reason}`);
  
  console.log(`♻️ Refunded ${amount} credits to ${userId}. Reason: ${reason}`);
}

// ============================================
// LOG TRANSACTION
// ============================================

async function logTransaction(transaction: CreditTransaction): Promise<void> {
  try {
    const key = `coconut-v14:transactions:${transaction.userId}`;
    const existing = await kv.get<CreditTransaction[]>(key) || [];
    
    // Ajouter la nouvelle transaction au début
    existing.unshift(transaction);
    
    // Garder seulement les 100 dernières transactions
    if (existing.length > 100) {
      existing.splice(100);
    }
    
    await kv.set(key, existing);
  } catch (error) {
    console.error(`❌ Error logging transaction:`, error);
    // Ne pas throw - logging ne doit pas bloquer l'opération principale
  }
}

// ============================================
// GET TRANSACTIONS
// ============================================

export async function getTransactions(
  userId: string,
  limit?: number
): Promise<CreditTransaction[]> {
  try {
    const key = `coconut-v14:transactions:${userId}`;
    const transactions = await kv.get<CreditTransaction[]>(key) || [];
    
    if (limit) {
      return transactions.slice(0, limit);
    }
    
    return transactions;
  } catch (error) {
    console.error(`❌ Error getting transactions for ${userId}:`, error);
    return [];
  }
}

// ============================================
// GET RECENT TRANSACTIONS
// ============================================

export async function getRecentTransactions(
  userId: string,
  limit: number = 10
): Promise<CreditTransaction[]> {
  return getTransactions(userId, limit);
}

// ============================================
// GET TRANSACTIONS BY TYPE
// ============================================

export async function getTransactionsByType(
  userId: string,
  type: 'debit' | 'credit'
): Promise<CreditTransaction[]> {
  const allTransactions = await getTransactions(userId);
  return allTransactions.filter(t => t.type === type);
}

// ============================================
// GET TRANSACTIONS BY PROJECT
// ============================================

export async function getTransactionsByProject(
  userId: string,
  projectId: string
): Promise<CreditTransaction[]> {
  const allTransactions = await getTransactions(userId);
  return allTransactions.filter(t => t.projectId === projectId);
}

// ============================================
// GET SPENDING SUMMARY
// ============================================

export async function getSpendingSummary(
  userId: string,
  periodDays?: number
): Promise<{
  totalSpent: number;
  totalAdded: number;
  netChange: number;
  transactionCount: number;
}> {
  const transactions = await getTransactions(userId);
  
  // Filter par période si spécifié
  let filteredTransactions = transactions;
  if (periodDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);
    
    filteredTransactions = transactions.filter(
      t => new Date(t.timestamp) >= cutoffDate
    );
  }
  
  const totalSpent = filteredTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const totalAdded = filteredTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    totalSpent,
    totalAdded,
    netChange: totalAdded - totalSpent,
    transactionCount: filteredTransactions.length
  };
}

// ============================================
// HELPERS
// ============================================

export function formatCredits(amount: number): string {
  return `${amount.toLocaleString()} crédits`;
}

export function formatCreditCost(amount: number): string {
  const usd = amount * 0.10; // 1 crédit = $0.10
  return `${amount} crédits ($${usd.toFixed(2)})`;
}

export function calculateCreditCost(
  resolution: '1K' | '2K',
  includeAnalysis: boolean = true
): number {
  const analysisCost = includeAnalysis ? 100 : 0;
  const generationCost = resolution === '1K' ? 5 : 15;
  return analysisCost + generationCost;
}

// ============================================
// ADMIN FUNCTIONS (FOR TESTING/SUPPORT)
// ============================================

export async function adminSetBalance(
  userId: string,
  newBalance: number,
  reason: string
): Promise<void> {
  const key = `coconut-v14:credits:${userId}`;
  
  await kv.set(key, {
    userId,
    balance: newBalance,
    lastUpdated: new Date()
  });
  
  // Log
  await logTransaction({
    id: crypto.randomUUID(),
    userId,
    amount: newBalance,
    type: 'credit',
    reason: `Admin: ${reason}`,
    timestamp: new Date()
  });
  
  console.log(`⚙️ Admin set balance for ${userId} to ${newBalance}. Reason: ${reason}`);
}

export async function adminViewAllBalances(): Promise<Record<string, number>> {
  // Note: Cette fonction nécessiterait d'itérer sur toutes les clés
  // Ce n'est pas optimal avec KV, mais utile pour debug
  console.warn('⚠️ adminViewAllBalances not implemented - requires key iteration');
  return {};
}
