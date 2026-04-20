import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { users } from '../../../lib/db/schema';
import { eq, gt } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminKey } = body;

    // Simple admin key check (in production, use proper auth)
    if (adminKey !== 'reset-all-credits-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find users with premium credits > 0
    const usersWithCredits = await db.select()
      .from(users)
      .where(gt(users.premiumBalance, 0));

    if (usersWithCredits.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users with premium credits found',
        updated: 0
      });
    }

    // Reset all premium balances to 0
    const updateResult = await db.update(users)
      .set({ premiumBalance: 0 })
      .where(gt(users.premiumBalance, 0))
      .returning();

    return NextResponse.json({
      success: true,
      message: `Reset premium credits for ${updateResult.length} users`,
      updated: updateResult.length,
      users: updateResult.map(u => ({ id: u.id, email: u.email, oldBalance: u.premiumBalance }))
    });
  } catch (error) {
    console.error('[AdminReset] Error:', error);
    return NextResponse.json(
      { error: 'Failed to reset credits' },
      { status: 500 }
    );
  }
}