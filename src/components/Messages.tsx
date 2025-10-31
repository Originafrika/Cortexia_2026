import { Search, Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Screen } from '../App';

interface MessagesProps {
  onNavigate: (screen: Screen) => void;
}

const MOCK_CONVERSATIONS = [
  { id: 1, name: 'ai_artist_pro', avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d', lastMessage: 'Love your latest generation!', time: '2m', unread: 2 },
  { id: 2, name: 'creative_mind', avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d', lastMessage: 'How did you get that effect?', time: '1h', unread: 0 },
  { id: 3, name: 'visual_explorer', avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d', lastMessage: 'Thanks for the remix!', time: '3h', unread: 0 },
  { id: 4, name: 'digital_dreams', avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d', lastMessage: 'Check out my new video', time: '1d', unread: 1 },
];

export function Messages({ onNavigate }: MessagesProps) {
  return (
    <div className="w-full h-screen bg-black overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-black z-10 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-2xl">Messages</h1>
          <button 
            onClick={() => onNavigate('new-message')}
            className="w-10 h-10 bg-[#6366f1] rounded-full flex items-center justify-center"
          >
            <Plus className="text-white" size={24} />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full bg-[#1A1A1A] text-white rounded-lg pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="px-4">
        {MOCK_CONVERSATIONS.map((conv) => (
          <button
            key={conv.id}
            className="w-full flex items-center gap-3 py-3 border-b border-gray-800 hover:bg-[#1A1A1A] transition-colors"
          >
            <div className="relative">
              <ImageWithFallback
                src={conv.avatar}
                alt={conv.name}
                className="w-14 h-14 rounded-full object-cover"
              />
              {conv.unread > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#6366f1] rounded-full flex items-center justify-center text-white text-xs">
                  {conv.unread}
                </div>
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-white">{conv.name}</span>
                <span className="text-gray-400 text-sm">{conv.time}</span>
              </div>
              <p className="text-gray-400 text-sm mt-1 truncate">{conv.lastMessage}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
