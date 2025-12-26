/**
 * TEMPLATES GALLERY
 * Affiche et permet de sélectionner des templates prédéfinis
 * BDS: Grammaire (clarté), Rhétorique (communication), Géométrie (structure)
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Clock, DollarSign, Sparkles, ChevronRight, Wand2 } from 'lucide-react';
import { useSound } from '../../lib/hooks/useSound';
import { useHaptic } from '../../lib/hooks/useHaptic';
import { TEMPLATE_CATEGORIES, getTemplatesByCategory, type CocoTemplate } from '../../lib/templates/coconut-templates';

interface TemplatesGalleryProps {
  onSelectTemplate: (template: CocoTemplate) => void;
  onCustomIntent?: () => void;
}

export function TemplatesGallery({ onSelectTemplate, onCustomIntent }: TemplatesGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('social');
  const [searchQuery, setSearchQuery] = useState('');

  const { playClick, playHover } = useSound();
  const { light } = useHaptic();

  const templates = getTemplatesByCategory(selectedCategory);

  // Filter by search
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-300">Templates</span>
        </div>

        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              Commencez avec un template
            </h2>

            <p className="text-gray-400 text-lg">
              Choisissez parmi nos templates optimisés pour accélérer votre création
            </p>
          </div>

          {/* Custom Intent Button */}
          {onCustomIntent && (
            <button
              onClick={() => {
                playClick();
                light();
                onCustomIntent();
              }}
              onMouseEnter={() => playHover()}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg text-white transition-all"
            >
              <Wand2 className="w-4 h-4" />
              Création personnalisée
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un template..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => {
                playClick();
                light();
                setSelectedCategory(key);
              }}
              onMouseEnter={() => playHover()}
              className={`
                px-4 py-2 rounded-lg transition-all whitespace-nowrap
                ${selectedCategory === key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <TemplateCard
              template={template}
              onSelect={() => onSelectTemplate(template)}
            />
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400">Aucun template trouvé</p>
          <p className="text-sm text-gray-500 mt-1">
            Essayez une autre recherche ou catégorie
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// TEMPLATE CARD
// ============================================

interface TemplateCardProps {
  template: CocoTemplate;
  onSelect: () => void;
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const { playClick, playHover } = useSound();
  const { medium } = useHaptic();

  return (
    <div
      className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
      onClick={() => {
        playClick();
        medium();
        onSelect();
      }}
      onMouseEnter={() => playHover()}
    >
      {/* Icon */}
      <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
        <span className="text-2xl">{template.icon}</span>
      </div>

      {/* Name & Description */}
      <h3 className="font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
        {template.name}
      </h3>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        {template.description}
      </p>

      {/* Meta info */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{template.estimatedTime}</span>
        </div>

        <div className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          <span>{template.estimatedCost} crédits</span>
        </div>
      </div>

      {/* Node count badge */}
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 text-xs text-gray-400">
        <Sparkles className="w-3 h-3" />
        <span>{template.nodes.length} assets</span>
      </div>

      {/* Hover arrow */}
      <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}