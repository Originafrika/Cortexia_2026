/**
 * MIGRATION PANEL - Admin UI for running data migration
 * Temporary component - can be removed after migration
 */

import { useState } from 'react';
import { CheckCircle2, XCircle, Loader2, AlertTriangle, Play, RotateCcw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;
const ADMIN_TOKEN = 'migration-secret-token-2026';

interface MigrationStats {
  legacyProjects: number;
  unifiedProjects: number;
  legacyCocoBoards: number;
  unifiedCocoBoards: number;
  legacyUserIndexes: number;
  unifiedUserIndexes: number;
}

interface MigrationResult {
  success: boolean;
  migrated: number;
  failed: number;
  errors: string[];
  details: {
    projects: number;
    cocoboards: number;
    userIndexes: number;
  };
}

interface VerificationResult {
  valid: boolean;
  issues: string[];
  stats: MigrationStats;
}

export function MigrationPanel() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'running' | 'verifying' | 'complete' | 'error'>('idle');
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const checkStatus = async () => {
    setStatus('checking');
    setError(null);
    addLog('Checking current status...');

    try {
      const response = await fetch(`${API_BASE}/migration/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to check status');
      }

      setStats(data.data.stats);
      addLog(`Status checked: ${data.data.stats.legacyProjects} legacy projects found`);
      setStatus('idle');

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      addLog(`❌ Error: ${message}`);
      setStatus('error');
    }
  };

  const runMigration = async () => {
    setStatus('running');
    setError(null);
    addLog('Starting migration...');

    try {
      const response = await fetch(`${API_BASE}/migration/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Migration failed');
      }

      setResult(data.data);
      addLog(`✅ Migration complete: ${data.data.migrated} items migrated`);
      addLog(`   - Projects: ${data.data.details.projects}`);
      addLog(`   - CocoBoards: ${data.data.details.cocoboards}`);
      addLog(`   - User indexes: ${data.data.details.userIndexes}`);

      // Auto-verify after migration
      setTimeout(() => verifyMigration(), 1000);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      addLog(`❌ Migration error: ${message}`);
      setStatus('error');
    }
  };

  const verifyMigration = async () => {
    setStatus('verifying');
    setError(null);
    addLog('Verifying migration integrity...');

    try {
      const response = await fetch(`${API_BASE}/migration/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Verification failed');
      }

      setVerification(data.data);

      if (data.data.valid) {
        addLog('✅ Verification passed - migration successful!');
        setStatus('complete');
      } else {
        addLog(`⚠️ Verification found ${data.data.issues.length} issues:`);
        data.data.issues.forEach((issue: string) => addLog(`   - ${issue}`));
        setStatus('error');
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      addLog(`❌ Verification error: ${message}`);
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setStats(null);
    setResult(null);
    setVerification(null);
    setError(null);
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔄 Projects Migration Panel
          </h1>
          <p className="text-slate-300">
            Legacy system → Unified architecture
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Current Status */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${
                status === 'idle' ? 'bg-slate-400' :
                status === 'complete' ? 'bg-green-400 animate-pulse' :
                status === 'error' ? 'bg-red-400 animate-pulse' :
                'bg-yellow-400 animate-pulse'
              }`} />
              <h3 className="text-white font-semibold">Status</h3>
            </div>
            <p className="text-2xl font-bold text-white capitalize">
              {status === 'idle' ? 'Ready' : status}
            </p>
          </div>

          {/* Legacy Items */}
          {stats && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h3 className="text-white font-semibold">Legacy</h3>
              </div>
              <p className="text-2xl font-bold text-orange-400">
                {stats.legacyProjects}
              </p>
              <p className="text-sm text-slate-400 mt-1">Projects to migrate</p>
            </div>
          )}

          {/* Unified Items */}
          {stats && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <h3 className="text-white font-semibold">Unified</h3>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {stats.unifiedProjects}
              </p>
              <p className="text-sm text-slate-400 mt-1">Projects migrated</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8">
          <h3 className="text-white font-semibold mb-4">Actions</h3>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={checkStatus}
              disabled={status !== 'idle' && status !== 'error' && status !== 'complete'}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              {status === 'checking' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              Check Status
            </button>

            <button
              onClick={runMigration}
              disabled={status !== 'idle' && status !== 'error'}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              {status === 'running' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              Run Migration
            </button>

            <button
              onClick={verifyMigration}
              disabled={status === 'running' || status === 'checking'}
              className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              {status === 'verifying' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              Verify
            </button>

            <button
              onClick={reset}
              disabled={status === 'running' || status === 'checking' || status === 'verifying'}
              className="flex items-center gap-2 px-6 py-3 bg-slate-500 hover:bg-slate-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8">
            <h3 className="text-white font-semibold mb-4">Migration Results</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-green-500/20 rounded-xl p-4">
                <p className="text-sm text-green-300 mb-1">Migrated</p>
                <p className="text-3xl font-bold text-green-400">{result.migrated}</p>
              </div>
              <div className="bg-red-500/20 rounded-xl p-4">
                <p className="text-sm text-red-300 mb-1">Failed</p>
                <p className="text-3xl font-bold text-red-400">{result.failed}</p>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-4">
                <p className="text-sm text-blue-300 mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-blue-400">
                  {Math.round((result.migrated / (result.migrated + result.failed)) * 100)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-sm text-slate-400">Projects</p>
                <p className="text-xl font-bold text-white">{result.details.projects}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-sm text-slate-400">CocoBoards</p>
                <p className="text-xl font-bold text-white">{result.details.cocoboards}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-sm text-slate-400">User Indexes</p>
                <p className="text-xl font-bold text-white">{result.details.userIndexes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Verification */}
        {verification && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              {verification.valid ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              Verification Results
            </h3>

            {verification.valid ? (
              <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
                <p className="text-green-300 font-semibold">
                  ✅ Migration verified successfully! All data migrated correctly.
                </p>
              </div>
            ) : (
              <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/30">
                <p className="text-red-300 font-semibold mb-2">
                  ⚠️ Issues found:
                </p>
                <ul className="text-red-200 space-y-1">
                  {verification.issues.map((issue, i) => (
                    <li key={i}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-sm text-slate-400 mb-2">Legacy</p>
                <div className="space-y-1 text-sm">
                  <p className="text-white">Projects: {verification.stats.legacyProjects}</p>
                  <p className="text-white">CocoBoards: {verification.stats.legacyCocoBoards}</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-sm text-slate-400 mb-2">Unified</p>
                <div className="space-y-1 text-sm">
                  <p className="text-white">Projects: {verification.stats.unifiedProjects}</p>
                  <p className="text-white">CocoBoards: {verification.stats.unifiedCocoBoards}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30 mb-8">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-semibold mb-1">Error</h3>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4">Logs</h3>
          
          <div className="bg-black/60 rounded-xl p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-slate-500">No logs yet...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-green-400 mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Success Message */}
        {status === 'complete' && (
          <div className="mt-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">
                🎉 Migration Complete!
              </h2>
              <p className="text-slate-300 mb-6">
                All projects have been successfully migrated to the unified system.
              </p>
              <div className="inline-block bg-white/10 rounded-xl px-6 py-3">
                <p className="text-sm text-slate-400 mb-1">Next steps:</p>
                <ul className="text-white text-sm space-y-1 text-left">
                  <li>✅ Test project creation</li>
                  <li>✅ Test project retrieval</li>
                  <li>✅ Monitor for 7 days</li>
                  <li>✅ Clean up legacy keys (optional)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}