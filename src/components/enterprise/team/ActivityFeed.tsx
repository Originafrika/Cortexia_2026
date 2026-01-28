/**
 * ACTIVITY FEED - Team Collaboration
 * 
 * Display team activity timeline
 * Features:
 * - Recent team activities
 * - Activity types: comments, approvals, generations, members
 * - Filters by activity type
 * - Real-time updates (polling)
 * - Grouped by date
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  UserMinus, 
  Image as ImageIcon, 
  Video,
  Briefcase,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export type ActivityType = 
  | 'comment_mention'
  | 'comment_added'
  | 'approval_request'
  | 'approval_approved'
  | 'approval_rejected'
  | 'member_joined'
  | 'member_left'
  | 'generation_complete'
  | 'generation_started'
  | 'role_changed';

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userAvatar?: string;
  targetId?: string;
  targetName?: string;
  description: string;
  metadata?: {
    commentText?: string;
    generationType?: 'image' | 'video' | 'campaign';
    role?: string;
    previousRole?: string;
  };
  createdAt: string;
}

interface ActivityFeedProps {
  teamId: string;
  limit?: number;
  showFilters?: boolean;
}

export function ActivityFeed({ teamId, limit = 50, showFilters = true }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | ActivityType>('all');

  useEffect(() => {
    loadActivities();

    // Poll for new activities every 10 seconds
    const interval = setInterval(() => {
      loadActivities(true); // Silent refresh
    }, 10000);

    return () => clearInterval(interval);
  }, [teamId, limit]);

  const loadActivities = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/teams/${teamId}/activity?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      } else if (res.status !== 404) {
        console.error('[ActivityFeed] Failed to load activities:', await res.text());
        if (!silent) toast.error('Failed to load activity feed');
      }
    } catch (error) {
      console.error('[ActivityFeed] Error loading activities:', error);
      if (!silent) toast.error('Error loading activity feed');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadActivities();
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'comment_mention':
      case 'comment_added':
        return <MessageCircle size={16} className="text-blue-600" />;
      case 'approval_approved':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'approval_rejected':
        return <XCircle size={16} className="text-red-600" />;
      case 'approval_request':
        return <Clock size={16} className="text-amber-600" />;
      case 'member_joined':
        return <UserPlus size={16} className="text-green-600" />;
      case 'member_left':
        return <UserMinus size={16} className="text-gray-600" />;
      case 'generation_complete':
        return <CheckCircle size={16} className="text-purple-600" />;
      case 'generation_started':
        return <Clock size={16} className="text-purple-600" />;
      case 'role_changed':
        return <UserPlus size={16} className="text-blue-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'comment_mention':
      case 'comment_added':
        return 'bg-blue-50 border-blue-200';
      case 'approval_approved':
      case 'member_joined':
        return 'bg-green-50 border-green-200';
      case 'approval_rejected':
        return 'bg-red-50 border-red-200';
      case 'approval_request':
        return 'bg-amber-50 border-amber-200';
      case 'generation_complete':
      case 'generation_started':
        return 'bg-purple-50 border-purple-200';
      case 'member_left':
        return 'bg-gray-50 border-gray-200';
      case 'role_changed':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-cream-50 border-cream-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter);

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.createdAt).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  const filterOptions: Array<{ value: 'all' | ActivityType; label: string }> = [
    { value: 'all', label: 'All Activity' },
    { value: 'comment_added', label: 'Comments' },
    { value: 'approval_request', label: 'Approvals' },
    { value: 'generation_complete', label: 'Generations' },
    { value: 'member_joined', label: 'Members' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cream-200 border-t-cream-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-cream-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-cream-100 bg-cream-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            📊 Recent Activity
          </h3>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={`text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filter === option.value
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-white text-gray-600 border border-cream-200 hover:bg-cream-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="px-6 py-4 max-h-[600px] overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 mb-2">No activity yet</p>
            <p className="text-sm text-gray-500">
              {filter === 'all' 
                ? 'Team activities will appear here' 
                : `No ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()} activity`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([date, dateActivities]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="sticky top-0 bg-white z-10 pb-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {date}
                  </h4>
                </div>

                {/* Activities for this date */}
                <div className="space-y-3">
                  <AnimatePresence>
                    {dateActivities.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`flex gap-3 p-3 rounded-xl border ${getActivityColor(activity.type)}`}
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-cream-200 flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {/* User Avatar */}
                              {activity.userAvatar ? (
                                <img
                                  src={activity.userAvatar}
                                  alt={activity.userName}
                                  className="w-6 h-6 rounded-md object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                                  <span className="text-white font-bold text-xs">
                                    {getInitials(activity.userName)}
                                  </span>
                                </div>
                              )}

                              {/* Description */}
                              <p className="text-sm text-gray-900 flex-1 min-w-0">
                                <span className="font-semibold">{activity.userName}</span>
                                {' '}
                                <span className="text-gray-700">{activity.description}</span>
                                {activity.targetName && (
                                  <span className="font-semibold text-gray-900"> {activity.targetName}</span>
                                )}
                              </p>
                            </div>

                            {/* Timestamp */}
                            <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                              {formatDate(activity.createdAt)}
                            </span>
                          </div>

                          {/* Metadata (if available) */}
                          {activity.metadata?.commentText && (
                            <p className="text-xs text-gray-600 mt-1 pl-8 italic line-clamp-2">
                              "{activity.metadata.commentText}"
                            </p>
                          )}

                          {activity.metadata?.role && (
                            <p className="text-xs text-gray-600 mt-1 pl-8">
                              Role: <span className="font-medium">{activity.metadata.role}</span>
                              {activity.metadata.previousRole && (
                                <span> (was {activity.metadata.previousRole})</span>
                              )}
                            </p>
                          )}

                          {activity.metadata?.generationType && (
                            <div className="flex items-center gap-1 mt-1 pl-8">
                              {activity.metadata.generationType === 'image' && <ImageIcon size={12} className="text-blue-600" />}
                              {activity.metadata.generationType === 'video' && <Video size={12} className="text-purple-600" />}
                              {activity.metadata.generationType === 'campaign' && <Briefcase size={12} className="text-amber-600" />}
                              <span className="text-xs text-gray-600 capitalize">
                                {activity.metadata.generationType}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
