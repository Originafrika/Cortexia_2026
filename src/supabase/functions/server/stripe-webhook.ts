/**
 * STRIPE WEBHOOK - Auto-track Purchases & Referral Commissions
 * 
 * Listens to Stripe events and auto-tracks:
 * - Credits purchases
 * - Referral commissions (10% lifetime)
 * - Payment confirmations
 * 
 * Setup:
 * 1. In Stripe Dashboard → Webhooks → Add endpoint
 * 2. URL: https://{projectId}.supabase.co/functions/v1/make-server-e55aa214/stripe/webhook
 * 3. Events to listen:
 *    - checkout.session.completed
 *    - payment_intent.succeeded
 *    - payment_intent.payment_failed
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Stripe webhook secret (get from Stripe Dashboard)
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

// ============================================================================
// WEBHOOK ENDPOINT
// ============================================================================

/**
 * POST /stripe/webhook
 * Handle Stripe webhook events
 */
app.post('/webhook', async (c) => {
  try {
    const sig = c.req.header('stripe-signature');
    const body = await c.req.text();
    
    if (!sig) {
      console.error('❌ No Stripe signature');
      return c.json({ error: 'No signature' }, 400);
    }
    
    // ✅ TODO: Verify Stripe signature
    // const event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
    
    // For now, parse body manually (add signature verification in production)
    const event = JSON.parse(body);
    
    console.log(`📨 Received Stripe event: ${event.type}`);
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
        
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }
    
    return c.json({ received: true });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return c.json({
      error: error instanceof Error ? error.message : 'Webhook failed'
    }, 500);
  }
});

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle checkout.session.completed
 * User completed payment → Add credits & track referral commission
 */
async function handleCheckoutCompleted(session: any) {
  try {
    console.log('💳 Checkout completed:', session.id);
    
    // Extract metadata from session
    const userId = session.metadata?.userId || session.client_reference_id;
    const creditsAmount = parseInt(session.metadata?.credits || '0');
    const purchaseAmount = session.amount_total / 100; // Convert cents to dollars
    
    if (!userId) {
      console.error('❌ No userId in session metadata');
      return;
    }
    
    if (!creditsAmount || creditsAmount <= 0) {
      console.error('❌ Invalid credits amount');
      return;
    }
    
    console.log(`👤 User ${userId} purchased ${creditsAmount} credits for $${purchaseAmount}`);
    
    // 1. Add credits to user
    const userProfile = await kv.get(`user:profile:${userId}`);
    
    if (!userProfile) {
      console.error(`❌ User profile not found: ${userId}`);
      return;
    }
    
    userProfile.paidCredits = (userProfile.paidCredits || 0) + creditsAmount;
    userProfile.updatedAt = new Date().toISOString();
    await kv.set(`user:profile:${userId}`, userProfile);
    
    console.log(`✅ Added ${creditsAmount} paid credits to user ${userId}`);
    
    // 2. Track referral commission (if user was referred)
    if (userProfile.referredBy) {
      await trackReferralCommission(
        userId,
        userProfile.referredBy,
        purchaseAmount,
        creditsAmount
      );
    }
    
    // 3. Log purchase transaction
    const transaction = {
      id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'purchase',
      amount: purchaseAmount,
      credits: creditsAmount,
      stripeSessionId: session.id,
      date: new Date().toISOString(),
      status: 'completed'
    };
    
    const transactionsKey = `purchases:${userId}`;
    const transactions = await kv.get(transactionsKey) || [];
    transactions.push(transaction);
    await kv.set(transactionsKey, transactions);
    
    console.log(`✅ Purchase logged: ${transaction.id}`);
    
  } catch (error) {
    console.error('❌ Handle checkout error:', error);
  }
}

/**
 * Handle payment_intent.succeeded
 * Payment confirmed → Update transaction status
 */
async function handlePaymentSucceeded(paymentIntent: any) {
  try {
    console.log('💰 Payment succeeded:', paymentIntent.id);
    
    const userId = paymentIntent.metadata?.userId;
    
    if (!userId) {
      console.log('⚠️ No userId in payment metadata');
      return;
    }
    
    // Find transaction and update status
    const transactionsKey = `purchases:${userId}`;
    const transactions = await kv.get(transactionsKey) || [];
    
    const transaction = transactions.find((t: any) => 
      t.stripePaymentIntentId === paymentIntent.id
    );
    
    if (transaction) {
      transaction.status = 'succeeded';
      transaction.updatedAt = new Date().toISOString();
      await kv.set(transactionsKey, transactions);
      
      console.log(`✅ Transaction updated: ${transaction.id}`);
    }
    
  } catch (error) {
    console.error('❌ Handle payment succeeded error:', error);
  }
}

/**
 * Handle payment_intent.payment_failed
 * Payment failed → Log failure
 */
async function handlePaymentFailed(paymentIntent: any) {
  try {
    console.log('❌ Payment failed:', paymentIntent.id);
    
    const userId = paymentIntent.metadata?.userId;
    
    if (!userId) {
      console.log('⚠️ No userId in payment metadata');
      return;
    }
    
    // Log failure
    const failureLog = {
      id: `failure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'payment_failed',
      stripePaymentIntentId: paymentIntent.id,
      error: paymentIntent.last_payment_error?.message || 'Unknown error',
      date: new Date().toISOString()
    };
    
    const failuresKey = `payment_failures:${userId}`;
    const failures = await kv.get(failuresKey) || [];
    failures.push(failureLog);
    await kv.set(failuresKey, failures);
    
    console.log(`❌ Payment failure logged: ${failureLog.id}`);
    
  } catch (error) {
    console.error('❌ Handle payment failed error:', error);
  }
}

// ============================================================================
// REFERRAL COMMISSION TRACKING
// ============================================================================

/**
 * Track referral commission (10% of purchase)
 */
async function trackReferralCommission(
  buyerUserId: string,
  referrerId: string,
  purchaseAmount: number,
  creditsAmount: number
) {
  try {
    // Calculate 10% commission
    const commission = purchaseAmount * 0.10;
    
    console.log(`🎁 Tracking referral commission: $${commission.toFixed(2)} for referrer ${referrerId}`);
    
    // Get referrer profile
    const referrerProfile = await kv.get(`user:profile:${referrerId}`);
    
    if (!referrerProfile) {
      console.error(`❌ Referrer profile not found: ${referrerId}`);
      return;
    }
    
    // Create commission transaction
    const transactionId = `commission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transaction = {
      id: transactionId,
      referrerId,
      fromUserId: buyerUserId,
      amount: commission,
      purchaseAmount,
      purchaseType: 'credits',
      creditsAmount,
      date: new Date().toISOString(),
      status: 'pending' // Will be paid out later
    };
    
    // Save transaction
    const transactionsKey = `referral:transactions:${referrerId}`;
    const transactions = await kv.get(transactionsKey) || [];
    transactions.push(transaction);
    await kv.set(transactionsKey, transactions);
    
    // Update referrer earnings
    referrerProfile.referralEarnings = (referrerProfile.referralEarnings || 0) + commission;
    referrerProfile.updatedAt = new Date().toISOString();
    await kv.set(`user:profile:${referrerId}`, referrerProfile);
    
    console.log(`✅ Commission tracked: ${transactionId} → $${commission.toFixed(2)}`);
    
    // ✅ TODO: Send notification to referrer
    // await sendReferralCommissionEmail(referrerId, commission);
    
  } catch (error) {
    console.error('❌ Track commission error:', error);
  }
}

// ============================================================================
// MANUAL TRIGGER (FOR TESTING)
// ============================================================================

/**
 * POST /stripe/test-purchase
 * Manually simulate a purchase (for testing without Stripe)
 */
app.post('/test-purchase', async (c) => {
  try {
    const { userId, credits, amount } = await c.req.json();
    
    if (!userId || !credits || !amount) {
      return c.json({
        success: false,
        error: 'userId, credits, and amount required'
      }, 400);
    }
    
    console.log(`🧪 TEST: Simulating purchase for user ${userId}`);
    
    // Simulate checkout session
    const mockSession = {
      id: `test_session_${Date.now()}`,
      metadata: { userId, credits: credits.toString() },
      client_reference_id: userId,
      amount_total: amount * 100, // Convert to cents
    };
    
    await handleCheckoutCompleted(mockSession);
    
    return c.json({
      success: true,
      message: 'Test purchase processed',
      userId,
      credits,
      amount
    });
    
  } catch (error) {
    console.error('❌ Test purchase error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed'
    }, 500);
  }
});

export default app;
