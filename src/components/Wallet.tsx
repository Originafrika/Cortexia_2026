import { ArrowLeft, Zap, Image as ImageIcon, Video } from 'lucide-react';
import type { Screen } from '../App';

interface WalletProps {
  onNavigate: (screen: Screen) => void;
}

const CREDIT_PACKS = [
  { credits: 100, price: '$9.99', bonus: null, popular: false },
  { credits: 500, price: '$39.99', bonus: '+50 bonus', popular: true },
  { credits: 1000, price: '$69.99', bonus: '+150 bonus', popular: false },
  { credits: 5000, price: '$299.99', bonus: '+1000 bonus', popular: false },
];

const GENERATION_COSTS = [
  { type: 'Image', icon: ImageIcon, cost: '1 credit', duration: null },
  { type: 'Video 5s', icon: Video, cost: '5 credits', duration: '5s' },
  { type: 'Video 10s', icon: Video, cost: '10 credits', duration: '10s' },
  { type: 'Video 15s', icon: Video, cost: '15 credits', duration: '15s' },
];

export function Wallet({ onNavigate }: WalletProps) {
  return (
    <div className="w-full h-screen bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black z-10 px-4 pt-12 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('profile')}>
            <ArrowLeft className="text-white" size={24} />
          </button>
          <h1 className="text-white text-xl">Mon Portefeuille</h1>
        </div>
      </div>

      {/* Current Balance */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-[#6366f1] to-[#4f46e5] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-white" size={24} fill="white" />
            <p className="text-white/80">Current Balance</p>
          </div>
          <h2 className="text-white text-5xl">247</h2>
          <p className="text-white/60 text-sm mt-2">credits</p>
        </div>

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
                <button className="w-full py-3 bg-[#6366f1] rounded-lg text-white">
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

        {/* Transaction History */}
        <div className="mb-6">
          <h3 className="text-white text-lg mb-4">Recent Transactions</h3>
          <div className="space-y-2">
            {[
              { action: 'Video generated', credits: -10, date: 'Oct 31, 2025' },
              { action: 'Purchased 500 credits', credits: +500, date: 'Oct 29, 2025' },
              { action: 'Image generated', credits: -1, date: 'Oct 28, 2025' },
            ].map((transaction, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg">
                <div>
                  <p className="text-white">{transaction.action}</p>
                  <p className="text-gray-400 text-sm">{transaction.date}</p>
                </div>
                <span className={`${
                  transaction.credits > 0 ? 'text-green-500' : 'text-gray-400'
                }`}>
                  {transaction.credits > 0 ? '+' : ''}{transaction.credits}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
