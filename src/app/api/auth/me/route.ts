import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { users } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { jwtVerify, createRemoteJWKSet } from 'jose';

const NEON_AUTH_JWKS_URL = process.env.NEON_AUTH_JWKS_URL ||
  'https://ep-cool-meadow-an2f2vge.neonauth.c-6.us-east-1.aws.neon.tech/neondb/auth/.well-known/jwks.json';

const JWKS = createRemoteJWKSet(new URL(NEON_AUTH_JWKS_URL));

export async function GET(request: NextRequest) {
  try {
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
