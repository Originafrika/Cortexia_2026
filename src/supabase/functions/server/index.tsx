/**
 * COCONUT V14 SERVER - FLUX PRO OPTIMIZED
 * Main entry point with Flux 2 Pro optimized analyzer
 * 
 * ✅ FLUX 2 PRO: Official guide optimization
 * 🎨 CREATIVE: Punchy advertising language
 * 📸 CAMERA REFS: Always included
 * 💎 QUALITY: 8.5/10 creativity minimum
 */

import app from './coconut-v14-routes-flux-pro.ts'; // ✅ NEW: Flux Pro routes
import fluxRoutes from './coconut-v14-flux-routes.ts';
import orchestratorRoutes from './coconut-v14-orchestrator-routes.ts';
import historyRoutes from './routes-history.tsx';
import dashboardRoutes from './coconut-v14-dashboard-routes.ts';
import cocoBoardRoutes from './coconut-v14-cocoboard-routes.ts';
import uploadRoutes from './coconut-v14-upload-routes.ts';
import generationStatusRoutes from './coconut-generation-status.ts';
import authRoutes from './auth-routes.tsx';
import feedRoutes from './feed-routes.ts'; // ✅ NEW: Feed routes
import creatorRoutes from './creator-routes.ts'; // ✅ NEW: Creator routes
import userRoutes from './user-routes.ts'; // ✅ NEW: User profiles
import referralRoutes from './referral-routes.ts'; // ✅ NEW: Referral system
import originsRoutes from './origins-routes.ts'; // ✅ NEW: Origins currency
import compensationRoutes from './creator-compensation-routes.ts'; // ✅ NEW: Creator compensation
import withdrawalRoutes from './withdrawal-routes.ts'; // ✅ NEW: Withdrawal system
import creditsCronRoutes from './credits-cron.ts'; // ✅ NEW: Monthly credits reset cron
import stripeWebhookRoutes from './stripe-webhook.ts'; // ✅ NEW: Stripe webhook for auto-track purchases
import debugRoutes from './debug-routes.ts'; // ✅ NEW: Debug routes for development
import kieAIImageRoutes from './kie-ai-image-routes.ts'; // ✅ NEW: Kie AI image generation (Flux + Nano Banana)
import kieAIVideoRoutes from './kie-ai.ts'; // ✅ NEW: Kie AI video generation (Veo 3.1)
import generateRoutes from './generate-routes.ts'; // ✅ NEW: Universal /generate endpoint (free + paid models)
import creditsRoutes from './coconut-v14-credits-routes.ts'; // ✅ FIX: Credits API routes
import activityRoutes from './activity-routes.ts'; // ✅ NEW: Activity feed
import videoRoutes from './coconut-v14-video-routes.ts'; // ✅ NEW: Coconut V14 Video routes (Analyze only)
import projectsRoutes from './projects.tsx'; // ✅ NEW: Projects management
import campaignRoutes from './coconut-v14-campaign-routes.ts'; // ✅ NEW: Campaign mode routes
import { initializeStorageBuckets } from './coconut-v14-storage.ts';
import { initializeFeedBucket } from './feed-storage.ts'; // ✅ NEW: Feed storage
import * as kv from './kv_store.tsx'; // ✅ Import KV store for expiration check

// ============================================
// MOUNT ROUTES
// ============================================

console.log('🔧 Mounting routes (FLUX PRO OPTIMIZED)...');

app.route('/auth', authRoutes); // ✅ FIXED: No double prefix (basePath already set)
app.route('/feed', feedRoutes); // ✅ NEW: Feed routes
app.route('/creators', creatorRoutes); // ✅ NEW: Creator routes
app.route('/users', userRoutes); // ✅ NEW: User profiles
app.route('/referral', referralRoutes); // ✅ NEW: Referral system
app.route('/origins', originsRoutes); // ✅ NEW: Origins currency
app.route('/compensation', compensationRoutes); // ✅ NEW: Creator compensation
app.route('/withdrawal', withdrawalRoutes); // ✅ NEW: Withdrawal system
app.route('/activity', activityRoutes); // ✅ NEW: Activity feed
app.route('/projects', projectsRoutes); // ✅ NEW: Projects management
app.route('/campaign', campaignRoutes); // ✅ NEW: Campaign mode routes
app.route('/credits-cron', creditsCronRoutes); // ✅ NEW: Monthly credits reset cron
app.route('/stripe-webhook', stripeWebhookRoutes); // ✅ NEW: Stripe webhook for auto-track purchases
app.route('/debug', debugRoutes); // ✅ NEW: Debug routes for development
app.route('/kie-ai-image', kieAIImageRoutes); // ✅ NEW: Kie AI image generation (Flux + Nano Banana)
app.route('/', kieAIVideoRoutes); // ✅ NEW: Kie AI video generation (Veo 3.1) - mounted at root for /video/* routes
app.route('/', generateRoutes); // ✅ NEW: Universal /generate endpoint (free + paid models)
app.route('/', creditsRoutes); // ✅ FIX: Credits API routes
app.route('/', videoRoutes); // ✅ NEW: Coconut V14 Video routes (Analyze only)
app.route('/', fluxRoutes);
app.route('/', orchestratorRoutes);
app.route('/', historyRoutes);
app.route('/', dashboardRoutes);
app.route('/', cocoBoardRoutes);
app.route('/', uploadRoutes);
app.route('/', generationStatusRoutes);

console.log('✅ All routes mounted successfully - FULL CREATOR ECONOMY');

// ============================================
// INITIALIZE STORAGE ON STARTUP
// ============================================

console.log('🚀 Coconut V14 Server (FLUX PRO) starting...');

initializeStorageBuckets()
  .then(() => {
    console.log('✅ Storage buckets initialized');
  })
  .catch((error) => {
    console.error('⚠️ Failed to initialize storage buckets:', error);
  });

initializeFeedBucket()
  .then(() => {
    console.log('✅ Feed bucket initialized');
  })
  .catch((error) => {
    console.error('⚠️ Failed to initialize feed bucket:', error);
  });

// ============================================
// CHECK EXPIRED CREDITS ON STARTUP
// ============================================

async function checkExpiredCredits() {
  try {
    console.log('🔍 Checking for expired credits...');
    
    // Get all user profiles
    const allProfiles = await kv.getByPrefix('user:profile:') || [];
    
    let expiredCount = 0;
    const now = new Date();
    
    for (const profile of allProfiles) {
      if (profile.accountType !== 'enterprise') continue; // Only enterprise credits expire
      
      // Get credits
      const credits = await kv.get(`user:${profile.userId}:credits`);
      
      if (!credits || !credits.expiresAt) continue;
      
      const expiresAt = new Date(credits.expiresAt);
      
      // Check if expired
      if (expiresAt < now && credits.paidCredits > 0) {
        console.log(`⏰ Expiring credits for enterprise user ${profile.userId} (expired: ${credits.expiresAt})`);
        
        // Reset expired credits to 0
        const updatedCredits = {
          ...credits,
          paidCredits: 0,
          freeCredits: 0, // Enterprise always has 0 free credits
          expiredAmount: credits.paidCredits, // Track how much expired
          expiredAt: now.toISOString()
        };
        
        // Update profile
        profile.paidCredits = 0;
        profile.freeCredits = 0;
        profile.updatedAt = now.toISOString();
        
        // Save
        await kv.set(`user:${profile.userId}:credits`, updatedCredits);
        await kv.set(`user:profile:${profile.userId}`, profile);
        
        expiredCount++;
      }
    }
    
    console.log(`✅ Expired credits check complete: ${expiredCount} enterprise accounts reset`);
  } catch (error) {
    console.error('❌ Failed to check expired credits:', error);
  }
}

checkExpiredCredits()
  .then(() => {
    console.log('✅ Expired credits check completed');
  })
  .catch((error) => {
    console.error('⚠️ Failed to check expired credits:', error);
  });

// ============================================
// INITIALIZE DEMO USER WITH CREDITS
// ============================================

async function initializeDemoUser() {
  try {
    // ✅ FIX: Demo user should have 0 credits (no initialization)
    // Users must sign up with Auth0 to get 22 free credits
    console.log('✅ Demo user will have 0 credits (users must sign up to get 22 free credits)');
  } catch (error) {
    console.error('⚠️ Error during initialization:', error);
  }
}

initializeDemoUser();

// ============================================
// START SERVER
// ============================================

console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  🌟 COCONUT V14 - FLUX PRO OPTIMIZED SERVER READY!  🌟  ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');
console.log('📝 OPTIMIZATIONS ACTIVE:');
console.log('  ✅ Flux 2 Pro official guide structure');
console.log('  ✅ 30-150 word concise prompts (not 500+ word JSON)');
console.log('  ✅ Punchy creative language (not technical docs)');
console.log('  ✅ Camera references mandatory');
console.log('  ✅ Hex colors contextualized');
console.log('  ✅ Typography with quotation marks');
console.log('  ✅ Creative archetypes applied');
console.log('  ✅ 8.5/10 creativity minimum');
console.log('  ✅ No generic placeholders');
console.log('');
console.log('🎯 GOAL: Replace professional designers');
console.log('💎 OUTPUT: Nike/Apple/Gucci campaign quality');
console.log('');
console.log('Ready to analyze creative briefs! 🚀');
console.log('');

Deno.serve(app.fetch);