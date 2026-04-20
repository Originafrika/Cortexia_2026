import type { Screen } from '../App';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useCredits } from '../lib/contexts/CreditsContext';
import { useAuth } from '../lib/contexts/AuthContext'; // ✅ Import AuthContext
import { useTranslation } from '../lib/i18n'; // ✅ NEW: i18n hook
import { LanguageSwitcher } from './LanguageSwitcher'; // ✅ NEW: Language switcher

// Icons inline
const X = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const Zap = ({ className, size, fill }: { className?: string; size?: number; fill?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill={fill || "none"}
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const Gem = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="12 2 2 7 12 22 22 7 12 2"></polygon>
    <polyline points="12 22 12 7"></polyline>
    <polyline points="2 7 22 7"></polyline>
    <polyline points="6 2 6 7"></polyline>
    <polyline points="18 2 18 7"></polyline>
  </svg>
);

const ImageIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

const Video = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="23 7 16 12 23 17 23 7"></polygon>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
  </svg>
);

const Gift = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 12 20 22 4 22 4 12"></polyline>
    <rect x="2" y="7" width="20" height="5"></rect>
    <line x1="12" y1="22" x2="12" y2="7"></line>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
  </svg>
);

interface WalletProps {
  onNavigate: (screen: Screen) => void;
}

const CREDIT_PACKS = [
  { credits: 100, price: '$9.99', bonus: null, popular: false },
  { credits: 500, price: '$39.99', bonus: '+50 bonus', popular: true },
  { credits: 1000, price: '$69.99', bonus: '+150 bonus', popular: false },
  { credits: 5000, price: '$299.99', bonus: '+1000 bonus', popular: false },
];

// Individual Africa: Custom amount purchase (Fedapay)
const handlePurchaseCredits = async (amount: number, customAmount?: number) => {
  if (!user) return;
  
  // Enterprise: Stripe
  if (user.type === 'enterprise' || user.type === 'enterprise_admin') {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'credits',
          credits: amount,
        }),
      });
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Stripe checkout error:', err);
    }
    return;
  }
  
  // Individual: Fedapay (Africa) or custom
  try {
    const country = user.fedapayCountry || 'CI';
    const response = await fetch('/api/fedapay/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: customAmount || (amount * 0.10), // Approximate XOF
        phone: user.fedapayPhoneNumber || '',
        country: country,
        credits: amount,
      }),
    });
    const { checkoutUrl } = await response.json();
    if (checkoutUrl) window.location.href = checkoutUrl;
  } catch (err) {
    console.error('Fedapay checkout error:', err);
  }
};

const GENERATION_COSTS = [
  { type: 'Image', icon: ImageIcon, cost: '1 credit', duration: null },
  { type: 'Video 5s', icon: Video, cost: '5 credits', duration: '5s' },
  { type: 'Video 10s', icon: Video, cost: '10 credits', duration: '10s' },
  { type: 'Video 15s', icon: Video, cost: '15 credits', duration: '15s' },
];

export function Wallet({ onNavigate }: WalletProps) {
  const { credits } = useCredits(); // ✅ Get real credits from context
  const { user } = useAuth(); // ✅ Get user from AuthContext
  const { t, formatDate: i18nFormatDate } = useTranslation(); // ✅ NEW: i18n hook
  const [loading, setLoading] = useState(true);
  const [originsBalance, setOriginsBalance] = useState(0);
  const [creditTransactions, setCreditTransactions] = useState<any[]>([]);
  const [originsTransactions, setOriginsTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'credits' | 'origins'>('credits');
  const [creditsExpiresAt, setCreditsExpiresAt] = useState<string | null>(null);
  
  // ✅ NEW: Referral data
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralCount, setReferralCount] = useState<number>(0);
  const [referralEarnings, setReferralEarnings] = useState<number>(0);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  // ✅ Calculate total credits (free + paid)
  const totalCredits = typeof credits === 'object' && credits !== null
    ? (credits.free || 0) + (credits.paid || 0)
    : 0;

  useEffect(() => {
    if (user?.id) {
      loadWalletData();
    } else {
      setLoading(false);
    }
  }, [user?.id]); // ✅ Reload when userId changes

  const loadWalletData = async () => {
    try {
      const userId = user?.id; // ✅ Use user.id from AuthContext
      if (!userId) {
        setLoading(false);
        return;
      }

      const apiUrl = '/api';

      // ✅ Load credits info including expiration
      const creditsRes = await fetch(`${apiUrl}/credits?userId=${userId}`);
      if (creditsRes.ok) {
        const { credits: creditsData } = await creditsRes.json();
        if (creditsData?.expiresAt) {
          setCreditsExpiresAt(creditsData.expiresAt);
        }
      }

      // Load Origins wallet
      const walletRes = await fetch(`${apiUrl}/origins/wallet/${userId}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (walletRes.ok) {
        const { wallet } = await walletRes.json();
        setOriginsBalance(wallet.balance || 0);
      }

      // Load Origins transactions
      const transactionsRes = await fetch(`${apiUrl}/origins/transactions/${userId}?limit=20`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (transactionsRes.ok) {
        const { transactions } = await transactionsRes.json();
        setOriginsTransactions(transactions || []);
      }

      // ✅ NEW: Load real credit history from activity-history
      const activityRes = await fetch(`${apiUrl}/user-stats/${userId}/activity-history?limit=20`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (activityRes.ok) {
        const { history } = await activityRes.json();
        
        // Map generations to credit transactions
        const creditTxs = history.map((gen: any) => ({
          action: gen.type === 'video' 
            ? `Video generated (${gen.duration || 0}s)` 
            : 'Image generated',
          credits: -gen.cost, // Negative = debit
          date: gen.createdAt,
          type: 'debit',
          status: gen.status,
          imageUrl: gen.imageUrl
        }));
        
        setCreditTransactions(creditTxs);
        console.log('✅ [Wallet] Loaded real credit transactions:', creditTxs.length);
      } else {
        console.error('❌ [Wallet] Failed to load activity history');
        // Fallback to empty array instead of mock data
        setCreditTransactions([]);
      }

      // ✅ NEW: Load referral data
      const referralRes = await fetch(`${apiUrl}/users/${userId}/referral-details`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (referralRes.ok) {
        const data = await referralRes.json();
        setReferralCode(data.referralCode || '');
        setReferralCount(data.referralCount || 0);
        setReferralEarnings(data.referralEarnings || 0);
        setReferrals(data.referrals || []);
        console.log('✅ [Wallet] Loaded referral data:', data);
      } else {
        console.error('❌ [Wallet] Failed to load referral data');
        // Fallback to default values
        setReferralCode('');
        setReferralCount(0);
        setReferralEarnings(0);
        setReferrals([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load wallet:', error);
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // ✅ NEW: Copy referral code handler
  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end"
      onClick={() => onNavigate('profile')}
    >
      <div className="absolute inset-0 bg-black/60" />
      
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-[90vh] flex flex-col rounded-t-2xl overflow-hidden"
        style={{
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(26, 26, 26, 0.98)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-3">
          <div className="w-12 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4">
          <h1 className="text-white text-xl">{t('wallet.title')}</h1>
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="compact" />
            <button onClick={() => onNavigate('profile')}>
              <X className="text-white" size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/60">Loading...</p>
            </div>
          ) : (
            <>
              {/* Balance Cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Credits Balance */}
                <div className="bg-gradient-to-br from-[#6366f1] to-[#4f46e5] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="text-white" size={20} fill="white" />
                    <p className="text-white/80 text-sm">Credits</p>
                  </div>
                  <h2 className="text-white text-3xl mb-2">{totalCredits}</h2>
                  
                  {/* ✅ NEW: Détail free vs paid */}
                  <div className="flex items-center gap-3 text-xs mb-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-white/60">{credits.free || 0} gratuits</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      <span className="text-white/60">{credits.paid || 0} payants</span>
                    </div>
                  </div>
                  
                  {creditsExpiresAt && (
                    <p className="text-white/60 text-xs mt-2">
                      ⏰ Expire: {i18nFormatDate(creditsExpiresAt)}
                    </p>
                  )}
                </div>

                {/* Origins Balance */}
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gem className="text-white" size={20} />
                    <p className="text-white/80 text-sm">Origins</p>
                  </div>
                  <h2 className="text-white text-3xl">{originsBalance.toFixed(0)}</h2>
                  <p className="text-white/60 text-xs mt-1">≈ ${originsBalance.toFixed(2)}</p>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex gap-2 mb-4 bg-[#1A1A1A] p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('credits')}
                  className={`flex-1 py-2 rounded-md transition-colors ${
                    activeTab === 'credits'
                      ? 'bg-[#6366f1] text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Credits
                </button>
                <button
                  onClick={() => setActiveTab('origins')}
                  className={`flex-1 py-2 rounded-md transition-colors ${
                    activeTab === 'origins'
                      ? 'bg-purple-600 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Origins
                </button>
              </div>

              {activeTab === 'credits' ? (
                <>
                  {/* Purchase Packs */}
                  <div className="mb-6">
                    <h3 className="text-white text-lg mb-4">Acheter des Crédits</h3>
                    <div className="space-y-3">
                      {CREDIT_PACKS.map((pack, idx) => (
                        <div 
                          key={idx}
                          className={`relative bg-[#1A1A1A] rounded-lg p-4 ${
                            pack.popular ? 'ring-2 ring-[#6366f1]' : ''
                          }`}
                        >
                          {pack.popular && (
                            <div className="absolute -top-2 left-4 px-3 py-1 bg-[#6366f1] rounded-full text-white text-xs">
                              Most Popular
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <Zap className="text-[#6366f1]" size={20} fill="#6366f1" />
                                <span className="text-white text-lg">{pack.credits} credits</span>
                              </div>
                              {pack.bonus && (
                                <span className="text-[#6366f1] text-sm">{pack.bonus}</span>
                              )}
                            </div>
                            <span className="text-white text-xl">{pack.price}</span>
                          </div>
                          <button 
                            className="w-full py-3 bg-[#6366f1] rounded-lg text-white hover:bg-[#6366f1]/90 transition-colors"
                            onClick={() => handlePurchaseCredits(pack.credits)}
                          >
                            Acheter
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Generation Costs */}
                  <div className="mb-6">
                    <h3 className="text-white text-lg mb-4">Coûts de Génération</h3>
                    <div className="bg-[#1A1A1A] rounded-lg overflow-hidden">
                      {GENERATION_COSTS.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div 
                            key={idx}
                            className={`flex items-center justify-between p-4 ${
                              idx < GENERATION_COSTS.length - 1 ? 'border-b border-gray-800' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#262626] rounded-full flex items-center justify-center">
                                <Icon className="text-[#6366f1]" size={20} />
                              </div>
                              <span className="text-white">{item.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Zap className="text-[#6366f1]" size={16} fill="#6366f1" />
                              <span className="text-[#6366f1]">{item.cost}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Credit Transactions */}
                  <div className="mb-6">
                    <h3 className="text-white text-lg mb-4">Recent Transactions</h3>
                    <div className="space-y-2">
                      {creditTransactions.length > 0 ? (
                        creditTransactions.map((transaction, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg">
                            <div>
                              <p className="text-white">{transaction.action}</p>
                              <p className="text-gray-400 text-sm">{i18nFormatDate(transaction.date)}</p>
                            </div>
                            <span className={`${
                              transaction.credits > 0 ? 'text-green-500' : 'text-gray-400'
                            }`}>
                              {transaction.credits > 0 ? '+' : ''}{transaction.credits}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-white/60 text-center py-8">No transactions yet</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Origins Info */}
                  <div className="mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gem className="text-purple-400" size={20} />
                      <h3 className="text-white">Origins Currency</h3>
                    </div>
                    <p className="text-white/80 text-sm mb-2">
                      Gagnez des Origins via le programme Creator (commissions de parrainage)
                    </p>
                    <p className="text-white/60 text-xs">
                      1 Origin = $1 USD • Retrait via Stripe (2x/mois max)
                    </p>
                  </div>

                  {/* ✅ NEW: Referral Section */}
                  <div className="mb-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Gift className="text-green-400" size={20} />
                        <h3 className="text-white">{t('wallet.referral.title')}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-xs">{t('wallet.referral.commission')}</p>
                        <p className="text-green-400 text-lg font-semibold">10%</p>
                      </div>
                    </div>
                    
                    {/* Mon Code */}
                    <div className="mb-4">
                      <label className="text-white/60 text-sm mb-2 block">{t('wallet.referral.myCode')}</label>
                      <div className="flex gap-2">
                        <input
                          value={referralCode || 'LOADING...'}
                          readOnly
                          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-center text-lg font-mono tracking-wider"
                        />
                        <button
                          onClick={copyReferralCode}
                          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white transition-colors"
                        >
                          {copied ? t('wallet.referral.copied') : t('wallet.referral.copy')}
                        </button>
                      </div>
                      <p className="text-white/40 text-xs mt-2">
                        {t('wallet.referral.shareToEarn')}
                      </p>
                    </div>
                    
                    {/* Mes Filleuls */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white/80">{t('wallet.referral.myReferrals')}</p>
                        <span className="bg-white/10 px-2 py-1 rounded text-white text-sm">
                          {referralCount}
                        </span>
                      </div>
                      
                      {referrals.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {referrals.map((ref, i) => (
                            <div key={i} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                              <div>
                                <p className="text-white text-sm">{ref.userName || 'User #' + (i+1)}</p>
                                <p className="text-white/40 text-xs">
                                  {t('wallet.referral.signedUp', { date: i18nFormatDate(ref.signupDate) })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-green-400 text-sm font-semibold">
                                  +${ref.commissionEarned.toFixed(2)}
                                </p>
                                <p className="text-white/40 text-xs">{t('wallet.referral.creditsSpent', { count: ref.totalCreditsSpent })}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-white/5 rounded-lg">
                          <p className="text-white/60 text-sm">{t('wallet.referral.noReferrals')}</p>
                          <p className="text-white/40 text-xs mt-1">
                            {t('wallet.referral.shareToEarn')}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Total Earnings */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <p className="text-white/80">{t('wallet.referral.totalEarnings')}</p>
                        <p className="text-green-400 text-xl font-semibold">
                          ${referralEarnings.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-white/40 text-xs mt-1">
                        {t('wallet.referral.autoConvert')}
                      </p>
                    </div>
                  </div>

                  {/* Origins Transactions */}
                  <div className="mb-6">
                    <h3 className="text-white text-lg mb-4">Historique Origins</h3>
                    <div className="space-y-2">
                      {originsTransactions.length > 0 ? (
                        originsTransactions.map((transaction, idx) => (
                          <div key={idx} className="p-4 bg-[#1A1A1A] rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-white">{transaction.description || transaction.type}</p>
                              <span className={`text-lg ${
                                transaction.amount > 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-gray-400 text-sm">{i18nFormatDate(transaction.date)}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                transaction.status === 'completed'
                                  ? 'bg-green-500/20 text-green-400'
                                  : transaction.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <Gem className="text-white/20 mx-auto mb-4" size={48} />
                          <p className="text-white/60 mb-2">Aucune transaction Origins</p>
                          <p className="text-white/40 text-sm">
                            Parrainez des utilisateurs pour gagner des Origins!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Withdrawal Info */}
                  {originsBalance > 0 && (
                    <div className="mb-6 bg-[#1A1A1A] rounded-lg p-4">
                      <h3 className="text-white mb-2">Retrait disponible</h3>
                      <p className="text-white/60 text-sm mb-3">
                        Retirez vos Origins vers votre compte Stripe
                      </p>
                      <button 
                        onClick={() => onNavigate('creator-dashboard')}
                        className="w-full py-3 bg-purple-600 rounded-lg text-white hover:bg-purple-600/90 transition-colors"
                      >
                        Aller au Dashboard Créateur
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}