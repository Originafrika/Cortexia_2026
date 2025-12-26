import { useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, UserPlus, Sparkles, DollarSign } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Screen } from '../App';

interface ActivityProps {
  onNavigate: (screen: Screen) => void;
}

type ActivityFilter = 'all' | 'likes' | 'comments' | 'follows' | 'remixes' | 'earnings';

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
    type: 'earnings',
    user: 'Cortexia',
    action: 'You earned 50 credits from creator rewards',
    time: '1d ago',
    avatar: null,
  },
  {
    id: 6,
    type: 'like',
    user: 'neon_dreams',
    action: 'liked your video',
    time: '2h ago',
    avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d',
    thumbnail: 'https://images.unsplash.com/photo-1514449372970-c013485804bd',
  },
  {
    id: 7,
    type: 'earnings',
    user: 'Cortexia',
    action: 'You earned 120 credits from video remixes',
    time: '5h ago',
    avatar: null,
  },
  {
    id: 8,
    type: 'comment',
    user: 'pixel_wizard',
    action: 'commented: "This is incredible! How did you get that effect?"',
    time: '6h ago',
    avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d',
    thumbnail: 'https://images.unsplash.com/photo-1633743252577-ccb68cbdb6ed',
  },
  {
    id: 9,
    type: 'remix',
    user: 'synthwave_art',
    action: 'remixed your video with new style',
    time: '1d ago',
    avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
  },
  {
    id: 10,
    type: 'follow',
    user: 'creative_mind',
    action: 'started following you',
    time: '2d ago',
    avatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d',
  },
];

export function Activity({ onNavigate }: ActivityProps) {
  const [selectedFilter, setSelectedFilter] = useState<ActivityFilter>('all');
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
      case 'earnings':
        return <DollarSign className="text-[#6366f1]" size={20} />;
      default:
        return null;
    }
  };

  const filters: { value: ActivityFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'likes', label: 'Likes' },
    { value: 'comments', label: 'Comments' },
    { value: 'follows', label: 'Follows' },
    { value: 'remixes', label: 'Remixes' },
    { value: 'earnings', label: 'Earnings' },
  ];

  const filteredNotifications = selectedFilter === 'all' 
    ? NOTIFICATIONS
    : NOTIFICATIONS.filter(notif => {
        if (selectedFilter === 'likes') return notif.type === 'like';
        if (selectedFilter === 'comments') return notif.type === 'comment';
        if (selectedFilter === 'follows') return notif.type === 'follow';
        if (selectedFilter === 'remixes') return notif.type === 'remix';
        if (selectedFilter === 'earnings') return notif.type === 'earnings';
        return true;
      });

  return (
    <div className="w-full h-screen bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black z-10 border-b border-gray-800">
        <div className="flex items-center gap-4 px-4 pt-12 pb-4">
          <button onClick={() => onNavigate('feed')}>
            <ArrowLeft className="text-white" size={24} />
          </button>
          <h1 className="text-white text-xl">Activity</h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedFilter === filter.value
                  ? 'bg-[#6366f1] text-white'
                  : 'bg-[#1A1A1A] text-gray-400'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4">
              <Sparkles className="text-gray-500" size={32} />
            </div>
            <p className="text-gray-400">No {selectedFilter} notifications yet</p>
            <p className="text-gray-600 text-sm mt-1">
              {selectedFilter === 'earnings' 
                ? 'Start creating to earn credits!'
                : 'Keep creating amazing content!'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notif) => (
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
                    {notif.type === 'earnings' ? (
                      <DollarSign className="text-white" size={24} />
                    ) : (
                      <Sparkles className="text-white" size={24} />
                    )}
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
        )}
      </div>
    </div>
  );
}
