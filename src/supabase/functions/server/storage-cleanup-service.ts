/**
 * STORAGE CLEANUP SERVICE
 * Automatic cleanup of temporary files to save storage costs
 * 
 * RULES:
 * - Individual user uploads: Delete after 24h
 * - Generations: Delete after 24h
 * - Feed posts: PERMANENT (never delete)
 * - Enterprise assets: PERMANENT (never delete)
 */

import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';
import { shouldLog } from './server-config.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Buckets to clean
const CLEANUP_BUCKETS = {
  REFERENCES: 'coconut-v14-references',     // User uploads (individual users only)
  GENERATIONS: 'coconut-v14-generations',   // Generated images
  ASSETS: 'coconut-v14-assets',             // Generated assets
  OUTPUTS: 'coconut-v14-outputs',           // Final outputs
};

// Feed bucket (NEVER CLEANUP)
const FEED_BUCKET = 'make-e55aa214-community-feed';

// ============================================================================
// TYPES
// ============================================================================

interface CleanupStats {
  totalFilesChecked: number;
  filesDeleted: number;
  storageFreed: number; // in bytes
  errors: number;
  buckets: {
    [key: string]: {
      filesDeleted: number;
      storageFreed: number;
    };
  };
}

// ============================================================================
// HELPER: Check if file is protected (in feed)
// ============================================================================

async function isFileInFeed(fileUrl: string): Promise<boolean> {
  try {
    // Get all feed posts
    const feedPosts = await kv.getByPrefix('feed:post:') || [];
    
    // Check if any post references this file
    for (const post of feedPosts) {
      // Check imageUrl
      if (post.imageUrl && post.imageUrl === fileUrl) {
        return true;
      }
      
      // Check video
      if (post.video?.url && post.video.url === fileUrl) {
        return true;
      }
      if (post.video?.thumbnailUrl && post.video.thumbnailUrl === fileUrl) {
        return true;
      }
      
      // Check carousel images
      if (post.carouselImages && Array.isArray(post.carouselImages)) {
        if (post.carouselImages.some((img: any) => img.url === fileUrl || img === fileUrl)) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ [CLEANUP] Error checking feed protection:', error);
    return true; // Err on the side of caution - don't delete if unsure
  }
}

// ============================================================================
// HELPER: Check upload metadata from KV store
// ============================================================================

async function getUploadMetadata(filePath: string): Promise<any | null> {
  try {
    // Try to get metadata by path
    const metadata = await kv.get(`upload:path:${filePath}`);
    if (metadata) {
      return metadata;
    }
    
    // If not found, return null (file might be from before KV tracking)
    return null;
  } catch (error) {
    console.error('❌ [CLEANUP] Error getting upload metadata:', error);
    return null;
  }
}

// ============================================================================
// HELPER: Should file be deleted based on metadata?
// ============================================================================

async function shouldDeleteFile(filePath: string, fileCreatedAt: Date, oneDayAgo: Date): Promise<{ shouldDelete: boolean; reason: string }> {
  // Check KV metadata first (new system)
  const metadata = await getUploadMetadata(filePath);
  
  if (metadata) {
    // ✅ NEW SYSTEM: Use KV metadata
    
    // Check accountType
    if (metadata.accountType === 'enterprise') {
      return { shouldDelete: false, reason: 'Enterprise user (from KV)' };
    }
    
    // Check expiresAt
    if (metadata.expiresAt) {
      const expiresAt = new Date(metadata.expiresAt);
      if (expiresAt > new Date()) {
        return { shouldDelete: false, reason: `Not expired yet (expires: ${metadata.expiresAt})` };
      } else {
        return { shouldDelete: true, reason: `Expired at ${metadata.expiresAt}` };
      }
    }
    
    // Enterprise files have null expiresAt = PERMANENT
    if (metadata.expiresAt === null) {
      return { shouldDelete: false, reason: 'Permanent file (enterprise)' };
    }
  }
  
  // ❌ OLD SYSTEM: Fallback to userId check (for files uploaded before KV tracking)
  const pathParts = filePath.split('/');
  const userId = pathParts[0];
  
  // Check if user is enterprise
  const isEnterprise = await isEnterpriseUser(userId);
  if (isEnterprise) {
    return { shouldDelete: false, reason: 'Enterprise user (from user profile)' };
  }
  
  // Check file age
  if (fileCreatedAt > oneDayAgo) {
    return { shouldDelete: false, reason: 'File too recent (<24h)' };
  }
  
  // File is eligible for deletion
  return { shouldDelete: true, reason: 'Individual user file >24h old' };
}

// ============================================================================
// HELPER: Check if user is enterprise
// ============================================================================

async function isEnterpriseUser(userId: string): Promise<boolean> {
  try {
    const profile = await kv.get(`user:profile:${userId}`);
    return profile?.accountType === 'enterprise';
  } catch (error) {
    console.error('❌ [CLEANUP] Error checking user type:', error);
    return true; // Err on the side of caution - don't delete if unsure
  }
}

// ============================================================================
// HELPER: Delete file from bucket
// ============================================================================

async function deleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      console.error(`❌ [CLEANUP] Error deleting ${path}:`, error);
      return false;
    }
    
    if (shouldLog('verbose')) {
      console.log(`✅ [CLEANUP] Deleted: ${bucket}/${path}`);
    }
    return true;
  } catch (error) {
    console.error(`❌ [CLEANUP] Error deleting ${path}:`, error);
    return false;
  }
}

// ============================================================================
// MAIN CLEANUP FUNCTION
// ============================================================================

export async function cleanupExpiredFiles(): Promise<CleanupStats> {
  const stats: CleanupStats = {
    totalFilesChecked: 0,
    filesDeleted: 0,
    storageFreed: 0,
    errors: 0,
    buckets: {}
  };
  
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
  
  console.log('🧹 [CLEANUP] Starting storage cleanup...');
  console.log(`⏰ [CLEANUP] Current time: ${now.toISOString()}`);
  console.log(`📅 [CLEANUP] Deleting files older than: ${oneDayAgo.toISOString()}`);
  console.log(`📝 [CLEANUP] Logic: File created BEFORE ${oneDayAgo.toISOString()} will be deleted`);
  console.log(`📝 [CLEANUP] Example: File uploaded at 23:00 on Day 1 will be deleted at 00:00 on Day 3 (>24h later)`);
  console.log('');
  
  // ============================================================================
  // CLEANUP EACH BUCKET
  // ============================================================================
  
  for (const [bucketKey, bucketName] of Object.entries(CLEANUP_BUCKETS)) {
    console.log(`\n📦 [CLEANUP] Checking bucket: ${bucketName}`);
    
    stats.buckets[bucketName] = {
      filesDeleted: 0,
      storageFreed: 0
    };
    
    try {
      // List all files in bucket
      const { data: files, error: listError } = await supabase.storage
        .from(bucketName)
        .list('', {
          limit: 1000, // Process 1000 files at a time
          sortBy: { column: 'created_at', order: 'asc' }
        });
      
      if (listError) {
        console.error(`❌ [CLEANUP] Error listing ${bucketName}:`, listError);
        stats.errors++;
        continue;
      }
      
      if (!files || files.length === 0) {
        console.log(`✅ [CLEANUP] No files in ${bucketName}`);
        continue;
      }
      
      console.log(`📄 [CLEANUP] Found ${files.length} files in ${bucketName}`);
      
      // Process each file
      for (const file of files) {
        stats.totalFilesChecked++;
        
        // Check if file is older than 24h
        const createdAt = new Date(file.created_at);
        if (createdAt > oneDayAgo) {
          if (shouldLog('verbose')) {
            console.log(`⏭️  [CLEANUP] File too recent: ${file.name} (created: ${createdAt.toISOString()})`);
          }
          continue; // File is less than 24h old
        }
        
        // Extract userId from path (format: userId/projectId/filename or userId/filename)
        const pathParts = file.name.split('/');
        const userId = pathParts[0];
        
        // PROTECTION 1: Check if user is enterprise
        if (await isEnterpriseUser(userId)) {
          if (shouldLog('verbose')) {
            console.log(`🛡️  [CLEANUP] Protected (enterprise): ${file.name}`);
          }
          continue; // Don't delete enterprise files
        }
        
        // PROTECTION 2: Check if file is in feed
        // Construct potential URLs this file might have
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${file.name}`;
        if (await isFileInFeed(publicUrl)) {
          if (shouldLog('verbose')) {
            console.log(`🛡️  [CLEANUP] Protected (in feed): ${file.name}`);
          }
          continue; // Don't delete feed files
        }
        
        // Check if file should be deleted based on metadata
        const { shouldDelete, reason } = await shouldDeleteFile(file.name, createdAt, oneDayAgo);
        if (!shouldDelete) {
          if (shouldLog('verbose')) {
            console.log(`🛡️  [CLEANUP] Protected (${reason}): ${file.name}`);
          }
          continue; // Don't delete file
        }
        
        // File is eligible for deletion
        const fileSize = file.metadata?.size || 0;
        
        if (await deleteFile(bucketName, file.name)) {
          stats.filesDeleted++;
          stats.storageFreed += fileSize;
          stats.buckets[bucketName].filesDeleted++;
          stats.buckets[bucketName].storageFreed += fileSize;
        } else {
          stats.errors++;
        }
      }
      
      console.log(`✅ [CLEANUP] ${bucketName}: ${stats.buckets[bucketName].filesDeleted} files deleted, ${formatBytes(stats.buckets[bucketName].storageFreed)} freed`);
      
    } catch (error) {
      console.error(`❌ [CLEANUP] Error processing ${bucketName}:`, error);
      stats.errors++;
    }
  }
  
  // ============================================================================
  // CLEANUP KV METADATA
  // ============================================================================
  
  console.log('\n🗑️  [CLEANUP] Cleaning up expired metadata...');
  
  try {
    // Get all generation records
    const generations = await kv.getByPrefix('generation:') || [];
    let metadataDeleted = 0;
    
    for (const gen of generations) {
      // Check if generation is older than 24h
      const createdAt = new Date(gen.createdAt || gen.timestamp);
      if (createdAt <= oneDayAgo) {
        // Check if user is individual (not enterprise)
        const isEnterprise = await isEnterpriseUser(gen.userId);
        if (!isEnterprise) {
          // Check if generation is not in feed
          if (gen.outputUrl && !(await isFileInFeed(gen.outputUrl))) {
            // Delete metadata
            await kv.del(`generation:${gen.id}`);
            metadataDeleted++;
          }
        }
      }
    }
    
    console.log(`✅ [CLEANUP] Deleted ${metadataDeleted} expired generation metadata records`);
    
  } catch (error) {
    console.error('❌ [CLEANUP] Error cleaning metadata:', error);
    stats.errors++;
  }
  
  // ============================================================================
  // FINAL STATS
  // ============================================================================
  
  console.log('\n📊 [CLEANUP] Cleanup Summary:');
  console.log(`   Total files checked: ${stats.totalFilesChecked}`);
  console.log(`   Files deleted: ${stats.filesDeleted}`);
  console.log(`   Storage freed: ${formatBytes(stats.storageFreed)}`);
  console.log(`   Errors: ${stats.errors}`);
  console.log('');
  
  return stats;
}

// ============================================================================
// HELPER: Format bytes
// ============================================================================

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================================================
// DRY RUN (for testing)
// ============================================================================

export async function dryRunCleanup(): Promise<CleanupStats> {
  console.log('🧪 [CLEANUP] DRY RUN MODE - No files will be deleted');
  
  const stats: CleanupStats = {
    totalFilesChecked: 0,
    filesDeleted: 0,
    storageFreed: 0,
    errors: 0,
    buckets: {}
  };
  
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // List files that WOULD be deleted
  for (const [bucketKey, bucketName] of Object.entries(CLEANUP_BUCKETS)) {
    stats.buckets[bucketName] = {
      filesDeleted: 0,
      storageFreed: 0
    };
    
    try {
      const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list('', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'asc' }
        });
      
      if (error || !files) continue;
      
      for (const file of files) {
        stats.totalFilesChecked++;
        
        const createdAt = new Date(file.created_at);
        if (createdAt <= oneDayAgo) {
          const pathParts = file.name.split('/');
          const userId = pathParts[0];
          
          const isEnterprise = await isEnterpriseUser(userId);
          const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${file.name}`;
          const inFeed = await isFileInFeed(publicUrl);
          
          if (!isEnterprise && !inFeed) {
            const fileSize = file.metadata?.size || 0;
            stats.filesDeleted++;
            stats.storageFreed += fileSize;
            stats.buckets[bucketName].filesDeleted++;
            stats.buckets[bucketName].storageFreed += fileSize;
            
            console.log(`🗑️  [DRY RUN] Would delete: ${file.name} (${formatBytes(fileSize)})`);
          }
        }
      }
    } catch (error) {
      console.error(`❌ [DRY RUN] Error processing ${bucketName}:`, error);
    }
  }
  
  console.log('\n📊 [DRY RUN] Summary:');
  console.log(`   Files that would be deleted: ${stats.filesDeleted}`);
  console.log(`   Storage that would be freed: ${formatBytes(stats.storageFreed)}`);
  
  return stats;
}