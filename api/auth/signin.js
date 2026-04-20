import { neon } from '@neondatabase/serverless';

export const runtime = 'nodejs18.x';

export async function POST(req) {
  const { email, password } = await req.json();

  if (!process.env.DATABASE_URL) {
    return Response.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
  }

  const sql = neon(process.env.DATABASE_URL);

  if (!email || !password) {
    return Response.json({ error: 'Email and password required' }, { status: 400 });
  }

  try {
    const result = await sql.query(
      'SELECT id, email, name, type FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );

    const rows = result?.rows || [];
    if (!rows.length) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return Response.json({ success: true, user: rows[0] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}