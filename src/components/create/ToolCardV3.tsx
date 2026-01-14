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
    'quick-create': 'from-[var(--coconut-palm)]/20 to-[var(--coconut-husk)]/20 border-[var(--coconut-palm)]/30',
    'templates': 'from-[var(--coconut-palm)]/20 to-[var(--coconut-husk)]/20 border-[var(--coconut-palm)]/30',
    'advanced': 'from-[var(--coconut-husk)]/20 to-[var(--coconut-shell)]/20 border-[var(--coconut-husk)]/30',
    'video': 'from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 border-[var(--coconut-shell)]/30',
  };

  const badgeColors = {
    free: 'bg-[var(--coconut-palm)]/20 text-[var(--coconut-palm)] border-[var(--coconut-palm)]/30',
    paid: 'bg-[var(--coconut-husk)]/20 text-[var(--coconut-husk)] border-[var(--coconut-husk)]/30',
  };

  return (
    <button
      onClick={onClick}
      disabled={!isAccessible}
      className={`
        group relative p-6 rounded-2xl border bg-gradient-to-br transition-all duration-300
        ${isAccessible && 'hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--coconut-palm)]/10'}
        ${categoryColors[tool.category]}
        ${!isAccessible && 'opacity-60 cursor-not-allowed'}
      `}
    >
      {/* BDS: Rhétorique - Lock overlay guide l'attention */}
      {!isAccessible && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-8 h-8 text-[var(--coconut-palm)] mx-auto mb-2" />
            <p className="text-sm font-medium text-[var(--coconut-palm)]">
              {lockReason || 'Verrouillé'}
            </p>
          </div>
        </div>
      )}

      {/* Badges row */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {/* New badge */}
        {tool.isNew && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--coconut-palm)]/20 border border-[var(--coconut-palm)]/30 animate-pulse">
            <Sparkles className="w-3 h-3 text-[var(--coconut-palm)]" />
            <span className="text-xs font-medium text-[var(--coconut-palm)]">New</span>
          </div>
        )}
      </div>

      {/* BDS: Géométrie - Icon avec proportions harmonieuses */}
      <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl">
        {tool.icon}
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[var(--coconut-cream)] transition-colors">
        {tool.name}
      </h3>

      <p className="text-sm text-[var(--coconut-husk)] mb-4 leading-relaxed">
        {tool.description}
      </p>

      {/* BDS: Musique - Features avec rythme */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tool.features.map((feature, i) => (
          <span 
            key={i} 
            className="px-2 py-0.5 rounded text-xs bg-white/5 text-[var(--coconut-husk)] border border-white/10 hover:bg-white/10 transition-colors"
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
          <ArrowRight className="w-5 h-5 text-[var(--coconut-husk)] group-hover:text-[var(--coconut-palm)] group-hover:translate-x-1 transition-all" />
        )}
      </div>
    </button>
  );
}