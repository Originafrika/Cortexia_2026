/**
 * CORTEXIA API SERVICE
 * Real API integration for Coconut V9
 */

import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = '/api';

// ============================================
// TYPES (Re-export for convenience)
// ============================================

export interface AIAnalysis {
  type: 'image' | 'video' | 'campaign';
  reasoning: string;
  structure: {
    type: string;
    count: number;
    breakdown: Array<{
      nodeType: string;
      count: number;
    }>;
  };
  recommendations: {
    model: string;
    quality: 'fast' | 'balanced' | 'premium';
    estimatedCost: number;
    estimatedTime: number;
  };
  
  // ✅ ADVANCED FIELDS FROM BACKEND
  complexity?: 'simple' | 'moderate' | 'complex' | 'very-complex';
  passesRequired?: number;
  detectedNeeds?: string[];
  missingAssets?: Array<{
    type: string;
    description: string;
    purpose: string;
  }>;
  totalDuration?: number; // For videos
  objectiveType?: 'views' | 'engagement' | 'conversions' | 'brand-awareness' | 'mixed'; // For campaigns
  recommendedPlatforms?: string[]; // For campaigns
}

export interface CocoNode {
  id: string;
  title: string;
  description?: string;
  type: 'image' | 'video' | 'shot' | 'composition' | 'asset';
  
  generationType?: {
    method: 'text-to-image' | 'image-to-image' | 'text-to-video' | 'image-to-video' | 'video-extend' | 'composition';
    requiresReference: boolean;
    referenceType?: 'user-upload' | 'generated' | 'previous-result';
  };
  
  prompt: string;
  negativePrompt?: string;
  model: string;
  
  dependencies: string[];
  referenceImages?: Array<{
    source: 'user-upload' | 'generated' | 'previous-node';
    nodeId?: string;
    url?: string;
    purpose: 'style-reference' | 'starting-frame' | 'last-frame' | 'composition-layer';
  }>;
  
  level: number;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'validating';
  
  result?: {
    url: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    duration?: number;
    validationScore?: number;
    feedback?: string;
  };
  
  metadata: any;
  settings?: {
    duration?: number;
    aspectRatio?: string;
    qualityLevel?: string;
    resolution?: string;
    startFrame?: string;
    endFrame?: string;
  };
  
  retryCount: number;
  suggestedImprovedPrompt?: string;
}

export interface CocoBoard {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  status: 'draft' | 'generating' | 'completed' | 'error';
  analysis: AIAnalysis;
  nodes: CocoNode[];
  settings: {
    mode: 'auto' | 'semi-auto' | 'manual';
    autoValidation: boolean;
    qualityThreshold: number;
    maxRetries: number;
    referenceImages?: string[];
  };
  progress: {
    total: number;
    completed: number;
    generating: number;
    validating: number;
    failed: number;
    currentLevel: number;
    currentNode: string | null;
    startedAt?: number;
  };
}

// ============================================
// GENERATE COCOBOARD
// ============================================

/**
 * Generate complete CocoBoard structure from intent and analysis
 */
export async function generateCocoBoard(
  intent: string,
  analysis: AIAnalysis,
  mode: 'auto' | 'semi-auto' | 'manual',
  referenceImages?: string[]
): Promise<CocoBoard> {
  try {
    console.log('📤 [API] Generating CocoBoard with NEW /analyze endpoint');
    
    // ✅ RETRIEVE objective and assets stored in window
    const objective = (window as any).__coconut_objective as string | undefined;
    const userAssets = (window as any).__coconut_assets as Array<{ type: string; url: string }> | undefined;
    
    console.log('  📎 Assets:', userAssets?.length || 0);
    console.log('  🎯 Objective:', objective || 'none');
    
    // ✅ CALL NEW /analyze ENDPOINT
    const response = await fetch(
      `${API_BASE}/analyze`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intent,
          settings: {
            mode,
            qualityLevel: 'balanced',
            qualityThreshold: 70
          },
          userAssets, // ✅ NEW: Pass structured assets
          objective    // ✅ NEW: Pass campaign objective
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API] /analyze failed:', errorText);
      throw new Error(`Server analysis failed: ${response.status}`);
    }
    
    const { success, board: serverBoard } = await response.json();
    
    if (!success || !serverBoard) {
      throw new Error('Server returned invalid board');
    }
    
    console.log('✅ [API] Advanced board created:', serverBoard.id, `(${serverBoard.nodes.length} nodes)`);
    
    // Transform server board to match CocoBoard type
    const cocoBoard: CocoBoard = {
      id: serverBoard.id,
      title: serverBoard.title,
      description: serverBoard.analysis?.reasoning || '',
      createdAt: new Date(serverBoard.createdAt),
      status: serverBoard.status,
      analysis: {
        type: serverBoard.analysis.type,
        reasoning: serverBoard.analysis.reasoning,
        structure: serverBoard.analysis.structure,
        recommendations: serverBoard.analysis.recommendations,
        // ✅ PROPAGATE ADVANCED FIELDS
        complexity: serverBoard.analysis.complexity,
        passesRequired: serverBoard.analysis.passesRequired,
        detectedNeeds: serverBoard.analysis.detectedNeeds,
        missingAssets: serverBoard.analysis.missingAssets,
        totalDuration: serverBoard.analysis.totalDuration,
        objectiveType: serverBoard.analysis.objectiveType,
        recommendedPlatforms: serverBoard.analysis.recommendedPlatforms
      },
      nodes: serverBoard.nodes.map((node: any) => ({
        id: node.id,
        title: node.title,
        description: node.description,
        type: node.type,
        generationType: node.generationType,
        prompt: node.prompt,
        negativePrompt: node.negativePrompt,
        model: node.model,
        dependencies: node.dependencies || [],
        referenceImages: node.referenceImages || [],
        level: node.level,
        status: node.status,
        result: node.result,
        metadata: node.metadata || {},
        retryCount: node.retryCount || 0,
        suggestedImprovedPrompt: node.suggestedImprovedPrompt,
        settings: node.settings // ✅ SETTINGS INCLUDED!
      })),
      settings: {
        mode,
        autoValidation: true,
        qualityThreshold: 70,
        maxRetries: 2,
        referenceImages: referenceImages || []
      },
      progress: serverBoard.progress || {
        total: serverBoard.nodes.length,
        completed: 0,
        generating: 0,
        validating: 0,
        failed: 0,
        currentLevel: 0,
        currentNode: null,
        startedAt: Date.now()
      }
    };
    
    // Clear stored values
    delete (window as any).__coconut_objective;
    delete (window as any).__coconut_assets;
    
    return cocoBoard;
    
  } catch (error) {
    console.error('❌ [API] Board generation failed:', error);
    throw error;
  }
}

// ============================================
// START GENERATION
// ============================================

/**
 * Start automatic generation for a board
 */
export async function startGeneration(board: CocoBoard): Promise<{ jobId: string }> {
  try {
    console.log('📤 [API] Starting generation for board:', board.id);
    
    const response = await fetch(
      `${API_BASE}/start-generation/${board.id}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to start generation: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ [API] Generation started:', data.jobId);
    
    return { jobId: data.jobId || board.id };
  } catch (error) {
    console.error('❌ [API] Start generation failed:', error);
    throw error;
  }
}

// ============================================
// FETCH BOARD
// ============================================

/**
 * Fetch board with current state
 */
export async function fetchBoard(boardId: string): Promise<CocoBoard> {
  try {
    const response = await fetch(
      `${API_BASE}/board/${boardId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch board');
    }
    
    const { success, data } = await response.json();
    
    if (!success || !data) {
      throw new Error('Invalid board data');
    }
    
    // Transform to CocoBoard
    return {
      ...data,
      createdAt: new Date(data.createdAt)
    };
  } catch (error) {
    console.error('❌ [API] Fetch board failed:', error);
    throw error;
  }
}

// ============================================
// FETCH PROGRESS
// ============================================

/**
 * Fetch current progress for a board
 */
export async function fetchProgress(boardId: string): Promise<CocoBoard['progress']> {
  try {
    const board = await fetchBoard(boardId);
    return board.progress;
  } catch (error) {
    console.error('❌ [API] Fetch progress failed:', error);
    throw error;
  }
}

// ============================================
// GENERATE SINGLE NODE
// ============================================

/**
 * Generate a single node (manual mode)
 */
export async function generateSingleNode(boardId: string, nodeId: string): Promise<void> {
  try {
    console.log('📤 [API] Generating single node:', nodeId);
    
    const response = await fetch(
      `${API_BASE}/generate-node/${boardId}/${nodeId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate node: ${errorText}`);
    }
    
    console.log('✅ [API] Node generation started');
  } catch (error) {
    console.error('❌ [API] Generate node failed:', error);
    throw error;
  }
}

// ============================================
// APPROVE NODE (Semi-auto mode)
// ============================================

/**
 * Approve a node and continue generation
 */
export async function approveNode(boardId: string, nodeId: string, approved: boolean = true): Promise<void> {
  try {
    console.log('📤 [API] Approving node:', nodeId);
    
    const response = await fetch(
      `${API_BASE}/approve-node/${boardId}/${nodeId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to approve node: ${errorText}`);
    }
    
    console.log('✅ [API] Node approved');
  } catch (error) {
    console.error('❌ [API] Approve node failed:', error);
    throw error;
  }
}

// ============================================
// UPDATE NODE SETTINGS
// ============================================

/**
 * Update settings for a node
 */
export async function updateNodeSettings(
  boardId: string, 
  nodeId: string, 
  settings: Partial<CocoNode['settings']>
): Promise<void> {
  try {
    console.log('📤 [API] Updating node settings:', nodeId, settings);
    
    const response = await fetch(
      `${API_BASE}/update-node/${boardId}/${nodeId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update node: ${errorText}`);
    }
    
    console.log('✅ [API] Node settings updated');
  } catch (error) {
    console.error('❌ [API] Update node settings failed:', error);
    throw error;
  }
}

// ============================================
// APPLY IMPROVED PROMPT
// ============================================

/**
 * Apply improved prompt to a node
 */
export async function applyImprovedPrompt(
  boardId: string, 
  nodeId: string, 
  improvedPrompt: string
): Promise<void> {
  try {
    console.log('📤 [API] Applying improved prompt:', nodeId);
    
    const response = await fetch(
      `${API_BASE}/update-node/${boardId}/${nodeId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: improvedPrompt })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to apply improved prompt: ${errorText}`);
    }
    
    console.log('✅ [API] Improved prompt applied');
  } catch (error) {
    console.error('❌ [API] Apply improved prompt failed:', error);
    throw error;
  }
}

// ============================================
// RETRY NODE
// ============================================

/**
 * Retry generation for a failed node
 */
export async function retryNode(boardId: string, nodeId: string): Promise<void> {
  try {
    console.log('📤 [API] Retrying node:', nodeId);
    
    // First, reset status
    const response = await fetch(
      `${API_BASE}/update-node/${boardId}/${nodeId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'pending' })
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to reset node status');
    }
    
    // Then regenerate
    await generateSingleNode(boardId, nodeId);
    
    console.log('✅ [API] Node retry started');
  } catch (error) {
    console.error('❌ [API] Retry node failed:', error);
    throw error;
  }
}

// ============================================
// ANALYZE USER INTENT (Legacy support)
// ============================================

/**
 * Analyze user intent with REAL BACKEND CALL
 */
export async function analyzeUserIntent(
  intent: string,
  selectedType: 'auto' | 'image' | 'video' | 'campaign' = 'auto'
): Promise<AIAnalysis> {
  try {
    console.log(`🧠 [API] Calling /reasoning/analyze endpoint with type: ${selectedType}`);
    
    // If user selected 'auto', use word detection to suggest a type
    let outputType = selectedType;
    if (selectedType === 'auto') {
      outputType = detectType(intent) as any; // Auto-detect from intent
    }
    
    const response = await fetch(
      `${API_BASE}/reasoning/analyze`, // ✅ FIX: Add /analyze
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vision: intent,
          outputType, // Always send a concrete type (never undefined)
          mode: 'auto' // Default mode for initial analysis
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API] /reasoning failed:', errorText);
      throw new Error(`Backend reasoning failed: ${response.status}`);
    }
    
    const { success, data } = await response.json();
    
    if (!success || !data) {
      throw new Error('Backend returned invalid analysis');
    }
    
    console.log('✅ [API] Reasoning complete:', data.structure.count, 'nodes detected');
    
    // Transform backend response to AIAnalysis
    const analysis: AIAnalysis = {
      type: data.structure.type,
      reasoning: data.analysis?.reasoning || `Detected ${data.structure.type} creation with ${data.structure.count} nodes`,
      structure: data.structure,
      recommendations: {
        model: data.analysis?.recommendedModel || (data.structure.type === 'video' ? 'veo-3.1-fast' : 'flux-2-pro'),
        quality: 'balanced',
        estimatedCost: data.totalEstimatedCredits || 10,
        estimatedTime: (data.structure.count * 15) // Rough estimate: 15s per node
      }
    };
    
    return analysis;
    
  } catch (error) {
    console.error('❌ [API] analyzeUserIntent failed:', error);
    
    // Fallback to local detection
    console.warn('⚠️ [API] Falling back to local analysis');
    const type = selectedType === 'auto' ? detectType(intent) : (selectedType as 'image' | 'video' | 'campaign');
    
    return {
      type,
      reasoning: `Local fallback: Detected ${type} creation request`,
      structure: {
        type,
        count: type === 'video' ? 5 : type === 'campaign' ? 4 : 1,
        breakdown: [{ nodeType: type, count: 1 }]
      },
      recommendations: {
        model: type === 'video' ? 'veo-3.1-fast' : 'flux-2-pro',
        quality: 'balanced',
        estimatedCost: 10,
        estimatedTime: 60
      }
    };
  }
}

function detectType(intent: string): 'image' | 'video' | 'campaign' {
  const lower = intent.toLowerCase();
  
  if (lower.includes('campaign') || lower.includes('campagne')) {
    return 'campaign';
  }
  
  if (lower.includes('video') || lower.includes('vidéo') || lower.includes('clip')) {
    return 'video';
  }
  
  return 'image';
}

// ============================================
// ANALYZE REFERENCE IMAGES (Legacy support)
// ============================================

export interface ReferenceAnalysis {
  style: string;
  colors: string[];
  mood: string;
  composition: string;
  elements: string[];
  promptEnhancement: string;
}

export async function analyzeReferenceImages(images: string[]): Promise<ReferenceAnalysis> {
  // Simple mock for now
  return {
    style: 'modern',
    colors: ['#000000', '#FFFFFF'],
    mood: 'professional',
    composition: 'balanced',
    elements: [],
    promptEnhancement: ''
  };
}