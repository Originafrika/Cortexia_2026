/**
 * CREATE HUB TEMPLE DIVINE - BDS Beauty Design System
 * Architecture sacrée basée sur les 7 Arts de Perfection Divine
 * Layout cosmique avec prompt central comme un soleil
 * 7 Arts: Tous intégrés dans une symphonie visuelle
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sparkles, Crown, Zap, Palette, Megaphone, Wand2, History, Settings, User } from 'lucide-react';
import { DivinePromptOrb } from './DivinePromptOrb';
import { ToolCategory } from './ToolCategory';
import { CosmicBackground } from './CosmicBackground';
import { useTheme } from '../../lib/contexts/ThemeContext';
import { useSound } from '../../lib/hooks/useSound';
import { useHaptic } from '../../lib/hooks/useHaptic';
import type { Screen } from '../../App';

interface Technology {
  id: string;
  name: string;
  icon: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  technologies: string[];
  badge?: string;
  comingSoon?: boolean;
  imageUrl?: string;
}

const TECHNOLOGIES: Technology[] = [
  { id: 'seedream', name: 'SeeDream', icon: '🌱' },
  { id: 'kontext', name: 'Kontext', icon: '🎨' },
  { id: 'nanobanana', name: 'NanoBanana', icon: '🍌' },
  { id: 'flux-schnell', name: 'Flux Schnell', icon: '⚡' },
  { id: 'flux-2-pro', name: 'Flux 2 Pro', icon: '💎' },
  { id: 'veo-3.1', name: 'Veo 3.1', icon: '🎬' },
  { id: 'gemini', name: 'Gemini', icon: '🧠' },
];

const TOOLS: Tool[] = [
  // Quick Create (6 tools)
  {
    id: 'text-to-image',
    name: 'Text to Image',
    description: 'Créez des images à partir de texte',
    icon: '✨',
    category: 'quick',
    technologies: ['seedream', 'flux-schnell'],
    imageUrl: 'https://images.unsplash.com/photo-1761223956832-a1e341babb92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'image-enhance',
    name: 'Image Enhancement',
    description: 'Améliorez une image (1 image)',
    icon: '🎨',
    category: 'quick',
    technologies: ['kontext'],
    imageUrl: 'https://images.unsplash.com/photo-1764557222271-9d0556161d35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'image-blend',
    name: 'Image Blend',
    description: 'Fusionnez 2-3 images',
    icon: '🎭',
    category: 'quick',
    technologies: ['nanobanana'],
    imageUrl: 'https://images.unsplash.com/photo-1729258611581-d13bc7fea110?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'multi-image',
    name: 'Multi-Image Creator',
    description: 'Créez 4-10 images cohérentes',
    icon: '🖼️',
    category: 'quick',
    technologies: ['seedream'],
    imageUrl: 'https://images.unsplash.com/photo-1612681336352-b8b82f3c775a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'illustration',
    name: 'Illustration Creator',
    description: 'Illustrations & artwork digital',
    icon: '🎨',
    category: 'quick',
    technologies: ['seedream'],
    imageUrl: 'https://images.unsplash.com/photo-1545181824-24c265f8fd48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: '3d-render',
    name: '3D Render',
    description: 'Rendus 3D professionnels',
    icon: '🎲',
    category: 'quick',
    technologies: ['flux-2-pro'],
    comingSoon: true,
    imageUrl: 'https://images.unsplash.com/photo-1707651652282-eba13b6d010a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  
  // Design Templates (10 tools)
  {
    id: 'portrait',
    name: 'Portrait Pro',
    description: 'Portraits professionnels',
    icon: '👤',
    category: 'design',
    technologies: ['seedream'],
    imageUrl: 'https://images.unsplash.com/photo-1762522922011-117e732c6842?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'product',
    name: 'Product Photo',
    description: 'Photos produit e-commerce',
    icon: '📦',
    category: 'design',
    technologies: ['seedream'],
    imageUrl: 'https://images.unsplash.com/photo-1691096674730-2b5fb28b726f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'logo',
    name: 'Logo Design',
    description: 'Logos minimalistes & modernes',
    icon: '🎯',
    category: 'design',
    technologies: ['seedream'],
    imageUrl: 'https://images.unsplash.com/photo-1626251851903-1143b5c6f057?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'poster',
    name: 'Poster Design',
    description: 'Posters & affiches créatives',
    icon: '🖼️',
    category: 'design',
    technologies: ['seedream'],
    imageUrl: 'https://images.unsplash.com/photo-1655156871717-ccda8ae8274c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'business-card',
    name: 'Business Card',
    description: 'Cartes de visite professionnelles',
    icon: '💳',
    category: 'design',
    technologies: ['seedream'],
    imageUrl: 'https://images.unsplash.com/photo-1718670013921-2f144aba173a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'book-cover',
    name: 'Book Cover',
    description: 'Couvertures de livre impactantes',
    icon: '📚',
    category: 'design',
    technologies: ['seedream'],
    imageUrl: 'https://images.unsplash.com/photo-1487147264018-f937fba0c817?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'icon-set',
    name: 'Icon Set',
    description: 'Sets d\'icônes cohérents',
    icon: '🎨',
    category: 'design',
    technologies: ['seedream'],
    imageUrl: 'https://images.unsplash.com/photo-1649180562612-0dc7dcf5ac92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'pattern',
    name: 'Pattern Generator',
    description: 'Patterns & textures uniques',
    icon: '🔷',
    category: 'design',
    technologies: ['seedream'],
    imageUrl: 'https://images.unsplash.com/photo-1550537687-c91072c4792d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'branding',
    name: 'Branding Kit',
    description: 'Identité visuelle complète',
    icon: '🎨',
    category: 'design',
    technologies: ['seedream'],
    imageUrl: 'https://images.unsplash.com/photo-1670341445726-8a9f4169da8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'presentation',
    name: 'Presentation Slides',
    description: 'Slides modernes & impactants',
    icon: '📊',
    category: 'design',
    technologies: ['seedream'],
    imageUrl: 'https://images.unsplash.com/photo-1733222765056-b0790217baa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  
  // Marketing (5 tools)
  {
    id: 'social',
    name: 'Social Media Post',
    description: 'Posts réseaux sociaux optimisés',
    icon: '📱',
    category: 'marketing',
    technologies: ['seedream'],
    imageUrl: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'ad-banner',
    name: 'Ad Banner',
    description: 'Bannières publicitaires percutantes',
    icon: '📢',
    category: 'marketing',
    technologies: ['seedream'],
    imageUrl: 'https://images.unsplash.com/photo-1631270315847-f418bde47ca6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'email-template',
    name: 'Email Newsletter',
    description: 'Templates email professionnels',
    icon: '📧',
    category: 'marketing',
    technologies: ['seedream'],
    imageUrl: 'https://images.unsplash.com/photo-1576859933856-c07ec7ddfe92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    description: 'Miniatures YouTube accrocheuses',
    icon: '🎬',
    category: 'marketing',
    technologies: ['seedream'],
    imageUrl: 'https://images.unsplash.com/photo-1637806631554-bcfe2c618058?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'infographic',
    name: 'Infographic',
    description: 'Infographies claires & visuelles',
    icon: '📊',
    category: 'marketing',
    technologies: ['seedream'],
    imageUrl: 'https://images.unsplash.com/photo-1733222765056-b0790217baa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  
  // Advanced (3 tools)
  {
    id: 'coconut',
    name: 'Coconut',
    description: 'Orchestration multimodale complète • Flux 2 Pro • Veo 3.1 • Gemini',
    icon: '🥥',
    category: 'advanced',
    technologies: ['flux-2-pro', 'veo-3.1', 'gemini'],
    badge: 'PREMIUM',
    imageUrl: 'https://images.unsplash.com/photo-1601644825958-90b5ac4b9bdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'ai-vision',
    name: 'AI Vision',
    description: 'Analyse & intelligence visuelle',
    icon: '👁️',
    category: 'advanced',
    technologies: ['gemini'],
    comingSoon: true,
    imageUrl: 'https://images.unsplash.com/photo-1696517170961-661e9dca962e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: 'image-to-video',
    name: 'Image to Video',
    description: 'Transformez images en vidéos',
    icon: '🎥',
    category: 'advanced',
    technologies: ['veo-3.1'],
    comingSoon: true,
    imageUrl: 'https://images.unsplash.com/photo-1654288891700-95f67982cbcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
];

interface CreateHubTempleDivineProps {
  onNavigate: (screen: Screen) => void;
  onSelectTool: (toolId: string) => void;
}

export function CreateHubTempleDivine({ 
  onNavigate, 
  onSelectTool,
}: CreateHubTempleDivineProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('seedream');
  const [isMorphing, setIsMorphing] = useState(false);

  const { setTheme } = useTheme();
  const { playClick, playHover, playWhoosh } = useSound();
  const { light, medium } = useHaptic();

  useEffect(() => {
    setTheme('purple');
  }, [setTheme]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    if (isMorphing) {
      timeoutId = setTimeout(() => {
        onSelectTool('coconut');
        setIsMorphing(false);
      }, 800);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isMorphing, onSelectTool]);

  const filteredTools = TOOLS.filter(tool => {
    return selectedCategory === 'all' || tool.category === selectedCategory;
  });

  const handleToolClick = (tool: Tool) => {
    if (tool.id === 'coconut') {
      setIsMorphing(true);
      return;
    }
    playClick();
    medium();
    onSelectTool(tool.id);
  };

  return (
    <div className="w-full min-h-screen bg-black text-white relative overflow-hidden">
      {/* BDS: Astronomie - Cosmic background */}
      <CosmicBackground />

      {/* BDS: Astronomie - Divine header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50 backdrop-blur-xl bg-black/30 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Retour</span>
          </button>

          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent hidden sm:inline">
              Temple de Création
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all">
              <History className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* BDS: Rhétorique - Divine prompt orb (center focal point) */}
      <div className="relative z-10">
        <DivinePromptOrb
          prompt={prompt}
          onPromptChange={setPrompt}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onSubmit={() => {
            playWhoosh();
            medium();
            console.log('Divine generation:', prompt);
          }}
          placeholder="Exprimez votre vision créative... Les mots deviennent lumière, l'intention devient forme."
        />
      </div>

      {/* BDS: Géométrie - Sacred divider */}
      <div className="relative z-10 flex items-center justify-center my-16">
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-purple-500/50" />
          <Sparkles className="w-6 h-6 text-purple-400" />
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-purple-500/50" />
        </motion.div>
      </div>

      {/* BDS: Rhétorique - Category filters */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 mb-12">
        <div className="flex items-center justify-center gap-3 overflow-x-auto scrollbar-hide pb-2">
          {[
            { id: 'all', name: 'Cosmos', icon: Sparkles },
            { id: 'quick', name: 'Éclair', icon: Zap },
            { id: 'design', name: 'Art', icon: Palette },
            { id: 'marketing', name: 'Message', icon: Megaphone },
            { id: 'advanced', name: 'Divin', icon: Crown },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                onClick={() => {
                  playClick();
                  light();
                  setSelectedCategory(cat.id);
                }}
                onMouseEnter={() => playHover()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-5 py-3 rounded-2xl transition-all duration-400 flex items-center gap-2 whitespace-nowrap
                  ${isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* BDS: Géométrie - Tools grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-24">
        <div className="space-y-16">
          {(selectedCategory === 'all' || selectedCategory === 'quick') && (
            <ToolCategory
              title="Création Éclair"
              icon={Zap}
              iconColor="text-yellow-500"
              badgeColor="bg-yellow-500/10 text-yellow-400"
              accentColor="yellow"
              tools={filteredTools.filter(t => t.category === 'quick')}
              allTechnologies={TECHNOLOGIES}
              onToolClick={handleToolClick}
              onPlayClick={playClick}
              onPlayHover={playHover}
              onMediumHaptic={medium}
            />
          )}

          {(selectedCategory === 'all' || selectedCategory === 'design') && (
            <ToolCategory
              title="Templates Sacrés"
              icon={Palette}
              iconColor="text-pink-500"
              badgeColor="bg-pink-500/10 text-pink-400"
              accentColor="pink"
              tools={filteredTools.filter(t => t.category === 'design')}
              allTechnologies={TECHNOLOGIES}
              onToolClick={handleToolClick}
              onPlayClick={playClick}
              onPlayHover={playHover}
              onMediumHaptic={medium}
            />
          )}

          {(selectedCategory === 'all' || selectedCategory === 'marketing') && (
            <ToolCategory
              title="Messagers Célestes"
              icon={Megaphone}
              iconColor="text-orange-500"
              badgeColor="bg-orange-500/10 text-orange-400"
              accentColor="orange"
              tools={filteredTools.filter(t => t.category === 'marketing')}
              allTechnologies={TECHNOLOGIES}
              onToolClick={handleToolClick}
              onPlayClick={playClick}
              onPlayHover={playHover}
              onMediumHaptic={medium}
            />
          )}

          {(selectedCategory === 'all' || selectedCategory === 'advanced') && (
            <ToolCategory
              title="Pouvoirs Divins"
              icon={Crown}
              iconColor="text-indigo-500"
              badgeColor="bg-indigo-500/10 text-indigo-400"
              accentColor="indigo"
              tools={filteredTools.filter(t => t.category === 'advanced')}
              allTechnologies={TECHNOLOGIES}
              onToolClick={handleToolClick}
              onPlayClick={playClick}
              onPlayHover={playHover}
              onMediumHaptic={medium}
            />
          )}
        </div>
      </div>
    </div>
  );
}
