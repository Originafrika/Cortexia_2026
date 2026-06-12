import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { creations } from '../../lib/db/schema';
import { desc, eq, sql as drizzleSql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('[Feed API] Querying creations, offset:', offset, 'limit:', limit);
    
    const results = await db.select()
      .from(creations)
      .where(eq(creations.isPublic, true))
      .orderBy(desc(creations.createdAt))
      .limit(limit)
      .offset(offset);
    
    return NextResponse.json({
      success: true,
      creations: results.map((c) => ({
        id: c.id,
        userId: c.userId,
        username: c.username,
        userAvatar: c.userAvatar,
        type: c.type,
        assetUrl: c.assetUrl,
        thumbnailUrl: c.thumbnailUrl,
        caption: c.caption,
        prompt: c.prompt,
        model: c.model,
        likes: c.likes,
        comments: c.comments,
        remixes: c.remixes,
        createdAt: c.createdAt
      })),
      pagination: {
        offset,
        limit,
        hasMore: results.length === limit
      }
    });
  } catch (error) {
    console.error('[Feed API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch feed'
    }, { status: 500 });
  }
}
