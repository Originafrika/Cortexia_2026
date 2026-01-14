// ============================================
// COCONUT V14 - UPLOAD ROUTES
// ============================================
// API endpoints pour upload de références (images/vidéos)

import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as storage from './coconut-v14-storage.ts';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

app.use('*', logger(console.log));

// ============================================
// UPLOAD SINGLE REFERENCE
// ============================================

app.post('/upload/reference', async (c) => {
  try {
    console.log('📤 [UPLOAD] Single reference upload request');
    
    // Parse form data
    const formData = await c.req.formData();
    
    const userId = formData.get('userId') as string;
    const projectId = formData.get('projectId') as string;
    const category = formData.get('category') as string; // 'image' or 'video'
    const file = formData.get('file') as File;
    
    // Validation
    if (!userId || !projectId || !category || !file) {
      return c.json({
        success: false,
        error: 'Missing required fields: userId, projectId, category, or file'
      }, 400);
    }
    
    if (category !== 'image' && category !== 'video') {
      return c.json({
        success: false,
        error: 'Invalid category. Must be "image" or "video"'
      }, 400);
    }
    
    console.log(`📦 Uploading file: ${file.name} (${file.type}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    
    // Upload to storage
    const result = await storage.uploadReference({
      userId,
      projectId,
      file,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      category: category as 'image' | 'video'
    });
    
    if (!result.success) {
      console.error('❌ Upload failed:', result.error);
      return c.json({
        success: false,
        error: result.error
      }, 500);
    }
    
    console.log('✅ Upload successful:', result.signedUrl);
    
    return c.json({
      success: true,
      data: {
        url: result.url,
        signedUrl: result.signedUrl,
        path: result.path,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        category
      }
    });
    
  } catch (error) {
    console.error('❌ [UPLOAD] Exception:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// ============================================
// UPLOAD BATCH REFERENCES
// ============================================

app.post('/upload/references/batch', async (c) => {
  try {
    console.log('📦 [UPLOAD] Batch upload request');
    
    // Parse form data
    const formData = await c.req.formData();
    
    const userId = formData.get('userId') as string;
    const projectId = formData.get('projectId') as string;
    
    // Validation
    if (!userId || !projectId) {
      return c.json({
        success: false,
        error: 'Missing required fields: userId or projectId'
      }, 400);
    }
    
    // Extract files
    const files: Array<{
      file: File;
      fileName: string;
      fileType: string;
      fileSize: number;
      category: 'image' | 'video';
    }> = [];
    
    let fileIndex = 0;
    while (true) {
      const file = formData.get(`file_${fileIndex}`) as File | null;
      const category = formData.get(`category_${fileIndex}`) as string | null;
      
      if (!file || !category) break;
      
      files.push({
        file,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        category: category as 'image' | 'video'
      });
      
      fileIndex++;
    }
    
    if (files.length === 0) {
      return c.json({
        success: false,
        error: 'No files provided'
      }, 400);
    }
    
    console.log(`📦 Uploading ${files.length} files...`);
    
    // Upload batch
    const result = await storage.uploadReferenceBatch(userId, projectId, files);
    
    console.log(`✅ Batch upload complete: ${result.successCount} success, ${result.failureCount} failed`);
    
    return c.json({
      success: result.success,
      data: {
        uploaded: result.uploaded.map((r, i) => ({
          ...r,
          fileName: files[i].fileName,
          fileType: files[i].fileType,
          fileSize: files[i].fileSize,
          category: files[i].category
        })),
        failed: result.failed,
        total: result.total,
        successCount: result.successCount,
        failureCount: result.failureCount
      }
    });
    
  } catch (error) {
    console.error('❌ [UPLOAD] Batch exception:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// ============================================
// REFRESH SIGNED URLS
// ============================================

app.post('/upload/refresh-urls', async (c) => {
  try {
    console.log('🔄 [UPLOAD] Refresh signed URLs request');
    
    const body = await c.req.json();
    const { paths } = body;
    
    if (!paths || !Array.isArray(paths)) {
      return c.json({
        success: false,
        error: 'Missing or invalid paths array'
      }, 400);
    }
    
    console.log(`🔄 Refreshing ${paths.length} URLs...`);
    
    const result = await storage.refreshReferenceUrls(paths);
    
    console.log('✅ URLs refreshed');
    
    return c.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('❌ [UPLOAD] Refresh exception:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// ============================================
// DELETE FILE
// ============================================

app.delete('/upload/reference/:path', async (c) => {
  try {
    const path = c.req.param('path');
    
    console.log(`🗑️ [UPLOAD] Delete request: ${path}`);
    
    // Delete from references bucket
    const result = await storage.deleteFile('coconut-v14-references', path);
    
    if (!result.success) {
      return c.json({
        success: false,
        error: result.error
      }, 500);
    }
    
    console.log('✅ File deleted');
    
    return c.json({
      success: true
    });
    
  } catch (error) {
    console.error('❌ [UPLOAD] Delete exception:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// ============================================
// GET STORAGE INFO
// ============================================

app.get('/upload/info', async (c) => {
  try {
    return c.json({
      success: true,
      data: storage.STORAGE_INFO
    });
  } catch (error) {
    console.error('❌ [UPLOAD] Info exception:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/upload/health', async (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'upload',
    version: '14.0.0'
  });
});

// ============================================
// EXPORT
// ============================================

console.log('✅ Upload routes loaded');

export default app;
