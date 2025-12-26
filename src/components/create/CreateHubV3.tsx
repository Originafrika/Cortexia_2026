/**
 * CREATE HUB V3 - Cortexia Real Specification
 * BDS: Rhétorique du Message - Communication Impactante
 * 
 * 7 Arts de Perfection Divine:
 * 1. Grammaire - Structure claire des éléments
 * 2. Logique - Parcours utilisateur évident
 * 3. Rhétorique - Guide l'attention avec intention
 * 4. Arithmétique - Rythme et harmonie visuelle
 * 5. Géométrie - Proportions divines (4/8/16)
 * 6. Musique - Motion rythmée
 * 7. Astronomie - Vision systémique
 */

import { useState } from 'react';
import { Search, Sparkles, Zap, Crown, AlertTriangle, Flame, TrendingUp } from 'lucide-react';
import { ToolCardV3 } from './ToolCardV3';
import { CategoryFilterV3 } from './CategoryFilterV3';
import { ProviderStatusBanner } from './ProviderStatusBanner';
import { ALL_CORTEXIA_TOOLS, TOOL_CATEGORIES, getAccessibleTools } from '../../lib/config/cortexia-tools';
import { PROVIDER_STATUS } from '../../lib/config/cortexia-models';
import type { Screen } from '../../App';

interface CreateHubV3Props {
  onNavigate: (screen: Screen) => void;
  onSelectTool: (toolId: string) => void;
  userFreeCredits?: number;
  userPaidCredits?: number;
}

export function CreateHubV3({ 
  onNavigate, 
  onSelectTool,
  userFreeCredits = 25,
  userPaidCredits = 0,
}: CreateHubV3Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');

  const hasPaidCredits = userPaidCredits > 0;
  const pollinationsDown = !PROVIDER_STATUS.pollinations.available;

  // Accessible tools
  const accessibleTools = getAccessibleTools(hasPaidCredits);
  
  // Filter by search and category
  const filteredTools = accessibleTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Locked tools (opposite credit type)
  const lockedTools = ALL_CORTEXIA_TOOLS.filter(tool => {
    if (tool.requiredCredits === 'free') {
      return hasPaidCredits; // Free tools locked if has paid credits
    } else {
      return !hasPaidCredits; // Paid tools locked if no paid credits
    }
  });

  return (
    <div className="w-full min-h-screen bg-black text-white relative overflow-hidden">
      {/* BDS: Géométrie - Background orbs avec proportions harmonieuses */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '4s' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" 
          style={{ animationDelay: '1s', animationDuration: '6s' }} 
        />
        <div 
          className="absolute top-1/2 right-1/3 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse" 
          style={{ animationDelay: '2s', animationDuration: '8s' }} 
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* BDS: Rhétorique - Warning banner guide l'attention */}
        {pollinationsDown && <ProviderStatusBanner />}

        {/* BDS: Grammaire - Header structuré et clair */}
        <div className="mb-12">
          {/* Badge with motion */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 mb-6 hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-sm text-purple-300">Cortexia Creation Platform</span>
          </div>

          {/* Title - BDS: Arithmétique - Hiérarchie typographique */}
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Créez avec l'IA
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mb-6">
            {hasPaidCredits 
              ? `Accès premium avec ${userPaidCredits} crédits payants - Modèles professionnels débloqués`
              : `Créativité illimitée avec ${userFreeCredits} crédits gratuits mensuels`
            }
          </p>

          {/* BDS: Musique - Credit display avec rythme visuel */}
          <div className="flex items-center gap-4">
            {hasPaidCredits ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-colors">
                  <Crown className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-purple-300 font-medium">{userPaidCredits} crédits premium</p>
                    <p className="text-xs text-purple-400/60">Flux 2 Pro, Veo 3.1, Gemini</p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium text-sm transition-all hover:scale-105">
                  Acheter plus
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors">
                <Zap className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-green-300 font-medium">{userFreeCredits} crédits gratuits</p>
                  <p className="text-xs text-green-400/60">SeeDream, Kontext, NanoBanana</p>
                </div>
              </div>
            )}
          </div>

          {/* BDS: Logique - Important rule explanation */}
          {hasPaidCredits && (
            <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-orange-300 font-medium mb-1">
                  Mode Premium Actif
                </p>
                <p className="text-xs text-orange-400/80">
                  Les crédits payants vous donnent accès aux modèles premium (Flux 2 Pro, Veo 3.1, Gemini). 
                  Les outils gratuits seront automatiquement débloqués lorsque vos crédits payants seront épuisés.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* BDS: Géométrie - Search & Filters avec espacement 8/16 */}
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
          <CategoryFilterV3
            categories={TOOL_CATEGORIES}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* BDS: Astronomie - Available Tools Section */}
        {filteredTools.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h2 className="text-2xl font-bold">Outils Disponibles</h2>
              <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-xs text-purple-300">
                {filteredTools.length}
              </span>
            </div>

            {/* BDS: Géométrie - Grid with divine proportions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map(tool => (
                <ToolCardV3
                  key={tool.id}
                  tool={tool}
                  onClick={() => onSelectTool(tool.id)}
                  isAccessible={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Locked Tools Section */}
        {lockedTools.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Crown className="w-5 h-5 text-yellow-400" />
              <h2 className="text-2xl font-bold">
                {hasPaidCredits ? 'Outils Gratuits' : 'Outils Premium'}
              </h2>
              <span className="px-2 py-1 rounded-lg bg-yellow-500/20 text-xs text-yellow-300">
                {hasPaidCredits ? 'Désactivés' : 'Débloquables'}
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedTools.map(tool => (
                <ToolCardV3
                  key={tool.id}
                  tool={tool}
                  onClick={() => {
                    if (hasPaidCredits) {
                      alert('Les outils gratuits sont désactivés en mode premium. Épuisez vos crédits payants pour y accéder à nouveau.');
                    } else {
                      alert('Achetez des crédits payants pour débloquer cet outil !');
                    }
                  }}
                  isAccessible={false}
                  lockReason={hasPaidCredits ? 'Mode premium' : 'Crédits payants requis'}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredTools.length === 0 && lockedTools.length === 0 && (
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

        {/* BDS: Arithmétique - Stats cards avec rythme visuel */}
        <div className="mt-16 grid grid-cols-3 gap-6">
          <StatCard
            label="Outils disponibles"
            value={filteredTools.length.toString()}
            icon={<Zap className="w-5 h-5" />}
            color="purple"
          />
          <StatCard
            label="Catégories"
            value={TOOL_CATEGORIES.length.toString()}
            icon={<Sparkles className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            label={hasPaidCredits ? "Crédits premium" : "Crédits gratuits"}
            value={hasPaidCredits ? userPaidCredits.toString() : userFreeCredits.toString()}
            icon={hasPaidCredits ? <Crown className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            color={hasPaidCredits ? "purple" : "green"}
          />
        </div>
      </div>
    </div>
  );
}

// BDS: Grammaire - StatCard component avec structure claire
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: 'purple' | 'blue' | 'green';
}

function StatCard({ label, value, icon, color = 'purple' }: StatCardProps) {
  const colorClasses = {
    purple: 'text-purple-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
  };

  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
      <div className="flex items-center gap-3 mb-2">
        <div className={`${colorClasses[color]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
