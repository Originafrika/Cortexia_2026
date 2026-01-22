// ============================================
// EXPORTS
// ============================================

export type {
  // Projects
  ProjectIntent,
  ProjectStatus,
  Project,
  CreateProjectPayload,
  
  // Credits
  CreditTransaction,
  SpendingSummary,
  
  // Analysis
  AnalysisResult,
  AnalyzeIntentPayload,
  
  // Assets
  AssetType,
  AssetDetection,
  FluxPrompt,
  AssetsRequired,
  
  // Visual
  ColorPalette,
  Composition,
  CompositionZone,
  
  // CocoBoard (Phase 2 Day 4 - NEW)
  CocoBoard,
  CocoBoardAsset,
  CocoBoardZone,
  CocoBoardConcept,
  CocoBoardColorPalette,
  CocoBoardPrompt,
  EditableField,
  
  // Payloads
  SaveCocoBoardPayload,
  GeneratePayload,
  
  // Flux (Phase 3 - NEW)
  FluxTaskStatus,
  TechnicalSpecs,
  
  // API
  ApiResponse
};

// ============================================
// INTENT & INPUT
// ============================================

export interface ProjectIntent {
  description: string;              // 50-5000 caractères
  references: {
    images: File[];                 // 0-10 images (7MB max each)
    videos: File[];                 // 0-10 vidéos (45 min max each)
    descriptions: string[];         // Description optionnelle par référence
  };
  format: ImageFormat;
  resolution: Resolution;
  targetUsage: TargetUsage;
}

export type ImageFormat = 
  | '1:1'      // Square
  | '4:3'      // Landscape
  | '3:4'      // Portrait
  | '16:9'     // Widescreen
  | '9:16'     // Story/Mobile
  | '3:2'      // Classic
  | '2:3';     // Classic Portrait

export type Resolution = '1K' | '2K';

export type TargetUsage = 
  | 'print' 
  | 'social' 
  | 'web' 
  | 'presentation'
  | 'outdoor'    // Affichage extérieur
  | 'packaging';  // Emballage produit

// ============================================
// REFERENCE
// ============================================

export interface Reference {
  id: string;
  type: 'image' | 'video';
  url: string;                      // Supabase Storage URL
  description?: string;
  sourceType: 'user-upload' | 'generated';
  uploadedAt: Date;
}

export interface ReferenceUrls {
  images: string[];
  videos: string[];
  descriptions: string[];
}

// ============================================
// PROJECT
// ============================================

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  intent?: ProjectIntent;
  analysis?: AnalysisResult;
  cocoboard?: CocoBoard;
  results: GenerationResult[];
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type ProjectStatus =
  | 'draft'        // Intent en cours de rédaction
  | 'intent'       // Intent créé, prêt pour analyse
  | 'analyzing'    // En analyse Gemini
  | 'analyzed'     // Analyse complète
  | 'board-ready'  // CocoBoard validé
  | 'generating'   // En génération
  | 'completed'    // Terminé avec succès
  | 'failed';      // Échec

// ============================================
// GEMINI ANALYSIS OUTPUT
// ============================================

export interface AnalysisResult {
  projectTitle: string;
  concept: Concept;
  referenceAnalysis: ReferenceAnalysis;
  composition: Composition;
  colorPalette: ColorPalette;
  assetsRequired: AssetsRequired;
  finalPrompt: FluxPrompt;
  technicalSpecs: TechnicalSpecs;
  estimatedCost: Cost;
  recommendations: Recommendations;
}

export interface Concept {
  direction: string;      // "Minimaliste premium..."
  keyMessage: string;     // "L'élégance absolue..."
  mood: string;           // "Sophistiqué, mystérieux..."
}

export interface ReferenceAnalysis {
  availableAssets: AvailableAsset[];
  detectedStyle: {
    aesthetic: string;
    colorPalette: string[];
    lighting: string;
    materials: string[];
  };
}

export interface AvailableAsset {
  id: string;
  type: AssetType;
  description: string;
  usage: string;
  notes: string;
}

export interface Composition {
  ratio: string;
  resolution: string;
  zones: CompositionZone[];
}

export interface CompositionZone {
  name: string;
  position: string;       // "60% supérieur", "Tiers inférieur"
  description: string;
}

export interface ColorPalette {
  primary: string[];      // ["#000000", "#1A1A1A"]
  accent: string[];       // ["#E8B298", "#D4A574"]
  background: string[];   // ["#F5F5F0", "#FFFFFF"]
  text: string[];         // ["#000000", "#666666"]
  rationale: string;
}

export interface AssetsRequired {
  available: Asset[];
  missing: MissingAsset[];
}

export interface Asset {
  id: string;
  type: AssetType;
  description: string;
  status: 'ready';
}

export interface MissingAsset {
  id: string;
  type: AssetType;
  description: string;
  canBeGenerated: boolean;
  requiredAction: 'generate' | 'request-from-user' | 'include-in-final-prompt';
  promptFlux?: FluxPrompt;
  requestMessage?: string;
}

export type AssetType = 
  | 'background'
  | 'product'
  | 'character'
  | 'model'
  | 'element'
  | 'decoration'
  | 'text-overlay'
  | 'logo'
  | 'lighting-effect';

// ============================================
// FLUX PROMPT
// ============================================

export interface FluxPrompt {
  scene: string;
  subjects: FluxSubject[];
  style: string;
  color_palette: string[];
  lighting: string;
  background?: string;
  composition: string;
  mood: string;
  camera?: CameraSpec;
}

export interface FluxSubject {
  type?: string;
  description: string;
  position: string;
  color_palette?: string[];
  style?: string;
  references?: string[];  // IDs des références à utiliser
}

export interface CameraSpec {
  angle: string;
  lens: string;
  depth_of_field: string;
}

// ============================================
// TECHNICAL SPECS
// ============================================

export interface TechnicalSpecs {
  model: 'flux-2-pro';
  mode: 'text-to-image' | 'image-to-image';
  ratio: string;
  resolution: '1K' | '2K';
  references: string[];  // URLs des références
}

// ============================================
// COST
// ============================================

export interface Cost {
  analysis: number;           // 100 crédits
  assetsGeneration?: number;  // Variable si multi-pass
  finalGeneration: number;    // 5 (1K) ou 15 (2K)
  total: number;
}

export interface Recommendations {
  generationApproach: 'single-pass' | 'multi-pass';
  rationale: string;
  alternatives?: string;
}

// ============================================
// COCOBOARD
// ============================================

export interface CocoBoard {
  id: string;
  projectId: string;
  userId: string;
  analysis: AnalysisResult;
  finalPrompt: FluxPrompt;      // Peut être édité
  references: Reference[];
  specs: TechnicalSpecs;
  cost: Cost;
  status: CocoboardStatus;
  useBrandGuidelines?: boolean; // ✅ NEW: Override user's global setting for this project
  createdAt: Date;
  updatedAt: Date;
}

export type CocoboardStatus = 
  | 'draft'
  | 'validated'
  | 'generating'
  | 'completed'
  | 'failed';

export interface CocoBoardAsset {
  assetId: string;
  imageUrl: string;
  taskId: string;
  generatedAt: Date;
}

export interface CocoBoardZone {
  name: string;
  position: string;       // "60% supérieur", "Tiers inférieur"
  description: string;
}

export interface CocoBoardConcept {
  direction: string;      // "Minimaliste premium..."
  keyMessage: string;     // "L'élégance absolue..."
  mood: string;           // "Sophistiqué, mystérieux..."
}

export interface CocoBoardColorPalette {
  primary: string[];      // ["#000000", "#1A1A1A"]
  accent: string[];       // ["#E8B298", "#D4A574"]
  background: string[];   // ["#F5F5F0", "#FFFFFF"]
  text: string[];         // ["#000000", "#666666"]
  rationale: string;
}

export interface CocoBoardPrompt {
  scene: string;
  subjects: FluxSubject[];
  style: string;
  color_palette: string[];
  lighting: string;
  background?: string;
  composition: string;
  mood: string;
  camera?: CameraSpec;
}

export type EditableField = 'finalPrompt' | 'references' | 'specs' | 'cost';

// ============================================
// GENERATION
// ============================================

export interface GenerationJob {
  id: string;
  userId: string;
  projectId: string;
  cocoboardId: string;
  mode?: 'single-pass' | 'multi-pass';
  status: GenerationStatus;
  progress: number;
  currentAsset?: string;
  currentTask?: string;
  totalAssets?: number;
  assets: GeneratedAsset[];
  finalImage?: string;
  error?: string;
  logs: string[];
  estimatedCost?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type GenerationStatus =
  | 'initializing'
  | 'generating-assets'
  | 'generating-final'
  | 'composing'
  | 'post-processing'
  | 'saving'
  | 'completed'
  | 'error';

export interface GeneratedAsset {
  assetId: string;
  imageUrl: string;
  taskId: string;
  generatedAt: Date;
}

export interface GenerationResult {
  id: string;
  projectId: string;
  taskId: string;
  imageUrl?: string;
  specs: {
    resolution: string;
    ratio: string;
    format: string;
    fileSize?: number;
  };
  cost: number;
  generationTime?: number;  // milliseconds
  status: 'pending' | 'processing' | 'success' | 'failed';
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

// ============================================
// CREDITS
// ============================================

export interface CreditBalance {
  userId: string;
  balance: number;
  lastUpdated: Date;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'debit' | 'credit';
  reason: string;
  projectId?: string;
  timestamp: Date;
}

export interface SpendingSummary {
  userId: string;
  totalSpent: number;
  transactions: CreditTransaction[];
  lastUpdated: Date;
}

// ============================================
// ENTERPRISE ACCOUNT
// ============================================

export interface EnterpriseAccount {
  userId: string;
  companyName: string;
  accountType: 'enterprise';
  credits: number;
  projects: string[];          // Project IDs
  settings: AccountSettings;
  createdAt: Date;
}

export interface AccountSettings {
  defaultResolution: '1K' | '2K';
  autoSaveProjects: boolean;
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
  };
}

// ============================================
// API PAYLOADS
// ============================================

export interface CreateProjectPayload {
  userId: string;
  title: string;
  description: string;
  intent: ProjectIntent;
}

export interface AnalyzeIntentPayload {
  userId: string;
  projectId: string;
  description: string;
  references: ReferenceUrls;
  format: ImageFormat;
  resolution: Resolution;
  targetUsage: TargetUsage;
}

export interface SaveCocoBoardPayload {
  userId: string;
  projectId: string;
  cocoboard: CocoBoard;
  status: CocoboardStatus;
}

export interface GeneratePayload {
  userId: string;
  projectId: string;
  cocoboardId: string;
}

// ============================================
// FLUX 2 PRO API TYPES
// ============================================

export interface FluxCreateTaskRequest {
  model: 'flux-2/pro-text-to-image' | 'flux-2/pro-image-to-image';
  input: {
    prompt: string;              // Peut être JSON stringified
    input_urls?: string[];       // Pour image-to-image (1-8 images)
    aspect_ratio: string;        // "1:1", "3:4", etc.
    resolution: '1K' | '2K';
  };
  callBackUrl?: string;
}

export interface FluxCreateTaskResponse {
  taskId: string;
}

export interface FluxTaskStatus {
  taskId: string;
  state: 'waiting' | 'success' | 'fail';
  resultJson?: string;  // {"resultUrls": ["https://..."]}
  failCode?: string;
  failMsg?: string;
  costTime?: number;
  completeTime?: number;
}

// Phase 3 - Internal Flux Task Status (used in flux service)
export interface FluxTaskStatus {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  imageUrls: string[];
  error?: string;
}

// ============================================
// GEMINI API TYPES
// ============================================

export interface GeminiPredictionRequest {
  version: string;
  input: {
    prompt: string;
    system_instruction: string;
    images?: string[];
    videos?: string[];
    max_output_tokens: number;
    thinking_budget: number;
    dynamic_thinking?: boolean;
    temperature?: number;
    top_p?: number;
    output_schema?: object;
  };
}

export interface GeminiPredictionResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  output?: string;
  error?: string;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: number;
  message: string;
  details?: string;
}

// ============================================
// HELPER TYPES
// ============================================

export type Awaitable<T> = T | Promise<T>;

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;