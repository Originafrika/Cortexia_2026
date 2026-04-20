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
    const { audioData, filename, contentType, userId } = body;

    if (!audioData || !filename) {
      return NextResponse.json(
        { success: false, error: 'Audio data and filename required' },
        { status: 400 }
      );
    }

    const base64Match = audioData.match(/^data:([^;]+);base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json(
        { success: false, error: 'Invalid base64 audio data' },
        { status: 400 }
      );
    }

    const mimeType = base64Match[1];
    const base64Data = base64Match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const ext = filename.split('.').pop() || 'mp3';
    const key = `audio/${userId || 'anonymous'}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType
    }));

    const url = `${PUBLIC_URL}/${key}`;

    console.log('[AudioUpload] ✅ Uploaded:', url);

    return NextResponse.json({
      success: true,
      url
    });
  } catch (error) {
    console.error('[AudioUpload] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Audio upload failed' },
      { status: 500 }
    );
  }
}