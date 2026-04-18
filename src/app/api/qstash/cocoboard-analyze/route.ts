// QStash Handler: POST /api/qstash/cocoboard-analyze
// Async blueprint generation using LLM cascade

import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { cocoboardJobs } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { llmCascadeService } from '../../lib/ai/llmCascade';
import { sseService } from '../../lib/services/sseService';
import { Blueprint, blueprintSchema } from '../../lib/coconut/schemas';
import { v4 as uuidv4 } from 'uuid';

// Verify QStash signature
function verifyQStashSignature(request: NextRequest): boolean {
  // In production, verify the signature using QStash signing keys
  // For now, we trust requests from Upstash IPs or with valid token
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.QSTASH_TOKEN;
  
  if (authHeader === `Bearer ${expectedToken}`) {
    return true;
  }
  
  // Also accept requests without auth in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Verify signature
    if (!verifyQStashSignature(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, mode, intent, assets } = body;

    // Get job details
    const job = await db.select()
      .from(cocoboardJobs)
      .where(eq(cocoboardJobs.id, jobId))
      .limit(1);

    if (!job || job.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const jobData = job[0];

    // Build prompt for blueprint generation
    const prompt = buildBlueprintPrompt(mode, intent, assets);

    // Send SSE update - analysis started
    await sseService.publish(jobId, 'analysis', {
      status: 'processing',
      message: 'Analyzing your brief...',
    });

    // Call LLM cascade for blueprint generation
    const llmResponse = await llmCascadeService.generateText({
      prompt,
      model: 'llama-3-8b',
      temperature: 0.7,
      maxTokens: 4000,
    }, jobData.userId);

    if (!llmResponse.success) {
      throw new Error(llmResponse.error || 'Blueprint generation failed');
    }

    // Parse blueprint from LLM response
    let blueprint: Blueprint;
    try {
      const parsed = JSON.parse(llmResponse.text || '{}');
      blueprint = blueprintSchema.parse(parsed);
    } catch (parseError) {
      console.error('Blueprint parse error:', parseError);
      // Fallback: create minimal blueprint
      blueprint = createFallbackBlueprint(mode, intent);
    }

    // Calculate estimated credits for generation
    const estimatedCredits = calculateGenerationCredits(blueprint);

    // Update job with blueprint
    await db.update(cocoboardJobs)
      .set({
        status: 'awaiting_validation',
        cocoboard: blueprint,
        creditsConsumedCocoboard: 100, // Fixed cost
        estimatedCreditsGeneration: estimatedCredits,
        updatedAt: new Date(),
      })
      .where(eq(cocoboardJobs.id, jobId));

    // Send SSE update - analysis complete
    await sseService.publish(jobId, 'analysis', {
      status: 'completed',
      blueprint,
      estimatedCredits,
    });

    return NextResponse.json({
      success: true,
      jobId,
      blueprint,
      estimatedCredits,
    });

  } catch (error) {
    console.error('QStash analyze error:', error);
    
    // Update job status to failed
    const { jobId } = await request.json().catch(() => ({ jobId: null }));
    if (jobId) {
      await db.update(cocoboardJobs)
        .set({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Analysis failed',
          updatedAt: new Date(),
        })
        .where(eq(cocoboardJobs.id, jobId));

      // Notify via SSE
      await sseService.publish(jobId, 'error', {
        message: error instanceof Error ? error.message : 'Analysis failed',
      });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}

function buildBlueprintPrompt(mode: string, intent: string, assets: string[]): string {
  return `
You are an expert creative director. Create a detailed generation blueprint for a ${mode} project.

BRIEF:
${intent}

${assets.length > 0 ? `REFERENCE ASSETS: ${assets.join(', ')}` : ''}

Create a blueprint with:
1. A clear title and description
2. Step-by-step generation plan (text, image, video steps)
3. Each step should specify: type, purpose/prompt, model, parameters
4. Execution order with dependencies
5. Estimated credits per step

Respond in JSON format matching this structure:
{
  "title": "string",
  "description": "string",
  "mode": "${mode}",
  "complexity": "low|medium|high",
  "steps": [
    {
      "id": "step-1",
      "type": "text|image|video",
      "purpose": "for text steps: what the text is for",
      "prompt": "for image/video: detailed generation prompt",
      "model": "model name",
      "aspectRatio": "for images: 1:1|16:9|9:16",
      "resolution": "for images: 1K|2K",
      "dependsOn": ["step-ids"],
      "parallelGroup": 1,
      "creditsEstimated": 10
    }
  ],
  "executionOrder": ["step-1", "step-2"],
  "parallelGroups": [["step-1"], ["step-2"]],
  "estimatedTotalCredits": 100
}
`;
}

function createFallbackBlueprint(mode: string, intent: string): Blueprint {
  return {
    title: `${mode.charAt(0).toUpperCase() + mode.slice(1)} Generation`,
    description: intent,
    mode: mode as any,
    complexity: 'low',
    steps: [
      {
        id: uuidv4(),
        type: mode === 'campaign' ? 'text' : (mode as 'image' | 'video'),
        purpose: mode === 'campaign' ? 'Campaign brief and strategy' : undefined,
        prompt: mode !== 'text' ? intent : undefined,
        model: mode === 'video' ? 'veo-3-fast' : 'flux-2-pro-1k',
        aspectRatio: mode === 'image' ? '1:1' : undefined,
        resolution: '1K',
        dependsOn: [],
        parallelGroup: 1,
        creditsEstimated: mode === 'video' ? 4 : 2,
      },
    ],
    executionOrder: [uuidv4()],
    parallelGroups: [[uuidv4()]],
    estimatedTotalCredits: mode === 'video' ? 4 : 2,
  };
}

function calculateGenerationCredits(blueprint: Blueprint): number {
  return blueprint.steps.reduce((total, step) => total + (step.creditsEstimated || 0), 0);
}
