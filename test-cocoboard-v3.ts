// Test script for CocoBoard generation
// Run: npx tsx test-cocoboard-v3.ts

import { config } from 'dotenv';
config();

// Mock import.meta.env for Node.js
(global as any).import = { meta: { env: process.env } };

// Now import the modules
const { llmCascade } = await import('./src/lib/ai/llmCascade');
const { CocoBoardBlueprintSchema } = await import('./src/lib/coconut/schemas');

async function testCocoBoard() {
  console.log('🧪 Testing CocoBoard Blueprint Generation\n');

  // Test 1: LLM Cascade avec fallback automatique
  console.log('1️⃣ Testing LLM Cascade (Cloudflare → Groq → Nvidia → Kie)...');
  try {
    const result = await llmCascade.callWithFallback({
      systemPrompt: 'You are an expert creative director. Create detailed generation blueprints.',
      userPrompt: `Create a blueprint for: A luxury perfume campaign with 3 product images

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
      "prompt": "detailed image prompt",
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
      modelPreference: 'smart',
      temperature: 0.7,
      maxTokens: 4000,
    });

    if (result.success && result.response) {
      console.log('✅ LLM Cascade works!');
      console.log(`Provider used: ${result.response.provider}`);
      console.log(`Cost: $${result.totalCost.toFixed(4)}`);
      console.log(`Attempts: ${result.attempts.map((a: any) => `${a.provider}(${a.success ? '✓' : '✗'})`).join(', ')}`);
      
      console.log('\nGenerated content preview:');
      console.log(result.response.content?.substring(0, 500));
      
      // Try to parse as blueprint
      try {
        const parsed = JSON.parse(result.response.content || '{}');
        const blueprint = CocoBoardBlueprintSchema.parse(parsed);
        console.log('\n✅ Blueprint is valid!');
        console.log(`Title: ${blueprint.title}`);
        console.log(`Steps: ${blueprint.steps.length}`);
        console.log(`Estimated credits: ${blueprint.estimatedCredits}`);
      } catch (parseError: any) {
        console.log('\n⚠️ Generated text is not valid blueprint JSON');
        console.log('Parse error:', parseError.message);
      }
    } else {
      console.log('❌ LLM Cascade failed');
      console.log('Attempts:', result.attempts.map((a: any) => 
        `${a.provider}: ${a.success ? 'success' : 'failed'}${a.error ? ` (${a.error})` : ''}`
      ).join(', '));
    }
  } catch (error: any) {
    console.log('❌ Cascade error:', error.message);
  }

  // Test 2: Test avec provider spécifique (Groq)
  console.log('\n2️⃣ Testing specific provider (Groq)...');
  try {
    const groqResult = await llmCascade.callProvider('groq', {
      systemPrompt: 'You are a helpful assistant.',
      userPrompt: 'Say "Groq is working!" and nothing else.',
      modelPreference: 'smart',
      maxTokens: 100,
    });
    
    if (groqResult.success) {
      console.log('✅ Groq works!');
      console.log('Response:', groqResult.content);
    } else {
      console.log('❌ Groq failed:', groqResult.error);
    }
  } catch (error: any) {
    console.log('❌ Groq error:', error.message);
  }

  // Test 3: Test avec provider spécifique (Cloudflare)
  console.log('\n3️⃣ Testing specific provider (Cloudflare)...');
  try {
    const cfResult = await llmCascade.callProvider('cloudflare', {
      systemPrompt: 'You are a helpful assistant.',
      userPrompt: 'Say "Cloudflare AI is working!" and nothing else.',
      modelPreference: 'fast',
      maxTokens: 100,
    });
    
    if (cfResult.success) {
      console.log('✅ Cloudflare AI works!');
      console.log('Response:', cfResult.content);
    } else {
      console.log('❌ Cloudflare failed:', cfResult.error);
    }
  } catch (error: any) {
    console.log('❌ Cloudflare error:', error.message);
  }

  console.log('\n✨ Test complete!');
  console.log('\n📋 Summary:');
  console.log('- LLM Cascade avec fallback: Testé');
  console.log('- Provider Groq: Testé');
  console.log('- Provider Cloudflare: Testé');
  console.log('\nSi tous les tests montrent ✅, le système CocoBoard est prêt!');
}

testCocoBoard().catch(console.error);
