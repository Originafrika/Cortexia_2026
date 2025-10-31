import { ArrowLeft, Heart, MessageCircle, UserPlus, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Screen } from '../App';

interface ActivityProps {
  onNavigate: (screen: Screen) => void;
}

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'like',
    user: 'ai_artist_pro',
    action: 'liked your video',
    time: '2m ago',
    avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d',
    thumbnail: 'https://images.unsplash.com/photo-1655720035861-ba4fd21a598d',
  },
  {
    id: 2,
    type: 'comment',
    user: 'creative_mind',
    action: 'commented: "Amazing work! 🔥"',
    time: '15m ago',
    avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d',
    thumbnail: 'https://images.unsplash.com/photo-1616394158624-a2ba9cfe2994',
  },
  {
    id: 3,
    type: 'follow',
    user: 'visual_explorer',
    action: 'started following you',
    time: '1h ago',
    avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d',
  },
  {
    id: 4,
    type: 'remix',
    user: 'digital_dreams',
    action: 'remixed your video',
    time: '3h ago',
    avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d',
    thumbnail: 'https://images.unsplash.com/photo-1633743252577-ccb68cbdb6ed',
  },
  {
    id: 5,
    type: 'system',
    user: 'Cortexia',
    action: 'You earned 50 credits from creator rewards',
    time: '1d ago',
    avatar: null,
  },
];

export function Activity({ onNavigate }: ActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="text-[#6366f1]" size={20} fill="#6366f1" />;
      case 'comment':
        return <MessageCircle className="text-[#6366f1]" size={20} />;
      case 'follow':
        return <UserPlus className="text-[#6366f1]" size={20} />;
      case 'remix':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#6366f1" className="text-[#6366f1]">
            <path d="M7 7H17V10L21 6L17 2V5H5V11H7V7Z"/>
            <path d="M17 17H7V14L3 18L7 22V19H19V13H17V17Z"/>
          </svg>
        );
      case 'system':
        return <Sparkles className="text-[#6366f1]" size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black z-10 px-4 pt-12 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('feed')}>
            <ArrowLeft className="text-white" size={24} />
          </button>
          <h1 className="text-white text-xl">Activity</h1>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4">
        <div className="space-y-2">
          {NOTIFICATIONS.map((notif) => (
            <div 
              key={notif.id}
              className="flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#262626] transition-colors"
            >
              {/* Avatar with icon badge */}
              <div className="relative flex-shrink-0">
                {notif.avatar ? (
                  <ImageWithFallback
                    src={notif.avatar}
                    alt={notif.user}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#6366f1] flex items-center justify-center">
                    <Sparkles className="text-white" size={24} />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  {getIcon(notif.type)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">
                  <span className="font-semibold">{notif.user}</span>{' '}
                  <span className="text-gray-400">{notif.action}</span>
                </p>
                <p className="text-gray-500 text-xs mt-1">{notif.time}</p>
              </div>

              {/* Thumbnail if available */}
              {notif.thumbnail && (
                <ImageWithFallback
                  src={notif.thumbnail}
                  alt="Content"
                  className="w-12 h-16 rounded-lg object-cover flex-shrink-0"
                />
              )}

              {/* Follow button for follow notifications */}
              {notif.type === 'follow' && (
                <button className="px-4 py-2 bg-[#6366f1] rounded-lg text-white text-sm flex-shrink-0">
                  Follow
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
