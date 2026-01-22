/**
 * STRIPE CHECKOUT ROUTES - Credit Purchase System
 * 
 * Endpoints:
 * - POST /checkout/create-session - Create Stripe checkout session
 * - GET  /checkout/success - Handle successful payment
 * - GET  /checkout/cancel - Handle cancelled payment
 * - GET  /checkout/verify-session - Verify Stripe session and add credits to user
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ✅ CORS: Allow all origins for Stripe redirects
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ DEBUG: Test route to verify routing works
app.get('/test', (c) => {
  console.log('✅ [Checkout] Test route accessed');
  return c.json({ 
    success: true, 
    message: 'Checkout routes are working!',
    timestamp: new Date().toISOString()
  });
});

// ✅ Stripe API Key (from environment)
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';

// ✅ Credit packages (sync with frontend)
const CREDIT_PACKAGES = [
  { credits: 10, price: 1.00, discount: 0, popular: false },
  { credits: 50, price: 4.50, discount: 10, popular: true },
  { credits: 100, price: 8.00, discount: 20, popular: false },
  { credits: 500, price: 35.00, discount: 30, popular: false }
];

// ============================================================================
// CREATE CHECKOUT SESSION
// ============================================================================

/**
 * POST /checkout/create-session
 * Create a Stripe checkout session for credit purchase
 * 
 * Body: { userId: string, packageId: number }
 * Returns: { sessionId: string, url: string }
 */
app.post('/create-session', async (c) => {
  try {
    const { userId, packageId } = await c.req.json();

    // Validate input
    if (!userId || packageId === undefined) {
      return c.json({
        success: false,
        error: 'userId and packageId are required'
      }, 400);
    }

    if (packageId < 0 || packageId >= CREDIT_PACKAGES.length) {
      return c.json({
        success: false,
        error: 'Invalid package ID'
      }, 400);
    }

    const pkg = CREDIT_PACKAGES[packageId];

    console.log(`🛒 Creating checkout session for user ${userId}: ${pkg.credits} credits for $${pkg.price}`);

    // ✅ Check if Stripe is configured
    if (!STRIPE_SECRET_KEY) {
      // ❌ FALLBACK: For development/testing without Stripe
      console.warn('⚠️ STRIPE_SECRET_KEY not set - using test mode');
      
      // Simulate successful purchase (for testing)
      const userProfile = await kv.get(`user:profile:${userId}`);
      
      if (!userProfile) {
        return c.json({
          success: false,
          error: 'User profile not found'
        }, 404);
      }

      // Add credits immediately (test mode)
      userProfile.paidCredits = (userProfile.paidCredits || 0) + pkg.credits;
      userProfile.updatedAt = new Date().toISOString();
      await kv.set(`user:profile:${userId}`, userProfile);

      console.log(`✅ TEST MODE: Added ${pkg.credits} credits to user ${userId}`);

      return c.json({
        success: true,
        testMode: true,
        message: `Test mode: ${pkg.credits} credits added instantly`,
        credits: pkg.credits
      });
    }

    // ✅ PRODUCTION: Create Stripe checkout session
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'success_url': `${SUPABASE_URL.replace('.supabase.co/functions/v1/make-server-e55aa214', '.supabase.co')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${SUPABASE_URL.replace('.supabase.co/functions/v1/make-server-e55aa214', '.supabase.co')}/payment-cancel`,
        'client_reference_id': userId,
        'metadata[userId]': userId,
        'metadata[credits]': pkg.credits.toString(),
        'metadata[packageId]': packageId.toString(),
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][unit_amount]': Math.round(pkg.price * 100).toString(), // Convert to cents
        'line_items[0][price_data][product_data][name]': `${pkg.credits} Cortexia Credits`,
        'line_items[0][price_data][product_data][description]': pkg.discount > 0 
          ? `${pkg.discount}% off - Premium AI generation credits` 
          : 'Premium AI generation credits',
        'line_items[0][quantity]': '1',
      }).toString()
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text();
      console.error('❌ Stripe API error:', error);
      return c.json({
        success: false,
        error: 'Failed to create checkout session'
      }, 500);
    }

    const session = await stripeResponse.json();

    console.log(`✅ Checkout session created: ${session.id}`);

    return c.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('❌ Create checkout session error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create session'
    }, 500);
  }
});

// ============================================================================
// VERIFY SESSION (called by frontend after Stripe redirect)
// ============================================================================

/**
 * GET /checkout/verify-session?session_id=xxx
 * Verify Stripe session and add credits to user
 */
app.get('/verify-session', async (c) => {
  try {
    const sessionId = c.req.query('session_id');

    if (!sessionId) {
      return c.json({
        success: false,
        error: 'No session ID provided'
      }, 400);
    }

    console.log(`🔍 [Checkout] Verifying session: ${sessionId}`);

    // Retrieve session from Stripe
    const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      }
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text();
      console.error('❌ [Checkout] Stripe API error:', error);
      return c.json({
        success: false,
        error: 'Failed to verify session'
      }, 500);
    }

    const session = await stripeResponse.json();

    console.log(`💳 [Checkout] Session retrieved:`, {
      id: session.id,
      payment_status: session.payment_status,
      userId: session.metadata?.userId,
      credits: session.metadata?.credits
    });

    // Check payment status
    if (session.payment_status !== 'paid') {
      return c.json({
        success: false,
        error: 'Payment not completed'
      }, 400);
    }

    // Extract user and credits from metadata
    const userId = session.metadata?.userId || session.client_reference_id;
    const credits = parseInt(session.metadata?.credits || '0');

    if (!userId) {
      console.error('❌ [Checkout] No userId in session metadata');
      return c.json({
        success: false,
        error: 'Invalid session: missing user ID'
      }, 400);
    }

    // Get user profile
    const userProfile = await kv.get(`user:profile:${userId}`);

    if (!userProfile) {
      console.error(`❌ [Checkout] User profile not found: ${userId}`);
      return c.json({
        success: false,
        error: 'User profile not found'
      }, 404);
    }

    // Add credits
    userProfile.paidCredits = (userProfile.paidCredits || 0) + credits;
    userProfile.updatedAt = new Date().toISOString();
    await kv.set(`user:profile:${userId}`, userProfile);

    console.log(`✅ [Checkout] Added ${credits} credits to user ${userId}. New balance: ${userProfile.paidCredits}`);

    return c.json({
      success: true,
      credits: credits,
      newBalance: userProfile.paidCredits,
      message: `${credits} credits added successfully!`
    });

  } catch (error) {
    console.error('❌ [Checkout] Verify session error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify session'
    }, 500);
  }
});

// ============================================================================
// SUCCESS HANDLER
// ============================================================================

/**
 * GET /checkout/success?session_id=xxx
 * Handle successful payment - redirect user back to app
 */
app.get('/success', async (c) => {
  try {
    const sessionId = c.req.query('session_id');

    if (!sessionId) {
      return c.json({ error: 'No session ID' }, 400);
    }

    console.log(`✅ Payment success for session: ${sessionId}`);

    // Retrieve session from Stripe to verify
    if (STRIPE_SECRET_KEY) {
      const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        }
      });

      if (stripeResponse.ok) {
        const session = await stripeResponse.json();
        console.log(`💳 Session verified: ${session.payment_status}`);
      }
    }

    // Redirect user back to app with success message
    return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Successful</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
          }
          .container {
            max-width: 400px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          h1 { margin: 0 0 20px; font-size: 28px; }
          p { opacity: 0.9; line-height: 1.6; }
          .checkmark {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(16, 185, 129, 0.2);
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="checkmark">✓</div>
          <h1>Payment Successful!</h1>
          <p>Your credits have been added to your account.</p>
          <p style="margin-top: 30px; font-size: 14px; opacity: 0.7;">
            Redirecting back to Cortexia...
          </p>
        </div>
        <script>
          // Redirect back to app after 3 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('❌ Success handler error:', error);
    return c.json({ error: 'Failed to process success' }, 500);
  }
});

// ============================================================================
// CANCEL HANDLER
// ============================================================================

/**
 * GET /checkout/cancel
 * Handle cancelled payment - redirect user back to app
 */
app.get('/cancel', async (c) => {
  console.log('❌ Payment cancelled by user');

  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Cancelled</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
        }
        .container {
          max-width: 400px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 { margin: 0 0 20px; font-size: 28px; }
        p { opacity: 0.9; line-height: 1.6; }
        .icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.2);
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">✕</div>
        <h1>Payment Cancelled</h1>
        <p>No worries! You can try again anytime.</p>
        <p style="margin-top: 30px; font-size: 14px; opacity: 0.7;">
          Redirecting back to Cortexia...
        </p>
      </div>
      <script>
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      </script>
    </body>
    </html>
  `);
});

export default app;