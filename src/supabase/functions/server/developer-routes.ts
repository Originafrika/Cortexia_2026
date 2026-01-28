/**
 * DEVELOPER DASHBOARD ROUTES
 * 
 * API endpoints for developer features
 * 
 * Routes:
 * - GET /developer/api-keys - Get all API keys
 * - POST /developer/api-keys - Create new API key
 * - DELETE /developer/api-keys/:keyId - Delete API key
 * - GET /developer/usage - Get usage statistics
 * - GET /developer/webhooks - Get all webhooks
 * - POST /developer/webhooks - Create webhook
 * - PATCH /developer/webhooks/:webhookId - Update webhook
 * - DELETE /developer/webhooks/:webhookId - Delete webhook
 * - POST /developer/webhooks/:webhookId/test - Test webhook
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { nanoid } from 'npm:nanoid';

const app = new Hono();

console.log('👨‍💻 Developer routes module loaded');

// ============================================
// API KEYS MANAGEMENT
// ============================================

// Get all API keys for user
app.get('/api-keys', async (c) => {
  console.log('👨‍💻 [Developer] GET /developer/api-keys');
  
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing query parameter: userId'
      }, 400);
    }
    
    // Get API keys from KV store
    const apiKeys = await kv.get(`developer:api-keys:${userId}`) || [];
    
    console.log(`✅ [Developer] Found ${apiKeys.length} API keys for user ${userId}`);
    
    return c.json({
      success: true,
      data: { apiKeys }
    });
    
  } catch (error) {
    console.error('❌ [Developer] Error fetching API keys:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Create new API key
app.post('/api-keys', async (c) => {
  console.log('👨‍💻 [Developer] POST /developer/api-keys');
  
  try {
    const body = await c.req.json();
    const { userId, name, scopes } = body;
    
    if (!userId || !name || !scopes) {
      return c.json({
        success: false,
        error: 'Missing required fields: userId, name, scopes'
      }, 400);
    }
    
    // Generate API key
    const apiKey = `crtx_${nanoid(32)}`;
    const keyId = nanoid(16);
    
    // Get existing keys
    const existingKeys = await kv.get(`developer:api-keys:${userId}`) || [];
    
    // Create new key object
    const newKey = {
      id: keyId,
      name,
      key: apiKey,
      scopes,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0,
      status: 'active'
    };
    
    // Add new key
    existingKeys.push(newKey);
    
    // Save to KV store
    await kv.set(`developer:api-keys:${userId}`, existingKeys);
    
    console.log(`✅ [Developer] API key created: ${keyId}`);
    
    return c.json({
      success: true,
      data: { apiKey: newKey }
    });
    
  } catch (error) {
    console.error('❌ [Developer] Error creating API key:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Delete API key
app.delete('/api-keys/:keyId', async (c) => {
  const keyId = c.req.param('keyId');
  console.log(`👨‍💻 [Developer] DELETE /developer/api-keys/${keyId}`);
  
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing query parameter: userId'
      }, 400);
    }
    
    // Get existing keys
    const existingKeys = await kv.get(`developer:api-keys:${userId}`) || [];
    
    // Remove key
    const updatedKeys = existingKeys.filter((k: any) => k.id !== keyId);
    
    // Save to KV store
    await kv.set(`developer:api-keys:${userId}`, updatedKeys);
    
    console.log(`✅ [Developer] API key deleted: ${keyId}`);
    
    return c.json({
      success: true,
      data: { message: 'API key deleted successfully' }
    });
    
  } catch (error) {
    console.error('❌ [Developer] Error deleting API key:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================
// USAGE STATISTICS
// ============================================

// Get usage statistics
app.get('/usage', async (c) => {
  console.log('👨‍💻 [Developer] GET /developer/usage');
  
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing query parameter: userId'
      }, 400);
    }
    
    // Get usage stats from KV store
    const usageStats = await kv.get(`developer:usage:${userId}`) || {
      totalRequests: 0,
      totalImages: 0,
      totalVideos: 0,
      totalCredits: 0,
      requestsByDay: [],
      requestsByEndpoint: {},
      averageResponseTime: 0
    };
    
    console.log(`✅ [Developer] Usage stats retrieved for ${userId}`);
    
    return c.json({
      success: true,
      data: { stats: usageStats }
    });
    
  } catch (error) {
    console.error('❌ [Developer] Error fetching usage:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ============================================
// WEBHOOKS MANAGEMENT
// ============================================

// Get all webhooks
app.get('/webhooks', async (c) => {
  console.log('👨‍💻 [Developer] GET /developer/webhooks');
  
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing query parameter: userId'
      }, 400);
    }
    
    // Get webhooks from KV store
    const webhooks = await kv.get(`developer:webhooks:${userId}`) || [];
    
    console.log(`✅ [Developer] Found ${webhooks.length} webhooks for user ${userId}`);
    
    return c.json({
      success: true,
      data: { webhooks }
    });
    
  } catch (error) {
    console.error('❌ [Developer] Error fetching webhooks:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Create webhook
app.post('/webhooks', async (c) => {
  console.log('👨‍💻 [Developer] POST /developer/webhooks');
  
  try {
    const body = await c.req.json();
    const { userId, url, events, secret } = body;
    
    if (!userId || !url || !events) {
      return c.json({
        success: false,
        error: 'Missing required fields: userId, url, events'
      }, 400);
    }
    
    const webhookId = nanoid(16);
    
    // Get existing webhooks
    const existingWebhooks = await kv.get(`developer:webhooks:${userId}`) || [];
    
    // Create new webhook
    const newWebhook = {
      id: webhookId,
      url,
      events,
      secret: secret || nanoid(32),
      status: 'active',
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      deliveryCount: 0,
      failureCount: 0
    };
    
    // Add webhook
    existingWebhooks.push(newWebhook);
    
    // Save to KV store
    await kv.set(`developer:webhooks:${userId}`, existingWebhooks);
    
    console.log(`✅ [Developer] Webhook created: ${webhookId}`);
    
    return c.json({
      success: true,
      data: { webhook: newWebhook }
    });
    
  } catch (error) {
    console.error('❌ [Developer] Error creating webhook:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Update webhook
app.patch('/webhooks/:webhookId', async (c) => {
  const webhookId = c.req.param('webhookId');
  console.log(`👨‍💻 [Developer] PATCH /developer/webhooks/${webhookId}`);
  
  try {
    const body = await c.req.json();
    const { userId, url, events, status } = body;
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing required field: userId'
      }, 400);
    }
    
    // Get existing webhooks
    const existingWebhooks = await kv.get(`developer:webhooks:${userId}`) || [];
    
    // Find and update webhook
    const updatedWebhooks = existingWebhooks.map((w: any) => {
      if (w.id === webhookId) {
        return {
          ...w,
          url: url || w.url,
          events: events || w.events,
          status: status || w.status,
          updatedAt: new Date().toISOString()
        };
      }
      return w;
    });
    
    // Save to KV store
    await kv.set(`developer:webhooks:${userId}`, updatedWebhooks);
    
    console.log(`✅ [Developer] Webhook updated: ${webhookId}`);
    
    const updatedWebhook = updatedWebhooks.find((w: any) => w.id === webhookId);
    
    return c.json({
      success: true,
      data: { webhook: updatedWebhook }
    });
    
  } catch (error) {
    console.error('❌ [Developer] Error updating webhook:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Delete webhook
app.delete('/webhooks/:webhookId', async (c) => {
  const webhookId = c.req.param('webhookId');
  console.log(`👨‍💻 [Developer] DELETE /developer/webhooks/${webhookId}`);
  
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing query parameter: userId'
      }, 400);
    }
    
    // Get existing webhooks
    const existingWebhooks = await kv.get(`developer:webhooks:${userId}`) || [];
    
    // Remove webhook
    const updatedWebhooks = existingWebhooks.filter((w: any) => w.id !== webhookId);
    
    // Save to KV store
    await kv.set(`developer:webhooks:${userId}`, updatedWebhooks);
    
    console.log(`✅ [Developer] Webhook deleted: ${webhookId}`);
    
    return c.json({
      success: true,
      data: { message: 'Webhook deleted successfully' }
    });
    
  } catch (error) {
    console.error('❌ [Developer] Error deleting webhook:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Test webhook
app.post('/webhooks/:webhookId/test', async (c) => {
  const webhookId = c.req.param('webhookId');
  console.log(`👨‍💻 [Developer] POST /developer/webhooks/${webhookId}/test`);
  
  try {
    const body = await c.req.json();
    const { userId } = body;
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing required field: userId'
      }, 400);
    }
    
    // Get webhooks
    const webhooks = await kv.get(`developer:webhooks:${userId}`) || [];
    const webhook = webhooks.find((w: any) => w.id === webhookId);
    
    if (!webhook) {
      return c.json({
        success: false,
        error: 'Webhook not found'
      }, 404);
    }
    
    // Send test payload
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook delivery from Cortexia Creation Hub'
      }
    };
    
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhook.secret,
          'X-Webhook-Id': webhookId
        },
        body: JSON.stringify(testPayload)
      });
      
      const success = response.ok;
      
      console.log(`✅ [Developer] Webhook test ${success ? 'succeeded' : 'failed'}: ${webhookId}`);
      
      return c.json({
        success: true,
        data: {
          delivered: success,
          statusCode: response.status,
          message: success ? 'Webhook test successful' : 'Webhook test failed'
        }
      });
      
    } catch (fetchError) {
      console.error('❌ [Developer] Webhook delivery failed:', fetchError);
      return c.json({
        success: false,
        error: 'Failed to deliver webhook',
        details: fetchError instanceof Error ? fetchError.message : 'Unknown error'
      }, 500);
    }
    
  } catch (error) {
    console.error('❌ [Developer] Error testing webhook:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;
