// R2 Storage Service - Cloudflare R2 for Enterprise outputs
// Handles image/video uploads with presigned URLs

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME || 'cortexia-outputs';
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

// R2 S3-compatible client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
});

export interface R2UploadOptions {
  contentType: string;
  metadata?: Record<string, string>;
  expiresIn?: number; // seconds for presigned URL
}

export interface R2UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface R2PresignedUrlResult {
  success: boolean;
  uploadUrl?: string;
  publicUrl?: string;
  key?: string;
  error?: string;
}

class R2StorageService {
  private readonly DEFAULT_EXPIRES_IN = 300; // 5 minutes for upload

  /**
   * Generate a unique key for an output file
   */
  generateKey(
    jobId: string,
    nodeId: string,
    type: 'image' | 'video' | 'asset',
    extension: string
  ): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${type}s/${jobId}/${nodeId}_${timestamp}_${random}.${extension}`;
  }

  /**
   * Generate presigned URL for direct upload
   */
  async getPresignedUploadUrl(
    key: string,
    options: R2UploadOptions
  ): Promise<R2PresignedUrlResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: options.contentType,
        Metadata: options.metadata,
      });

      const uploadUrl = await getSignedUrl(
        r2Client,
        command,
        { expiresIn: options.expiresIn || this.DEFAULT_EXPIRES_IN }
      );

      // Public URL is deterministic
      const publicUrl = R2_PUBLIC_URL
        ? `${R2_PUBLIC_URL}/${key}`
        : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

      return {
        success: true,
        uploadUrl,
        publicUrl,
        key,
      };
    } catch (error) {
      console.error('R2 presigned URL error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate upload URL',
      };
    }
  }

  /**
   * Get presigned download URL
   */
  async getPresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      });

      const url = await getSignedUrl(r2Client, command, { expiresIn });

      return { success: true, url };
    } catch (error) {
      console.error('R2 download URL error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate download URL',
      };
    }
  }

  /**
   * Upload file directly (for small files)
   */
  async uploadFile(
    key: string,
    file: File | Blob,
    contentType: string
  ): Promise<R2UploadResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();

      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: new Uint8Array(arrayBuffer),
        ContentType: contentType,
      });

      await r2Client.send(command);

      const url = R2_PUBLIC_URL
        ? `${R2_PUBLIC_URL}/${key}`
        : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

      return {
        success: true,
        url,
        key,
      };
    } catch (error) {
      console.error('R2 upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Store job output metadata
   */
  async storeJobOutput(
    jobId: string,
    nodeId: string,
    outputType: 'image' | 'video',
    file: File | Blob
  ): Promise<R2UploadResult> {
    const extension = outputType === 'image' ? 'png' : 'mp4';
    const key = this.generateKey(jobId, nodeId, outputType, extension);
    const contentType = outputType === 'image' ? 'image/png' : 'video/mp4';

    return this.uploadFile(key, file, contentType);
  }

  /**
   * Get public URL for a stored object
   */
  getPublicUrl(key: string): string {
    return R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${key}`
      : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
  }

  /**
   * Extract key from public URL
   */
  extractKeyFromUrl(url: string): string | null {
    if (!R2_PUBLIC_URL) return null;
    if (url.startsWith(R2_PUBLIC_URL)) {
      return url.replace(`${R2_PUBLIC_URL}/`, '');
    }
    return null;
  }
}

export const r2Storage = new R2StorageService();
