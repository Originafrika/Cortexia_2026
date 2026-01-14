/**
 * TOOL CARD - BDS Beauty Design System
 * Reusable tool card component with responsive design
 * 7 Arts: Géométrie (proportions), Musique (animations), Grammaire (cohérence)
 */

import { ChevronRight } from 'lucide-react';

interface Technology {
  id: string;
  name: string;
  icon: string;
}

interface ToolCardProps {
  tool: {
    id: string;
    name: string;
    description: string;
    icon: string;
    imageUrl?: string;
    badge?: string;
    comingSoon?: boolean;
  };
  technologies: Technology[];
  accentColor: 'yellow' | 'pink' | 'orange' | 'indigo';
  isCoconut?: boolean;
  onPlayClick: () => void;
  onPlayHover: () => void;
  onMediumHaptic: () => void;
  onClick: () => void;
}

const COLOR_CLASSES = {
  yellow: {
    hover: 'hover:shadow-[var(--coconut-palm)]/20',
    text: 'text-[var(--coconut-palm)] group-hover:text-[var(--coconut-palm)]',
    chevron: 'group-hover:text-[var(--coconut-palm)]',
  },
  pink: {
    hover: 'hover:shadow-[var(--coconut-husk)]/20',
    text: 'text-[var(--coconut-husk)] group-hover:text-[var(--coconut-cream)]',
    chevron: 'group-hover:text-[var(--coconut-husk)]',
  },
  orange: {
    hover: 'hover:shadow-[var(--coconut-shell)]/20',
    text: 'text-[var(--coconut-shell)] group-hover:text-[var(--coconut-husk)]',
    chevron: 'group-hover:text-[var(--coconut-shell)]',
  },
  indigo: {
    hover: 'hover:shadow-[var(--coconut-palm)]/20',
    text: 'text-[var(--coconut-palm)] group-hover:text-[var(--coconut-cream)]',
    chevron: 'group-hover:text-[var(--coconut-palm)]',
  },
};

export function ToolCard({
  tool,
  technologies,
  accentColor,
  isCoconut = false,
  onPlayClick,
  onPlayHover,
  onMediumHaptic,
  onClick,
}: ToolCardProps) {
  const colors = COLOR_CLASSES[accentColor];

  return (
    <button
      onClick={() => {
        onPlayClick();
        onMediumHaptic();
        onClick();
      }}
      onMouseEnter={onPlayHover}
      className={`
        group relative rounded-xl sm:rounded-2xl border overflow-hidden bg-gradient-to-br transition-all duration-400 hover:scale-[1.02] snap-start flex-shrink-0 text-left
        ${isCoconut
          ? 'w-[320px] sm:w-[400px] md:w-[480px] border-[var(--coconut-palm)]/30 from-[var(--coconut-palm)]/10 via-[var(--coconut-husk)]/5 to-[var(--coconut-palm)]/10 hover:border-[var(--coconut-palm)]/50 hover:shadow-2xl hover:shadow-[var(--coconut-palm)]/20'
          : `w-[240px] sm:w-[280px] md:w-[320px] border-white/10 from-white/5 to-transparent hover:from-white/10 hover:shadow-xl ${colors.hover}`
        }
      `}
    >
      {tool.imageUrl && (
        <div className={`relative overflow-hidden ${isCoconut ? 'h-44 sm:h-56 md:h-64' : 'h-32 sm:h-40 md:h-44'}`}>
          <img 
            src={tool.imageUrl} 
            alt={tool.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          <div className={`
            absolute top-2 sm:top-3 left-2 sm:left-3 rounded-lg sm:rounded-xl bg-black/40 backdrop-blur-md border flex items-center justify-center group-hover:scale-110 transition-transform
            ${isCoconut 
              ? 'w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 border-[var(--coconut-palm)]/30' 
              : 'w-8 sm:w-9 md:w-10 h-8 sm:h-9 md:h-10 border-white/20'
            }
          `}>
            <span className={isCoconut ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg md:text-xl'}>{tool.icon}</span>
          </div>
          
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1.5 sm:gap-2">
            {tool.badge && (
              <div className={`
                px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg backdrop-blur-sm text-[10px] sm:text-xs font-bold text-white shadow-lg
                ${isCoconut 
                  ? 'bg-[var(--coconut-palm)]/90 border border-[var(--coconut-palm)]/30' 
                  : 'bg-[var(--coconut-palm)]/90 border border-[var(--coconut-palm)]/30 animate-pulse'
                }
              `}>
                {tool.badge}
              </div>
            )}
            {tool.comingSoon && (
              <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-[var(--coconut-shell)]/90 backdrop-blur-sm border border-[var(--coconut-shell)]/30 text-[10px] sm:text-xs font-bold text-white shadow-lg">
                Soon
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-3 sm:p-4">
        <h4 className={`mb-1 sm:mb-1.5 transition-colors ${isCoconut ? 'text-white group-hover:text-[var(--coconut-cream)]' : `text-white`}`}>
          {tool.name}
        </h4>

        <p className="text-[var(--coconut-husk)] mb-2 sm:mb-3 leading-relaxed line-clamp-2">
          {tool.description}
        </p>

        {!isCoconut && technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
            {technologies.slice(0, 2).map((tech) => (
              <span 
                key={tech.id}
                className="px-1.5 py-0.5 rounded text-[10px] sm:text-xs bg-white/5 text-[var(--coconut-husk)] border border-white/10"
              >
                {tech.icon} {tech.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className={`transition-colors ${colors.text}`}>
            {isCoconut ? 'Ouvrir →' : 'Utiliser →'}
          </span>
          <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-all ${isCoconut ? 'text-[var(--coconut-palm)]' : `text-[var(--coconut-husk)] ${colors.chevron}`}`} />
        </div>
      </div>
    </button>
  );
}