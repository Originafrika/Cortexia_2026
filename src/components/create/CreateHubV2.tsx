/**
 * CREATE HUB V2 - Multi-Model Creation Platform
 * BDS: Architecture complète avec free/paid credits
 */

import { useState } from 'react';
import { Search, Sparkles, Zap, Crown, AlertCircle, TrendingUp, Flame } from 'lucide-react';
import { ToolCardV2 } from './ToolCardV2';
import { CategoryFilterV2 } from './CategoryFilterV2';
import { ProviderStatusBanner } from './ProviderStatusBanner';
import { CREATION_TOOLS_V2, TOOL_CATEGORIES_V2 } from '../../lib/config/creation-tools-v2';
import { CREDIT_RULES, PROVIDER_STATUS } from '../../lib/config/models-catalog';
import type { Screen } from '../../App';

interface CreateHubV2Props {
  onNavigate: (screen: Screen) => void;
  onSelectTool: (toolId: string) => void;
  userFreeCredits?: number;
  userPaidCredits?: number;
}

export function CreateHubV2({ 
  onNavigate, 
  onSelectTool,
  userFreeCredits = 25,
  userPaidCredits = 0,
}: CreateHubV2Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');

  // Check if Pollinations is available
  const pollinationsDown = !PROVIDER_STATUS.pollinations.available;
  const canUseFreeCredits = CREDIT_RULES.canUseFreeCredits(userPaidCredits);

  // Filter tools
  const filteredTools = CREATION_TOOLS_V2.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    
    // Check accessibility
    let isAccessible = true;
    if (tool.creditType === 'free') {
      isAccessible = canUseFreeCredits && userFreeCredits >= tool.minCredits;
    } else {
      isAccessible = userPaidCredits >= tool.minCredits;
    }
    
    return matchesSearch && matchesCategory && isAccessible;
  });

  const lockedTools = CREATION_TOOLS_V2.filter(tool => {
    if (tool.creditType === 'free') {
      return !canUseFreeCredits || userFreeCredits < tool.minCredits;
    } else {
      return userPaidCredits < tool.minCredits;
    }
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
        {/* Provider Status Warning */}
        {pollinationsDown && (
          <ProviderStatusBanner />
        )}

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Multi-Model AI Creation Platform</span>
          </div>

          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Créez avec l'IA
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mb-6">
            {canUseFreeCredits 
              ? `Exploitez vos ${userFreeCredits} crédits gratuits pour créer avec les meilleurs modèles IA`
              : `Utilisez vos ${userPaidCredits} crédits payants pour accéder aux modèles premium`
            }
          </p>

          {/* Credit Display */}
          <div className="flex items-center gap-4">
            {canUseFreeCredits ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30">
                <Zap className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-green-300 font-medium">{userFreeCredits} crédits gratuits</p>
                  <p className="text-xs text-green-400/60">Se renouvelle chaque mois</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <Crown className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-purple-300 font-medium">{userPaidCredits} crédits payants</p>
                    <p className="text-xs text-purple-400/60">Accès aux modèles premium</p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium text-sm transition-all">
                  Acheter plus de crédits
                </button>
              </>
            )}
          </div>

          {/* Important Rule */}
          {!canUseFreeCredits && (
            <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-orange-300 font-medium mb-1">
                  Mode Crédits Payants Actif
                </p>
                <p className="text-xs text-orange-400/80">
                  Vous avez des crédits payants, donc les crédits gratuits sont désactivés. 
                  Une fois vos crédits payants épuisés, vous retrouverez l'accès aux modèles gratuits.
                </p>
              </div>
            </div>
          )}
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
          <CategoryFilterV2
            categories={TOOL_CATEGORIES_V2}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Available Tools */}
        {filteredTools.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h2 className="text-2xl font-bold">Outils Disponibles</h2>
              <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-xs text-purple-300">
                {filteredTools.length}
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map(tool => (
                <ToolCardV2
                  key={tool.id}
                  tool={tool}
                  onClick={() => onSelectTool(tool.id)}
                  userCredits={tool.creditType === 'free' ? userFreeCredits : userPaidCredits}
                />
              ))}
            </div>
          </div>
        )}

        {/* Locked Tools */}
        {lockedTools.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Crown className="w-5 h-5 text-yellow-400" />
              <h2 className="text-2xl font-bold">Outils Premium</h2>
              <span className="px-2 py-1 rounded-lg bg-yellow-500/20 text-xs text-yellow-300">
                Payant
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedTools.map(tool => (
                <ToolCardV2
                  key={tool.id}
                  tool={tool}
                  onClick={() => {
                    // Show upgrade modal
                    alert('Achetez des crédits payants pour débloquer cet outil !');
                  }}
                  userCredits={tool.creditType === 'free' ? userFreeCredits : userPaidCredits}
                  isLocked
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

        {/* Quick stats */}
        <div className="mt-16 grid grid-cols-3 gap-6">
          <StatCard
            label="Outils disponibles"
            value={filteredTools.length.toString()}
            icon={<Zap className="w-5 h-5" />}
          />
          <StatCard
            label="Modèles IA"
            value="12+"
            icon={<Sparkles className="w-5 h-5" />}
          />
          <StatCard
            label={canUseFreeCredits ? "Crédits gratuits" : "Crédits payants"}
            value={canUseFreeCredits ? userFreeCredits.toString() : userPaidCredits.toString()}
            icon={canUseFreeCredits ? <Zap className="w-5 h-5" /> : <Crown className="w-5 h-5" />}
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
