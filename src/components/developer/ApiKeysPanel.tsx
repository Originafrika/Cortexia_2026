/**
 * API KEYS PANEL - Developer Dashboard
 * 
 * Manage API keys
 * Features:
 * - List API keys with masked values
 * - Create new API key
 * - Copy to clipboard
 * - Revoke keys
 * - Last used timestamp
 * - Rate limit info
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState, useEffect } from 'react';
import { Key, Copy, Trash2, Plus, Eye, EyeOff, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  keyPreview: string; // e.g., "ctx_...abc123"
  createdAt: string;
  lastUsedAt?: string;
  requestCount: number;
  isActive: boolean;
}

interface ApiKeysPanelProps {
  onUpdate?: () => void;
}

export function ApiKeysPanel({ onUpdate }: ApiKeysPanelProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setIsLoading(true);
      console.log('[ApiKeysPanel] Loading API keys');

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/developer/api-keys`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[ApiKeysPanel] API keys loaded:', data);
        setApiKeys(data.keys || []);
      } else if (res.status !== 404) {
        console.error('[ApiKeysPanel] Failed to load API keys:', await res.text());
        toast.error('Failed to load API keys');
      }
    } catch (error) {
      console.error('[ApiKeysPanel] Error loading API keys:', error);
      toast.error('Error loading API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for your API key');
      return;
    }

    try {
      setIsCreating(true);

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/developer/api-keys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newKeyName.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[ApiKeysPanel] API key created:', data);
        
        setNewlyCreatedKey(data.key);
        setNewKeyName('');
        
        toast.success('API key created!', {
          description: 'Make sure to copy it now - you won\'t see it again'
        });
        
        loadApiKeys();
        onUpdate?.();
      } else {
        const error = await res.text();
        console.error('[ApiKeysPanel] Failed to create API key:', error);
        toast.error('Failed to create API key');
      }
    } catch (error) {
      console.error('[ApiKeysPanel] Error creating API key:', error);
      toast.error('Error creating API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/developer/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        toast.success('API key revoked');
        loadApiKeys();
        onUpdate?.();
      } else {
        toast.error('Failed to revoke API key');
      }
    } catch (error) {
      console.error('[ApiKeysPanel] Error revoking API key:', error);
      toast.error('Error revoking API key');
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard!');
  };

  const toggleRevealKey = (keyId: string) => {
    const newRevealed = new Set(revealedKeys);
    if (newRevealed.has(keyId)) {
      newRevealed.delete(keyId);
    } else {
      newRevealed.add(keyId);
    }
    setRevealedKeys(newRevealed);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const maskKey = (key: string) => {
    if (key.length < 10) return '•'.repeat(key.length);
    return `${key.slice(0, 8)}${'•'.repeat(20)}${key.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-4 border-cream-200 border-t-cream-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">API Keys</h2>
          <p className="text-sm text-gray-600">
            Create and manage API keys to authenticate your requests
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          disabled={apiKeys.length >= 5}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          <span className="font-medium">Create API Key</span>
        </button>
      </div>

      {/* Newly Created Key Alert */}
      <AnimatePresence>
        {newlyCreatedKey && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">
                  API Key Created Successfully!
                </h3>
                <p className="text-sm text-green-700 mb-3">
                  Make sure to copy your API key now. You won't be able to see it again!
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-3 bg-white border border-green-200 rounded-xl text-sm font-mono text-gray-900 overflow-x-auto">
                    {newlyCreatedKey}
                  </code>
                  <button
                    onClick={() => handleCopyKey(newlyCreatedKey)}
                    className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                </div>
              </div>
              <button
                onClick={() => setNewlyCreatedKey(null)}
                className="text-green-600 hover:text-green-700"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Keys List */}
      {apiKeys.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-cream-100">
          <Key size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No API Keys Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first API key to start integrating Cortexia
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            Create API Key
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <motion.div
              key={apiKey.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Key size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{apiKey.name}</h3>
                    <p className="text-xs text-gray-500">
                      Created {formatDate(apiKey.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {apiKey.isActive ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      Revoked
                    </span>
                  )}
                </div>
              </div>

              {/* Key Display */}
              <div className="flex items-center gap-2 mb-4">
                <code className="flex-1 px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-sm font-mono text-gray-900 overflow-x-auto">
                  {revealedKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.keyPreview)}
                </code>
                <button
                  onClick={() => toggleRevealKey(apiKey.id)}
                  className="p-3 hover:bg-cream-50 rounded-lg transition-colors"
                  title={revealedKeys.has(apiKey.id) ? 'Hide key' : 'Reveal key'}
                >
                  {revealedKeys.has(apiKey.id) ? (
                    <EyeOff size={18} className="text-gray-600" />
                  ) : (
                    <Eye size={18} className="text-gray-600" />
                  )}
                </button>
                <button
                  onClick={() => handleCopyKey(revealedKeys.has(apiKey.id) ? apiKey.key : apiKey.keyPreview)}
                  className="p-3 hover:bg-cream-50 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy size={18} className="text-gray-600" />
                </button>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Activity size={14} />
                    <span>{apiKey.requestCount.toLocaleString()} requests</span>
                  </div>
                  {apiKey.lastUsedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>Last used {formatDate(apiKey.lastUsedAt)}</span>
                    </div>
                  )}
                </div>

                {apiKey.isActive && (
                  <button
                    onClick={() => handleRevokeKey(apiKey.id)}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Trash2 size={16} />
                    Revoke
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">
              Security Best Practices
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Never share your API keys or commit them to version control</li>
              <li>• Use environment variables to store keys in your applications</li>
              <li>• Revoke keys immediately if you suspect they've been compromised</li>
              <li>• Create separate keys for different applications or environments</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !isCreating && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Create API Key
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production App, Staging Environment"
                  className="w-full px-4 py-3 bg-white border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  disabled={isCreating}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Choose a descriptive name to help you identify this key
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKey}
                  disabled={isCreating || !newKeyName.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Key'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
