import { ArrowLeft, Copy, Share2, Check } from 'lucide-react';
import type { Screen } from '../App';

interface CreatorDashboardProps {
  onNavigate: (screen: Screen) => void;
}

export function CreatorDashboard({ onNavigate }: CreatorDashboardProps) {
  const today = new Date();
  const currentDay = today.getDate();
  const isWithdrawalDay = currentDay === 1 || currentDay === 15;
  
  const nextWithdrawalDate = currentDay < 15 ? '15 November 2025' : '1 December 2025';

  const goals = [
    { 
      label: 'Generations this month', 
      current: 42, 
      target: 60, 
      description: 'Generate 60 videos/images' 
    },
    { 
      label: 'Posts éligibles', 
      current: 3, 
      target: 5, 
      description: 'Post 5 eligible creations' 
    },
    { 
      label: 'Engagement rate', 
      current: 68, 
      target: 75, 
      description: 'Reach 75% engagement' 
    },
  ];

  const benefits = [
    { label: 'Téléchargements sans filigrane', eligible: true },
    { label: 'Accès anticipé aux nouvelles fonctionnalités', eligible: true },
    { label: 'Badge créateur vérifié', eligible: false },
    { label: 'Support prioritaire', eligible: false },
  ];

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

      {/* Earnings Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-[#6366f1] to-[#4f46e5] rounded-2xl p-6 mb-6">
          <p className="text-white/80 mb-2">Total Earnings</p>
          <h2 className="text-white text-4xl mb-6">$1,247.50</h2>
          
          <button 
            disabled={!isWithdrawalDay}
            className={`w-full py-4 rounded-lg transition-all ${
              isWithdrawalDay 
                ? 'bg-white text-[#6366f1]' 
                : 'bg-white/20 text-white/50 cursor-not-allowed'
            }`}
          >
            {isWithdrawalDay 
              ? 'Retirer les gains' 
              : `Prochaine date: ${nextWithdrawalDate}`
            }
          </button>
          
          {!isWithdrawalDay && (
            <p className="text-white/60 text-sm text-center mt-2">
              Withdrawals available on the 1st and 15th of each month
            </p>
          )}
        </div>

        {/* Goals Section */}
        <div className="mb-6">
          <h3 className="text-white text-lg mb-4">Objectifs de Créateur</h3>
          <div className="space-y-4">
            {goals.map((goal, idx) => (
              <div key={idx} className="bg-[#1A1A1A] rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white">{goal.label}</span>
                  <span className="text-[#6366f1]">
                    {goal.current}/{goal.target}
                  </span>
                </div>
                <div className="w-full bg-[#262626] rounded-full h-2 mb-2">
                  <div 
                    className="bg-[#6366f1] h-2 rounded-full transition-all"
                    style={{ width: `${(goal.current / goal.target) * 100}%` }}
                  />
                </div>
                <p className="text-gray-400 text-sm">{goal.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-6">
          <h3 className="text-white text-lg mb-4">Avantages</h3>
          <div className="space-y-2">
            {benefits.map((benefit, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-3 p-4 rounded-lg ${
                  benefit.eligible ? 'bg-[#1A1A1A]' : 'bg-[#1A1A1A]/50'
                }`}
              >
                <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                  benefit.eligible ? 'bg-[#6366f1]' : 'bg-gray-700'
                }`}>
                  {benefit.eligible && <Check className="text-white" size={16} />}
                </div>
                <span className={benefit.eligible ? 'text-white' : 'text-gray-500'}>
                  {benefit.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Referral Section */}
        <div className="mb-6">
          <h3 className="text-white text-lg mb-4">Parrainage</h3>
          <div className="bg-[#1A1A1A] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-3">
              Earn $5 for every creator you refer who completes their first generation
            </p>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value="cortexia.app/ref/yourusername"
                readOnly
                className="flex-1 bg-[#262626] text-white rounded-lg px-4 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 border border-[#6366f1] rounded-lg text-[#6366f1] flex items-center justify-center gap-2">
                <Copy size={16} />
                Copier
              </button>
              <button className="flex-1 py-2 bg-[#6366f1] rounded-lg text-white flex items-center justify-center gap-2">
                <Share2 size={16} />
                Partager
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#1A1A1A] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">This Month</p>
            <p className="text-white text-2xl">$342.80</p>
          </div>
          <div className="bg-[#1A1A1A] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Total Views</p>
            <p className="text-white text-2xl">1.2M</p>
          </div>
        </div>
      </div>
    </div>
  );
}
