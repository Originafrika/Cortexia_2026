import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, cocoBoardId } = body;

    console.log('[CampaignGenerate] Generating:', { userId, cocoBoardId });

    return NextResponse.json({
      success: true,
      data: {
        campaignId: `campaign-${Date.now()}`,
        status: 'processing',
        progress: 0
      }
    });
  } catch (error) {
    console.error('[CampaignGenerate] Error:', error);
    return NextResponse.json({ success: false, error: 'Generation failed' }, { status: 500 });
  }
}