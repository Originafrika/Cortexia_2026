import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    const sql = neon(process.env.DATABASE_URL!);
    
    console.log('[Feed API] Querying creations, offset:', offset, 'limit:', limit);
    
    const rawResult = await sql.query(`
      SELECT * FROM creations ORDER BY created_at DESC LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    const result = Array.isArray(rawResult) ? rawResult : (rawResult?.rows || []);
    
    if (!result || result.length === 0) {
      return NextResponse.json({
        success: true,
        creations: [],
        pagination: { offset, limit, hasMore: false }
      });
    }
    
    return NextResponse.json({
      success: true,
      creations: result.map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        username: c.username,
        caption: c.caption,
        assetUrl: c.asset_url,
        likes: c.likes || 0,
        comments: c.comments || 0,
        remixes: c.remixes || 0
      })),
      pagination: { offset, limit, hasMore: result.length === limit }
    });
  } catch (error) {
    console.error('[Feed API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch feed'
    }, { status: 500 });
  }
}