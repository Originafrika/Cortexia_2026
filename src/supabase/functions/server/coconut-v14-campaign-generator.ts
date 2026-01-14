/**
 * COCONUT V14 - CAMPAIGN GENERATOR
 * Batch generation orchestrator for multi-week campaigns
 * 
 * Loops through all campaign assets and generates them using
 * Coconut Image/Video pipelines with visual identity injection
 */

import type { Context } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { deductCredits } from './credits-manager.ts'; // ✅ Import credits manager
import type {
  GeminiCampaignAnalysisResponse,
  CampaignAsset,
  CampaignAssetResult,
  Campaign,
} from './coconut-v14-campaign-types.ts';
import { analyzeWithGemini } from './coconut-v14-analyzer-flux-pro.ts';
import { analyzeVideoWithGemini } from './coconut-v14-video-analyzer.ts';
import {
  generateCampaignImageReal,
  generateCampaignVideoReal,
} from './coconut-v14-campaign-real-generator.ts';

// ============================================================================
// CONFIGURATION
// ============================================================================

const DELAY_BETWEEN_ASSETS_MS = 2000; // 2 seconds between generations
const MAX_RETRIES = 3;

// ============================================================================
// HELPER: Generate Campaign Image
// ============================================================================

async function generateCampaignImage(params: {
  userId: string;
  campaignId: string;
  asset: CampaignAsset;
  visualIdentity: any;
  providedAssets?: string[];
}): Promise<CampaignAssetResult> {
  const { userId, campaignId, asset, visualIdentity, providedAssets } = params;

  console.log(`🖼️ [Campaign Generator] Generating image asset: ${asset.id}`);

  // ✅ PHASE 4: Use real Flux 2 Pro generation
  return generateCampaignImageReal({
    asset,
    visualIdentity,
    providedAssets,
  });
}

// ============================================================================
// HELPER: Generate Campaign Video
// ============================================================================

async function generateCampaignVideo(params: {
  userId: string;
  campaignId: string;
  asset: CampaignAsset;
  visualIdentity: any;
  providedAssets?: string[];
}): Promise<CampaignAssetResult> {
  const { userId, campaignId, asset, visualIdentity, providedAssets } = params;

  console.log(`🎬 [Campaign Generator] Generating video asset: ${asset.id}`);

  // ✅ PHASE 4: Use real Veo 3.1 generation
  return generateCampaignVideoReal({
    asset,
    visualIdentity,
    providedAssets,
  });
}

// ============================================================================
// MAIN: Generate Complete Campaign
// ============================================================================

export async function generateCampaign(params: {
  userId: string;
  cocoBoardId: string;
  providedAssets?: string[];
}): Promise<{ campaignId: string; totalAssets: number }> {
  const { userId, cocoBoardId, providedAssets } = params;

  console.log(`🚀 [Campaign Generator] Starting batch generation for cocoboard: ${cocoBoardId}`);

  try {
    // 1. Fetch Campaign CocoBoard from KV
    const cocoBoardData = await kv.get(`cocoboard:campaign:${cocoBoardId}`);
    if (!cocoBoardData) {
      throw new Error(`CocoBoard not found: ${cocoBoardId}`);
    }

    const campaignData: GeminiCampaignAnalysisResponse = JSON.parse(cocoBoardData);
    console.log(`📊 Campaign: ${campaignData.campaignTitle}`);
    console.log(`📦 Total assets to generate: ${campaignData.allAssets.length}`);

    // 2. Create campaign record
    const campaignId = `campaign-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const campaign: Campaign = {
      id: campaignId,
      userId,
      cocoBoardId,
      status: 'generating',
      briefing: {} as any, // Would be stored separately
      analysis: campaignData,
      progress: {
        total: campaignData.allAssets.length,
        completed: 0,
        failed: 0,
        current: null,
      },
      results: [],
      errors: [],
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
    };

    await kv.set(`campaign:${campaignId}`, JSON.stringify(campaign));
    console.log(`✅ Campaign record created: ${campaignId}`);

    // ✅ DON'T deduct all credits at once - deduct per asset with actual cost
    // Credits will be deducted in background generation

    // 4. Background generation (don't await - return immediately)
    generateAllAssets(campaignId, campaignData, userId, providedAssets).catch((error) => {
      console.error(`❌ [Campaign Generator] Background generation failed:`, error);
    });

    return {
      campaignId,
      totalAssets: campaignData.allAssets.length,
    };

  } catch (error) {
    console.error(`❌ [Campaign Generator] Fatal error:`, error);
    throw error;
  }
}

// ============================================================================
// BACKGROUND: Generate All Assets
// ============================================================================

async function generateAllAssets(
  campaignId: string,
  campaignData: GeminiCampaignAnalysisResponse,
  userId: string,
  providedAssets?: string[]
): Promise<void> {
  console.log(`🔄 [Campaign Generator] Starting background generation for ${campaignId}`);

  try {
    for (let i = 0; i < campaignData.allAssets.length; i++) {
      const asset = campaignData.allAssets[i];

      // Update current asset
      await updateCampaignProgress(campaignId, { current: asset.id });

      console.log(`\n[${i + 1}/${campaignData.allAssets.length}] Generating ${asset.type}: ${asset.concept}`);

      let result: CampaignAssetResult;

      if (asset.type === 'image') {
        result = await generateCampaignImage({
          userId,
          campaignId,
          asset,
          visualIdentity: campaignData.visualIdentity,
          providedAssets,
        });
      } else if (asset.type === 'video') {
        result = await generateCampaignVideo({
          userId,
          campaignId,
          asset,
          visualIdentity: campaignData.visualIdentity,
          providedAssets,
        });
      } else {
        console.warn(`⚠️ Unknown asset type: ${asset.type}`);
        continue;
      }

      // Save result
      await saveCampaignAssetResult(campaignId, result);

      // ✅ Deduct credits for successful generation
      if (result.status === 'completed' && result.actualCost) {
        const deductResult = await deductCredits(
          userId, 
          result.actualCost,
          `Campaign Asset Generation: ${asset.type}`,
          { 
            campaignId, 
            assetId: asset.id, 
            assetType: asset.type,
            format: asset.format,
            resolution: asset.resolution 
          }
        );
        
        if (deductResult.success) {
          console.log(`💰 Deducted ${result.actualCost} credits for ${asset.id}`);
        } else {
          console.warn(`⚠️ Failed to deduct credits for ${asset.id}: ${deductResult.error}`);
        }
      }

      // Update progress
      if (result.status === 'completed') {
        await incrementCampaignCompleted(campaignId);
      } else {
        await incrementCampaignFailed(campaignId, result);
      }

      // Delay between assets to avoid rate limits
      if (i < campaignData.allAssets.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_ASSETS_MS));
      }
    }

    // Mark campaign as complete
    await finalizeCampaign(campaignId);
    console.log(`🎉 [Campaign Generator] Campaign completed: ${campaignId}`);

  } catch (error) {
    console.error(`❌ [Campaign Generator] Background generation error:`, error);
    await markCampaignFailed(campaignId, error.message);
  }
}

// ============================================================================
// HELPERS: KV Operations
// ============================================================================

async function updateCampaignProgress(
  campaignId: string,
  update: Partial<Campaign['progress']>
): Promise<void> {
  const campaignData = await kv.get(`campaign:${campaignId}`);
  if (!campaignData) return;

  const campaign: Campaign = JSON.parse(campaignData);
  campaign.progress = { ...campaign.progress, ...update } as any;

  await kv.set(`campaign:${campaignId}`, JSON.stringify(campaign));
}

async function saveCampaignAssetResult(
  campaignId: string,
  result: CampaignAssetResult
): Promise<void> {
  const campaignData = await kv.get(`campaign:${campaignId}`);
  if (!campaignData) return;

  const campaign: Campaign = JSON.parse(campaignData);
  campaign.results.push(result);

  if (result.status === 'failed') {
    campaign.errors.push({
      assetId: result.assetId,
      error: result.error || 'Unknown error',
    });
  }

  await kv.set(`campaign:${campaignId}`, JSON.stringify(campaign));
}

async function incrementCampaignCompleted(campaignId: string): Promise<void> {
  const campaignData = await kv.get(`campaign:${campaignId}`);
  if (!campaignData) return;

  const campaign: Campaign = JSON.parse(campaignData);
  if (campaign.progress) {
    campaign.progress.completed += 1;
  }

  await kv.set(`campaign:${campaignId}`, JSON.stringify(campaign));
}

async function incrementCampaignFailed(
  campaignId: string,
  result: CampaignAssetResult
): Promise<void> {
  const campaignData = await kv.get(`campaign:${campaignId}`);
  if (!campaignData) return;

  const campaign: Campaign = JSON.parse(campaignData);
  if (campaign.progress) {
    campaign.progress.failed += 1;
  }

  await kv.set(`campaign:${campaignId}`, JSON.stringify(campaign));
}

async function finalizeCampaign(campaignId: string): Promise<void> {
  const campaignData = await kv.get(`campaign:${campaignId}`);
  if (!campaignData) return;

  const campaign: Campaign = JSON.parse(campaignData);
  campaign.status = 'completed';
  campaign.completedAt = new Date().toISOString();
  if (campaign.progress) {
    campaign.progress.current = null;
  }

  await kv.set(`campaign:${campaignId}`, JSON.stringify(campaign));
}

async function markCampaignFailed(campaignId: string, error: string): Promise<void> {
  const campaignData = await kv.get(`campaign:${campaignId}`);
  if (!campaignData) return;

  const campaign: Campaign = JSON.parse(campaignData);
  campaign.status = 'failed';
  campaign.errors.push({ assetId: 'system', error });

  await kv.set(`campaign:${campaignId}`, JSON.stringify(campaign));
}

// ============================================================================
// HTTP HANDLERS
// ============================================================================

export async function handleGenerateCampaign(c: Context): Promise<Response> {
  try {
    console.log('🚀 [handleGenerateCampaign] Starting...');

    const body = await c.req.json();
    const { userId, cocoBoardId, providedAssets } = body;

    if (!userId || !cocoBoardId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing userId or cocoBoardId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await generateCampaign({ userId, cocoBoardId, providedAssets });

    // Estimate time (2 minutes per asset average)
    const estimatedTime = result.totalAssets * 2;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          campaignId: result.campaignId,
          totalAssets: result.totalAssets,
          estimatedTime,
          queuePosition: 1,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [handleGenerateCampaign] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function handleGetCampaignStatus(c: Context): Promise<Response> {
  try {
    const campaignId = c.req.param('campaignId');

    if (!campaignId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing campaignId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const campaignData = await kv.get(`campaign:${campaignId}`);
    if (!campaignData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Campaign not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const campaign: Campaign = JSON.parse(campaignData);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          status: campaign.status,
          progress: campaign.progress,
          results: campaign.results,
          errors: campaign.errors,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [handleGetCampaignStatus] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}