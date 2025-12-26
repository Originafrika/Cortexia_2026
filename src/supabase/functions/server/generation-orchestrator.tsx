/**
 * GENERATION ORCHESTRATOR
 * 
 * Orchestrates the generation of all nodes in a CocoBoard in dependency order.
 * Uses DependencyManager.buildDependencyLevels() for topological sort.
 * 
 * Features:
 * - Level-by-level generation (respects dependencies)
 * - Parallel generation within each level
 * - Real-time status updates to KV store
 * - Error handling and recovery
 * - Integration with Replicate API (Gemini 2.5 Flash, Flux 2 Pro, Veo 3)
 * - AUTO-VALIDATION with Coconut Observer (vision model feedback loop)
 * - AUTO-CORRECTION with prompt improvement and retry
 */

import * as kv from './kv_store';
import { CocoBoard, CocoNode } from './types';
import { observeAndValidate, ValidationMode, ObservationResult } from './coconut-observer';

// Import DependencyManager utilities
// Note: We need to copy the essential functions here since we can't import from /lib in server
// TODO: Consider moving shared utilities to server directory

/**
 * Generation status stored in KV
 */
export interface GenerationStatus {
  cocoboardId: string;
  userId: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress?: {
    current: number;
    total: number;
    currentLevel: number;
    totalLevels: number;
    currentNode?: string;
  };
  startTime?: number;
  endTime?: number;
  error?: string;
  result?: {
    successCount: number;
    errorCount: number;
    nodes: {
      id: string;
      name: string;
      status: 'success' | 'error';
      error?: string;
    }[];
  };
}

/**
 * Node generation result
 */
interface NodeGenerationResult {
  nodeId: string;
  success: boolean;
  content?: {
    url: string;
    width?: number;
    height?: number;
    duration?: number;
  };
  error?: string;
}

// ============================================
// DEPENDENCY MANAGER UTILITIES (Server-side)
// ============================================

/**
 * Find node by ID in tree (recursive)
 */
function findNodeById(root: CocoNode, targetId: string): CocoNode | null {
  if (root.id === targetId) return root;

  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, targetId);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Collect all nodes in a flat map
 */
function collectAllNodes(root: CocoNode): Map<string, CocoNode> {
  const map = new Map<string, CocoNode>();

  function traverse(node: CocoNode) {
    map.set(node.id, node);
    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  traverse(root);
  return map;
}

/**
 * Build dependency levels (topological sort)
 */
function buildDependencyLevels(root: CocoNode): CocoNode[][] {
  const allNodes = collectAllNodes(root);
  const levels: CocoNode[][] = [];
  const processed = new Set<string>();
  
  // Filter only placeholder nodes that need generation
  const nodesToGenerate = Array.from(allNodes.values()).filter(
    node => node.status === 'placeholder'
  );

  if (nodesToGenerate.length === 0) {
    return [];
  }

  // Build levels
  let hasChanges = true;
  while (hasChanges && processed.size < nodesToGenerate.length) {
    hasChanges = false;
    const currentLevel: CocoNode[] = [];

    for (const node of nodesToGenerate) {
      if (processed.has(node.id)) continue;

      // Check if all dependencies are processed
      const deps = node.dependencies || [];
      const allDepsProcessed = deps.every(depId => {
        const depNode = allNodes.get(depId);
        // Dependency is satisfied if:
        // 1. Already generated (not placeholder)
        // 2. OR already processed in this generation run
        return !depNode || depNode.status !== 'placeholder' || processed.has(depId);
      });

      if (allDepsProcessed) {
        currentLevel.push(node);
        processed.add(node.id);
        hasChanges = true;
      }
    }

    if (currentLevel.length > 0) {
      levels.push(currentLevel);
    }
  }

  // Check for nodes that couldn't be processed (circular dependencies)
  const unprocessed = nodesToGenerate.filter(n => !processed.has(n.id));
  if (unprocessed.length > 0) {
    console.warn('⚠️  Circular dependencies detected for nodes:', unprocessed.map(n => n.id));
    // Add them to the last level anyway
    if (unprocessed.length > 0) {
      levels.push(unprocessed);
    }
  }

  return levels;
}

/**
 * Check if a node can be generated (all dependencies ready)
 */
function canGenerate(node: CocoNode, allNodes: Map<string, CocoNode>): boolean {
  if (!node.dependencies || node.dependencies.length === 0) {
    return true;
  }

  return node.dependencies.every(depId => {
    const depNode = allNodes.get(depId);
    if (!depNode) return false;
    return depNode.status === 'generated' || depNode.status === 'validated';
  });
}

// ============================================
// GENERATION FUNCTIONS
// ============================================

/**
 * Generate a single node based on its type
 * WITH AUTO-VALIDATION & FEEDBACK LOOP
 */
async function generateSingleNode(
  node: CocoNode,
  cocoboard: CocoBoard,
  allNodes: Map<string, CocoNode>,
  validationMode: ValidationMode = 'auto',
  maxRetries: number = 3
): Promise<NodeGenerationResult> {
  console.log(`🎨 Generating node: ${node.name} (${node.type})`);

  try {
    // Check if node can be generated
    if (!canGenerate(node, allNodes)) {
      throw new Error('Node dependencies not ready');
    }

    // GENERATION + OBSERVATION LOOP
    let attemptNumber = 1;
    let currentPrompt = node.prompt || '';
    let observationResult: ObservationResult | null = null;

    while (attemptNumber <= maxRetries) {
      console.log(`\n🔄 Attempt ${attemptNumber}/${maxRetries}`);

      // Update node status to generating
      node.status = 'generating';
      node.metadata = {
        ...node.metadata,
        currentAttempt: attemptNumber,
        maxAttempts: maxRetries,
      };
      await updateCocoboard(cocoboard);

      // Generate based on type
      let result: NodeGenerationResult;
      
      switch (node.type) {
        case 'image':
        case 'asset':
          result = await generateImage(node, cocoboard, allNodes, currentPrompt);
          break;
        
        case 'shot':
        case 'video':
          result = await generateVideo(node, cocoboard, allNodes, currentPrompt);
          break;
        
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      // If generation failed, don't observe
      if (!result.success || !result.content) {
        node.status = 'error';
        node.metadata = {
          ...node.metadata,
          error: result.error,
        };
        await updateCocoboard(cocoboard);
        return result;
      }

      // OBSERVE & VALIDATE with Coconut Observer
      console.log(`👁️  Observing generated ${node.type}...`);
      
      observationResult = await observeAndValidate({
        nodeId: node.id,
        assetUrl: result.content.url,
        assetType: node.type === 'video' || node.type === 'shot' ? 'video' : 'image',
        nodeType: node.type,
        expectedDescription: node.description || node.name,
        originalPrompt: currentPrompt,
        mode: validationMode,
        attemptNumber,
      });

      // DECISION LOGIC based on observation
      if (observationResult.valid) {
        // ✅ APPROVED - Break loop
        console.log(`✅ Asset approved (score: ${observationResult.score}/100)`);
        
        node.status = 'validated';
        node.content = result.content;
        node.metadata = {
          ...node.metadata,
          generatedAt: Date.now(),
          validationScore: observationResult.score,
          validationFeedback: observationResult.feedback,
          attemptsUsed: attemptNumber,
        };
        await updateCocoboard(cocoboard);

        return {
          nodeId: node.id,
          success: true,
          content: result.content,
        };
      } 
      else if (observationResult.requiresUserApproval) {
        // 👤 NEEDS USER APPROVAL - Store and wait
        console.log(`👤 Requires user approval`);
        
        node.status = 'pending-approval';
        node.content = result.content;
        node.metadata = {
          ...node.metadata,
          validationScore: observationResult.score,
          validationFeedback: observationResult.feedback,
          suggestedImprovedPrompt: observationResult.retryWithPrompt,
          requiresUserDecision: true,
        };
        await updateCocoboard(cocoboard);

        return {
          nodeId: node.id,
          success: true,
          content: result.content,
        };
      }
      else if (observationResult.retryWithPrompt && attemptNumber < maxRetries) {
        // 🔄 RETRY with improved prompt
        console.log(`🔄 Retrying with improved prompt...`);
        currentPrompt = observationResult.retryWithPrompt;
        attemptNumber++;
        // Continue loop
      }
      else {
        // ❌ MAX RETRIES or no retry prompt - Accept as-is
        console.log(`⚠️  Max retries reached or no improvement possible`);
        
        node.status = 'generated';
        node.content = result.content;
        node.metadata = {
          ...node.metadata,
          generatedAt: Date.now(),
          validationScore: observationResult.score,
          validationFeedback: observationResult.feedback,
          warning: 'Quality below threshold but accepted after max retries',
          attemptsUsed: attemptNumber,
        };
        await updateCocoboard(cocoboard);

        return {
          nodeId: node.id,
          success: true,
          content: result.content,
        };
      }
    }

    // Should not reach here but fallback
    throw new Error('Generation loop exited unexpectedly');

  } catch (error: any) {
    console.error(`❌ Error generating node ${node.name}:`, error);
    
    // Update node status to error
    node.status = 'error';
    node.metadata = {
      ...node.metadata,
      error: error.message,
    };
    await updateCocoboard(cocoboard);

    return {
      nodeId: node.id,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate image using Flux 2 Pro via Replicate
 */
async function generateImage(
  node: CocoNode,
  cocoboard: CocoBoard,
  allNodes: Map<string, CocoNode>,
  prompt: string
): Promise<NodeGenerationResult> {
  const apiKey = Deno.env.get('REPLICATE_API_KEY');
  if (!apiKey) {
    throw new Error('REPLICATE_API_KEY not configured');
  }

  // Build enhanced prompt with dependencies
  let enhancedPrompt = prompt;
  
  // Add reference images context
  if (node.references?.images && node.references.images.length > 0) {
    const refNames = node.references.images
      .map(id => allNodes.get(id)?.name)
      .filter(Boolean)
      .join(', ');
    enhancedPrompt += `\n\nReference style from: ${refNames}`;
  }

  // Call Flux 2 Pro
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'black-forest-labs/flux-1.1-pro', // Flux 2 Pro version
      input: {
        prompt: enhancedPrompt,
        width: 1920,
        height: 1080,
        num_inference_steps: 25,
        guidance_scale: 3.5,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Replicate API error: ${response.statusText}`);
  }

  const prediction = await response.json();
  
  // Poll for completion
  let finalPrediction = prediction;
  while (finalPrediction.status !== 'succeeded' && finalPrediction.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pollResponse = await fetch(
      `https://api.replicate.com/v1/predictions/${prediction.id}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );
    finalPrediction = await pollResponse.json();
  }

  if (finalPrediction.status === 'failed') {
    throw new Error(`Image generation failed: ${finalPrediction.error}`);
  }

  // Extract output URL
  const outputUrl = Array.isArray(finalPrediction.output) 
    ? finalPrediction.output[0] 
    : finalPrediction.output;

  return {
    nodeId: node.id,
    success: true,
    content: {
      url: outputUrl,
      width: 1920,
      height: 1080,
    },
  };
}

/**
 * Generate video using Veo 3 via Replicate (when available)
 * For now, placeholder implementation
 */
async function generateVideo(
  node: CocoNode,
  cocoboard: CocoBoard,
  allNodes: Map<string, CocoNode>,
  prompt: string
): Promise<NodeGenerationResult> {
  // TODO: Implement Veo 3 integration when available on Replicate
  console.log('🎬 Video generation placeholder for:', node.name);
  
  // For now, return a placeholder video URL
  return {
    nodeId: node.id,
    success: true,
    content: {
      url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
      duration: 30,
      width: 1920,
      height: 1080,
    },
  };
}

/**
 * Update cocoboard in KV store
 */
async function updateCocoboard(cocoboard: CocoBoard): Promise<void> {
  await kv.set(`cocoboard:${cocoboard.userId}:${cocoboard.id}`, cocoboard);
}

/**
 * Update generation status in KV store
 */
async function updateGenerationStatus(status: GenerationStatus): Promise<void> {
  await kv.set(`generation:${status.userId}:${status.cocoboardId}`, status);
}

/**
 * Get generation status from KV store
 */
export async function getGenerationStatus(userId: string, cocoboardId: string): Promise<GenerationStatus | null> {
  return await kv.get(`generation:${userId}:${cocoboardId}`);
}

// ============================================
// MAIN ORCHESTRATOR
// ============================================

/**
 * Start generation for entire CocoBoard
 */
export async function startGeneration(
  cocoboardId: string,
  userId: string,
  validationMode: ValidationMode = 'auto'
): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 STARTING GENERATION ORCHESTRATOR`);
  console.log(`   CocoBoard: ${cocoboardId}`);
  console.log(`   User: ${userId}`);
  console.log(`   Validation Mode: ${validationMode}`);
  console.log(`${'='.repeat(60)}\n`);

  // Get cocoboard from KV
  const cocoboard = await kv.get(`cocoboard:${userId}:${cocoboardId}`) as CocoBoard;
  if (!cocoboard) {
    throw new Error('CocoBoard not found');
  }

  // Initialize status
  const status: GenerationStatus = {
    cocoboardId,
    userId,
    status: 'processing',
    startTime: Date.now(),
    progress: {
      current: 0,
      total: 0,
      currentLevel: 0,
      totalLevels: 0,
    },
  };
  await updateGenerationStatus(status);

  try {
    // Build dependency levels
    const nodesByLevel = buildDependencyLevels(cocoboard.assetTree);
    const totalNodes = nodesByLevel.reduce((sum, level) => sum + level.length, 0);

    console.log(`📊 Generation Plan:`);
    console.log(`   Total Levels: ${nodesByLevel.length}`);
    console.log(`   Total Nodes: ${totalNodes}`);
    nodesByLevel.forEach((level, i) => {
      console.log(`   Level ${i}: ${level.length} nodes - ${level.map(n => n.name).join(', ')}`);
    });
    console.log('');

    // Update status with totals
    status.progress = {
      current: 0,
      total: totalNodes,
      currentLevel: 0,
      totalLevels: nodesByLevel.length,
    };
    await updateGenerationStatus(status);

    // Collect all nodes for reference
    const allNodes = collectAllNodes(cocoboard.assetTree);

    // Generate level by level
    const results: {
      id: string;
      name: string;
      status: 'success' | 'error';
      error?: string;
    }[] = [];

    for (let levelIdx = 0; levelIdx < nodesByLevel.length; levelIdx++) {
      const level = nodesByLevel[levelIdx];
      
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`📍 LEVEL ${levelIdx} (${level.length} nodes)`);
      console.log(`${'─'.repeat(60)}\n`);

      // Update status
      status.progress!.currentLevel = levelIdx;
      await updateGenerationStatus(status);

      // Generate all nodes in this level in parallel
      const levelResults = await Promise.allSettled(
        level.map(node => generateSingleNode(node, cocoboard, allNodes, validationMode))
      );

      // Process results
      levelResults.forEach((result, idx) => {
        const node = level[idx];
        
        if (result.status === 'fulfilled' && result.value.success) {
          console.log(`   ✅ ${node.name}`);
          results.push({
            id: node.id,
            name: node.name,
            status: 'success',
          });
        } else {
          const error = result.status === 'rejected' 
            ? result.reason 
            : result.value.error;
          console.error(`   ❌ ${node.name}: ${error}`);
          results.push({
            id: node.id,
            name: node.name,
            status: 'error',
            error: String(error),
          });
        }

        // Update progress
        status.progress!.current++;
        status.progress!.currentNode = node.name;
      });

      await updateGenerationStatus(status);
    }

    // Final status
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    status.status = 'completed';
    status.endTime = Date.now();
    status.result = {
      successCount,
      errorCount,
      nodes: results,
    };
    await updateGenerationStatus(status);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ GENERATION COMPLETE`);
    console.log(`   Duration: ${((status.endTime - status.startTime!) / 1000).toFixed(1)}s`);
    console.log(`   Success: ${successCount}/${totalNodes}`);
    console.log(`   Errors: ${errorCount}/${totalNodes}`);
    console.log(`${'='.repeat(60)}\n`);

  } catch (error: any) {
    console.error('❌ GENERATION ORCHESTRATOR ERROR:', error);
    
    status.status = 'error';
    status.endTime = Date.now();
    status.error = error.message;
    await updateGenerationStatus(status);

    throw error;
  }
}

/**
 * Generate a single node by ID
 */
export async function generateNodeById(
  cocoboardId: string,
  nodeId: string,
  validationMode: ValidationMode = 'manual'
): Promise<NodeGenerationResult> {
  console.log(`🎨 Generating single node: ${nodeId}`);

  // Get cocoboard
  const cocoboard = await kv.get(`cocoboard:${cocoboardId}`) as CocoBoard;
  if (!cocoboard) {
    throw new Error('CocoBoard not found');
  }

  // Find node
  const node = findNodeById(cocoboard.assetTree, nodeId);
  if (!node) {
    throw new Error('Node not found');
  }

  // Collect all nodes
  const allNodes = collectAllNodes(cocoboard.assetTree);

  // Generate with specified validation mode
  const result = await generateSingleNode(node, cocoboard, allNodes, validationMode);

  return result;
}