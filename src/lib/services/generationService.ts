/**
 * Service principal de génération d'images
 * Orchestre l'enhancement, la génération et la gestion des crédits
 */

import type {
  GenerationInput,
  GenerationRequest,
  GenerationResult,
  GenerationProgress,
  GenerationError,
  ModelName,
  ErrorSuggestion
} from '../types/studio';

import { enhancePrompt, needsEnhancement } from './enhancerService';
import { deductCredits, refundCredits, getBalance } from './creditManager';
import { MODELS } from './modelSelector';

// Import des providers existants
import { generatePollinationsImage } from '../providers/pollinationsProvider';
import { generateTogetherImage } from '../providers/togetherProvider';
import { generateReplicateImage } from '../providers/replicateProvider';

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

/**
 * Génère une image avec le modèle spécifié
 */
export async function generate(
  request: GenerationRequest,
  onProgress?: (progress: GenerationProgress) => void
): Promise<GenerationResult> {
  const startTime = Date.now();
  const { input, model, enhancePrompt: shouldEnhance, userId } = request;

  try {
    // Phase 1: Vérifier les crédits
    onProgress?.({
      status: 'analyzing',
      progress: 0,
      message: 'Checking credits...',
      phase: 'Validation'
    });

    const balance = await getBalance(userId);
    const modelInfo = MODELS[model];

    if (balance.total < modelInfo.cost) {
      throw createError(
        'INSUFFICIENT_CREDITS',
        `Insufficient credits. Need ${modelInfo.cost}, have ${balance.total}`,
        modelInfo.provider,
        [
          {
            action: 'buy_credits',
            label: 'Buy Credits',
            description: `Purchase ${modelInfo.cost} credits to continue`,
            cost: modelInfo.cost
          }
        ]
      );
    }

    // Phase 2: Enhancement du prompt (si nécessaire)
    let finalPrompt = input.prompt;
    let enhancedPromptResult: { enhanced: string; original: string; success: boolean } | null = null;

    if (shouldEnhance && needsEnhancement(model)) {
      onProgress?.({
        status: 'enhancing-prompt',
        progress: 10,
        message: 'Enhancing your prompt with AI...',
        phase: 'Enhancement',
        estimatedTimeRemaining: 3
      });

      const imageCount = input.images?.length || 0;
      const generationType = imageCount === 0 ? 'text-to-image' :
                            imageCount === 1 ? 'image-to-image' :
                            'multi-image';

      enhancedPromptResult = await enhancePrompt(input.prompt, {
        imageCount,
        generationType
      });

      if (enhancedPromptResult.success) {
        finalPrompt = enhancedPromptResult.enhanced;
        console.log('Prompt enhanced:', {
          original: input.prompt,
          enhanced: finalPrompt
        });
      }
    }

    // Phase 3: Déduire les crédits
    onProgress?.({
      status: 'analyzing',
      progress: 20,
      message: 'Processing payment...',
      phase: 'Credits'
    });

    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const deductResult = await deductCredits(userId, modelInfo.cost, model, generationId);

    if (!deductResult.success) {
      throw createError(
        'INSUFFICIENT_CREDITS',
        deductResult.error || 'Failed to deduct credits',
        modelInfo.provider
      );
    }

    const creditType = deductResult.balance.paid >= modelInfo.cost ? 'paid' : 'free';

    // Phase 4: Génération de l'image
    onProgress?.({
      status: 'generating',
      progress: 30,
      message: `Generating with ${model}...`,
      phase: 'Generation',
      estimatedTimeRemaining: getEstimatedTime(model)
    });

    let imageUrl: string;

    try {
      imageUrl = await generateWithProvider(
        model,
        finalPrompt,
        input,
        (providerProgress) => {
          onProgress?.({
            status: 'generating',
            progress: 30 + (providerProgress * 0.6), // 30% -> 90%
            message: `Generating with ${model}...`,
            phase: 'Generation',
            estimatedTimeRemaining: Math.max(0, getEstimatedTime(model) * (1 - providerProgress))
          });
        }
      );
    } catch (error) {
      // Rembourser les crédits en cas d'erreur de génération
      await refundCredits(
        userId,
        modelInfo.cost,
        creditType,
        `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }

    // Phase 5: Finalisation
    onProgress?.({
      status: 'processing',
      progress: 95,
      message: 'Finalizing...',
      phase: 'Completion'
    });

    const duration = Date.now() - startTime;

    const result: GenerationResult = {
      id: generationId,
      input,
      model,
      provider: modelInfo.provider,
      originalPrompt: input.prompt,
      enhancedPrompt: enhancedPromptResult?.success ? finalPrompt : undefined,
      imageUrl,
      creditsUsed: modelInfo.cost,
      creditType,
      duration,
      status: 'success',
      metadata: {
        width: input.options?.width || 1024,
        height: input.options?.height || 1024,
        seed: input.options?.seed,
        timestamp: new Date(),
        userId
      }
    };

    onProgress?.({
      status: 'complete',
      progress: 100,
      message: 'Generation complete!',
      phase: 'Done'
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Si c'est déjà une GenerationError, la retourner telle quelle
    if (isGenerationError(error)) {
      return {
        id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        input,
        model,
        provider: MODELS[model].provider,
        originalPrompt: input.prompt,
        imageUrl: '',
        creditsUsed: 0,
        creditType: 'free',
        duration,
        status: 'error',
        error: {
          code: error.code,
          message: error.message,
          suggestion: error.suggestions[0]?.description
        },
        metadata: {
          width: 0,
          height: 0,
          timestamp: new Date(),
          userId
        }
      };
    }

    // Erreur générique
    const genError = createError(
      'UNKNOWN',
      error instanceof Error ? error.message : 'Unknown error occurred',
      MODELS[model].provider
    );

    return {
      id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      input,
      model,
      provider: MODELS[model].provider,
      originalPrompt: input.prompt,
      imageUrl: '',
      creditsUsed: 0,
      creditType: 'free',
      duration,
      status: 'error',
      error: {
        code: genError.code,
        message: genError.message,
        suggestion: genError.suggestions[0]?.description
      },
      metadata: {
        width: 0,
        height: 0,
        timestamp: new Date(),
        userId
      }
    };
  }
}

// ============================================================================
// PROVIDER ROUTING
// ============================================================================

/**
 * Route vers le bon provider selon le modèle
 */
async function generateWithProvider(
  model: ModelName,
  prompt: string,
  input: GenerationInput,
  onProgress?: (progress: number) => void
): Promise<string> {
  const modelInfo = MODELS[model];

  try {
    switch (modelInfo.provider) {
      case 'pollinations':
        return await generateWithPollinations(model, prompt, input, onProgress);

      case 'together':
        return await generateWithTogether(model, prompt, input, onProgress);

      case 'replicate':
        return await generateWithReplicate(model, prompt, input, onProgress);

      default:
        throw new Error(`Unknown provider: ${modelInfo.provider}`);
    }
  } catch (error) {
    // Gestion spécifique des erreurs Pollinations rate limit
    if (modelInfo.provider === 'pollinations' && isPollinationsRateLimit(error)) {
      throw createPollinationsRateLimitError();
    }

    throw error;
  }
}

/**
 * Génération avec Pollinations
 */
async function generateWithPollinations(
  model: ModelName,
  prompt: string,
  input: GenerationInput,
  onProgress?: (progress: number) => void
): Promise<string> {
  const imageCount = input.images?.length || 0;

  // Mapper vers les modèles Pollinations
  let pollinationsModel: string;
  
  if (model === 'seedream') {
    pollinationsModel = imageCount === 0 ? 'seedream' : 'seedream';
  } else if (model === 'kontext') {
    pollinationsModel = 'kontext';
  } else if (model === 'nanobanana') {
    pollinationsModel = 'nanobanana';
  } else {
    throw new Error(`Model ${model} not supported by Pollinations`);
  }

  // Utiliser le provider existant
  return await generatePollinationsImage({
    prompt,
    model: pollinationsModel,
    images: input.images?.map(img => img.url || img.preview),
    width: input.options?.width,
    height: input.options?.height,
    seed: input.options?.seed
  });
}

/**
 * Génération avec Together AI
 */
async function generateWithTogether(
  model: ModelName,
  prompt: string,
  input: GenerationInput,
  onProgress?: (progress: number) => void
): Promise<string> {
  if (model !== 'flux-schnell') {
    throw new Error(`Model ${model} not supported by Together AI`);
  }

  // Utiliser le provider existant
  return await generateTogetherImage({
    prompt,
    model: 'black-forest-labs/FLUX.1-schnell-Free',
    width: input.options?.width || 1024,
    height: input.options?.height || 1024,
    steps: input.options?.steps || 4,
    seed: input.options?.seed
  });
}

/**
 * Génération avec Replicate
 */
async function generateWithReplicate(
  model: ModelName,
  prompt: string,
  input: GenerationInput,
  onProgress?: (progress: number) => void
): Promise<string> {
  let replicateModel: string;

  if (model === 'flux-2-pro') {
    replicateModel = 'black-forest-labs/flux-pro';
  } else if (model === 'imagen-4') {
    replicateModel = 'google/imagen-4';
  } else {
    throw new Error(`Model ${model} not supported by Replicate`);
  }

  // Utiliser le provider existant
  return await generateReplicateImage({
    prompt,
    model: replicateModel,
    width: input.options?.width || 1024,
    height: input.options?.height || 1024
  });
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Crée une erreur de génération structurée
 */
function createError(
  code: GenerationError['code'],
  message: string,
  provider?: string,
  suggestions: ErrorSuggestion[] = []
): GenerationError {
  // Suggestions par défaut selon le type d'erreur
  if (suggestions.length === 0) {
    if (code === 'INSUFFICIENT_CREDITS') {
      suggestions = [
        {
          action: 'buy_credits',
          label: 'Buy Credits',
          description: 'Purchase credits to continue creating'
        }
      ];
    } else if (code === 'RATE_LIMIT') {
      suggestions = [
        {
          action: 'use_alternative_model',
          label: 'Use Alternative Model',
          description: 'Try a different model',
          model: 'flux-schnell',
          cost: 1
        },
        {
          action: 'wait_and_retry',
          label: 'Wait and Retry',
          description: 'Wait a few minutes and try again'
        }
      ];
    }
  }

  return {
    code,
    message,
    provider,
    suggestions,
    canRetry: code === 'API_ERROR' || code === 'RATE_LIMIT'
  };
}

/**
 * Crée une erreur spécifique pour Pollinations rate limit
 */
function createPollinationsRateLimitError(): GenerationError {
  return {
    code: 'RATE_LIMIT',
    message: 'Pollinations daily limit reached. Please use an alternative model.',
    provider: 'pollinations',
    suggestions: [
      {
        action: 'use_alternative_model',
        label: 'Use Flux Schnell (Free)',
        description: 'Fast alternative via Together AI',
        model: 'flux-schnell',
        cost: 1
      },
      {
        action: 'use_alternative_model',
        label: 'Use Flux 2 Pro (Premium)',
        description: 'Professional quality via Replicate',
        model: 'flux-2-pro',
        cost: 2
      }
    ],
    canRetry: false
  };
}

/**
 * Vérifie si une erreur est une rate limit Pollinations
 */
function isPollinationsRateLimit(error: any): boolean {
  return (
    error?.code === 'FORBIDDEN' ||
    error?.message?.includes('pollen balance') ||
    error?.message?.includes('rate limit')
  );
}

/**
 * Type guard pour GenerationError
 */
function isGenerationError(error: any): error is GenerationError {
  return error && typeof error === 'object' && 'code' in error && 'suggestions' in error;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Estime le temps de génération selon le modèle
 */
function getEstimatedTime(model: ModelName): number {
  const times: Record<ModelName, number> = {
    'seedream': 5,
    'kontext': 4,
    'nanobanana': 6,
    'flux-schnell': 3,
    'flux-2-pro': 15,
    'imagen-4': 20
  };
  return times[model] || 10;
}

/**
 * Valide l'input de génération
 */
export function validateInput(input: GenerationInput): { valid: boolean; error?: string } {
  if (!input.prompt || input.prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt is required' };
  }

  if (input.prompt.length > 2000) {
    return { valid: false, error: 'Prompt is too long (max 2000 characters)' };
  }

  const imageCount = input.images?.length || 0;
  if (imageCount > 10) {
    return { valid: false, error: 'Maximum 10 images allowed' };
  }

  return { valid: true };
}
