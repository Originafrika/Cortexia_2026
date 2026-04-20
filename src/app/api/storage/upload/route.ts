import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
    const { imageData, filename, contentType, userId, projectId, accountType } = body;

    if (!imageData || !filename) {
      return NextResponse.json(
        { success: false, error: 'Image data and filename required' },
        { status: 400 }
      );
    }

    // Extract base64 data
    const base64Match = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json(
        { success: false, error: 'Invalid base64 image data' },
        { status: 400 }
      );
    }

    const mimeType = base64Match[1];
    const base64Data = base64Match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename
    const ext = filename.split('.').pop() || 'png';
    const key = `uploads/${userId || 'anonymous'}/${projectId || Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Upload to R2
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType
    }));

    const url = `${PUBLIC_URL}/${key}`;

    console.log('[StorageUpload] ✅ Uploaded:', url);

    return NextResponse.json({
      success: true,
      url,
      metadata: {
        size: buffer.length,
        contentType: mimeType,
        quota: {
          used: 0,
          total: 1000000000,
          percentage: 0
        }
      }
    });
  } catch (error) {
    console.error('[StorageUpload] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  const userId = searchParams.get('userId');

  if (!filename) {
    return NextResponse.json(
      { error: 'Filename required' },
      { status: 400 }
    );
  }

  const key = `uploads/${userId || 'anonymous'}/${filename}`;

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('[StorageGet] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get file' },
      { status: 500 }
    );
  }
}