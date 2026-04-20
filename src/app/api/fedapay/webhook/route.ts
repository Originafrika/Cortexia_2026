// API Route: POST /api/fedapay/webhook
// Handle Fedapay webhook for payment confirmation

import { NextRequest, NextResponse } from 'next/server';
import { env } from '$env/dynamic/private';
import { fedapayService } from '$lib/services/fedapay';
import { db } from '$lib/db';
import { fedapayTransactions } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { addCredits } from '$lib/credits/service';

const FEDAPAY_WEBHOOK_SECRET = env.FEDAPAY_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-fedapay-signature');
    
    if (!signature && FEDAPAY_WEBHOOK_SECRET) {
      console.log('Fedapay webhook: No signature header, skipping verification');
    }

    const payload = await request.json();
    const { transaction_id, status, amount, currency } = payload;

    if (!transaction_id) {
      return NextResponse.json(
        { error: 'Missing transaction_id' },
        { status: 400 }
      );
    }

    const existingTx = await db.select()
      .from(fedapayTransactions)
      .where(eq(fedapayTransactions.id, transaction_id))
      .limit(1);

    if (existingTx.length === 0) {
      console.error('Transaction not found:', transaction_id);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const currentTx = existingTx[0];
    
    let dbStatus: 'pending' | 'processing' | 'completed' | 'failed' = 'pending';
    if (status === 'approved') {
      dbStatus = 'completed';
    } else if (status === 'pending' || status === 'processing') {
      dbStatus = 'processing';
    } else if (status === 'declined' || status === 'cancelled' || status === 'refunded') {
      dbStatus = 'failed';
    }

    await db.update(fedapayTransactions)
      .set({
        status: dbStatus,
        fedapayCallbackData: payload,
        completedAt: dbStatus === 'completed' ? new Date() : undefined,
      })
      .where(eq(fedapayTransactions.id, transaction_id));

    if (status === 'approved') {
      try {
        await addCredits(
          currentTx.userId,
          currentTx.creditsAmount,
          'purchase_fedapay',
          transaction_id
        );
        console.log('Credits added to user:', currentTx.userId, currentTx.creditsAmount);
      } catch (creditError) {
        console.error('Failed to add credits:', creditError);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Fedapay webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}