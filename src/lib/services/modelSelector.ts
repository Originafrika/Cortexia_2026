/**
 * Service de sélection intelligente des modèles
 * Analyse l'input et suggère le meilleur modèle selon les contraintes
 */

import type { 
  GenerationInput, 
  ModelSuggestion, 
  ModelInfo, 
  CreditBalance,
  ModelName
} from '../types/studio';

// ============================================================================
// MODEL DEFINITIONS
// ============================================================================

export const MODELS: Record<ModelName, ModelInfo> = {
  'seedream': {
    name: 'seedream',
    provider: 'pollinations',
    tier: 'free',
    cost: 1,
    description: 'Best quality for text-to-image and multi-image combinations',
    capabilities: {
      textToImage: true,
      imageToImage: true,
      minImages: 0,
      maxImages: 10
    },
    features: ['High quality', 'Fast generation', 'Versatile']
  },
  'kontext': {
    name: 'kontext',
    provider: 'pollinations',
    tier: 'free',
    cost: 1,
    description: 'Perfect for single image enhancement and transformation',
    capabilities: {
      textToImage: false,
      imageToImage: true,
      minImages: 1,
      maxImages: 1
    },
    features: ['Enhancement', 'Style transfer', 'Quick results']
  },
  'nanobanana': {
    name: 'nanobanana',
    provider: 'pollinations',
    tier: 'free',
    cost: 1,
    description: 'Ideal for 2-3 image fusion and face swap',
    capabilities: {
      textToImage: false,
      imageToImage: true,
      minImages: 2,
      maxImages: 3
    },
    features: ['Multi-image fusion', 'Face swap', 'Seamless blend']
  },
  'flux-schnell': {
    name: 'flux-schnell',
    provider: 'together',
    tier: 'free',
    cost: 1,
    description: 'Ultra-fast text-to-image fallback (Together AI)',
    capabilities: {
      textToImage: true,
      imageToImage: false,
      minImages: 0,
      maxImages: 0
    },
    features: ['Ultra fast', 'Reliable', 'No rate limits']
  },
  'flux-2-pro': {
    name: 'flux-2-pro',
    provider: 'replicate',
    tier: 'paid',
    cost: 2,
    description: 'Professional quality for any generation type',
    capabilities: {
      textToImage: true,
      imageToImage: true,
      minImages: 0,
      maxImages: 10
    },
    features: ['Maximum quality', 'Professional results', 'No enhancement needed']
  },
  'imagen-4': {
    name: 'imagen-4',
    provider: 'replicate',
    tier: 'paid',
    cost: 3,
    description: 'Google\'s flagship image generation model',
    capabilities: {
      textToImage: true,
      imageToImage: true,
      minImages: 0,
      maxImages: 10
    },
    features: ['Cutting-edge', 'Best in class', 'Photorealistic']
  }
};

// ============================================================================
// SUGGESTION LOGIC
// ============================================================================

/**
 * Analyse l'input et suggère le meilleur modèle
 */
export function suggestModel(
  input: GenerationInput,
  credits: CreditBalance
): ModelSuggestion {
  const imageCount = input.images?.length || 0;

  // Déterminer le modèle par défaut selon le nombre d'images
  let primaryModel: ModelName;
  let reason: string;

  if (imageCount === 0) {
    // Text-to-image: Seedream par défaut (meilleure qualité)
    primaryModel = 'seedream';
    reason = 'Best quality for text-to-image generation';
  } else if (imageCount === 1) {
    // Enhancement: Kontext
    primaryModel = 'kontext';
    reason = 'Perfect for single image enhancement';
  } else if (imageCount >= 2 && imageCount <= 3) {
    // Multi-image fusion: Nanobanana
    primaryModel = 'nanobanana';
    reason = 'Ideal for 2-3 image fusion';
  } else if (imageCount >= 4 && imageCount <= 10) {
    // Complex multi-image: Seedream
    primaryModel = 'seedream';
    reason = 'Best for 4-10 image combinations';
  } else {
    // Trop d'images: suggérer premium
    primaryModel = 'flux-2-pro';
    reason = 'Complex generation requires premium model';
  }

  const modelInfo = MODELS[primaryModel];

  // Construire la suggestion
  const suggestion: ModelSuggestion = {
    model: primaryModel,
    provider: modelInfo.provider,
    tier: modelInfo.tier,
    cost: modelInfo.cost,
    reason,
    confidence: 0.9
  };

  // Ajouter des alternatives
  suggestion.alternatives = getAlternatives(primaryModel, imageCount, credits);

  return suggestion;
}

/**
 * Obtient les modèles alternatifs disponibles
 */
export function getAlternatives(
  primaryModel: ModelName,
  imageCount: number,
  credits: CreditBalance
): ModelSuggestion[] {
  const alternatives: ModelSuggestion[] = [];

  // Si le modèle primaire est gratuit, suggérer les premium
  if (MODELS[primaryModel].tier === 'free') {
    // Flux 2 Pro
    if (credits.paid >= 2 || credits.free >= 2) {
      alternatives.push({
        model: 'flux-2-pro',
        provider: 'replicate',
        tier: 'paid',
        cost: 2,
        reason: 'Professional quality upgrade',
        confidence: 0.7
      });
    }

    // Imagen 4
    if (credits.paid >= 3 || credits.free >= 3) {
      alternatives.push({
        model: 'imagen-4',
        provider: 'replicate',
        tier: 'paid',
        cost: 3,
        reason: 'Maximum quality with Google Imagen',
        confidence: 0.6
      });
    }
  }

  // Si text-to-image, ajouter Flux Schnell comme fallback
  if (imageCount === 0 && primaryModel !== 'flux-schnell') {
    alternatives.push({
      model: 'flux-schnell',
      provider: 'together',
      tier: 'free',
      cost: 1,
      reason: 'Fast alternative (Together AI)',
      confidence: 0.5
    });
  }

  return alternatives;
}

/**
 * Vérifie si un modèle est disponible pour l'utilisateur
 */
export function isModelAvailable(
  model: ModelName,
  credits: CreditBalance
): { available: boolean; reason?: string } {
  const modelInfo = MODELS[model];

  // RÈGLE IMPORTANTE: Si user a paid credits, il NE PEUT PAS utiliser free models
  if (credits.paid > 0 && modelInfo.tier === 'free') {
    return {
      available: false,
      reason: 'You must use paid credits first before accessing free models'
    };
  }

  // Si modèle payant, vérifier les crédits
  if (modelInfo.tier === 'paid') {
    if (credits.total < modelInfo.cost) {
      return {
        available: false,
        reason: `Insufficient credits. Need ${modelInfo.cost} credits.`
      };
    }
  }

  // Si modèle gratuit, vérifier que paid credits = 0
  if (modelInfo.tier === 'free' && credits.paid > 0) {
    return {
      available: false,
      reason: 'Free models unavailable while you have paid credits'
    };
  }

  return { available: true };
}

/**
 * Filtre les modèles disponibles selon le contexte
 */
export function getAvailableModels(
  input: GenerationInput,
  credits: CreditBalance
): ModelInfo[] {
  const imageCount = input.images?.length || 0;

  return Object.values(MODELS).filter(model => {
    // Vérifier la disponibilité selon les crédits
    const { available } = isModelAvailable(model.name, credits);
    if (!available) return false;

    // Vérifier la compatibilité avec l'input
    const { capabilities } = model;

    if (imageCount === 0) {
      // Text-to-image uniquement
      return capabilities.textToImage;
    } else {
      // Image-to-image
      return (
        capabilities.imageToImage &&
        imageCount >= capabilities.minImages &&
        imageCount <= capabilities.maxImages
      );
    }
  });
}

/**
 * Valide si une génération est possible
 */
export function validateGeneration(
  input: GenerationInput,
  model: ModelName,
  credits: CreditBalance
): { valid: boolean; error?: string } {
  const modelInfo = MODELS[model];

  // Vérifier disponibilité du modèle
  const { available, reason } = isModelAvailable(model, credits);
  if (!available) {
    return { valid: false, error: reason };
  }

  // Vérifier compatibilité image count
  const imageCount = input.images?.length || 0;
  const { capabilities } = modelInfo;

  if (imageCount === 0 && !capabilities.textToImage) {
    return {
      valid: false,
      error: `${model} requires at least ${capabilities.minImages} image(s)`
    };
  }

  if (imageCount > 0 && !capabilities.imageToImage) {
    return {
      valid: false,
      error: `${model} does not support image-to-image generation`
    };
  }

  if (imageCount < capabilities.minImages) {
    return {
      valid: false,
      error: `${model} requires at least ${capabilities.minImages} image(s), but you provided ${imageCount}`
    };
  }

  if (imageCount > capabilities.maxImages) {
    return {
      valid: false,
      error: `${model} supports maximum ${capabilities.maxImages} image(s), but you provided ${imageCount}`
    };
  }

  // Vérifier prompt
  if (!input.prompt || input.prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt is required' };
  }

  return { valid: true };
}

/**
 * Obtient le coût d'une génération
 */
export function getGenerationCost(model: ModelName): number {
  return MODELS[model].cost;
}

/**
 * Détermine si un modèle nécessite un enhancer
 */
export function needsEnhancement(model: ModelName): boolean {
  // Les modèles gratuits bénéficient de l'enhancement
  const freeModels: ModelName[] = ['seedream', 'kontext', 'nanobanana', 'flux-schnell'];
  return freeModels.includes(model);
}
