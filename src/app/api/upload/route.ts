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
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not supported' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large (max 10MB)' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const fileUrl = `${PUBLIC_URL}/${filename}`;
    
    console.log('[Upload] ✅ Uploaded to R2:', fileUrl);

    return NextResponse.json({
      success: true,
      url: fileUrl,
    });
  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json(
      { error: 'Filename required' },
      { status: 400 }
    );
  }

  // Return the public URL
  return NextResponse.json({
    url: `${PUBLIC_URL}/${filename}`,
  });
}