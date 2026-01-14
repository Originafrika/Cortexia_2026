// ============================================
// GEMINI JSON SCHEMAS - STRICT OUTPUT
// ============================================
// Définit les schemas stricts pour la sortie Gemini

import { z } from 'npm:zod';

// ============================================
// CONCEPT SCHEMA
// ============================================

export const ConceptSchema = z.object({
  direction: z.string().min(20).max(500).describe('Direction artistique principale'),
  keyMessage: z.string().min(20).max(300).describe('Message clé de la campagne'),
  mood: z.string().min(10).max(200).describe('Mood et ambiance')
});

// ============================================
// REFERENCE ANALYSIS SCHEMA
// ============================================

export const AvailableAssetSchema = z.object({
  id: z.string(),
  type: z.enum([
    'background',
    'product',
    'character',
    'model',
    'element',
    'decoration',
    'text-overlay',
    'logo',
    'lighting-effect'
  ]),
  description: z.string().min(10).max(300),
  usage: z.string().min(10).max(200).describe('Comment utiliser cet asset'),
  notes: z.string().optional()
});

export const DetectedStyleSchema = z.object({
  aesthetic: z.string().min(10).max(200),
  colorPalette: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).min(1).max(10),
  lighting: z.string().min(10).max(200),
  materials: z.array(z.string()).max(10)
});

export const ReferenceAnalysisSchema = z.object({
  availableAssets: z.array(AvailableAssetSchema),
  detectedStyle: DetectedStyleSchema
});

// ============================================
// COMPOSITION SCHEMA
// ============================================

export const CompositionZoneSchema = z.object({
  name: z.string().min(3).max(100),
  position: z.string().min(5).max(200).describe('Position dans l\'image'),
  description: z.string().min(10).max(300)
});

export const CompositionSchema = z.object({
  ratio: z.string(),
  resolution: z.string(),
  zones: z.array(CompositionZoneSchema).min(1).max(8)
});

// ============================================
// COLOR PALETTE SCHEMA
// ============================================

export const ColorPaletteSchema = z.object({
  primary: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).min(1).max(3),
  accent: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).min(1).max(3),
  background: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).min(1).max(3),
  text: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).min(1).max(3),
  rationale: z.string().min(20).max(500).describe('Justification des choix de couleurs')
});

// ============================================
// FLUX PROMPT SCHEMA
// ============================================

// ✅ SIMPLIFIED: finalPrompt is now just a TEXT STRING (max 5000 chars)
// Gemini will generate an optimized text prompt directly, not a complex JSON
export const FluxPromptSchema = z.string()
  .min(100)
  .max(5000)
  .describe('Optimized text prompt for Flux 2 Pro (MAX 5000 chars). Direct, concise, descriptive. No placeholders like [USER_*].');

// ============================================
// ASSETS REQUIRED SCHEMA
// ============================================

export const MissingAssetSchema = z.object({
  id: z.string(),
  type: z.enum([
    'background',
    'product',
    'character',
    'model',
    'element',
    'decoration',
    'text-overlay',
    'logo',
    'lighting-effect'
  ]),
  description: z.string().min(10).max(500),
  canBeGenerated: z.boolean(),
  requiredAction: z.enum(['generate', 'request-from-user', 'include-in-final-prompt']),
  promptFlux: FluxPromptSchema.optional(),
  requestMessage: z.string().optional()
});

export const AssetSchema = z.object({
  id: z.string(),
  type: z.enum([
    'background',
    'product',
    'character',
    'model',
    'element',
    'decoration',
    'text-overlay',
    'logo',
    'lighting-effect'
  ]),
  description: z.string().min(10).max(300),
  status: z.literal('ready')
});

export const AssetsRequiredSchema = z.object({
  available: z.array(AssetSchema),
  missing: z.array(MissingAssetSchema)
});

// ============================================
// TECHNICAL SPECS SCHEMA
// ============================================

export const TechnicalSpecsSchema = z.object({
  model: z.literal('flux-2-pro'),
  mode: z.enum(['text-to-image', 'image-to-image']),
  ratio: z.string(),
  resolution: z.enum(['1K', '2K']),
  references: z.array(z.string()).max(8)
});

// ============================================
// COST SCHEMA
// ============================================

export const CostSchema = z.object({
  analysis: z.number().int().positive(),
  assetsGeneration: z.number().int().nonnegative().optional(),
  finalGeneration: z.number().int().positive(),
  total: z.number().int().positive()
});

// ============================================
// RECOMMENDATIONS SCHEMA
// ============================================

export const RecommendationsSchema = z.object({
  generationApproach: z.enum(['single-pass', 'multi-pass']),
  rationale: z.string().min(20).max(500),
  alternatives: z.string().optional()
});

// ============================================
// MAIN ANALYSIS RESULT SCHEMA
// ============================================

export const AnalysisResultSchema = z.object({
  projectTitle: z.string().min(5).max(200),
  concept: ConceptSchema,
  referenceAnalysis: ReferenceAnalysisSchema,
  composition: CompositionSchema,
  colorPalette: ColorPaletteSchema,
  assetsRequired: AssetsRequiredSchema,
  finalPrompt: FluxPromptSchema,
  technicalSpecs: TechnicalSpecsSchema,
  estimatedCost: CostSchema,
  recommendations: RecommendationsSchema
});

// ============================================
// JSON SCHEMA FOR GEMINI OUTPUT
// ============================================

export const GEMINI_OUTPUT_JSON_SCHEMA = {
  type: "object",
  properties: {
    projectTitle: {
      type: "string",
      minLength: 5,
      maxLength: 200,
      description: "Titre du projet créatif"
    },
    concept: {
      type: "object",
      properties: {
        direction: { 
          type: "string", 
          minLength: 20, 
          maxLength: 500,
          description: "Direction artistique principale" 
        },
        keyMessage: { 
          type: "string", 
          minLength: 20, 
          maxLength: 300,
          description: "Message clé de la campagne" 
        },
        mood: { 
          type: "string", 
          minLength: 10, 
          maxLength: 200,
          description: "Mood et ambiance" 
        }
      },
      required: ["direction", "keyMessage", "mood"]
    },
    referenceAnalysis: {
      type: "object",
      properties: {
        availableAssets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { 
                type: "string",
                enum: ["background", "product", "character", "model", "element", "decoration", "text-overlay", "logo", "lighting-effect"]
              },
              description: { type: "string", minLength: 10, maxLength: 300 },
              usage: { type: "string", minLength: 10, maxLength: 200 },
              notes: { type: "string" }
            },
            required: ["id", "type", "description", "usage"]
          }
        },
        detectedStyle: {
          type: "object",
          properties: {
            aesthetic: { type: "string", minLength: 10, maxLength: 200 },
            colorPalette: { 
              type: "array",
              items: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
              minItems: 1,
              maxItems: 10
            },
            lighting: { type: "string", minLength: 10, maxLength: 200 },
            materials: { 
              type: "array",
              items: { type: "string" },
              maxItems: 10
            }
          },
          required: ["aesthetic", "colorPalette", "lighting", "materials"]
        }
      },
      required: ["availableAssets", "detectedStyle"]
    },
    composition: {
      type: "object",
      properties: {
        ratio: { type: "string" },
        resolution: { type: "string" },
        zones: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", minLength: 3, maxLength: 100 },
              position: { type: "string", minLength: 5, maxLength: 200 },
              description: { type: "string", minLength: 10, maxLength: 300 }
            },
            required: ["name", "position", "description"]
          },
          minItems: 1,
          maxItems: 8
        }
      },
      required: ["ratio", "resolution", "zones"]
    },
    colorPalette: {
      type: "object",
      properties: {
        primary: {
          type: "array",
          items: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
          minItems: 1,
          maxItems: 3
        },
        accent: {
          type: "array",
          items: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
          minItems: 1,
          maxItems: 3
        },
        background: {
          type: "array",
          items: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
          minItems: 1,
          maxItems: 3
        },
        text: {
          type: "array",
          items: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
          minItems: 1,
          maxItems: 3
        },
        rationale: { type: "string", minLength: 20, maxLength: 500 }
      },
      required: ["primary", "accent", "background", "text", "rationale"]
    },
    assetsRequired: {
      type: "object",
      properties: {
        available: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { 
                type: "string",
                enum: ["background", "product", "character", "model", "element", "decoration", "text-overlay", "logo", "lighting-effect"]
              },
              description: { type: "string", minLength: 10, maxLength: 300 },
              status: { type: "string", enum: ["ready"] }
            },
            required: ["id", "type", "description", "status"]
          }
        },
        missing: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { 
                type: "string",
                enum: ["background", "product", "character", "model", "element", "decoration", "text-overlay", "logo", "lighting-effect"]
              },
              description: { type: "string", minLength: 10, maxLength: 500 },
              canBeGenerated: { type: "boolean" },
              requiredAction: { 
                type: "string",
                enum: ["generate", "request-from-user", "include-in-final-prompt"]
              },
              promptFlux: { type: "object" },
              requestMessage: { type: "string" }
            },
            required: ["id", "type", "description", "canBeGenerated", "requiredAction"]
          }
        }
      },
      required: ["available", "missing"]
    },
    finalPrompt: {
      type: "string",
      minLength: 100,
      maxLength: 5000,
      description: "Optimized text prompt for Flux 2 Pro (MAX 5000 chars). Direct, concise, descriptive. No placeholders like [USER_*]."
    },
    technicalSpecs: {
      type: "object",
      properties: {
        model: { type: "string", enum: ["flux-2-pro"] },
        mode: { type: "string", enum: ["text-to-image", "image-to-image"] },
        ratio: { type: "string" },
        resolution: { type: "string", enum: ["1K", "2K"] },
        references: {
          type: "array",
          items: { type: "string" },
          maxItems: 8
        }
      },
      required: ["model", "mode", "ratio", "resolution", "references"]
    },
    estimatedCost: {
      type: "object",
      properties: {
        analysis: { type: "number", minimum: 1 },
        assetsGeneration: { type: "number", minimum: 0 },
        finalGeneration: { type: "number", minimum: 1 },
        total: { type: "number", minimum: 1 }
      },
      required: ["analysis", "finalGeneration", "total"]
    },
    recommendations: {
      type: "object",
      properties: {
        generationApproach: { 
          type: "string",
          enum: ["single-pass", "multi-pass"]
        },
        rationale: { type: "string", minLength: 20, maxLength: 500 },
        alternatives: { type: "string" }
      },
      required: ["generationApproach", "rationale"]
    }
  },
  required: [
    "projectTitle",
    "concept",
    "referenceAnalysis",
    "composition",
    "colorPalette",
    "assetsRequired",
    "finalPrompt",
    "technicalSpecs",
    "estimatedCost",
    "recommendations"
  ]
};

// ============================================
// EXPORT
// ============================================

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type FluxPrompt = z.infer<typeof FluxPromptSchema>;
export type ColorPalette = z.infer<typeof ColorPaletteSchema>;
export type AssetsRequired = z.infer<typeof AssetsRequiredSchema>;
export type MissingAsset = z.infer<typeof MissingAssetSchema>;

console.log('✅ Gemini schemas loaded');