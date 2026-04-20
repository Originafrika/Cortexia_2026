import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[VideoCocoboard] Loading:', id);

    // Return mock data for now
    return NextResponse.json({
      success: true,
      data: {
        id,
        shots: [],
        status: 'idle',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[VideoCocoboard] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load cocoboard' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log('[VideoCocoboard] Saving:', id, body);

    return NextResponse.json({
      success: true,
      data: { id, ...body }
    });
  } catch (error) {
    console.error('[VideoCocoboard] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save cocoboard' }, { status: 500 });
  }
}