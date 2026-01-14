/**
 * TEST CREDITS PAGE
 * Debug page to test credits endpoints
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { publicAnonKey } from '../utils/supabase/info';

interface TestResult {
  name: string;
  url: string;
  status: 'pending' | 'success' | 'error';
  data?: any;
  error?: string;
  duration?: number;
}

export default function TestCreditsPage() {
  const [results, setResults] = useState<TestResult[]>([
    {
      name: 'Test 1: Routes Working',
      url: 'https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/credits/test',
      status: 'pending',
    },
    {
      name: 'Test 2: Debug DB',
      url: 'https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/credits/debug/google-oauth2%7C116660587569924383844',
      status: 'pending',
    },
    {
      name: 'Test 3: Normal Endpoint',
      url: 'https://emhevkgyqmsxqejbfgoq.supabase.co/functions/v1/make-server-e55aa214/credits/google-oauth2%7C116660587569924383844',
      status: 'pending',
    },
  ]);

  const runTests = async () => {
    // Reset all to pending
    setResults((prev) =>
      prev.map((r) => ({ ...r, status: 'pending' as const, data: undefined, error: undefined, duration: undefined }))
    );

    for (let i = 0; i < results.length; i++) {
      const test = results[i];
      const startTime = Date.now();

      try {
        console.log(`🧪 Running ${test.name}...`);
        const response = await fetch(test.url, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        const duration = Date.now() - startTime;

        console.log(`✅ ${test.name} SUCCESS:`, data);

        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i ? { ...r, status: 'success' as const, data, duration } : r
          )
        );
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        console.error(`❌ ${test.name} ERROR:`, errorMessage);

        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i ? { ...r, status: 'error' as const, error: errorMessage, duration } : r
          )
        );
      }
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            🔍 Credits Debug Tests
          </h1>
          <p className="text-white/60">
            Testing credits endpoints to diagnose the issue
          </p>
        </motion.div>

        {/* Refresh Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={runTests}
          className="mb-8 px-6 py-3 bg-gradient-to-r from-[#E87B35] to-[#FF6B35] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#E87B35]/20 transition-all"
        >
          🔄 Re-run Tests
        </motion.button>

        {/* Results Grid */}
        <div className="grid gap-6">
          {results.map((result, index) => (
            <motion.div
              key={result.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              {/* Test Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                  {result.status === 'pending' && (
                    <span className="text-yellow-400 animate-pulse">⏳</span>
                  )}
                  {result.status === 'success' && (
                    <span className="text-green-400">✅</span>
                  )}
                  {result.status === 'error' && (
                    <span className="text-red-400">❌</span>
                  )}
                  {result.name}
                </h2>
                {result.duration !== undefined && (
                  <span className="text-sm text-white/40">
                    {result.duration}ms
                  </span>
                )}
              </div>

              {/* URL */}
              <div className="mb-4 p-3 bg-black/30 rounded-lg">
                <p className="text-xs text-white/40 mb-1">Endpoint:</p>
                <code className="text-sm text-[#E87B35] break-all">
                  {result.url}
                </code>
              </div>

              {/* Result Data */}
              {result.status === 'success' && result.data && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-xs text-green-400 mb-2 font-semibold">
                    Response:
                  </p>
                  <pre className="text-xs text-white/80 overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}

              {/* Error */}
              {result.status === 'error' && result.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-xs text-red-400 mb-2 font-semibold">
                    Error:
                  </p>
                  <pre className="text-xs text-white/80">
                    {result.error}
                  </pre>
                </div>
              )}

              {/* Pending */}
              {result.status === 'pending' && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-xs text-yellow-400">
                    Testing...
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Analysis Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            📊 Analysis
          </h3>

          <div className="space-y-3 text-sm text-white/80">
            <div>
              <span className="font-semibold text-white">Test 1:</span> Should
              return{' '}
              <code className="text-[#E87B35]">
                {`{ success: true, message: "Credits routes are working!" }`}
              </code>
            </div>
            <div>
              <span className="font-semibold text-white">Test 2:</span> Should
              show the raw DB data including{' '}
              <code className="text-[#E87B35]">profile</code> and{' '}
              <code className="text-[#E87B35]">credits</code> objects
            </div>
            <div>
              <span className="font-semibold text-white">Test 3:</span> Should
              return formatted credits with{' '}
              <code className="text-[#E87B35]">
                {`{ free: 7500, paid: 0 }`}
              </code>
            </div>
          </div>

          {/* Diagnostic Logic */}
          {results.every((r) => r.status !== 'pending') && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm font-semibold text-blue-400 mb-2">
                🔍 Diagnostic:
              </p>
              {results[0].status === 'error' && (
                <p className="text-sm text-white/80">
                  ❌ Routes are not mounted correctly. Check{' '}
                  <code>/supabase/functions/server/index.tsx</code>
                </p>
              )}
              {results[0].status === 'success' &&
                results[1].status === 'success' &&
                results[1].data?.profile === null && (
                  <p className="text-sm text-white/80">
                    ❌ User profile not found in DB. The userId key may be
                    incorrect.
                  </p>
                )}
              {results[0].status === 'success' &&
                results[1].status === 'success' &&
                results[1].data?.profile &&
                !results[1].data.profile.freeCredits && (
                  <p className="text-sm text-white/80">
                    ❌ Profile exists but has no freeCredits property. Data
                    format issue.
                  </p>
                )}
              {results[0].status === 'success' &&
                results[2].status === 'success' &&
                results[2].data?.credits &&
                Object.keys(results[2].data.credits).length === 0 && (
                  <p className="text-sm text-white/80">
                    ❌ Normal endpoint returns empty credits object. Backend
                    logic error.
                  </p>
                )}
              {results.every((r) => r.status === 'success') &&
                results[2].data?.credits?.free > 0 && (
                  <p className="text-sm text-green-400">
                    ✅ All tests passed! Credits are working correctly.
                  </p>
                )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}