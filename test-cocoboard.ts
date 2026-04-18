// Test script for CocoBoard generation
// Run: npx tsx test-cocoboard.ts

import { config } from 'dotenv';
config();

import { llmCascade } from './src/lib/ai/llmCascade';
import { CocoBoardBlueprintSchema } from './src/lib/coconut/schemas';

async function testCocoBoard() {
  console.log('🧪 Testing CocoBoard Blueprint Generation\n');

  // Test 1: Cloudflare Workers AI
  console.log('1️⃣ Testing Cloudflare Workers AI...');
  try {
    const cfResult = await llmCascade.callCloudflare({
      prompt: 'Create a blueprint for: A luxury perfume campaign with 3 images and 1 video',
      model: 'llama-3-8b',
      maxTokens: 2000,
    });
    
    if (cfResult.success) {
      console.log('✅ Cloudflare AI works!');
      console.log('Response preview:', cfResult.text?.substring(0, 200));
    } else {
      console.log('❌ Cloudflare AI failed:', cfResult.error);
    }
  } catch (error: any) {
    console.log('❌ Cloudflare error:', error.message);
  }

  // Test 2: Groq fallback
  console.log('\n2️⃣ Testing Groq...');
  try {
    const groqResult = await llmCascade.callGroq({
      prompt: 'Create a blueprint for: A luxury perfume campaign',
      model: 'llama-3-8b',
      maxTokens: 2000,
    });
    
    if (groqResult.success) {
      console.log('✅ Groq works!');
    } else {
      console.log('❌ Groq failed:', groqResult.error);
    }
  } catch (error: any) {
    console.log('❌ Groq error:', error.message);
  }

  // Test 3: LLM Cascade full flow
  console.log('\n3️⃣ Testing LLM Cascade (full fallback chain)...');
  try {
    const result = await llmCascade.generateText({
      prompt: `Create a detailed generation blueprint for an image campaign:

BRIEF: Create 3 luxury product images for a premium watch brand

Respond in JSON format with:
{
  "title": "string",
  "description": "string",
  "mode": "image",
  "complexity": "medium",
  "steps": [
    {
      "id": "step-1",
      "type": "image",
      "prompt": "detailed prompt",
      "model": "flux-2-pro-1k",
      "aspectRatio": "1:1",
      "resolution": "1K",
      "dependsOn": [],
      "parallelGroup": 1,
      "creditsEstimated": 2
    }
  ],
  "executionOrder": ["step-1"],
  "parallelGroups": [["step-1"]],
  "estimatedTotalCredits": 2
}`,
      model: 'llama-3-8b',
      temperature: 0.7,
      maxTokens: 4000,
    }, 'test-user-id');

    if (result.success) {
      console.log('✅ LLM Cascade works!');
      console.log('\nGenerated blueprint preview:');
      console.log(result.text?.substring(0, 500));
      
      // Try to parse
      try {
        const parsed = JSON.parse(result.text || '{}');
        const blueprint = CocoBoardBlueprintSchema.parse(parsed);
        console.log('\n✅ Blueprint is valid!');
        console.log(`Title: ${blueprint.title}`);
        console.log(`Steps: ${blueprint.steps.length}`);
        console.log(`Estimated credits: ${blueprint.estimatedCredits}`);
      } catch (parseError) {
        console.log('\n⚠️ Generated text is not valid blueprint JSON');
        console.log('Parse error:', (parseError as Error).message);
      }
    } else {
      console.log('❌ LLM Cascade failed:', result.error);
      console.log('Fallback used:', result.provider);
    }
  } catch (error: any) {
    console.log('❌ Cascade error:', error.message);
  }

  console.log('\n✨ Test complete!');
}

testCocoBoard().catch(console.error);
