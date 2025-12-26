/**
 * COCONUT V14 - CENTRALIZED TYPES
 * Fix #9: Single source of truth for all Coconut types
 * Fix #33: Consistent naming (coconut-v14, not coconutV14 or coco-board)
 */

// ============================================
// USER SETTINGS
// ============================================

export interface UserSettings {
  // Account
  username: string;
  email: string;
  displayName: string;

  // Preferences
  language: string;
  timezone: string;
  theme: string;

  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;

  // Privacy
  profileVisibility: string;
  showActivity: boolean;
}

// ============================================
// COCOBOARD
// ============================================

export interface CocoBoardAnalysis {
  projectTitle: string;
  concept: {
    mainConcept: string;
    visualStyle: string;
    targetEmotion: string;
    keyMessage: string;
  };
  referenceAnalysis: {
    patterns: string[];
    styleNotes: string;
    colorInsights: string[];
  };
  composition: {
    layout: string;
    hierarchy: string[];
    zones: any[];
  };
  colorPalette: {
    primary: string[];
    accent: string[];
    background: string[];
    text: string[];
    rationale: string;
  };
  assetsRequired: {
    missing: string[];
    canGenerate: boolean;
    multiPassNeeded: boolean;
  };
  finalPrompt: FluxPrompt;
  technicalSpecs: TechnicalSpecs;
  estimatedCost: Cost;
  recommendations: {
    generationApproach: 'single-pass' | 'multi-pass';
    rationale: string;
  };
}

export interface CocoBoard {
  id: string;
  projectId: string;
  userId: string;
  analysis: CocoBoardAnalysis;
  finalPrompt: FluxPrompt;
  references: string[];
  specs: TechnicalSpecs;
  cost: Cost;
  status: 'draft' | 'ready' | 'generating' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// FLUX PROMPT
// ============================================

export interface FluxPrompt {
  scene: string;
  subjects: string[];
  style: string;
  color_palette: string[];
  lighting: string;
  composition: string;
  mood: string;
}

// ============================================
// TECHNICAL SPECS
// ============================================

export interface TechnicalSpecs {
  model: 'flux-2-pro' | 'veo-3.1-fast';
  mode: 'text-to-image' | 'text-to-video';
  ratio: string;
  resolution: '1K' | '2K' | '4K';
  references: string[];
}

// ============================================
// COST
// ============================================

export interface Cost {
  analysis: number;
  finalGeneration: number;
  total: number;
}

// ============================================
// GENERATION
// ============================================

export interface Generation {
  id: string;
  cocoBoardId?: string;
  userId: string;
  type: 'image' | 'video';
  prompt: FluxPrompt | string; // Can be structured or string
  model: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  credits: number;
  resultUrl?: string;
  thumbnail?: string;
  progress?: number;
  error?: string;
  isFavorite?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface GenerationRequest {
  cocoBoardId?: string;
  userId: string;
  type: 'image' | 'video';
  prompt: FluxPrompt | string;
  model: string;
  specs?: TechnicalSpecs;
}

// ============================================
// DASHBOARD
// ============================================

export interface DashboardStats {
  totalGenerations: number;
  totalCreditsUsed: number;
  successRate: number;
  averageCreditsPerDay: number;
  imagesGenerated: number;
  videosGenerated: number;
  sparklineData: number[];
  creditsRemaining: number;
  creditsTotal: number;
}

// ============================================
// PAGINATION
// ============================================

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ============================================
// TRANSACTIONS
// ============================================

export interface Transaction {
  id: string | number;
  type: 'purchase' | 'usage';
  description: string;
  credits: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

// ============================================
// PRICING
// ============================================

export interface Pricing {
  analysis: number;
  image: {
    [model: string]: {
      [resolution: string]: number;
    };
  };
  video: {
    [model: string]: {
      [resolution: string]: number;
    };
  };
}

// ============================================
// ANALYTICS
// ============================================

export interface UsageAnalytics {
  totalPurchased: number;
  totalUsed: number;
  remaining: number;
  avgPerDay: number;
  mostUsedModel: string;
  imagesGenerated: number;
  videosGenerated: number;
}

// ============================================
// CONSTANTS (Fix #32: No more magic numbers!)
// ============================================

export const COCONUT_CONSTANTS = {
  // Timing
  DASHBOARD_AUTO_REFRESH_MS: 30000, // 30 seconds
  TOAST_DURATION_MS: 5000, // 5 seconds
  DEBOUNCE_SEARCH_MS: 300, // 300ms
  
  // Credits
  ANALYSIS_COST: 100,
  IMAGE_BASE_COST: 5,
  VIDEO_BASE_COST: 15,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  DASHBOARD_PAGE_SIZE: 5,
  
  // Retry
  MAX_RETRIES: 3,
  INITIAL_RETRY_DELAY_MS: 1000,
  MAX_RETRY_DELAY_MS: 10000,
  
  // Z-Index Scale (Fix #43)
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    NOTIFICATION: 10000,
  },
} as const;

// ============================================
// NAMING CONVENTIONS (Fix #33)
// ============================================

/**
 * STANDARD NAMING:
 * - Package/folder: coconut-v14
 * - Components: CoconutV14, CocoBoard (PascalCase)
 * - Files: coconut-v14-routes.ts (kebab-case)
 * - API endpoints: /coconut/... (lowercase, no version in path)
 * - Types: CocoBoard, Generation (PascalCase)
 * - Constants: COCONUT_CONSTANTS (UPPER_SNAKE_CASE)
 */

export type CoconutNamingConvention = {
  package: 'coconut-v14';
  component: 'CoconutV14' | 'CocoBoard';
  file: 'coconut-v14-routes.ts';
  api: '/coconut/...';
  type: 'CocoBoard' | 'Generation';
  constant: 'COCONUT_CONSTANTS';
};
