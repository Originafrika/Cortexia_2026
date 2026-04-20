const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL || '');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const rawResult = await sql(
        `SELECT * FROM creations ORDER BY created_at DESC LIMIT 20`
      );
      
      const rows = Array.isArray(rawResult) ? rawResult : (rawResult?.rows || []);
      
      return res.status(200).json({
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
    }

    if (req.method === 'POST') {
      const { userId, username, userAvatar, assetUrl, caption, model } = req.body;
      
      if (!userId || !assetUrl) {
        return res.status(400).json({ error: 'userId and assetUrl required' });
      }

      const creationId = require('crypto').randomUUID();
      await sql(
        `INSERT INTO creations (id, user_id, username, user_avatar, asset_url, caption, model, likes, comments, remixes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, 0, NOW())`,
        [creationId, userId, username, userAvatar, assetUrl, caption, model]
      );

      return res.status(200).json({ success: true, creationId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[Feed] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};