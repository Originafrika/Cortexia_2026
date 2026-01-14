/**
 * Auth0 Token Verification Service
 * Vérifie les tokens Auth0 et crée des sessions Supabase
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

interface Auth0User {
  sub: string;        // Auth0 user ID (e.g., "google-oauth2|123456")
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

interface VerifyAuth0TokenRequest {
  idToken: string;
  accessToken: string;
  userType: 'individual' | 'enterprise' | 'developer';
  name?: string;
  // Enterprise specific
  companyName?: string;
  industry?: string;
  companySize?: string;
  // Developer specific
  useCase?: string;
  githubUsername?: string;
}

/**
 * Decode JWT without verification (for development)
 * En production, utilisez jsonwebtoken ou jose pour vérifier la signature
 */
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('JWT decode error:', error);
    throw new Error('Failed to decode JWT');
  }
}

/**
 * Verify Auth0 token and get user info
 * TODO: Add proper signature verification using Auth0 JWKS
 */
async function verifyAuth0Token(idToken: string): Promise<Auth0User> {
  try {
    // Decode the ID token
    const payload = decodeJWT(idToken);
    
    // Basic validation
    if (!payload.sub || !payload.email) {
      throw new Error('Invalid token: missing required fields');
    }
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }
    
    // Check issuer (should be your Auth0 domain)
    const expectedIssuer = `https://${Deno.env.get('AUTH0_DOMAIN')}/`;
    if (payload.iss !== expectedIssuer) {
      throw new Error('Invalid token issuer');
    }
    
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture,
      email_verified: payload.email_verified || false,
    };
  } catch (error: any) {
    console.error('Token verification error:', error);
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

/**
 * Get or create Supabase user from Auth0 user
 */
async function getOrCreateSupabaseUser(
  auth0User: Auth0User,
  userType: 'individual' | 'enterprise' | 'developer',
  additionalData: Partial<VerifyAuth0TokenRequest>
): Promise<{ userId: string; accessToken: string; isNewUser: boolean }> {
  
  // Check if user already exists by auth0 ID
  const existingUserData = await kv.get(`auth0:${auth0User.sub}`);
  
  if (existingUserData) {
    // User exists, get Supabase user
    const userId = existingUserData as string;
    const userData = await kv.get(`user:${userId}`);
    
    if (userData) {
      // Generate new session token
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: auth0User.email,
      });
      
      if (sessionError || !sessionData) {
        throw new Error('Failed to generate session');
      }
      
      return {
        userId,
        accessToken: sessionData.properties.access_token || '',
        isNewUser: false,
      };
    }
  }
  
  // User doesn't exist, create new user
  console.log(`Creating new ${userType} user from Auth0:`, auth0User.email);
  
  // Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: auth0User.email,
    email_confirm: true,
    user_metadata: {
      name: additionalData.name || auth0User.name,
      provider: 'auth0',
      auth0_id: auth0User.sub,
      picture: auth0User.picture,
    },
  });
  
  if (authError || !authData.user) {
    // Check if user already exists
    if (authError?.message?.includes('already been registered')) {
      // Try to find existing user by email
      const existingUser = await kv.getByPrefix('user:');
      const foundUser = existingUser.find((u: any) => u.value.email === auth0User.email);
      
      if (foundUser) {
        // Link Auth0 ID to existing user
        await kv.set(`auth0:${auth0User.sub}`, foundUser.value.id);
        
        // Generate session
        const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: auth0User.email,
        });
        
        if (sessionError || !sessionData) {
          throw new Error('Failed to generate session');
        }
        
        return {
          userId: foundUser.value.id,
          accessToken: sessionData.properties.access_token || '',
          isNewUser: false,
        };
      }
    }
    
    throw new Error(authError?.message || 'Failed to create user');
  }
  
  const userId = authData.user.id;
  
  // Create user profile in KV store
  const userProfile: any = {
    id: userId,
    email: auth0User.email,
    name: additionalData.name || auth0User.name,
    type: userType,
    provider: 'auth0',
    auth0Id: auth0User.sub,
    picture: auth0User.picture,
    createdAt: new Date().toISOString(),
    credits: userType === 'individual' ? 25 : 0,
    totalCreditsEarned: 0,
    totalCreditsSpent: 0,
  };
  
  // Add type-specific fields
  if (userType === 'enterprise') {
    userProfile.companyName = additionalData.companyName || '';
    userProfile.industry = additionalData.industry || '';
    userProfile.companySize = additionalData.companySize || '';
    userProfile.coconutUsage = {
      totalCampaigns: 0,
      totalGenerations: 0,
      lastUsed: null,
    };
  } else if (userType === 'developer') {
    userProfile.useCase = additionalData.useCase || '';
    userProfile.githubUsername = additionalData.githubUsername || '';
    userProfile.apiKeys = [];
    userProfile.apiUsage = {
      totalRequests: 0,
      last30Days: 0,
      quotaLimit: 10000,
    };
    
    // Generate initial API key
    const apiKey = `crtx_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    userProfile.apiKeys.push({
      key: apiKey,
      name: 'Default Key',
      createdAt: new Date().toISOString(),
      active: true,
    });
  } else if (userType === 'individual') {
    userProfile.creatorStats = {
      totalCreations: 0,
      totalLikes: 0,
      totalRemixes: 0,
      monthlyChallenge: {
        count: 0,
        lastCompletedMonth: null,
      },
      streakDays: 0,
      lastCreationDate: null,
    };
    userProfile.originsBalance = 0;
    userProfile.originsHistory = [];
  }
  
  // Save to KV store
  await kv.set(`user:${userId}`, userProfile);
  
  // Create mapping from Auth0 ID to Supabase ID
  await kv.set(`auth0:${auth0User.sub}`, userId);
  
  // Generate session token
  const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: auth0User.email,
  });
  
  if (sessionError || !sessionData) {
    throw new Error('Failed to generate session');
  }
  
  return {
    userId,
    accessToken: sessionData.properties.access_token || '',
    isNewUser: true,
  };
}

/**
 * Main verification function
 */
export async function verifyAuth0AndCreateSession(
  request: VerifyAuth0TokenRequest
): Promise<{
  userId: string;
  accessToken: string;
  user: any;
  isNewUser: boolean;
}> {
  // Verify Auth0 token
  const auth0User = await verifyAuth0Token(request.idToken);
  
  // Get or create Supabase user
  const { userId, accessToken, isNewUser } = await getOrCreateSupabaseUser(
    auth0User,
    request.userType,
    request
  );
  
  // Get full user profile
  const userProfile = await kv.get(`user:${userId}`);
  
  return {
    userId,
    accessToken,
    user: userProfile,
    isNewUser,
  };
}
