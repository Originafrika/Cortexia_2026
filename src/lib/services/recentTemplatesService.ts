// Recent Templates Service - Track user's recently used templates
// Stores in localStorage with timestamp and usage count

const STORAGE_KEY = 'cortexia_recent_templates';
const MAX_RECENT_ITEMS = 8;

export interface RecentTemplateEntry {
  templateId: string;
  lastUsed: number; // timestamp
  usageCount: number;
}

/**
 * Get all recent templates sorted by last used
 */
export function getRecentTemplates(): RecentTemplateEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const entries: RecentTemplateEntry[] = JSON.parse(stored);
    
    // Sort by last used (most recent first)
    return entries.sort((a, b) => b.lastUsed - a.lastUsed);
  } catch (error) {
    console.error('Failed to get recent templates:', error);
    return [];
  }
}

/**
 * Add or update a template in recent list
 */
export function addRecentTemplate(templateId: string): void {
  try {
    const entries = getRecentTemplates();
    const now = Date.now();
    
    // Find existing entry
    const existingIndex = entries.findIndex(e => e.templateId === templateId);
    
    if (existingIndex >= 0) {
      // Update existing entry
      entries[existingIndex] = {
        templateId,
        lastUsed: now,
        usageCount: entries[existingIndex].usageCount + 1
      };
    } else {
      // Add new entry
      entries.unshift({
        templateId,
        lastUsed: now,
        usageCount: 1
      });
    }
    
    // Keep only MAX_RECENT_ITEMS
    const trimmed = entries
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, MAX_RECENT_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to add recent template:', error);
  }
}

/**
 * Clear all recent templates
 */
export function clearRecentTemplates(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear recent templates:', error);
  }
}

/**
 * Get template IDs from recent list
 */
export function getRecentTemplateIds(): string[] {
  return getRecentTemplates().map(e => e.templateId);
}

/**
 * Check if a template is in recent list
 */
export function isTemplateRecent(templateId: string): boolean {
  return getRecentTemplateIds().includes(templateId);
}

/**
 * Get usage count for a template
 */
export function getTemplateUsageCount(templateId: string): number {
  const entries = getRecentTemplates();
  const entry = entries.find(e => e.templateId === templateId);
  return entry?.usageCount || 0;
}
