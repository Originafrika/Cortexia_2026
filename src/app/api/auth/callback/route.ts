import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { users } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const provider = searchParams.get('provider') || 'unknown';

    // Handle OAuth errors
    if (error) {
      console.error('[AuthCallback] OAuth error:', error);
      return NextResponse.redirect(new URL('/login?error=oauth_error', request.url));
    }

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=missing_token', request.url));
    }

    // Exchange token for session - get user info from Neon Auth
    // The token is already validated by the frontend, we just need to create/update local user
    
    // For now, we'll decode the JWT to get user info (in production, verify with JWKS)
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const { email, name, sub: neonUserId } = payload;

      if (!email) {
        return NextResponse.redirect(new URL('/login?error=no_email', request.url));
      }

      // Check if user exists
      const existing = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      let userId: string;
      if (existing.length > 0) {
        userId = existing[0].id;
        console.log('[AuthCallback] Existing user:', userId, email);
      } else {
        // Create new user
        userId = neonUserId || uuidv4();
        const now = new Date();

        await db.insert(users).values({
          id: userId,
          email,
          name: name || email.split('@')[0],
          type: 'individual',
          premiumBalance: 0, // ✅ NEW USERS: NO paid credits
          freeBalance: 25,
          freeBalanceResetAt: now,
          createdAt: now,
          updatedAt: now,
        });

        console.log('[AuthCallback] Created new user:', userId, email);
      }

      // Redirect to frontend with session token
      const redirectUrl = new URL('/feed', request.url);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('userId', userId);
      
      return NextResponse.redirect(redirectUrl);
    } catch (parseError) {
      console.error('[AuthCallback] Token parse error:', parseError);
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }
  } catch (error) {
    console.error('[AuthCallback] Error:', error);
    return NextResponse.redirect(new URL('/login?error=callback_failed', request.url));
  }
}