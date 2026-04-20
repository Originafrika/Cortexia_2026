import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, postId } = body;

    console.log('[CreatorsTrackPost] Tracking post:', body);

    return NextResponse.json({
      success: true,
      message: 'Post tracked'
    });
  } catch (error) {
    console.error('[CreatorsTrackPost] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track post' },
      { status: 500 }
    );
  }
}