/**
 * CREATE HUB TEMPLE V3 - BDS Beauty Design System
 * Central hub for AI creation tools
 * 7 Arts: Géométrie (structure), Rhétorique (communication), Musique (transitions)
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, Palette, Megaphone, Wand2 } from 'lucide-react';
import { HeroPromptBar } from './HeroPromptBar';
import { ToolCategory } from './ToolCategory';
import { CreateHeader } from './CreateHeader';
import { ParallaxBackground } from '../shared/ParallaxBackground';
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
  
  // Advanced (3 tools) - Coconut now in grid
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

interface CreateHubTempleProps {
  onNavigate: (screen: Screen) => void;
  onSelectTool: (toolId: string) => void;
  debugMode?: boolean;
}

export function CreateHubTemple({ 
  onNavigate, 
  onSelectTool,
  debugMode = true,
}: CreateHubTempleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('seedream');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isMorphing, setIsMorphing] = useState(false);

  // BDS: Musique - Hooks for sound & haptic feedback
  const { setTheme } = useTheme();
  const { playClick, playHover, playWhoosh } = useSound();
  const { light, medium } = useHaptic();

  // BDS: Astronomie - Switch theme to purple on mount
  useEffect(() => {
    setTheme('purple');
  }, [setTheme]);

  // BDS: Musique - Cleanup morphing timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    
    if (isMorphing) {
      timeoutId = setTimeout(() => {
        onSelectTool('coconut');
        setIsMorphing(false);
      }, 800); // BDS: Arithmétique - Standardized timing
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isMorphing, onSelectTool]);

  // Filter tools
  const filteredTools = TOOLS.filter(tool => {
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      tool.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle tool selection with morphing transition for Coconut
  const handleToolClick = (tool: Tool) => {
    if (tool.id === 'coconut') {
      // BDS: Musique - Start morphing animation
      setIsMorphing(true);
      
      return;
    }

    setSelectedTool(tool);
    
    const firstTech = tool.technologies[0];
    if (firstTech && ['seedream', 'kontext', 'nanobanana', 'flux-schnell'].includes(firstTech)) {
      setSelectedModel(firstTech);
    }

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const clearToolSelection = () => {
    setSelectedTool(null);
    setPrompt('');
  };

  const getPlaceholder = () => {
    if (!selectedTool) {
      return 'Décrivez votre création... (ex: Une ville futuriste au coucher du soleil, style cyberpunk, lumières néon)';
    }

    const placeholders: Record<string, string> = {
      'text-to-image': 'Décrivez l\'image... (ex: Un dragon majestueux survolant des montagnes, art fantastique)',
      'image-enhance': 'Comment améliorer... (ex: Améliorer les couleurs, augmenter la netteté, look professionnel)',
      'image-blend': 'Style de fusion... (ex: Fusionner les images avec transition douce, style artistique)',
      'portrait': 'Portrait désiré... (ex: Portrait corporate, fond neutre, éclairage professionnel)',
      'product': 'Mise en scène... (ex: Photo produit minimaliste, fond blanc, éclairage studio)',
      'social': 'Contenu social... (ex: Post Instagram, couleurs vives, esthétique moderne)',
      'logo': 'Style de logo... (ex: Logo tech moderne, minimaliste, bleu et blanc)',
      'poster': 'Thème poster... (ex: Affiche festival de musique, typographie forte, couleurs vibrantes)',
      'email-template': 'Style email... (ex: Newsletter professionnelle, mise en page claire, couleurs de marque)',
      'ad-banner': 'Message publicitaire... (ex: Bannière lancement produit, accrocheur, call-to-action)',
      'youtube-thumbnail': 'Contenu vidéo... (ex: Miniature tutoriel, texte gras, expression faciale marquée)',
      'presentation': 'Style slides... (ex: Présentation corporate, mise en page moderne, visualisation de données)',
      'branding': 'Identité de marque... (ex: Branding startup tech, innovant, digne de confiance)',
    };

    return placeholders[selectedTool.id] || 'Décrivez votre création...';
  };

  return (
    <div className="w-full min-h-screen bg-black text-white relative overflow-hidden">
      {/* BDS: Géométrie - Background */}
      <ParallaxBackground />

      {/* BDS: Astronomie - Header avec navigation et options */}
      <CreateHeader
        onBack={() => onNavigate('home')}
        credits={25}
        onOpenHistory={() => console.log('Open history')}
        onOpenSettings={() => console.log('Open settings')}
        onOpenProfile={() => console.log('Open profile')}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* BDS: Rhétorique - PROMPT BAR (Focal point immédiat) */}
        <div className="mb-12 sm:mb-16">
          <HeroPromptBar
            prompt={prompt}
            onPromptChange={setPrompt}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            selectedTool={selectedTool}
            onClearTool={clearToolSelection}
            onSubmit={() => {
              playWhoosh();
              medium();
              console.log('Generating with prompt:', prompt, 'model:', selectedModel);
            }}
            placeholder={getPlaceholder()}
            isMorphing={isMorphing}
          />
        </div>

        {/* BDS: Rhétorique - Introduction courte */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed mb-4">
            {TOOLS.filter(t => !t.comingSoon).length} outils créatifs • {TECHNOLOGIES.length} modèles IA
          </p>

          {/* Stats rapides */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Gratuit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span>~10s</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wand2 className="w-3 h-3 text-purple-500" />
              <span>Premium</span>
            </div>
          </div>

          {/* BDS: Musique - Category Filters */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 mt-8">
            {[
              { id: 'all', name: 'Tous', icon: Sparkles, count: TOOLS.length },
              { id: 'quick', name: 'Quick', icon: Zap, count: TOOLS.filter(t => t.category === 'quick').length },
              { id: 'design', name: 'Design', icon: Palette, count: TOOLS.filter(t => t.category === 'design').length },
              { id: 'marketing', name: 'Marketing', icon: Megaphone, count: TOOLS.filter(t => t.category === 'marketing').length },
              { id: 'advanced', name: 'Advanced', icon: Wand2, count: TOOLS.filter(t => t.category === 'advanced').length },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    playClick();
                    light();
                    setSelectedCategory(cat.id);
                  }}
                  onMouseEnter={() => playHover()}
                  className={`
                    px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-400 flex items-center gap-1.5 whitespace-nowrap
                    ${isSelected
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 scale-105'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                    }
                  `}
                >
                  <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  {cat.name}
                  <span className={`px-1.5 py-0.5 rounded text-xs ${isSelected ? 'bg-white/20' : 'bg-white/10'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* BDS: Géométrie - HORIZONTAL SCROLL PAR CATÉGORIE */}
        {/* BDS: Arithmétique - Extra padding bottom for sticky prompt bar */}
        <div className="space-y-8 sm:space-y-12 md:space-y-16 pb-32 sm:pb-40 md:pb-48">
          
          {/* Quick Category */}
          {(selectedCategory === 'all' || selectedCategory === 'quick') && (
            <ToolCategory
              title="Quick Create"
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

          {/* Design Category */}
          {(selectedCategory === 'all' || selectedCategory === 'design') && (
            <ToolCategory
              title="Design Templates"
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

          {/* Marketing Category */}
          {(selectedCategory === 'all' || selectedCategory === 'marketing') && (
            <ToolCategory
              title="Marketing Tools"
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

          {/* Advanced Category */}
          {(selectedCategory === 'all' || selectedCategory === 'advanced') && (
            <ToolCategory
              title="Advanced Tools"
              icon={Wand2}
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