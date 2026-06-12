import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { creatorStats, users } from '../../../../../lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    await db.transaction(async (tx) => {
      const stats = await tx.select()
        .from(creatorStats)
        .where(and(eq(creatorStats.userId, userId), eq(creatorStats.month, currentMonth)))
        .limit(1);

      if (stats.length > 0) {
        await tx.update(creatorStats)
          .set({
            postsPublished: (stats[0].postsPublished || 0) + 1,
            updatedAt: new Date()
          })
          .where(eq(creatorStats.id, stats[0].id));
      } else {
        await tx.insert(creatorStats).values({
          id: crypto.randomUUID(),
          userId,
          month: currentMonth,
          postsPublished: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Sync with users table
      await tx.update(users)
        .set({
          currentMonthPublications: sql`${users.currentMonthPublications} + 1`,
          statsMonth: currentMonth,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    });

    return NextResponse.json({ success: true, message: 'Post tracked' });
  } catch (error) {
    console.error('[CreatorsTrackPost] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to track post' }, { status: 500 });
  }
}
