import { NextRequest, NextResponse } from 'next/server';

const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY || 'sk_7oNpdj7agYlUTXxjOiFeUDDEv6v50Zds';
const KIE_API_BASE = process.env.KIE_API_BASE || 'https://api.kie.ai';

const FREE_MODELS = ['zimage', 'seedream', 'kontext', 'nanobanana', 'pollinations', 'flux', 'flux-pro', 'flux-realism', 'flux-anime', 'flux-3d', 'turbo'];
const PAID_MODELS = ['flux-2-pro', 'flux-2-flex'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, options = {} } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.length < 3) {
      return NextResponse.json({
        success: false,
        error: 'Invalid prompt - must be at least 3 characters'
      }, { status: 400 });
    }

    const model = (options.model || 'zimage').toLowerCase();
    const isFreeModel = FREE_MODELS.includes(model);
    const isPaidModel = PAID_MODELS.includes(model);

    if (!isFreeModel && !isPaidModel) {
      return NextResponse.json({
        success: false,
        error: `Unknown model: ${model}`
      }, { status: 400 });
    }

    if (isFreeModel) {
      return await handleFreeModel(request, prompt, options);
    } else {
      return await handlePaidModel(request, prompt, options);
    }
  } catch (error) {
    console.error('[Generation] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Generation failed'
    }, { status: 500 });
  }
}

async function handleFreeModel(request: NextRequest, prompt: string, options: any) {
  const model = options.model || 'zimage';
  const width = options.width || 1024;
  const height = options.height || 1024;
  const seed = options.seed || Math.floor(Math.random() * 1000000);

  const userId = localStorage?.getItem('cortexia_user_id') || 'anonymous';
  const authHeader = request.headers.get('authorization');

  const pollinationsUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true`;

  return NextResponse.json({
    success: true,
    jobId: `job-${Date.now()}`,
    status: 'succeeded',
    output: pollinationsUrl,
    model: model,
    creditsUsed: 1
  });
}

async function handlePaidModel(request: NextRequest, prompt: string, options: any) {
  const model = options.model || 'flux-2-pro';
  const width = options.width || 1024;
  const height = options.height || 1024;
  const seed = options.seed || Math.floor(Math.random() * 1000000);
  const referenceImages = options.referenceImages || [];

  const userId = localStorage?.getItem('cortexia_user_id') || 'anonymous';

  try {
    const response = await fetch(`${KIE_API_BASE}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KIE_API_KEY || ''}`
      },
      body: JSON.stringify({
        prompt,
        width,
        height,
        seed,
        model,
        reference_images: referenceImages
      })
    });

    const data = await response.json();

    if (data.task_id) {
      return NextResponse.json({
        success: true,
        jobId: data.task_id,
        status: 'processing'
      });
    }

    return NextResponse.json({
      success: true,
      jobId: `job-${Date.now()}`,
      status: 'succeeded',
      output: data.images?.[0]?.url || data.image_url,
      model: model,
      creditsUsed: 5
    });
  } catch (error) {
    console.error('[Generation] Kie AI error:', error);
    return NextResponse.json({
      success: false,
      error: 'Paid generation failed'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  const status = searchParams.get('status');
  const output = searchParams.get('output');

  return NextResponse.json({
    success: true,
    jobId,
    status: status || 'succeeded',
    output
  });
}