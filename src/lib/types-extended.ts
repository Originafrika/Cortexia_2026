// Extended Types for Coconut Pro - Multi-Modal Generation

import type { 
  MediaType, 
  AspectRatio, 
  StylePreset, 
  GenerationStatus,
  Campaign,
  Content,
  Shot
} from "./types";

// ==================== MULTI-MODAL GENERATION TYPES ====================

export type GenerationType = 
  | "text-to-image"
  | "multi-image-to-image"
  | "image-audio-to-avatar"
  | "video-audio-to-lipsync"
  | "image-audio-to-video"
  | "text-to-video"
  | "image-prompt-to-video";

export interface AudioInput {
  id: string;
  type: "voiceover" | "music" | "sfx" | "ambient";
  url?: string;
  description?: string;
  duration?: number;
  // If to be generated
  prompt?: string;
  mood?: string;
  style?: string;
}

export interface VideoInput {
  id: string;
  url: string;
  duration: number;
  format: AspectRatio;
  hasAudio: boolean;
}

export interface AvatarGenerationOptions {
  provider: "heygen" | "d-id" | "synthesia";
  avatarId?: string;
  voice?: string;
  language?: string;
  emotion?: "neutral" | "happy" | "serious" | "excited";
}

export interface LipsyncGenerationOptions {
  provider: "wav2lip" | "sadtalker";
  faceDetection: boolean;
  qualityEnhancement: boolean;
}

export interface VideoGenerationOptions {
  provider: "runway" | "luma" | "kling" | "pika";
  duration: number; // max 10s
  fps: number;
  motion: "low" | "medium" | "high";
  cameraMovement?: CameraMovement;
}

// ==================== CINEMATOGRAPHY TYPES ====================

export type ShotType = 
  | "extreme-wide"
  | "wide"
  | "full-shot"
  | "medium-wide"
  | "medium"
  | "medium-close"
  | "close-up"
  | "extreme-close-up"
  | "pov"
  | "over-shoulder";

export type CameraMovement = 
  | "static"
  | "pan-left"
  | "pan-right"
  | "tilt-up"
  | "tilt-down"
  | "dolly-in"
  | "dolly-out"
  | "tracking"
  | "crane"
  | "handheld"
  | "steadicam";

export type LightingSetup = 
  | "three-point"
  | "rembrandt"
  | "butterfly"
  | "loop"
  | "split"
  | "rim"
  | "silhouette"
  | "natural"
  | "low-key"
  | "high-key";

export interface CameraSetup {
  shotType: ShotType;
  movement: CameraMovement;
  lens?: string; // "24mm", "50mm", "85mm"
  angle?: "low" | "eye-level" | "high" | "dutch";
  depth?: "shallow" | "medium" | "deep";
}

export interface LightingConfig {
  setup: LightingSetup;
  mood: "bright" | "neutral" | "dark" | "dramatic" | "ethereal";
  colorTemp?: "warm" | "neutral" | "cool";
  contrast?: "low" | "medium" | "high";
}

// ==================== FRAME CONTINUITY (KLING-LIKE) ====================

export interface FrameContinuity {
  enabled: boolean;
  startFrame?: {
    source: "shot" | "image" | "generated";
    id: string;
    framePosition?: "first" | "last" | number; // frame number
  };
  endFrame?: {
    captureForNext: boolean;
  };
  transitionType: "cut" | "dissolve" | "fade" | "wipe" | "match-cut";
  transitionDuration?: number; // in frames
}

// ==================== ENHANCED SHOT WITH MULTI-MODAL ====================

export interface ShotEnhanced extends Omit<Shot, 'prompt' | 'assets'> {
  // Cinematography
  camera: CameraSetup;
  lighting: LightingConfig;
  composition: string;
  colorGrade?: string;
  
  // Function in story
  function: "hook" | "build" | "climax" | "resolution" | "transition" | "cta";
  narrative: string;
  mood: string;
  
  // Multi-modal inputs
  inputs: {
    images: ImageInput[];
    audio?: AudioInput;
    video?: VideoInput;
  };
  
  // Generation
  generationType: GenerationType;
  generationOptions: 
    | VideoGenerationOptions 
    | AvatarGenerationOptions 
    | LipsyncGenerationOptions;
  
  // Enhanced prompts
  prompts: {
    main: string;              // Ultra-enhanced prompt
    negative?: string;         // What to avoid
    style: string;             // Cinematic style description
    technical: string;         // Technical parameters
  };
  
  // Frame continuity
  continuity: FrameContinuity;
  
  // Output
  output?: {
    url: string;
    thumbnailUrl?: string;
    duration?: number;
    status: GenerationStatus;
    metadata?: {
      actualFps?: number;
      resolution?: string;
      fileSize?: number;
    };
  };
}

// ==================== IMAGE INPUT WITH RECURSION ====================

export interface ImageInput {
  id: string;
  type: "user-provided" | "to-generate" | "previous-shot-frame";
  
  // If user-provided
  url?: string;
  metadata?: {
    originalFilename?: string;
    uploadedAt?: string;
    dimensions?: { width: number; height: number };
  };
  
  // If to-generate (RECURSION)
  generationCard?: ImageGenerationCard;
  
  // If from previous shot
  frameReference?: {
    shotId: string;
    position: "first" | "last" | number;
  };
}

export interface ImageGenerationCard {
  id: string;
  description: string;
  narrative?: string;
  
  // Inputs for this image generation
  inputs: {
    baseImages?: string[];     // For img2img
    referenceImages?: string[];
    audio?: AudioInput;        // If image+audio generation
  };
  
  // Prompts
  prompts: {
    main: string;
    negative?: string;
    style: string;
  };
  
  // Options
  options: {
    style: StylePreset;
    ratio: AspectRatio;
    quality: "standard" | "high" | "ultra";
    seed?: number;
  };
  
  // Output
  output?: {
    url: string;
    status: GenerationStatus;
    variants?: string[]; // Alternative generations
  };
}

// ==================== KNOWLEDGE BASE TYPES ====================

export interface KnowledgeBase {
  cinematography: {
    shotTypes: Record<ShotType, string>;
    cameraMovements: Record<CameraMovement, string>;
    lightingSetups: Record<LightingSetup, string>;
    lensChoices: { focal: string; usage: string; feel: string }[];
  };
  
  soundDesign: {
    musicMoods: string[];
    soundEffects: string[];
    voiceoverStyles: string[];
    mixingTechniques: string[];
  };
  
  storytelling: {
    archetypes: string[];
    hooks: string[];
    transitions: string[];
    pacing: string[];
    emotionalBeats: string[];
  };
  
  filmmaking: {
    genres: Record<string, { description: string; conventions: string[] }>;
    styles: Record<string, { description: string; characteristics: string[] }>;
    formats: Record<AspectRatio, { name: string; usage: string }>;
  };
  
  commercial: {
    adTypes: string[];
    brandStrategies: string[];
    callToActions: string[];
    targetAudiences: Record<string, string>;
  };
}

// ==================== RAG ENHANCEMENT ====================

export interface RAGContext {
  relevantKnowledge: string[];
  cinematicReferences: string[];
  styleGuidelines: string[];
  technicalBestPractices: string[];
}

export interface EnhancedPromptResult {
  originalPrompt: string;
  enhancedPrompt: string;
  ragContext: RAGContext;
  improvements: string[];
  confidence: number;
}

// ==================== COCOBLEND ASSEMBLY ====================

export interface TimelineEvent {
  id: string;
  type: "shot" | "transition" | "audio" | "text" | "effect";
  startTime: number;  // in seconds
  duration: number;
  shotId?: string;
  config?: any;
}

export interface TransitionConfig {
  id: string;
  type: "cut" | "dissolve" | "fade" | "wipe" | "match-cut";
  duration: number;  // in frames
  fromShotId: string;
  toShotId: string;
}

export interface AudioMixConfig {
  tracks: AudioTrack[];
  masterVolume: number;
  fadeIn?: number;
  fadeOut?: number;
}

export interface AudioTrack {
  id: string;
  type: "dialogue" | "music" | "sfx" | "ambient";
  url: string;
  startTime: number;
  duration: number;
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
}

export interface ColorGradeConfig {
  preset?: "cinematic" | "warm" | "cool" | "vintage" | "modern" | "custom";
  lut?: string; // URL to LUT file
  adjustments?: {
    exposure?: number;
    contrast?: number;
    saturation?: number;
    temperature?: number;
    tint?: number;
  };
}

export interface VideoFormat {
  resolution: "720p" | "1080p" | "4k";
  fps: number;
  ratio: AspectRatio;
  codec: "h264" | "h265" | "prores";
  bitrate?: number;
}

export interface CocoBlendProject {
  id: string;
  name: string;
  shots: ShotEnhanced[];
  timeline: TimelineEvent[];
  
  assembly: {
    transitions: TransitionConfig[];
    audioMix: AudioMixConfig;
    colorGrading: ColorGradeConfig;
    timingAdjustments?: { shotId: string; newDuration: number }[];
  };
  
  output: {
    format: VideoFormat;
    quality: "draft" | "preview" | "final";
    url?: string;
    status: GenerationStatus;
  };
}

// ==================== CAMPAIGN SET ENHANCED ====================

export interface CampaignSetEnhanced {
  id: string;
  title: string;
  description: string;
  
  // Analysis from Coconut
  analysis: {
    userRequest: {
      original: string;
      interpreted: BriefStructured;
      clarifyingQuestions?: string[];
    };
    
    finalResult: {
      type: "image" | "video" | "campaign";
      description: string;
      format: string;
      duration?: string;
      deliverables: string[];
      preview?: string;
    };
    
    strategy: {
      approach: string;
      keyElements: string[];
      cinematicReferences: string[];
      targetEmotion: string;
    };
  };
  
  // Campaigns with enhanced content
  campaigns: CampaignEnhanced[];
  
  createdAt: string;
  updatedAt: string;
  status: "draft" | "generating" | "completed" | "error";
}

export interface CampaignEnhanced extends Omit<Campaign, 'contents'> {
  contents: ContentEnhanced[];
}

export interface ContentEnhanced extends Omit<Content, 'shots'> {
  shots?: ShotEnhanced[];
  
  // For image content
  imageGeneration?: ImageGenerationCard;
  
  // Assembly if multi-shot video
  assembly?: CocoBlendProject;
}

export interface BriefStructured {
  objective: string;
  audience: string;
  channels: string[];
  content_types: string[];
  style: string;
  tone: string;
  duration?: string;
  budget?: string;
  deadline?: string;
  brandGuidelines?: {
    colors?: string[];
    fonts?: string[];
    logos?: string[];
    doNot?: string[];
  };
}
