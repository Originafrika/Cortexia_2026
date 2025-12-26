// ============================================
// COCONUT V14 - ASSET DETECTION & MANAGEMENT
// ============================================
// Service pour gérer la détection et classification d'assets

import type { 
  MissingAsset,
  FluxPrompt,
  AssetType,
  ReferenceUrls 
} from '../../../lib/types/coconut-v14.ts';
import { FluxPromptSchema } from './gemini-schemas.ts';

// ============================================
// ASSET CLASSIFICATION
// ============================================

export interface AssetClassification {
  id: string;
  type: AssetType;
  description: string;
  source: 'user-provided' | 'gemini-detected';
  referenceUrl?: string;
  confidence?: number;
}

/**
 * Classifier les assets fournis par l'utilisateur
 * 
 * Analyse les URLs de références et les descriptions pour identifier
 * le type et l'usage de chaque asset.
 */
export function classifyUserProvidedAssets(
  references: ReferenceUrls
): AssetClassification[] {
  const classified: AssetClassification[] = [];
  
  // Images
  references.images.forEach((url, index) => {
    const description = references.descriptions[index] || 'Image reference';
    const type = inferAssetTypeFromDescription(description);
    
    classified.push({
      id: `user-img-${index}`,
      type,
      description,
      source: 'user-provided',
      referenceUrl: url,
      confidence: 0.8 // User provided = high confidence
    });
  });
  
  // Videos
  references.videos.forEach((url, index) => {
    const descIndex = references.images.length + index;
    const description = references.descriptions[descIndex] || 'Video reference';
    const type = inferAssetTypeFromDescription(description);
    
    classified.push({
      id: `user-vid-${index}`,
      type,
      description,
      source: 'user-provided',
      referenceUrl: url,
      confidence: 0.8
    });
  });
  
  console.log(`✅ Classified ${classified.length} user-provided assets`);
  return classified;
}

/**
 * Inférer le type d'asset depuis une description
 */
function inferAssetTypeFromDescription(description: string): AssetType {
  const lower = description.toLowerCase();
  
  // Keywords matching
  if (lower.includes('fond') || lower.includes('background') || lower.includes('arrière-plan')) {
    return 'background';
  }
  if (lower.includes('produit') || lower.includes('product')) {
    return 'product';
  }
  if (lower.includes('personne') || lower.includes('character') || lower.includes('model')) {
    return 'model';
  }
  if (lower.includes('logo')) {
    return 'logo';
  }
  if (lower.includes('texte') || lower.includes('text')) {
    return 'text-overlay';
  }
  if (lower.includes('lumière') || lower.includes('light') || lower.includes('éclairage')) {
    return 'lighting-effect';
  }
  if (lower.includes('décor') || lower.includes('decoration')) {
    return 'decoration';
  }
  
  // Default: element
  return 'element';
}

// ============================================
// MISSING ASSET DETECTION
// ============================================

export interface MissingAssetAnalysis {
  missing: MissingAsset[];
  canGenerateAll: boolean;
  requiresUserInput: boolean;
  generationCount: number;
  requestCount: number;
}

/**
 * Analyser les assets manquants depuis les résultats Gemini
 * 
 * Détermine quels assets peuvent être générés vs ceux qui nécessitent
 * une intervention utilisateur.
 */
export function analyzeMissingAssets(
  missingAssets: MissingAsset[]
): MissingAssetAnalysis {
  const generatable = missingAssets.filter(a => a.canBeGenerated);
  const requestFromUser = missingAssets.filter(a => !a.canBeGenerated);
  
  return {
    missing: missingAssets,
    canGenerateAll: requestFromUser.length === 0,
    requiresUserInput: requestFromUser.length > 0,
    generationCount: generatable.length,
    requestCount: requestFromUser.length
  };
}

// ============================================
// ASSET GENERATION PROMPT BUILDER
// ============================================

/**
 * Construire un prompt Flux optimisé pour générer un asset manquant
 * 
 * Crée un prompt spécialisé selon le type d'asset à générer
 * (background, product, character, etc.)
 */
export function buildAssetGenerationPrompt(
  asset: MissingAsset,
  contextInfo: {
    style?: string;
    colorPalette?: string[];
    mood?: string;
    targetUsage?: string;
  }
): FluxPrompt {
  const basePrompt: FluxPrompt = {
    scene: buildSceneDescription(asset, contextInfo),
    subjects: [
      {
        description: asset.description,
        position: getDefaultPosition(asset.type),
        color_palette: contextInfo.colorPalette || ['#FFFFFF', '#000000'],
        style: contextInfo.style || 'professional commercial photography'
      }
    ],
    style: contextInfo.style || 'professional commercial photography, high quality, 8K resolution',
    color_palette: contextInfo.colorPalette || ['#FFFFFF', '#F5F5F5', '#E0E0E0'],
    lighting: getLightingForAssetType(asset.type),
    composition: getCompositionForAssetType(asset.type),
    mood: contextInfo.mood || 'clean, professional, modern'
  };
  
  // Validate
  try {
    return FluxPromptSchema.parse(basePrompt);
  } catch (error) {
    console.error('❌ Asset prompt validation failed:', error);
    // Return base version even if validation fails
    return basePrompt;
  }
}

function buildSceneDescription(
  asset: MissingAsset,
  context: { targetUsage?: string; style?: string; mood?: string }
): string {
  const usageContext = context.targetUsage 
    ? `optimized for ${context.targetUsage} usage, `
    : '';
  
  const styleContext = context.style
    ? `${context.style}, `
    : 'professional commercial photography, ';
  
  const moodContext = context.mood
    ? `with a ${context.mood} mood, `
    : '';
  
  return `${styleContext}${usageContext}${moodContext}${asset.description}. High quality, detailed, realistic rendering. Isolated asset suitable for compositing.`;
}

function getDefaultPosition(assetType: AssetType): string {
  const positions: Record<AssetType, string> = {
    'background': 'full frame, entire composition',
    'product': 'centered, rule of thirds',
    'character': 'centered, vertical middle third',
    'model': 'centered, vertical composition',
    'element': 'centered, flexible placement',
    'decoration': 'supporting position, corners or edges',
    'text-overlay': 'top or bottom third, clear space',
    'logo': 'top corner or bottom corner',
    'lighting-effect': 'overlay on main subject'
  };
  
  return positions[assetType] || 'centered, balanced composition';
}

function getLightingForAssetType(assetType: AssetType): string {
  const lighting: Record<AssetType, string> = {
    'background': 'Soft, even lighting with subtle gradients. Ambient light fill, no harsh shadows.',
    'product': 'Studio lighting setup: key light from 45° angle, fill light opposite side, subtle rim light for depth. Soft shadows.',
    'character': 'Natural light with soft diffusion, main light from front-left at 45°, fill light to soften shadows.',
    'model': 'Professional portrait lighting: butterfly or Rembrandt setup, soft key light, subtle fill, hair light optional.',
    'element': 'Clean, even lighting suitable for compositing. Neutral shadows, easy to match with scene.',
    'decoration': 'Ambient lighting matching scene context, subtle highlights.',
    'text-overlay': 'No lighting (text element). Prepare for overlay blend modes.',
    'logo': 'Flat, even lighting. No shadows or 3D effects unless brand-specific.',
    'lighting-effect': 'Volumetric light rays, god rays, or specific effect as described. Realistic light behavior.'
  };
  
  return lighting[assetType] || 'Professional studio lighting with soft shadows and subtle highlights.';
}

function getCompositionForAssetType(assetType: AssetType): string {
  const composition: Record<AssetType, string> = {
    'background': 'Full frame composition, balanced negative space, suitable for foreground elements overlay.',
    'product': 'Rule of thirds, centered with breathing room. Negative space for text. Clear focus on product.',
    'character': 'Vertical rule of thirds, headroom consideration, natural pose, clear silhouette.',
    'model': 'Portrait composition rules, clear separation from background, professional posing.',
    'element': 'Isolated on neutral background for easy extraction. Clean edges, compositing-ready.',
    'decoration': 'Supporting element, non-competing with main subject. Balanced placement.',
    'text-overlay': 'Typography-friendly space, contrast consideration, clear readability zones.',
    'logo': 'Prominent but not overwhelming. Brand guidelines respected. Clear space around.',
    'lighting-effect': 'Overlay-ready, additive blend mode suitable. Natural light behavior.'
  };
  
  return composition[assetType] || 'Balanced composition suitable for professional commercial use.';
}

// ============================================
// USER REQUEST MESSAGE BUILDER
// ============================================

/**
 * Construire un message clair pour demander un asset à l'utilisateur
 * 
 * Génère un message en français expliquant quel asset est nécessaire
 * et pourquoi il ne peut pas être généré automatiquement.
 */
export function buildUserRequestMessage(
  asset: MissingAsset,
  reason: 'specific-brand' | 'legal-requirement' | 'quality-concern' | 'custom'
): string {
  const baseMessage = `Nous avons besoin d'un asset spécifique : ${asset.description}.`;
  
  const reasonMessages: Record<string, string> = {
    'specific-brand': 'Cet élément est lié à votre marque et nécessite vos assets officiels pour garantir la cohérence de votre identité visuelle.',
    'legal-requirement': 'Pour des raisons légales, nous ne pouvons pas générer cet élément automatiquement. Veuillez fournir votre propre fichier.',
    'quality-concern': 'Pour garantir la meilleure qualité possible, nous recommandons fortement d\'utiliser votre propre asset professionnel.',
    'custom': 'Cet élément nécessite une personnalisation spécifique impossible à générer automatiquement.'
  };
  
  const instructions = getInstructionsForAssetType(asset.type);
  
  return `${baseMessage}\n\n${reasonMessages[reason] || reasonMessages.custom}\n\n${instructions}`;
}

function getInstructionsForAssetType(assetType: AssetType): string {
  const instructions: Record<AssetType, string> = {
    'background': '📸 Format recommandé : JPG ou PNG haute résolution (min 2000x2000px). Évitez les fonds trop chargés.',
    'product': '📦 Format recommandé : PNG avec fond transparent ou JPG haute qualité. Éclairage neutre, plusieurs angles si possible.',
    'character': '👤 Format recommandé : PNG avec fond transparent ou JPG. Photo nette, bonne résolution, pose naturelle.',
    'model': '📸 Format recommandé : JPG haute résolution (min 2000px hauteur). Photo professionnelle, éclairage studio de préférence.',
    'element': '🎨 Format recommandé : PNG avec transparence si possible. Haute résolution, couleurs précises.',
    'decoration': '✨ Format recommandé : PNG ou SVG pour meilleure qualité. Transparent si possible.',
    'text-overlay': '✍️ Veuillez fournir le texte exact et la police souhaitée. Nous créerons l\'overlay.',
    'logo': '🏷️ Format OBLIGATOIRE : PNG transparent ou SVG vectoriel. Haute résolution (min 1000px). Respectez votre charte graphique.',
    'lighting-effect': '💡 Décrivez l\'effet lumineux souhaité en détail. Nous tenterons une génération sur mesure.'
  };
  
  return instructions[assetType] || '📁 Veuillez fournir un fichier haute qualité au format PNG ou JPG.';
}

// ============================================
// ASSET VALIDATION
// ============================================

export interface AssetValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valider un asset fourni par l'utilisateur
 * 
 * Vérifie que l'asset respecte les requirements minimaux
 * (format, résolution, type, etc.)
 */
export function validateAsset(
  assetUrl: string,
  expectedType: AssetType,
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    fileSize?: number;
  }
): AssetValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // URL validation
  if (!assetUrl || assetUrl.trim().length === 0) {
    errors.push('Asset URL is empty or invalid');
  }
  
  // Metadata validation (if provided)
  if (metadata) {
    // Resolution check
    if (metadata.width && metadata.height) {
      const minResolution = getMinResolutionForType(expectedType);
      if (metadata.width < minResolution || metadata.height < minResolution) {
        warnings.push(
          `Resolution ${metadata.width}x${metadata.height} is below recommended minimum ${minResolution}px`
        );
      }
    }
    
    // Format check
    if (metadata.format) {
      const allowedFormats = getAllowedFormatsForType(expectedType);
      if (!allowedFormats.includes(metadata.format.toLowerCase())) {
        errors.push(
          `Format ${metadata.format} not allowed for ${expectedType}. Allowed: ${allowedFormats.join(', ')}`
        );
      }
    }
    
    // File size check (max 10MB for safety)
    if (metadata.fileSize && metadata.fileSize > 10 * 1024 * 1024) {
      warnings.push('File size exceeds 10MB. Consider compressing for better performance.');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function getMinResolutionForType(assetType: AssetType): number {
  const minResolutions: Record<AssetType, number> = {
    'background': 2000,
    'product': 1500,
    'character': 1200,
    'model': 1500,
    'element': 1000,
    'decoration': 800,
    'text-overlay': 500,
    'logo': 1000,
    'lighting-effect': 1000
  };
  
  return minResolutions[assetType] || 1000;
}

function getAllowedFormatsForType(assetType: AssetType): string[] {
  // Logo should be PNG or SVG
  if (assetType === 'logo') {
    return ['png', 'svg'];
  }
  
  // Text overlay could be various formats
  if (assetType === 'text-overlay') {
    return ['png', 'svg', 'txt'];
  }
  
  // Most assets: PNG or JPG
  return ['png', 'jpg', 'jpeg'];
}

// ============================================
// COST ESTIMATION FOR ASSET GENERATION
// ============================================

/**
 * Calculer le coût de génération d'assets manquants
 * 
 * @param missingAssets - Assets à générer
 * @param resolution - '1K' ou '2K'
 * @returns Coût total en crédits
 */
export function calculateAssetGenerationCost(
  missingAssets: MissingAsset[],
  resolution: '1K' | '2K'
): number {
  const generatableAssets = missingAssets.filter(
    a => a.canBeGenerated && a.requiredAction === 'generate'
  );
  
  // Flux 2 Pro cost per asset
  const costPerAsset = resolution === '1K' ? 5 : 15;
  
  return generatableAssets.length * costPerAsset;
}

// ============================================
// ASSET PREPARATION FOR FLUX
// ============================================

export interface AssetGenerationTask {
  id: string;
  assetId: string;
  type: AssetType;
  prompt: FluxPrompt;
  technicalSpecs: {
    model: 'flux-2-pro';
    mode: 'text-to-image';
    ratio: string;
    resolution: '1K' | '2K';
  };
  estimatedCost: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

/**
 * Préparer les tâches de génération pour tous les assets manquants
 * 
 * Crée une liste de tâches prêtes à être envoyées à Flux 2 Pro
 */
export function prepareAssetGenerationTasks(
  missingAssets: MissingAsset[],
  context: {
    style?: string;
    colorPalette?: string[];
    mood?: string;
    targetUsage?: string;
    resolution?: '1K' | '2K';
  }
): AssetGenerationTask[] {
  const resolution = context.resolution || '1K';
  const tasks: AssetGenerationTask[] = [];
  
  missingAssets
    .filter(a => a.canBeGenerated && a.requiredAction === 'generate')
    .forEach(asset => {
      // Use Gemini-provided prompt if available, otherwise build one
      const prompt = asset.promptFlux || buildAssetGenerationPrompt(asset, context);
      
      tasks.push({
        id: `task-${asset.id}`,
        assetId: asset.id,
        type: asset.type,
        prompt,
        technicalSpecs: {
          model: 'flux-2-pro',
          mode: 'text-to-image',
          ratio: getRatioForAssetType(asset.type),
          resolution
        },
        estimatedCost: resolution === '1K' ? 5 : 15,
        status: 'pending'
      });
    });
  
  console.log(`✅ Prepared ${tasks.length} asset generation tasks`);
  return tasks;
}

function getRatioForAssetType(assetType: AssetType): string {
  const ratios: Record<AssetType, string> = {
    'background': '16:9',     // Wide format for backgrounds
    'product': '1:1',         // Square for products
    'character': '3:4',       // Portrait for characters
    'model': '3:4',           // Portrait for models
    'element': '1:1',         // Square for elements
    'decoration': '1:1',      // Square for decorations
    'text-overlay': '16:9',   // Wide for text overlays
    'logo': '1:1',            // Square for logos
    'lighting-effect': '16:9' // Wide for effects
  };
  
  return ratios[assetType] || '1:1';
}

// ============================================
// EXPORT
// ============================================

export const ASSETS_INFO = {
  version: '14.0.0',
  phase: 2,
  day: 2,
  status: 'complete',
  features: {
    classification: true,
    detection: true,
    promptGeneration: true,
    validation: true,
    costEstimation: true,
    taskPreparation: true
  }
};

console.log('✅ Assets service loaded (COMPLETE - Phase 2 Day 2)');
