import { neon } from '@neondatabase/serverless';

export const runtime = 'nodejs18.x';

export async function GET(req) {
  const sql = neon(process.env.DATABASE_URL || '');

  try {
    const result = await sql.query(
      'SELECT * FROM creations ORDER BY created_at DESC LIMIT 20'
    );

    const rows = result?.rows || [];

    return Response.json({
      success: true,
      creations: rows.map((c) => ({
        id: c.id,
        userId: c.user_id,
        username: c.username,
        caption: c.caption,
        assetUrl: c.asset_url,
        likes: c.likes || 0,
        comments: c.comments || 0,
        remixes: c.remixes || 0
      })),
      pagination: { offset: 0, limit: 20, hasMore: false }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { userId, username, userAvatar, assetUrl, caption, model } = await req.json();

  if (!userId || !assetUrl) {
    return Response.json({ error: 'userId and assetUrl required' }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL || '');

  try {
    const creationId = crypto.randomUUID();
    await sql.query(
      'INSERT INTO creations (id, user_id, username, user_avatar, asset_url, caption, model, likes, comments, remixes, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, 0, NOW())',
      [creationId, userId, username, userAvatar, assetUrl, caption, model]
    );

    return Response.json({ success: true, creationId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}