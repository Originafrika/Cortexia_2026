import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { users } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

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

    const u = user[0];
    
    // Generate referral code from user ID
    const referralCode = u.id.slice(0, 8).toUpperCase();

    return NextResponse.json({
      success: true,
      userId: u.id,
      email: u.email,
      displayName: u.name || u.email.split('@')[0],
      username: u.name?.toLowerCase().replace(/\s+/g, '') || u.email.split('@')[0],
      accountType: u.type,
      onboardingComplete: false,
      referralCode,
      createdAt: u.createdAt,
      profile: {
        premiumBalance: u.premiumBalance,
        freeBalance: u.freeBalance
      }
    });
  } catch (error) {
    console.error('[Profile] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}