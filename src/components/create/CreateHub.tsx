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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Multi-API Creation Hub</span>
          </div>

          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Créez avec l'IA
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl">
            Exploitez la puissance de Pollinations, Together et Replicate pour créer des images,
            vidéos et contenus professionnels en quelques secondes.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-12 space-y-6">
          {/* Search bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher un outil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map(tool => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onClick={() => onSelectTool(tool.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-400">
              Aucun outil trouvé
            </h3>
            <p className="text-gray-500">
              Essayez de modifier votre recherche ou vos filtres
            </p>
          </div>
        )}

        {/* Quick stats */}
        <div className="mt-16 grid grid-cols-3 gap-6">
          <StatCard
            label="Outils disponibles"
            value={CREATION_TOOLS.length.toString()}
            icon={<Zap className="w-5 h-5" />}
          />
          <StatCard
            label="APIs intégrées"
            value="3"
            icon={<Sparkles className="w-5 h-5" />}
          />
          <StatCard
            label="Générations/mois"
            value="∞"
            icon={<Sparkles className="w-5 h-5" />}
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
    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-purple-400">
          {icon}
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
