/**
 * ENHANCED GENERATION ORCHESTRATOR
 * Supports: image-to-image, video-extend, composition, and full referenceImages handling
 */

import * as kv from './kv_store.tsx';
import * as fluxProvider from './flux-provider.tsx';
import * as veoService from './veo-service.tsx';
import * as geminiService from './gemini-service.ts';
import { observeAndValidate } from './coconut-observer.tsx';

interface EnhancedCocoNode {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video' | 'shot' | 'composition' | 'asset';
  
  generationType: {
    method: 'text-to-image' | 'image-to-image' | 'text-to-video' | 'image-to-video' | 'video-extend' | 'composition';
    requiresReference: boolean;
    referenceType?: 'user-upload' | 'generated' | 'previous-result';
  };
  
  prompt: string;
  negativePrompt?: string;
  
  dependencies: string[];
  referenceImages: Array<{
    source: 'user-upload' | 'generated' | 'previous-node';
    nodeId?: string;
    url?: string;
    purpose: 'style-reference' | 'starting-frame' | 'last-frame' | 'composition-layer';
  }>;
  
  level: number;
  
  metadata: {
    aspectRatio?: string;
    resolution?: string;
    style?: string;
    mood?: string;
    duration?: number;
    timestamp?: string;
    cameraMovement?: string;
    shotType?: string;
    transition?: string;
    startingFrame?: string;
    lastFrameOf?: string;
    extendsFrom?: string;
    layers?: string[];
    platform?: string;
    purpose?: string;
    model?: string;
    estimatedCredits?: number;
  };
  
  status: 'pending' | 'generating' | 'validating' | 'completed' | 'failed';
  result?: {
    url: string;
    dimensions?: { width: number; height: number };
    duration?: number;
    validationScore?: number;
    feedback?: string;
  };
  
  retryCount: number;
  suggestedImprovedPrompt?: string;
}

interface EnhancedCocoBoard {
  id: string;
  vision: string;
  outputType: 'image' | 'video' | 'campaign';
  nodes: EnhancedCocoNode[];
  maxLevel: number;
  settings: {
    mode: 'auto' | 'semi-auto' | 'manual';
    qualityTarget: 'fast' | 'balanced' | 'quality';
    validationThreshold: number;
  };
  status: 'draft' | 'generating' | 'validating' | 'completed' | 'failed';
  progress: {
    completed: number;
    total: number;
    currentLevel: number;
    currentNode: string | null;
  };
}

/**
 * Helper: Get reference image URL from referenceImages array
 */
async function getRefImageUrl(
  ref: { source: string; nodeId?: string; url?: string; purpose: string },
  board: EnhancedCocoBoard
): Promise<string> {
  if (ref.source === 'user-upload' && ref.url) {
    return ref.url;
  } else if ((ref.source === 'previous-node' || ref.source === 'generated') && ref.nodeId) {
    const node = board.nodes.find(n => n.id === ref.nodeId);
    if (!node?.result?.url) {
      throw new Error(`Reference node ${ref.nodeId} not generated yet or missing result`);
    }
    return node.result.url;
  }
  throw new Error('Invalid reference: missing url or nodeId');
}

/**
 * Helper: Get starting frame URL for video
 */
async function getStartingFrameUrl(
  node: EnhancedCocoNode,
  board: EnhancedCocoBoard
): Promise<string | null> {
  // Check metadata.startingFrame first
  if (node.metadata.startingFrame) {
    const frameNode = board.nodes.find(n => n.id === node.metadata.startingFrame);
    if (frameNode?.result?.url) {
      console.log(`  → Using starting frame from node: ${frameNode.title}`);
      return frameNode.result.url;
    }
  }
  
  // Check referenceImages for starting-frame purpose
  const startingFrameRef = node.referenceImages.find(ref => ref.purpose === 'starting-frame');
  if (startingFrameRef) {
    const url = await getRefImageUrl(startingFrameRef, board);
    console.log(`  → Using starting frame from referenceImages`);
    return url;
  }
  
  return null;
}

/**
 * Helper: Get last frame URL for video continuity
 */
async function getLastFrameUrl(
  node: EnhancedCocoNode,
  board: EnhancedCocoBoard
): Promise<string | null> {
  // Check metadata.lastFrameOf first
  if (node.metadata.lastFrameOf) {
    const lastFrameNode = board.nodes.find(n => n.id === node.metadata.lastFrameOf);
    if (lastFrameNode?.result?.url) {
      console.log(`  → Using last frame from node: ${lastFrameNode.title}`);
      return lastFrameNode.result.url;
    }
  }
  
  // Check referenceImages for last-frame purpose
  const lastFrameRef = node.referenceImages.find(ref => ref.purpose === 'last-frame');
  if (lastFrameRef) {
    const url = await getRefImageUrl(lastFrameRef, board);
    console.log(`  → Using last frame from referenceImages`);
    return url;
  }
  
  return null;
}

/**
 * Generate a single node with intelligent type routing
 */
export async function generateNode(
  node: EnhancedCocoNode,
  board: EnhancedCocoBoard
): Promise<{ url: string; dimensions?: { width: number; height: number }; duration?: number }> {
  const { generationType, referenceImages, metadata } = node;
  
  console.log(`\n🎨 Generating node: ${node.title}`);
  console.log(`   Type: ${node.type}`);
  console.log(`   Method: ${generationType.method}`);
  console.log(`   Level: ${node.level}`);
  
  try {
    switch (generationType.method) {
      case 'text-to-image': {
        console.log(`  → Text-to-Image generation`);
        const result = await fluxProvider.generateImage({
          prompt: node.prompt,
          negativePrompt: node.negativePrompt,
          aspectRatio: metadata.aspectRatio || '16:9',
          model: metadata.model === 'flux-2-pro' ? 'flux-2-pro' : undefined
        });
        return {
          url: result.url,
          dimensions: result.dimensions
        };
      }
      
      case 'image-to-image': {
        console.log(`  → Image-to-Image generation (using reference)`);
        
        // Get reference image
        const refImage = referenceImages[0];
        if (!refImage) {
          throw new Error('image-to-image requires reference image');
        }
        
        const refUrl = await getRefImageUrl(refImage, board);
        console.log(`  → Reference: ${refImage.purpose}`);
        
        const result = await fluxProvider.generateImageWithRef({
          prompt: node.prompt,
          referenceImage: refUrl,
          aspectRatio: metadata.aspectRatio || '16:9',
          strength: 0.7 // How much to follow reference (0-1)
        });
        
        return {
          url: result.url,
          dimensions: result.dimensions
        };
      }
      
      case 'text-to-video': {
        console.log(`  → Text-to-Video generation`);
        const result = await veoService.generateVideo({
          prompt: node.prompt,
          negativePrompt: node.negativePrompt,
          duration: metadata.duration || 5,
          aspectRatio: metadata.aspectRatio || '16:9',
          resolution: '720p'
        });
        return {
          url: result.url,
          duration: result.duration
        };
      }
      
      case 'image-to-video': {
        console.log(`  → Image-to-Video generation`);
        
        // Get starting frame
        const startingFrame = await getStartingFrameUrl(node, board);
        if (!startingFrame) {
          throw new Error('image-to-video requires starting frame');
        }
        
        // Get last frame for continuity (optional)
        const lastFrame = await getLastFrameUrl(node, board);
        
        const result = await veoService.generateVideoFromImage({
          prompt: node.prompt,
          negativePrompt: node.negativePrompt,
          image: startingFrame,
          lastFrame: lastFrame || undefined,
          duration: metadata.duration || 5,
          aspectRatio: metadata.aspectRatio || '16:9',
          resolution: '720p'
        });
        
        return {
          url: result.url,
          duration: result.duration
        };
      }
      
      case 'video-extend': {
        console.log(`  → Video Extend generation`);
        
        // Get video to extend
        const extendsFromId = metadata.extendsFrom;
        if (!extendsFromId) {
          throw new Error('video-extend requires extendsFrom metadata');
        }
        
        const previousNode = board.nodes.find(n => n.id === extendsFromId);
        if (!previousNode?.result?.url) {
          throw new Error(`Cannot extend: node ${extendsFromId} not generated or missing result`);
        }
        
        console.log(`  → Extending from: ${previousNode.title}`);
        
        const result = await veoService.extendVideo({
          videoUrl: previousNode.result.url,
          prompt: node.prompt,
          duration: metadata.duration || 5,
          aspectRatio: metadata.aspectRatio || '16:9'
        });
        
        return {
          url: result.url,
          duration: result.duration
        };
      }
      
      case 'composition': {
        console.log(`  → Composition (combine layers)`);
        
        // Get all layer URLs
        const layerIds = metadata.layers || [];
        if (layerIds.length === 0) {
          throw new Error('composition requires layers metadata');
        }
        
        const layers = await Promise.all(
          layerIds.map(async (layerId) => {
            const layerNode = board.nodes.find(n => n.id === layerId);
            if (!layerNode?.result?.url) {
              throw new Error(`Layer node ${layerId} not generated`);
            }
            return layerNode.result.url;
          })
        );
        
        console.log(`  → Combining ${layers.length} layers`);
        
        // TODO: Implement CocoBlend composition service
        // For now, use the last layer as result
        // In production, this would call a composition service
        const lastLayer = board.nodes.find(n => n.id === layerIds[layerIds.length - 1]);
        
        return {
          url: lastLayer!.result!.url,
          dimensions: lastLayer!.result!.dimensions
        };
      }
      
      default:
        throw new Error(`Unknown generation method: ${generationType.method}`);
    }
  } catch (error) {
    console.error(`❌ Node generation failed:`, error);
    throw error;
  }
}

/**
 * Build dependency levels (topological sort)
 */
function buildDependencyLevels(nodes: EnhancedCocoNode[]): EnhancedCocoNode[][] {
  const levels: EnhancedCocoNode[][] = [];
  const processed = new Set<string>();
  
  const nodesToGenerate = nodes.filter(n => n.status === 'pending');
  
  if (nodesToGenerate.length === 0) {
    return [];
  }
  
  let hasChanges = true;
  while (hasChanges && processed.size < nodesToGenerate.length) {
    hasChanges = false;
    const currentLevel: EnhancedCocoNode[] = [];
    
    for (const node of nodesToGenerate) {
      if (processed.has(node.id)) continue;
      
      // Check if all dependencies are processed
      const deps = node.dependencies || [];
      const allDepsProcessed = deps.every(depId => {
        return processed.has(depId) || nodes.find(n => n.id === depId)?.status === 'completed';
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
  
  return levels;
}

/**
 * Orchestrate full board generation
 */
export async function orchestrateGeneration(
  boardId: string,
  board: EnhancedCocoBoard
): Promise<void> {
  console.log(`🎯 Starting orchestration for board: ${boardId}`);
  console.log(`   Total nodes: ${board.nodes.length}`);
  console.log(`   Mode: ${board.settings.mode}`);
  console.log(`   Validation threshold: ${board.settings.validationThreshold}`);
  
  // Build dependency levels
  const levels = buildDependencyLevels(board.nodes);
  console.log(`   Dependency levels: ${levels.length}`);
  
  // Update board status
  board.status = 'generating';
  board.progress.total = board.nodes.length;
  board.progress.completed = 0;
  board.progress.currentLevel = 0;
  
  await kv.set(`cocoboard:${boardId}`, board);
  
  // Generate level by level
  for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
    const currentLevel = levels[levelIndex];
    console.log(`\n📊 Level ${levelIndex + 1}/${levels.length}: ${currentLevel.length} nodes`);
    
    board.progress.currentLevel = levelIndex;
    await kv.set(`cocoboard:${boardId}`, board);
    
    // Generate all nodes in current level in parallel
    const results = await Promise.allSettled(
      currentLevel.map(async (node) => {
        board.progress.currentNode = node.id;
        await kv.set(`cocoboard:${boardId}`, board);
        
        // Update node status
        node.status = 'generating';
        await kv.set(`cocoboard:${boardId}`, board);
        
        try {
          // Generate
          const result = await generateNode(node, board);
          
          // Update node with result
          node.result = result;
          node.status = 'validating';
          await kv.set(`cocoboard:${boardId}`, board);
          
          // Validate if auto mode
          if (board.settings.mode === 'auto') {
            console.log(`  ✅ Validating node: ${node.title}`);
            const validation = await observeAndValidate({
              assetUrl: result.url,
              assetType: node.type === 'video' || node.type === 'shot' ? 'video' : 'image',
              expectedPrompt: node.prompt,
              mode: 'auto',
              validationThreshold: board.settings.validationThreshold
            });
            
            node.result.validationScore = validation.score;
            node.result.feedback = validation.feedback;
            
            if (validation.approved) {
              node.status = 'completed';
              board.progress.completed++;
              console.log(`  ✅ Node completed: ${node.title} (score: ${validation.score})`);
            } else {
              // Auto-retry with improved prompt
              node.status = 'failed';
              node.suggestedImprovedPrompt = validation.suggestedPrompt;
              console.log(`  ⚠️ Node needs improvement: ${node.title} (score: ${validation.score})`);
              
              // TODO: Implement retry logic
            }
          } else {
            // Semi-auto or manual: mark as validating, wait for user approval
            node.status = 'validating';
            console.log(`  ⏸️ Node awaiting approval: ${node.title}`);
          }
          
          await kv.set(`cocoboard:${boardId}`, board);
          
          return { success: true, nodeId: node.id };
        } catch (error) {
          console.error(`  ❌ Node generation failed: ${node.title}`, error);
          node.status = 'failed';
          node.retryCount++;
          await kv.set(`cocoboard:${boardId}`, board);
          return { success: false, nodeId: node.id, error: String(error) };
        }
      })
    );
    
    // Check if any failed
    const failures = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
    if (failures.length > 0 && board.settings.mode === 'auto') {
      console.warn(`  ⚠️ ${failures.length} node(s) failed in level ${levelIndex + 1}`);
      // Continue anyway for now
    }
  }
  
  // Mark board as completed
  board.status = 'completed';
  board.progress.currentNode = null;
  await kv.set(`cocoboard:${boardId}`, board);
  
  console.log(`\n🎉 Orchestration complete for board: ${boardId}`);
  console.log(`   Completed: ${board.progress.completed}/${board.progress.total} nodes`);
}

/**
 * Generate single node (for manual mode)
 */
export async function generateSingleNode(
  boardId: string,
  nodeId: string
): Promise<void> {
  console.log(`🎯 Generating single node: ${nodeId} in board: ${boardId}`);
  
  // Fetch board
  const board = await kv.get<EnhancedCocoBoard>(`cocoboard:${boardId}`);
  if (!board) {
    throw new Error(`Board not found: ${boardId}`);
  }
  
  // Find node
  const node = board.nodes.find(n => n.id === nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  
  // Check dependencies
  const unmetDeps = node.dependencies.filter(depId => {
    const dep = board.nodes.find(n => n.id === depId);
    return !dep || dep.status !== 'completed';
  });
  
  if (unmetDeps.length > 0) {
    throw new Error(`Cannot generate: unmet dependencies: ${unmetDeps.join(', ')}`);
  }
  
  // Generate
  node.status = 'generating';
  await kv.set(`cocoboard:${boardId}`, board);
  
  try {
    const result = await generateNode(node, board);
    
    node.result = result;
    node.status = board.settings.mode === 'auto' ? 'validating' : 'completed';
    board.progress.completed++;
    
    // Auto-validate if auto mode
    if (board.settings.mode === 'auto') {
      const validation = await observeAndValidate({
        assetUrl: result.url,
        assetType: node.type === 'video' || node.type === 'shot' ? 'video' : 'image',
        expectedPrompt: node.prompt,
        mode: 'auto',
        validationThreshold: board.settings.validationThreshold
      });
      
      node.result.validationScore = validation.score;
      node.result.feedback = validation.feedback;
      node.status = validation.approved ? 'completed' : 'validating';
      node.suggestedImprovedPrompt = validation.suggestedPrompt;
    }
    
    await kv.set(`cocoboard:${boardId}`, board);
    
    console.log(`✅ Single node generation complete: ${node.title}`);
  } catch (error) {
    console.error(`❌ Single node generation failed:`, error);
    node.status = 'failed';
    node.retryCount++;
    await kv.set(`cocoboard:${boardId}`, board);
    throw error;
  }
}

/**
 * Approve node (for semi-auto mode)
 */
export async function approveNode(
  boardId: string,
  nodeId: string,
  approved: boolean
): Promise<void> {
  console.log(`${approved ? '✅' : '🔄'} ${approved ? 'Approving' : 'Regenerating'} node: ${nodeId}`);
  
  const board = await kv.get<EnhancedCocoBoard>(`cocoboard:${boardId}`);
  if (!board) {
    throw new Error(`Board not found: ${boardId}`);
  }
  
  const node = board.nodes.find(n => n.id === nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  
  if (approved) {
    node.status = 'completed';
    board.progress.completed++;
    await kv.set(`cocoboard:${boardId}`, board);
  } else {
    // Regenerate with improved prompt if available
    node.status = 'pending';
    if (node.suggestedImprovedPrompt) {
      node.prompt = node.suggestedImprovedPrompt;
      node.suggestedImprovedPrompt = undefined;
    }
    node.retryCount++;
    await kv.set(`cocoboard:${boardId}`, board);
    
    // Re-generate
    await generateSingleNode(boardId, nodeId);
  }
}
