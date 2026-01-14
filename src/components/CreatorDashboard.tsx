import type { Screen } from '../App';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from '../lib/contexts/AuthContext'; // ✅ Import AuthContext

// Icons inline
const ArrowLeft = ({ className, size }: { className?: string; size?: number }) => (
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
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const Copy = ({ className, size }: { className?: string; size?: number }) => (
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
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const Share2 = ({ className, size }: { className?: string; size?: number }) => (
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
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
);

const Check = ({ className, size }: { className?: string; size?: number }) => (
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
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const Flame = ({ className, size }: { className?: string; size?: number }) => (
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
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
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

interface CreatorDashboardProps {
  onNavigate: (screen: Screen) => void;
}

export function CreatorDashboard({ onNavigate }: CreatorDashboardProps) {
  const { user } = useAuth(); // ✅ Get user from AuthContext
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Origins & Compensation data
  const [originsBalance, setOriginsBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [eligible, setEligible] = useState(false);
  
  // Défi 60+ stats
  const [imagesGenerated, setImagesGenerated] = useState(0);
  const [postsPublished, setPostsPublished] = useState(0);
  const [postsWithLikes, setPostsWithLikes] = useState(0);
  
  // Withdrawal
  const [withdrawalLimits, setWithdrawalLimits] = useState({ remaining: 0, max: 2 });
  
  // Referral
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]); // ✅ Reload when userId changes

  const loadDashboardData = async () => {
    try {
      const userId = user?.id; // ✅ Get userId from AuthContext
      console.log('🔧 [CreatorDashboard] Loading data for userId:', userId);
      
      if (!userId) {
        console.warn('⚠️ [CreatorDashboard] No userId found');
        setLoading(false);
        return;
      }

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      // Load Origins wallet
      console.log('📞 [CreatorDashboard] Fetching Origins wallet...');
      const walletRes = await fetch(`${apiUrl}/origins/wallet/${userId}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      console.log('📥 [CreatorDashboard] Wallet response status:', walletRes.status);
      
      if (walletRes.ok) {
        const walletData = await walletRes.json();
        console.log('✅ [CreatorDashboard] Wallet data:', walletData);
        setOriginsBalance(walletData.wallet?.balance || 0);
        setTotalEarned(walletData.wallet?.totalEarned || 0);
      } else {
        console.error('❌ [CreatorDashboard] Wallet fetch failed:', await walletRes.text());
      }

      // Load Compensation status
      console.log('📞 [CreatorDashboard] Fetching Compensation status...');
      const compensationRes = await fetch(`${apiUrl}/compensation/${userId}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      console.log('📥 [CreatorDashboard] Compensation response status:', compensationRes.status);
      
      if (compensationRes.ok) {
        const compensationData = await compensationRes.json();
        console.log('✅ [CreatorDashboard] Compensation data:', compensationData);
        setStreak(compensationData.compensation?.currentStreak || 0);
        setMultiplier(compensationData.compensation?.currentMultiplier || 1.0);
        setEligible(compensationData.compensation?.isEligible || false);
        setMonthlyEarnings(compensationData.compensation?.monthlyEarnings || 0);
        setImagesGenerated(compensationData.compensation?.monthlyStats?.imagesGenerated || 0);
        setPostsPublished(compensationData.compensation?.monthlyStats?.postsPublished || 0);
        setPostsWithLikes(compensationData.compensation?.monthlyStats?.postsWithEnoughLikes || 0);
      } else {
        console.error('❌ [CreatorDashboard] Compensation fetch failed:', await compensationRes.text());
      }

      // Load Withdrawal limits
      console.log('📞 [CreatorDashboard] Fetching Withdrawal limits...');
      const limitsRes = await fetch(`${apiUrl}/withdrawal/${userId}/limits`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      console.log('📥 [CreatorDashboard] Limits response status:', limitsRes.status);
      
      if (limitsRes.ok) {
        const limitsData = await limitsRes.json();
        console.log('✅ [CreatorDashboard] Limits data:', limitsData);
        setWithdrawalLimits({
          remaining: limitsData.limits?.remainingThisMonth || 0,
          max: limitsData.limits?.maxPerMonth || 2
        });
      } else {
        console.error('❌ [CreatorDashboard] Limits fetch failed:', await limitsRes.text());
      }

      // Load Referral link
      console.log('📞 [CreatorDashboard] Fetching Referral link...');
      const referralRes = await fetch(`${apiUrl}/referral/${userId}/link`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      console.log('📥 [CreatorDashboard] Referral response status:', referralRes.status);
      
      if (referralRes.ok) {
        const referralData = await referralRes.json();
        console.log('✅ [CreatorDashboard] Referral data:', referralData);
        setReferralCode(referralData.referralCode || '');
        setReferralLink(referralData.referralLink || '');
        setReferralCount(referralData.referralCount || 0);
      } else {
        console.error('❌ [CreatorDashboard] Referral fetch failed:', await referralRes.text());
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ [CreatorDashboard] Failed to load dashboard:', error);
      setLoading(false);
    }
  };

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Cortexia Creation Hub',
          text: `Join me on Cortexia and get 25 free credits! Use my referral code: ${referralCode}`,
          url: referralLink
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyReferralLink();
    }
  };

  const handleWithdraw = () => {
    // TODO: Implement withdrawal flow
    alert('Withdrawal feature coming soon!');
  };

  const today = new Date();
  const currentDay = today.getDate();
  const canWithdraw = (currentDay === 1 || currentDay === 15) && withdrawalLimits.remaining > 0 && originsBalance >= 50;
  
  const nextWithdrawalDate = currentDay < 15 
    ? `15 ${today.toLocaleString('en', { month: 'long', year: 'numeric' })}`
    : `1 ${new Date(today.getFullYear(), today.getMonth() + 1).toLocaleString('en', { month: 'long', year: 'numeric' })}`;

  const defi60Goals = [
    { 
      label: 'Images générées', 
      current: imagesGenerated, 
      target: 60, 
      description: 'Générer 60 images ce mois'
    },
    { 
      label: 'Posts publiés', 
      current: postsPublished, 
      target: 5, 
      description: 'Publier 5 posts au feed'
    },
    { 
      label: 'Posts avec 5+ likes', 
      current: postsWithLikes, 
      target: 5, 
      description: '5 posts avec 5+ likes chacun'
    },
  ];

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black z-10 px-4 pt-12 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('profile')}>
            <ArrowLeft className="text-white" size={24} />
          </button>
          <h1 className="text-white text-xl">Creator Dashboard</h1>
        </div>
      </div>

      <div className="p-4">
        {/* Origins Balance Card */}
        <div className="bg-gradient-to-br from-[#6366f1] to-[#4f46e5] rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gem className="text-white" size={20} />
              <p className="text-white/80">Origins Balance</p>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                <Flame className="text-orange-400" size={16} />
                <span className="text-white text-sm">{streak} month{streak > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          <h2 className="text-white text-4xl mb-1">{originsBalance.toFixed(2)}</h2>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-white/60 text-sm">≈ ${originsBalance.toFixed(2)} USD</p>
            {multiplier > 1.0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {multiplier}x multiplier
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div>
              <p className="text-white/60">Ce mois</p>
              <p className="text-white">${monthlyEarnings.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-white/60">Total gagné</p>
              <p className="text-white">${totalEarned.toFixed(2)}</p>
            </div>
          </div>
          
          <button 
            disabled={!canWithdraw}
            onClick={handleWithdraw}
            className={`w-full py-4 rounded-lg transition-all ${
              canWithdraw
                ? 'bg-white text-[#6366f1] hover:bg-white/90' 
                : 'bg-white/20 text-white/50 cursor-not-allowed'
            }`}
          >
            {canWithdraw
              ? `Retirer (${withdrawalLimits.remaining}/${withdrawalLimits.max} restants)`
              : originsBalance < 50
              ? 'Minimum $50 requis'
              : withdrawalLimits.remaining === 0
              ? 'Max retraits ce mois atteint'
              : `Prochain retrait: ${nextWithdrawalDate}`
            }
          </button>
          
          {!canWithdraw && originsBalance >= 50 && withdrawalLimits.remaining > 0 && (
            <p className="text-white/60 text-xs text-center mt-2">
              Retraits disponibles le 1er et 15 de chaque mois
            </p>
          )}
        </div>

        {/* Eligibility Status */}
        <div className={`mb-6 p-4 rounded-xl border-2 ${
          eligible 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-orange-500/10 border-orange-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {eligible ? (
              <Check className="text-green-400" size={20} />
            ) : (
              <span className="text-orange-400 text-xl">⚠️</span>
            )}
            <p className={`${eligible ? 'text-green-400' : 'text-orange-400'}`}>
              {eligible ? 'Eligible pour commissions! 🎉' : 'Non éligible ce mois'}
            </p>
          </div>
          <p className="text-sm text-white/60">
            {eligible 
              ? `Vous recevez ${(multiplier * 10).toFixed(0)}% de commission sur vos filleuls`
              : 'Complétez le Défi 60+ pour devenir éligible'
            }
          </p>
        </div>

        {/* Défi 60+ Goals */}
        <div className="mb-6">
          <h3 className="text-white text-lg mb-4">Défi 60+ (Eligibilité Mensuelle)</h3>
          <div className="space-y-4">
            {defi60Goals.map((goal, idx) => {
              const percentage = Math.min((goal.current / goal.target) * 100, 100);
              const isComplete = goal.current >= goal.target;
              
              return (
                <div key={idx} className="bg-[#1A1A1A] rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white">{goal.label}</span>
                    <div className="flex items-center gap-2">
                      {isComplete && <Check className="text-green-400" size={16} />}
                      <span className={isComplete ? 'text-green-400' : 'text-[#6366f1]'}>
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-[#262626] rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        isComplete ? 'bg-green-500' : 'bg-[#6366f1]'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-sm">{goal.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Multiplier Info */}
        {streak > 0 && (
          <div className="mb-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="text-orange-400" size={20} />
              <h3 className="text-white">Streak Bonus</h3>
            </div>
            <p className="text-white/80 text-sm mb-2">
              {streak} mois consécutif{streak > 1 ? 's' : ''} d'éligibilité
            </p>
            <p className="text-white text-2xl mb-1">{multiplier}x Multiplier</p>
            <p className="text-white/60 text-sm">
              {multiplier < 1.5 
                ? `Continuer ${2 - streak} mois de plus pour atteindre 1.5x max!`
                : 'Maximum atteint! 🔥'
              }
            </p>
          </div>
        )}

        {/* Referral Section */}
        <div className="mb-6">
          <h3 className="text-white text-lg mb-4">Parrainage</h3>
          <div className="bg-[#1A1A1A] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">
                Gagnez {(multiplier * 10).toFixed(0)}% de commission lifetime
              </p>
              <span className="text-[#6366f1]">{referralCount} filleuls</span>
            </div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={referralLink || 'Loading...'}
                readOnly
                className="flex-1 bg-[#262626] text-white rounded-lg px-4 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleCopyReferralLink}
                className="flex-1 py-2 border border-[#6366f1] rounded-lg text-[#6366f1] flex items-center justify-center gap-2 hover:bg-[#6366f1]/10 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copié!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copier
                  </>
                )}
              </button>
              <button 
                onClick={handleShareReferral}
                className="flex-1 py-2 bg-[#6366f1] rounded-lg text-white flex items-center justify-center gap-2 hover:bg-[#6366f1]/90 transition-colors"
              >
                <Share2 size={16} />
                Partager
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#1A1A1A] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Referral Code</p>
            <p className="text-white text-xl">{referralCode || '—'}</p>
          </div>
          <div className="bg-[#1A1A1A] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Retraits restants</p>
            <p className="text-white text-xl">{withdrawalLimits.remaining}/{withdrawalLimits.max}</p>
          </div>
        </div>
      </div>
    </div>
  );
}