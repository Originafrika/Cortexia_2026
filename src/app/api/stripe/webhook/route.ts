// API Route: POST /api/stripe/webhook
// Handle Stripe webhook events for subscriptions and payments

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '../../lib/db';
import { stripeSubscriptions, enterpriseWallets, enterpriseCreditPackPurchases } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Stripe webhook received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const organizationId = session.metadata?.organizationId;
  const type = session.metadata?.type;

  if (!userId || !type) {
    console.error('Missing metadata in checkout session');
    return;
  }

  if (type === 'enterprise') {
    // Subscription created
    await db.insert(stripeSubscriptions).values({
      id: session.subscription as string,
      userId,
      organizationId: organizationId || null,
      status: 'active',
      plan: 'enterprise',
      creditsIncluded: 10000,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Initialize or update enterprise wallet
    const existingWallet = await db.select()
      .from(enterpriseWallets)
      .where(eq(enterpriseWallets.organizationId, organizationId || ''))
      .limit(1);

    if (existingWallet.length === 0) {
      await db.insert(enterpriseWallets).values({
        id: crypto.randomUUID(),
        organizationId: organizationId || crypto.randomUUID(),
        monthlyCredits: 10000,
        monthlyCreditsConsumed: 0,
        monthlyResetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        packCredits: 0,
        packCreditsConsumed: 0,
        totalConsumed: 0,
        updatedAt: new Date(),
      });
    } else {
      await db.update(enterpriseWallets)
        .set({
          monthlyCredits: 10000,
          monthlyResetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        })
        .where(eq(enterpriseWallets.organizationId, organizationId || ''));
    }
  } else if (type.startsWith('credits_')) {
    // Credit pack purchase
    const creditsMap: Record<string, number> = {
      credits_1000: 1000,
      credits_5000: 5000,
      credits_10000: 10000,
    };
    const creditsPurchased = creditsMap[type] || 0;

    await db.insert(enterpriseCreditPackPurchases).values({
      id: session.id,
      userId,
      organizationId: organizationId || null,
      stripePaymentIntentId: session.payment_intent as string,
      creditsPurchased,
      amountUsd: type === 'credits_1000' ? 90 : type === 'credits_5000' ? 425 : 800,
      status: 'completed',
      createdAt: new Date(),
    });

    // Add credits to wallet
    const wallet = await db.select()
      .from(enterpriseWallets)
      .where(eq(enterpriseWallets.organizationId, organizationId || ''))
      .limit(1);

    if (wallet.length > 0) {
      await db.update(enterpriseWallets)
        .set({
          packCredits: wallet[0].packCredits + creditsPurchased,
          updatedAt: new Date(),
        })
        .where(eq(enterpriseWallets.organizationId, organizationId || ''));
    }
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Handle subscription renewal
  if (invoice.subscription) {
    await db.update(stripeSubscriptions)
      .set({
        status: 'active',
        currentPeriodStart: new Date(invoice.period_start * 1000),
        currentPeriodEnd: new Date(invoice.period_end * 1000),
        updatedAt: new Date(),
      })
      .where(eq(stripeSubscriptions.id, invoice.subscription as string));
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await db.update(stripeSubscriptions)
    .set({
      status: 'canceled',
      cancelAtPeriodEnd: true,
      updatedAt: new Date(),
    })
    .where(eq(stripeSubscriptions.id, subscription.id));
}
