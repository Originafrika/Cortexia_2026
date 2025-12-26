// storage.tsx - Supabase Storage management for image uploads
// Handles bucket creation, file uploads, and signed URL generation

import { createClient } from "jsr:@supabase/supabase-js@2";

const BUCKET_NAME = "make-e55aa214-uploads";
const VIDEO_BUCKET_NAME = "make-e55aa214-videos";
const AVATAR_BUCKET_NAME = "make-e55aa214-avatars";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB for videos

// Cache for bucket existence checks to reduce API calls
const bucketCache = new Map<string, boolean>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let lastCacheTime = 0;

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  publicUrl?: string;
}

// Initialize Supabase client with service role for admin operations
export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Clear cache if TTL expired
function clearCacheIfExpired() {
  const now = Date.now();
  if (now - lastCacheTime > CACHE_TTL) {
    bucketCache.clear();
    lastCacheTime = now;
  }
}

// Initialize storage bucket (idempotent)
export async function initializeBucket() {
  const supabase = createSupabaseClient();

  try {
    // Clear cache if expired
    clearCacheIfExpired();
    
    // If bucket is in cache, skip check
    if (bucketCache.get(BUCKET_NAME)) {
      console.log(`✅ Bucket already exists: ${BUCKET_NAME} (cached)`);
      return { success: true };
    }

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error("❌ Error listing buckets:", listError);
      // If we can't list buckets, assume they exist and cache it
      bucketCache.set(BUCKET_NAME, true);
      return { success: true };
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME);

    if (!bucketExists) {
      // Create bucket (public for now - can be made private later)
      const { data, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true, // Public bucket for easy access
        fileSizeLimit: MAX_FILE_SIZE,
      });

      if (createError) {
        console.error("Error creating bucket:", createError);
        return { success: false, error: createError.message };
      }

      console.log(`✅ Created bucket: ${BUCKET_NAME}`);
    } else {
      console.log(`✅ Bucket already exists: ${BUCKET_NAME}`);
    }

    // Cache result
    bucketCache.set(BUCKET_NAME, true);

    return { success: true };
  } catch (error) {
    console.error("❌ Error initializing bucket:", error);
    // On error, assume bucket exists to avoid blocking operations
    bucketCache.set(BUCKET_NAME, true);
    return { success: true };
  }
}

// Initialize video storage bucket (idempotent)
export async function initializeVideoBucket() {
  const supabase = createSupabaseClient();

  try {
    // Clear cache if expired
    clearCacheIfExpired();
    
    // If bucket is in cache, skip check
    if (bucketCache.get(VIDEO_BUCKET_NAME)) {
      console.log(`✅ Bucket already exists: ${VIDEO_BUCKET_NAME} (cached)`);
      return { success: true };
    }

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error("❌ Error listing buckets:", listError);
      // If we can't list buckets, assume they exist and cache it
      bucketCache.set(VIDEO_BUCKET_NAME, true);
      return { success: true };
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === VIDEO_BUCKET_NAME);

    if (!bucketExists) {
      // Create bucket without fileSizeLimit (use Supabase default limits)
      // Supabase free tier: 50MB per file, paid tier: 5GB per file
      const { data, error: createError } = await supabase.storage.createBucket(VIDEO_BUCKET_NAME, {
        public: true, // Public bucket for easy access
      });

      if (createError) {
        console.error("Error creating bucket:", createError);
        return { success: false, error: createError.message };
      }

      console.log(`✅ Created bucket: ${VIDEO_BUCKET_NAME}`);
    } else {
      console.log(`✅ Bucket already exists: ${VIDEO_BUCKET_NAME}`);
    }

    // Cache result
    bucketCache.set(VIDEO_BUCKET_NAME, true);

    return { success: true };
  } catch (error) {
    console.error("❌ Error initializing bucket:", error);
    // On error, assume bucket exists to avoid blocking operations
    bucketCache.set(VIDEO_BUCKET_NAME, true);
    return { success: true };
  }
}

// Initialize avatar storage bucket (idempotent)
export async function initializeAvatarBucket() {
  const supabase = createSupabaseClient();

  try {
    // Clear cache if expired
    clearCacheIfExpired();
    
    // If bucket is in cache, skip check
    if (bucketCache.get(AVATAR_BUCKET_NAME)) {
      console.log(`✅ Bucket already exists: ${AVATAR_BUCKET_NAME} (cached)`);
      return { success: true };
    }

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error("❌ Error listing buckets:", listError);
      // If we can't list buckets, assume they exist and cache it
      bucketCache.set(AVATAR_BUCKET_NAME, true);
      return { success: true };
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === AVATAR_BUCKET_NAME);

    if (!bucketExists) {
      // Create bucket (public for now - can be made private later)
      const { data, error: createError } = await supabase.storage.createBucket(AVATAR_BUCKET_NAME, {
        public: true, // Public bucket for easy access
        fileSizeLimit: MAX_FILE_SIZE,
      });

      if (createError) {
        console.error("Error creating bucket:", createError);
        return { success: false, error: createError.message };
      }

      console.log(`✅ Created bucket: ${AVATAR_BUCKET_NAME}`);
    } else {
      console.log(`✅ Bucket already exists: ${AVATAR_BUCKET_NAME}`);
    }

    // Cache result
    bucketCache.set(AVATAR_BUCKET_NAME, true);

    return { success: true };
  } catch (error) {
    console.error("❌ Error initializing bucket:", error);
    // On error, assume bucket exists to avoid blocking operations
    bucketCache.set(AVATAR_BUCKET_NAME, true);
    return { success: true };
  }
}

// Upload file to Supabase Storage
export async function uploadFile(
  file: Uint8Array,
  fileName: string,
  contentType: string,
  userId?: string
): Promise<UploadResult> {
  const supabase = createSupabaseClient();

  try {
    // Validate file size
    if (file.length > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Generate unique file path
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().split("-")[0];
    const userPrefix = userId ? `${userId}/` : "anonymous/";
    
    // ✅ Sanitize filename to be URL-safe (remove spaces, special chars)
    const sanitizedFileName = fileName
      .replace(/\s+/g, '_')          // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9._-]/g, '') // Remove special characters (keep dots, dashes, underscores)
      .replace(/_{2,}/g, '_');        // Replace multiple underscores with single
    
    const filePath = `${userPrefix}${timestamp}_${randomId}_${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    console.log(`✅ Uploaded file: ${filePath}`);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (error) {
    console.error("Unexpected upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

// Upload video to Supabase Storage
export async function uploadVideo(
  file: Uint8Array,
  fileName: string,
  contentType: string,
  userId?: string
): Promise<UploadResult> {
  const supabase = createSupabaseClient();

  try {
    // Validate file size
    if (file.length > MAX_VIDEO_SIZE) {
      return {
        success: false,
        error: `File too large. Maximum size: ${MAX_VIDEO_SIZE / 1024 / 1024}MB`,
      };
    }

    // Generate unique file path
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().split("-")[0];
    const userPrefix = userId ? `${userId}/` : "anonymous/";
    
    // ✅ Sanitize filename to be URL-safe (remove spaces, special chars)
    const sanitizedFileName = fileName
      .replace(/\s+/g, '_')          // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9._-]/g, '') // Remove special characters (keep dots, dashes, underscores)
      .replace(/_{2,}/g, '_');        // Replace multiple underscores with single
    
    const filePath = `${userPrefix}${timestamp}_${randomId}_${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(VIDEO_BUCKET_NAME)
      .upload(filePath, file, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(VIDEO_BUCKET_NAME)
      .getPublicUrl(filePath);

    console.log(`✅ Uploaded file: ${filePath}`);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (error) {
    console.error("Unexpected upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

// Upload audio to Supabase Storage (for avatars)
export async function uploadAudio(
  file: Uint8Array,
  fileName: string,
  contentType: string,
  userId?: string
): Promise<UploadResult> {
  const supabase = createSupabaseClient();

  try {
    // Validate file size
    if (file.length > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Generate unique file path
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().split("-")[0];
    const userPrefix = userId ? `${userId}/` : "anonymous/";
    
    // ✅ Sanitize filename to be URL-safe (remove spaces, special chars)
    const sanitizedFileName = fileName
      .replace(/\s+/g, '_')          // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9._-]/g, '') // Remove special characters (keep dots, dashes, underscores)
      .replace(/_{2,}/g, '_');        // Replace multiple underscores with single
    
    const filePath = `${userPrefix}${timestamp}_${randomId}_${sanitizedFileName}`;

    // Upload to Supabase Storage - Avatar bucket
    const { data, error } = await supabase.storage
      .from(AVATAR_BUCKET_NAME)
      .upload(filePath, file, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(AVATAR_BUCKET_NAME)
      .getPublicUrl(filePath);

    console.log(`✅ Uploaded audio file: ${filePath}`);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (error) {
    console.error("Unexpected upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

// Get signed URL for private files (optional - for future use)
export async function getSignedUrl(filePath: string, expiresIn = 3600): Promise<UploadResult> {
  const supabase = createSupabaseClient();

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error("Error creating signed URL:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      url: data.signedUrl,
    };
  } catch (error) {
    console.error("Unexpected error creating signed URL:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create signed URL",
    };
  }
}

// Delete file from storage
export async function deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseClient();

  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      console.error("Error deleting file:", error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Deleted file: ${filePath}`);
    return { success: true };
  } catch (error) {
    console.error("Unexpected error deleting file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

// ============================================
// UTILITY FUNCTIONS FOR COCONUT V9
// ============================================

/**
 * Upload asset from external URL to Supabase Storage
 * Used for downloading generated images/videos from APIs
 */
export async function uploadAssetFromUrl(
  url: string,
  fileType: 'image' | 'video',
  cocoboardId?: string,
  nodeId?: string
): Promise<string> {
  try {
    console.log(`📥 Downloading asset from URL: ${url}`);
    
    // Fetch the asset
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch asset: ${response.statusText}`);
    }
    
    // Get content type from response headers
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Convert to Uint8Array
    const arrayBuffer = await response.arrayBuffer();
    const file = new Uint8Array(arrayBuffer);
    
    console.log(`✅ Downloaded ${file.length} bytes (${contentType})`);
    
    // Generate filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().split("-")[0];
    const prefix = cocoboardId || 'unknown';
    const nodePart = nodeId ? `_${nodeId}` : '';
    const ext = fileType === 'video' ? 'mp4' : 'png';
    const fileName = `${prefix}${nodePart}_${timestamp}_${randomId}.${ext}`;
    
    // Upload based on content type
    let result: UploadResult;
    if (fileType === 'video' || contentType.startsWith('video/')) {
      result = await uploadVideo(file, fileName, contentType, cocoboardId);
    } else {
      result = await uploadFile(file, fileName, contentType, cocoboardId);
    }
    
    if (!result.success || !result.url) {
      throw new Error(result.error || 'Upload failed');
    }
    
    return result.url;
  } catch (error) {
    console.error('❌ Error uploading asset from URL:', error);
    throw error;
  }
}

/**
 * Extract last frame from video
 * Used for video continuity (last frame → next shot starting frame)
 * 
 * Note: This is a placeholder. Full implementation requires FFmpeg.
 * For now, we return the video URL itself and let the video generation API handle it.
 */
export async function extractLastFrameFromVideo(
  videoUrl: string,
  userId?: string
): Promise<UploadResult> {
  try {
    console.log(`🎬 Extracting last frame from video: ${videoUrl}`);
    
    // TODO: Full implementation with FFmpeg
    // For now, return the video URL (Veo 3.1 can accept video URLs as references)
    console.log('⚠️ Last frame extraction not yet implemented - using video URL directly');
    
    return {
      success: true,
      url: videoUrl,
      publicUrl: videoUrl,
    };
  } catch (error) {
    console.error('❌ Error extracting last frame:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Last frame extraction failed',
    };
  }
}