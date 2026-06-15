import { db } from '../src/lib/db';
import { users } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'User ID required' });
    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user.length === 0) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json({
        success: true,
        credits: {
          premium: user[0].premiumBalance || 0,
          free: user[0].freeBalance || 0,
          total: (user[0].premiumBalance || 0) + (user[0].freeBalance || 0)
        }
      });
    } catch (e: any) {
      console.error('[Credits API] Error:', e);
      return res.status(500).json({ error: 'Database connection failed', details: e.message });
    }
  } else if (req.method === 'POST') {
    const { userId, amount, type } = req.body;
    if (!userId || amount === undefined) return res.status(400).json({ error: 'User ID and amount required' });
    const creditColumn = type === 'premium' ? 'premiumBalance' : 'freeBalance';
    try {
      // Get current user to calculate new balance
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user.length === 0) return res.status(404).json({ error: 'User not found' });

      const currentVal = user[0][creditColumn] || 0;
      const newVal = currentVal + amount;

      await db.update(users).set({ [creditColumn]: newVal }).where(eq(users.id, userId));
      return res.status(200).json({ success: true, newBalance: newVal });
    } catch (e: any) {
      console.error('[Credits API] Update Error:', e);
      return res.status(500).json({ error: 'Failed to update credits', details: e.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
