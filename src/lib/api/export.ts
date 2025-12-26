import { projectId, publicAnonKey } from '@/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

/**
 * Export API Client
 * 
 * Handles image composite and video timeline exports
 */

export interface ExportImageRequest {
  campaignId: string;
  layers: Array<{
    id: string;
    name: string;
    output?: { url: string };
    metadata?: { zIndex?: number };
  }>;
  format?: 'png' | 'jpg';
  quality?: 'hd' | '4k';
}

export interface ExportVideoRequest {
  campaignId: string;
  shots: Array<{
    id: string;
    name: string;
    output?: { url: string };
    metadata?: {
      duration?: string;
      order?: number;
    };
  }>;
  format?: 'mp4';
  resolution?: '720p' | '1080p' | '4k';
}

export interface ExportResponse {
  success: boolean;
  exportId?: string;
  exportUrl?: string;
  layers?: Array<{
    id: string;
    name: string;
    url: string;
    order: number;
  }>;
  shots?: Array<{
    id: string;
    name: string;
    url: string;
    duration: string;
    order: number;
  }>;
  format?: string;
  quality?: string;
  resolution?: string;
  totalDuration?: number;
  message?: string;
  error?: string;
}

export interface ExportData {
  id: string;
  type: 'image' | 'video';
  campaignId: string;
  layers?: any[];
  shots?: any[];
  format: string;
  quality?: string;
  resolution?: string;
  status: string;
  createdAt: number;
}

/**
 * Export image composite
 */
export async function exportImageComposite(
  request: ExportImageRequest
): Promise<ExportResponse> {
  try {
    const response = await fetch(`${API_BASE}/export/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Export failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Export image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
}

/**
 * Export video timeline
 */
export async function exportVideoTimeline(
  request: ExportVideoRequest
): Promise<ExportResponse> {
  try {
    const response = await fetch(`${API_BASE}/export/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Export failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Export video error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
}

/**
 * Get export status
 */
export async function getExportStatus(
  exportId: string
): Promise<{ success: boolean; export?: ExportData; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/export/status/${exportId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get export status');
    }

    return await response.json();
  } catch (error) {
    console.error('Get export status error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get export status',
    };
  }
}

/**
 * Prepare download
 */
export async function prepareDownload(
  exportId: string
): Promise<{ success: boolean; downloadReady?: boolean; export?: ExportData; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/export/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ exportId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to prepare download');
    }

    return await response.json();
  } catch (error) {
    console.error('Prepare download error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to prepare download',
    };
  }
}

/**
 * Get export history for campaign
 */
export async function getExportHistory(
  campaignId: string
): Promise<{ success: boolean; exports?: ExportData[]; count?: number; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/export/history/${campaignId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get export history');
    }

    return await response.json();
  } catch (error) {
    console.error('Get export history error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get export history',
    };
  }
}

/**
 * Download file helper
 * Triggers browser download from URL
 */
export function downloadFile(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download multiple files helper
 * Triggers sequential downloads with delay
 */
export async function downloadMultipleFiles(
  files: Array<{ url: string; filename: string }>,
  delayMs: number = 500
) {
  for (const file of files) {
    downloadFile(file.url, file.filename);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
}
