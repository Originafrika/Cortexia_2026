/**
 * API CLIENT - COCONUT V14
 * Helper functions for making API calls
 * 
 * Fix #11: Added retry logic with exponential backoff
 * Fix #9: Using centralized types from lib/types/coconut.ts
 * Fix #32: Using constants instead of magic numbers
 */

import { projectId, publicAnonKey } from '../../utils/supabase/info';
import type {
  DashboardStats,
  Generation,
  GenerationRequest,
  PaginationInfo,
  Transaction,
  UserSettings,
  UsageAnalytics,
  CocoBoard,
  Pricing,
} from '../types/coconut';
import { COCONUT_CONSTANTS } from '../types/coconut';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

// ============================================
// CONSTANTS
// ============================================

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds

// ============================================
// ERROR HANDLING
// ============================================

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// User-friendly error messages (Fix #24)
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'You need to be logged in to perform this action.',
  402: 'Insufficient credits. Please purchase more credits.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  429: 'Too many requests. Please slow down and try again.',
  500: 'Server error. Please try again later.',
  502: 'Service temporarily unavailable. Please try again.',
  503: 'Service temporarily unavailable. Please try again.',
  504: 'Request timeout. Please try again.',
};

function getUserFriendlyError(status: number, originalMessage: string): string {
  return ERROR_MESSAGES[status] || originalMessage;
}

// ============================================
// RETRY LOGIC
// ============================================

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shouldRetry(status: number): boolean {
  // Retry on network errors and server errors, but not client errors
  return status >= 500 || status === 429 || status === 0;
}

function getRetryDelay(attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s
  const delay = Math.min(
    INITIAL_RETRY_DELAY * Math.pow(2, attempt),
    MAX_RETRY_DELAY
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

// ============================================
// FETCH WRAPPER WITH RETRY
// ============================================

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  attempt: number = 0,
  skipRetries: boolean = false // NEW: Skip retries for demo mode
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const userMessage = getUserFriendlyError(response.status, data.error || `HTTP ${response.status}`);
      
      throw new ApiError(
        userMessage,
        response.status,
        data
      );
    }

    return data;

  } catch (error) {
    // NEW: Skip retries if in demo mode
    if (skipRetries) {
      throw new ApiError(
        'Demo mode: API unavailable',
        0,
        { originalError: error }
      );
    }

    if (error instanceof ApiError) {
      // Check if we should retry
      if (shouldRetry(error.status) && attempt < MAX_RETRIES) {
        const delay = getRetryDelay(attempt);
        console.log(`⏳ Retrying request (attempt ${attempt + 1}/${MAX_RETRIES}) after ${delay}ms...`);
        await sleep(delay);
        return apiFetch<T>(endpoint, options, attempt + 1, skipRetries);
      }
      throw error;
    }

    // Network error or other exception
    if (attempt < MAX_RETRIES) {
      const delay = getRetryDelay(attempt);
      console.log(`⏳ Network error, retrying (attempt ${attempt + 1}/${MAX_RETRIES}) after ${delay}ms...`);
      await sleep(delay);
      return apiFetch<T>(endpoint, options, attempt + 1, skipRetries);
    }

    throw new ApiError(
      'Network error. Please check your connection.',
      0,
      { originalError: error }
    );
  }
}

// ============================================
// DASHBOARD API
// ============================================

export async function fetchDashboardStats(skipRetries: boolean = false): Promise<DashboardStats> {
  const response = await apiFetch<{ stats: DashboardStats }>(
    '/coconut/stats',
    {},
    0,
    skipRetries
  );
  return response.stats;
}

// ============================================
// GENERATION HISTORY API
// ============================================

export interface GenerationHistoryResponse {
  generations: Generation[];
  pagination: PaginationInfo;
}

export async function fetchGenerationHistory(
  page: number = 1,
  pageSize: number = 10,
  skipRetries: boolean = false
): Promise<GenerationHistoryResponse> {
  const response = await apiFetch<{
    generations: Generation[];
    pagination: PaginationInfo;
  }>(`/coconut/projects/history?page=${page}&pageSize=${pageSize}`, {}, 0, skipRetries);

  return {
    generations: response.generations,
    pagination: response.pagination,
  };
}

// ============================================
// TRANSACTIONS API
// ============================================

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: PaginationInfo;
}

export async function fetchTransactions(
  page: number = 1,
  pageSize: number = 10,
  skipRetries: boolean = false
): Promise<TransactionsResponse> {
  const response = await apiFetch<{
    transactions: Transaction[];
    pagination: PaginationInfo;
  }>(`/coconut/transactions?page=${page}&pageSize=${pageSize}`, {}, 0, skipRetries);

  return {
    transactions: response.transactions,
    pagination: response.pagination,
  };
}

// ============================================
// SETTINGS API
// ============================================

export async function fetchUserSettings(skipRetries: boolean = false): Promise<UserSettings> {
  const response = await apiFetch<{ settings: UserSettings }>(
    '/user/settings',
    {},
    0,
    skipRetries
  );
  return response.settings;
}

export async function saveUserSettings(
  settings: UserSettings
): Promise<void> {
  await apiFetch('/user/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

// ============================================
// ANALYTICS API
// ============================================

export async function fetchAnalytics(skipRetries: boolean = false): Promise<UsageAnalytics> {
  const response = await apiFetch<{ analytics: UsageAnalytics }>(
    '/coconut/analytics',
    {},
    0,
    skipRetries
  );
  return response.analytics;
}

// ============================================
// COCOBOARD API (Fix #1)
// ============================================

export async function createCocoBoard(
  projectId: string,
  userId: string,
  analysis: any
): Promise<CocoBoard> {
  const response = await apiFetch<{ data: CocoBoard }>('/coconut/cocoboard/create', {
    method: 'POST',
    body: JSON.stringify({ projectId, userId, analysis }),
  });
  return response.data;
}

export async function fetchCocoBoard(id: string): Promise<CocoBoard> {
  const response = await apiFetch<{ data: CocoBoard }>(`/coconut/cocoboard/${id}`);
  return response.data;
}

export async function updateCocoBoard(id: string, updates: Partial<CocoBoard>): Promise<CocoBoard> {
  const response = await apiFetch<{ data: CocoBoard }>(`/coconut/cocoboard/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response.data;
}

// ============================================
// GENERATION API (Fix #3)
// ============================================

// Alias for Generation (same type, different use context)
export type GenerationResult = Generation;

export async function startGeneration(request: GenerationRequest): Promise<GenerationResult> {
  const response = await apiFetch<{ data: GenerationResult }>('/coconut/generate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.data;
}

export async function getGenerationStatus(id: string): Promise<GenerationResult> {
  const response = await apiFetch<{ data: GenerationResult }>(`/coconut/generate/${id}`);
  return response.data;
}

export async function cancelGeneration(id: string): Promise<GenerationResult> {
  const response = await apiFetch<{ data: GenerationResult }>(`/coconut/generate/${id}/cancel`, {
    method: 'POST',
  });
  return response.data;
}

// ============================================
// HISTORY API (Fix #4)
// ============================================

export async function toggleFavorite(id: string): Promise<GenerationResult> {
  const response = await apiFetch<{ data: GenerationResult }>(`/coconut/history/${id}/favorite`, {
    method: 'POST',
  });
  return response.data;
}

export async function deleteGeneration(id: string): Promise<void> {
  await apiFetch(`/coconut/history/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// PRICING API (Fix #28)
// ============================================

export async function fetchPricing(): Promise<Pricing> {
  const response = await apiFetch<{ data: Pricing }>('/coconut/pricing');
  return response.data;
}

// ============================================
// EXPORTS
// ============================================

export const api = {
  // Dashboard
  fetchDashboardStats,
  fetchGenerationHistory,

  // Credits
  fetchTransactions,
  fetchAnalytics,

  // Settings
  fetchUserSettings,
  saveUserSettings,

  // CocoBoard
  createCocoBoard,
  fetchCocoBoard,
  updateCocoBoard,

  // Generation
  startGeneration,
  getGenerationStatus,
  cancelGeneration,

  // History
  toggleFavorite,
  deleteGeneration,

  // Pricing
  fetchPricing,

  // Error
  ApiError,
};

export default api;