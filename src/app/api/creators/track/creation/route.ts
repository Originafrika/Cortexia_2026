import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, creationId, postId } = body;

    console.log('[CreatorsTrack] Tracking:', body);

    return NextResponse.json({
      success: true,
      message: 'Creation tracked'
    });
  } catch (error) {
    console.error('[CreatorsTrack] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  return NextResponse.json({
    success: true,
    stats: {
      totalCreations: 0,
      totalPosts: 0,
      totalLikes: 0
    }
  });
}