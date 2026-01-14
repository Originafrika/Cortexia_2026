/**
 * COCONUT V14 - CAMPAIGN ROUTES
 * API routes for campaign mode
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import * as kv from './kv_store.tsx';
import { handleAnalyzeCampaign } from './coconut-v14-campaign-analyzer.ts';
import { handleGenerateCampaign, handleGetCampaignStatus } from './coconut-v14-campaign-generator.ts';
import { exportCalendarCSV, exportCalendarPDF, exportCampaignZIP } from './coconut-v14-campaign-export.ts';
import {
  initializeAssetAnalytics,
  trackImpression,
  trackClick,
  trackConversion,
  getAssetAnalytics,
  getCampaignAnalytics,
  exportAnalyticsCSV,
} from './coconut-v14-campaign-analytics.ts';
import type { Campaign, CampaignSummary } from './coconut-v14-campaign-types.ts';

const app = new Hono();

// Enable CORS
app.use('*', cors());

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /campaign/analyze
 * Analyze campaign briefing and generate strategic plan with Gemini
 */
app.post('/analyze', handleAnalyzeCampaign);

/**
 * POST /campaign/cocoboard/save
 * Save campaign CocoBoard to KV
 */
app.post('/cocoboard/save', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, cocoBoardId, campaignData } = body;

    if (!userId || !cocoBoardId || !campaignData) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    // ✅ FIX: Dé-hydrater avant sauvegarde (stocker seulement IDs dans weeks.assets)
    const dehydrated = {
      ...campaignData,
      weeks: campaignData.weeks.map((week: any) => ({
        ...week,
        assets: Array.isArray(week.assets)
          ? week.assets.map((a: any) => (typeof a === 'string' ? a : a.id))
          : week.assets,
      })),
    };

    // Save to KV
    await kv.set(`cocoboard:campaign:${cocoBoardId}`, JSON.stringify(dehydrated));

    // Also save to user's campaign list
    const userCampaignsKey = `user:${userId}:campaigns`;
    const existingCampaigns = await kv.get(userCampaignsKey);
    const campaignsList = existingCampaigns ? JSON.parse(existingCampaigns) : [];
    
    if (!campaignsList.includes(cocoBoardId)) {
      campaignsList.push(cocoBoardId);
      await kv.set(userCampaignsKey, JSON.stringify(campaignsList));
    }

    return c.json({
      success: true,
      cocoBoardId,
    });

  } catch (error) {
    console.error('[Campaign Routes] Save CocoBoard error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /campaign/cocoboard/:cocoBoardId
 * Get campaign CocoBoard by ID
 */
app.get('/cocoboard/:cocoBoardId', async (c) => {
  try {
    const cocoBoardId = c.req.param('cocoBoardId');

    const data = await kv.get(`cocoboard:campaign:${cocoBoardId}`);
    if (!data) {
      return c.json({ success: false, error: 'CocoBoard not found' }, 404);
    }

    const parsed = JSON.parse(data);

    // ✅ FIX: Hydrater weeks.assets avant de retourner
    const hydrated = {
      ...parsed,
      weeks: parsed.weeks.map((week: any) => ({
        ...week,
        assets: (week.assets as string[])
          .map((assetId: string) => parsed.allAssets.find((a: any) => a.id === assetId))
          .filter(Boolean),
      })),
    };

    return c.json({
      success: true,
      data: hydrated,
    });

  } catch (error) {
    console.error('[Campaign Routes] Get CocoBoard error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /campaign/generate
 * Start batch generation for campaign
 */
app.post('/generate', handleGenerateCampaign);

/**
 * GET /campaign/:campaignId/status
 * Get campaign generation status
 */
app.get('/:campaignId/status', handleGetCampaignStatus);

/**
 * GET /campaign/:campaignId/assets
 * Get all generated assets for campaign
 */
app.get('/:campaignId/assets', async (c) => {
  try {
    const campaignId = c.req.param('campaignId');

    const campaignData = await kv.get(`campaign:${campaignId}`);
    if (!campaignData) {
      return c.json({ success: false, error: 'Campaign not found' }, 404);
    }

    const campaign: Campaign = JSON.parse(campaignData);

    return c.json({
      success: true,
      data: {
        assets: campaign.results,
        total: campaign.results.length,
      },
    });

  } catch (error) {
    console.error('[Campaign Routes] Get assets error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /campaign/:campaignId/export
 * Export campaign as ZIP
 */
app.post('/:campaignId/export', async (c) => {
  try {
    const campaignId = c.req.param('campaignId');

    const downloadUrl = await exportCampaignZIP(campaignId);

    return c.json({
      success: true,
      downloadUrl,
    });

  } catch (error) {
    console.error('[Campaign Routes] Export ZIP error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /campaign/list
 * List all campaigns for a user
 */
app.get('/list', async (c) => {
  try {
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({ success: false, error: 'Missing userId' }, 400);
    }

    console.log(`📋 [Campaign Routes] Listing campaigns for user: ${userId}`);

    // Get user's campaign list (array of cocoBoardIds)
    const campaignListKey = `user:${userId}:campaigns`;
    const campaignIdsData = await kv.get(campaignListKey);
    
    // Parse campaign IDs
    let campaignIds: string[] = [];
    if (campaignIdsData) {
      try {
        campaignIds = typeof campaignIdsData === 'string' 
          ? JSON.parse(campaignIdsData) 
          : campaignIdsData;
        
        // Ensure it's an array
        if (!Array.isArray(campaignIds)) {
          campaignIds = [];
        }
      } catch (err) {
        console.error('❌ Error parsing campaign IDs:', err);
        campaignIds = [];
      }
    }
    
    console.log(`📊 [Campaign Routes] Found ${campaignIds.length} campaign IDs`);

    // If no campaigns, return empty array
    if (campaignIds.length === 0) {
      return c.json({
        success: true,
        data: {
          campaigns: [],
          total: 0
        }
      });
    }

    // Fetch campaign summaries
    const campaigns: CampaignSummary[] = [];
    
    for (const cocoBoardId of campaignIds) {
      try {
        // Fetch CocoBoard data
        const cocoBoardData = await kv.get(`cocoboard:campaign:${cocoBoardId}`);
        
        if (cocoBoardData) {
          const cocoBoard = typeof cocoBoardData === 'string' ? JSON.parse(cocoBoardData) : cocoBoardData;
          
          campaigns.push({
            cocoBoardId: cocoBoardId,
            campaignTitle: cocoBoard.campaignTitle || 'Sans titre',
            status: 'completed', // Assume completed if in history
            totalAssets: cocoBoard.allAssets?.length || 0,
            estimatedCost: cocoBoard.estimatedCost?.total || 0,
            createdAt: cocoBoard.createdAt || new Date().toISOString(),
            productName: cocoBoard.briefing?.productName,
            productCategory: cocoBoard.briefing?.productCategory,
            timeline: cocoBoard.timeline
          });
        }
      } catch (err) {
        console.error(`❌ [Campaign Routes] Error loading campaign ${cocoBoardId}:`, err);
        // Continue with next campaign
      }
    }

    console.log(`✅ [Campaign Routes] Returning ${campaigns.length} campaigns`);

    return c.json({
      success: true,
      data: {
        campaigns,
        total: campaigns.length
      }
    });

  } catch (error) {
    console.error('[Campaign Routes] List campaigns error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

/**
 * DELETE /campaign/:campaignId
 * Delete campaign
 */
app.delete('/:campaignId', async (c) => {
  try {
    const campaignId = c.req.param('campaignId');
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({ success: false, error: 'Missing userId' }, 400);
    }

    // Delete campaign record
    await kv.del(`campaign:${campaignId}`);
    
    // Delete CocoBoard
    await kv.del(`cocoboard:campaign:${campaignId}`);

    // Remove from user's campaigns list
    const userCampaignsKey = `user:${userId}:campaigns`;
    const existingCampaigns = await kv.get(userCampaignsKey);
    if (existingCampaigns) {
      const campaignsList: string[] = JSON.parse(existingCampaigns);
      const filtered = campaignsList.filter(id => id !== campaignId);
      await kv.set(userCampaignsKey, JSON.stringify(filtered));
    }

    return c.json({ success: true });

  } catch (error) {
    console.error('[Campaign Routes] Delete campaign error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /campaign/:campaignId/calendar/export
 * Export calendar as PDF or CSV
 */
app.post('/:campaignId/calendar/export', async (c) => {
  try {
    const campaignId = c.req.param('campaignId');
    const body = await c.req.json();
    const format = body.format || 'csv';

    let downloadUrl: string;

    if (format === 'pdf') {
      downloadUrl = await exportCalendarPDF(campaignId);
    } else {
      downloadUrl = await exportCalendarCSV(campaignId);
    }

    return c.json({
      success: true,
      downloadUrl,
    });

  } catch (error) {
    console.error('[Campaign Routes] Export calendar error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================================================
// ANALYTICS ROUTES
// ============================================================================

/**
 * GET /campaign/:campaignId/analytics
 * Get campaign-wide analytics
 */
app.get('/:campaignId/analytics', async (c) => {
  try {
    const campaignId = c.req.param('campaignId');

    const analytics = await getCampaignAnalytics(campaignId);

    return c.json({
      success: true,
      data: analytics,
    });

  } catch (error) {
    console.error('[Campaign Routes] Get analytics error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /campaign/asset/:assetId/analytics
 * Get analytics for specific asset
 */
app.get('/asset/:assetId/analytics', async (c) => {
  try {
    const assetId = c.req.param('assetId');

    const analytics = await getAssetAnalytics(assetId);

    if (!analytics) {
      return c.json({ success: false, error: 'Asset analytics not found' }, 404);
    }

    return c.json({
      success: true,
      data: analytics,
    });

  } catch (error) {
    console.error('[Campaign Routes] Get asset analytics error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /campaign/track/impression
 * Track impression for asset
 */
app.post('/track/impression', async (c) => {
  try {
    const body = await c.req.json();
    const { assetId, channel } = body;

    if (!assetId) {
      return c.json({ success: false, error: 'Missing assetId' }, 400);
    }

    await trackImpression({ assetId, channel });

    return c.json({ success: true });

  } catch (error) {
    console.error('[Campaign Routes] Track impression error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /campaign/track/click
 * Track click for asset
 */
app.post('/track/click', async (c) => {
  try {
    const body = await c.req.json();
    const { assetId, channel } = body;

    if (!assetId) {
      return c.json({ success: false, error: 'Missing assetId' }, 400);
    }

    await trackClick({ assetId, channel });

    return c.json({ success: true });

  } catch (error) {
    console.error('[Campaign Routes] Track click error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /campaign/track/conversion
 * Track conversion for asset
 */
app.post('/track/conversion', async (c) => {
  try {
    const body = await c.req.json();
    const { assetId, channel, value } = body;

    if (!assetId) {
      return c.json({ success: false, error: 'Missing assetId' }, 400);
    }

    await trackConversion({ assetId, channel, value });

    return c.json({ success: true });

  } catch (error) {
    console.error('[Campaign Routes] Track conversion error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /campaign/:campaignId/analytics/export
 * Export analytics as CSV
 */
app.get('/:campaignId/analytics/export', async (c) => {
  try {
    const campaignId = c.req.param('campaignId');

    const csv = await exportAnalyticsCSV(campaignId);

    return c.json({
      success: true,
      downloadUrl: `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`,
    });

  } catch (error) {
    console.error('[Campaign Routes] Export analytics error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app;