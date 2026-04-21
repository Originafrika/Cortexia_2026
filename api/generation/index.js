export const runtime = 'nodejs18.x';

const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY || 'sk_7oNpdj7agYlUTXxjOiFeUDDEv6v50Zds';
const KIE_API_BASE = process.env.KIE_API_BASE || 'https://api.kie.ai';

const FREE_MODELS = ['zimage', 'seedream', 'kontext', 'nanobanana', 'pollinations', 'flux', 'flux-pro', 'flux-realism', 'flux-anime', 'flux-3d', 'turbo', 'flux-schnell'];
const PAID_MODELS = ['flux-2-pro', 'flux-2-flex'];

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt, options = {} } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.length < 3) {
      return Response.json({
        success: false,
        error: 'Invalid prompt - must be at least 3 characters'
      }, { status: 400 });
    }

    const model = (options.model || 'zimage').toLowerCase();
    const isFreeModel = FREE_MODELS.includes(model);
    const isPaidModel = PAID_MODELS.includes(model);

    if (!isFreeModel && !isPaidModel) {
      return Response.json({
        success: false,
        error: `Unknown model: ${model}`
      }, { status: 400 });
    }

    if (isFreeModel) {
      return await handleFreeModel(prompt, options);
    } else {
      return await handlePaidModel(prompt, options);
    }
  } catch (error) {
    console.error('[Generation] Error:', error);
    return Response.json({
      success: false,
      error: 'Generation failed'
    }, { status: 500 });
  }
}

async function handleFreeModel(prompt, options) {
  const model = options.model || 'zimage';
  const width = options.width || 1024;
  const height = options.height || 1024;
  const seed = options.seed || Math.floor(Math.random() * 1000000);

  const pollinationsUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true&private=true`;

  return Response.json({
    success: true,
    jobId: `job-${Date.now()}`,
    status: 'succeeded',
    output: pollinationsUrl,
    model: model,
    creditsUsed: 0
  });
}

async function handlePaidModel(prompt, options) {
  const model = options.model || 'flux-2-pro';
  const width = options.width || 1024;
  const height = options.height || 1024;
  const seed = options.seed || Math.floor(Math.random() * 1000000);
  const referenceImages = options.referenceImages || [];

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
      return Response.json({
        success: true,
        jobId: data.task_id,
        status: 'processing'
      });
    }

    return Response.json({
      success: true,
      jobId: `job-${Date.now()}`,
      status: 'succeeded',
      output: data.images?.[0]?.url || data.image_url,
      model: model,
      creditsUsed: 5
    });
  } catch (error) {
    console.error('[Generation] Kie AI error:', error);
    return Response.json({
      success: false,
      error: 'Paid generation failed'
    }, { status: 500 });
  }
}

export async function GET(req) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get('jobId');
  const status = url.searchParams.get('status');
  const output = url.searchParams.get('output');

  return Response.json({
    success: true,
    jobId,
    status: status || 'succeeded',
    output
  });
}