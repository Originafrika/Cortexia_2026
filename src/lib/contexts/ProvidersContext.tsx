// Providers Context - Share provider statuses and modals across the app

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { getMockProviderStatuses } from '../providers/mockService';
import type { ProviderStatus } from '../providers/types';

interface ProvidersContextType {
  providerStatuses: ProviderStatus[];
  refreshProviderStatuses: () => Promise<void>;
  openPurchaseModal: () => void;
  closePurchaseModal: () => void;
  isPurchaseModalOpen: boolean;
}

const ProvidersContext = createContext<ProvidersContextType | undefined>(undefined);

interface ProvidersProviderProps {
  children: ReactNode;
  onOpenPurchaseModal: () => void;
  onClosePurchaseModal: () => void;
  isPurchaseModalOpen: boolean;
}

export function ProvidersProvider({ 
  children,
  onOpenPurchaseModal,
  onClosePurchaseModal,
  isPurchaseModalOpen
}: ProvidersProviderProps) {
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([]);

  const refreshProviderStatuses = useCallback(async () => {
    const statuses = await getMockProviderStatuses();
    setProviderStatuses(statuses);
  }, []);

  // Load on mount
  useEffect(() => {
    refreshProviderStatuses();
    
    // Refresh every 5 minutes
    const interval = setInterval(refreshProviderStatuses, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshProviderStatuses]);

  return (
    <ProvidersContext.Provider value={{ 
      providerStatuses,
      refreshProviderStatuses,
      openPurchaseModal: onOpenPurchaseModal,
      closePurchaseModal: onClosePurchaseModal,
      isPurchaseModalOpen
    }}>
      {children}
    </ProvidersContext.Provider>
  );
}

export function useProviders(): ProvidersContextType {
  const context = useContext(ProvidersContext);
  if (context === undefined) {
    throw new Error('useProviders must be used within a ProvidersProvider');
  }
  return context;
}
