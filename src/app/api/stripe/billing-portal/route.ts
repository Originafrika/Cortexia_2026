// API Route: POST /api/stripe/billing-portal
// Create billing portal session for customer management

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
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    const sub = subscriptions[0];

    let stripeSubscription: Stripe.Subscription;
    try {
      stripeSubscription = await stripe.subscriptions.retrieve(sub.id);
    } catch (err) {
      console.error('Stripe retrieve error:', err);
      return NextResponse.json(
        { error: 'Could not find subscription in Stripe' },
        { status: 404 }
      );
    }

    if (!stripeSubscription.customer) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 400 }
      );
    }

    const customerId = typeof stripeSubscription.customer === 'string'
      ? stripeSubscription.customer
      : stripeSubscription.customer.id;

    const returnUrl = request.json().then((body) => body.returnUrl)
      .catch(() => null) || process.env.NEXT_PUBLIC_APP_URL || 'https://cortexia.figma.site';

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return NextResponse.json({
      url: session.url,
    });

  } catch (error) {
    console.error('Billing portal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}