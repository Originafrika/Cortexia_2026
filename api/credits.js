import { neon } from '@neondatabase/serverless';

const SQL = neon(process.env.DATABASE_URL || '');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const userId = req.query.userId;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const result = await SQL.query(
        `SELECT free_balance, premium_balance FROM users WHERE id = $1`,
        [userId]
      );

      const rows = Array.isArray(result) ? result : (result?.rows || []);
      const user = rows[0];

      return res.status(200).json({
        success: true,
        credits: {
          free: user?.free_balance ?? 20,
          paid: user?.premium_balance ?? 0
        }
      });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const { userId, amount, type } = body;
      
      if (!userId || !amount) {
        return res.status(400).json({ error: 'userId and amount required' });
      }

      const balanceCol = type === 'paid' ? 'premium_balance' : 'free_balance';
      
      await SQL.query(
        `UPDATE users SET ${balanceCol} = ${balanceCol} + $1, updated_at = NOW() WHERE id = $2`,
        [amount, userId]
      );

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[Credits] Error:', error.message);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};