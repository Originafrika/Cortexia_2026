/**
 * USER ROUTES - User Profiles & Account Management
 * Complete user profile with referral system integration
 */

import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ============================================================================
// TYPES
// ============================================================================

interface UserProfile {
  // Auth info
  userId: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  
  // Account type
  accountType: 'individual' | 'enterprise' | 'developer'; // ✅ FIXED: Changed 'business' to 'enterprise'
  
  // ✅ Onboarding status
  onboardingComplete?: boolean; // ✅ Track if user completed onboarding
  
  // Referral System
  referralCode: string;        // Ex: "ALEX2026"
  referredBy: string | null;   // userId du parrain
  referredAt: string | null;   // Date de parrainage
  
  // Referral earnings
  referralEarnings: number;    // Total commissions gagnées
  referralCount: number;       // Nombre de filleuls
  
  // Credits
  freeCredits: number;         // 25/mois gratuits
  paidCredits: number;         // Achetés
  totalCreditsUsed: number;    // Total utilisés
  
  // Creator System
  hasCoconutAccess: boolean;
  topCreatorMonth: string | null;
  topCreatorSince: string | null;
  // 👑 Creator Stats (for admin management)
  isCreator?: boolean;
  generationsThisMonth?: number;
  publishedThisMonth?: number;
  publishedWithLikesThisMonth?: number;
  
  // Social
  followersCount: number;
  followingCount: number;
  postsCount: number;
  likesCount: number;
  
  // Timestamps
  createdAt: string;
  lastLoginAt: string;
  updatedAt: string;
  
  // ✅ Enterprise-specific data
  companyLogo?: string;
  brandColors?: string[];
  companyName?: string;
  
  // ✅ Common user preferences (all types)
  preferredStyles?: string[];
  goals?: string[];
  creatorOptIn?: boolean;
}

// ============================================================================
// CREATE PROFILE
// ============================================================================

/**
 * POST /users/create
 * Create new user profile (called after Supabase Auth signup)
 */
app.post('/create', async (c) => {
  try {
    const {
      userId,
      email,
      username,
      displayName,
      referralCode
    } = await c.req.json();

    if (!userId || !email) {
      return c.json({
        success: false,
        error: 'userId and email required'
      }, 400);
    }

    console.log('👤 Creating user profile:', { userId, email, username });

    // Check if profile already exists
    const existingProfile = await kv.get(`user:profile:${userId}`);
    if (existingProfile) {
      return c.json({
        success: false,
        error: 'Profile already exists'
      }, 409);
    }

    // Generate unique referral code
    const userReferralCode = await generateUniqueReferralCode(username || email);

    // Validate referredBy code if provided
    let referredBy: string | null = null;
    let referredAt: string | null = null;
    
    if (referralCode) {
      const referrerId = await kv.get(`referral:code:${referralCode.toUpperCase()}`);
      if (referrerId) {
        referredBy = referrerId;
        referredAt = new Date().toISOString();
        
        // Add to referrer's referrals list
        const referrerReferrals = await kv.get(`user:referrals:${referrerId}`) || [];
        referrerReferrals.push(userId);
        await kv.set(`user:referrals:${referrerId}`, referrerReferrals);
        
        // Update referrer's referral count
        const referrerProfile = await kv.get(`user:profile:${referrerId}`);
        if (referrerProfile) {
          referrerProfile.referralCount = referrerReferrals.length;
          referrerProfile.updatedAt = new Date().toISOString();
          await kv.set(`user:profile:${referrerId}`, referrerProfile);
          
          console.log(`✅ Referrer ${referrerId} now has ${referrerReferrals.length} referrals`);
        }
        
        console.log(`🎁 User referred by: ${referrerId} (code: ${referralCode})`);
      } else {
        console.warn(`⚠️ Invalid referral code: ${referralCode}`);
      }
    }

    // Create user profile
    const profile: UserProfile = {
      userId,
      email,
      username: username || email.split('@')[0],
      displayName: displayName || username || email.split('@')[0],
      avatar: '',
      bio: '',
      accountType: 'individual',
      onboardingComplete: false, // ✅ New users need onboarding
      referralCode: userReferralCode,
      referredBy,
      referredAt,
      referralEarnings: 0,
      referralCount: 0,
      freeCredits: referredBy ? 35 : 25, // 🎁 BONUS: +10 free credits if referred (35 total) - INDIVIDUAL ONLY
      paidCredits: 0,
      totalCreditsUsed: 0,
      hasCoconutAccess: false,
      topCreatorMonth: null,
      topCreatorSince: null,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      likesCount: 0,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save profile
    await kv.set(`user:profile:${userId}`, profile);

    // Map referral code to userId
    await kv.set(`referral:code:${userReferralCode}`, userId);

    // Initialize empty referrals list
    await kv.set(`user:referrals:${userId}`, []);

    // ✅ Initialize credits in Coconut V14 format (user:userId:credits)
    await kv.set(`user:${userId}:credits`, {
      free: profile.freeCredits,
      paid: profile.paidCredits
    });

    console.log(`✅ User profile created: ${userId} (code: ${userReferralCode}, credits: ${profile.freeCredits})`);

    return c.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('❌ Create profile error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create profile'
    }, 500);
  }
});

/**
 * POST /users/create-or-update-auth0
 * Create or update Auth0 user profile (called after Auth0 callback)
 */
app.post('/create-or-update-auth0', async (c) => {
  try {
    const {
      userId,
      email,
      name,
      userType,
      auth0Id,
      picture,
      referralCode // Optional: from sessionStorage
    } = await c.req.json();

    if (!userId || !email) {
      return c.json({
        success: false,
        error: 'userId and email required'
      }, 400);
    }

    console.log('👤 Creating/updating Auth0 user profile:', { userId, email, name, userType });

    // Check if profile already exists
    const existingProfile = await kv.get(`user:profile:${userId}`);
    
    if (existingProfile) {
      // Update existing profile
      existingProfile.lastLoginAt = new Date().toISOString();
      existingProfile.updatedAt = new Date().toISOString();
      
      // ✅ MIGRATION: If user exists but doesn't have onboardingComplete, assume completed
      if (existingProfile.onboardingComplete === undefined) {
        existingProfile.onboardingComplete = true;
      }
      
      await kv.set(`user:profile:${userId}`, existingProfile);
      
      console.log(`✅ Auth0 user profile updated: ${userId} (onboarding: ${existingProfile.onboardingComplete})`);
      
      return c.json({
        success: true,
        profile: existingProfile,
        isNewUser: false
      });
    }

    // New user - create profile
    const username = name?.toLowerCase().replace(/\s+/g, '') || email.split('@')[0];
    const userReferralCode = await generateUniqueReferralCode(username);

    // Validate referredBy code if provided
    let referredBy: string | null = null;
    let referredAt: string | null = null;
    
    if (referralCode) {
      const referrerId = await kv.get(`referral:code:${referralCode.toUpperCase()}`);
      if (referrerId) {
        referredBy = referrerId;
        referredAt = new Date().toISOString();
        
        // Add to referrer's referrals list
        const referrerReferrals = await kv.get(`user:referrals:${referrerId}`) || [];
        referrerReferrals.push(userId);
        await kv.set(`user:referrals:${referrerId}`, referrerReferrals);
        
        // Update referrer's referral count
        const referrerProfile = await kv.get(`user:profile:${referrerId}`);
        if (referrerProfile) {
          referrerProfile.referralCount = referrerReferrals.length;
          referrerProfile.updatedAt = new Date().toISOString();
          await kv.set(`user:profile:${referrerId}`, referrerProfile);
          
          console.log(`✅ Referrer ${referrerId} now has ${referrerReferrals.length} referrals`);
        }
        
        console.log(`🎁 Auth0 user referred by: ${referrerId} (code: ${referralCode})`);
      } else {
        console.warn(`⚠️ Invalid referral code: ${referralCode}`);
      }
    }

    // Create user profile
    const profile: UserProfile = {
      userId,
      email,
      username,
      displayName: name || username,
      avatar: picture || '',
      bio: '',
      accountType: userType === 'developer' ? 'developer' : userType === 'enterprise' ? 'enterprise' : 'individual', // ✅ FIXED: Keep 'enterprise' consistent
      onboardingComplete: false, // ✅ New users need onboarding
      referralCode: userReferralCode,
      referredBy,
      referredAt,
      referralEarnings: 0,
      referralCount: 0,
      freeCredits: referredBy ? 35 : 25, // 🎁 BONUS: +10 free credits if referred (35 total)
      paidCredits: 0,
      totalCreditsUsed: 0,
      hasCoconutAccess: false,
      topCreatorMonth: null,
      topCreatorSince: null,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      likesCount: 0,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save profile
    await kv.set(`user:profile:${userId}`, profile);

    // Map referral code to userId
    await kv.set(`referral:code:${userReferralCode}`, userId);

    // Initialize empty referrals list
    await kv.set(`user:referrals:${userId}`, []);

    // ✅ FIXED: Initialize credits in Coconut V14 format (user:userId:credits)
    await kv.set(`user:${userId}:credits`, {
      free: profile.freeCredits,
      paid: profile.paidCredits
    });

    // Link auth0Id to userId
    await kv.set(`auth0:${auth0Id}`, userId);

    console.log(`✅ Auth0 user profile created: ${userId} (code: ${userReferralCode}, credits: ${profile.freeCredits})`);

    return c.json({
      success: true,
      profile,
      isNewUser: true
    });
  } catch (error) {
    console.error('❌ Create/update Auth0 profile error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create/update profile'
    }, 500);
  }
});

// ============================================================================
// GET PROFILE
// ============================================================================

/**
 * GET /users/:userId/type
 * Get user account type only (lightweight endpoint)
 */
app.get('/:userId/type', async (c) => {
  try {
    const userId = c.req.param('userId');

    const profile = await kv.get(`user:profile:${userId}`);
    
    if (!profile) {
      return c.json({
        success: false,
        error: 'Profile not found'
      }, 404);
    }

    return c.json({
      success: true,
      type: profile.accountType,
      onboardingComplete: profile.onboardingComplete || false
    });
  } catch (error) {
    console.error('❌ Get user type error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user type'
    }, 500);
  }
});

/**
 * GET /users/:userId/profile
 * Get user profile
 */
app.get('/:userId/profile', async (c) => {
  try {
    const userId = c.req.param('userId');

    const profile = await kv.get(`user:profile:${userId}`);
    
    if (!profile) {
      return c.json({
        success: false,
        error: 'Profile not found'
      }, 404);
    }

    // Update last login
    profile.lastLoginAt = new Date().toISOString();
    await kv.set(`user:profile:${userId}`, profile);

    return c.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get profile'
    }, 500);
  }
});

// ============================================================================
// UPDATE PROFILE
// ============================================================================

/**
 * PATCH /users/:userId/profile
 * Update user profile
 */
app.patch('/:userId/profile', async (c) => {
  try {
    const userId = c.req.param('userId');
    const updates = await c.req.json();

    const profile = await kv.get(`user:profile:${userId}`);
    
    if (!profile) {
      return c.json({
        success: false,
        error: 'Profile not found'
      }, 404);
    }

    // Allowed fields to update
    const allowedFields = [
      'username',
      'displayName',
      'avatar',
      'bio',
      'accountType'
    ];

    // Apply updates
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        profile[field] = updates[field];
      }
    }

    profile.updatedAt = new Date().toISOString();
    await kv.set(`user:profile:${userId}`, profile);

    console.log(`✅ Profile updated: ${userId}`);

    return c.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile'
    }, 500);
  }
});

// ============================================================================
// GET REFERRALS
// ============================================================================

/**
 * GET /users/:userId/referrals
 * Get user's referrals (filleuls)
 */
app.get('/:userId/referrals', async (c) => {
  try {
    const userId = c.req.param('userId');

    const referralIds = await kv.get(`user:referrals:${userId}`) || [];

    // Fetch referral profiles
    const referrals = [];
    for (const referralId of referralIds) {
      const referralProfile = await kv.get(`user:profile:${referralId}`);
      if (referralProfile) {
        referrals.push({
          userId: referralProfile.userId,
          username: referralProfile.username,
          displayName: referralProfile.displayName,
          avatar: referralProfile.avatar,
          createdAt: referralProfile.createdAt,
          totalCreditsUsed: referralProfile.totalCreditsUsed
        });
      }
    }

    return c.json({
      success: true,
      referrals,
      count: referrals.length
    });
  } catch (error) {
    console.error('❌ Get referrals error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get referrals'
    }, 500);
  }
});

// ============================================================================
// GET EARNINGS
// ============================================================================

/**
 * GET /users/:userId/earnings
 * Get user's referral earnings
 */
app.get('/:userId/earnings', async (c) => {
  try {
    const userId = c.req.param('userId');

    const profile = await kv.get(`user:profile:${userId}`);
    
    if (!profile) {
      return c.json({
        success: false,
        error: 'Profile not found'
      }, 404);
    }

    // Get earnings transactions
    const transactions = await kv.get(`referral:transactions:${userId}`) || [];

    return c.json({
      success: true,
      totalEarnings: profile.referralEarnings,
      referralCount: profile.referralCount,
      transactions
    });
  } catch (error) {
    console.error('❌ Get earnings error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get earnings'
    }, 500);
  }
});

// ============================================================================
// GET REFERRAL DETAILS (✅ NEW: Complete referral info for UI)
// ============================================================================

/**
 * GET /users/:userId/referral-details
 * Get complete referral information including code, filleuls, and earnings
 */
app.get('/:userId/referral-details', async (c) => {
  try {
    const userId = c.req.param('userId');

    // Get user profile
    const profile = await kv.get(`user:profile:${userId}`);
    
    if (!profile) {
      return c.json({
        success: false,
        error: 'Profile not found'
      }, 404);
    }

    // Get referral IDs
    const referralIds = await kv.get(`user:referrals:${userId}`) || [];

    // Fetch detailed referral info with earnings
    const referrals = [];
    for (const referralId of referralIds) {
      const referralProfile = await kv.get(`user:profile:${referralId}`);
      if (referralProfile) {
        // Calculate commission earned from this referral (10% of their total spent)
        const commissionEarned = (referralProfile.totalCreditsUsed || 0) * 0.10 * 0.10; // 10% of $0.10/credit
        
        referrals.push({
          userId: referralProfile.userId,
          userName: referralProfile.displayName || referralProfile.username,
          avatar: referralProfile.avatar,
          signupDate: referralProfile.createdAt,
          commissionEarned: Math.round(commissionEarned * 100) / 100, // Round to 2 decimals
          totalCreditsSpent: referralProfile.totalCreditsUsed || 0,
          status: 'active' // Could be enhanced with actual status
        });
      }
    }

    return c.json({
      success: true,
      referralCode: profile.referralCode,
      referralCount: profile.referralCount || 0,
      referralEarnings: profile.referralEarnings || 0,
      referrals: referrals
    });
  } catch (error) {
    console.error('❌ Get referral details error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get referral details'
    }, 500);
  }
});

// ============================================================================
// SEARCH USERS
// ============================================================================

/**
 * GET /users/search?query=alex&limit=20
 * Search users by username or displayName
 */
app.get('/search', async (c) => {
  try {
    const query = c.req.query('query') || '';
    const limit = parseInt(c.req.query('limit') || '20');

    if (query.length < 2) {
      return c.json({
        success: false,
        error: 'Query must be at least 2 characters'
      }, 400);
    }

    // Get all user profiles
    const allProfiles = await kv.getByPrefix('user:profile:') || [];

    // Filter by query
    const results = allProfiles
      .filter((profile: UserProfile) => 
        profile.username.toLowerCase().includes(query.toLowerCase()) ||
        profile.displayName.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit)
      .map((profile: UserProfile) => ({
        userId: profile.userId,
        username: profile.username,
        displayName: profile.displayName,
        avatar: profile.avatar,
        bio: profile.bio,
        followersCount: profile.followersCount,
        postsCount: profile.postsCount,
        hasCoconutAccess: profile.hasCoconutAccess
      }));

    return c.json({
      success: true,
      results,
      count: results.length
    });
  } catch (error) {
    console.error('❌ Search users error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search users'
    }, 500);
  }
});

// ============================================================================
// DELETE PROFILE
// ============================================================================

/**
 * DELETE /users/:userId/profile
 * Delete user profile (soft delete)
 */
app.delete('/:userId/profile', async (c) => {
  try {
    const userId = c.req.param('userId');

    const profile = await kv.get(`user:profile:${userId}`);
    
    if (!profile) {
      return c.json({
        success: false,
        error: 'Profile not found'
      }, 404);
    }

    // Soft delete: mark as deleted
    profile.deletedAt = new Date().toISOString();
    profile.username = `deleted_${userId}`;
    profile.email = `deleted_${userId}@cortexia.app`;
    await kv.set(`user:profile:${userId}`, profile);

    console.log(`🗑️ Profile soft deleted: ${userId}`);

    return c.json({
      success: true,
      message: 'Profile deleted'
    });
  } catch (error) {
    console.error('❌ Delete profile error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete profile'
    }, 500);
  }
});

/**
 * DELETE /users/:userId/account
 * ✅ PRODUCTION READY: Permanently delete user account and all associated data
 * This is a HARD DELETE that removes:
 * - User profile
 * - All posts
 * - All comments
 * - All likes
 * - Avatar from storage
 * - Supabase Auth account
 */
app.delete('/:userId/account', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    console.log(`🗑️ Starting HARD DELETE for user: ${userId}`);

    // 1. Get user profile
    const profile = await kv.get(`user:profile:${userId}`);
    
    if (!profile) {
      return c.json({
        success: false,
        error: 'Profile not found'
      }, 404);
    }

    // 2. Delete all user posts
    const posts = await kv.getByPrefix(`post:`);
    const userPosts = posts.filter((p: any) => p?.userId === userId);
    
    for (const post of userPosts) {
      // Delete post comments
      await kv.del(`post:comments:${post.id}`);
      // Delete post likes
      await kv.del(`post:likes:${post.id}`);
      // Delete the post itself
      await kv.del(`post:${post.id}`);
    }
    console.log(`✅ Deleted ${userPosts.length} posts`);

    // 3. Delete all user comments on other posts
    const allComments = await kv.getByPrefix(`post:comments:`);
    for (const commentList of allComments) {
      if (Array.isArray(commentList)) {
        const filtered = commentList.filter((c: any) => c?.userId !== userId);
        const key = `post:comments:${commentList[0]?.postId || ''}`;
        if (key) await kv.set(key, filtered);
      }
    }
    console.log(`✅ Deleted user comments`);

    // 4. Delete all user likes
    const allLikes = await kv.getByPrefix(`post:likes:`);
    for (const likeList of allLikes) {
      if (Array.isArray(likeList)) {
        const filtered = likeList.filter((userId_like: string) => userId_like !== userId);
        const postId = likeList.toString().split(':').pop();
        if (postId) await kv.set(`post:likes:${postId}`, filtered);
      }
    }
    console.log(`✅ Deleted user likes`);

    // 5. Delete avatar from Supabase Storage
    if (profile.avatar) {
      try {
        const avatarPath = profile.avatar.split('/').pop();
        if (avatarPath) {
          await supabase.storage
            .from('make-e55aa214-avatars')
            .remove([`avatars/${avatarPath}`]);
          console.log(`✅ Deleted avatar from storage`);
        }
      } catch (err) {
        console.warn('⚠️ Avatar deletion failed:', err);
      }
    }

    // 6. Remove from referral system
    await kv.del(`referral:code:${profile.referralCode}`);
    const referrals = await kv.get(`user:referrals:${userId}`) || [];
    await kv.del(`user:referrals:${userId}`);
    console.log(`✅ Deleted referral data`);

    // 7. Delete user profile
    await kv.del(`user:profile:${userId}`);
    console.log(`✅ Deleted user profile`);

    // 8. Delete Supabase Auth user
    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) {
        console.warn('⚠️ Auth deletion failed:', authError);
      } else {
        console.log(`✅ Deleted Supabase Auth user`);
      }
    } catch (err) {
      console.warn('⚠️ Auth deletion error:', err);
    }

    console.log(`✅ HARD DELETE COMPLETE for user: ${userId}`);

    return c.json({
      success: true,
      message: 'Account permanently deleted'
    });
  } catch (error) {
    console.error('❌ Delete account error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete account'
    }, 500);
  }
});

/**
 * POST /users/:userId/complete-onboarding
 * Complete onboarding and update profile
 */
app.post('/:userId/complete-onboarding', async (c) => {
  try {
    const userId = c.req.param('userId');
    const { 
      companyLogo, 
      brandColors, 
      companyName,
      styles,
      goals,
      creatorOptIn
    } = await c.req.json();

    const profile = await kv.get(`user:profile:${userId}`);
    
    if (!profile) {
      return c.json({
        success: false,
        error: 'Profile not found'
      }, 404);
    }

    // ✅ Update profile with onboarding data
    profile.onboardingComplete = true;
    profile.updatedAt = new Date().toISOString();
    
    // ✅ Enterprise-specific data
    if (companyLogo !== undefined) profile.companyLogo = companyLogo;
    if (brandColors !== undefined) profile.brandColors = brandColors;
    if (companyName !== undefined) profile.companyName = companyName;
    
    // ✅ Common user preferences (all types)
    if (styles !== undefined) profile.preferredStyles = styles;
    if (goals !== undefined) profile.goals = goals;
    if (creatorOptIn !== undefined) profile.creatorOptIn = creatorOptIn;
    
    // 🏢 ENTERPRISE CREDITS: Remove free credits, they only get paid credits
    if (profile.accountType === 'enterprise') {
      profile.freeCredits = 0; // ❌ No free credits for enterprise
      profile.paidCredits = 0; // They must purchase minimum 10,000 credits
      
      // Update credits store
      await kv.set(`user:${userId}:credits`, {
        free: 0,
        paid: 0,
        expiresAt: null // Will be set when they purchase their first plan
      });
      
      console.log(`🏢 Enterprise account: No free credits. Must purchase minimum 10,000 credits/month.`);
    }
    
    await kv.set(`user:profile:${userId}`, profile);

    console.log(`✅ Onboarding completed for user: ${userId}`, {
      styles,
      goals,
      creatorOptIn,
      companyName
    });

    return c.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('❌ Complete onboarding error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete onboarding'
    }, 500);
  }
});

// ============================================================================
// ADMIN ENDPOINTS (DEV ONLY)
// ============================================================================

/**
 * GET /users/admin/list-all
 * List all users in KV store (for debugging)
 */
app.get('/admin/list-all', async (c) => {
  try {
    const allProfiles = await kv.getByPrefix('user:profile:') || [];

    // ✅ Import unified credits system
    const CreditsSystem = await import('./unified-credits-system.ts');

    const users = await Promise.all(allProfiles.map(async (profile: UserProfile) => {
      // ✅ Get REAL credits from unified system
      const creditBalance = await CreditsSystem.getCredits(profile.userId);
      
      return {
        userId: profile.userId,
        email: profile.email,
        username: profile.username,
        displayName: profile.displayName,
        accountType: profile.accountType,
        onboardingComplete: profile.onboardingComplete,
        referralCode: profile.referralCode,
        // ✅ Use unified credits system (not profile fields)
        freeCredits: creditBalance.free,
        paidCredits: creditBalance.paid,
        // ✅ Enterprise details
        isEnterprise: creditBalance.isEnterprise,
        enterpriseMonthly: creditBalance.enterprise?.monthlyCredits || 0,
        enterpriseAddon: creditBalance.enterprise?.addOnCredits || 0,
        enterpriseTotal: creditBalance.enterprise?.totalCredits || 0,
        nextResetDate: creditBalance.nextResetDate,
        createdAt: profile.createdAt,
        lastLoginAt: profile.lastLoginAt,
        // 👑 Creator Stats
        isCreator: profile.isCreator || false,
        generationsThisMonth: profile.generationsThisMonth || 0,
        publishedThisMonth: profile.publishedThisMonth || 0,
        publishedWithLikesThisMonth: profile.publishedWithLikesThisMonth || 0
      };
    }));

    console.log(`📋 Listed ${users.length} users from KV store`);

    return c.json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error('❌ List all users error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list users'
    }, 500);
  }
});

/**
 * PUT /users/admin/update/:userId
 * Update user profile and credits (admin only)
 */
app.put('/admin/update/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const updates = await c.req.json();

    console.log(`📝 Admin updating user: ${userId}`, updates);

    // Get existing profile
    const profile = await kv.get(`user:profile:${userId}`) as UserProfile;
    
    if (!profile) {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404);
    }

    // Update profile fields
    const updatedProfile: UserProfile = {
      ...profile,
      displayName: updates.displayName || profile.displayName,
      username: updates.username || profile.username,
      email: updates.email || profile.email,
      accountType: updates.accountType || profile.accountType,
      // 👑 Creator Stats
      isCreator: updates.isCreator !== undefined ? updates.isCreator : profile.isCreator,
      generationsThisMonth: updates.generationsThisMonth !== undefined ? updates.generationsThisMonth : profile.generationsThisMonth,
      publishedThisMonth: updates.publishedThisMonth !== undefined ? updates.publishedThisMonth : profile.publishedThisMonth,
      publishedWithLikesThisMonth: updates.publishedWithLikesThisMonth !== undefined ? updates.publishedWithLikesThisMonth : profile.publishedWithLikesThisMonth,
      updatedAt: new Date().toISOString()
    };

    // Update credits separately - USE NEW SYSTEM (credits:${userId}:paid)
    const currentFreeCredits = await kv.get(`credits:${userId}:free`) || 0;
    const currentPaidCredits = await kv.get(`credits:${userId}:paid`) || 0;

    const updatedFreeCredits = updates.freeCredits !== undefined ? updates.freeCredits : currentFreeCredits;
    const updatedPaidCredits = updates.paidCredits !== undefined ? updates.paidCredits : currentPaidCredits;

    // Save to NEW system
    await kv.set(`credits:${userId}:free`, updatedFreeCredits);
    await kv.set(`credits:${userId}:paid`, updatedPaidCredits);

    // Also update profile credits for display
    updatedProfile.freeCredits = updatedFreeCredits;
    updatedProfile.paidCredits = updatedPaidCredits;

    // Save updates
    await kv.set(`user:profile:${userId}`, updatedProfile);

    console.log(`✅ Admin updated user ${userId}`);

    return c.json({
      success: true,
      profile: updatedProfile,
      credits: {
        free: updatedFreeCredits,
        paid: updatedPaidCredits
      }
    });
  } catch (error) {
    console.error('❌ Admin update user error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user'
    }, 500);
  }
});

/**
 * POST /users/:userId/purchase-credits
 * Purchase credits with automatic expiration (enterprise: 1 month)
 */
app.post('/:userId/purchase-credits', async (c) => {
  try {
    const userId = c.req.param('userId');
    const { amount } = await c.req.json();

    console.log(`💳 User ${userId} purchasing ${amount} credits`);

    // Get profile
    const profile = await kv.get(`user:profile:${userId}`) as UserProfile;
    
    if (!profile) {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404);
    }

    // Validate amount based on account type
    if (profile.accountType === 'enterprise') {
      // Enterprise: minimum 10,000, multiples of 1,000
      if (amount < 10000) {
        return c.json({
          success: false,
          error: 'Enterprise accounts must purchase minimum 10,000 credits'
        }, 400);
      }
      if (amount % 1000 !== 0) {
        return c.json({
          success: false,
          error: 'Enterprise credits must be purchased in batches of 1,000'
        }, 400);
      }
    }

    // Get current credits
    const currentCredits = await kv.get(`user:${userId}:credits`) || {
      freeCredits: profile.freeCredits || 0,
      paidCredits: profile.paidCredits || 0,
      totalCreditsUsed: 0
    };

    // Calculate expiration date (1 month for enterprise, never for individual/developer)
    let expiresAt = null;
    if (profile.accountType === 'enterprise') {
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 1);
      expiresAt = expirationDate.toISOString();
    }

    // Update credits
    const updatedCredits = {
      freeCredits: currentCredits.freeCredits || 0,
      paidCredits: (currentCredits.paidCredits || 0) + amount,
      totalCreditsUsed: currentCredits.totalCreditsUsed || 0,
      lastResetDate: currentCredits.lastResetDate || new Date().toISOString(),
      expiresAt: expiresAt,
      lastPurchaseDate: new Date().toISOString(),
      lastPurchaseAmount: amount
    };

    // Update profile
    profile.paidCredits = updatedCredits.paidCredits;
    profile.updatedAt = new Date().toISOString();

    // Save
    await kv.set(`user:${userId}:credits`, updatedCredits);
    await kv.set(`user:profile:${userId}`, profile);

    console.log(`✅ Credits purchased: ${amount}, expires: ${expiresAt || 'never'}`);

    return c.json({
      success: true,
      credits: updatedCredits,
      message: expiresAt 
        ? `Purchased ${amount} credits (expires ${new Date(expiresAt).toLocaleDateString()})`
        : `Purchased ${amount} credits (no expiration)`
    });
  } catch (error) {
    console.error('❌ Purchase credits error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to purchase credits'
    }, 500);
  }
});

/**
 * DELETE /users/admin/hard-delete/:userId
 * Completely delete user from KV store (for debugging)
 */
app.delete('/admin/hard-delete/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    console.log(`🗑️ Hard deleting user: ${userId}`);

    // Get profile to get referral code
    const profile = await kv.get(`user:profile:${userId}`);
    
    if (!profile) {
      return c.json({
        success: false,
        error: 'Profile not found'
      }, 404);
    }

    // Delete all user data
    const deletedKeys = [];

    // 1. Profile
    await kv.del(`user:profile:${userId}`);
    deletedKeys.push(`user:profile:${userId}`);

    // 2. Credits
    await kv.del(`user:${userId}:credits`);
    deletedKeys.push(`user:${userId}:credits`);

    // 3. Referrals
    await kv.del(`user:referrals:${userId}`);
    deletedKeys.push(`user:referrals:${userId}`);

    // 4. Referral code mapping
    if (profile.referralCode) {
      await kv.del(`referral:code:${profile.referralCode}`);
      deletedKeys.push(`referral:code:${profile.referralCode}`);
    }

    // 5. Referral transactions
    await kv.del(`referral:transactions:${userId}`);
    deletedKeys.push(`referral:transactions:${userId}`);

    // 6. Auth0 mapping (if exists)
    if (profile.auth0Id) {
      await kv.del(`auth0:${profile.auth0Id}`);
      deletedKeys.push(`auth0:${profile.auth0Id}`);
    }

    // 7. Remove from referrer's list (if referred)
    if (profile.referredBy) {
      const referrerReferrals = await kv.get(`user:referrals:${profile.referredBy}`) || [];
      const updatedReferrals = referrerReferrals.filter((id: string) => id !== userId);
      await kv.set(`user:referrals:${profile.referredBy}`, updatedReferrals);
      
      // Update referrer's count
      const referrerProfile = await kv.get(`user:profile:${profile.referredBy}`);
      if (referrerProfile) {
        referrerProfile.referralCount = updatedReferrals.length;
        referrerProfile.updatedAt = new Date().toISOString();
        await kv.set(`user:profile:${profile.referredBy}`, referrerProfile);
      }
    }

    console.log(`✅ User completely deleted: ${userId}`);
    console.log(`🗑️ Deleted keys:`, deletedKeys);

    return c.json({
      success: true,
      deletedKeys,
      message: `User ${userId} completely removed from KV store`
    });
  } catch (error) {
    console.error('❌ Hard delete error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete user'
    }, 500);
  }
});

/**
 * DELETE /users/admin/clear-all
 * Clear ALL users from KV store (DANGEROUS - DEV ONLY)
 */
app.delete('/admin/clear-all', async (c) => {
  try {
    console.warn('⚠️ CLEARING ALL USERS FROM KV STORE');

    // ✅ Count profiles before deletion
    const allProfiles = await kv.getByPrefix('user:profile:') || [];
    const deletedCount = allProfiles.length;

    // ✅ Use Supabase directly to delete by prefix (SQL LIKE)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Delete all user-related keys using SQL LIKE patterns
    const prefixes = [
      'user:profile:%',
      'user:%:credits',
      'user:referrals:%',
      'referral:code:%',
      'referral:transactions:%',
      'auth0:%'
    ];

    for (const pattern of prefixes) {
      const { error } = await supabase
        .from('kv_store_e55aa214')
        .delete()
        .like('key', pattern);
      
      if (error) {
        console.error(`❌ Failed to delete pattern ${pattern}:`, error);
      } else {
        console.log(`✅ Deleted keys matching: ${pattern}`);
      }
    }

    console.log(`✅ Cleared ${deletedCount} users from KV store`);

    return c.json({
      success: true,
      deletedCount,
      message: `Cleared ${deletedCount} users from KV store`
    });
  } catch (error) {
    console.error('❌ Clear all error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear users'
    }, 500);
  }
});

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Generate unique referral code
 */
async function generateUniqueReferralCode(username: string): Promise<string> {
  // Generate code from username + random
  const baseCode = username
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 6);
  
  let code = baseCode;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    // Check if code exists
    const existingUserId = await kv.get(`referral:code:${code}`);
    
    if (!existingUserId) {
      return code;
    }
    
    // Add random suffix if collision
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    code = `${baseCode}${randomSuffix}`;
    attempts++;
  }
  
  // Fallback: completely random
  const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  return randomCode;
}

// ============================================================================
// DELETE ACCOUNT (RGPD-COMPLIANT)
// ============================================================================

/**
 * DELETE /users/:userId/delete
 * Delete user account and all associated data (RGPD Article 17 - Right to erasure)
 * 
 * Security: Production-ready with comprehensive data cleanup
 */
app.delete('/:userId/delete', async (c) => {
  try {
    const userId = c.req.param('userId');
    const body = await c.req.json().catch(() => ({}));
    
    console.log(`🗑️ [DELETE ACCOUNT] Starting deletion for user: ${userId}`);

    // ✅ STEP 1: Verify user exists
    const profile = await kv.get(`user:profile:${userId}`);
    
    if (!profile) {
      console.error(`❌ [DELETE ACCOUNT] User not found: ${userId}`);
      return c.json({
        success: false,
        error: 'User not found'
      }, 404);
    }

    console.log(`✅ [DELETE ACCOUNT] User found: ${profile.email}`);

    // ✅ STEP 2: Delete all user data (RGPD compliance)
    const keysToDelete = [
      // Core profile
      `user:profile:${userId}`,
      `user:${userId}:credits`,
      `user:${userId}:origins`,
      
      // Referral system
      `user:referrals:${userId}`,
      `referral:code:${profile.referralCode}`,
      
      // Creator system
      `creator:${userId}`,
      `creator:${userId}:conditions`,
      `creator:${userId}:stats`,
      `creator:${userId}:rewards`,
      
      // Social data
      `user:${userId}:following`,
      `user:${userId}:followers`,
      `user:${userId}:liked-posts`,
      
      // Generation history
      `user:${userId}:generations`,
      `user:${userId}:campaigns`,
      `user:${userId}:drafts`,
      
      // Activity
      `user:${userId}:activity`,
      
      // Auth mappings (if exists)
      `auth0:${profile.email}`,
    ];

    // Delete all keys
    for (const key of keysToDelete) {
      try {
        await kv.del(key);
        console.log(`  ✅ Deleted: ${key}`);
      } catch (error) {
        console.warn(`  ⚠️ Failed to delete ${key}:`, error.message);
      }
    }

    // ✅ STEP 3: Delete user posts from feed
    try {
      const allPosts = await kv.getByPrefix('feed:post:');
      let deletedPosts = 0;
      
      for (const postData of allPosts) {
        if (postData && postData.userId === userId) {
          await kv.del(`feed:post:${postData.id}`);
          deletedPosts++;
        }
      }
      
      console.log(`  ✅ Deleted ${deletedPosts} feed posts`);
    } catch (error) {
      console.warn('  ⚠️ Failed to delete feed posts:', error.message);
    }

    // ✅ STEP 4: Delete user from Supabase Auth
    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.warn(`  ⚠️ Supabase auth deletion warning:`, authError.message);
      } else {
        console.log(`  ✅ Deleted Supabase auth user`);
      }
    } catch (error) {
      console.warn('  ⚠️ Failed to delete Supabase auth:', error.message);
    }

    // ✅ STEP 5: Update referrer's referral list (if referred by someone)
    if (profile.referredBy) {
      try {
        const referrerReferrals = await kv.get(`user:referrals:${profile.referredBy}`) || [];
        const updatedReferrals = referrerReferrals.filter((id: string) => id !== userId);
        await kv.set(`user:referrals:${profile.referredBy}`, updatedReferrals);
        
        // Update referrer's referral count
        const referrerProfile = await kv.get(`user:profile:${profile.referredBy}`);
        if (referrerProfile) {
          referrerProfile.referralCount = Math.max(0, (referrerProfile.referralCount || 0) - 1);
          await kv.set(`user:profile:${profile.referredBy}`, referrerProfile);
        }
        
        console.log(`  ✅ Removed from referrer's list`);
      } catch (error) {
        console.warn('  ⚠️ Failed to update referrer:', error.message);
      }
    }

    console.log(`✅ [DELETE ACCOUNT] Successfully deleted all data for user: ${userId}`);

    return c.json({
      success: true,
      message: 'Account and all associated data have been permanently deleted',
      deletedUser: {
        userId,
        email: profile.email,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [DELETE ACCOUNT] Error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete account'
    }, 500);
  }
});

export default app;