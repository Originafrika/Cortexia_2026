import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { creations } from '../../../lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, username, userAvatar, type, assetUrl, thumbnailUrl, prompt, caption, model, isPublic, parentCreationId, metadata } = body;

    if (!userId || !assetUrl) {
      return NextResponse.json(
        { success: false, error: 'User ID and asset URL required' },
        { status: 400 }
      );
    }

    const creationId = crypto.randomUUID();

    await db.insert(creations).values({
      id: creationId,
      userId,
      username,
      userAvatar,
      type: type || 'image',
      assetUrl,
      thumbnailUrl,
      prompt,
      caption,
      model,
      isPublic: isPublic !== undefined ? isPublic : true,
      parentCreationId,
      metadata: metadata || {},
      createdAt: new Date(),
    });

    console.log('[FeedPublish] ✅ Published to feed:', creationId);

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
