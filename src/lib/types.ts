// Core Types for Cortexia + Coconut System

// ==================== GENERATION TYPES ====================

export type MediaType = "image" | "video";
export type AspectRatio = "1:1" | "9:16" | "16:9" | "4:5";
export type StylePreset = 
  | "realistic" 
  | "anime" 
  | "3d" 
  | "cyberpunk" 
  | "oil-paint"
  | "cinematic"
  | "commercial"
  | "photorealistic";

export type GenerationStatus = "pending" | "generating" | "done" | "error";

export interface GenerationOptions {
  style: StylePreset;
  ratio: AspectRatio;
  type: MediaType;
  quality: "standard" | "high" | "ultra";
  seed?: number;
  variants?: number;
}

// ==================== COCONUT TYPES ====================

export type AdCategory = 
  | "voiceover-film"
  | "comedy-tagline"
  | "sales-copy"
  | "short-viral-reel"
  | "music-video"
  | "visual-hype";

export type ReferenceType = "user_image" | "generated" | "asset";

export interface Reference {
  id: string;
  type: ReferenceType;
  description: string;
  prompt?: string;
  url?: string;
  assets?: string[];
  status?: GenerationStatus;
}

export interface Shot {
  id: string;
  description: string;
  camera?: string;
  lighting?: string;
  style?: string;
  duration?: string;
  prompt: string;
  assets: {
    input_images: string[];
    generated_images: Reference[];
  };
  dependencies: string[];
  status: GenerationStatus;
  generatedUrl?: string;
}

export interface Content {
  id: string;
  type: MediaType;
  title: string;
  description?: string;
  duration?: string;
  shots?: Shot[];
  image_prompt?: string;
  image_references?: Reference[];
  status: GenerationStatus;
  generatedUrl?: string;
}

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  audience: string;
  style: string;
  tone: string;
  channels: string[];
  contents: Content[];
  createdAt: string;
  updatedAt: string;
}

export interface CampaignSet {
  id: string;
  title: string;
  description: string;
  campaigns: Campaign[];
  createdAt: string;
  status: "draft" | "generating" | "completed";
}

// ==================== PLOT SKELETON TYPES ====================

export interface PainPoint {
  point: string;
  moment: string;
}

export interface SalesPoint {
  message: string;
  type: "result" | "feature" | "benefit";
}

export interface PlotIdea {
  id: string;
  hook: string;
  concept: string;
  selected?: boolean;
}

export interface ScriptLine {
  id: string;
  line: string;
  section: "hook" | "body" | "cta" | "ending";
}

export interface ImagePromptRow {
  scriptLine: string;
  promptIdea1: string;
  promptIdea2: string;
  promptIdea3: string;
  selectedPrompt?: string;
  generatedUrl?: string;
}

export interface PlotSkeletonData {
  step: number;
  targetAudience?: string;
  product?: string;
  painPoints?: PainPoint[];
  salesPoints?: SalesPoint[];
  adCategory?: AdCategory;
  plotIdeas?: PlotIdea[];
  selectedPlot?: PlotIdea;
  script?: ScriptLine[];
  humorScript?: ScriptLine[];
  imagePrompts?: ImagePromptRow[];
  campaignSet?: CampaignSet;
}

// ==================== WORKFLOW TYPES ====================

export interface WorkflowNode {
  id: string;
  type: "input" | "generator" | "transformer" | "output";
  label: string;
  data: any;
  position: { x: number; y: number };
  connections: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  createdAt: string;
  updatedAt: string;
}

// ==================== VERSION CONTROL TYPES ====================

export interface Version {
  id: string;
  timestamp: string;
  type: "campaign" | "content" | "shot" | "prompt";
  entityId: string;
  data: any;
  message?: string;
}

export interface VersionHistory {
  entityId: string;
  versions: Version[];
}

// ==================== USER & COLLABORATION TYPES ====================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer";
}

export interface Comment {
  id: string;
  userId: string;
  entityId: string;
  entityType: "campaign" | "content" | "shot";
  text: string;
  timestamp: string;
}

export interface Workspace {
  id: string;
  name: string;
  members: User[];
  campaigns: string[];
  createdAt: string;
}

// ==================== TEMPLATE TYPES ====================

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  data: Partial<GenerationOptions> | Partial<PlotSkeletonData>;
  type: "quick" | "coconut";
}
