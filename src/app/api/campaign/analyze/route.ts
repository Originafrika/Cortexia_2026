import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { briefing } = body;

    console.log('[CampaignAnalyze] Analyzing:', briefing?.productName);

    // Return mock analysis
    return NextResponse.json({
      success: true,
      data: {
        id: `campaign-${Date.now()}`,
        weeks: [
          {
            id: 'week-1',
            theme: 'Launch',
            assets: [],
            status: 'pending'
          }
        ],
        allAssets: [],
        totalAssets: 0
      }
    });
  } catch (error) {
    console.error('[CampaignAnalyze] Error:', error);
    return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 });
  }
}