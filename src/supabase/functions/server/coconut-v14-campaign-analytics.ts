/**
 * COCONUT V14 - CAMPAIGN ANALYTICS
 * Phase 4: Tracking and analytics per asset
 * 
 * Features:
 * - UTM parameters generation
 * - Click tracking
 * - Impressions tracking
 * - Conversions tracking
 * - Performance dashboard per asset/week/campaign
 */

import * as kv from './kv_store.tsx';
import type { CampaignAssetResult } from './coconut-v14-campaign-types.ts';

// ============================================================================
// TYPES
// ============================================================================

export interface AssetAnalytics {
  assetId: string;
  campaignId: string;
  weekNumber: number;
  
  // UTM Tracking
  utmParams: {
    source: string; // 'coconut' or specific platform
    medium: string; // 'social', 'email', 'print'
    campaign: string; // campaign name
    content: string; // asset specific identifier
    term?: string; // optional keywords
  };
  
  // Tracking Links
  trackingUrl: string; // Full URL with UTM
  shortUrl?: string; // Shortened version
  
  // Metrics
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number; // Click-through rate (%)
    conversionRate: number; // Conversion rate (%)
    engagement: number; // Platform-specific engagement
    shares: number;
    saves: number;
  };
  
  // Performance by Channel
  channelMetrics: Record<string, {
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
  
  // Timeline
  createdAt: string;
  firstImpressionAt?: string;
  lastInteractionAt?: string;
  
  // Metadata
  tags: string[];
  notes?: string;
}

export interface CampaignAnalytics {
  campaignId: string;
  totalAssets: number;
  
  // Aggregated Metrics
  totalMetrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    avgCtr: number;
    avgConversionRate: number;
    engagement: number;
  };
  
  // Performance by Week
  weeklyMetrics: Record<number, {
    impressions: number;
    clicks: number;
    conversions: number;
    assetsCount: number;
  }>;
  
  // Top Performing Assets
  topAssets: Array<{
    assetId: string;
    concept: string;
    impressions: number;
    ctr: number;
    conversions: number;
  }>;
  
  // Budget ROI
  budgetSpent: number;
  costPerClick: number;
  costPerConversion: number;
  roi: number; // Revenue / Cost (if revenue tracked)
}

// ============================================================================
// GENERATE UTM PARAMETERS
// ============================================================================

export function generateUTMParams(params: {
  campaignId: string;
  asset: CampaignAssetResult;
  baseUrl: string;
  channel?: string;
}): AssetAnalytics['utmParams'] {
  const { campaignId, asset, channel } = params;

  // Build UTM parameters
  return {
    source: channel || 'coconut',
    medium: determineMedium(asset.format, asset.type),
    campaign: campaignId.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
    content: `${asset.assetId}_w${asset.weekNumber}`,
    term: asset.concept.toLowerCase().split(' ').slice(0, 3).join('_'),
  };
}

function determineMedium(format: string, type: 'image' | 'video'): string {
  // Determine medium based on format
  if (format === '9:16') return 'stories';
  if (format === '16:9' && type === 'video') return 'video';
  return 'social';
}

// ============================================================================
// BUILD TRACKING URL
// ============================================================================

export function buildTrackingUrl(baseUrl: string, utmParams: AssetAnalytics['utmParams']): string {
  const url = new URL(baseUrl);
  
  url.searchParams.set('utm_source', utmParams.source);
  url.searchParams.set('utm_medium', utmParams.medium);
  url.searchParams.set('utm_campaign', utmParams.campaign);
  url.searchParams.set('utm_content', utmParams.content);
  
  if (utmParams.term) {
    url.searchParams.set('utm_term', utmParams.term);
  }
  
  return url.toString();
}

// ============================================================================
// INITIALIZE ASSET ANALYTICS
// ============================================================================

export async function initializeAssetAnalytics(params: {
  campaignId: string;
  asset: CampaignAssetResult;
  baseUrl: string;
  channels: string[];
}): Promise<AssetAnalytics> {
  const { campaignId, asset, baseUrl, channels } = params;

  console.log(`📊 [Analytics] Initializing analytics for asset: ${asset.assetId}`);

  // Generate UTM params
  const utmParams = generateUTMParams({ campaignId, asset, baseUrl });
  
  // Build tracking URL
  const trackingUrl = buildTrackingUrl(baseUrl, utmParams);

  // Initialize analytics record
  const analytics: AssetAnalytics = {
    assetId: asset.assetId,
    campaignId,
    weekNumber: asset.weekNumber,
    utmParams,
    trackingUrl,
    metrics: {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      conversionRate: 0,
      engagement: 0,
      shares: 0,
      saves: 0,
    },
    channelMetrics: channels.reduce((acc, channel) => {
      acc[channel] = {
        impressions: 0,
        clicks: 0,
        conversions: 0,
      };
      return acc;
    }, {} as AssetAnalytics['channelMetrics']),
    createdAt: new Date().toISOString(),
    tags: [asset.type, asset.format, `week${asset.weekNumber}`],
  };

  // Save to KV
  await kv.set(`analytics:asset:${asset.assetId}`, JSON.stringify(analytics));

  console.log(`✅ [Analytics] Asset analytics initialized`);
  console.log(`   Tracking URL: ${trackingUrl}`);

  return analytics;
}

// ============================================================================
// TRACK IMPRESSION
// ============================================================================

export async function trackImpression(params: {
  assetId: string;
  channel?: string;
}): Promise<void> {
  const { assetId, channel } = params;

  const analyticsData = await kv.get(`analytics:asset:${assetId}`);
  if (!analyticsData) {
    console.warn(`⚠️ [Analytics] Asset not found: ${assetId}`);
    return;
  }

  const analytics: AssetAnalytics = JSON.parse(analyticsData);

  // Increment impressions
  analytics.metrics.impressions += 1;

  // Update channel metrics
  if (channel && analytics.channelMetrics[channel]) {
    analytics.channelMetrics[channel].impressions += 1;
  }

  // Update first impression timestamp
  if (!analytics.firstImpressionAt) {
    analytics.firstImpressionAt = new Date().toISOString();
  }

  // Update last interaction
  analytics.lastInteractionAt = new Date().toISOString();

  // Save
  await kv.set(`analytics:asset:${assetId}`, JSON.stringify(analytics));
}

// ============================================================================
// TRACK CLICK
// ============================================================================

export async function trackClick(params: {
  assetId: string;
  channel?: string;
}): Promise<void> {
  const { assetId, channel } = params;

  const analyticsData = await kv.get(`analytics:asset:${assetId}`);
  if (!analyticsData) {
    console.warn(`⚠️ [Analytics] Asset not found: ${assetId}`);
    return;
  }

  const analytics: AssetAnalytics = JSON.parse(analyticsData);

  // Increment clicks
  analytics.metrics.clicks += 1;

  // Update channel metrics
  if (channel && analytics.channelMetrics[channel]) {
    analytics.channelMetrics[channel].clicks += 1;
  }

  // Recalculate CTR
  if (analytics.metrics.impressions > 0) {
    analytics.metrics.ctr = (analytics.metrics.clicks / analytics.metrics.impressions) * 100;
  }

  // Update last interaction
  analytics.lastInteractionAt = new Date().toISOString();

  // Save
  await kv.set(`analytics:asset:${assetId}`, JSON.stringify(analytics));
}

// ============================================================================
// TRACK CONVERSION
// ============================================================================

export async function trackConversion(params: {
  assetId: string;
  channel?: string;
  value?: number; // Optional revenue value
}): Promise<void> {
  const { assetId, channel, value } = params;

  const analyticsData = await kv.get(`analytics:asset:${assetId}`);
  if (!analyticsData) {
    console.warn(`⚠️ [Analytics] Asset not found: ${assetId}`);
    return;
  }

  const analytics: AssetAnalytics = JSON.parse(analyticsData);

  // Increment conversions
  analytics.metrics.conversions += 1;

  // Update channel metrics
  if (channel && analytics.channelMetrics[channel]) {
    analytics.channelMetrics[channel].conversions += 1;
  }

  // Recalculate conversion rate
  if (analytics.metrics.clicks > 0) {
    analytics.metrics.conversionRate = (analytics.metrics.conversions / analytics.metrics.clicks) * 100;
  }

  // Update last interaction
  analytics.lastInteractionAt = new Date().toISOString();

  // Save
  await kv.set(`analytics:asset:${assetId}`, JSON.stringify(analytics));

  console.log(`💰 [Analytics] Conversion tracked for ${assetId}${value ? ` (value: ${value})` : ''}`);
}

// ============================================================================
// GET ASSET ANALYTICS
// ============================================================================

export async function getAssetAnalytics(assetId: string): Promise<AssetAnalytics | null> {
  const analyticsData = await kv.get(`analytics:asset:${assetId}`);
  if (!analyticsData) return null;

  return JSON.parse(analyticsData);
}

// ============================================================================
// GET CAMPAIGN ANALYTICS
// ============================================================================

export async function getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
  console.log(`📊 [Analytics] Calculating campaign analytics: ${campaignId}`);

  // Fetch all asset analytics for this campaign
  const analyticsPrefix = `analytics:asset:`;
  const allAnalytics = await kv.getByPrefix(analyticsPrefix);

  const campaignAssets: AssetAnalytics[] = [];

  for (const data of allAnalytics) {
    const analytics: AssetAnalytics = JSON.parse(data);
    if (analytics.campaignId === campaignId) {
      campaignAssets.push(analytics);
    }
  }

  // Aggregate metrics
  const totalMetrics = campaignAssets.reduce((acc, analytics) => ({
    impressions: acc.impressions + analytics.metrics.impressions,
    clicks: acc.clicks + analytics.metrics.clicks,
    conversions: acc.conversions + analytics.metrics.conversions,
    avgCtr: 0, // Will calculate after
    avgConversionRate: 0, // Will calculate after
    engagement: acc.engagement + analytics.metrics.engagement,
  }), {
    impressions: 0,
    clicks: 0,
    conversions: 0,
    avgCtr: 0,
    avgConversionRate: 0,
    engagement: 0,
  });

  // Calculate averages
  if (totalMetrics.impressions > 0) {
    totalMetrics.avgCtr = (totalMetrics.clicks / totalMetrics.impressions) * 100;
  }
  if (totalMetrics.clicks > 0) {
    totalMetrics.avgConversionRate = (totalMetrics.conversions / totalMetrics.clicks) * 100;
  }

  // Group by week
  const weeklyMetrics: CampaignAnalytics['weeklyMetrics'] = {};
  for (const analytics of campaignAssets) {
    if (!weeklyMetrics[analytics.weekNumber]) {
      weeklyMetrics[analytics.weekNumber] = {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        assetsCount: 0,
      };
    }
    weeklyMetrics[analytics.weekNumber].impressions += analytics.metrics.impressions;
    weeklyMetrics[analytics.weekNumber].clicks += analytics.metrics.clicks;
    weeklyMetrics[analytics.weekNumber].conversions += analytics.metrics.conversions;
    weeklyMetrics[analytics.weekNumber].assetsCount += 1;
  }

  // Find top performing assets
  const topAssets = campaignAssets
    .map((analytics) => ({
      assetId: analytics.assetId,
      concept: '', // Would fetch from campaign data
      impressions: analytics.metrics.impressions,
      ctr: analytics.metrics.ctr,
      conversions: analytics.metrics.conversions,
    }))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10);

  // Calculate budget metrics (placeholder - would integrate with actual costs)
  const budgetSpent = campaignAssets.length * 50; // Rough estimate
  const costPerClick = totalMetrics.clicks > 0 ? budgetSpent / totalMetrics.clicks : 0;
  const costPerConversion = totalMetrics.conversions > 0 ? budgetSpent / totalMetrics.conversions : 0;

  return {
    campaignId,
    totalAssets: campaignAssets.length,
    totalMetrics,
    weeklyMetrics,
    topAssets,
    budgetSpent,
    costPerClick,
    costPerConversion,
    roi: 0, // Would calculate with revenue data
  };
}

// ============================================================================
// EXPORT ANALYTICS REPORT (CSV)
// ============================================================================

export async function exportAnalyticsCSV(campaignId: string): Promise<string> {
  const analytics = await getCampaignAnalytics(campaignId);

  let csv = 'Week,Asset ID,Impressions,Clicks,Conversions,CTR %,Conversion Rate %,Engagement\n';

  // Fetch individual asset analytics
  const analyticsPrefix = `analytics:asset:`;
  const allAnalytics = await kv.getByPrefix(analyticsPrefix);

  for (const data of allAnalytics) {
    const assetAnalytics: AssetAnalytics = JSON.parse(data);
    if (assetAnalytics.campaignId !== campaignId) continue;

    const row = [
      `Week ${assetAnalytics.weekNumber}`,
      assetAnalytics.assetId,
      assetAnalytics.metrics.impressions,
      assetAnalytics.metrics.clicks,
      assetAnalytics.metrics.conversions,
      assetAnalytics.metrics.ctr.toFixed(2),
      assetAnalytics.metrics.conversionRate.toFixed(2),
      assetAnalytics.metrics.engagement,
    ].join(',');

    csv += row + '\n';
  }

  return csv;
}
