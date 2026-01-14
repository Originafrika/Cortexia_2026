/**
 * DEBUG CREDITS PANEL
 * Dev tool pour initialiser/vérifier les crédits
 * À activer uniquement en développement
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bug, RefreshCw, CheckCircle, XCircle, Zap } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

interface DebugCreditsPanelProps {
  userId: string;
  onCreditsUpdated?: () => void;
}

export function DebugCreditsPanel({ userId, onCreditsUpdated }: DebugCreditsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const initCredits = async (free: number, paid: number) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/debug/init-credits/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ free, paid }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        onCreditsUpdated?.();
        setTimeout(() => setResult(null), 3000);
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkCredits = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/debug/check-credits/${userId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const deleteCredits = async () => {
    if (!confirm('Supprimer les crédits de cet utilisateur ?')) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/debug/delete-credits/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        onCreditsUpdated?.();
        setTimeout(() => setResult(null), 3000);
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Only show in development
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
    // ✅ FIX: Don't rely on import.meta.env.PROD (not available in Figma Make)
    // Only show on localhost or 127.0.0.1
    return null;
  }

  return (
    <>
      {/* Floating debug button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Bug size={20} />
      </motion.button>

      {/* Debug panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-40 right-6 z-50 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-96 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bug className="text-purple-400" size={20} />
                <h3 className="text-white font-medium">Debug Credits</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-white/40 mb-4 font-mono break-all">
              {userId}
            </div>

            <div className="space-y-3">
              {/* Init credits buttons */}
              <div>
                <p className="text-xs text-white/60 mb-2">Initialiser crédits :</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => initCredits(25, 0)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    25 Free
                  </button>
                  <button
                    onClick={() => initCredits(35, 0)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    35 Free
                  </button>
                  <button
                    onClick={() => initCredits(0, 100)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    100 Paid
                  </button>
                  <button
                    onClick={() => initCredits(25, 100)}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    25/100
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={checkCredits}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  Vérifier
                </button>
                <button
                  onClick={deleteCredits}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-3 rounded-lg ${
                    result.success
                      ? 'bg-green-600/20 border border-green-600/30'
                      : 'bg-red-600/20 border border-red-600/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {result.success ? (
                      <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                    ) : (
                      <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                    )}
                    <div className="flex-1 text-xs">
                      {result.success ? (
                        <>
                          <p className="text-green-400 font-medium mb-1">
                            {result.message || 'Succès'}
                          </p>
                          {result.credits && (
                            <p className="text-green-400/80">
                              Free: {result.credits.free}, Paid: {result.credits.paid}
                            </p>
                          )}
                          {result.exists !== undefined && (
                            <p className="text-green-400/80">
                              Exists: {result.exists ? 'Oui' : 'Non'}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-red-400">{result.error || 'Erreur inconnue'}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick refresh */}
              <button
                onClick={onCreditsUpdated}
                className="w-full px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Zap size={14} />
                Rafraîchir l'app
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/40">
              💡 Dev only - invisible en prod
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}