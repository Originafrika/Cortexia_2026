/**
 * CORTEXIA ASSETS API
 * Upload et gestion des assets utilisateur (logo, produit, références)
 */

import { Context } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const BUCKET_NAME = 'make-e55aa214-cortexia-assets';

// Initialize bucket
export async function initializeAssetsBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log('Creating Cortexia assets bucket...');
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 10485760 // 10MB
      });
      console.log('✅ Bucket created');
    }
  } catch (error) {
    console.error('❌ Bucket initialization error:', error);
  }
}

// Upload asset
export async function uploadAsset(c: Context) {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const purpose = formData.get('purpose') as string;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'Only image files are allowed' }, 400);
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: 'File too large (max 10MB)' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const ext = file.name.split('.').pop();
    const filename = `${purpose}-${timestamp}-${randomId}.${ext}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Upload failed: ' + uploadError.message }, 500);
    }

    // Generate signed URL (valid for 1 year)
    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filename, 31536000); // 1 year

    if (!urlData?.signedUrl) {
      return c.json({ error: 'Failed to generate signed URL' }, 500);
    }

    console.log(`✅ Asset uploaded: ${filename} (${purpose})`);

    return c.json({
      url: urlData.signedUrl,
      filename,
      purpose,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('❌ Asset upload error:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }, 500);
  }
}

// List user assets
export async function listAssets(c: Context) {
  try {
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('List error:', error);
      return c.json({ error: 'Failed to list assets' }, 500);
    }

    // Generate signed URLs for all files
    const assetsWithUrls = await Promise.all(
      (files || []).map(async (file) => {
        const { data: urlData } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(file.name, 3600); // 1 hour

        return {
          name: file.name,
          url: urlData?.signedUrl || null,
          size: file.metadata?.size || 0,
          createdAt: file.created_at
        };
      })
    );

    return c.json({ assets: assetsWithUrls });

  } catch (error) {
    console.error('❌ List assets error:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to list assets' 
    }, 500);
  }
}

// Delete asset
export async function deleteAsset(c: Context) {
  try {
    const { filename } = await c.req.json();

    if (!filename) {
      return c.json({ error: 'Filename required' }, 400);
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filename]);

    if (error) {
      console.error('Delete error:', error);
      return c.json({ error: 'Failed to delete asset' }, 500);
    }

    console.log(`✅ Asset deleted: ${filename}`);
    return c.json({ success: true });

  } catch (error) {
    console.error('❌ Delete asset error:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Delete failed' 
    }, 500);
  }
}
