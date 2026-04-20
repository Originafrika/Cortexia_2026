// FIX: Use sql.query() for Neon Serverless
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (!process.env.DATABASE_URL) {
    console.error('[Signin] DATABASE_URL is NOT SET!');
    return res.status(500).json({ error: 'DATABASE_URL not configured' });
  }

  const sql = neon(process.env.DATABASE_URL);

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
    let body = req.body;
    if (!body || typeof body === 'string') {
      body = JSON.parse(req.body || '{}');
    }
    
    const { email, password } = body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await sql.query(
      `SELECT id, email, name, type FROM users WHERE email = $1 AND password = $2`,
      [email, password]
    );

    const rows = Array.isArray(result) ? result : (result?.rows || []);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({
      success: true,
      user: rows[0]
    });
  } catch (error) {
    console.error('[Signin] Error:', error.message);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
};