// Vercel Serverless API Handler
// Routes all /api/* requests based on URL pathname

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req: any, res: any) {
  const { pathname } = new URL(req.url, 'https://example.com');
  const method = req.method;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Health check
    if (pathname === '/api/health' && method === 'GET') {
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Auth routes
    if (pathname === '/api/auth/signin' && method === 'POST') {
      const { email, password } = await req.json();
      const result = sql.query(
        `SELECT * FROM users WHERE email = $1 AND password = $2`,
        [email, password]
      );
      if (result.rows?.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      return res.status(200).json({ success: true, user: result.rows[0] });
    }

    if (pathname === '/api/auth/signup' && method === 'POST') {
      const { email, password, name } = await req.json();
      const userId = crypto.randomUUID();
      await sql.query(
        `INSERT INTO users (id, email, password, name, type, created_at) VALUES ($1, $2, $3, $4, 'individual', NOW())`,
        [userId, email, password, name]
      );
      return res.status(200).json({ success: true, userId });
    }

    if (pathname === '/api/auth/profile' && method === 'GET') {
      const userId = req.headers.get('authorization')?.replace('Bearer ', '');
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const result = sql.query(`SELECT * FROM users WHERE id = $1`, [userId]);
      return res.status(200).json({ user: result.rows?.[0] });
    }

    // Feed routes
    if (pathname === '/api/feed' && method === 'GET') {
      const rawResult = sql.query(`SELECT * FROM creations ORDER BY created_at DESC LIMIT 20`);
      const result = Array.isArray(rawResult) ? rawResult : (rawResult?.rows || []);
      return res.status(200).json({
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
        }))
      });
    }

    if (pathname === '/api/feed/publish' && method === 'POST') {
      const { userId, username, userAvatar, assetUrl, caption, model } = await req.json();
      const creationId = crypto.randomUUID();
      await sql.query(
        `INSERT INTO creations (id, user_id, username, user_avatar, asset_url, caption, model, likes, comments, remixes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, 0, NOW())`,
        [creationId, userId, username, userAvatar, assetUrl, caption, model]
      );
      return res.status(200).json({ success: true, creationId });
    }

    // Credits routes
    if (pathname === '/api/credits' && method === 'GET') {
      const userId = req.headers.get('authorization')?.replace('Bearer ', '') || req.query.userId;
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }
      const result = sql.query(
        `SELECT free_balance, premium_balance FROM users WHERE id = $1`,
        [userId]
      );
      const user = result.rows?.[0];
      return res.status(200).json({
        success: true,
        credits: {
          free: user?.free_balance || 20,
          paid: user?.premium_balance || 0
        }
      });
    }

    if (pathname === '/api/credits' && method === 'POST') {
      const { userId, amount, type } = await req.json();
      const balanceCol = type === 'paid' ? 'premium_balance' : 'free_balance';
      await sql.query(
        `UPDATE users SET ${balanceCol} = ${balanceCol} + $1, updated_at = NOW() WHERE id = $2`,
        [amount, userId]
      );
      return res.status(200).json({ success: true });
    }

    // No matching route
    return res.status(404).json({ error: 'Not found', path: pathname });
    
  } catch (error) {
    console.error('[API Error]', error);
    return res.status(500).json({ error: 'Internal server error', message: (error as Error).message });
  }
}