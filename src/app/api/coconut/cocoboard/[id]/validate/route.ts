// API Route: POST /api/coconut/cocoboard/:id/validate
// User validates blueprint and starts blending process

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContextFromHeaders } from '../../../../middleware';
import { db } from '../../../../lib/db';
import { cocoboardJobs, users, creditTransactions } from '../../../../lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { coconutOrchestrator } from '../../../../lib/coconut/orchestrator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = getAuthContextFromHeaders(request.headers);
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get job
    const job = await db.select()
      .from(cocoboardJobs)
      .where(eq(cocoboardJobs.id, id))
      .limit(1);

    if (!job || job.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const jobData = job[0];

    // Verify ownership
    if (jobData.ownerId !== authContext.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify job is in awaiting_validation state
    if (jobData.status !== 'awaiting_validation') {
      return NextResponse.json(
        { error: `Job is in ${jobData.status} state, cannot validate` },
        { status: 400 }
      );
    }

    // We execute blending (in production, use QStash for background execution)
    // Here we update status and start
    await db.update(cocoboardJobs)
      .set({ 
        status: 'blending',
        updatedAt: new Date(),
      })
      .where(eq(cocoboardJobs.id, id));

    // Blending logic - run steps and debit credits
    // This is a simplified version of the background orchestrator
    const result = await coconutOrchestrator.executeBlendBatch(
      id,
      (jobData.cocoboard as any).steps || [],
      authContext.userId,
      process.env.KIE_API_KEY || '',
      async (stepId, status, outputUrl) => {
        // Update node status in DB
        const currentStatuses = (jobData.nodeStatuses as any) || {};
        const currentOutputs = (jobData.nodeOutputs as any) || {};

        currentStatuses[stepId] = status;
        if (outputUrl) currentOutputs[stepId] = outputUrl;

        await db.update(cocoboardJobs)
          .set({
            nodeStatuses: currentStatuses,
            nodeOutputs: currentOutputs,
            updatedAt: new Date()
          })
          .where(eq(cocoboardJobs.id, id));
      }
    );

    // Final job update
    await db.update(cocoboardJobs)
      .set({
        status: result.success ? 'done' : 'failed',
        creditsGenerationActual: result.totalCredits,
        updatedAt: new Date()
      })
      .where(eq(cocoboardJobs.id, id));

    return NextResponse.json({
      success: true,
      jobId: id,
      status: result.success ? 'done' : 'failed',
      totalCredits: result.totalCredits
    });

  } catch (error) {
    console.error('Validate job error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
