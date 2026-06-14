import { db } from '../../src/lib/db';
import { users } from '../../src/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      const { neonUserId, email, name, type } = req.body;
      if (!email) return res.status(400).json({ error: 'Email required' });

      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing.length > 0) return res.status(200).json({ success: true, user: existing[0] });

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

      return res.status(200).json({ success: true, user: newUser[0] });
    } catch (error) {
      console.error('[SyncUser] Error:', error);
      return res.status(500).json({ error: 'Failed to sync user' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
