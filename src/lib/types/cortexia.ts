/**
 * CORTEXIA TYPES - Coconut V9
 * Types pour le système de création multimodale
 */

export type ContentType = 'image' | 'video' | 'campaign';

export type CreationMode = 'auto' | 'semi-auto' | 'manual';

export interface UserIntent {
  raw: string;
  type?: ContentType;
  complexity?: 'simple' | 'medium' | 'complex';
}

export interface AIAnalysis {
  detectedType: ContentType;
  suggestedMode: CreationMode;
  breakdown: {
    mainGoal: string;
    subGoals: string[];
    requirements: string[];
    estimatedAssets: number;
  };
  confidence: number;
}

export interface Asset {
  id: string;
  type: 'image' | 'video';
  title: string;
  description: string;
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  thumbnail?: string;
  url?: string;
  dependencies?: string[]; // IDs of assets this depends on
  references?: string[]; // URLs of reference images
}

export interface Shot {
  id: string;
  order: number;
  title: string;
  description: string;
  duration?: number; // seconds for video
  cinematography?: {
    angle: string;
    movement: string;
    transition: string;
  };
  assets: Asset[];
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
}

export interface CocoBoard {
  id: string;
  title: string;
  type: ContentType;
  mode: CreationMode;
  userIntent: string;
  analysis: AIAnalysis;
  shots: Shot[];
  globalAssets: Asset[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'ready' | 'generating' | 'completed';
  progress: number; // 0-100
}

export interface CreationStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  status: 'pending' | 'active' | 'completed';
}
