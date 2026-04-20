import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    console.log('[StorageQuota] Loading for user:', userId);

    return NextResponse.json({
      success: true,
      data: {
        used: 0,
        total: 1000000000,
        percentage: 0
      }
    });
  } catch (error) {
    console.error('[StorageQuota] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load quota' }, { status: 500 });
  }
}