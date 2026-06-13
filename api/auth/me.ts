import { db } from '../../src/lib/db';
import { users } from '../../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import { jwtVerify, createRemoteJWKSet } from 'jose';

const NEON_AUTH_JWKS_URL = process.env.NEON_AUTH_JWKS_URL;

const JWKS = NEON_AUTH_JWKS_URL ? createRemoteJWKSet(new URL(NEON_AUTH_JWKS_URL)) : null;

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      if (!JWKS) {
        console.error('[API Me] Missing NEON_AUTH_JWKS_URL');
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const authHeader = req.headers['authorization'];
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
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
        return res.status(404).json({ error: 'User not found in local database' });
      }

      return res.status(200).json({
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
      return res.status(401).json({ error: 'Authentication failed' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
