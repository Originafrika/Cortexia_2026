import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    console.log('[Comments] Loading for post:', postId);

    return NextResponse.json({
      success: true,
      comments: []
    });
  } catch (error) {
    console.error('[Comments] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load comments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const body = await request.json();
    const { userId, username, text, userAvatar } = body;

    console.log('[Comments] Adding comment to:', postId);

    return NextResponse.json({
      success: true,
      comment: {
        id: `comment-${Date.now()}`,
        postId,
        userId,
        username,
        userAvatar,
        text,
        likes: 0,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Comments] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to add comment' }, { status: 500 });
  }
}