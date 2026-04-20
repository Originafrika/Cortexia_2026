import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { users } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const user = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      credits: {
        premium: user[0].premiumBalance,
        free: user[0].freeBalance,
        total: user[0].premiumBalance + user[0].freeBalance
      }
    });
  } catch (error) {
    console.error('[Credits] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to get credits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, type, reason } = body;

    if (!userId || amount === undefined) {
      return NextResponse.json(
        { error: 'User ID and amount required' },
        { status: 400 }
      );
    }

    const validTypes = ['premium', 'free'];
    const creditType = type || 'free';
    
    if (!validTypes.includes(creditType)) {
      return NextResponse.json(
        { error: 'Invalid credit type' },
        { status: 400 }
      );
    }

    const user = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
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

    return NextResponse.json({
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
    return NextResponse.json(
      { error: 'Failed to update credits' },
      { status: 500 }
    );
  }
}