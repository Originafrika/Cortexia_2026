import { db } from '../../src/lib/db';
import { users, creations } from '../../src/lib/db/schema';
import { eq, count, sum } from 'drizzle-orm';
import { CREATOR_TIERS } from '../../src/lib/coconut/model-selector';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: 'User ID required' });

      // 1. Get user profile
      const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (userResult.length === 0) return res.status(404).json({ error: 'User not found' });
      const user = userResult[0];

      // 2. Calculate actual stats from creations table
      const statsResult = await db.select({
        postCount: count(creations.id),
        totalLikes: sum(creations.likes)
      })
      .from(creations)
      .where(eq(creations.userId, userId));

      const postCount = Number(statsResult[0].postCount) || 0;
      const totalLikes = Number(statsResult[0].totalLikes) || 0;

      // 3. Determine Tier
      const isEnterprise = user.type === 'enterprise_admin' || user.type === 'enterprise_member';

      let tier = 'standard';
      let hasAccess = isEnterprise;
      let maxGenerations = isEnterprise ? -1 : 0;

      if (isEnterprise) {
        tier = 'enterprise';
      } else if (postCount >= CREATOR_TIERS.topCreator.reqPosts && totalLikes >= CREATOR_TIERS.topCreator.reqLikes) {
        tier = 'topCreator';
        hasAccess = true;
        maxGenerations = 3;
      }

      return res.status(200).json({
        success: true,
        tier,
        hasCoconutAccess: hasAccess,
        isCreator: tier !== 'standard',
        accountType: user.type,
        stats: {
          posts: postCount,
          likes: totalLikes,
          requiredPosts: CREATOR_TIERS.topCreator.reqPosts,
          requiredLikes: CREATOR_TIERS.topCreator.reqLikes
        },
        coconutGenerationsRemaining: maxGenerations,
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
