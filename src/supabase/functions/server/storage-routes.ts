/**
 * STORAGE ROUTES - Simple upload endpoints
 * For frontend compatibility
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { uploadReference } from './coconut-v14-storage.ts';
import * as kv from './kv_store.tsx'; // ✅ Import KV store

const app = new Hono();

// ✅ CORS - Open configuration for all origins
app.use('*', cors({
  origin: '*', // Allow all origins
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 24 hours
  credentials: true,
}));

// ============================================
// HEALTH CHECK / DIAGNOSTICS
// ============================================

app.get('/health', async (c) => {
  return c.json({
    success: true,
    service: 'storage',
    timestamp: new Date().toISOString(),
    message: 'Storage service is operational'
  });
});

// ============================================
// STORAGE QUOTA LIMITS
// ============================================

const STORAGE_QUOTAS = {
  individual: 100 * 1024 * 1024,  // 100MB
  enterprise: 10 * 1024 * 1024 * 1024  // 10GB
};

// ============================================
// HELPER: Calculate user's total storage used
// ============================================

async function getUserStorageUsed(userId: string): Promise<number> {
  const uploads = await kv.getByPrefix(`upload:${userId}:`) || [];
  return uploads.reduce((total, upload) => total + (upload.fileSize || 0), 0);
}

// ============================================
// HELPER: Check storage quota
// ============================================

async function checkStorageQuota(
  userId: string, 
  accountType: 'individual' | 'enterprise',
  newFileSize: number
): Promise<{ allowed: boolean; used: number; quota: number; error?: string }> {
  const used = await getUserStorageUsed(userId);
  const quota = STORAGE_QUOTAS[accountType];
  
  if (used + newFileSize > quota) {
    const usedMB = (used / 1024 / 1024).toFixed(2);
    const quotaMB = (quota / 1024 / 1024).toFixed(2);
    return {
      allowed: false,
      used,
      quota,
      error: `Storage quota exceeded. Using ${usedMB}MB of ${quotaMB}MB.`
    };
  }
  
  return { allowed: true, used, quota };
}

// ============================================
// /storage/upload - Image upload
// ============================================

app.post('/upload', async (c) => {
  try {
    console.log('📤 [STORAGE] Image upload request');
    
    const body = await c.req.json();
    const { imageData, filename, contentType, userId, projectId, accountType } = body;
    
    console.log('📤 [STORAGE] Request details:', {
      hasImageData: !!imageData,
      imageDataLength: imageData?.length,
      imageDataPrefix: imageData?.substring(0, 50),
      filename,
      contentType,
      userId,
      projectId,
      accountType
    });
    
    if (!imageData) {
      return c.json({
        success: false,
        error: 'No image data provided'
      }, 400);
    }
    
    // ✅ Validate userId
    if (!userId || userId === 'anonymous') {
      return c.json({
        success: false,
        error: 'Authentication required. Please sign in to upload images.'
      }, 401);
    }
    
    // ✅ Fetch user profile to get accountType if not provided
    let userAccountType = accountType;
    if (!userAccountType) {
      const profile = await kv.get(`user:profile:${userId}`);
      userAccountType = profile?.accountType || 'individual';
      console.log(`📋 User accountType: ${userAccountType}`);
    }
    
    // Convert base64 to Blob
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    console.log('🔧 [STORAGE] Base64 processing:', {
      hasComma: imageData.includes(','),
      extractedLength: base64Data.length,
      extractedPrefix: base64Data.substring(0, 50)
    });
    
    let binaryString;
    try {
      binaryString = atob(base64Data);
    } catch (atobError) {
      console.error('❌ [STORAGE] atob() failed:', atobError);
      console.error('   Base64 data (first 100 chars):', base64Data.substring(0, 100));
      return c.json({
        success: false,
        error: `Invalid base64 data: ${atobError.message}. Filename: ${filename}`
      }, 400);
    }
    
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: contentType || 'image/png' });
    
    // ✅ Check storage quota BEFORE upload
    const quotaCheck = await checkStorageQuota(userId, userAccountType, blob.size);
    if (!quotaCheck.allowed) {
      console.warn(`⚠️ [STORAGE] Quota exceeded for user ${userId}`);
      return c.json({
        success: false,
        error: quotaCheck.error,
        quota: {
          used: quotaCheck.used,
          total: quotaCheck.quota,
          percentage: Math.round((quotaCheck.used / quotaCheck.quota) * 100)
        }
      }, 413); // 413 = Payload Too Large
    }
    
    // ✅ Use provided projectId or create a default one
    const finalProjectId = projectId || `individual-uploads-${userId}`;
    
    // Upload using storage service
    const result = await uploadReference({
      userId: userId,
      projectId: finalProjectId,
      file: blob,
      fileName: filename || 'image.png',
      fileType: contentType || 'image/png',
      fileSize: blob.size,
      category: 'image',
      accountType: userAccountType // ✅ Pass accountType to select correct bucket
    });
    
    if (result.success) {
      // ✅ Save metadata to KV store for tracking
      const uploadId = crypto.randomUUID();
      const now = new Date();
      
      // Calculate expiration (24h for individual, never for enterprise)
      const expiresAt = userAccountType === 'enterprise' 
        ? null 
        : new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      
      const metadata = {
        uploadId,
        userId,
        projectId: finalProjectId,
        fileName: filename || 'image.png',
        fileSize: blob.size,
        fileType: contentType || 'image/png',
        category: 'image',
        url: result.url,
        publicUrl: result.url,
        signedUrl: result.signedUrl,
        path: result.path,
        accountType: userAccountType,
        uploadedAt: now.toISOString(),
        expiresAt,
        isInFeedPost: false, // Will be updated when posted to feed
        bucketName: 'make-e55aa214-uploads' // ✅ Use existing PUBLIC bucket
      };
      
      // Save to KV store
      await kv.set(`upload:${userId}:${uploadId}`, metadata);
      
      // Also index by path for cleanup service
      await kv.set(`upload:path:${result.path}`, {
        uploadId,
        userId,
        accountType: userAccountType,
        expiresAt
      });
      
      console.log(`✅ [STORAGE] Upload metadata saved: ${uploadId}`);
      console.log(`   Account: ${userAccountType}, Expires: ${expiresAt || 'NEVER'}`);
      
      // Calculate new storage usage
      const newUsed = await getUserStorageUsed(userId);
      const quota = STORAGE_QUOTAS[userAccountType];
      
      return c.json({
        success: true,
        url: result.signedUrl || result.url,
        publicUrl: result.url,
        path: result.path,
        uploadId,
        metadata: {
          expiresAt,
          accountType: userAccountType,
          quota: {
            used: newUsed,
            total: quota,
            percentage: Math.round((newUsed / quota) * 100)
          }
        }
      });
    } else {
      return c.json({
        success: false,
        error: result.error
      }, 500);
    }
    
  } catch (error) {
    console.error('❌ [STORAGE] Upload error:', error);
    return c.json({
      success: false,
      error: error.message || 'Upload failed'
    }, 500);
  }
});

// ============================================
// /storage/upload-audio - Audio upload
// ============================================

app.post('/upload-audio', async (c) => {
  try {
    console.log('📤 [STORAGE] Audio upload request');
    
    const body = await c.req.json();
    const { audioData, filename, contentType, userId, projectId, accountType } = body;
    
    if (!audioData) {
      return c.json({
        success: false,
        error: 'No audio data provided'
      }, 400);
    }
    
    // ✅ Validate userId
    if (!userId || userId === 'anonymous') {
      return c.json({
        success: false,
        error: 'Authentication required. Please sign in to upload audio.'
      }, 401);
    }
    
    // ✅ Fetch user profile to get accountType if not provided
    let userAccountType = accountType;
    if (!userAccountType) {
      const profile = await kv.get(`user:profile:${userId}`);
      userAccountType = profile?.accountType || 'individual';
      console.log(`📋 User accountType: ${userAccountType}`);
    }
    
    // Convert base64 to Blob
    const base64Data = audioData.includes(',') ? audioData.split(',')[1] : audioData;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: contentType || 'audio/mpeg' });
    
    // ✅ Check storage quota BEFORE upload
    const quotaCheck = await checkStorageQuota(userId, userAccountType, blob.size);
    if (!quotaCheck.allowed) {
      console.warn(`⚠️ [STORAGE] Quota exceeded for user ${userId}`);
      return c.json({
        success: false,
        error: quotaCheck.error,
        quota: {
          used: quotaCheck.used,
          total: quotaCheck.quota,
          percentage: Math.round((quotaCheck.used / quotaCheck.quota) * 100)
        }
      }, 413);
    }
    
    // ✅ Use provided projectId or create a default one
    const finalProjectId = projectId || `individual-uploads-${userId}`;
    
    // Upload using storage service
    const result = await uploadReference({
      userId: userId,
      projectId: finalProjectId,
      file: blob,
      fileName: filename || 'audio.mp3',
      fileType: contentType || 'audio/mpeg',
      fileSize: blob.size,
      category: 'video', // Use video category for audio files
      accountType: userAccountType // ✅ Pass accountType to select correct bucket
    });
    
    if (result.success) {
      // ✅ Save metadata to KV store for tracking
      const uploadId = crypto.randomUUID();
      const now = new Date();
      
      // Calculate expiration (24h for individual, never for enterprise)
      const expiresAt = userAccountType === 'enterprise' 
        ? null 
        : new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      
      const metadata = {
        uploadId,
        userId,
        projectId: finalProjectId,
        fileName: filename || 'audio.mp3',
        fileSize: blob.size,
        fileType: contentType || 'audio/mpeg',
        category: 'audio',
        url: result.url,
        publicUrl: result.url,
        signedUrl: result.signedUrl,
        path: result.path,
        accountType: userAccountType,
        uploadedAt: now.toISOString(),
        expiresAt,
        isInFeedPost: false,
        bucketName: 'coconut-v14-references'
      };
      
      // Save to KV store
      await kv.set(`upload:${userId}:${uploadId}`, metadata);
      
      // Also index by path for cleanup service
      await kv.set(`upload:path:${result.path}`, {
        uploadId,
        userId,
        accountType: userAccountType,
        expiresAt
      });
      
      console.log(`✅ [STORAGE] Audio upload metadata saved: ${uploadId}`);
      console.log(`   Account: ${userAccountType}, Expires: ${expiresAt || 'NEVER'}`);
      
      // Calculate new storage usage
      const newUsed = await getUserStorageUsed(userId);
      const quota = STORAGE_QUOTAS[userAccountType];
      
      return c.json({
        success: true,
        url: result.signedUrl || result.url,
        publicUrl: result.url,
        path: result.path,
        uploadId,
        metadata: {
          expiresAt,
          accountType: userAccountType,
          quota: {
            used: newUsed,
            total: quota,
            percentage: Math.round((newUsed / quota) * 100)
          }
        }
      });
    } else {
      return c.json({
        success: false,
        error: result.error
      }, 500);
    }
    
  } catch (error) {
    console.error('❌ [STORAGE] Audio upload error:', error);
    return c.json({
      success: false,
      error: error.message || 'Upload failed'
    }, 500);
  }
});

// ============================================
// /storage/quota - Get user's storage quota
// ============================================

app.get('/quota/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'userId required'
      }, 400);
    }
    
    // Fetch user profile
    const profile = await kv.get(`user:profile:${userId}`);
    const accountType = profile?.accountType || 'individual';
    
    // Calculate storage used
    const used = await getUserStorageUsed(userId);
    const quota = STORAGE_QUOTAS[accountType];
    const percentage = Math.round((used / quota) * 100);
    
    // Get upload count
    const uploads = await kv.getByPrefix(`upload:${userId}:`) || [];
    
    return c.json({
      success: true,
      data: {
        accountType,
        quota: {
          used,
          total: quota,
          percentage,
          usedMB: (used / 1024 / 1024).toFixed(2),
          totalMB: (quota / 1024 / 1024).toFixed(0),
          available: quota - used,
          availableMB: ((quota - used) / 1024 / 1024).toFixed(2)
        },
        uploads: {
          total: uploads.length,
          byCategory: {
            image: uploads.filter(u => u.category === 'image').length,
            video: uploads.filter(u => u.category === 'video').length,
            audio: uploads.filter(u => u.category === 'audio').length
          }
        }
      }
    });
  } catch (error) {
    console.error('❌ [STORAGE] Quota check error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// ============================================
// /storage/list/:userId - List user uploads
// ============================================

app.get('/list/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'userId required'
      }, 400);
    }
    
    // Get all uploads for user
    const uploads = await kv.getByPrefix(`upload:${userId}:`) || [];
    
    // Sort by upload date (newest first)
    uploads.sort((a, b) => {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
    
    return c.json({
      success: true,
      data: {
        uploads,
        total: uploads.length
      }
    });
  } catch (error) {
    console.error('❌ [STORAGE] List uploads error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// ============================================
// /storage/delete/:uploadId - Delete upload
// ============================================

app.delete('/delete/:uploadId', async (c) => {
  try {
    const uploadId = c.req.param('uploadId');
    const { userId } = await c.req.json();
    
    if (!uploadId || !userId) {
      return c.json({
        success: false,
        error: 'uploadId and userId required'
      }, 400);
    }
    
    // Get upload metadata
    const upload = await kv.get(`upload:${userId}:${uploadId}`);
    
    if (!upload) {
      return c.json({
        success: false,
        error: 'Upload not found'
      }, 404);
    }
    
    // Check if upload is in a feed post (cannot delete)
    if (upload.isInFeedPost) {
      return c.json({
        success: false,
        error: 'Cannot delete: This file is used in a published post'
      }, 403);
    }
    
    // Delete from Supabase Storage
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { error: storageError } = await supabase.storage
      .from(upload.bucketName)
      .remove([upload.path]);
    
    if (storageError) {
      console.error('⚠️ [STORAGE] Failed to delete from storage:', storageError);
    }
    
    // Delete from KV store
    await kv.del(`upload:${userId}:${uploadId}`);
    await kv.del(`upload:path:${upload.path}`);
    
    console.log(`✅ [STORAGE] Deleted upload: ${uploadId}`);
    
    return c.json({
      success: true,
      message: 'Upload deleted successfully'
    });
  } catch (error) {
    console.error('❌ [STORAGE] Delete error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

export default app;