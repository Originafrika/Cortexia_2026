import { db } from '../../src/lib/db';
import { users } from '../../src/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
  // Add CORS headers for direct frontend calls
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { neonUserId, email, name, type } = req.body;
      if (!email) return res.status(400).json({ error: 'Email required' });

      console.log(`[SyncUser] Syncing user: ${email} (${type})`);

      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (existing.length > 0) {
        console.log(`[SyncUser] Existing user found: ${existing[0].id}`);
        return res.status(200).json({ success: true, user: existing[0] });
      }

      const userId = neonUserId || crypto.randomUUID();
      const now = new Date();

      console.log(`[SyncUser] Creating new user profile for: ${email}`);

      const newUser = await db.insert(users).values({
        id: userId,
        email,
        name: name || email.split('@')[0],
        type: (type || 'individual') as any,
        premiumBalance: 0,
        freeBalance: 25,
        createdAt: now,
        updatedAt: now,
      }).returning();

      return res.status(200).json({ success: true, user: newUser[0] });
    } catch (error: any) {
      console.error('[SyncUser] Critical Error:', error);
      return res.status(500).json({ error: 'Failed to sync user to database', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
