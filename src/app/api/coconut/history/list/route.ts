import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Return mock history
    return NextResponse.json({
      success: true,
      history: [],
      pagination: {
        total: 0,
        offset: 0,
        limit: 20
      }
    });
  } catch (error) {
    console.error('[CoconutHistory] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 });
  }
}