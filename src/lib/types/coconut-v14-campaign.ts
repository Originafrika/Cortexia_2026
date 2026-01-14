/**
 * COCONUT V14 - CAMPAIGN MODE TYPES
 * Types for campaign generation with multi-week orchestration
 */

import type { ImageFormat, Resolution } from './coconut-v14';

// ============================================================================
// CAMPAIGN BRIEFING INPUT
// ============================================================================

export type CampaignObjective = 
  | 'product-launch'
  | 'brand-repositioning'
  | 'seasonal-promotion'
  | 'awareness'
  | 'conversion';

export type CampaignChannel = 
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'tiktok'
  | 'youtube'
  | 'print'
  | 'tv'
  | 'web'
  | 'email';

export interface CampaignBriefingInput {
  // OBJECTIF
  objective: CampaignObjective;
  
  // DURÉE (en semaines)
  duration: 2 | 4 | 6 | 8 | 12;
  
  // BUDGET
  budgetCredits: number;
  
  // CANAUX
  channels: CampaignChannel[];
  
  // AUDIENCE CIBLE
  targetAudience: {
    demographics: {
      ageRange: string; // ex: "25-45 ans"
      gender: 'all' | 'female' | 'male';
      location: string; // ex: "France, Belgique"
    };
    psychographics: string; // ex: "Sensibles à l'écologie"
  };
  
  // MIX CONTENUS
  contentMix: {
    imagesCount: number;
    videosCount: number;
    preferredFormats: {
      images: ImageFormat[];
      videos: ('9:16' | '16:9' | '1:1')[];
    };
  };
  
  // ASSETS FOURNIS (URLs après upload)
  providedAssets: {
    logo?: string;
    brandGuidelines?: string;
    productPhotos: string[];
    existingVideos?: string[];
  };
  
  // BRIEF TEXTE
  description: string;
  
  // INFORMATIONS PRODUIT/MARQUE
  productInfo: {
    name: string;
    category: string;
    keyFeatures: string[];
    uniqueSellingPoints: string;
  };
  
  // CONTRAINTES (optionnel)
  constraints?: {
    mustIncludeElements?: string[];
    avoidElements?: string[];
    brandColors?: string[];
  };
  
  // METADATA
  userId: string;
  projectId?: string;
}

// ============================================================================
// GEMINI CAMPAIGN ANALYSIS RESPONSE (RAW - Non-hydraté)
// ============================================================================

/**
 * ⚠️ IMPORTANT: Cette interface représente la réponse BRUTE de Gemini
 * Les weeks.assets contiennent des IDs (string[]), pas des objets complets
 * Utilisez hydrateCampaignData() pour convertir vers HydratedCampaignAnalysis
 */
export interface GeminiCampaignAnalysisResponse {
  // OVERVIEW
  campaignTitle: string;
  
  // STRATÉGIE GLOBALE
  strategy: {
    positioning: string;
    theme: string;
    messagingPillars: string[];
    narrativeArc: string;
  };
  
  // IDENTITÉ VISUELLE
  visualIdentity: {
    theme: string;
    palette: Array<{
      hex: string;
      name: string;
      usage: string;
    }>;
    photographyStyle: string;
    typography: {
      headlines: string;
      body: string;
    };
    archetypes: string[];
  };
  
  // TIMELINE
  timeline: {
    totalWeeks: number;
    startDate: string;
    endDate: string;
  };
  
  // SEMAINES
  weeks: CampaignWeek[];
  
  // TOUS LES ASSETS
  allAssets: CampaignAsset[];
  
  // COÛTS
  estimatedCost: {
    analysis: number;
    images: number;
    videos: number;
    total: number;
  };
  
  // KPIS
  kpis: {
    primary: string;
    secondary: string[];
    trackingRecommendations: string;
  };
}

export interface CampaignWeek {
  weekNumber: number;
  startDate: string;
  endDate: string;
  objective: string;
  theme: string;
  channels: CampaignChannel[];
  assets: string[]; // ⚠️ IDs des assets (Gemini raw response)
  budgetWeek: number;
  kpisWeek: {
    impressions: number;
    engagement: string;
    conversions: number;
  };
}

export interface CampaignAsset {
  // IDENTITÉ
  id: string;
  order: number;
  weekNumber: number;
  
  // TYPE & FORMAT
  type: 'image' | 'video';
  format: ImageFormat;
  resolution?: Resolution;
  videoDuration?: 6 | 8 | 15 | 20 | 30;
  videoModel?: 'veo3_fast' | 'veo3';
  
  // OBJECTIF MARKETING
  marketingObjective: string;
  
  // CONCEPT CRÉATIF
  concept: string;
  visualDescription: string;
  
  // COPY/TEXTE
  copy?: {
    headline?: string;
    subheadline?: string;
    cta?: string;
    bodyText?: string;
  };
  
  // CIBLAGE
  targetAudience: string;
  channels: CampaignChannel[];
  placementRecommendations: string;
  
  // TIMING
  scheduledDate: string;
  scheduledTime: string;
  
  // BRIEF CRÉATIF
  creativeBrief: string;
  
  // COÛT
  estimatedCost: number;
  
  // KPIS
  expectedKpis: {
    impressions: number;
    engagementRate: string;
    conversions?: number;
  };
  
  // NOTES
  notes?: string;
}

// ============================================================================
// HYDRATED CAMPAIGN TYPES (Pour utilisation dans l'app)
// ============================================================================

/**
 * ✅ Version hydratée pour l'utilisation dans l'app
 * weeks.assets contient les objets CampaignAsset complets
 */
export interface HydratedCampaignWeek {
  weekNumber: number;
  startDate: string;
  endDate: string;
  objective: string;
  theme: string;
  channels: CampaignChannel[];
  assets: CampaignAsset[]; // ✅ Objets complets
  budgetWeek: number;
  kpisWeek: {
    impressions: number;
    engagement: string;
    conversions: number;
  };
}

/**
 * ✅ Version hydratée complète pour l'utilisation dans l'app
 */
export interface HydratedCampaignAnalysis {
  // OVERVIEW
  campaignTitle: string;
  
  // STRATÉGIE GLOBALE
  strategy: {
    positioning: string;
    theme: string;
    messagingPillars: string[];
    narrativeArc: string;
  };
  
  // IDENTITÉ VISUELLE
  visualIdentity: {
    theme: string;
    palette: Array<{
      hex: string;
      name: string;
      usage: string;
    }>;
    photographyStyle: string;
    typography: {
      headlines: string;
      body: string;
    };
    archetypes: string[];
  };
  
  // TIMELINE
  timeline: {
    totalWeeks: number;
    startDate: string;
    endDate: string;
  };
  
  // SEMAINES (hydratées)
  weeks: HydratedCampaignWeek[];
  
  // TOUS LES ASSETS
  allAssets: CampaignAsset[];
  
  // COÛTS
  estimatedCost: {
    analysis: number;
    images: number;
    videos: number;
    total: number;
  };
  
  // KPIS
  kpis: {
    primary: string;
    secondary: string[];
    trackingRecommendations: string;
  };
}

// ============================================================================
// CAMPAIGN GENERATION
// ============================================================================

export type CampaignStatus = 
  | 'draft'
  | 'analyzing'
  | 'reviewed'
  | 'queued'
  | 'generating'
  | 'completed'
  | 'failed';

export interface Campaign {
  id: string;
  userId: string;
  projectId?: string;
  cocoBoardId: string;
  
  // STATUS
  status: CampaignStatus;
  
  // BRIEFING
  briefing: CampaignBriefingInput;
  
  // ANALYSIS
  analysis?: GeminiCampaignAnalysisResponse;
  
  // GENERATION PROGRESS
  progress?: {
    total: number;
    completed: number;
    failed: number;
    current: string | null;
  };
  
  // RESULTS
  results: CampaignAssetResult[];
  errors: Array<{
    assetId: string;
    error: string;
  }>;
  
  // TIMESTAMPS
  createdAt: string;
  analyzedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CampaignAssetResult {
  assetId: string;
  weekNumber: number;
  type: 'image' | 'video';
  concept: string;
  
  // GENERATION RESULT
  url: string;
  thumbnailUrl?: string;
  
  // METADATA
  format: ImageFormat;
  resolution?: Resolution;
  duration?: number;
  
  // COST
  actualCost: number;
  
  // STATUS
  status: 'generating' | 'completed' | 'failed';
  generatedAt?: string;
  error?: string;
}

// ============================================================================
// API REQUESTS/RESPONSES
// ============================================================================

export interface AnalyzeCampaignRequest {
  userId: string;
  projectId?: string;
  briefing: CampaignBriefingInput;
}

export interface AnalyzeCampaignResponse {
  success: boolean;
  data: GeminiCampaignAnalysisResponse;
  cocoBoardId: string;
}

export interface SaveCampaignCocoBoardRequest {
  userId: string;
  cocoBoardId: string;
  campaignData: GeminiCampaignAnalysisResponse;
}

export interface SaveCampaignCocoBoardResponse {
  success: boolean;
  cocoBoardId: string;
}

export interface GenerateCampaignRequest {
  userId: string;
  cocoBoardId: string;
}

export interface GenerateCampaignResponse {
  success: boolean;
  data: {
    campaignId: string;
    totalAssets: number;
    estimatedTime: number;
    queuePosition: number;
  };
}

export interface CampaignStatusResponse {
  success: boolean;
  data: {
    status: CampaignStatus;
    progress: {
      total: number;
      completed: number;
      failed: number;
      current: string | null;
    };
    results: CampaignAssetResult[];
    errors: Array<{
      assetId: string;
      error: string;
    }>;
  };
}

export interface CampaignSummary {
  cocoBoardId: string; // ✅ UPDATED: Use cocoBoardId instead of id
  campaignTitle: string;
  status: CampaignStatus;
  totalAssets: number;
  estimatedCost: number; // ✅ NEW: Budget estimate
  createdAt: string;
  completedAt?: string;
  productName?: string; // ✅ NEW: For display
  productCategory?: string; // ✅ NEW: For filtering
  timeline?: { // ✅ NEW: Timeline info
    totalWeeks: number;
    startDate: string;
    endDate: string;
  };
}

export interface ListCampaignsResponse {
  success: boolean;
  data: {
    campaigns: CampaignSummary[];
    total: number;
  };
}

// ============================================================================
// UTILITY FUNCTIONS - Hydration/Dehydration
// ============================================================================

/**
 * ✅ Hydrate campaign data: Convert asset IDs to full objects
 * Use this when:
 * - Receiving data from Gemini
 * - Loading from backend/KV store
 * - Before passing to UI components
 */
export function hydrateCampaignData(
  raw: GeminiCampaignAnalysisResponse
): HydratedCampaignAnalysis {
  return {
    ...raw,
    weeks: raw.weeks.map((week) => ({
      ...week,
      assets: (week.assets as string[])
        .map((assetId: string) => raw.allAssets.find((a) => a.id === assetId))
        .filter((asset): asset is CampaignAsset => asset !== undefined),
    })) as HydratedCampaignWeek[],
  };
}

/**
 * ✅ Dehydrate campaign data: Convert asset objects to IDs
 * Use this when:
 * - Saving to backend/KV store
 * - Reducing payload size
 * - Maintaining single source of truth (allAssets)
 */
export function dehydrateCampaignData(
  hydrated: HydratedCampaignAnalysis
): GeminiCampaignAnalysisResponse {
  return {
    ...hydrated,
    weeks: hydrated.weeks.map((week) => ({
      ...week,
      assets: week.assets.map((a) => a.id),
    })) as CampaignWeek[],
  };
}