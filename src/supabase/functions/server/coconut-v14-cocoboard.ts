// ============================================
// COCONUT V14 - COCOBOARD MANAGEMENT
// ============================================
// Service pour gérer les CocoBoardss (moodboards éditables)

import * as kv from './kv_store.tsx';
import type { 
  AnalysisResult,
  FluxPrompt,
  ColorPalette,
  AssetType
} from '../../../lib/types/coconut-v14.ts';

// ============================================
// COCOBOARD SCHEMA
// ============================================

export interface CocoBoardAsset {
  id: string;
  type: AssetType;
  description: string;
  status: 'available' | 'missing' | 'generating' | 'generated' | 'failed';
  
  // URLs
  url?: string;
  signedUrl?: string;
  thumbnailUrl?: string;
  
  // Source
  source: 'user-provided' | 'gemini-detected' | 'flux-generated';
  sourceReferenceId?: string;
  
  // Generation metadata (if flux-generated)
  generationMetadata?: {
    prompt: FluxPrompt;
    model: 'flux-2-pro';
    resolution: '1K' | '2K';
    generatedAt?: string;
    predictionId?: string;
  };
  
  // Editable
  editable: boolean;
  customDescription?: string;
}

export interface CocoBoardZone {
  id: string;
  name: string;
  position: string;
  description: string;
  
  // Visual specs
  width: string;
  height: string;
  x: string;
  y: string;
  
  // Assigned assets
  assetIds: string[];
  
  // Editable
  editable: boolean;
  customDescription?: string;
}

export interface CocoBoardConcept {
  direction: string;
  keyMessage: string;
  mood: string;
  
  // Editable
  editable: boolean;
  customDirection?: string;
  customKeyMessage?: string;
  customMood?: string;
}

export interface CocoBoardColorPalette {
  primary: string[];
  accent: string[];
  background: string[];
  text: string[];
  rationale: string;
  
  // Editable
  editable: boolean;
  customPrimary?: string[];
  customAccent?: string[];
  customBackground?: string[];
  customText?: string[];
  customRationale?: string;
}

export interface CocoBoardPrompt {
  scene: string;
  subjects: Array<{
    type?: string;
    description: string;
    position: string;
    color_palette?: string[];
    style?: string;
    references?: string[];
  }>;
  style: string;
  color_palette: string[];
  lighting: string;
  background?: string;
  composition: string;
  mood: string;
  camera?: {
    angle: string;
    lens: string;
    depth_of_field: string;
  };
  
  // Editable
  editable: boolean;
  customScene?: string;
  customStyle?: string;
  customLighting?: string;
  customComposition?: string;
  customMood?: string;
}

export interface CocoBoard {
  // Metadata
  id: string;
  projectId: string;
  userId: string;
  version: number;
  
  // Status
  status: 'draft' | 'ready' | 'generating' | 'completed';
  
  // Content (from Gemini analysis)
  projectTitle: string;
  concept: CocoBoardConcept;
  colorPalette: CocoBoardColorPalette;
  composition: {
    ratio: string;
    resolution: string;
    zones: CocoBoardZone[];
  };
  assets: CocoBoardAsset[];
  finalPrompt: CocoBoardPrompt;
  
  // Technical specs
  technicalSpecs: {
    model: 'flux-2-pro';
    mode: 'text-to-image' | 'image-to-image';
    ratio: string;
    resolution: '1K' | '2K';
    references: string[];
  };
  
  // Cost tracking
  estimatedCost: {
    analysis: number;
    assetsGeneration: number;
    finalGeneration: number;
    total: number;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // History
  previousVersions?: string[]; // IDs of previous versions
  changeLog?: Array<{
    timestamp: string;
    field: string;
    oldValue: any;
    newValue: any;
    userId: string;
  }>;
}

// ============================================
// CREATE COCOBOARD FROM ANALYSIS
// ============================================

/**
 * Créer un CocoBoard depuis les résultats Gemini
 */
export async function createCocoBoardFromAnalysis(
  projectId: string,
  userId: string,
  analysis: AnalysisResult
): Promise<CocoBoard> {
  console.log('🎨 Creating CocoBoard from analysis...');
  
  const cocoBoardId = `cocoboard-${projectId}-v1`;
  
  // Convert assets
  const assets: CocoBoardAsset[] = [
    // Available assets (user-provided)
    ...analysis.assetsRequired.available.map((asset, idx) => ({
      id: asset.id || `asset-available-${idx}`,
      type: asset.type,
      description: asset.description,
      status: 'available' as const,
      source: 'user-provided' as const,
      editable: true
    })),
    
    // Missing assets
    ...analysis.assetsRequired.missing.map((asset, idx) => ({
      id: asset.id || `asset-missing-${idx}`,
      type: asset.type,
      description: asset.description,
      status: 'missing' as const,
      source: 'gemini-detected' as const,
      editable: true,
      generationMetadata: asset.canBeGenerated && asset.promptFlux ? {
        prompt: asset.promptFlux,
        model: 'flux-2-pro' as const,
        resolution: analysis.technicalSpecs.resolution
      } : undefined
    }))
  ];
  
  // Convert composition zones
  const zones: CocoBoardZone[] = analysis.composition.zones.map((zone, idx) => ({
    id: `zone-${idx}`,
    name: zone.name,
    position: zone.position,
    description: zone.description,
    
    // Default visual specs (can be customized)
    width: '100%',
    height: 'auto',
    x: '0',
    y: '0',
    
    assetIds: [],
    editable: true
  }));
  
  const cocoBoard: CocoBoard = {
    // Metadata
    id: cocoBoardId,
    projectId,
    userId,
    version: 1,
    
    // Status
    status: 'draft',
    
    // Content
    projectTitle: analysis.projectTitle,
    concept: {
      direction: analysis.concept.direction,
      keyMessage: analysis.concept.keyMessage,
      mood: analysis.concept.mood,
      editable: true
    },
    colorPalette: {
      primary: analysis.colorPalette.primary,
      accent: analysis.colorPalette.accent,
      background: analysis.colorPalette.background,
      text: analysis.colorPalette.text,
      rationale: analysis.colorPalette.rationale,
      editable: true
    },
    composition: {
      ratio: analysis.composition.ratio,
      resolution: analysis.composition.resolution,
      zones
    },
    assets,
    finalPrompt: {
      ...analysis.finalPrompt,
      editable: true
    },
    
    // Technical specs
    technicalSpecs: analysis.technicalSpecs,
    
    // Cost tracking
    estimatedCost: analysis.estimatedCost,
    
    // Metadata
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: userId,
    
    previousVersions: [],
    changeLog: []
  };
  
  // Save to KV store
  await kv.set(`cocoboard:${cocoBoardId}`, cocoBoard);
  
  // Index by user for listing
  await kv.set(`user:${userId}:cocoboard:${cocoBoardId}`, cocoBoardId);
  
  // Also index by project (using unified system)
  await kv.set(`project:${projectId}:cocoboard`, cocoBoardId);
  
  console.log('✅ CocoBoard created:', cocoBoardId);
  
  return cocoBoard;
}

// ============================================
// COCOBOARD CRUD
// ============================================

/**
 * Get CocoBoard by ID
 */
export async function getCocoBoard(cocoBoardId: string): Promise<CocoBoard | null> {
  const cocoBoard = await kv.get<CocoBoard>(`cocoboard:${cocoBoardId}`);
  return cocoBoard;
}

/**
 * Get CocoBoard by project ID
 */
export async function getCocoBoardByProject(projectId: string): Promise<CocoBoard | null> {
  const cocoBoardId = await kv.get<string>(`project:${projectId}:cocoboard`);
  
  if (!cocoBoardId) {
    return null;
  }
  
  return getCocoBoard(cocoBoardId);
}

/**
 * Update CocoBoard
 */
export async function updateCocoBoard(
  cocoBoardId: string,
  updates: Partial<CocoBoard>,
  userId: string
): Promise<CocoBoard> {
  const existing = await getCocoBoard(cocoBoardId);
  
  if (!existing) {
    throw new Error(`CocoBoard ${cocoBoardId} not found`);
  }
  
  const updated: CocoBoard = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await kv.set(`cocoboard:${cocoBoardId}`, updated);
  
  console.log('✅ CocoBoard updated:', cocoBoardId);
  
  return updated;
}

/**
 * Delete CocoBoard
 */
export async function deleteCocoBoard(cocoBoardId: string): Promise<void> {
  await kv.del(`cocoboard:${cocoBoardId}`);
  console.log('✅ CocoBoard deleted:', cocoBoardId);
}

// ============================================
// EDITABLE FIELDS
// ============================================

export type EditableField = 
  | 'concept.direction'
  | 'concept.keyMessage'
  | 'concept.mood'
  | 'colorPalette.primary'
  | 'colorPalette.accent'
  | 'colorPalette.background'
  | 'colorPalette.text'
  | 'colorPalette.rationale'
  | 'finalPrompt.scene'
  | 'finalPrompt.style'
  | 'finalPrompt.lighting'
  | 'finalPrompt.composition'
  | 'finalPrompt.mood'
  | 'asset.description'
  | 'zone.description';

export interface EditFieldPayload {
  cocoBoardId: string;
  field: EditableField;
  value: any;
  userId: string;
  targetId?: string; // For assets or zones
}

/**
 * Edit a field in the CocoBoard
 */
export async function editCocoBoardField(
  payload: EditFieldPayload
): Promise<CocoBoard> {
  const cocoBoard = await getCocoBoard(payload.cocoBoardId);
  
  if (!cocoBoard) {
    throw new Error(`CocoBoard ${payload.cocoBoardId} not found`);
  }
  
  const oldValue = getFieldValue(cocoBoard, payload.field, payload.targetId);
  
  // Log change
  const changeEntry = {
    timestamp: new Date().toISOString(),
    field: payload.field,
    oldValue,
    newValue: payload.value,
    userId: payload.userId
  };
  
  if (!cocoBoard.changeLog) {
    cocoBoard.changeLog = [];
  }
  cocoBoard.changeLog.push(changeEntry);
  
  // Apply edit
  const updated = applyFieldEdit(cocoBoard, payload);
  
  // Save
  await kv.set(`cocoboard:${payload.cocoBoardId}`, updated);
  
  console.log('✅ Field edited:', payload.field);
  
  return updated;
}

function getFieldValue(cocoBoard: CocoBoard, field: EditableField, targetId?: string): any {
  if (field.startsWith('concept.')) {
    const key = field.split('.')[1] as keyof CocoBoardConcept;
    return cocoBoard.concept[key];
  }
  
  if (field.startsWith('colorPalette.')) {
    const key = field.split('.')[1] as keyof CocoBoardColorPalette;
    return cocoBoard.colorPalette[key];
  }
  
  if (field.startsWith('finalPrompt.')) {
    const key = field.split('.')[1] as keyof CocoBoardPrompt;
    return cocoBoard.finalPrompt[key];
  }
  
  if (field === 'asset.description' && targetId) {
    const asset = cocoBoard.assets.find(a => a.id === targetId);
    return asset?.description;
  }
  
  if (field === 'zone.description' && targetId) {
    const zone = cocoBoard.composition.zones.find(z => z.id === targetId);
    return zone?.description;
  }
  
  return undefined;
}

function applyFieldEdit(cocoBoard: CocoBoard, payload: EditFieldPayload): CocoBoard {
  const updated = { ...cocoBoard };
  updated.updatedAt = new Date().toISOString();
  
  if (payload.field.startsWith('concept.')) {
    const key = payload.field.split('.')[1];
    const customKey = `custom${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof CocoBoardConcept;
    updated.concept = {
      ...updated.concept,
      [customKey]: payload.value
    };
  }
  
  else if (payload.field.startsWith('colorPalette.')) {
    const key = payload.field.split('.')[1];
    const customKey = `custom${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof CocoBoardColorPalette;
    updated.colorPalette = {
      ...updated.colorPalette,
      [customKey]: payload.value
    };
  }
  
  else if (payload.field.startsWith('finalPrompt.')) {
    const key = payload.field.split('.')[1];
    const customKey = `custom${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof CocoBoardPrompt;
    updated.finalPrompt = {
      ...updated.finalPrompt,
      [customKey]: payload.value
    };
  }
  
  else if (payload.field === 'asset.description' && payload.targetId) {
    updated.assets = updated.assets.map(asset =>
      asset.id === payload.targetId
        ? { ...asset, customDescription: payload.value }
        : asset
    );
  }
  
  else if (payload.field === 'zone.description' && payload.targetId) {
    updated.composition = {
      ...updated.composition,
      zones: updated.composition.zones.map(zone =>
        zone.id === payload.targetId
          ? { ...zone, customDescription: payload.value }
          : zone
      )
    };
  }
  
  return updated;
}

/**
 * Get effective (merged) value for a field
 * Returns custom value if set, otherwise original
 */
export function getEffectiveValue(cocoBoard: CocoBoard, field: EditableField, targetId?: string): any {
  if (field.startsWith('concept.')) {
    const key = field.split('.')[1];
    const customKey = `custom${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof CocoBoardConcept;
    return cocoBoard.concept[customKey] || cocoBoard.concept[key as keyof CocoBoardConcept];
  }
  
  if (field.startsWith('colorPalette.')) {
    const key = field.split('.')[1];
    const customKey = `custom${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof CocoBoardColorPalette;
    return cocoBoard.colorPalette[customKey] || cocoBoard.colorPalette[key as keyof CocoBoardColorPalette];
  }
  
  if (field.startsWith('finalPrompt.')) {
    const key = field.split('.')[1];
    const customKey = `custom${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof CocoBoardPrompt;
    return cocoBoard.finalPrompt[customKey] || cocoBoard.finalPrompt[key as keyof CocoBoardPrompt];
  }
  
  if (field === 'asset.description' && targetId) {
    const asset = cocoBoard.assets.find(a => a.id === targetId);
    return asset?.customDescription || asset?.description;
  }
  
  if (field === 'zone.description' && targetId) {
    const zone = cocoBoard.composition.zones.find(z => z.id === targetId);
    return zone?.customDescription || zone?.description;
  }
  
  return undefined;
}

// ============================================
// VERSIONING
// ============================================

/**
 * Create a new version of the CocoBoard
 */
export async function createCocoBoardVersion(
  cocoBoardId: string,
  userId: string,
  reason?: string
): Promise<CocoBoard> {
  const existing = await getCocoBoard(cocoBoardId);
  
  if (!existing) {
    throw new Error(`CocoBoard ${cocoBoardId} not found`);
  }
  
  // Archive current version
  const archiveId = `${cocoBoardId}-archive-v${existing.version}`;
  await kv.set(`cocoboard:${archiveId}`, existing);
  
  // Create new version
  const newVersion = existing.version + 1;
  const newId = `cocoboard-${existing.projectId}-v${newVersion}`;
  
  const newCocoBoard: CocoBoard = {
    ...existing,
    id: newId,
    version: newVersion,
    previousVersions: [...(existing.previousVersions || []), cocoBoardId],
    changeLog: reason ? [{
      timestamp: new Date().toISOString(),
      field: 'version',
      oldValue: existing.version,
      newValue: newVersion,
      userId
    }] : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Save new version
  await kv.set(`cocoboard:${newId}`, newCocoBoard);
  
  // Update project reference to new version
  await kv.set(`project:${existing.projectId}:cocoboard`, newId);
  
  console.log(`✅ Created CocoBoard version ${newVersion}`);
  
  return newCocoBoard;
}

/**
 * Get all versions of a CocoBoard
 */
export async function getCocoBoardVersions(projectId: string): Promise<CocoBoard[]> {
  const currentId = await kv.get<string>(`project:${projectId}:cocoboard`);
  
  if (!currentId) {
    return [];
  }
  
  const current = await getCocoBoard(currentId);
  
  if (!current) {
    return [];
  }
  
  const versions: CocoBoard[] = [current];
  
  // Get previous versions
  if (current.previousVersions && current.previousVersions.length > 0) {
    for (const prevId of current.previousVersions) {
      const archived = await getCocoBoard(`${prevId}-archive-v${current.version - 1}`);
      if (archived) {
        versions.unshift(archived);
      }
    }
  }
  
  return versions;
}

// ============================================
// ASSET MANAGEMENT
// ============================================

/**
 * Update asset status
 */
export async function updateAssetStatus(
  cocoBoardId: string,
  assetId: string,
  status: CocoBoardAsset['status'],
  metadata?: {
    url?: string;
    signedUrl?: string;
    generatedAt?: string;
    predictionId?: string;
  }
): Promise<CocoBoard> {
  const cocoBoard = await getCocoBoard(cocoBoardId);
  
  if (!cocoBoard) {
    throw new Error(`CocoBoard ${cocoBoardId} not found`);
  }
  
  const updated = {
    ...cocoBoard,
    assets: cocoBoard.assets.map(asset =>
      asset.id === assetId
        ? {
            ...asset,
            status,
            url: metadata?.url || asset.url,
            signedUrl: metadata?.signedUrl || asset.signedUrl,
            generationMetadata: asset.generationMetadata ? {
              ...asset.generationMetadata,
              generatedAt: metadata?.generatedAt || asset.generationMetadata.generatedAt,
              predictionId: metadata?.predictionId || asset.generationMetadata.predictionId
            } : undefined
          }
        : asset
    ),
    updatedAt: new Date().toISOString()
  };
  
  await kv.set(`cocoboard:${cocoBoardId}`, updated);
  
  console.log(`✅ Asset ${assetId} status updated to ${status}`);
  
  return updated;
}

/**
 * Assign asset to zone
 */
export async function assignAssetToZone(
  cocoBoardId: string,
  assetId: string,
  zoneId: string
): Promise<CocoBoard> {
  const cocoBoard = await getCocoBoard(cocoBoardId);
  
  if (!cocoBoard) {
    throw new Error(`CocoBoard ${cocoBoardId} not found`);
  }
  
  const updated = {
    ...cocoBoard,
    composition: {
      ...cocoBoard.composition,
      zones: cocoBoard.composition.zones.map(zone =>
        zone.id === zoneId
          ? { ...zone, assetIds: [...zone.assetIds, assetId] }
          : zone
      )
    },
    updatedAt: new Date().toISOString()
  };
  
  await kv.set(`cocoboard:${cocoBoardId}`, updated);
  
  console.log(`✅ Asset ${assetId} assigned to zone ${zoneId}`);
  
  return updated;
}

// ============================================
// STATUS MANAGEMENT
// ============================================

/**
 * Update CocoBoard status
 */
export async function updateCocoBoardStatus(
  cocoBoardId: string,
  status: CocoBoard['status']
): Promise<CocoBoard> {
  return updateCocoBoard(cocoBoardId, { status }, 'system');
}

/**
 * Check if CocoBoard is ready for generation
 */
export function isCocoBoardReady(cocoBoard: CocoBoard): boolean {
  // All assets must be available or generated
  const allAssetsReady = cocoBoard.assets.every(
    asset => asset.status === 'available' || asset.status === 'generated'
  );
  
  return allAssetsReady;
}

// ============================================
// EXPORT
// ============================================

export const COCOBOARD_INFO = {
  version: '14.0.0',
  phase: 2,
  day: 4,
  status: 'complete',
  features: {
    createFromAnalysis: true,
    crud: true,
    editableFields: true,
    versioning: true,
    assetManagement: true,
    statusTracking: true,
    changeLog: true
  }
};

console.log('✅ CocoBoard service loaded (COMPLETE - Phase 2 Day 4)');