import { Check, ChevronRight, UserCircle, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface FeedFilterMenuProps {
  selectedFilter: 'for-you' | 'following' | 'latest';
  onSelect: (filter: 'for-you' | 'following' | 'latest') => void;
  onClose: () => void;
}

export function FeedFilterMenu({ selectedFilter, onSelect, onClose }: FeedFilterMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragCurrentY, setDragCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const filters = [
    { id: 'for-you' as const, label: 'For You', icon: null },
    { id: 'following' as const, label: 'Following', icon: UserCircle },
    { id: 'latest' as const, label: 'Latest', icon: Clock },
  ];

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    if (menuRef.current) {
      const focusableElements = menuRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTab);
    }
  }, []);

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartY;
    if (diff > 0) {
      setDragCurrentY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragCurrentY > 50) {
      onClose();
    }
    setDragCurrentY(0);
    setIsDragging(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Feed filter menu"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="absolute left-1/2 w-64 rounded-2xl overflow-hidden animate-slide-up"
        style={{
          top: 'calc(env(safe-area-inset-top, 0px) + 64px)',
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          transform: `translateX(-50%) translateY(${dragCurrentY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {/* Handle bar for swipe indicator */}
        <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mt-2 mb-1 cursor-grab active:cursor-grabbing" />
        
        <div className="py-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isSelected = selectedFilter === filter.id;
            
            return (
              <button
                key={filter.id}
                onClick={() => {
                  onSelect(filter.id);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                aria-pressed={isSelected}
                aria-label={`Filter by ${filter.label}`}
              >
                <div className="flex items-center gap-3">
                  {Icon && <Icon className="text-gray-400" size={20} />}
                  {!Icon && <div className="w-5" />}
                  <span className="text-white">{filter.label}</span>
                </div>
                {isSelected && <Check className="text-[#6366f1]" size={20} />}
              </button>
            );
          })}
          
          {/* Pick a mood - disabled for now with visual feedback */}
          <button
            disabled
            className="w-full flex items-center justify-between px-4 py-3 border-t border-gray-800 opacity-50 cursor-not-allowed"
            aria-label="Pick a mood (coming soon)"
          >
            <span className="text-white">Pick a mood</span>
            <ChevronRight className="text-gray-400" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
