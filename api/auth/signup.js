import { neon } from '@neondatabase/serverless';

const SQL = neon(process.env.DATABASE_URL || '');

export default async function handler(req, res) {
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
    
    const { email, password, name } = body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existing = await SQL.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );
    
    const existingRows = Array.isArray(existing) ? existing : (existing?.rows || []);
    if (existingRows && existingRows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const userId = crypto.randomUUID();
    await SQL.query(
      `INSERT INTO users (id, email, password, name, type, free_balance, created_at) 
       VALUES ($1, $2, $3, $4, 'individual', 20, NOW())`,
      [userId, email, password, name || email.split('@')[0]]
    );

    return res.status(200).json({
      success: true,
      userId,
      user: { id: userId, email, name: name || email.split('@')[0], type: 'individual' }
    });
  } catch (error) {
    console.error('[Signup] Error:', error.message);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};