/**
 * CORTEXIA PROJECTS API
 * Client-side service for interacting with Projects backend
 * Production-ready project persistence
 */

import { projectId, publicAnonKey } from '../../utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/projects`;

// Types (matching backend)
export interface Project {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'campaign';
  status: 'draft' | 'analyzing' | 'ready' | 'generating' | 'complete' | 'error';
  intent: string;
  objective?: string;
  assets?: Array<{ type: string; url: string }>;
  analysis?: any;
  cocoboard?: any;
  results?: Array<{ type: string; url: string; nodeId?: string }>;
  error?: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// CREATE PROJECT
// ============================================================================
export async function createProject(data: {
  userId: string;
  type: 'image' | 'video' | 'campaign';
  intent: string;
  objective?: string;
  assets?: Array<{ type: string; url: string }>;
  metadata?: Record<string, any>;
}): Promise<Project> {
  const response = await fetch(`${BASE_URL}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to create project');
  }

  return result.data;
}

// ============================================================================
// GET PROJECT BY ID
// ============================================================================
export async function getProject(projectId: string): Promise<Project> {
  const response = await fetch(`${BASE_URL}/${projectId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch project');
  }

  return result.data;
}

// ============================================================================
// UPDATE PROJECT STATUS
// ============================================================================
export async function updateProjectStatus(
  projectId: string,
  updates: {
    status: Project['status'];
    analysis?: any;
    cocoboard?: any;
    results?: Array<{ type: string; url: string; nodeId?: string }>;
    error?: string;
  }
): Promise<Project> {
  const response = await fetch(`${BASE_URL}/${projectId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(updates),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to update project status');
  }

  return result.data;
}

// ============================================================================
// FULL UPDATE PROJECT (for CocoBoard edits, etc.)
// ============================================================================
export async function updateProject(
  projectId: string,
  updates: Partial<Omit<Project, 'id' | 'userId' | 'createdAt'>>
): Promise<Project> {
  const response = await fetch(`${BASE_URL}/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(updates),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to update project');
  }

  return result.data;
}

// ============================================================================
// LIST USER PROJECTS
// ============================================================================
export async function listUserProjects(userId: string): Promise<Project[]> {
  const response = await fetch(`${BASE_URL}/user/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to list projects');
  }

  return result.data;
}

// ============================================================================
// DELETE PROJECT (soft delete)
// ============================================================================
export async function deleteProject(projectId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/${projectId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to delete project');
  }
}
