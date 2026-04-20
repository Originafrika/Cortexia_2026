import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const body = await request.json();
    const userId = body.userId;
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }
    
    const sql = neon(process.env.DATABASE_URL!);
    
    console.log('[FeedLike] Liking post:', postId, 'by user:', userId);

    // Insert like record
    await sql.query(`
      INSERT INTO likes (id, creation_id, user_id)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING
    `, [crypto.randomUUID(), postId, userId]);

    // Update likes count
    await sql.query(`
      UPDATE creations SET likes = likes + 1 WHERE id = $1
    `, [postId]);

    return NextResponse.json({
      success: true,
      likes: 1
    });
  } catch (error) {
    console.error('[FeedLike] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to like post' }, { status: 500 });
  }
}
