/**
 * TYPES - Legacy types for backward compatibility
 * NEW CODE SHOULD USE: import { ... } from './coconut-types.ts'
 */

// Re-export all Coconut types from centralized location
export type {
  CocoNode,
  NodeResult,
  NodeMetadata,
  CocoBoard,
  AIAnalysis,
  BoardSettings,
  BoardProgress,
  VeoGenerationRequest,
  VeoGenerationResponse,
  ValidationRequest,
  ValidationResponse
} from './coconut-types.ts';