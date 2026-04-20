import { neon } from '@neondatabase/serverless';

const DB = process.env.DATABASE_URL;

const db = DB ? neon(DB) : null;

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
}

function Unauthorized(message = 'Unauthorized') {
  return json({ error: message }, { status: 401 });
}

function BadRequest(message = 'Bad Request') {
  return json({ error: message }, { status: 400 });
}

function parseAuthHeader(request: Request) {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hashValue: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hashValue;
}

const ROUTES: Record<string, (request: Request, params: Record<string, string>) => Promise<Response>> = {
  'POST /api/auth/signup': async (request) => {
    const { email, password, name, type } = await request.json().catch(() => ({}));
    
    if (!email || !password) {
      return BadRequest('Email and password required');
    }

    if (!db) return json({ error: 'Database not configured' }, { status: 500 });

    const existing = await db`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return BadRequest('User already exists');
    }

    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    await db`
      INSERT INTO users (id, email, name, password_hash, type, premium_balance, free_balance, free_balance_reset_at, created_at, updated_at)
      VALUES (${userId}, ${email}, ${name || email.split('@')[0]}, ${passwordHash}, ${type || 'individual'}, 25, 25, ${now}, ${now}, ${now})
    `;

    const token = btoa(`${userId}:${Date.now()}`);

    return json({
      success: true,
      user: { id: userId, email, name: name || email.split('@')[0], type: type || 'individual', createdAt: now },
      token,
    });
  },

  'POST /api/auth/signin': async (request) => {
    const { email, password } = await request.json().catch(() => ({}));
    
    if (!email || !password) {
      return BadRequest('Email and password required');
    }

    if (!db) return json({ error: 'Database not configured' }, { status: 500 });

    const rows = await db`SELECT id, email, name, type, password_hash, created_at FROM users WHERE email = ${email}`;
    
    if (rows.length === 0) {
      return Unauthorized('Invalid credentials');
    }

    const user = rows[0];
    const valid = await verifyPassword(password, user.password_hash);

    if (!valid) {
      return Unauthorized('Invalid credentials');
    }

    const token = btoa(`${user.id}:${Date.now()}`);

    return json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, type: user.type, createdAt: user.created_at },
      token,
    });
  },

  'GET /api/auth/me': async (request) => {
    const token = parseAuthHeader(request);
    if (!token) return Unauthorized();

    try {
      const decoded = atob(token);
      const [userId] = decoded.split(':');

      if (!db) return json({ error: 'Database not configured' }, { status: 500 });

      const rows = await db`SELECT id, email, name, type, premium_balance, free_balance, created_at FROM users WHERE id = ${userId}`;
      
      if (rows.length === 0) {
        return Unauthorized('User not found');
      }

      const user = rows[0];
      return json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          type: user.type,
          premiumBalance: user.premium_balance,
          freeBalance: user.free_balance,
          createdAt: user.created_at,
        },
      });
    } catch {
      return Unauthorized('Invalid token');
    }
  },

  'POST /api/auth/signout': async (request) => {
    return json({ success: true });
  },

  'GET /api/auth/profile': async (request) => {
    const token = parseAuthHeader(request);
    if (!token) return Unauthorized();

    try {
      const [userId] = atob(token).split(':');
      if (!db) return json({ error: 'Database not configured' }, { status: 500 });

      const rows = await db`SELECT * FROM users WHERE id = ${userId}`;
      if (rows.length === 0) return Unauthorized('User not found');

      return json({ user: rows[0] });
    } catch {
      return Unauthorized('Invalid token');
    }
  },

  'PATCH /api/auth/profile': async (request) => {
    const token = parseAuthHeader(request);
    if (!token) return Unauthorized();

    const updates = await request.json().catch(() => ({}));
    const [userId] = atob(token).split(':');

    if (!db) return json({ error: 'Database not configured' }, { status: 500 });

    const sets: string[] = [];
    const values: (string | number)[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        sets.push(`${key} = $${idx}`);
        values.push(value as string | number);
        idx++;
      }
    }

    if (sets.length > 0) {
      sets.push(`updated_at = $${idx}`);
      values.push(new Date().toISOString());
      idx++;
      values.push(userId);

      await db`UPDATE users SET ${db.unsafe(sets.join(', '))} WHERE id = $${idx}`;
    }

    return json({ success: true });
  },

  'POST /api/stripe/webhook': async (request) => {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return BadRequest('Missing stripe-signature header');
    }

    // Verify webhook with Stripe (you'd use stripe library here)
    console.log('[Stripe Webhook] Received:', body.slice(0, 100));

    return json({ received: true });
  },

  'POST /api/stripe/checkout': async (request) => {
    const { priceId, userId } = await request.json().catch(() => ({}));

    if (!priceId || !userId) {
      return BadRequest('priceId and userId required');
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // Create Stripe checkout session via API
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'mode': 'payment',
        'success_url': `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}/settings?success=true`,
        'cancel_url': `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}/settings?canceled=true`,
        'metadata[userId]': userId,
      }),
    });

    const session = await response.json();
    if (session.error) {
      return json({ error: session.error.message }, { status: 400 });
    }

    return json({ url: session.url });
  },

  'POST /api/qstash/cocoboard-analyze': async (request) => {
    const payload = await request.json().catch(() => ({}));

    // Queue job to QStash
    const qstashUrl = process.env.VITE_QSTASH_URL;
    const qstashToken = process.env.VITE_QSTASH_TOKEN;

    if (qstashUrl && qstashToken) {
      await fetch(`${qstashUrl}/v1/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${qstashToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `${new URL(request.url).origin}/api/coconut/cocoboard/analyze`, body: payload }),
      });
    }

    return json({ success: true, message: 'Job queued' });
  },

  'POST /api/qstash/cocoblend': async (request) => {
    const payload = await request.json().catch(() => ({}));
    return json({ success: true, message: 'Job queued' });
  },

  'POST /api/coconut/cocoboard': async (request) => {
    const token = parseAuthHeader(request);
    if (!token) return Unauthorized();

    const payload = await request.json().catch(() => ({}));
    return json({ success: true, boardId: crypto.randomUUID(), ...payload });
  },

  'GET /api/coconut/cocoboard/:id': async (request, { id }) => {
    const token = parseAuthHeader(request);
    if (!token) return Unauthorized();

    // Fetch board from DB
    if (!db) return json({ error: 'Database not configured' }, { status: 500 });

    const rows = await db`SELECT * FROM cocoboards WHERE id = ${id}`;
    if (rows.length === 0) {
      return json({ error: 'Board not found' }, { status: 404 });
    }

    return json({ board: rows[0] });
  },

  'POST /api/coconut/cocoboard/:id/validate': async (request, { id }) => {
    const token = parseAuthHeader(request);
    if (!token) return Unauthorized();

    return json({ success: true, valid: true });
  },
};

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);
    const key = `${request.method} ${url.pathname}`;

    // Extract params for dynamic routes
    const params: Record<string, string> = {};
    const pathParts = url.pathname.split('/').filter(Boolean);

    for (const [routeKey, handler] of Object.entries(ROUTES)) {
      const [method, path] = routeKey.split(' ');
      
      if (method !== request.method) continue;

      const routeParts = path.split('/').filter(Boolean);
      if (routeParts.length !== pathParts.length) continue;

      let match = true;
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
          params[routeParts[i].slice(1)] = pathParts[i];
        } else if (routeParts[i] !== pathParts[i]) {
          match = false;
          break;
        }
      }

      if (match) {
        try {
          return await handler(request, params);
        } catch (error) {
          console.error('[API Error]', error);
          return json({ error: 'Internal server error' }, { status: 500 });
        }
      }
    }

    return json({ error: 'Not found' }, { status: 404 });
  },
};