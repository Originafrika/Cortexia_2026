/**
 * CATEGORY FILTER COMPONENT
 * Filtre par catégorie d'outils
 * BDS: Logique (cohérence), Musique (rythme)
 * ✅ OPTIMIZED: BDS colors applied
 */

import type { ToolCategory } from '../../lib/types/creation-tools';

interface CategoryFilterProps {
  categories: Array<{
    id: ToolCategory;
    name: string;
    description: string;
    icon: string;
  }>;
  selected: ToolCategory | 'all';
  onSelect: (category: ToolCategory | 'all') => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
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
            px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300
            ${selected === category.id
              ? 'bg-[var(--coconut-palm)] text-white'
              : 'bg-white/5 text-[var(--coconut-husk)] hover:bg-white/10 border border-white/10'
            }
          `}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
