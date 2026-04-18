// API Route: POST /api/stripe/checkout
// Create checkout session for Enterprise subscription or credit packs

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContextFromHeaders } from '../../middleware';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthContextFromHeaders(request.headers);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, successUrl, cancelUrl } = body;

    if (!['enterprise', 'credits_1000', 'credits_5000', 'credits_10000'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid checkout type' },
        { status: 400 }
      );
    }

    const priceIds: Record<string, string> = {
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE!,
      credits_1000: process.env.STRIPE_PRICE_CREDITS_1000!,
      credits_5000: process.env.STRIPE_PRICE_CREDITS_5000!,
      credits_10000: process.env.STRIPE_PRICE_CREDITS_10000!,
    };

    const priceId = priceIds[type];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not configured' },
        { status: 500 }
      );
    }

    const mode = type === 'enterprise' ? 'subscription' : 'payment';

    const session = await stripe.checkout.sessions.create({
      customer_email: auth.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode as 'subscription' | 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=cancel`,
      metadata: {
        userId: auth.userId,
        organizationId: auth.organizationId || '',
        type: type,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
