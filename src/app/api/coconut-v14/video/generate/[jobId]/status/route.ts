import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    console.log('[VideoStatus] Checking:', jobId);

    // Return mock status
    return NextResponse.json({
      success: true,
      data: {
        jobId,
        status: 'pending',
        progress: 0,
        shots: []
      }
    });
  } catch (error) {
    console.error('[VideoStatus] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get status' }, { status: 500 });
  }
}