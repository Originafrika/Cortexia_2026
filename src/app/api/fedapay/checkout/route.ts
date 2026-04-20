// API Route: POST /api/fedapay/checkout
// Create Fedapay payment for credit packs

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContextFromHeaders } from '../../middleware';
import { fedapayService } from '$lib/services/fedapay';
import { db } from '$lib/db';
import { fedapayTransactions } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

const CREDIT_PACKS: Record<string, { credits: number; priceXOF: number; packType: string }> = {
  starter_50: { credits: 50, priceXOF: 5000, packType: 'starter_50' },
  pro_200: { credits: 200, priceXOF: 15000, packType: 'pro_200' },
  ultimate_1000: { credits: 1000, priceXOF: 50000, packType: 'ultimate_1000' },
};

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthContextFromHeaders(request.headers);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, phone, country, packType = 'starter_50' } = body;

    if (!amount || !phone || !country) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, phone, country' },
        { status: 400 }
      );
    }

    const pack = CREDIT_PACKS[packType] || CREDIT_PACKS.starter_50;

    const result = await fedapayService.createPayment(
      pack.priceXOF,
      phone,
      country,
      auth.userId
    );

    if (!result.success || !result.transactionId || !result.checkoutUrl) {
      console.error('Fedapay payment creation failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to create payment' },
        { status: 500 }
      );
    }

    await db.insert(fedapayTransactions).values({
      id: result.transactionId,
      userId: auth.userId,
      packType: pack.packType,
      creditsAmount: pack.credits,
      priceXOF: pack.priceXOF,
      status: 'pending',
      paymentMethod: 'mobile_money',
      phoneNumber: phone,
    });

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      checkoutUrl: result.checkoutUrl,
    });

  } catch (error) {
    console.error('Fedapay checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}