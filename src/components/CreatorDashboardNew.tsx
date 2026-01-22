import type { Screen } from '../App';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from '../lib/contexts/AuthContext';

// Icons
const ArrowLeft = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const Copy = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const Share2 = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
);

const Check = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const Flame = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
  </svg>
);

const Gem = ({ className, size }: { className?: string; size?: number }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'defi60' | 'referrals' | 'posts' | 'wallet'>('overview');
  
  // State
  const [originsBalance, setOriginsBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [eligible, setEligible] = useState(false);
  const [imagesGenerated, setImagesGenerated] = useState(0);
  const [postsPublished, setPostsPublished] = useState(0);
  const [postsWithLikesCount, setPostsWithLikesCount] = useState(0);
  const [postsWithLikes, setPostsWithLikes] = useState<any>(null);
  const [withdrawalLimits, setWithdrawalLimits] = useState({ remaining: 0, max: 2 });
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [referralsSummary, setReferralsSummary] = useState<any>(null);

  useEffect(() => {
    if (user?.id) loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      const userId = user?.id;
      if (!userId) return;

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      // Load all data
      const [walletRes, compensationRes, statsRes, limitsRes, referralRes] = await Promise.all([
        fetch(`${apiUrl}/origins/wallet/${userId}`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` }}),
        fetch(`${apiUrl}/compensation/${userId}`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` }}),
        fetch(`${apiUrl}/user-stats/${userId}/stats`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` }}),
        fetch(`${apiUrl}/withdrawal/${userId}/limits`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` }}),
        fetch(`${apiUrl}/referral/${userId}/link`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` }})
      ]);

      if (walletRes.ok) {
        const { wallet } = await walletRes.json();
        setOriginsBalance(wallet?.balance || 0);
        setTotalEarned(wallet?.totalEarned || 0);
      }

      if (compensationRes.ok) {
        const { compensation } = await compensationRes.json();
        setStreak(compensation?.currentStreak || 0);
        setMultiplier(compensation?.currentMultiplier || 1.0);
        setEligible(compensation?.isEligible || false);
        setMonthlyEarnings(compensation?.monthlyEarnings || 0);
      }

      if (statsRes.ok) {
        const { stats } = await statsRes.json();
        setImagesGenerated(stats.monthlyImages || 0);
        setPostsPublished(stats.monthlyPosts || 0);
        setPostsWithLikesCount(stats.monthlyPostsWithEnoughLikes || 0);
      }

      if (limitsRes.ok) {
        const { limits } = await limitsRes.json();
        setWithdrawalLimits({ remaining: limits?.remainingThisMonth || 0, max: limits?.maxPerMonth || 2 });
      }

      if (referralRes.ok) {
        const referralData = await referralRes.json();
        setReferralCode(referralData.referralCode || '');
        setReferralLink(referralData.referralLink || '');
        setReferralCount(referralData.referralCount || 0);

        // Load referrals list
        const referralsListRes = await fetch(`${apiUrl}/referral/${userId}/referrals`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        if (referralsListRes.ok) {
          const { referrals, summary } = await referralsListRes.json();
          setReferralsList(referrals || []);
          setReferralsSummary(summary || null);
        }

        // Load posts with likes
        const postsDetailsRes = await fetch(`${apiUrl}/users/${userId}/posts-with-likes`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        if (postsDetailsRes.ok) {
          const { posts } = await postsDetailsRes.json();
          setPostsWithLikes(posts || null);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
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
          title: 'Join Cortexia',
          text: `Join me on Cortexia! Use my referral code: ${referralCode}`,
          url: referralLink
        });
      } catch (err) {}
    } else {
      handleCopyReferralLink();
    }
  };

  const handleWithdraw = () => {
    alert('Withdrawal feature coming soon!');
  };

  const today = new Date();
  const currentDay = today.getDate();
  const canWithdraw = (currentDay === 1 || currentDay === 15) && withdrawalLimits.remaining > 0 && originsBalance >= 50;
  
  const nextWithdrawalDate = currentDay < 15 
    ? `15 ${today.toLocaleString('en', { month: 'long', year: 'numeric' })}`
    : `1 ${new Date(today.getFullYear(), today.getMonth() + 1).toLocaleString('en', { month: 'long', year: 'numeric' })}`;

  const defi60Goals = [
    { label: 'Images générées', current: imagesGenerated, target: 60, description: 'Générer 60 images ce mois' },
    { label: 'Posts publiés', current: postsPublished, target: 5, description: 'Publier 5 posts au feed' },
    { label: 'Posts avec 5+ likes', current: postsWithLikesCount, target: 5, description: '5 posts avec 5+ likes chacun' }
  ];

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-black z-10 px-4 pt-12 pb-4 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => onNavigate('profile')}>
            <ArrowLeft className="text-white" size={24} />
          </button>
          <h1 className="text-white text-xl font-semibold">Creator Dashboard</h1>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'overview', label: '📊 Vue d\'ensemble' },
            { id: 'defi60', label: '🎯 Défi 60+' },
            { id: 'referrals', label: '👥 Filleuls' },
            { id: 'posts', label: '❤️ Posts' },
            { id: 'wallet', label: '💎 Wallet' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#6366f1] text-white'
                  : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content - scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
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
                    <span className="text-white text-sm">{streak} mois</span>
                  </div>
                )}
              </div>
              <h2 className="text-white text-4xl mb-1">{originsBalance.toFixed(2)}</h2>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-white/60 text-sm">≈ ${originsBalance.toFixed(2)} USD</p>
                {multiplier > 1.0 && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {multiplier}x
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
                <p className={`font-medium ${eligible ? 'text-green-400' : 'text-orange-400'}`}>
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

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button className="bg-[#1A1A1A] rounded-lg p-4 text-left hover:bg-[#222] transition-colors" onClick={() => setActiveTab('referrals')}>
                <p className="text-gray-400 text-sm mb-1">Filleuls</p>
                <p className="text-white text-2xl mb-1">{referralCount}</p>
                {referralsSummary && (
                  <p className="text-[#6366f1] text-xs">
                    {referralsSummary.activeThisMonth} actifs ce mois
                  </p>
                )}
              </button>
              
              <button className="bg-[#1A1A1A] rounded-lg p-4 text-left hover:bg-[#222] transition-colors" onClick={() => setActiveTab('referrals')}>
                <p className="text-gray-400 text-sm mb-1">Commission</p>
                <p className="text-white text-2xl mb-1">
                  ${referralsSummary?.totalCommissionThisMonth?.toFixed(2) || '0.00'}
                </p>
                <p className={`text-xs ${eligible ? 'text-green-400' : 'text-orange-400'}`}>
                  {eligible ? 'Active' : 'Non éligible'}
                </p>
              </button>

              <button className="bg-[#1A1A1A] rounded-lg p-4 text-left hover:bg-[#222] transition-colors" onClick={() => setActiveTab('defi60')}>
                <p className="text-gray-400 text-sm mb-1">Images</p>
                <p className="text-white text-2xl mb-1">{imagesGenerated}/60</p>
                <p className="text-[#6366f1] text-xs">
                  {Math.min(100, Math.round((imagesGenerated/60)*100))}% complété
                </p>
              </button>
              
              <button className="bg-[#1A1A1A] rounded-lg p-4 text-left hover:bg-[#222] transition-colors" onClick={() => setActiveTab('posts')}>
                <p className="text-gray-400 text-sm mb-1">Posts 5+ likes</p>
                <p className="text-white text-2xl mb-1">{postsWithLikesCount}/5</p>
                <p className={`text-xs ${postsWithLikesCount >= 5 ? 'text-green-400' : 'text-orange-400'}`}>
                  {postsWithLikesCount >= 5 ? 'Atteint ✅' : 'En cours'}
                </p>
              </button>
            </div>

            {/* Streak */}
            {streak > 0 && (
              <div className="mb-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="text-orange-400" size={20} />
                  <h3 className="text-white font-medium">Streak Bonus</h3>
                </div>
                <p className="text-white/80 text-sm mb-2">
                  {streak} mois consécutif{streak > 1 ? 's' : ''} d'éligibilité
                </p>
                <p className="text-white text-2xl mb-1">{multiplier}x Multiplier</p>
                <p className="text-white/60 text-sm">
                  {multiplier < 1.5 
                    ? `${3 - streak} mois de plus pour 1.5x max!`
                    : 'Maximum atteint! 🔥'
                  }
                </p>
              </div>
            )}

            {/* Referral Card */}
            <div className="mb-6">
              <h3 className="text-white text-lg mb-4 font-medium">Lien de Parrainage</h3>
              <div className="bg-[#1A1A1A] rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-3">
                  Gagnez {(multiplier * 10).toFixed(0)}% de commission lifetime
                </p>
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
                    {copied ? <><Check size={16} />Copié!</> : <><Copy size={16} />Copier</>}
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
          </div>
        )}

        {/* DEFI 60+ TAB */}
        {activeTab === 'defi60' && (
          <div>
            <h2 className="text-white text-xl mb-4 font-semibold">Défi 60+ - Eligibilité Mensuelle</h2>
            
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
                <p className={`text-lg font-medium ${eligible ? 'text-green-400' : 'text-orange-400'}`}>
                  {eligible ? 'Eligible ce mois! 🎉' : 'Non éligible'}
                </p>
              </div>
              <p className="text-sm text-white/60">
                {eligible 
                  ? 'Toutes les conditions sont remplies'
                  : 'Complétez les 3 conditions pour devenir éligible'
                }
              </p>
            </div>

            <div className="space-y-4">
              {defi60Goals.map((goal, idx) => {
                const percentage = Math.min((goal.current / goal.target) * 100, 100);
                const isComplete = goal.current >= goal.target;
                
                return (
                  <div key={idx} className="bg-[#1A1A1A] rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">{goal.label}</span>
                      <div className="flex items-center gap-2">
                        {isComplete && <Check className="text-green-400" size={16} />}
                        <span className={`text-lg ${isComplete ? 'text-green-400' : 'text-[#6366f1]'}`}>
                          {goal.current}/{goal.target}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-[#262626] rounded-full h-3 mb-2">
                      <div 
                        className={`h-3 rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-[#6366f1]'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-gray-400 text-sm">{goal.description}</p>
                  </div>
                );
              })}
            </div>

            {streak > 0 && (
              <div className="mt-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="text-orange-400" size={20} />
                  <h3 className="text-white text-lg font-medium">Streak Bonus</h3>
                </div>
                <p className="text-white/80 text-sm mb-2">
                  {streak} mois consécutif{streak > 1 ? 's' : ''} d'éligibilité
                </p>
                <p className="text-white text-3xl mb-1">{multiplier}x Multiplier</p>
                <p className="text-white/60 text-sm">
                  {multiplier < 1.5 ? `${3 - streak} mois de plus pour 1.5x max!` : 'Maximum atteint! 🔥'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* REFERRALS TAB */}
        {activeTab === 'referrals' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-semibold">Mes Filleuls</h2>
              {referralsSummary && (
                <span className="text-[#6366f1] text-sm">
                  {referralsSummary.activeThisMonth}/{referralsSummary.total} actifs
                </span>
              )}
            </div>
            
            {referralsSummary && referralsSummary.totalCommissionThisMonth > 0 && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                <p className="text-green-400 text-sm mb-1">Commission totale ce mois</p>
                <p className="text-white text-3xl mb-2">${referralsSummary.totalCommissionThisMonth.toFixed(2)}</p>
                <p className="text-white/60 text-xs">
                  {eligible ? '✅ Commission active' : '⚠️ Non éligible (compléter Défi 60+)'}
                </p>
              </div>
            )}

            {referralsList && referralsList.length > 0 ? (
              <div className="space-y-3">
                {referralsList.map((referral: any) => (
                  <div 
                    key={referral.userId}
                    className={`bg-[#1A1A1A] rounded-lg p-4 border-l-4 ${
                      referral.isActiveThisMonth ? 'border-green-500' : 'border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {referral.avatar ? (
                          <img 
                            src={referral.avatar} 
                            alt={referral.displayName}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#6366f1] flex items-center justify-center">
                            <span className="text-white text-sm">
                              {referral.displayName?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{referral.displayName}</p>
                          <p className="text-gray-400 text-xs">@{referral.username}</p>
                        </div>
                      </div>
                      {referral.isActiveThisMonth && (
                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                          Actif
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#262626] rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Achats ce mois</p>
                        <p className="text-white font-medium text-lg">
                          ${referral.totalSpentThisMonth?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {referral.purchasesThisMonth || 0} achat{referral.purchasesThisMonth > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="bg-[#262626] rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Commission</p>
                        <p className={`font-medium text-lg ${eligible ? 'text-green-400' : 'text-orange-400'}`}>
                          ${referral.commissionThisMonth?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(multiplier * 10).toFixed(0)}% total
                        </p>
                      </div>
                    </div>

                    {referral.totalLifetimeSpent > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-gray-400 text-xs">
                          <span className="text-white">Lifetime:</span> ${referral.totalLifetimeSpent?.toFixed(2)} 
                          <span className="text-gray-500 ml-2">
                            ({referral.totalLifetimePurchases} achats)
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#1A1A1A] rounded-lg p-8 text-center">
                <p className="text-gray-400 mb-2">Aucun filleul</p>
                <p className="text-gray-500 text-sm mb-4">Partagez votre lien</p>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="px-4 py-2 bg-[#6366f1] rounded-lg text-white text-sm"
                >
                  Voir mon lien
                </button>
              </div>
            )}
          </div>
        )}

        {/* POSTS TAB */}
        {activeTab === 'posts' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-semibold">Posts avec 5+ Likes</h2>
              <span className="text-[#6366f1] text-sm">
                {postsWithLikes?.summary?.defi60PostsProgress || 0}/5
              </span>
            </div>

            {postsWithLikes?.summary?.defi60PostsMet ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="text-green-400" size={18} />
                  <p className="text-green-400 font-medium">Objectif atteint ! 🎉</p>
                </div>
                <p className="text-white/60 text-sm">
                  {postsWithLikes.summary.defi60PostsProgress} posts qualifiés
                </p>
              </div>
            ) : (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
                <p className="text-orange-400 font-medium mb-1">
                  Encore {5 - (postsWithLikes?.summary?.defi60PostsProgress || 0)} post{(5 - (postsWithLikes?.summary?.defi60PostsProgress || 0)) > 1 ? 's' : ''} nécessaire{(5 - (postsWithLikes?.summary?.defi60PostsProgress || 0)) > 1 ? 's' : ''}
                </p>
                <p className="text-white/60 text-sm">Chaque post doit obtenir 5+ likes</p>
              </div>
            )}

            {postsWithLikes?.thisMonth && postsWithLikes.thisMonth.filter((p: any) => p.meetsDefi60Requirement).length > 0 ? (
              <div className="space-y-3 mb-6">
                <h3 className="text-white text-sm font-medium">✅ Posts qualifiés</h3>
                {postsWithLikes.thisMonth
                  .filter((p: any) => p.meetsDefi60Requirement)
                  .map((post: any) => (
                    <div key={post.id} className="bg-[#1A1A1A] rounded-lg p-4 border-l-4 border-green-500">
                      <div className="flex items-start gap-3">
                        {post.imageUrl && (
                          <img 
                            src={post.imageUrl} 
                            alt="Post"
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm mb-2 line-clamp-2">{post.prompt}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-red-400">❤️</span>
                              <span className="text-white font-medium">{post.likes}</span>
                            </div>
                            {post.remixes > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-blue-400">🔄</span>
                                <span className="text-white font-medium">{post.remixes}</span>
                              </div>
                            )}
                            <span className="text-green-400 ml-auto">✅</span>
                          </div>
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-[#1A1A1A] rounded-lg p-8 text-center mb-6">
                <p className="text-gray-400 text-sm mb-2">Aucun post avec 5+ likes</p>
                <p className="text-gray-500 text-xs">Publiez des posts de qualité</p>
              </div>
            )}

            {postsWithLikes?.thisMonth && postsWithLikes.thisMonth.filter((p: any) => p.likes === 4).length > 0 && (
              <div>
                <h3 className="text-white text-sm font-medium mb-2">⭐ Posts proches (4 likes)</h3>
                <div className="space-y-2">
                  {postsWithLikes.thisMonth
                    .filter((p: any) => p.likes === 4)
                    .map((post: any) => (
                      <div key={post.id} className="bg-[#1A1A1A] rounded-lg p-3 border-l-4 border-yellow-500">
                        <div className="flex items-center gap-3">
                          {post.imageUrl && (
                            <img 
                              src={post.imageUrl} 
                              alt="Post"
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs line-clamp-1 mb-1">{post.prompt}</p>
                            <span className="text-yellow-400 text-xs">⭐ 4 likes (encore 1!)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* WALLET TAB */}
        {activeTab === 'wallet' && (
          <div>
            <h2 className="text-white text-xl mb-6 font-semibold">Origins Wallet</h2>
            
            <div className="bg-gradient-to-br from-[#6366f1] to-[#4f46e5] rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Gem className="text-white" size={24} />
                <p className="text-white/80 text-lg">Balance</p>
              </div>
              <h2 className="text-white text-5xl mb-3">{originsBalance.toFixed(2)}</h2>
              <p className="text-white/60 text-sm">≈ ${originsBalance.toFixed(2)} USD</p>
              <p className="text-white/40 text-xs">1 Origin = $1.00</p>
            </div>

            <button 
              disabled={!canWithdraw}
              onClick={handleWithdraw}
              className={`w-full py-4 rounded-xl mb-4 text-lg font-medium ${
                canWithdraw
                  ? 'bg-white text-[#6366f1] hover:bg-white/90' 
                  : 'bg-[#1A1A1A] text-white/50 cursor-not-allowed border border-gray-800'
              }`}
            >
              {canWithdraw
                ? `Retirer ${originsBalance.toFixed(2)} Origins`
                : originsBalance < 50
                ? 'Minimum $50 requis'
                : withdrawalLimits.remaining === 0
                ? 'Max 2 retraits/mois atteints'
                : `Prochain: ${nextWithdrawalDate}`
              }
            </button>

            <div className="bg-[#1A1A1A] rounded-lg p-4 mb-6">
              <h3 className="text-white text-sm font-medium mb-3">Infos Retraits</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Retraits restants</span>
                  <span className="text-white">{withdrawalLimits.remaining}/{withdrawalLimits.max}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Minimum</span>
                  <span className="text-white">$50.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dates</span>
                  <span className="text-white">1er et 15</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-lg p-4">
              <h3 className="text-white text-sm font-medium mb-3">Revenus</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-sm">Ce mois</p>
                    <p className="text-gray-400 text-xs">Commission + Créations</p>
                  </div>
                  <p className="text-white text-lg">${monthlyEarnings.toFixed(2)}</p>
                </div>
                <div className="h-px bg-gray-800"></div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-sm">Lifetime</p>
                    <p className="text-gray-400 text-xs">Total</p>
                  </div>
                  <p className="text-white text-lg">${totalEarned.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
