import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intent, userId } = body;

    if (!intent) {
      return NextResponse.json({ success: false, error: 'Intent required' }, { status: 400 });
    }

    console.log('[AnalyzeIntent] Processing:', intent.substring(0, 100));

    // Return mock analysis result
    const result = {
      success: true,
      data: {
        projectId: `project-${Date.now()}`,
        intent: intent,
        summary: intent.substring(0, 100),
        strategy: {
          approach: 'video_ad',
          keyPoints: ['Hook', 'Problem', 'Solution', 'CTA'],
          duration: 30,
          style: 'modern'
        },
        shots: [
          { id: '1', description: 'Hook - Attention grabber', duration: 3 },
          { id: '2', description: 'Problem - Pain point', duration: 5 },
          { id: '3', description: 'Solution - Product demo', duration: 15 },
          { id: '4', description: 'CTA - Call to action', duration: 7 }
        ]
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('[AnalyzeIntent] Error:', error);
    return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 });
  }
}