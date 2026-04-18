// Coconut V14 Schemas - Zod validation for CocoBoard blueprints
import { z } from 'zod';

// ============================================
// Base Types
// ============================================

export const CoconutModeSchema = z.enum(['image', 'video', 'campaign']);
export type CoconutMode = z.infer<typeof CoconutModeSchema>;

export const StepStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);
export type StepStatus = z.infer<typeof StepStatusSchema>;

export const JobStatusSchema = z.enum([
  'pending',
  'analyzing',
  'awaiting_validation',
  'blending',
  'node_processing',
  'done',
  'failed',
  'paused_credits'
]);
export type JobStatus = z.infer<typeof JobStatusSchema>;

// ============================================
// Step Types
// ============================================

export const ImageStepSchema = z.object({
  id: z.string(),
  type: z.literal('image'),
  prompt: z.string(),
  model: z.enum(['flux-2-pro', 'flux-2-flex', 'flux-2-dev', 'nano-banana-pro', 'nano-banana-2', 'qwen2-image']),
  aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4']),
  resolution: z.enum(['1K', '2K', '4K']),
  referenceImages: z.array(z.string()).optional(),
  creditsEstimated: z.number(),
  dependsOn: z.array(z.string()).optional(),
});

export const VideoStepSchema = z.object({
  id: z.string(),
  type: z.literal('video'),
  prompt: z.string(),
  model: z.enum(['kling-3-std', 'kling-3-pro', 'wan-2.6', 'seedance-1.5', 'veo-3']),
  generationType: z.enum(['TEXT_2_VIDEO', 'IMAGE_2_VIDEO']),
  sourceImageStepId: z.string().optional(), // For I2V
  duration: z.number().min(5).max(10),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']),
  creditsEstimated: z.number(),
  dependsOn: z.array(z.string()).optional(),
});

export const TextStepSchema = z.object({
  id: z.string(),
  type: z.literal('text'),
  purpose: z.string(),
  content: z.string().optional(),
  creditsEstimated: z.number().default(0),
  dependsOn: z.array(z.string()).optional(),
});

export const StepSchema = z.union([ImageStepSchema, VideoStepSchema, TextStepSchema]);
export type Step = z.infer<typeof StepSchema>;

// ============================================
// Campaign Types
// ============================================

export const CampaignPostSchema = z.object({
  week: z.number().min(1).max(4),
  day: z.number().min(1).max(7),
  platform: z.enum(['instagram', 'tiktok', 'facebook']),
  format: z.enum(['image', 'video', 'carousel', 'story', 'reel']),
  objective: z.enum(['awareness', 'engagement', 'conversion']),
  contentPillar: z.string(),
  visualStepId: z.string(),
  caption: z.string(),
  hashtags: z.array(z.string()),
  cta: z.string(),
});

export const CampaignPhaseSchema = z.object({
  name: z.string(),
  week: z.number(),
  objective: z.string(),
  posts: z.array(CampaignPostSchema),
});

export const CampaignBlueprintSchema = z.object({
  type: z.literal('campaign'),
  duration: z.number().default(30),
  phases: z.array(CampaignPhaseSchema),
  totalPosts: z.number(),
  visualSteps: z.array(ImageStepSchema.or(VideoStepSchema)),
});

// ============================================
// CocoBoard Blueprint
// ============================================

export const CocoBoardBlueprintSchema = z.object({
  version: z.literal('v14'),
  mode: CoconutModeSchema,
  
  // Metadata
  title: z.string(),
  description: z.string(),
  intent: z.string(),
  targetAudience: z.string().optional(),
  brandGuidelines: z.string().optional(),
  
  // Complexity
  complexity: z.enum(['simple', 'medium', 'complex']),
  estimatedCredits: z.number(),
  
  // Steps
  steps: z.array(StepSchema),
  
  // Campaign specific
  campaign: CampaignBlueprintSchema.optional(),
  
  // Execution
  executionOrder: z.array(z.string()), // Step IDs in order
  parallelGroups: z.array(z.array(z.string())).optional(), // Groups that can run in parallel
});

export type CocoBoardBlueprint = z.infer<typeof CocoBoardBlueprintSchema>;

// ============================================
// Blend Node (CocoBlend Canvas)
// ============================================

export const BlendNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'video', 'text', 'campaign']),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({
    step: StepSchema,
    status: StepStatusSchema,
    outputUrl: z.string().optional(),
    creditsConsumed: z.number().default(0),
    error: z.string().optional(),
    progress: z.number().min(0).max(100).default(0),
  }),
});

export type BlendNode = z.infer<typeof BlendNodeSchema>;

export const BlendEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  animated: z.boolean().default(false),
});

export type BlendEdge = z.infer<typeof BlendEdgeSchema>;

// ============================================
// Job Types
// ============================================

export const CocoboardJobSchema = z.object({
  id: z.string().uuid(),
  ownerType: z.enum(['user', 'organization']),
  ownerId: z.string().uuid(),
  
  // Input
  mode: CoconutModeSchema,
  intent: z.string(),
  assets: z.array(z.string()).default([]),
  
  // Generated
  cocoboard: CocoBoardBlueprintSchema.optional(),
  
  // Node Canvas
  nodes: z.array(BlendNodeSchema).default([]),
  edges: z.array(BlendEdgeSchema).default([]),
  
  // Status
  status: JobStatusSchema,
  
  // Credits (separate tracking)
  creditsCocoboard: z.number().default(100), // Fixed 100 for LLM
  creditsGenerationEstimated: z.number().default(0),
  creditsGenerationActual: z.number().default(0),
  
  // Results
  finalOutputUrl: z.string().optional(),
  errorMessage: z.string().optional(),
  
  // Metadata
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CocoboardJob = z.infer<typeof CocoboardJobSchema>;

// ============================================
// API Request/Response Types
// ============================================

export const CreateJobRequestSchema = z.object({
  mode: CoconutModeSchema,
  intent: z.string().min(10).max(2000),
  assets: z.array(z.string().url()).max(5).optional(),
});

export const CreateJobResponseSchema = z.object({
  success: z.boolean(),
  jobId: z.string().uuid().optional(),
  estimatedCreditsCocoboard: z.number().default(100),
  estimatedCreditsGeneration: z.number(),
  error: z.string().optional(),
});

export const ValidateJobRequestSchema = z.object({
  modifications: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    steps: z.array(StepSchema).optional(),
  }).optional(),
});

export const ValidateJobResponseSchema = z.object({
  success: z.boolean(),
  batchId: z.string().optional(),
  tasks: z.array(z.object({
    stepId: z.string(),
    status: z.enum(['queued', 'processing', 'completed', 'failed']),
  })),
  error: z.string().optional(),
});

// ============================================
// Helper Functions
// ============================================

export function calculateStepCredits(step: Step): number {
  switch (step.type) {
    case 'image':
      const resolutionMultiplier = {
        '1K': 1,
        '2K': 1.5,
        '4K': 2,
      };
      const baseCost = step.model.includes('pro') ? 15 : step.model.includes('flex') ? 10 : 5;
      return Math.round(baseCost * resolutionMultiplier[step.resolution]);
    
    case 'video':
      const durationMultiplier = step.duration / 5;
      const modelCost = step.model.includes('pro') ? 40 : step.model.includes('std') ? 25 : 20;
      return Math.round(modelCost * durationMultiplier);
    
    case 'text':
      return 0;
    
    default:
      return 0;
  }
}

export function calculateTotalCredits(steps: Step[]): number {
  return steps.reduce((total, step) => total + calculateStepCredits(step), 0);
}

export function generateExecutionOrder(steps: Step[]): string[] {
  const visited = new Set<string>();
  const order: string[] = [];
  
  function visit(stepId: string) {
    if (visited.has(stepId)) return;
    
    const step = steps.find(s => s.id === stepId);
    if (!step) return;
    
    // Visit dependencies first
    if (step.dependsOn) {
      for (const depId of step.dependsOn) {
        visit(depId);
      }
    }
    
    visited.add(stepId);
    order.push(stepId);
  }
  
  for (const step of steps) {
    visit(step.id);
  }
  
  return order;
}

export function identifyParallelGroups(steps: Step[]): string[][] {
  const order = generateExecutionOrder(steps);
  const groups: string[][] = [];
  let currentGroup: string[] = [];
  
  for (const stepId of order) {
    const step = steps.find(s => s.id === stepId);
    if (!step) continue;
    
    // If step has no pending dependencies, it can run in current group
    const hasPendingDeps = step.dependsOn?.some(depId => {
      const depIndex = order.indexOf(depId);
      const currentIndex = order.indexOf(stepId);
      return depIndex >= currentIndex; // Not processed yet
    });
    
    if (!hasPendingDeps) {
      currentGroup.push(stepId);
    } else {
      if (currentGroup.length > 0) {
        groups.push([...currentGroup]);
        currentGroup = [];
      }
      currentGroup.push(stepId);
    }
  }
  
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  
  return groups;
}
