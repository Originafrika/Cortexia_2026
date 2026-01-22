/**
 * MIGRATION SCRIPT - Legacy Projects to Unified System
 * 
 * Migrates all projects from:
 * - coconut-v14:project:{id} → project:{id}
 * - coconut-v14:project:{projectId}:cocoboard → project:{projectId}:cocoboard
 * - coconut-v14:{userId}:projects → user_projects:{userId}:{projectId}
 */

import * as kv from './kv_store.tsx';

export interface MigrationResult {
  success: boolean;
  migrated: number;
  failed: number;
  errors: string[];
  details: {
    projects: number;
    cocoboards: number;
    userIndexes: number;
  };
}

/**
 * Run complete migration
 */
export async function migrateProjectsToUnified(): Promise<MigrationResult> {
  console.log('🔄 Starting projects migration to unified system...');
  
  const result: MigrationResult = {
    success: true,
    migrated: 0,
    failed: 0,
    errors: [],
    details: {
      projects: 0,
      cocoboards: 0,
      userIndexes: 0
    }
  };
  
  try {
    // 1. Migrate projects
    console.log('📦 Migrating projects...');
    const projectsMigrated = await migrateProjects();
    result.details.projects = projectsMigrated;
    result.migrated += projectsMigrated;
    
    // 2. Migrate cocoboard references
    console.log('🎨 Migrating cocoboard references...');
    const cocoboardsMigrated = await migrateCocoBoardReferences();
    result.details.cocoboards = cocoboardsMigrated;
    result.migrated += cocoboardsMigrated;
    
    // 3. Migrate user indexes
    console.log('👤 Migrating user indexes...');
    const userIndexesMigrated = await migrateUserIndexes();
    result.details.userIndexes = userIndexesMigrated;
    result.migrated += userIndexesMigrated;
    
    console.log('✅ Migration completed successfully!');
    console.log(`   Projects: ${result.details.projects}`);
    console.log(`   CocoBoards: ${result.details.cocoboards}`);
    console.log(`   User indexes: ${result.details.userIndexes}`);
    console.log(`   Total migrated: ${result.migrated}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    result.success = false;
    result.failed = 1;
    result.errors.push(error.message);
  }
  
  return result;
}

/**
 * Migrate projects from coconut-v14:project:* to project:*
 */
async function migrateProjects(): Promise<number> {
  let count = 0;
  
  try {
    // Get all legacy projects
    const legacyProjects = await kv.getByPrefix<any>('coconut-v14:project:');
    
    console.log(`Found ${legacyProjects.length} legacy projects`);
    
    for (const project of legacyProjects) {
      try {
        // Extract project ID from key
        const legacyKey = `coconut-v14:project:${project.id}`;
        
        // Skip if this is a cocoboard reference
        if (legacyKey.includes(':cocoboard')) {
          continue;
        }
        
        // New unified key
        const newKey = `project:${project.id}`;
        
        // Check if already exists
        const existing = await kv.get(newKey);
        if (existing) {
          console.log(`⏭️  Skipping ${project.id} - already migrated`);
          continue;
        }
        
        // Migrate project data
        await kv.set(newKey, project);
        
        console.log(`✅ Migrated project: ${project.id}`);
        count++;
        
      } catch (error) {
        console.error(`❌ Failed to migrate project ${project.id}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in migrateProjects:', error);
    throw error;
  }
  
  return count;
}

/**
 * Migrate cocoboard references from coconut-v14:project:*:cocoboard to project:*:cocoboard
 */
async function migrateCocoBoardReferences(): Promise<number> {
  let count = 0;
  
  try {
    // Get all projects to find their cocoboard references
    const allProjects = await kv.getByPrefix<any>('coconut-v14:project:');
    
    for (const project of allProjects) {
      try {
        const projectId = project.id;
        
        // Get legacy cocoboard reference
        const legacyKey = `coconut-v14:project:${projectId}:cocoboard`;
        const cocoBoardId = await kv.get<string>(legacyKey);
        
        if (!cocoBoardId) {
          continue; // No cocoboard for this project
        }
        
        // New unified key
        const newKey = `project:${projectId}:cocoboard`;
        
        // Check if already exists
        const existing = await kv.get(newKey);
        if (existing) {
          console.log(`⏭️  Skipping cocoboard reference for ${projectId} - already migrated`);
          continue;
        }
        
        // Migrate cocoboard reference
        await kv.set(newKey, cocoBoardId);
        
        console.log(`✅ Migrated cocoboard reference for project: ${projectId} → ${cocoBoardId}`);
        count++;
        
      } catch (error) {
        console.error(`❌ Failed to migrate cocoboard reference for ${project.id}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in migrateCocoBoardReferences:', error);
    throw error;
  }
  
  return count;
}

/**
 * Migrate user indexes from coconut-v14:{userId}:projects to user_projects:{userId}:{projectId}
 */
async function migrateUserIndexes(): Promise<number> {
  let count = 0;
  
  try {
    // Get all legacy user project lists
    const userProjectLists = await kv.getByPrefix<string[]>('coconut-v14:');
    
    for (const userProjectList of userProjectLists) {
      try {
        // Extract userId from key pattern: coconut-v14:{userId}:projects
        const keyParts = String(userProjectList).split(':');
        
        if (keyParts.length !== 3 || keyParts[2] !== 'projects') {
          continue; // Not a user projects list
        }
        
        const userId = keyParts[1];
        
        // Get the project IDs array
        const legacyKey = `coconut-v14:${userId}:projects`;
        const projectIds = await kv.get<string[]>(legacyKey);
        
        if (!projectIds || !Array.isArray(projectIds)) {
          continue;
        }
        
        console.log(`Migrating ${projectIds.length} project indexes for user ${userId}`);
        
        // Create new user_projects indexes
        for (const projectId of projectIds) {
          const newKey = `user_projects:${userId}:${projectId}`;
          
          // Check if already exists
          const existing = await kv.get(newKey);
          if (existing) {
            console.log(`⏭️  Skipping user index ${userId}:${projectId} - already migrated`);
            continue;
          }
          
          // Create new index
          await kv.set(newKey, projectId);
          
          console.log(`✅ Migrated user index: ${userId} → ${projectId}`);
          count++;
        }
        
      } catch (error) {
        console.error(`❌ Failed to migrate user indexes:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in migrateUserIndexes:', error);
    throw error;
  }
  
  return count;
}

/**
 * Rollback migration (use with caution!)
 */
export async function rollbackMigration(): Promise<void> {
  console.log('🔄 Rolling back migration...');
  console.warn('⚠️  This will delete all unified system data!');
  
  try {
    // Delete all unified projects
    const projects = await kv.getByPrefix('project:');
    for (const project of projects) {
      await kv.del(`project:${project}`);
    }
    
    // Delete all unified user indexes
    const userIndexes = await kv.getByPrefix('user_projects:');
    for (const index of userIndexes) {
      await kv.del(`user_projects:${index}`);
    }
    
    console.log('✅ Rollback completed');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

/**
 * Verify migration integrity
 */
export async function verifyMigration(): Promise<{
  valid: boolean;
  issues: string[];
  stats: {
    legacyProjects: number;
    unifiedProjects: number;
    legacyCocoBoards: number;
    unifiedCocoBoards: number;
    legacyUserIndexes: number;
    unifiedUserIndexes: number;
  };
}> {
  console.log('🔍 Verifying migration...');
  
  const issues: string[] = [];
  
  // Count legacy items
  const legacyProjects = await kv.getByPrefix('coconut-v14:project:');
  const legacyCocoBoards = legacyProjects.filter((k: string) => k.includes(':cocoboard'));
  const legacyUserIndexes = await kv.getByPrefix('coconut-v14:');
  
  // Count unified items
  const unifiedProjects = await kv.getByPrefix('project:');
  const unifiedCocoBoards = unifiedProjects.filter((k: string) => k.includes(':cocoboard'));
  const unifiedUserIndexes = await kv.getByPrefix('user_projects:');
  
  const stats = {
    legacyProjects: legacyProjects.length - legacyCocoBoards.length,
    unifiedProjects: unifiedProjects.length - unifiedCocoBoards.length,
    legacyCocoBoards: legacyCocoBoards.length,
    unifiedCocoBoards: unifiedCocoBoards.length,
    legacyUserIndexes: legacyUserIndexes.filter((k: string) => k.endsWith(':projects')).length,
    unifiedUserIndexes: unifiedUserIndexes.length
  };
  
  // Check for issues
  if (stats.legacyProjects > stats.unifiedProjects) {
    issues.push(`Missing projects: ${stats.legacyProjects - stats.unifiedProjects} legacy projects not migrated`);
  }
  
  if (stats.legacyCocoBoards > stats.unifiedCocoBoards) {
    issues.push(`Missing cocoboard references: ${stats.legacyCocoBoards - stats.unifiedCocoBoards} not migrated`);
  }
  
  console.log('📊 Migration stats:');
  console.log(`   Legacy projects: ${stats.legacyProjects}`);
  console.log(`   Unified projects: ${stats.unifiedProjects}`);
  console.log(`   Legacy cocoboards: ${stats.legacyCocoBoards}`);
  console.log(`   Unified cocoboards: ${stats.unifiedCocoBoards}`);
  console.log(`   Legacy user indexes: ${stats.legacyUserIndexes}`);
  console.log(`   Unified user indexes: ${stats.unifiedUserIndexes}`);
  
  if (issues.length > 0) {
    console.log('⚠️  Issues found:');
    issues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log('✅ No issues found');
  }
  
  return {
    valid: issues.length === 0,
    issues,
    stats
  };
}

// Export info
export const MIGRATION_INFO = {
  version: '1.0.0',
  date: '2026-01-16',
  description: 'Migrate legacy coconut-v14 projects to unified system',
  changes: {
    projects: 'coconut-v14:project:{id} → project:{id}',
    cocoboards: 'coconut-v14:project:{projectId}:cocoboard → project:{projectId}:cocoboard',
    userIndexes: 'coconut-v14:{userId}:projects → user_projects:{userId}:{projectId}'
  }
};

console.log('✅ Migration script loaded');
