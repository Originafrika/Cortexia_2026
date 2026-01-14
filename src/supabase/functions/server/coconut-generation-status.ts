/**
 * SIMPLE GENERATION STATUS ROUTE
 * GET /coconut/generate/:id/status
 * 
 * Returns the current status of a generation
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * GET /coconut/generate/:id/status
 */
app.get('/coconut/generate/:id/status', async (c) => {
  try {
    const generationId = c.req.param('id');
    
    const generation = await kv.get(`generation:${generationId}`);
    
    if (!generation) {
      return c.json({
        success: false,
        error: 'Generation not found'
      }, 404);
    }
    
    return c.json({
      success: true,
      data: generation
    });
    
  } catch (error) {
    console.error('❌ Error fetching generation status:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch generation status'
    }, 500);
  }
});

export default app;
