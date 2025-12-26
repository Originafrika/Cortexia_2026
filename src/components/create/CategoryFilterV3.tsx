/**
 * CATEGORY FILTER V3 - BDS Enhanced
 * BDS: Logique du Système - Décisions visuelles cohérentes
 */

interface CategoryFilterV3Props {
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

export function CategoryFilterV3({ categories, selected, onSelect }: CategoryFilterV3Props) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {/* All button - BDS: Grammaire - Style cohérent */}
      <button
        onClick={() => onSelect('all')}
        className={`
          px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300
          ${selected === 'all'
            ? 'bg-white text-black shadow-lg scale-105'
            : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
          }
        `}
      >
        Tous
      </button>

      {/* Category buttons - BDS: Musique - Rythme interactif */}
      {categories.map(category => {
        const badgeColors = {
          FREE: 'bg-green-500/20 text-green-400 border-green-500/30',
          MIXED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          PAID: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        };

        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`
              px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 relative
              ${selected === category.id
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10 hover:scale-105'
              }
            `}
          >
            <span>{category.name}</span>
            {/* Badge */}
            {category.badge && (
              <span className={`
                ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold border
                ${selected === category.id 
                  ? 'bg-white/20 text-white border-white/30' 
                  : badgeColors[category.badge as keyof typeof badgeColors]
                }
              `}>
                {category.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
