import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cocoBoardId = searchParams.get('cocoBoardId');
  const userId = searchParams.get('userId');

  console.log('[CampaignCocoboard] Loading:', { cocoBoardId, userId });

  return NextResponse.json({
    success: true,
    data: {
      id: cocoBoardId || 'default',
      userId: userId || 'anonymous',
      shots: [],
      status: 'idle'
    }
  });
}