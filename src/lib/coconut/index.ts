// Unified Cost Calculator — Re-exports all cost calculators
// 
// Two calculators exist for different purposes:
// 1. Simple cost (Gemini analysis + Flux generation) — for IntentInputPremium UI
// 2. Multi-step cost (T2I, I2V, T2V, etc.) — for Coconut orchestrator pipeline

// Simple cost calculator (UI)
export {
  calculateCost,
  formatCost,
  getCostTier,
  validateSpecs,
  getRecommendedSettings,
  type CostBreakdown,
  type GenerationSpecs,
} from '../utils/cost-calculator';

// Multi-step cost calculator (Coconut pipeline)
export {
  calculateImageCost,
  calculateVideoCost,
  calculateStepCost,
  calculateTotalCost,
  formatCostBreakdown,
  type CoconutMode,
  type ImageCostParams,
  type VideoCostParams,
  type StepCost,
  type TotalCost,
} from './cost-calculator';
