import { Search, ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Screen } from '../App';

interface DiscoveryProps {
  onNavigate: (screen: Screen) => void;
}

const MOCK_MEDIA = [
  'https://images.unsplash.com/photo-1655720035861-ba4fd21a598d',
  'https://images.unsplash.com/photo-1616394158624-a2ba9cfe2994',
  'https://images.unsplash.com/photo-1633743252577-ccb68cbdb6ed',
  'https://images.unsplash.com/photo-1514449372970-c013485804bd',
  'https://images.unsplash.com/photo-1655720035861-ba4fd21a598d',
  'https://images.unsplash.com/photo-1616394158624-a2ba9cfe2994',
  'https://images.unsplash.com/photo-1633743252577-ccb68cbdb6ed',
  'https://images.unsplash.com/photo-1514449372970-c013485804bd',
  'https://images.unsplash.com/photo-1655720035861-ba4fd21a598d',
];

export function Discovery({ onNavigate }: DiscoveryProps) {
  return (
    <div className="w-full h-screen bg-black overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-black z-10 px-4 pt-12 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for AI creations..."
            className="w-full bg-[#1A1A1A] text-white rounded-lg pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
          />
        </div>
      </div>

      {/* Grid of Media */}
      <div className="grid grid-cols-3 gap-1 px-1">
        {MOCK_MEDIA.map((url, idx) => (
          <button
            key={idx}
            className="aspect-[9/16] relative overflow-hidden"
          >
            <ImageWithFallback
              src={url}
              alt={`Media ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              {(Math.random() * 100).toFixed(1)}K
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
