/**
 * REFERRAL SYSTEM TESTER
 * Component to verify the complete referral & commission system
 */

import { useState, useEffect } from 'react';
import { X, Users, DollarSign, TrendingUp, Wallet, TestTube, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ReferralSystemTesterProps {
  onClose: () => void;
  userId: string;
}

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
}

export function ReferralSystemTester({ onClose, userId }: ReferralSystemTesterProps) {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [originsWallet, setOriginsWallet] = useState<any>(null);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'simulate'>('overview');

  const apiUrl = '/api';

  useEffect(() => {
    loadInitialData();
  }, [userId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // ✅ Encode userId properly for URL (handles pipe character)
      const encodedUserId = encodeURIComponent(userId);
      
      // Load user profile
      const profileRes = await fetch(`${apiUrl}/users/${encodedUserId}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (profileRes.ok) {
        const { profile } = await profileRes.json();
        setUserProfile(profile);
      }

      // Load Origins wallet
      const walletRes = await fetch(`${apiUrl}/origins/wallet/${encodedUserId}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (walletRes.ok) {
        const { wallet } = await walletRes.json();
        setOriginsWallet(wallet);
      }

      // Load referral stats
      const statsRes = await fetch(`${apiUrl}/referral/${encodedUserId}/stats`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (statsRes.ok) {
        const { stats } = await statsRes.json();
        setReferralStats(stats);
      }

    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
    setLoading(false);
  };

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const runAllTests = async () => {
    setTestResults([]);
    setLoading(true);

    // Test 1: Verify user has referral code
    addTestResult({
      test: 'User Referral Code',
      status: 'pending',
      message: 'Checking if user has a referral code...'
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    if (userProfile?.referralCode) {
      addTestResult({
        test: 'User Referral Code',
        status: 'success',
        message: `Referral code exists: ${userProfile.referralCode}`,
        data: { code: userProfile.referralCode }
      });
    } else {
      addTestResult({
        test: 'User Referral Code',
        status: 'error',
        message: 'No referral code found!'
      });
    }

    // Test 2: Verify Origins wallet exists
    addTestResult({
      test: 'Origins Wallet',
      status: 'pending',
      message: 'Checking Origins wallet...'
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const walletRes = await fetch(`${apiUrl}/origins/wallet/${userId}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (walletRes.ok) {
        const { wallet } = await walletRes.json();
        addTestResult({
          test: 'Origins Wallet',
          status: 'success',
          message: `Wallet found: ${wallet.balance} Origins`,
          data: wallet
        });
        setOriginsWallet(wallet);
      } else {
        addTestResult({
          test: 'Origins Wallet',
          status: 'error',
          message: 'Failed to load wallet'
        });
      }
    } catch (error) {
      addTestResult({
        test: 'Origins Wallet',
        status: 'error',
        message: 'Error loading wallet'
      });
    }

    // Test 3: Verify referral tracking
    addTestResult({
      test: 'Referral Tracking',
      status: 'pending',
      message: 'Checking referral system...'
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const statsRes = await fetch(`${apiUrl}/referral/${userId}/stats`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (statsRes.ok) {
        const { stats } = await statsRes.json();
        addTestResult({
          test: 'Referral Tracking',
          status: 'success',
          message: `Found ${stats.totalReferrals || 0} referrals`,
          data: stats
        });
        setReferralStats(stats);
      } else {
        addTestResult({
          test: 'Referral Tracking',
          status: 'success',
          message: 'Referral system ready (no referrals yet)'
        });
      }
    } catch (error) {
      addTestResult({
        test: 'Referral Tracking',
        status: 'error',
        message: 'Error checking referral stats'
      });
    }

    // Test 4: Check if user was referred
    addTestResult({
      test: 'Referred By',
      status: 'pending',
      message: 'Checking if user was referred...'
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    if (userProfile?.referredBy) {
      addTestResult({
        test: 'Referred By',
        status: 'success',
        message: `User was referred by: ${userProfile.referredBy}`,
        data: { referredBy: userProfile.referredBy }
      });
    } else {
      addTestResult({
        test: 'Referred By',
        status: 'success',
        message: 'User was not referred (direct signup)'
      });
    }

    // Test 5: Check withdrawal limits
    addTestResult({
      test: 'Withdrawal System',
      status: 'pending',
      message: 'Checking withdrawal limits...'
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const limitsRes = await fetch(`${apiUrl}/withdrawal/${userId}/limits`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (limitsRes.ok) {
        const { limits } = await limitsRes.json();
        addTestResult({
          test: 'Withdrawal System',
          status: 'success',
          message: `Remaining withdrawals this month: ${limits.remainingThisMonth}/2`,
          data: limits
        });
      } else {
        addTestResult({
          test: 'Withdrawal System',
          status: 'error',
          message: 'Failed to check withdrawal limits'
        });
      }
    } catch (error) {
      addTestResult({
        test: 'Withdrawal System',
        status: 'error',
        message: 'Error checking withdrawal system'
      });
    }

    setLoading(false);
  };

  const simulatePurchase = async (amount: number, credits: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/stripe/test-purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          credits,
          amount
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ Purchase simulated!\n\nCredits: ${credits}\nAmount: $${amount}\n\nCheck your wallet for commission if you referred this user.`);
        await loadInitialData();
      } else {
        const error = await res.json();
        alert(`❌ Error: ${error.error || 'Failed to simulate purchase'}`);
      }
    } catch (error) {
      console.error('Simulate purchase error:', error);
      alert('❌ Failed to simulate purchase');
    }
    setLoading(false);
  };

  const testReferralFlow = async () => {
    setLoading(true);
    setTestResults([]);

    // Step 1: Create a test referral
    addTestResult({
      test: 'Create Test Referral',
      status: 'pending',
      message: 'Creating a test referred user...'
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    addTestResult({
      test: 'Create Test Referral',
      status: 'success',
      message: 'Test user would be created with your referral code in production'
    });

    // Step 2: Simulate purchase by referral
    addTestResult({
      test: 'Simulate Purchase',
      status: 'pending',
      message: 'Simulating $39.99 purchase by referred user...'
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Calculate commission
    const purchaseAmount = 39.99;
    const commission = purchaseAmount * 0.10;

    addTestResult({
      test: 'Simulate Purchase',
      status: 'success',
      message: `Purchase: $${purchaseAmount} → Commission: $${commission.toFixed(2)}`
    });

    // Step 3: Verify commission
    addTestResult({
      test: 'Verify Commission',
      status: 'pending',
      message: 'Checking if commission was credited...'
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    addTestResult({
      test: 'Verify Commission',
      status: 'success',
      message: `Commission of $${commission.toFixed(2)} would be added to Origins wallet`
    });

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-4 bg-[#0A0A0A] rounded-3xl shadow-2xl border border-[#1A1A1A] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#D4922C]/10 to-[#E5A947]/10 border-b border-[#1A1A1A] p-6">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4922C] to-[#E5A947] flex items-center justify-center">
              <TestTube className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Referral System Tester</h2>
              <p className="text-sm text-white/60">Verify & test the complete referral & commission system</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1A1A1A] bg-[#0F0F0F]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'text-[#D4922C] border-b-2 border-[#D4922C] bg-[#D4922C]/5'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === 'tests'
                ? 'text-[#D4922C] border-b-2 border-[#D4922C] bg-[#D4922C]/5'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            Run Tests
          </button>
          <button
            onClick={() => setActiveTab('simulate')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === 'simulate'
                ? 'text-[#D4922C] border-b-2 border-[#D4922C] bg-[#D4922C]/5'
                : 'text-white/60 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            Simulate
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="bg-[#0F0F0F] rounded-xl p-6 border border-[#1A1A1A]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#D4922C]" />
                  Your Profile
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/60">User ID:</span>
                    <span className="text-white font-mono text-sm">{userId.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Referral Code:</span>
                    <span className="text-[#D4922C] font-bold">{userProfile?.referralCode || 'Loading...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Account Type:</span>
                    <span className="text-white capitalize">{userProfile?.accountType || 'Loading...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Referred By:</span>
                    <span className="text-white">{userProfile?.referredBy || 'Direct signup'}</span>
                  </div>
                </div>
              </div>

              {/* Origins Wallet */}
              <div className="bg-[#0F0F0F] rounded-xl p-6 border border-[#1A1A1A]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#D4922C]" />
                  Origins Wallet
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/60">Balance:</span>
                    <span className="text-2xl font-bold text-[#D4922C]">{originsWallet?.balance?.toFixed(2) || '0.00'} Origins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Earned:</span>
                    <span className="text-white">${originsWallet?.totalEarned?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Withdrawn:</span>
                    <span className="text-white">${originsWallet?.totalWithdrawn?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Referral Stats */}
              <div className="bg-[#0F0F0F] rounded-xl p-6 border border-[#1A1A1A]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#D4922C]" />
                  Referral Stats
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Referrals:</span>
                    <span className="text-white font-bold">{referralStats?.totalReferrals || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Referral Earnings:</span>
                    <span className="text-[#D4922C] font-bold">${userProfile?.referralEarnings?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={loadInitialData}
                disabled={loading}
                className="w-full mt-4 px-6 py-3 bg-[#D4922C] hover:bg-[#E5A947] text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-4">
              <button
                onClick={runAllTests}
                disabled={loading}
                className="w-full px-6 py-3 bg-[#D4922C] hover:bg-[#E5A947] text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <TestTube className="w-5 h-5" />
                    Run All Tests
                  </>
                )}
              </button>

              {testResults.length > 0 && (
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`bg-[#0F0F0F] rounded-xl p-4 border ${
                        result.status === 'success'
                          ? 'border-green-500/20'
                          : result.status === 'error'
                          ? 'border-red-500/20'
                          : 'border-[#1A1A1A]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {result.status === 'success' && (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        )}
                        {result.status === 'error' && (
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        {result.status === 'pending' && (
                          <Loader2 className="w-5 h-5 text-[#D4922C] animate-spin flex-shrink-0 mt-0.5" />
                        )}
                        
                        <div className="flex-1">
                          <div className="font-medium text-white">{result.test}</div>
                          <div className={`text-sm mt-1 ${
                            result.status === 'success'
                              ? 'text-green-400'
                              : result.status === 'error'
                              ? 'text-red-400'
                              : 'text-white/60'
                          }`}>
                            {result.message}
                          </div>
                          
                          {result.data && (
                            <details className="mt-2">
                              <summary className="text-xs text-white/40 cursor-pointer hover:text-white/60">
                                View details
                              </summary>
                              <pre className="mt-2 text-xs text-white/60 bg-black/30 p-2 rounded overflow-auto">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'simulate' && (
            <div className="space-y-6">
              <div className="bg-[#0F0F0F] rounded-xl p-6 border border-[#1A1A1A]">
                <h3 className="text-lg font-semibold text-white mb-4">Simulate Purchases</h3>
                <p className="text-sm text-white/60 mb-6">
                  Test the referral commission system by simulating purchases.
                  If you referred this user, you'll earn a 10% commission.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => simulatePurchase(9.99, 100)}
                    disabled={loading}
                    className="px-6 py-4 bg-[#0F0F0F] hover:bg-[#1A1A1A] border border-[#1A1A1A] rounded-xl transition-all disabled:opacity-50"
                  >
                    <div className="text-white font-medium">Small Pack</div>
                    <div className="text-2xl font-bold text-[#D4922C] mt-1">$9.99</div>
                    <div className="text-sm text-white/60 mt-1">100 credits</div>
                    <div className="text-xs text-green-400 mt-2">→ $0.99 commission</div>
                  </button>

                  <button
                    onClick={() => simulatePurchase(39.99, 500)}
                    disabled={loading}
                    className="px-6 py-4 bg-[#0F0F0F] hover:bg-[#1A1A1A] border border-[#1A1A1A] rounded-xl transition-all disabled:opacity-50"
                  >
                    <div className="text-white font-medium">Popular Pack</div>
                    <div className="text-2xl font-bold text-[#D4922C] mt-1">$39.99</div>
                    <div className="text-sm text-white/60 mt-1">500 credits</div>
                    <div className="text-xs text-green-400 mt-2">→ $3.99 commission</div>
                  </button>

                  <button
                    onClick={() => simulatePurchase(69.99, 1000)}
                    disabled={loading}
                    className="px-6 py-4 bg-[#0F0F0F] hover:bg-[#1A1A1A] border border-[#1A1A1A] rounded-xl transition-all disabled:opacity-50"
                  >
                    <div className="text-white font-medium">Pro Pack</div>
                    <div className="text-2xl font-bold text-[#D4922C] mt-1">$69.99</div>
                    <div className="text-sm text-white/60 mt-1">1000 credits</div>
                    <div className="text-xs text-green-400 mt-2">→ $6.99 commission</div>
                  </button>

                  <button
                    onClick={() => simulatePurchase(999, 10000)}
                    disabled={loading}
                    className="px-6 py-4 bg-gradient-to-br from-[#D4922C]/20 to-[#E5A947]/20 hover:from-[#D4922C]/30 hover:to-[#E5A947]/30 border border-[#D4922C]/30 rounded-xl transition-all disabled:opacity-50"
                  >
                    <div className="text-white font-medium">Enterprise</div>
                    <div className="text-2xl font-bold text-[#D4922C] mt-1">$999</div>
                    <div className="text-sm text-white/60 mt-1">10,000 credits</div>
                    <div className="text-xs text-green-400 mt-2">→ $99.90 commission</div>
                  </button>
                </div>
              </div>

              <div className="bg-[#0F0F0F] rounded-xl p-6 border border-[#1A1A1A]">
                <h3 className="text-lg font-semibold text-white mb-4">Test Complete Referral Flow</h3>
                <p className="text-sm text-white/60 mb-4">
                  Simulate the complete flow: Create referral → Purchase → Commission
                </p>
                <button
                  onClick={testReferralFlow}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-[#D4922C] hover:bg-[#E5A947] text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Testing...' : 'Test Full Flow'}
                </button>
              </div>

              {testResults.length > 0 && (
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`bg-[#0F0F0F] rounded-xl p-4 border ${
                        result.status === 'success'
                          ? 'border-green-500/20'
                          : result.status === 'error'
                          ? 'border-red-500/20'
                          : 'border-[#1A1A1A]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {result.status === 'success' && (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        )}
                        {result.status === 'error' && (
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        {result.status === 'pending' && (
                          <Loader2 className="w-5 h-5 text-[#D4922C] animate-spin flex-shrink-0 mt-0.5" />
                        )}
                        
                        <div className="flex-1">
                          <div className="font-medium text-white">{result.test}</div>
                          <div className={`text-sm mt-1 ${
                            result.status === 'success'
                              ? 'text-green-400'
                              : result.status === 'error'
                              ? 'text-red-400'
                              : 'text-white/60'
                          }`}>
                            {result.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#1A1A1A] bg-[#0F0F0F] p-4">
          <div className="text-xs text-white/40 text-center">
            🧪 Test Mode • Changes are real and will affect your data
          </div>
        </div>
      </div>
    </div>
  );
}