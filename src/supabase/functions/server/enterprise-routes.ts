/**
 * ENTERPRISE SUBSCRIPTION ROUTES
 * 
 * Endpoints:
 * - POST /enterprise/subscription/create - Create subscription
 * - GET  /enterprise/subscription/status - Get subscription status
 * - POST /enterprise/subscription/cancel - Cancel subscription
 * - POST /enterprise/addon/purchase - Purchase add-on credits
 * - GET  /enterprise/credits - Get credit balance
 * - GET  /enterprise/transactions - Get transaction history
 * - GET  /enterprise/access - Check access to Coconut V14
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import * as enterprise from './enterprise-subscription.ts';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ✅ CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Stripe keys
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';

// Pricing
const MONTHLY_SUBSCRIPTION_PRICE = 999; // $999/month for 10,000 credits

// ============================================================================
// CREATE SUBSCRIPTION
// ============================================================================

/**
 * POST /enterprise/subscription/create
 * Create Stripe subscription for enterprise user
 */
app.post('/subscription/create', async (c) => {
  try {
    const { userId } = await c.req.json();

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    console.log(`📋 [Enterprise] Creating subscription for ${userId}`);

    // Check if user already has subscription
    const existing = await enterprise.getEnterpriseSubscription(userId);
    if (existing && existing.subscriptionStatus === 'active') {
      return c.json({
        success: false,
        error: 'User already has an active subscription',
      }, 400);
    }

    // Get user profile
    const userProfile = await kv.get(`user:profile:${userId}`);
    if (!userProfile) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Verify user is enterprise
    if (userProfile.accountType !== 'enterprise') {
      return c.json({
        success: false,
        error: 'Only enterprise users can subscribe',
      }, 403);
    }

    if (!STRIPE_SECRET_KEY) {
      // TEST MODE: Create fake subscription
      console.warn('⚠️ STRIPE_SECRET_KEY not set - using test mode');
      
      const sub = await enterprise.createEnterpriseSubscription(
        userId,
        `cus_test_${Date.now()}`,
        `sub_test_${Date.now()}`
      );

      return c.json({
        success: true,
        testMode: true,
        subscription: {
          id: sub.stripeSubscriptionId,
          status: sub.subscriptionStatus,
          credits: sub.totalCredits,
          nextResetDate: sub.nextResetDate,
        },
      });
    }

    // Create or get Stripe customer
    let customerId = userProfile.stripeCustomerId;

    if (!customerId) {
      const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: userProfile.email || '',
          name: userProfile.fullName || userProfile.username || '',
          'metadata[userId]': userId,
          'metadata[userType]': 'enterprise',
        }).toString(),
      });

      if (!customerResponse.ok) {
        const error = await customerResponse.text();
        console.error('❌ Failed to create Stripe customer:', error);
        return c.json({ success: false, error: 'Failed to create customer' }, 500);
      }

      const customer = await customerResponse.json();
      customerId = customer.id;

      // Save customer ID
      userProfile.stripeCustomerId = customerId;
      await kv.set(`user:profile:${userId}`, userProfile);

      console.log(`✅ Stripe customer created: ${customerId}`);
    }

    // Create Checkout Session
    const frontendUrl = 'https://cortexia.figma.site'; // ✅ Fixed: Use actual Figma Make domain

    const sessionResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        mode: 'subscription',
        customer: customerId,
        success_url: `${frontendUrl}/enterprise-subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/coconut-v14`,
        'client_reference_id': userId,
        'metadata[userId]': userId,
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][unit_amount]': (MONTHLY_SUBSCRIPTION_PRICE * 100).toString(),
        'line_items[0][price_data][recurring][interval]': 'month',
        'line_items[0][price_data][product_data][name]': 'Cortexia Enterprise - Coconut V14',
        'line_items[0][price_data][product_data][description]': '10,000 credits per month',
        'line_items[0][quantity]': '1',
      }).toString(),
    });

    if (!sessionResponse.ok) {
      const error = await sessionResponse.text();
      console.error('❌ Failed to create checkout session:', error);
      return c.json({ success: false, error: 'Failed to create checkout' }, 500);
    }

    const session = await sessionResponse.json();

    console.log(`✅ Subscription checkout created: ${session.id}`);

    return c.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('❌ Create subscription error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create subscription',
    }, 500);
  }
});

// ============================================================================
// VERIFY SUBSCRIPTION
// ============================================================================

/**
 * GET /enterprise/subscription/verify?session_id=xxx
 * Verify and activate subscription
 */
app.get('/subscription/verify', async (c) => {
  try {
    const sessionId = c.req.query('session_id');

    if (!sessionId) {
      return c.json({ success: false, error: 'session_id is required' }, 400);
    }

    console.log(`🔍 [Enterprise] Verifying session: ${sessionId}`);

    // Retrieve session from Stripe
    const sessionResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=subscription`,
      {
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        },
      }
    );

    if (!sessionResponse.ok) {
      const error = await sessionResponse.text();
      console.error('❌ Stripe API error:', error);
      return c.json({ success: false, error: 'Failed to verify session' }, 500);
    }

    const session = await sessionResponse.json();
    const userId = session.metadata?.userId || session.client_reference_id;

    if (!userId) {
      return c.json({ success: false, error: 'No userId in session' }, 400);
    }

    const subscription = session.subscription;

    if (!subscription) {
      return c.json({ success: false, error: 'No subscription found' }, 400);
    }

    // Create enterprise subscription
    const enterpriseSub = await enterprise.createEnterpriseSubscription(
      userId,
      session.customer,
      subscription.id
    );

    console.log(`✅ Enterprise subscription activated for ${userId}`);

    return c.json({
      success: true,
      subscription: {
        id: enterpriseSub.stripeSubscriptionId,
        status: enterpriseSub.subscriptionStatus,
        credits: enterpriseSub.totalCredits,
        monthlyCredits: enterpriseSub.monthlyCredits,
        nextResetDate: enterpriseSub.nextResetDate,
      },
    });

  } catch (error) {
    console.error('❌ Verify subscription error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify',
    }, 500);
  }
});

// ============================================================================
// GET SUBSCRIPTION STATUS
// ============================================================================

/**
 * GET /enterprise/subscription/status?userId=xxx
 */
app.get('/subscription/status', async (c) => {
  try {
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }
    
    // ✅ DEBUG: Check what's in the KV store before migration
    const kvPaidCredits = await kv.get(`credits:${userId}:paid`);
    console.log(`🔍 [Debug] KV paid credits before getEnterpriseSubscription: ${kvPaidCredits}`);

    const sub = await enterprise.getEnterpriseSubscription(userId);
    
    // ✅ DEBUG: Check what's in the KV store after migration
    const kvPaidCreditsAfter = await kv.get(`credits:${userId}:paid`);
    console.log(`🔍 [Debug] KV paid credits after getEnterpriseSubscription: ${kvPaidCreditsAfter}`);

    if (!sub) {
      return c.json({
        success: true,
        hasSubscription: false,
      });
    }
    
    console.log(`💎 [Enterprise] Status for ${userId}: monthly=${sub.subscriptionCreditsRemaining}, addon=${sub.addOnCredits}, total=${sub.totalCredits}`);

    return c.json({
      success: true,
      hasSubscription: true,
      subscription: {
        status: sub.subscriptionStatus,
        monthlyCredits: sub.monthlyCredits,
        subscriptionCreditsRemaining: sub.subscriptionCreditsRemaining,
        addOnCredits: sub.addOnCredits,
        totalCredits: sub.totalCredits,
        nextResetDate: sub.nextResetDate,
        currentPeriodEnd: sub.currentPeriodEnd,
      },
    });

  } catch (error) {
    console.error('❌ Get status error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get status',
    }, 500);
  }
});

// ============================================================================
// CANCEL SUBSCRIPTION
// ============================================================================

/**
 * POST /enterprise/subscription/cancel
 * Cancel subscription (at period end)
 */
app.post('/subscription/cancel', async (c) => {
  try {
    const { userId } = await c.req.json();

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    const sub = await enterprise.getEnterpriseSubscription(userId);

    if (!sub) {
      return c.json({ success: false, error: 'No subscription found' }, 404);
    }

    console.log(`❌ [Enterprise] Cancelling subscription: ${sub.stripeSubscriptionId}`);

    if (!STRIPE_SECRET_KEY) {
      // TEST MODE
      await enterprise.cancelEnterpriseSubscription(userId);
      return c.json({
        success: true,
        testMode: true,
        message: 'Subscription cancelled (test mode)',
      });
    }

    // Cancel at period end
    const cancelResponse = await fetch(
      `https://api.stripe.com/v1/subscriptions/${sub.stripeSubscriptionId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          cancel_at_period_end: 'true',
        }).toString(),
      }
    );

    if (!cancelResponse.ok) {
      const error = await cancelResponse.text();
      console.error('❌ Failed to cancel subscription:', error);
      return c.json({ success: false, error: 'Failed to cancel' }, 500);
    }

    const subscription = await cancelResponse.json();

    await enterprise.cancelEnterpriseSubscription(userId);

    console.log(`✅ Subscription will cancel at: ${new Date(subscription.cancel_at * 1000).toISOString()}`);

    return c.json({
      success: true,
      message: 'Subscription will cancel at period end',
      cancelAt: new Date(subscription.cancel_at * 1000).toISOString(),
    });

  } catch (error) {
    console.error('❌ Cancel subscription error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel',
    }, 500);
  }
});

// ============================================================================
// PURCHASE ADD-ON CREDITS
// ============================================================================

/**
 * POST /enterprise/addon/purchase
 * Purchase add-on credits (one-time payment)
 */
app.post('/addon/purchase', async (c) => {
  try {
    const { userId, credits } = await c.req.json();

    if (!userId || !credits) {
      return c.json({ success: false, error: 'userId and credits required' }, 400);
    }

    const minimum = enterprise.getMinimumAddonPurchase();

    if (credits < minimum.credits) {
      return c.json({
        success: false,
        error: `Minimum purchase is ${minimum.credits} credits ($${minimum.price})`,
      }, 400);
    }

    console.log(`💳 [Enterprise] Creating add-on purchase for ${userId}: ${credits} credits`);

    const sub = await enterprise.getEnterpriseSubscription(userId);

    if (!sub) {
      return c.json({ success: false, error: 'No subscription found' }, 404);
    }

    if (!STRIPE_SECRET_KEY) {
      // TEST MODE
      await enterprise.addEnterpriseAddonCredits(userId, credits);
      return c.json({
        success: true,
        testMode: true,
        credits,
        message: `${credits} add-on credits added (test mode)`,
      });
    }

    const price = enterprise.calculateAddonPrice(credits);
    const frontendUrl = 'https://cortexia.figma.site'; // ✅ Fixed: Use actual Figma Make domain

    // Create Checkout Session
    const sessionResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        mode: 'payment',
        customer: sub.stripeCustomerId,
        success_url: `${frontendUrl}/enterprise-addon-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/coconut-v14`,
        'client_reference_id': userId,
        'metadata[userId]': userId,
        'metadata[credits]': credits.toString(),
        'metadata[type]': 'addon',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][unit_amount]': Math.round(price * 100).toString(),
        'line_items[0][price_data][product_data][name]': `${credits} Add-on Credits`,
        'line_items[0][price_data][product_data][description]': `Additional credits for Coconut V14 ($${(price / credits).toFixed(2)}/credit)`,
        'line_items[0][quantity]': '1',
      }).toString(),
    });

    if (!sessionResponse.ok) {
      const error = await sessionResponse.text();
      console.error('❌ Failed to create checkout session:', error);
      return c.json({ success: false, error: 'Failed to create checkout' }, 500);
    }

    const session = await sessionResponse.json();

    console.log(`✅ Add-on checkout created: ${session.id}`);

    return c.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('❌ Purchase add-on error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to purchase',
    }, 500);
  }
});

// ============================================================================
// VERIFY ADD-ON PURCHASE
// ============================================================================

/**
 * GET /enterprise/addon/verify?session_id=xxx
 */
app.get('/addon/verify', async (c) => {
  try {
    const sessionId = c.req.query('session_id');

    if (!sessionId) {
      return c.json({ success: false, error: 'session_id is required' }, 400);
    }

    console.log(`🔍 [Enterprise] Verifying add-on session: ${sessionId}`);

    // Retrieve session from Stripe
    const sessionResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      {
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        },
      }
    );

    if (!sessionResponse.ok) {
      const error = await sessionResponse.text();
      console.error('❌ Stripe API error:', error);
      return c.json({ success: false, error: 'Failed to verify session' }, 500);
    }

    const session = await sessionResponse.json();

    if (session.payment_status !== 'paid') {
      return c.json({ success: false, error: 'Payment not completed' }, 400);
    }

    const userId = session.metadata?.userId || session.client_reference_id;
    const credits = parseInt(session.metadata?.credits || '0');

    if (!userId || !credits) {
      return c.json({ success: false, error: 'Invalid session metadata' }, 400);
    }

    // Add credits
    await enterprise.addEnterpriseAddonCredits(userId, credits, session.payment_intent);

    console.log(`✅ Add-on credits added to ${userId}: ${credits} credits`);

    return c.json({
      success: true,
      credits,
      message: `${credits} add-on credits added successfully`,
    });

  } catch (error) {
    console.error('❌ Verify add-on error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify',
    }, 500);
  }
});

// ============================================================================
// GET CREDITS
// ============================================================================

/**
 * GET /enterprise/credits?userId=xxx
 */
app.get('/credits', async (c) => {
  try {
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    const details = await enterprise.getEnterpriseBalanceDetails(userId);

    if (!details) {
      return c.json({ success: false, error: 'No subscription found' }, 404);
    }

    return c.json({
      success: true,
      credits: details,
    });

  } catch (error) {
    console.error('❌ Get credits error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get credits',
    }, 500);
  }
});

// ============================================================================
// GET TRANSACTIONS
// ============================================================================

/**
 * GET /enterprise/transactions?userId=xxx&limit=50
 */
app.get('/transactions', async (c) => {
  try {
    const userId = c.req.query('userId');
    const limit = parseInt(c.req.query('limit') || '50');

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    const transactions = await enterprise.getEnterpriseTransactions(userId, limit);

    return c.json({
      success: true,
      transactions,
    });

  } catch (error) {
    console.error('❌ Get transactions error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get transactions',
    }, 500);
  }
});

// ============================================================================
// CHECK ACCESS
// ============================================================================

/**
 * GET /enterprise/access?userId=xxx
 * ✅ SECURITY: Check if user has active subscription and can access Coconut V14
 */
app.get('/access', async (c) => {
  try {
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    const accessCheck = await enterprise.checkEnterpriseAccess(userId);

    return c.json({
      success: true,
      ...accessCheck,
    });

  } catch (error) {
    console.error('❌ Check access error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check access',
    }, 500);
  }
});

// ============================================================================
// DEBUG / TEST ROUTES
// ============================================================================

/**
 * POST /enterprise/test/create-subscription
 * Create a test subscription for enterprise user (bypasses Stripe)
 */
app.post('/test/create-subscription', async (c) => {
  try {
    const { userId } = await c.req.json();

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    console.log(`🧪 [TEST] Creating test subscription for ${userId}`);

    // Get user profile
    const userProfile = await kv.get(`user:profile:${userId}`);
    if (!userProfile) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    // Verify user is enterprise
    if (userProfile.accountType !== 'enterprise') {
      return c.json({
        success: false,
        error: 'Only enterprise users can subscribe',
      }, 403);
    }

    // Create test subscription
    const sub = await enterprise.createEnterpriseSubscription(
      userId,
      `cus_test_${Date.now()}`,
      `sub_test_${Date.now()}`
    );

    console.log(`✅ [TEST] Subscription created:`, sub);

    return c.json({
      success: true,
      testMode: true,
      subscription: {
        id: sub.stripeSubscriptionId,
        status: sub.subscriptionStatus,
        monthlyCredits: sub.monthlyCredits,
        subscriptionCreditsRemaining: sub.subscriptionCreditsRemaining,
        addOnCredits: sub.addOnCredits,
        totalCredits: sub.totalCredits,
        nextResetDate: sub.nextResetDate,
        currentPeriodEnd: sub.currentPeriodEnd,
      },
    });

  } catch (error) {
    console.error('❌ Test subscription error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
    }, 500);
  }
});

/**
 * POST /enterprise/test/force-migration
 * Force migration of paid credits to add-on credits (DEBUG ONLY)
 */
app.post('/test/force-migration', async (c) => {
  try {
    const { userId } = await c.req.json();

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    console.log(`🔧 [DEBUG] Force migration for ${userId}`);

    // Get current state
    const kvPaidCredits = await kv.get(`credits:${userId}:paid`) || 0;
    const sub = await enterprise.getEnterpriseSubscription(userId);

    if (!sub) {
      return c.json({ success: false, error: 'No subscription found' }, 404);
    }

    console.log(`📊 [DEBUG] Current state:
      - KV paid credits: ${kvPaidCredits}
      - Subscription add-on: ${sub.addOnCredits}
      - Subscription total: ${sub.totalCredits}
    `);

    // Force migration by calling getEnterpriseSubscription again
    // (it will auto-migrate if there are unmigrated credits)
    const updatedSub = await enterprise.getEnterpriseSubscription(userId);
    
    const kvPaidCreditsAfter = await kv.get(`credits:${userId}:paid`) || 0;

    console.log(`📊 [DEBUG] After migration:
      - KV paid credits: ${kvPaidCreditsAfter}
      - Subscription add-on: ${updatedSub?.addOnCredits}
      - Subscription total: ${updatedSub?.totalCredits}
    `);

    return c.json({
      success: true,
      before: {
        kvPaidCredits: Number(kvPaidCredits),
        subAddOn: sub.addOnCredits,
        subTotal: sub.totalCredits,
      },
      after: {
        kvPaidCredits: Number(kvPaidCreditsAfter),
        subAddOn: updatedSub?.addOnCredits || 0,
        subTotal: updatedSub?.totalCredits || 0,
      },
      migrated: Number(kvPaidCredits) - Number(kvPaidCreditsAfter),
    });

  } catch (error) {
    console.error('❌ Force migration error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed',
    }, 500);
  }
});

export default app;