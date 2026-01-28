/**
 * 📊 ENTERPRISE DASHBOARD
 * Clean, data-driven dashboard with metrics cards
 * Figma/Notion-inspired professional design
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, TrendingDown, Image, Video, Users, Clock, 
  Calendar, BarChart3, Activity, Zap, Plus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui-enterprise/Card';
import { Badge } from '../ui-enterprise/Badge';
import { Button } from '../ui-enterprise/Button';
import { useAuth } from '../../lib/contexts/AuthContext';
import { useCredits } from '../../lib/contexts/CreditsContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface DashboardStats {
  totalGenerations: number;
  thisWeek: number;
  weekChange: number;
  creditsUsed: number;
  creditsRemaining: number;
  teamMembers?: number;
  pendingApprovals?: number;
}

interface RecentActivity {
  id: string;
  type: 'image' | 'video' | 'campaign';
  title: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

interface EnterpriseDashboardProps {
  onNavigate?: (screen: string) => void;
}

export function EnterpriseDashboard({ onNavigate }: EnterpriseDashboardProps) {
  const { user } = useAuth();
  const credits = useCredits();
  const userId = user?.id;
  
  const getCoconutCredits = () => {
    return credits.isEnterprise ? credits.credits : credits.credits - credits.creditsUsed;
  };
  
  const [stats, setStats] = useState<DashboardStats>({
    totalGenerations: 0,
    thisWeek: 0,
    weekChange: 0,
    creditsUsed: 0,
    creditsRemaining: getCoconutCredits(),
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isEnterprise = credits.isEnterprise;
  
  useEffect(() => {
    if (userId) {
      loadDashboardData();
    }
  }, [userId]);
  
  const loadDashboardData = async () => {
    if (!userId) {
      console.log('⏸️ [Dashboard] No userId yet, skipping stats fetch');
      return;
    }
    
    try {
      setLoading(true);
      
      // Fetch dashboard stats from backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/coconut-v14/dashboard/stats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'x-user-id': userId || '',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {
          totalGenerations: 0,
          thisWeek: 0,
          weekChange: 0,
          creditsUsed: 0,
          creditsRemaining: getCoconutCredits(),
        });
        setRecentActivity(data.recentActivity || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Stats cards configuration
  const statsCards = [
    {
      title: 'Total Generations',
      value: stats.totalGenerations || 0,
      icon: Image,
      trend: (stats.weekChange || 0) > 0 ? 'up' : 'down',
      trendValue: Math.abs(stats.weekChange || 0),
      description: `${stats.thisWeek || 0} this week`,
    },
    {
      title: 'Credits Remaining',
      value: stats.creditsRemaining || 0,
      icon: Zap,
      description: isEnterprise ? 'Enterprise plan' : 'Available credits',
    },
    ...(isEnterprise ? [{
      title: 'Team Members',
      value: stats.teamMembers || 0,
      icon: Users,
      description: 'Active collaborators',
    }] : []),
    ...(isEnterprise && (stats.pendingApprovals || 0) > 0 ? [{
      title: 'Pending Approvals',
      value: stats.pendingApprovals || 0,
      icon: Clock,
      description: 'Awaiting review',
    }] : []),
  ];
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>
        <Button 
          variant="primary"
          size="lg"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => onNavigate?.('type-select')}
        >
          Start Creating
        </Button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card padding="base" hoverable>
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value.toLocaleString()}
                      </p>
                      {stat.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {stat.description}
                        </p>
                      )}
                      {stat.trend && (
                        <div className="flex items-center gap-1 mt-2">
                          {stat.trend === 'up' ? (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          )}
                          <span className={`text-xs font-medium ${
                            stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.trendValue}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={`p-2 rounded-lg ${
                      'highlight' in stat && stat.highlight
                        ? 'bg-orange-100'
                        : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        'highlight' in stat && stat.highlight
                          ? 'text-orange-600'
                          : 'text-gray-600'
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest generations and projects</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-md animate-pulse" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No recent activity</p>
              <Button 
                variant="primary"
                onClick={() => onNavigate?.('type-select')}
              >
                Start Creating
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const typeIcons = {
                  image: Image,
                  video: Video,
                  campaign: Calendar,
                };
                const TypeIcon = typeIcons[activity.type];
                
                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <TypeIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Badge
                      variant={
                        activity.status === 'completed'
                          ? 'success'
                          : activity.status === 'pending'
                          ? 'warning'
                          : 'error'
                      }
                      dot
                    >
                      {activity.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Actions - Enterprise Only */}
      {isEnterprise && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              interactive 
              padding="base"
              onClick={() => onNavigate?.('team')}
              className="cursor-pointer"
            >
              <CardContent>
                <Users className="w-8 h-8 text-gray-700 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Invite Team Members</h3>
                <p className="text-sm text-gray-500">
                  Collaborate with your team on projects
                </p>
              </CardContent>
            </Card>
            
            <Card 
              interactive 
              padding="base"
              onClick={() => onNavigate?.('campaign')}
              className="cursor-pointer"
            >
              <CardContent>
                <Calendar className="w-8 h-8 text-gray-700 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Create Campaign</h3>
                <p className="text-sm text-gray-500">
                  Plan and execute marketing campaigns
                </p>
              </CardContent>
            </Card>
            
            <Card 
              interactive 
              padding="base"
              onClick={() => onNavigate?.('history')}
              className="cursor-pointer"
            >
              <CardContent>
                <BarChart3 className="w-8 h-8 text-gray-700 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">View Analytics</h3>
                <p className="text-sm text-gray-500">
                  Track performance and insights
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}