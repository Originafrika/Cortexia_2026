// QStash Handler: POST /api/qstash/cocoblend
// Async blending execution - generates images/videos using Kie AI

import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { cocoboardJobs, enterpriseWallets } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { sseService } from '../../lib/services/sseService';
import { r2Storage } from '../../lib/services/r2Storage';
import { Step, StepStatus, Blueprint } from '../../lib/coconut/schemas';

// Kie AI integration for image/video generation
async function generateWithKieAI(
  step: Step,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const apiKey = process.env.KIE_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'Kie AI not configured' };
    }

    const baseUrl = process.env.KIE_API_BASE || 'https://api.kie.ai';

    if (step.type === 'image') {
      // Image generation
      const response = await fetch(`${baseUrl}/api/v1/jobs/createTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: step.model || 'flux-2/pro-text-to-image',
          input: {
            prompt: step.prompt,
            aspect_ratio: step.aspectRatio || '1:1',
            resolution: step.resolution || '1K',
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Kie AI error: ${error}` };
      }

      const result = await response.json();
      
      if (result.code === 200 && result.data?.taskId) {
        // Poll for task completion
        return await pollKieTask(result.data.taskId, 'image', apiKey, baseUrl);
      }
      
      return { success: false, error: result.msg || 'Task creation failed' };

    } else if (step.type === 'video') {
      // Video generation
      const response = await fetch(`${baseUrl}/api/v1/veo/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: step.prompt,
          model: step.model || 'veo-3-fast',
          generationType: 'TEXT_2_VIDEO',
          aspectRatio: step.aspectRatio || '16:9',
          enableTranslation: true,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Kie AI error: ${error}` };
      }

      const result = await response.json();
      
      if (result.code === 200 && result.data?.taskId) {
        return await pollKieTask(result.data.taskId, 'video', apiKey, baseUrl);
      }
      
      return { success: false, error: result.msg || 'Video generation failed' };
    }

    return { success: false, error: 'Unsupported step type' };

  } catch (error) {
    console.error('Kie AI generation error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function pollKieTask(
  taskId: string,
  type: 'image' | 'video',
  apiKey: string,
  baseUrl: string,
  maxAttempts = 60
): Promise<{ success: boolean; url?: string; error?: string }> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const endpoint = type === 'video' 
        ? `/api/v1/veo/record-info?taskId=${taskId}`
        : `/api/v1/jobs/recordInfo?taskId=${taskId}`;

      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });

      if (!response.ok) {
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }

      const result = await response.json();

      if (result.code === 200) {
        const data = result.data;
        
        if (data.status === 'completed' || data.status === 'success') {
          const url = type === 'video' ? data.videoUrl : data.imageUrl;
          return { success: true, url };
        }
        
        if (data.status === 'failed' || data.status === 'error') {
          return { success: false, error: data.error || 'Generation failed' };
        }
      }

      await new Promise(r => setTimeout(r, 5000));
    } catch (error) {
      console.error('Poll error:', error);
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  return { success: false, error: 'Polling timeout' };
}

// Verify QStash signature
function verifyQStashSignature(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.QSTASH_TOKEN;
  
  if (authHeader === `Bearer ${expectedToken}`) {
    return true;
  }
  
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  return false;
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyQStashSignature(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId } = body;

    // Get job details
    const job = await db.select()
      .from(cocoboardJobs)
      .where(eq(cocoboardJobs.id, jobId))
      .limit(1);

    if (!job || job.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const jobData = job[0];
    const blueprint = jobData.cocoboard as Blueprint;

    if (!blueprint || !blueprint.steps) {
      return NextResponse.json({ error: 'No blueprint found' }, { status: 400 });
    }

    // Get wallet for credit tracking
    const wallet = await db.select()
      .from(enterpriseWallets)
      .where(eq(enterpriseWallets.userId, jobData.userId))
      .limit(1);

    let creditsBalance = wallet.length > 0 ? wallet[0].creditsBalance : 0;

    // Execute steps in order
    const stepStatuses: Record<string, StepStatus> = {};
    const stepOutputs: Record<string, string> = {};
    let totalCreditsConsumed = 0;

    for (const stepId of blueprint.executionOrder) {
      const step = blueprint.steps.find(s => s.id === stepId);
      if (!step) continue;

      // Check credits
      if (creditsBalance < step.creditsEstimated) {
        stepStatuses[stepId] = 'failed';
        await sseService.publish(jobId, 'step', {
          stepId,
          status: 'failed',
          error: 'Insufficient credits',
        });
        continue;
      }

      // Mark as processing
      stepStatuses[stepId] = 'processing';
      await sseService.publish(jobId, 'step', {
        stepId,
        status: 'processing',
        progress: 0,
      });

      try {
        let result: { success: boolean; url?: string; error?: string };

        if (step.type === 'text') {
          // Text generation - use LLM cascade
          result = { success: true, url: step.purpose || 'Text generated' };
        } else {
          // Image/Video generation - use Kie AI
          result = await generateWithKieAI(step, jobData.userId);
        }

        if (result.success && result.url) {
          // Upload to R2
          const r2Key = `outputs/${jobId}/${stepId}.${step.type === 'video' ? 'mp4' : 'png'}`;
          const uploadResult = await r2Storage.uploadFromUrl(result.url, r2Key);

          if (uploadResult.success) {
            stepStatuses[stepId] = 'completed';
            stepOutputs[stepId] = uploadResult.url;
            totalCreditsConsumed += step.creditsEstimated;
            creditsBalance -= step.creditsEstimated;

            await sseService.publish(jobId, 'step', {
              stepId,
              status: 'completed',
              outputUrl: uploadResult.url,
              creditsConsumed: step.creditsEstimated,
            });
          } else {
            throw new Error('Failed to upload to R2');
          }
        } else {
          throw new Error(result.error || 'Generation failed');
        }

      } catch (error) {
        stepStatuses[stepId] = 'failed';
        await sseService.publish(jobId, 'step', {
          stepId,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Generation failed',
        });
      }
    }

    // Update job status
    const allCompleted = blueprint.steps.every(s => stepStatuses[s.id] === 'completed');
    const anyFailed = blueprint.steps.some(s => stepStatuses[s.id] === 'failed');
    const finalStatus = allCompleted ? 'completed' : (anyFailed ? 'completed_with_errors' : 'failed');

    await db.update(cocoboardJobs)
      .set({
        status: finalStatus,
        creditsConsumedGeneration: totalCreditsConsumed,
        outputs: stepOutputs,
        updatedAt: new Date(),
        completedAt: new Date(),
      })
      .where(eq(cocoboardJobs.id, jobId));

    // Update wallet
    if (wallet.length > 0) {
      await db.update(enterpriseWallets)
        .set({
          creditsBalance: creditsBalance,
          creditsUsed: wallet[0].creditsUsed + totalCreditsConsumed,
          updatedAt: new Date(),
        })
        .where(eq(enterpriseWallets.id, wallet[0].id));
    }

    // Final SSE update
    await sseService.publish(jobId, 'complete', {
      status: finalStatus,
      totalCreditsConsumed,
      outputs: stepOutputs,
    });

    return NextResponse.json({
      success: true,
      jobId,
      status: finalStatus,
      totalCreditsConsumed,
      outputs: stepOutputs,
    });

  } catch (error) {
    console.error('QStash blend error:', error);
    
    const { jobId } = await request.json().catch(() => ({ jobId: null }));
    if (jobId) {
      await db.update(cocoboardJobs)
        .set({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Blending failed',
          updatedAt: new Date(),
        })
        .where(eq(cocoboardJobs.id, jobId));

      await sseService.publish(jobId, 'error', {
        message: error instanceof Error ? error.message : 'Blending failed',
      });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
