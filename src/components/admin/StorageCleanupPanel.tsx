/**
 * STORAGE CLEANUP ADMIN PANEL
 * Monitor and control automatic storage cleanup
 */

import React, { useState, useEffect } from 'react';
import { Database, Trash2, Play, Activity, Clock, HardDrive, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/storage-cleanup`;
const ADMIN_TOKEN = 'migration-secret-token-2026'; // Same token as migration

interface CleanupStats {
  totalFilesChecked: number;
  filesDeleted: number;
  storageFreed: number;
  errors: number;
  buckets: {
    [key: string]: {
      filesDeleted: number;
      storageFreed: number;
    };
  };
}

interface CleanupRun {
  id: string;
  timestamp: string;
  trigger: 'cron' | 'manual';
  stats: CleanupStats;
  success: boolean;
}

export default function StorageCleanupPanel() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'running' | 'error'>('idle');
  const [lastRun, setLastRun] = useState<CleanupRun | null>(null);
  const [nextRun, setNextRun] = useState<string | null>(null);
  const [history, setHistory] = useState<CleanupRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dryRunStats, setDryRunStats] = useState<CleanupStats | null>(null);

  // Fetch cleanup status
  const fetchStatus = async () => {
    try {
      setStatus('loading');
      setError(null);

      const response = await fetch(`${API_BASE}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      console.log('[CLEANUP] Raw response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('[CLEANUP] JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }

      if (data.success) {
        setLastRun(data.data.lastRun);
        setNextRun(data.data.nextRun);
        setHistory(data.data.history || []);
      } else {
        setError(data.error);
      }

      setStatus('idle');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[CLEANUP] Fetch error:', err);
      setError(message);
      setStatus('error');
    }
  };

  // Dry run (test mode)
  const runDryRun = async () => {
    try {
      setStatus('running');
      setError(null);
      setDryRunStats(null);

      const response = await fetch(`${API_BASE}/dry-run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setDryRunStats(data.stats);
      } else {
        setError(data.error);
      }

      setStatus('idle');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setStatus('error');
    }
  };

  // Manual cleanup (requires confirmation)
  const runManualCleanup = async () => {
    if (!confirm('⚠️ Are you sure you want to run manual cleanup? This will DELETE old files permanently.')) {
      return;
    }

    try {
      setStatus('running');
      setError(null);

      const response = await fetch(`${API_BASE}/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Cleanup completed!\n\nFiles deleted: ${data.stats.filesDeleted}\nStorage freed: ${formatBytes(data.stats.storageFreed)}`);
        fetchStatus(); // Refresh status
      } else {
        setError(data.error);
      }

      setStatus('idle');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setStatus('error');
    }
  };

  // Format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-purple-500/10 backdrop-blur-xl border border-purple-500/20">
              <Trash2 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Storage Cleanup</h1>
              <p className="text-gray-400">Automatic daily cleanup of temporary files</p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Next Run */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <p className="text-sm text-gray-400">Next Scheduled Run</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {nextRun ? formatDate(nextRun) : 'Loading...'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Daily at 00:00 UTC</p>
          </div>

          {/* Last Run */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-green-400" />
              <p className="text-sm text-gray-400">Last Run</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {lastRun ? formatDate(lastRun.timestamp) : 'Never'}
            </p>
            {lastRun && (
              <p className="text-xs text-gray-500 mt-1">
                {lastRun.stats.filesDeleted} files deleted
              </p>
            )}
          </div>

          {/* Storage Freed */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <HardDrive className="w-5 h-5 text-purple-400" />
              <p className="text-sm text-gray-400">Total Storage Freed</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {lastRun ? formatBytes(lastRun.stats.storageFreed) : '0 MB'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Last cleanup</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={fetchStatus}
            disabled={status === 'loading'}
            className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl p-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${status === 'loading' ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>

          <button
            onClick={runDryRun}
            disabled={status === 'running'}
            className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-xl p-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Play className="w-5 h-5" />
            Test Run (Dry Run)
          </button>

          <button
            onClick={runManualCleanup}
            disabled={status === 'running'}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl p-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
            Manual Cleanup
          </button>
        </div>

        {/* Dry Run Results */}
        {dryRunStats && (
          <div className="bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-yellow-400 mb-4">🧪 Dry Run Results (No Files Deleted)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Files Checked</p>
                <p className="text-2xl font-bold text-white">{dryRunStats.totalFilesChecked}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Would Delete</p>
                <p className="text-2xl font-bold text-yellow-400">{dryRunStats.filesDeleted}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Would Free</p>
                <p className="text-2xl font-bold text-yellow-400">{formatBytes(dryRunStats.storageFreed)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Errors</p>
                <p className="text-2xl font-bold text-white">{dryRunStats.errors}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 mb-8">
            <p className="text-red-400">❌ {error}</p>
          </div>
        )}

        {/* Cleanup Rules */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">🛡️ Protection Rules</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5"></div>
              <div>
                <p className="text-white font-medium">Feed Posts</p>
                <p className="text-sm text-gray-400">All files in feed posts are PERMANENT (never deleted)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5"></div>
              <div>
                <p className="text-white font-medium">Enterprise Files</p>
                <p className="text-sm text-gray-400">All enterprise user files are PERMANENT (never deleted)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5"></div>
              <div>
                <p className="text-white font-medium">Individual User Uploads</p>
                <p className="text-sm text-gray-400">Deleted after 24 hours (unless posted to feed)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5"></div>
              <div>
                <p className="text-white font-medium">Generations</p>
                <p className="text-sm text-gray-400">Deleted after 24 hours (unless posted to feed)</p>
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">📜 Cleanup History</h3>
          {history.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No cleanup runs yet</p>
          ) : (
            <div className="space-y-3">
              {history.map((run) => (
                <div
                  key={run.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        run.trigger === 'manual' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {run.trigger === 'manual' ? '🔧 Manual' : '⏰ Scheduled'}
                      </span>
                      <p className="text-sm text-gray-400">{formatDate(run.timestamp)}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-white">{run.stats.filesDeleted} files</span>
                      <span className="text-purple-400">{formatBytes(run.stats.storageFreed)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}