// History Service - Manage user's generation history

export interface HistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  type: 'image' | 'video' | 'avatar';
  style: string;
  ratio: string;
  credits: number;
  createdAt: Date;
  seed?: string;
  isFavorite?: boolean;
}

const STORAGE_KEY = 'cortexia_generation_history';
const MAX_HISTORY_ITEMS = 100;

class HistoryService {
  // Get all history items
  getHistory(): HistoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const items = JSON.parse(stored);
      // Convert date strings back to Date objects
      return items.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt)
      }));
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  }

  // Add item to history
  addToHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem {
    const newItem: HistoryItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date()
    };

    const history = this.getHistory();
    history.unshift(newItem); // Add to beginning

    // Keep only last MAX_HISTORY_ITEMS
    const trimmed = history.slice(0, MAX_HISTORY_ITEMS);
    
    this.saveHistory(trimmed);
    return newItem;
  }

  // Get recent items (last N)
  getRecent(count: number = 20): HistoryItem[] {
    return this.getHistory().slice(0, count);
  }

  // Get by type
  getByType(type: 'image' | 'video' | 'avatar'): HistoryItem[] {
    return this.getHistory().filter(item => item.type === type);
  }

  // Search history
  searchHistory(query: string): HistoryItem[] {
    const lowerQuery = query.toLowerCase();
    return this.getHistory().filter(item =>
      item.prompt.toLowerCase().includes(lowerQuery)
    );
  }

  // Delete item
  deleteItem(id: string): void {
    const history = this.getHistory().filter(item => item.id !== id);
    this.saveHistory(history);
  }

  // Clear all history
  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  // Toggle favorite
  toggleFavorite(id: string): void {
    const history = this.getHistory().map(item =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    this.saveHistory(history);
  }

  // Get favorites
  getFavorites(): HistoryItem[] {
    return this.getHistory().filter(item => item.isFavorite);
  }

  // Get item by ID
  getById(id: string): HistoryItem | undefined {
    return this.getHistory().find(item => item.id === id);
  }

  // Private methods
  private saveHistory(history: HistoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  private generateId(): string {
    return `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get stats
  getStats(): {
    total: number;
    byType: Record<string, number>;
    totalCredits: number;
    favorites: number;
  } {
    const history = this.getHistory();
    
    const byType = history.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalCredits = history.reduce((sum, item) => sum + item.credits, 0);
    const favorites = history.filter(item => item.isFavorite).length;

    return {
      total: history.length,
      byType,
      totalCredits,
      favorites
    };
  }
}

export const historyService = new HistoryService();
