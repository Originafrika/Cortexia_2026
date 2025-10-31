import { Check, ChevronRight, UserCircle, Clock } from 'lucide-react';

interface FeedFilterMenuProps {
  selectedFilter: 'for-you' | 'following' | 'latest';
  onSelect: (filter: 'for-you' | 'following' | 'latest') => void;
  onClose: () => void;
}

export function FeedFilterMenu({ selectedFilter, onSelect, onClose }: FeedFilterMenuProps) {
  const filters = [
    { id: 'for-you' as const, label: 'For You', icon: null },
    { id: 'following' as const, label: 'Following', icon: UserCircle },
    { id: 'latest' as const, label: 'Latest', icon: Clock },
  ];

  return (
    <div 
      className="fixed inset-0 z-[100]"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-16 right-4 w-64 rounded-2xl overflow-hidden"
        style={{
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
        }}
      >
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
              >
                <div className="flex items-center gap-3">
                  {isSelected && <Check className="text-white" size={20} />}
                  {!isSelected && Icon && <Icon className="text-gray-400" size={20} />}
                  {!isSelected && !Icon && <div className="w-5" />}
                  <span className="text-white">{filter.label}</span>
                </div>
                {Icon && <Icon className="text-gray-400" size={20} />}
              </button>
            );
          })}
          
          <button
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors border-t border-gray-800"
          >
            <span className="text-white">Pick a mood</span>
            <ChevronRight className="text-gray-400" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
