// API Route: GET /api/stripe/subscription
// Get subscription status for authenticated user

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContextFromHeaders } from '../../../middleware';
import Stripe from 'stripe';
import { db } from '../../lib/db';
import { stripeSubscriptions, enterpriseWallets } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthContextFromHeaders(request.headers);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = auth.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'No organization found for user' },
        { status: 400 }
      );
    }

    const subscriptions = await db.select()
      .from(stripeSubscriptions)
      .where(eq(stripeSubscriptions.organizationId, organizationId))
      .orderBy(stripeSubscriptions.createdAt)
      .limit(1);

    if (subscriptions.length === 0) {
      return NextResponse.json({
        status: 'none',
        currentPeriodEnd: null,
        planName: null,
      });
    }

    const sub = subscriptions[0];

    let stripeSubscription: Stripe.Subscription | null = null;
    try {
      stripeSubscription = await stripe.subscriptions.retrieve(sub.id);
    } catch (err) {
      console.warn('Could not retrieve Stripe subscription:', err);
    }

    const status = sub.status === 'active' && stripeSubscription?.cancel_at_period_end
      ? 'canceling'
      : sub.status;

    const currentPeriodEnd = stripeSubscription?.current_period_end
      ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
      : sub.currentPeriodEnd?.toISOString() || null;

    const planName = sub.plan || 'enterprise';

    return NextResponse.json({
      status,
      currentPeriodEnd,
      planName,
      cancelAtPeriodEnd: stripeSubscription?.cancel_at_period_end || false,
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}