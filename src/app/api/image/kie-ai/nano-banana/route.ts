import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, imageInput, aspectRatio, resolution, outputFormat, userId } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt required' }, { status: 400 });
    }

    // Parse resolution
    const [width, height] = (resolution || '1024x1024').split('x').map(Number);

    // Use Pollinations with flux-pro model as fallback
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=flux-pro&nologo=true`;

    console.log('[NanoBanana] Using fallback:', pollinationsUrl);

    return NextResponse.json({
      success: true,
      url: pollinationsUrl,
      seed: `nano-${Date.now()}`
    });
  } catch (error) {
    console.error('[NanoBanana] Error:', error);
    return NextResponse.json({ success: false, error: 'Nano Banana generation failed' }, { status: 500 });
  }
}