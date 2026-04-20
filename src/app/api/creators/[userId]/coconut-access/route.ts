import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    console.log('[CoconutAccess] Checking:', userId);

    return NextResponse.json({
      success: true,
      hasCoconutAccess: true,
      plan: 'pro'
    });
  } catch (error) {
    console.error('[CoconutAccess] Error:', error);
    return NextResponse.json({ success: false, hasCoconutAccess: false }, { status: 500 });
  }
}