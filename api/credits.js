import { neon } from '@neondatabase/serverless';

export const runtime = 'nodejs18.x';

export async function GET(req) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return Response.json({ error: 'User ID required' }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL || '');

  try {
    const result = await sql.query(
      'SELECT free_balance, premium_balance FROM users WHERE id = $1',
      [userId]
    );

    const rows = result?.rows || [];
    const user = rows[0];

    return Response.json({
      success: true,
      credits: {
        free: user?.free_balance ?? 20,
        paid: user?.premium_balance ?? 0
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { userId, amount, type } = await req.json();

  if (!userId || !amount) {
    return Response.json({ error: 'userId and amount required' }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL || '');

  try {
    const balanceCol = type === 'paid' ? 'premium_balance' : 'free_balance';

    await sql.query(
      `UPDATE users SET ${balanceCol} = ${balanceCol} + $1, updated_at = NOW() WHERE id = $2`,
      [amount, userId]
    );

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}