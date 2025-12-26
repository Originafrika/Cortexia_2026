/**
 * Types pour le nouveau Studio de création
 */

// ============================================================================
// MODELS & PROVIDERS
// ============================================================================

export type ModelName = 
  | 'seedream'      // Pollinations - text-to-image + 4-10 images
  | 'kontext'       // Pollinations - 1 image enhancement
  | 'nanobanana'    // Pollinations - 2-3 images fusion
  | 'flux-schnell'  // Together AI - text-to-image fallback
  | 'flux-2-pro'    // Replicate - premium text/image
  | 'imagen-4';     // Replicate - premium text/image

export type ProviderName = 'pollinations' | 'together' | 'replicate';

export type ModelTier = 'free' | 'paid';

export interface ModelInfo {
  name: ModelName;
  provider: ProviderName;
  tier: ModelTier;
  cost: number; // Nombre de crédits
  description: string;
  capabilities: {
    textToImage: boolean;
    imageToImage: boolean;
    minImages: number; // 0 pour text-only
    maxImages: number;
  };
  features: string[];
}

// ============================================================================
// CREDITS
// ============================================================================

export interface CreditBalance {
  free: number;      // Crédits gratuits (max 25/mois)
  paid: number;      // Crédits payants achetés
  total: number;     // Total disponible
  canUseFree: boolean; // true si paid === 0
}

export interface CreditTransaction {
  id: string;
  type: 'deduction' | 'purchase' | 'refund' | 'monthly_reset';
  amount: number;
  creditType: 'free' | 'paid';
  balanceBefore: CreditBalance;
  balanceAfter: CreditBalance;
  timestamp: Date;
  metadata?: {
    model?: ModelName;
    generationId?: string;
    reason?: string;
  };
}

// ============================================================================
// GENERATION INPUT
// ============================================================================

export interface GenerationInput {
  type: 'text-to-image' | 'image-to-image' | 'multi-image';
  prompt: string;
  images?: {
    file: File;
    url?: string;
    preview: string;
  }[];
  options?: {
    width?: number;
    height?: number;
    guidance?: number;
    steps?: number;
    seed?: number;
  };
}

export interface GenerationRequest {
  input: GenerationInput;
  model: ModelName;
  enhancePrompt: boolean;
  userId: string;
}

// ============================================================================
// MODEL SUGGESTION
// ============================================================================

export interface ModelSuggestion {
  model: ModelName;
  provider: ProviderName;
  tier: ModelTier;
  cost: number;
  reason: string;
  confidence: number; // 0-1
  alternatives?: ModelSuggestion[];
}

// ============================================================================
// GENERATION RESULT
// ============================================================================

export type GenerationStatus = 
  | 'idle'
  | 'analyzing'
  | 'enhancing-prompt'
  | 'generating'
  | 'processing'
  | 'complete'
  | 'error';

export interface GenerationProgress {
  status: GenerationStatus;
  progress: number; // 0-100
  message: string;
  phase?: string;
  estimatedTimeRemaining?: number; // seconds
}

export interface GenerationResult {
  id: string;
  input: GenerationInput;
  model: ModelName;
  provider: ProviderName;
  originalPrompt: string;
  enhancedPrompt?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  creditsUsed: number;
  creditType: 'free' | 'paid';
  duration: number; // milliseconds
  status: 'success' | 'error';
  error?: {
    code: string;
    message: string;
    suggestion?: string;
  };
  metadata: {
    width: number;
    height: number;
    seed?: number;
    timestamp: Date;
    userId: string;
  };
}

// ============================================================================
// HISTORY / FEED
// ============================================================================

export interface FeedItem {
  id: string;
  result: GenerationResult;
  saved: boolean;
  liked: boolean;
  downloadCount: number;
  remixCount: number;
  createdAt: Date;
}

export interface FeedFilter {
  models?: ModelName[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tier?: ModelTier;
  status?: 'success' | 'error';
  searchQuery?: string;
}

export interface FeedPage {
  items: FeedItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface GenerationError {
  code: 'RATE_LIMIT' | 'INSUFFICIENT_CREDITS' | 'INVALID_INPUT' | 'API_ERROR' | 'UNKNOWN';
  message: string;
  provider?: ProviderName;
  suggestions: ErrorSuggestion[];
  canRetry: boolean;
}

export interface ErrorSuggestion {
  action: 'use_alternative_model' | 'buy_credits' | 'wait_and_retry' | 'modify_input';
  label: string;
  description: string;
  model?: ModelName;
  cost?: number;
}

// ============================================================================
// UI STATE
// ============================================================================

export interface StudioState {
  input: GenerationInput;
  suggestedModel: ModelSuggestion | null;
  selectedModel: ModelName | null;
  enhancePrompt: boolean;
  credits: CreditBalance;
  generation: {
    isGenerating: boolean;
    progress: GenerationProgress | null;
    result: GenerationResult | null;
    error: GenerationError | null;
  };
  feed: {
    items: FeedItem[];
    page: number;
    filter: FeedFilter;
    isLoading: boolean;
  };
}
