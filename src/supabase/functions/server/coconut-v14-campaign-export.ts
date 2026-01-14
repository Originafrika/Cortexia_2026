/**
 * COCONUT V14 - CAMPAIGN EXPORT UTILITIES
 * Export functions for campaign calendar and assets
 * 
 * Features:
 * - Export calendar as PDF
 * - Export calendar as CSV
 * - Create ZIP with all assets organized by weeks
 */

import * as kv from './kv_store.tsx';
import type {
  GeminiCampaignAnalysisResponse,
  Campaign,
  CampaignAssetResult,
} from './coconut-v14-campaign-types.ts';

// ============================================================================
// CALENDAR EXPORT (CSV)
// ============================================================================

export async function exportCalendarCSV(campaignId: string): Promise<string> {
  console.log('📅 [Export] Creating calendar CSV for campaign:', campaignId);

  // Fetch campaign data
  const cocoBoardData = await kv.get(`cocoboard:campaign:${campaignId}`);
  if (!cocoBoardData) {
    throw new Error('Campaign not found');
  }

  const campaignData: GeminiCampaignAnalysisResponse = JSON.parse(cocoBoardData);

  // Build CSV
  let csv = 'Week,Date,Asset ID,Type,Format,Concept,Channels,Cost,Scheduled Time\n';

  for (const week of campaignData.weeks) {
    for (const asset of week.assets) {
      const row = [
        `Week ${week.weekNumber}`,
        asset.scheduledDate,
        asset.id,
        asset.type,
        asset.format,
        `"${asset.concept.replace(/"/g, '""')}"`, // Escape quotes
        asset.channels.join(';'),
        asset.estimatedCost,
        asset.scheduledTime,
      ].join(',');
      
      csv += row + '\n';
    }
  }

  // Save to temp file (would upload to Supabase Storage in production)
  const csvBlob = new Blob([csv], { type: 'text/csv' });
  
  // In production, upload to Storage and return signed URL
  // For now, return data URL
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
}

// ============================================================================
// CALENDAR EXPORT (PDF) - Placeholder
// ============================================================================

export async function exportCalendarPDF(campaignId: string): Promise<string> {
  console.log('📅 [Export] Creating calendar PDF for campaign:', campaignId);

  // TODO Phase 4: Use a PDF library like jsPDF or puppeteer
  // For now, return CSV download URL
  return exportCalendarCSV(campaignId);
}

// ============================================================================
// ZIP EXPORT - All Assets
// ============================================================================

export async function exportCampaignZIP(campaignId: string): Promise<string> {
  console.log('📦 [Export] Creating ZIP for campaign:', campaignId);

  // Fetch campaign results
  const campaignData = await kv.get(`campaign:${campaignId}`);
  if (!campaignData) {
    throw new Error('Campaign not found');
  }

  const campaign: Campaign = JSON.parse(campaignData);

  // Group assets by week
  const assetsByWeek = new Map<number, CampaignAssetResult[]>();
  
  for (const result of campaign.results) {
    if (!assetsByWeek.has(result.weekNumber)) {
      assetsByWeek.set(result.weekNumber, []);
    }
    assetsByWeek.get(result.weekNumber)!.push(result);
  }

  // TODO Phase 4: Create actual ZIP file with JSZip
  // For now, return placeholder
  
  console.log('✅ [Export] ZIP structure prepared');
  console.log(`   - Total assets: ${campaign.results.length}`);
  console.log(`   - Weeks: ${assetsByWeek.size}`);

  // In production:
  // 1. Download all assets from URLs
  // 2. Create ZIP with folder structure: week-1/, week-2/, etc.
  // 3. Upload ZIP to Supabase Storage
  // 4. Return signed download URL

  return 'https://placeholder.com/campaign-download.zip';
}

// ============================================================================
// HELPER: Generate filename for asset
// ============================================================================

export function generateAssetFilename(asset: CampaignAssetResult): string {
  const ext = asset.type === 'image' ? 'png' : 'mp4';
  const cleanConcept = asset.concept
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 50);
  
  return `${asset.assetId}-${cleanConcept}.${ext}`;
}
