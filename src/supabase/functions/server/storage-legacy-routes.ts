/**
 * LEGACY UPLOAD ROUTES - Compatibility layer
 * ⚠️ For backwards compatibility with existing frontend code
 * These routes forward to the new upload system
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const app = new Hono();

// Enable CORS
app.use('*', cors());

// ============================================
// LEGACY /storage/upload (redirects to /upload/reference)
// ============================================

app.post('/upload', async (c) => {
  try {
    console.log('📤 [LEGACY UPLOAD] /storage/upload request');
    
    const body = await c.req.json();
    const { imageData, filename, contentType, userId } = body;
    
    if (!imageData) {
      return c.json({
        success: false,
        error: 'No image data provided'
      }, 400);
    }
    
    // Convert base64 to Blob
    const base64Data = imageData.split(',')[1] || imageData;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType || 'image/png' });
    
    // Forward to new upload system
    const formData = new FormData();
    formData.append('file', blob, filename || 'image.png');
    formData.append('userId', userId || 'anonymous');
    formData.append('projectId', 'legacy-upload-' + Date.now());
    formData.append('category', 'image');
    
    // Call new upload endpoint
    const response = await fetch(
      `https://${c.env.SUPABASE_URL}/functions/v1/make-server-e55aa214/upload/reference`,
      {
        method: 'POST',
        headers: {
          'Authorization': c.req.header('Authorization') || ''
        },
        body: formData
      }
    );
    
    const result = await response.json();
    
    if (result.success) {
      return c.json({
        success: true,
        url: result.signedUrl || result.url,
        publicUrl: result.url,
        path: result.path
      });
    } else {
      return c.json({
        success: false,
        error: result.error
      }, 500);
    }
    
  } catch (error) {
    console.error('❌ [LEGACY UPLOAD] Error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// ============================================
// LEGACY /storage/upload-audio
// ============================================

app.post('/upload-audio', async (c) => {
  try {
    console.log('📤 [LEGACY UPLOAD] /storage/upload-audio request');
    
    const body = await c.req.json();
    const { audioData, filename, contentType, userId } = body;
    
    if (!audioData) {
      return c.json({
        success: false,
        error: 'No audio data provided'
      }, 400);
    }
    
    // Convert base64 to Blob
    const base64Data = audioData.split(',')[1] || audioData;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType || 'audio/mpeg' });
    
    // Forward to new upload system (or handle directly - audio might need special handling)
    // For now, store in references bucket
    const formData = new FormData();
    formData.append('file', blob, filename || 'audio.mp3');
    formData.append('userId', userId || 'anonymous');
    formData.append('projectId', 'legacy-audio-' + Date.now());
    formData.append('category', 'video'); // Use video category for audio
    
    // Call new upload endpoint
    const response = await fetch(
      `https://${c.env.SUPABASE_URL}/functions/v1/make-server-e55aa214/upload/reference`,
      {
        method: 'POST',
        headers: {
          'Authorization': c.req.header('Authorization') || ''
        },
        body: formData
      }
    );
    
    const result = await response.json();
    
    if (result.success) {
      return c.json({
        success: true,
        url: result.signedUrl || result.url,
        publicUrl: result.url,
        path: result.path
      });
    } else {
      return c.json({
        success: false,
        error: result.error
      }, 500);
    }
    
  } catch (error) {
    console.error('❌ [LEGACY UPLOAD AUDIO] Error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

export default app;
