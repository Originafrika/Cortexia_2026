import { neon } from '@neondatabase/serverless';

export const runtime = 'nodejs18.x';

export async function POST(req) {
  const { email, name, type } = await req.json();

  if (!process.env.DATABASE_URL) {
    return Response.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
  }

  const sql = neon(process.env.DATABASE_URL);

  if (!email) {
    return Response.json({ error: 'Email required' }, { status: 400 });
  }

  try {
    const existing = await sql.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    const existingRows = existing?.rows || [];
    if (existingRows.length > 0) {
      return Response.json({ success: true, message: 'User already exists' });
    }

    const userId = crypto.randomUUID();
    await sql.query(
      'INSERT INTO users (id, email, name, type, free_balance, premium_balance, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [userId, email, name || email.split('@')[0], type || 'individual', 25, 0]
    );

    console.log('[SignupSync] Created user with credits:', email);
    return Response.json({ success: true, userId });
  } catch (error) {
    console.error('[SignupSync] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}