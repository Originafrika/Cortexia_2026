import { db } from '../../src/lib/db';
import { users } from '../../src/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: 'User ID required' });

      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user.length === 0) return res.status(404).json({ error: 'User not found' });

      // Mock response for now to avoid breaking the frontend
      return res.status(200).json({
        success: true,
        hasCoconutAccess: true,
        isCreator: true,
        accountType: user[0].type || 'individual',
        coconutGenerationsRemaining: 1500,
        coconutGenerationsUsed: 0,
        expiresAt: new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()).toISOString()
      });
    } catch (error) {
      console.error('[CoconutAccess] Error:', error);
      return res.status(500).json({ error: 'Failed to fetch access data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
