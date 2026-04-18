/**
 * Community Feed Storage Management
 * Handles bucket initialization and asset uploads for the feed system
 */

import { createClient } from 'jsr:@supabase/supabase-js';

// ✅ Create Supabase client with service role key for storage operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

/**
 * Sanitize userId to remove invalid characters for storage paths
 */
function sanitizeUserId(userId: string): string {
  return userId.replace(/[|:*?\"<>]/g, '_');
}

/**
 * Initialize community feed storage bucket
 */
export async function initializeFeedBucket() {
  try {
    const bucketName = 'make-e55aa214-community-feed';
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error(`❌ Failed to list buckets:`, listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`📦 Creating bucket: ${bucketName}...`);
      
      // ✅ SIMPLIFIED: Remove fileSizeLimit and allowedMimeTypes (may exceed free tier limits)
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true // Public read access for community content
      });
      
      if (error) {
        // ✅ If bucket already exists (409), that's OK - just log it
        if (error.statusCode === '409' || error.message?.includes('already exists')) {
          console.log(`✅ Bucket ${bucketName} already exists (detected via error)`);
          return true;
        }
        
        console.error(`❌ Failed to create bucket ${bucketName}:`, error);
        return false;
      }
      
      console.log(`✅ Bucket ${bucketName} created successfully`);
    } else {
      console.log(`✅ Bucket ${bucketName} already exists`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Feed bucket initialization error:', error);
    return false;
  }
}

/**
 * Upload asset to community feed bucket
 */
export async function uploadFeedAsset(
  userId: string,
  creationId: string,
  assetUrl: string,
  type: 'image' | 'video' | 'avatar'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const bucketName = 'make-e55aa214-community-feed';
    
    // Download asset from external URL
    const response = await fetch(assetUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch asset: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const extension = type === 'video' ? 'mp4' : 'png';
    
    // ✅ FIX: Sanitize userId to remove invalid characters for storage paths
    const sanitizedUserId = sanitizeUserId(userId);
    const filename = `${sanitizedUserId}/${creationId}/asset.${extension}`;
    
    console.log(`📦 Uploading to storage: ${filename}`);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filename, blob, {
        contentType: blob.type,
        upsert: true
      });
    
    if (error) {
      console.error('❌ [Supabase] ❌ Upload error:', error);
      return { success: false, error: error.message };
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filename);
    
    console.log(`✅ Uploaded feed asset: ${urlData.publicUrl}`);
    
    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error('❌ [Supabase] ❌ Feed asset upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}