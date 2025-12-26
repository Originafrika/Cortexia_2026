/**
 * TOOL CARD V2
 * Enhanced card with free/paid indicators
 */

import { ArrowRight, Crown, Zap, Lock, Sparkles, TrendingUp, Flame } from 'lucide-react';
import type { CreationTool } from '../../lib/config/creation-tools-v2';

interface ToolCardV2Props {
  tool: CreationTool;
  onClick: () => void;
  userCredits: number;
  isLocked?: boolean;
}

export function ToolCardV2({ tool, onClick, userCredits, isLocked = false }: ToolCardV2Props) {
  const categoryColors = {
    basics: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    premium: 'from-purple-500/20 to-blue-500/20 border-purple-500/30',
    video: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    advanced: 'from-pink-500/20 to-purple-500/20 border-pink-500/30',
    nsfw: 'from-red-500/20 to-orange-500/20 border-red-500/30',
  };

  const creditTypeColors = {
    free: 'bg-green-500/20 text-green-300 border-green-500/30',
    paid: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  };

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`
        group relative p-6 rounded-2xl border bg-gradient-to-br transition-all duration-300
        ${!isLocked && 'hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10'}
        ${categoryColors[tool.category]}
        ${isLocked && 'opacity-60 cursor-not-allowed'}
      `}
    >
      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-yellow-300">
              {tool.creditType === 'paid' ? 'Crédits Payants' : 'Crédits Insuffisants'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {tool.minCredits} crédits requis
            </p>
          </div>
        </div>
      )}

      {/* Badges row */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {/* New badge */}
        {tool.isNew && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-xs font-medium text-blue-300">New</span>
          </div>
        )}

        {/* Popular badge */}
        {tool.isPopular && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/20 border border-orange-500/30">
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-xs font-medium text-orange-300">Popular</span>
          </div>
        )}
      </div>

      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl">
        {tool.icon}
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
        {tool.name}
      </h3>

      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        {tool.description}
      </p>

      {/* Features */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tool.features.map((feature, i) => (
          <span 
            key={i} 
            className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-400 border border-white/10"
          >
            {feature}
          </span>
        ))}
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Credit type badge */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${creditTypeColors[tool.creditType]}`}>
            {tool.creditType === 'free' ? (
              <Zap className="w-3 h-3" />
            ) : (
              <Crown className="w-3 h-3" />
            )}
            {tool.minCredits}cr
          </div>

          {/* User credits */}
          <div className="text-xs text-gray-500">
            Vous: {userCredits}cr
          </div>
        </div>

        {/* Arrow */}
        {!isLocked && (
          <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        )}
      </div>
    </button>
  );
}
