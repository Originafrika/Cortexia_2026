import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { users } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { authRateLimit } from '../../../lib/middleware/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    const rateLimitResult = await authRateLimit(ip);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez plus tard.', remaining: 0 },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': '60'
          }
        }
      );
    }

    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create user (in production, hash password and use Neon Auth)
    const userId = crypto.randomUUID();
    const now = new Date();

    await db.insert(users).values({
      id: userId,
      email,
      name: name || email.split('@')[0],
      type: 'individual',
      premiumBalance: 0, // ✅ NEW USERS: NO paid credits
      freeBalance: 25,
      freeBalanceResetAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        name: name || email.split('@')[0],
        createdAt: now,
        updatedAt: now,
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Signup failed' },
      { status: 500 }
    );
  }
}