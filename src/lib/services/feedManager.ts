/**
 * Service de gestion du feed / historique de générations
 */

import type { FeedItem, FeedFilter, FeedPage, GenerationResult } from '../types/studio';
// MVP: Mock storage au lieu de KV store
// import * as kv from '../../supabase/functions/server/kv_store';

// MVP: Mock storage in memory
const mockStorage = new Map<string, any>();

// ============================================================================
// SAVE GENERATION
// ============================================================================

/**
 * Sauvegarde une génération dans le feed
 */
export async function saveGeneration(
  userId: string,
  result: GenerationResult
): Promise<FeedItem> {
  try {
    const feedItem: FeedItem = {
      id: result.id,
      result,
      saved: false,
      liked: false,
      downloadCount: 0,
      remixCount: 0,
      createdAt: new Date()
    };

    const key = `feed:${userId}:${result.id}`;
    mockStorage.set(key, feedItem);

    return feedItem;
  } catch (error) {
    console.error('Error saving generation to feed:', error);
    throw error;
  }
}

// ============================================================================
// LOAD FEED
// ============================================================================

/**
 * Charge le feed de l'utilisateur avec pagination
 */
export async function loadFeed(
  userId: string,
  page = 1,
  pageSize = 10,
  filter?: FeedFilter
): Promise<FeedPage> {
  try {
    const prefix = `feed:${userId}:`;
    const allItems = Array.from(mockStorage.entries())
      .filter(([key]) => key.startsWith(prefix))
      .map(([_, value]) => value) as FeedItem[];

    // Filtrer si nécessaire
    let filteredItems = allItems;

    if (filter) {
      filteredItems = applyFilter(allItems, filter);
    }

    // Trier par date décroissante
    filteredItems.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Pagination
    const totalItems = filteredItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = filteredItems.slice(startIndex, endIndex);

    return {
      items,
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  } catch (error) {
    console.error('Error loading feed:', error);
    return {
      items: [],
      page,
      pageSize,
      totalItems: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    };
  }
}

/**
 * Charge un item spécifique du feed
 */
export async function getFeedItem(
  userId: string,
  itemId: string
): Promise<FeedItem | null> {
  try {
    const key = `feed:${userId}:${itemId}`;
    const item = mockStorage.get(key) as FeedItem;
    return item || null;
  } catch (error) {
    console.error('Error getting feed item:', error);
    return null;
  }
}

// ============================================================================
// UPDATE FEED ITEM
// ============================================================================

/**
 * Met à jour un item du feed
 */
async function updateFeedItem(
  userId: string,
  itemId: string,
  updates: Partial<FeedItem>
): Promise<FeedItem | null> {
  try {
    const item = await getFeedItem(userId, itemId);
    if (!item) return null;

    const updatedItem = { ...item, ...updates };
    const key = `feed:${userId}:${itemId}`;
    mockStorage.set(key, updatedItem);

    return updatedItem;
  } catch (error) {
    console.error('Error updating feed item:', error);
    return null;
  }
}

/**
 * Toggle saved status
 */
export async function toggleSaved(
  userId: string,
  itemId: string
): Promise<boolean> {
  try {
    const item = await getFeedItem(userId, itemId);
    if (!item) return false;

    const updated = await updateFeedItem(userId, itemId, {
      saved: !item.saved
    });

    return updated?.saved || false;
  } catch (error) {
    console.error('Error toggling saved:', error);
    return false;
  }
}

/**
 * Toggle liked status
 */
export async function toggleLiked(
  userId: string,
  itemId: string
): Promise<boolean> {
  try {
    const item = await getFeedItem(userId, itemId);
    if (!item) return false;

    const updated = await updateFeedItem(userId, itemId, {
      liked: !item.liked
    });

    return updated?.liked || false;
  } catch (error) {
    console.error('Error toggling liked:', error);
    return false;
  }
}

/**
 * Incrémente le compteur de téléchargements
 */
export async function incrementDownloadCount(
  userId: string,
  itemId: string
): Promise<number> {
  try {
    const item = await getFeedItem(userId, itemId);
    if (!item) return 0;

    const updated = await updateFeedItem(userId, itemId, {
      downloadCount: item.downloadCount + 1
    });

    return updated?.downloadCount || 0;
  } catch (error) {
    console.error('Error incrementing download count:', error);
    return 0;
  }
}

/**
 * Incrémente le compteur de remixes
 */
export async function incrementRemixCount(
  userId: string,
  itemId: string
): Promise<number> {
  try {
    const item = await getFeedItem(userId, itemId);
    if (!item) return 0;

    const updated = await updateFeedItem(userId, itemId, {
      remixCount: item.remixCount + 1
    });

    return updated?.remixCount || 0;
  } catch (error) {
    console.error('Error incrementing remix count:', error);
    return 0;
  }
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Supprime un item du feed
 */
export async function deleteFeedItem(
  userId: string,
  itemId: string
): Promise<boolean> {
  try {
    const key = `feed:${userId}:${itemId}`;
    mockStorage.delete(key);
    return true;
  } catch (error) {
    console.error('Error deleting feed item:', error);
    return false;
  }
}

/**
 * Supprime plusieurs items du feed
 */
export async function deleteFeedItems(
  userId: string,
  itemIds: string[]
): Promise<number> {
  try {
    const keys = itemIds.map(id => `feed:${userId}:${id}`);
    keys.forEach(key => mockStorage.delete(key));
    return itemIds.length;
  } catch (error) {
    console.error('Error deleting feed items:', error);
    return 0;
  }
}

// ============================================================================
// FILTERING
// ============================================================================

/**
 * Applique un filtre sur les items
 */
function applyFilter(items: FeedItem[], filter: FeedFilter): FeedItem[] {
  let filtered = items;

  // Filter by models
  if (filter.models && filter.models.length > 0) {
    filtered = filtered.filter(item => 
      filter.models!.includes(item.result.model)
    );
  }

  // Filter by date range
  if (filter.dateRange) {
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.createdAt);
      return (
        itemDate >= filter.dateRange!.start &&
        itemDate <= filter.dateRange!.end
      );
    });
  }

  // Filter by tier
  if (filter.tier) {
    filtered = filtered.filter(item => {
      const model = item.result.model;
      // Déterminer le tier du modèle
      const isFree = ['seedream', 'kontext', 'nanobanana', 'flux-schnell'].includes(model);
      return filter.tier === 'free' ? isFree : !isFree;
    });
  }

  // Filter by status
  if (filter.status) {
    filtered = filtered.filter(item => 
      item.result.status === filter.status
    );
  }

  // Filter by search query
  if (filter.searchQuery && filter.searchQuery.trim().length > 0) {
    const query = filter.searchQuery.toLowerCase();
    filtered = filtered.filter(item => 
      item.result.originalPrompt.toLowerCase().includes(query) ||
      item.result.enhancedPrompt?.toLowerCase().includes(query)
    );
  }

  return filtered;
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Obtient les statistiques du feed
 */
export async function getFeedStats(userId: string): Promise<{
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  totalCreditsUsed: number;
  freeCreditsUsed: number;
  paidCreditsUsed: number;
  favoriteModel: string;
  totalDownloads: number;
  totalRemixes: number;
}> {
  try {
    const prefix = `feed:${userId}:`;
    const allItems = Array.from(mockStorage.entries())
      .filter(([key]) => key.startsWith(prefix))
      .map(([_, value]) => value) as FeedItem[];

    const stats = {
      totalGenerations: allItems.length,
      successfulGenerations: allItems.filter(i => i.result.status === 'success').length,
      failedGenerations: allItems.filter(i => i.result.status === 'error').length,
      totalCreditsUsed: allItems.reduce((sum, i) => sum + i.result.creditsUsed, 0),
      freeCreditsUsed: allItems.filter(i => i.result.creditType === 'free').reduce((sum, i) => sum + i.result.creditsUsed, 0),
      paidCreditsUsed: allItems.filter(i => i.result.creditType === 'paid').reduce((sum, i) => sum + i.result.creditsUsed, 0),
      favoriteModel: '',
      totalDownloads: allItems.reduce((sum, i) => sum + i.downloadCount, 0),
      totalRemixes: allItems.reduce((sum, i) => sum + i.remixCount, 0)
    };

    // Déterminer le modèle favori
    const modelCounts: Record<string, number> = {};
    allItems.forEach(item => {
      modelCounts[item.result.model] = (modelCounts[item.result.model] || 0) + 1;
    });
    
    const mostUsedModel = Object.entries(modelCounts)
      .sort((a, b) => b[1] - a[1])[0];
    
    stats.favoriteModel = mostUsedModel?.[0] || 'none';

    return stats;
  } catch (error) {
    console.error('Error getting feed stats:', error);
    return {
      totalGenerations: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      totalCreditsUsed: 0,
      freeCreditsUsed: 0,
      paidCreditsUsed: 0,
      favoriteModel: 'none',
      totalDownloads: 0,
      totalRemixes: 0
    };
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Formate un timestamp pour affichage
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  return then.toLocaleDateString();
}

/**
 * Exporte le feed en JSON
 */
export async function exportFeed(userId: string): Promise<string> {
  try {
    const { items } = await loadFeed(userId, 1, 1000); // Charger tout
    return JSON.stringify(items, null, 2);
  } catch (error) {
    console.error('Error exporting feed:', error);
    return '[]';
  }
}