/**
 * GEMINI VIA KIE AI SERVICE
 * Alternative to Replicate when rate limits are reached
 * 
 * ✅ CHEAPER: 70-75% less than official pricing
 * ✅ COMPATIBLE: OpenAI-style API
 * ✅ MULTIMODAL: Text + Images + Video + Audio
 * ✅ 1M CONTEXT: 8x larger than Replicate
 * ✅ TOOL CALLING: Google Search grounding
 */

const KIE_AI_BASE_URL = 'https://api.kie.ai';
const KIE_AI_MODEL = 'gemini-3-pro';

interface KieAIMessage {
  role: 'developer' | 'system' | 'user' | 'assistant' | 'tool';
  content: Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

interface KieAIChatRequest {
  messages: KieAIMessage[];
  stream?: boolean;
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
    };
  }>;
  temperature?: number;
  max_tokens?: number;
}

interface KieAIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate text with Gemini 3 Pro via Kie AI
 */
export async function generateTextKieAI(params: {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<{ text: string; usage?: any }> {
  const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
  
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY not configured');
  }
  
  try {
    const messages: KieAIMessage[] = [];
    
    // Add system prompt if provided
    if (params.systemPrompt) {
      messages.push({
        role: 'system',
        content: [{ type: 'text', text: params.systemPrompt }]
      });
    }
    
    // Add user prompt
    messages.push({
      role: 'user',
      content: [{ type: 'text', text: params.prompt }]
    });
    
    const requestBody: KieAIChatRequest = {
      messages,
      stream: false,
      temperature: params.temperature ?? 0.7,
    };
    
    if (params.maxTokens) {
      (requestBody as any).max_tokens = params.maxTokens;
    }
    
    console.log(`🧠 [Kie AI] Calling Gemini 3 Pro...`);
    console.log(`   Prompt length: ${params.prompt.length} chars`);
    console.log(`   System prompt: ${params.systemPrompt ? 'Yes' : 'No'}`);
    
    const response = await fetch(
      `${KIE_AI_BASE_URL}/${KIE_AI_MODEL}/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KIE_AI_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Kie AI] API error (${response.status}):`, errorText);
      
      // Check for maintenance mode
      let errorDetail = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.code === 500 && errorJson.msg) {
          errorDetail = `Kie AI service temporarily unavailable: ${errorJson.msg}`;
        }
      } catch { /* Keep original error text */ }
      
      throw new Error(`Kie AI API error (${response.status}): ${errorDetail}`);
    }
    
    const result: KieAIChatResponse = await response.json();
    
    console.log('🔍 [Kie AI] Raw response:', JSON.stringify(result, null, 2));
    
    if (!result.choices || result.choices.length === 0) {
      console.error('❌ [Kie AI] No choices in response. Full result:', result);
      throw new Error('No response from Kie AI');
    }
    
    const text = result.choices[0].message.content;
    
    console.log(`✅ [Kie AI] Response received (${text.length} chars)`);
    if (result.usage) {
      console.log(`   Tokens: ${result.usage.prompt_tokens} in, ${result.usage.completion_tokens} out`);
    }
    
    return {
      text,
      usage: result.usage
    };
    
  } catch (error) {
    console.error('❌ [Kie AI] Error:', error);
    throw error;
  }
}

/**
 * Analyze images with Gemini 3 Pro via Kie AI (multimodal)
 */
export async function analyzeImagesKieAI(params: {
  imageUrls: string[];
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<{ text: string; usage?: any }> {
  const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
  
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY not configured');
  }
  
  console.log(`🔑 [Kie AI] API Key present: ${KIE_AI_API_KEY.substring(0, 10)}...`);
  console.log(`🌐 [Kie AI] Endpoint: ${KIE_AI_BASE_URL}/${KIE_AI_MODEL}/v1/chat/completions`);
  
  try {
    const messages: KieAIMessage[] = [];
    
    // Add system prompt if provided
    if (params.systemPrompt) {
      messages.push({
        role: 'system',
        content: [{ type: 'text', text: params.systemPrompt }]
      });
    }
    
    // Build multimodal user message (text + images)
    const userContent: KieAIMessage['content'] = [
      { type: 'text', text: params.prompt }
    ];
    
    // Add all images
    params.imageUrls.forEach(url => {
      userContent.push({
        type: 'image_url',
        image_url: { url }
      });
    });
    
    messages.push({
      role: 'user',
      content: userContent
    });
    
    const requestBody: KieAIChatRequest = {
      messages,
      stream: false,
      temperature: params.temperature ?? 0.7,
    };
    
    if (params.maxTokens) {
      (requestBody as any).max_tokens = params.maxTokens;
    }
    
    console.log(`🧠 [Kie AI] Calling Gemini 3 Pro (Multimodal)...`);
    console.log(`   Images: ${params.imageUrls.length}`);
    console.log(`   Prompt length: ${params.prompt.length} chars`);
    console.log(`   System prompt: ${params.systemPrompt ? 'Yes' : 'No'}`);
    
    const response = await fetch(
      `${KIE_AI_BASE_URL}/${KIE_AI_MODEL}/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KIE_AI_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Kie AI] API error (${response.status}):`, errorText);
      
      // Check for maintenance mode
      let errorDetail = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.code === 500 && errorJson.msg) {
          errorDetail = `Kie AI service temporarily unavailable: ${errorJson.msg}`;
        }
      } catch { /* Keep original error text */ }
      
      throw new Error(`Kie AI API error (${response.status}): ${errorDetail}`);
    }
    
    const result: KieAIChatResponse = await response.json();
    
    console.log('🔍 [Kie AI] Raw response:', JSON.stringify(result, null, 2));
    
    if (!result.choices || result.choices.length === 0) {
      console.error('❌ [Kie AI] No choices in response. Full result:', result);
      throw new Error('No response from Kie AI');
    }
    
    const text = result.choices[0].message.content;
    
    console.log(`✅ [Kie AI] Multimodal response received (${text.length} chars)`);
    if (result.usage) {
      console.log(`   Tokens: ${result.usage.prompt_tokens} in, ${result.usage.completion_tokens} out`);
    }
    
    return {
      text,
      usage: result.usage
    };
    
  } catch (error) {
    console.error('❌ [Kie AI] Multimodal error:', error);
    throw error;
  }
}

/**
 * Streaming text generation (for future use)
 */
export async function generateTextStreamKieAI(params: {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  onChunk: (chunk: string) => void;
}): Promise<void> {
  const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
  
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY not configured');
  }
  
  try {
    const messages: KieAIMessage[] = [];
    
    if (params.systemPrompt) {
      messages.push({
        role: 'system',
        content: [{ type: 'text', text: params.systemPrompt }]
      });
    }
    
    messages.push({
      role: 'user',
      content: [{ type: 'text', text: params.prompt }]
    });
    
    const requestBody: KieAIChatRequest = {
      messages,
      stream: true,
      temperature: params.temperature ?? 0.7,
    };
    
    console.log(`🧠 [Kie AI] Starting streaming generation...`);
    
    const response = await fetch(
      `${KIE_AI_BASE_URL}/${KIE_AI_MODEL}/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KIE_AI_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Kie AI API error (${response.status}): ${errorText}`);
    }
    
    if (!response.body) {
      throw new Error('No response body for streaming');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              params.onChunk(content);
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
    
    console.log(`✅ [Kie AI] Streaming complete`);
    
  } catch (error) {
    console.error('❌ [Kie AI] Streaming error:', error);
    throw error;
  }
}

/**
 * Pricing info for Cortexia credit calculation
 */
export const KIE_AI_GEMINI_PRICING = {
  input: 100, // credits per 1M tokens (~$0.50)
  output: 700, // credits per 1M tokens (~$3.50)
  
  // Calculate Cortexia credits from token usage
  calculateCost(promptTokens: number, completionTokens: number): number {
    const inputCost = (promptTokens / 1_000_000) * this.input;
    const outputCost = (completionTokens / 1_000_000) * this.output;
    return Math.ceil(inputCost + outputCost);
  }
};