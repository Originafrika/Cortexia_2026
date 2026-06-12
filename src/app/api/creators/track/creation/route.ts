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

    // Update or insert creator stats
    await db.transaction(async (tx) => {
      const stats = await tx.select()
        .from(creatorStats)
        .where(and(eq(creatorStats.userId, userId), eq(creatorStats.month, currentMonth)))
        .limit(1);

      if (stats.length > 0) {
        await tx.update(creatorStats)
          .set({
            generationsCount: (stats[0].generationsCount || 0) + 1,
            updatedAt: new Date()
          })
          .where(eq(creatorStats.id, stats[0].id));
      } else {
        await tx.insert(creatorStats).values({
          id: crypto.randomUUID(),
          userId,
          month: currentMonth,
          generationsCount: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Sync with users table for easy access
      await tx.update(users)
        .set({
          currentMonthGenerations: sql`${users.currentMonthGenerations} + 1`,
          statsMonth: currentMonth,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Check Rule of 60 (if user is not yet creator)
      const user = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user.length > 0 && !user[0].isCreator) {
          if (user[0].currentMonthGenerations >= 60) {
              await tx.update(users)
                .set({ isCreator: true, creatorSince: new Date() })
                .where(eq(users.id, userId));
          }
      }
    });

    return NextResponse.json({ success: true, message: 'Creation tracked' });
  } catch (error) {
    console.error('[CreatorsTrack] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to track' }, { status: 500 });
  }
}
