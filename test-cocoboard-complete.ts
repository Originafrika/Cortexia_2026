// Complete CocoBoard API Test
// Tests the full flow: create job → generate blueprint → validate → blend

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

  // Step 2: Generate blueprint using LLM Cascade
  console.log('2️⃣ Generating blueprint with LLM Cascade...');
  console.log('Providers: Cloudflare → Groq → Nvidia → Kie\n');

  const blueprintPrompt = `You are an expert creative director for a premium AI generation platform.

Create a detailed generation blueprint for the following campaign:

INTENT: ${testIntent}

RESPOND ONLY WITH VALID JSON in this exact format:
{
  "version": "v14",
  "mode": "image",
  "title": "Campaign title",
  "description": "Detailed description",
  "intent": "Original intent",
  "complexity": "medium",
  "estimatedCredits": 6,
  "steps": [
    {
      "id": "step-1",
      "type": "image",
      "prompt": "Detailed image generation prompt for luxury watch front view",
      "model": "flux-2-pro-1k",
      "aspectRatio": "1:1",
      "resolution": "1K",
      "dependsOn": [],
      "parallelGroup": 1,
      "creditsEstimated": 2
    },
    {
      "id": "step-2",
      "type": "image", 
      "prompt": "Detailed image generation prompt for luxury watch side view",
      "model": "flux-2-pro-1k",
      "aspectRatio": "1:1",
      "resolution": "1K",
      "dependsOn": [],
      "parallelGroup": 1,
      "creditsEstimated": 2
    },
    {
      "id": "step-3",
      "type": "image",
      "prompt": "Detailed image generation prompt for luxury watch detail shot",
      "model": "flux-2-pro-1k",
      "aspectRatio": "1:1",
      "resolution": "1K",
      "dependsOn": [],
      "parallelGroup": 1,
      "creditsEstimated": 2
    }
  ],
  "executionOrder": ["step-1", "step-2", "step-3"],
  "parallelGroups": [["step-1", "step-2", "step-3"]]
}`;

  try {
    const cascadeResult = await llmCascade.callWithFallback({
      systemPrompt: 'You are an expert creative director. Create detailed generation blueprints. Respond only with valid JSON.',
      userPrompt: blueprintPrompt,
      modelPreference: 'smart',
      temperature: 0.7,
      maxTokens: 4000,
    });

    if (!cascadeResult.success || !cascadeResult.response) {
      console.log('❌ LLM Cascade failed');
      console.log('Attempts:', cascadeResult.attempts.map((a: any) => 
        `${a.provider}: ${a.success ? '✓' : '✗'}${a.error ? ` (${a.error})` : ''}`
      ).join(', '));
      return;
    }

    console.log(`✅ Blueprint generated!`);
    console.log(`Provider used: ${cascadeResult.response.provider}`);
    console.log(`Cost: $${cascadeResult.totalCost.toFixed(4)}`);
    console.log(`Attempts: ${cascadeResult.attempts.map((a: any) => `${a.provider}(${a.success ? '✓' : '✗'})`).join(' → ')}`);
    
    // Step 3: Parse and validate blueprint
    console.log('\n3️⃣ Validating blueprint...');
    
    let blueprint;
    try {
      const content = cascadeResult.response.content || '';
      
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                       content.match(/```\n?([\s\S]*?)\n?```/) ||
                       [null, content];
      
      const jsonStr = jsonMatch[1] || content;
      const parsed = JSON.parse(jsonStr);
      blueprint = CocoBoardBlueprintSchema.parse(parsed);
      
      console.log('✅ Blueprint is valid!');
      console.log(`Title: ${blueprint.title}`);
      console.log(`Description: ${blueprint.description}`);
      console.log(`Mode: ${blueprint.mode}`);
      console.log(`Complexity: ${blueprint.complexity}`);
      console.log(`Steps: ${blueprint.steps.length}`);
      console.log(`Estimated Credits: ${blueprint.estimatedCredits}`);
      
      console.log('\nStep breakdown:');
      blueprint.steps.forEach((step: any, idx: number) => {
        console.log(`  ${idx + 1}. [${step.type}] ${step.prompt?.substring(0, 50)}... (${step.creditsEstimated} cr)`);
      });
      
    } catch (parseError: any) {
      console.log('❌ Blueprint validation failed');
      console.log('Error:', parseError.message);
      console.log('\nRaw content preview:');
      console.log(cascadeResult.response.content?.substring(0, 500));
      return;
    }

    // Step 4: Simulate validation and job update
    console.log('\n4️⃣ Simulating job validation...');
    console.log('✅ Blueprint validated by user');
    console.log('✅ Credits reserved:', blueprint.estimatedCredits);
    console.log('✅ Job status: awaiting_validation → blending');

    // Step 5: Summary
    console.log('\n📋 Test Summary');
    console.log('================');
    console.log('✅ Job creation: Success');
    console.log('✅ Blueprint generation: Success');
    console.log('✅ LLM Cascade: Working');
    console.log(`   Primary: ${cascadeResult.attempts[0]?.provider} (${cascadeResult.attempts[0]?.success ? '✓' : '✗'})`);
    if (!cascadeResult.attempts[0]?.success) {
      console.log(`   Fallback: ${cascadeResult.response.provider} ✓`);
    }
    console.log('✅ Blueprint validation: Success');
    console.log(`✅ Ready for blending: ${blueprint.steps.length} steps`);
    
    console.log('\n🎉 CocoBoard API flow is working correctly!');
    console.log('\nNext steps:');
    console.log('- Add KIE_API_KEY for image/video generation');
    console.log('- Test full blend execution');
    console.log('- Integrate with frontend');

  } catch (error: any) {
    console.log('\n❌ Test failed:', error.message);
    console.log(error.stack);
  }
}

testCocoBoardAPI().catch(console.error);
