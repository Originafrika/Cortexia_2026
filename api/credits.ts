import { db } from '../src/lib/db';
import { users } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'User ID required' });
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ success: true, credits: { premium: user[0].premiumBalance, free: user[0].freeBalance } });
  } else if (req.method === 'POST') {
    const { userId, amount, type } = req.body;
    if (!userId || amount === undefined) return res.status(400).json({ error: 'User ID and amount required' });
    const creditType = type === 'premium' ? 'premiumBalance' : 'freeBalance';
    await db.update(users).set({ [creditType]: amount }).where(eq(users.id, userId));
    return res.status(200).json({ success: true });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
