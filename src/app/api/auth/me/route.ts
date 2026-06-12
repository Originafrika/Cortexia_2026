import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { users } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { jwtVerify, createRemoteJWKSet } from 'jose';

const NEON_AUTH_JWKS_URL = process.env.NEON_AUTH_JWKS_URL;

const JWKS = NEON_AUTH_JWKS_URL ? createRemoteJWKSet(new URL(NEON_AUTH_JWKS_URL)) : null;

export async function GET(request: NextRequest) {
  try {
    if (!JWKS) {
      console.error('[API Me] Missing NEON_AUTH_JWKS_URL');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token with Neon Auth JWKS
    const { payload } = await jwtVerify(token, JWKS, {
      algorithms: ['RS256'],
    });

    const neonUserId = payload.sub as string;

    const user = await db.select()
      .from(users)
      .where(eq(users.id, neonUserId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found in local database' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
        type: user[0].type,
        premiumBalance: user[0].premiumBalance,
        freeBalance: user[0].freeBalance,
        createdAt: user[0].createdAt,
      }
    });
  } catch (error) {
    console.error('[API Me] Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
