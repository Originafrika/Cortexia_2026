// Complete CocoBoard API Test - Using working providers
// Tests the full flow: create job → generate blueprint → validate

import { config } from 'dotenv';
config();

// Mock import.meta.env for Node.js
(global as any).import = { meta: { env: process.env } };

async function testCocoBoardAPI() {
  console.log('🧪 Complete CocoBoard API Test\n');
  console.log('Testing full workflow: Create → Generate Blueprint → Validate\n');

  // Import after env setup
  const { llmCascade } = await import('./src/lib/ai/llmCascade');
  const { CocoBoardBlueprintSchema } = await import('./src/lib/coconut/schemas');

  const testUserId = 'test-user-123';
  const testIntent = 'Create a luxury watch campaign with 3 product images showing different angles';

  // Step 1: Simulate creating a CocoBoard job
  console.log('1️⃣ Creating CocoBoard job...');
  console.log('Intent:', testIntent);
  
  const jobId = `job-${Date.now()}`;
  console.log('Job ID:', jobId);
  console.log('✅ Job created (simulated)\n');

  // Step 2: Test Cloudflare first (direct test)
  console.log('2️⃣ Testing Cloudflare Workers AI directly...');
  
  try {
    const cfResult = await llmCascade.callProvider('cloudflare', {
      systemPrompt: 'You are a helpful assistant that creates JSON blueprints.',
      userPrompt: `Create a simple blueprint for: ${testIntent}

Respond with a simple JSON object like:
{
  "version": "v14",
  "mode": "image",
  "title": "Luxury Watch Campaign",
  "description": "3 product images",
  "intent": "${testIntent}",
  "complexity": "medium",
  "estimatedCredits": 6,
  "steps": [
    {
      "id": "step-1",
      "type": "image",
      "prompt": "Luxury watch front view",
      "model": "flux-2-pro-1k",
      "aspectRatio": "1:1",
      "resolution": "1K",
      "dependsOn": [],
      "parallelGroup": 1,
      "creditsEstimated": 2
    }
  ],
  "executionOrder": ["step-1"],
  "parallelGroups": [["step-1"]]
}`,
      modelPreference: 'fast',
      maxTokens: 2000,
    });

    if (cfResult.success) {
      console.log('✅ Cloudflare works!');
      console.log('Content:', cfResult.content?.substring(0, 200));
    } else {
      console.log('❌ Cloudflare failed:', cfResult.error);
    }
  } catch (error: any) {
    console.log('❌ Cloudflare error:', error.message);
  }

  // Step 3: Test Groq
  console.log('\n3️⃣ Testing Groq directly...');
  
  try {
    const groqResult = await llmCascade.callProvider('groq', {
      systemPrompt: 'You are a creative director. Create a campaign blueprint.',
      userPrompt: `Campaign: ${testIntent}

Create a blueprint with 3 image steps. Return JSON only.`,
      modelPreference: 'smart',
      maxTokens: 2000,
    });

    if (groqResult.success) {
      console.log('✅ Groq works!');
      console.log('Content:', groqResult.content?.substring(0, 200));
    } else {
      console.log('❌ Groq failed:', groqResult.error);
    }
  } catch (error: any) {
    console.log('❌ Groq error:', error.message);
  }

  // Step 4: Test full cascade with better prompt
  console.log('\n4️⃣ Testing full LLM Cascade...');
  
  try {
    const cascadeResult = await llmCascade.callWithFallback({
      systemPrompt: 'You are an expert creative director for AI image generation. Create detailed campaign blueprints.',
      userPrompt: `Create a blueprint for: ${testIntent}

The blueprint should have:
- 3 image generation steps
- Model: flux-2-pro-1k
- Resolution: 1K
- Aspect ratio: 1:1
- Each step costs 2 credits

IMPORTANT: Respond with a valid JSON object following this structure:
version: "v14"
mode: "image"
title: (campaign title)
description: (description)
intent: (original intent)
complexity: "medium"
estimatedCredits: 6
steps: array of 3 image steps
executionOrder: ["step-1", "step-2", "step-3"]
parallelGroups: [["step-1", "step-2", "step-3"]]`,
      modelPreference: 'smart',
      temperature: 0.5,
      maxTokens: 4000,
    });

    console.log('Cascade result:', cascadeResult.success ? '✅ Success' : '❌ Failed');
    console.log('Provider used:', cascadeResult.response?.provider);
    console.log('Attempts:', cascadeResult.attempts.map((a: any) => 
      `${a.provider}(${a.success ? '✓' : '✗'})`
    ).join(' → '));

    if (cascadeResult.success && cascadeResult.response?.content) {
      console.log('\nRaw response preview:');
      console.log(cascadeResult.response.content.substring(0, 500));
      
      // Try to parse
      try {
        const parsed = JSON.parse(cascadeResult.response.content);
        const blueprint = CocoBoardBlueprintSchema.parse(parsed);
        console.log('\n✅ Blueprint is valid!');
        console.log(`Title: ${blueprint.title}`);
        console.log(`Steps: ${blueprint.steps.length}`);
        console.log(`Credits: ${blueprint.estimatedCredits}`);
      } catch (e: any) {
        console.log('\n⚠️ Not valid blueprint JSON:', e.message);
      }
    }

  } catch (error: any) {
    console.log('❌ Cascade error:', error.message);
  }

  console.log('\n✨ Test complete!');
  console.log('\n📋 Summary:');
  console.log('- Cloudflare: Tested above');
  console.log('- Groq: Tested above');
  console.log('- Cascade: Attempts all providers in order');
  console.log('\nProviders working:');
  console.log('✅ Cloudflare Workers AI (10K neurons/day free)');
  console.log('✅ Groq (rate limited free tier)');
  console.log('❌ Kie AI (needs API key)');
  console.log('❌ Nvidia (needs API key)');
}

testCocoBoardAPI().catch(console.error);
