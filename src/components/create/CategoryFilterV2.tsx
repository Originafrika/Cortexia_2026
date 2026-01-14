/**
 * CATEGORY FILTER V2
 * Enhanced filter with badges
 * ✅ OPTIMIZED: BDS colors applied
 */

interface CategoryFilterV2Props {
  categories: Array<{
    id: string;
    name: string;
    description: string;
    badge: string;
    color: string;
  }>;
  selected: string | 'all';
  onSelect: (category: string | 'all') => void;
}

export function CategoryFilterV2({ categories, selected, onSelect }: CategoryFilterV2Props) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2">
      {/* All button */}
      <button
        onClick={() => onSelect('all')}
        className={`
          px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300
          ${selected === 'all'
            ? 'bg-white text-black'
            : 'bg-white/5 text-[var(--coconut-husk)] hover:bg-white/10 border border-white/10'
          }
        `}
      >
        Tous les outils
      </button>

      {/* Category buttons */}
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`
            px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 relative
            ${selected === category.id
              ? 'bg-[var(--coconut-palm)] text-white'
              : 'bg-white/5 text-[var(--coconut-husk)] hover:bg-white/10 border border-white/10'
            }
          `}
        >
          {category.name}
          {/* Badge */}
          {category.badge && (
            <span className={`
              ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold
              ${selected === category.id 
                ? 'bg-white/20 text-white' 
                : category.badge === 'FREE'
                  ? 'bg-[var(--coconut-palm)]/20 text-[var(--coconut-palm)]'
                  : 'bg-[var(--coconut-husk)]/20 text-[var(--coconut-husk)]'
              }
            `}>
              {category.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
