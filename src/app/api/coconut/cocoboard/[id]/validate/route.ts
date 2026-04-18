// API Route: POST /api/coconut/cocoboard/:id/validate
// User validates blueprint and starts blending process

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContextFromHeaders } from '../../../../middleware';
import { db } from '../../../../lib/db';
import { cocoboardJobs, enterpriseWallets } from '../../../../lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthContextFromHeaders(request.headers);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

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
    if (jobData.userId !== auth.userId && jobData.organizationId !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify job is in awaiting_validation state
    if (jobData.status !== 'awaiting_validation') {
      return NextResponse.json(
        { error: `Job is in ${jobData.status} state, cannot validate` },
        { status: 400 }
      );
    }

    // Check credits available
    const wallet = await db.select()
      .from(enterpriseWallets)
      .where(
        and(
          eq(enterpriseWallets.userId, auth.userId),
          eq(enterpriseWallets.organizationId, auth.organizationId || '')
        )
      )
      .limit(1);

    const availableCredits = wallet.length > 0 ? wallet[0].creditsBalance : 0;
    const estimatedCredits = jobData.estimatedCreditsGeneration || 0;

    if (availableCredits < estimatedCredits) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          available: availableCredits,
          required: estimatedCredits,
        },
        { status: 402 }
      );
    }

    // Update job status to blending
    await db.update(cocoboardJobs)
      .set({ 
        status: 'blending',
        updatedAt: new Date(),
      })
      .where(eq(cocoboardJobs.id, id));

    // Trigger blending via QStash
    const qstashResponse = await fetch(
      `${process.env.QSTASH_URL}/v2/publish`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.QSTASH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/qstash/cocoblend`,
          body: { jobId: id },
          retries: 3,
        }),
      }
    );

    if (!qstashResponse.ok) {
      // Revert job status
      await db.update(cocoboardJobs)
        .set({ status: 'awaiting_validation' })
        .where(eq(cocoboardJobs.id, id));

      return NextResponse.json(
        { error: 'Failed to queue blending job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      jobId: id,
      status: 'blending',
      message: 'Blueprint validated and blending started',
    });

  } catch (error) {
    console.error('Validate job error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
