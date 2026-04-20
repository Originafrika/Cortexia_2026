import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const sql = neon(process.env.DATABASE_URL!);
    
    console.log('[Comments] Loading for post:', postId);

    const rawResult = await sql.query(`
      SELECT c.*, u.name as username FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.creation_id = $1
      ORDER BY c.created_at DESC
    `, [postId]);

    const result = Array.isArray(rawResult) ? rawResult : (rawResult?.rows || []);

    return NextResponse.json({
      success: true,
      comments: result.map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        username: c.username,
        text: c.content,
        likes: c.likes || 0,
        createdAt: c.created_at
      }))
    });
  } catch (error) {
    console.error('[Comments] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load comments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const body = await request.json();
    const { userId, username, text, userAvatar } = body;
    
    if (!userId || !text) {
      return NextResponse.json({ success: false, error: 'User ID and text required' }, { status: 400 });
    }
    
    const sql = neon(process.env.DATABASE_URL!);
    
    console.log('[Comments] Adding comment to:', postId);

    const commentId = crypto.randomUUID();
    const now = new Date();

    await sql.query(`
      INSERT INTO comments (id, creation_id, user_id, username, user_avatar, content, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [commentId, postId, userId, username, userAvatar, text, now]);

    // Update comments count
    await sql.query(`
      UPDATE creations SET comments = comments + 1 WHERE id = $1
    `, [postId]);

    return NextResponse.json({
      success: true,
      comment: {
        id: commentId,
        postId,
        userId,
        username,
        userAvatar,
        text,
        likes: 0,
        createdAt: now.toISOString()
      }
    });
  } catch (error) {
    console.error('[Comments] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to add comment' }, { status: 500 });
  }
}
