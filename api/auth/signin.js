import { neon } from '@neondatabase/serverless';

export const runtime = 'nodejs18.x';

export async function POST(req) {
  const { email, password } = await req.json();

  if (!process.env.DATABASE_URL) {
    console.error('[Signin] DATABASE_URL not configured');
    return Response.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
  }

  const sql = neon(process.env.DATABASE_URL);

  if (!email || !password) {
    return Response.json({ error: 'Email and password required' }, { status: 400 });
  }

  try {
    // Direct DB query like Express server was doing
    const result = await sql.query(
      'SELECT id, email, name, type FROM users WHERE email = $1',
      [email]
    );

    const rows = result?.rows || [];
    if (!rows.length) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = rows[0];
    
    // Simple password match (same as Express server)
    if (user.password !== password && user.password_hash !== password) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('[Signin] Success:', user.email);
    return Response.json({ 
      success: true, 
      user: { id: user.id, email: user.email, name: user.name, type: user.type }
    });
  } catch (error) {
    console.error('[Signin] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
