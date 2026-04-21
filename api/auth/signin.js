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
      'SELECT id, email, name, type, password_hash FROM users WHERE email = $1',
      [email]
    );

    const rows = result?.rows || [];
    if (!rows.length) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = rows[0];
    if (user.password_hash !== password) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return Response.json({ success: true, user: { id: user.id, email: user.email, name: user.name, type: user.type } });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
