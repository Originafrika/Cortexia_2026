/**
 * CREATE HUB - Main landing page for creation tools
 * BDS: Grammaire (structure claire), Géométrie (grid system)
 */

import { useState } from 'react';
import { Search, Sparkles, Zap } from 'lucide-react';
import { ToolCard } from './ToolCard';
import { CategoryFilter } from './CategoryFilter';
import { CREATION_TOOLS, TOOL_CATEGORIES } from '../../lib/config/creation-tools';
import type { ToolCategory } from '../../lib/types/creation-tools';
import type { Screen } from '../../App';

interface CreateHubProps {
  onNavigate: (screen: Screen) => void;
  onSelectTool: (toolId: string) => void;
}

export function CreateHub({ onNavigate, onSelectTool }: CreateHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');

  const filteredTools = CREATION_TOOLS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--coconut-palm)]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--coconut-palm)]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-[var(--coconut-husk)]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[var(--coconut-palm)]/10 border border-[var(--coconut-palm)]/20 mb-4 sm:mb-6">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--coconut-palm)]" />
            <span className="text-xs sm:text-sm text-[var(--coconut-palm)]">Multi-API Creation Hub</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-[var(--coconut-cream)] to-[var(--coconut-milk)] bg-clip-text text-transparent">
            Créez avec l'IA
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[var(--coconut-husk)] max-w-3xl">
            Exploitez la puissance de Pollinations, Together et Replicate pour créer des images,
            vidéos et contenus professionnels en quelques secondes.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-12 space-y-6">
          {/* Search bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--coconut-husk)]" />
            <input
              type="text"
              placeholder="Rechercher un outil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-[var(--coconut-husk)] focus:outline-none focus:border-[var(--coconut-palm)]/50 focus:ring-2 focus:ring-[var(--coconut-palm)]/20 transition-all"
            />
          </div>

          {/* Category filters */}
          <CategoryFilter
            categories={TOOL_CATEGORIES}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Tools grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTools.map(tool => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onClick={() => onSelectTool(tool.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-24">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--coconut-husk)]" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[var(--coconut-husk)]">
              Aucun outil trouvé
            </h3>
            <p className="text-sm sm:text-base text-[var(--coconut-husk)]">
              Essayez de modifier votre recherche ou vos filtres
            </p>
          </div>
        )}

        {/* Quick stats */}
        <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-3 sm:gap-6">
          <StatCard
            label="Outils disponibles"
            value={CREATION_TOOLS.length.toString()}
            icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5" />}
          />
          <StatCard
            label="APIs intégrées"
            value="3"
            icon={<Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />}
          />
          <StatCard
            label="Générations/mois"
            value="∞"
            icon={<Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />}
          />
        </div>
      </div>
    </div>
  );
}

// Stat card component
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="p-3 sm:p-4 md:p-6 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
        <div className="text-[var(--coconut-palm)]">
          {icon}
        </div>
        <span className="text-xs sm:text-sm text-[var(--coconut-husk)] hidden sm:inline">{label}</span>
      </div>
      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{value}</p>
      <span className="text-[10px] sm:hidden text-[var(--coconut-husk)] block mt-1">{label}</span>
    </div>
  );
}