import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || 'https://677f1cdf2fff2fccc2674e8f102ff6d8.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '2c550222cb762b6e101b8178e61bc3f2',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'bf9c4bbda135f91ce6850d250200fa606b2d9cdbc76480c0e20224de433ba3d1',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'cortexia';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-27e4df27734f4569b204f46dcebc8648.r2.dev';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, resolution, aspectRatio, referenceImages, userId } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt required' }, { status: 400 });
    }

    const KIE_API_KEY = process.env.KIE_API_KEY || '';
    const KIE_API_BASE = process.env.KIE_API_BASE || 'https://api.kie.ai';

    // Parse resolution
    const [width, height] = (resolution || '1024x1024').split('x').map(Number);

    // Use Pollinations as fallback for free models, Kie AI for premium
    if (model === 'flux-2-pro' || model === 'flux-2-flex') {
      try {
        const kieResponse = await fetch(`${KIE_API_BASE}/v1/images/generations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${KIE_API_KEY}`
          },
          body: JSON.stringify({
            prompt,
            width,
            height,
            model: model === 'flux-2-pro' ? 'flux-pro' : 'flux-dev',
            reference_images: referenceImages || []
          })
        });

        const kieData = await kieResponse.json();

        if (kieData.task_id) {
          return NextResponse.json({
            success: true,
            taskId: kieData.task_id,
            status: 'processing'
          });
        }

        if (kieData.images?.[0]?.url) {
          // Download and re-upload to R2
          const imageUrl = kieData.images[0].url;
          const imageResponse = await fetch(imageUrl);
          const imageBuffer = await imageResponse.arrayBuffer();
          
          const filename = `generations/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
          
          await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: filename,
            Body: Buffer.from(imageBuffer),
            ContentType: 'image/png'
          }));

          return NextResponse.json({
            success: true,
            url: `${PUBLIC_URL}/${filename}`,
            taskId: `kie-${Date.now()}`
          });
        }
      } catch (kieError) {
        console.error('[KieAI] Error:', kieError);
      }
    }

    // Fallback to Pollinations
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    return NextResponse.json({
      success: true,
      url: pollinationsUrl,
      taskId: `pollinations-${Date.now()}`
    });
  } catch (error) {
    console.error('[Generate] Error:', error);
    return NextResponse.json({ success: false, error: 'Generation failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  // Mock status check
  return NextResponse.json({
    success: true,
    status: 'succeeded',
    url: `https://image.pollinations.ai/prompt/test?width=1024&height=1024&nologo=true`
  });
}