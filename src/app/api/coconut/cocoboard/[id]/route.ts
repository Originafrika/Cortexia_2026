// API Route: GET /api/coconut/cocoboard/:id
// Get job status and blueprint

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContextFromHeaders } from '../../../../middleware';
import { db } from '../../../../lib/db';
import { cocoboardJobs } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthContextFromHeaders(request.headers);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

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

    return NextResponse.json({
      id: jobData.id,
      status: jobData.status,
      mode: jobData.mode,
      intent: jobData.intent,
      cocoboard: jobData.cocoboard,
      creditsConsumedCocoboard: jobData.creditsConsumedCocoboard,
      creditsConsumedGeneration: jobData.creditsConsumedGeneration,
      estimatedCreditsCocoboard: jobData.estimatedCreditsCocoboard,
      estimatedCreditsGeneration: jobData.estimatedCreditsGeneration,
      createdAt: jobData.createdAt,
      updatedAt: jobData.updatedAt,
      errorMessage: jobData.errorMessage,
    });

  } catch (error) {
    console.error('Get job error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
