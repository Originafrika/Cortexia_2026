import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, username, userAvatar, type, assetUrl, caption, model } = body;

    if (!userId || !assetUrl) {
      return NextResponse.json(
        { success: false, error: 'User ID and asset URL required' },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);
    
    const creationId = crypto.randomUUID();
    const now = new Date();

    console.log('[FeedPublish] Inserting creation:', {
      creationId,
      userId,
      username,
      assetUrl,
      caption,
      model
    });

    await sql.query(`
      INSERT INTO creations (id, user_id, username, user_avatar, asset_url, caption, model, likes, comments, remixes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, 0, $8)
    `, [creationId, userId, username, userAvatar, assetUrl, caption, model, now]);

    return NextResponse.json({
      success: true,
      creationId
    });
  } catch (error) {
    console.error('[FeedPublish] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish to feed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}