/**
 * COCONUT V14 - HISTORY MANAGER ULTRA-PREMIUM
 * Liquid Glass Gallery with Coconut Theme
 * 
 * Features:
 * - Premium glass thumbnail gallery
 * - Animated stats cards
 * - Advanced filters avec blur
 * - Masonry grid layout
 * - BDS 7 Arts compliance
 * 
 * ✨ PHASE 4 - SESSION 15: SOUND INTEGRATION
 * - Pattern: playClick (actions), playWhoosh (filters), playSuccess (download), playPop (stats toggle)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Star, 
  Download, 
  Trash2, 
  Eye, 
  Filter,
  Search,
  Image as ImageIcon,
  Video,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  Sparkles,
  Zap,
  Calendar,
  BarChart3,
  Heart
} from 'lucide-react';
import type { Generation } from '../../lib/types/coconut';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useSoundContext } from './SoundProvider';
import { useNotify } from './NotificationProvider';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface HistoryManagerProps {
  userId: string;
  projectId?: string;
}

export function HistoryManager({ userId, projectId: filterProjectId }: HistoryManagerProps) {
  const { playClick, playSuccess, playWhoosh, playPop } = useSoundContext();
  const notify = useNotify();
  
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [filteredGenerations, setFilteredGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'processing' | 'error' | 'favorites'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'cost' | 'duration'>('date');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showStats, setShowStats] = useState(true);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);

  // Load generations
  useEffect(() => {
    loadGenerations();
  }, [userId, filterProjectId]);

  // Filter and sort
  useEffect(() => {
    let filtered = [...generations];

    if (filterStatus === 'favorites') {
      filtered = filtered.filter(g => g.isFavorite);
    } else if (filterStatus !== 'all') {
      filtered = filtered.filter(g => g.status === filterStatus);
    }

    const now = Date.now();
    if (dateRange === 'today') {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      filtered = filtered.filter(g => new Date(g.createdAt).getTime() >= todayStart);
    } else if (dateRange === 'week') {
      filtered = filtered.filter(g => new Date(g.createdAt).getTime() >= now - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === 'month') {
      filtered = filtered.filter(g => new Date(g.createdAt).getTime() >= now - 30 * 24 * 60 * 60 * 1000);
    }

    if (searchQuery) {
      filtered = filtered.filter(g => 
        (typeof g.prompt === 'string' ? g.prompt.toLowerCase() : JSON.stringify(g.prompt).toLowerCase()).includes(searchQuery.toLowerCase()) ||
        g.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'cost') {
      filtered.sort((a, b) => (b.credits || 0) - (a.credits || 0));
    }

    setFilteredGenerations(filtered);
  }, [generations, filterStatus, dateRange, searchQuery, sortBy]);

  const loadGenerations = async () => {
    setIsLoading(true);
    try {
      console.log('📥 [History] Fetching generations for user:', userId);
      
      const response = await fetch(
        `/api/coconut/history/list?userId=${encodeURIComponent(userId)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
        }
      );

      const result = await response.json();
      console.log('📦 [History] Response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to load history');
      }

      setGenerations(result.data.generations);
      console.log('✅ [History] Loaded generations:', result.data.generations.length);
      
    } catch (err) {
      console.error('❌ [History] Error loading history:', err);
      notify?.error('Erreur lors du chargement de l\'historique');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = async (id: string) => {
    playClick();
    setGenerations(prev => prev.map(g => 
      g.id === id ? { ...g, isFavorite: !g.isFavorite } : g
    ));
  };

  const handleDelete = async (id: string) => {
    playClick();
    setGenerations(prev => prev.filter(g => g.id !== id));
  };

  const handleDownload = (gen: Generation) => {
    playSuccess();
    const link = document.createElement('a');
    link.href = gen.imageUrl;
    link.download = `generation-${gen.id}.png`;
    link.click();
  };
  
  const handleToggleStats = () => {
    playPop();
    setShowStats(!showStats);
  };
  
  const handleFilterStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playWhoosh();
    setFilterStatus(e.target.value as any);
  };
  
  const handleDateRange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playWhoosh();
    setDateRange(e.target.value as any);
  };
  
  const handleSortBy = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playWhoosh();
    setSortBy(e.target.value as any);
  };
  
  const handleViewDetails = (gen: Generation) => {
    playClick();
    setSelectedGeneration(gen);
  };
  
  const handleCloseDetails = () => {
    playClick();
    setSelectedGeneration(null);
  };

  const stats = {
    total: generations.length,
    complete: generations.filter(g => g.status === 'completed').length,
    favorites: generations.filter(g => g.isFavorite).length,
    totalCost: generations.reduce((sum, g) => sum + (g.credits || 0), 0),
    avgDuration: 0, // Duration not tracked in current Generation type
    thisWeek: generations.filter(g => new Date(g.createdAt).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000).length,
    thisMonth: generations.filter(g => new Date(g.createdAt).getTime() >= Date.now() - 30 * 24 * 60 * 60 * 1000).length,
  };

  return (
    <div className="min-h-screen bg-[var(--coconut-white)] relative overflow-hidden">
      {/* Premium animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] opacity-60" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,165,116,0.08)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(107,142,112,0.06)_0%,transparent_50%)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="flex items-center gap-3 text-[var(--coconut-shell)]">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-xl flex items-center justify-center backdrop-blur-xl border border-white/40">
                <ImageIcon className="w-6 h-6 text-[var(--coconut-shell)]" />
              </div>
              Generation History
            </h1>
            <p className="text-[var(--coconut-husk)] mt-1 text-sm">
              {filteredGenerations.length} of {generations.length} generation{generations.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleStats}
            className="px-4 py-2 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl flex items-center gap-2 border border-white/40 shadow-lg transition-all duration-300"
          >
            <BarChart3 className="w-5 h-5 text-[var(--coconut-shell)]" />
            <span className="text-[var(--coconut-shell)]">{showStats ? 'Hide' : 'Show'} Stats</span>
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
            >
              {[ 
                { label: 'Total', value: stats.total, color: 'from-slate-500 to-slate-600', icon: ImageIcon },
                { label: 'Complete', value: stats.complete, color: 'from-[var(--coconut-husk)] to-[var(--coconut-shell)]', icon: CheckCircle },
                { label: 'Favorites', value: stats.favorites, color: 'from-[var(--coconut-shell)] to-[var(--coconut-husk)]', icon: Star },
                { label: 'Credits Used', value: stats.totalCost, color: 'from-[var(--coconut-cream)] to-[var(--coconut-milk)]', icon: Zap },
                { label: 'Avg Duration', value: `${stats.avgDuration.toFixed(1)}s`, color: 'from-[var(--coconut-shell)] to-[var(--coconut-husk)]', icon: Clock },
                { label: 'This Week', value: stats.thisWeek, color: 'from-[var(--coconut-shell)] to-[var(--coconut-husk)]', icon: TrendingUp },
                { label: 'This Month', value: stats.thisMonth, color: 'from-[var(--coconut-husk)] to-[var(--coconut-shell)]', icon: Calendar },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className="relative"
                  >
                    <div className={`absolute -inset-1 bg-gradient-to-br ${stat.color}/20 rounded-2xl blur-lg opacity-50`} />
                    <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-4 border border-white/60 text-center">
                      <div className={`w-8 h-8 mx-auto mb-2 bg-gradient-to-br ${stat.color}/10 rounded-lg flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-[var(--coconut-shell)]" />
                      </div>
                      <div className="text-2xl text-[var(--coconut-shell)] mb-1">{stat.value}</div>
                      <div className="text-xs text-[var(--coconut-husk)]">{stat.label}</div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 rounded-2xl blur-lg opacity-50" />
          <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-4 border border-white/60">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--coconut-husk)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search generations..."
                  className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/40 rounded-lg text-[var(--coconut-shell)] placeholder-[var(--coconut-husk)] focus:outline-none focus:border-[var(--coconut-palm)] transition-colors backdrop-blur-xl"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={handleFilterStatus}
                className="px-4 py-2 bg-white/50 border border-white/40 rounded-lg text-[var(--coconut-shell)] focus:outline-none focus:border-[var(--coconut-palm)] transition-colors cursor-pointer backdrop-blur-xl"
              >
                <option value="all">All Status</option>
                <option value="complete">Complete</option>
                <option value="processing">Processing</option>
                <option value="error">Error</option>
                <option value="favorites">Favorites</option>
              </select>

              {/* Date Range */}
              <select
                value={dateRange}
                onChange={handleDateRange}
                className="px-4 py-2 bg-white/50 border border-white/40 rounded-lg text-[var(--coconut-shell)] focus:outline-none focus:border-[var(--coconut-palm)] transition-colors cursor-pointer backdrop-blur-xl"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={handleSortBy}
                className="px-4 py-2 bg-white/50 border border-white/40 rounded-lg text-[var(--coconut-shell)] focus:outline-none focus:border-[var(--coconut-palm)] transition-colors cursor-pointer backdrop-blur-xl"
              >
                <option value="date">Sort by Date</option>
                <option value="cost">Sort by Cost</option>
                <option value="duration">Sort by Duration</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Gallery */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[var(--coconut-shell)] animate-spin mx-auto mb-4" />
              <p className="text-[var(--coconut-husk)]">Loading history...</p>
            </div>
          </div>
        ) : filteredGenerations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-3xl blur-xl opacity-50" />
            <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-12 border border-white/60 text-center">
              <ImageIcon className="w-16 h-16 text-[var(--coconut-husk)] mx-auto mb-4" />
              <h3 className="text-xl text-[var(--coconut-shell)] mb-2">No Generations Yet</h3>
              <p className="text-[var(--coconut-husk)]">Your generation history will appear here</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredGenerations.map((gen, index) => (
              <motion.div
                key={gen.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="relative group"
              >
                {/* Glow */}
                <div className="absolute -inset-1 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Card */}
                <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl overflow-hidden border border-white/60">
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden bg-[var(--coconut-milk)]">
                    {gen.type === 'video' ? (
                      // Video preview
                      gen.resultUrl ? (
                        <div className="relative w-full h-full group/video">
                          <video
                            src={gen.resultUrl}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => {
                              e.currentTarget.pause();
                              e.currentTarget.currentTime = 0;
                            }}
                          />
                          {/* Video icon overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/video:bg-black/10 transition-colors">
                            <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
                              <Video className="w-8 h-8 text-[var(--coconut-shell)]" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <Video className="w-12 h-12 text-[var(--coconut-shell)] mb-2" />
                          <Loader2 className="w-6 h-6 text-[var(--coconut-shell)] animate-spin" />
                        </div>
                      )
                    ) : (
                      // Image preview
                      gen.resultUrl || gen.thumbnail ? (
                        <ImageWithFallback
                          src={gen.resultUrl || gen.thumbnail || ''}
                          alt={`Generation ${gen.id}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-[var(--coconut-shell)] animate-spin" />
                        </div>
                      )
                    )}
                    
                    {/* Status Badge */}
                    {gen.status === 'processing' && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-[var(--coconut-husk)]/90 backdrop-blur-xl rounded-lg text-white text-xs flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Processing
                      </div>
                    )}
                    
                    {/* Favorite */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleFavorite(gen.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Star className={`w-4 h-4 ${gen.isFavorite ? 'fill-amber-500 text-amber-500' : 'text-[var(--coconut-husk)]'}`} />
                    </motion.button>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleViewDetails(gen)}
                          className="w-8 h-8 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Eye className="w-4 h-4 text-[var(--coconut-shell)]" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDownload(gen)}
                          className="w-8 h-8 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Download className="w-4 h-4 text-[var(--coconut-shell)]" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(gen.id)}
                          className="w-8 h-8 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Trash2 className="w-4 h-4 text-[var(--coconut-shell)]" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-center justify-between text-xs text-[var(--coconut-husk)] mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(gen.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-600" />
                        {gen.cost} credits
                      </span>
                    </div>
                    <p className="text-sm text-[var(--coconut-shell)] line-clamp-2">
                      {typeof gen.prompt === 'string' ? gen.prompt : gen.prompt.scene}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Detail Modal */}
      <AnimatePresence>
        {selectedGeneration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseDetails}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <img
                  src={selectedGeneration.imageUrl}
                  alt="Full size"
                  className="w-full rounded-xl"
                />
                <div className="mt-4">
                  <h3 className="text-xl text-[var(--coconut-shell)] mb-2">Generation Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[var(--coconut-husk)]">Created:</span>
                      <span className="text-[var(--coconut-shell)] ml-2">{new Date(selectedGeneration.createdAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[var(--coconut-husk)]">Cost:</span>
                      <span className="text-[var(--coconut-shell)] ml-2">{selectedGeneration.cost} credits</span>
                    </div>
                    <div>
                      <span className="text-[var(--coconut-husk)]">Duration:</span>
                      <span className="text-[var(--coconut-shell)] ml-2">{(selectedGeneration.duration / 1000).toFixed(1)}s</span>
                    </div>
                    <div>
                      <span className="text-[var(--coconut-husk)]">Status:</span>
                      <span className="text-[var(--coconut-shell)] ml-2 capitalize">{selectedGeneration.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HistoryManager;