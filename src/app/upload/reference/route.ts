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
    const projectId = formData.get('projectId') as string || 'default';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'File type not supported' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `references/${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    }));

    const url = `${PUBLIC_URL}/${filename}`;
    
    console.log('[ReferenceUpload] ✅ Uploaded:', url);

    return NextResponse.json({
      success: true,
      url,
      metadata: {
        filename: file.name,
        size: file.size,
        contentType: file.type
      }
    });
  } catch (error) {
    console.error('[ReferenceUpload] Error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}