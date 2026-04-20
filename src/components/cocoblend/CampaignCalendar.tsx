// CampaignCalendar — 30-day editorial calendar for Coconut campaign mode
// Shows posts per day, platform tabs, and post detail drawer

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Copy, Check, Calendar as CalendarIcon, Clock, Hash } from 'lucide-react';

export interface CampaignPost {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  platform: 'instagram' | 'tiktok' | 'facebook' | 'linkedin' | 'twitter';
  type: 'image' | 'video' | 'story' | 'reel' | 'carousel';
  contentBrief: string;
  caption: string;
  hashtags: string[];
  cta?: string;
  status: 'pending' | 'generated' | 'failed';
  cocoboardSteps?: Array<{
    id: string;
    type: string;
    model: string;
    prompt: string;
    creditsEstimated: number;
  }>;
}

interface CampaignCalendarProps {
  posts: CampaignPost[];
  campaignName: string;
  campaignMonth: Date;
  onGeneratePost?: (postId: string) => void;
  onGenerateAll?: () => void;
  totalEstimatedCredits: number;
  generatedCount: number;
}

const PLATFORM_CONFIG = {
  instagram: { label: 'Instagram', color: 'bg-pink-100 text-pink-700 border-pink-200', icon: '📸' },
  tiktok: { label: 'TikTok', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: '🎵' },
  facebook: { label: 'Facebook', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '👥' },
  linkedin: { label: 'LinkedIn', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '💼' },
  twitter: { label: 'Twitter', color: 'bg-sky-100 text-sky-700 border-sky-200', icon: '🐦' },
};

const TYPE_COLORS: Record<string, string> = {
  image: 'bg-violet-100 text-violet-700',
  video: 'bg-teal-100 text-teal-700',
  story: 'bg-amber-100 text-amber-700',
  reel: 'bg-rose-100 text-rose-700',
  carousel: 'bg-purple-100 text-purple-700',
};

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function CampaignCalendar({
  posts,
  campaignName,
  campaignMonth,
  onGeneratePost,
  onGenerateAll,
  totalEstimatedCredits,
  generatedCount,
}: CampaignCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(campaignMonth));
  const [selectedPost, setSelectedPost] = useState<CampaignPost | null>(null);
  const [activePlatform, setActivePlatform] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const postsByDate = useMemo(() => {
    const map = new Map<string, CampaignPost[]>();
    const filtered = activePlatform === 'all'
      ? posts
      : posts.filter(p => p.platform === activePlatform);

    for (const post of filtered) {
      const existing = map.get(post.date) || [];
      existing.push(post);
      map.set(post.date, existing);
    }
    return map;
  }, [posts, activePlatform]);

  const handleCopyCaption = async (post: CampaignPost) => {
    try {
      await navigator.clipboard.writeText(post.caption);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* ignore */ }
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  // Build calendar grid
  const calendarDays: Array<{ date: number; dateStr: string; isCurrentMonth: boolean }> = [];
  for (let i = 0; i < firstDay; i++) {
    const prevMonthDays = getDaysInMonth(year, month - 1);
    const day = prevMonthDays - firstDay + i + 1;
    calendarDays.push({ date: day, dateStr: '', isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(new Date(year, month, d));
    calendarDays.push({ date: d, dateStr, isCurrentMonth: true });
  }
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push({ date: 0, dateStr: '', isCurrentMonth: false });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{campaignName}</h2>
          <p className="text-sm text-slate-500">{MONTHS_FR[month]} {year} · {posts.length} posts</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {generatedCount}/{posts.length} générés · ~{totalEstimatedCredits} crédits
          </span>
          {onGenerateAll && (
            <button
              onClick={onGenerateAll}
              disabled={generatedCount === posts.length}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Tout générer
            </button>
          )}
        </div>
      </div>

      {/* Platform tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActivePlatform('all')}
          className={`px-3 py-1 text-xs rounded-full border transition-colors whitespace-nowrap
            ${activePlatform === 'all' ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}
          `}
        >
          Tous ({posts.length})
        </button>
        {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
          const count = posts.filter(p => p.platform === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setActivePlatform(key)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors whitespace-nowrap
                ${activePlatform === key
                  ? `${config.color} ring-1 ring-current`
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}
              `}
            >
              {config.icon} {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {DAYS_FR.map(day => (
            <div key={day} className="py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayPosts = day.dateStr ? postsByDate.get(day.dateStr) || [] : [];
            const isToday = day.dateStr === formatDate(new Date());

            return (
              <div
                key={idx}
                className={`min-h-[80px] border-b border-r border-slate-100 p-1 transition-colors
                  ${!day.isCurrentMonth ? 'bg-slate-50/50' : ''}
                  ${isToday ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}
                `}
              >
                {day.isCurrentMonth && (
                  <>
                    <div className={`text-xs font-medium mb-1 ${isToday ? 'text-indigo-600' : 'text-slate-600'}`}>
                      {day.date}
                    </div>
                    <div className="space-y-0.5">
                      {dayPosts.slice(0, 3).map(post => {
                        const platform = PLATFORM_CONFIG[post.platform];
                        const typeColor = TYPE_COLORS[post.type] || 'bg-slate-100 text-slate-700';
                        return (
                          <button
                            key={post.id}
                            onClick={() => setSelectedPost(post)}
                            className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] ${typeColor} truncate transition-all hover:opacity-80`}
                            title={`${post.platform} · ${post.time} · ${post.type}`}
                          >
                            <span className="mr-1">{platform.icon}</span>
                            {post.time} · {post.type}
                          </button>
                        );
                      })}
                      {dayPosts.length > 3 && (
                        <div className="text-[10px] text-slate-400 pl-1">+{dayPosts.length - 3} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Post detail drawer */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => setSelectedPost(null)}>
          <div
            className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-semibold text-slate-900">Détail du post</h3>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 text-xs rounded-full border ${PLATFORM_CONFIG[selectedPost.platform].color}`}>
                  {PLATFORM_CONFIG[selectedPost.platform].icon} {selectedPost.platform}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${TYPE_COLORS[selectedPost.type]}`}>
                  {selectedPost.type}
                </span>
                <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
                  <Clock className="w-3 h-3" /> {selectedPost.time}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedPost.status === 'generated' ? 'bg-green-100 text-green-700' :
                  selectedPost.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {selectedPost.status}
                </span>
              </div>

              {/* Content brief */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-1">Brief</h4>
                <p className="text-sm text-slate-600">{selectedPost.contentBrief}</p>
              </div>

              {/* Caption */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-slate-700">Caption</h4>
                  <button
                    onClick={() => handleCopyCaption(selectedPost)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    {copiedId === selectedPost.id ? (
                      <><Check className="w-3 h-3" /> Copié!</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copier</>
                    )}
                  </button>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap font-mono">
                  {selectedPost.caption}
                </div>
              </div>

              {/* Hashtags */}
              {selectedPost.hashtags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3" /> Hashtags
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedPost.hashtags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              {selectedPost.cta && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-1">Call to Action</h4>
                  <p className="text-sm text-slate-600 font-medium">{selectedPost.cta}</p>
                </div>
              )}

              {/* CocoBoard steps */}
              {selectedPost.cocoboardSteps && selectedPost.cocoboardSteps.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">
                    Production plan ({selectedPost.cocoboardSteps.length} steps)
                  </h4>
                  <div className="space-y-2">
                    {selectedPost.cocoboardSteps.map(step => (
                      <div key={step.id} className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-700">{step.id}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-full">
                            ~{step.creditsEstimated} cr
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{step.prompt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate button */}
              {onGeneratePost && selectedPost.status !== 'generated' && (
                <button
                  onClick={() => onGeneratePost(selectedPost.id)}
                  className="w-full py-2.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Générer cet asset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex items-center gap-1 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Mois précédent
        </button>
        <span className="text-sm font-medium text-slate-700">
          {MONTHS_FR[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="flex items-center gap-1 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
        >
          Mois suivant <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default CampaignCalendar;
