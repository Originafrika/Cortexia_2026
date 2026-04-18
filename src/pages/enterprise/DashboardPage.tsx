// Enterprise Dashboard Page
// Overview of credits, jobs, and subscription status

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Briefcase, 
  Zap, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Plus
} from 'lucide-react';

interface DashboardStats {
  creditsBalance: number;
  creditsUsed: number;
  monthlyCredits: number;
  jobsThisMonth: number;
  totalJobs: number;
  subscriptionStatus: 'active' | 'canceled' | 'past_due';
  subscriptionRenewsAt: string;
}

interface RecentJob {
  id: string;
  title: string;
  mode: 'image' | 'video' | 'campaign';
  status: 'completed' | 'processing' | 'failed';
  creditsUsed: number;
  createdAt: string;
  thumbnailUrl?: string;
}

export function EnterpriseDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch wallet/stats
      const statsResponse = await fetch('/api/enterprise/stats', {
        credentials: 'include',
      });
      
      if (!statsResponse.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch recent jobs
      const jobsResponse = await fetch('/api/enterprise/jobs?limit=5', {
        credentials: 'include',
      });
      
      if (!jobsResponse.ok) throw new Error('Failed to fetch jobs');
      const jobsData = await jobsResponse.json();
      setRecentJobs(jobsData.jobs);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-950/50 border border-red-800 rounded-xl p-6 text-red-400">
            <AlertCircle className="w-8 h-8 mb-2" />
            <h2 className="text-lg font-semibold">Error loading dashboard</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const creditPercentage = (stats.creditsBalance / (stats.creditsBalance + stats.creditsUsed)) * 100;
  const lowCredits = stats.creditsBalance < 100;

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Enterprise Dashboard</h1>
            <p className="text-slate-400 mt-1">Monitor your usage and manage your account</p>
          </div>
          <a
            href="/coconut-v14"
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Generation
          </a>
        </div>

        {/* Credit Alert */}
        {lowCredits && (
          <div className="bg-amber-950/50 border border-amber-800 rounded-xl p-4 flex items-center gap-3 text-amber-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Low credits remaining</p>
              <p className="text-sm text-amber-500/80">You have {stats.creditsBalance} credits left. Top up to continue generating.</p>
            </div>
            <a
              href="/enterprise/billing"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Add Credits
            </a>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Credits Balance */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <CreditCard className="w-8 h-8 text-indigo-400" />
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                stats.subscriptionStatus === 'active' 
                  ? 'bg-green-950 text-green-400' 
                  : 'bg-red-950 text-red-400'
              }`}>
                {stats.subscriptionStatus}
              </span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.creditsBalance.toLocaleString()}</p>
            <p className="text-slate-400 text-sm">credits available</p>
            <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  creditPercentage > 50 ? 'bg-green-500' : creditPercentage > 25 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${creditPercentage}%` }}
              />
            </div>
          </div>

          {/* Credits Used */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-amber-400" />
              <TrendingUp className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.creditsUsed.toLocaleString()}</p>
            <p className="text-slate-400 text-sm">credits used this month</p>
            <p className="text-xs text-slate-500 mt-2">
              of {stats.monthlyCredits.toLocaleString()} included
            </p>
          </div>

          {/* Jobs Count */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Briefcase className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.jobsThisMonth}</p>
            <p className="text-slate-400 text-sm">jobs this month</p>
            <p className="text-xs text-slate-500 mt-2">
              {stats.totalJobs} total jobs
            </p>
          </div>

          {/* Subscription */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">Enterprise</p>
            <p className="text-slate-400 text-sm">plan active</p>
            <p className="text-xs text-slate-500 mt-2">
              Renews {new Date(stats.subscriptionRenewsAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Generations</h2>
            <a 
              href="/enterprise/jobs" 
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
            >
              View all →
            </a>
          </div>

          {recentJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No generations yet</p>
              <a
                href="/coconut-v14"
                className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Create your first generation →
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div 
                  key={job.id}
                  className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    {job.thumbnailUrl ? (
                      <img 
                        src={job.thumbnailUrl} 
                        alt={job.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Briefcase className="w-6 h-6 text-slate-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{job.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400 capitalize">{job.mode}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-indigo-400">{job.creditsUsed} cr</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                      job.status === 'completed' ? 'bg-green-950 text-green-400' :
                      job.status === 'processing' ? 'bg-amber-950 text-amber-400' :
                      'bg-red-950 text-red-400'
                    }`}>
                      {job.status === 'processing' && <Clock className="w-3 h-3 animate-pulse" />}
                      {job.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      {job.status}
                    </span>

                    {job.status === 'completed' && (
                      <button 
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/coconut-v14?mode=image"
            className="bg-slate-900/50 border border-slate-700 hover:border-indigo-500/50 rounded-xl p-6 transition-colors group"
          >
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-500/30 transition-colors">
              <Plus className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">New Image</h3>
            <p className="text-sm text-slate-400">Generate product images with AI</p>
          </a>

          <a
            href="/coconut-v14?mode=video"
            className="bg-slate-900/50 border border-slate-700 hover:border-indigo-500/50 rounded-xl p-6 transition-colors group"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
              <Plus className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">New Video</h3>
            <p className="text-sm text-slate-400">Create engaging video content</p>
          </a>

          <a
            href="/coconut-v14?mode=campaign"
            className="bg-slate-900/50 border border-slate-700 hover:border-indigo-500/50 rounded-xl p-6 transition-colors group"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
              <Plus className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">New Campaign</h3>
            <p className="text-sm text-slate-400">Full marketing campaign generation</p>
          </a>
        </div>
      </div>
    </div>
  );
}

export default EnterpriseDashboardPage;
