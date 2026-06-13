import { db } from '../../src/lib/db';
import { users } from '../../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { token, type, state, error, provider } = req.query;
      const userType = type || 'individual';

      const host = req.headers.host;
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const baseUrl = `${protocol}://${host}`;

      // Handle OAuth errors
      if (error) {
        console.error('[AuthCallback] OAuth error:', error);
        return res.redirect(`${baseUrl}/login?error=oauth_error`);
      }

      if (!token) {
        return res.redirect(`${baseUrl}/login?error=missing_token`);
      }

      // Decipher JWT to get user info
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const { email, name, sub: neonUserId } = payload;

        if (!email) {
          return res.redirect(`${baseUrl}/login?error=no_email`);
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
            type: userType as any,
            premiumBalance: 0,
            freeBalance: 25,
            freeBalanceResetAt: now,
            createdAt: now,
            updatedAt: now,
          });

          console.log('[AuthCallback] Created new user:', userId, email);
        }

        // Redirect to frontend
        return res.redirect(`${baseUrl}/feed?token=${token}&userId=${userId}`);
      } catch (parseError) {
        console.error('[AuthCallback] Token parse error:', parseError);
        return res.redirect(`${baseUrl}/login?error=invalid_token`);
      }
    } catch (error) {
      console.error('[AuthCallback] Error:', error);
      const host = req.headers.host;
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const baseUrl = `${protocol}://${host}`;
      return res.redirect(`${baseUrl}/login?error=callback_failed`);
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
