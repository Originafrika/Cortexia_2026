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
import referralSystemRoutes from './referral-system-routes.ts'; // ✅ NEW: Referral system dashboard
import originsRoutes from './origins-routes.ts'; // ✅ NEW: Origins currency
import compensationRoutes from './creator-compensation-routes.ts'; // ✅ NEW: Creator compensation
import feedLikesTrackerRoutes from './feed-likes-tracker.ts'; // ✅ FIXED: Feed likes tracker (removed -routes)
import withdrawalRoutes from './withdrawal-routes.ts'; // ✅ NEW: Withdrawal system
import enterpriseRoutes from './enterprise-routes.ts'; // ✅ NEW: Enterprise subscription
import notificationsRoutes from './notifications-routes.ts'; // ✅ NEW: Notifications system
import storageCleanupRoutes from './storage-cleanup-routes.ts'; // ✅ NEW: Storage cleanup cron
import creditsRoutesV3 from './credits-routes-v3.ts'; // ✅ V3: Unified credits system
import developerRoutes from './developer-routes.ts'; // ✅ NEW: Developer API keys
import paymentRoutes from './payment-routes.ts'; // ✅ NEW: Payments (FedaPay + Stripe)
import payoutRoutes from './payout-routes.ts'; // ✅ NEW: Payouts/Retraits (FedaPay + Stripe) 🆕
import * as kv from './kv_store.tsx'; // ✅ Import KV store for expiration check
import { logStartup, logVerbose, showStartupBanner, shouldLog } from './server-config.ts'; // ✅ NEW: Server config
import storageRoutes from './storage-routes.ts'; // ✅ Storage routes
import userStatsRoutes from './user-stats-routes.ts'; // ✅ User stats routes
import avatarRoutes from './avatar-routes.ts'; // ✅ Avatar routes
import creatorSystemRoutes from './creator-system-routes.ts'; // ✅ Creator system routes
import enhancedFeedRoutes from './enhanced-feed-routes.ts'; // ✅ Enhanced feed routes
import { initializeStorageBuckets } from './coconut-v14-storage.ts'; // ✅ Storage initialization
import { initializeFeedBucket } from './feed-storage.ts'; // ✅ Feed bucket initialization
import { initializeMockData } from './mock-data-init.ts'; // ✅ Mock data initialization

// ============================================
// MOUNT ROUTES
// ============================================

if (shouldLog('normal')) {
  console.log('🔧 Mounting routes (FLUX PRO OPTIMIZED)...');
}

// ✅ MOUNT CREDITS ROUTES FIRST (to avoid conflicts)
app.route('/credits', creditsRoutesV3); // ✅ V3: Clean unified credits system (PRIORITY)
// app.route('/', creditsRoutes); // ❌ LEGACY: Old credits routes (DEPRECATED, will be removed)

app.route('/auth', authRoutes); // ✅ FIXED: No double prefix (basePath already set)
app.route('/feed', feedRoutes); // ✅ NEW: Feed routes
app.route('/creators', creatorRoutes); // ✅ NEW: Creator routes
app.route('/users', userRoutes); // ✅ NEW: User profiles
app.route('/referral', referralSystemRoutes); // ✅ NEW: Referral system dashboard
app.route('/origins', originsRoutes); // ✅ NEW: Origins currency
app.route('/compensation', compensationRoutes); // ✅ NEW: Creator compensation
app.route('/feed-likes', feedLikesTrackerRoutes); // ✅ NEW: Feed likes tracker
app.route('/withdrawal', withdrawalRoutes); // ✅ NEW: Withdrawal system
app.route('/enterprise', enterpriseRoutes); // ✅ NEW: Enterprise subscription
app.route('/payments', paymentRoutes); // ✅ NEW: Payments (FedaPay + Stripe)
app.route('/payouts', payoutRoutes); // ✅ NEW: Payouts/Retraits (FedaPay + Stripe) 🆕
app.route('/', fluxRoutes);
app.route('/', orchestratorRoutes);
app.route('/', historyRoutes);
app.route('/', dashboardRoutes);
app.route('/', cocoBoardRoutes);
app.route('/', uploadRoutes);
app.route('/', generationStatusRoutes);
app.route('/storage', storageRoutes); // ✅ FIXED: Mount under /storage prefix
app.route('/storage-cleanup', storageCleanupRoutes); // ✅ NEW: Storage cleanup cron
app.route('/user-stats', userStatsRoutes); // ✅ NEW: User stats & analytics
app.route('/avatar', avatarRoutes); // ✅ NEW: Avatar upload/delete
app.route('/developer', developerRoutes); // ✅ NEW: Developer dashboard
app.route('/creator-system', creatorSystemRoutes); // ✅ NEW: Creator system
app.route('/enhanced-feed', enhancedFeedRoutes); // ✅ NEW: Enhanced feed
app.route('/notifications', notificationsRoutes); // ✅ NEW: Notifications

if (shouldLog('normal')) {
  console.log('✅ All routes mounted successfully - FULL CREATOR ECONOMY');
}

// ============================================
// INITIALIZE STORAGE ON STARTUP
// ============================================

if (shouldLog('normal')) {
  console.log('🚀 Coconut V14 Server (FLUX PRO) starting...');
}

// ✅ NEW: Retry logic for storage initialization
async function initializeStorageWithRetry(maxRetries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (shouldLog('normal')) {
        console.log(`🗄️ Attempting storage initialization (${attempt}/${maxRetries})...`);
      }
      
      await initializeStorageBuckets();
      
      if (shouldLog('normal')) {
        console.log('✅ Storage buckets initialized successfully');
      }
      return; // Success, exit function
      
    } catch (error) {
      if (shouldLog('error')) {
        console.error(`❌ [Attempt ${attempt}/${maxRetries}] Storage init failed:`, error.message);
      }
      
      if (attempt < maxRetries) {
        if (shouldLog('normal')) {
          console.log(`⏳ Retrying in ${delayMs}ms...`);
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        if (shouldLog('error')) {
          console.error('⚠️ Storage initialization failed after max retries. Server will continue without storage buckets.');
          console.error('⚠️ Uploads may fail until buckets are manually created.');
        }
      }
    }
  }
}

// Non-blocking initialization with retry
initializeStorageWithRetry()
  .catch((error) => {
    if (shouldLog('error')) {
      console.error('⚠️ Critical error in storage initialization:', error);
    }
  });

// ✅ NEW: Feed bucket initialization with retry
async function initializeFeedWithRetry(maxRetries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await initializeFeedBucket();
      
      if (shouldLog('normal')) {
        console.log('✅ Feed bucket initialized successfully');
      }
      return;
      
    } catch (error) {
      if (shouldLog('error')) {
        console.error(`❌ [Attempt ${attempt}/${maxRetries}] Feed bucket init failed:`, error.message);
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        if (shouldLog('error')) {
          console.error('⚠️ Feed bucket initialization failed. Feed uploads may not work.');
        }
      }
    }
  }
}

initializeFeedWithRetry()
  .catch((error) => {
    if (shouldLog('error')) {
      console.error('⚠️ Critical error in feed bucket initialization:', error);
    }
  });

// ✅ NEW: Mock data initialization
initializeMockData();

// ============================================
// CHECK EXPIRED CREDITS ON STARTUP
// ============================================

async function checkExpiredCredits() {
  try {
    if (shouldLog('normal')) {
      console.log('🔍 Checking for expired credits...');
    }
    
    // Get all user profiles with retry logic
    let allProfiles;
    try {
      allProfiles = await kv.getByPrefix('user:profile:') || [];
    } catch (kvError) {
      if (shouldLog('error')) {
        console.error('❌ [Supabase] ❌ Failed to check expired credits:', kvError);
      }
      // Don't crash the server if KV is temporarily unavailable
      return;
    }
    
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
        if (shouldLog('normal')) {
          console.log(`⏰ Expiring credits for enterprise user ${profile.userId} (expired: ${credits.expiresAt})`);
        }
        
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
    
    if (shouldLog('normal')) {
      console.log(`✅ Expired credits check complete: ${expiredCount} enterprise accounts reset`);
    }
  } catch (error) {
    if (shouldLog('error')) {
      console.error('❌ Failed to check expired credits:', error);
    }
  }
}

checkExpiredCredits()
  .then(() => {
    if (shouldLog('normal')) {
      console.log('✅ Expired credits check completed');
    }
  })
  .catch((error) => {
    if (shouldLog('error')) {
      console.error('⚠️ Failed to check expired credits:', error);
    }
  });

// ============================================
// INITIALIZE DEMO USER WITH CREDITS
// ============================================

async function initializeDemoUser() {
  try {
    // ✅ FIX: Demo user should have 0 credits (no initialization)
    // Users must sign up with Auth0 to get 22 free credits
    if (shouldLog('normal')) {
      console.log('✅ Demo user will have 0 credits (users must sign up to get 22 free credits)');
    }
  } catch (error) {
    if (shouldLog('error')) {
      console.error('⚠️ Error during initialization:', error);
    }
  }
}

initializeDemoUser();

// ============================================
// START SERVER
// ============================================

if (shouldLog('normal')) {
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
}

Deno.serve(app.fetch);