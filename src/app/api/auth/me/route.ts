import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { users } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Decode token (in production, verify JWT properly)
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const [userId] = decoded.split(':');

      if (!userId) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
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
        user: {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          type: user[0].type,
          premiumBalance: user[0].premiumBalance,
          freeBalance: user[0].freeBalance,
          createdAt: user[0].createdAt,
        }
      });
    } catch {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}