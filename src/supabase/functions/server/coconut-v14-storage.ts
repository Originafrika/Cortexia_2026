// ============================================
// COCONUT V14 - STORAGE & MEDIA HANDLING
// ============================================
// Service pour gérer Supabase Storage (images, vidéos, assets)

import { createClient } from 'npm:@supabase/supabase-js@2';

// ============================================
// CONFIGURATION
// ============================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase configuration!');
  console.error('SUPABASE_URL:', SUPABASE_URL ? 'SET' : 'MISSING');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
  throw new Error('Supabase configuration is missing');
}

console.log('✅ Supabase Storage configured:', SUPABASE_URL);

// Bucket names (prefixed pour Coconut)
const BUCKETS = {
  REFERENCES: 'coconut-v14-references',      // User-provided references
  ASSETS: 'coconut-v14-assets',              // Generated assets
  OUTPUTS: 'coconut-v14-outputs',            // Final outputs
  COCOBOARDS: 'coconut-v14-cocoboards',      // CocoBoard exports
  GENERATIONS: 'coconut-v14-generations'     // Phase 3 - Generated images
} as const;

// ============================================
// UTILITIES
// ============================================

/**
 * Sanitize userId for storage paths (remove invalid characters like | from OAuth providers)
 */
function sanitizeUserId(userId: string): string {
  return userId.replace(/[|:*?"<>]/g, '_');
}

// ============================================
// FILE CONSTRAINTS
// ============================================

// File constraints
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 7; // 7 days

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ============================================
// BUCKET INITIALIZATION
// ============================================

/**
 * Initialize all Coconut storage buckets
 * Called on server startup
 */
export async function initializeStorageBuckets(): Promise<void> {
  console.log('🗄️ Initializing Coconut V14 storage buckets...');
  
  try {
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }
    
    const existingBucketNames = new Set(existingBuckets?.map(b => b.name) || []);
    
    // ✅ MIGRATION: Update REFERENCES bucket to public if it exists and is private
    const referencesBucket = existingBuckets?.find(b => b.name === BUCKETS.REFERENCES);
    if (referencesBucket && !referencesBucket.public) {
      console.log('🔄 Migrating coconut-v14-references bucket to PUBLIC...');
      const { error: updateError } = await supabase.storage.updateBucket(BUCKETS.REFERENCES, {
        public: true
      });
      
      if (updateError) {
        console.error('❌ Failed to update bucket to public:', updateError);
      } else {
        console.log('✅ REFERENCES bucket is now PUBLIC (required for Kie AI access)');
      }
    }
    
    // Create missing buckets
    for (const [key, bucketName] of Object.entries(BUCKETS)) {
      if (!existingBucketNames.has(bucketName)) {
        console.log(`📦 Creating bucket: ${bucketName}`);
        
        // ✅ REFERENCES bucket must be PUBLIC for Kie AI to access images
        const isPublic = key === 'REFERENCES'; 
        
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: isPublic, // ✅ Public only for REFERENCES bucket (Kie AI needs access)
          fileSizeLimit: MAX_FILE_SIZE,
          allowedMimeTypes: key === 'REFERENCES' 
            ? [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]
            : ALLOWED_IMAGE_TYPES
        });
        
        if (createError) {
          console.error(`❌ Failed to create bucket ${bucketName}:`, createError);
        } else {
          console.log(`✅ Bucket created: ${bucketName} (${isPublic ? 'PUBLIC' : 'PRIVATE'})`);
        }
      } else {
        console.log(`✅ Bucket exists: ${bucketName}`);
      }
    }
    
    console.log('✅ All storage buckets initialized');
  } catch (error) {
    console.error('❌ Error initializing storage buckets:', error);
    throw error;
  }
}

// ============================================
// FILE VALIDATION
// ============================================

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    type: string;
    size: number;
    extension: string;
  };
}

/**
 * Validate a file before upload
 */
export function validateFile(
  file: { type: string; size: number; name: string },
  category: 'image' | 'video'
): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
  
  // Check MIME type
  const allowedTypes = category === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} not allowed. Allowed: ${allowedTypes.join(', ')}`);
  }
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension) {
    errors.push('File has no extension');
  }
  
  const validExtensions = category === 'image' 
    ? ['jpg', 'jpeg', 'png', 'webp']
    : ['mp4', 'mov', 'webm'];
  
  if (extension && !validExtensions.includes(extension)) {
    warnings.push(`File extension .${extension} may not be supported`);
  }
  
  // File size warnings
  if (file.size > 10 * 1024 * 1024) {
    warnings.push('Large file size may affect upload speed');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      type: file.type,
      size: file.size,
      extension: extension || 'unknown'
    }
  };
}

// ============================================
// REFERENCE UPLOAD (User-provided images/videos)
// ============================================

export interface UploadReferenceParams {
  userId: string;
  projectId: string;
  file: File | Blob;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: 'image' | 'video';
}

export interface UploadReferenceResult {
  success: boolean;
  url?: string;
  signedUrl?: string;
  path?: string;
  error?: string;
}

/**
 * Upload a reference file (image or video)
 * Returns signed URL for access
 */
export async function uploadReference(
  params: UploadReferenceParams
): Promise<UploadReferenceResult> {
  try {
    console.log(`📤 Uploading ${params.category} reference:`, {
      fileName: params.fileName,
      size: `${(params.fileSize / 1024 / 1024).toFixed(2)}MB`,
      projectId: params.projectId
    });
    
    // Validate file
    const validation = validateFile({
      type: params.fileType,
      size: params.fileSize,
      name: params.fileName
    }, params.category);
    
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }
    
    // Generate unique path
    const timestamp = Date.now();
    const extension = params.fileName.split('.').pop();
    const sanitizedName = params.fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_');
    
    // ✅ FIX: Sanitize userId to remove invalid characters for storage paths
    const sanitizedUserId = sanitizeUserId(params.userId);
    const path = `${sanitizedUserId}/${params.projectId}/${timestamp}-${sanitizedName}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKETS.REFERENCES)
      .upload(path, params.file, {
        contentType: params.fileType,
        upsert: false
      });
    
    if (error) {
      console.error('❌ Upload error:', error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`
      };
    }
    
    console.log('✅ File uploaded:', data.path);
    
    // Generate signed URL for access
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(BUCKETS.REFERENCES)
      .createSignedUrl(data.path, SIGNED_URL_EXPIRY);
    
    if (signedUrlError) {
      console.error('⚠️ Failed to create signed URL:', signedUrlError);
    }
    
    // Get public URL (for metadata)
    const { data: publicUrlData } = supabase.storage
      .from(BUCKETS.REFERENCES)
      .getPublicUrl(data.path);
    
    return {
      success: true,
      url: publicUrlData.publicUrl,
      signedUrl: signedUrlData?.signedUrl,
      path: data.path
    };
    
  } catch (error) {
    console.error('❌ Upload exception:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// BATCH UPLOAD
// ============================================

export interface BatchUploadResult {
  success: boolean;
  uploaded: UploadReferenceResult[];
  failed: Array<{ fileName: string; error: string }>;
  total: number;
  successCount: number;
  failureCount: number;
}

/**
 * Upload multiple reference files
 */
export async function uploadReferenceBatch(
  userId: string,
  projectId: string,
  files: Array<{
    file: File | Blob;
    fileName: string;
    fileType: string;
    fileSize: number;
    category: 'image' | 'video';
  }>
): Promise<BatchUploadResult> {
  console.log(`📦 Batch uploading ${files.length} files...`);
  
  const uploaded: UploadReferenceResult[] = [];
  const failed: Array<{ fileName: string; error: string }> = [];
  
  for (const fileData of files) {
    const result = await uploadReference({
      userId,
      projectId,
      ...fileData
    });
    
    if (result.success) {
      uploaded.push(result);
    } else {
      failed.push({
        fileName: fileData.fileName,
        error: result.error || 'Unknown error'
      });
    }
  }
  
  console.log(`✅ Batch upload complete: ${uploaded.length} success, ${failed.length} failed`);
  
  return {
    success: failed.length === 0,
    uploaded,
    failed,
    total: files.length,
    successCount: uploaded.length,
    failureCount: failed.length
  };
}

// ============================================
// SIGNED URL GENERATION
// ============================================

/**
 * Generate signed URL for a file path
 */
export async function getSignedUrl(
  bucketName: string,
  path: string,
  expiresIn: number = SIGNED_URL_EXPIRY
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(path, expiresIn);
    
    if (error) {
      console.error('❌ Failed to create signed URL:', error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('❌ Signed URL exception:', error);
    return null;
  }
}

/**
 * Batch generate signed URLs
 */
export async function getSignedUrls(
  bucketName: string,
  paths: string[],
  expiresIn: number = SIGNED_URL_EXPIRY
): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};
  
  await Promise.all(
    paths.map(async (path) => {
      const url = await getSignedUrl(bucketName, path, expiresIn);
      if (url) {
        urls[path] = url;
      }
    })
  );
  
  return urls;
}

/**
 * Refresh signed URLs for references
 */
export async function refreshReferenceUrls(
  paths: string[]
): Promise<Array<{ path: string; signedUrl: string | null }>> {
  return Promise.all(
    paths.map(async (path) => ({
      path,
      signedUrl: await getSignedUrl(BUCKETS.REFERENCES, path)
    }))
  );
}

// ============================================
// ASSET STORAGE (Generated assets)
// ============================================

/**
 * Store a generated asset
 */
export async function storeGeneratedAsset(
  projectId: string,
  assetId: string,
  imageData: Blob | ArrayBuffer,
  metadata: {
    type: 'background' | 'product' | 'character' | 'element' | 'other';
    prompt?: string;
    model?: string;
  }
): Promise<UploadReferenceResult> {
  try {
    const timestamp = Date.now();
    const path = `${projectId}/assets/${assetId}-${timestamp}.png`;
    
    console.log(`💾 Storing generated asset: ${path}`);
    
    const { data, error } = await supabase.storage
      .from(BUCKETS.ASSETS)
      .upload(path, imageData, {
        contentType: 'image/png',
        upsert: false,
        metadata: {
          assetId,
          projectId,
          type: metadata.type,
          generatedAt: new Date().toISOString(),
          model: metadata.model || 'flux-2-pro'
        }
      });
    
    if (error) {
      console.error('❌ Asset storage error:', error);
      return {
        success: false,
        error: `Failed to store asset: ${error.message}`
      };
    }
    
    console.log('✅ Asset stored:', data.path);
    
    // Generate signed URL
    const signedUrl = await getSignedUrl(BUCKETS.ASSETS, data.path);
    
    const { data: publicUrlData } = supabase.storage
      .from(BUCKETS.ASSETS)
      .getPublicUrl(data.path);
    
    return {
      success: true,
      url: publicUrlData.publicUrl,
      signedUrl: signedUrl || undefined,
      path: data.path
    };
    
  } catch (error) {
    console.error('❌ Store asset exception:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// OUTPUT STORAGE (Final generations)
// ============================================

/**
 * Upload generated image from URL to storage (Phase 3)
 */
export async function uploadGeneratedImage(
  imageUrl: string,
  projectId: string,
  type: 'asset' | 'final'
): Promise<string> {
  try {
    console.log(`📥 Downloading generated image: ${imageUrl}`);
    
    // Download image from URL
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }
    
    const imageBlob = await response.blob();
    
    console.log(`✅ Image downloaded: ${(imageBlob.size / 1024 / 1024).toFixed(2)}MB`);
    
    // Choose bucket based on type
    const bucket = type === 'asset' ? BUCKETS.ASSETS : BUCKETS.GENERATIONS;
    
    // Generate path
    const timestamp = Date.now();
    const path = `${projectId}/${type}-${timestamp}.png`;
    
    console.log(`💾 Uploading to storage: ${bucket}/${path}`);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, imageBlob, {
        contentType: 'image/png',
        upsert: false
      });
    
    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    console.log(`✅ Image uploaded: ${data.path}`);
    
    // Generate signed URL (28 days expiry for final images)
    const expiresIn = type === 'final' ? SIGNED_URL_EXPIRY * 4 : SIGNED_URL_EXPIRY;
    const signedUrl = await getSignedUrl(bucket, data.path, expiresIn);
    
    if (!signedUrl) {
      throw new Error('Failed to generate signed URL');
    }
    
    return signedUrl;
    
  } catch (error) {
    console.error('❌ Upload generated image exception:', error);
    throw error;
  }
}

/**
 * Store a final output image
 */
export async function storeFinalOutput(
  projectId: string,
  imageData: Blob | ArrayBuffer,
  metadata: {
    resolution: string;
    format: string;
    generationId: string;
  }
): Promise<UploadReferenceResult> {
  try {
    const timestamp = Date.now();
    const path = `${projectId}/outputs/${metadata.generationId}-${timestamp}.png`;
    
    console.log(`🎨 Storing final output: ${path}`);
    
    const { data, error } = await supabase.storage
      .from(BUCKETS.OUTPUTS)
      .upload(path, imageData, {
        contentType: 'image/png',
        upsert: false,
        metadata: {
          projectId,
          generationId: metadata.generationId,
          resolution: metadata.resolution,
          format: metadata.format,
          generatedAt: new Date().toISOString()
        }
      });
    
    if (error) {
      console.error('❌ Output storage error:', error);
      return {
        success: false,
        error: `Failed to store output: ${error.message}`
      };
    }
    
    console.log('✅ Output stored:', data.path);
    
    // Generate signed URL
    const signedUrl = await getSignedUrl(BUCKETS.OUTPUTS, data.path, SIGNED_URL_EXPIRY * 4); // 28 days for outputs
    
    const { data: publicUrlData } = supabase.storage
      .from(BUCKETS.OUTPUTS)
      .getPublicUrl(data.path);
    
    return {
      success: true,
      url: publicUrlData.publicUrl,
      signedUrl: signedUrl || undefined,
      path: data.path
    };
    
  } catch (error) {
    console.error('❌ Store output exception:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// FILE DELETION
// ============================================

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucketName: string,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🗑️ Deleting file: ${bucketName}/${path}`);
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path]);
    
    if (error) {
      console.error('❌ Delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    console.log('✅ File deleted');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Delete exception:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete all files for a project
 */
export async function deleteProjectFiles(projectId: string): Promise<void> {
  console.log(`🗑️ Deleting all files for project: ${projectId}`);
  
  try {
    // Delete from each bucket
    for (const bucketName of Object.values(BUCKETS)) {
      const { data: files, error: listError } = await supabase.storage
        .from(bucketName)
        .list(projectId, {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (listError) {
        console.error(`⚠️ Failed to list files in ${bucketName}:`, listError);
        continue;
      }
      
      if (files && files.length > 0) {
        const paths = files.map(f => `${projectId}/${f.name}`);
        
        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove(paths);
        
        if (deleteError) {
          console.error(`⚠️ Failed to delete files from ${bucketName}:`, deleteError);
        } else {
          console.log(`✅ Deleted ${paths.length} files from ${bucketName}`);
        }
      }
    }
    
    console.log('✅ All project files deleted');
  } catch (error) {
    console.error('❌ Delete project files exception:', error);
    throw error;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get file info from storage
 */
export async function getFileInfo(
  bucketName: string,
  path: string
): Promise<any> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop()
      });
    
    if (error) {
      console.error('❌ Get file info error:', error);
      return null;
    }
    
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('❌ Get file info exception:', error);
    return null;
  }
}

/**
 * Check if file exists
 */
export async function fileExists(
  bucketName: string,
  path: string
): Promise<boolean> {
  const info = await getFileInfo(bucketName, path);
  return info !== null;
}

/**
 * Get storage usage for a project
 */
export async function getProjectStorageUsage(
  projectId: string
): Promise<{ totalSize: number; fileCount: number }> {
  let totalSize = 0;
  let fileCount = 0;
  
  try {
    for (const bucketName of Object.values(BUCKETS)) {
      const { data: files } = await supabase.storage
        .from(bucketName)
        .list(projectId, {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (files) {
        fileCount += files.length;
        totalSize += files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
      }
    }
  } catch (error) {
    console.error('❌ Get storage usage exception:', error);
  }
  
  return { totalSize, fileCount };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

// ============================================
// EXPORT
// ============================================

export const STORAGE_INFO = {
  version: '14.0.0',
  phase: 2,
  day: 3,
  status: 'complete',
  buckets: BUCKETS,
  limits: {
    maxFileSize: MAX_FILE_SIZE,
    allowedImageTypes: ALLOWED_IMAGE_TYPES,
    allowedVideoTypes: ALLOWED_VIDEO_TYPES,
    signedUrlExpiry: SIGNED_URL_EXPIRY
  },
  features: {
    upload: true,
    batchUpload: true,
    signedUrls: true,
    validation: true,
    deletion: true,
    assetStorage: true,
    outputStorage: true
  }
};

console.log('✅ Storage service loaded (COMPLETE - Phase 2 Day 3)');