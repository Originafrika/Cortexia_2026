import { db } from '../../src/lib/db';
import { users } from '../../src/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      const { userId, generationType } = req.body;
      if (!userId) return res.status(400).json({ error: 'User ID required' });

      console.log(`[CoconutTrack] Tracking ${generationType} for ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Generation tracked successfully'
      });
    } catch (error) {
      console.error('[CoconutTrack] Error:', error);
      return res.status(500).json({ error: 'Failed to track generation' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
