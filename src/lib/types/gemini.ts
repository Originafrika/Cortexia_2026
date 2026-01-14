/**
 * COCONUT V14 - GEMINI 2.5 FLASH TYPES
 * Complete TypeScript types for Gemini integration via Replicate
 */

// ============================================
// GEMINI REQUEST TYPES
// ============================================

export interface GeminiAnalysisRequest {
  description: string;           // User intent (50-5000 chars)
  references: {
    images: ReferenceImage[];    // 0-10 images (7MB max each)
    videos: ReferenceVideo[];    // 0-10 videos (45 min max each)
  };
  format: ImageFormat;           // ✅ NOTE: Called "format" in request but becomes "ratio" in response for consistency
  resolution: '1K' | '2K';
  targetUsage: TargetUsage;
  userId: string;
  projectId: string;
}

export interface ReferenceImage {
  id: string;
  url: string;                   // Supabase Storage URL
  type: string;                  // MIME type
  description?: string;          // Optional context
  filename: string;
}

export interface ReferenceVideo {
  id: string;
  url: string;                   // Supabase Storage URL
  type: string;                  // MIME type
  description?: string;          // Optional context
  filename: string;
  duration?: number;             // Duration in seconds
}

export type ImageFormat = '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | '3:2' | '2:3';

export type TargetUsage = 'print' | 'social' | 'web' | 'presentation' | 'advertising' | 'packaging';

// ============================================
// GEMINI RESPONSE TYPES (CocoBoard Structure)
// ============================================

export interface GeminiAnalysisResponse {
  projectTitle: string;
  concept: CreativeConcept;
  referenceAnalysis: ReferenceAnalysis;
  composition: CompositionPlan;
  colorPalette: ColorPalette;
  assetsRequired: AssetsRequired;
  finalPrompt: FluxPromptJSON;
  technicalSpecs: TechnicalSpecs;
  estimatedCost: EstimatedCost;
  recommendations: Recommendations;
  creativityAnalysis: CreativityAnalysis; // ✅ NEW: Mandatory creativity validation
}

export interface CreativeConcept {
  direction: string;             // e.g., "Luxe minimaliste contemporain"
  keyMessage: string;            // e.g., "L'élégance absolue dans sa forme la plus pure"
  mood: string;                  // e.g., "Sophistiqué, mystérieux, premium"
}

export interface ReferenceAnalysis {
  availableAssets: AvailableAsset[];
  detectedStyle: DetectedStyle;
}

export interface AvailableAsset {
  id: string;                    // Reference to user-ref-1, user-ref-2, etc.
  type: AssetType;
  description: string;
  usage: string;                 // How it will be used
  notes: string;                 // Additional insights
}

export type AssetType = 
  | 'product'
  | 'logo'
  | 'branding'
  | 'background'
  | 'mood-image'
  | 'mood-video'
  | 'texture'
  | 'lighting-reference'
  | 'person'
  | 'object';

export interface DetectedStyle {
  aesthetic: string;             // e.g., "Luxe contemporain minimaliste"
  colorPalette: string[];        // HEX codes detected from references
  lighting: string;              // e.g., "Soft diffused avec highlights subtils"
  materials: string;             // e.g., "Verre, marbre, velours"
}

export interface CompositionPlan {
  ratio: ImageFormat;
  resolution: '1K' | '2K';
  zones: CompositionZone[];
}

export interface CompositionZone {
  name: string;                  // e.g., "Zone principale produit"
  position: string;              // e.g., "Centre, 60% hauteur"
  description: string;           // What goes in this zone
}

export interface ColorPalette {
  primary: string[];             // HEX codes
  accent: string[];              // HEX codes
  background: string[];          // HEX codes
  text: string[];                // HEX codes
  rationale: string;             // Why these colors
}

export interface AssetsRequired {
  available: AvailableAsset[];
  missing: MissingAsset[];
}

export interface MissingAsset {
  id: string;
  type: AssetType;
  description: string;
  canBeGenerated: boolean;
  requiredAction: 'generate' | 'request-from-user' | 'include-in-final-prompt';
  promptFlux?: FluxPromptJSON;   // If can be generated
  requestMessage?: string;        // If must be requested from user
}

// ============================================
// FLUX PROMPT JSON TYPES
// ============================================

export interface FluxPromptJSON {
  scene: string;                 // Overall scene description
  subjects: FluxSubject[];       // All subjects in the image
  style: string;                 // Overall style
  color_palette: string[];       // HEX codes
  lighting: string;              // Lighting description
  background: string;            // Background description
  composition: string;           // Composition rules
  mood: string;                  // Overall mood
  camera: CameraSettings;
}

export interface FluxSubject {
  description: string;           // Subject description (with position & colors integrated)
  position?: string;             // ✅ FIX 7B: OPTIONAL - should be integrated in description
  style?: string;                // Specific style for this subject
  color?: string;                // Specific color (HEX)
  references?: string[];         // Reference IDs to use
  userInputRequired?: boolean;   // ✅ For product specs that need user input
  suggestions?: string[];        // ✅ Suggestions for user input
  prompt?: string;               // ✅ Prompt for user input modal
}

export interface CameraSettings {
  angle: string;                 // e.g., "straight-on eye level"
  lens: string;                  // e.g., "85mm equivalent"
  depth_of_field: string;        // e.g., "f/5.6 for sharp focus"
}

// ============================================
// TECHNICAL SPECS
// ============================================

export interface TechnicalSpecs {
  model: 'flux-2-pro' | 'flux-2-dev';
  mode: 'text-to-image' | 'image-to-image';
  ratio: ImageFormat;
  resolution: '1K' | '2K';
  references: string[];          // IDs of references to use
}

export interface EstimatedCost {
  analysis: number;              // Gemini analysis cost (100 credits)
  backgroundGeneration: number;  // Cost for generating backgrounds
  assetGeneration: number;       // Cost for generating assets
  finalGeneration: number;       // Final image generation cost
  total: number;                 // Total cost
}

export interface Recommendations {
  generationApproach: 'single-pass' | 'multi-pass';
  rationale: string;             // Why this approach
  alternatives?: string;         // Alternative approaches
}

// ✅ NEW: Creativity Analysis Interface
export interface CreativityAnalysis {
  overallScore: number; // 0-10
  breakdown: {
    conceptualDepth: number; // 0-10
    compositionAdvanced: number; // 0-10
    unexpectedElements: number; // 0-10
    metaphorUsage: number; // 0-10
    visualSurprise: number; // 0-10
  };
  techniquesApplied: string[]; // List of techniques used
  unexpectedElements: string[]; // List of surprising elements
  metaphor: string; // Main metaphor/concept
  thumbStoppingProbability: number; // 0-10
  creativityJustification: string; // Why this is creative
  improvementSuggestions?: string[]; // Optional: how to be more creative
}

// ============================================
// REPLICATE API TYPES
// ============================================

export interface ReplicateGeminiRequest {
  prompt: string;                // System + user prompt
  images?: string[];             // Image URLs (base64 or URLs)
  videos?: string[];             // Video URLs (base64 or URLs)
  system_instruction: string;    // System instruction
  max_output_tokens: number;     // Max 65535
  thinking_budget: number;       // Reasoning budget (e.g., 24576)
  dynamic_thinking: boolean;     // Adjust thinking based on complexity
  output_schema?: object;        // JSON schema for structured output
  temperature?: number;          // 0.0-1.0
  top_p?: number;                // 0.0-1.0
  top_k?: number;                // Integer
}

export interface ReplicateGeminiResponse {
  output: string | object;       // JSON if output_schema provided
  metrics?: {
    thinking_tokens_used?: number;
    output_tokens_used?: number;
    total_tokens_used?: number;
  };
}

// ============================================
// GEMINI SERVICE ERROR TYPES
// ============================================

export class GeminiAnalysisError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GeminiAnalysisError';
  }
}

export type GeminiErrorCode =
  | 'INVALID_INPUT'
  | 'TOO_MANY_REFERENCES'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FORMAT'
  | 'ANALYSIS_FAILED'
  | 'INSUFFICIENT_CREDITS'
  | 'REPLICATE_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT';

// ============================================
// HELPER TYPES
// ============================================

export interface FileUpload {
  file: File;
  preview?: string;              // Data URL for preview
  description?: string;
}

export interface UploadedReference {
  id: string;
  storageUrl: string;            // Supabase Storage URL
  publicUrl: string;             // Public accessible URL
  type: 'image' | 'video';
  filename: string;
  size: number;
  description?: string;
}

// ============================================
// VALIDATION CONSTRAINTS
// ============================================

export const GEMINI_CONSTRAINTS = {
  description: {
    minLength: 50,
    maxLength: 5000,
  },
  references: {
    images: {
      max: 10,
      maxSizeMB: 7,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
    videos: {
      max: 10,
      maxDurationMinutes: 45,
      allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    },
  },
  totalReferences: {
    max: 20, // 10 images + 10 videos
  },
} as const;