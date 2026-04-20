import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    console.log('[StorageList] Loading for user:', userId);

    return NextResponse.json({
      success: true,
      data: {
        uploads: [],
        totalSize: 0
      }
    });
  } catch (error) {
    console.error('[StorageList] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load uploads' }, { status: 500 });
  }
}