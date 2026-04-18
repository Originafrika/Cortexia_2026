// API Route: POST /api/coconut/cocoboard
// Creates a new CocoBoard job and generates blueprint using LLM cascade

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContextFromHeaders } from '../../../middleware';
import { llmCascadeService } from '../../../lib/ai/llmCascade';
import { CoconutMode, createJobResponseSchema, blueprintSchema } from '../../../lib/coconut/schemas';
import { db } from '../../../lib/db';
import { cocoboardJobs } from '../../../lib/db/schema';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const auth = getAuthContextFromHeaders(request.headers);
    if (!auth) {
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

    // Validate mode
    if (!['image', 'video', 'campaign'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be image, video, or campaign' },
        { status: 400 }
      );
    }

    // Create job in database
    const jobId = uuidv4();
    const now = new Date();

    await db.insert(cocoboardJobs).values({
      id: jobId,
      userId: auth.userId,
      organizationId: auth.organizationId || null,
      mode: mode as CoconutMode,
      intent,
      assets,
      status: 'analyzing',
      cocoboard: null,
      creditsConsumedCocoboard: 0,
      creditsConsumedGeneration: 0,
      estimatedCreditsCocoboard: 100, // Fixed cost for blueprint generation
      estimatedCreditsGeneration: 0, // Will be calculated after blueprint
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      errorMessage: null,
    });

    // Trigger async blueprint generation via QStash
    const qstashResponse = await fetch(
      `${process.env.QSTASH_URL}/v2/publish`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.QSTASH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/qstash/cocoboard-analyze`,
          body: { jobId, mode, intent, assets },
          retries: 3,
        }),
      }
    );

    if (!qstashResponse.ok) {
      // Update job status to failed
      await db.update(cocoboardJobs)
        .set({ status: 'failed', errorMessage: 'Failed to queue analysis' })
        .where(eq(cocoboardJobs.id, jobId));

      return NextResponse.json(
        { error: 'Failed to queue analysis job' },
        { status: 500 }
      );
    }

    // Return job info
    return NextResponse.json({
      success: true,
      jobId,
      status: 'analyzing',
      estimatedCreditsCocoboard: 100,
      estimatedCreditsGeneration: 0,
    });

  } catch (error) {
    console.error('CocoBoard creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
