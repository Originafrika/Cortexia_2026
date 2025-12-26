// enhancer.tsx - Prompt enhancement using Pollinations nova-micro
// ✅ Using nova-micro via Pollinations for fast, reliable prompt enhancement

const POLLINATIONS_API_KEY = Deno.env.get('POLLINATIONS_API_KEY');

// ✅ Cortexia Intelligence v3 - Ultimate AI image prompt optimizer
const CORTEXIA_SYSTEM_PROMPT = `You are an expert AI image prompt optimizer.

Your job: Transform short prompts into detailed, photorealistic image generation prompts.

RULES:
1. Return ONLY the optimized prompt, nothing else
2. NO explanations, NO reasoning, NO meta-commentary
3. Include: camera angle, lighting, composition, mood, textures, details
4. Keep it under 300 words
5. Make it vivid and specific

EXAMPLE:
Input: "cat sleeping"
Output: "A fluffy orange tabby cat curled up on a sunlit windowsill, soft golden afternoon light streaming through sheer curtains, creating a warm glow on the cat's fur, ultra detailed fur texture showing individual whiskers and ear hair, peaceful expression with closed eyes, soft paws tucked under body, cozy atmosphere, shot with 85mm lens at f/2.8 for shallow depth of field, photorealistic, high quality"

Now transform the user's prompt following these exact rules. Return ONLY the optimized prompt.`;

export interface EnhancePromptOptions {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface EnhancePromptResult {
  success: boolean;
  enhancedPrompt?: string;
  originalPrompt: string;
  error?: string;
  tokensUsed?: number;
}

/**
 * Determine if a model should use prompt enhancement
 * Premium models (flux-2-pro, imagen-4) don't need enhancement
 */
export function shouldEnhancePrompt(model: string): boolean {
  const premiumModels = ['flux-2-pro', 'imagen-4'];
  return !premiumModels.includes(model);
}

/**
 * Enhance a prompt using Pollinations nova-micro
 * Transforms simple prompts into detailed, high-quality descriptions
 */
export async function enhancePrompt(
  prompt: string,
  model: string = 'seedream',
  options: Partial<EnhancePromptOptions> = {}
): Promise<EnhancePromptResult> {
  // Skip enhancement if not needed
  if (!shouldEnhancePrompt(model)) {
    console.log(`⏭️  Skipping enhancement for premium model: ${model}`);
    return {
      success: true,
      originalPrompt: prompt,
      enhancedPrompt: prompt
    };
  }
  
  // Skip if prompt is already detailed (>150 chars)
  if (prompt.length > 150) {
    console.log(`⏭️  Skipping enhancement, prompt already detailed (${prompt.length} chars)`);
    return {
      success: true,
      originalPrompt: prompt,
      enhancedPrompt: prompt
    };
  }
  
  if (!POLLINATIONS_API_KEY) {
    console.warn('⚠️ POLLINATIONS_API_KEY not set, skipping enhancement');
    return {
      success: true,
      originalPrompt: prompt,
      enhancedPrompt: prompt,
      error: 'API key not configured'
    };
  }
  
  try {
    console.log(`✨ Enhancing prompt with nova-micro via Pollinations: "${prompt.substring(0, 50)}..."`);
    
    // ✅ Build URL with query parameters (like Pollinations image API)
    const systemPrompt = CORTEXIA_SYSTEM_PROMPT.replace(/\n/g, ' ').trim();
    const baseUrl = 'https://enter.pollinations.ai/api/generate/text';
    
    // Encode the prompt and system message
    const encodedPrompt = encodeURIComponent(prompt);
    const encodedSystem = encodeURIComponent(systemPrompt);
    
    // ✅ Use gemini model (Gemini Flash 2.5) for vision support
    const url = `${baseUrl}/${encodedPrompt}?system=${encodedSystem}&private=true&model=nova-micro`;
    
    console.log(`🔗 Pollinations URL (nova-micro): ${url.substring(0, 150)}...`);
    
    // Call Pollinations text API with GET request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${POLLINATIONS_API_KEY}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Pollinations API error (${response.status}):`, errorText);
      return {
        success: false,
        originalPrompt: prompt,
        enhancedPrompt: prompt,
        error: `API error: ${response.status}`
      };
    }
    
    // ✅ Response is plain text, not JSON
    const enhancedPrompt = (await response.text()).trim();
    
    console.log(`🔍 Raw response: "${enhancedPrompt.substring(0, 100)}..." (${enhancedPrompt.length} chars)`);
    
    // ✅ Better validation: check if enhanced is meaningful, not just longer
    if (!enhancedPrompt || enhancedPrompt.length < 20) {
      console.warn(`⚠️ Enhancement produced invalid result (${enhancedPrompt.length} chars), using original`);
      return {
        success: true,
        originalPrompt: prompt,
        enhancedPrompt: prompt
      };
    }
    
    // ✅ If enhanced is very similar to original, use it anyway
    const lengthDiff = enhancedPrompt.length - prompt.length;
    if (lengthDiff < 0 && Math.abs(lengthDiff) > prompt.length * 0.5) {
      // Enhanced is significantly shorter (>50% reduction), probably an error
      console.warn('⚠️ Enhancement significantly shortened prompt, using original');
      return {
        success: true,
        originalPrompt: prompt,
        enhancedPrompt: prompt
      };
    }
    
    console.log(`✅ Enhanced (${enhancedPrompt.length} chars): "${enhancedPrompt.substring(0, 100)}..."`);
    console.log(`📊 Length change: ${lengthDiff > 0 ? '+' : ''}${lengthDiff} chars (${((lengthDiff / prompt.length) * 100).toFixed(1)}%)`);
    
    return {
      success: true,
      originalPrompt: prompt,
      enhancedPrompt,
      tokensUsed: Math.ceil(enhancedPrompt.length / 4) // Estimate
    };
    
  } catch (error) {
    console.error('❌ Prompt enhancement failed:', error);
    
    // Return original prompt on error
    return {
      success: false,
      originalPrompt: prompt,
      enhancedPrompt: prompt,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Batch enhance multiple prompts
 */
export async function enhancePrompts(
  prompts: string[],
  model: string = 'seedream'
): Promise<EnhancePromptResult[]> {
  return Promise.all(
    prompts.map(prompt => enhancePrompt(prompt, model))
  );
}

/**
 * Get enhancement status for a model
 */
export function getEnhancementInfo(model: string): {
  shouldEnhance: boolean;
  reason: string;
} {
  const premiumModels = ['flux-2-pro', 'imagen-4'];
  
  if (premiumModels.includes(model)) {
    return {
      shouldEnhance: false,
      reason: 'Premium model produces excellent results without enhancement'
    };
  }
  
  return {
    shouldEnhance: true,
    reason: 'Enhancement improves quality for standard models'
  };
}