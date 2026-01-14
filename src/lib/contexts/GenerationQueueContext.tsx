/**
 * GENERATION QUEUE CONTEXT
 * Gère l'historique et la file d'attente de toutes les générations
 * ✅ UPDATED: Stores all users' history in one place, filtered by userId in hooks
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface QueueItem {
  id: string;
  type: 'image' | 'video' | 'avatar'; // ✅ Added 'avatar' type
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  result?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
  model?: string;
  aspectRatio?: string;
  seed?: number | string;
  userId?: string; // ✅ NEW: Track which user created this
  // Video specific
  taskId?: string;
  resolution?: string;
  originUrl?: string;
}

interface GenerationQueueContextValue {
  queue: QueueItem[];
  addToQueue: (item: Omit<QueueItem, 'id' | 'createdAt' | 'status'>) => string;
  updateQueueItem: (id: string, updates: Partial<QueueItem>) => void;
  removeFromQueue: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  getActiveGenerations: () => QueueItem[];
  getCompletedGenerations: () => QueueItem[];
}

const GenerationQueueContext = createContext<GenerationQueueContextValue | null>(null);

const STORAGE_KEY = 'cortexia-generation-queue';
const MAX_HISTORY = 50; // Keep last 50 generations

export function GenerationQueueProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<QueueItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const withDates = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
        }));
        setQueue(withDates);
        console.log('✅ Loaded queue from storage:', withDates.length, 'items');
      }
    } catch (error) {
      console.error('Failed to load queue from storage:', error);
    }
  }, []);

  // Save to localStorage whenever queue changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save queue to storage:', error);
    }
  }, [queue]);

  const addToQueue = (item: Omit<QueueItem, 'id' | 'createdAt' | 'status'>) => {
    const id = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newItem: QueueItem = {
      ...item,
      id,
      createdAt: new Date(),
      status: 'generating',
    };

    setQueue(prev => {
      // Add to start (most recent first)
      const updated = [newItem, ...prev];
      // Keep only MAX_HISTORY items
      return updated.slice(0, MAX_HISTORY);
    });

    console.log('✅ Added to queue:', id, item.type, item.prompt.substring(0, 50));
    return id;
  };

  const updateQueueItem = (id: string, updates: Partial<QueueItem>) => {
    setQueue(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        
        // Auto-set completedAt if status changes to completed or failed
        if ((updates.status === 'completed' || updates.status === 'failed') && !updated.completedAt) {
          updated.completedAt = new Date();
        }
        
        return updated;
      }
      return item;
    }));
  };

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    setQueue(prev => prev.filter(item => item.status === 'generating' || item.status === 'pending'));
  };

  const clearAll = () => {
    setQueue([]);
  };

  const getActiveGenerations = () => {
    return queue.filter(item => item.status === 'generating' || item.status === 'pending');
  };

  const getCompletedGenerations = () => {
    return queue.filter(item => item.status === 'completed' || item.status === 'failed');
  };

  return (
    <GenerationQueueContext.Provider
      value={{
        queue,
        addToQueue,
        updateQueueItem,
        removeFromQueue,
        clearCompleted,
        clearAll,
        getActiveGenerations,
        getCompletedGenerations,
      }}
    >
      {children}
    </GenerationQueueContext.Provider>
  );
}

export function useGenerationQueue() {
  const context = useContext(GenerationQueueContext);
  if (!context) {
    throw new Error('useGenerationQueue must be used within GenerationQueueProvider');
  }
  return context;
}

/**
 * ✅ NEW: Hook that filters queue by current userId
 * Use this in components that should only show user-specific history
 */
export function useUserGenerationQueue(userId: string | null) {
  const context = useGenerationQueue();
  
  // Filter queue by userId
  const userQueue = userId 
    ? context.queue.filter(item => item.userId === userId)
    : context.queue; // If no userId, show all (for backward compatibility)
  
  return {
    ...context,
    queue: userQueue,
    getActiveGenerations: () => userQueue.filter(item => 
      item.status === 'generating' || item.status === 'pending'
    ),
    getCompletedGenerations: () => userQueue.filter(item => 
      item.status === 'completed' || item.status === 'failed'
    ),
  };
}