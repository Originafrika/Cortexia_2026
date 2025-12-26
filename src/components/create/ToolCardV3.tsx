/**
 * TOOL CARD V3 - BDS Enhanced
 * BDS: Musique - Rythme Visuel & Interactif
 */

import { ArrowRight, Lock, Zap, Crown, Sparkles, Flame } from 'lucide-react';
import type { CreationTool } from '../../lib/config/cortexia-tools';

interface ToolCardV3Props {
  tool: CreationTool;
  onClick: () => void;
  isAccessible: boolean;
  lockReason?: string;
}

export function ToolCardV3({ tool, onClick, isAccessible, lockReason }: ToolCardV3Props) {
  // BDS: Arithmétique - Color harmonies
  const categoryColors = {
    'quick-create': 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    'templates': 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    'advanced': 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    'video': 'from-orange-500/20 to-red-500/20 border-orange-500/30',
  };

  const badgeColors = {
    free: 'bg-green-500/20 text-green-300 border-green-500/30',
    paid: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  };

  return (
    <button
      onClick={onClick}
      disabled={!isAccessible}
      className={`
        group relative p-6 rounded-2xl border bg-gradient-to-br transition-all duration-300
        ${isAccessible && 'hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10'}
        ${categoryColors[tool.category]}
        ${!isAccessible && 'opacity-60 cursor-not-allowed'}
      `}
    >
      {/* BDS: Rhétorique - Lock overlay guide l'attention */}
      {!isAccessible && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-yellow-300">
              {lockReason || 'Verrouillé'}
            </p>
          </div>
        </div>
      )}

      {/* Badges row */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {/* New badge */}
        {tool.isNew && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 animate-pulse">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-xs font-medium text-blue-300">New</span>
          </div>
        )}
      </div>

      {/* BDS: Géométrie - Icon avec proportions harmonieuses */}
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

      {/* BDS: Musique - Features avec rythme */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tool.features.map((feature, i) => (
          <span 
            key={i} 
            className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-colors"
          >
            {feature}
          </span>
        ))}
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between">
        {/* Credit badge */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${badgeColors[tool.requiredCredits]}`}>
          {tool.requiredCredits === 'free' ? (
            <Zap className="w-3 h-3" />
          ) : (
            <Crown className="w-3 h-3" />
          )}
          {tool.requiredCredits === 'free' ? 'Gratuit' : 'Premium'}
        </div>

        {/* Arrow */}
        {isAccessible && (
          <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        )}
      </div>
    </button>
  );
}
