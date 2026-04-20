// API Route: POST /api/stripe/subscription/cancel
// Cancel subscription at period end (set cancel_at_period_end)

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContextFromHeaders } from '../../../middleware';
import Stripe from 'stripe';
import { db } from '../../lib/db';
import { stripeSubscriptions } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
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
      .limit(1);

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    const sub = subscriptions[0];

    if (sub.status === 'canceled') {
      return NextResponse.json(
        { error: 'Subscription is already canceled' },
        { status: 400 }
      );
    }

    try {
      await stripe.subscriptions.update(sub.id, {
        cancel_at_period_end: true,
      });
    } catch (err) {
      console.error('Stripe cancel error:', err);
      return NextResponse.json(
        { error: 'Failed to cancel subscription with Stripe' },
        { status: 500 }
      );
    }

    await db.update(stripeSubscriptions)
      .set({
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      })
      .where(eq(stripeSubscriptions.id, sub.id));

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}