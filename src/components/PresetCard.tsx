import { motion } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';
import { useState } from 'react';
import type { Preset } from '../lib/presets/presets';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PresetCardProps {
  preset: Preset;
  onSelect: (preset: Preset) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (presetId: string) => void;
}

export function PresetCard({ preset, onSelect, isFavorite, onToggleFavorite }: PresetCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Use Unsplash for preview
  const imageUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(preset.imageQuery)}`;

  return (
    <motion.button
      onClick={() => onSelect(preset)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative group overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-[#6366f1]/50 transition-all"
    >
      {/* Image Preview */}
      <div className="aspect-[4/3] relative overflow-hidden bg-white/5">
        <ImageWithFallback
          src={imageUrl}
          alt={preset.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Loading Shimmer */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(preset.id);
            }}
            className="absolute top-2 right-2 p-2 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition-colors z-10"
          >
            <Heart 
              className={`size-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
            />
          </button>
        )}
        
        {/* Recommended Model Badge */}
        {preset.model && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-[#6366f1]/80 backdrop-blur-sm rounded-full text-xs flex items-center gap-1">
            <Sparkles className="size-3" />
            {preset.model}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 text-left">
        <h3 className="font-medium text-sm mb-1">{preset.name}</h3>
        <p className="text-xs text-white/50 mb-2 line-clamp-2">{preset.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {preset.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag}
              className="px-2 py-0.5 bg-white/5 rounded-full text-xs text-white/60"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-[#6366f1]/10 to-transparent" />
      </div>
    </motion.button>
  );
}
