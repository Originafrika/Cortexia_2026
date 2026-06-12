// API Route: POST /api/coconut/cocoboard
// Creates a new CocoBoard job and generates blueprint using LLM cascade

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContextFromHeaders } from '../../../middleware';
import { llmCascade } from '../../../lib/ai/llmCascade';
import { db } from '../../../lib/db';
import { cocoboardJobs, creditTransactions, users } from '../../../lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { generationRateLimit } from '../../../lib/middleware/rateLimit';
import { coconutOrchestrator } from '../../../lib/coconut/orchestrator';

const BLUEPRINT_COST = 100;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for generation
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    const authContext = getAuthContextFromHeaders(request.headers);
    const rateLimitResult = await generationRateLimit(ip, authContext?.userId);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Limite de génération atteinte. Réessayez plus tard.', remaining: 0 },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      );
    }

    // Auth check
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { mode, intent, assets = [] } = body;

    if (!mode || !intent) {
      return NextResponse.json(
        { error: 'Missing required fields: mode, intent' },
        { status: 400 }
      );
    }

    // Check user credits
    const user = await db.select().from(users).where(eq(users.id, authContext.userId)).limit(1);
    if (user.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const totalBalance = user[0].premiumBalance + user[0].freeBalance;
    if (totalBalance < BLUEPRINT_COST) {
      return NextResponse.json({ error: 'Crédits insuffisants pour générer un CocoBoard (100 cr. requis)' }, { status: 402 });
    }

    // Atomic credit debit for blueprint
    let remainingToDebit = BLUEPRINT_COST;
    let freeDebit = 0;
    let premiumDebit = 0;

    if (user[0].freeBalance >= remainingToDebit) {
      freeDebit = remainingToDebit;
      remainingToDebit = 0;
    } else {
      freeDebit = user[0].freeBalance;
      remainingToDebit -= freeDebit;
      premiumDebit = remainingToDebit;
    }

    await db.transaction(async (tx) => {
      await tx.update(users)
        .set({
          freeBalance: sql`${users.freeBalance} - ${freeDebit}`,
          premiumBalance: sql`${users.premiumBalance} - ${premiumDebit}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, authContext.userId));

      await tx.insert(creditTransactions).values({
        id: uuidv4(),
        ownerType: 'user',
        ownerId: authContext.userId,
        amount: -BLUEPRINT_COST,
        type: 'cocoboard',
        source: premiumDebit > 0 ? 'premium' : 'free',
        reason: `Génération CocoBoard: ${intent.slice(0, 50)}...`,
        createdAt: new Date(),
      });
    });

    // Create job in database
    const jobId = uuidv4();
    const now = new Date();

    await db.insert(cocoboardJobs).values({
      id: jobId,
      ownerType: 'user',
      ownerId: authContext.userId,
      mode: mode,
      intent,
      assets,
      status: 'analyzing',
      cocoboard: null,
      creditsCocoboard: BLUEPRINT_COST,
      creditsGenerationEstimated: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Generate blueprint (Agent logic)
    // We do it synchronously here for simplicity, but in prod it should be via QStash
    const result = await coconutOrchestrator.generateBlueprint({
      mode,
      intent,
      assets,
      userId: authContext.userId,
    });

    if (!result.success || !result.blueprint) {
      // Refund credits on failure
      await db.transaction(async (tx) => {
         await tx.update(users)
          .set({
            freeBalance: sql`${users.freeBalance} + ${freeDebit}`,
            premiumBalance: sql`${users.premiumBalance} + ${premiumDebit}`,
          })
          .where(eq(users.id, authContext.userId));

         await tx.update(cocoboardJobs)
          .set({ status: 'failed', errorMessage: result.error || 'Blueprint generation failed' })
          .where(eq(cocoboardJobs.id, jobId));
      });

      return NextResponse.json({ error: result.error || 'Failed to generate blueprint' }, { status: 500 });
    }

    // Update job with generated blueprint
    await db.update(cocoboardJobs)
      .set({
        status: 'awaiting_validation',
        cocoboard: result.blueprint,
        creditsGenerationEstimated: result.blueprint.estimatedCredits || 0,
        updatedAt: new Date()
      })
      .where(eq(cocoboardJobs.id, jobId));

    return NextResponse.json({
      success: true,
      jobId,
      status: 'awaiting_validation',
      blueprint: result.blueprint,
    });

  } catch (error) {
    console.error('CocoBoard creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
