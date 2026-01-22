/**
 * AVATAR UPLOAD ROUTES
 * Handle avatar image upload to Supabase Storage
 */

import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const BUCKET_NAME = 'make-e55aa214-avatars';

/**
 * POST /avatar/upload
 * Upload avatar image
 */
app.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('avatar') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return c.json({
        success: false,
        error: 'avatar file and userId required'
      }, 400);
    }

    console.log(`📤 [Avatar Upload] Uploading avatar for user: ${userId}, size: ${file.size} bytes`);

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log(`🪣 [Avatar Upload] Creating bucket: ${BUCKET_NAME}`);
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880, // 5MB max
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${userId}-${Date.now()}.${ext}`;
    const filepath = `avatars/${filename}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filepath, uint8Array, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error('❌ [Avatar Upload] Storage error:', error);
      return c.json({
        success: false,
        error: `Storage upload failed: ${error.message}`
      }, 500);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filepath);

    console.log(`✅ [Avatar Upload] Uploaded successfully:`, publicUrl);

    // Update user profile with new avatar URL
    const profile = await kv.get(`user:profile:${userId}`);
    if (profile) {
      // Delete old avatar from storage if it exists and is from our bucket
      if (profile.avatar && profile.avatar.includes(BUCKET_NAME)) {
        const oldPath = profile.avatar.split(`/${BUCKET_NAME}/`)[1];
        if (oldPath) {
          await supabase.storage
            .from(BUCKET_NAME)
            .remove([oldPath]);
          console.log(`🗑️ [Avatar Upload] Deleted old avatar: ${oldPath}`);
        }
      }

      profile.avatar = publicUrl;
      profile.updatedAt = new Date().toISOString();
      await kv.set(`user:profile:${userId}`, profile);
      console.log(`✅ [Avatar Upload] Profile updated with new avatar`);
    }

    // Also update user:userId KV entry if it exists
    const userKV = await kv.get(`user:${userId}`);
    if (userKV) {
      userKV.avatar = publicUrl;
      userKV.updatedAt = new Date().toISOString();
      await kv.set(`user:${userId}`, userKV);
    }

    return c.json({
      success: true,
      avatarUrl: publicUrl
    });

  } catch (error) {
    console.error('❌ [Avatar Upload] Error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload avatar'
    }, 500);
  }
});

/**
 * DELETE /avatar/:userId
 * Delete user avatar
 */
app.delete('/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    const profile = await kv.get(`user:profile:${userId}`);
    if (!profile) {
      return c.json({
        success: false,
        error: 'Profile not found'
      }, 404);
    }

    // Delete from storage if it's our uploaded avatar
    if (profile.avatar && profile.avatar.includes(BUCKET_NAME)) {
      const filepath = profile.avatar.split(`/${BUCKET_NAME}/`)[1];
      if (filepath) {
        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([filepath]);

        if (error) {
          console.error('❌ [Avatar Delete] Storage error:', error);
        } else {
          console.log(`✅ [Avatar Delete] Deleted from storage: ${filepath}`);
        }
      }
    }

    // Clear avatar from profile
    profile.avatar = '';
    profile.updatedAt = new Date().toISOString();
    await kv.set(`user:profile:${userId}`, profile);

    // Also update user:userId KV entry
    const userKV = await kv.get(`user:${userId}`);
    if (userKV) {
      userKV.avatar = '';
      userKV.updatedAt = new Date().toISOString();
      await kv.set(`user:${userId}`, userKV);
    }

    return c.json({
      success: true
    });

  } catch (error) {
    console.error('❌ [Avatar Delete] Error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete avatar'
    }, 500);
  }
});

export default app;
