/**
 * ONLINE STATUS HOOK
 * Phase 10 - Error Handling & Resilience
 * 
 * Hook pour détecter l'état de connexion internet.
 * 
 * Usage:
 * const { isOnline, wasOffline } = useOnlineStatus();
 */

import { useState, useEffect, useCallback } from 'react';

interface UseOnlineStatusReturn {
  isOnline: boolean;
  wasOffline: boolean;
  checkConnection: () => Promise<boolean>;
}

/**
 * Hook to detect online/offline status
 * 
 * @example
 * function Component() {
 *   const { isOnline, wasOffline } = useOnlineStatus();
 * 
 *   if (!isOnline) {
 *     return <div>Vous êtes hors ligne</div>;
 *   }
 * 
 *   if (wasOffline) {
 *     return <div>Connexion rétablie ✅</div>;
 *   }
 * 
 *   return <div>En ligne</div>;
 * }
 */
export function useOnlineStatus(): UseOnlineStatusReturn {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      
      // Reset wasOffline after 5 seconds
      setTimeout(() => setWasOffline(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/ping', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      const online = response.ok;
      setIsOnline(online);
      return online;
    } catch {
      setIsOnline(false);
      return false;
    }
  }, []);

  return {
    isOnline,
    wasOffline,
    checkConnection,
  };
}

/**
 * Hook to execute callback when connection is restored
 * 
 * @example
 * function Component() {
 *   useOnlineEffect(() => {
 *     console.log('Connection restored! Syncing data...');
 *     syncData();
 *   });
 * 
 *   return <div>Component</div>;
 * }
 */
export function useOnlineEffect(callback: () => void) {
  const { isOnline, wasOffline } = useOnlineStatus();

  useEffect(() => {
    if (isOnline && wasOffline) {
      callback();
    }
  }, [isOnline, wasOffline, callback]);
}

/**
 * Hook to queue actions while offline
 * 
 * @example
 * function Component() {
 *   const { enqueue, pending } = useOfflineQueue();
 * 
 *   const handleSave = async (data) => {
 *     enqueue(async () => {
 *       await api.save(data);
 *     });
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={() => handleSave(data)}>Save</button>
 *       {pending > 0 && <div>{pending} actions en attente</div>}
 *     </div>
 *   );
 * }
 */
export function useOfflineQueue() {
  const { isOnline } = useOnlineStatus();
  const [queue, setQueue] = useState<Array<() => Promise<void>>>([]);
  const [processing, setProcessing] = useState(false);

  const enqueue = useCallback((action: () => Promise<void>) => {
    setQueue((prev) => [...prev, action]);
  }, []);

  useEffect(() => {
    if (isOnline && queue.length > 0 && !processing) {
      setProcessing(true);

      (async () => {
        const currentQueue = [...queue];
        setQueue([]);

        for (const action of currentQueue) {
          try {
            await action();
          } catch (error) {
            console.error('[Offline Queue] Failed to process action:', error);
            // Re-add failed action to queue
            setQueue((prev) => [...prev, action]);
          }
        }

        setProcessing(false);
      })();
    }
  }, [isOnline, queue, processing]);

  return {
    enqueue,
    pending: queue.length,
    processing,
  };
}
