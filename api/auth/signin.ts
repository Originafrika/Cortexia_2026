import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const sql = neon(process.env.DATABASE_URL || '');

console.log('[Signin] DATABASE_URL set:', !!process.env.DATABASE_URL);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await sql.query(
      `SELECT id, email, name, type FROM users WHERE email = $1 AND password = $2`,
      [email, password]
    );

    console.log('[Signin] Query result:', result);
    
    const rows = Array.isArray(result) ? result : (result?.rows || []);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({
      success: true,
      user: rows[0]
    });
  } catch (error) {
    console.error('[Signin] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: (error as Error).message,
      stack: (error as Error).stack 
    });
  }
}