import { neon } from '@neondatabase/serverless';

export const runtime = 'nodejs18.x';

export async function POST(req) {
  const { email, password, name } = await req.json();

  if (!process.env.DATABASE_URL) {
    return Response.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
  }

  if (!email || !password) {
    return Response.json({ error: 'Email and password required' }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const existing = await sql.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    const existingRows = existing?.rows || [];
    if (existingRows.length > 0) {
      return Response.json({ error: 'User already exists' }, { status: 400 });
    }

    const userId = crypto.randomUUID();
    await sql.query(
      'INSERT INTO users (id, email, password_hash, name, type, free_balance, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [userId, email, password, name || email.split('@')[0], 'individual', 20]
    );

    return Response.json({
      success: true,
      userId,
      user: { id: userId, email, name: name || email.split('@')[0], type: 'individual' }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}