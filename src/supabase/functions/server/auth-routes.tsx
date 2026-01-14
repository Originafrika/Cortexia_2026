import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import { verifyAuth0AndCreateSession } from './auth0-verification.ts';

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper: Generate unique referral code
function generateReferralCode(name: string): string {
  const prefix = name.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${random}`;
}

// Helper: Generate API key for developers
function generateApiKey(): string {
  return `ctx_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * SIGNUP: Individual
 */
app.post('/signup-individual', async (c) => {
  console.log('📝 Signup Individual endpoint called');
  try {
    const body = await c.req.json();
    const { email, password, name, referralCode } = body;
    
    console.log('📧 Signup request:', { email, name, hasReferralCode: !!referralCode });

    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // Auto-confirm since email server not configured
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      
      // ✅ Handle email already exists
      if (authError.message?.includes('already been registered') || authError.code === 'email_exists') {
        return c.json({ 
          error: 'Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.' 
        }, 422);
      }
      
      return c.json({ error: authError?.message || 'Failed to create user' }, 500);
    }
    
    if (!authData.user) {
      return c.json({ error: 'Failed to create user' }, 500);
    }

    const userId = authData.user.id;

    // ✅ NEW: Create user profile via user-routes system
    const username = email.split('@')[0];
    
    // Call internal user creation (simulate POST /users/create)
    const createProfileResponse = await fetch(`http://localhost:8000/make-server-e55aa214/users/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email,
        username,
        displayName: name,
        referralCode: referralCode || null
      })
    }).catch(() => null);

    let profile = null;
    if (createProfileResponse && createProfileResponse.ok) {
      const data = await createProfileResponse.json();
      profile = data.profile;
      console.log('✅ User profile created via user-routes');
    } else {
      // Fallback: Create profile directly (same logic as user-routes.ts)
      console.warn('⚠️ Fallback: Creating profile directly');
      
      // Generate referral code
      const baseCode = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
      const userReferralCode = baseCode + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      // Validate referredBy
      let referredBy = null;
      if (referralCode) {
        const referrerId = await kv.get(`referral:code:${referralCode.toUpperCase()}`);
        if (referrerId) {
          referredBy = referrerId;
          
          // Update referrer stats
          const referrerProfile = await kv.get(`user:profile:${referrerId}`);
          if (referrerProfile) {
            const referrerReferrals = await kv.get(`user:referrals:${referrerId}`) || [];
            referrerReferrals.push(userId);
            await kv.set(`user:referrals:${referrerId}`, referrerReferrals);
            
            referrerProfile.referralCount = referrerReferrals.length;
            referrerProfile.updatedAt = new Date().toISOString();
            await kv.set(`user:profile:${referrerId}`, referrerProfile);
          }
        }
      }
      
      profile = {
        userId,
        email,
        username,
        displayName: name,
        avatar: '',
        bio: '',
        accountType: 'individual',
        referralCode: userReferralCode,
        referredBy,
        referredAt: referredBy ? new Date().toISOString() : null,
        referralEarnings: 0,
        referralCount: 0,
        freeCredits: 25,
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
      
      await kv.set(`user:profile:${userId}`, profile);
      await kv.set(`referral:code:${userReferralCode}`, userId);
      await kv.set(`user:referrals:${userId}`, []);
    }

    // Store legacy user data for compatibility
    await kv.set(`users:${userId}`, {
      email,
      type: 'individual',
      name,
      createdAt: new Date().toISOString(),
    });

    const accessToken = authData.user.id;

    return c.json({
      success: true,
      userId,
      accessToken,
      creditsAwarded: profile?.freeCredits || 25,
      referralCode: profile?.referralCode
    });
  } catch (error: any) {
    console.error('Signup individual error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

/**
 * SIGNUP: Enterprise
 */
app.post('/signup-enterprise', async (c) => {
  console.log('📝 Signup Enterprise endpoint called');
  try {
    const body = await c.req.json();
    const { email, password, name, companyName, industry, companySize, referralCode } = body;

    console.log('🏢 Signup request:', { email, name, companyName, hasReferralCode: !!referralCode });

    if (!email || !password || !name || !companyName || !industry || !companySize) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, companyName },
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      
      // ✅ Handle email already exists
      if (authError.message?.includes('already been registered') || authError.code === 'email_exists') {
        return c.json({ 
          error: 'Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.' 
        }, 422);
      }
      
      return c.json({ error: authError?.message || 'Failed to create user' }, 500);
    }
    
    if (!authData.user) {
      return c.json({ error: 'Failed to create user' }, 500);
    }

    const userId = authData.user.id;

    // ✅ NEW: Use modern user profile system (same as Auth0)
    const username = email.split('@')[0];
    const enterpriseReferralCode = generateReferralCode(companyName);
    
    // Check referral code and award bonus
    let referredBy = null;
    if (referralCode) {
      const referrerId = await kv.get(`referral:code:${referralCode.toUpperCase()}`);
      if (referrerId) {
        referredBy = referrerId;
        
        // Update referrer stats
        const referrerProfile = await kv.get(`user:profile:${referrerId}`);
        if (referrerProfile) {
          const referrerReferrals = await kv.get(`user:referrals:${referrerId}`) || [];
          referrerReferrals.push(userId);
          await kv.set(`user:referrals:${referrerId}`, referrerReferrals);
          
          referrerProfile.referralCount = referrerReferrals.length;
          referrerProfile.updatedAt = new Date().toISOString();
          await kv.set(`user:profile:${referrerId}`, referrerProfile);
        }
      }
    }
    
    // ✅ Create modern user profile
    const profile = {
      userId,
      email,
      username,
      displayName: name,
      avatar: '',
      bio: '',
      accountType: 'enterprise',
      referralCode: enterpriseReferralCode,
      referredBy,
      referredAt: referredBy ? new Date().toISOString() : null,
      referralEarnings: 0,
      referralCount: 0,
      freeCredits: 0, // Enterprise: no free credits
      paidCredits: 0,
      totalCreditsUsed: 0,
      hasCoconutAccess: true, // ✅ Enterprise gets immediate Coconut access
      topCreatorMonth: null,
      topCreatorSince: null,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      likesCount: 0,
      // ✅ Enterprise-specific fields
      companyName,
      industry,
      companySize,
      coconutUsage: {
        totalCampaigns: 0,
        totalGenerations: 0,
        lastUsed: null,
      },
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // ✅ Save to modern KV structure
    await kv.set(`user:${userId}`, profile); // Main user profile
    await kv.set(`user:profile:${userId}`, profile); // Duplicate for compatibility
    await kv.set(`referral:code:${enterpriseReferralCode}`, userId);
    await kv.set(`user:referrals:${userId}`, []);
    
    // ✅ CRITICAL DEBUG: Log what we just saved
    console.log(`✅ Enterprise profile saved for ${userId}:`, {
      accountType: profile.accountType,
      hasCoconutAccess: profile.hasCoconutAccess,
      companyName: profile.companyName,
      referralCode: enterpriseReferralCode,
    });

    // Store legacy user data for compatibility
    await kv.set(`users:${userId}`, {
      email,
      type: 'enterprise',
      name,
      createdAt: new Date().toISOString(),
    });

    const accessToken = authData.user.id;

    return c.json({
      success: true,
      userId,
      accessToken,
      referralCode: enterpriseReferralCode,
    });
  } catch (error: any) {
    console.error('Signup enterprise error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

/**
 * SIGNUP: Developer
 */
app.post('/signup-developer', async (c) => {
  console.log('📝 Signup Developer endpoint called');
  try {
    const body = await c.req.json();
    const { email, password, name, useCase, githubUsername, referralCode } = body;

    console.log('👨‍💻 Signup request:', { email, name, useCase, hasReferralCode: !!referralCode });

    if (!email || !password || !name || !useCase) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      
      // ✅ Handle email already exists
      if (authError.message?.includes('already been registered') || authError.code === 'email_exists') {
        return c.json({ 
          error: 'Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.' 
        }, 422);
      }
      
      return c.json({ error: authError?.message || 'Failed to create user' }, 500);
    }
    
    if (!authData.user) {
      return c.json({ error: 'Failed to create user' }, 500);
    }

    const userId = authData.user.id;

    // ✅ NEW: Use modern user profile system (same as Auth0)
    const username = email.split('@')[0];
    const apiKey = generateApiKey();
    const developerReferralCode = generateReferralCode(name);
    
    // Check referral code and award bonus
    let initialCredits = 100; // Base credits for developers
    let referredBy = null;
    
    if (referralCode) {
      const referrerId = await kv.get(`referral:code:${referralCode.toUpperCase()}`);
      if (referrerId) {
        initialCredits += 50; // Developer gets 50 bonus credits
        referredBy = referrerId;
        
        // Update referrer stats
        const referrerProfile = await kv.get(`user:profile:${referrerId}`);
        if (referrerProfile) {
          const referrerReferrals = await kv.get(`user:referrals:${referrerId}`) || [];
          referrerReferrals.push(userId);
          await kv.set(`user:referrals:${referrerId}`, referrerReferrals);
          
          referrerProfile.referralCount = referrerReferrals.length;
          referrerProfile.updatedAt = new Date().toISOString();
          await kv.set(`user:profile:${referrerId}`, referrerProfile);
        }
      }
    }
    
    // ✅ Create modern user profile
    const profile = {
      userId,
      email,
      username,
      displayName: name,
      avatar: '',
      bio: '',
      accountType: 'developer',
      referralCode: developerReferralCode,
      referredBy,
      referredAt: referredBy ? new Date().toISOString() : null,
      referralEarnings: 0,
      referralCount: 0,
      freeCredits: initialCredits, // Developer starts with 100 or 150 (with bonus)
      paidCredits: 0,
      totalCreditsUsed: 0,
      hasCoconutAccess: true, // ✅ Developer gets Coconut access
      topCreatorMonth: null,
      topCreatorSince: null,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      likesCount: 0,
      // ✅ Developer-specific fields
      useCase,
      githubUsername: githubUsername || null,
      apiKeys: [{
        key: apiKey,
        name: 'Default Key',
        createdAt: new Date().toISOString(),
        active: true,
      }],
      apiUsage: {
        totalRequests: 0,
        last30Days: 0,
        quotaLimit: 10000,
      },
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // ✅ Save to modern KV structure
    await kv.set(`user:${userId}`, profile); // Main user profile
    await kv.set(`user:profile:${userId}`, profile); // Duplicate for compatibility
    await kv.set(`referral:code:${developerReferralCode}`, userId);
    await kv.set(`user:referrals:${userId}`, []);
    
    // Store API key mapping
    await kv.set(`apikeys:${apiKey}`, {
      userId,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    });

    // Store legacy user data for compatibility
    await kv.set(`users:${userId}`, {
      email,
      type: 'developer',
      name,
      createdAt: new Date().toISOString(),
    });

    const accessToken = authData.user.id;

    return c.json({
      success: true,
      userId,
      accessToken,
      apiKey,
      creditsAwarded: initialCredits,
      referralCode: developerReferralCode,
    });
  } catch (error: any) {
    console.error('Signup developer error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

/**
 * LOGIN: Universal
 */
app.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Missing email or password' }, 400);
    }

    // Sign in with Supabase Auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error('Login error:', authError);
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const userId = authData.user.id;

    // Get user type
    const userData = await kv.get(`users:${userId}`);
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404);
    }

    const accessToken = authData.session?.access_token || userId;

    return c.json({
      success: true,
      userId,
      accessToken,
      userType: userData.type,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

/**
 * GET SESSION: Check if user is logged in
 */
app.get('/session', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ authenticated: false }, 401);
    }

    const accessToken = authHeader.split(' ')[1];

    // Verify with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ authenticated: false }, 401);
    }

    const userId = user.id;
    const userData = await kv.get(`users:${userId}`);

    if (!userData) {
      return c.json({ authenticated: false }, 404);
    }

    return c.json({
      authenticated: true,
      userId,
      userType: userData.type,
      email: userData.email,
      name: userData.name,
    });
  } catch (error: any) {
    console.error('Session check error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

/**
 * GET PROFILE: Fetch user profile data
 */
app.get('/profile/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const accessToken = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // ✅ Use modern profile system first
    const profile = await kv.get(`user:profile:${userId}`);
    
    if (!profile) {
      // ✅ Fallback to legacy system if needed
      const userData = await kv.get(`users:${userId}`);
      if (!userData) {
        return c.json({ error: 'User not found' }, 404);
      }
      
      // Return legacy format
      return c.json({
        success: true,
        userId: userId,
        email: userData.email,
        displayName: userData.name,
        username: userData.email?.split('@')[0],
        accountType: userData.type,
        onboardingComplete: userData.onboardingComplete || false,
        referralCode: null,
        createdAt: userData.createdAt,
      });
    }

    // ✅ Return modern profile format
    return c.json({
      success: true,
      userId: profile.userId,
      email: profile.email,
      displayName: profile.displayName,
      username: profile.username,
      accountType: profile.accountType,
      onboardingComplete: profile.onboardingComplete || false,
      referralCode: profile.referralCode,
      createdAt: profile.createdAt,
      // Include all profile data
      profile: profile,
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
});

/**
 * AUTH0: Verify token and create Supabase session
 */
app.post('/verify-auth0', async (c) => {
  console.log('🔐 Auth0 verification endpoint called');
  try {
    const body = await c.req.json();
    const { idToken, accessToken, userType, name, companyName, industry, companySize, useCase, githubUsername } = body;

    if (!idToken || !accessToken || !userType) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Verify Auth0 token and create/get Supabase user
    const result = await verifyAuth0AndCreateSession({
      idToken,
      accessToken,
      userType,
      name,
      companyName,
      industry,
      companySize,
      useCase,
      githubUsername,
    });

    console.log(`✅ Auth0 user verified: ${result.userId} (${userType})`);

    return c.json({
      success: true,
      userId: result.userId,
      accessToken: result.accessToken,
      user: result.user,
      isNewUser: result.isNewUser,
    });
  } catch (error: any) {
    console.error('Auth0 verification error:', error);
    return c.json({ error: error.message || 'Auth0 verification failed' }, 500);
  }
});

export default app;