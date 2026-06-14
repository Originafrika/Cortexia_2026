import { db } from '../../src/lib/db';
import { users } from '../../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { token, type, error } = req.query;
      const userType = type || 'individual';

      const host = req.headers.host;
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const baseUrl = `${protocol}://${host}`;

      if (error) {
        return res.redirect(`${baseUrl}/login?error=oauth_error`);
      }

      if (!token) {
        return res.redirect(`${baseUrl}/login?error=missing_token`);
      }

      // Sync user to database
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const { email, name, sub: neonUserId } = payload;

        if (!email) {
          return res.redirect(`${baseUrl}/login?error=no_email`);
        }

        const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);

        let userId: string;
        if (existing.length > 0) {
          userId = existing[0].id;
        } else {
          userId = neonUserId || uuidv4();
          await db.insert(users).values({
            id: userId,
            email,
            name: name || email.split('@')[0],
            type: userType as any,
            premiumBalance: 0,
            freeBalance: 25,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        // Return to frontend callback component
        return res.redirect(`${baseUrl}/auth-callback?token=${token}&userId=${userId}`);
      } catch (e) {
        return res.redirect(`${baseUrl}/login?error=sync_failed`);
      }
    } catch (error) {
      return res.redirect(`/login?error=callback_failed`);
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
