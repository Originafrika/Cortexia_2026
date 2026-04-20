import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { users } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { neonUserId, email, name, type } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      // Return existing user
      return NextResponse.json({
        success: true,
        user: {
          id: existing[0].id,
          email: existing[0].email,
          name: existing[0].name,
          type: existing[0].type,
          premiumBalance: existing[0].premiumBalance,
          freeBalance: existing[0].freeBalance,
          createdAt: existing[0].createdAt,
        }
      });
    }

    // Create new user
    const userId = neonUserId || crypto.randomUUID();
    const now = new Date();

    const newUser = await db.insert(users).values({
      id: userId,
      email,
      name: name || email.split('@')[0],
      type: type || 'individual',
      premiumBalance: 0, // ✅ NEW USERS: NO paid credits - only free tier
      freeBalance: 25,
      freeBalanceResetAt: now,
      createdAt: now,
      updatedAt: now,
    }).returning();

    console.log('[SyncUser] Created new user:', newUser[0].id, email);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        type: newUser[0].type,
        premiumBalance: newUser[0].premiumBalance,
        freeBalance: newUser[0].freeBalance,
        createdAt: newUser[0].createdAt,
      }
    });
  } catch (error) {
    console.error('[SyncUser] Error:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      );
    }

    const existing = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: existing[0].id,
        email: existing[0].email,
        name: existing[0].name,
        type: existing[0].type,
        premiumBalance: existing[0].premiumBalance,
        freeBalance: existing[0].freeBalance,
      }
    });
  } catch (error) {
    console.error('[SyncUser] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}