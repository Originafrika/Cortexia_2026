/**
 * FEED MIGRATION - Initialize remixChain for existing posts
 * Run this once to add remixChain to all existing posts that don't have it
 */

import * as kv from './kv_store.tsx';

/**
 * Migrate existing posts to have remixChain
 */
export async function migratePostsToRemixChain() {
  try {
    console.log('🔧 Starting migration: Adding remixChain to existing posts...');
    
    // Get all creation keys
    const allCreations = await kv.getByPrefix('creation:');
    console.log(`📊 Found ${allCreations.length} creations to check`);
    
    let migratedCount = 0;
    
    for (const item of allCreations) {
      const creation = item as any;
      
      // Skip if no creation ID
      if (!creation.id) {
        console.warn('⚠️ Skipping creation without ID');
        continue;
      }
      
      // Skip if remixChain already exists and is valid
      if (creation.remixChain && Array.isArray(creation.remixChain) && creation.remixChain.length > 0) {
        console.log(`✓ ${creation.id} already has remixChain`);
        continue;
      }
      
      // Initialize remixChain with just the creation's ID
      creation.remixChain = [creation.id];
      
      // Save updated creation
      await kv.set(`creation:${creation.id}`, creation);
      migratedCount++;
      
      console.log(`📝 Migrated ${creation.id} - added remixChain: [${creation.id}]`);
      
      if (migratedCount % 5 === 0) {
        console.log(`📊 Progress: ${migratedCount} posts migrated...`);
      }
    }
    
    console.log(`✅ Migration complete! Migrated ${migratedCount} out of ${allCreations.length} posts`);
    return { success: true, migratedCount, totalChecked: allCreations.length };
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Migration failed' 
    };
  }
}