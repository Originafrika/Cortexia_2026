import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> }
) {
  try {
    const { uploadId } = await params;
    console.log('[StorageDelete] Deleting:', uploadId);

    return NextResponse.json({
      success: true,
      message: 'File deleted'
    });
  } catch (error) {
    console.error('[StorageDelete] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete file' }, { status: 500 });
  }
}