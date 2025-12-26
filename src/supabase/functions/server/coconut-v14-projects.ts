import * as kv from './kv_store.tsx';
import type { 
  Project, 
  ProjectStatus,
  CreateProjectPayload,
  AnalysisResult,
  CocoBoard,
  GenerationResult
} from '../../../lib/types/coconut-v14.ts';

// ============================================
// CREATE PROJECT
// ============================================

export async function createProject(
  payload: CreateProjectPayload
): Promise<Project> {
  const projectId = crypto.randomUUID();
  
  const project: Project = {
    id: projectId,
    userId: payload.userId,
    title: payload.title || 'Nouveau Projet Coconut',
    description: payload.description,
    status: 'intent',
    intent: payload.intent,
    results: [],
    totalCost: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Sauvegarder projet
  await kv.set(`coconut-v14:project:${projectId}`, project);
  
  // Ajouter à la liste des projets de l'user
  const userProjectsKey = `coconut-v14:${payload.userId}:projects`;
  const existingProjects = await kv.get<string[]>(userProjectsKey) || [];
  existingProjects.unshift(projectId); // Plus récent en premier
  await kv.set(userProjectsKey, existingProjects);
  
  console.log(`✅ Project created: ${projectId} for user ${payload.userId}`);
  
  return project;
}

// ============================================
// GET PROJECT
// ============================================

export async function getProject(projectId: string): Promise<Project | null> {
  try {
    const project = await kv.get<Project>(`coconut-v14:project:${projectId}`);
    return project;
  } catch (error) {
    console.error(`❌ Error getting project ${projectId}:`, error);
    return null;
  }
}

// ============================================
// GET USER PROJECTS
// ============================================

export async function getUserProjects(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: ProjectStatus;
  }
): Promise<Project[]> {
  try {
    const userProjectsKey = `coconut-v14:${userId}:projects`;
    const projectIds = await kv.get<string[]>(userProjectsKey) || [];
    
    // Récupérer tous les projets
    const projects: Project[] = [];
    for (const id of projectIds) {
      const project = await getProject(id);
      if (project) {
        // Filter par status si spécifié
        if (options?.status && project.status !== options.status) {
          continue;
        }
        projects.push(project);
      }
    }
    
    // Pagination
    const offset = options?.offset || 0;
    const limit = options?.limit || projects.length;
    
    return projects.slice(offset, offset + limit);
  } catch (error) {
    console.error(`❌ Error getting projects for user ${userId}:`, error);
    return [];
  }
}

// ============================================
// UPDATE PROJECT
// ============================================

export async function updateProject(
  projectId: string, 
  updates: Partial<Project>
): Promise<void> {
  try {
    const project = await getProject(projectId);
    
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }
    
    const updated: Project = {
      ...project,
      ...updates,
      updatedAt: new Date()
    };
    
    await kv.set(`coconut-v14:project:${projectId}`, updated);
    
    console.log(`✅ Project updated: ${projectId}`);
  } catch (error) {
    console.error(`❌ Error updating project ${projectId}:`, error);
    throw error;
  }
}

// ============================================
// UPDATE PROJECT STATUS
// ============================================

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus
): Promise<void> {
  await updateProject(projectId, { status });
}

// ============================================
// ADD ANALYSIS TO PROJECT
// ============================================

export async function addAnalysisToProject(
  projectId: string,
  analysis: AnalysisResult
): Promise<void> {
  await updateProject(projectId, {
    analysis,
    status: 'analyzed'
  });
  
  console.log(`✅ Analysis added to project: ${projectId}`);
}

// ============================================
// ADD COCOBOARD TO PROJECT
// ============================================

export async function addCocoBoardToProject(
  projectId: string,
  cocoboard: CocoBoard
): Promise<void> {
  await updateProject(projectId, {
    cocoboard,
    status: 'board-ready'
  });
  
  console.log(`✅ CocoBoard added to project: ${projectId}`);
}

// ============================================
// ADD RESULT TO PROJECT
// ============================================

export async function addResultToProject(
  projectId: string,
  result: GenerationResult,
  cost: number
): Promise<void> {
  const project = await getProject(projectId);
  
  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }
  
  const results = [...project.results, result];
  const totalCost = project.totalCost + cost;
  
  const updates: Partial<Project> = {
    results,
    totalCost,
    status: result.status === 'success' ? 'completed' : 'failed'
  };
  
  if (result.status === 'success') {
    updates.completedAt = new Date();
  }
  
  await updateProject(projectId, updates);
  
  console.log(`✅ Result added to project: ${projectId}`);
}

// ============================================
// DELETE PROJECT
// ============================================

export async function deleteProject(projectId: string): Promise<void> {
  try {
    const project = await getProject(projectId);
    
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }
    
    // Supprimer le projet
    await kv.del(`coconut-v14:project:${projectId}`);
    
    // Retirer de la liste user
    const userProjectsKey = `coconut-v14:${project.userId}:projects`;
    const projectIds = await kv.get<string[]>(userProjectsKey) || [];
    const filtered = projectIds.filter(id => id !== projectId);
    await kv.set(userProjectsKey, filtered);
    
    console.log(`✅ Project deleted: ${projectId}`);
  } catch (error) {
    console.error(`❌ Error deleting project ${projectId}:`, error);
    throw error;
  }
}

// ============================================
// GET PROJECT COUNT
// ============================================

export async function getProjectCount(
  userId: string,
  status?: ProjectStatus
): Promise<number> {
  const projects = await getUserProjects(userId, { status });
  return projects.length;
}

// ============================================
// GET RECENT PROJECTS
// ============================================

export async function getRecentProjects(
  userId: string,
  limit: number = 10
): Promise<Project[]> {
  return getUserProjects(userId, { limit });
}

// ============================================
// SEARCH PROJECTS
// ============================================

export async function searchProjects(
  userId: string,
  query: string
): Promise<Project[]> {
  const allProjects = await getUserProjects(userId);
  
  const searchLower = query.toLowerCase();
  
  return allProjects.filter(project => 
    project.title.toLowerCase().includes(searchLower) ||
    project.description.toLowerCase().includes(searchLower)
  );
}

// ============================================
// GET PROJECTS BY STATUS
// ============================================

export async function getProjectsByStatus(
  userId: string,
  status: ProjectStatus
): Promise<Project[]> {
  return getUserProjects(userId, { status });
}

// ============================================
// MARK PROJECT AS FAILED
// ============================================

export async function markProjectAsFailed(
  projectId: string,
  error: string
): Promise<void> {
  await updateProject(projectId, {
    status: 'failed',
    // Note: On pourrait ajouter un champ error dans Project
  });
  
  console.log(`❌ Project marked as failed: ${projectId} - ${error}`);
}

// ============================================
// HELPERS
// ============================================

export function formatProjectForDisplay(project: Project) {
  return {
    id: project.id,
    title: project.title,
    status: project.status,
    totalCost: project.totalCost,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    hasAnalysis: !!project.analysis,
    hasCocoBoard: !!project.cocoboard,
    resultsCount: project.results.length
  };
}

export function calculateProjectProgress(project: Project): number {
  const statusProgress: Record<ProjectStatus, number> = {
    'draft': 0,
    'intent': 20,
    'analyzing': 40,
    'analyzed': 60,
    'board-ready': 75,
    'generating': 90,
    'completed': 100,
    'failed': 0
  };
  
  return statusProgress[project.status] || 0;
}
