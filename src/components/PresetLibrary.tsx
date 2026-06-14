import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Heart, Sparkles } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { presets, categories, type Preset } from '../lib/presets/presets';
import { PresetCard } from './PresetCard';

interface PresetLibraryProps {
  onSelect: (preset: Preset) => void;
  onClose: () => void;
}

export function PresetLibrary({ onSelect, onClose }: PresetLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cortexia-favorite-presets');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load favorites:', e);
      }
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (presetId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(presetId)
        ? prev.filter(id => id !== presetId)
        : [...prev, presetId];
      
      localStorage.setItem('cortexia-favorite-presets', JSON.stringify(updated));
      return updated;
    });
  };

  // Filter presets
  const filteredPresets = useMemo(() => {
    let filtered = presets;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter(p => favorites.includes(p.id));
    }

    return filtered;
  }, [selectedCategory, searchQuery, showFavoritesOnly, favorites]);

  const handleSelectPreset = (preset: Preset) => {
    onSelect(preset);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-6xl bg-[#0A0A0C] border border-white/10 rounded-t-3xl md:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-[#6366f1]" />
              <h2 className="font-semibold text-lg">Preset Library</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search presets, styles, or tags..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-[#6366f1] text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
            
            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ml-2 ${
                showFavoritesOnly
                  ? 'bg-red-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <Heart className={`size-4 ${showFavoritesOnly ? 'fill-white' : ''}`} />
              <span>Favorites</span>
              {favorites.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {favorites.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredPresets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-white/20 mb-3">
                {showFavoritesOnly ? <Heart className="size-12 mx-auto" /> : <Search className="size-12 mx-auto" />}
              </div>
              <p className="text-white/40">
                {showFavoritesOnly 
                  ? 'No favorites yet. Click the heart icon on presets to save them!'
                  : 'No presets found. Try a different search or category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredPresets.map((preset) => (
                  <motion.div
                    key={preset.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PresetCard
                      preset={preset}
                      onSelect={handleSelectPreset}
                      isFavorite={favorites.includes(preset.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <p className="text-xs text-white/40 text-center">
            {filteredPresets.length} {filteredPresets.length === 1 ? 'preset' : 'presets'} available
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
