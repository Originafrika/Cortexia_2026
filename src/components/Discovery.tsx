import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Screen } from '../App';
import { PostDetailView } from './PostDetailView';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface DiscoveryProps {
  onNavigate: (screen: Screen) => void;
  onCreateClick?: (prefillPrompt?: string) => void;
  onViewPost?: (postId: string) => void;
  onViewCreator?: (creatorId: string) => void;
}

// TypeScript interfaces
interface SearchResult {
  id: string;
  type: 'image' | 'video';
  thumbnail: string;
  prompt: string;
  creator: string;
  creatorId: string;
  likes: number;
  remixes: number;
  duration?: number; // in seconds
  timestamp: number; // Unix timestamp
  isVerified: boolean;
}

interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  followers: number;
  isVerified: boolean;
  totalPosts: number;
  bio?: string;
}

interface Campaign {
  id: string;
  title: string;
  thumbnail: string;
  creator: string;
  creatorId: string;
  contents: number;
  views: number;
  isActive: boolean;
}

interface FilterState {
  duration: 'all' | 5 | 10 | 15;
  date: 'today' | 'week' | 'month' | 'all';
  sort: 'recent' | 'popular' | 'remixed';
  verifiedOnly: boolean;
}

type ViewMode = 'grid' | 'list';

// Icons inline
const Search = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const SlidersHorizontal = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" y1="21" x2="4" y2="14"></line>
    <line x1="4" y1="10" x2="4" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="3"></line>
    <line x1="20" y1="21" x2="20" y2="16"></line>
    <line x1="20" y1="12" x2="20" y2="3"></line>
    <line x1="1" y1="14" x2="7" y2="14"></line>
    <line x1="9" y1="8" x2="15" y2="8"></line>
    <line x1="17" y1="16" x2="23" y2="16"></line>
  </svg>
);

const TrendingUp = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const Heart = ({ className, size, fill }: { className?: string; size?: number; fill?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill={fill || "none"}
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const Shuffle = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="16 3 21 3 21 8"></polyline>
    <line x1="4" y1="20" x2="21" y2="3"></line>
    <polyline points="21 16 21 21 16 21"></polyline>
    <line x1="15" y1="15" x2="21" y2="21"></line>
    <line x1="4" y1="4" x2="9" y2="9"></line>
  </svg>
);

const Play = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const X = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const Grid = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const List = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const Check = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const Folder = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const Eye = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

// Mock data - Memorized
const TRENDING_PROMPTS = [
  { text: 'cyberpunk cityscape', count: 12500, trend: 245 },
  { text: 'fantasy dragon portrait', count: 8300, trend: 198 },
  { text: 'futuristic fashion model', count: 7100, trend: 156 },
  { text: 'neon retro wave', count: 6800, trend: 134 },
  { text: 'ethereal landscape', count: 5900, trend: 112 },
];

const POPULAR_STYLES = [
  { 
    name: 'Realistic',
    image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400',
    count: 45200
  },
  { 
    name: 'Anime',
    image: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=400',
    count: 38700
  },
  { 
    name: 'Cyberpunk',
    image: 'https://images.unsplash.com/photo-1635002962687-2275123f3a68?w=400',
    count: 32100
  },
  { 
    name: '3D Render',
    image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=400',
    count: 28500
  },
  { 
    name: 'Fantasy',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
    count: 25900
  },
  { 
    name: 'Abstract',
    image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400',
    count: 22300
  },
];

const TOP_CREATORS: Creator[] = [
  {
    id: 'creator-1',
    name: 'Alex Vortex',
    username: '@alexvortex',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    followers: 125000,
    isVerified: true,
    totalPosts: 342,
    bio: 'AI Artist & Cyberpunk enthusiast'
  },
  {
    id: 'creator-2',
    name: 'Luna Digital',
    username: '@lunadigital',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    followers: 98500,
    isVerified: true,
    totalPosts: 287,
    bio: 'Creating ethereal dreamscapes'
  },
  {
    id: 'creator-3',
    name: 'Neo Dreams',
    username: '@neodreams',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200',
    followers: 87200,
    isVerified: true,
    totalPosts: 219,
    bio: 'Fantasy & Sci-Fi visuals'
  },
  {
    id: 'creator-4',
    name: 'Pixel Sage',
    username: '@pixelsage',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200',
    followers: 76800,
    isVerified: false,
    totalPosts: 198,
    bio: 'Abstract digital art'
  },
  {
    id: 'creator-5',
    name: 'Nova AI',
    username: '@novaai',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    followers: 65300,
    isVerified: true,
    totalPosts: 156,
    bio: 'Futuristic concepts & designs'
  },
  {
    id: 'creator-6',
    name: 'Cyber Artist',
    username: '@cyberartist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    followers: 54200,
    isVerified: false,
    totalPosts: 143,
    bio: 'Tech-inspired artwork'
  },
];

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'campaign-1',
    title: 'Summer Fashion 2025',
    thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
    creator: 'Luna Digital',
    creatorId: 'creator-2',
    contents: 24,
    views: 156000,
    isActive: true
  },
  {
    id: 'campaign-2',
    title: 'Cyberpunk City Series',
    thumbnail: 'https://images.unsplash.com/photo-1635002962687-2275123f3a68?w=400',
    creator: 'Alex Vortex',
    creatorId: 'creator-1',
    contents: 18,
    views: 98000,
    isActive: true
  },
  {
    id: 'campaign-3',
    title: 'Fantasy Realms',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
    creator: 'Neo Dreams',
    creatorId: 'creator-3',
    contents: 32,
    views: 87000,
    isActive: true
  },
  {
    id: 'campaign-4',
    title: 'Product Launch 2025',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    creator: 'Pixel Sage',
    creatorId: 'creator-4',
    contents: 15,
    views: 76000,
    isActive: false
  },
];

const CATEGORIES = [
  { name: 'Art & Design', icon: '🎨', count: 156000 },
  { name: 'Marketing', icon: '📱', count: 98000 },
  { name: 'Fashion', icon: '👗', count: 87000 },
  { name: 'Gaming', icon: '🎮', count: 76000 },
  { name: 'Architecture', icon: '🏛️', count: 65000 },
  { name: 'Photography', icon: '📸', count: 54000 },
  { name: 'Film & Video', icon: '🎬', count: 43000 },
  { name: 'Nature', icon: '🌿', count: 39000 },
];

// Generate comprehensive mock data
const generateMockResults = (): SearchResult[] => {
  const prompts = [
    'cyberpunk cityscape at night', 'fantasy dragon flying', 'futuristic fashion portrait',
    'abstract neon waves', '3D rendered architecture', 'anime character design',
    'realistic landscape photography', 'sci-fi spaceship interior', 'ethereal forest scene',
    'steampunk machinery', 'minimalist geometric art', 'dystopian urban environment',
    'magical crystal cave', 'retro synthwave sunset', 'underwater coral reef',
    'medieval castle ruins', 'holographic user interface', 'bioluminescent creatures'
  ];
  
  const creators = ['Alex Vortex', 'Luna Digital', 'Neo Dreams', 'Pixel Sage', 'Nova AI', 'Cyber Artist'];
  const creatorIds = ['creator-1', 'creator-2', 'creator-3', 'creator-4', 'creator-5', 'creator-6'];
  const thumbnails = [
    'https://images.unsplash.com/photo-1635002962687-2275123f3a68?w=400',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
    'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400',
    'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400',
    'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=400',
    'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=400',
  ];

  const now = Date.now();
  const DAY = 86400000;
  
  return prompts.map((prompt, index) => ({
    id: `result-${index}`,
    type: index % 3 === 0 ? 'video' : 'image',
    thumbnail: thumbnails[index % thumbnails.length],
    prompt,
    creator: creators[index % creators.length],
    creatorId: creatorIds[index % creatorIds.length],
    likes: Math.floor(Math.random() * 5000) + 500,
    remixes: Math.floor(Math.random() * 1000) + 50,
    duration: index % 3 === 0 ? [5, 10, 15][Math.floor(Math.random() * 3)] : undefined,
    timestamp: now - Math.floor(Math.random() * 30) * DAY,
    isVerified: index % 2 === 0
  }));
};

const ALL_RESULTS = generateMockResults();

// Utility functions
const formatCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

const formatDuration = (seconds: number): string => {
  return `${seconds}s`;
};

export function Discovery({ onNavigate, onCreateClick, onViewPost, onViewCreator }: DiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos' | 'creators' | 'campaigns'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(['cyberpunk', 'fantasy dragon', 'neon']);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchInputFocused, setSearchInputFocused] = useState(false);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragCurrentY, setDragCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    duration: 'all',
    date: 'all',
    sort: 'recent',
    verifiedOnly: false
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersModalRef = useRef<HTMLDivElement>(null);

  // Initial loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery) {
        setIsLoading(false);
      }
    }, 300);

    if (searchQuery) {
      setIsLoading(true);
    }

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showFilters) {
          setShowFilters(false);
        } else if (searchQuery) {
          setSearchQuery('');
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showFilters, searchQuery]);

  // Focus trap for filters modal
  useEffect(() => {
    if (showFilters && filtersModalRef.current) {
      const focusableElements = filtersModalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [showFilters]);

  const isSearchActive = debouncedQuery.length > 0;

  // Filter and search logic
  const filteredResults = useMemo(() => {
    let results = [...ALL_RESULTS];

    // Search filter
    if (debouncedQuery) {
      const query = debouncedQuery.toLowerCase();
      results = results.filter(r => 
        r.prompt.toLowerCase().includes(query) ||
        r.creator.toLowerCase().includes(query)
      );
    }

    // Tab filter
    if (activeTab === 'images') {
      results = results.filter(r => r.type === 'image');
    } else if (activeTab === 'videos') {
      results = results.filter(r => r.type === 'video');
    }

    // Duration filter
    if (filters.duration !== 'all') {
      results = results.filter(r => r.duration === filters.duration);
    }

    // Date filter
    const now = Date.now();
    const DAY = 86400000;
    if (filters.date === 'today') {
      results = results.filter(r => now - r.timestamp < DAY);
    } else if (filters.date === 'week') {
      results = results.filter(r => now - r.timestamp < 7 * DAY);
    } else if (filters.date === 'month') {
      results = results.filter(r => now - r.timestamp < 30 * DAY);
    }

    // Verified filter
    if (filters.verifiedOnly) {
      results = results.filter(r => r.isVerified);
    }

    // Sorting
    if (filters.sort === 'popular') {
      results.sort((a, b) => b.likes - a.likes);
    } else if (filters.sort === 'remixed') {
      results.sort((a, b) => b.remixes - a.remixes);
    } else {
      results.sort((a, b) => b.timestamp - a.timestamp);
    }

    return results;
  }, [debouncedQuery, activeTab, filters]);

  // Filter creators based on search
  const filteredCreators = useMemo(() => {
    if (!debouncedQuery) return TOP_CREATORS;
    const query = debouncedQuery.toLowerCase();
    return TOP_CREATORS.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.username.toLowerCase().includes(query) ||
      c.bio?.toLowerCase().includes(query)
    );
  }, [debouncedQuery]);

  // Filter campaigns based on search
  const filteredCampaigns = useMemo(() => {
    if (!debouncedQuery) return MOCK_CAMPAIGNS;
    const query = debouncedQuery.toLowerCase();
    return MOCK_CAMPAIGNS.filter(c => 
      c.title.toLowerCase().includes(query) ||
      c.creator.toLowerCase().includes(query)
    );
  }, [debouncedQuery]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.duration !== 'all') count++;
    if (filters.date !== 'all') count++;
    if (filters.sort !== 'recent') count++;
    if (filters.verifiedOnly) count++;
    return count;
  }, [filters]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSearchSubmitted(false); // Reset when typing
  }, []);

  const handleSearchSubmit = useCallback((query: string) => {
    if (query && !recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches.slice(0, 9)]);
    }
    setSearchSubmitted(true);
    setSearchInputFocused(false);
  }, [recentSearches]);

  const removeRecentSearch = useCallback((query: string) => {
    setRecentSearches(recentSearches.filter(q => q !== query));
  }, [recentSearches]);

  const clearAllFilters = useCallback(() => {
    setFilters({
      duration: 'all',
      date: 'all',
      sort: 'recent',
      verifiedOnly: false
    });
  }, []);

  const applyFilters = useCallback(() => {
    setShowFilters(false);
  }, []);

  const handleTrendingClick = useCallback((prompt: string) => {
    setSearchQuery(prompt);
    setSearchSubmitted(true);
    if (prompt && !recentSearches.includes(prompt)) {
      setRecentSearches([prompt, ...recentSearches.slice(0, 9)]);
    }
  }, [recentSearches]);

  const handleRemixSearch = useCallback(() => {
    if (onCreateClick && debouncedQuery) {
      onCreateClick(debouncedQuery);
    }
  }, [onCreateClick, debouncedQuery]);

  const handleResultClick = useCallback((resultId: string) => {
    setSelectedPostId(resultId);
  }, []);

  const handleCreatorClick = useCallback((username: string) => {
    if (onViewCreator) {
      onViewCreator(username);
    }
  }, [onViewCreator]);

  const handleStyleClick = useCallback((styleName: string) => {
    setSearchQuery(styleName.toLowerCase());
    handleSearchSubmit(styleName.toLowerCase());
  }, [handleSearchSubmit]);

  const handleCategoryClick = useCallback((categoryName: string) => {
    setSearchQuery(categoryName.toLowerCase());
    handleSearchSubmit(categoryName.toLowerCase());
  }, [handleSearchSubmit]);

  // Swipe gesture handlers for filter sheet
  const handleFilterTouchStart = (e: React.TouchEvent) => {
    setDragStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleFilterTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartY;
    if (diff > 0) {
      setDragCurrentY(diff);
    }
  };

  const handleFilterTouchEnd = () => {
    if (dragCurrentY > 100) {
      setShowFilters(false);
    }
    setDragCurrentY(0);
    setIsDragging(false);
  };

  // Get selected post details
  const selectedPost = useMemo(() => {
    return ALL_RESULTS.find(r => r.id === selectedPostId);
  }, [selectedPostId]);

  // Render content based on active tab
  const renderTabContent = () => {
    if (activeTab === 'creators') {
      return (
        <div className="px-4 pb-6">
          <p className="text-gray-400 mb-4">
            {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''} found
          </p>
          <div className="space-y-3">
            {filteredCreators.map((creator) => (
              <button
                key={creator.id}
                onClick={() => handleCreatorClick(creator.username.replace('@', ''))}
                className="w-full bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4 flex items-center gap-4 hover:border-[#6366f1] transition-colors"
                aria-label={`View ${creator.name}'s profile`}
              >
                <div className="relative w-16 h-16 flex-shrink-0">
                  <ImageWithFallback
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                  {creator.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#6366f1] rounded-full flex items-center justify-center border-2 border-[#1A1A1A]">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-white truncate">{creator.name}</p>
                  <p className="text-gray-400 text-sm truncate">{creator.username}</p>
                  {creator.bio && (
                    <p className="text-gray-500 text-sm truncate mt-1">{creator.bio}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{formatCount(creator.followers)} followers</span>
                    <span>{creator.totalPosts} posts</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'campaigns') {
      return (
        <div className="px-4 pb-6">
          <p className="text-gray-400 mb-4">
            {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} found
          </p>
          <div className="space-y-3">
            {filteredCampaigns.map((campaign) => (
              <button
                key={campaign.id}
                className="w-full bg-[#1A1A1A] border border-gray-800 rounded-2xl overflow-hidden hover:border-[#6366f1] transition-colors"
                aria-label={`View ${campaign.title} campaign`}
              >
                <div className="flex gap-3">
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <ImageWithFallback
                      src={campaign.thumbnail}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                    {campaign.isActive && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Active
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-3 text-left min-w-0">
                    <h3 className="text-white truncate mb-1">{campaign.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">by {campaign.creator}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Folder size={14} />
                        <span>{campaign.contents} contents</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{formatCount(campaign.views)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Default: images/videos/all results
    return (
      <div className="px-4 pb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-gray-400">
              {isLoading ? (
                'Searching...'
              ) : (
                <>
                  {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for "<span className="text-white">{debouncedQuery}</span>"
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRemixSearch}
              className="px-3 py-1.5 bg-[#6366f1] rounded-full text-white text-sm flex items-center gap-2"
              disabled={!onCreateClick}
              aria-label="Remix this search"
            >
              <Shuffle size={14} />
              Remix
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 bg-[#1A1A1A] border border-gray-800 rounded-full"
              aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? <List size={16} className="text-white" /> : <Grid size={16} className="text-white" />}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-4 pb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-gray-800">
                <div className="aspect-[3/4] bg-gray-800 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-800 rounded animate-pulse" />
                  <div className="h-3 bg-gray-800 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredResults.length === 0 && (
          <div className="text-center py-12">
            <Search className="text-gray-600 mx-auto mb-4" size={48} />
            <p className="text-gray-400 mb-2">No results found</p>
            <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search terms</p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-[#6366f1] text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Grid/List Results */}
        {!isLoading && filteredResults.length > 0 && (
          <div 
            className={`transition-all duration-300 ${
              viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'
            }`}
          >
            {filteredResults.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleResultClick(result.id);
                  }
                }}
                className={`bg-[#1A1A1A] rounded-2xl overflow-hidden border border-gray-800 hover:border-[#6366f1] transition-colors text-left ${
                  viewMode === 'list' ? 'flex gap-3' : ''
                }`}
                aria-label={`View post: ${result.prompt} by ${result.creator}`}
              >
                <div className={`relative ${viewMode === 'grid' ? 'aspect-[3/4]' : 'w-32 h-32'}`}>
                  <ImageWithFallback
                    src={result.thumbnail}
                    alt={result.prompt}
                    className="w-full h-full object-cover"
                  />
                  {result.type === 'video' && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                        <Play size={10} className="text-white" />
                        <span className="text-white text-xs">{formatDuration(result.duration!)}</span>
                      </div>
                    </>
                  )}
                  {viewMode === 'grid' && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Heart size={12} className="text-white" />
                            <span className="text-white">{formatCount(result.likes)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shuffle size={12} className="text-white" />
                            <span className="text-white">{result.remixes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className={viewMode === 'grid' ? 'p-3' : 'flex-1 p-3'}>
                  <p className={`text-white text-sm mb-2 ${viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-3'}`}>
                    {result.prompt}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-gray-400 text-xs">by {result.creator}</p>
                    {result.isVerified && (
                      <div className="w-3 h-3 bg-[#6366f1] rounded-full flex items-center justify-center">
                        <Check size={8} className="text-white" />
                      </div>
                    )}
                  </div>
                  {viewMode === 'list' && (
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Heart size={12} />
                        <span>{formatCount(result.likes)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shuffle size={12} />
                        <span>{result.remixes}</span>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
    <div className="h-screen bg-black overflow-hidden flex flex-col">
      {/* Fixed Search Header */}
      <div className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-xl z-40 pt-safe border-b border-gray-900">
        <div className="p-4 space-y-3">
          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search prompts, creators, styles..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(searchQuery);
                  }
                }}
                onFocus={() => setSearchInputFocused(true)}
                onBlur={() => setTimeout(() => setSearchInputFocused(false), 200)}
                className="w-full bg-[#1A1A1A] border border-gray-800 rounded-full pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#6366f1] transition-colors"
                aria-label="Search"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  aria-label="Clear search"
                >
                  <X className="text-gray-400" size={20} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative p-3 rounded-full transition-colors ${showFilters ? 'bg-[#6366f1]' : 'bg-[#1A1A1A]'} border ${showFilters ? 'border-[#6366f1]' : 'border-gray-800'}`}
              aria-label={`Filters ${activeFiltersCount > 0 ? `(${activeFiltersCount} active)` : ''}`}
            >
              <SlidersHorizontal className="text-white" size={20} />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Recent Searches - shown ONLY when typing, NOT after search submitted */}
          {searchInputFocused && !searchSubmitted && searchQuery.length > 0 && recentSearches.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <span className="text-gray-400 text-sm whitespace-nowrap">Recent:</span>
              {recentSearches.map((query) => (
                <div
                  key={query}
                  className="flex items-center gap-1 bg-[#1A1A1A] border border-gray-800 rounded-full px-3 py-1.5 whitespace-nowrap"
                >
                  <button
                    onClick={() => {
                      setSearchQuery(query);
                      handleSearchSubmit(query);
                    }}
                    className="text-gray-300 text-sm"
                  >
                    {query}
                  </button>
                  <button 
                    onClick={() => removeRecentSearch(query)}
                    className="p-1"
                    aria-label={`Remove ${query} from recent searches`}
                  >
                    <X className="text-gray-500" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Filters Bottom Sheet with Swipe Gesture */}
      {showFilters && (
        <div 
          className="fixed inset-0 z-50 flex items-end animate-fade-in" 
          onClick={() => setShowFilters(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="filters-title"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            ref={filtersModalRef}
            className="relative w-full bg-[#1A1A1A] rounded-t-3xl p-6 space-y-4 animate-slide-up pb-safe transition-transform"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleFilterTouchStart}
            onTouchMove={handleFilterTouchMove}
            onTouchEnd={handleFilterTouchEnd}
            style={{ 
              backdropFilter: 'blur(10px)',
              transform: `translateY(${dragCurrentY}px)`
            }}
          >
            <div 
              className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-4 cursor-grab active:cursor-grabbing" 
            />
            <div className="flex items-center justify-between">
              <h3 id="filters-title" className="text-white text-lg">Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-[#6366f1] text-sm"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-sm">Duration</label>
                <div className="flex gap-2 mt-2">
                  {(['all', 5, 10, 15] as const).map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setFilters({ ...filters, duration })}
                      className={`flex-1 py-2 border rounded-lg transition-colors ${
                        filters.duration === duration
                          ? 'bg-[#6366f1] border-[#6366f1] text-white'
                          : 'bg-black border-gray-800 text-gray-300'
                      }`}
                    >
                      {duration === 'all' ? 'All' : `${duration}s`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Date</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(['today', 'week', 'month', 'all'] as const).map((date) => (
                    <button
                      key={date}
                      onClick={() => setFilters({ ...filters, date })}
                      className={`py-2 border rounded-lg transition-colors ${
                        filters.date === date
                          ? 'bg-[#6366f1] border-[#6366f1] text-white'
                          : 'bg-black border-gray-800 text-gray-300'
                      }`}
                    >
                      {date === 'today' ? 'Today' : date === 'week' ? 'This Week' : date === 'month' ? 'This Month' : 'All Time'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Sort by</label>
                <div className="space-y-2 mt-2">
                  {(['recent', 'popular', 'remixed'] as const).map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setFilters({ ...filters, sort })}
                      className={`w-full py-2 border rounded-lg text-left px-4 transition-colors flex items-center justify-between ${
                        filters.sort === sort
                          ? 'bg-[#6366f1] border-[#6366f1] text-white'
                          : 'bg-black border-gray-800 text-gray-300'
                      }`}
                    >
                      <span>{sort === 'recent' ? 'Most Recent' : sort === 'popular' ? 'Most Popular' : 'Most Remixed'}</span>
                      {filters.sort === sort && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setFilters({ ...filters, verifiedOnly: !filters.verifiedOnly })}
                className="w-full flex items-center justify-between p-3 bg-black border border-gray-800 rounded-lg"
              >
                <span className="text-gray-300">Verified creators only</span>
                <div 
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    filters.verifiedOnly ? 'bg-[#6366f1]' : 'bg-gray-700'
                  }`}
                >
                  <div 
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      filters.verifiedOnly ? 'left-7' : 'left-1'
                    }`}
                  />
                </div>
              </button>
            </div>

            <button 
              onClick={applyFilters}
              className="w-full py-3 bg-[#6366f1] rounded-full text-white"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Tabs - Sticky below header, shown when search is active */}
      {isSearchActive && (
        <div className="sticky bg-black/80 backdrop-blur-xl z-30 px-4 py-3 border-b border-gray-900" style={{ top: 'calc(env(safe-area-inset-top) + 80px)' }}>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(['all', 'images', 'videos', 'creators', 'campaigns'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-[#6366f1] text-white'
                    : 'bg-[#1A1A1A] text-gray-400 border border-gray-800'
                }`}
                aria-pressed={activeTab === tab}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content - Scrollable */}
      <div className={`flex-1 overflow-y-auto pb-20 ${isSearchActive ? 'pt-20' : 'pt-20'}`}>
        {isSearchActive ? (
          /* Search Results */
          renderTabContent()
        ) : (
          /* Discovery Mode */
          initialLoading ? (
            /* Initial Loading State */
            <div className="space-y-6 px-4 py-6">
              <div className="space-y-4">
                <div className="h-8 bg-[#1A1A1A] rounded-lg w-48 animate-pulse" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-[#1A1A1A] rounded-2xl p-4 border border-gray-800">
                    <div className="h-16 bg-gray-800 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Trending Prompts */}
              <div className="px-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-[#6366f1]" size={24} />
                  <h2 className="text-white text-xl">Trending Now</h2>
                </div>
                <div className="space-y-2">
                  {TRENDING_PROMPTS.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleTrendingClick(prompt.text)}
                      className="w-full bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4 flex items-center justify-between hover:border-[#6366f1] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-lg w-6">#{index + 1}</span>
                        <div className="text-left">
                          <p className="text-white">{prompt.text}</p>
                          <p className="text-gray-400 text-sm">{formatCount(prompt.count)} generations</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full">
                        <TrendingUp size={14} className="text-green-500" />
                        <span className="text-green-500 text-sm">+{prompt.trend}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Styles */}
              <div>
                <h2 className="text-white text-xl px-4 mb-4">Popular Styles</h2>
                <div className="overflow-x-auto no-scrollbar">
                  <div className="flex gap-3 px-4">
                    {POPULAR_STYLES.map((style, index) => (
                      <button
                        key={index}
                        onClick={() => handleStyleClick(style.name)}
                        className="flex-shrink-0 w-40 bg-[#1A1A1A] border border-gray-800 rounded-2xl overflow-hidden hover:border-[#6366f1] transition-colors"
                      >
                        <div className="relative aspect-[4/5]">
                          <ImageWithFallback
                            src={style.image}
                            alt={style.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-white mb-1">{style.name}</p>
                            <p className="text-gray-400 text-sm">{formatCount(style.count)} posts</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Creators */}
              <div>
                <h2 className="text-white text-xl px-4 mb-4">Top Creators</h2>
                <div className="overflow-x-auto no-scrollbar">
                  <div className="flex gap-3 px-4">
                    {TOP_CREATORS.map((creator) => (
                      <button
                        key={creator.id}
                        onClick={() => handleCreatorClick(creator.username.replace('@', ''))}
                        className="flex-shrink-0 w-32 bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4 text-center hover:border-[#6366f1] transition-colors"
                      >
                        <div className="relative w-20 h-20 mx-auto mb-3">
                          <ImageWithFallback
                            src={creator.avatar}
                            alt={creator.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                          {creator.isVerified && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#6366f1] rounded-full flex items-center justify-center border-2 border-[#1A1A1A]">
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-white text-sm line-clamp-1 mb-1">{creator.name}</p>
                        <p className="text-gray-400 text-xs mb-2">{creator.username}</p>
                        <p className="text-[#6366f1] text-xs">{formatCount(creator.followers)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="px-4">
                <h2 className="text-white text-xl mb-4">Categories</h2>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => handleCategoryClick(category.name)}
                      className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4 text-left hover:border-[#6366f1] transition-colors"
                    >
                      <div className="text-3xl mb-2">{category.icon}</div>
                      <p className="text-white mb-1">{category.name}</p>
                      <p className="text-gray-400 text-sm">{formatCount(category.count)} posts</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>

    {/* Post Detail View Overlay */}
    {selectedPost && (
      <PostDetailView
        postId={selectedPost.id}
        thumbnail={selectedPost.thumbnail}
        prompt={selectedPost.prompt}
        creator={selectedPost.creator}
        likes={selectedPost.likes}
        remixes={selectedPost.remixes}
        type={selectedPost.type}
        isVerified={selectedPost.isVerified}
        onClose={() => setSelectedPostId(null)}
        onRemix={(prompt) => {
          setSelectedPostId(null);
          if (onCreateClick) {
            onCreateClick(prompt);
          }
        }}
        onViewCreator={(username) => {
          setSelectedPostId(null);
          if (onViewCreator) {
            onViewCreator(username);
          }
        }}
      />
    )}
    </>
  );
}
