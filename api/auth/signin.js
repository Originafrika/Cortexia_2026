import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  console.log('[Signin] DATABASE_URL set:', !!process.env.DATABASE_URL);
  console.log('[Signin] NEON_PROJECT_ID set:', !!process.env.NEON_PROJECT_ID);
  console.log('[Signin] req.method:', req.method);

  if (!process.env.DATABASE_URL && !process.env.NEON_PROJECT_ID) {
    console.error('[Signin] No database env vars!');
    return res.status(500).json({ error: 'DATABASE_URL not configured' });
  }

  const dbUrl = process.env.DATABASE_URL || `postgresql://neondatabase_owner:${process.env.NEON_DB_PASSWORD}@ep-cool-meadow-an2f2vge.neonauth.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require`;
  
  try {
    const sql = neon(dbUrl);
    console.log('[Signin] Neon client created');
  } catch (e) {
    console.error('[Signin] Neon init error:', e);
    return res.status(500).json({ error: 'Database connection failed', details: e.message });
  }

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
    console.log('[Signin] Email:', email);
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const sql = neon(dbUrl);
    const result = await sql(
      `SELECT id, email, name, type FROM users WHERE email = $1 AND password = $2`,
      [email, password]
    );

    console.log('[Signin] Query result rows:', result?.length || result?.rows?.length);
    
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
    console.error('[Signin] Stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
};