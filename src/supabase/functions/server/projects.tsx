/**
 * PROJECTS MANAGEMENT ROUTES
 * Production-ready project persistence system
 * Stores: Intent → Analysis → CocoBoard → Results
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Types
export interface Project {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'campaign';
  status: 'draft' | 'analyzing' | 'ready' | 'generating' | 'complete' | 'error';
  intent: string;
  objective?: string;
  assets?: Array<{ type: string; url: string }>;
  analysis?: any; // AIAnalysis from Gemini
  cocoboard?: any; // CocoBoard structure
  results?: Array<{ type: string; url: string; nodeId?: string }>;
  error?: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// POST /projects/create - Create new project
// ============================================================================
app.post('/create', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, type, intent, objective, assets, metadata } = body;

    if (!userId || !type || !intent) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields: userId, type, intent' 
      }, 400);
    }

    // Generate project ID
    const projectId = crypto.randomUUID();

    // Create project
    const project: Project = {
      id: projectId,
      userId,
      type,
      status: 'draft',
      intent,
      objective,
      assets,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata
    };

    // Store in KV
    await kv.set(`project:${projectId}`, project);
    
    // Create user index for listing
    await kv.set(`user_projects:${userId}:${projectId}`, projectId);

    console.log(`✅ Project created: ${projectId} (type: ${type}, user: ${userId})`);

    return c.json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('❌ Error creating project:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create project'
    }, 500);
  }
});

// ============================================================================
// GET /projects/:projectId - Get project by ID
// ============================================================================
app.get('/:projectId', async (c) => {
  try {
    const { projectId } = c.req.param();

    if (!projectId) {
      return c.json({ 
        success: false, 
        error: 'Missing projectId' 
      }, 400);
    }

    const project = await kv.get<Project>(`project:${projectId}`);

    if (!project) {
      return c.json({
        success: false,
        error: 'Project not found'
      }, 404);
    }

    return c.json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('❌ Error fetching project:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch project'
    }, 500);
  }
});

// ============================================================================
// PUT /projects/:projectId/status - Update project status
// ============================================================================
app.put('/:projectId/status', async (c) => {
  try {
    const { projectId } = c.req.param();
    const body = await c.req.json();
    const { status, analysis, cocoboard, results, error } = body;

    if (!projectId || !status) {
      return c.json({ 
        success: false, 
        error: 'Missing projectId or status' 
      }, 400);
    }

    // Get existing project
    const project = await kv.get<Project>(`project:${projectId}`);

    if (!project) {
      return c.json({
        success: false,
        error: 'Project not found'
      }, 404);
    }

    // Update project
    const updatedProject: Project = {
      ...project,
      status,
      updatedAt: Date.now(),
      ...(analysis && { analysis }),
      ...(cocoboard && { cocoboard }),
      ...(results && { results }),
      ...(error && { error })
    };

    await kv.set(`project:${projectId}`, updatedProject);

    console.log(`✅ Project updated: ${projectId} (status: ${status})`);

    return c.json({
      success: true,
      data: updatedProject
    });

  } catch (error) {
    console.error('❌ Error updating project:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update project'
    }, 500);
  }
});

// ============================================================================
// PUT /projects/:projectId - Full update (for CocoBoard edits, etc.)
// ============================================================================
app.put('/:projectId', async (c) => {
  try {
    const { projectId } = c.req.param();
    const updates = await c.req.json();

    if (!projectId) {
      return c.json({ 
        success: false, 
        error: 'Missing projectId' 
      }, 400);
    }

    // Get existing project
    const project = await kv.get<Project>(`project:${projectId}`);

    if (!project) {
      return c.json({
        success: false,
        error: 'Project not found'
      }, 404);
    }

    // Merge updates
    const updatedProject: Project = {
      ...project,
      ...updates,
      id: projectId, // Never allow ID change
      userId: project.userId, // Never allow userId change
      createdAt: project.createdAt, // Never allow createdAt change
      updatedAt: Date.now()
    };

    await kv.set(`project:${projectId}`, updatedProject);

    console.log(`✅ Project fully updated: ${projectId}`);

    return c.json({
      success: true,
      data: updatedProject
    });

  } catch (error) {
    console.error('❌ Error updating project:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update project'
    }, 500);
  }
});

// ============================================================================
// GET /projects/user/:userId - List all projects for a user
// ============================================================================
app.get('/user/:userId', async (c) => {
  try {
    const { userId } = c.req.param();

    if (!userId) {
      return c.json({ 
        success: false, 
        error: 'Missing userId' 
      }, 400);
    }

    // Get all project IDs for this user
    const projectIds = await kv.getByPrefix<string>(`user_projects:${userId}:`);

    // Fetch all projects
    const projects = await Promise.all(
      projectIds.map(async (id) => {
        const project = await kv.get<Project>(`project:${id}`);
        return project;
      })
    );

    // Filter out nulls and sort by createdAt (newest first)
    const validProjects = projects
      .filter((p): p is Project => p !== null)
      .sort((a, b) => b.createdAt - a.createdAt);

    return c.json({
      success: true,
      data: validProjects
    });

  } catch (error) {
    console.error('❌ Error listing projects:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list projects'
    }, 500);
  }
});

// ============================================================================
// DELETE /projects/:projectId - Delete project (soft delete = status: deleted)
// ============================================================================
app.delete('/:projectId', async (c) => {
  try {
    const { projectId } = c.req.param();

    if (!projectId) {
      return c.json({ 
        success: false, 
        error: 'Missing projectId' 
      }, 400);
    }

    // Get existing project
    const project = await kv.get<Project>(`project:${projectId}`);

    if (!project) {
      return c.json({
        success: false,
        error: 'Project not found'
      }, 404);
    }

    // Soft delete (keep data for history)
    const deletedProject: Project = {
      ...project,
      status: 'error', // Use 'error' as deleted status
      error: 'Project deleted by user',
      updatedAt: Date.now()
    };

    await kv.set(`project:${projectId}`, deletedProject);

    console.log(`✅ Project soft-deleted: ${projectId}`);

    return c.json({
      success: true,
      message: 'Project deleted'
    });

  } catch (error) {
    console.error('❌ Error deleting project:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete project'
    }, 500);
  }
});

export default app;
