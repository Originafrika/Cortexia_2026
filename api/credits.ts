import { db } from '../src/lib/db';
import { users } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const user = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({
        success: true,
        credits: {
          premium: user[0].premiumBalance,
          free: user[0].freeBalance,
          total: user[0].premiumBalance + user[0].freeBalance
        }
      });
    } catch (error) {
      console.error('[Credits] GET Error:', error);
      return res.status(500).json({ error: 'Failed to get credits' });
    }
  } else if (req.method === 'POST') {
    try {
      const { userId, amount, type, reason } = req.body;

      if (!userId || amount === undefined) {
        return res.status(400).json({ error: 'User ID and amount required' });
      }

      const validTypes = ['premium', 'free'];
      const creditType = type || 'free';

      if (!validTypes.includes(creditType)) {
        return res.status(400).json({ error: 'Invalid credit type' });
      }

      const user = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const currentBalance = creditType === 'premium'
        ? user[0].premiumBalance
        : user[0].freeBalance;

      const newBalance = currentBalance + amount;

      if (creditType === 'premium') {
        await db.update(users)
          .set({ premiumBalance: newBalance })
          .where(eq(users.id, userId));
      } else {
        await db.update(users)
          .set({ freeBalance: newBalance })
          .where(eq(users.id, userId));
      }

      console.log(`[Credits] ${creditType} credits updated for ${userId}: ${currentBalance} -> ${newBalance}`);

      return res.status(200).json({
        success: true,
        credits: {
          premium: creditType === 'premium' ? newBalance : user[0].premiumBalance,
          free: creditType === 'free' ? newBalance : user[0].freeBalance
        },
        transaction: {
          amount,
          type: creditType,
          reason,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('[Credits] POST Error:', error);
      return res.status(500).json({ error: 'Failed to update credits' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
