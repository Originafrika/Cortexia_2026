/**
 * 🧪 COCONUT V14 - TEST MOCKS & HELPERS
 * 
 * Comprehensive mocks for testing all Coconut V14 services
 * 
 * @module mocks
 * @version 14.0.0-phase5-jour1
 */

import type { 
  CoconutIntent, 
  CocoBoard, 
  FluxPrompt,
  GenerationResult 
} from "../../types.tsx";

// ============================================
// INTENT MOCKS
// ============================================

export const createMockIntent = (overrides: Partial<CoconutIntent> = {}): CoconutIntent => ({
  description: 'Affiche publicitaire minimaliste pour café bio, ambiance cozy et chaleureuse, couleurs terre et bois',
  references: {
    images: [],
    videos: [],
    descriptions: []
  },
  format: '3:4',
  resolution: '1K',
  targetUsage: 'print',
  ...overrides
});

export const createMockIntentWithReferences = (): CoconutIntent => ({
  description: 'Affiche mode luxury avec mannequin',
  references: {
    images: [
      'https://images.unsplash.com/photo-1',
      'https://images.unsplash.com/photo-2'
    ],
    videos: [],
    descriptions: ['Model photo', 'Fashion shoot']
  },
  format: '3:4',
  resolution: '2K',
  targetUsage: 'social'
});

export const createMockIntentMultimodal = (): CoconutIntent => ({
  description: 'Campaign visuelle pour nouveau parfum luxury',
  references: {
    images: Array(10).fill(0).map((_, i) => 
      `https://images.unsplash.com/photo-perfume-${i}.jpg`
    ),
    videos: [],
    descriptions: Array(10).fill('Perfume bottle reference')
  },
  format: '4:3',
  resolution: '2K',
  targetUsage: 'print'
});

// ============================================
// COCOBOARD MOCKS
// ============================================

export const createMockCocoBoard = (overrides: Partial<CocoBoard> = {}): CocoBoard => ({
  projectTitle: 'Café Bio Cozy - Affiche Minimaliste',
  concept: {
    direction: 'minimalist photography with warm, inviting atmosphere',
    targetAudience: 'Health-conscious coffee lovers, 25-40 years old',
    visualTone: 'natural, organic, authentic',
    keyMessage: 'Pure organic coffee in a welcoming space'
  },
  composition: {
    layout: 'centered product with environment context',
    focalPoint: 'coffee cup with steam',
    perspective: 'slightly elevated angle',
    depth: 'shallow depth of field'
  },
  colorPalette: {
    primary: ['#8B4513', '#D2691E', '#F4E4C1'],
    secondary: ['#4A4A4A', '#FFFFFF'],
    accent: ['#CD853F'],
    mood: 'warm, earthy, natural'
  },
  typography: {
    primaryFont: 'Serif - elegant and readable',
    secondaryFont: 'Sans-serif - clean for body text',
    hierarchy: 'Large title, medium subtitle, small body',
    placement: 'Top or bottom third'
  },
  lighting: {
    source: 'natural window light',
    direction: 'side lighting from left',
    quality: 'soft, diffused',
    temperature: 'warm (3500K)'
  },
  assetsRequired: {
    provided: [],
    missing: [],
    toGenerate: 0
  },
  referenceAnalysis: {
    availableAssets: [],
    dominantStyles: [],
    commonElements: [],
    qualityNotes: []
  },
  finalPrompt: {
    scene: 'Cozy coffee shop interior with wooden tables and warm lighting',
    subjects: [
      {
        type: 'product',
        description: 'Ceramic coffee cup with steam rising',
        position: 'center-foreground',
        importance: 'primary'
      }
    ],
    environment: 'Rustic cafe with natural wood textures, plants, soft window light',
    style: 'Professional product photography, minimalist aesthetic, warm color grading',
    lighting: 'Natural window light from left, soft shadows, golden hour quality',
    color_palette: ['warm brown', 'cream', 'natural wood tones', 'soft white'],
    mood: 'inviting, peaceful, organic',
    technical_specs: {
      camera: 'Medium format digital, 50mm equivalent',
      aperture: 'f/2.8 for shallow depth',
      quality: 'Commercial photography standard'
    },
    quality: {
      detail_level: 'ultra-high',
      realism: 'photorealistic',
      resolution: '1K',
      style_strength: 0.8
    }
  },
  estimatedCost: {
    analysis: 5,
    assetGeneration: 0,
    finalGeneration: 100,
    total: 105,
    breakdown: [
      { step: 'Gemini Analysis', cost: 5 },
      { step: 'Flux 2 Pro Generation (1K)', cost: 100 }
    ]
  },
  status: 'draft',
  ...overrides
});

export const createMockCocoBoardMultiPass = (): CocoBoard => {
  const base = createMockCocoBoard();
  return {
    ...base,
    assetsRequired: {
      provided: [],
      missing: [
        {
          type: 'model',
          description: 'Female model for fashion shoot',
          context: 'Professional headshot'
        }
      ],
      toGenerate: 1
    },
    estimatedCost: {
      analysis: 5,
      assetGeneration: 100,
      finalGeneration: 100,
      total: 205,
      breakdown: [
        { step: 'Gemini Analysis', cost: 5 },
        { step: 'Asset Generation (Model)', cost: 100 },
        { step: 'Flux 2 Pro Final Generation (1K)', cost: 100 }
      ]
    }
  };
};

// ============================================
// FLUX PROMPT MOCKS
// ============================================

export const createMockFluxPrompt = (): FluxPrompt => ({
  scene: 'Coffee shop interior with natural lighting',
  subjects: [
    {
      type: 'product',
      description: 'Steaming coffee cup',
      position: 'center',
      importance: 'primary'
    }
  ],
  environment: 'Cozy cafe with wood textures',
  style: 'Professional product photography',
  lighting: 'Natural window light, soft shadows',
  color_palette: ['warm brown', 'cream', 'wood tones'],
  mood: 'inviting, peaceful',
  technical_specs: {
    camera: 'Medium format',
    aperture: 'f/2.8',
    quality: 'Commercial standard'
  },
  quality: {
    detail_level: 'ultra-high',
    realism: 'photorealistic',
    resolution: '1K',
    style_strength: 0.8
  }
});

// ============================================
// API RESPONSE MOCKS
// ============================================

export const mockGeminiAnalysisResponse = {
  projectTitle: 'Café Bio Cozy - Affiche Minimaliste',
  concept: {
    direction: 'minimalist photography',
    targetAudience: 'Coffee lovers 25-40',
    visualTone: 'natural, organic',
    keyMessage: 'Pure organic coffee'
  },
  composition: {
    layout: 'centered',
    focalPoint: 'coffee cup',
    perspective: 'elevated angle',
    depth: 'shallow'
  },
  colorPalette: {
    primary: ['#8B4513', '#D2691E'],
    secondary: ['#4A4A4A'],
    accent: ['#CD853F'],
    mood: 'warm, earthy'
  },
  finalPrompt: createMockFluxPrompt(),
  estimatedCost: {
    total: 105,
    breakdown: [
      { step: 'Analysis', cost: 5 },
      { step: 'Generation', cost: 100 }
    ]
  }
};

export const mockFluxGenerationResponse = {
  id: 'flux-gen-123456',
  status: 'success',
  output: ['https://replicate.delivery/yhqm/test-image.jpg'],
  metrics: {
    predict_time: 12.5
  }
};

export const mockFluxFailureResponse = {
  id: 'flux-gen-failed',
  status: 'failed',
  error: 'Generation timeout',
  logs: 'API timeout after 60s'
};

// ============================================
// GENERATION RESULT MOCKS
// ============================================

export const createMockGenerationResult = (overrides: Partial<GenerationResult> = {}): GenerationResult => ({
  status: 'success',
  imageUrl: 'https://replicate.delivery/yhqm/test-result.jpg',
  cost: 105,
  duration: 12500,
  timestamp: new Date().toISOString(),
  ...overrides
});

export const createMockMultiPassResult = (): GenerationResult => ({
  status: 'success',
  imageUrl: 'https://replicate.delivery/yhqm/final-result.jpg',
  cost: 205,
  duration: 25000,
  timestamp: new Date().toISOString(),
  intermediateAssets: [
    {
      type: 'model',
      url: 'https://replicate.delivery/yhqm/model-asset.jpg',
      cost: 100
    }
  ]
});

// ============================================
// CREDIT MOCKS
// ============================================

export const createMockCreditBalance = (balance: number = 1000) => ({
  userId: 'test-user-' + Date.now(),
  balance,
  lastUpdated: new Date().toISOString()
});

export const createMockTransaction = (amount: number, reason: string) => ({
  id: 'tx-' + Date.now(),
  amount,
  reason,
  timestamp: new Date().toISOString(),
  balanceAfter: 1000 + amount
});

// ============================================
// PROJECT MOCKS
// ============================================

export const createMockProject = (overrides: any = {}) => ({
  id: 'proj-' + Date.now(),
  userId: 'test-user-' + Date.now(),
  title: 'Test Project',
  description: 'Test project description',
  intent: createMockIntent(),
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

// ============================================
// ERROR MOCKS
// ============================================

export const mockInsufficientCreditsError = {
  code: 'INSUFFICIENT_CREDITS',
  message: 'Insufficient credits. Required: 105, Available: 50',
  required: 105,
  available: 50
};

export const mockAPITimeoutError = {
  code: 'API_TIMEOUT',
  message: 'Flux API timeout after 60s',
  duration: 60000
};

export const mockInvalidInputError = {
  code: 'INVALID_INPUT',
  message: 'Description must be at least 50 characters',
  field: 'description',
  minLength: 50
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create multiple test users
 */
export const createTestUsers = (count: number) => {
  return Array(count).fill(0).map((_, i) => ({
    id: `test-user-${Date.now()}-${i}`,
    email: `test${i}@example.com`,
    credits: 1000
  }));
};

/**
 * Create mock image URLs
 */
export const createMockImageURLs = (count: number) => {
  return Array(count).fill(0).map((_, i) => 
    `https://images.unsplash.com/photo-test-${i}.jpg`
  );
};

/**
 * Wait helper for async tests
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate unique test ID
 */
export const generateTestId = () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate CocoBoard structure
 */
export const validateCocoBoardStructure = (cocoboard: any): boolean => {
  return !!(
    cocoboard.projectTitle &&
    cocoboard.concept &&
    cocoboard.composition &&
    cocoboard.colorPalette &&
    cocoboard.finalPrompt &&
    cocoboard.estimatedCost
  );
};

/**
 * Validate Flux Prompt structure
 */
export const validateFluxPromptStructure = (prompt: any): boolean => {
  return !!(
    prompt.scene &&
    Array.isArray(prompt.subjects) &&
    prompt.subjects.length > 0 &&
    prompt.style &&
    Array.isArray(prompt.color_palette) &&
    prompt.quality
  );
};

/**
 * Validate Generation Result
 */
export const validateGenerationResult = (result: any): boolean => {
  return !!(
    result.status &&
    (result.status === 'success' ? result.imageUrl : true) &&
    typeof result.cost === 'number' &&
    result.cost > 0
  );
};

export default {
  // Intent mocks
  createMockIntent,
  createMockIntentWithReferences,
  createMockIntentMultimodal,
  
  // CocoBoard mocks
  createMockCocoBoard,
  createMockCocoBoardMultiPass,
  
  // Flux mocks
  createMockFluxPrompt,
  mockGeminiAnalysisResponse,
  mockFluxGenerationResponse,
  mockFluxFailureResponse,
  
  // Result mocks
  createMockGenerationResult,
  createMockMultiPassResult,
  
  // Credit mocks
  createMockCreditBalance,
  createMockTransaction,
  
  // Project mocks
  createMockProject,
  
  // Error mocks
  mockInsufficientCreditsError,
  mockAPITimeoutError,
  mockInvalidInputError,
  
  // Helpers
  createTestUsers,
  createMockImageURLs,
  wait,
  generateTestId,
  
  // Validators
  validateCocoBoardStructure,
  validateFluxPromptStructure,
  validateGenerationResult
};
