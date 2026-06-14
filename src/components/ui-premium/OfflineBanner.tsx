/**
 * OFFLINE BANNER COMPONENT
 * Phase 10 - Error Handling & Resilience
 * 
 * Banner pour indiquer l'état de connexion offline/online.
 * 
 * Usage:
 * <OfflineBanner />
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../../lib/hooks/useOnlineStatus';
import tokens from '../../lib/styles/tokens'; // Default import

interface OfflineBannerProps {
  position?: 'top' | 'bottom';
  className?: string;
}

export function OfflineBanner({
  position = 'top',
  className = '',
}: OfflineBannerProps) {
  const { isOnline, wasOffline } = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`
            fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-[9999]
            ${className}
          `}
        >
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-3 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
              <WifiOff className="w-5 h-5 animate-pulse" />
              <p className="text-sm font-medium">
                Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {wasOffline && isOnline && (
        <motion.div
          initial={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`
            fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-[9999]
            ${className}
          `}
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm font-medium">
                Connexion rétablie ✓
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Inline offline indicator (for specific components)
 */
export function OfflineIndicator({ className = '' }: { className?: string }) {
  const { isOnline } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 ${className}`}
    >
      <WifiOff className="w-4 h-4 text-red-400" />
      <span className="text-xs text-red-300">Hors ligne</span>
    </motion.div>
  );
}

/**
 * Online status badge
 */
export function OnlineStatusBadge({ className = '' }: { className?: string }) {
  const { isOnline } = useOnlineStatus();

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`relative inline-flex ${className}`}
    >
      <div className={`
        w-2 h-2 rounded-full
        ${isOnline ? 'bg-green-500' : 'bg-red-500'}
        ${isOnline ? 'animate-pulse' : ''}
      `} />
      {isOnline && (
        <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75" />
      )}
    </motion.div>
  );
}