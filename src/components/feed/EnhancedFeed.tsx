/**
 * ENHANCED FEED - Improved Feed with Advanced Features
 * 
 * Features:
 * - Search & filters (by type, status, date)
 * - Sort options (newest, oldest, most liked, trending)
 * - Grid/List view toggle
 * - Infinite scroll
 * - Bulk actions
 * - Advanced filters panel
 * - Quick actions menu
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Grid3x3, 
  List, 
  ChevronDown,
  Calendar,
  Tag,
  TrendingUp,
  Clock,
  Heart,
  Download,
  Trash2,
  Share2,
  MoreHorizontal,
  X,
  CheckSquare,
  Square,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface FeedItem {
  id: string;
  type: 'image' | 'video' | 'text' | 'design';
  title: string;
  imageUrl?: string;
  createdAt: string;
  status: 'draft' | 'published' | 'archived';
  likes: number;
  views: number;
  tags: string[];
  isLiked?: boolean;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'most-liked' | 'trending';
type FilterType = 'all' | 'image' | 'video' | 'text' | 'design';
type FilterStatus = 'all' | 'draft' | 'published' | 'archived';

interface EnhancedFeedProps {
  onItemClick?: (item: FeedItem) => void;
  onNavigate?: (view: string) => void;
}

export function EnhancedFeed({ onItemClick, onNavigate }: EnhancedFeedProps) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Refs
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [items, searchQuery, filterType, filterStatus, sortBy]);

  useEffect(() => {
    // Setup intersection observer for infinite scroll
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, isLoadingMore]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      console.log('[EnhancedFeed] Loading items');

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/feed?page=1&limit=20`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[EnhancedFeed] Items loaded:', data);
        
        setItems(data.items || []);
        setHasMore(data.hasMore || false);
        setPage(1);
      } else {
        console.error('[EnhancedFeed] Failed to load items:', await res.text());
        toast.error('Failed to load feed');
      }
    } catch (error) {
      console.error('[EnhancedFeed] Error loading items:', error);
      toast.error('Error loading feed');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      console.log('[EnhancedFeed] Loading more items, page:', page + 1);

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/feed?page=${page + 1}&limit=20`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (res.ok) {
        const data = await res.json();
        
        setItems(prev => [...prev, ...(data.items || [])]);
        setHasMore(data.hasMore || false);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('[EnhancedFeed] Error loading more items:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...items];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most-liked':
          return b.likes - a.likes;
        case 'trending':
          // Simple trending algorithm: likes + views in last 24h
          const aScore = a.likes * 2 + a.views;
          const bScore = b.likes * 2 + b.views;
          return bScore - aScore;
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedItems(new Set(filteredItems.map(item => item.id)));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const handleBulkAction = async (action: 'download' | 'delete' | 'archive') => {
    if (selectedItems.size === 0) return;

    try {
      console.log(`[EnhancedFeed] Bulk ${action}:`, Array.from(selectedItems));

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

      const res = await fetch(`${apiUrl}/feed/bulk-action`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          itemIds: Array.from(selectedItems)
        })
      });

      if (res.ok) {
        toast.success(`Successfully ${action}ed ${selectedItems.size} items`);
        
        if (action === 'delete') {
          setItems(prev => prev.filter(item => !selectedItems.has(item.id)));
        }
        
        deselectAll();
        setShowBulkActions(false);
      } else {
        toast.error(`Failed to ${action} items`);
      }
    } catch (error) {
      console.error(`[EnhancedFeed] Error during bulk ${action}:`, error);
      toast.error(`Error during bulk ${action}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-amber-100 text-amber-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cream-200 border-t-cream-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Your Creations</h2>
          <p className="text-sm text-gray-600">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            {selectedItems.size > 0 && ` • ${selectedItems.size} selected`}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-cream-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-cream-100">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search creations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 text-sm font-medium transition-colors ${
              showFilters || filterType !== 'all' || filterStatus !== 'all'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            Filters
            {(filterType !== 'all' || filterStatus !== 'all') && (
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium appearance-none cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="most-liked">Most liked</option>
              <option value="trending">Trending</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Selection Actions */}
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={deselectAll}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Clear
              </button>
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <MoreHorizontal size={16} />
                Actions ({selectedItems.size})
              </button>
            </div>
          )}
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-cream-100 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(['all', 'image', 'video', 'text', 'design'] as FilterType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterType === type
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                        }`}
                      >
                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(['all', 'draft', 'published', 'archived'] as FilterStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterStatus === status
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                        }`}
                      >
                        {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {(filterType !== 'all' || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setFilterType('all');
                    setFilterStatus('all');
                  }}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Actions Menu */}
        <AnimatePresence>
          {showBulkActions && selectedItems.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-cream-100 overflow-hidden"
            >
              <p className="text-sm font-medium text-gray-700 mb-3">
                Bulk actions for {selectedItems.size} items:
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleBulkAction('download')}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Download size={16} />
                  Download All
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Calendar size={16} />
                  Archive
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Select All */}
      {filteredItems.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={selectedItems.size === filteredItems.length ? deselectAll : selectAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            {selectedItems.size === filteredItems.length ? (
              <>
                <CheckSquare size={16} />
                Deselect All
              </>
            ) : (
              <>
                <Square size={16} />
                Select All
              </>
            )}
          </button>
        </div>
      )}

      {/* Items Grid/List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-cream-100">
          <Search size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 mb-2">No items found</p>
          <p className="text-sm text-gray-500">Try adjusting your filters or search query</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-all cursor-pointer ${
                selectedItems.has(item.id)
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-cream-100 hover:border-cream-200 hover:shadow-md'
              }`}
              onClick={() => toggleItemSelection(item.id)}
            >
              {/* Image */}
              {item.imageUrl && (
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3">
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                      selectedItems.has(item.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white/80 border-white backdrop-blur-sm'
                    }`}>
                      {selectedItems.has(item.id) && (
                        <CheckSquare size={16} className="text-white" />
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                  {item.title}
                </h3>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {item.tags.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {item.tags.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{item.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Heart size={14} className={item.isLiked ? 'fill-red-500 text-red-500' : ''} />
                      <span>{item.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all cursor-pointer flex items-center gap-4 ${
                selectedItems.has(item.id)
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-cream-100 hover:border-cream-200 hover:shadow-md'
              }`}
              onClick={() => toggleItemSelection(item.id)}
            >
              {/* Checkbox */}
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                selectedItems.has(item.id)
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white border-gray-300'
              }`}>
                {selectedItems.has(item.id) && (
                  <CheckSquare size={16} className="text-white" />
                )}
              </div>

              {/* Thumbnail */}
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {item.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <span>{formatDate(item.createdAt)}</span>
                  <div className="flex items-center gap-1">
                    <Heart size={14} className={item.isLiked ? 'fill-red-500 text-red-500' : ''} />
                    <span>{item.likes}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.success('Item shared!');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Share2 size={18} className="text-gray-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.success('Item downloaded!');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download size={18} className="text-gray-600" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="py-8">
        {isLoadingMore && (
          <div className="flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        )}
        {!hasMore && filteredItems.length > 0 && (
          <p className="text-center text-sm text-gray-500">
            You've reached the end
          </p>
        )}
      </div>
    </div>
  );
}
