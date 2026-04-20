import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const body = await request.json();
    
    console.log('[FeedLike] Liked post:', postId, 'by user:', body.userId);
    
    return NextResponse.json({
      success: true,
      likes: 1
    });
  } catch (error) {
    console.error('[FeedLike] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to like post' }, { status: 500 });
  }
}