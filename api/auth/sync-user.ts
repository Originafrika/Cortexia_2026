import { db } from '../../src/lib/db';
import { users } from '../../src/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      const { neonUserId, email, name, type } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email required' });
      }

      // Check if user already exists
      const existing = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing.length > 0) {
        return res.status(200).json({
          success: true,
          user: {
            id: existing[0].id,
            email: existing[0].email,
            name: existing[0].name,
            type: existing[0].type,
            premiumBalance: existing[0].premiumBalance,
            freeBalance: existing[0].freeBalance,
            createdAt: existing[0].createdAt,
          }
        });
      }

      // Create new user
      const userId = neonUserId || crypto.randomUUID();
      const now = new Date();

      const newUser = await db.insert(users).values({
        id: userId,
        email,
        name: name || email.split('@')[0],
        type: type || 'individual',
        premiumBalance: 0,
        freeBalance: 25,
        freeBalanceResetAt: now,
        createdAt: now,
        updatedAt: now,
      }).returning();

      console.log('[SyncUser] Created new user:', newUser[0].id, email);

      return res.status(200).json({
        success: true,
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          name: newUser[0].name,
          type: newUser[0].type,
          premiumBalance: newUser[0].premiumBalance,
          freeBalance: newUser[0].freeBalance,
          createdAt: newUser[0].createdAt,
        }
      });
    } catch (error) {
      console.error('[SyncUser] Error:', error);
      return res.status(500).json({ error: 'Failed to sync user' });
    }
  } else if (req.method === 'GET') {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: 'Email required' });
      }

      const existing = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: existing[0].id,
          email: existing[0].email,
          name: existing[0].name,
          type: existing[0].type,
          premiumBalance: existing[0].premiumBalance,
          freeBalance: existing[0].freeBalance,
        }
      });
    } catch (error) {
      console.error('[SyncUser] GET Error:', error);
      return res.status(500).json({ error: 'Failed to get user' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
