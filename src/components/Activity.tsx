import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, Repeat2, UserPlus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Screen } from '../App';
import { useAuth } from '../lib/contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ActivityProps {
  onNavigate: (screen: Screen) => void;
}

type ActivityType = 'like' | 'comment' | 'remix' | 'follow';

interface ActivityItem {
  id: string;
  type: ActivityType;
  userId: string;
  username: string;
  avatarUrl: string;
  timestamp: string;
  postId?: string;
  postThumbnail?: string;
  message?: string;
  read: boolean;
}

export function Activity({ onNavigate }: ActivityProps) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | ActivityType>('all');
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadActivities();
  }, [user?.id]);

  const loadActivities = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const apiUrl = '/api';
      
      const response = await fetch(`${apiUrl}/activity/${user.id}?limit=50`);

      if (response.ok) {
        const data = await response.json();
        console.log('📢 Loaded activities:', data);
        setActivities(data.activities || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        console.error('Failed to load activities:', response.status);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading activities:', error);
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return activityDate.toLocaleDateString();
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'like':
        return <Heart className="text-red-500" size={20} fill="currentColor" />;
      case 'comment':
        return <MessageCircle className="text-blue-500" size={20} />;
      case 'remix':
        return <Repeat2 className="text-purple-500" size={20} />;
      case 'follow':
        return <UserPlus className="text-green-500" size={20} />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'remix':
        return 'remixed your creation';
      case 'follow':
        return 'started following you';
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter);

  return (
    <div className="w-full h-screen bg-black overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="px-4 py-4 flex items-center gap-4">
          <button onClick={() => onNavigate('profile')}>
            <ArrowLeft className="text-white" size={24} />
          </button>
          <h1 className="text-white text-xl font-semibold">Activity</h1>
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
          {[
            { id: 'all' as const, label: 'All' },
            { id: 'like' as const, label: 'Likes' },
            { id: 'comment' as const, label: 'Comments' },
            { id: 'remix' as const, label: 'Remixes' },
            { id: 'follow' as const, label: 'Follows' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? 'bg-[#6366f1] text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-800">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="px-4 py-4 flex items-start gap-3">
            {/* Avatar */}
            <div className="relative">
              <ImageWithFallback
                src={activity.avatarUrl}
                alt={activity.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1">
                {getActivityIcon(activity.type)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-white text-sm">
                    <span className="font-semibold">@{activity.username}</span>
                    {' '}
                    <span className="text-gray-400">{getActivityText(activity)}</span>
                  </p>
                  {activity.message && (
                    <p className="text-gray-300 text-sm mt-1">{activity.message}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">{formatTimestamp(activity.timestamp)}</p>
                </div>

                {/* Post Thumbnail */}
                {activity.postThumbnail && (
                  <ImageWithFallback
                    src={activity.postThumbnail}
                    alt="Post"
                    className="w-16 h-20 rounded-lg object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredActivities.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center px-8">
          <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
            {filter === 'all' ? (
              <Heart className="text-gray-600" size={32} />
            ) : (
              getActivityIcon(filter as ActivityType)
            )}
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">No activity yet</h3>
          <p className="text-gray-400 text-sm">
            {filter === 'all'
              ? 'Your activity will appear here'
              : `No ${filter} activity yet`}
          </p>
        </div>
      )}
    </div>
  );
}