/**
 * WEBHOOKS PANEL - Developer Dashboard
 * 
 * Manage webhook endpoints
 * Features:
 * - List configured webhooks
 * - Create new webhook
 * - Test webhook delivery
 * - View delivery logs
 * - Enable/disable webhooks
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Play, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  lastDelivery?: {
    status: 'success' | 'failed';
    timestamp: string;
  };
  deliveryCount: number;
  successRate: number;
}

interface WebhooksPanelProps {
  onUpdate?: () => void;
}

const AVAILABLE_EVENTS = [
  { id: 'generation.started', label: 'Generation Started', description: 'Triggered when a generation job starts' },
  { id: 'generation.completed', label: 'Generation Completed', description: 'Triggered when a generation completes successfully' },
  { id: 'generation.failed', label: 'Generation Failed', description: 'Triggered when a generation fails' },
  { id: 'credit.purchased', label: 'Credits Purchased', description: 'Triggered when credits are added' },
  { id: 'credit.depleted', label: 'Credits Depleted', description: 'Triggered when credits run low' },
];

export function WebhooksPanel({ onUpdate }: WebhooksPanelProps) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      setIsLoading(true);
      console.log('[WebhooksPanel] Loading webhooks');

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/developer/webhooks`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[WebhooksPanel] Webhooks loaded:', data);
        setWebhooks(data.webhooks || []);
      } else if (res.status !== 404) {
        console.error('[WebhooksPanel] Failed to load webhooks:', await res.text());
        toast.error('Failed to load webhooks');
      }
    } catch (error) {
      console.error('[WebhooksPanel] Error loading webhooks:', error);
      toast.error('Error loading webhooks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWebhook = async () => {
    if (!newWebhookUrl.trim()) {
      toast.error('Please enter a webhook URL');
      return;
    }

    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event');
      return;
    }

    try {
      setIsCreating(true);

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/developer/webhooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          url: newWebhookUrl.trim(), 
          events: selectedEvents 
        })
      });

      if (res.ok) {
        toast.success('Webhook created!');
        setNewWebhookUrl('');
        setSelectedEvents([]);
        setShowCreateModal(false);
        loadWebhooks();
        onUpdate?.();
      } else {
        const error = await res.text();
        console.error('[WebhooksPanel] Failed to create webhook:', error);
        toast.error('Failed to create webhook');
      }
    } catch (error) {
      console.error('[WebhooksPanel] Error creating webhook:', error);
      toast.error('Error creating webhook');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) {
      return;
    }

    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/developer/webhooks/${webhookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        toast.success('Webhook deleted');
        loadWebhooks();
        onUpdate?.();
      } else {
        toast.error('Failed to delete webhook');
      }
    } catch (error) {
      console.error('[WebhooksPanel] Error deleting webhook:', error);
      toast.error('Error deleting webhook');
    }
  };

  const handleToggleWebhook = async (webhookId: string, isActive: boolean) => {
    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/developer/webhooks/${webhookId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (res.ok) {
        toast.success(`Webhook ${!isActive ? 'enabled' : 'disabled'}`);
        loadWebhooks();
      } else {
        toast.error('Failed to update webhook');
      }
    } catch (error) {
      console.error('[WebhooksPanel] Error toggling webhook:', error);
      toast.error('Error updating webhook');
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    try {
      setTestingWebhookId(webhookId);

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/developer/webhooks/${webhookId}/test`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        toast.success('Test webhook sent successfully!');
        loadWebhooks();
      } else {
        toast.error('Test webhook failed');
      }
    } catch (error) {
      console.error('[WebhooksPanel] Error testing webhook:', error);
      toast.error('Error testing webhook');
    } finally {
      setTestingWebhookId(null);
    }
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
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
          <h2 className="text-xl font-bold text-gray-900">Webhooks</h2>
          <p className="text-sm text-gray-600">
            Configure webhooks to receive real-time notifications
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span className="font-medium">Create Webhook</span>
        </button>
      </div>

      {/* Webhooks List */}
      {webhooks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-cream-100">
          <Zap size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Webhooks Configured
          </h3>
          <p className="text-gray-600 mb-4">
            Set up webhooks to receive real-time event notifications
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg"
          >
            Create Your First Webhook
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <motion.div
              key={webhook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Zap size={20} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono text-gray-900 truncate">
                        {webhook.url}
                      </code>
                      <a
                        href={webhook.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    <p className="text-xs text-gray-500">
                      Created {new Date(webhook.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhook.isActive}
                      onChange={() => handleToggleWebhook(webhook.id, webhook.isActive)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>

              {/* Events */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Events:</p>
                <div className="flex flex-wrap gap-2">
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-cream-100">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{webhook.deliveryCount} deliveries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {webhook.successRate >= 90 ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : webhook.successRate >= 70 ? (
                      <AlertCircle size={16} className="text-amber-600" />
                    ) : (
                      <XCircle size={16} className="text-red-600" />
                    )}
                    <span className="text-gray-600">{webhook.successRate}% success</span>
                  </div>
                  {webhook.lastDelivery && (
                    <div className="flex items-center gap-2">
                      {webhook.lastDelivery.status === 'success' ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <XCircle size={16} className="text-red-600" />
                      )}
                      <span className="text-gray-600 text-xs">
                        Last: {new Date(webhook.lastDelivery.timestamp).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestWebhook(webhook.id)}
                    disabled={testingWebhookId === webhook.id}
                    className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {testingWebhookId === webhook.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        Test
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
              className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Create Webhook
              </h2>

              <div className="space-y-6">
                {/* URL Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    placeholder="https://your-domain.com/webhook"
                    className="w-full px-4 py-3 bg-white border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    disabled={isCreating}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    The URL where webhook events will be sent
                  </p>
                </div>

                {/* Events Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Events
                  </label>
                  <div className="space-y-2">
                    {AVAILABLE_EVENTS.map((event) => (
                      <label
                        key={event.id}
                        className="flex items-start gap-3 p-4 border border-cream-200 rounded-xl hover:bg-cream-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event.id)}
                          onChange={() => toggleEvent(event.id)}
                          className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          disabled={isCreating}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{event.label}</p>
                          <p className="text-xs text-gray-600">{event.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWebhook}
                  disabled={isCreating || !newWebhookUrl.trim() || selectedEvents.length === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Webhook'
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
