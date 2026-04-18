// Diagnostic script for LLM providers
// Run: npx tsx diagnose-llm.ts

import { config } from 'dotenv';
config();

console.log('🔍 Diagnosing LLM Providers\n');

// Check environment variables
console.log('1️⃣ Environment Variables:');
console.log('CF_ACCOUNT_ID:', process.env.CF_ACCOUNT_ID ? '✅ Set' : '❌ Missing');
console.log('CF_API_TOKEN:', process.env.CF_API_TOKEN ? '✅ Set' : '❌ Missing');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Set' : '❌ Missing');

// Test simple fetch
async function testFetch(url: string, name: string) {
  console.log(`\n2️⃣ Testing ${name} connectivity...`);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal 
    });
    
    clearTimeout(timeout);
    console.log(`✅ ${name} reachable (status: ${response.status})`);
    return true;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log(`❌ ${name} timeout after 10s`);
    } else {
      console.log(`❌ ${name} error:`, error.message);
    }
    return false;
  }
}

// Test Cloudflare with actual API
async function testCloudflare() {
  console.log('\n3️⃣ Testing Cloudflare Workers AI...');
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;
  
  if (!accountId || !apiToken) {
    console.log('❌ Missing credentials');
    return;
  }
  
  try {
    // Test with a simple model
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-2-7b-chat-int8`;
    
    console.log('URL:', url);
    console.log('Token prefix:', apiToken.substring(0, 10) + '...');
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 10,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      const error = await response.text();
      console.log(`❌ Cloudflare API error: ${response.status} - ${error}`);
      
      if (response.status === 401) {
        console.log('💡 Token may be invalid or expired');
      }
      if (response.status === 404) {
        console.log('💡 Model not found, try a different model');
      }
    } else {
      const result = await response.json();
      console.log('✅ Cloudflare works!');
      console.log('Response:', result.result?.response?.substring(0, 50));
    }
  } catch (error: any) {
    console.log('❌ Cloudflare error:', error.message);
    if (error.cause) {
      console.log('Cause:', error.cause.message);
    }
  }
}

// Test Groq
async function testGroq() {
  console.log('\n4️⃣ Testing Groq...');
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.log('❌ Missing GROQ_API_KEY');
    return;
  }
  
  try {
    console.log('Key prefix:', apiKey.substring(0, 10) + '...');
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 10,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      const error = await response.text();
      console.log(`❌ Groq API error: ${response.status} - ${error}`);
      
      if (response.status === 401) {
        console.log('💡 API key is invalid');
      }
    } else {
      const result = await response.json();
      console.log('✅ Groq works!');
      console.log('Response:', result.choices?.[0]?.message?.content);
    }
  } catch (error: any) {
    console.log('❌ Groq error:', error.message);
    if (error.cause) {
      console.log('Cause:', error.cause.message);
    }
  }
}

// Run tests
async function runDiagnostics() {
  await testFetch('https://api.cloudflare.com', 'Cloudflare API');
  await testFetch('https://api.groq.com', 'Groq API');
  await testCloudflare();
  await testGroq();
  
  console.log('\n📋 Diagnostic Complete');
  console.log('\nCommon fixes:');
  console.log('- For Cloudflare: Ensure token has "Workers AI" permission');
  console.log('- For Groq: Verify API key at https://console.groq.com');
  console.log('- For timeout: Check internet connection and firewall');
}

runDiagnostics().catch(console.error);
